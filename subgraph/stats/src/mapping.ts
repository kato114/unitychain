import { BigInt, Address, Bytes, ethereum } from "@graphprotocol/graph-ts";

import * as positionRouter from "../generated/PositionRouter/PositionRouter";

import {
  FeeStat,
  VolumeStat,
  Transaction,
  UlpStat,
  HourlyVolumeBySource,
  HourlyVolumeByToken,
  UserData,
  UserStat,
  FundingRate,
  UnityStat,
  LiquidatedPosition,
  ActivePosition,
  TokenStat,
  CreateIncreasePosition,
  CreateDecreasePosition,
  CancelIncreasePosition,
  CancelDecreasePosition,
} from "../generated/schema";

import { timestampToPeriod } from "./helpers";

let ZERO = BigInt.fromI32(0);
let FUNDING_PRECISION = BigInt.fromI32(1000000);

export function handleCreateIncreasePosition(
  event: positionRouter.CreateIncreasePosition
): void {
  let id = _getIdFromEvent(event);
  let entity = new CreateIncreasePosition(id);

  entity.account = event.params.account.toHexString();
  let path = event.params.path;
  entity.collateralToken = path[path.length - 1].toHexString();
  entity.indexToken = event.params.indexToken.toHexString();
  entity.sizeDelta = event.params.sizeDelta;
  entity.amountIn = event.params.amountIn;
  entity.isLong = event.params.isLong;
  entity.acceptablePrice = event.params.acceptablePrice;
  entity.executionFee = event.params.executionFee;

  entity.transaction = event.transaction.hash.toHexString();
  entity.timestamp = event.block.timestamp.toI32();

  entity.save();
}

export function handleCreateDecreasePosition(
  event: positionRouter.CreateDecreasePosition
): void {
  let id = _getIdFromEvent(event);
  let entity = new CreateDecreasePosition(id);

  entity.account = event.params.account.toHexString();
  let path = event.params.path;
  entity.collateralToken = path[0].toHexString();
  entity.indexToken = event.params.indexToken.toHexString();
  entity.sizeDelta = event.params.sizeDelta;
  entity.isLong = event.params.isLong;
  entity.acceptablePrice = event.params.acceptablePrice;
  entity.executionFee = event.params.executionFee;

  entity.transaction = event.transaction.hash.toHexString();
  entity.timestamp = event.block.timestamp.toI32();

  entity.save();
}

export function handleCancelIncreasePosition(
  event: positionRouter.CancelIncreasePosition
): void {
  let id = _getIdFromEvent(event);
  let entity = new CancelIncreasePosition(id);

  entity.account = event.params.account.toHexString();
  entity.indexToken = event.params.indexToken.toHexString();
  entity.sizeDelta = event.params.sizeDelta;
  entity.isLong = event.params.isLong;
  entity.acceptablePrice = event.params.acceptablePrice;

  entity.transaction = event.transaction.hash.toHexString();
  entity.timestamp = event.block.timestamp.toI32();

  entity.save();
}

export function handleCancelDecreasePosition(
  event: positionRouter.CancelDecreasePosition
): void {
  let id = _getIdFromEvent(event);
  let entity = new CancelDecreasePosition(id);

  entity.account = event.params.account.toHexString();
  entity.indexToken = event.params.indexToken.toHexString();
  entity.sizeDelta = event.params.sizeDelta;
  entity.isLong = event.params.isLong;
  entity.acceptablePrice = event.params.acceptablePrice;

  entity.transaction = event.transaction.hash.toHexString();
  entity.timestamp = event.block.timestamp.toI32();

  entity.save();
}

function _storeLiquidatedPosition(
  keyBytes: Bytes,
  timestamp: BigInt,
  account: Address,
  indexToken: Address,
  size: BigInt,
  collateralToken: Address,
  collateral: BigInt,
  isLong: boolean,
  type: string,
  markPrice: BigInt
): void {
  let key = keyBytes.toHexString();
  let position = ActivePosition.load(key);
  let averagePrice = position.averagePrice;

  let id = key + ":" + timestamp.toString();
  let liquidatedPosition = new LiquidatedPosition(id);
  liquidatedPosition.account = account.toHexString();
  liquidatedPosition.timestamp = timestamp.toI32();
  liquidatedPosition.indexToken = indexToken.toHexString();
  liquidatedPosition.size = size;
  liquidatedPosition.collateralToken = collateralToken.toHexString();
  liquidatedPosition.collateral = position.collateral;
  liquidatedPosition.isLong = isLong;
  liquidatedPosition.type = type;
  liquidatedPosition.key = key;

  liquidatedPosition.markPrice = markPrice;
  liquidatedPosition.averagePrice = averagePrice;
  let priceDelta = isLong ? averagePrice - markPrice : markPrice - averagePrice;
  liquidatedPosition.loss = (size * priceDelta) / averagePrice;

  let fundingRateId = _getFundingRateId("total", "total", collateralToken);
  let fundingRateEntity = FundingRate.load(fundingRateId);
  let accruedFundingRate =
    BigInt.fromI32(fundingRateEntity.endFundingRate) -
    position.entryFundingRate;
  liquidatedPosition.borrowFee =
    (accruedFundingRate * size) / FUNDING_PRECISION;

  liquidatedPosition.save();
}

function _storeUserAction(
  timestamp: BigInt,
  account: Address,
  actionType: String
): void {
  let totalEntity = _storeUserActionByType(
    timestamp,
    account,
    actionType,
    "total",
    null
  );

  _storeUserActionByType(timestamp, account, actionType, "daily", totalEntity);
  _storeUserActionByType(timestamp, account, actionType, "weekly", totalEntity);
}

function _storeUserActionByType(
  timestamp: BigInt,
  account: Address,
  actionType: string,
  period: string,
  userStatTotal: UserStat | null
): UserStat {
  let timestampId =
    period == "weekly" ? _getWeekId(timestamp) : _getDayId(timestamp);
  let userId =
    period == "total"
      ? account.toHexString()
      : timestampId + ":" + period + ":" + account.toHexString();
  let user = UserData.load(userId);

  let statId = period == "total" ? "total" : timestampId + ":" + period;
  let userStat = UserStat.load(statId);
  if (userStat == null) {
    userStat = new UserStat(statId);
    userStat.period = period;
    userStat.timestamp = parseInt(timestampId) as i32;

    userStat.uniqueCount = 0;
    userStat.uniqueMarginCount = 0;
    userStat.uniqueSwapCount = 0;
    userStat.uniqueMintBurnCount = 0;

    userStat.uniqueCountCumulative = 0;
    userStat.uniqueMarginCountCumulative = 0;
    userStat.uniqueSwapCountCumulative = 0;
    userStat.uniqueMintBurnCountCumulative = 0;

    userStat.actionCount = 0;
    userStat.actionMarginCount = 0;
    userStat.actionSwapCount = 0;
    userStat.actionMintBurnCount = 0;
  }

  if (user == null) {
    user = new UserData(userId);
    user.period = period;
    user.timestamp = parseInt(timestampId) as i32;

    user.actionSwapCount = 0;
    user.actionMarginCount = 0;
    user.actionMintBurnCount = 0;

    userStat.uniqueCount = userStat.uniqueCount + 1;

    if (period == "total") {
      userStat.uniqueCountCumulative = userStat.uniqueCount;
    } else if (userStatTotal != null) {
      userStat.uniqueCountCumulative = userStatTotal.uniqueCount;
    }
  }

  userStat.actionCount += 1;

  let actionCountProp: string;
  let uniqueCountProp: string;
  if (actionType == "margin") {
    actionCountProp = "actionMarginCount";
    uniqueCountProp = "uniqueMarginCount";
  } else if (actionType == "swap") {
    actionCountProp = "actionSwapCount";
    uniqueCountProp = "uniqueSwapCount";
  } else if (actionType == "mintBurn") {
    actionCountProp = "actionMintBurnCount";
    uniqueCountProp = "uniqueMintBurnCount";
  }
  let uniqueCountCumulativeProp = uniqueCountProp + "Cumulative";

  if (user.getI32(actionCountProp) == 0) {
    userStat.setI32(uniqueCountProp, userStat.getI32(uniqueCountProp) + 1);
  }
  user.setI32(actionCountProp, user.getI32(actionCountProp) + 1);
  userStat.setI32(actionCountProp, userStat.getI32(actionCountProp) + 1);

  if (period == "total") {
    userStat.setI32(
      uniqueCountCumulativeProp,
      userStat.getI32(uniqueCountProp)
    );
  } else if (userStatTotal != null) {
    userStat.setI32(
      uniqueCountCumulativeProp,
      userStatTotal.getI32(uniqueCountProp)
    );
  }

  user.save();
  userStat.save();

  return userStat as UserStat;
}

function _updateReservedAmount(
  timestamp: BigInt,
  period: string,
  token: Address,
  reservedAmount: BigInt,
  reservedAmountUsd: BigInt
): void {
  let entity = _getOrCreateTokenStat(timestamp, period, token);
  entity.reservedAmount = reservedAmount;
  entity.reservedAmountUsd = reservedAmountUsd;
  entity.save();
}

function _updateUsdgAmount(
  timestamp: BigInt,
  period: string,
  token: Address,
  usdgAmount: BigInt
): void {
  let entity = _getOrCreateTokenStat(timestamp, period, token);
  entity.usdgAmount = usdgAmount;
  entity.save();
}

function _updatePoolAmount(
  timestamp: BigInt,
  period: string,
  token: Address,
  poolAmount: BigInt,
  poolAmountUsd: BigInt
): void {
  let entity = _getOrCreateTokenStat(timestamp, period, token);
  entity.poolAmount = poolAmount;
  entity.poolAmountUsd = poolAmountUsd;
  entity.save();
}

function _getOrCreateTokenStat(
  timestamp: BigInt,
  period: string,
  token: Address
): TokenStat {
  let id: string;
  let timestampGroup: BigInt;
  if (period == "total") {
    id = "total:" + token.toHexString();
    timestampGroup = timestamp;
  } else {
    timestampGroup = timestampToPeriod(timestamp, period);
    id = timestampGroup.toString() + ":" + period + ":" + token.toHexString();
  }

  let entity = TokenStat.load(id);
  if (entity == null) {
    entity = new TokenStat(id);
    entity.timestamp = timestampGroup.toI32();
    entity.period = period;
    entity.token = token.toHexString();
    entity.poolAmount = BigInt.fromI32(0);
    entity.poolAmountUsd = BigInt.fromI32(0);
    entity.reservedAmountUsd = BigInt.fromI32(0);
    entity.reservedAmount = BigInt.fromI32(0);
    entity.usdgAmount = BigInt.fromI32(0);
  }
  return entity as TokenStat;
}

function _getOrCreateUnityStat(id: string, period: string): UnityStat {
  let entity = UnityStat.load(id);
  if (entity == null) {
    entity = new UnityStat(id);
    entity.distributedEth = ZERO;
    entity.distributedEthCumulative = ZERO;
    entity.distributedUsd = ZERO;
    entity.distributedUsdCumulative = ZERO;
    entity.distributedEsUnity = ZERO;
    entity.distributedEsUnityCumulative = ZERO;
    entity.distributedEsUnityUsd = ZERO;
    entity.distributedEsUnityUsdCumulative = ZERO;
    entity.period = period;
  }
  return entity as UnityStat;
}

let TRADE_TYPES = new Array<string>(5);
TRADE_TYPES[0] = "margin";
TRADE_TYPES[1] = "swap";
TRADE_TYPES[2] = "mint";
TRADE_TYPES[3] = "burn";
TRADE_TYPES[4] = "liquidation";
TRADE_TYPES[5] = "marginAndLiquidation";

function _storeFees(type: string, timestamp: BigInt, fees: BigInt): void {
  let periodTimestamp = parseInt(_getDayId(timestamp)) as i32;
  let id = periodTimestamp.toString() + ":daily";
  let entity = _getOrCreateFeeStat(id, "daily", periodTimestamp);
  entity.setBigInt(type, entity.getBigInt(type) + fees);
  entity.save();

  let totalEntity = _getOrCreateFeeStat("total", "total", periodTimestamp);
  totalEntity.setBigInt(type, totalEntity.getBigInt(type) + fees);
  totalEntity.save();
}

function _getOrCreateFeeStat(
  id: string,
  period: string,
  periodTimestmap: i32
): FeeStat {
  let entity = FeeStat.load(id);
  if (entity === null) {
    entity = new FeeStat(id);
    for (let i = 0; i < TRADE_TYPES.length; i++) {
      let _type = TRADE_TYPES[i];
      entity.setBigInt(_type, ZERO);
    }
    entity.timestamp = periodTimestmap;
    entity.period = period;
  }
  return entity as FeeStat;
}

function _storeVolume(type: string, timestamp: BigInt, volume: BigInt): void {
  let periodTimestamp = parseInt(_getDayId(timestamp)) as i32;
  let id = periodTimestamp.toString() + ":daily";
  let entity = _getOrCreateVolumeStat(id, "daily", periodTimestamp);
  entity.setBigInt(type, entity.getBigInt(type) + volume);
  entity.save();

  let totalEntity = _getOrCreateVolumeStat("total", "total", periodTimestamp);
  totalEntity.setBigInt(type, totalEntity.getBigInt(type) + volume);
  totalEntity.save();
}

function _getOrCreateVolumeStat(
  id: string,
  period: string,
  periodTimestmap: i32
): VolumeStat {
  let entity = VolumeStat.load(id);
  if (entity === null) {
    entity = new VolumeStat(id);
    entity.margin = ZERO;
    entity.swap = ZERO;
    entity.liquidation = ZERO;
    entity.mint = ZERO;
    entity.burn = ZERO;
    entity.period = period;
    entity.timestamp = periodTimestmap;
  }
  return entity as VolumeStat;
}

function _storeVolumeBySource(
  type: string,
  timestamp: BigInt,
  source: Address | null,
  volume: BigInt
): void {
  let id = _getHourId(timestamp) + ":" + source.toHexString();
  let entity = HourlyVolumeBySource.load(id);

  if (entity == null) {
    entity = new HourlyVolumeBySource(id);
    if (source == null) {
      entity.source = "";
    } else {
      entity.source = source.toHexString();
    }
    entity.timestamp = (timestamp.toI32() / 3600) * 3600;
    for (let i = 0; i < TRADE_TYPES.length; i++) {
      let _type = TRADE_TYPES[i];
      entity.setBigInt(_type, ZERO);
    }
  }

  entity.setBigInt(type, entity.getBigInt(type) + volume);
  entity.save();
}

function _storeVolumeByToken(
  type: string,
  timestamp: BigInt,
  tokenA: Address,
  tokenB: Address,
  volume: BigInt
): void {
  let id =
    _getHourId(timestamp) +
    ":" +
    tokenA.toHexString() +
    ":" +
    tokenB.toHexString();
  let entity = HourlyVolumeByToken.load(id);

  if (entity == null) {
    entity = new HourlyVolumeByToken(id);
    entity.tokenA = tokenA;
    entity.tokenB = tokenB;
    entity.timestamp = (timestamp.toI32() / 3600) * 3600;
    for (let i = 0; i < TRADE_TYPES.length; i++) {
      let _type = TRADE_TYPES[i];
      entity.setBigInt(_type, ZERO);
    }
  }

  entity.setBigInt(type, entity.getBigInt(type) + volume);
  entity.save();
}

function _getOrCreateUlpStat(
  id: string,
  period: string,
  periodTimestmap: i32
): UlpStat {
  let entity = UlpStat.load(id);
  if (entity == null) {
    entity = new UlpStat(id);
    entity.period = period;
    entity.ulpSupply = ZERO;
    entity.aumInUsdg = ZERO;
    entity.distributedEth = ZERO;
    entity.distributedEthCumulative = ZERO;
    entity.distributedUsd = ZERO;
    entity.distributedUsdCumulative = ZERO;
    entity.distributedEsUnity = ZERO;
    entity.distributedEsUnityCumulative = ZERO;
    entity.distributedEsUnityUsd = ZERO;
    entity.distributedEsUnityUsdCumulative = ZERO;
    entity.timestamp = periodTimestmap;
  }
  return entity as UlpStat;
}

function _storeUlpStat(
  timestamp: BigInt,
  ulpSupply: BigInt,
  aumInUsdg: BigInt
): void {
  let periodTimestamp = parseInt(_getDayId(timestamp)) as i32;
  let totalEntity = _getOrCreateUlpStat("total", "total", periodTimestamp);
  totalEntity.aumInUsdg = aumInUsdg;
  totalEntity.ulpSupply = ulpSupply;
  totalEntity.save();

  let id = periodTimestamp.toString() + ":daily";
  let entity = _getOrCreateUlpStat(id, "daily", periodTimestamp);
  entity.aumInUsdg = aumInUsdg;
  entity.ulpSupply = ulpSupply;
  entity.save();
}

function _getIdFromEvent(event: ethereum.Event): string {
  return event.transaction.hash.toHexString() + ":" + event.logIndex.toString();
}

function _createTransactionIfNotExist(event: ethereum.Event): string {
  let id = _getIdFromEvent(event);
  let entity = Transaction.load(id);

  if (entity == null) {
    entity = new Transaction(id);
    // entity.timestamp = event.block.timestamp.toI32()
    // entity.blockNumber = event.block.number.toI32()
    // entity.logIndex = event.logIndex.toI32()
    entity.from = event.transaction.from.toHexString();
    if (event.transaction.to == null) {
      entity.to = "";
    } else {
      entity.to = event.transaction.to.toHexString();
    }
    entity.save();
  }

  return id;
}

function _getWeekId(timestamp: BigInt): string {
  let day = 86400;
  let week = day * 7;
  let weekTimestamp = (timestamp.toI32() / week) * week - 3 * day;
  return weekTimestamp.toString();
}

function _getDayId(timestamp: BigInt): string {
  let dayTimestamp = (timestamp.toI32() / 86400) * 86400;
  return dayTimestamp.toString();
}

function _getHourId(timestamp: BigInt): string {
  let hourTimestamp = (timestamp.toI32() / 3600) * 3600;
  return hourTimestamp.toString();
}
