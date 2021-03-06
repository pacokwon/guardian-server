import axios from 'axios';
import { getPool } from '../src/common/db';

export const populateUsers = async (numberOfUsers: number): Promise<void> => {
    const pool = getPool();

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
        result.data.map(async nickname => {
            await pool
                .query(`INSERT INTO User (nickname) VALUES ('${nickname}')`)
                .catch(console.error);
        })
    );
};
