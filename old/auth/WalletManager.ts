import {
  configureChains,
  createConfig,
  getAccount,
  signMessage,
  watchAccount,
} from "@wagmi/core";
import { mainnet } from "@wagmi/core/chains";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/html";
import { EventContainer } from "common-app-module";
import Config from "../Config.js";

class WalletManager extends EventContainer {
  private web3modal: Web3Modal;
  private _resolveConnection?: (value: boolean) => void;

  public connected = false;
  public get address() {
    return getAccount().address;
  }

  public init() {
    const chains = [mainnet];

    const { publicClient } = configureChains(chains, [
      w3mProvider({ projectId: Config.walletConnectProjectID }),
    ]);
    const wagmiConfig = createConfig({
      autoConnect: true,
      connectors: w3mConnectors({
        projectId: Config.walletConnectProjectID,
        chains,
      }),
      publicClient,
    });
    const ethereumClient = new EthereumClient(wagmiConfig, chains);
    this.web3modal = new Web3Modal({
      projectId: Config.walletConnectProjectID,
      themeVariables: {
        "--w3m-z-index": 999999,
      },
    }, ethereumClient);

    this.connected = this.address !== undefined;

    watchAccount((account) => {
      this.connected = account.address !== undefined;
      if (this._resolveConnection) {
        this._resolveConnection(this.connected);
      }
      this.fireEvent("accountChanged");
    });
  }

  public async connect() {
    if (this.address !== undefined) {
      this.connected = true;
      this.fireEvent("accountChanged");
      return true;
    }
    return new Promise<boolean>((resolve) => {
      this._resolveConnection = resolve;
      this.openModal();
    });
  }

  public openModal() {
    this.web3modal.openModal();
  }

  public async signMessage(message: string) {
    const walletAddress = this.address;
    if (!walletAddress) {
      throw new Error("Wallet is not connected");
    } else {
      return await signMessage({ message });
    }
  }
}

export default new WalletManager();
