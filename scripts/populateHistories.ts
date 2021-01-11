import { getPool } from '@/common/db';
import { UserRow } from '@/model/User';
import { PetRow } from '@/model/Pet';
import { UserPetRegisterHistory as _UserPetRegisterHistory } from '@/model/UserPetRegisterHistory';

// UserPetRegisterHistory without id field
type UserPetRegisterHistory = Omit<_UserPetRegisterHistory, 'id'>;

interface PetRegistration {
    petID: number;
    registeredAt: number;
}

interface PopulateHistoriesOptions {
    petCountLimit: number;
    unregisterProbability: number;
}

function shuffled<T>(array: T[]) {
    const clonedArray = [...array];

    for (let i = clonedArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [clonedArray[i], clonedArray[j]] = [clonedArray[j], clonedArray[i]];
    }

    return clonedArray;
}

function getDateStringFromTimestamp(timestamp: number) {
    const isoString = new Date(timestamp).toISOString();
    return isoString.slice(0, isoString.length - 1).replace('T', ' ');
}

/**
 * Population Algorithm:
 * 1. Read n users from the User table, and m pets from the Pet table
 * 2. Initialize two javascript objects. userRegisteredPetsMap stores the (userID, the current array of pet ids that this user is protecting) key value pair.
 *    petRegisteredStatusMap stores (petID, whether this pet is under a guardian or not) key value pair.
 * 3. Initialize a multiple timestamps, the amount specified by the function options. Store these timestamps in an array
 * 4. Iterate the array of timestamps.
 * 5. For each timestamp, do two things:
 *   5-1. Randomly unregister a pet from a user with a threshold probability (denoted by unregisterProbability). Then push an object to the registerHistoryArray.
 *   5-2. Randomly register a pet to a user (also randomly)
 * 6. After exiting from 4, push all currently valid registrations to the registerHistoryArray
 * 7. Populate the UserPetRegisterHistory table with the elemtns of registerHistoryArray
 */
export const populateHistories = async (
    checkPointCount: number,
    options?: PopulateHistoriesOptions
): Promise<void> => {
    const { petCountLimit = 5, unregisterProbability = 0.6 } = options || {};

    const pool = getPool();

    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const checkPoints = Array(checkPointCount)
        .fill(0)
        .map((_, index) => now - index * day)
        .reverse();

    const [userRows] = await pool.query<UserRow[]>(
        `SELECT id FROM User WHERE deleted=0 LIMIT 15`
    );

    const [petRows] = await pool.query<PetRow[]>(
        `SELECT id FROM Pet WHERE deleted=0 LIMIT 20`
    );

    const userRegisteredPetsMap: Record<
        string,
        PetRegistration[]
    > = userRows.reduce((acc, user) => ({ ...acc, [user.id]: [] }), {});

    const petRegisteredStatusMap: Record<string, boolean> = petRows.reduce(
        (acc, pet) => ({ ...acc, [pet.id]: false }),
        {}
    );

    const registerHistoryArray: UserPetRegisterHistory[] = [];

    checkPoints.forEach(checkPointTimestamp => {
        // unregister pets with probability
        Object.keys(userRegisteredPetsMap).forEach(userID => {
            const petArray = userRegisteredPetsMap[userID];

            if (petArray.length === 0) return;

            if (Math.random() > unregisterProbability) return;

            // remove a random object
            const randomIndex = Math.floor(Math.random() * petArray.length);

            // removes element at `randomIndex` and returns an array containing it
            const { petID, registeredAt } = petArray.splice(randomIndex, 1)[0];

            registerHistoryArray.push({
                userID: parseInt(userID),
                petID,
                registeredAt,
                releasedAt: checkPointTimestamp,
                released: 1
            });
        });

        // fetch currently unregistered pets
        const availablePets = Object.keys(petRegisteredStatusMap)
            .filter(petID => !petRegisteredStatusMap[petID])
            .map(petIDString => parseInt(petIDString));

        // fetch users with less than pet limit count
        const availableUsers = Object.keys(userRegisteredPetsMap)
            .filter(
                userID => userRegisteredPetsMap[userID].length < petCountLimit
            )
            .map(userIDString => parseInt(userIDString));

        const randomSelectCount = Math.min(
            Math.floor(availableUsers.length / 2),
            availablePets.length
        );
        const randomSelectedPetIDs = shuffled(availablePets).slice(
            0,
            randomSelectCount
        );
        const randomSelectedUserIDs = shuffled(availableUsers).slice(
            0,
            randomSelectCount
        );

        randomSelectedUserIDs.forEach((userID, index) =>
            userRegisteredPetsMap[userID].push({
                petID: randomSelectedPetIDs[index],
                registeredAt: checkPointTimestamp
            })
        );
    });

    Object.keys(userRegisteredPetsMap).forEach(userID => {
        userRegisteredPetsMap[userID].forEach(({ petID, registeredAt }) => {
            registerHistoryArray.push({
                userID: parseInt(userID),
                petID,
                registeredAt,
                releasedAt: registeredAt,
                released: 0
            });
        });
    });

    // registerHistoryArray.forEach(
    //     ({ userID, petID, registeredAt, releasedAt, released }) => {
    //         console.log(
    //             `user ${userID}\t\tpet ${petID}\t:from ${new Date(registeredAt)
    //                 .toISOString()
    //                 .slice(5, 10)} ~ ${new Date(releasedAt)
    //                 .toISOString()
    //                 .slice(5, 10)} (${released ? 'invalid' : 'valid'})`
    //         );
    //     }
    // );

    await Promise.all(
        registerHistoryArray.map(
            async ({ userID, petID, registeredAt, releasedAt, released }) => {
                const registerDateString = getDateStringFromTimestamp(
                    registeredAt
                );
                const releaseDateString = getDateStringFromTimestamp(
                    releasedAt
                );

                await pool.query(
                    `INSERT INTO UserPetRegisterHistory (userID, petID, registeredAt, releasedAt, released) VALUES (${userID}, ${petID}, '${registerDateString}', '${releaseDateString}', ${released})`
                );
            }
        )
    ).catch(console.error);
};
