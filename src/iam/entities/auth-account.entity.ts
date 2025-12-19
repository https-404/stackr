import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum ProviderType {
  EMAIL_PASSWORD = 'email-password',
  GOOGLE = 'google',
}

@Entity('auth_accounts')
export class AuthAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({
    name: 'provider_type',
    type: 'enum',
    enum: ProviderType,
    default: ProviderType.EMAIL_PASSWORD,
  })
  providerType: ProviderType;

  @Column({ name: 'provider_user_id', nullable: true, type: 'varchar' })
  providerUserId: string | null;

  @Column({ name: 'password_hash', nullable: true, type: 'varchar' })
  passwordHash: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.authAccounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}

