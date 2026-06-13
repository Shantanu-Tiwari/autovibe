import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { idea, strategy, leads } = await req.json();

    const campaign = await prisma.campaign.create({
      data: {
        idea,
        strategyJson: JSON.stringify(strategy),
        leads: {
          create: leads.map((lead: any) => ({
            email: lead.contact || lead.link || "unknown",
            source: lead.source || "unknown",
            status: "PENDING"
          }))
        }
      }
    });

    return NextResponse.json({ campaignId: campaign.id });
  } catch (error) {
    console.error("[CAMPAIGN ERROR]", error);
    return NextResponse.json({ error: 'Failed to save campaign' }, { status: 500 });
  }
}
