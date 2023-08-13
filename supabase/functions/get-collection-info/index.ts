import { response, responseError, serveWithOptions } from "../_shared/cors.ts";
import { getCollectionInfo } from "../_shared/opensea.ts";

serveWithOptions(async (req) => {
  const u = new URL(req.url);
  const chain = u.searchParams.get("chain");
  const address = u.searchParams.get("address");
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
