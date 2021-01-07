import 'dotenv/config';
import { createConnection } from 'typeorm';
import populateUsers from './populateUsers';
import populatePets from './populatePets';

(async () => {
    const connection = await createConnection();
    await connection.synchronize(true);

    console.log('👱 Creating Users...');
    await populateUsers(15);

    console.log('🐶 Creating Pets...');
    await populatePets(20, 20);

    console.log('🎉 Done!');

    await connection.close();
})();
