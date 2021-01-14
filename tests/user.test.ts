import app from '@/app';
import { getPool } from '@/common/db';
import request from 'supertest';

describe('/api/users endpoint test', () => {
    afterAll(async () => {
        const pool = getPool();

        // cleanup
        await pool.query(`DELETE FROM User`);
        await pool.query(`ALTER TABLE User AUTO_INCREMENT=1`);

        await pool.end();
    });

    it('should retrieve an empty list of users', async () => {
        const response = await request(app).get('/api/users');
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual([]);
    });

    it('should successfully create multiple new users', async () => {
        const createFooResponse = await request(app)
            .post('/api/users')
            .send({ nickname: 'foo' });
        expect(createFooResponse.status).toBe(201);

        const createBarResponse = await request(app)
            .post('/api/users')
            .send({ nickname: 'bar' });
        expect(createBarResponse.status).toBe(201);

        const createBazResponse = await request(app)
            .post('/api/users')
            .send({ nickname: 'baz' });
        expect(createBazResponse.status).toBe(201);

        const createHamResponse = await request(app)
            .post('/api/users')
            .send({ nickname: 'ham' });
        expect(createHamResponse.status).toBe(201);
    });

    it('should retrieve a list with 4 users', async () => {
        const response = await request(app).get('/api/users');
        const users = response.body;

        expect(response.status).toBe(200);
        expect(users).toHaveLength(4);

        expect(users).toContainEqual({ id: 1, nickname: 'foo' });
        expect(users).toContainEqual({ id: 2, nickname: 'bar' });
        expect(users).toContainEqual({ id: 3, nickname: 'baz' });
        expect(users).toContainEqual({ id: 4, nickname: 'ham' });
    });

    it('should retrieve a list with two users "baz" and "ham" through pagination', async () => {
        const response = await request(app).get('/api/users?page=2&pageSize=2');
        const users = response.body;

        expect(response.status).toBe(200);
        expect(users).toHaveLength(2);

        expect(users).toContainEqual({ id: 3, nickname: 'baz' });
        expect(users).toContainEqual({ id: 4, nickname: 'ham' });
    });

    it('should retrieve a list of ids through field selection', async () => {
        const response = await request(app).get('/api/users?field=id');
        const users = response.body;

        expect(response.status).toBe(200);
        expect(users).toHaveLength(4);

        const sortedIDs = users.map((user: { id: number }) => user.id).sort();
        expect(sortedIDs).toEqual([1, 2, 3, 4]);
    });

    it('should retrieve an empty result for out of range pagination', async () => {
        const response = await request(app).get('/api/users?page=10');
        const users = response.body;

        expect(response.status).toBe(200);
        expect(users).toHaveLength(0);
    });

    it('should retrieve the desired user', async () => {
        const response = await request(app).get('/api/users/1');

        expect(response.status).toBe(200);
        expect(response.body.user.nickname).toBe('foo');
    });

    it('should successfully modify foo\'s nickname to "baz"', async () => {
        const modifyFooResponse = await request(app)
            .put('/api/users/1')
            .send({ nickname: 'baz' });

        expect(modifyFooResponse.status).toBe(200);
        expect(modifyFooResponse.body.user.nickname).toBe('baz');

        const getBazResponse = await request(app).get('/api/users/1');

        expect(getBazResponse.status).toBe(200);
        expect(getBazResponse.body.user.nickname).toBe('baz');
    });

    it('should successfully delete an existing user "baz"', async () => {
        const response = await request(app).delete('/api/users/1');
        expect(response.status).toBe(200);
    });

    it('should not retreive information of a deleted user "baz"', async () => {
        const response = await request(app).get('/api/users/1');
        expect(response.status).toBe(404);
        expect(response.body.user).toBeUndefined();
    });
});
