import { getPool } from '../src/common/db';
import { populateUsers } from './populateUsers';
import { populatePets } from './populatePets';
import { populateHistories } from './populateHistories';

async function main() {
    const args = process.argv.slice(2);
    if (args.includes('--help')) {
        console.log('usage:\t<# of users> <# of pets> <# of timestamps>');
        process.exit(0);
    }

    const [usersArgs = '20', petsArgs = '50', timestampsArgs = '30'] = args;
    const petsCountHalf = Math.floor(Number(petsArgs) / 2);

    console.log(`👱 Creating ${usersArgs} Users...`);
    await populateUsers(Number(usersArgs));

    console.log(`🐶 Creating ${petsArgs} Pets...`);
    await populatePets(petsCountHalf, Number(petsArgs) - petsCountHalf);

    console.log('📖 Creating History...');
    await populateHistories(Number(timestampsArgs));

    console.log('🎉 Done!');

    await getPool().end();
}

main();
