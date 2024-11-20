import { RedisService } from "./redis.service";
import Redis from "ioredis-mock";

describe("RedisService", () => {
  let redisService: RedisService;

  beforeEach(() => {
    const redisMock = new Redis();
    redisService = new RedisService(redisMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should set a key with a value and TTL", async () => {
    const spy = jest.spyOn(redisService["redisClient"], "set");

    await redisService.set("testKey", "testValue", 60);

    expect(spy).toHaveBeenCalledWith("testKey", "testValue", "EX", 60);

    const value = await redisService.get("testKey");
    expect(value).toBe("testValue");
  });

  it("should return null for a non-existing key", async () => {
    const value = await redisService.get("nonExistentKey");
    expect(value).toBeNull();
  });

  it("should retrieve the value of an existing key", async () => {
    await redisService.set("existingKey", "existingValue", 60);
    const value = await redisService.get("existingKey");
    expect(value).toBe("existingValue");
  });
});
