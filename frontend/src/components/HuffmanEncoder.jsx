import React, { useState, useRef } from 'react';
import '../style/HuffmanEncoder.css';

const HuffmanEncoder = () => {
  const [file, setFile] = useState(null);
  const [encodedFile, setEncodedFile] = useState(null);
  const [decodedFile, setDecodedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setEncodedFile(null);
    setDecodedFile(null);
  };

  const handleEncodeFile = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:3001/api/encode', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const blob = await response.blob();
        const filename = getFilenameFromContentDisposition(response.headers.get('Content-Disposition'));
        const url = window.URL.createObjectURL(new Blob([blob]));
        setEncodedFile({ url, filename });
        setDecodedFile(null);
      } else {
        // console.error('Error encoding file:', response.status);
        setEncodedFile(null);
      }
    } catch (error) {
      console.error('Error encoding file:', error);
    }
  };

  const handleDecodeFile = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:3001/api/decode', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(new Blob([blob]));
        setDecodedFile({ url });
        setEncodedFile(null);
      } else {
        // console.error('Error decoding file:', response.status);
        setDecodedFile(null);
      }
    } catch (error) {
      console.error('Error decoding file:', error);
    }
  };

  const getFilenameFromContentDisposition = (contentDisposition) => {
    if (!contentDisposition) {
      return 'download';
    }
    const match = contentDisposition.match(/filename=(.*)/);
    if (match && match.length > 1) {
      return match[1].replace(/['"]/g, '');
    }
    return 'download';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    setFile(droppedFile);
    setEncodedFile(null);
    setDecodedFile(null);
  };

  const handleZoneClick = () => {
    fileInputRef.current.click();
  };

  const handleRemoveFile = () => {
    setFile(null);
    setEncodedFile(null);
    setDecodedFile(null);
    fileInputRef.current.value = '';
  };

  return (
    <div className="huffman-encoder">
      <div 
        className="file-drop-zone" 
        onDragOver={handleDragOver} 
        onDrop={handleDrop}
        onClick={handleZoneClick}
      >
        <input 
          type="file" 
          onChange={handleFileChange} 
          className="file-input" 
          ref={fileInputRef}
          style={{display: 'none'}}
        />
        {file ? (
          <div className="file-info">
            <p>{file.name}</p>
            <button onClick={handleRemoveFile} className="remove-file">Remove</button>
          </div>
        ) : (
          <p>Drag & Drop file here or click to browse</p>
        )}
      </div>
      <button onClick={handleEncodeFile} className="encode-button" disabled={!file}>Encode File</button>
      <button onClick={handleDecodeFile} className="decode-button" disabled={!file}>Decode File</button>
      {encodedFile && (
        <div className="file-download">
          <h2>Encoded File:</h2>
          <a href={encodedFile.url} download="encodedFile.huf">Download Encoded File</a>
        </div>
      )}
      {decodedFile && (
        <div className="file-download">
          <h2>Decoded File:</h2>
          <a href={decodedFile.url} download="decoded.txt">Download Decoded File</a>
        </div>
      )}
    </div>
  );
};

export default HuffmanEncoder;
