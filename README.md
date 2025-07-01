# RadiantArena Token Pre Sale Wallet Checker

This project is a website where users can connect their crypto wallet (MetaMask or Phantom) to check if they are eligible for the RadiantArena token pre-sale. If eligible, they can submit their $SUI address. The backend saves all submissions.

## Features
- Connect with MetaMask (Ethereum) or Phantom (Solana)
- Check wallet eligibility for the pre-sale
- Submit $SUI address if eligible
- See your previous submission if you return
- Modern, responsive UI
- Node.js backend with CSV storage

## Project Structure
- `index.html` — Main web page
- `styles.css` — Styling
- `script.js` — Frontend logic
- `server.js` — Node.js backend
- `submissions.csv` — Stores submissions

## Setup Instructions

### 1. Install Dependencies
```
npm install express cors
```

### 2. Run the Server
```
node server.js
```
The server will start on [http://localhost:3000](http://localhost:3000)

### 3. Open the App
Open your browser and go to [http://localhost:3000](http://localhost:3000)

## Usage
1. Click "Connect Wallet" and connect MetaMask or Phantom.
2. If eligible, enter your $SUI address and submit.
3. If you return, your previous submission will be shown.

## Customizing Eligibility
- Edit the `eligibleAddresses` array in `server.js` to add or remove eligible wallet addresses.

## Troubleshooting
- **Wallet not detected:** Make sure MetaMask or Phantom is installed in your browser.
- **Eligibility issues:** Double-check your wallet address is in the eligible list in `server.js`.
- **Server errors:** Ensure Node.js is installed and you ran `npm install`.

## Security Note
- This project is for demonstration purposes. For production, use secure storage and authentication.

## License
MIT 