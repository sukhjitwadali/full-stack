import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol');
  const apiKey = process.env.POLYGON_API_KEY;

  if (!symbol) {
    return NextResponse.json({ error: 'Missing symbol parameter' }, { status: 400 });
  }
  if (!apiKey) {
    return NextResponse.json({ error: 'Polygon.io API key not set' }, { status: 500 });
  }

  try {
    // Fetch last 50 daily closes
    const today = new Date();
    const to = today.toISOString().slice(0, 10);
    const fromDate = new Date(today);
    fromDate.setDate(today.getDate() - 70); // buffer for weekends/holidays
    const from = fromDate.toISOString().slice(0, 10);
    const url = `https://api.polygon.io/v2/aggs/ticker/${symbol.toUpperCase()}/range/1/day/${from}/${to}?adjusted=true&sort=desc&limit=50&apiKey=${apiKey}`;
    const resp = await fetch(url);
    if (!resp.ok) {
      const err = await resp.json();
      return NextResponse.json({ error: err.error || 'Polygon.io error' }, { status: 500 });
    }
    const data = await resp.json();
    if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
      return NextResponse.json({ error: 'No data found for symbol' }, { status: 404 });
    }
    // Map to { date, close }
    const results = data.results
      .slice(0, 50)
      .reverse()
      .map((item: any) => ({
        date: new Date(item.t).toISOString().slice(0, 10),
        close: item.c,
      }));
    return NextResponse.json({ symbol: symbol.toUpperCase(), data: results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
} 