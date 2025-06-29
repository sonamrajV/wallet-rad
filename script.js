document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const metamaskButton = document.getElementById('connectMetaMask');
  const metamaskAddressDiv = document.getElementById('metamaskAddress');
  const clearButton = document.getElementById('clearData');
  const eligibilitySection = document.getElementById('eligibilitySection');
  const eligibilityStatus = document.getElementById('eligibilityStatus');
  const eligibilityDetails = document.getElementById('eligibilityDetails');
  const suiAddressSection = document.getElementById('suiAddressSection');
  const suiAddressDisplay = document.getElementById('suiAddressDisplay');
  const editSuiButton = document.getElementById('editSuiButton');

  // Check for saved state on page load
  const savedMetamask = localStorage.getItem('metamaskAddress');
  const savedSuiAddress = localStorage.getItem('suiAddress');
  const suiSubmitted = localStorage.getItem('suiAddressSubmitted');

  if (savedMetamask) {
    metamaskAddressDiv.textContent = 'Connected Address: ' + savedMetamask;
    metamaskButton.textContent = 'Connected';
    metamaskButton.disabled = true;

    // Always show previously submitted Sui address if it exists
    if (savedSuiAddress && suiSubmitted === 'true') {
      showPreviouslySubmittedSui(savedSuiAddress);
      // Don't check eligibility again if already submitted
    } else {
      // Check if there's a submission on the server even if localStorage is cleared
      checkServerForSubmission(savedMetamask);
    }
  }

  if (typeof window.ethereum === 'undefined') {
    metamaskButton.disabled = true;
    metamaskButton.textContent = 'MetaMask Not Installed';
    metamaskAddressDiv.textContent = 'Please install MetaMask to use this feature.';
  }

  metamaskButton.addEventListener('click', async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      localStorage.setItem('metamaskAddress', account);
      window.location.reload();
    } catch (error) {
      metamaskAddressDiv.textContent = 'Connection failed or denied.';
    }
  });

  editSuiButton.addEventListener('click', async () => {
    // Require signature verification before allowing edit
    try {
      const message = "I am verifying my address to edit my $SUI wallet address for the RadiantArena pre sale.";
      await window.ethereum.request({ 
        method: 'personal_sign', 
        params: [message, savedMetamask] 
      });
      
      // Hide the display section and show the submission form
      suiAddressSection.style.display = 'none';
      eligibilitySection.style.display = 'block';
      eligibilityStatus.textContent = '✏️ Edit $SUI Address';
      eligibilityStatus.className = 'eligibility-status eligible';
      eligibilityDetails.innerHTML = `
        <p>Please enter your new $SUI wallet address:</p>
        <div class="input-group">
          <input type="text" id="suiAddressInput" placeholder="Enter your $SUI wallet address" value="${savedSuiAddress || ''}">
          <button id="submitSuiButton" class="wallet-button sui">Update Address</button>
        </div>
        <div id="submissionStatus"></div>
      `;
      document.getElementById('submitSuiButton').addEventListener('click', () => submitSuiAddress(savedMetamask));
    } catch (error) {
      console.error('Signature failed:', error);
      // Show error message but don't proceed with edit
      const errorDiv = document.createElement('div');
      errorDiv.innerHTML = `<p style="color: red; margin-top: 1rem;"><strong>Signature verification failed.</strong> Please try again to edit your address.</p>`;
      suiAddressSection.appendChild(errorDiv);
      
      // Remove error message after 3 seconds
      setTimeout(() => {
        if (errorDiv.parentNode) {
          errorDiv.parentNode.removeChild(errorDiv);
        }
      }, 3000);
    }
  });

  function showPreviouslySubmittedSui(suiAddress) {
    suiAddressSection.style.display = 'block';
    suiAddressDisplay.innerHTML = `
      <div class="sui-address-info">
        <strong>Previously Submitted $SUI Address:</strong><br>
        <span style="font-family: monospace; font-size: 0.9rem; color: #333; word-break: break-all;">${suiAddress}</span>
      </div>
      <p style="margin-top: 1rem; font-size: 0.9rem; color: #666;">
        ✅ Your $SUI address has been successfully submitted and recorded.
      </p>
    `;
  }

  async function checkEligibility(metamaskAddress) {
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
        body: JSON.stringify({ metamaskAddress }),
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
          <button id="signMessageButton" class="wallet-button metamask">Sign to Verify Address</button>
        `;
        document.getElementById('signMessageButton').addEventListener('click', () => signMessage(metamaskAddress));
      } else {
        showNotEligible();
      }
    } catch (error) {
      console.error('Eligibility check error:', error);
      eligibilityStatus.textContent = '❌ Server Error';
      eligibilityStatus.className = 'eligibility-status not-eligible';
      
      if (error.name === 'AbortError') {
        eligibilityDetails.innerHTML = `
          <p>Request timed out. Please try again.</p>
          <p><strong>Make sure the server is running:</strong></p>
          <ol>
            <li>Open terminal/command prompt</li>
            <li>Navigate to the project folder</li>
            <li>Run: <code>node server.js</code></li>
            <li>You should see: "🚀 RadiantArena Server running on port 3000"</li>
          </ol>
          <p>Then refresh this page and try again.</p>
        `;
      } else {
        eligibilityDetails.innerHTML = `
          <p>Could not connect to the server. Please try again later.</p>
          <p><strong>Error details:</strong> ${error.message}</p>
        `;
      }
    }
  }

  async function signMessage(account) {
    try {
      const message = "I am verifying my address to confirm eligibility for the RadiantArena pre sale.";
      await window.ethereum.request({ method: 'personal_sign', params: [message, account] });
      showSuiSubmissionForm(account);
    } catch (error) {
      eligibilityDetails.innerHTML += `<p style="color: red; margin-top: 1rem;"><strong>Signature failed or was rejected.</strong> Please try again.</p>`;
    }
  }

  function showSuiSubmissionForm(metamaskAddress) {
    eligibilityStatus.textContent = '✅ Verification Successful!';
    eligibilityDetails.innerHTML = `
      <p>Please submit your $SUI wallet address to finalize your RadiantArena pre sale entry.</p>
      <div class="input-group">
        <input type="text" id="suiAddressInput" placeholder="Enter your $SUI wallet address">
        <button id="submitSuiButton" class="wallet-button sui">Submit Address</button>
      </div>
      <div id="submissionStatus"></div>
    `;
    document.getElementById('submitSuiButton').addEventListener('click', () => submitSuiAddress(metamaskAddress));
  }

  async function submitSuiAddress(metamaskAddress) {
    const suiAddressInput = document.getElementById('suiAddressInput');
    const suiAddress = suiAddressInput.value.trim();
    const submissionStatus = document.getElementById('submissionStatus');

    if (!suiAddress) {
      submissionStatus.textContent = 'Please enter a valid $SUI address.';
      submissionStatus.style.color = 'red';
      return;
    }

    suiAddressInput.disabled = true;
    document.getElementById('submitSuiButton').disabled = true;
    submissionStatus.textContent = 'Submitting...';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch('/submit-sui-address', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ metamaskAddress, suiAddress }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        localStorage.setItem('suiAddressSubmitted', 'true');
        localStorage.setItem('suiAddress', suiAddress);
        showSubmissionComplete();
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('$SUI address submission error:', error);
      
      if (error.name === 'AbortError') {
        submissionStatus.innerHTML = `
          <p style="color: red;">Request timed out. Please try again.</p>
        `;
      } else {
        submissionStatus.innerHTML = `
          <p style="color: red;">Submission failed. Please try again.</p>
          <p>Error: ${error.message}</p>
        `;
      }
      
      suiAddressInput.disabled = false;
      document.getElementById('submitSuiButton').disabled = false;
    }
  }

  function showNotEligible() {
    eligibilityStatus.className = 'eligibility-status not-eligible';
    eligibilityDetails.innerHTML = `<p>Sorry, your wallet address is not on our eligible list for this pre sale.</p>`;
  }

  function showSubmissionComplete() {
    eligibilitySection.style.display = 'block';
    eligibilityStatus.textContent = '✅ Submission Complete!';
    eligibilityStatus.className = 'eligibility-status eligible';
    eligibilityDetails.innerHTML = `
      <p style="color: green; font-weight: bold;">✅ Submitted Successfully!</p>
      <p>Your addresses have been recorded. Thank you for participating!</p>
    `;
    
    // Always show the previously submitted section after successful submission
    const savedSuiAddress = localStorage.getItem('suiAddress');
    if (savedSuiAddress) {
      showPreviouslySubmittedSui(savedSuiAddress);
    }
  }

  clearButton.addEventListener('click', () => {
    localStorage.removeItem('metamaskAddress');
    localStorage.removeItem('suiAddressSubmitted');
    localStorage.removeItem('suiAddress');
    
    // Hide all sections before reloading
    eligibilitySection.style.display = 'none';
    suiAddressSection.style.display = 'none';
    
    // Show a brief message before reloading
    clearButton.textContent = 'Clearing...';
    clearButton.disabled = true;
    
    setTimeout(() => {
      window.location.reload();
    }, 500);
  });

  if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
      localStorage.removeItem('suiAddressSubmitted');
      localStorage.removeItem('suiAddress');
      if (accounts.length > 0) {
        localStorage.setItem('metamaskAddress', accounts[0]);
      } else {
        localStorage.removeItem('metamaskAddress');
      }
      window.location.reload();
    });
  }

  // Function to check server for existing submission
  async function checkServerForSubmission(metamaskAddress) {
    try {
      const response = await fetch(`/check-submission/${metamaskAddress}`);
      if (response.ok) {
        const result = await response.json();
        if (result.hasSubmitted && result.suiAddress) {
          // Found submission on server, restore to localStorage and show
          localStorage.setItem('suiAddress', result.suiAddress);
          localStorage.setItem('suiAddressSubmitted', 'true');
          showPreviouslySubmittedSui(result.suiAddress);
          return;
        }
      }
    } catch (error) {
      console.error('Error checking server for submission:', error);
    }
    
    // If no submission found on server, check eligibility
    checkEligibility(metamaskAddress);
  }
});
