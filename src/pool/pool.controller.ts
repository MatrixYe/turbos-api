import { Controller, Get, HttpException, HttpStatus, Query } from "@nestjs/common";
import { PoolService } from "./pool.service";

@Controller("pool")
export class PoolController {
  constructor(private server: PoolService) {

  }

  @Get("getPool")
  async getPool(@Query("poolId") poolId: string) {
    if (!poolId) {
      throw new HttpException("BAD_REQUEST", HttpStatus.BAD_REQUEST);
    }
    return await this.server.getPool(poolId);
  }

  @Get("getSimplePool")
  async getSimplePool(@Query("poolId") poolId: string,
                      @Query("decimalsA") decimalsA: number,
                      @Query("decimalsB") decimalsB: number) {
    if (!poolId || !decimalsB || !decimalsA || decimalsA < 0 || decimalsB < 0) {
      throw new HttpException("BAD_REQUEST", HttpStatus.BAD_REQUEST);
    }
    return await this.server.getSimplePool(poolId, decimalsA, decimalsB);
  }
}
