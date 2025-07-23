"use client";
import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import StockInput from '@/components/StockInput';
import StockModel from '@/components/StockModel';
import StockChart from '@/components/StockChart';

export default function StockPredictionPage() {
  const { data: session } = useSession();
  const [stockData, setStockData] = useState<any[]>([]);
  const [prediction, setPrediction] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [symbol, setSymbol] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dataSource, setDataSource] = useState<'manual' | 'live'>('manual');

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
    setDataSource('manual');
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
      setDataSource('live');
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
        Upload your stock data, use sample data, or fetch live data from Polygon.io to predict the next closing price.
      </p>

      {/* Live Data Section */}
      <div className="mb-8 p-6 bg-green-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">1. Fetch Live Data (Polygon.io)</h2>
        <form onSubmit={fetchLiveData} className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
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
          <button
            type="button"
            className={`px-4 py-2 rounded border ml-2 ${dataSource === 'manual' ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-white border-gray-300 text-gray-700'}`}
            onClick={() => { setDataSource('manual'); setStockData([]); setPrediction(undefined); setError(''); setSuccess(''); }}
          >
            Use Uploaded/Sample Data
          </button>
        </form>
        {dataSource === 'live' && stockData.length > 0 && (
          <div className="mt-4 p-4 bg-white rounded border">
            <div className="text-sm text-gray-700">
              <p><strong>Loaded {stockData.length} data points for {symbol.toUpperCase()}</strong></p>
              <p>First close: {stockData[0]?.close}</p>
              <p>Last close: {stockData[stockData.length - 1]?.close}</p>
            </div>
          </div>
        )}
      </div>

      {/* Data Input Section (hidden if live data is active) */}
      {dataSource === 'manual' && (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">2. Load Stock Data (Upload or Sample)</h2>
          <StockInput onDataLoaded={handleDataLoaded} />
          {stockData.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded border">
              <div className="text-sm text-gray-700">
                <p><strong>Loaded {stockData.length} data points</strong></p>
                <p>First close: {stockData[0]?.close}</p>
                <p>Last close: {stockData[stockData.length - 1]?.close}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Model and Prediction Section */}
      {stockData.length > 1 && (
        <>
          <StockModel data={stockData} onPrediction={handlePrediction} />
          {typeof prediction === 'number' && (
            <div className="mb-8 p-6 bg-green-50 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">3. Prediction</h2>
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
          <h2 className="text-xl font-semibold mb-4">4. Data Visualization</h2>
          <div className="bg-white p-4 rounded border">
            <StockChart data={stockData} prediction={prediction} />
          </div>
        </div>
      )}
    </div>
  );
} 