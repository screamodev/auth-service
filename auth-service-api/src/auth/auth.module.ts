import { Module } from "@nestjs/common";
import { AuthController } from "./controllers/auth.controller";
import { UserModule } from "../user/user.module";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./services/auth.service";
import { RedisModule } from "../redis/redis.module";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./strategies/auth.strategy";

@Module({
  imports: [
    UserModule,
    RedisModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "1h" },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
