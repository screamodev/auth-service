import { Inject, Injectable } from "@nestjs/common";
import * as schema from "../../drizzle/schema";
import { DrizzleAsyncProvider } from "../../drizzle/drizzle.provider";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { User } from "../entities/user.entity";

@Injectable()
export class UserRepository {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async createUser(
    username: string,
    password: string,
    fullname: string,
  ): Promise<User> {
    const user = await this.db
      .insert(schema.users)
      .values({ username, password, fullname })
      .returning();

    return user[0];
  }

  async findByUsername(username: string): Promise<User> {
    const users = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username));

    console.log(users);

    return users[0];
  }
}
