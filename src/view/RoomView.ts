import { DomNode, el, View, ViewParams } from "common-dapp-module";
import { ethers } from "ethers";
import RoomComponent from "../component/room/RoomComponent.js";
import Layout from "./Layout.js";

export default class RoomView extends View {
  private container: DomNode;
  private roomComponent: RoomComponent;

  constructor(params: ViewParams) {
    super();
    Layout.append(
      this.container = el(
        ".room-view",
        this.roomComponent = new RoomComponent(),
      ),
    );
    if (params.uri) {
      this.enterGeneralRoom(params.uri);
    } else if (params.chain && params.address) {
      this.enterNFTRoom(params.chain, params.address);
    } else {
      this.enterGeneralRoom("general");
    }
  }

  public changeParams(params: ViewParams): void {
    if (params.uri) {
      this.enterGeneralRoom(params.uri);
    } else if (params.chain && params.address) {
      this.enterNFTRoom(params.chain, params.address);
    } else {
      this.enterGeneralRoom("general");
    }
  }

  private enterGeneralRoom(uri: string) {
    this.roomComponent.room = { type: "general", uri };
  }

  private enterNFTRoom(chain: string, address: string) {
    this.roomComponent.room = { type: "nft", nft: `${chain}:${ethers.getAddress(address)}`, metadata: {} };
  }

  public close(): void {
    this.container.delete();
    super.close();
  }
}
