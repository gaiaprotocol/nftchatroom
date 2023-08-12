import { EventContainer, Store } from "common-dapp-module";
import { get, post } from "../_shared/edgeFunctionFetch.js";
import WalletManager from "./WalletManager.js";

class AuthManager extends EventContainer {
  private store = new Store("authStore");

  public signed: {
    token: string;
    walletAddress: string;
    user?: {
      ens?: string;
      pfp?: {
        chain: string;
        address: string;
        tokenId: string;
        url: string;
      };
    };
  } | undefined;

  public async init() {
    const token = this.store.get<string>("token");
    if (token) {
      const reponse = await get(`check-token?token=${token}`);
      if (reponse.status !== 200) {
        console.log(await reponse.json());
        return;
      }
      const data = await reponse.json();
      if (data.walletAddress) {
        this.signed = {
          token,
          walletAddress: data.walletAddress,
          user: data.user,
        };
      } else {
        this.store.delete("token");
      }
    }
  }

  public async signIn(remember: boolean) {
    const walletAddress = WalletManager.address;
    if (walletAddress === undefined) {
      throw new Error("Wallet is not connected");
    }

    const nonceResponse = await get(
      `new-nonce?wallet_address=${walletAddress}`,
    );
    if (nonceResponse.status !== 200) {
      console.log(await nonceResponse.json());
      throw new Error("Failed to get nonce");
    }

    const nonceData = await nonceResponse.json();
    const signedMessage = await WalletManager.signMessage(
      `Sign in to NFTChatRoom.com\nNonce: ${nonceData.nonce}`,
    );

    const loginResponse = await post("sign-in", {
      walletAddress,
      signedMessage,
    });
    const tokenData = await loginResponse.json();

    this.store.set("token", tokenData.token, remember);
    this.signed = {
      token: tokenData.token,
      walletAddress,
      user: tokenData.user,
    };
    this.fireEvent("authChanged");
  }

  public signOut() {
    this.store.delete("token");
    this.signed = undefined;
    this.fireEvent("authChanged");
  }
}

export default new AuthManager();
