import { User } from "../../../user/entities/user.entity";

export type AuthResponse = {
  user: User;
  token: string;
};
