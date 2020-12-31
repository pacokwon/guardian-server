import { Entity, Column } from 'typeorm';

@Entity({ name: 'users' })
export default class User {
    @Column({
        length: 30,
        nullable: false,
        primary: true
    })
    username: string;

    @Column({
        type: 'tinyint',
        default: 0
    })
    deleted: number;
}
