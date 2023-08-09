import { BodyNode, DomNode, el, RetroTitleBar, View } from "common-dapp-module";
import AboutNFTChatRoomPopup from "../component/AboutNFTChatRoomPopup.js";

export default class Layout extends View {
  private static current: Layout;

  public static append(node: DomNode): void {
    Layout.current.content.append(node);
  }

  private container: DomNode;
  private content: DomNode;

  constructor() {
    super();
    Layout.current = this;

    BodyNode.append(
      this.container = el(
        ".layout",
        new RetroTitleBar({
          title: "NFTChatRoom.com",
          buttons: [{
            type: "help",
            click: () => new AboutNFTChatRoomPopup(),
          }],
        }),
        this.content = el("main"),
      ),
    );
  }

  public close(): void {
    this.container.delete();
    super.close();
  }
}
