import { DomNode, el, RetroLoader, View } from "common-dapp-module";
import Layout from "./Layout.js";

export default class DesignTest extends View {
  private container: DomNode;

  constructor() {
    super();
    Layout.append(
      this.container = el(".home-view", new RetroLoader()),
    );
    //new AboutNFTChatRoomPopup();
  }

  public close(): void {
    this.container.delete();
    super.close();
  }
}
