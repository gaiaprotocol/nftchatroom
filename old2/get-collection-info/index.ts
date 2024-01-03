import { response, responseError, serveWithOptions } from "../_shared/cors.ts";
import { getCollectionInfo } from "../_shared/opensea.ts";

serveWithOptions(async (req) => {
  const u = new URL(req.url);
  const chain = u.searchParams.get("chain");
  const address = u.searchParams.get("address");
  const token = u.searchParams.get("token");

  const promises: Promise<void>[] = [];

  try {
    await Promise.all(promises);
  } catch (error) {
    return responseError(error);
  }

  if (chain && address) {
    const collection = await getCollectionInfo(chain, address);
    if (collection) {
      return response(collection);
    } else {
      return responseError("collection not found");
    }
  } else {
    return responseError("chain and address are required");
  }
});
