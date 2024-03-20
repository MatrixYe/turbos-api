import { Controller, Post } from "@nestjs/common";
import { SwapService } from "./swap.service";

@Controller("swap")
export class SwapController {
  constructor(private server: SwapService) {
  }

  @Post("test")
  async toSwap() {
    return await this.server.test();
  }
}
