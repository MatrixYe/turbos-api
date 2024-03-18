import { Controller, Get, Query } from "@nestjs/common";
import { SuiService } from "./sui.service";

@Controller("sui")
export class SuiController {
  constructor(private service: SuiService) {
  }

  @Get("/getAllBalances")
  async getAllBalances(@Query("owner") owner: string) {
    return await this.service.allBalances(owner);
  }

  @Get("/getTotalSupply")
  async getTotalSupply(@Query("coinType") coinType: string) {
    return await this.service.totalSupply(coinType);
  }

  @Get("/getCoinMeat")
  async getCoinMeat(@Query("coinType") coinType: string) {
    return await this.service.coinMeta(coinType);
  }

}
