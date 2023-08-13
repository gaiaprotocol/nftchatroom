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
        image_url?: string;
      };
    };
  } | undefined;

  public async init() {
    const token = this.store.get<string>("token");
    if (token) {
      try {
        const response = await get(`check-token?token=${token}`);
        if (response.status !== 200) {
          console.log(await response.json());
          return;
        }
        const data = await response.json();
        if (data.walletAddress) {
          this.signed = {
            token,
            walletAddress: data.walletAddress,
            user: data.user,
          };
        } else {
          this.store.delete("token");
        }
      } catch (e) {
        this.store.delete("token");
        console.error(e);
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

  public setUserInfo(user: {
    ens?: string;
    pfp?: {
      image_url?: string;
    };
  }) {
    if (this.signed) {
      this.signed.user = user;
      this.fireEvent("authChanged");
    }
  }

  public signOut() {
    this.store.delete("token");
    this.signed = undefined;
    this.fireEvent("authChanged");
  }
}

export default new AuthManager();
