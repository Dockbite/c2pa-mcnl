#!/usr/bin/env node

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Serve .well-known directory with proper options
app.get('/.well-known/did.json', (req, res) => {
  const filePath = path.join(__dirname, '.well-known', 'did.json');

  console.log('Looking for file at:', filePath);

  if (!fs.existsSync(filePath)) {
    console.error('File not found!');
    return res
      .status(404)
      .json({ error: 'DID document not found', path: filePath });
  }

  // Read and send file manually instead of using sendFile
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).json({ error: 'Error reading DID document' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(data);
  });
});

// Add a test route to verify server is working
app.get('/', (req, res) => {
  res.send('Server is running. Try /.well-known/did.json');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(
    `DID document available at http://localhost:${port}/.well-known/did.json`,
  );
});
