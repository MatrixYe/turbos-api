// noinspection SpellCheckingInspection

import { Controller, Get, Post, Query } from "@nestjs/common";
import { LiquidityService } from "./liquidity.service";

@Controller("liquidity")
export class LiquidityController {
  constructor(private server: LiquidityService) {
  }


  // 获取仓位列表
  @Get("getPositionsByOwner")
  getPositionsByOwner(@Query("owner") owner: string, @Query("cursor") cursor: string) {
    return this.server.getPositionIDsByOwner(owner, cursor);
  }

  // 获取仓位列表2
  @Get("getPositionsByOwner2")
  getPositionsByOwner2(@Query("owner") owner: string, @Query("cursor") cursor: string) {
    return this.server.getPositionIDsByOwner2(owner);
  }

  // 获取仓位详情
  @Get("getPositionByID")
  getPositionByID(@Query("nftID") nftID?: string, @Query("posID") posID?: string) {
    return this.server.getPositionByID(nftID, posID);
  }

  // 计算代币数量by流动性
  @Get("getTokenAmountsFromLiquidity")
  getTokenAmountsFromLiquidity(@Query("liquidity") liquidity: string,
                               @Query("tick_lower_index_bits") tick_lower_index_bits: number,
                               @Query("tick_upper_index_bits") tick_upper_index_bits: number,
                               @Query("currentSqrtPrice") currentSqrtPrice: string) {
    // console.log(`liquidity ${liquidity}`);
    // console.log(`tick_lower_index_bits ${tick_lower_index_bits}`);
    // console.log(`tick_upper_index_bits ${tick_upper_index_bits}`);
    // console.log(`currentSqrtPrice ${currentSqrtPrice}`);
    const [a, b, tick_lower_index, tick_upper_index] = this.server.getTokenAmountsFromLiquidity(liquidity, tick_lower_index_bits, tick_upper_index_bits, currentSqrtPrice);
    return {
      "amountA": a,
      "amountB": b,
      "tick_lower_index": tick_lower_index,
      "tick_upper_index": tick_upper_index,
    };
  }

  @Get("getUnclaimedFeesAndRewards")
  getUnclaimedFeesAndRewards(@Query("poolID") poolID: string, @Query("posID") posID: string) {
    console.log(`posID ${posID}`);
    console.log(`poolID ${poolID}`);
    return this.server.getUnclaimedFeesAndRewards(poolID, posID);
  }

  @Post("/")
  openPosition() {

  }
}
