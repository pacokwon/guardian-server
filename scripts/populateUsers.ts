import axios from 'axios';
import { getPool } from '@/common/db';

export default async (numberOfUsers: number): Promise<void> => {
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
            const [_, err] = await pool.query(
                `INSERT INTO User (nickname) VALUES ('${nickname}')`
            );

            if (err)
                console.log(
                    `Error occurred while inserting ${nickname}: ${err}`
                );
        })
    );
};
