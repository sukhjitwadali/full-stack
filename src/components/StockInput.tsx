import React, { useRef } from 'react';

interface StockInputProps {
  onDataLoaded: (data: any[]) => void;
}

const StockInput: React.FC<StockInputProps> = ({ onDataLoaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        onDataLoaded(json);
      } catch (err) {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleSampleClick = async () => {
    const res = await fetch('/sample-stock-data.json');
    const json = await res.json();
    onDataLoaded(json);
  };

  return (
    <div className="flex flex-col gap-2 items-start">
      <label className="font-semibold">Load Stock Data:</label>
      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="border p-2 rounded"
      />
      <button
        type="button"
        onClick={handleSampleClick}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Use Sample Data
      </button>
    </div>
  );
};

export default StockInput; 