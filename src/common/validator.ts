import { userFields } from '../model/User';
import { petFields } from '../model/Pet';

const fieldValidator = (requiredFields: string[]) => (
    inputFields: string[] = []
): boolean =>
    inputFields.every(inputField => requiredFields.includes(inputField));

export const validateUserFields = fieldValidator(userFields);
export const validatePetFields = fieldValidator(petFields);
