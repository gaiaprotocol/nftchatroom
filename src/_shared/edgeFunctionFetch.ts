import Config from "../Config.js";

export const get = async (uri: string) => {
  return await fetch(
    `${Config.supabaseURL}/functions/v1/${uri}`,
    {
      headers: {
        Authorization: `Bearer ${Config.supabaseAnonKey}`,
      },
    },
  );
};

export const post = async (uri: string, body: any) => {
  return await fetch(
    `${Config.supabaseURL}/functions/v1/${uri}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Config.supabaseAnonKey}`,
      },
      body: JSON.stringify(body),
    },
  );
};
