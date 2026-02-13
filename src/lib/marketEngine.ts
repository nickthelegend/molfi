/**
 * MolFi Market Engine
 * Reads real prices from Chainlink Data Feeds on Monad Testnet.
 */

import { ethers } from 'ethers';

// Chainlink AggregatorV3 ABI (just latestRoundData)
const AGGREGATOR_ABI = [
  "function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
  "function decimals() external view returns (uint8)"
];

// Chainlink Feed Addresses on Monad Testnet
const CHAINLINK_FEEDS: Record<string, string> = {
  'BTC/USD': '0x2Cd9D7E85494F68F5aF08EF96d6FD5e8F71B4d31',
  'ETH/USD': '0x0c76859E85727683Eeba0C70Bc2e0F5781337818',
  'LINK/USD': '0x4682035965Cd2B88759193ee2660d8A0766e1391',
  'USDC/USD': '0x70BB0758a38ae43418ffcEd9A25273dd4e804D15',
  'USDT/USD': '0x14eE6bE30A91989851Dc23203E41C804D4D71441',
};

// Supported trading pairs (map pair name → Chainlink feed key)
export const SUPPORTED_PAIRS = ['BTC/USD', 'ETH/USD', 'LINK/USD'];

export interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  updatedAt: string;
  source: 'chainlink' | 'fallback';
  roundId?: string;
}

// RPC endpoints with fallback
const RPC_URLS = [
  'https://testnet-rpc.monad.xyz',
  'https://monad-testnet.drpc.org',
];

let providerIndex = 0;

function getProvider(): ethers.JsonRpcProvider {
  const url = RPC_URLS[providerIndex % RPC_URLS.length];
  return new ethers.JsonRpcProvider(url);
}

function rotateProvider() {
  providerIndex = (providerIndex + 1) % RPC_URLS.length;
}

// Price cache (5 second TTL)
const priceCache: Record<string, { data: PriceData; timestamp: number }> = {};
const CACHE_TTL = 5000; // 5 seconds

/**
 * Fetches the latest price for a symbol from Chainlink on Monad testnet.
 */
export async function getOraclePrice(symbol: string): Promise<PriceData> {
  // Normalize symbol format
  const normalized = symbol.replace('-', '/').toUpperCase();

  // Check cache
  const cached = priceCache[normalized];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const feedAddress = CHAINLINK_FEEDS[normalized];
  if (!feedAddress) {
    throw new Error(`Unsupported symbol: ${symbol}. Supported: ${Object.keys(CHAINLINK_FEEDS).join(', ')}`);
  }

  // Try fetching from Chainlink with fallback
  for (let attempt = 0; attempt < RPC_URLS.length; attempt++) {
    try {
      const provider = getProvider();
      const feed = new ethers.Contract(feedAddress, AGGREGATOR_ABI, provider);

      const [roundData, decimals] = await Promise.all([
        feed.latestRoundData(),
        feed.decimals(),
      ]);

      const [roundId, answer, , updatedAt] = roundData;
      const price = Number(answer) / (10 ** Number(decimals));

      const data: PriceData = {
        symbol: normalized,
        price,
        change24h: 0, // Chainlink doesn't provide 24h change
        updatedAt: new Date(Number(updatedAt) * 1000).toISOString(),
        source: 'chainlink',
        roundId: roundId.toString(),
      };

      // Cache it
      priceCache[normalized] = { data, timestamp: Date.now() };
      return data;

    } catch (err: any) {
      console.warn(`[MarketEngine] RPC attempt ${attempt + 1} failed for ${normalized}: ${err.message}`);
      rotateProvider();
    }
  }

  // All RPC attempts failed — return fallback
  console.error(`[MarketEngine] All RPC endpoints failed for ${normalized}, using fallback`);
  return getFallbackPrice(normalized);
}

/**
 * Fetch all supported prices at once
 */
export async function getAllPrices(): Promise<PriceData[]> {
  const pairs = Object.keys(CHAINLINK_FEEDS);
  const results = await Promise.allSettled(pairs.map(p => getOraclePrice(p)));

  return results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    return getFallbackPrice(pairs[i]);
  });
}

/**
 * Fallback prices when Chainlink is unreachable
 */
const FALLBACK_PRICES: Record<string, number> = {
  'BTC/USD': 97000,
  'ETH/USD': 2700,
  'LINK/USD': 18,
  'USDC/USD': 1,
  'USDT/USD': 1,
};

function getFallbackPrice(symbol: string): PriceData {
  return {
    symbol,
    price: FALLBACK_PRICES[symbol] || 100,
    change24h: 0,
    updatedAt: new Date().toISOString(),
    source: 'fallback',
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
