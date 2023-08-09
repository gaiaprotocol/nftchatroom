import { BrowserInfo, DomNode, el, Store } from "common-dapp-module";
import MessageList from "./message-list/MessageList.js";
import RoomList from "./room-list/RoomList.js";
import Toolbar from "./Toolbar.js";
import UserList from "./user-list/UserList.js";

export default class ChatRoom extends DomNode {
  private settingStore: Store = new Store("setting");

  private toolbar: Toolbar;
  private roomList: RoomList;
  private messageList: MessageList;
  private userList: UserList;

  private roomListOpened = BrowserInfo.isPhoneSize
    ? false
    : this.settingStore.get("roomListDeactivated") !== true;

  private userListOpened = BrowserInfo.isPhoneSize
    ? false
    : this.settingStore.get("userListDeactivated") !== true;

  constructor() {
    super(".chat-room");

    this.append(
      this.toolbar = new Toolbar(),
      el(
        "main",
        this.roomList = new RoomList(),
        this.messageList = new MessageList(),
        this.userList = new UserList(),
      ),
    );

    this.roomListOpened ? this.activateRoomList() : this.deactivateRoomList();
    this.userListOpened ? this.activateUserList() : this.deactivateUserList();

    this.toolbar.on("toggleRoomList", () => {
      this.roomListOpened ? this.deactivateRoomList() : this.activateRoomList();
    });

    this.toolbar.on("toggleUserList", () => {
      this.userListOpened ? this.deactivateUserList() : this.activateUserList();
    });
  }

  private activateRoomList(): void {
    this.roomListOpened = true;
    if (BrowserInfo.isPhoneSize === true) {
      this.deactivateUserList();
    } else {
      this.settingStore.set("roomListDeactivated", false, true);
    }
    this.roomList.active();
    this.toolbar.activateRoomListButton();
  }

  private deactivateRoomList(): void {
    this.roomListOpened = false;
    if (BrowserInfo.isPhoneSize !== true) {
      this.settingStore.set("roomListDeactivated", true, true);
    }
    this.roomList.inactive();
    this.toolbar.deactivateRoomListButton();
  }

  private activateUserList(): void {
    this.userListOpened = true;
    if (BrowserInfo.isPhoneSize === true) {
      this.deactivateRoomList();
    } else {
      this.settingStore.set("userListDeactivated", false, true);
    }
    this.userList.active();
    this.toolbar.activateUserListButton();
  }

  private deactivateUserList(): void {
    this.userListOpened = false;
    if (BrowserInfo.isPhoneSize !== true) {
      this.settingStore.set("userListDeactivated", true, true);
    }
    this.userList.inactive();
    this.toolbar.deactivateUserListButton();
  }
}
