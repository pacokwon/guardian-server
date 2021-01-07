import {
    BaseEntity,
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';

import { User } from './User';
import { Pet } from './Pet';

@Entity({ name: 'UserPetRegisterHistory' })
export class UserPetRegisterHistory extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    userId: User;

    @ManyToOne(() => Pet)
    @JoinColumn({ name: 'petId' })
    petId: Pet;

    @Column('timestamp')
    registeredAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    releasedAt: Date;

    // whether this registration has ended or not
    @Column({
        type: 'tinyint',
        default: 0
    })
    released: number;
}
