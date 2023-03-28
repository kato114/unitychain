import useSWR from "swr";
import { arrayURLFetcher, getTotalVolumeSum } from "lib/legacy";
import { ARBITRUM } from "config/chains"; //BSC, POLYGON, OPTIMISM,
import { getServerUrl } from "config/backend";
import { bigNumberify } from "lib/numbers";
const ACTIVE_CHAIN_IDS = [ARBITRUM]; //BSC, POLYGON, OPTIMISM,

export default function useTotalVolume() {
  const { data: totalVolume } = useSWR(
    ACTIVE_CHAIN_IDS.map((chain) => getServerUrl(chain, "/total_volume")),
    {
      fetcher: arrayURLFetcher,
    }
  );
  if (totalVolume?.length > 0) {
    return ACTIVE_CHAIN_IDS.reduce(
      (acc, chainId, index) => {
        const sum = getTotalVolumeSum(totalVolume[index]);
        acc[chainId] = sum;
        acc.total = acc.total.add(sum);
        return acc;
      },
      { total: bigNumberify(0) }
    );
  }
}