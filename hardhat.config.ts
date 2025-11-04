import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const WHITECHAIN_RPC_URL = process.env.WHITECHAIN_RPC_URL || "";
const WHITECHAIN_CHAIN_ID = process.env.WHITECHAIN_CHAIN_ID
  ? Number(process.env.WHITECHAIN_CHAIN_ID)
  : undefined;
const WHITECHAIN_EXPLORER_API_KEY = process.env.WHITECHAIN_EXPLORER_API_KEY || "";
const WHITECHAIN_EXPLORER_API_URL = process.env.WHITECHAIN_EXPLORER_API_URL || "";
const WHITECHAIN_EXPLORER_BROWSER_URL = process.env.WHITECHAIN_EXPLORER_BROWSER_URL || "";

const accounts = PRIVATE_KEY ? [PRIVATE_KEY] : [];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 }
    }
  },
  networks: {
    // Fill env vars in env.example
    whitechainTestnet: WHITECHAIN_RPC_URL && WHITECHAIN_CHAIN_ID
      ? {
          url: WHITECHAIN_RPC_URL,
          chainId: WHITECHAIN_CHAIN_ID,
          accounts
        }
      : undefined,
  },
  etherscan: {
    apiKey: {
      whitechainTestnet: WHITECHAIN_EXPLORER_API_KEY
    } as any,
    customChains: WHITECHAIN_EXPLORER_API_URL && WHITECHAIN_EXPLORER_BROWSER_URL && WHITECHAIN_CHAIN_ID
      ? [
          {
            network: "whitechainTestnet",
            chainId: WHITECHAIN_CHAIN_ID!,
            urls: {
              apiURL: WHITECHAIN_EXPLORER_API_URL,
              browserURL: WHITECHAIN_EXPLORER_BROWSER_URL
            }
          }
        ]
      : [],
  },
  mocha: {
    timeout: 120000
  }
};

export default config;


