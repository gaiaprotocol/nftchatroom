import { BodyNode, DomNode, el, RetroTitleBar, View } from "common-app-module";
import AboutPopup from "../popup/common/AboutPopup.js";

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
          title: el(
            ".title",
            el("img", { src: "/images/title-logo.png" }),
            el("h1", "NFTChatRoom.com v1.0"),
          ),
          buttons: [{
            type: "help",
            click: () => new AboutPopup(),
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
