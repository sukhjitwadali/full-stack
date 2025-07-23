import React from 'react';
import { Line } from 'react-chartjs-2';
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface StockChartProps {
  data: any[];
  prediction?: number;
}

const StockChart: React.FC<StockChartProps> = ({ data, prediction }) => {
  const labels = data.map((_, i) => `Day ${i + 1}`);
  const prices = data.map((d) => d.close);
  const chartData = {
    labels: prediction ? [...labels, 'Prediction'] : labels,
    datasets: [
      {
        label: 'Historical Close',
        data: prices,
        borderColor: 'rgb(59,130,246)',
        backgroundColor: 'rgba(59,130,246,0.2)',
        tension: 0.2,
      },
      prediction
        ? {
            label: 'Predicted Next Close',
            data: Array(prices.length).fill(null).concat([prediction]),
            borderColor: 'rgb(16,185,129)',
            backgroundColor: 'rgba(16,185,129,0.2)',
            pointRadius: 6,
            pointBackgroundColor: 'rgb(16,185,129)',
            showLine: false,
          }
        : {},
    ],
  };
  return (
    <div className="w-full max-w-2xl mx-auto">
      <Line data={chartData} options={{
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Stock Price Prediction' },
        },
        scales: {
          x: { title: { display: true, text: 'Time' } },
          y: { title: { display: true, text: 'Close Price' } },
        },
      }} />
    </div>
  );
};

export default StockChart; 