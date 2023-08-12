import { getProvider } from "./blockchain.ts";

export const getENS: (address: string) => Promise<string | undefined> = async (
  address: string,
) => {
  const provider = getProvider("ethereum");
  if (provider) {
    const ens = await provider.lookupAddress(address);
    return ens ?? undefined;
  }
};
