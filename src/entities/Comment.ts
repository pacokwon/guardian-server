import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import User from './User';
import Pet from './Pet';

@Entity({ name: 'comments' })
export default class Comment {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { cascade: ['update'] })
    @JoinColumn({ name: 'author' })
    author: User;

    @ManyToOne(() => Pet, { cascade: ['update'] })
    @JoinColumn({ name: 'petID' })
    petID: Pet;

    @Column({
        type: 'tinyint',
        default: 0
    })
    deleted: number;
}
