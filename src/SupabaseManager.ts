import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { EventContainer } from "common-dapp-module";
import AuthManager from "./AuthManager.js";
import Config from "./Config.js";

class SupabaseManager extends EventContainer {
  public supabase!: SupabaseClient;

  public connect() {
    this.supabase?.removeAllChannels();
    this.supabase = AuthManager.token === undefined
      ? createClient(Config.supabaseURL, Config.supabaseAnonKey)
      : createClient(Config.supabaseURL, Config.supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${AuthManager.token}` } },
      });
    this.fireEvent("connect");
  }
}

export default new SupabaseManager();
