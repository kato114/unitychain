import { BigInt, Address } from "@graphprotocol/graph-ts";

import { ChainlinkPrice, FastPrice, UniswapPrice } from "../generated/schema";

import {
  UNITY,
  ETH,
  BNB,
  BTC,
  AAVE,
  LINK,
  UNI,
  LIDO,
  CURVE,
  GMX,
  BAL,
  MAGIC,
  KNC,
  DPX,
  DODO,
  USDC,
  USDT,
  DAI,
  FRAX,
  getTokenAmountUsd,
  timestampToPeriod,
} from "./helpers";

import { AnswerUpdated as AnswerUpdatedEvent } from "../generated/ChainlinkAggregatorBTC/ChainlinkAggregator";

import { PriceUpdate } from "../generated/FastPriceEvents/FastPriceEvents";

// import {
//   Swap as UniswapSwap
// } from '../generated/UniswapPool/UniswapPoolV3'

function _storeChainlinkPrice(
  token: string,
  value: BigInt,
  timestamp: BigInt
): void {
  let id = token + ":" + timestamp.toString();
  let entity = new ChainlinkPrice(id);
  entity.value = value;
  entity.period = "any";
  entity.token = token;
  entity.timestamp = timestamp.toI32();
  entity.save();

  let totalId = token;
  let totalEntity = new ChainlinkPrice(token);
  totalEntity.value = value;
  totalEntity.period = "last";
  totalEntity.token = token;
  totalEntity.timestamp = timestamp.toI32();
  totalEntity.save();
}

export function handleAnswerUpdatedUNITY(event: AnswerUpdatedEvent): void {
  _storeChainlinkPrice(UNITY, event.params.current, event.block.timestamp);
}

export function handleAnswerUpdatedETH(event: AnswerUpdatedEvent): void {
  _storeChainlinkPrice(ETH, event.params.current, event.block.timestamp);
}

export function handleAnswerUpdatedBNB(event: AnswerUpdatedEvent): void {
  _storeChainlinkPrice(BNB, event.params.current, event.block.timestamp);
}

export function handleAnswerUpdatedBTC(event: AnswerUpdatedEvent): void {
  _storeChainlinkPrice(BTC, event.params.current, event.block.timestamp);
}

export function handleAnswerUpdatedAAVE(event: AnswerUpdatedEvent): void {
  _storeChainlinkPrice(AAVE, event.params.current, event.block.timestamp);
}

export function handleAnswerUpdatedLINK(event: AnswerUpdatedEvent): void {
  _storeChainlinkPrice(LINK, event.params.current, event.block.timestamp);
}

export function handleAnswerUpdatedUNI(event: AnswerUpdatedEvent): void {
  _storeChainlinkPrice(UNI, event.params.current, event.block.timestamp);
}

export function handleAnswerUpdatedLIDO(event: AnswerUpdatedEvent): void {
  _storeChainlinkPrice(LIDO, event.params.current, event.block.timestamp);
}

export function handleAnswerUpdatedCURVE(event: AnswerUpdatedEvent): void {
  _storeChainlinkPrice(CURVE, event.params.current, event.block.timestamp);
}

export function handleAnswerUpdatedGMX(event: AnswerUpdatedEvent): void {
  _storeChainlinkPrice(GMX, event.params.current, event.block.timestamp);
}

export function handleAnswerUpdatedBAL(event: AnswerUpdatedEvent): void {
  _storeChainlinkPrice(BAL, event.params.current, event.block.timestamp);
}

export function handleAnswerUpdatedMAGIC(event: AnswerUpdatedEvent): void {
  _storeChainlinkPrice(MAGIC, event.params.current, event.block.timestamp);
}

export function handleAnswerUpdatedKNC(event: AnswerUpdatedEvent): void {
  _storeChainlinkPrice(KNC, event.params.current, event.block.timestamp);
}

export function handleAnswerUpdatedDPX(event: AnswerUpdatedEvent): void {
  _storeChainlinkPrice(DPX, event.params.current, event.block.timestamp);
}

export function handleAnswerUpdatedDODO(event: AnswerUpdatedEvent): void {
  _storeChainlinkPrice(DODO, event.params.current, event.block.timestamp);
}

export function handleAnswerUpdatedUSDC(event: AnswerUpdatedEvent): void {
  _storeChainlinkPrice(USDC, event.params.current, event.block.timestamp);
}

export function handleAnswerUpdatedUSDT(event: AnswerUpdatedEvent): void {
  _storeChainlinkPrice(USDT, event.params.current, event.block.timestamp);
}

export function handleAnswerUpdatedDAI(event: AnswerUpdatedEvent): void {
  _storeChainlinkPrice(DAI, event.params.current, event.block.timestamp);
}

export function handleAnswerUpdatedFRAX(event: AnswerUpdatedEvent): void {
  _storeChainlinkPrice(FRAX, event.params.current, event.block.timestamp);
}

function _storeUniswapPrice(
  id: string,
  token: string,
  price: BigInt,
  period: string,
  timestamp: BigInt
): void {
  let entity = UniswapPrice.load(id);
  if (entity == null) {
    entity = new UniswapPrice(id);
  }

  entity.timestamp = timestamp.toI32();
  entity.value = price;
  entity.token = token;
  entity.period = period;
  entity.save();
}

function _handleFastPriceUpdate(
  token: Address,
  price: BigInt,
  timestamp: BigInt
): void {
  let dailyTimestampGroup = timestampToPeriod(timestamp, "daily");
  _storeFastPrice(
    dailyTimestampGroup.toString() + ":daily:" + token.toHexString(),
    token,
    price,
    dailyTimestampGroup,
    "daily"
  );

  let hourlyTimestampGroup = timestampToPeriod(timestamp, "hourly");
  _storeFastPrice(
    hourlyTimestampGroup.toString() + ":hourly:" + token.toHexString(),
    token,
    price,
    hourlyTimestampGroup,
    "hourly"
  );

  _storeFastPrice(
    timestamp.toString() + ":any:" + token.toHexString(),
    token,
    price,
    timestamp,
    "any"
  );
  _storeFastPrice(token.toHexString(), token, price, timestamp, "last");
}

function _storeFastPrice(
  id: string,
  token: Address,
  price: BigInt,
  timestampGroup: BigInt,
  period: string
): void {
  let entity = new FastPrice(id);
  entity.period = period;
  entity.value = price;
  entity.token = token.toHexString();
  entity.timestamp = timestampGroup.toI32();
  entity.save();
}

export function handlePriceUpdate(event: PriceUpdate): void {
  _handleFastPriceUpdate(
    event.params.token,
    event.params.price,
    event.block.timestamp
  );
}
