import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, base, sepolia } from 'wagmi/chains';
import { defineChain } from 'viem';

// Define Monad Testnet
export const monadTestnet = defineChain({
    id: 41454,
    name: 'Monad Testnet',
    network: 'monad-testnet',
    nativeCurrency: {
        decimals: 18,
        name: 'Monad',
        symbol: 'MON',
    },
    rpcUrls: {
        default: {
            http: [
                'https://rpc-testnet.monadinfra.com',
                'https://testnet-rpc2.monad.xyz',
                'https://testnet-rpc.monad.xyz',
            ]
        },
        public: {
            http: [
                'https://rpc-testnet.monadinfra.com',
                'https://testnet-rpc2.monad.xyz',
                'https://testnet-rpc.monad.xyz',
            ]
        },
    },
    blockExplorers: {
        default: {
            name: 'Monad Explorer',
            url: 'https://monad-testnet.socialscan.io'
        },
    },
    testnet: true,
});

export const config = getDefaultConfig({
    appName: 'Molfi Protocol',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
    chains: [
        monadTestnet, // Monad Testnet first for easy access
        sepolia,
        mainnet,
        polygon,
        optimism,
        arbitrum,
        base
    ],
    ssr: true,
});
