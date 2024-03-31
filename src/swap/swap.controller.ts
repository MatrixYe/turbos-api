import { Body, Controller, HttpException, HttpStatus, Post } from "@nestjs/common";
import { SwapService } from "./swap.service";
import { IsBoolean, IsNotEmpty } from "class-validator";
import { Transform } from "class-transformer";

class ToSwapDto {
  poolId: string;
  coinTypeA: string;
  coinTypeB: string;
  @IsNotEmpty()
  @Transform(({ value }) => value === "true") // 转换字符串为布尔值
  @IsBoolean()
  a2b: boolean = true;
  @IsNotEmpty()
  @Transform(({ value }) => value === "true") // 转换字符串为布尔值
  @IsBoolean()
  amountSpecifiedIsInput: boolean = true;
  amount: string | number;
  slippage?: string = "2";
}

@Controller("swap")
export class SwapController {
  constructor(private server: SwapService) {
  }

  // 预估交易
  @Post("computeSwapV2")
  async computeSwapV2(@Body() args: ToSwapDto) {
    const poolId: string = args.poolId;
    const coinTypeA: string = args.coinTypeA;
    const coinTypeB: string = args.coinTypeB;
    const a2b: boolean = args.a2b;
    const amountSpecifiedIsInput: boolean = args.amountSpecifiedIsInput;
    const amount: string | number = args.amount;
    if (!poolId || !coinTypeA || !coinTypeB || !amount) {
      throw new HttpException("BAD_REQUEST", HttpStatus.BAD_REQUEST);
    }
    return this.server.computeSwapV2(poolId, coinTypeA, coinTypeB, a2b, amountSpecifiedIsInput, amount);
  }

  // 核心交易swap
  @Post("to")
  async toSwap(@Body() args: ToSwapDto) {
    const poolId: string = args.poolId;
    const coinTypeA: string = args.coinTypeA;
    const coinTypeB: string = args.coinTypeB;
    const a2b: boolean = args.a2b;
    const amountSpecifiedIsInput: boolean = args.amountSpecifiedIsInput;
    const amount: string | number = args.amount;
    const slippage: string = args.slippage;
    // return [poolId, coinTypeA, coinTypeB, a2b, amountSpecifiedIsInput, amount, slippage];
    //poolId: string, coinTypeA: string, coinTypeB: string, a2b: boolean, amountSpecifiedIsInput: boolean, amount: string | number, slippage: string
    if (!poolId || !coinTypeA || !coinTypeB || !amount || !slippage) {
      throw new HttpException("BAD_REQUEST", HttpStatus.BAD_REQUEST);
    }
    return await this.server.toSwap(poolId, coinTypeA, coinTypeB, a2b, amountSpecifiedIsInput, amount, slippage);
  }


}

