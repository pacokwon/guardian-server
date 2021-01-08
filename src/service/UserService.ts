import { User } from '@/model/User';
import { UserRepository } from '@/repository/UserRepository';

const userRepository = new UserRepository();

const getAllUsers = async (): Promise<User[]> => {
    return await userRepository.findAll();
};

const getSingleUser = async (id: number): Promise<User | undefined> => {
    const user = await userRepository.findOne(id);
    return user;
};

const createUser = async (nickname: string): Promise<void> => {
    await userRepository.insertOne(nickname);
};

const modifyNickname = async (
    id: number,
    newNickname: string
): Promise<boolean> => {
    try {
        await userRepository.updateOne(id, {
            nickname: newNickname
        });
    } catch {
        return false;
    }

    return true;
};

const removeUser = async (id: number): Promise<boolean> => {
    try {
        await userRepository.removeOne(id);
    } catch {
        return false;
    }

    return true;
};

export { getAllUsers, getSingleUser, createUser, modifyNickname, removeUser };
