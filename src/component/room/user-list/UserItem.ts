import { DomNode, el, Jazzicon, StringUtil } from "common-dapp-module";
import UserDropdownMenu from "../../UserDropdownMenu.js";

export default class UserItem extends DomNode {
  constructor(user: {
    ens?: string;
    walletAddress: string;
    pfp?: { image_url?: string };
    onlineAt: string;
  }, room: string) {
    super("li.user-item");
    this.append(
      user.pfp?.image_url
        ? el("img", { src: user.pfp.image_url })
        : new Jazzicon(user.walletAddress),
      user.ens
        ? user.ens
        : StringUtil.shortenEthereumAddress(user.walletAddress),
    );
    this.onDom(
      "click",
      (event: MouseEvent) => {
        event.stopPropagation();
        new UserDropdownMenu(
          event.clientX,
          event.clientY,
          user.walletAddress,
          room,
        );
      },
    );
  }
}
