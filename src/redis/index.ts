/**
 * Thin wrapper around ioredis for cache usage
 * Keys are stored in the format of `<EntityName>[(<ID>)]:<Function Name>/<param1>=<value1>,<param2>=<value2>,...,<paramN>=<valueN>`
 * The ID part is optional, and is only for requests that are specifically related to that ID
 * some examples are:
 * "User:FindAll/page=1,pageSize=10", "Pet(3):FindGuardian"
 */

import Redis from 'ioredis';
import { serialize } from '../common/utils';

const redis = new Redis({
    port: 6379,
    host: process.env.REDIS_HOST || 'localhost'
});

export const getRedis = async (): Promise<Redis.Redis> => {
    if (
        redis.status === 'connecting' ||
        redis.status === 'connect' ||
        redis.status === 'ready'
    )
        return redis;

    await redis.connect();
    return redis;
};

export const setAndReturn = async <P, V>(options: {
    tag: string;
    params?: P;
    value: V;
    ttl?: number;
}): Promise<V> => {
    const redis = await getRedis();

    const { tag, params = {}, value, ttl = 5 } = options;
    const key = serialize(tag, params);
    await redis.set(key, JSON.stringify(value), 'ex', ttl);
    return value;
};

export const read = async <T, P>(options: {
    tag: string;
    params?: P;
}): Promise<T | null> => {
    const redis = await getRedis();

    const { tag, params = {} } = options;
    const key = serialize(tag, params);

    const result = await redis.get(key);

    if (result === null) return null;

    return JSON.parse(result) as T;
};

export const getKeys = async (
    pattern: string | string[]
): Promise<string[]> => {
    const redis = await getRedis();

    if (typeof pattern === 'string') return await redis.keys(pattern);
    const keysArray = await Promise.all(pattern.map(p => redis.keys(p)));
    return keysArray.reduce((acc, keys) => [...acc, ...keys]);
};

export const removeBulk = async (pattern: string | string[]): Promise<void> => {
    const redis = await getRedis();

    const keys = await getKeys(pattern);
    const pipeline = redis.pipeline();
    keys.forEach(key => pipeline.del(key));
    const res = await pipeline.exec();
};
