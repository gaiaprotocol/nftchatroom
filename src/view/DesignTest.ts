import { DomNode, el, RetroLoader, View } from "common-dapp-module";
import Layout from "./Layout.js";
import WalletManager from "../WalletManager.js";

export default class DesignTest extends View {
  private container: DomNode;

  constructor() {
    super();
    Layout.append(
      this.container = el(".home-view", new RetroLoader()),
    );
    //WalletManager.openModal();
  }

  public close(): void {
    this.container.delete();
    super.close();
  }
}
