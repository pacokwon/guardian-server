import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { User } from './User';
import { Pet } from './Pet';

@Entity({ name: 'comment' })
export class Comment {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { cascade: ['update'] })
    @JoinColumn({ name: 'author' })
    author: string;

    @ManyToOne(() => Pet, { cascade: ['update'] })
    @JoinColumn({ name: 'petID' })
    petID: number;

    @Column({
        type: 'tinyint',
        default: 0
    })
    deleted: number;

    @Column({
        type: 'varchar',
        length: 50
    })
    content: string;
}
