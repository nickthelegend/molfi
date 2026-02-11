/**
 * Smart Contract Addresses for ERC-8004 Registries
 * 
 * These addresses are deployed on various networks.
 * Update after deployment with actual addresses.
 */

export const CONTRACTS = {
    // Monad Testnet (Chain ID: 41454)
    monadTestnet: {
        identityRegistry: process.env.NEXT_PUBLIC_IDENTITY_REGISTRY || '',
        reputationRegistry: process.env.NEXT_PUBLIC_REPUTATION_REGISTRY || '',
        validationRegistry: process.env.NEXT_PUBLIC_VALIDATION_REGISTRY || '',
    },

    // Ethereum Sepolia (Chain ID: 11155111)
    sepolia: {
        identityRegistry: '0x8004A818BFB912233c491871b3d84c89A494BD9e',
        reputationRegistry: '0x8004B663056A597Dffe9eCcC1965A193B7388713',
        validationRegistry: '', // Add if needed
    },

    // Base Sepolia (Chain ID: 84532)
    baseSepolia: {
        identityRegistry: '0x8004A818BFB912233c491871b3d84c89A494BD9e',
        reputationRegistry: '0x8004B663056A597Dffe9eCcC1965A193B7388713',
        validationRegistry: '', // Add if needed
    },
} as const;

/**
 * Get contract address for a specific chain and contract type
 * @param chainId - The chain ID
 * @param contract - The contract type
 * @returns The contract address
 * @throws Error if chain is not supported
 */
export function getContractAddress(
    chainId: number,
    contract: 'identityRegistry' | 'reputationRegistry' | 'validationRegistry'
): string {
    switch (chainId) {
        case 41454: // Monad Testnet
            return CONTRACTS.monadTestnet[contract];
        case 11155111: // Sepolia
            return CONTRACTS.sepolia[contract];
        case 84532: // Base Sepolia
            return CONTRACTS.baseSepolia[contract];
        default:
            throw new Error(`Unsupported chain ID: ${chainId}`);
    }
}

/**
 * Check if a chain is supported
 * @param chainId - The chain ID to check
 * @returns True if the chain is supported
 */
export function isSupportedChain(chainId: number): boolean {
    return [41454, 11155111, 84532].includes(chainId);
}

/**
 * Get all contract addresses for a chain
 * @param chainId - The chain ID
 * @returns Object with all contract addresses
 */
export function getAllContracts(chainId: number) {
    switch (chainId) {
        case 41454:
            return CONTRACTS.monadTestnet;
        case 11155111:
            return CONTRACTS.sepolia;
        case 84532:
            return CONTRACTS.baseSepolia;
        default:
            throw new Error(`Unsupported chain ID: ${chainId}`);
    }
}
