# Huffman File Compressor and Decompressor

This project implements a file compression and decompression tool using Huffman encoding and decoding techniques. Huffman coding is a widely used algorithm for lossless data compression, where more frequent characters are assigned shorter codewords.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup](#setup)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
  - [Running the Application](#running-the-application)
  - [Encoding Files](#encoding-files)
  - [Decoding Files](#decoding-files)
- [Deployment](#deployment)
  - [Frontend](#frontend)
  - [Backend](#backend)
- [Contributing](#contributing)
- [License](#license)

---

## Introduction

This project provides a web-based tool for compressing and decompressing files using Huffman coding. It consists of a frontend interface built with React for user interaction and a backend server implemented in Node.js for file processing.

---

## Features

- File compression using Huffman encoding.
- File decompression using Huffman decoding.
- Drag-and-drop support for file upload.
- Download links for encoded and decoded files.

---

## Technologies Used

- **Frontend**: React.js, HTML/CSS, JavaScript
- **Backend**: Node.js, Express.js
- **File Handling**: FormData API, Blob API
- **Deployment**: Vercel (frontend), Railway (backend)

---

## Setup

### Prerequisites

- Node.js and npm installed globally.
- Git installed locally.

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/imrushikesh77/compressFile.git
   cd compressFile
   ```
2. **Install dependencies**:
   ```bash
    cd backend
    npm install
    cd ../frontend
    npm install
    ```
## Usage

### Running the Application

1. **Start the backend server**:
    ```bash
    cd backend
    npm start
    ```
    - This will start the backend server at `http://localhost:3001`.

2. **Start the frontend development server**:
    ```bash
    cd frontend
    npm start
    ```

    - This will start the frontend server and open the application in your default browser at `http://localhost:1234`.

### Encoding Files
    - Drag and drop a file onto the designated area or click to browse and select a file.
    - Click the Encode File button to compress the selected file using Huffman encoding.

### Decoding Files
    - After encoding a file, the Download Encoded File link will appear.
    - Click the link to download the encoded file (encoded.huf).
    - Click the Decode File button to decompress the encoded file using Huffman decoding.
    - After decoding, the Download Decoded File link will appear for downloading the decoded file(`decoded.txt`).
   


