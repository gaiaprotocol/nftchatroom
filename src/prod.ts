import Config from "./Config.js";
import install from "./install.js";

Config.supabaseURL = "https://fmgxxkshrsinnnynvyqo.supabase.co";
Config.supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtZ3h4a3NocnNpbm5ueW52eXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTE0MTM2MjEsImV4cCI6MjAwNjk4OTYyMX0.f8QzTt3k6UhMKtlvvOR-oOE0L5TU7GDe9F7uMZIOabY";
Config.walletConnectProjectID = "5172976fa0771c24000c8c5afeb67023";

await install();
