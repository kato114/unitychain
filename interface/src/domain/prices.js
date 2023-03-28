import { useMemo } from "react";
import { gql } from "@apollo/client";
import useSWR from "swr";
import { ethers } from "ethers";

import { USD_DECIMALS, CHART_PERIODS } from "lib/legacy";
import { UNITY_STATS_API_URL } from "config/backend";
import { chainlinkClient } from "lib/subgraph/clients";
import { sleep } from "lib/sleep";
import { formatAmount } from "lib/numbers";

const BigNumber = ethers.BigNumber;

// Ethereum network, Chainlink Aggregator contracts
const FEED_ID_MAP = {
  MATIC_USD: "0x4b35f7854e1fd8291f4ec714ac3ebb1dea450585",
  ETH_USD: "0x37bc7498f4ff12c19678ee8fe19d713b87f6a9e6",
  BTC_USD: "0xae74faa92cb67a95ebcab07358bc222e33a34da7",
  BNB_USD: "0xc45ebd0f901ba6b2b8c7e70b717778f055ef5e6d",
  CRV_USD: "0xb4c4a493ab6356497713a78ffa6c60fb53517c63",
  SOL_USD: "0xdf30249744a419891f822ea4a9e80cd76d7fbd23",
  renDOGE_USD: "0x33cca8e7420114db103d61bd39a72ff65e46352d",
  AVAX_USD: "0x0fc3657899693648bba4dbd2d8b33b82e875105d",
  SAND_USD: "0xdf627aa5b9c024818c6950fdad7e4c16d93b10ca",
  MANA_USD: "0x7be21aef96e2faeb8dc0d07306814319ca034cad",
  "1INCH_USD": "0xd2bdd1e01fd2f8d7d42b209c111c7b32158b5a42",
  APE_USD: "0xa99999b1475f24037e8b6947abbc7710676e77dd",
  SNX_USD: "0x06ce8be8729b6ba18dd3416e3c223a5d4db5e755",
  AAVE_USD: "0xe3f0dede4b499c07e12475087ab1a084b5f93bc0",
  LINK_USD: "0xdfd03bfc3465107ce570a0397b247f546a42d0fa",
  MKR_USD: "0x908edc7e1974ecab1ca7164424bc4cac287d83ad",
  SUSHI_USD: "0x7213536a36094cd8a768a5e45203ec286cba2d74",
  FRAX_USD: "0x61eb091ea16a32ea5b880d0b3d09d518c340d750",
  OMG_USD: "0x34b41725cf934866a4b89d65395f15af2cb9ae89",
  USDC_USD: "0x8fffffd4afb6115b954bd326cbe7b4ba576818f6",
  USDT_USD: "0x3e7d1eab13ad0104d2750b8863b489d65364e32d",
  DAI_USD: "0xaed0c38402a5d19df6e4c03f4e2dced6e29c1ee9",
  BUSD_USD: "0x833d8eb16d306ed1fbb5d7a2e019e106b960965a",
  UNI_USD: "0x553303d460ee0afb37edff9be42922d8ff63220e",
  LIDO_ETH: "0x4e844125952d32acdf339be976c98e22f6f318db",
  CURVE_USD: "0xcd627aa160a6fa45eb793d19ef54f5062f20f33f",
  GMX_USD: "",
  BALANCER_USD: "0xdf2917806e30300537aeb49a7663062f4d1f2b5f",
  MAGIC_USD: "",
  KNC_USD: "0xf8ff43e991a81e6ec886a3d281a2c6cc19ae70fc",
  DPX_USD: "",
  DODO_USD: "0x9613a51ad59ee375e6d8fa12eeef0281f1448739",
  OP_USD: "",
  WOO_USD: "",
  CAKE_USD: "0xeb0adf5c06861d6c07174288ce4d0a8128164003",
  BISWAP_USD: "",
  SHIBA_ETH: "0x8dd1cd88f43af196ae478e91b9f5e4ac69a97c61",
  ATOM_USD: "0xdc4bdb458c6361093069ca2ad30d74cc152edc75",
  AXS_ETH: "0x8b4fc5b68cd50eac1dd33f695901624a4a1a0a8b",
  FTM_ETH: "0x2de7e4a9488488e0058b95854cc2f7955b35dc9b",
  COMPOUND_USD: "0xdbd020caef83efd542f4de03e3cf0c28a4428bd5",
  FETCH_USD: "",
  MASK_USD: "",
  ONT_USD: "0xcda3708c5c2907fcca52bb3f9d3e4c2028b89319",
  SXP_USD: "0xfb0cfd6c19e25db4a08d8a204a387cea48cc138f",
  INJ_USD: "0xae2ebe3c4d20ce13ce47cbb49b6d7ee631cd816e",
  CHR_USD: "",
  XVS_USD: "",
  CHZ_USD: "",
  FXS_USD: "0x6ebc52c8c1089be9eb3945c4350b68b8e4c2233f",
  BAT_USD: "",
  ZRX_USD: "0x2885d15b8af22648b98b122b22fdf4d2a56c6023",
  OCEAN_ETH: "0x9b0fc4bb9981e5333689d69bdbf66351b9861e62",
};
const timezoneOffset = -new Date().getTimezoneOffset() * 60;

function fillGaps(prices, periodSeconds) {
  if (prices.length < 2) {
    return prices;
  }

  const newPrices = [prices[0]];
  let prevTime = prices[0].time;
  for (let i = 1; i < prices.length; i++) {
    const { time, open } = prices[i];
    if (prevTime) {
      let j = (time - prevTime) / periodSeconds - 1;
      while (j > 0) {
        newPrices.push({
          time: time - j * periodSeconds,
          open,
          close: open,
          high: open * 1.0003,
          low: open * 0.9996,
        });
        j--;
      }
    }

    prevTime = time;
    newPrices.push(prices[i]);
  }

  return newPrices;
}

async function getChartPricesFromStats(chainId, symbol, period) {
  if (["WBTC", "WETH", "WMATIC"].includes(symbol)) {
    symbol = symbol.substr(1);
  }

  const timeDiff = CHART_PERIODS[period] * 3000;
  const from = Math.floor(Date.now() / 1000 - timeDiff);
  const url = `${UNITY_STATS_API_URL}/candles/${symbol}?preferableChainId=${chainId}&period=${period}&from=${from}&preferableSource=fast`;

  const TIMEOUT = 5000;
  const res = await new Promise(async (resolve, reject) => {
    let done = false;
    setTimeout(() => {
      done = true;
      reject(new Error(`request timeout ${url}`));
    }, TIMEOUT);

    let lastEx;
    for (let i = 0; i < 3; i++) {
      if (done) return;
      try {
        const res = await fetch(url);
        resolve(res);
        return;
      } catch (ex) {
        await sleep(300);
        lastEx = ex;
      }
    }
    reject(lastEx);
  });
  if (!res.ok) {
    throw new Error(`request failed ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  let prices = json?.prices;
  if (!prices || prices.length < 10) {
    throw new Error(`not enough prices data: ${prices?.length}`);
  }

  const OBSOLETE_THRESHOLD = Date.now() / 1000 - 60 * 30; // 30 min ago
  const updatedAt = json?.updatedAt || 0;
  if (updatedAt < OBSOLETE_THRESHOLD) {
    throw new Error(
      "chart data is obsolete, last price record at " +
        new Date(updatedAt * 1000).toISOString() +
        " now: " +
        new Date().toISOString()
    );
  }

  prices = prices.map(({ t, o: open, c: close, h: high, l: low }) => ({
    time: t + timezoneOffset,
    open,
    close,
    high,
    low,
  }));
  return prices;
}

function getCandlesFromPrices(prices, period) {
  const periodTime = CHART_PERIODS[period];

  if (prices.length < 2) {
    return [];
  }

  const candles = [];
  const first = prices[0];
  let prevTsGroup = Math.floor(first[0] / periodTime) * periodTime;
  let prevPrice = first[1];
  let o = prevPrice;
  let h = prevPrice;
  let l = prevPrice;
  let c = prevPrice;
  for (let i = 1; i < prices.length; i++) {
    const [ts, price] = prices[i];
    const tsGroup = Math.floor(ts / periodTime) * periodTime;
    if (prevTsGroup !== tsGroup) {
      candles.push({ t: prevTsGroup + timezoneOffset, o, h, l, c });
      o = c;
      h = Math.max(o, c);
      l = Math.min(o, c);
    }
    c = price;
    h = Math.max(h, price);
    l = Math.min(l, price);
    prevTsGroup = tsGroup;
  }

  return candles.map(({ t: time, o: open, c: close, h: high, l: low }) => ({
    time,
    open,
    close,
    high,
    low,
  }));
}

function getChainlinkChartPricesFromGraph(tokenSymbol, period) {
  if (["WBTC", "WETH", "WMATIC", "WBNB"].includes(tokenSymbol)) {
    tokenSymbol = tokenSymbol.substr(1);
  }

  const marketName = tokenSymbol + "_USD";
  const feedId = FEED_ID_MAP[marketName];
  if (!feedId) {
    throw new Error(`undefined marketName ${marketName}`);
  }

  const PER_CHUNK = 1000;
  const CHUNKS_TOTAL = 6;
  const requests = [];
  for (let i = 0; i < CHUNKS_TOTAL; i++) {
    const query = gql(`{
      rounds(
        first: ${PER_CHUNK},
        skip: ${i * PER_CHUNK},
        orderBy: unixTimestamp,
        orderDirection: desc,
        where: {feed: "${feedId}"}
      ) {
        unixTimestamp,
        value
      }
    }`);

    requests.push(chainlinkClient.query({ query }));
  }

  return Promise.all(requests)
    .then((chunks) => {
      let prices = [];
      const uniqTs = new Set();
      chunks.forEach((chunk) => {
        chunk.data.rounds.forEach((item) => {
          if (uniqTs.has(item.unixTimestamp)) {
            return;
          }

          uniqTs.add(item.unixTimestamp);
          prices.push([item.unixTimestamp, Number(item.value) / 1e8]);
        });
      });

      prices.sort(([timeA], [timeB]) => timeA - timeB);
      prices = getCandlesFromPrices(prices, period);
      return prices;
    })
    .catch((err) => {
      console.error(err);
    });
}

export function useChartPrices(chainId, symbol, isStable, period, currentAveragePrice) {
  const swrKey = !isStable && symbol ? ["getChartCandles", chainId, symbol, period] : null;
  let { data: prices, mutate: updatePrices } = useSWR(swrKey, {
    fetcher: async (...args) => {
      try {
        return await getChartPricesFromStats(chainId, symbol, period);
      } catch (ex) {
        console.warn(ex);
        console.warn("Switching to graph chainlink data");
        try {
          return await getChainlinkChartPricesFromGraph(symbol, period);
        } catch (ex2) {
          console.warn("getChainlinkChartPricesFromGraph failed");
          console.warn(ex2);
          return [];
        }
      }
    },
    dedupingInterval: 60000,
    focusThrottleInterval: 60000 * 10,
  });

  const currentAveragePriceString = currentAveragePrice && currentAveragePrice.toString();
  const retPrices = useMemo(() => {
    if (isStable) {
      return getStablePriceData(period);
    }

    if (!prices) {
      return [];
    }

    let _prices = [...prices];
    if (currentAveragePriceString && prices.length) {
      _prices = appendCurrentAveragePrice(_prices, BigNumber.from(currentAveragePriceString), period);
    }

    return fillGaps(_prices, CHART_PERIODS[period]);
  }, [prices, isStable, currentAveragePriceString, period]);

  return [retPrices, updatePrices];
}

function appendCurrentAveragePrice(prices, currentAveragePrice, period) {
  const periodSeconds = CHART_PERIODS[period];
  const currentCandleTime = Math.floor(Date.now() / 1000 / periodSeconds) * periodSeconds + timezoneOffset;
  const last = prices[prices.length - 1];
  const averagePriceValue = parseFloat(formatAmount(currentAveragePrice, USD_DECIMALS, 2));
  if (currentCandleTime === last.time) {
    last.close = averagePriceValue;
    last.high = Math.max(last.high, averagePriceValue);
    last.low = Math.max(last.low, averagePriceValue);
    return prices;
  } else {
    const newCandle = {
      time: currentCandleTime,
      open: last.close,
      close: averagePriceValue,
      high: averagePriceValue,
      low: averagePriceValue,
    };
    return [...prices, newCandle];
  }
}

function getStablePriceData(period) {
  const periodSeconds = CHART_PERIODS[period];
  const now = Math.floor(Date.now() / 1000 / periodSeconds) * periodSeconds;
  let priceData = [];
  for (let i = 100; i > 0; i--) {
    priceData.push({
      time: now - i * periodSeconds,
      open: 1,
      close: 1,
      high: 1,
      low: 1,
    });
  }
  return priceData;
}
