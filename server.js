const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for your frontend
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.options('*', cors());
app.use(express.json());

// Store eligible addresses
const eligibleAddresses = [
  '0x1234567890abcdef1234567890abcdef12345678',
  '0x201992904b6dd0c691be271013228ba6241dfc8c',
  '0x9E039b1479de2F332D83ED812b117265f9Ad1212',
  '0xE529b5634590989eBc83078f172D816ccE217162',
  '0x3b994b7C1A7cb446AAbBFa4292f540A07141b318',
  '0x0e61bAbf5398d41339Be5f6dD2bf34045Ab54EaE',
  '0x0517eabe74fbcc53d798fcdb63004d20bc6fa0de',
  '0x94b514f2db06724c03701f2e175fc3f3460cc460',
  '0xefD9239003fBb9934D0860256D4dbc2aF90C5BA8',
  '0x0e302F00bA592BD497EC7d0b0FC001d03cFaeb8d',
  '0xFa5f5aB5e3Fe8149a33efdd1Ed9dd9Ab57ad7fe7',
  '0xcC996614652c3d5464bea9003E6f4C3346D8B74d',
  '8sPpz4zmSBcettu3yKHRJTkGvXLmVrKmoiVytBJzuQhw'
];

// Endpoint to check eligibility
app.post('/check-eligibility', (req, res) => {
  try {
    const { metamaskAddress } = req.body;
    
    if (!metamaskAddress) {
      return res.status(400).json({ error: 'MetaMask address is required' });
    }

    const normalizedAddress = metamaskAddress.toLowerCase();
    const isEligible = eligibleAddresses.some(addr => addr.toLowerCase() === normalizedAddress);

    console.log(`Checking eligibility for: ${metamaskAddress} - Result: ${isEligible}`);

    res.json({
      eligible: isEligible,
      message: isEligible ? 'Eligible for the RadiantArena pre sale token' : 'Address is not eligible for the RadiantArena pre sale token'
    });
  } catch (error) {
    console.error('Error in check-eligibility:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to submit a $SUI address
app.post('/submit-sui-address', (req, res) => {
  try {
    const { metamaskAddress, suiAddress } = req.body;

    if (!metamaskAddress || !suiAddress) {
      return res.status(400).json({ error: 'Both MetaMask and $SUI addresses are required' });
    }

    const timestamp = new Date().toISOString();
    const filePath = path.join(__dirname, 'submissions.csv');
    const header = 'MetaMask Address,$SUI Address,Timestamp\n';
    const newRecord = `${metamaskAddress},${suiAddress},${timestamp}`;

    console.log(`Processing submission: ${metamaskAddress} -> ${suiAddress}`);

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err && err.code === 'ENOENT') {
        fs.writeFile(filePath, header + newRecord + '\n', 'utf8', (writeErr) => {
          if (writeErr) {
            console.error('Failed to create submission file:', writeErr);
            return res.status(500).json({ error: 'Failed to save submission' });
          }
          console.log(`Saved new submission: ${metamaskAddress} -> ${suiAddress}`);
          return res.status(200).json({ success: true, message: 'Submission saved' });
        });
        return;
      }
      
      if (err) {
        console.error('Failed to read submission file:', err);
        return res.status(500).json({ error: 'Failed to process submission' });
      }

      let lines = data.trim().split('\n');
      const fileHeader = lines.shift() || 'MetaMask Address,$SUI Address,Timestamp';
      let found = false;

      const updatedLines = lines.map(line => {
        if (!line) return null;
        let cols = line.split(',');
        if (cols.length > 0 && cols[0].toLowerCase() === metamaskAddress.toLowerCase()) {
          found = true;
          return newRecord;
        }
        return line;
      }).filter(Boolean);

      if (!found) {
        updatedLines.push(newRecord);
      }

      const updatedCsv = [fileHeader, ...updatedLines].join('\n') + '\n';

      fs.writeFile(filePath, updatedCsv, 'utf8', (writeErr) => {
        if (writeErr) {
          console.error('Failed to save submission:', writeErr);
          return res.status(500).json({ error: 'Failed to save submission' });
        }
        const message = found ? 'Submission updated successfully' : 'Submission saved successfully';
        console.log(`${found ? 'Updated' : 'Saved'}: ${metamaskAddress} -> ${suiAddress}`);
        res.status(200).json({ success: true, message });
      });
    });
  } catch (error) {
    console.error('Error in submit-sui-address:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to check if a MetaMask address has already submitted a $SUI address
app.get('/check-submission/:metamaskAddress', (req, res) => {
  try {
    const metamaskAddress = req.params.metamaskAddress;
    const filePath = path.join(__dirname, 'submissions.csv');
    
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err && err.code === 'ENOENT') {
        return res.json({ hasSubmitted: false, suiAddress: null });
      }
      
      if (err) {
        console.error('Failed to read submission file:', err);
        return res.status(500).json({ error: 'Failed to check submission' });
      }

      const lines = data.trim().split('\n');
      if (lines.length <= 1) {
        return res.json({ hasSubmitted: false, suiAddress: null });
      }

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;
        
        const cols = line.split(',');
        if (cols.length >= 2 && cols[0].toLowerCase() === metamaskAddress.toLowerCase()) {
          return res.json({ 
            hasSubmitted: true, 
            suiAddress: cols[1],
            timestamp: cols[2] || null
          });
        }
      }
      
      res.json({ hasSubmitted: false, suiAddress: null });
    });
  } catch (error) {
    console.error('Error in check-submission:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/download-csv', (req, res) => {
  const filePath = path.join(__dirname, 'submissions.csv');
  res.download(filePath, 'submissions.csv', (err) => {
    if (err) {
      console.error('Error sending file:', err);
      if (!res.headersSent) {
        res.status(404).send('File not found or error in sending.');
      }
    }
  });
});

// Serve static files
app.use(express.static(__dirname));

// Serve the main HTML file at the root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'RadiantArena Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 RadiantArena Server running on port ${PORT}`);
  console.log('📝 Submissions will be saved to submissions.csv');
  console.log('✅ Server is ready to handle requests');
}); 
