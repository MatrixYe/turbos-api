import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { APP_GUARD } from "@nestjs/core";
import { SignatureGuard } from "./signature.guard";
import { ConfigModule } from "@nestjs/config";
import { LoggerMiddleware } from "./logger.middleware";
import { LiquidityController } from "./liquidity/liquidity.controller";
import { LiquidityService } from "./liquidity/liquidity.service";
import { SwapService } from "./swap/swap.service";
import { SuiController } from "./sui/sui.controller";
import { SuiService } from "./sui/sui.service";
import { PoolController } from "./pool/pool.controller";
import { SwapController } from "./swap/swap.controller";
import { PoolService } from "./pool/pool.service";
import { ToolsService } from './tools/tools.service';
import { ToolsController } from './tools/tools.controller';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  })],
  controllers: [AppController, LiquidityController, PoolController, SwapController, SuiController, ToolsController],
  providers: [AppService, {
    provide: APP_GUARD,
    useClass: SignatureGuard,
  }, LiquidityService, PoolService, SuiService, SwapService, ToolsService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes("*");
  }
}