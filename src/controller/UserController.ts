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
    SuccessResponse,
    Example,
    Tags
} from 'tsoa';
import { User } from '@/model/User';
import * as UserService from '@/service/UserService';
import { PetHistoryOfUser } from '@/repository/UserPetHistoryRepository';

/**
 * Request body to be sent on user creation
 */
interface CreateUserRequestBody {
    /**
     * User's nickname
     */
    nickname: string;
}

/**
 * Request body to be sent on user information modificiation
 */
type ModifyUserRequestBody = CreateUserRequestBody;

/**
 * Response containing requested user information
 */
interface SingleUserReadResponse {
    /**
     * JSON object containing user information. Could be undefined.
     */
    user?: User;
}

/**
 * Response containing requested user information
 */
type SingleUserUpdateResponse = SingleUserReadResponse;

@Route('api/users')
@Tags('User')
export class UserController extends Controller {
    /**
     * Retrieve all users' information
     */
    @Example<User[]>([
        {
            id: 2,
            nickname: 'bently'
        },
        {
            id: 8,
            nickname: 'leonard'
        },
        {
            id: 13,
            nickname: 'lacey'
        }
    ])
    @Example<User[]>([])
    @Get('/')
    async getAllUsers(): Promise<User[]> {
        const users = await UserService.findAll();

        this.setStatus(200);
        return users;
    }

    /**
     * Retrieve the information of a single user by its id.
     *
     * @param id the user's identifier
     * @example id 4
     * @isInt id
     */
    @Example<SingleUserReadResponse>({
        user: {
            id: 4,
            nickname: 'max'
        }
    })
    @Response<SingleUserReadResponse>(404, 'Resource Not Found', {})
    @Get('{id}')
    async getUser(@Path() id: number): Promise<SingleUserReadResponse> {
        const user = await UserService.findOne(id);

        const statusCode = user ? 200 : 404;
        this.setStatus(statusCode);

        return { user };
    }

    /**
     * Create a new user from a nickname
     *
     * @param requestBody JSON object that contains the new user's nickname
     * @example requestBody { "nickname": "foo" }
     */
    @Post('/')
    @SuccessResponse(201, 'Created')
    async createUser(
        @Body() requestBody: CreateUserRequestBody
    ): Promise<void> {
        const { nickname } = requestBody;
        await UserService.createOne(nickname);
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
     * @param requestBody JSON object that contains the user's desired new nickname
     * @example requestBody { "nickname": "foo" }
     */
    @Response<SingleUserUpdateResponse>(404, 'Resource Not Found', {})
    @Put('{id}')
    async modifyUser(
        @Body() requestBody: ModifyUserRequestBody,
        @Path() id: number
    ): Promise<SingleUserUpdateResponse> {
        const { nickname } = requestBody;
        // as of now, the only modifiable data in a user is the nickname
        const modifiedUser = await UserService.updateOne(id, nickname);

        const statusCode = modifiedUser ? 200 : 404;
        this.setStatus(statusCode);
        return { user: modifiedUser };
    }

    /**
     * Delete a user by its id
     *
     * @param id the user's identifier
     * @example id 2
     * @isInt id
     */
    @Delete('{id}')
    @Response<void>(404, 'Resource Not Found')
    async removeUser(@Path() id: number): Promise<void> {
        try {
            await UserService.removeOne(id);
            this.setStatus(200);
        } catch {
            this.setStatus(404);
        }
    }

    /**
     * Retrieve a list of pets that a specific user has registered to (past to present)
     *
     * @param petID the pet's identifier
     * @isInt petID
     * @example petID 2
     */
    @Get('{userID}/pets')
    async listPetsHistory(@Path() userID: number): Promise<PetHistoryOfUser[]> {
        const petsHistory = UserService.findPetsHistory(userID);
        this.setStatus(200);
        return petsHistory;
    }
}
