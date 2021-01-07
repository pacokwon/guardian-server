import { User } from '@/entities/User';

const getAllUsers = async (): Promise<User[]> => {
    return await User.find({
        select: ['id', 'nickname'],
        where: { deleted: 0 }
    });
};

const getSingleUser = async (id: number): Promise<User | undefined> => {
    const user = await User.findOne({
        select: ['id', 'nickname'],
        where: { id, deleted: 0 }
    });

    return user;
};

const createUser = async (nickname: string): Promise<void> => {
    const user = User.create({ nickname });
    await user.save();
};

const modifyNickname = async (
    id: number,
    newNickname: string
): Promise<boolean> => {
    const user = await getSingleUser(id);

    if (!user) return false;

    user.nickname = newNickname;
    await user.save();
    return true;
};

const removeUser = async (id: number): Promise<boolean> => {
    const user = await getSingleUser(id);

    // cannot remove a user that does not exist
    if (!user || user.deleted === 1) return false;

    user.deleted = 1;
    await user.save();

    return true;
};

export { getAllUsers, getSingleUser, createUser, modifyNickname, removeUser };
