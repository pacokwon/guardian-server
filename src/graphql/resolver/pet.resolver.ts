import { IResolvers } from 'graphql-tools';
import { Pet } from '../../model/Pet';
import * as PetService from '../../service/PetService';
import {
    ListPetArgs,
    GetPetArgs,
    CreatePetArgs,
    UpdatePetArgs,
    DeletePetArgs,
    SuccessStatus
} from '../type/pet.type';

export const petResolver: IResolvers = {
    Query: {
        pets: async (_: unknown, args: ListPetArgs): Promise<Pet[]> => {
            const users = await PetService.findAll(args);
            return users;
        },

        pet: async (_: unknown, args: GetPetArgs): Promise<Pet | null> => {
            const user = await PetService.findOne(Number(args.id), {});
            return user || null;
        }
    },
    Mutation: {
        createPet: async (
            _: unknown,
            { nickname, species, imageUrl }: CreatePetArgs
        ): Promise<SuccessStatus> => {
            try {
                await PetService.createOne({ nickname, species, imageUrl });
            } catch (error) {
                return { success: false, message: error.message };
            }
            return { success: true };
        },

        updatePet: async (
            _: unknown,
            { id, input }: UpdatePetArgs
        ): Promise<SuccessStatus> => {
            const { nickname, species, imageUrl } = input;
            const updatedPet = await PetService.updateOne(Number(id), {
                nickname,
                species,
                imageUrl
            });
            const success = updatedPet ? true : false;
            return { success };
        },

        deletePet: async (
            _: unknown,
            { id }: DeletePetArgs
        ): Promise<SuccessStatus> => {
            try {
                await PetService.removeOne(Number(id));
            } catch {
                return { success: false };
            }

            return { success: true };
        }
    }
};
