document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const connectWalletBtn = document.getElementById('connectWallet');
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
  const clearButton = document.getElementById('clearData');

  // Wallet status bar (top right)
  const walletAddressTop = document.getElementById('walletAddressTop');
  const walletStatusBar = document.getElementById('walletStatusBar');
  const disconnectWalletBtn = document.getElementById('disconnectWallet');
  if (walletStatusBar) walletStatusBar.style.display = 'none';

  function updateWalletStatusBar(address) {
    if (walletStatusBar && walletAddressTop) {
      if (address) {
        // Shorten the address for display: 0x94b5......c460
        let shortAddr = address;
        if (address.length > 12) {
          shortAddr = address.slice(0, 6) + '......' + address.slice(-4);
        }
        walletAddressTop.textContent = shortAddr;
        walletStatusBar.style.display = 'flex';
      } else {
        walletAddressTop.textContent = '';
        walletStatusBar.style.display = 'none';
      }
    }
  }

  if (disconnectWalletBtn) {
    disconnectWalletBtn.addEventListener('click', () => {
      localStorage.removeItem('walletAddress');
      localStorage.removeItem('walletType');
      localStorage.removeItem('suiAddressSubmitted');
      localStorage.removeItem('suiAddress');
      window.location.reload();
    });
  }

  // Create scattered $RAD background elements
  createRadBackground();

  // Check for saved state on page load
  const savedWalletAddress = localStorage.getItem('walletAddress');
  const savedWalletType = localStorage.getItem('walletType');
  const savedSuiAddress = localStorage.getItem('suiAddress');
  const suiSubmitted = localStorage.getItem('suiAddressSubmitted');

  if (savedWalletAddress) {
    walletAddressDiv.textContent = `Connected: ${savedWalletAddress}`;
    connectWalletBtn.textContent = 'Connected';
    connectWalletBtn.disabled = true;
    updateWalletStatusBar(savedWalletAddress);
    // Always show previously submitted Sui address if it exists
    if (savedSuiAddress && suiSubmitted === 'true') {
      showPreviouslySubmittedSui(savedSuiAddress);
    } else {
      checkServerForSubmission(savedWalletAddress);
    }
  } else {
    updateWalletStatusBar('');
  }

  // Wallet detection and connection logic
  const WALLET_PROVIDERS = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: 'https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg',
      detect: () => window.ethereum && window.ethereum.isMetaMask,
      type: 'evm',
    },
    {
      id: 'phantom-sol',
      name: 'Phantom (Solana)',
      icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Phantom.png',
      detect: () => window.solana && window.solana.isPhantom,
      type: 'solana',
    },
    {
      id: 'solflare',
      name: 'Solflare',
      icon: 'https://solflare.com/favicon.ico',
      detect: () => window.solflare && window.solflare.isSolflare,
      type: 'solana',
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: 'https://avatars.githubusercontent.com/u/1885080?s=200&v=4',
      detect: () => window.ethereum && window.ethereum.isCoinbaseWallet,
      type: 'evm',
    },
    {
      id: 'brave',
      name: 'Brave Wallet',
      icon: 'https://brave.com/static-assets/images/brave-logo.svg',
      detect: () => window.ethereum && window.ethereum.isBraveWallet,
      type: 'evm',
    },
    {
      id: 'trust',
      name: 'Trust Wallet',
      icon: 'https://trustwallet.com/assets/images/media/assets/logo.png',
      detect: () => window.ethereum && window.ethereum.isTrust,
      type: 'evm',
    },
    // Add more EVM/Solana wallets as needed
  ];

  function createRadBackground() {
    const background = document.getElementById('radBackground');
    const numElements = 15;
    
    for (let i = 0; i < numElements; i++) {
      const element = document.createElement('div');
      element.className = 'rad-element';
      element.textContent = '$RAD';
      element.style.left = Math.random() * 100 + '%';
      element.style.top = Math.random() * 100 + '%';
      element.style.animationDelay = Math.random() * 6 + 's';
      element.style.animationDuration = (4 + Math.random() * 4) + 's';
      background.appendChild(element);
    }
  }

  function getDetectedWallets() {
    const detected = [];
    WALLET_PROVIDERS.forEach(w => {
      if (w.detect()) detected.push(w);
    });
    // If Phantom EVM is not detected but window.ethereum exists, add a fallback option with the same name
    if (!detected.some(w => w.id === 'phantom-evm') && window.ethereum) {
      detected.push({
        id: 'phantom-evm-forced',
        name: 'Phantom (EVM)',
        icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Phantom.png',
        type: 'evm',
        forced: true
      });
    }
    return detected;
  }

  function showWalletModal() {
    walletOptions.innerHTML = '';
    const detected = getDetectedWallets();
    if (detected.length === 0) {
      walletOptions.innerHTML = '<p>No supported wallets detected. Please install MetaMask, Phantom, Solflare, or another supported wallet.</p>';
    } else {
      detected.forEach(wallet => {
        const btn = document.createElement('button');
        btn.className = 'wallet-option-btn';
        btn.innerHTML = `<img src="${wallet.icon}" class="wallet-option-icon" alt="${wallet.name}"><span>${wallet.name}</span>`;
        btn.onclick = () => connectToWallet(wallet);
        walletOptions.appendChild(btn);
      });
    }
    walletModal.style.display = 'flex';
  }

  function hideWalletModal() {
    walletModal.style.display = 'none';
  }

  connectWalletBtn.addEventListener('click', showWalletModal);
  closeWalletModal.addEventListener('click', hideWalletModal);

  async function connectToWallet(wallet) {
    hideWalletModal();
    let address = '';
    let type = wallet.type;
    try {
      if (wallet.id === 'phantom-evm') {
        // Phantom EVM connect
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        address = accounts[0];
      } else if (wallet.id === 'phantom-evm-forced') {
        // Force connect to EVM and check if provider is Phantom after connect
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        address = accounts[0];
        // After connect, check if provider is Phantom
        if (!(window.ethereum.isPhantom || (window.ethereum.providers && window.ethereum.providers.some(p => p.isPhantom)))) {
          walletAddressDiv.textContent = 'Phantom EVM not detected after connect.';
          return;
        }
      } else if (wallet.id === 'phantom-sol') {
        // Phantom Solana connect
        const resp = await window.solana.connect();
        address = resp.publicKey ? resp.publicKey.toString() : '';
      } else if (wallet.type === 'evm') {
        // Other EVM wallet connect
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        address = accounts[0];
      } else if (wallet.type === 'solana') {
        // Other Solana wallet connect
        const resp = await window[wallet.id].connect();
        address = resp.publicKey ? resp.publicKey.toString() : '';
      }
      if (address) {
        localStorage.setItem('walletAddress', address);
        localStorage.setItem('walletType', type);
        walletAddressDiv.textContent = `Connected (${wallet.name}): ${address}`;
        connectWalletBtn.textContent = 'Connected';
        connectWalletBtn.disabled = true;
        updateWalletStatusBar(address);
        onWalletConnected(address, type);
      }
    } catch (err) {
      walletAddressDiv.textContent = 'Connection failed or denied.';
    }
  }

  function onWalletConnected(address, type) {
    // Use the same logic as before, but with the new address and type
    // Always show previously submitted Sui address if it exists
    const savedSuiAddress = localStorage.getItem('suiAddress');
    const suiSubmitted = localStorage.getItem('suiAddressSubmitted');
    if (savedSuiAddress && suiSubmitted === 'true') {
      showPreviouslySubmittedSui(savedSuiAddress);
    } else {
      checkServerForSubmission(address);
    }
  }

  // Track if the submission is from an edit
  let isEditSubmission = false;

  // Update all eligibility and submission logic to use walletAddress
  async function checkEligibility(walletAddress) {
    const eligibilityHeader = document.getElementById('eligibilityHeader');
    if (eligibilityHeader) eligibilityHeader.style.display = '';
    eligibilitySection.style.display = 'block';
    eligibilityStatus.textContent = '🔍 Checking eligibility...';
    eligibilityDetails.innerHTML = '';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch('/check-eligibility', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ metamaskAddress: walletAddress }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      eligibilityStatus.textContent = result.message;

      if (result.eligible) {
        eligibilityStatus.className = 'eligibility-status eligible';
        eligibilityDetails.innerHTML = `
          <p>Your wallet is eligible! Please sign a message to verify ownership.</p>
          <button id="signMessageButton" class="wallet-button connect">Sign to Verify Address</button>
        `;
        document.getElementById('signMessageButton').addEventListener('click', () => signMessage(walletAddress));
      } else {
        showNotEligible();
      }
    } catch (error) {
      console.error('Eligibility check error:', error);
      eligibilityStatus.textContent = '❌ Server Error';
      eligibilityStatus.className = 'eligibility-status not-eligible';
      eligibilityDetails.innerHTML = `<p>Could not connect to the server. Please try again later.<br><strong>Error details:</strong> ${error.message}</p>`;
    }
  }

  async function signMessage(account) {
    try {
      const message = "I am verifying my address to confirm eligibility for the RadiantArena pre sale.";
      if (localStorage.getItem('walletType') === 'evm') {
        await window.ethereum.request({ method: 'personal_sign', params: [message, account] });
      } else if (localStorage.getItem('walletType') === 'solana') {
        await window.solana.signMessage(new TextEncoder().encode(message), 'utf8');
      }
      showSuiSubmissionForm(account);
    } catch (error) {
      eligibilityDetails.innerHTML += `<p style="color: red; margin-top: 1rem;"><strong>Signature failed or was rejected.</strong> Please try again.</p>`;
    }
  }

  function showSuiSubmissionForm(walletAddress) {
    // Hide eligibility header if returning user or editing
    const eligibilityHeader = document.getElementById('eligibilityHeader');
    if (eligibilityHeader) eligibilityHeader.style.display = 'none';
    eligibilityStatus.textContent = '✅ Verification Successful!';
    eligibilityDetails.innerHTML = `
      <p>Please submit your $SUI wallet address to finalize your RadiantArena pre sale entry.</p>
      <div class="input-group">
        <input type="text" id="suiAddressInput" placeholder="Enter your $SUI wallet address">
        <button id="submitSuiButton" class="wallet-button sui" disabled>Submit Address</button>
        <div id="suiAddressError" style="color: red; font-size: 0.9rem; margin-top: 0.5rem;"></div>
      </div>
      <div id="submissionStatus"></div>
    `;
    const suiAddressInput = document.getElementById('suiAddressInput');
    const submitSuiButton = document.getElementById('submitSuiButton');
    const suiAddressError = document.getElementById('suiAddressError');
    // Validation logic
    suiAddressInput.addEventListener('input', () => {
      const value = suiAddressInput.value.trim();
      if (!value.startsWith('0x') || value.length !== 66) {
        suiAddressInput.style.borderColor = 'red';
        suiAddressError.textContent = 'SUI address must start with 0x and be exactly 66 characters.';
        submitSuiButton.disabled = true;
      } else {
        suiAddressInput.style.borderColor = 'green';
        suiAddressError.textContent = '';
        submitSuiButton.disabled = false;
      }
    });
    submitSuiButton.addEventListener('click', () => submitSuiAddress(walletAddress));
  }

  async function submitSuiAddress(walletAddress) {
    const suiAddressInput = document.getElementById('suiAddressInput');
    const suiAddress = suiAddressInput.value.trim();
    const submissionStatus = document.getElementById('submissionStatus');
    if (!suiAddress.startsWith('0x') || suiAddress.length !== 66) {
      submissionStatus.textContent = 'Please enter a valid $SUI address.';
      submissionStatus.style.color = 'red';
      return;
    }
    suiAddressInput.disabled = true;
    document.getElementById('submitSuiButton').disabled = true;
    submissionStatus.textContent = 'Submitting...';
    try {
      // Save to server as before
      const response = await fetch('/submit-sui-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ metamaskAddress: walletAddress, suiAddress })
      });
      if (response.ok) {
        localStorage.setItem('suiAddressSubmitted', 'true');
        localStorage.setItem('suiAddress', suiAddress);
        showSubmissionComplete();
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      submissionStatus.innerHTML = `<p style=\"color: red;\">Submission failed. Please try again.</p><p>Error: ${error.message}</p>`;
      suiAddressInput.disabled = false;
      document.getElementById('submitSuiButton').disabled = false;
    }
  }

  // --- Edit Flow ---
  if (editSuiButton) {
    editSuiButton.addEventListener('click', () => {
      isEditSubmission = true;
      suiAddressSection.style.display = 'none';
      eligibilitySection.style.display = 'block';
      eligibilityStatus.textContent = 'Edit $SUI Address';
      eligibilityDetails.innerHTML = `
        <button id="signToEditButton" class="wallet-button connect">Sign to edit</button>
        <div id="editSignStatus"></div>
      `;
      document.getElementById('signToEditButton').onclick = async () => {
        const walletAddress = localStorage.getItem('walletAddress');
        const message = "I am verifying for SUI submission on Radiant Arena.";
        try {
          if (localStorage.getItem('walletType') === 'evm') {
            await window.ethereum.request({ method: 'personal_sign', params: [message, walletAddress] });
          } else if (localStorage.getItem('walletType') === 'solana') {
            await window.solana.signMessage(new TextEncoder().encode(message), 'utf8');
          }
          showSuiSubmissionForm(walletAddress);
        } catch (error) {
          document.getElementById('editSignStatus').innerHTML = `<p style='color:red;'>Signature failed or was rejected. Please try again.</p>`;
        }
      };
    });
  }

  // --- Info Message and Social Icons ---
  function showPreviouslySubmittedSui(suiAddress) {
    // Hide eligibility header for returning users
    const eligibilityHeader = document.getElementById('eligibilityHeader');
    if (eligibilityHeader) eligibilityHeader.style.display = 'none';
    suiAddressSection.style.display = 'block';
    suiAddressDisplay.innerHTML = `
      <div class="sui-address-info">
        <strong>Submitted $SUI Address:</strong><br>
        <span style="font-family: monospace; font-size: 0.9rem; color: #333; word-break: break-all;">${suiAddress}</span>
      </div>
      <button id="editSuiButton" class="wallet-button edit small-edit-btn">Edit $SUI Address</button>
      <p style="margin-top: 1rem; font-size: 0.9rem; color: #666;">
        ✅ Your $SUI address has been successfully submitted and recorded.
      </p>
      <div style="margin-top: 1.5rem; font-size: 1rem; color: #333;">
        Your tokens will be sent to the $SUI wallet address within one week of the TGE. For any questions follow our socials.
      </div>
    `;
    // Re-attach the event listener for the new button
    const editBtn = document.getElementById('editSuiButton');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        isEditSubmission = true;
        suiAddressSection.style.display = 'none';
        eligibilitySection.style.display = 'block';
        eligibilityStatus.textContent = 'Edit $SUI Address';
        eligibilityDetails.innerHTML = `
          <button id="signToEditButton" class="wallet-button connect">Sign to edit</button>
          <div id="editSignStatus"></div>
        `;
        document.getElementById('signToEditButton').onclick = async () => {
          const walletAddress = localStorage.getItem('walletAddress');
          const message = "I am verifying for SUI submission on Radiant Arena.";
          try {
            if (localStorage.getItem('walletType') === 'evm') {
              await window.ethereum.request({ method: 'personal_sign', params: [message, walletAddress] });
            } else if (localStorage.getItem('walletType') === 'solana') {
              await window.solana.signMessage(new TextEncoder().encode(message), 'utf8');
            }
            showSuiSubmissionForm(walletAddress);
          } catch (error) {
            document.getElementById('editSignStatus').innerHTML = `<p style='color:red;'>Signature failed or was rejected. Please try again.</p>`;
          }
        };
      });
    }
  }

  function showNotEligible() {
    eligibilityStatus.className = 'eligibility-status not-eligible';
    eligibilityDetails.innerHTML = `<p>Sorry, your wallet address is not on our eligible list for this pre sale.</p>`;
  }

  function showSubmissionComplete() {
    eligibilitySection.style.display = 'block';
    if (!isEditSubmission) {
      eligibilityStatus.textContent = '';
      eligibilityStatus.className = '';
      eligibilityDetails.innerHTML = '';
    } else {
      eligibilityStatus.textContent = '';
      eligibilityStatus.className = '';
      eligibilityDetails.innerHTML = '';
    }
    // Always show the previously submitted section after successful submission
    const savedSuiAddress = localStorage.getItem('suiAddress');
    if (savedSuiAddress) {
      showPreviouslySubmittedSui(savedSuiAddress);
    }
    isEditSubmission = false; // reset after submission
  }

  clearButton.addEventListener('click', () => {
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('walletType');
    localStorage.removeItem('suiAddressSubmitted');
    localStorage.removeItem('suiAddress');
    eligibilitySection.style.display = 'none';
    suiAddressSection.style.display = 'none';
    clearButton.textContent = 'Clearing...';
    clearButton.disabled = true;
    setTimeout(() => {
      window.location.reload();
    }, 500);
  });

  // Function to check server for existing submission
  async function checkServerForSubmission(walletAddress) {
    try {
      const response = await fetch(`/check-submission/${walletAddress}`);
      if (response.ok) {
        const result = await response.json();
        if (result.hasSubmitted && result.suiAddress) {
          localStorage.setItem('suiAddress', result.suiAddress);
          localStorage.setItem('suiAddressSubmitted', 'true');
          showPreviouslySubmittedSui(result.suiAddress);
          return;
        }
      }
    } catch (error) {
      console.error('Error checking server for submission:', error);
    }
    checkEligibility(walletAddress);
  }

  // --- $RAD bullets over logo ---
  function createRadBullets() {
    const radBullets = document.getElementById('radBullets');
    if (!radBullets) return;
    radBullets.innerHTML = '';
    const numBullets = 12;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    for (let i = 0; i < numBullets; i++) {
      const bullet = document.createElement('div');
      bullet.className = 'rad-bullet';
      bullet.textContent = '$RAD';
      // Random position anywhere on the viewport
      const left = Math.random() * (vw - 24);
      const top = Math.random() * (vh - 24);
      bullet.style.left = `${left}px`;
      bullet.style.top = `${top}px`;
      // Random movement direction and distance
      const angle = Math.random() * 2 * Math.PI;
      const dist = 50 + Math.random() * 120;
      const tx = Math.round(Math.cos(angle) * dist);
      const ty = Math.round(Math.sin(angle) * dist);
      bullet.style.setProperty('--tx', `${tx}px`);
      bullet.style.setProperty('--ty', `${ty}px`);
      bullet.style.animationDelay = `${Math.random() * 3}s`;
      bullet.style.animationDuration = `${2 + Math.random() * 2}s`;
      radBullets.appendChild(bullet);
    }
  }
  createRadBullets();
  window.addEventListener('resize', createRadBullets);
});
