import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { UserService } from "../../user/services/user.service";
import { AuthService } from "../services/auth.service";
import { User } from "../../user/entities/user.entity";
import { AuthResponse } from "../types/responses/auth-response";
import { RegisterDto } from "../types/dtos/register.dto";
import { LoginDto } from "../types/dtos/login.dto";
import { RedisService } from "../../redis/services/redis.service";
import { ApiBearerAuth } from "@nestjs/swagger";
import { UserResponse } from "../types/responses/user-response";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly redisService: RedisService,
  ) {}

  @Post("register")
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    const { username, password, fullname } = registerDto;

    const user = await this.userService.registerUser(
      username,
      password,
      fullname,
    );

    const payload: User = {
      id: user.id,
      username: user.username,
      fullname: user.fullname,
    };
    const token = this.authService.generateJwt(payload);

    return { user: payload, token };
  }

  @Post("login")
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    const { username, password } = loginDto;

    const user = await this.userService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload = {
      id: user.id,
      username: user.username,
      fullname: user.fullname,
    };
    const token = this.authService.generateJwt(payload);

    return { user: payload, token };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"))
  @Get("validate")
  async validate(@Request() req: any): Promise<UserResponse> {
    const userId = req.user.id;

    const cachedUser = await this.redisService.get(`user:${userId}`);
    if (cachedUser) {
      return JSON.parse(cachedUser);
    }

    const user = await this.userService.getUserById(userId);

    if (user) {
      const userResponse = {
        id: user.id,
        username: user.username,
        fullname: user.fullname,
      };

      await this.redisService.set(
        `user:${userId}`,
        JSON.stringify(userResponse),
        3600,
      );

      return userResponse;
    }

    return null;
  }
}
