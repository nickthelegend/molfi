
/**
 * MolFi Market Engine
 * Handles price feeds, oracle data, and perpetual math.
 */

export interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  updatedAt: string;
}

const MOCK_PRICES: Record<string, number> = {
  'BTC-USD': 64230.50,
  'ETH-USD': 3452.12,
  'SOL-USD': 142.05,
  'LINK-USD': 18.22,
};

/**
 * Fetches the latest price for a symbol.
 * In production, this would call the ChainlinkOracle.sol contract or a high-end API.
 */
export async function getOraclePrice(symbol: string): Promise<PriceData> {
  const basePrice = MOCK_PRICES[symbol] || 100;
  // Add some random volatility for the terminal feel
  const volatility = (Math.random() - 0.5) * (basePrice * 0.001);
  const currentPrice = basePrice + volatility;

  return {
    symbol,
    price: currentPrice,
    change24h: (Math.random() * 5) * (Math.random() > 0.5 ? 1 : -1),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Perpetual Math: Calculates Unrealized PnL
 */
export function calculatePnL(
  side: 'LONG' | 'SHORT',
  entryPrice: number,
  currentPrice: number,
  size: number
): number {
  if (side === 'LONG') {
    return (currentPrice - entryPrice) * size / entryPrice;
  } else {
    return (entryPrice - currentPrice) * size / entryPrice;
  }
}

/**
 * Perpetual Math: Calculates Liquidation Price
 */
export function calculateLiquidationPrice(
  side: 'LONG' | 'SHORT',
  entryPrice: number,
  leverage: number,
  maintenanceMargin: number = 0.05
): number {
  if (side === 'LONG') {
    return entryPrice * (1 - (1 / leverage) + maintenanceMargin);
  } else {
    return entryPrice * (1 + (1 / leverage) - maintenanceMargin);
  }
}
