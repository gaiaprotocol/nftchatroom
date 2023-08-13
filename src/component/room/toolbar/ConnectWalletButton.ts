import { DomNode, el, Jazzicon, StringUtil } from "common-dapp-module";
import AuthManager from "../../../auth/AuthManager.js";
import MyInfoPopup from "../../../popup/MyInfoPopup.js";
import SignInPopup from "../../../popup/SignInPopup.js";

export default class ConnectWalletButton extends DomNode {
  constructor() {
    super("button.connet-wallet-button");

    this.onDom(
      "click",
      () => AuthManager.signed ? new MyInfoPopup() : new SignInPopup(),
    );

    this.refresh();
    this.onDelegate(AuthManager, "authChanged", () => this.refresh());
  }

  private refresh() {
    this.empty();
    if (AuthManager.signed) {
      this.append(
        AuthManager.signed.user?.pfp?.image_url
          ? el("img", { src: AuthManager.signed.user.pfp.image_url })
          : new Jazzicon(AuthManager.signed.walletAddress),
        AuthManager.signed.user?.ens ??
          StringUtil.shortenEthereumAddress(AuthManager.signed.walletAddress),
      );
    } else {
      this.append(
        el("img", { src: "/images/toolbar/connect-wallet.png" }),
        "Connect Wallet",
      );
    }
  }
}
