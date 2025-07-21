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
  '0x4A6C35bA87dCA8A4767734435C8F4ed84b7be87C',
'0x636152068f656e4392D76b347e4b20BF3d70a897',
'0xF67FC3F312460C8fB8D89A9eDaF445a5c98BD01A',
'0x1caD0DC90D8a415275132B5Dfd50692723c912B5',
'0x396BCE39CfA2B5852F43F9dB10478f31CdFE8145',
'0x5786cE6b967aD0F8d5f10Fc517a09Ffd483823B4',
'0x1442533D5D865823FC294bf5c9028f667e67FD07',
'0x9c12Fa2A9c347250De950d3bD321372E71E5912b',
'0xB591f385Ac668C4511d528497f89AB86dbe1089F',
'0xAc18cD55AeD57c428AA8E1A5e48E9eA519F8521b',
'0xc72c791379b34Fa8E6F1b1A3a331E9E53e5936FA',
'0x6c6BA887C0aC74ef569a60F7f0548E772C27e555',
'0x6Ae02cF06C0c1A629352EFB11F04C0f07532c6c3',
'0xfE6F84409bCBBD5d46B011CB5CE3c951dab21FAf',
'0x7b3834ecC528AD90E237f96Eb8949b883c5b5827',
'0xaA72F0afF492173A69c1799676613c60c1976836',
'0xD4B09839c5dccB6Aa70A9E7E008BeD6044268B4c',
'0x1354569E1B00EfF953c5dE255840e2BfDe569AA9',
'0xe5610E41AF0165e58cfc89089BDE0492c9aE59aB',
'0x11ECDb5C56574213370373Be392181A65842C788',
'0x9d7A4c91E55c9e869a23441C858375b0be9Cd443',
'0x72477A9Bba2e2f061564Ce6c0B443e1D12823468',
'0x396BCE39CfA2B5852F43F9dB10478f31CdFE8145',
'0xd26F458e3bc3FcEbB6D28091Ed0957893BB31365',
'0x549d9adAB004b68AE206dc2fD92a9d1D0600C4D8',
'0x2551698294dD39835fCb8f876C3B12A45ea1e0be',
'0xcE96b7C1cC69D3738eBFaDFbaEB7E07A4DFa62a3',
'0xc476f580a8f6259B0fa8AaBb9bEfcb5e1F349A8C',
'0xbC49b9126ffa0331669Ee5C921FC1398b38C8533',
'0xF695e84C720EA442B8D8399c7dd8Ea37D8d4057e',
'0xb2f66cC3FE269D1640cD13e2d029E9C7E714DF53',
'0x9C33b79D35c4f7ef3A6ca5944B5cAfC5d13bE99e',
'0x6E3F81aB7A6dA71b3F1aB435450A0deE42c3334C',
'0x149093aF758ae4F1F1Bf6947E6c4260D9620F795',
'0x9ECDA575de5EbA78291b867a253bD6FA2fDD1A71',
'0x2232c5E16b85Cd665FF48020A99A263F7EF6673e',
'0x0098cF22EEFE4B0D10428a31f3d187C2034b8247',
'0x1a3837204C923F42655916FB8CE1f3a0547DA1BE',
'0x13578d50497442a4f13A06fe8C0ea6C9Eda10CD3',
'0x567916B76e231b6c62de598DEdE55a70AD47c7C6',
'0x567916B76e231b6c62de598DEdE55a70AD47c7C6',
'0xA9C233652C2771Cd585cF52Df49f3558dc7fea96',
'0x81EdF748F49763f2EFd9E7B20285Af2D996281CB',
'0xE0A4a66aA9f3a43D8FbEC56F1fbcA6c581E3e9F7',
'0xE0A4a66aA9f3a43D8FbEC56F1fbcA6c581E3e9F7',
'0x439f1218E79C1031D5c03e24bc9A058EFaA6942b',
'0xB93723cff43513cBB98259BE71816DA78a8E6829',
'0x84B2F577fE10Fc87783410E8A1585Bf0288c19b9',
'0x13578d50497442a4f13A06fe8C0ea6C9Eda10CD3',
'0x891ba2f19E0bEB4F01C64F93288FF6320767d474',
'0x38802A1c483C03bc5f7f8BFe7d789c8f8CDE71c0',
'0x93AE8a68DD23204Ac9228181E7A32b7B5724CB44',
'0xB8E6A628Ce4665fD9DbC8eec4738Add7AbcD3e62',
'0xd22d7709A9408AD2E500be7B9E8d0261E6A43DAF',
'0x2Bd1b0Ef67bC54c43b8e016f91C4773BE5055477',
'0xD0e656167B3f09046adD1b4F3a509768B6f60a8e',
'0xE7957a2BB048b70aAcF8fc4beD2054F577303944',
'0xA53C8a9d694cE5818BE61251638D70c4B3cdCf82',
'0xbDDc25A7FDb37A29A19622836b6Eb226b194c27f',
'0x2Bd1b0Ef67bC54c43b8e016f91C4773BE5055477',
'0xaD04aA1c1d3F9E1eDCb702A29A5E489B17a80511',
'0x6c63F49cb4a6515299E4FeaE7ff9EbC09B6C003F',
'0xE2361921BD73b9E44C9c59fC52E39Bb0857d88bE',
'0xc2c37C43A05bC82c93E4362f922428c3Dc9cbb12',
'0x5d16fcB5C9E275a4A08E04D9ea86cFC252D90501',
'0xfaaa792cC23c330C010b149D4A1aCFDB778dccF2',
'0x5Eb986E625cD8C6eE88878FA3bB9736A616ae601',
'0xdd39bD37522D4f28D33AD48Bf7BB2324D3552BcE',
'0xf6f2Fa235028D7bF3D6EAa7AE33017f0D476cee8',
'0xFa1e6fA98FFa5c6Af77b80d33687c06B64d6586F',
'0xb6474E8d8dE26CA484114bcaD07E6Fa580Af0915',
'0x15Af569cccb1b5A79179444B17DC7f9F6D7f1deF',
'0x1D32eAE239583D7F00Ac524F6A8815449BEC6144',
'0x176E149eE80784140c662f2821c2E87588C65278',
'0x550fBCE25EcB8E2a7080B6261d7C656DE9116710',
'0x01484c4Dc4eE12067C3BE6DCcb918317aa2D348A',
'0xA2F677acD840aBA135E353Fe6dd3A3603DB80fff',
'0x8FD463BfaE6ebAc399cf3F7943665ABD5F63F18D',
'0xf281FEaEAa1C04Ea42068742300B6D9F9489EA47',
'0x094FD39027E535415A8326fd0413DDE83589Fa04',
'0xCFeafE1576287Fd50330bCd94d053C7f08ab1eAe',
'0x270b6a7B5626D7F6B0B74DC3b005DA1Fcd63b1A4',
'0xb9e7Cfa1200757634A7Ee766c60374f2324114Fb',
'0x9CA26730aa028D098C52C3974ab89eC81c74f56c',
'0xb6474E8d8dE26CA484114bcaD07E6Fa580Af0915',
'0xf6f2Fa235028D7bF3D6EAa7AE33017f0D476cee8',
'0xF5818498cb0b468Cc483C1502f68aE148Ff6AA7B',
'0x03Bcc401e9BC0a9196740B62800C51fF86e5A9b8',
'0x37B0c6f8Ac2b163f7EE9Dc78786b00Ea8dB8CED3',
'0x37B0c6f8Ac2b163f7EE9Dc78786b00Ea8dB8CED3',
'0xd4CBce6f073e5c7D047440aAC8936959281b94f9',
'0xd8b958F0B2989888cEA9fACA8Cd1B80cD816E128',
'0xb6474E8d8dE26CA484114bcaD07E6Fa580Af0915',
'0x1D32eAE239583D7F00Ac524F6A8815449BEC6144',
'0x1D32eAE239583D7F00Ac524F6A8815449BEC6144',
'0xd8b958F0B2989888cEA9fACA8Cd1B80cD816E128',
'0xc693c9A51BEeB287749d198b37622F521b89BA55',
'0x8cBeB7eFE1c83FE20eEA8dF781ec27411c858aAf',
'0x763e029942B63e20bb2eBfB50609FA5a0075E6d1',
'0x3559B7256E235109f7519b457060ED37106A91FB',
'0x3559B7256E235109f7519b457060ED37106A91FB',
'0xE06aADe298B61cBEDE387Eb9A56599f0DED08A60',
'0xb7e537484fB95a774CA80Be3d3C4c43464ebCE1c',
'0xb7e537484fB95a774CA80Be3d3C4c43464ebCE1c',
'0x447006b42F0d1022Fe2e98aF76e9EB5B9EB0B7F5',
'0x07fbF15579B407F3840b02483E71E3B1e2919Fe7',
'0x07fbF15579B407F3840b02483E71E3B1e2919Fe7',
'0x07fbF15579B407F3840b02483E71E3B1e2919Fe7',
'0x9ABF37e4E6af4BE05E73CB0E8e5D3232218c41EB',
'0xb2952147dfb18Bb64c208EA8bcFB198c34AbF694',
'0x37691942E5aEF724d1E347DB3E5561Ef341abF21',
'0xC5FbD8aab5735c76Ae64dB26e3CfD0D2155d0Fd0',
'0x549d9adAB004b68AE206dc2fD92a9d1D0600C4D8',
'0x37691942E5aEF724d1E347DB3E5561Ef341abF21',
'0x528e0e625fbB664d0698EC1E2717c50259D79075',
'0x9ABF37e4E6af4BE05E73CB0E8e5D3232218c41EB',
'0x37691942E5aEF724d1E347DB3E5561Ef341abF21',
'0x74f241e1c5115cd52cf73440f95ae606e2ba691b',
'0xfd329193577a8c92eb7c594789ad7100d54da0ff',
'0xe42de0976cfe7613db880f26de71098ed0532327',
'0x002323982137530bdea451cb2f43a3ad3fa66381',
'0x985e54ef31e5489a56d24f0698a2f2eebea1342b',
'0x8ba9eeb4008c8791f111e25bb5a671b530545faf',
'0x2e5107578cd2216fa55daa73e4afb2af8bf43a13',
'0xed4163b9d3a07b2cd5eae45bce4cf43e652c2a7c',
'0x8e7fef28b08e6845fbeabd972a3bd963939ab54a',
'0x987b648c4c8f95b5b284cae68d878fb6263f1cf6',
'0x0cf4348b61723baf30e2aae134acbd6651fc7a58',
'0xfa5f5ab5e3fe8149a33efdd1ed9dd9ab57ad7fe7',
'0x59cad9596dc8dc6b6dd2c7b44a31cd4d752d006c',
'0x08012695c747864155d8c5cda218073a1c87dcc2',
'0x55dd38d0e813cc816c8e029286fa3ab6db78c273',
'0xfe6f84409bcbbd5d46b011cb5ce3c951dab21faf',
'0xa445604eac40f3cd2c7b14819c7f67b02bbf6f76',
'0x58354dafaa2abf3687b2405bc8d09ec5c002ea5a',
'0x1834f5f53d86f2187e887c05250ec421a3f0e5c8',
'0x81c2be4602f6496198d5c566ef18e3479a7c6b88',
'0x4c1a93c5fb45b70d44a1e6640c87dc1e422312eb',
'0xd979d25fc986f00612dbaa24876a98841902d031',
'0x201992904b6dd0c691be271013228ba6241dfc8c',

];

// Google Sheets setup
const SHEET_ID = '1kzBTN0jFQkp7mS5VjBMdnKHYqOq3a1d_kxq72ObUjEw';
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
