import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { LiveLead } from '@/lib/schema';

export const maxDuration = 45;

export async function POST(req: Request) {
  try {
    const { idea, demographic_profile, core_pain_points } = await req.json();

    if (!idea || !demographic_profile) {
      return NextResponse.json({ error: 'Missing required context' }, { status: 400 });
    }

    console.log(`\n[LEADS INIT] Generating lead search dorks for: "${idea}"`);

    // 1. Generate Advanced Dorks
    let dorkGeneration;
    try {
      dorkGeneration = await generateObject({
        model: google('gemini-3.5-flash'),
        schema: z.object({
          email_dorks: z.array(z.string()).max(2).describe("Generate 2 Google dorks to find emails on LinkedIn for this demographic (e.g. site:linkedin.com/in \"Sales Director\" \"@gmail.com\" OR \"@yahoo.com\")"),
          social_dorks: z.array(z.string()).max(2).describe("Generate 2 Google dorks to find recent Reddit complaints matching these pain points (e.g. site:reddit.com \"I hate how CRM tools\" OR \"I wish there was a way to\")")
        }),
        prompt: `You are an expert lead sourcer. Generate Google Search operators to find real leads for a product targeting:\n\nDemographic: ${demographic_profile}\nPain Points: ${core_pain_points.join(', ')}\nIdea: ${idea}\n\nThe queries MUST be syntactically valid Google operators.`
      });
    } catch (e: any) {
      console.error(`[LEADS ERROR] Dork generation failed:`, e?.message || e);
      throw new Error("Failed to generate search operators");
    }

    const { email_dorks, social_dorks } = dorkGeneration.object;
    console.log(`[LEADS DORK SUCCESS] Generated ${email_dorks.length + social_dorks.length} queries.`);

    const serperApiKey = process.env.SERPER_API_KEY;
    if (!serperApiKey) {
      throw new Error("Missing SERPER_API_KEY for lead sourcing");
    }

    const fetchSerper = async (query: string, type: "email" | "social"): Promise<LiveLead[]> => {
      try {
        const res = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: {
            'X-API-KEY': serperApiKey,
            'Content-Type': 'application/json'
          },
          // For social we want very recent complaints if possible, but let's keep it broad for high volume
          body: JSON.stringify({ q: query, num: 10, tbs: type === 'social' ? 'qdr:y' : undefined }) // past year for social
        });

        if (!res.ok) return [];
        const data = await res.json();
        const leads: LiveLead[] = [];

        if (data.organic && Array.isArray(data.organic)) {
          for (const result of data.organic) {
            const snippet = result.snippet || "";
            const title = result.title || "";

            if (type === "email") {
              // Extract emails using Regex
              const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
              const matches = snippet.match(emailRegex);
              if (matches && matches.length > 0) {
                matches.forEach((email) => {
                  leads.push({
                    type: "email",
                    source: "LinkedIn / Web",
                    contact: email.toLowerCase(),
                    link: result.link,
                    snippet: snippet
                  });
                });
              }
            } else if (type === "social") {
              // Just extract the social post link
              if (snippet.trim().length > 10) {
                leads.push({
                  type: "social",
                  source: title.includes("Reddit") ? "Reddit" : (title.includes("X") || title.includes("Twitter")) ? "Twitter / X" : "Community Forum",
                  link: result.link,
                  snippet: snippet
                });
              }
            }
          }
        }
        return leads;
      } catch (e) {
        console.error(`[LEADS ERROR] Serper fetch failed for ${query}:`, e);
        return [];
      }
    };

    console.log(`[LEADS SEARCH] Fetching live data from Serper...`);
    const allPromises = [
      ...email_dorks.map(q => fetchSerper(q, "email")),
      ...social_dorks.map(q => fetchSerper(q, "social"))
    ];

    const resultsArray = await Promise.all(allPromises);

    // Flatten and deduplicate
    let allLeads = resultsArray.flat();

    // Deduplicate emails
    const uniqueEmails = new Set();
    const uniqueLinks = new Set();

    const finalLeads: LiveLead[] = [];
    for (const lead of allLeads) {
      if (lead.type === 'email' && lead.contact) {
        if (!uniqueEmails.has(lead.contact)) {
          uniqueEmails.add(lead.contact);
          finalLeads.push(lead);
        }
      } else if (lead.type === 'social' && lead.link) {
        if (!uniqueLinks.has(lead.link)) {
          uniqueLinks.add(lead.link);
          finalLeads.push(lead);
        }
      }
    }

    console.log(`[LEADS SUCCESS] Found ${finalLeads.length} unique leads.`);

    return NextResponse.json({ leads: finalLeads.slice(0, 15) }); // Cap at 15 for UI clarity

  } catch (error: any) {
    console.error("[FATAL LEADS ERROR]:", error?.message || error);
    return NextResponse.json({ leads: [] }, { status: 200 }); // Return empty array on failure to not break UI
  }
}
