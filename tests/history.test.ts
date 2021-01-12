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

        // create 3 users
        await pool.query(
            `INSERT INTO User (nickname) VALUES ('bob'), ('joe'), ('max')`
        );

        // create 5 pets
        // species nickname imageUrl
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
            .post('/api/pets/3')
            .send({
                id: 1
            });
        expect(registerBobToBazResponse.status).toBe(201);

        const registerJoeToHamResponse = await request(app)
            .post('/api/pets/4')
            .send({
                id: 2
            });
        expect(registerJoeToHamResponse.status).toBe(201);

        const registerMaxToEggResponse = await request(app)
            .post('/api/pets/5')
            .send({
                id: 3
            });
        expect(registerMaxToEggResponse.status).toBe(201);
    });
});
