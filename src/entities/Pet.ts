import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import User from './User';

@Entity({ name: 'pets' })
export default class Pet {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 20,
        nullable: false
    })
    species: string;

    @ManyToOne(() => User, { cascade: ['update'] })
    @JoinColumn({ name: 'guardian' })
    guardian: User;

    @Column({
        type: 'varchar',
        length: 20,
        nullable: false
    })
    nickname: string;

    @Column({
        type: 'tinytext'
    })
    image_url: string;

    @Column({
        type: 'tinyint',
        default: 0
    })
    deleted: number;
}
