import { Body, Controller, Post } from "@nestjs/common";
import { SwapService } from "./swap.service";

class ToSwapDto {
  poolID: string;
  coinTypeA: string;
  coinTypeB: string;
  a2b: boolean = true;
  amountSpecifiedIsInput: boolean = true;
  amount: string | number;
  slippage: string = "5";
}

@Controller("swap")
export class SwapController {
  constructor(private server: SwapService) {
  }

  @Post("to")
  async toSwap(@Body() args: ToSwapDto) {
    const poolID: string = args.poolID;
    const coinTypeA: string = args.coinTypeA;
    const coinTypeB: string = args.coinTypeB;
    const a2b: boolean = args.a2b;
    const amountSpecifiedIsInput: boolean = args.amountSpecifiedIsInput;
    const amount: string | number = args.amount;
    const slippage: string = args.slippage;
    return [poolID, coinTypeA, coinTypeB, a2b, amountSpecifiedIsInput, amount, slippage];
    // return await this.server.toSwap(poolID, coinTypeA, coinTypeB, a2b, amountSpecifiedIsInput, amount, slippage);
  }

  @Post("computeSwapV2")
  async computeSwapV2() {
    return this.server.computeSwapV2();
  }


}
//   const poolID: string = "0x5eb2dfcdd1b15d2021328258f6d5ec081e9a0cdcfa9e13a0eaeb9b5f7505ca78";
//     const coinTypeA: string = "0x2::sui::SUI";
//     const coinTypeB: string = "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN";
//     const a2b: boolean = true;
//     const amountSpecifiedIsInput: boolean = true;
//     const amount: string | number = 100000000;
//     const slippage: string = "5";