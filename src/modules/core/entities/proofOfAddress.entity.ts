import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Customer } from './customer.entity';
import { Admin } from './admin.entity';
import { State } from './state.entity';
import { Lga } from './lga.entity';
import { BaseEntity } from '@shared/repositories/base.entity';

export enum AddressType {
  UTILITY = 'utility',
  RESIDENCE_PERMIT = 'residence permit',
}

@Entity()
export class ProofOfAddress extends BaseEntity {
  @Column({ type: 'integer' })
  customerId: number;

  @Column({ type: 'varchar' })
  nationality: string;

  @Column({ type: 'integer' })
  stateId: number;

  @Column({ type: 'integer' })
  lgaId: number;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'varchar' })
  fileId: string;

  @Column({ type: 'enum', enum: AddressType })
  addressType: AddressType;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'integer', nullable: true })
  verifiedByAdmin: number;

  // Relations
  @ManyToOne(() => Customer, (customer) => customer.proofOfAddresses)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => Admin, (admin) => admin.verifiedProofs)
  @JoinColumn({ name: 'verified_by_admin' })
  verifier: Admin;

  @ManyToOne(() => State, (state) => state.id)
  @JoinColumn({ name: 'state_id' })
  state: State;

  @ManyToOne(() => Lga, (lga) => lga.id)
  @JoinColumn({ name: 'lga_id' })
  lga: Lga;
}
