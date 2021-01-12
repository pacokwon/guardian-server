import { Pet } from '@/model/Pet';
import {
    PetRepository,
    PetCreationFields,
    PetModifiableFields
} from '@/repository/PetRepository';
import { CustomError } from '@/common/error';

const petRepository = new PetRepository();

const findAll = async (): Promise<Pet[]> => {
    return await petRepository.findAll();
};

const findOne = async (id: number): Promise<Pet | undefined> => {
    return await petRepository.findOne(id);
};

const createOne = async (fields: PetCreationFields): Promise<void> => {
    await petRepository.insertOne(fields);
};

const updateOne = async (
    id: number,
    fields: PetModifiableFields
): Promise<Pet | undefined> => {
    try {
        await petRepository.updateOne(id, fields);

        // return modified row
        return { id, ...fields };
    } catch {
        return undefined;
    }
};

const removeOne = async (id: number): Promise<void> => {
    await petRepository.removeOne(id);
};

// check for already existing reservation
const registerUser = async (
    petID: number,
    userID: number
): Promise<CustomError> => {
    const isPetRegistered = await petRepository.isPetRegistered(petID);

    // pet is already taken
    if (isPetRegistered)
        return { message: 'Pet is already registered to a user!', status: 400 };

    // the database takes care of foreign key constraints
    return await petRepository
        .insertUserRegistration(petID, userID)
        .then(_ => ({}))
        .catch(_ => ({
            message: 'Pet or User does not exist!',
            status: 404
        }));
};

// check for already existing reservation
const unregisterUser = async (
    petID: number,
    userID: number
): Promise<CustomError> => {
    const isPetRegistered = petRepository.isPetRegistered(petID);

    // pet is already taken
    if (isPetRegistered)
        return {
            message: 'Pet is already registered!',
            status: 400
        };

    // the database takes care of foreign key constraints
    const error = await petRepository
        .removeUserRegistrationAndGetChangedRows(petID, userID)
        .then(changedRows => {
            if (changedRows === 0)
                return {
                    message: 'Match not found. 0 rows changed',
                    status: 404
                };
            else if (changedRows > 1)
                return {
                    message: 'More than 1 rows have been changed',
                    status: 500
                };
            return {};
        })
        .catch(() => ({
            message: 'Internal Server Error',
            status: 500
        }));

    return error;
};

export {
    findAll,
    findOne,
    createOne,
    updateOne,
    removeOne,
    registerUser,
    unregisterUser
};
