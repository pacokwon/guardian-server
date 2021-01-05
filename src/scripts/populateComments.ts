import axios from 'axios';
import { getConnection } from 'typeorm';
import { Comment } from '@entities/Comment';
import { Pet } from '@entities/Pet';
import { User } from '@entities/User';

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

    const result: { data: string[] } = await axios.get(
        `http://names.drycodes.com/${numberOfComments}`,
        {
            params: {
                nameOptions: 'funnyWords',
                separator: 'space',
                combine: 3
            }
        }
    );
    const { data: randomComments } = result;

    await Promise.all(
        randomComments.map(async randomComment => {
            const userIndex = Math.floor(Math.random() * users.length);
            const petIndex = Math.floor(Math.random() * pets.length);

            const randomUser = users[userIndex];
            const randomPet = pets[petIndex];

            const comment = commentRepository.create({
                author: randomUser.username,
                petID: randomPet.id,
                content: randomComment
            });

            await commentRepository.save(comment);
        })
    );
};
