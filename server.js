const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 10000;

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
  // **ADD_ELIGIBLE_EVM_ADDRESSES_HERE_AS_STRINGS**
  // e.g. '**0xEVM_ADDRESS_1**', '**0xEVM_ADDRESS_2**', ...

  // **ADD_ELIGIBLE_SOLANA_ADDRESSES_HERE_AS_STRINGS**
  // e.g. '**SOLANA_ADDRESS_1**', '**SOLANA_ADDRESS_2**', ...
];

// Google Sheets setup
const SHEET_ID = '**YOUR_GOOGLE_SHEET_ID_HERE**';
const SHEET_RANGE = 'Sheet1!A:C'; // Adjust if your sheet/tab name is different
const GOOGLE_CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

let sheetsClient;
async function getSheetsClient() {
  if (sheetsClient) return sheetsClient;
  let auth;
  if (process.env.GOOGLE_CREDENTIALS_JSON) {
    // Load credentials from environment variable
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
    auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  } else {
    // Fallback to credentials.json file
    auth = new google.auth.GoogleAuth({
      keyFile: GOOGLE_CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  }
  sheetsClient = google.sheets({ version: 'v4', auth });
  return sheetsClient;
}

async function appendToGoogleSheet(metamaskAddress, suiAddress, timestamp) {
  try {
    const sheets = await getSheetsClient();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: SHEET_RANGE,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[metamaskAddress, suiAddress, timestamp]],
      },
    });
    console.log('✅ Submission also backed up to Google Sheet.');
  } catch (err) {
    console.error('❌ Failed to append to Google Sheet:', err);
  }
}

// Helper: Update or append a submission in Google Sheets
async function upsertToGoogleSheet(metamaskAddress, suiAddress, timestamp) {
  try {
    const sheets = await getSheetsClient();
    // Fetch all rows
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: SHEET_RANGE,
    });
    const rows = result.data.values || [];
    let foundRow = -1;
    // Find the row index (skip header)
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] && rows[i][0].toLowerCase() === metamaskAddress.toLowerCase()) {
        foundRow = i;
        break;
      }
    }
    if (foundRow !== -1) {
      // Update the row
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!A${foundRow + 1}:C${foundRow + 1}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[metamaskAddress, suiAddress, timestamp]],
        },
      });
      console.log('✅ Submission updated in Google Sheet.');
    } else {
      // Append as new row
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: SHEET_RANGE,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[metamaskAddress, suiAddress, timestamp]],
        },
      });
      console.log('✅ Submission appended to Google Sheet.');
    }
  } catch (err) {
    console.error('❌ Failed to upsert to Google Sheet:', err);
  }
}

// Helper: Read all submissions from Google Sheets
async function getAllSubmissionsFromSheet() {
  const sheets = await getSheetsClient();
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: SHEET_RANGE,
  });
  // result.data.values is an array of arrays: [[address, sui, timestamp], ...]
  return result.data.values || [];
}

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
app.post('/submit-sui-address', async (req, res) => {
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

    // Backup to Google Sheet (fire and forget)
    upsertToGoogleSheet(metamaskAddress, suiAddress, timestamp);

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

// Endpoint to check if a MetaMask address has already submitted a $SUI address (now from Google Sheets)
app.get('/check-submission/:metamaskAddress', async (req, res) => {
  try {
    const metamaskAddress = req.params.metamaskAddress.toLowerCase();
    const rows = await getAllSubmissionsFromSheet();
    if (rows.length <= 1) {
      return res.json({ hasSubmitted: false, suiAddress: null });
    }
    // Assume first row is header
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[0] && row[0].toLowerCase() === metamaskAddress) {
        return res.json({
          hasSubmitted: true,
          suiAddress: row[1] || null,
          timestamp: row[2] || null
        });
      }
    }
    res.json({ hasSubmitted: false, suiAddress: null });
  } catch (error) {
    console.error('Error in check-submission (Google Sheets):', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to download all submissions as CSV (from Google Sheets)
app.get('/download-csv', async (req, res) => {
  try {
    const rows = await getAllSubmissionsFromSheet();
    if (!rows || rows.length === 0) {
      return res.status(404).send('No submissions found.');
    }
    const csv = rows.map(row => row.map(cell => '"' + String(cell).replace(/"/g, '""') + '"').join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="submissions.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Error in download-csv (Google Sheets):', error);
    res.status(500).send('Failed to generate CSV.');
  }
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
