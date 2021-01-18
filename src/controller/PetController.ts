import {
    Controller,
    Route,
    Get,
    Post,
    Put,
    Delete,
    Path,
    Body,
    Query,
    Example,
    Response,
    SuccessResponse,
    Tags,
    ValidateError
} from 'tsoa';
import { Pet } from '../model/Pet';
import * as PetService from '../service/PetService';
import { UserHistoryOfPet } from '../repository/UserPetHistoryRepository';
import { ErrorResponse } from '../common/error';
import { validatePetFields } from '../common/validator';

/**
 * Request body to be received on pet creation
 */
interface CreatePetRequestBody {
    /**
     * The pet's species (e.g. cat, dog)
     */
    species: string;
    /**
     * The pet's nickname
     */
    nickname: string;
    /**
     * A public url hosting the pet's image
     */
    imageUrl: string;
}

/**
 * Request body to be sent on pet information modificiation
 */
type ModifyPetRequestBody = CreatePetRequestBody;

interface CreatePetResponse {
    id: number;
}

@Route('api/pets')
@Tags('Pet')
export class PetController extends Controller {
    /**
     * Retrieve all pets' information
     *
     * @param page page number used for pagination. Assumes that pageSize exists. Starts from 1.
     * @isInt page
     * @default 1
     * @example 5
     *
     * @param pageSize the number of items that will be fetched with a single response.
     * @isInt pageSize
     * @default 10
     * @example 5
     *
     * @param field properties available for Pet information. Usable fields are `id`, `nickname`, `species`, `imageUrl`. Can be used multiple times.
     * @default 'id', 'nickname', 'species', 'imageUrl'
     * @example 'id'
     * @example 'nickname'
     */
    @Example<Pet[]>([
        {
            id: 2,
            species: 'dog',
            nickname: 'bently',
            imageUrl: 'https://placedog.net/300/300'
        },
        {
            id: 8,
            species: 'cat',
            nickname: 'leonard',
            imageUrl: 'https://placecat.com/300/300'
        },
        {
            id: 13,
            species: 'cat',
            nickname: 'lacey',
            imageUrl: 'https://placedog.net/500/500'
        }
    ])
    @Example<Pet[]>([])
    @Get('/')
    async getAllPets(
        @Query() page?: number,
        @Query() pageSize?: number,
        @Query() field?: string[]
    ): Promise<Pet[]> {
        if (!validatePetFields(field))
            throw new ValidateError({}, 'Invalid field for Pet!');

        const pets = await PetService.findAll({ page, pageSize, field });
        this.setStatus(200);
        return pets;
    }

    /**
     * Retrieve the information of a single pet by its id.
     *
     * @param id the pet's identifier
     * @isInt id
     * @example id 4
     */
    @Example<Pet>({
        id: 13,
        species: 'cat',
        nickname: 'lacey',
        imageUrl: 'https://placedog.net/500/500'
    })
    @Response<ErrorResponse>(404, 'Not found', {
        message: 'Pet not found'
    })
    @Get('{id}')
    async getPet(@Path() id: number, @Query() field?: string[]): Promise<Pet> {
        if (!validatePetFields(field))
            throw new ValidateError({}, 'Invalid field for Pet!');

        const pet = await PetService.findOne(id, { field });
        this.setStatus(200);
        return pet;
    }

    /**
     * Create a new pet from its nickname, species and image
     *
     * @param requestBody JSON object that contains the new pet's information
     * @example requestBody { "nickname": "foo", "species": "dog", "imageUrl": "https://placedog.net/400/400" }
     * @example requestBody { "nickname": "bar", "species": "cat", "imageUrl": "https://placekitten.com/400/400" }
     */
    @Post('/')
    @SuccessResponse(201, 'Created')
    async createPet(
        @Body() requestBody: CreatePetRequestBody
    ): Promise<CreatePetResponse> {
        const { species, nickname, imageUrl } = requestBody;
        const insertID = await PetService.createOne({
            species,
            nickname,
            imageUrl
        });

        this.setStatus(201);
        return { id: insertID };
    }

    /**
     * Modify a specific pet's information by its id.
     * The modifiable fields are nickname and imageUrl
     *
     * @param id the pet's identifier
     * @isInt id
     * @example id 2
     *
     * @param requestBody JSON object that contains the pet's desired new information
     * @example requestBody { "nickname": "foo", "imageUrl": "https://placedog.net/400/400", "species": "dog" }
     * @example requestBody { "nickname": "baz", "imageUrl": "https://placekitten.com/400/400", "species": "cat" }
     */
    @Example<Pet>({
        id: 4,
        nickname: 'foo',
        imageUrl: 'https://placedog.net/400/400',
        species: 'dog'
    })
    @Example<Pet>({
        id: 5,
        nickname: 'foo',
        imageUrl: 'https://placedog.net/400/400',
        species: 'dog'
    })
    @Response<ErrorResponse>(404, 'Not Found', {
        message: 'Pet not found'
    })
    @Put('{id}')
    async modifyPet(
        @Body() requestBody: ModifyPetRequestBody,
        @Path() id: number
    ): Promise<Pet> {
        const modifiedPet = await PetService.updateOne(id, requestBody);
        this.setStatus(200);
        return modifiedPet;
    }

    /**
     * Delete a pet by its id
     *
     * @param id the pet's identifier
     * @isInt id
     * @example id 2
     */
    @Response<ErrorResponse>(404, 'Not Found', { message: 'Match not found' })
    @Delete('{id}')
    async removePet(@Path() id: number): Promise<void> {
        await PetService.removeOne(id);
        this.setStatus(200);
    }

    /**
     * Retrieve a list of users that a specific pet has been registered to (past to present)
     *
     * @param petID the pet's identifier
     * @isInt petID
     * @example petID 2
     *
     * @param page page number used for pagination. Assumes that pageSize exists. Starts from 1.
     * @isInt page
     * @default 1
     * @example 5
     *
     * @param pageSize the number of items that will be fetched with a single response.
     * @isInt pageSize
     * @default 10
     * @example 5
     */
    @Example<UserHistoryOfPet[]>([
        {
            id: 33,
            userID: 8,
            petID: 1,
            registeredAt: '2021-01-07T21:45:30.000Z',
            releasedAt: '2021-01-10T21:45:30.000Z',
            released: 1,
            nickname: 'charlie'
        },
        {
            id: 48,
            userID: 15,
            petID: 1,
            registeredAt: '2021-01-11T21:45:30.000Z',
            releasedAt: '2021-01-12T21:45:30.000Z',
            released: 1,
            nickname: 'luther'
        }
    ])
    @Example<UserHistoryOfPet[]>([])
    @Get('{petID}/users')
    async listUsersHistory(
        @Path() petID: number,
        @Query() page?: number,
        @Query() pageSize?: number
    ): Promise<UserHistoryOfPet[]> {
        const usersHistory = PetService.findUsersHistory(petID, {
            page,
            pageSize
        });
        this.setStatus(200);
        return usersHistory;
    }
}
