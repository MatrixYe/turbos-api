import { Controller, Get, Query } from "@nestjs/common";
import { ToolsService } from "./tools.service";

@Controller("tools")
export class ToolsController {
  constructor(private server: ToolsService) {
  }

  // 验证私钥推导出的地址是否与配置文件中的sender地址是否匹配
  @Get("verifyAddress")
  async test() {
    const result = this.server.verifyAddress();
    return {
      "calculate_address": result[0],
      "wallet_address": result[1],
      "equal": result[2],
    };
  }

  @Get("priceToSqrtPriceX64")
  priceToSqrtPriceX64(@Query("price") price: string, @Query("decimalsA") decimalsA: number, @Query("decimalsB") decimalsB: number) {
    const sp = this.server.priceToSqrtPriceX64(price, decimalsA, decimalsB);
    return {
      "sqrtPriceX64": sp,
      "decimalsA": decimalsA,
      "decimalsB": decimalsB,
      "price": price,
    };
  }

  @Get("priceToTickIndex")
  priceToTickIndex(@Query("price") price: string, @Query("decimalsA") decimalsA: number, @Query("decimalsB") decimalsB: number) {
    const tickIndex = this.server.priceToTickIndex(price, decimalsA, decimalsB);
    return {
      "tickIndex": tickIndex,
      "decimalsA": decimalsA,
      "decimalsB": decimalsB,
      "price": price,
    };
  }


  @Get("sqrtPriceX64ToPrice")
  sqrtPriceX64ToPrice(@Query("sqrtPriceX64") sqrtPriceX64: string, @Query("decimalsA") decimalsA: number, @Query("decimalsB") decimalsB: number) {
    const price = this.server.sqrtPriceX64ToPrice(sqrtPriceX64, decimalsA, decimalsB);
    return {
      "sqrtPriceX64": sqrtPriceX64,
      "decimalsA": decimalsA,
      "decimalsB": decimalsB,
      "price": price,
    };
  }

  @Get("sqrtPriceX64ToTickIndex")
  sqrtPriceX64ToTickIndex(@Query("sqrtPriceX64") sqrtPriceX64: string) {
    const tickIndex = this.server.sqrtPriceX64ToTickIndex(sqrtPriceX64);
    return {
      "tickIndex": tickIndex,
      "sqrtPriceX64": sqrtPriceX64,
    };
  }

  @Get("bitsToNumber")
  bitsToNumber(@Query("bits") bits: number) {
    const num = this.server.bitsToNumber(bits);
    return {
      "bits": bits,
      "num": num,
    };
  }

  @Get("tickIndexToPrice")
  tickIndexToPrice(@Query("tickIndex") tickIndex: number, @Query("decimalsA") decimalsA: number, @Query("decimalsB") decimalsB: number) {
    const price = this.server.tickIndexToPrice(tickIndex, decimalsA, decimalsB);
    return {
      "price": price,
      "tickIndex": tickIndex,
      "decimalsA": decimalsA,
      "decimalsB": decimalsB,
    };
  }

  @Get("tickIndexToSqrtPriceX64")
  tickIndexToSqrtPriceX64(@Query("tickIndex") tickIndex: number) {
    const sqrtPrice = this.server.tickIndexToSqrtPriceX64(tickIndex);
    return {
      "sqrtPriceX64": sqrtPrice,
      "tickIndex": tickIndex,
    };
  }

}
