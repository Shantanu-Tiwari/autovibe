import { NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

// If no credentials, we'll return mock data for the dashboard
const analyticsDataClient = process.env.GOOGLE_APPLICATION_CREDENTIALS 
  ? new BetaAnalyticsDataClient() 
  : null;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const propertyId = process.env.GA4_PROPERTY_ID;

  if (!propertyId || !analyticsDataClient) {
    // Return mock data for UI demonstration
    return NextResponse.json({
      activeUsers: Math.floor(Math.random() * 500) + 50,
      pageViews: Math.floor(Math.random() * 2000) + 100,
      conversions: Math.floor(Math.random() * 20) + 1,
      mock: true
    });
  }

  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '7daysAgo',
          endDate: 'today',
        },
      ],
      metrics: [
        { name: 'activeUsers' },
        { name: 'screenPageViews' },
        { name: 'conversions' }
      ],
    });

    const row = response.rows?.[0];
    return NextResponse.json({
      activeUsers: row?.metricValues?.[0].value || "0",
      pageViews: row?.metricValues?.[1].value || "0",
      conversions: row?.metricValues?.[2].value || "0",
      mock: false
    });

  } catch (error) {
    console.error("[GA4 ERROR]", error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
