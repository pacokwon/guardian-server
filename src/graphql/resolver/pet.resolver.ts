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
} from '../schema/pet.schema';

export const petResolver: IResolvers = {
    Query: {
        pets: async (_: unknown, args: ListPetArgs): Promise<Pet[]> => {
            const pets = await PetService.findAll(args);
            return pets;
        },

        pet: async (_: unknown, args: GetPetArgs): Promise<Pet | null> => {
            const pet = await PetService.findOne(Number(args.id), {});
            return pet || null;
        }
    },
    Mutation: {
        createPet: async (
            _: unknown,
            { nickname, species, imageUrl }: CreatePetArgs
        ): Promise<SuccessStatus> => {
            return await PetService.createOne({ nickname, species, imageUrl })
                .then(_ => ({ success: true }))
                .catch(error => ({ success: false, message: error.message }));
        },

        updatePet: async (
            _: unknown,
            { id, input }: UpdatePetArgs
        ): Promise<SuccessStatus> => {
            // there is a possibility that these fields are undefined at runtime.
            // but it doesn't matter since it will only update the fields that are not undefined
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
            return await PetService.removeOne(Number(id))
                .then(_ => ({ success: true }))
                .catch(_ => ({ success: false }));
        }
    }
};
