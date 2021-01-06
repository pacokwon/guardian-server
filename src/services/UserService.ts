import { getRepository } from 'typeorm';
import { User } from '@/entities/User';

const getAll = async (): Promise<User[]> => {
    return await getRepository(User).find({
        select: ['id', 'nickname'],
        where: { deleted: 0 }
    });
};

const getSingleUser = async (id: number): Promise<User | null> => {
    const user = await getRepository(User).findOne({
        select: ['id', 'nickname'],
        where: { id, deleted: 0 }
    });

    if (!user) return null;
    return user;
};

const createUser = async (nickname: string): Promise<void> => {
    const repository = getRepository(User);
    const user = repository.create({ nickname });
    await repository.save(user);
};

const modifyNickname = async (
    id: number,
    newNickname: string
): Promise<boolean> => {
    const user = await getSingleUser(id);

    if (!user) return false;

    user.nickname = newNickname;
    await getRepository(User).save(user);
    return true;
};

const removeUser = async (id: number): Promise<boolean> => {
    const user = await getSingleUser(id);

    // cannot remove a user that does not exist
    if (!user || user.deleted === 1) return false;

    user.deleted = 1;
    await getRepository(User).save(user);

    return true;
};

export { getAll, getSingleUser, createUser, modifyNickname, removeUser };
