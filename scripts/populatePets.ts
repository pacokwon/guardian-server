import axios from 'axios';
import { getPool } from '../src/common/db';

type DogAPIResponse = {
    status: boolean;
    message: string[];
};

const populateDogs = async (
    numberOfDogs: number,
    nicknames: string[]
): Promise<void> => {
    const pool = getPool();

    const { data: dogResponse }: { data: DogAPIResponse } = await axios.get(
        `https://dog.ceo/api/breeds/image/random/${numberOfDogs}`
    );
    const { message: dogImageUrls } = dogResponse;

    await Promise.all(
        nicknames.map(async (nickname, index) => {
            const species = 'dog';
            const imageUrl = dogImageUrls[index];

            await pool
                .query(
                    `INSERT INTO Pet (species, nickname, imageUrl) VALUES ('${species}', '${nickname}', '${imageUrl}')`
                )
                .catch(console.error);
        })
    );
};

type CatAPIResponse = {
    url: string;
    width: number;
    height: number;
}[];

const populateCats = async (
    numberOfCats: number,
    nicknames: string[]
): Promise<void> => {
    const pool = getPool();

    const { data: catResponse }: { data: CatAPIResponse } = await axios.get(
        `https://api.thecatapi.com/v1/images/search?limit=${numberOfCats}`,
        {
            headers: {
                'x-api-key': process.env.CAT_API_KEY
            }
        }
    );
    const catImageUrls = catResponse.map(res => res.url);

    await Promise.all(
        nicknames.map(async (nickname, index) => {
            const species = 'cat';
            const imageUrl = catImageUrls[index];

            await pool
                .query(
                    `INSERT INTO Pet (species, nickname, imageUrl) VALUES ('${species}', '${nickname}', '${imageUrl}')`
                )
                .catch(console.error);
        })
    );
};

export const populatePets = async (
    numberOfDogs: number,
    numberOfCats: number
): Promise<void> => {
    const numberOfPets = numberOfDogs + numberOfCats;

    const result: { data: string[] } = await axios.get(
        `http://names.drycodes.com/${numberOfPets}`,
        {
            params: {
                nameOptions: 'girl_names',
                combine: 1,
                case: 'lower'
            }
        }
    );
    const { data: nicknames } = result;

    const dogNicknames = nicknames.splice(0, numberOfDogs);
    await populateDogs(numberOfDogs, dogNicknames);

    const catNicknames = nicknames.splice(
        numberOfDogs,
        numberOfDogs + numberOfCats
    );
    await populateCats(numberOfCats, catNicknames);
};
