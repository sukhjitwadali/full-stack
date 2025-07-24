"use client";
import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import StockInput from '@/components/StockInput';
import StockModel from '@/components/StockModel';
import StockChart from '@/components/StockChart';

// Hard-coded data (at least 50 points)
const hardCodedData = [
  { date: "2024-05-01", close: 150.12 },
  { date: "2024-05-02", close: 151.34 },
  { date: "2024-05-03", close: 152.01 },
  { date: "2024-05-04", close: 151.78 },
  { date: "2024-05-05", close: 153.22 },
  { date: "2024-05-06", close: 154.10 },
  { date: "2024-05-07", close: 153.85 },
  { date: "2024-05-08", close: 155.00 },
  { date: "2024-05-09", close: 154.75 },
  { date: "2024-05-10", close: 156.20 },
  { date: "2024-05-11", close: 157.05 },
  { date: "2024-05-12", close: 156.80 },
  { date: "2024-05-13", close: 158.30 },
  { date: "2024-05-14", close: 159.10 },
  { date: "2024-05-15", close: 158.95 },
  { date: "2024-05-16", close: 160.20 },
  { date: "2024-05-17", close: 161.00 },
  { date: "2024-05-18", close: 160.85 },
  { date: "2024-05-19", close: 162.10 },
  { date: "2024-05-20", close: 163.00 },
  { date: "2024-05-21", close: 162.75 },
  { date: "2024-05-22", close: 164.20 },
  { date: "2024-05-23", close: 165.05 },
  { date: "2024-05-24", close: 164.80 },
  { date: "2024-05-25", close: 166.30 },
  { date: "2024-05-26", close: 167.10 },
  { date: "2024-05-27", close: 166.95 },
  { date: "2024-05-28", close: 168.20 },
  { date: "2024-05-29", close: 169.00 },
  { date: "2024-05-30", close: 168.85 },
  { date: "2024-05-31", close: 170.10 },
  { date: "2024-06-01", close: 171.00 },
  { date: "2024-06-02", close: 170.75 },
  { date: "2024-06-03", close: 172.20 },
  { date: "2024-06-04", close: 173.05 },
  { date: "2024-06-05", close: 172.80 },
  { date: "2024-06-06", close: 174.30 },
  { date: "2024-06-07", close: 175.10 },
  { date: "2024-06-08", close: 174.95 },
  { date: "2024-06-09", close: 176.20 },
  { date: "2024-06-10", close: 177.00 },
  { date: "2024-06-11", close: 176.75 },
  { date: "2024-06-12", close: 178.20 },
  { date: "2024-06-13", close: 179.05 },
  { date: "2024-06-14", close: 178.80 },
  { date: "2024-06-15", close: 180.30 },
  { date: "2024-06-16", close: 181.10 },
  { date: "2024-06-17", close: 180.95 },
  { date: "2024-06-18", close: 182.20 }
];

export default function StockPredictionPage() {
  const { data: session } = useSession();
  const [stockData, setStockData] = useState<any[]>([]);
  const [prediction, setPrediction] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [symbol, setSymbol] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handler for StockInput
  const handleDataLoaded = useCallback((data: any[]) => {
    if (!Array.isArray(data) || data.length < 2) {
      setError('Please provide at least 2 data points.');
      setStockData([]);
      setPrediction(undefined);
      return;
    }
    setError('');
    setSuccess(`Loaded ${data.length} data points.`);
    setStockData(data);
    setPrediction(undefined);
  }, []);

  // Handler for StockModel prediction
  const handlePrediction = useCallback((pred: number) => {
    setPrediction(pred);
    setSuccess('Prediction complete.');
  }, []);

  // Fetch live data from Polygon.io
  const fetchLiveData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim()) {
      setError('Please enter a stock symbol.');
      return;
    }
    setIsLoading(true);
    setError('');
    setSuccess('');
    setPrediction(undefined);
    try {
      const res = await fetch(`/api/stock-data?symbol=${encodeURIComponent(symbol.trim())}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Failed to fetch data.');
        setStockData([]);
        return;
      }
      if (!json.data || json.data.length < 2) {
        setError('Not enough data returned for prediction.');
        setStockData([]);
        return;
      }
      setStockData(json.data);
      setSuccess(`Loaded ${json.data.length} data points for ${json.symbol}`);
    } catch (err: any) {
      setError('Failed to fetch data.');
      setStockData([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="max-w-6xl mx-auto mt-10 p-6 bg-white shadow rounded">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Stock Market Prediction</h1>
        <p className="text-gray-600">Please sign in to access the stock prediction feature.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Stock Market Prediction</h1>
      <p className="text-gray-600 mb-8">
        Upload your stock data, use sample data, use hard-coded data, or fetch live data from Polygon.io to predict the next closing price.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Live Data Section */}
        <div className="p-6 bg-green-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Fetch Live Data (Polygon.io)</h2>
          <form onSubmit={fetchLiveData} className="flex flex-col gap-4 items-start">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock Symbol (e.g., AAPL, MSFT)</label>
              <input
                type="text"
                value={symbol}
                onChange={e => setSymbol(e.target.value)}
                placeholder="AAPL"
                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !symbol.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : 'Fetch Live Data'}
            </button>
          </form>
        </div>
        {/* Upload/Sample/Hardcoded Data Section */}
        <div className="p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Upload, Use Sample, or Hard-Coded Data</h2>
          <StockInput onDataLoaded={handleDataLoaded} />
          <button
            type="button"
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => {
              setStockData(hardCodedData);
              setPrediction(undefined);
              setError('');
              setSuccess('Loaded hard-coded data.');
            }}
          >
            Use Hard-Coded Data
          </button>
        </div>
      </div>

      {/* Data Info */}
      {stockData.length > 0 && (
        <div className="mb-4 p-4 bg-blue-50 rounded border">
          <div className="text-sm text-gray-700">
            <p><strong>Loaded {stockData.length} data points</strong></p>
            <p>First close: {stockData[0]?.close}</p>
            <p>Last close: {stockData[stockData.length - 1]?.close}</p>
          </div>
        </div>
      )}

      {/* Model and Prediction Section */}
      {stockData.length > 1 && (
        <>
          <StockModel data={stockData} onPrediction={handlePrediction} />
          {typeof prediction === 'number' && (
            <div className="mb-8 p-6 bg-green-50 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Prediction</h2>
              <div className="text-lg text-green-700 font-bold">
                Predicted next close: ${prediction.toFixed(2)}
              </div>
            </div>
          )}
        </>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Chart Visualization */}
      {stockData.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Data Visualization</h2>
          <div className="bg-white p-4 rounded border">
            <StockChart data={stockData} prediction={prediction} />
          </div>
        </div>
      )}
    </div>
  );
} 