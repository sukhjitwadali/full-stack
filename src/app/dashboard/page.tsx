"use client";
import { useState } from "react";
import UserProfile from "@/components/UserProfile";
import StockModel from "@/components/StockModel";
import StockChart from "@/components/StockChart";

export default function Dashboard() {
  const [symbol, setSymbol] = useState("");
  const [stockData, setStockData] = useState<any[]>([]);
  const [prediction, setPrediction] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchLiveData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim()) {
      setError("Please enter a stock symbol.");
      return;
    }
    setIsLoading(true);
    setError("");
    setSuccess("");
    setPrediction(undefined);
    try {
      const res = await fetch(`/api/stock-data?symbol=${encodeURIComponent(symbol.trim())}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to fetch data.");
        setStockData([]);
        return;
      }
      if (!json.data || json.data.length < 2) {
        setError("Not enough data returned for prediction.");
        setStockData([]);
        return;
      }
      setStockData(json.data);
      setSuccess(`Loaded ${json.data.length} data points for ${json.symbol}`);
    } catch (err: any) {
      setError("Failed to fetch data.");
      setStockData([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
        <p className="text-gray-600">
          Welcome to your dashboard! This is a protected page that only authenticated users can access.
        </p>
      </div>

      {/* Live Stock Prediction Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Live Stock Prediction</h2>
        <form onSubmit={fetchLiveData} className="flex flex-col sm:flex-row gap-4 items-start sm:items-end mb-4">
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
            {isLoading ? "Loading..." : "Fetch Live Data"}
          </button>
        </form>
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
        {stockData.length > 0 && (
          <>
            <div className="mb-4 p-4 bg-blue-50 rounded border">
              <div className="text-sm text-gray-700">
                <p><strong>Loaded {stockData.length} data points for {symbol.toUpperCase()}</strong></p>
                <p>First close: {stockData[0]?.close}</p>
                <p>Last close: {stockData[stockData.length - 1]?.close}</p>
              </div>
            </div>
            <StockModel data={stockData} onPrediction={setPrediction} />
            {typeof prediction === 'number' && (
              <div className="mb-4 p-4 bg-green-50 rounded border">
                <div className="text-lg text-green-700 font-bold">
                  Predicted next close: ${prediction.toFixed(2)}
                </div>
              </div>
            )}
            <div className="mt-4">
              <StockChart data={stockData} prediction={prediction} />
            </div>
          </>
        )}
      </div>

      <UserProfile />
    </div>
  );
}
