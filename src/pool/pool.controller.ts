import { Controller, Get, HttpException, HttpStatus, Query } from "@nestjs/common";
import { PoolService } from "./pool.service";

@Controller("pool")
export class PoolController {
  constructor(private server: PoolService) {

  }

  @Get("getPool")
  async getPool(@Query("poolId") poolId: string) {
    return await this.server.getPool(poolId);
  }

  @Get("getSimplePool")
  async getSimplePool(@Query("poolID") poolID: string,
                      @Query("decimalsA") decimalsA: number,
                      @Query("decimalsB") decimalsB: number) {
    if (!poolID || !decimalsB || !decimalsA || decimalsA < 0 || decimalsB < 0) {
      throw new HttpException("请求参数错误", HttpStatus.BAD_REQUEST);
    }
    return await this.server.getSimplePool(poolID, decimalsA, decimalsB);

    // try {
    //   return await this.server.getSimplePool(poolID, decimalsA, decimalsB);
    // } catch (e) {
    //   throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    // }
  }
}
