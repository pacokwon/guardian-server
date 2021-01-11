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
    Example
} from 'tsoa';
import { User } from '@/model/User';
import * as UserService from '@/service/UserService';
import { SuccessStatusResponse } from './schema/SuccessStatusResponse';

/**
 * Request body to be sent on user creation
 */
interface UserCreationRequestBody {
    nickname: string;
}

/**
 * Request body to be sent on user information modificiation
 */
interface UserModificationRequestBody {
    nickname: string;
}

/**
 * Response containing requested user information
 */
interface SingleUserReadResponse {
    user?: User;
}

/**
 * Response containing requested user information
 */
type SingleUserUpdateResponse = SingleUserReadResponse;

@Route('api/users')
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
        const users = await UserService.getAllUsers();

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
        const user = await UserService.getSingleUser(id);

        const statusCode = user ? 200 : 404;
        this.setStatus(statusCode);

        return { user };
    }

    /**
     * Create a new user from a nickname
     *
     * @param requestBody json object that contains the new user's nickname
     * @example requestBody { "nickname": "foo" }
     */
    @Post('/')
    @SuccessResponse(201, 'Created')
    async createUser(
        @Body() requestBody: UserCreationRequestBody
    ): Promise<void> {
        const { nickname } = requestBody;
        await UserService.createUser(nickname);
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
    @Response<SingleUserUpdateResponse>(404, 'Resource Not Found', {})
    @Put('{id}')
    async modifyUser(
        @Body() requestBody: UserModificationRequestBody,
        @Path() id: number
    ): Promise<SingleUserUpdateResponse> {
        const { nickname } = requestBody;

        // as of now, the only modifiable data in a user is the nickname
        const success = await UserService.modifyNickname(id, nickname);

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
    async removeUser(@Path() id: number): Promise<SuccessStatusResponse> {
        const success = await UserService.removeUser(id);

        const statusCode = success ? 200 : 404;
        this.setStatus(statusCode);

        return { success };
    }
}
