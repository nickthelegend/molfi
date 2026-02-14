/**
 * MolFi Market Engine
 * ═══════════════════════════════════════════════════════════════
 * Reads real prices from MolfiOracle on Monad Testnet.
 *
 * Price pipeline:
 *   Binance API → oracle-bot.cjs → MolfiOracle contract → this engine → API
 *
 * Fallback chain:
 *   1. Read from MolfiOracle on-chain (live prices pushed by bot)
 *   2. Fetch directly from Binance REST API (if oracle is stale/down)
 *   3. Return hardcoded fallback prices (last resort)
 */

import { ethers } from 'ethers';

// ── MolfiOracle ABI (read-only subset) ──────────────────────────
const ORACLE_ABI = [
  'function getLatestPrice(string memory pair) public view returns (uint256)',
  'function getPriceUnsafe(string memory pair) external view returns (uint256 price, uint256 updatedAt, bool isStale)',
  'function getAllPrices() external view returns (string[] memory pairs, uint256[] memory prices, uint256[] memory timestamps)',
  'function hasPriceFeed(string memory pair) external view returns (bool)',
];

// ── Configuration ────────────────────────────────────────────────
const ORACLE_ADDRESS = process.env.NEXT_PUBLIC_MOLFI_ORACLE || '';

const RPC_URLS = [
  'https://testnet-rpc.monad.xyz',
  'https://monad-testnet.drpc.org',
];

// Binance symbol mapping (for direct fallback)
const BINANCE_SYMBOLS: Record<string, string> = {
  'BTC/USD': 'BTCUSDT',
  'ETH/USD': 'ETHUSDT',
  'LINK/USD': 'LINKUSDT',
};

export const SUPPORTED_PAIRS = ['BTC/USD', 'ETH/USD', 'LINK/USD'];

// ── Types ────────────────────────────────────────────────────────
export interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  updatedAt: string;
  source: 'oracle' | 'binance' | 'fallback';
}

// ── RPC Provider Pool ────────────────────────────────────────────
let providerIndex = 0;

function getProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(RPC_URLS[providerIndex % RPC_URLS.length]);
}

function rotateProvider() {
  providerIndex = (providerIndex + 1) % RPC_URLS.length;
}

// ── Price Cache (5 second TTL) ───────────────────────────────────
const priceCache: Record<string, { data: PriceData; timestamp: number }> = {};
const CACHE_TTL = 5000;

// ── Strategy 1: Read from MolfiOracle on-chain ───────────────────
async function readFromOracle(symbol: string): Promise<PriceData | null> {
  if (!ORACLE_ADDRESS) return null;

  for (let attempt = 0; attempt < RPC_URLS.length; attempt++) {
    try {
      const provider = getProvider();
      const oracle = new ethers.Contract(ORACLE_ADDRESS, ORACLE_ABI, provider);

      // Use getPriceUnsafe to avoid revert on stale prices
      const [priceWei, updatedAt, isStale] = await oracle.getPriceUnsafe(symbol);

      if (priceWei === BigInt(0)) return null; // No price set
      if (isStale) {
        console.warn(`[MarketEngine] Oracle price for ${symbol} is stale`);
        return null;
      }

      const price = Number(ethers.formatUnits(priceWei, 18));

      return {
        symbol,
        price,
        change24h: 0,
        updatedAt: new Date(Number(updatedAt) * 1000).toISOString(),
        source: 'oracle',
      };
    } catch (err: any) {
      console.warn(`[MarketEngine] Oracle read attempt ${attempt + 1} failed: ${err.message}`);
      rotateProvider();
    }
  }
  return null;
}

// ── Strategy 2: Direct Binance API fetch ─────────────────────────
async function readFromBinance(symbol: string): Promise<PriceData | null> {
  const binanceSymbol = BINANCE_SYMBOLS[symbol];
  if (!binanceSymbol) return null;

  try {
    const res = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return null;

    const data = await res.json();
    const price = parseFloat(data.price);

    if (isNaN(price) || price <= 0) return null;

    return {
      symbol,
      price,
      change24h: 0,
      updatedAt: new Date().toISOString(),
      source: 'binance',
    };
  } catch (err: any) {
    console.warn(`[MarketEngine] Binance fetch failed for ${symbol}: ${err.message}`);
    return null;
  }
}

// ── Strategy 3: Hardcoded fallback ───────────────────────────────
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

// ── Just-In-Time (JIT) Oracle Synchronization ────────────────────
/**
 * Syncs the on-chain oracle with the latest Binance price.
 * Useful for updating prices only when a trade occurs to save gas.
 */
export async function syncOraclePrice(symbol: string): Promise<PriceData> {
  const normalized = symbol.replace('-', '/').toUpperCase();
  console.log(`[MarketEngine] JIT syncing oracle for ${normalized}...`);

  // 1. Get real price from Binance
  const binanceData = await readFromBinance(normalized);
  if (!binanceData) {
    throw new Error(`Failed to fetch live price for ${normalized} from Binance`);
  }

  // 2. Push to on-chain Oracle if we have the private key
  const pk = process.env.DEPLOYER_PRIVATE_KEY;
  if (ORACLE_ADDRESS && pk) {
    try {
      const provider = getProvider();
      const wallet = new ethers.Wallet(pk, provider);
      const oracle = new ethers.Contract(ORACLE_ADDRESS, ORACLE_ABI, wallet);

      const priceWei = ethers.parseUnits(binanceData.price.toFixed(8), 18);

      console.log(`[MarketEngine] Sending update tx for ${normalized}...`);
      const tx = await oracle.updatePrice(normalized, priceWei, { gasLimit: 300000 });
      console.log(`[MarketEngine] Oracle update tx: ${tx.hash}`);

      // Wait for 1 confirmation to ensure the price is on-chain before the trade executes
      await tx.wait(1);
      console.log(`[MarketEngine] Oracle synced ✅`);

      return {
        ...binanceData,
        source: 'oracle',
        updatedAt: new Date().toISOString()
      };
    } catch (err: any) {
      console.error(`[MarketEngine] JIT Sync failed: ${err.message}`);
      return binanceData;
    }
  }

  return binanceData;
}

// ── Main Price Fetcher ───────────────────────────────────────────
/**
 * Fetches the latest price for a symbol.
 * Tries: MolfiOracle → Binance → Fallback
 */
export async function getOraclePrice(symbol: string): Promise<PriceData> {
  const normalized = symbol.replace('-', '/').toUpperCase();

  // Check cache
  const cached = priceCache[normalized];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  // Try oracle first
  let data = await readFromOracle(normalized);

  // Fallback to Binance direct
  if (!data) {
    data = await readFromBinance(normalized);
  }

  // Last resort: hardcoded
  if (!data) {
    console.error(`[MarketEngine] All sources failed for ${normalized}, using fallback`);
    data = getFallbackPrice(normalized);
  }

  // Cache it
  priceCache[normalized] = { data, timestamp: Date.now() };
  return data;
}

/**
 * Fetch all supported prices at once
 */
export async function getAllPrices(): Promise<PriceData[]> {
  // Try batch read from oracle first
  if (ORACLE_ADDRESS) {
    for (let attempt = 0; attempt < RPC_URLS.length; attempt++) {
      try {
        const provider = getProvider();
        const oracle = new ethers.Contract(ORACLE_ADDRESS, ORACLE_ABI, provider);
        const [pairs, prices, timestamps] = await oracle.getAllPrices();

        const results: PriceData[] = [];
        for (let i = 0; i < pairs.length; i++) {
          const price = Number(ethers.formatUnits(prices[i], 18));
          if (price > 0) {
            const data: PriceData = {
              symbol: pairs[i],
              price,
              change24h: 0,
              updatedAt: new Date(Number(timestamps[i]) * 1000).toISOString(),
              source: 'oracle',
            };
            results.push(data);
            priceCache[pairs[i]] = { data, timestamp: Date.now() };
          }
        }

        if (results.length > 0) return results;
      } catch (err: any) {
        console.warn(`[MarketEngine] Batch oracle read failed: ${err.message}`);
        rotateProvider();
      }
    }
  }

  // Fallback: fetch each pair individually (tries Binance → fallback)
  const allPairs = Object.keys(BINANCE_SYMBOLS);
  const results = await Promise.allSettled(allPairs.map(p => getOraclePrice(p)));

  return results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    return getFallbackPrice(allPairs[i]);
  });
}

// ── Perpetual Math ───────────────────────────────────────────────
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
