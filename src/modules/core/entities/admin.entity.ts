import { Entity, Column, OneToMany } from 'typeorm';
import { ProofOfAddress } from './proofOfAddress.entity';
import { BaseEntity } from '@shared/repositories/base.entity';

export enum AdminStatus {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
}

@Entity()
export class Admin extends BaseEntity {
  @Column({ type: 'uuid', nullable: false })
  profileId: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  firstname: string;

  @Column({ type: 'varchar' })
  lastname: string;

  @Column({ type: 'varchar', nullable: true })
  gender: string;

  @Column({ type: 'integer' })
  phone: number;

  @Column({ type: 'varchar', nullable: true })
  jobRole: string;

  @Column({ type: 'varchar', nullable: true })
  profilePicFileKey: string;

  @Column({ type: 'varchar', nullable: true, enum: AdminStatus })
  status: AdminStatus;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin: Date;

  @Column({ type: 'integer', nullable: true })
  loginAttempts: number;

  // Relations
  @OneToMany(() => ProofOfAddress, (proofOfAddress) => proofOfAddress.verifier)
  verifiedProofs: ProofOfAddress[];
}
