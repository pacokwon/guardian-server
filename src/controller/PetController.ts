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
    SuccessResponse
} from 'tsoa';
import { Pet } from '@/model/Pet';
import * as PetService from '@/service/PetService';
import { ApiError } from '@/common/error';

/**
 * Request body to be received on pet creation
 */
interface CreatePetRequestBody {
    species: string;
    nickname: string;
    imageUrl: string;
}

/**
 * Request body to be received on user registration for certain pet
 */
interface RegisterUserRequestBody {
    userID: number;
}

/**
 * Request body to be received on user unregistration for certain pet
 */
interface UnregisterUserRequestBody {
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
    pet?: Pet;
}

/**
 * Response containing updated pet information
 */
type SinglePetUpdateResponse = SinglePetReadResponse;

@Route('api/pets')
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
     * @example id 4
     * @isInt id
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
     * @param requestBody json object that contains the new pet's information
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
     * @example id 2
     * @isInt id
     *
     * @param requestBody json object that contains the pet's desired new information
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
     * @example id 2
     * @isInt id
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

    @Post('{id}/users')
    async registerUser(
        @Body() requestBody: RegisterUserRequestBody,
        @Path() id: number
    ): Promise<void> {
        const petID = id;
        const { userID } = requestBody;

        const error = await PetService.registerUser(petID, userID);

        if (error.message) throw new ApiError(error.status, error.message);

        this.setStatus(201);
    }

    @Put('{id}/users')
    async unregisterUser(
        @Body() requestBody: UnregisterUserRequestBody,
        @Path() id: number
    ): Promise<void> {
        const petID = id;
        const { userID } = requestBody;

        const error = await PetService.unregisterUser(petID, userID);

        if (error.message) throw new ApiError(error.status, error.message);

        this.setStatus(200);
    }
}
