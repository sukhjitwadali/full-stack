import React, { useEffect } from 'react';

declare global {
  interface Window {
    brain: any;
  }
}

interface StockModelProps {
  data: any[];
  onPrediction: (prediction: number) => void;
}

const StockModel: React.FC<StockModelProps> = ({ data, onPrediction }) => {
  useEffect(() => {
    if (!data || data.length < 2) return;
    if (typeof window === 'undefined' || !window.brain) {
      console.error('brain.js not loaded from CDN');
      return;
    }
    // Prepare data for Brain.js (assume data is array of { close: number })
    const trainingData = data.slice(0, -1).map((d, i) => ({
      input: [d.close],
      output: [data[i + 1].close],
    }));
    const net = new window.brain.NeuralNetwork({ hiddenLayers: [5, 3] });
    net.train(trainingData, { log: false });
    const last = data[data.length - 1];
    const prediction = net.run([last.close]);
    if (Array.isArray(prediction)) {
      onPrediction(prediction[0]);
    } else if (typeof prediction === 'number') {
      onPrediction(prediction);
    }
  }, [data, onPrediction]);

  return null; // No UI, just logic
};

export default StockModel; 