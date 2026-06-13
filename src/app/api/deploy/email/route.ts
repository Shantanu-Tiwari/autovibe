import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';

// Use a mock key if none provided to avoid crashing in dev
const resend = new Resend(process.env.RESEND_API_KEY || "re_mock_key");

export async function POST(req: Request) {
  try {
    const { campaignId, subject, htmlBody } = await req.json();

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { leads: true }
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const emailLeads = campaign.leads.filter(l => l.email.includes('@'));

    if (emailLeads.length === 0) {
      return NextResponse.json({ message: 'No valid email leads found to send.' });
    }

    // Send to max 5 leads for safety during development
    let sentCount = 0;
    for (const lead of emailLeads.slice(0, 5)) {
      try {
        if (process.env.RESEND_API_KEY) {
          await resend.emails.send({
            from: 'AutoVibe <onboarding@resend.dev>',
            to: lead.email, // in a real resend onboarding, you can only send to your own verified email unless you have a domain
            subject: subject,
            html: htmlBody.replace(/\n/g, '<br/>'),
          });
        }
        
        await prisma.lead.update({
          where: { id: lead.id },
          data: { status: 'SENT', sentAt: new Date() }
        });
        sentCount++;
      } catch (e) {
        console.error(`Failed to send to ${lead.email}:`, e);
      }
    }

    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'DEPLOYED_EMAIL' }
    });

    return NextResponse.json({ message: `Successfully deployed email to ${sentCount} leads.` });

  } catch (error) {
    console.error("[EMAIL DEPLOY ERROR]", error);
    return NextResponse.json({ error: 'Failed to deploy emails' }, { status: 500 });
  }
}
