import { ethers } from "https://esm.sh/ethers@6.7.0";

export function getProvider(chain: string) {
  if (chain === "ethereum" || chain === "mainnet") {
    return new ethers.InfuraProvider(
      "mainnet",
      Deno.env.get("INFURA_API_KEY")!,
    );
  } else if (chain === "polygon" || chain === "matic") {
    return new ethers.JsonRpcProvider(
      "https://polygon-rpc.com/",
    );
  } else if (chain === "bnb" || chain === "bsc") {
    return new ethers.JsonRpcProvider(
      "https://bsc-dataseed.binance.org/",
    );
  } else if (chain === "bifrost") {
    return new ethers.JsonRpcProvider(
      "https://public-01.mainnet.thebifrost.io/rpc",
    );
  } else if (chain === "klaytn") {
    return new ethers.JsonRpcProvider(
      "https://public-en-cypress.klaytn.net",
    );
  }
}
