import { NextResponse } from 'next/server';

interface StockDataPoint {
  date: string;
  price: number;
  open: number;
  high: number;
  low: number;
  volume: number;
}

const ALPHA_VANTAGE_API_KEY = 'X0UBKJB45VWX34PP';
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const function_type = searchParams.get('function') || 'TIME_SERIES_DAILY';

    if (!symbol) {
      return NextResponse.json({ error: 'Stock symbol is required' }, { status: 400 });
    }

    // Fetch stock data from Alpha Vantage
    const response = await fetch(
      `${ALPHA_VANTAGE_BASE_URL}?function=${function_type}&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status}`);
    }

    const data = await response.json();

    // Check for API errors
    if (data['Error Message']) {
      return NextResponse.json({ error: data['Error Message'] }, { status: 400 });
    }

    if (data['Note']) {
      return NextResponse.json({ error: 'API rate limit exceeded. Please try again later.' }, { status: 429 });
    }

    // Process the data based on function type
    let processedData: StockDataPoint[] = [];
    
    if (function_type === 'TIME_SERIES_DAILY') {
      const timeSeries = data['Time Series (Daily)'];
      if (timeSeries) {
        processedData = Object.entries(timeSeries)
          .map(([date, values]: [string, any]) => ({
            date,
            price: parseFloat(values['4. close']),
            open: parseFloat(values['1. open']),
            high: parseFloat(values['2. high']),
            low: parseFloat(values['3. low']),
            volume: parseInt(values['5. volume'])
          }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(-100); // Get last 100 days
      }
    } else if (function_type === 'TIME_SERIES_WEEKLY') {
      const timeSeries = data['Weekly Time Series'];
      if (timeSeries) {
        processedData = Object.entries(timeSeries)
          .map(([date, values]: [string, any]) => ({
            date,
            price: parseFloat(values['4. close']),
            open: parseFloat(values['1. open']),
            high: parseFloat(values['2. high']),
            low: parseFloat(values['3. low']),
            volume: parseInt(values['5. volume'])
          }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(-52); // Get last 52 weeks
      }
    }

    if (processedData.length === 0) {
      return NextResponse.json({ error: 'No data found for the specified symbol' }, { status: 404 });
    }

    return NextResponse.json({
      symbol: symbol.toUpperCase(),
      data: processedData,
      count: processedData.length,
      dateRange: {
        start: processedData[0].date,
        end: processedData[processedData.length - 1].date
      }
    });

  } catch (error) {
    console.error('Stock data API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
} 