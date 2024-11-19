import { Module } from "@nestjs/common";
import { UserService } from "./services/user.service";
import { UserRepository } from "./repositories/user.repository";
import { DrizzleModule } from "../drizzle/drizzle.module";

@Module({
  imports: [DrizzleModule],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
