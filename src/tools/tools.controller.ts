import { Controller, Get } from "@nestjs/common";
import { ToolsService } from "./tools.service";

@Controller("tools")
export class ToolsController {
  constructor(private server: ToolsService) {
  }

  // 验证私钥推导出的地址是否与配置文件中的sender地址是否匹配
  @Get("verifyAddress")
  async test() {
    const result = this.server.verifyAddress();
    return {
      "calculate_address": result[0],
      "wallet_address": result[1],
      "equal": result[2],
    };
  }


}
