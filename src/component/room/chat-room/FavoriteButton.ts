import { DomNode, el } from "common-dapp-module";

export default class FavoriteButton extends DomNode {
  constructor(roomId: string) {
    super("button.favorite-button");
    this.append(
      el("img", { src: "/images/add-icon.png" }),
      "Add NFT to Favorites",
    );
  }
}
