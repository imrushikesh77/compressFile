import fs from 'fs/promises';
import path from 'path';
import runWorker from '../utils/runWorker.js';
import { Worker } from 'worker_threads';

const encodeFile = async (req, res) => {
  const { file } = req;
  if (!file) {
    return res.status(400).json({ error: 'File is required' });
  }

  const filePath = path.resolve(file.path);
  
  try {
    const fileContents = await fs.readFile(filePath, 'utf-8');
    const result = await runWorker({ text: fileContents, mode: 'encode' });
    
    const encodedFilePath = `${filePath}.huf`;
    const header = Buffer.from(`${result.tree.length}:${result.tree}`);
    const encodedData = Buffer.from(result.encoded, 'binary');
    const finalBuffer = Buffer.concat([header, encodedData]);
    
    await fs.writeFile(encodedFilePath, finalBuffer);
    
    // Set Content-Disposition header to force download with correct filename
    res.setHeader('Content-Disposition', `attachment; filename=${path.basename(encodedFilePath)}`);
    // console.log('Sending encoded file...', encodedFilePath);
    res.status(200).download(encodedFilePath, (err) => {
      if (err) {
        console.error('Error downloading encoded file:', err);
      }
      fs.unlink(filePath).catch(console.error);
      fs.unlink(encodedFilePath).catch(console.error);
    });
  } catch (error) {
    console.error('Error encoding file:', error);
    fs.unlink(filePath).catch(console.error);
    res.status(500).json({ error: error.message });
  }
};

const decodeFile = async (req, res) => {
  try {
    const filePath = req.file.path;
    const fileBuffer = await fs.readFile(filePath);

    // Read the header to get the tree length
    const headerEndIndex = fileBuffer.indexOf(':');
    const treeLength = parseInt(fileBuffer.slice(0, headerEndIndex).toString(), 10);
    
    // Extract the tree data and encoded data
    const treeEndIndex = headerEndIndex + 1 + treeLength;
    const treeData = fileBuffer.slice(headerEndIndex + 1, treeEndIndex).toString();
    const encodedData = fileBuffer.slice(treeEndIndex);

    const worker = new Worker(path.resolve('utils/huffmanWorker.js'), {
      workerData: {
        mode: 'decode',
        encoded: encodedData.toString('binary'),
        tree: treeData
      }
    });

    worker.on('message', async (decodedData) => {
      try {
        const decodedText = decodedData.decodedText;
        const outputFilePath = path.resolve(`decoded_${path.basename(filePath, '.huf')}`);
        await fs.writeFile(outputFilePath, decodedText);
        
        res.setHeader('Content-Disposition', `attachment; filename=${path.basename(outputFilePath)}`);
        res.status(200).download(outputFilePath, (err) => {
          if (err) {
            console.error('Error downloading decoded file:', err);
          }
          // Clean up files after download
          Promise.all([
            fs.unlink(filePath).catch(console.error),
            fs.unlink(outputFilePath).catch(console.error)
          ]);
        });
      } catch (error) {
        console.error('Error writing decoded file:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error writing decoded file' });
        }
      }
    });

    worker.on('error', (error) => {
      console.error('Worker error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error in decoding worker' });
      }
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Worker stopped with exit code ${code}`);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Decoding worker exited unexpectedly' });
        }
      }
    });

  } catch (error) {
    console.error('Error decoding file:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error decoding file' });
    }
  }
};

export {
  encodeFile,
  decodeFile
};
