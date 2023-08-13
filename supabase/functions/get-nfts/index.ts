import { ethers } from "https://esm.sh/ethers@6.7.0";
import { response, responseError, serveWithOptions } from "../_shared/cors.ts";
import { getOwnedNFTs } from "../_shared/opensea.ts";

serveWithOptions(async (req) => {
  const u = new URL(req.url);
  const walletAddress = u.searchParams.get("wallet_address");
  const room = u.searchParams.get("room");
  if (walletAddress) {
    let nfts: any[] = [];
    if (room) {
      const [chain, address] = room.split(":");
      if (chain === "ethereum") {
        nfts = await getOwnedNFTs(walletAddress, address);
      }
    } else {
      nfts = await getOwnedNFTs(walletAddress);
    }
    return response(nfts.map((nft) => {
      return {
        chain: "ethereum",
        address: ethers.getAddress(nft.asset_contract.address),
        token_id: nft.token_id,
        image_url: nft.image_url,
      };
    }));
  } else {
    return responseError("invalid params");
  }
});
