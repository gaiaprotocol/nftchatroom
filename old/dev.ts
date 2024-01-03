import Config from "./Config.js";
import install from "./install.js";

Config.devMode = true;
Config.supabaseURL = "http://localhost:54321";
Config.supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
Config.walletConnectProjectID = "5172976fa0771c24000c8c5afeb67023";

await install();
