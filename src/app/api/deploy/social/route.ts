import { NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { campaignId, tweetContent } = await req.json();

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (process.env.TWITTER_API_KEY) {
      const client = new TwitterApi({
        appKey: process.env.TWITTER_API_KEY,
        appSecret: process.env.TWITTER_API_SECRET || '',
        accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
        accessSecret: process.env.TWITTER_ACCESS_SECRET || '',
      });

      const rwClient = client.readWrite;
      await rwClient.v2.tweet(tweetContent);
    } else {
      console.log("[MOCK TWITTER] Posting:", tweetContent);
    }

    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'DEPLOYED_SOCIAL' }
    });

    return NextResponse.json({ message: 'Successfully deployed social post.' });

  } catch (error) {
    console.error("[SOCIAL DEPLOY ERROR]", error);
    return NextResponse.json({ error: 'Failed to deploy social post' }, { status: 500 });
  }
}
