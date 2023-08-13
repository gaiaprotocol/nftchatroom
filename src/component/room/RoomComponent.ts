import { BrowserInfo, DomNode, el, Store } from "common-dapp-module";
import { get } from "../../_shared/edgeFunctionFetch.js";
import AuthManager from "../../auth/AuthManager.js";
import Constants from "../../Constants.js";
import { Room } from "../../datamodel/Room.js";
import ChatRoom from "./chat-room/ChatRoom.js";
import FavoriteButton from "./chat-room/FavoriteButton.js";
import RoomList from "./room-list/RoomList.js";
import RoomInfoTab from "./RoomInfoTab.js";
import Tabs from "./tab/Tabs.js";
import Toolbar from "./toolbar/Toolbar.js";
import UserList from "./user-list/UserList.js";

export default class RoomComponent extends DomNode {
  private settingStore: Store = new Store("setting");

  private toolbar: Toolbar;
  private roomList: RoomList;
  private header: DomNode;
  private roomTitle: DomNode;
  private favoriteButton: FavoriteButton | undefined;
  private info: RoomInfoTab;
  private chatRoom: ChatRoom;
  private userList: UserList;

  private roomListOpened = BrowserInfo.isPhoneSize
    ? false
    : this.settingStore.get("roomListDeactivated") !== true;

  private userListOpened = BrowserInfo.isPhoneSize
    ? false
    : this.settingStore.get("userListDeactivated") !== true;

  private currentRoomId?: string;

  constructor() {
    super(".room");

    let tabs;
    this.append(
      this.toolbar = new Toolbar(),
      el(
        "main",
        this.roomList = new RoomList(),
        el(
          ".container",
          this.header = el(
            "header",
            this.roomTitle = el("h1"),
            tabs = new Tabs([
              { id: "info", label: "Info" },
              { id: "chat", label: "ChatRoom" },
            ]),
          ),
          this.info = new RoomInfoTab(),
          this.chatRoom = new ChatRoom(),
        ),
        this.userList = new UserList(),
      ),
    );

    tabs.on("select", (id: string) => {
      this.info.inactive();
      this.chatRoom.inactive();

      if (id === "info") {
        this.info.active();
      } else if (id === "chat") {
        this.chatRoom.active();
      }
    });
    tabs.select("chat");

    this.roomList.on("select", () => {
      if (BrowserInfo.isPhoneSize) {
        this.deactivateRoomList();
        this.deactivateUserList();
      }
    });

    this.roomListOpened ? this.activateRoomList() : this.deactivateRoomList();
    this.userListOpened ? this.activateUserList() : this.deactivateUserList();

    this.toolbar.on("toggleRoomList", () => {
      this.roomListOpened ? this.deactivateRoomList() : this.activateRoomList();
    });

    this.toolbar.on("toggleUserList", () => {
      this.userListOpened ? this.deactivateUserList() : this.activateUserList();
    });

    this.chatRoom.on("saveRoomProfile", (roomProfile) => this.userList.createChannel(roomProfile.pfp));

    this.onDelegate(AuthManager, "authChanged", () => {
      if (this.currentRoomId?.includes(":")) {
        this.checkNFTOwned(this.currentRoomId);
      } else {
        this.chatRoom.clearProfile();
        this.chatRoom.showMessageBox();
      }
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

  public set room(room: Room) {
    this.favoriteButton?.delete();
    this.favoriteButton = undefined;

    const roomId = room.type === "general"
      ? room.uri
      : `${room.chain}:${room.address}`;
    this.currentRoomId = roomId;

    this.userList.roomId = roomId;
    this.chatRoom.roomId = roomId;
    this.roomList.currentRoom = room;

    this.roomTitle.empty();
    if (room.type === "general") {
      const roomInfo = Constants.GENERAL_ROOMS[roomId];
      if (roomInfo) {
        this.roomTitle.text = roomInfo.name;
      }
      this.info.room = { type: "general", uri: roomId };
      this.chatRoom.clearProfile();
    } else if (room.type === "nft") {
      this.checkNFTOwned(roomId);
      this.favoriteButton = new FavoriteButton(roomId);
      this.header.append(this.favoriteButton);
    }
  }

  private async checkNFTOwned(roomId: string) {
    this.roomTitle.text = "Loading...";
    this.chatRoom.checkingNFTOwned();

    const response = await get(
      AuthManager.signed
        ? `check-nft-owned?token=${AuthManager.signed.token}&room=${roomId}`
        : `check-nft-owned?room=${roomId}`,
    );
    if (response.status !== 200) {
      console.log(await response.json());
      return;
    }

    const data = await response.json();
    this.chatRoom.setNFTOwned(data.owned, data.collection, data.profile);
    if (data.profile?.pfp) {
      this.userList.createChannel(data.profile.pfp);
    }

    if (data.collection?.metadata) {
      this.roomTitle.empty().append(
        !data.collection.metadata.image
          ? undefined
          : el("img", { src: data.collection.metadata.image }),
        data.collection.metadata.name,
      );
    }
    this.info.room = {
      type: "nft",
      ...data.collection,
    };
    if (this.favoriteButton) {
      this.favoriteButton.room = this.info.room;
    }
  }
}
