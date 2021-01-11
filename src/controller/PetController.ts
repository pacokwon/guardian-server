import {
    Controller,
    Route,
    Get,
    Post,
    Put,
    Delete,
    Path,
    Body,
    Response,
    SuccessResponse
} from 'tsoa';
import { Pet } from '@/model/Pet';
import * as PetService from '@/service/PetService';
import { SuccessStatusResponse } from './schema/SuccessStatusResponse';

/**
 * Request body to be sent on user creation
 */
interface PetCreationRequestBody {
    species: string;
    nickname: string;
    imageUrl: string;
}

/**
 * Request body to be sent on user information modificiation
 */
type PetModificationRequestBody = Partial<
    Pick<PetCreationRequestBody, 'nickname' | 'imageUrl'>
>;

/**
 * Response containing requested user information
 */
interface SinglePetReadResponse {
    pet?: Pet;
}

@Route('api/pets')
export class PetController extends Controller {
    /**
     * Retrieve all users' information
     */
    @Get('/')
    async getAllPets(): Promise<Pet[]> {
        const pets = await PetService.getAllPets();

        this.setStatus(200);
        return pets;
    }

    /**
     * Retrieve the information of a single user by its id.
     *
     * @param id the user's identifier
     * @example id 4
     * @isInt id
     */
    @Get('{id}')
    async getPet(@Path() id: number): Promise<SinglePetReadResponse> {
        const pet = await PetService.getSinglePet(id);

        const statusCode = pet ? 200 : 404;
        this.setStatus(statusCode);

        return { pet };
    }

    /**
     * Create a new user from a nickname
     *
     * @param requestBody json object that contains the new user's nickname
     * @example requestBody { "nickname": "foo" }
     */
    @Post('/')
    @SuccessResponse(201)
    async createPet(
        @Body() requestBody: PetCreationRequestBody
    ): Promise<void> {
        const { species, nickname, imageUrl } = requestBody;
        await PetService.createPet({ species, nickname, imageUrl });
        this.setStatus(201);
    }

    /**
     * Modify a specific user's information by its id.
     * Currently, a user only has a nickname as information.
     *
     * @param id the user's identifier
     * @example id 2
     * @isInt id
     *
     * @param requestBody json object that contains the user's desired new nickname
     * @example requestBody { "nickname": "foo" }
     */
    @Response<SuccessStatusResponse>(404, 'Resource Not Found', {
        success: false
    })
    @Put('{id}')
    async modifyPet(
        @Body() requestBody: PetModificationRequestBody,
        @Path() id: number
    ): Promise<SuccessStatusResponse> {
        // as of now, the only modifiable data in a user is the nickname
        const success = await PetService.modifyPet(id, requestBody);

        const statusCode = success ? 200 : 404;
        this.setStatus(statusCode);
        return { success };
    }

    /**
     * Delete a user by its id
     *
     * @param id the user's identifier
     * @example id 2
     * @isInt id
     */
    @Delete('{id}')
    @Response<SuccessStatusResponse>(404, 'Resource Not Found', {
        success: false
    })
    async removePet(@Path() id: number): Promise<SuccessStatusResponse> {
        const success = await PetService.removePet(id);

        const statusCode = success ? 200 : 404;
        this.setStatus(statusCode);

        return { success };
    }
}
