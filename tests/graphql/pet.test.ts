import request from 'supertest';
import app from '../../src/app';
import { getPool } from '../../src/common/db';

describe('/api/pets endpoint test', () => {
    afterAll(async () => {
        const pool = getPool();

        // cleanup
        await pool.query(`DELETE FROM Pet`);
        await pool.query(`ALTER TABLE Pet AUTO_INCREMENT=1`);

        await pool.end();
    });

    it('should retrieve an empty list of pets', async () => {
        const response = await request(app).post('/graphql').send({
            query: 'query { pets { edges { node { nickname } } } }'
        });
        // `errors` is only there when error has occurred

        expect(response.body?.errors).toBeUndefined();

        const {
            pets: { edges }
        } = response.body.data;
        expect(edges).toHaveLength(0);
    });

    it('should successfully create multiple new pets', async () => {
        const query = `
            mutation($nickname: String!, $species: String!, $imageUrl: String!) {
                createPet(input: {
                    species: $species,
                    nickname: $nickname,
                    imageUrl: $imageUrl
                }) {
                    id
                    nickname
                    species
                    imageUrl
                }
            }
        `;

        const createFooResponse = await request(app)
            .post('/graphql')
            .send({
                query,
                variables: {
                    species: 'cat',
                    nickname: 'foo',
                    imageUrl: 'https://placekitten.com/640/640'
                }
            });
        expect(createFooResponse.body?.errors).toBeUndefined();
        expect(createFooResponse.body?.data?.createPet?.id).toBe('1');

        const createBarResponse = await request(app)
            .post('/graphql')
            .send({
                query,
                variables: {
                    species: 'dog',
                    nickname: 'bar',
                    imageUrl: 'https://placedog.net/640/640'
                }
            });
        expect(createBarResponse.body?.errors).toBeUndefined();
        expect(createBarResponse.body?.data?.createPet?.id).toBe('2');

        const createBazResponse = await request(app)
            .post('/graphql')
            .send({
                query,
                variables: {
                    species: 'cat',
                    nickname: 'baz',
                    imageUrl: 'https://placekitten.com/540/540'
                }
            });
        expect(createBazResponse.body?.errors).toBeUndefined();
        expect(createBazResponse.body?.data?.createPet?.id).toBe('3');

        const createHamResponse = await request(app)
            .post('/graphql')
            .send({
                query,
                variables: {
                    species: 'dog',
                    nickname: 'ham',
                    imageUrl: 'https://placedog.net/540/540'
                }
            });
        expect(createHamResponse.body?.errors).toBeUndefined();
        expect(createHamResponse.body?.data?.createPet?.id).toBe('4');
    });

    it('should retrieve a list with 4 pets', async () => {
        const response = await request(app).post('/graphql').send({
            query: `
                    query {
                        pets(first: 4) {
                            edges {
                                node {
                                    id
                                    nickname
                                    species
                                    imageUrl
                                }
                            }
                        }
                    }
                `
        });
        const pets = response.body?.data?.pets?.edges;

        expect(pets).toHaveLength(4);
        expect(pets).toContainEqual({
            node: {
                id: '1',
                species: 'cat',
                nickname: 'foo',
                imageUrl: 'https://placekitten.com/640/640'
            }
        });
        expect(pets).toContainEqual({
            node: {
                id: '2',
                species: 'dog',
                nickname: 'bar',
                imageUrl: 'https://placedog.net/640/640'
            }
        });
        expect(pets).toContainEqual({
            node: {
                id: '3',
                species: 'cat',
                nickname: 'baz',
                imageUrl: 'https://placekitten.com/540/540'
            }
        });
        expect(pets).toContainEqual({
            node: {
                id: '4',
                species: 'dog',
                nickname: 'ham',
                imageUrl: 'https://placedog.net/540/540'
            }
        });
    });

    it('should retrieve a list of 2 pets throughout two requests', async () => {
        const firstResponse = await request(app).post('/graphql').send({
            query: `
                query {
                    pets(first: 2) {
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
        expect(firstResponse.body?.data?.pets?.pageInfo?.hasNextPage).toBe(
            true
        );
        expect(firstResponse.body?.data?.pets?.edges).toHaveLength(2);

        const endCursor = firstResponse.body?.data?.pets?.pageInfo?.endCursor;

        const secondResponse = await request(app).post('/graphql').send({
            query: `
                query ($endCursor: String!) {
                    pets(first: 2, after: $endCursor) {
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
        expect(secondResponse.body?.data?.pets?.pageInfo?.hasNextPage).toBe(
            false
        );
        expect(secondResponse.body?.data?.pets?.edges).toHaveLength(2);
    });

    it('should retrieve the desired pet', async () => {
        const response = await request(app).post('/graphql').send({
            query: `
                query {
                    pet(id: "1") {
                        id
                        nickname
                    }
                }
            `
        });
        expect(response.body?.errors).toBeUndefined();
        const { id, nickname } = response.body?.data?.pet || {
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
                    updatePet(input: {
                        id: "1",
                        nickname: "baz",
                        species: "cat",
                        imageUrl: "https://placekitten.com/600/600"
                    }) {
                        id
                        nickname
                        species
                        imageUrl
                    }
                }
            `
        });

        expect(modifyFooResponse.body?.errors).toBeUndefined();
        expect(modifyFooResponse.body?.data?.updatePet?.id).toBe('1');
        expect(modifyFooResponse.body?.data?.updatePet?.nickname).toBe('baz');
        expect(modifyFooResponse.body?.data?.updatePet?.species).toBe('cat');
        expect(modifyFooResponse.body?.data?.updatePet?.imageUrl).toBe(
            'https://placekitten.com/600/600'
        );
    });

    it('should successfully delete an existing pet "baz"', async () => {
        const response = await request(app).post('/graphql').send({
            query: `
                mutation {
                    deletePet(id: "1") {
                        success
                    }
                }
            `
        });
        expect(response.body?.errors).toBeUndefined();
        expect(response.body?.data?.deletePet?.success).toBe(true);
    });

    it('should not retreive information of a deleted pet "baz"', async () => {
        const response = await request(app).post('/graphql').send({
            query: `
                query {
                    pet(id: "1") {
                        id
                        nickname
                    }
                }
            `
        });
        expect(response.body?.errors).not.toBeUndefined();
        expect(response.body?.errors[0]?.message).toBe('Pet not found');
    });

    it('should not update information of a deleted pet "baz"', async () => {
        const response = await request(app).post('/graphql').send({
            query: `
                mutation {
                    updatePet(input: {
                        id: "1",
                        nickname: "shouldnotupdate",
                        imageUrl: "https://shouldnotupdate.com",
                        species: "dog"
                    }) {
                        id
                        nickname
                    }
                }
            `
        });
        expect(response.body?.errors).not.toBeUndefined();
        expect(response.body?.errors[0]?.message).toBe('Pet not found');
    });

    it('should not delete information of a deleted pet "baz"', async () => {
        const response = await request(app).post('/graphql').send({
            query: `
                mutation {
                    deletePet(id: "1") {
                        success
                    }
                }
            `
        });

        expect(response.body?.errors).not.toBeUndefined();
        expect(response.body?.errors[0]?.message).toBe('Pet not found');
    });
});
