import { Injectable, ConflictException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { UserRepository } from "../repositories/user.repository";

@Injectable()
export class UserService {
  private readonly saltRounds = 10;

  constructor(private readonly userRepository: UserRepository) {}

  async getUserById(id: number) {
    return this.userRepository.findById(id);
  }

  async registerUser(username: string, password: string, fullname: string) {
    const existingUser = await this.userRepository.findByUsername(username);

    if (existingUser) {
      throw new ConflictException("Username already exists");
    }

    const hashedPassword = await bcrypt.hash(password, this.saltRounds);
    return this.userRepository.createUser(username, hashedPassword, fullname);
  }

  async validateUser(username: string, password: string) {
    const user = await this.userRepository.findByUsername(username);
    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.password);
    return isPasswordValid ? user : null;
  }
}
