import { Controller, Get, Query } from "@nestjs/common";
import { PoolService } from "./pool.service";

@Controller("pool")
export class PoolController {
  constructor(private server: PoolService) {

  }

  @Get("getPool")
  async getPool(@Query("poolId") poolId: string) {
    return await this.server.getPool();
  }

}
