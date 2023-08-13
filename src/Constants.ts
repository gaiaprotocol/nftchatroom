export default {
  GENERAL_ROOMS: {
    general: {
      name: "General",
      description: "General chat room",
    },
    memes: {
      name: "Memes",
      description: "Memes chat room",
    },
  } as {
    [key: string]: {
      name: string;
      description: string;
    };
  },
};
