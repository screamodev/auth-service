import { Module } from "@nestjs/common";
import { RedisService } from "./services/redis.service";
import Redis from "ioredis";

@Module({
  providers: [
    {
      provide: "REDIS_CLIENT",
      useFactory: () => {
        return new Redis(process.env.REDIS_URL);
      },
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}
