import { DomNode } from "common-dapp-module";
import Toolbar from "./Toolbar.js";

export default class ChatRoom extends DomNode {
  constructor() {
    super(".chat-room");
    this.append(new Toolbar());
  }
}
