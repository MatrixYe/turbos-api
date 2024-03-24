import { Controller, Get, Post, Query } from "@nestjs/common";
import { LiquidityService } from "./liquidity.service";

@Controller("liquidity")
export class LiquidityController {
  constructor(private server: LiquidityService) {
  }

  @Post("/")
  openPosition() {

  }

  @Get("getPositionsByOwner")
  getPositionsByOwner(@Query("owner") owner: string, @Query("cursor") cursor: string) {
    return this.server.getPositionIDsByOwner(owner, cursor);
  }

  @Get("getPositionsByOwner2")
  getPositionsByOwner2(@Query("owner") owner: string, @Query("cursor") cursor: string) {
    return this.server.getPositionIDsByOwner2(owner);
  }
}
