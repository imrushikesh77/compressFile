// File: /backend/utils/runWorker.js

import { Worker } from 'worker_threads';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runWorker = (workerData) => {
  return new Promise((resolve, reject) => {
    const workerPath = path.resolve(__dirname, 'huffmanWorker.js');
    const worker = new Worker(workerPath, { workerData });

    worker.on('message', (result) => {
      resolve(result);
      worker.terminate();
    });

    worker.on('error', (error) => {
      reject(error);
      worker.terminate();
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
};

export default runWorker;