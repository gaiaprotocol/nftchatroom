import {
  Component,
  DomNode,
  el,
  Popup,
  RetroTitleBar,
} from "common-dapp-module";
import { ethers } from "ethers";
import { get, post } from "../../_shared/edgeFunctionFetch.js";
import AuthManager from "../../auth/AuthManager.js";
import RoomInfoDisplay from "../../component/RoomInfoDisplay.js";
import { NFTRoom } from "../../datamodel/Room.js";
import FavoriteManager from "../../FavoriteManager.js";

export default class AddFavoritePopup extends Popup {
  public content: DomNode;

  private chainSelect: DomNode<HTMLSelectElement>;
  private addressInput: DomNode<HTMLInputElement>;
  private info: DomNode;
  private addButton: DomNode<HTMLButtonElement>;

  private room: NFTRoom | undefined;
  private debounceTimer: number | null = null;
  private readonly DEBOUNCE_DELAY = 500;

  constructor() {
    super({ barrierDismissible: true });
    this.append(
      this.content = new Component(
        ".add-favorite-popup",
        new RetroTitleBar({
          title: "Add NFT to Favorites",
          buttons: [{
            type: "close",
            click: () => this.delete(),
          }],
        }),
        el(
          "main",
          el(
            ".field",
            el("label", "Chain"),
            this.chainSelect = el(
              "select",
              el("option", "Ethereum", { value: "ethereum" }),
              el("option", "Polygon", { value: "matic" }),
              el("option", "BNB Chain", { value: "bsc" }),
              el("option", "Bifrost", { value: "bifrost" }),
              el("option", "Klaytn", { value: "klaytn" }),
              { change: () => this.handleInputChange() },
            ),
          ),
          el(
            ".field",
            el("label", "Address"),
            this.addressInput = el("input", {
              keydown: () => this.handleInputChange(),
            }),
          ),
          this.info = el(".info"),
        ),
        el(
          "footer",
          this.addButton = el(
            "button.add-button",
            {
              click: async () => {
                if (this.room && AuthManager.signed) {
                  if (this.room.type === "nft") {
                    this.room.favoriteCount += 1;
                  }
                  FavoriteManager.addNew(this.room);
                  post("favorite", {
                    token: AuthManager.signed.token,
                    room: this.room.nft,
                  });
                  this.delete();
                }
              },
            },
            "Add",
          ),
          el(
            "button.cancel-button",
            { click: () => this.delete() },
            "Cancel",
          ),
        ),
      ),
    );
    this.addButton.domElement.disabled = true;
  }

  private handleInputChange = () => {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.fetchCollectionInfo();
    }, this.DEBOUNCE_DELAY) as any;
  };

  private async fetchCollectionInfo() {
    this.room = undefined;
    this.addButton.domElement.disabled = true;
    this.info.empty().append(el(".loading", "Loading..."));

    try {
      const address = ethers.getAddress(this.addressInput.domElement.value);
      const response = await get(
        `get-collection?chain=${this.chainSelect.domElement.value}&address=${address}`,
      );
      if (response.status !== 200) {
        console.log(await response.json());
        return;
      }

      const data = await response.json();
      if (data) {
        this.room = {
          type: "nft",
          ...data.collection,
          favoriteCount: data.collection.favorite_count,
        } as NFTRoom;
        this.info.empty().append(new RoomInfoDisplay(this.room));
        this.addButton.domElement.disabled = false;
      }
    } catch (e) {
      console.error(e);
      this.info.empty();
    }
  }
}
