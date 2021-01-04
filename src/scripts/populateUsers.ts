import axios from 'axios';
import { getConnection } from 'typeorm';
import User from '@entities/User';

export default async (numberOfUsers: number): Promise<void> => {
    const connection = getConnection();
    const userRepository = connection.getRepository(User);

    const result: { data: string[] } = await axios.get(
        `http://names.drycodes.com/${numberOfUsers}`,
        {
            params: {
                nameOptions: 'boy_names',
                combine: 1,
                case: 'lower'
            }
        }
    );

    await Promise.all(
        result.data.map(async username => {
            const user = userRepository.create({ username });
            await userRepository.save(user);
        })
    );
};
