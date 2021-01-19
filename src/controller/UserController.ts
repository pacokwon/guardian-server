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
    Example,
    Tags,
    ValidateError
} from 'tsoa';
import { User } from '../model/User';
import * as UserService from '../service/UserService';
import { PetHistoryOfUser } from '../repository/UserPetHistoryRepository';
import { ErrorResponse } from '../common/error';
import { validateUserFields } from '../common/validator';

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
 * Response to be sent on user creation request. Contains identification
 * number of created user.
 */
interface CreateUserResponse {
    id: number;
}

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
     *
     * @param page Page number used for pagination. Assumes that pageSize exists. Starts from 1.
     * @isInt page
     * @default 1
     * @example 5
     *
     * @param pageSize The number of items that will be fetched with a single response.
     * @isInt pageSize
     * @default 10
     * @example 5
     *
     * @param field Properties available for User information. Usable fields are 'nickname' and 'id'. Can be used multiple times
     * @default 'id', 'nickname'
     * @example 'id'
     * @example 'nickname'
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
        if (!validateUserFields(field))
            throw new ValidateError({}, 'Invalid field for User!');

        const users = await UserService.findAll({ page, pageSize, field });
        this.setStatus(200);
        return users;
    }

    /**
     * Retrieve the information of a single user by its id.
     *
     * @param id the user's identifier
     * @isInt id
     * @example id 4
     */
    @Example<User>({
        id: 4,
        nickname: 'max'
    })
    @Response<ErrorResponse>(404, 'Not Found', {
        message: 'User not found'
    })
    @Get('{id}')
    async getUser(
        @Path() id: number,
        @Query() field?: string[]
    ): Promise<User> {
        if (!validateUserFields(field))
            throw new ValidateError({}, 'Invalid field for User!');

        const user = await UserService.findOne(id, { field });
        this.setStatus(200);
        return user;
    }

    /**
     * Create a new user from a nickname
     *
     * @param requestBody JSON object that contains the new user's nickname
     * @example requestBody { "nickname": "foo" }
     */
    @Response<CreateUserResponse>(201, 'Created', {
        id: 1
    })
    @Post('/')
    async createUser(
        @Body() requestBody: CreateUserRequestBody
    ): Promise<CreateUserResponse> {
        const { nickname } = requestBody;
        const insertID = await UserService.createOne(nickname);
        this.setStatus(201);
        return { id: insertID };
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
    @Response<ErrorResponse>(404, 'Not Found', {
        message: 'User not found'
    })
    @Put('{id}')
    async modifyUser(
        @Body() requestBody: ModifyUserRequestBody,
        @Path() id: number
    ): Promise<User> {
        const { nickname } = requestBody;
        // as of now, the only modifiable data in a user is the nickname
        const modifiedUser = await UserService.updateOne(id, nickname);
        this.setStatus(200);
        return modifiedUser;
    }

    /**
     * Delete a user by its id
     *
     * @param id the user's identifier
     * @example id 2
     * @isInt id
     */
    @Response<ErrorResponse>(404, 'Not Found', {
        message: 'User not found'
    })
    @Delete('{id}')
    async removeUser(@Path() id: number): Promise<void> {
        await UserService.removeOne(id);
        this.setStatus(200);
    }

    /**
     * Retrieve a list of pets that a specific user has registered to
     *
     * @param userID the pet's identifier
     * @isInt userID
     * @example userID 2
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
     * @param all flag for querying all(including past records) pet history. Defaults to `false`
     * @isBool all
     * @default false
     * @example true
     */
    @Example<PetHistoryOfUser[]>([
        {
            id: 3,
            userID: 1,
            petID: 7,
            registeredAt: '2021-01-04T21:45:30.000Z',
            releasedAt: '2021-01-05T21:45:30.000Z',
            released: 1,
            nickname: 'sutton'
        },
        {
            id: 12,
            userID: 1,
            petID: 16,
            registeredAt: '2021-01-05T21:45:30.000Z',
            releasedAt: '2021-01-06T21:45:30.000Z',
            released: 1,
            nickname: 'loran'
        }
    ])
    @Example<PetHistoryOfUser[]>([])
    @Get('{userID}/pets')
    async listPetsHistory(
        @Path() userID: number,
        @Query() page?: number,
        @Query() pageSize?: number,
        @Query() all?: boolean
    ): Promise<PetHistoryOfUser[]> {
        const petsHistory = UserService.findPetsHistory(userID, {
            page,
            pageSize,
            all
        });
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
    async registerPet(
        @Body() requestBody: RegisterUserToPetRequestBody,
        @Path() userID: number
    ): Promise<void> {
        const { petID } = requestBody;
        await UserService.registerPet(petID, userID);
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
        message: 'User not found'
    })
    @Delete('{userID}/pets/{petID}')
    async unregisterPet(
        @Path() userID: number,
        @Path() petID: number
    ): Promise<void> {
        await UserService.unregisterPet(petID, userID);
        this.setStatus(200);
    }
}
