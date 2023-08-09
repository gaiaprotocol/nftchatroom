import { configureChains, createConfig } from "@wagmi/core";
import { mainnet } from "@wagmi/core/chains";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/html";
import Config from "./Config.js";

class WalletManager {
  private web3modal: Web3Modal;

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
  }

  public openModal() {
    this.web3modal.openModal();
  }
}

export default new WalletManager();
