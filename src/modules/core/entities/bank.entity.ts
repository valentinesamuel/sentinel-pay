import { Entity, Column, OneToMany } from 'typeorm';
import { CustomerVirtualAccount } from './customerVirtualAccount.entity';
import { BaseEntity } from '@shared/repositories/base.entity';

export enum BankType {
  COMMERCIAL = 'commercial',
  MFB = 'mfb',
}
@Entity()
export class Bank extends BaseEntity {
  @Column({ type: 'enum', nullable: true, enum: BankType })
  bankType: BankType;

  @Column({ type: 'varchar' })
  bankName: string;

  @Column({ type: 'varchar', nullable: true })
  shortName: string;

  @Column({ type: 'boolean' })
  active: boolean;

  // Relations
  @OneToMany(() => CustomerVirtualAccount, (virtualAccount) => virtualAccount.bank)
  virtualAccounts: CustomerVirtualAccount[];
}
