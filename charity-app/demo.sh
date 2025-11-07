#!/bin/bash

# 🎭 Transparity Demo Quick Start Script
# This script sets up and launches the demo environment

echo "🎭 Welcome to Transparity Demo Setup"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the charity-app directory"
    echo "📍 Current directory: $(pwd)"
    echo "🔧 Run: cd /Users/gurshabdvaraich/transparity/charity-app"
    exit 1
fi

echo "✅ Directory check passed"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

# Check if contracts are compiled
if [ ! -d "artifacts/contracts/Campaign.sol" ]; then
    echo "🔨 Compiling smart contracts..."
    npx hardhat compile
else
    echo "✅ Smart contracts already compiled"
fi

echo ""
echo "🚀 DEMO OPTIONS:"
echo "=================="
echo ""
echo "1️⃣  DEMO MODE (Recommended - No MetaMask required)"
echo "   - Simulated blockchain interactions"
echo "   - Pre-populated demo data"
echo "   - Works immediately in any browser"
echo ""
echo "2️⃣  FULL BLOCKCHAIN MODE (Advanced - Requires MetaMask)"
echo "   - Real blockchain transactions"
echo "   - Requires MetaMask setup"
echo "   - Local Hardhat network"
echo ""

read -p "Choose option (1 or 2): " choice

case $choice in
    1)
        echo ""
        echo "🎭 Starting DEMO MODE..."
        echo "======================="
        echo ""
        echo "📋 DEMO CHECKLIST:"
        echo "✅ Demo mode automatically active (no MetaMask needed)"
        echo "✅ Pre-populated campaigns available"
        echo "✅ All transactions simulated"
        echo "✅ Etherscan links point to Sepolia testnet"
        echo ""
        echo "🌐 Starting React app..."
        echo "📱 App will open at: http://localhost:3000"
        echo "🎬 Look for the golden 'Demo Mode Active' banner"
        echo ""
        npm start
        ;;
    2)
        echo ""
        echo "⚡ Starting FULL BLOCKCHAIN MODE..."
        echo "=================================="
        echo ""
        echo "📋 SETUP CHECKLIST:"
        echo "🔧 Starting local Hardhat blockchain..."
        
        # Start Hardhat node in background
        npx hardhat node &
        HARDHAT_PID=$!
        
        echo "⏳ Waiting for blockchain to initialize..."
        sleep 5
        
        echo "🚀 Deploying contracts..."
        npx hardhat run scripts/deploy.js --network localhost
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Deployment successful!"
            echo ""
            echo "🦊 METAMASK SETUP REQUIRED:"
            echo "=========================="
            echo "1. Install MetaMask: https://metamask.io"
            echo "2. Add Local Network:"
            echo "   - Network Name: Hardhat Local"
            echo "   - RPC URL: http://127.0.0.1:8545"
            echo "   - Chain ID: 31337"
            echo "   - Currency Symbol: ETH"
            echo "3. Import test account (optional):"
            echo "   - Use private key from Hardhat accounts above"
            echo ""
            echo "🌐 Starting React app..."
            npm start
        else
            echo "❌ Deployment failed. Falling back to demo mode..."
            kill $HARDHAT_PID 2>/dev/null
            npm start
        fi
        ;;
    *)
        echo "❌ Invalid option. Defaulting to Demo Mode..."
        npm start
        ;;
esac