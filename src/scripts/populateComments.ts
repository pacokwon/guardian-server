import { getConnection } from 'typeorm';
import Comment from '../entities/Comment';
import Pet from '../entities/Pet';
import User from '../entities/User';

export default async (numberOfComments: number): Promise<void> => {
    const connection = getConnection();
    const commentRepository = connection.getRepository(Comment);

    const users = await connection
        .createQueryBuilder()
        .select('user.username')
        .from(User, 'user')
        .orderBy('RAND()')
        .limit(20)
        .getMany();

    const pets = await connection
        .createQueryBuilder()
        .select('pet.id')
        .from(Pet, 'pet')
        .orderBy('RAND()')
        .limit(20)
        .getMany();

    await Promise.all(
        Array.from(Array(numberOfComments)).map(async _ => {
            const userIndex = Math.floor(Math.random() * users.length);
            const petIndex = Math.floor(Math.random() * pets.length);

            const randomUser = users[userIndex];
            const randomPet = pets[petIndex];

            const comment = commentRepository.create({
                author: randomUser.username,
                petID: randomPet.id
            });

            await commentRepository.save(comment);
        })
    );
};
