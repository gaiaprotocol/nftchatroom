import { signMessage, watchAccount } from "@wagmi/core";
import { EventContainer, Store } from "common-dapp-module";
import SupabaseManager from "./SupabaseManager.js";
import WalletManager from "./WalletManager.js";
import { get, post } from "./_shared/edgeFunctionFetch.js";

class AuthManager extends EventContainer {
  private waitingWalletConnect: boolean = false;
  private store = new Store("authStore");

  public get token(): string | undefined {
    return this.store.get("token");
  }

  public signed = this.token !== undefined;

  public init() {
    watchAccount((account) => {
      if (account.address && this.waitingWalletConnect) {
        this.waitingWalletConnect = false;
        this.sign();
      }
    });
  }

  private async sign(remember: boolean = false) {
    const walletAddress = WalletManager._address;
    const nonceResponse = await get(
      `new-nonce?wallet_address=${walletAddress}`,
    );
    if (nonceResponse.status !== 200) {
      console.log(await nonceResponse.json());
      return;
    }

    const nonceData = await nonceResponse.json();
    const signedMessage = await signMessage({
      message: `Sign in to NFTChatRoom.com\nNonce: ${nonceData.nonce}`,
    });

    const loginResponse = await post("login", {
      walletAddress,
      signedMessage,
    });
    const tokenData = await loginResponse.json();
    this.store.set("token", tokenData.token, remember);
    this.signed = true;
    this.fireEvent("login");

    SupabaseManager.connect();
    WalletManager.closeModal();
  }

  public async login() {
    WalletManager.openModal();
    if (!WalletManager._connected) {
      this.waitingWalletConnect = true;
    } else {
      this.sign();
    }
  }

  public logout() {
    this.store.delete("token");
    this.signed = false;
    this.fireEvent("logout");
    SupabaseManager.connect();
  }
}

export default new AuthManager();
