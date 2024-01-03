import {
  configureChains,
  createConfig,
  getAccount,
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
import AuthManager from "./AuthManager.js";
import Config from "./Config.js";

class WalletManager extends EventContainer {
  private web3modal: Web3Modal;
  public _connected = false;

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
    }, ethereumClient);

    this._connected = getAccount().address !== undefined;
    watchAccount((account) => {
      const connected = account.address !== undefined;
      if (connected !== this._connected) {
        this._connected = connected;
        if (!connected) {
          AuthManager.logout();
        }
        this.fireEvent(connected ? "connect" : "disconnect");
      }
    });
  }

  public openModal() {
    this.web3modal.openModal();
  }

  public closeModal() {
    this.web3modal.closeModal();
  }

  public get _address() {
    return getAccount().address;
  }
}

export default new WalletManager();
