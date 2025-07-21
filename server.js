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
  // EVM addresses
 '0x37691942e5aef724d1e347db3e5561ef341abf21',
  '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad',
  '0x4fd36cd5b8279be990c5eddbad9ffd29b6489153',
  '0xbd8a52246bbcb7d9fffb3e00b9b49106e2fae193',
  '0xec16ffaff82292417468690450e182f9368f940a',
  '0x9ec5a0b3639893fccc16fb4f584636a1d1974f1b',
  '0xe7ee473ccb0e5c5b987f1d2b9a60e57977f3b54e',
  '0x990e5e85387f04354c90845c82a448478c166d17',
  '0x08fe1dfc1d828e7876efe199f8e7a3ab1fe679c3',
  '0x3e960e93b811d5f6727eebe48ea5bb6a73639306',
  '0x688608842c081d1959be15ad55e1a0d007e36ce1',
  '0x664d68c6e2133503ee9851b9c3124ee0de72a983',
  '0xe732b005eafbdaf739a41cfdb927efa33940d515',
  '0xacb3fc61950a0e94b6b15679acec54476a842127',
  '0x4d6007163c69d297e1f128911f9703fbc9744215',
  '0x1573f8860223d1398f1f9db0e4c2508d2d0bfd8f',
  '0xb74a9bd7f737c5850f1422a02a6811d6feef094e',
  '0x53c89ac5570f5935b0aa554297f32fa800167ccc',
  '0x4fe5d1321b98335d1bc1cf0216d2cdfbe14889e4',
  '0x2c2cb29a07f63c2ff1501e4a22353fdfa1715847',
  '0xbf398a90bbcf7257e17763d4a5b150f9730bbab6',
  '0xdf5bed67a35b9a43c5fe2a942fd3a165262cf39b',
  '0x9d62b68389f32e49dc46037d0552e60a839eb676',
  '0xda61f130fadbc186f60b6cc1c3169b34bc29879a',
  '0x87f37759590ad131b821b16008ea0b2cce7a154c',
  '0x8e6fdb36fd44841fb1d9854ca8c3538affc878bf',
  '0xfe6f84409bcbbd5d46b011cb5ce3c951dab21faf',
  '0x0eb16194c44beb262ae0a30c914b0de3cdf4f425',
  '0xd26f458e3bc3fcebb6d28091ed0957893bb31365',
  '0x396bce39cfa2b5852f43f9db10478f31cdfe8145',
  '0x72477a9bba2e2f061564ce6c0b443e1d12823468',
  '0x9d7a4c91e55c9e869a23441c858375b0be9cd443',
  '0x11ecdb5c56574213370373be392181a65842c788',
  '0xe5610e41af0165e58cfc89089bde0492c9ae59ab',
  '0x1354569e1b00eff953c5de255840e2bfde569aa9',
  '0xd4b09839c5dccb6aa70a9e7e008bed6044268b4c',
  '0xaa72f0aff492173a69c1799676613c60c1976836',
  '0x7b3834ecc528ad90e237f96eb8949b883c5b5827',
  '0x6ae02cf06c0c1a629352efb11f04c0f07532c6c3',
  '0x6c6ba887c0ac74ef569a60f7f0548e772c27e555',
  '0xc72c791379b34fa8e6f1b1a3a331e9e53e5936fa',
  '0xac18cd55aed57c428aa8e1a5e48e9ea519f8521b',
  '0xb591f385ac668c4511d528497f89ab86dbe1089f',
  '0x9c12fa2a9c347250de950d3bd321372e71e5912b',
  '0x1442533d5d865823fc294bf5c9028f667e67fd07',
  '0x5786ce6b967ad0f8d5f10fc517a09ffd483823b4',
  '0x1cad0dc90d8a415275132b5dfd50692723c912b5',
  '0xf67fc3f312460c8fb8d89a9edaf445a5c98bd01a',
  '0x636152068f656e4392d76b347e4b20bf3d70a897',
  '0x4a6c35ba87dca8a4767734435c8f4ed84b7be87c',
  '0x9abf37e4e6af4be05e73cb0e8e5d3232218c41eb',
  '0x528e0e625fbb664d0698ec1e2717c50259d79075',
  '0x549d9adab004b68ae206dc2fd92a9d1d0600c4d8',
  '0xc5fbd8aab5735c76ae64db26e3cfd0d2155d0fd0',
  '0xb2952147dfb18bb64c208ea8bcfb198c34abf694',
  '0x07fbf15579b407f3840b02483e71e3b1e2919fe7',
  '0x447006b42f0d1022fe2e98af76e9eb5b9eb0b7f5',
  '0xb7e537484fb95a774ca80be3d3c4c43464ebce1c',
  '0xe06aade298b61cbede387eb9a56599f0ded08a60',
  '0x3559b7256e235109f7519b457060ed37106a91fb',
  '0x763e029942b63e20bb2ebfb50609fa5a0075e6d1',
  '0x8cbeb7efe1c83fe20eea8df781ec27411c858aaf',
  '0xc693c9a51beeb287749d198b37622f521b89ba55',
  '0xd8b958f0b2989888cea9faca8cd1b80cd816e128',
  '0x1d32eae239583d7f00ac524f6a8815449bec6144',
  '0xb6474e8d8de26ca484114bcad07e6fa580af0915',
  '0xd4cbce6f073e5c7d047440aac8936959281b94f9',
  '0x37b0c6f8ac2b163f7ee9dc78786b00ea8db8ced3',
  '0x03bcc401e9bc0a9196740b62800c51ff86e5a9b8',
  '0xf5818498cb0b468cc483c1502f68ae148ff6aa7b',
  '0xf6f2fa235028d7bf3d6eaa7ae33017f0d476cee8',
  '0x9ca26730aa028d098c52c3974ab89ec81c74f56c',
  '0xb9e7cfa1200757634a7ee766c60374f2324114fb',
  '0x270b6a7b5626d7f6b0b74dc3b005da1fcd63b1a4',
  '0xcfeafe1576287fd50330bcd94d053c7f08ab1eae',
  '0x094fd39027e535415a8326fd0413dde83589fa04',
  '0xf281feaeaa1c04ea42068742300b6d9f9489ea47',
  '0x8fd463bfae6ebac399cf3f7943665abd5f63f18d',
  '0xa2f677acd840aba135e353fe6dd3a3603db80fff',
  '0x01484c4dc4ee12067c3be6dccb918317aa2d348a',
  '0x550fbce25ecb8e2a7080b6261d7c656de9116710',
  '0x176e149ee80784140c662f2821c2e87588c65278',
  '0x15af569cccb1b5a79179444b17dc7f9f6d7f1def',
  '0xfa1e6fa98ffa5c6af77b80d33687c06b64d6586f',
  '0xdd39bd37522d4f28d33ad48bf7bb2324d3552bce',
  '0x5eb986e625cd8c6ee88878fa3bb9736a616ae601',
  '0xfaaa792cc23c330c010b149d4a1acfdb778dccf2',
  '0x5d16fcb5c9e275a4a08e04d9ea86cfc252d90501',
  '0xc2c37c43a05bc82c93e4362f922428c3dc9cbb12',
  '0xe2361921bd73b9e44c9c59fc52e39bb0857d88be',
  '0x6c63f49cb4a6515299e4feae7ff9ebc09b6c003f',
  '0xad04aa1c1d3f9e1edcb702a29a5e489b17a80511',
  '0x2bd1b0ef67bc54c43b8e016f91c4773be5055477',
  '0xbddc25a7fdb37a29a19622836b6eb226b194c27f',
  '0xa53c8a9d694ce5818be61251638d70c4b3cdcf82',
  '0xe7957a2bb048b70aacf8fc4bed2054f577303944',
  '0xd0e656167b3f09046add1b4f3a509768b6f60a8e',
  '0xd22d7709a9408ad2e500be7b9e8d0261e6a43daf',
  '0xb8e6a628ce4665fd9dbc8eec4738add7abcd3e62',
  '0x93ae8a68dd23204ac9228181e7a32b7b5724cb44',
  '0x38802a1c483c03bc5f7f8bfe7d789c8f8cde71c0',
  '0x891ba2f19e0beb4f01c64f93288ff6320767d474',
  '0x13578d50497442a4f13a06fe8c0ea6c9eda10cd3',
  '0x84b2f577fe10fc87783410e8a1585bf0288c19b9',
  '0xb93723cff43513cbb98259be71816da78a8e6829',
  '0x439f1218e79c1031d5c03e24bc9a058efaa6942b',
  '0xe0a4a66aa9f3a43d8fbec56f1fbca6c581e3e9f7',
  '0x81edf748f49763f2efd9e7b20285af2d996281cb',
  '0xc125C7d8aa7D1fc07C2b77FaF57783946A3629F1',
  '0x8d6A382EDcBa35cddE8950EeF77d895F587CbdAa',
  '0x201992904b6dd0c691be271013228ba6241dfc8c',
  '0x680437a39635dbaa0bd18b8938e0ec23a76cacda',
  '0x44d614d082ae57b79cad478d06db8a5f9ccfb8e4',
  '0x0f34b83450fdec57b8b711ae1897772ae2f8bcd4',
  '0x204a6d8c14541b047a089a318ae471882f84d3c2',
  '0x1e4719f7536cc0fb7a245aaf3c8c2ddffa2552b3',
  '0xa8e410421aa140c9bc941a1c036e50eeac2a1540',
  '0xe797e155e15b301dc37075d5a4d674b5e289c0da',
  '0x5f7febc7dc972d2860b97f8006324366e23ebb63',
  '0xf0243db57b4f55324fce20c105d88cb47a5d09b2',
  '0x81f92817cda2762606217243de6d2cccede7e878',
  '0x71a9f041c2a2b9ce83a1b021558e8bc29d69db42',
  '0x390bc485b9c6d3fe1224ecb5b32b1f08a1fc02b5',
  '0x773996c6beee0c4da3ed398a7dfc7a97ef76da68',
  '0xcf153765a76b9329e861ab2a52153a7664520019',
  // Solana addresses
  '8EUa5n6HeuKuh9UFJPjnuWLqu1434gCERFaxpmwNiR7X',
  'trcLtquZ9FQaZ5epGmd9KxYbDmjLugRaGnLpYKe2xsC',
  'EwA9Aw1L6vsqfPN2oQZZ4BK3TDt3zYE6i5s3LhRS1XRa',
  '3NNnCHVXrv8aDKZEm2zwBkDJjMV5dbZjFY1AxWr7BXWK',
  'GEymqrAT3e8krMiUCQwBoqoVjrE8P2UT3XeQFgtXhyqD',
  '73b56qAwbCDZ6xK6txT4AYSEcjgKa7nE7dkZeJa3H53P',
  '6Arc5SE7T2mzX2Z84TbvEyaS1nfiBsX2quW4DCMniE9R',
  'GQaKnUXsuBFvxkGqGRFjq24TkCCT1jCwRavxHj1zSMEa',
  '3puphRzqgympRhzr2RA8W7c3HZSnEp1zMFn6wvv4h9P5',
  '8YgwczhwwDAEzZg6KkRnW3aP99mMJ4N424e1pJ3AgmZq',
  'Hp6Qyx3K9McpE1w2V7LbNU1NpwjwpqRiiggrcveNrtHF',
  '4r7KKCdZ89CYQ2FTB1P1RDEHVQuGWyzNE4x8drPC2uvR',
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
