import { Contract, ethers } from "https://esm.sh/ethers@6.7.0";
import ParsingNFTDataArtifact from "./abi/parsing-nft-data/ParsingNFTData.json" assert {
  type: "json",
};
import { getProvider } from "./blockchain.ts";

const CONTRACT_ADDRESSES: {
  [chain: string]: string;
} = {
  "ethereum": "0x06f98E2E91E64103d612243a151750d14e5EDacC",
  "polygon": "0x3DAA7E5a22C8e11F2FE31575bE028F452Fe01C8e",
  "matic": "0x3DAA7E5a22C8e11F2FE31575bE028F452Fe01C8e",
  "bnb": "0xECFFc91149b8B702dEa6905Ae304A9D36527060F",
  "bsc": "0xECFFc91149b8B702dEa6905Ae304A9D36527060F",
  "bifrost": "0xdC5323d27c611D978E33B65ef9E1eA49fd9a0199",
  "klaytn": "0x8A98A038dcA75091225EE0a1A11fC20Aa23832A0",
};

function getContract(chain: string) {
  if (CONTRACT_ADDRESSES[chain]) {
    const provider = getProvider(chain);
    if (provider) {
      return new Contract(
        CONTRACT_ADDRESSES[chain],
        ParsingNFTDataArtifact.abi,
        provider,
      );
    }
  }
}

export const getBalance: (
  chain: string,
  address: string,
  owner: string,
) => Promise<number> = async (
  chain: string,
  address: string,
  owner: string,
) => {
  const contract = getContract(chain);
  if (contract) {
    return Number(
      (await contract.getERC721BalanceList_OneToken(
        address,
        [owner],
      ))[0],
    );
  }
  return 0;
};

export const getOwners: (
  chain: string,
  address: string,
  tokenIds: bigint[],
) => Promise<string[]> = async (
  chain: string,
  address: string,
  tokenIds: bigint[],
) => {
  const contract = getContract(chain);
  if (contract) {
    return await contract.getERC721HolderList(
      address,
      tokenIds,
    );
  }
  return tokenIds.map(() => ethers.ZeroAddress);
};
