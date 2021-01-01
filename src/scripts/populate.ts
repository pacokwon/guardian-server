import 'dotenv/config';
import { createConnection } from 'typeorm';
import populateUsers from './populateUsers';
import populatePets from './populatePets';
import populateComments from './populateComments';

(async () => {
    const connection = await createConnection();

    console.log('👱 Creating Users...')
    await populateUsers(15);

    console.log('🐶 Creating Pets...')
    await populatePets(20, 20);

    console.log('✉️ Creating Comments...')
    await populateComments(40);

    console.log('🎉 Done!')

    await connection.close();
})()
