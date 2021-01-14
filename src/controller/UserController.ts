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
    Response,
    SuccessResponse,
    Example,
    Tags
} from 'tsoa';
import { User } from '@/model/User';
import * as UserService from '@/service/UserService';
import { PetHistoryOfUser } from '@/repository/UserPetHistoryRepository';
import { ApiError, ErrorResponse } from '@/common/error';

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

/**
 * Request body to be received on user registration for certain pet
 */
interface RegisterUserToPetRequestBody {
    /**
     * Pet's identification number
     * @isInt
     */
    petID: number;
}

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
    async getAllUsers(
        @Query() page?: number,
        @Query() pageSize?: number,
        @Query() field?: string[]
    ): Promise<User[]> {
        const users = await UserService.findAll({ page, pageSize, field });
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
    async getUser(
        @Path() id: number,
        @Query() field?: string[]
    ): Promise<SingleUserReadResponse> {
        const user = await UserService.findOne(id, { field });

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
    @SuccessResponse(201, 'Created')
    @Post('/')
    async createUser(
        @Body() requestBody: CreateUserRequestBody
    ): Promise<void> {
        const { nickname } = requestBody;
        const error = await UserService.createOne(nickname);
        if (error.message) throw new ApiError(error.status, error.message);

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
    @Response<void>(404, 'Resource Not Found')
    @Response<ErrorResponse>(404, 'Not Found', {
        message: 'Match not found'
    })
    @Delete('{id}')
    async removeUser(@Path() id: number): Promise<void> {
        const error = await UserService.removeOne(id);

        if (error.message) throw new ApiError(error.status, error.message);

        this.setStatus(200);
    }

    /**
     * Retrieve a list of pets that a specific user has registered to (past to present)
     *
     * @param userID the pet's identifier
     * @isInt userID
     * @example userID 2
     */
    @Get('{userID}/pets')
    async listPetsHistory(@Path() userID: number): Promise<PetHistoryOfUser[]> {
        const petsHistory = UserService.findPetsHistory(userID);
        this.setStatus(200);
        return petsHistory;
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
    @Post('{userID}/pets')
    async registerUser(
        @Body() requestBody: RegisterUserToPetRequestBody,
        @Path() userID: number
    ): Promise<void> {
        const { petID } = requestBody;

        const error = await UserService.registerUser(petID, userID);

        if (error.message) throw new ApiError(error.status, error.message);

        this.setStatus(201);
    }

    /**
     * Unregister a pet from a user by its id
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
    @Delete('{userID}/pets/{petID}')
    async unregisterUser(
        @Path() userID: number,
        @Path() petID: number
    ): Promise<void> {
        const error = await UserService.unregisterUser(petID, userID);

        if (error.message) throw new ApiError(error.status, error.message);

        this.setStatus(200);
    }
}
