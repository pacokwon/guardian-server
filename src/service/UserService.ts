import { User } from '@/model/User';
import { UserRepository } from '@/repository/UserRepository';
import { UserPetHistoryRepository } from '@/repository/UserPetHistoryRepository';
import { PetHistoryOfUser } from '@/repository/UserPetHistoryRepository';

const userRepository = new UserRepository();
const userPetHistoryRepository = new UserPetHistoryRepository();

const findAll = async (): Promise<User[]> => {
    return await userRepository.findAll();
};

const findOne = async (id: number): Promise<User | undefined> => {
    const user = await userRepository.findOne(id);
    return user;
};

const findPetsHistory = async (userID: number): Promise<PetHistoryOfUser[]> => {
    return await userPetHistoryRepository.findPetsHistoryFromUserID(userID);
};

const createOne = async (nickname: string): Promise<void> => {
    await userRepository.insertOne(nickname);
};

const updateOne = async (
    id: number,
    newNickname: string
): Promise<User | undefined> => {
    try {
        await userRepository.updateOne(id, { nickname: newNickname });

        // return modified entry
        return { id, nickname: newNickname };
    } catch {
        return undefined;
    }
};

const removeOne = async (id: number): Promise<void> => {
    await userRepository.removeOne(id);
};

export { findAll, findOne, findPetsHistory, createOne, updateOne, removeOne };
