import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { JwtService } from "@nestjs/jwt";

describe("AuthService", () => {
  let authService: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(), // Mock sign method
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe("generateJwt", () => {
    it("should call JwtService.sign with the correct payload", () => {
      const payload = { id: 1, username: "testuser", fullname: "Test User" };
      const mockJwt = "mock.jwt.token";
      jest.spyOn(jwtService, "sign").mockReturnValue(mockJwt);

      const result = authService.generateJwt(payload);

      expect(jwtService.sign).toHaveBeenCalledWith(payload);
      expect(result).toBe(mockJwt);
    });
  });
});
