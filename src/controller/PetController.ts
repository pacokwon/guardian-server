import {
    Controller,
    Route,
    Get,
    Post,
    Put,
    Delete,
    Path,
    Body,
    Example,
    Response,
    SuccessResponse,
    Tags
} from 'tsoa';
import { Pet } from '@/model/Pet';
import * as PetService from '@/service/PetService';
import { UserHistoryOfPet } from '@/repository/UserPetHistoryRepository';
import { ApiError, ErrorResponse } from '@/common/error';

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
 * Request body to be received on user registration for certain pet
 */
interface RegisterUserToPetRequestBody {
    /**
     * User's identification number
     * @isInt
     */
    userID: number;
}

/**
 * Request body to be sent on pet information modificiation
 */
type ModifyPetRequestBody = CreatePetRequestBody;

/**
 * Response containing requested pet information
 */
interface SinglePetReadResponse {
    /**
     * JSON object containing pet information. Could be undefined.
     */
    pet?: Pet;
}

/**
 * Response containing updated pet information
 */
type SinglePetUpdateResponse = SinglePetReadResponse;

@Route('api/pets')
@Tags('Pet')
export class PetController extends Controller {
    /**
     * Retrieve all pets' information
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
    async getAllPets(): Promise<Pet[]> {
        const pets = await PetService.findAll();

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
    @Example<SinglePetReadResponse>({
        pet: {
            id: 13,
            species: 'cat',
            nickname: 'lacey',
            imageUrl: 'https://placedog.net/500/500'
        }
    })
    @Example<SinglePetReadResponse>({})
    @Get('{id}')
    async getPet(@Path() id: number): Promise<SinglePetReadResponse> {
        const pet = await PetService.findOne(id);

        const statusCode = pet ? 200 : 404;
        this.setStatus(statusCode);

        return { pet };
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
    async createPet(@Body() requestBody: CreatePetRequestBody): Promise<void> {
        const { species, nickname, imageUrl } = requestBody;
        await PetService.createOne({ species, nickname, imageUrl });
        this.setStatus(201);
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
    @Example<SinglePetUpdateResponse>({
        pet: {
            id: 4,
            nickname: 'foo',
            imageUrl: 'https://placedog.net/400/400',
            species: 'dog'
        }
    })
    @Example<SinglePetUpdateResponse>({
        pet: {
            id: 5,
            nickname: 'foo',
            imageUrl: 'https://placedog.net/400/400',
            species: 'dog'
        }
    })
    @Response<SinglePetUpdateResponse>(404, 'Resource Not Found', {})
    @Put('{id}')
    async modifyPet(
        @Body() requestBody: ModifyPetRequestBody,
        @Path() id: number
    ): Promise<SinglePetUpdateResponse> {
        const modifiedPet = await PetService.updateOne(id, requestBody);

        const statusCode = modifiedPet ? 200 : 404;
        this.setStatus(statusCode);
        return { pet: modifiedPet };
    }

    /**
     * Delete a pet by its id
     *
     * @param id the pet's identifier
     * @isInt id
     * @example id 2
     */
    @Delete('{id}')
    @Response<void>(404, 'Resource Not Found')
    async removePet(@Path() id: number): Promise<void> {
        try {
            await PetService.removeOne(id);
            this.setStatus(200);
        } catch {
            this.setStatus(404);
        }
    }

    /**
     * Register a user to a pet
     *
     * @param petID the pet's identifier
     * @isInt petID
     * @example petID 2
     *
     * @param requestBody JSON object that contains the registrating user's identification number
     * @example requestBody { "userID": 13 }
     */
    @Response<ErrorResponse>(400, 'Bad Request', {
        message: 'Pet is already registered to a user!'
    })
    @Response<ErrorResponse>(404, 'Not Found', {
        message: 'Pet or User does not exist!'
    })
    @Post('{petID}/users')
    async registerUser(
        @Body() requestBody: RegisterUserToPetRequestBody,
        @Path() petID: number
    ): Promise<void> {
        const { userID } = requestBody;

        const error = await PetService.registerUser(petID, userID);

        if (error.message) throw new ApiError(error.status, error.message);

        this.setStatus(201);
    }

    /**
     * Retrieve a list of users that a specific pet has been registered to (past to present)
     *
     * @param petID the pet's identifier
     * @isInt petID
     * @example petID 2
     */
    @Get('{petID}/users')
    async listUsersHistory(@Path() petID: number): Promise<UserHistoryOfPet[]> {
        const usersHistory = PetService.findUsersHistory(petID);
        this.setStatus(200);
        return usersHistory;
    }

    /**
     * Delete a pet by its id
     *
     * @param petID the pet's identifier
     * @isInt petID
     * @example petID 2
     *
     * @param userID the user's identifier
     * @isInt userID
     * @example userID 3
     */
    @Response<ErrorResponse>(404, 'Not Found', {
        message: 'Match not found'
    })
    @Delete('{petID}/users/{userID}')
    async unregisterUser(
        @Path() petID: number,
        @Path() userID: number
    ): Promise<void> {
        const error = await PetService.unregisterUser(petID, userID);

        if (error.message) throw new ApiError(error.status, error.message);

        this.setStatus(200);
    }
}
