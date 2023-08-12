export default interface NFTCollection {
  chain: string;
  address: string;
  metadata: {
    name?: string;
    description?: string;
    image?: string;
    bannerImage?: string;
    externalLink?: string;
    discordURL?: string;
    telegramURL?: string;
    twitterUsername?: string;
    slug?: string;
  };
}
