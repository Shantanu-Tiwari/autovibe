import { GtmAgentResponse } from "./schema";

export const MOCK_PAYLOAD: GtmAgentResponse = {
  meta: {
    processed_queries: [
      "site:reddit.com idea OR alternative",
      "pain point OR complaint"
    ],
    scraped_sources: [
      "https://reddit.com/r/startups/comments/mock1",
      "https://reddit.com/r/SaaS/comments/mock2"
    ]
  },
  audience_intel: {
    demographic_profile: "Founders and indie-hackers looking to accelerate their go-to-market strategies.",
    core_pain_points: [
      "Spending too much time researching audience.",
      "Generic copy that doesn't convert.",
      "Lack of specific angle for new products."
    ],
    vernacular_and_slang: [
      "indie hacker",
      "GTM",
      "CAC",
      "bootstrapped"
    ]
  },
  strategy: {
    detected_vibe: "Tech-Cynical",
    vibe_reasoning: "The audience is tired of generic marketing speak and responds better to straight-talking, slightly cynical technical reality."
  },
  launch_assets: {
    landing_page: {
      hero_headline: "Stop Guessing Your Go-To-Market. Let an Agent Do It.",
      sub_headline: "Instantly synthesize audience insights and launch assets without spending 40 hours on Reddit."
    },
    creative_execution: {
      video_ad_script: "HOOK: (Looking exhausted at a spreadsheet) Stop scrolling Reddit for customer insights.\n\nBODY: Meet AutoVibe. It's an autonomous agent that scrapes niche forums, analyzes your exact audience, and writes your entire Go-To-Market strategy while you get a coffee.\n\nCTA: Stop guessing. Start launching.",
      visual_art_direction: "A hyper-detailed, neon-lit server room with a glowing rubber duck on a mechanical keyboard, cyberpunk aesthetic, cinematic lighting, 8k resolution, photorealistic."
    },
    email_campaign: {
      subject_line: "I built an autonomous agent to do your market research (in 45 seconds)",
      body_copy: "Hey,\n\nI noticed you're building in the indie hacker space. I know how brutal it is to spend 40 hours reading Reddit threads just to figure out what your audience actually wants to buy.\n\nSo I automated it.\n\nAutoVibe is an agent that scrapes the web, extracts exact pain points, and writes your entire Go-To-Market strategy while you get a coffee.\n\nWant to run your next idea through it?",
      call_to_action: "Reply 'agent' and I'll send you a private link to try it.",
      follow_up_angle: "Bump this to the top of their inbox with a screenshot of the crazy hyper-specific insights it generated for a random idea."
    },
    lead_generation: {
      primary_channel: "Twitter / X (Indie Hacker community)",
      lead_magnet_idea: "A free database of the Top 50 'Alternative to X' Reddit complaints from the last week.",
      outreach_hook: "Just saw you launched on Product Hunt—loved the UI. Are you currently manually researching audience pain points for your next feature?"
    },
    seo_optimization: {
      website_meta_title: "AutoVibe | Autonomous Go-To-Market Agent",
      website_meta_description: "Stop scrolling Reddit for customer insights. AutoVibe scrapes niche forums and writes your entire GTM strategy in 45 seconds.",
      primary_keywords: ["AI market research", "go to market strategy tool", "automated audience intelligence", "reddit sentiment analysis", "indie hacker growth"]
    },
    distribution_hack: "Launch a 'Roast My GTM' thread on indie hacker forums, using the agent's output as the baseline to drive controversial engagement."
  }
};
