import request from 'supertest';
import app from '@/app';
import { getPool } from '@/common/db';

describe('/api/pets/:id/users + /api/users/:id/pets endpoint test', () => {
    beforeAll(async () => {
        const pool = getPool();

        // reset tables
        await pool.query(`DELETE FROM UserPetHistory`);
        await pool.query(`DELETE FROM Pet`);
        await pool.query(`DELETE FROM User`);

        await pool.query(`ALTER TABLE User AUTO_INCREMENT=1`);
        await pool.query(`ALTER TABLE Pet AUTO_INCREMENT=1`);

        // create 4 users
        await pool.query(
            `INSERT INTO User (nickname) VALUES ('bob'), ('joe'), ('max'), ('jay')`
        );

        // create 5 pets
        await pool.query(`
            INSERT INTO Pet (species, nickname, imageUrl) VALUES
            ('cat', 'foo', 'https://placekitten.com/300/300'),
            ('dog', 'bar', 'https://placedog.net/300/300'),
            ('cat', 'baz', 'https://placekitten.com/300/300'),
            ('dog', 'ham', 'https://placedog.net/300/300'),
            ('cat', 'egg', 'https://placekitten.com/300/300')
        `);
    });

    afterAll(async () => {
        await getPool().end();
    });

    it('should successfully register bob, joe, max as guardians for baz, ham, egg respectively', async () => {
        const registerBobToBazResponse = await request(app)
            .post('/api/pets/3/users')
            .send({
                userID: 1
            });
        expect(registerBobToBazResponse.status).toBe(201);

        const registerJoeToHamResponse = await request(app)
            .post('/api/pets/4/users')
            .send({
                userID: 2
            });
        expect(registerJoeToHamResponse.status).toBe(201);

        const registerMaxToEggResponse = await request(app)
            .post('/api/pets/5/users')
            .send({
                userID: 3
            });
        expect(registerMaxToEggResponse.status).toBe(201);
    });

    it('should not register user for currently registered pet', async () => {
        const registerJoeToBazResponse = await request(app)
            .post('/api/pets/3/users')
            .send({
                userID: 2
            });
        expect(registerJoeToBazResponse.status).toBe(400);
    });

    it('should not proceed registration with unknown user or pet', async () => {
        const registerUnknownUserResponse = await request(app)
            .post('/api/pets/1/users')
            .send({
                userID: 10
            });
        expect(registerUnknownUserResponse.status).toBe(404);

        const registerUnknownPetResponse = await request(app)
            .post('/api/pets/10/users')
            .send({
                userID: 1
            });
        expect(registerUnknownPetResponse.status).toBe(404);
    });

    it('should not proceed registration with unknown user or pet', async () => {
        const registerUnknownUserResponse = await request(app)
            .post('/api/pets/1/users')
            .send({
                userID: 10
            });
        expect(registerUnknownUserResponse.status).toBe(404);

        const registerUnknownPetResponse = await request(app)
            .post('/api/pets/10/users')
            .send({
                userID: 1
            });
        expect(registerUnknownPetResponse.status).toBe(404);
    });

    it('should successfully unregister an existing registration', async () => {
        const unregisterBobResponse = await request(app).delete(
            '/api/pets/3/users/1'
        );

        expect(unregisterBobResponse.status).toBe(200);
    });

    it('should not proceed unregistration for invalid registration', async () => {
        const unregisterBobResponse = await request(app).delete(
            '/api/pets/3/users/1'
        );
        expect(unregisterBobResponse.status).toBe(404);
    });

    it('should not proceed unregistration for unknown pet or user', async () => {
        const unregisterBobResponse = await request(app).delete(
            '/api/pets/5/users/1'
        );
        expect(unregisterBobResponse.status).toBe(404);

        const unregisterJayResponse = await request(app).delete(
            '/api/pets/4/users/4'
        );
        expect(unregisterJayResponse.status).toBe(404);
    });
});
