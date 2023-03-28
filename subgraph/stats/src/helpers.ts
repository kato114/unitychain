import { BigInt, TypedMap } from "@graphprotocol/graph-ts";
import { ChainlinkPrice, UniswapPrice } from "../generated/schema";

export let BASIS_POINTS_DIVISOR = BigInt.fromI32(10000);
export let PRECISION = BigInt.fromI32(10).pow(30);

export let UNITY = "0xBe788FeAe3C004EE759149C55Db2D173407633f2";
export let ETH = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
export let BNB = "0x20865e63B111B2649ef829EC220536c82C58ad7B";
export let BTC = "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f";
export let AAVE = "0x078f358208685046a11C85e8ad32895DED33A249";
export let LINK = "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4";
export let UNI = "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0";
export let LIDO = "0x13Ad51ed4F1B7e9Dc168d8a00cB3f4dDD85EfA60";
export let CURVE = "0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978";
export let GMX = "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a";
export let BALANCER = "0x040d1EdC9569d4Bab2D15287Dc5A4F10F56a56B8";
export let MAGIC = "0x2c852D3334188BE136bFC540EF2bB8C37b590BAD";
export let KNC = "0xe4DDDfe67E7164b0FE14E218d80dC4C08eDC01cB";
export let DPX = "0x6C2C06790b3E3E3c38e12Ee22F8183b37a13EE55";
export let DODO = "0x69Eb4FA4a2fbd498C257C57Ea8b7655a2559A581";
export let FRAX = "0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F";
export let USDT = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9";
export let USDC = "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8";
export let DAI = "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1";

export function timestampToDay(timestamp: BigInt): BigInt {
  return timestampToPeriod(timestamp, "daily");
}

export function timestampToPeriod(timestamp: BigInt, period: string): BigInt {
  let periodTime: BigInt;

  if (period == "daily") {
    periodTime = BigInt.fromI32(86400);
  } else if (period == "hourly") {
    periodTime = BigInt.fromI32(3600);
  } else if (period == "weekly") {
    periodTime = BigInt.fromI32(86400 * 7);
  } else {
    throw new Error("Unsupported period " + period);
  }

  return (timestamp / periodTime) * periodTime;
}

export function getTokenDecimals(token: String): u8 {
  let tokenDecimals = new Map<String, i32>();
  tokenDecimals.set(UNITY, 18);
  tokenDecimals.set(ETH, 18);
  tokenDecimals.set(BNB, 18);
  tokenDecimals.set(BTC, 8);
  tokenDecimals.set(AAVE, 8);
  tokenDecimals.set(LINK, 18);
  tokenDecimals.set(UNI, 18);
  tokenDecimals.set(LIDO, 18);
  tokenDecimals.set(CURVE, 18);
  tokenDecimals.set(GMX, 18);
  tokenDecimals.set(BALANCER, 18);
  tokenDecimals.set(MAGIC, 18);
  tokenDecimals.set(KNC, 18);
  tokenDecimals.set(DPX, 18);
  tokenDecimals.set(DODO, 18);
  tokenDecimals.set(FRAX, 18);
  tokenDecimals.set(USDT, 6);
  tokenDecimals.set(USDC, 6);
  tokenDecimals.set(DAI, 18);

  return tokenDecimals.get(token) as u8;
}

export function getTokenAmountUsd(token: String, amount: BigInt): BigInt {
  let decimals = getTokenDecimals(token);
  let denominator = BigInt.fromI32(10).pow(decimals);
  let price = getTokenPrice(token);
  return (amount * price) / denominator;
}

export function getTokenPrice(token: String): BigInt {
  if (token != UNITY) {
    let chainlinkPriceEntity = ChainlinkPrice.load(token);
    if (chainlinkPriceEntity != null) {
      // all chainlink prices have 8 decimals
      // adjusting them to fit UNITY 30 decimals USD values
      return chainlinkPriceEntity.value * BigInt.fromI32(10).pow(22);
    }
  }

  if (token == UNITY) {
    let uniswapPriceEntity = UniswapPrice.load(UNITY);

    if (uniswapPriceEntity != null) {
      return uniswapPriceEntity.value;
    }
  }

  let prices = new TypedMap<String, BigInt>();
  prices.set(UNITY, PRECISION);
  prices.set(ETH, PRECISION);
  prices.set(BNB, PRECISION);
  prices.set(BTC, PRECISION);
  prices.set(AAVE, PRECISION);
  prices.set(LINK, PRECISION);
  prices.set(UNI, PRECISION);
  prices.set(LIDO, PRECISION);
  prices.set(CURVE, PRECISION);
  prices.set(GMX, PRECISION);
  prices.set(BALANCER, PRECISION);
  prices.set(MAGIC, PRECISION);
  prices.set(KNC, PRECISION);
  prices.set(DPX, PRECISION);
  prices.set(DODO, PRECISION);
  prices.set(FRAX, PRECISION);
  prices.set(USDT, PRECISION);
  prices.set(USDC, PRECISION);
  prices.set(DAI, PRECISION);

  return prices.get(token) as BigInt;
}
