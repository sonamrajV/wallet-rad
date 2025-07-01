// Wallet modal logic
const connectBtn = document.getElementById('connectWallet');
const walletModal = document.getElementById('walletModal');
const walletOptions = document.getElementById('walletOptions');
const closeWalletModal = document.getElementById('closeWalletModal');
const walletAddressDiv = document.getElementById('walletAddress');
const eligibilitySection = document.getElementById('eligibilitySection');
const eligibilityStatus = document.getElementById('eligibilityStatus');
const eligibilityDetails = document.getElementById('eligibilityDetails');
const suiAddressSection = document.getElementById('suiAddressSection');
const suiAddressDisplay = document.getElementById('suiAddressDisplay');
const editSuiButton = document.getElementById('editSuiButton');
const clearDataBtn = document.getElementById('clearData');

let connectedWallet = null;
let connectedWalletType = null;
let eligible = false;
let submittedSuiAddress = null;

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

// Wallet connection logic
async function connectWallet(type) {
  hideWalletModal();
  if (type === 'metamask') {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        connectedWallet = accounts[0];
        connectedWalletType = 'MetaMask';
        afterWalletConnected();
      } catch (err) {
        alert('MetaMask connection rejected.');
      }
    } else {
      alert('MetaMask not found.');
    }
  } else if (type === 'phantom') {
    if (window.solana && window.solana.isPhantom) {
      try {
        const resp = await window.solana.connect();
        connectedWallet = resp.publicKey.toString();
        connectedWalletType = 'Phantom';
        afterWalletConnected();
      } catch (err) {
        alert('Phantom connection rejected.');
      }
    } else {
      alert('Phantom not found.');
    }
  } else if (type === 'solflare') {
    if (window.solflare && window.solflare.isSolflare) {
      try {
        const resp = await window.solflare.connect();
        connectedWallet = resp.publicKey.toString();
        connectedWalletType = 'Solflare';
        afterWalletConnected();
      } catch (err) {
        alert('Solflare connection rejected.');
      }
    } else {
      alert('Solflare not found.');
    }
  }
}

function afterWalletConnected() {
  walletAddressDiv.innerHTML = `<span>Connected: <b>${connectedWallet}</b> (${connectedWalletType})</span>`;
  localStorage.setItem('ra_wallet', JSON.stringify({ address: connectedWallet, type: connectedWalletType }));
  checkEligibility();
}

// Eligibility check
async function checkEligibility() {
  eligibilitySection.style.display = 'block';
  eligibilityStatus.textContent = 'Checking eligibility...';
  eligibilityStatus.className = 'eligibility-status';
  eligibilityDetails.textContent = '';
  suiAddressSection.style.display = 'none';

  try {
    const res = await fetch('/check-eligibility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: connectedWallet })
    });
    const data = await res.json();
    eligible = data.eligible;
    if (eligible) {
      eligibilityStatus.textContent = '✅ You are eligible for the pre-sale!';
      eligibilityStatus.classList.add('eligible');
      eligibilityDetails.textContent = 'Please submit your $SUI address below.';
      checkPreviousSubmission();
    } else {
      eligibilityStatus.textContent = '❌ Sorry, this wallet is not eligible.';
      eligibilityStatus.classList.add('ineligible');
      eligibilityDetails.textContent = '';
    }
  } catch (err) {
    eligibilityStatus.textContent = 'Error checking eligibility.';
    eligibilityStatus.classList.add('ineligible');
  }
}

// Check for previous $SUI address submission
async function checkPreviousSubmission() {
  try {
    const res = await fetch(`/get-sui-address?address=${encodeURIComponent(connectedWallet)}`);
    const data = await res.json();
    if (data.suiAddress) {
      submittedSuiAddress = data.suiAddress;
      showSuiAddressSection();
    } else {
      showSuiAddressForm();
    }
  } catch (err) {
    showSuiAddressForm();
  }
}

function showSuiAddressSection() {
  suiAddressSection.style.display = 'block';
  suiAddressDisplay.textContent = submittedSuiAddress;
  editSuiButton.style.display = 'inline-block';
  editSuiButton.onclick = showSuiAddressForm;
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
      const res = await fetch('/submit-sui-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: connectedWallet, suiAddress: suiAddr })
      });
      const data = await res.json();
      if (data.success) {
        submittedSuiAddress = suiAddr;
        showSuiAddressSection();
      } else {
        alert(data.error || 'Submission failed.');
      }
    } catch (err) {
      alert('Error submitting address.');
    }
  };
  editSuiButton.style.display = 'none';
}

// Clear/reset all data
clearDataBtn.onclick = function() {
  localStorage.removeItem('ra_wallet');
  connectedWallet = null;
  connectedWalletType = null;
  eligible = false;
  submittedSuiAddress = null;
  walletAddressDiv.innerHTML = '';
  eligibilitySection.style.display = 'none';
  suiAddressSection.style.display = 'none';
};

// On load: restore wallet if present
window.onload = function() {
  const saved = localStorage.getItem('ra_wallet');
  if (saved) {
    try {
      const { address, type } = JSON.parse(saved);
      connectedWallet = address;
      connectedWalletType = type;
      walletAddressDiv.innerHTML = `<span>Connected: <b>${connectedWallet}</b> (${connectedWalletType})</span>`;
      checkEligibility();
    } catch {}
  }
}; 