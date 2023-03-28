import { createClient } from "./utils";
import { SUBGRAPH_URLS } from "config/subgraph";
import { ARBITRUM } from "config/chains"; //BSC, POLYGON, OPTIMISM,

export const chainlinkClient = createClient(SUBGRAPH_URLS.common.chainLink);

// export const bscGraphClient = createClient(SUBGRAPH_URLS[BSC].stats);
// export const bscReferralsGraphClient = createClient(SUBGRAPH_URLS[BSC].referrals);
// export const nissohGraphClient = createClient(SUBGRAPH_URLS[BSC].trades);

// export const polygonGraphClient = createClient(SUBGRAPH_URLS[POLYGON].stats);
// export const polygonReferralsGraphClient = createClient(SUBGRAPH_URLS[POLYGON].referrals);
// export const polygonGraphClientForTrades = createClient(SUBGRAPH_URLS[POLYGON].trades);

// export const optimismGraphClient = createClient(SUBGRAPH_URLS[OPTIMISM].stats);
// export const optimismReferralsGraphClient = createClient(SUBGRAPH_URLS[OPTIMISM].referrals);
// export const optimismGraphClientForTrades = createClient(SUBGRAPH_URLS[OPTIMISM].trades);

export const arbitrumGraphClient = createClient(SUBGRAPH_URLS[ARBITRUM].stats);
export const arbitrumReferralsGraphClient = createClient(SUBGRAPH_URLS[ARBITRUM].referrals);
export const arbitrumGraphClientForTrades = createClient(SUBGRAPH_URLS[ARBITRUM].trades);

export function getUnityGraphClient(chainId: number) {
  // if (chainId === BSC) {
  //   return bscGraphClient;
  // } else if (chainId === POLYGON) {
  //   return polygonGraphClient;
  // } else if (chainId === OPTIMISM) {
  //   return optimismGraphClient;
  // } else if (chainId === ARBITRUM) {
  //   return arbitrumGraphClient;
  // }

  return arbitrumGraphClient;

  throw new Error(`Unsupported chain ${chainId}`);
}
