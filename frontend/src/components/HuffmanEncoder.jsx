import React, { useState, useRef } from 'react';
import '../style/HuffmanEncoder.css';

const HuffmanEncoder = () => {
  const [file, setFile] = useState(null);
  const [encodedFile, setEncodedFile] = useState(null);
  const [decodedFile, setDecodedFile] = useState(null);
  const [fileTypeError, setFileTypeError] = useState(false);
  const fileInputRef = useRef(null);

  const acceptedFileTypes = [
    ".txt", ".cpp", ".js", ".py", ".c", ".doc", ".html", ".css", ".json", 
    ".xml", ".md", ".java", ".cs", ".rb", ".php", ".sh", ".huf"
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (isAcceptedFileType(selectedFile)) {
      setFile(selectedFile);
      setEncodedFile(null);
      setDecodedFile(null);
      setFileTypeError(false);
    } else {
      setFile(null);
      setFileTypeError(true);
    }
  };

  const handleEncodeFile = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch("https://compressfile-server.up.railway.app/api/encode",{
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
      const response = await fetch('https://compressfile-server.up.railway.app/api/decode', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(new Blob([blob]));
        setDecodedFile({ url });
        setEncodedFile(null);
      } else {
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
    if (isAcceptedFileType(droppedFile)) {
      setFile(droppedFile);
      setEncodedFile(null);
      setDecodedFile(null);
      setFileTypeError(false);
    } else {
      setFile(null);
      setFileTypeError(true);
    }
  };

  const handleZoneClick = () => {
    fileInputRef.current.click();
  };

  const handleRemoveFile = () => {
    setFile(null);
    setEncodedFile(null);
    setDecodedFile(null);
    fileInputRef.current.value = '';
    setFileTypeError(false);
  };

  const isAcceptedFileType = (file) => {
    return file && acceptedFileTypes.includes(file.name.substring(file.name.lastIndexOf('.')));
  };

  console.log(isAcceptedFileType(file));

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
          accept={acceptedFileTypes.join(', ')}
        />
        {file ? (
          <div className="file-info">
            <p>{file.name}</p>
            <button onClick={handleRemoveFile} className="remove-file">Remove</button>
          </div>
        ) : (
          <p>Drag & Drop file here or click to browse</p>
        )}
        {fileTypeError && (
          <p className="file-type-error">File type not supported</p>
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
