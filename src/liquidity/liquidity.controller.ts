import { Controller, Post } from "@nestjs/common";
import { LiquidityService } from "./liquidity.service";

@Controller("liquidity")
export class LiquidityController {
  constructor(private server: LiquidityService) {
  }

  @Post("/")
  openPosition() {

  }
}
