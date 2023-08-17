const general_rooms = {
  general: {
    name: "General",
    description:
      "A space for members to engage in casual conversations, introduce themselves, and discuss a variety of topics not covered in other channels.",
    uri: "general",
  },
  memes: {
    name: "Memes",
    description:
      "Share, enjoy, and discuss your favorite memes! Whether they're humorous, thought-provoking, or just plain silly, this is the place for all meme enthusiasts.",
    uri: "memes",
  },
  art: {
    name: "Art",
    description:
      "Dedicated to artists and art enthusiasts. Share your creations, discuss techniques, and immerse yourself in the world of visual arts, music, literature, and more.",
    uri: "art",
  },
} as {
  [key: string]: {
    name: string;
    description: string;
    uri: string;
  };
};

export default general_rooms;
