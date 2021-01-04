import { getRepository } from 'typeorm';
import User from '@/entities/User';

const getAll = async (): Promise<User[]> => {
    return await getRepository(User).find({ where: { deleted: 0 } });
};

const getSingleUser = async (username: string): Promise<User | null> => {
    const user = await getRepository(User).findOne({
        where: {
            username,
            deleted: 0
        }
    });

    if (!user) return null;
    return user;
};

const exists = async (username: string): Promise<boolean> => {
    const count = await getRepository(User).count({ username });
    return count > 0;
};

const createUser = async (username: string): Promise<void> => {
    const repository = getRepository(User);
    const user = repository.create({ username });
    await repository.save(user);
};

const modifyUsername = async (
    oldUsername: string,
    newUsername: string
): Promise<boolean> => {
    const newUsernameExists = await exists(newUsername);
    if (newUsernameExists) return false;

    const user = await getSingleUser(oldUsername);

    if (!user) return false;

    user.username = newUsername;
    await getRepository(User).save(user);
    return true;
};

const removeUser = async (username: string): Promise<boolean> => {
    const user = await getSingleUser(username);

    // cannot remove a user that does not exist
    if (!user || user.deleted === 1) return false;

    user.deleted = 1;
    await getRepository(User).save(user);
    return true;
};

export {
    getAll,
    getSingleUser,
    exists,
    createUser,
    modifyUsername,
    removeUser
};
