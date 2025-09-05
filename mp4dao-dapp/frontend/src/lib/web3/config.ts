import { createConfig, http } from 'wagmi';
import { polygon, polygonAmoy, hardhat } from 'wagmi/chains';
import { walletConnect, metaMask, coinbaseWallet, injected } from 'wagmi/connectors';

// Get project ID from environment
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id';

if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
  console.warn('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set, using demo mode');
}

// Define chains (hardhat first for development)
const chains = [hardhat, polygonAmoy, polygon] as const;

// Define connectors
const connectors = [
  walletConnect({ 
    projectId: projectId || '',
    metadata: {
      name: 'Mp4Dao',
      description: 'Registo de Copyright Musical em Angola',
      url: 'https://mp4dao.ao',
      icons: ['https://mp4dao.ao/icons/favicon.ico'],
    },
  }),
  metaMask(),
  coinbaseWallet({
    appName: 'Mp4Dao',
    appLogoUrl: 'https://mp4dao.ao/icons/favicon.ico',
  }),
  injected(),
];

// Create wagmi config
export const wagmiConfig = createConfig({
  chains,
  connectors,
  transports: {
    [hardhat.id]: http('http://127.0.0.1:8545'),
    [polygon.id]: http(process.env.NEXT_PUBLIC_MAINNET_RPC_URL),
    [polygonAmoy.id]: http(process.env.NEXT_PUBLIC_RPC_URL),
  },
  ssr: true,
});

// Contract addresses
export const CONTRACT_ADDRESSES = {
  [hardhat.id]: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  [polygon.id]: process.env.NEXT_PUBLIC_MAINNET_CONTRACT_ADDRESS || '',
  [polygonAmoy.id]: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '',
} as const;

// Current chain configuration
export const getCurrentChainId = () => {
  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID;
  return chainId ? parseInt(chainId) : hardhat.id; // Default to hardhat for development
};

export const getCurrentContractAddress = () => {
  const chainId = getCurrentChainId();
  return CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
};

// Chain configurations
export const SUPPORTED_CHAINS = {
  [hardhat.id]: {
    name: 'Hardhat Local',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    blockExplorer: 'http://localhost:8545',
    isTestnet: true,
  },
  [polygon.id]: {
    name: 'Polygon',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    blockExplorer: 'https://polygonscan.com',
    isTestnet: false,
  },
  [polygonAmoy.id]: {
    name: 'Polygon Amoy',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    blockExplorer: 'https://amoy.polygonscan.com',
    isTestnet: true,
  },
} as const;

// Smart Contract Configuration
export const WORK_REGISTRY_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as const; // Update with deployed address

export const WORK_REGISTRY_ABI = [
  // Constructor
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "initialOwner",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  // Register Work Function
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "workHash",
        "type": "bytes32"
      },
      {
        "internalType": "string",
        "name": "metadataURI",
        "type": "string"
      },
      {
        "internalType": "address[]",
        "name": "authors",
        "type": "address[]"
      },
      {
        "internalType": "uint16[]",
        "name": "splitsBps",
        "type": "uint16[]"
      },
      {
        "internalType": "uint32",
        "name": "workType",
        "type": "uint32"
      },
      {
        "internalType": "bool",
        "name": "publicListing",
        "type": "bool"
      }
    ],
    "name": "registerWork",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "workId",
        "type": "uint256"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  // Work Registered Event
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "workId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "workHash",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "metadataURI",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "address[]",
        "name": "authors",
        "type": "address[]"
      },
      {
        "indexed": false,
        "internalType": "uint16[]",
        "name": "splitsBps",
        "type": "uint16[]"
      },
      {
        "indexed": false,
        "internalType": "uint32",
        "name": "workType",
        "type": "uint32"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "timestamp",
        "type": "uint64"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "publicListing",
        "type": "bool"
      }
    ],
    "name": "WorkRegistered",
    "type": "event"
  },
  // Read Functions
  {
    "inputs": [],
    "name": "registrationFee",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "workCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "workId",
        "type": "uint256"
      }
    ],
    "name": "getWork",
    "outputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "workHash",
            "type": "bytes32"
          },
          {
            "internalType": "string",
            "name": "metadataURI",
            "type": "string"
          },
          {
            "internalType": "address[]",
            "name": "authors",
            "type": "address[]"
          },
          {
            "internalType": "uint16[]",
            "name": "splitsBps",
            "type": "uint16[]"
          },
          {
            "internalType": "uint64",
            "name": "registeredAt",
            "type": "uint64"
          },
          {
            "internalType": "uint32",
            "name": "workType",
            "type": "uint32"
          },
          {
            "internalType": "bool",
            "name": "disputed",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "publicListing",
            "type": "bool"
          }
        ],
        "internalType": "struct WorkRegistry.Work",
        "name": "work",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "author",
        "type": "address"
      }
    ],
    "name": "getWorksByAuthor",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "workIds",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
