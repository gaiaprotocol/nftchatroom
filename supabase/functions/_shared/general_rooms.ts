const general_rooms = {
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
};

export default general_rooms;
