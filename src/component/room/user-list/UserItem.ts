import { DomNode, Jazzicon, StringUtil } from "common-dapp-module";
import UserDropdownMenu from "../../UserDropdownMenu.js";

export default class UserItem extends DomNode {
  constructor(user: {
    walletAddress: string;
    onlineAt: string;
  }) {
    super("li.user-item");
    this.append(
      new Jazzicon(user.walletAddress),
      StringUtil.shortenEthereumAddress(user.walletAddress),
    );
    this.onDom(
      "click",
      (event: MouseEvent) => {
        event.stopPropagation();
        new UserDropdownMenu(event.clientX, event.clientY, user.walletAddress);
      },
    );
  }
}
