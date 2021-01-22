import request from 'supertest';
import app from '../../src/app';
import { getPool } from '../../src/common/db';

describe('/api/pets/:id/users + /api/users/:id/pets endpoint test', () => {
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
        const registerBobToBazResponse = await request(app)
            .post('/api/users/1/pets')
            .send({
                petID: 3
            });
        expect(registerBobToBazResponse.status).toBe(201);

        const registerJoeToHamResponse = await request(app)
            .post('/api/users/2/pets')
            .send({
                petID: 4
            });
        expect(registerJoeToHamResponse.status).toBe(201);

        const registerMaxToEggResponse = await request(app)
            .post('/api/users/3/pets')
            .send({
                petID: 5
            });
        expect(registerMaxToEggResponse.status).toBe(201);
    });

    it('should not register user for currently registered pet', async () => {
        const registerJoeToBazResponse = await request(app)
            .post('/api/users/2/pets')
            .send({
                petID: 3
            });
        expect(registerJoeToBazResponse.status).toBe(400);
    });

    it('should not proceed registration with unknown user or pet', async () => {
        const registerUnknownUserResponse = await request(app)
            .post('/api/users/10/pets')
            .send({
                petID: 1
            });
        expect(registerUnknownUserResponse.status).toBe(404);

        const registerUnknownPetResponse = await request(app)
            .post('/api/users/1/pets')
            .send({
                petID: 10
            });
        expect(registerUnknownPetResponse.status).toBe(404);
    });

    it('should not proceed registration with no request body', async () => {
        const noRequestBodyResponse = await request(app).post(
            '/api/users/10/pets'
        );
        expect(noRequestBodyResponse.status).toBe(400);
        expect(noRequestBodyResponse.body?.message).toBe('Validation Failed!');
    });

    it('should not proceed registration with unknown user or pet', async () => {
        const registerUnknownUserResponse = await request(app)
            .post('/api/users/10/pets')
            .send({
                petID: 1
            });
        expect(registerUnknownUserResponse.status).toBe(404);

        const registerUnknownPetResponse = await request(app)
            .post('/api/users/1/pets')
            .send({
                petID: 10
            });
        expect(registerUnknownPetResponse.status).toBe(404);
    });

    it('should successfully unregister an existing registration', async () => {
        const unregisterBobResponse = await request(app).delete(
            '/api/users/1/pets/3'
        );

        expect(unregisterBobResponse.status).toBe(200);
    });

    it('should have owner information when retrieving pet', async () => {
        const bazResponse = await request(app).get('/api/pets/3');
        expect(bazResponse?.body?.nickname).toBe('baz');
        expect(bazResponse?.body?.guardian).toBeNull();
    });

    it('should not proceed unregistration for invalid registration', async () => {
        const unregisterBobResponse = await request(app).delete(
            '/api/users/1/pets/3'
        );
        expect(unregisterBobResponse.status).toBe(404);
    });

    it('should not proceed unregistration for unknown pet or user', async () => {
        const unregisterBobResponse = await request(app).delete(
            '/api/users/1/pets/5'
        );
        expect(unregisterBobResponse.status).toBe(404);

        const unregisterJayResponse = await request(app).delete(
            '/api/users/4/pets/4'
        );
        expect(unregisterJayResponse.status).toBe(404);
    });

    it('should successfully register user "jay" to a released pet', async () => {
        const jayToBazResponse = await request(app)
            .post('/api/users/4/pets')
            .send({ petID: 3 });
        expect(jayToBazResponse.status).toBe(201);
    });

    it('should successfully register user "bob" as guardian for multiple pets', async () => {
        const bobToFooResponse = await request(app)
            .post('/api/users/1/pets')
            .send({ petID: 1 });
        expect(bobToFooResponse.status).toBe(201);

        const bobToBarResponse = await request(app)
            .post('/api/users/1/pets')
            .send({ petID: 2 });
        expect(bobToBarResponse.status).toBe(201);
    });

    it("should correctly retrieve the pet information along with its user's information", async () => {
        const bazResponse = await request(app).get('/api/pets/3');
        expect(bazResponse?.body?.nickname).toBe('baz');
        expect(bazResponse?.body?.guardian?.id).toBe(4);
        expect(bazResponse?.body?.guardian?.nickname).toBe('jay');
    });

    it('should correctly retrieve the list of guardians that pet "baz" has been registered to', async () => {
        const guardiansListOfBaz = await request(app).get('/api/pets/3/users');
        expect(guardiansListOfBaz.body).toHaveLength(2);
    });

    it('should correctly retrieve the list of guardians that pet "baz" has been registered to, with pagination', async () => {
        const guardiansListOfBaz = await request(app).get(
            '/api/pets/3/users?page=2&pageSize=1'
        );
        expect(guardiansListOfBaz.body).toHaveLength(1);
        expect(guardiansListOfBaz.body[0].nickname).toBe('jay');
    });

    it('should correctly retrieve the list of pets that are *currently* registered to user "bob"', async () => {
        const currentPetsListOfBob = await request(app).get(
            '/api/users/1/pets'
        );
        expect(currentPetsListOfBob.status).toBe(200);
        expect(currentPetsListOfBob.body).toHaveLength(2);

        const petNames = currentPetsListOfBob.body
            .map((pet: { nickname: string }) => pet.nickname)
            .sort();
        expect(petNames).toEqual(['foo', 'bar'].sort());
    });

    it('should correctly retrieve the list of pets that are *currently* registered to user "bob", with pagination', async () => {
        const currentPetsListOfBob = await request(app).get(
            '/api/users/1/pets?page=2&pageSize=1'
        );
        expect(currentPetsListOfBob.status).toBe(200);
        expect(currentPetsListOfBob.body).toHaveLength(1);

        const { nickname } = currentPetsListOfBob.body[0];
        expect(['foo', 'bar'].includes(nickname)).toBe(true);
    });

    it('should correctly retrieve the list of pets that are registered to user "bob"', async () => {
        const petsListOfBob = await request(app).get(
            '/api/users/1/pets?all=true'
        );
        const petNames = petsListOfBob.body
            .map((pet: { nickname: string }) => pet.nickname)
            .sort();

        expect(petsListOfBob.body).toHaveLength(3);
        expect(petNames).toEqual(['baz', 'foo', 'bar'].sort());
    });

    it('should correctly retrieve the list of pets that are registered to user "bob", with pagination', async () => {
        const petsListOfBob = await request(app).get(
            '/api/users/1/pets?page=2&pageSize=2&all=true'
        );
        expect(petsListOfBob.body).toHaveLength(1);

        const { nickname } = petsListOfBob.body[0];
        expect(['baz', 'foo', 'bar'].includes(nickname)).toBe(true);
    });
});
