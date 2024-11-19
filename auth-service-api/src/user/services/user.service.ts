import { Injectable, ConflictException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { UserRepository } from "../repositories/user.repository";

@Injectable()
export class UserService {
  private readonly saltRounds = 10;

  constructor(private readonly userRepository: UserRepository) {}

  async registerUser(username: string, password: string, fullname: string) {
    const existingUser = await this.userRepository.findByUsername(username);

    console.log(existingUser);

    if (existingUser) {
      throw new ConflictException("Username already exists");
    }

    const hashedPassword = await bcrypt.hash(password, this.saltRounds);
    return this.userRepository.createUser(username, hashedPassword, fullname);
  }
}
