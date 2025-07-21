# 0G Chain Smart Contract Deployment

This project demonstrates how to deploy smart contracts on 0G Chain - an EVM-compatible blockchain with built-in AI capabilities.

## 🚀 Why 0G Chain?

- **⚡ High Performance**: 2,500 TPS with 1-2 second block times
- **💰 Low Fees**: Fraction of mainnet costs
- **🔧 Latest EVM**: Pectra & Cancun-Deneb support
- **🤖 AI Integration**: Built-in AI capabilities
- **🛠️ Familiar Tools**: Use Hardhat, Foundry, Remix

## 📋 Prerequisites

- Node.js 16+ installed
- A wallet with testnet OG tokens (get from [0G Chain faucet](https://faucet.0g.ai))
- Basic Solidity knowledge

## 🛠️ Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and add your:
   - `PRIVATE_KEY`: Your wallet private key (without 0x prefix)
   - `ETHERSCAN_API_KEY`: Optional, for contract verification

3. **Get testnet tokens**:
   - Visit [0G Chain Faucet](https://faucet.0g.ai)
   - Request testnet OG tokens for your wallet

## 📦 Smart Contract

The project includes a simple ERC-20 token contract (`KYUB.sol`) with:
- Token name: KYUB
- Token symbol: $KYU
- Total supply: 143,000,000 tokens
- Token transfers
- Balance tracking
- Total supply management

## 🚀 Deployment

### Compile the contract:
```bash
npm run compile
```

### Deploy to 0G Chain Testnet:
```bash
npm run deploy:testnet
```

### Run tests:
```bash
npm run test
```

### Verify contract (optional):
```bash
npm run verify
```

## 🔗 Network Configuration

| Network | RPC URL | Chain ID | Explorer |
|---------|---------|----------|----------|
| Testnet | `https://evmrpc-testnet.0g.ai` | 16601 | [Testnet Explorer](https://testnet-explorer.0g.ai) |

## 📁 Project Structure

```
├── contracts/
│   └── MyToken.sol          # Main smart contract
├── scripts/
│   └── deploy.js            # Deployment script
├── test/
│   └── MyToken.test.js      # Contract tests
├── hardhat.config.js        # Hardhat configuration
├── package.json             # Dependencies
├── env.example              # Environment template
└── README.md               # This file
```

## 🔧 Configuration Details

### Hardhat Configuration
- **Solidity Version**: 0.8.19
- **EVM Version**: Cancun (latest EVM features)
- **Optimizer**: Enabled with 200 runs
- **Network**: 0G Chain Testnet (Chain ID: 16601)

### Contract Features
- **Token Name**: KYUB
- **Token Symbol**: $KYU
- **Total Supply**: 143,000,000 tokens (18 decimals)
- **Transfer Function**: Standard token transfer with balance checks
- **Public Variables**: `balances` mapping and `totalSupply`

## 🧪 Testing

The test suite covers:
- ✅ Contract deployment
- ✅ Token transfers
- ✅ Balance updates
- ✅ Error handling
- ✅ Edge cases

Run tests with:
```bash
npm run test
```

## 🔍 Verification

After deployment, verify your contract on the 0G Chain explorer:
1. Visit [Testnet Explorer](https://testnet-explorer.0g.ai)
2. Search for your contract address
3. Click "Verify Contract" (if API key is configured)

## 🆘 Troubleshooting

### Common Issues:

1. **"Invalid opcode" error**:
   - Ensure you're using `evmVersion: "cancun"` in hardhat config
   - Check Solidity version compatibility

2. **RPC connection issues**:
   - Verify the RPC URL: `https://evmrpc-testnet.0g.ai`
   - Check your internet connection

3. **Insufficient gas**:
   - Ensure your wallet has enough OG tokens for gas fees
   - Get testnet tokens from the faucet

4. **Private key issues**:
   - Make sure your private key is correct (without 0x prefix)
   - Ensure the wallet has testnet tokens

## 🔗 Useful Links

- [0G Chain Documentation](https://docs.0g.ai)
- [0G Chain Faucet](https://faucet.0g.ai)
- [Testnet Explorer](https://testnet-explorer.0g.ai)
- [0G Chain Discord](https://discord.gg/0gchain)

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

---

**Happy deploying on 0G Chain! 🚀** 