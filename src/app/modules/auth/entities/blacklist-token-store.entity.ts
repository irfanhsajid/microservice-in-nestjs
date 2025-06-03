import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('blacklist_token_store')
export class BlacklistTokenStore {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  token: string;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  userId: number;
}
