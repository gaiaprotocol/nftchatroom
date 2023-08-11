import { DomNode, el, Jazzicon, StringUtil } from "common-dapp-module";

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
  }
}
