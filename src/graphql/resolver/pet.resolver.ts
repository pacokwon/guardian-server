import { IResolvers } from 'graphql-tools';
import DataLoader from 'dataloader';
import { User, Pet } from '../../model';
import { NestedUserHistoryOfPet } from '../../model/UserHistoryOfPet';
import * as PetService from '../../service/PetService';
import {
    ListPetArgs,
    GetPetArgs,
    CreatePetArgs,
    UpdatePetArgs,
    DeletePetArgs,
    SuccessStatus
} from '../schema/pet.schema';
import { PaginationConnection } from '../../common/type';
import {
    convertToID,
    listToPageInfo,
    mapToEdgeList
} from '../../common/pagination';

// load **users** from a *petID*
const petUserHistoryLoader = new DataLoader<number, NestedUserHistoryOfPet[]>(
    petIDs => PetService.findUsersByPetIDs(petIDs),
    { cache: false }
);

// load **one guardian** from a *petID*
const petGuardianLoader = new DataLoader<number, User | null>(
    petIDs => PetService.findGuardiansByPetIDs(petIDs),
    { cache: false }
);

export const petResolver: IResolvers = {
    Query: {
        pets: async (
            _: unknown,
            { first, after }: ListPetArgs
        ): Promise<PaginationConnection<Pet>> => {
            const pets = await PetService.findAll({
                after: after === undefined ? after : convertToID(after),
                pageSize: first
            });

            return {
                pageInfo: listToPageInfo(pets, first),
                edges: mapToEdgeList(pets)
            };
        },
        pet: async (_: unknown, args: GetPetArgs): Promise<Pet> => {
            const pet = await PetService.findOne(Number(args.id), {});
            return pet;
        }
    },
    Mutation: {
        createPet: async (
            _: unknown,
            { input }: { input: CreatePetArgs }
        ): Promise<Pet> => {
            const { nickname, species, imageUrl } = input;
            const id = await PetService.createOne({
                nickname,
                species,
                imageUrl
            });

            return { id, nickname, species, imageUrl };
        },
        updatePet: async (
            _: unknown,
            { input }: { input: UpdatePetArgs }
        ): Promise<Pet> => {
            const { id, nickname, species, imageUrl } = input;
            // there is a possibility that these fields are undefined at runtime.
            // but it doesn't matter since it will only update the fields that are not undefined
            const updatedPet = await PetService.updateOne(Number(id), {
                nickname,
                species,
                imageUrl
            });

            return updatedPet;
        },
        deletePet: async (
            _: unknown,
            { id }: DeletePetArgs
        ): Promise<SuccessStatus> => {
            // if there is an error, let it pass
            return await PetService.removeOne(Number(id)).then(_ => ({
                success: true
            }));
        }
    },
    Pet: {
        guardian: async (parent: Pet): Promise<User | null> => {
            const petID = parent.id;
            return await petGuardianLoader.load(petID);
        },
        userHistory: async (
            parent: Pet
            // args: { currentOnly: boolean }
        ): Promise<NestedUserHistoryOfPet[]> => {
            const petID = parent.id;
            return await petUserHistoryLoader.load(petID);
        }
    }
};
