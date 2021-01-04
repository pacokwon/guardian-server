import { createConnection, getConnection } from 'typeorm';
import request from 'supertest';
import app from '../app';

describe('/api/user endpoint test', () => {
    beforeAll(async () => {
        await createConnection();
    });

    afterAll(async () => {
        const connection = getConnection();
        const queryRunner = connection.createQueryRunner();

        await queryRunner.dropTable('comments');
        await queryRunner.dropTable('pets');
        await queryRunner.dropTable('users');
        await connection.close();
    });

    it('should retrieve an empty list of users', async () => {
        const response = await request(app).get('/api/user');
        expect(response.status).toBe(200);
        expect(response.body.users).toStrictEqual([]);
    });

    it('should successfully create two new users "foo" and "bar"', async () => {
        const response1 = await request(app)
            .post('/api/user')
            .send({ username: 'foo' });
        expect(response1.status).toBe(200);
        expect(response1.body.success).toBe(true);

        const response2 = await request(app)
            .post('/api/user')
            .send({ username: 'bar' });
        expect(response2.status).toBe(200);
        expect(response2.body.success).toBe(true);
    });

    it('should retrieve a list with two users "foo" and "bar"', async () => {
        const response = await request(app).get('/api/user');
        const { status } = response;
        const { users } = response.body;

        expect(status).toBe(200);
        expect(users).toHaveLength(2);
        expect(users).toContainEqual({ username: 'foo', deleted: 0 });
        expect(users).toContainEqual({ username: 'bar', deleted: 0 });
    });

    it('should retrieve the desired user', async () => {
        const response = await request(app).get('/api/user/foo');
        const { user } = response.body;

        expect(response.status).toBe(200);
        expect(user.username).toBe('foo');
    });

    it('should fail to modify a username to a one that already exists', async () => {
        const response = await request(app)
            .put('/api/user/foo')
            .send({ username: 'bar' });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    it('should successfully modify foo\'s nickname to "baz"', async () => {
        const response1 = await request(app)
            .put('/api/user/foo')
            .send({ username: 'baz' });

        expect(response1.status).toBe(200);
        expect(response1.body.success).toBe(true);

        const response2 = await request(app).get('/api/user/baz');
        const { user } = response2.body;

        expect(response2.status).toBe(200);
        expect(user.username).toBe('baz');
    });

    it('should successfully delete an existing user "bar"', async () => {
        const response = await request(app).delete('/api/user/bar');
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });

    it('should not retreive information of a deleted user "bar"', async () => {
        const response = await request(app).get('/api/user/bar');
        expect(response.status).toBe(400);
        expect(response.body.user).toBeNull();
    });
});
