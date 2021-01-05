import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'user' })
    @PrimaryColumn({
export class User {
        type: 'varchar',
        length: 20,
        nullable: false
    })
    username: string;

    @Column({
        type: 'tinyint',
        default: 0
    })
    deleted: number;
}
