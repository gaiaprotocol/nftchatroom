import {
  BodyNode,
  DomNode,
  el,
  PageFooter,
  TopBar,
  View,
} from "common-dapp-module";

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
        new TopBar({
          logo: el(
            "h1",
            "NFTChatRoom.com",
          ),
        }),
        this.content = el("main"),
        new PageFooter({
          logo: el(
            "h1",
            "BUIDL by ",
            el("a", "Gaia Protocol", {
              href: "https://gaiaprotocol.com",
              target: "_blank",
            }),
          ),
        }),
      ),
    );
  }

  public close(): void {
    this.container.delete();
    super.close();
  }
}
