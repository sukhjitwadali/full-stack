# Stock Market Prediction App

## Overview
This application predicts future stock prices using a simple neural network (Brain.js) and provides multiple ways to input data: upload, sample, hard-coded, or live from Polygon.io. It is built with Next.js, React, and Tailwind CSS.

---

## How to Run Locally

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd full-stack-app
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up environment variables:**
   - Create a `.env.local` file in the root directory.
   - Add your MongoDB and Polygon.io API keys:
     ```env
     MONGODB_URI=your_mongodb_uri
     POLYGON_API_KEY=your_polygon_api_key
     ```
4. **Run the development server:**
   ```bash
   npm run dev
   ```
5. **(Optional) For live data simulation:**
   - Start the WebSocket server (if using):
     ```bash
     node server.js
     ```

---

## Dataset Format and Usage

- **JSON Format:**
  - Upload a file with an array of objects, each containing at least a `close` property (and optionally `date`).
  - Example:
    ```json
    [
      { "date": "2024-01-01", "close": 150.12 },
      { "date": "2024-01-02", "close": 151.34 },
      ...
    ]
    ```
- **Sample Data:**
  - Use the provided `public/sample-stock-data.json` file.
- **Hard-Coded Data:**
  - Built into the app for demo/testing.
- **Live Data:**
  - Enter a stock symbol to fetch the last 50 days from Polygon.io.

---

## Model Logic

- **Neural Network:**
  - Uses Brain.js (`NeuralNetwork`) with a simple feedforward architecture.
  - Trains on historical closing prices: each input is `[close]`, output is `[nextClose]`.
  - After training, predicts the next closing price based on the latest value.
- **Prediction Display:**
  - The predicted value is shown in the UI and clearly differentiated on the chart.

---

## Third-Party Libraries Used

- [Next.js](https://nextjs.org/) (React framework)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/) (styling)
- [brain.js](https://github.com/BrainJS/brain.js) (neural network)
- [chart.js](https://www.chartjs.org/) & [react-chartjs-2](https://github.com/reactchartjs/react-chartjs-2) (visualization)
- [axios](https://axios-http.com/) (API calls)
- [next-auth](https://next-auth.js.org/) (authentication)

---

---

## Contact
For questions or issues, please open an issue in the repository.
