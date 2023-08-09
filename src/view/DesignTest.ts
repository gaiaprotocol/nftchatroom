import { DomNode, el, View } from "common-dapp-module";
import Layout from "./Layout.js";
import AboutNFTChatRoomPopup from "../component/AboutNFTChatRoomPopup.js";

export default class DesignTest extends View {
  private container: DomNode;

  constructor() {
    super();
    Layout.append(
      this.container = el(".home-view"),
    );
    new AboutNFTChatRoomPopup();
  }

  public close(): void {
    this.container.delete();
    super.close();
  }
}
