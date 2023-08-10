import { createClient } from "@supabase/supabase-js";
import {
  configureChains,
  createConfig,
  getAccount,
  signMessage,
} from "@wagmi/core";
import { mainnet } from "@wagmi/core/chains";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/html";
import { DomNode, el, View } from "common-dapp-module";
import Config from "../Config.js";
import { get, post } from "../_shared/edgeFunctionFetch.js";
import Layout from "./Layout.js";

export default class AuthTest extends View {
  private container: DomNode;
  private web3modal: Web3Modal;

  constructor() {
    super();
    Layout.append(
      this.container = el(".home-view"),
    );

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

    this.test();
  }

  private async test() {
    const walletAddress = getAccount().address;
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

    const supabase = createClient(Config.supabaseURL, Config.supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${tokenData.token}` } },
    });

    const { data, error } = await supabase
      .from("test")
      .insert({ test: "TEST!" })
      .select();
    console.log(data, error);
  }

  public close(): void {
    this.container.delete();
    super.close();
  }
}
