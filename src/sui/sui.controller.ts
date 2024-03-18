import { Controller, Get } from "@nestjs/common";
import { SuiService } from "./sui.service";

@Controller("sui")
export class SuiController {
  constructor(private service: SuiService) {
  }

  @Get("/getAllBalances")
  getAllBalances() {
    this.service.getAllBalances();
  }

}
