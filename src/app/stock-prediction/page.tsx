"use client";
import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { StockPredictor } from '@/lib/neuralNetwork';
import Papa from 'papaparse';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface StockData {
  date: string;
  price: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
}

export default function StockPredictionPage() {
  const { data: session } = useSession();
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [predictions, setPredictions] = useState<number[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [modelTrained, setModelTrained] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const [stockSymbol, setStockSymbol] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const predictorRef = useRef<StockPredictor | null>(null);

  // Fetch stock data from Alpha Vantage
  const fetchStockData = async (symbol: string) => {
    if (!symbol.trim()) {
      setError('Please enter a stock symbol');
      return;
    }

    setIsLoadingStock(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/stock-data?symbol=${symbol.trim().toUpperCase()}`);
      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to fetch stock data');
        return;
      }

      if (result.data.length < 50) {
        setError('Not enough data points for training. Need at least 50 data points.');
        return;
      }

      setStockData(result.data);
      setSuccess(`Loaded ${result.data.length} data points for ${result.symbol}`);
    } catch (error) {
      setError('Failed to fetch stock data. Please try again.');
    } finally {
      setIsLoadingStock(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      
      if (file.name.endsWith('.csv')) {
        // Parse CSV
        Papa.parse(text, {
          header: true,
          complete: (results) => {
            const data = results.data as any[];
            if (data.length < 50) {
              setError('Please upload a file with at least 50 data points');
              return;
            }
            
            const stockData = data.map(row => ({
              date: row.date || row.Date || row.DATE || Object.keys(row)[0],
              price: parseFloat(row.price || row.Price || row.PRICE || row.close || row.Close || Object.values(row)[1])
            })).filter(item => !isNaN(item.price));
            
            setStockData(stockData);
            setError('');
            setSuccess(`Loaded ${stockData.length} data points`);
          },
          error: (error: Papa.ParseError) => {
            setError('Error parsing CSV file');
          }
        });
      } else if (file.name.endsWith('.json')) {
        // Parse JSON
        try {
          const data = JSON.parse(text);
          let stockData: StockData[] = [];
          
          if (Array.isArray(data)) {
            stockData = data.map((item: any) => ({
              date: item.date || item.Date || item.DATE || item.timestamp || item.Timestamp,
              price: parseFloat(item.price || item.Price || item.PRICE || item.close || item.Close)
            })).filter((item: StockData) => !isNaN(item.price));
          } else if (data.prices || data.data) {
            const prices = data.prices || data.data;
            stockData = prices.map((item: any, index: number) => ({
              date: item.date || item.Date || item.DATE || `Day ${index + 1}`,
              price: parseFloat(item.price || item.Price || item.PRICE || item.close || item.Close)
            })).filter((item: StockData) => !isNaN(item.price));
          }
          
          if (stockData.length < 50) {
            setError('Please upload a file with at least 50 data points');
            return;
          }
          
          setStockData(stockData);
          setError('');
          setSuccess(`Loaded ${stockData.length} data points`);
        } catch (error) {
          setError('Error parsing JSON file');
        }
      } else {
        setError('Please upload a CSV or JSON file');
      }
    };
    reader.readAsText(file);
  };

  // Train the model
  const trainModel = async () => {
    if (stockData.length < 50) {
      setError('Need at least 50 data points to train the model');
      return;
    }

    setIsTraining(true);
    setError('');
    setSuccess('');

    try {
      const predictor = new StockPredictor();
      const prices = stockData.map(item => item.price);
      
      // Train the model
      predictor.train(prices, 1000); // 1000 epochs
      
      predictorRef.current = predictor;
      setModelTrained(true);
      setSuccess('Model trained successfully!');
    } catch (error) {
      setError('Error training model: ' + (error as Error).message);
    } finally {
      setIsTraining(false);
    }
  };

  // Make predictions
  const makePrediction = async () => {
    if (!predictorRef.current || !modelTrained) {
      setError('Please train the model first');
      return;
    }

    if (stockData.length < 5) {
      setError('Need at least 5 data points to make predictions');
      return;
    }

    setIsPredicting(true);
    setError('');
    setSuccess('');

    try {
      const prices = stockData.map(item => item.price);
      const predictions = predictorRef.current.predict(prices, 5); // Predict next 5 days
      setPredictions(predictions);
      setSuccess(`Predicted next 5 days: ${predictions.map(p => p.toFixed(2)).join(', ')}`);
    } catch (error) {
      setError('Error making predictions: ' + (error as Error).message);
    } finally {
      setIsPredicting(false);
    }
  };

  // Generate chart data
  const getChartData = () => {
    const labels = stockData.map(item => item.date);
    const historicalData = stockData.map(item => item.price);
    
    // Add prediction data
    const allLabels = [...labels];
    const allData = [...historicalData];
    
    if (predictions.length > 0) {
      for (let i = 0; i < predictions.length; i++) {
        allLabels.push(`Prediction ${i + 1}`);
        allData.push(predictions[i]);
      }
    }

    return {
      labels: allLabels,
      datasets: [
        {
          label: 'Historical Prices',
          data: historicalData,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.1,
        },
        ...(predictions.length > 0 ? [{
          label: 'Predictions',
          data: [...Array(historicalData.length).fill(null), ...predictions],
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderDash: [5, 5],
          tension: 0.1,
        }] : []),
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Stock Price Prediction',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
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
        Upload your stock data and use our neural network to predict future prices.
      </p>

      {/* Data Source Section */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">1. Get Stock Data</h2>
        
        {/* Alpha Vantage Integration */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Real-time Stock Data</h3>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Stock Symbol (e.g., AAPL, MSFT, GOOGL)
              </label>
              <input
                type="text"
                value={stockSymbol}
                onChange={(e) => setStockSymbol(e.target.value)}
                placeholder="AAPL"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => fetchStockData(stockSymbol)}
              disabled={isLoadingStock || !stockSymbol.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingStock ? 'Loading...' : 'Fetch Data'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Powered by Alpha Vantage API - Get real-time stock data
          </p>
        </div>

        {/* File Upload Alternative */}
        <div>
          <h3 className="text-lg font-medium mb-3">Or Upload Your Own Data</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload CSV or JSON file (minimum 50 data points)
            </label>
            <input
              type="file"
              accept=".csv,.json"
              onChange={handleFileUpload}
              ref={fileInputRef}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>
        
        {stockData.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded border">
            <div className="text-sm text-gray-700">
              <p><strong>Loaded {stockData.length} data points</strong></p>
              <p>Date range: {stockData[0]?.date} to {stockData[stockData.length - 1]?.date}</p>
              <p>Price range: ${Math.min(...stockData.map(d => d.price)).toFixed(2)} - ${Math.max(...stockData.map(d => d.price)).toFixed(2)}</p>
              {stockData[0]?.volume && (
                <p>Latest volume: {stockData[stockData.length - 1]?.volume?.toLocaleString()}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Model Training Section */}
      {stockData.length >= 50 && (
        <div className="mb-8 p-6 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">2. Train Neural Network</h2>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              The neural network will learn patterns from your historical data to make predictions.
            </p>
            <button
              onClick={trainModel}
              disabled={isTraining}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTraining ? 'Training...' : 'Train Model'}
            </button>
            {modelTrained && (
              <div className="text-sm text-green-600">
                ✓ Model trained successfully
              </div>
            )}
          </div>
        </div>
      )}

      {/* Prediction Section */}
      {modelTrained && (
        <div className="mb-8 p-6 bg-green-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">3. Make Predictions</h2>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Predict the next 5 days of stock prices based on the trained model.
            </p>
            <button
              onClick={makePrediction}
              disabled={isPredicting}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPredicting ? 'Predicting...' : 'Make Prediction'}
            </button>
            {predictions.length > 0 && (
              <div className="text-sm">
                <p className="font-semibold text-gray-700">Predictions:</p>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {predictions.map((prediction, index) => (
                    <div key={index} className="p-2 bg-white rounded border text-center">
                      <div className="text-xs text-gray-500">Day {index + 1}</div>
                      <div className="font-semibold">${prediction.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
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

      {/* Chart */}
      {stockData.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Data Visualization</h2>
          <div className="bg-white p-4 rounded border">
            <Line data={getChartData()} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-6 bg-yellow-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">How to Use</h2>
        <div className="space-y-2 text-sm text-gray-700">
          <p>1. <strong>Get Data:</strong> Enter a stock symbol (e.g., AAPL, MSFT) or upload your own file</p>
          <p>2. <strong>Train Model:</strong> The neural network will learn from the historical data</p>
          <p>3. <strong>Make Predictions:</strong> Get predictions for the next 5 days</p>
          <p>4. <strong>Visualize:</strong> View historical data and predictions on the chart</p>
        </div>
        
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Data Sources:</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• <strong>Real-time API:</strong> Alpha Vantage provides live stock data</li>
            <li>• <strong>CSV:</strong> date,price columns (e.g., "2024-01-01,150.25")</li>
            <li>• <strong>JSON:</strong> Array of objects with date and price properties</li>
          </ul>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold mb-2">Popular Stock Symbols:</h3>
          <div className="text-sm text-gray-700">
            <p>AAPL (Apple), MSFT (Microsoft), GOOGL (Google), AMZN (Amazon), TSLA (Tesla), META (Meta), NVDA (NVIDIA)</p>
          </div>
        </div>
      </div>
    </div>
  );
} 