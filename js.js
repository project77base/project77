// Phone menu list
  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('nav-links');

  burger.addEventListener('click', () => {
    burger.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

const header = document.querySelector('.tutajtest');
const nav = document.querySelector('.nav-links');

function updateMenuPosition() {
  const headerHeight = header.offsetHeight;
  nav.style.top = `${headerHeight}px`;
}

updateMenuPosition();
window.addEventListener('resize', updateMenuPosition);

// Jeśli header się dynamicznie zmienia np. animuje:
const observer = new ResizeObserver(updateMenuPosition);
observer.observe(header);

// Opening PDF
function openPDF() {
  window.open('project77_litepaper_19_11_2025.pdf', '_blank');
}

// Presale Functions
  
    // Tutaj wpisz ręcznie sumę zebranych USDC:
    const MANUAL_RAISED = 20;
    const CAP = 31500;
    function updateManualProgress() {
      let raised = MANUAL_RAISED;
      let pct = Math.min(raised/CAP,1);
      document.getElementById("manualProgressFill").style.width = (pct*100)+"%";
      document.getElementById("manualProgressText").textContent =
        `Raised: ${raised.toLocaleString("pl-PL",{minimumFractionDigits:2,maximumFractionDigits:2})} / ${CAP.toLocaleString("pl-PL")} USDC (${(100*pct).toFixed(2)}%)`;
    }
    updateManualProgress();

    // Kod presale
    const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
    const PRESALE_ADDRESS = "0x80f104c0275B9726b78DB4D329104Cfb2947B1d5";
    const BASE_CHAIN_ID = 8453;
    const USDC_ABI = [
      "function approve(address,uint256) returns (bool)",
      "function allowance(address,address) view returns (uint256)"
    ];
    const PRESALE_ABI = [
      "function buy(uint256 usdcAmount)"
    ];
    let provider, signer, usdc, presale, account;
    const connectWalletButton = document.getElementById("connectWallet");
    const disconnectWalletButton = document.getElementById("disconnectWallet");
    const approveButton = document.getElementById("approveButton");
    const buyButton = document.getElementById("buyButton");
    const usdcAmountInput = document.getElementById("usdcAmount");
    const presaleActions = document.getElementById("presaleActions");
    const status = document.getElementById("status");

    connectWalletButton.onclick = async () => {
      if (!window.ethereum) {
        status.innerText = "Install Metamask!";
        return;
      }
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        account = await signer.getAddress();
        const network = await provider.getNetwork();
        if (Number(network.chainId) !== BASE_CHAIN_ID) {
          status.innerText = "Change your network to Base mainnet!";
          presaleActions.style.display = "none";
          return;
        }
        usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);
        presale = new ethers.Contract(PRESALE_ADDRESS, PRESALE_ABI, signer);

        connectWalletButton.style.display = "none";
        disconnectWalletButton.style.display = "";
        presaleActions.style.display = "";
        status.innerText = "Aprrove USDC first.";
        buyButton.style.display = "none";
        approveButton.style.display = "";
        usdcAmountInput.value = "";
      } catch (err) {
        status.innerText = "Connection error: " + err.message;
      }
    };

    disconnectWalletButton.onclick = async () => {
      if (window.ethereum?.request) {
        try {
          await window.ethereum.request({
            method: "wallet_revokePermissions",
            params: [{ eth_accounts: {} }]
          });
          status.innerText = "Wallet disconnected!";
        } catch (err) {
          status.innerText = "Wallet disconnected only locally.";
        }
      }
      provider = undefined;
      signer = undefined;
      usdc = undefined;
      presale = undefined;
      account = undefined;
      disconnectWalletButton.style.display = "none";
      connectWalletButton.style.display = "";
      presaleActions.style.display = "none";
      status.innerText += " Connect again to be able to buy.";
    };

    approveButton.onclick = async () => {
      const value = Number(usdcAmountInput.value);
      if (isNaN(value) || value < 20) {
        status.innerText = "Minimal amount: 20 USDC.";
        return;
      }
      try {
        approveButton.disabled = true;
        status.innerText = "Sending approve...";
        const amount = ethers.parseUnits(value.toString(), 6);
        const tx = await usdc.approve(PRESALE_ADDRESS, amount);
        await tx.wait();
        let allowed = await usdc.allowance(account, PRESALE_ADDRESS);
        if (BigInt(allowed) >= ethers.parseUnits("20", 6)) {
          status.innerText = "Approve OK! You can now BUY.";
          approveButton.style.display = "none";
          buyButton.style.display = "";
        } else {
          status.innerText = "Approve has to be minimum 20 USDC. Right now: " + (Number(allowed)/1e6).toFixed(2) + " USDC";
          approveButton.style.display = "";
          buyButton.style.display = "none";
        }
        approveButton.disabled = false;
      } catch (err) {
        approveButton.disabled = false;
        status.innerText = "Approve error: " + err.message;
      }
    };

    buyButton.onclick = async () => {
      const value = Number(usdcAmountInput.value);
      if (isNaN(value) || value < 20) {
        status.innerText = "Minimal amount: 20 USDC.";
        return;
      }
      try {
        buyButton.disabled = true;
        status.innerText = "Sending transaction...";
        const amount = ethers.parseUnits(value.toString(), 6);
        const tx = await presale.buy(amount);
        await tx.wait();
        status.innerText = "Transaction canceled!";
      } catch (err) {
        status.innerText = "Buy error: " + err.message;
      }
      buyButton.disabled = false;
    };
