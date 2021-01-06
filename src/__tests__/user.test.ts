import { createConnection, getConnection } from 'typeorm';
import request from 'supertest';
import app from '@/app';

describe('/api/user endpoint test', () => {
    beforeAll(async () => {
        const connection = await createConnection();
        await connection.synchronize(true);
    });

    afterAll(async () => {
        await getConnection().close();
    });

    it('should retrieve an empty list of users', async () => {
        const response = await request(app).get('/api/user');
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual([]);
    });

    it('should successfully create two new users "foo" and "bar"', async () => {
        const createFooResponse = await request(app)
            .post('/api/user')
            .send({ nickname: 'foo' });
        expect(createFooResponse.status).toBe(200);

        const createBarResponse = await request(app)
            .post('/api/user')
            .send({ nickname: 'bar' });
        expect(createBarResponse.status).toBe(200);
    });

    it('should retrieve a list with two users "foo" and "bar"', async () => {
        const response = await request(app).get('/api/user');
        const { status } = response;
        const users = response.body;

        expect(status).toBe(200);
        expect(users).toHaveLength(2);

        expect(users).toContainEqual({ id: 1, nickname: 'foo' });
        expect(users).toContainEqual({ id: 2, nickname: 'bar' });
    });

    it('should retrieve the desired user', async () => {
        const response = await request(app).get('/api/user/1');

        expect(response.status).toBe(200);
        expect(response.body.user.nickname).toBe('foo');
    });

    it('should successfully modify foo\'s nickname to "baz"', async () => {
        const modifyFooResponse = await request(app)
            .put('/api/user/1')
            .send({ nickname: 'baz' });

        expect(modifyFooResponse.status).toBe(200);
        expect(modifyFooResponse.body.success).toBe(true);

        const getBazResponse = await request(app).get('/api/user/1');

        expect(getBazResponse.status).toBe(200);
        expect(getBazResponse.body.user.nickname).toBe('baz');
    });

    it('should successfully delete an existing user "bar"', async () => {
        const response = await request(app).delete('/api/user/1');
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });

    it('should not retreive information of a deleted user "bar"', async () => {
        const response = await request(app).get('/api/user/1');
        expect(response.status).toBe(404);
        expect(response.body.user).toBeNull();
    });
});
