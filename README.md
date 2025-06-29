# 🚀 RadiantArena Token Pre Sale Wallet Checker

A web application for checking wallet eligibility and collecting $SUI wallet addresses for the RadiantArena token pre-sale.

## 🛠️ Setup & Installation

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start the Server:**
   ```bash
   node server.js
   ```
   
   You should see:
   ```
   🚀 RadiantArena Server running on http://localhost:3000
   📝 Submissions will be saved to submissions.csv
   ✅ Server is ready to handle requests
   ```

## 🌐 Accessing the Application

**IMPORTANT:** To avoid server connection errors, access the application through the server URL:

### ✅ Correct Way:
1. Start the server: `node server.js`
2. Open your browser and go to: **http://localhost:3000**
3. The application will load and work correctly

### ❌ Wrong Way:
- Don't open `index.html` directly as a file (file:// protocol)
- This will cause "Could not connect to the server" errors

## 🔧 Features

- **MetaMask Wallet Connection**: Connect your MetaMask wallet
- **Eligibility Checking**: Check if your wallet is eligible for the RadiantArena pre-sale
- **$SUI Address Submission**: Submit your $SUI wallet address
- **Address Persistence**: Previously submitted addresses are saved and can be edited
- **Clean UI**: Modern, responsive design with yellowish background theme

## 📋 Eligible Addresses

The following addresses are eligible for testing:
- `0x1234567890abcdef1234567890abcdef12345678`
- `0x201992904b6dd0c691be271013228ba6241dfc8c`
- `0x3b994b7C1A7cb446AAbBFa4292f540A07141b318`
- `0x0e61bAbf5398d41339Be5f6dD2bf34045Ab54EaE`
- `0x0517eabe74fbcc53d798fcdb63004d20bc6fa0de`
- `0x94b514f2db06724c03701f2e175fc3f3460cc460`
- `0x9E039b1479de2F332D83ED812b117265f9Ad1212`
- `0xE529b5634590989eBc83078f172D816ccE217162`

## 🐛 Troubleshooting

### Server Connection Error
If you see "Could not connect to the server":

1. **Make sure the server is running:**
   ```bash
   node server.js
   ```

2. **Access via correct URL:**
   - Use: `http://localhost:3000`
   - Don't open `index.html` directly

3. **Check browser console:**
   - Press F12 to open developer tools
   - Look for error messages in the Console tab

### MetaMask Not Installed
- Install MetaMask browser extension
- Make sure you're on a supported network

## 📁 Files

- `index.html` - Main application interface
- `script.js` - Frontend JavaScript logic
- `styles.css` - Application styling
- `server.js` - Backend server
- `submissions.csv` - Submitted addresses (created automatically)

## 🔒 Security Notes

- This is a development version
- In production, use environment variables for sensitive data
- Consider using a database instead of CSV files for submissions 