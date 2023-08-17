import { DomNode, el } from "common-dapp-module";
import FavoriteManager from "../../../FavoriteManager.js";
import { deleteRequest, post } from "../../../_shared/edgeFunctionFetch.js";
import AuthManager from "../../../auth/AuthManager.js";
import { Room } from "../../../datamodel/Room.js";
import SignInPopup from "../../../popup/user/SignInPopup.js";

export default class FavoriteButton extends DomNode {
  public room: Room | undefined;

  constructor(roomId: string) {
    super("button.favorite-button");

    if (FavoriteManager.check(roomId)) {
      this.append(
        el("img", { src: "/images/remove-icon.png" }),
        "Remove from Favorites",
      );
    } else {
      this.append(
        el("img", { src: "/images/add-icon.png" }),
        "Add to Favorites",
      );
    }

    this.onDelegate(FavoriteManager, "add", (room: Room) => {
      if (
        (room.type === "general" && room.uri === roomId) ||
        (room.type === "nft" && room.nft === roomId)
      ) {
        this.empty().append(
          el("img", { src: "/images/remove-icon.png" }),
          "Remove from Favorites",
        );
      }
    });

    this.onDelegate(FavoriteManager, "remove", (roomId: string) => {
      if (roomId === roomId) {
        this.empty().append(
          el("img", { src: "/images/add-icon.png" }),
          "Add to Favorites",
        );
      }
    });

    this.onDom("click", () => {
      if (!AuthManager.signed) {
        new SignInPopup();
      } else if (FavoriteManager.check(roomId)) {
        this.remove();
      } else {
        this.add();
      }
    });
  }

  private add(): void {
    if (this.room && AuthManager.signed) {
      FavoriteManager.add(this.room);
      post("favorite", {
        token: AuthManager.signed.token,
        room: this.room.type === "general" ? this.room.uri : this.room.nft,
      });
    }
  }

  private remove(): void {
    if (this.room && AuthManager.signed) {
      FavoriteManager.remove(
        this.room.type === "general" ? this.room.uri : this.room.nft,
      );
      deleteRequest("favorite", {
        token: AuthManager.signed.token,
        room: this.room.type === "general" ? this.room.uri : this.room.nft,
      });
    }
  }
}
