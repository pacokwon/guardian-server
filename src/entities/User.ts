import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'users' })
export default class User {
    @PrimaryColumn({
        type: 'varchar',
        length: 30,
        nullable: false
    })
    username: string;

    @Column({
        type: 'tinyint',
        default: 0
    })
    deleted: number;
}
