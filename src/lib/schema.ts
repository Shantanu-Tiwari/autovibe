import { z } from 'zod';

export type LiveLead = {
  type: "email" | "social";
  source: string;
  contact?: string; // email address or username
  link?: string; // profile or post link
  snippet?: string; // the context where they were found
};

export const GtmAgentSchema = z.object({
  meta: z.object({
    processed_queries: z.array(z.string()).describe("The exact search operators engineered to scrape context"),
    scraped_sources: z.array(z.string().url()).describe("The verified live URLs parsed during the execution phase")
  }),
  audience_intel: z.object({
    demographic_profile: z.string().describe("Synthesized description of target age, behavioral cohorts, or niche segments"),
    core_pain_points: z.array(z.string()).describe("List of exact frustrations, blockers, or complaints extracted from discussions"),
    vernacular_and_slang: z.array(z.string()).describe("Specific terminology, keywords, phrases, or community jargon discovered")
  }),
  strategy: z.object({
    detected_vibe: z.enum(["Poetic Resonance", "Tech-Cynical", "Gen-Z Slang", "Corporate Satire", "Guerrilla Minimalist"]),
    vibe_reasoning: z.string().describe("Strategic defense of why this cultural positioning aligns with the audience profile")
  }),
  launch_assets: z.object({
    landing_page: z.object({
      hero_headline: z.string().describe("A bold, ultra-focused headline that shatters traditional generic copy conventions"),
      sub_headline: z.string().describe("Supporting text addressing the specific pain point discovered during research")
    }),
    creative_execution: z.object({
      video_ad_script: z.string().describe("A high-impact 30-second short-form video script matching the designated vibe"),
      visual_art_direction: z.string().describe("A hyper-detailed prompt designed for text-to-image engines (e.g., Midjourney) to generate ad variants")
    }),
    email_campaign: z.object({
      subject_line: z.string().describe("High-converting, curiosity-driven subject line"),
      body_copy: z.string().describe("The core email written perfectly in the defined vibe"),
      call_to_action: z.string().describe("A specific, low-friction next step for the reader"),
      follow_up_angle: z.string().describe("A 1-sentence strategy for a follow-up email 3 days later")
    }),
    lead_generation: z.object({
      primary_channel: z.string().describe("Best platform to find this audience (e.g., LinkedIn, Reddit, Cold Email)"),
      lead_magnet_idea: z.string().describe("A highly specific freebie or tool to capture emails"),
      outreach_hook: z.string().describe("The exact first sentence to use when sliding into DMs or sending cold outreach")
    }),
    seo_optimization: z.object({
      website_meta_title: z.string().describe("An SEO-optimized title tag for the landing page (under 60 characters)"),
      website_meta_description: z.string().describe("A compelling, keyword-rich meta description (under 160 characters)"),
      primary_keywords: z.array(z.string()).describe("Top 5 high-intent SEO keywords to target")
    }),
    distribution_hack: z.string().describe("One highly specific, unconventional tactical idea to acquire the first 100 users without ad spend")
  })
});

export type GtmAgentResponse = z.infer<typeof GtmAgentSchema>;
