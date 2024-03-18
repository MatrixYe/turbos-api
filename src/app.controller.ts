import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { getNodeUrl, getWalletPrivateKey } from "./config";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("/config")
  config() {
    const v = getWalletPrivateKey();
    let nodeUrl = getNodeUrl();
    console.log(`url: ${nodeUrl}`);
    console.log(`v ${v}`);
    return v;
  }

}
