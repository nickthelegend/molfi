import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

const PERP_DEX_ABI = [
    "function closePosition(uint256 positionId) returns (int256)",
    "function getPosition(uint256 positionId) view returns (tuple(uint256 id, address trader, address agent, string pair, uint256 size, uint256 collateral, uint256 entryPrice, uint256 leverage, bool isLong, uint256 timestamp, int256 fundingIndex, bool isOpen))",
    "function getUnrealizedPnL(uint256 positionId) view returns (int256)"
];

const ORACLE_ABI = [
    "function getLatestPrice(string pair) view returns (uint256)"
];

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { positionId } = body;

        if (!positionId) {
            return NextResponse.json(
                { error: 'Position ID is required' },
                { status: 400 }
            );
        }

        // Connect to contracts
        const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
        const perpDexAddress = process.env.NEXT_PUBLIC_PERP_DEX!;
        const oracleAddress = process.env.NEXT_PUBLIC_CHAINLINK_ORACLE!;

        const perpDex = new ethers.Contract(perpDexAddress, PERP_DEX_ABI, provider);
        const oracle = new ethers.Contract(oracleAddress, ORACLE_ABI, provider);

        // Get position details
        const position = await perpDex.getPosition(positionId);

        if (!position.isOpen) {
            return NextResponse.json(
                { error: 'Position is not open' },
                { status: 400 }
            );
        }

        // Get current price and PnL
        const currentPrice = await oracle.getLatestPrice(position.pair);
        const exitPrice = ethers.formatUnits(currentPrice, 18);
        const unrealizedPnL = await perpDex.getUnrealizedPnL(positionId);
        const pnl = ethers.formatUnits(unrealizedPnL, 18);

        // Calculate fees (0.1% trading fee)
        const size = ethers.formatUnits(position.size, 18);
        const closingFee = (parseFloat(size) * 0.001).toFixed(2);

        // Create unsigned transaction
        const unsignedTx = await perpDex.closePosition.populateTransaction(positionId);

        // Estimate gas
        const gasEstimate = await provider.estimateGas({
            to: perpDexAddress,
            data: unsignedTx.data,
        });

        const gasLimit = (gasEstimate * BigInt(120)) / BigInt(100); // 20% buffer

        return NextResponse.json({
            success: true,
            unsignedTx: {
                to: perpDexAddress,
                data: unsignedTx.data,
                gasLimit: gasLimit.toString(),
            },
            closeDetails: {
                positionId: positionId.toString(),
                pair: position.pair,
                entryPrice: ethers.formatUnits(position.entryPrice, 18),
                exitPrice,
                pnl,
                fees: closingFee,
                estimatedGas: gasLimit.toString(),
            },
            timestamp: Date.now(),
        });

    } catch (error: any) {
        console.error('Error in /api/trade/close:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to close trade' },
            { status: 500 }
        );
    }
}
