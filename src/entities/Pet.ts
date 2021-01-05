import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Pet' })
export class Pet {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 10,
        nullable: false
    })
    species: string;

    @Column({
        type: 'varchar',
        length: 20,
        nullable: false
    })
    nickname: string;

    @Column({
        type: 'tinytext'
    })
    imageUrl: string;

    @Column({
        type: 'tinyint',
        default: 0
    })
    deleted: number;
}
