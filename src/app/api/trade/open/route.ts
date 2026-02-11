import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

// Contract ABIs (simplified - add full ABI in production)
const PERP_DEX_ABI = [
    "function openPosition(address agent, string pair, uint256 size, uint256 collateral, uint256 leverage, bool isLong) returns (uint256)",
    "function getLatestPrice(string pair) view returns (uint256)"
];

const ORACLE_ABI = [
    "function getLatestPrice(string pair) view returns (uint256)"
];

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { agentId, pair, size, collateral, leverage, isLong, slippage = 0.5 } = body;

        // Validation
        if (!agentId || !pair || !size || !collateral || !leverage) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (!['BTC/USDT', 'ETH/USDT'].includes(pair)) {
            return NextResponse.json(
                { error: 'Unsupported pair. Use BTC/USDT or ETH/USDT' },
                { status: 400 }
            );
        }

        if (leverage < 1 || leverage > 50) {
            return NextResponse.json(
                { error: 'Leverage must be between 1 and 50' },
                { status: 400 }
            );
        }

        // Connect to contracts
        const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
        const perpDexAddress = process.env.NEXT_PUBLIC_PERP_DEX!;
        const oracleAddress = process.env.NEXT_PUBLIC_CHAINLINK_ORACLE!;

        const perpDex = new ethers.Contract(perpDexAddress, PERP_DEX_ABI, provider);
        const oracle = new ethers.Contract(oracleAddress, ORACLE_ABI, provider);

        // Get current price
        const currentPrice = await oracle.getLatestPrice(pair);
        const entryPrice = ethers.formatUnits(currentPrice, 18);

        // Calculate fees (0.1% trading fee)
        const tradingFee = (parseFloat(size.toString()) * 0.001).toFixed(2);

        // Calculate liquidation price
        const liquidationThreshold = 0.8; // 80%
        const maxLoss = parseFloat(collateral.toString()) * liquidationThreshold;
        const priceChange = (maxLoss * parseFloat(entryPrice)) / (parseFloat(size.toString()) * leverage);

        const liquidationPrice = isLong
            ? parseFloat(entryPrice) - priceChange
            : parseFloat(entryPrice) + priceChange;

        // Create unsigned transaction
        const sizeWei = ethers.parseUnits(size.toString(), 18);
        const collateralWei = ethers.parseUnits(collateral.toString(), 18);

        const unsignedTx = await perpDex.openPosition.populateTransaction(
            agentId,
            pair,
            sizeWei,
            collateralWei,
            leverage,
            isLong
        );

        // Estimate gas
        const gasEstimate = await provider.estimateGas({
            to: perpDexAddress,
            data: unsignedTx.data,
        });

        const gasLimit = (gasEstimate * BigInt(120)) / BigInt(100); // 20% buffer

        // Return unsigned transaction
        return NextResponse.json({
            success: true,
            unsignedTx: {
                to: perpDexAddress,
                data: unsignedTx.data,
                gasLimit: gasLimit.toString(),
            },
            tradeDetails: {
                pair,
                size: size.toString(),
                collateral: collateral.toString(),
                leverage,
                isLong,
                entryPrice,
                liquidationPrice: liquidationPrice.toFixed(2),
                fees: tradingFee,
                estimatedGas: gasLimit.toString(),
            },
            timestamp: Date.now(),
        });

    } catch (error: any) {
        console.error('Error in /api/trade/open:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create trade' },
            { status: 500 }
        );
    }
}
