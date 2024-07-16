import fs from 'fs/promises';
import path from 'path';
import {
  encodeAndSave,
  decodeAndSave
} from '../utils/huffmanCoding.js';

const encodeFile = async (req, res) => {
  const { file } = req;
  if (!file) {
    return res.status(400).json({ error: 'File is required' });
  }
  // console.log('Encoding file:', file.originalname);
  const filePath = path.resolve(file.path);

  try {
    const fileContents = await fs.readFile(filePath, 'utf-8');
    // console.log('File contents:', fileContents);
    // console.log('File contents length:', fileContents.length);

    const encodedData = encodeAndSave(fileContents);
    // console.log('Encoded data:', encodedData);
    // console.log('Encoded data length:', encodedData.length);

    const encodedFilePath = `${filePath}.huf`;
    await fs.writeFile(encodedFilePath, encodedData);

    res.setHeader('Content-Disposition', `attachment; filename=${path.basename(encodedFilePath)}`);
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
  const { file } = req;
  if (!file) {
    return res.status(400).json({ error: 'File is required' });
  }

  const filePath = path.resolve(file.path);
  try {
    const fileBuffer = await fs.readFile(filePath);
    // console.log('First 10 bytes of encoded file:', 
    //     Array.from(fileBuffer.subarray(0, 10))
    //         .map(byte => byte.toString(16).padStart(2, '0'))
    //         .join(' ')
    // );
    // console.log('Encoded file size:', fileBuffer.length);

    let decodedText;
    try {
      decodedText = decodeAndSave(fileBuffer);
    } catch (decodeError) {
      console.error('Error in decodeAndSave:', decodeError);
      console.error('Decode error stack:', decodeError.stack);
      throw new Error('Failed to decode the file: ' + decodeError.message);
    }

    if (!decodedText || decodedText.length === 0) {
      throw new Error('Decoded text is empty or null');
    }

    // console.log('Decoded text (first 100 chars):', decodedText.slice(0, 100));
    // console.log('Decoded text length:', decodedText.length);

    const outputFilePath = path.resolve(`decoded_${path.basename(file.originalname, '.huf')}`);
    await fs.writeFile(outputFilePath, decodedText);

    res.setHeader('Content-Disposition', `attachment; filename=${path.basename(outputFilePath)}`);
    res.status(200).sendFile(outputFilePath, (err) => {
      if (err) {
        console.error('Error sending decoded file:', err);
      }
      // Clean up files after sending
      Promise.all([
        fs.unlink(filePath).catch(e => console.error('Error deleting input file:', e)),
        fs.unlink(outputFilePath).catch(e => console.error('Error deleting output file:', e))
      ]);
    });

  } catch (error) {
    console.error('Error in decodeFile:', error);
    console.error('Error stack:', error.stack);
    fs.unlink(filePath).catch(e => console.error('Error deleting input file:', e));
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error decoding file: ' + error.message });
    }
  }
};

export {
  encodeFile,
  decodeFile
};
