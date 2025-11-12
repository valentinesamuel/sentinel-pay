import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Wallet } from './wallet.entity';
import { Bank } from './bank.entity';
import { Currency } from './currency.entity';
import { BaseEntity } from '@shared/repositories/base.entity';
import { Customer } from './customer.entity';

@Entity()
export class CustomerVirtualAccount extends BaseEntity {
  @Column({ type: 'integer' })
  accNo: number;

  @Column({ type: 'varchar' })
  bankId: string;

  @Column({ type: 'varchar' })
  accName: string;

  @Column({ type: 'varchar', length: 3, nullable: true })
  currency: string;

  @Column({ type: 'integer' })
  customerId: number;

  @Column({ type: 'integer' })
  walletId: number;

  // Relations
  @ManyToOne(() => Customer, (customer) => customer.proofOfAddresses)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => Currency, (currency) => currency.virtualAccounts)
  @JoinColumn({ name: 'currency', referencedColumnName: 'isoCode' })
  currencyRelation: Currency;

  @ManyToOne(() => Wallet, (wallet) => wallet.virtualAccounts)
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;

  @ManyToOne(() => Bank, (bank) => bank.virtualAccounts)
  @JoinColumn({ name: 'bank_id' })
  bank: Bank;
}
