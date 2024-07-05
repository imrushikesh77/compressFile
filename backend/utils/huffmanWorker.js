import { parentPort, workerData } from 'worker_threads';
import {
  buildHuffmanTree,
  generateHuffmanCodes,
  encodeText,
  decodeText,
  compressTree,
  decompressTree,
  compressToBinary,
  decompressFromBinary
} from './huffmanCoding.js';

const { text, mode, encoded, tree } = workerData;

if (mode === 'encode') {
  const huffmanTree = buildHuffmanTree(text);
  const huffmanCodes = generateHuffmanCodes(huffmanTree);
  const encodedText = encodeText(text, huffmanCodes);
  const compressedTree = compressTree(huffmanTree);
  const compressedData = compressToBinary(encodedText);
  parentPort.postMessage({
    encoded: compressedData,
    tree: compressedTree
  });
} else if (mode === 'decode') {
  try {
    const huffmanTree = decompressTree(tree);
    const decompressedData = decompressFromBinary(encoded);
    const decodedText = decodeText(decompressedData, huffmanTree);
    parentPort.postMessage({ decodedText });
  } catch (error) {
    parentPort.postMessage({ error: error.message });
  }
} else {
  throw new Error('Invalid mode specified');
}