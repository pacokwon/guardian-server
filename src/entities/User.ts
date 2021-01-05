import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'User' })
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 20,
        nullable: false
    })
    nickname: string;

    @Column({
        type: 'tinyint',
        default: 0
    })
    deleted: number;
}
