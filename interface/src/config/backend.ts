import { ARBITRUM } from "./chains"; //BSC, POLYGON, OPTIMISM,

export const UNITY_STATS_API_URL = "https://stats.gmx.io/api";

const BACKEND_URLS = {
  default: "https://gmx-avax-server.uc.r.appspot.com",
  // [BSC]: "https://gmx-avax-server.uc.r.appspot.com",
  // [POLYGON]: "https://gmx-avax-server.uc.r.appspot.com",
  // [OPTIMISM]: "https://gmx-avax-server.uc.r.appspot.com",
  [ARBITRUM]: "https://gmx-avax-server.uc.r.appspot.com",
};

export function getServerBaseUrl(chainId: number) {
  if (!chainId) {
    throw new Error("chainId is not provided");
  }

  if (document.location.hostname.includes("deploy-preview")) {
    const fromLocalStorage = localStorage.getItem("SERVER_BASE_URL");
    if (fromLocalStorage) {
      return fromLocalStorage;
    }
  }

  return BACKEND_URLS[chainId] || BACKEND_URLS.default;
}

export function getServerUrl(chainId: number, path: string) {
  return `${getServerBaseUrl(chainId)}${path}`;
}
