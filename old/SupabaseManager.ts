import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { EventContainer } from "common-app-module";
import AuthManager from "./auth/AuthManager.js";
import Config from "./Config.js";

class SupabaseManager extends EventContainer {
  public supabase!: SupabaseClient;

  constructor() {
    super();
    AuthManager.on("authChanged", () => this.connect());
  }

  public connect() {
    this.supabase?.removeAllChannels();
    this.supabase = AuthManager.signed === undefined
      ? createClient(Config.supabaseURL, Config.supabaseAnonKey)
      : createClient(Config.supabaseURL, Config.supabaseAnonKey, {
        global: {
          headers: { Authorization: `Bearer ${AuthManager.signed.token}` },
        },
      });
    this.fireEvent("connect");
  }
}

export default new SupabaseManager();
