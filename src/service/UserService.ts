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
    const error = await userRepository.updateOne(id, newNickname);
    return error;
};

const removeUser = async (id: number): Promise<boolean> => {
    const error = await userRepository.removeOne(id);
    return error;
};

export { getAllUsers, getSingleUser, createUser, modifyNickname, removeUser };
