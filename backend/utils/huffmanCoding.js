class HuffmanNode {
  constructor(char, freq) {
    this.char = char;
    this.freq = freq;
    this.left = null;
    this.right = null;
  }
}

function buildHuffmanTree(text) {
  const freqMap = new Map();
  for (let char of text) {
    freqMap.set(char, (freqMap.get(char) || 0) + 1);
  }

  const pq = Array.from(freqMap, ([char, freq]) => new HuffmanNode(char, freq));
  pq.sort((a, b) => a.freq - b.freq);

  while (pq.length > 1) {
    const left = pq.shift();
    const right = pq.shift();
    const parent = new HuffmanNode(null, left.freq + right.freq);
    parent.left = left;
    parent.right = right;
    pq.push(parent);
    pq.sort((a, b) => a.freq - b.freq);
  }

  return pq[0];
}

function generateHuffmanCodes(root) {
  const huffmanCodes = new Map();

  function traverse(node, code) {
    if (node.char !== null) {
      huffmanCodes.set(node.char, code);
      return;
    }
    traverse(node.left, code + '0');
    traverse(node.right, code + '1');
  }

  traverse(root, '');
  return huffmanCodes;
}

function encodeText(text, huffmanCodes) {
  let encodedText = '';
  for (let char of text) {
    encodedText += huffmanCodes.get(char);
  }
  return encodedText;
}

function decodeText(encodedText, huffmanTree) {
  if (!huffmanTree) {
    throw new Error('Huffman tree is null or undefined');
  }

  let decodedText = '';
  let current = huffmanTree;

  for (let bit of encodedText) {
    if (!current) {
      throw new Error('Current node became null during traversal');
    }

    current = bit === '0' ? current.left : current.right;

    if (current.char !== null) {
      decodedText += current.char;
      current = huffmanTree;
    }
  }

  return decodedText;
}

function compressTree(node) {
  if (node.char !== null) {
    return '1' + node.char;
  }
  return '0' + compressTree(node.left) + compressTree(node.right);
}

function decompressTree(data) {
  if (!data || data.length === 0) {
    return null;
  }

  let index = 0;

  function buildTree() {
    if (index >= data.length) {
      return null;
    }

    if (data[index] === '1') {
      index++;
      const char = data[index];
      index++;
      return new HuffmanNode(char, 0);
    }

    index++;
    const left = buildTree();
    const right = buildTree();
    const parent = new HuffmanNode(null, 0);
    parent.left = left;
    parent.right = right;
    return parent;
  }

  return buildTree();
}

function compressToBinary(text) {
  let compressed = '';
  for (let i = 0; i < text.length; i += 8) {
    compressed += String.fromCharCode(parseInt(text.substr(i, 8), 2));
  }
  return compressed;
}

function decompressFromBinary(compressed) {
  let text = '';
  for (let i = 0; i < compressed.length; i++) {
    let bin = compressed.charCodeAt(i).toString(2);
    bin = '0'.repeat(8 - bin.length) + bin;
    text += bin;
  }
  return text;
}

function encodeAndSave(text) {
  const tree = buildHuffmanTree(text);
  const huffmanCodes = generateHuffmanCodes(tree);
  const encodedText = encodeText(text, huffmanCodes);
  const compressedTree = compressTree(tree);
  
  // Combine compressed tree and encoded text with a separator
  const fullEncoded = compressedTree + '|' + encodedText;
  
  // Convert to binary
  const binaryData = compressToBinary(fullEncoded);
  
  return binaryData;
}

function decodeAndSave(binaryData) {
  const fullEncoded = decompressFromBinary(binaryData);
  const [compressedTree, encodedText] = fullEncoded.split('|');
  
  const tree = decompressTree(compressedTree);
  const decodedText = decodeText(encodedText, tree);
  
  return decodedText;
}

export {
  buildHuffmanTree,
  generateHuffmanCodes,
  encodeText,
  decodeText,
  compressTree,
  decompressTree,
  compressToBinary,
  decompressFromBinary,
  encodeAndSave,
  decodeAndSave
};