import { getConnection, Repository } from 'typeorm';
import User from '@/entities/User';

export class UserService {
    private repository: Repository<User>;

    constructor() {
        this.repository = getConnection().getRepository(User);
    }

    async getAll(): Promise<User[]> {
        return await this.repository.find();
    }

    async getSingleUser(username: string): Promise<User | null> {
        const user = await this.repository.findOne({ username });

        if (!user) return null;
        return user;
    }

    async exists(username: string): Promise<boolean> {
        const count = await this.repository.count({ username });
        return count > 0;
    }

    async createUser(username: string): Promise<void> {
        const user = this.repository.create({ username });
        await this.repository.save(user);
    }

    async modifyUsername(
        oldUsername: string,
        newUsername: string
    ): Promise<boolean> {
        const user = await this.getSingleUser(oldUsername);

        if (!user) return false;

        user.username = newUsername;
        await this.repository.save(user);
        return true;
    }

    async removeUser(username: string): Promise<boolean> {
        const user = await this.getSingleUser(username);

        // cannot remove a user that does not exist
        if (!user || user.deleted === 0) return false;

        user.deleted = 1;
        await this.repository.save(user);
        return true;
    }
}
