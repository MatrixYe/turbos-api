// noinspection SpellCheckingInspection

import { Controller, Get, HttpException, HttpStatus, Post, Query } from "@nestjs/common";
import { LiquidityService } from "./liquidity.service";

@Controller("liquidity")
export class LiquidityController {
  constructor(private server: LiquidityService) {
  }


  // 获取仓位列表
  @Get("getPositionsByOwner")
  getPositionsByOwner(@Query("owner") owner: string, @Query("cursor") cursor: string) {
    if (!owner) {
      throw new HttpException("BAD_REQUEST", HttpStatus.BAD_REQUEST);
    }
    return this.server.getPositionIDsByOwner(owner, cursor);
  }

  // 获取仓位列表2
  @Get("getPositionsByOwner2")
  getPositionsByOwner2(@Query("owner") owner: string, @Query("cursor") cursor: string) {
    if (!owner) {
      throw new HttpException("BAD_REQUEST", HttpStatus.BAD_REQUEST);
    }
    return this.server.getPositionIDsByOwner2(owner);
  }

  // 获取仓位详情
  @Get("getPositionByID")
  getPositionByID(@Query("nftID") nftID?: string, @Query("posID") posID?: string) {
    if (!nftID && !posID) {
      throw new HttpException("BAD_REQUEST", HttpStatus.BAD_REQUEST);
    }
    return this.server.getPositionByID(nftID, posID);
  }

  // 计算代币数量by流动性
  @Get("getTokenAmountsFromLiquidity")
  getTokenAmountsFromLiquidity(@Query("liquidity") liquidity: string,
                               @Query("tick_lower_index_bits") tick_lower_index_bits: number,
                               @Query("tick_upper_index_bits") tick_upper_index_bits: number,
                               @Query("currentSqrtPrice") currentSqrtPrice: string) {
    if (!liquidity || !tick_lower_index_bits || !tick_upper_index_bits || !currentSqrtPrice) {
      throw new HttpException("BAD_REQUEST", HttpStatus.BAD_REQUEST);
    }
    const [a, b, tick_lower_index, tick_upper_index] = this.server.getTokenAmountsFromLiquidity(liquidity, tick_lower_index_bits, tick_upper_index_bits, currentSqrtPrice);
    return {
      "amountA": a,
      "amountB": b,
      "tick_lower_index": tick_lower_index,
      "tick_upper_index": tick_upper_index,
    };
  }

  @Get("getUnclaimedFeesAndRewards")
  getUnclaimedFeesAndRewards(@Query("poolID") poolID: string,
                             @Query("posID") posID: string) {
    if (!poolID || !posID) {
      throw new HttpException("BAD_REQUEST", HttpStatus.BAD_REQUEST);
    }
    return this.server.getUnclaimedFeesAndRewards(poolID, posID);
  }

  @Post("addLiquidity")
  addLiquidity() {
    return this.server.addLiquidity();
  }

  @Get("calLpTokenAmountByPrice")
  calLpTokenAmountByPrice(@Query("price_current") price_current: string,
                          @Query("price_lower") price_lower: string,
                          @Query("price_upper") price_upper: string,
                          @Query("decimalsA") decimalsA: number,
                          @Query("decimalsB") decimalsB: number) {
    if (!price_current || !price_lower || !price_upper || !decimalsA || !decimalsB) {
      throw new HttpException("BAD_REQUEST", HttpStatus.BAD_REQUEST);
    }
    return this.server.calLpTokenAmountByPrice(price_current, price_lower, price_upper, Number(decimalsA), Number(decimalsB));
  }

  @Get("calLpTokenAmountByTicks")
  calLpTokenAmountByTicks(@Query("tick_current_index") tick_current_index: string,
                          @Query("tick_lower_index") tick_lower_index: number,
                          @Query("tick_upper_index") tick_upper_index: number,
                          @Query("decimalsA") decimalsA: number,
                          @Query("decimalsB") decimalsB: number) {
    if (!tick_current_index || !tick_lower_index || !tick_upper_index || !decimalsA || !decimalsB) {
      throw new HttpException("BAD_REQUEST", HttpStatus.BAD_REQUEST);
    }
    // tick_current_index: number, tick_lower_index: number, tick_upper_index: number, decimalsA: number, decimalsB: number
    return this.server.calLpTokenAmountByTicks(Number(tick_current_index), Number(tick_lower_index), Number(tick_upper_index), Number(decimalsA), Number(decimalsB));
  }
}
