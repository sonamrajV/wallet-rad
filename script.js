// Firebase configuration
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// DOM elements
const connectBtn = document.getElementById('connectWallet');
const walletModal = document.getElementById('walletModal');
const walletOptions = document.getElementById('walletOptions');
const closeWalletModal = document.getElementById('closeWalletModal');
const walletAddressDiv = document.getElementById('walletAddress');
const walletStatusSection = document.getElementById('walletStatusSection');
const evmWalletStatus = document.getElementById('evmWalletStatus');
const solanaWalletStatus = document.getElementById('solanaWalletStatus');
const signMessageBtn = document.getElementById('signMessageBtn');
const eligibilitySection = document.getElementById('eligibilitySection');
const eligibilityStatus = document.getElementById('eligibilityStatus');
const eligibilityDetails = document.getElementById('eligibilityDetails');
const suiAddressSection = document.getElementById('suiAddressSection');
const suiAddressDisplay = document.getElementById('suiAddressDisplay');
const editSuiButton = document.getElementById('editSuiButton');
const signatureSection = document.getElementById('signatureSection');
const signatureStatus = document.getElementById('signatureStatus');
const clearDataBtn = document.getElementById('clearData');

// State variables
let connectedEVMWallet = null;
let connectedSolanaWallet = null;
let walletSignature = null;
let eligible = false;
let submittedSuiAddress = null;
let isAuthenticated = false;

const WALLET_TYPES = [
  { name: 'MetaMask', id: 'metamask', icon: '🦊' },
  { name: 'Phantom', id: 'phantom', icon: '👻' },
  { name: 'Solflare', id: 'solflare', icon: '🔥' },
];

function showWalletModal() {
  walletOptions.innerHTML = '';
  WALLET_TYPES.forEach(w => {
    const btn = document.createElement('button');
    btn.className = 'wallet-option-btn';
    btn.innerHTML = `${w.icon} ${w.name}`;
    btn.onclick = () => connectWallet(w.id);
    walletOptions.appendChild(btn);
  });
  walletModal.style.display = 'flex';
}
function hideWalletModal() {
  walletModal.style.display = 'none';
}
connectBtn.onclick = showWalletModal;
closeWalletModal.onclick = hideWalletModal;

// Wallet connection logic with wagmi and Phantom
async function connectWallet(type) {
  hideWalletModal();
  
  if (type === 'metamask') {
    // Connect MetaMask using wagmi
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        connectedEVMWallet = accounts[0];
        updateWalletStatus();
        checkEligibility();
      } catch (err) {
        alert('MetaMask connection rejected.');
      }
    } else {
      alert('MetaMask not found. Please install MetaMask extension.');
    }
  } else if (type === 'phantom') {
    // Connect Phantom for Solana
    if (window.solana && window.solana.isPhantom) {
      try {
        const resp = await window.solana.connect();
        connectedSolanaWallet = resp.publicKey.toString();
        updateWalletStatus();
        checkEligibility();
      } catch (err) {
        alert('Phantom connection rejected.');
      }
    } else {
      alert('Phantom not found. Please install Phantom extension.');
    }
  }
}

function updateWalletStatus() {
  walletStatusSection.style.display = 'block';
  
  if (connectedEVMWallet) {
    evmWalletStatus.innerHTML = `<span>✅ EVM: <b>${connectedEVMWallet}</b> (MetaMask)</span>`;
  } else {
    evmWalletStatus.innerHTML = `<span>❌ EVM: Not connected</span>`;
  }
  
  if (connectedSolanaWallet) {
    solanaWalletStatus.innerHTML = `<span>✅ Solana: <b>${connectedSolanaWallet}</b> (Phantom)</span>`;
  } else {
    solanaWalletStatus.innerHTML = `<span>❌ Solana: Not connected</span>`;
  }
  
  // Only check eligibility if a wallet is connected
  if (connectedEVMWallet || connectedSolanaWallet) {
    checkEligibility();
  } else {
    eligibilitySection.style.display = 'block';
    eligibilityStatus.textContent = 'Please connect a wallet to check eligibility.';
    eligibilityStatus.className = 'eligibility-status';
    eligibilityDetails.textContent = '';
    signatureSection.style.display = 'none';
    suiAddressSection.style.display = 'none';
  }
}

// Wallet signature authentication
async function signMessage() {
  signatureSection.style.display = 'block';
  signatureStatus.textContent = 'Signing message...';
  
  try {
    let signature = null;
    let message = `RadiantArena Token Pre Sale Verification\nTimestamp: ${Date.now()}`;
    
    if (connectedEVMWallet) {
      // Sign with MetaMask
      signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, connectedEVMWallet]
      });
    } else if (connectedSolanaWallet) {
      // Sign with Phantom
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await window.solana.signMessage(encodedMessage, 'utf8');
      signature = bs58.encode(signedMessage.signature);
    }
    
    if (signature) {
      walletSignature = signature;
      signatureStatus.textContent = '✅ Message signed successfully!';
      signatureStatus.className = 'signature-status success';
      isAuthenticated = true;
      checkPreviousSubmission();
    }
  } catch (err) {
    console.error('Error signing message:', err);
    signatureStatus.textContent = '❌ Failed to sign message.';
    signatureStatus.className = 'signature-status error';
  }
}

// Eligibility check
async function checkEligibility() {
  eligibilitySection.style.display = 'block';
  eligibilityStatus.textContent = 'Checking eligibility...';
  eligibilityStatus.className = 'eligibility-status';
  eligibilityDetails.textContent = '';
  suiAddressSection.style.display = 'none';
  signatureSection.style.display = 'none';

  const addressToCheck = connectedEVMWallet || connectedSolanaWallet;
  if (!addressToCheck) {
    eligibilityStatus.textContent = 'Please connect a wallet to check eligibility.';
    eligibilityStatus.className = 'eligibility-status';
    eligibilityDetails.textContent = '';
    return;
  }

  try {
    const res = await fetch('/check-eligibility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: addressToCheck })
    });
    const data = await res.json();
    eligible = data.eligible;
    if (eligible) {
      eligibilityStatus.textContent = '✅ You are eligible for the pre-sale!';
      eligibilityStatus.classList.add('eligible');
      eligibilityDetails.textContent = 'Please sign a message to verify your wallet and submit your $SUI address.';
      signatureSection.style.display = 'block';
      signMessageBtn.style.display = 'inline-block';
      signatureStatus.textContent = 'Please sign a message to verify your wallet.';
    } else {
      eligibilityStatus.textContent = '❌ Sorry, this wallet is not eligible.';
      eligibilityStatus.classList.add('ineligible');
      eligibilityDetails.textContent = '';
      signatureSection.style.display = 'none';
      signMessageBtn.style.display = 'none';
      suiAddressSection.style.display = 'none';
    }
  } catch (err) {
    console.error('Error checking eligibility:', err);
    eligibilityStatus.textContent = 'Error checking eligibility. Please try again later.';
    eligibilityStatus.classList.add('ineligible');
    eligibilityDetails.textContent = '';
    signatureSection.style.display = 'none';
    signMessageBtn.style.display = 'none';
    suiAddressSection.style.display = 'none';
  }
}

// Check for previous $SUI address submission from Firebase
async function checkPreviousSubmission() {
  if (!isAuthenticated) {
    signatureStatus.textContent = 'Please sign a message first to verify your wallet.';
    return;
  }
  
  try {
    const address = connectedEVMWallet || connectedSolanaWallet;
    const userDoc = await db.collection('users').doc(address).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      submittedSuiAddress = userData.suiAddress;
      showSuiAddressSection();
    } else {
      showSuiAddressForm();
    }
  } catch (err) {
    console.error('Error checking previous submission:', err);
    showSuiAddressForm();
  }
}

function showSuiAddressSection() {
  suiAddressSection.style.display = 'block';
  suiAddressSection.innerHTML = `
    <h2>💰 Previously Submitted $SUI Address</h2>
    <div class="flex items-center justify-between gap-4">
      <div class="sui-address-display">${submittedSuiAddress}</div>
      <button id="editSuiButton" class="wallet-button edit ml-4">Update $SUI Address</button>
    </div>
    <div class="success-message">✅ Submitted successfully!</div>
  `;
  document.getElementById('editSuiButton').onclick = showSuiAddressForm;
}

function showSuiAddressForm() {
  suiAddressSection.style.display = 'block';
  suiAddressSection.innerHTML = `
    <h2>💰 Submit Your $SUI Address</h2>
    <form id="suiForm" class="flex flex-col gap-3 items-center mt-2">
      <input type="text" id="suiInput" placeholder="$SUI Address" class="rounded-lg px-4 py-2 w-full max-w-xs text-black" required value="${submittedSuiAddress || ''}">
      <button type="submit" class="wallet-button connect">Submit</button>
    </form>
  `;
  
  document.getElementById('suiForm').onsubmit = async function(e) {
    e.preventDefault();
    const suiAddr = document.getElementById('suiInput').value.trim();
    if (!suiAddr) return;
    
    try {
      const address = connectedEVMWallet || connectedSolanaWallet;
      
      // Save to Firebase
      await db.collection('users').doc(address).set({
        evmAddress: connectedEVMWallet || null,
        solanaAddress: connectedSolanaWallet || null,
        suiAddress: suiAddr,
        signature: walletSignature,
        timestamp: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      submittedSuiAddress = suiAddr;
      showSuiAddressSection();
    } catch (err) {
      console.error('Error submitting address:', err);
      suiAddressSection.innerHTML += '<div class="error-message">❌ Error submitting address. Please try again.</div>';
    }
  };
}

// Event listeners
signMessageBtn.addEventListener('click', signMessage);

// Clear/reset all data
clearDataBtn.onclick = function() {
  connectedEVMWallet = null;
  connectedSolanaWallet = null;
  walletSignature = null;
  eligible = false;
  submittedSuiAddress = null;
  isAuthenticated = false;
  
  walletAddressDiv.innerHTML = '';
  walletStatusSection.style.display = 'none';
  eligibilitySection.style.display = 'none';
  suiAddressSection.style.display = 'none';
  signatureSection.style.display = 'none';
  
  // Clear localStorage
  localStorage.removeItem('ra_evm_wallet');
  localStorage.removeItem('ra_solana_wallet');
};

// On load: restore wallets if present
window.onload = function() {
  const savedEVM = localStorage.getItem('ra_evm_wallet');
  const savedSolana = localStorage.getItem('ra_solana_wallet');
  
  if (savedEVM) {
    try {
      connectedEVMWallet = JSON.parse(savedEVM);
    } catch {}
  }
  
  if (savedSolana) {
    try {
      connectedSolanaWallet = JSON.parse(savedSolana);
    } catch {}
  }
  
  if (connectedEVMWallet || connectedSolanaWallet) {
    updateWalletStatus();
    checkEligibility();
  }
}; 