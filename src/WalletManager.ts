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
import { EventContainer } from "common-dapp-module";
import Config from "./Config.js";

class WalletManager extends EventContainer {
  private web3modal: Web3Modal;
  public connected = false;

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

    this.connected = getAccount().address !== undefined;
    watchAccount((account) => {
      const connected = account.address !== undefined;
      if (connected !== this.connected) {
        this.connected = connected;
        this.fireEvent(connected ? "connect" : "disconnect");
      }
    });
  }

  public openModal() {
    this.web3modal.openModal();
  }

  public get address() {
    return getAccount().address;
  }
}

export default new WalletManager();
