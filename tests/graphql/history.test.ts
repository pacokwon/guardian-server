import request from 'supertest';
import app from '../../src/app';
import { getPool } from '../../src/common/db';

describe('/graphql', () => {
    beforeAll(async () => {
        const pool = getPool();

        // create 4 users
        await pool.query(
            `INSERT INTO User (nickname) VALUES ('bob'), ('joe'), ('max'), ('jay')`
        );

        // create 7 pets
        await pool.query(`
            INSERT INTO Pet (species, nickname, imageUrl) VALUES
            ('cat', 'foo', 'https://placekitten.com/300/300'),
            ('dog', 'bar', 'https://placedog.net/300/300'),
            ('cat', 'baz', 'https://placekitten.com/300/300'),
            ('dog', 'ham', 'https://placedog.net/300/300'),
            ('cat', 'egg', 'https://placekitten.com/300/300'),
            ('dog', 'spam', 'https://placedog.net/300/300'),
            ('cat', 'bacon', 'https://placekitten.com/300/300')
        `);
    });

    afterAll(async () => {
        const pool = getPool();

        // cleanup
        await pool.query(`DELETE FROM UserPetHistory`);
        await pool.query(`DELETE FROM Pet`);
        await pool.query(`DELETE FROM User`);

        await pool.query(`ALTER TABLE UserPetHistory AUTO_INCREMENT=1`);
        await pool.query(`ALTER TABLE Pet AUTO_INCREMENT=1`);
        await pool.query(`ALTER TABLE User AUTO_INCREMENT=1`);

        await pool.end();
    });

    it('should successfully register 3 users as guardians for 3 pets respectively', async () => {
        const query = `
            mutation($petID: ID!, $userID: ID!) {
                registerUserToPet(petID: $petID, userID: $userID) {
                    success
                }
            }
        `;

        const registerBobToBazResponse = await request(app)
            .post('/graphql')
            .send({
                query,
                variables: { petID: '3', userID: '1' }
            });

        expect(registerBobToBazResponse.body?.errors).toBeUndefined();
        expect(
            registerBobToBazResponse.body?.data?.registerUserToPet?.success
        ).toBe(true);

        const registerJoeToHamResponse = await request(app)
            .post('/graphql')
            .send({
                query,
                variables: { petID: '4', userID: '2' }
            });

        expect(registerJoeToHamResponse.body?.errors).toBeUndefined();
        expect(
            registerJoeToHamResponse.body?.data?.registerUserToPet?.success
        ).toBe(true);

        const registerMaxToEggResponse = await request(app)
            .post('/graphql')
            .send({
                query,
                variables: { petID: '5', userID: '3' }
            });

        expect(registerMaxToEggResponse.body?.errors).toBeUndefined();
        expect(
            registerMaxToEggResponse.body?.data?.registerUserToPet?.success
        ).toBe(true);
    });

    it('should not register user for currently registered pet', async () => {
        const registerJoeToBazResponse = await request(app)
            .post('/graphql')
            .send({
                query: `
                    mutation {
                        registerUserToPet(petID: "3", userID: "2") {
                            success
                        }
                    }
                `
            });

        expect(registerJoeToBazResponse.body?.errors).not.toBeUndefined();
    });

    it('should not proceed registration with unknown user or pet', async () => {
        const query = `
            mutation($petID: ID!, $userID: ID!) {
                registerUserToPet(petID: "1", userID: "10") {
                    success
                }
            }
        `;

        const registerUnknownUserResponse = await request(app)
            .post('/graphql')
            .send({
                query,
                variables: {
                    petID: '1',
                    userID: '10'
                }
            });
        expect(registerUnknownUserResponse.body?.errors).not.toBeUndefined();

        const registerUnknownPetResponse = await request(app)
            .post('/graphql')
            .send({
                query,
                variables: {
                    petID: '10',
                    userID: '1'
                }
            });
        expect(registerUnknownPetResponse.body?.errors).not.toBeUndefined();
    });

    it('should successfully unregister an existing registration', async () => {
        const unregisterBobResponse = await request(app).post('/graphql').send({
            query: `
                    mutation {
                        unregisterUserFromPet(petID: "3", userID: "1") {
                            success
                        }
                    }
                `
        });

        expect(unregisterBobResponse.body?.errors).toBeUndefined();
        expect(
            unregisterBobResponse.body?.data?.unregisterUserFromPet?.success
        ).toBe(true);
    });

    it('should have owner information when retrieving pet', async () => {
        const bazResponse = await request(app).post('/graphql').send({
            query: `
                query {
                    pet(id: "3") {
                        guardian {
                            id
                            nickname
                        }
                        nickname
                    }
                }
            `
        });

        expect(bazResponse.body?.errors).toBeUndefined();
        expect(bazResponse?.body?.data?.pet?.nickname).toBe('baz');
        expect(bazResponse?.body?.data?.pet?.guardian).toBeNull();
    });

    it('should not proceed unregistration for invalid registration', async () => {
        const unregisterBobResponse = await request(app).post('/graphql').send({
            query: `
                    mutation {
                        unregisterUserFromPet(petID: "3", userID: "1") {
                            success
                        }
                    }
                `
        });
        expect(unregisterBobResponse.body?.errors).not.toBeUndefined();
    });

    it('should not proceed unregistration for unknown pet or user', async () => {
        const query = `
            mutation($petID: ID!, $userID: ID!) {
                unregisterUserFromPet(petID: $petID, userID: $userID) {
                    success
                }
            }
        `;
        const unregisterBobResponse = await request(app)
            .post('/graphql')
            .send({
                query,
                variables: {
                    petID: '5',
                    userID: '1'
                }
            });
        expect(unregisterBobResponse.body?.errors).not.toBeUndefined();

        const unregisterJayResponse = await request(app)
            .post('/graphql')
            .send({
                query,
                variables: {
                    petID: '4',
                    userID: '4'
                }
            });
        expect(unregisterJayResponse.body?.errors).not.toBeUndefined();
    });

    it('should successfully register user "jay" to a released pet', async () => {
        const jayToBazResponse = await request(app).post('/graphql').send({
            query: `
                mutation {
                    registerUserToPet(petID: "3", userID: "4") {
                        success
                    }
                }
            `
        });

        expect(jayToBazResponse.body?.errors).toBeUndefined();
        expect(jayToBazResponse.body?.data?.registerUserToPet?.success).toBe(
            true
        );
    });

    it('should successfully register user "bob" as guardian for multiple pets', async () => {
        const query = `
            mutation($petID: ID!, $userID: ID!) {
                registerUserToPet(petID: $petID, userID: $userID) {
                    success
                }
            }
            `;

        const bobToFooResponse = await request(app)
            .post('/graphql')
            .send({
                query,
                variables: {
                    petID: '1',
                    userID: '1'
                }
            });
        expect(bobToFooResponse.body?.errors).toBeUndefined();

        const bobToBarResponse = await request(app)
            .post('/graphql')
            .send({
                query,
                variables: {
                    petID: '2',
                    userID: '1'
                }
            });
        expect(bobToBarResponse.body?.errors).toBeUndefined();
    });

    it("should correctly retrieve the pet information along with its user's information", async () => {
        const bazResponse = await request(app).post('/graphql').send({
            query: `
                query {
                    pet(id: "3") {
                        nickname
                        guardian {
                            id
                            nickname
                        }
                    }
                }
            `
        });

        expect(bazResponse.body?.errors).toBeUndefined();
        expect(bazResponse.body?.data?.pet?.nickname).toBe('baz');
        expect(bazResponse.body?.data?.pet?.guardian?.id).toBe('4');
        expect(bazResponse.body?.data?.pet?.guardian?.nickname).toBe('jay');
    });

    it('should correctly retrieve the list of guardians that pet "baz" has been registered to', async () => {
        const guardiansListOfBaz = await request(app).post('/graphql').send({
            query: `
                query {
                    pet(id: "3") {
                        userHistory {
                            user {
                                nickname
                            }
                        }
                    }
                }
            `
        });
        const users: string[] = (
            guardiansListOfBaz.body?.data?.pet?.userHistory || []
        ).map(({ user }: { user: { nickname: string } }) => user.nickname);

        expect(users).toHaveLength(2);
        expect(users.sort()).toEqual(['bob', 'jay']);
    });
});
