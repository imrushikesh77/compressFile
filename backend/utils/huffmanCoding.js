class HuffmanNode {
  constructor(char, freq, left = null, right = null) {
    this.char = char;
    this.freq = freq;
    this.left = left;
    this.right = right;
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
    const parent = new HuffmanNode(null, left.freq + right.freq, left, right);
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
  return text.split('').map(char => huffmanCodes.get(char)).join('');
}

function compressTree(node) {
  if (node.char !== null) {
    const charCode = node.char.charCodeAt(0);
    return '1' + charCode.toString(2).padStart(8, '0');
  }
  return '0' + compressTree(node.left) + compressTree(node.right);
}

function decompressTree(data) {
  let index = 0;

  function buildTree() {
    if (index >= data.length) {
      return null;
    }

    if (data[index] === '1') {
      index++;
      const charCode = parseInt(data.substr(index, 8), 2);
      index += 8;
      return new HuffmanNode(String.fromCharCode(charCode), 0);
    }

    index++;
    const left = buildTree();
    const right = buildTree();
    return new HuffmanNode(null, 0, left, right);
  }

  return buildTree();
}

function decodeText(encodedText, huffmanTree) {
  let decodedText = '';
  let current = huffmanTree;

  for (let bit of encodedText) {
    if (!current) {
      throw new Error('Invalid encoded text');
    }
    current = bit === '0' ? current.left : current.right;
    if (current.char !== null) {
      decodedText += current.char;
      current = huffmanTree;
    }
  }

  return decodedText;
}

function encodeAndSave(text) {
  const tree = buildHuffmanTree(text);
  const huffmanCodes = generateHuffmanCodes(tree);
  const encodedText = encodeText(text, huffmanCodes);
  const compressedTree = compressTree(tree);
  
  const treeLengthBinary = compressedTree.length.toString(2).padStart(16, '0');
  const fullEncoded = treeLengthBinary + compressedTree + encodedText;
  return compressToBinary(fullEncoded);
}

function decodeAndSave(buffer) {
  const fullEncoded = decompressFromBinary(buffer);
  
  const treeLength = parseInt(fullEncoded.slice(0, 16), 2);
  const compressedTree = fullEncoded.slice(16, 16 + treeLength);
  const encodedText = fullEncoded.slice(16 + treeLength);
  
  const tree = decompressTree(compressedTree);
  return decodeText(encodedText, tree);
}

function compressToBinary(text) {
  const buffer = Buffer.alloc(Math.ceil(text.length / 8));
  for (let i = 0; i < text.length; i += 8) {
    const byte = text.substr(i, 8).padEnd(8, '0');
    buffer.writeUInt8(parseInt(byte, 2), i / 8);
  }
  return buffer;
}

function decompressFromBinary(buffer) {
  return Array.from(buffer)
    .map(byte => byte.toString(2).padStart(8, '0'))
    .join('');
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