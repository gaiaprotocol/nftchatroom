import { RealtimeChannel } from "@supabase/supabase-js";
import { ArrayUtil, DomNode, el, RetroLoader } from "common-dapp-module";
import ChatMessage from "../../../datamodel/ChatMessage.js";
import SupabaseManager from "../../../SupabaseManager.js";
import MessageItem from "./MessageItem.js";

export default class MessageList extends DomNode {
  private _roomId: string | undefined;
  private _channel: RealtimeChannel | undefined;
  private loading: boolean = false;

  private container: DomNode | undefined;
  private emptyMessage: DomNode | undefined;
  private items: MessageItem[] = [];

  constructor() {
    super(".message-list");
    this.onDelegate(SupabaseManager, "connect", () => this.openChannel());
  }

  public set roomId(roomId: string | undefined) {
    this._roomId = roomId;
    this.loadMessages();
    this.openChannel();
  }

  public get roomId() {
    return this._roomId;
  }

  private async loadMessages() {
    this.loading = true;
    this.items = [];

    this.empty().append(new RetroLoader());
    const { data, error } = await SupabaseManager.supabase.from("chat_messages")
      .select()
      .eq("room", this._roomId)
      .order("created_at", { ascending: false })
      .limit(100);
    this.empty();
    this.loading = false;

    this.container = el(
      "ul.container",
      el("li.blank"),
      this.emptyMessage = el(
        "li.empty",
        "There are no messages in this room. Write the first message!",
      ),
    ).appendTo(this);
    for (const message of data?.reverse() ?? []) {
      this.addItem(message);
    }
  }

  public findItem(id: number) {
    return this.items.find((item) => item.message.id === id);
  }

  public addItem(message: ChatMessage) {
    this.emptyMessage?.delete();
    this.emptyMessage = undefined;

    const item = new MessageItem(this._roomId!, message);
    this.items.push(item);
    item.on("delete", () => ArrayUtil.pull(this.items, item));

    if (this.container) {
      this.container.append(item);
      this.container.domElement.scrollTo(
        0,
        this.container.domElement.scrollHeight,
      );
    }
    return item;
  }

  private openChannel() {
    if (this._channel !== undefined) {
      SupabaseManager.supabase.removeChannel(this._channel);
    }
    if (this._roomId !== undefined) {
      this._channel = SupabaseManager.supabase
        .channel("message-changes")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "chat_messages",
            filter: "room=eq." + this._roomId,
          },
          (payload: any) => {
            this.findItem(payload.new.id)?.delete();
            this.addItem(payload.new);
          },
        )
        .subscribe();
    }
  }

  public delete() {
    this._channel?.unsubscribe();
    this._channel = undefined;
    super.delete();
  }
}
