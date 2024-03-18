import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello(): string {
    return "验证通过,恭喜发财🎉";
  }
}
