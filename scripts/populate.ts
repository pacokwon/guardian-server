import 'dotenv/config';
import { getPool } from '@/common/db';
import populateUsers from './populateUsers';
import populatePets from './populatePets';

(async () => {
    console.log('👱 Creating Users...');
    await populateUsers(15);

    console.log('🐶 Creating Pets...');
    await populatePets(20, 20);

    console.log('🎉 Done!');

    await getPool().end();
})();
