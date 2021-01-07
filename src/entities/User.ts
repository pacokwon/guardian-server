import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

/**
 * JSON object containing user information.
 */
export interface UserModel {
    /**
     * @isInt
     */
    id: number;
    /**
     * @maxLength 30
     */
    nickname: string;
}

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
