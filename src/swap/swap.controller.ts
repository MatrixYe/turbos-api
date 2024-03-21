import { Body, Controller, Post } from "@nestjs/common";
import { SwapService } from "./swap.service";

class ToSwapDto {
  poolID: string;
  coinTypeA: string;
  coinTypeB: string;
  a2b: boolean = true;
  amountSpecifiedIsInput: boolean = true;
  amount: string | number;
  slippage?: string = "5";
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
    // return [poolID, coinTypeA, coinTypeB, a2b, amountSpecifiedIsInput, amount, slippage];
    //poolID: string, coinTypeA: string, coinTypeB: string, a2b: boolean, amountSpecifiedIsInput: boolean, amount: string | number, slippage: string
    return await this.server.toSwap(poolID, coinTypeA, coinTypeB, a2b, amountSpecifiedIsInput, amount, slippage);
  }

  @Post("computeSwapV2")
  async computeSwapV2(@Body() args: ToSwapDto) {
    const poolID: string = args.poolID;
    const coinTypeA: string = args.coinTypeA;
    const coinTypeB: string = args.coinTypeB;
    const a2b: boolean = args.a2b;
    const amountSpecifiedIsInput: boolean = args.amountSpecifiedIsInput;
    const amount: string | number = args.amount;
    const slippage: string = args.slippage;
    return this.server.computeSwapV2(poolID, coinTypeA, coinTypeB, a2b, amountSpecifiedIsInput, amount);
  }


}

