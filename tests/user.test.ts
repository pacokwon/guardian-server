import app from '@/app';
import { getPool } from '@/common/db';
import request from 'supertest';

describe('/api/users endpoint test', () => {
    afterAll(async () => {
        getPool().end();
    });

    it('should retrieve an empty list of users', async () => {
        const response = await request(app).get('/api/users');
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual([]);
    });

    it('should successfully create two new users "foo" and "bar"', async () => {
        const createFooResponse = await request(app)
            .post('/api/users')
            .send({ nickname: 'foo' });
        expect(createFooResponse.status).toBe(201);

        const createBarResponse = await request(app)
            .post('/api/users')
            .send({ nickname: 'bar' });
        expect(createBarResponse.status).toBe(201);
    });

    it('should retrieve a list with two users "foo" and "bar"', async () => {
        const response = await request(app).get('/api/users');
        const { status } = response;
        const users = response.body;

        expect(status).toBe(200);
        expect(users).toHaveLength(2);

        expect(users).toContainEqual({ id: 1, nickname: 'foo' });
        expect(users).toContainEqual({ id: 2, nickname: 'bar' });
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
