import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Customer } from './customer.entity';
import { CustomerVirtualAccount } from './customerVirtualAccount.entity';
import { Currency } from './currency.entity';
import { BaseEntity } from '@shared/repositories/base.entity';

@Entity()
export class Wallet extends BaseEntity {
  @Column({ type: 'integer' })
  customerId: number;

  @Column({ type: 'integer' })
  balance: number;

  @Column({ type: 'integer' })
  ledgerBal: number;

  @Column({ type: 'integer' })
  openingBal: number;

  @Column({ type: 'integer', nullable: true })
  closingBal: number;

  @Column({ type: 'varchar' })
  currency: string;

  @Column({ type: 'varchar' })
  checksum: string;

  // Relations
  @ManyToOne(() => Currency, (currency) => currency.wallets)
  @JoinColumn({ name: 'currency', referencedColumnName: 'isoCode' })
  currencyRelation: Currency;

  @ManyToOne(() => Customer, (customer) => customer.wallets)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @OneToMany(() => CustomerVirtualAccount, (virtualAccount) => virtualAccount.wallet)
  virtualAccounts: CustomerVirtualAccount[];
}
