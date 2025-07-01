const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Hardcoded eligible addresses (lowercase for Ethereum, base58 for Phantom)
const eligibleAddresses = [
  '0x1234567890abcdef1234567890abcdef12345678',
  '0x201992904b6dd0c691be271013228ba6241dfc8c',
  '0x3b994b7c1a7cb446aabbfa4292f540a07141b318',
  '0x0e61babf5398d41339be5f6dd2bf34045ab54eae',
  '0x0517eabe74fbcc53d798fcdb63004d20bc6fa0de',
  '0x94b514f2db06724c03701f2e175fc3f3460cc460',
  '0x9e039b1479de2f332d83ed812b117265f9ad1212',
  '0xe529b5634590989ebc83078f172d816cce217162',
  '8sPpz4zmSBcettu3yKHRJTkGvXLmVrKmoiVytBJzuQhw'

];

const submissionsFile = path.join(__dirname, 'submissions.csv');

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Utility: Load submissions
function loadSubmissions() {
  if (!fs.existsSync(submissionsFile)) return {};
  const lines = fs.readFileSync(submissionsFile, 'utf8').split('\n').filter(Boolean);
  const map = {};
  for (const line of lines) {
    const [wallet, suiAddress] = line.split(',');
    map[wallet] = suiAddress;
  }
  return map;
}

// Utility: Save submission
function saveSubmission(wallet, suiAddress) {
  fs.appendFileSync(submissionsFile, `${wallet},${suiAddress}\n`);
}

// Health check endpoint for testing
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API: Check eligibility (POST) - matches frontend
app.post('/check-eligibility', (req, res) => {
  const address = (req.body.address || '').toLowerCase();
  const eligible = eligibleAddresses.map(a => a.toLowerCase()).includes(address);
  res.json({ eligible });
});

// API: Get previous $SUI address submission
app.get('/get-sui-address', (req, res) => {
  const address = (req.query.address || '').toLowerCase();
  const submissions = loadSubmissions();
  res.json({ suiAddress: submissions[address] || null });
});

// API: Submit $SUI address - matches frontend
app.post('/submit-sui-address', (req, res) => {
  const { wallet, suiAddress } = req.body;
  if (!wallet || !suiAddress) return res.json({ success: false, error: 'Missing data.' });
  const address = wallet.toLowerCase();
  const eligible = eligibleAddresses.map(a => a.toLowerCase()).includes(address);
  if (!eligible) return res.json({ success: false, error: 'Wallet not eligible.' });
  const submissions = loadSubmissions();
  if (submissions[address]) return res.json({ success: false, error: 'Already submitted.' });
  saveSubmission(address, suiAddress);
  res.json({ success: true });
});

// Serve index.html for all other routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 