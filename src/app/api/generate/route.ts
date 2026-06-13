import { NextResponse } from 'next/server';
import { generateObject, generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { GtmAgentSchema } from '@/lib/schema';
import { MOCK_PAYLOAD } from '@/lib/mock';

// Extend max duration if deployed on Vercel
export const maxDuration = 90;

export async function POST(req: Request) {
  try {
    const { idea } = await req.json();

    if (!idea) {
      return NextResponse.json({ error: 'Idea is required' }, { status: 400 });
    }

    // Wrap execution in a 90-second timeout
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Global API Timeout Exceeded')), 90000)
    );

    const executionPromise = async () => {
      console.log(`\n[INIT] Starting pipeline for idea: "${idea}"`);

      // Phase 1: Intent Transformation
      console.log(`[PHASE 1] Executing intent extraction with Google Gemini...`);
      let queryGeneration;
      try {
        queryGeneration = await generateObject({
          model: google('gemini-3.5-flash'),
          schema: z.object({
            queries: z.array(z.string()).max(2).describe("Generate 2 highly specific Google search operators (e.g. site:reddit.com OR site:news.ycombinator.com) to find target audience pain points for this idea.")
          }),
          prompt: `Generate exactly 2 advanced search queries to find organic discussions about this product idea: ${idea}. Focus on extracting frustrations, alternative requests, and vernacular.`
        });
      } catch (e: any) {
        console.error(`[PHASE 1 ERROR] Google Gemini LLM failed:`, e?.message || e);
        throw e;
      }

      const queries = queryGeneration.object.queries;
      console.log(`[PHASE 1 SUCCESS] Generated queries:`, queries);
      let urlsToScrape: string[] = [];

      // Phase 2: Discovery Engine (Serper API)
      console.log(`[PHASE 2] Executing Serper Discovery Engine...`);
      for (const query of queries) {
        try {
          const res = await fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: {
              'X-API-KEY': process.env.SERPER_API_KEY || '',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ q: query, num: 2 })
          });
          const data = await res.json();
          if (data.organic && data.organic.length > 0) {
            urlsToScrape.push(data.organic[0].link);
          }
        } catch (e: any) {
          console.error(`[PHASE 2 ERROR] Serper API error for query "${query}":`, e?.message || e);
        }
      }

      // De-duplicate URLs and limit to top 2
      urlsToScrape = Array.from(new Set(urlsToScrape)).slice(0, 2);
      console.log(`[PHASE 2 SUCCESS] High-relevance URLs found:`, urlsToScrape);

      // Phase 3: Content Extraction (Firecrawl)
      console.log(`[PHASE 3] Executing Content Extraction with Firecrawl...`);
      let aggregatedContext = '';
      for (const url of urlsToScrape) {
        try {
          const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(process.env.FIRECRAWL_API_KEY ? { 'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}` } : {})
            },
            body: JSON.stringify({ url, formats: ['markdown'] })
          });
          if (!res.ok) throw new Error(`Firecrawl API blocked or failed: ${res.status}`);
          const jsonResponse = await res.json();
          const markdown = jsonResponse.data?.markdown || '';
          aggregatedContext += `\n\n--- Source: ${url} ---\n\n${markdown}`;
        } catch (e: any) {
          console.error(`[PHASE 3 ERROR] Firecrawl extraction error for ${url}:`, e?.message || e);
        }
      }

      // Defensive Truncation
      const MAX_CHARS = 80000; // ~20k tokens roughly
      if (aggregatedContext.length > MAX_CHARS) {
        aggregatedContext = aggregatedContext.slice(0, MAX_CHARS) + "\n\n...[TRUNCATED]";
      }

      if (!aggregatedContext.trim()) {
        console.warn(`[WARNING] Aggregated context is empty! Falling back to Synthetic Context.`);
        // Fallback: Inject Synthetic Context Prompt if scraping fails
        aggregatedContext = `[SYNTHETIC CONTEXT]: The external scraper was blocked. Please proceed by simulating the target market for the idea: '${idea}'. Use standard assumptions about their pain points, vernacular, and desires based on general industry knowledge.`;
      } else {
        console.log(`[PHASE 3 SUCCESS] Extracted ${aggregatedContext.length} characters of context.`);
      }

      // Phase 4: Structured Synthesis
      console.log(`[PHASE 4] Executing Structured Synthesis with Google Gemini...`);
      const synthesisPrompt = `
You are an Autonomous Go-To-Market & Audience Intelligence Agent.
Analyze the following context (scraped from live web discussions or simulated) to generate a deeply insightful, structured JSON strategy for this idea: ${idea}.

Rules for the Strategy:
- Two-tier execution: First analyze the demographic and pain points, then compose creative copy, email campaigns, lead generation funnels, and SEO optimization.
- Vibe Rules: If the product domain highlights high emotional attachment, sensory quality, or heritage, lock into "Poetic Resonance". If technical or infrastructural, default to "Tech-Cynical".
- Email Rules: The email campaign must strictly adopt the assigned Vibe, but remain highly-converting, concise, and anti-spam.
- Lead Gen Rules: The lead generation strategy must be highly actionable, identifying exact channels and hooks.
- SEO Rules: Provide realistic, high-traffic website metadata.
- Keep headlines bold, unconventional, and highly specific.

Context:
${aggregatedContext}
`;

      let finalStrategy;
      try {
        finalStrategy = await generateObject({
          model: google('gemini-3.5-flash'),
          schema: GtmAgentSchema.omit({ meta: true }), // We will inject meta manually
          prompt: synthesisPrompt
        });
      } catch (e: any) {
        console.error(`[PHASE 4 ERROR] Gemini Synthesis failed:`, e?.message || e);
        throw e;
      }

      console.log(`[PIPELINE SUCCESS] Strategy generation complete!`);
      // Assemble final response matching the GtmAgentResponse contract
      return {
        meta: {
          processed_queries: queries,
          scraped_sources: urlsToScrape
        },
        ...finalStrategy.object
      };
    };

    const result = await Promise.race([executionPromise(), timeoutPromise]);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("\n[FATAL PIPELINE ERROR] An unexpected error halted execution:", error?.message || error);
    if (error?.cause) console.error("Cause:", error.cause);
    // Fallback Mock Data rendering
    console.log("[SYSTEM] Serving Mock Payload to frontend due to failure.");
    return NextResponse.json(MOCK_PAYLOAD, { status: 200 });
  }
}
