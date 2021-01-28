import app from '../../src/app';
import { getPool } from '../../src/common/db';
import request from 'supertest';

describe('/graphql', () => {
    afterAll(async () => {
        const pool = getPool();

        // cleanup
        await pool.query(`DELETE FROM User`);
        await pool.query(`ALTER TABLE User AUTO_INCREMENT=1`);

        await pool.end();
    });

    it('should retrieve an empty list of users', async () => {
        const response = await request(app).post('/graphql').send({
            query: 'query { users { edges { node { nickname } } } }'
        });
        // `errors` is only there when error has occurred

        expect(response.body?.errors).toBeUndefined();

        const {
            users: { edges }
        } = response.body.data;
        expect(edges).toHaveLength(0);
    });

    it('should respond with an error for a query on a non existent user', async () => {
        const response = await request(app).post('/graphql').send({
            query: 'query { user(id: "1") { id } }'
        });

        expect(response.body?.errors).not.toBeUndefined();
    });

    it('should successfully create multiple new users', async () => {
        const createFooResponse = await request(app).post('/graphql').send({
            query: `
                    mutation {
                        createUser(input: { nickname: "foo" }) {
                            id
                            nickname
                        }
                    }
                `
        });
        expect(createFooResponse.body?.errors).toBeUndefined();
        expect(createFooResponse.body?.data?.createUser?.id).toBe('1');

        const createBarResponse = await request(app).post('/graphql').send({
            query: `
                    mutation {
                        createUser(input: { nickname: "bar" }) {
                            id
                            nickname
                        }
                    }
                `
        });
        expect(createBarResponse.body?.errors).toBeUndefined();
        expect(createBarResponse.body?.data?.createUser?.id).toBe('2');

        const createBazResponse = await request(app).post('/graphql').send({
            query: `
                    mutation {
                        createUser(input: { nickname: "baz" }) {
                            id
                            nickname
                        }
                    }
                `
        });
        expect(createBazResponse.body?.errors).toBeUndefined();
        expect(createBazResponse.body?.data?.createUser?.id).toBe('3');

        const createHamResponse = await request(app).post('/graphql').send({
            query: `
                    mutation {
                        createUser(input: { nickname: "ham" }) {
                            id
                            nickname
                        }
                    }
                `
        });
        expect(createHamResponse.body?.errors).toBeUndefined();
        expect(createHamResponse.body?.data?.createUser?.id).toBe('4');
    });

    it('should retrieve a list with 4 users', async () => {
        const response = await request(app).post('/graphql').send({
            query: `
                    query {
                        users(first: 4) {
                            edges {
                                node {
                                    id
                                    nickname
                                }
                            }
                        }
                    }
                `
        });
        const users = response.body?.data?.users?.edges;

        expect(users).toHaveLength(4);
        expect(users).toContainEqual({ node: { id: '1', nickname: 'foo' } });
        expect(users).toContainEqual({ node: { id: '2', nickname: 'bar' } });
        expect(users).toContainEqual({ node: { id: '3', nickname: 'baz' } });
        expect(users).toContainEqual({ node: { id: '4', nickname: 'ham' } });
    });

    it('should retrieve a list of 2 users throughout two requests', async () => {
        const firstResponse = await request(app).post('/graphql').send({
            query: `
                query {
                    users(first: 2) {
                        pageInfo {
                            hasNextPage
                            endCursor
                        }
                        edges {
                            node {
                                id
                            }
                        }
                    }
                }
            `
        });
        expect(firstResponse.body?.errors).toBeUndefined();
        expect(firstResponse.body?.data?.users?.pageInfo?.hasNextPage).toBe(
            true
        );
        expect(firstResponse.body?.data?.users?.edges).toHaveLength(2);

        const endCursor = firstResponse.body?.data?.users?.pageInfo?.endCursor;

        const secondResponse = await request(app).post('/graphql').send({
            query: `
                query ($endCursor: String!) {
                    users(first: 2, after: $endCursor) {
                        pageInfo {
                            hasNextPage
                            endCursor
                        }
                        edges {
                            node {
                                id
                            }
                        }
                    }
                }
            `,
            variables: { endCursor }
        });

        expect(secondResponse.body?.errors).toBeUndefined();
        expect(secondResponse.body?.data?.users?.pageInfo?.hasNextPage).toBe(
            false
        );
        expect(secondResponse.body?.data?.users?.edges).toHaveLength(2);
    });

    it('should retrieve the desired user', async () => {
        const response = await request(app).post('/graphql').send({
            query: `
                query {
                    user(id: "1") {
                        id
                        nickname
                    }
                }
            `
        });
        expect(response.body?.errors).toBeUndefined();
        const { id, nickname } = response.body?.data?.user || {
            id: '',
            nickname: ''
        };

        expect(id).toBe('1');
        expect(nickname).toBe('foo');
    });

    it('should successfully modify foo\'s nickname to "baz"', async () => {
        const modifyFooResponse = await request(app).post('/graphql').send({
            query: `
                mutation {
                    updateUser(input: { id: "1", nickname: "baz" }) {
                        id
                        nickname
                    }
                }
            `
        });

        expect(modifyFooResponse.body?.errors).toBeUndefined();
        expect(modifyFooResponse.body?.data?.updateUser?.id).toBe('1');
        expect(modifyFooResponse.body?.data?.updateUser?.nickname).toBe('baz');
    });

    it('should successfully delete an existing user "baz"', async () => {
        const response = await request(app).post('/graphql').send({
            query: `
                mutation {
                    deleteUser(id: "1") {
                        success
                    }
                }
            `
        });
        expect(response.body?.errors).toBeUndefined();
        expect(response.body?.data?.deleteUser?.success).toBe(true);
    });

    it('should not retreive information of a deleted user "baz"', async () => {
        const response = await request(app).post('/graphql').send({
            query: `
                query {
                    user(id: "1") {
                        id
                        nickname
                    }
                }
            `
        });
        expect(response.body?.errors).not.toBeUndefined();
        expect(response.body?.errors[0]?.message).toBe('User not found');
    });

    it('should not update information of a deleted user "baz"', async () => {
        const response = await request(app).post('/graphql').send({
            query: `
                mutation {
                    updateUser(input: { id: "1", nickname: "shouldnotupdate" }) {
                        id
                        nickname
                    }
                }
            `
        });
        expect(response.body?.errors).not.toBeUndefined();
        expect(response.body?.errors[0]?.message).toBe('User not found');
    });

    it('should not delete information of a deleted user "baz"', async () => {
        const response = await request(app).post('/graphql').send({
            query: `
                mutation {
                    deleteUser(id: "1") {
                        success
                    }
                }
            `
        });

        expect(response.body?.errors).not.toBeUndefined();
        expect(response.body?.errors[0]?.message).toBe('User not found');
    });
});
