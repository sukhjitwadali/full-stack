// Pure JavaScript Neural Network for Stock Prediction
export class NeuralNetwork {
  private layers: number[];
  private weights: number[][][];
  private biases: number[][];
  private learningRate: number;

  constructor(layers: number[], learningRate: number = 0.1) {
    this.layers = layers;
    this.learningRate = learningRate;
    this.weights = [];
    this.biases = [];

    // Initialize weights and biases
    for (let i = 0; i < layers.length - 1; i++) {
      this.weights[i] = [];
      this.biases[i] = [];
      
      for (let j = 0; j < layers[i + 1]; j++) {
        this.weights[i][j] = [];
        for (let k = 0; k < layers[i]; k++) {
          this.weights[i][j][k] = Math.random() * 2 - 1; // Random weight between -1 and 1
        }
        this.biases[i][j] = Math.random() * 2 - 1;
      }
    }
  }

  // Sigmoid activation function
  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  // Derivative of sigmoid
  private sigmoidDerivative(x: number): number {
    return x * (1 - x);
  }

  // Forward propagation
  private forward(input: number[]): number[][] {
    const activations: number[][] = [input];
    const zs: number[][] = [];

    for (let i = 0; i < this.weights.length; i++) {
      const z: number[] = [];
      const activation: number[] = [];

      for (let j = 0; j < this.weights[i].length; j++) {
        let sum = this.biases[i][j];
        for (let k = 0; k < this.weights[i][j].length; k++) {
          sum += this.weights[i][j][k] * activations[i][k];
        }
        z.push(sum);
        activation.push(this.sigmoid(sum));
      }
      zs.push(z);
      activations.push(activation);
    }

    return activations;
  }

  // Backward propagation
  private backward(input: number[], target: number[], activations: number[][]): void {
    const deltas: number[][] = [];
    const m = input.length;

    // Calculate output layer delta
    const outputDelta: number[] = [];
    for (let i = 0; i < activations[activations.length - 1].length; i++) {
      const error = target[i] - activations[activations.length - 1][i];
      outputDelta.push(error * this.sigmoidDerivative(activations[activations.length - 1][i]));
    }
    deltas.push(outputDelta);

    // Calculate hidden layer deltas
    for (let i = this.weights.length - 1; i > 0; i--) {
      const layerDelta: number[] = [];
      for (let j = 0; j < this.weights[i - 1].length; j++) {
        let error = 0;
        for (let k = 0; k < this.weights[i].length; k++) {
          error += this.weights[i][k][j] * deltas[deltas.length - 1][k];
        }
        layerDelta.push(error * this.sigmoidDerivative(activations[i][j]));
      }
      deltas.unshift(layerDelta);
    }

    // Update weights and biases
    for (let i = 0; i < this.weights.length; i++) {
      for (let j = 0; j < this.weights[i].length; j++) {
        for (let k = 0; k < this.weights[i][j].length; k++) {
          this.weights[i][j][k] += this.learningRate * deltas[i][j] * activations[i][k];
        }
        this.biases[i][j] += this.learningRate * deltas[i][j];
      }
    }
  }

  // Train the network
  train(inputs: number[][], targets: number[][], epochs: number = 1000): void {
    for (let epoch = 0; epoch < epochs; epoch++) {
      for (let i = 0; i < inputs.length; i++) {
        const activations = this.forward(inputs[i]);
        this.backward(inputs[i], targets[i], activations);
      }
    }
  }

  // Predict output
  predict(input: number[]): number[] {
    const activations = this.forward(input);
    return activations[activations.length - 1];
  }

  // Save model
  save(): string {
    return JSON.stringify({
      layers: this.layers,
      weights: this.weights,
      biases: this.biases,
      learningRate: this.learningRate
    });
  }

  // Load model
  static load(modelData: string): NeuralNetwork {
    const data = JSON.parse(modelData);
    const network = new NeuralNetwork(data.layers, data.learningRate);
    network.weights = data.weights;
    network.biases = data.biases;
    return network;
  }
}

// Stock prediction utilities
export class StockPredictor {
  private network: NeuralNetwork;
  private isTrained: boolean = false;

  constructor() {
    // Create a neural network with 5 input neurons, 10 hidden neurons, and 1 output neuron
    this.network = new NeuralNetwork([5, 10, 1], 0.1);
  }

  // Prepare training data from stock prices
  prepareTrainingData(prices: number[], lookback: number = 5): { inputs: number[][], targets: number[][] } {
    const inputs: number[][] = [];
    const targets: number[][] = [];

    for (let i = lookback; i < prices.length; i++) {
      const input: number[] = [];
      for (let j = 0; j < lookback; j++) {
        input.push(prices[i - lookback + j]);
      }
      inputs.push(input);
      targets.push([prices[i]]);
    }

    return { inputs, targets };
  }

  // Normalize data to 0-1 range
  normalizeData(data: number[]): { normalized: number[], min: number, max: number } {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const normalized = data.map(value => (value - min) / (max - min));
    return { normalized, min, max };
  }

  // Denormalize data
  denormalizeData(normalized: number[], min: number, max: number): number[] {
    return normalized.map(value => value * (max - min) + min);
  }

  // Train the model
  train(prices: number[], epochs: number = 1000): void {
    const { normalized, min, max } = this.normalizeData(prices);
    const { inputs, targets } = this.prepareTrainingData(normalized);
    
    // Normalize targets
    const normalizedTargets = targets.map(target => [target[0]]);
    
    this.network.train(inputs, normalizedTargets, epochs);
    this.isTrained = true;
  }

  // Predict next price
  predict(prices: number[], steps: number = 1): number[] {
    if (!this.isTrained) {
      throw new Error("Model must be trained before making predictions");
    }

    const { normalized, min, max } = this.normalizeData(prices);
    const predictions: number[] = [];

    let currentInput = normalized.slice(-5); // Use last 5 prices

    for (let i = 0; i < steps; i++) {
      const prediction = this.network.predict(currentInput);
      const denormalizedPrediction = this.denormalizeData(prediction, min, max);
      predictions.push(denormalizedPrediction[0]);
      
      // Update input for next prediction
      currentInput = [...currentInput.slice(1), prediction[0]];
    }

    return predictions;
  }

  // Get model state
  getModelState(): string {
    return this.network.save();
  }

  // Load model state
  loadModelState(state: string): void {
    this.network = NeuralNetwork.load(state);
    this.isTrained = true;
  }

  // Check if model is trained
  isModelTrained(): boolean {
    return this.isTrained;
  }
} 