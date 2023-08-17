export default interface NFTCollection {
  nft: string;
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
