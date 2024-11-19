import { User } from "../../../user/entities/user.entity";

export type RegisterResponse = {
  user: User;
  token: string;
};
