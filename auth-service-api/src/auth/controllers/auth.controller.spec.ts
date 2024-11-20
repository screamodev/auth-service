import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { PassportModule } from "@nestjs/passport";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";
import { AuthController } from "./auth.controller";
import { UserService } from "../../user/services/user.service";
import { AuthService } from "../services/auth.service";
import { RedisService } from "../../redis/services/redis.service";
import { JwtStrategy } from "../strategies/auth.strategy";

describe("AuthController", () => {
  let app: INestApplication;

  const mockUserService = {
    registerUser: jest.fn(),
    validateUser: jest.fn(),
    getUserById: jest.fn(),
  };

  const mockAuthService = {
    generateJwt: jest.fn(),
  };

  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        await ConfigModule.forRoot({ isGlobal: true }),
        PassportModule.register({ defaultStrategy: "jwt" }),
        JwtModule.register({
          secret: "secret123",
          signOptions: { expiresIn: "1h" },
        }),
      ],
      controllers: [AuthController],
      providers: [
        JwtStrategy,
        { provide: UserService, useValue: mockUserService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /auth/register", () => {
    it("should register a user and return token", async () => {
      const registerDto = {
        username: "testuser",
        password: "password123",
        fullname: "Test User",
      };

      const createdUser = {
        id: 1,
        ...registerDto,
      };

      mockUserService.registerUser.mockResolvedValue(createdUser);
      mockAuthService.generateJwt.mockReturnValue("mockToken");

      const response = await request(app.getHttpServer())
        .post("/auth/register")
        .send(registerDto)
        .expect(201);

      expect(mockUserService.registerUser).toHaveBeenCalledWith(
        "testuser",
        "password123",
        "Test User",
      );
      expect(mockAuthService.generateJwt).toHaveBeenCalledWith({
        id: createdUser.id,
        username: createdUser.username,
        fullname: createdUser.fullname,
      });
      expect(response.body).toEqual({
        user: {
          id: createdUser.id,
          username: createdUser.username,
          fullname: createdUser.fullname,
        },
        token: "mockToken",
      });
    });
  });

  describe("POST /auth/login", () => {
    it("should log in a user and return token", async () => {
      const loginDto = {
        username: "testuser",
        password: "password123",
      };

      const validatedUser = {
        id: 1,
        username: "testuser",
        fullname: "Test User",
      };

      mockUserService.validateUser.mockResolvedValue(validatedUser);
      mockAuthService.generateJwt.mockReturnValue("mockToken");

      const response = await request(app.getHttpServer())
        .post("/auth/login")
        .send(loginDto)
        .expect(201);

      expect(mockUserService.validateUser).toHaveBeenCalledWith(
        "testuser",
        "password123",
      );
      expect(mockAuthService.generateJwt).toHaveBeenCalledWith(validatedUser);
      expect(response.body).toEqual({
        user: validatedUser,
        token: "mockToken",
      });
    });

    it("should throw UnauthorizedException for invalid credentials", async () => {
      const loginDto = {
        username: "testuser",
        password: "wrongpassword",
      };

      mockUserService.validateUser.mockResolvedValue(null);

      await request(app.getHttpServer())
        .post("/auth/login")
        .send(loginDto)
        .expect(401);

      expect(mockUserService.validateUser).toHaveBeenCalledWith(
        "testuser",
        "wrongpassword",
      );
    });
  });

  describe("GET /auth/validate", () => {
    it("should validate JWT and return user data", async () => {
      const userResponse = {
        id: 1,
        username: "testuser",
        fullname: "Test User",
      };

      mockRedisService.get.mockResolvedValue(JSON.stringify(userResponse));
      const token = await app.get(JwtService).signAsync(userResponse);

      const response = await request(app.getHttpServer())
        .get("/auth/validate")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(mockRedisService.get).toHaveBeenCalledWith("user:1");
      expect(response.body).toEqual(userResponse);
    });

    it("should fetch user from DB if not cached and return data", async () => {
      const userResponse = {
        id: 1,
        username: "testuser",
        fullname: "Test User",
      };

      mockRedisService.get.mockResolvedValue(null);
      mockUserService.getUserById.mockResolvedValue(userResponse);
      mockRedisService.set.mockResolvedValue(userResponse);

      const token = await app.get(JwtService).signAsync(userResponse);

      const response = await request(app.getHttpServer())
        .get("/auth/validate")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(mockRedisService.get).toHaveBeenCalledWith("user:1");
      expect(mockUserService.getUserById).toHaveBeenCalledWith(1);
      expect(mockRedisService.set).toHaveBeenCalledWith(
        "user:1",
        JSON.stringify(userResponse),
        3600,
      );
      expect(response.body).toEqual(userResponse);
    });
  });
});
