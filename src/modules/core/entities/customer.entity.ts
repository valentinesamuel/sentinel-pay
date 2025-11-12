import { Entity, Column, OneToMany, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Wallet } from './wallet.entity';
import { ProofOfAddress } from './proofOfAddress.entity';
import { Currency } from './currency.entity';
import { BaseEntity } from '@shared/repositories/base.entity';
import { BvnEncryptionTransformer } from '@shared/utils/transformers/bvn.transformer';

export enum KycStatus {
  VERIFIED = 'verified',
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
}

export enum CustomerStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

@Entity()
@Unique(['profileId', 'currency'])
export class Customer extends BaseEntity {
  @Column({ type: 'uuid', unique: true })
  profileId: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  firstname: string;

  @Column({ type: 'varchar', nullable: true })
  middlename: string;

  @Column({ type: 'varchar' })
  lastname: string;

  @Column({ type: 'varchar', nullable: true })
  gender: string;

  @Column({ type: 'varchar', unique: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', nullable: true })
  nationality: string;

  @Column({ type: 'varchar', nullable: true })
  sourceOfFunds: string;

  @Column({ type: 'varchar', nullable: true })
  occupation: string;

  @Column({
    type: 'varchar',
    nullable: false,
    transformer: new BvnEncryptionTransformer(),
    unique: true,
  })
  bvn: string;

  @Column({ type: 'timestamp', nullable: true })
  birth: Date;

  @Column({ type: 'varchar', nullable: true })
  profilePicFileKey: string;

  @Column({ type: 'varchar', nullable: true })
  kycStatus: KycStatus;

  @Column({ type: 'varchar', nullable: true })
  status: CustomerStatus;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin: Date;

  @Column({ type: 'integer', nullable: true })
  loginAttempts: number;

  @Column({
    type: 'varchar',
    nullable: false,
    comment: 'hashed value of system generated salt',
  })
  salt: string;

  @Column({ type: 'varchar', nullable: true })
  cypher: string;

  @Column({ type: 'varchar', nullable: true })
  currency: string;

  // Relations
  @ManyToOne(() => Currency, (currency) => currency.customers)
  @JoinColumn({ name: 'currency', referencedColumnName: 'isoCode' })
  currencyRelation: Currency;

  @OneToMany(() => Wallet, (wallet) => wallet.customer)
  wallets: Wallet[];

  @OneToMany(() => ProofOfAddress, (proofOfAddress) => proofOfAddress.customer)
  proofOfAddresses: ProofOfAddress[];
}
