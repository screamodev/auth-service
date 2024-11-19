import { Body, Controller, Post } from "@nestjs/common";
import { UserService } from "../../user/services/user.service";
import { AuthService } from "../services/auth.service";
import { CreateUserDto } from "../../user/dtos/create-user.dto";
import {User} from "../../user/entities/user.entity";
import {RegisterResponse} from "../types/responses/register-response";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post("register")
  async register(@Body() registerDto: CreateUserDto): Promise<RegisterResponse> {
    const { username, password, fullname } = registerDto;

    const user = await this.userService.registerUser(
      username,
      password,
      fullname,
    );

    console.log(user, "created User");

    const payload: User = {
      id: user.id,
      username: user.username,
      fullname: user.fullname,
    };
    const token = this.authService.generateJwt(payload);

    return { user: payload, token };
  }
}
