import axios from 'axios';
import { getPool } from '../src/common/db';
import { Pet } from '../src/model/Pet';
import { shuffled } from './shuffled';

type PetInfo = Omit<Pet, 'id'>;

type DogAPIResponse = {
    status: boolean;
    message: string[];
};

const fetchDogs = async (
    numberOfDogs: number,
    nicknames: string[]
): Promise<PetInfo[]> => {
    const { data: dogResponse }: { data: DogAPIResponse } = await axios.get(
        `https://dog.ceo/api/breeds/image/random/${numberOfDogs}`
    );
    const { message: dogImageUrls } = dogResponse;
    return nicknames.map((nickname, index) => ({
        nickname,
        species: 'dog',
        imageUrl: dogImageUrls[index]
    }));
};

type CatAPIResponse = {
    url: string;
    width: number;
    height: number;
}[];

const fetchCats = async (
    numberOfCats: number,
    nicknames: string[]
): Promise<PetInfo[]> => {
    const { data: catResponse }: { data: CatAPIResponse } = await axios.get(
        `https://api.thecatapi.com/v1/images/search?limit=${numberOfCats}`,
        {
            headers: {
                'x-api-key': process.env.CAT_API_KEY
            }
        }
    );
    const catImageUrls = catResponse.map(res => res.url);

    return nicknames.map((nickname, index) => ({
        nickname,
        species: 'cat',
        imageUrl: catImageUrls[index]
    }));
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
    const dogs = await fetchDogs(numberOfDogs, dogNicknames);

    const catNicknames = nicknames.splice(0, numberOfCats);
    const cats = await fetchCats(numberOfCats, catNicknames);

    const pool = getPool();
    await Promise.all(
        shuffled([...dogs, ...cats]).map(
            async ({ nickname, species, imageUrl }) => {
                await pool
                    .query(
                        `INSERT INTO Pet (species, nickname, imageUrl) VALUES (?, ?, ?)`,
                        [species, nickname, imageUrl]
                    )
                    .catch(console.error);
            }
        )
    );
};
