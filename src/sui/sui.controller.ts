import { Controller, Get, HttpException, HttpStatus, Query } from "@nestjs/common";
import { SuiService } from "./sui.service";

@Controller("sui")
export class SuiController {
  constructor(private service: SuiService) {
  }

  @Get("/getAllBalances")
  async getAllBalances(@Query("owner") owner: string) {
    if (!owner) {
      throw new HttpException("BAD_REQUEST", HttpStatus.BAD_REQUEST);
    }
    return await this.service.allBalances(owner);
  }

  @Get("/getTotalSupply")
  async getTotalSupply(@Query("coinType") coinType: string) {
    if (!coinType) {
      throw new HttpException("BAD_REQUEST", HttpStatus.BAD_REQUEST);
    }
    return await this.service.totalSupply(coinType);
  }

  @Get("/getCoinMeat")
  async getCoinMeat(@Query("coinType") coinType: string) {
    return await this.service.coinMeta(coinType);
  }

}
