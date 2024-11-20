import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./user.service";
import { UserRepository } from "../repositories/user.repository";
import * as bcrypt from "bcrypt";

describe("UserService", () => {
  let userService: UserService;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            createUser: jest.fn(),
            findByUsername: jest.fn(),
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  describe("createUser", () => {
    it("should hash the password and create the user", async () => {
      const userDto = {
        username: "testuser",
        password: "password123",
        fullname: "Test User",
      };
      const hashedPassword = "hashedpassword";
      jest.spyOn(bcrypt, "hash").mockResolvedValue(hashedPassword);
      jest.spyOn(userRepository, "createUser").mockResolvedValue({
        id: 1,
        ...userDto,
        password: hashedPassword,
      });

      const result = await userService.registerUser(
        userDto.username,
        userDto.password,
        userDto.fullname,
      );

      expect(bcrypt.hash).toHaveBeenCalledWith(userDto.password, 10);
      expect(userRepository.createUser).toHaveBeenCalledWith(
        "testuser",
        "hashedpassword",
        "Test User",
      );
      expect(result).toEqual({
        id: 1,
        username: "testuser",
        fullname: "Test User",
        password: hashedPassword,
      });
    });

    it("should throw an error if the username already exists", async () => {
      jest.spyOn(userRepository, "findByUsername").mockResolvedValue({
        id: 1,
        username: "testuser",
        fullname: "Test user",
      });
      await expect(
        userService.registerUser("testuser", "password123", "Test User"),
      ).rejects.toThrow("Username already exists");
    });
  });

  describe("findByUsername", () => {
    it("should return user details from the repository", async () => {
      const user = {
        id: 1,
        username: "testuser",
        fullname: "Test User",
        password: "hashedpassword",
      };
      jest.spyOn(userRepository, "findByUsername").mockResolvedValue(user);

      const result = await userRepository.findByUsername("testuser");

      expect(result).toEqual(user);
      expect(userRepository.findByUsername).toHaveBeenCalledWith("testuser");
    });
  });

  describe("findById", () => {
    it("should return user details from the repository", async () => {
      const user = {
        id: 1,
        username: "testuser",
        fullname: "Test User",
        password: "hashedpassword",
      };
      jest.spyOn(userRepository, "findById").mockResolvedValue(user);

      const result = await userService.getUserById(1);

      expect(result).toEqual(user);
      expect(userRepository.findById).toHaveBeenCalledWith(1);
    });
  });
});
