import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '@shared/repositories/base.entity';
import { Customer } from './customer.entity';
import { Wallet } from './wallet.entity';
import { CustomerVirtualAccount } from './customerVirtualAccount.entity';

@Entity()
export class Currency extends BaseEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', length: 3, unique: true })
  isoCode: string;

  @Column({ type: 'varchar', length: 10 })
  symbol: string;

  @Column({ type: 'varchar', length: 5 })
  decimalSymbol: string;

  // Relations
  @OneToMany(() => Customer, (customer) => customer.currencyRelation)
  customers: Customer[];

  @OneToMany(() => Wallet, (wallet) => wallet.currencyRelation)
  wallets: Wallet[];

  @OneToMany(() => CustomerVirtualAccount, (virtualAccount) => virtualAccount.currencyRelation)
  virtualAccounts: CustomerVirtualAccount[];
}
