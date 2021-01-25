import { IResolvers } from 'graphql-tools';
import DataLoader from 'dataloader';
import { User, Pet } from '../../model';
import { NestedUserPetHistory } from '../../model/UserPetHistory';
import * as PetService from '../../service/PetService';
import {
    SCHEMA_NAME as PET_SCHEMA_NAME,
    ListPetArgs,
    ListUserHistoryArgs,
    GetPetArgs,
    CreatePetArgs,
    UpdatePetArgs,
    DeletePetArgs,
    SuccessStatus
} from '../schema/pet.schema';
import { SCHEMA_NAME as HISTORY_SCHEMA_NAME } from '../schema/userPetHistory.schema';
import { PaginationConnection } from '../../common/type';
import { convertToID, listToConnection } from '../../common/pagination';

// load **one guardian** from a *petID*
const petGuardianLoader = new DataLoader<number, User | null>(
    petIDs => PetService.findGuardiansByPetIDs(petIDs),
    { cache: false }
);

export const petResolver: IResolvers = {
    Query: {
        pets: async (
            _: unknown,
            { first, after: afterCursor }: ListPetArgs
        ): Promise<PaginationConnection<Pet>> => {
            const after = convertToID(afterCursor);

            const pets = await PetService.findAll({
                after,
                pageSize: first
            });

            // Connection object using the limit count and schema name
            return listToConnection(pets, first, PET_SCHEMA_NAME);
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
            await PetService.removeOne(Number(id));

            return { success: true };
        }
    },
    Pet: {
        guardian: async (parent: Pet): Promise<User | null> => {
            const petID = parent.id;
            return await petGuardianLoader.load(petID);
        },
        userHistory: async (
            parent: Pet,
            { first, after: afterCursor }: ListUserHistoryArgs
        ): Promise<PaginationConnection<NestedUserPetHistory>> => {
            const after = convertToID(afterCursor);

            const userHistory = await PetService.findUserHistory(parent.id, {
                after,
                pageSize: first
            });

            const nestedUserHistory = userHistory.map(
                ({ userID, nickname, ...history }) => ({
                    user: { id: userID, nickname },
                    pet: { ...parent },
                    ...history
                })
            );

            return listToConnection(
                nestedUserHistory,
                first,
                HISTORY_SCHEMA_NAME
            );
        }
    }
};
