import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { Otp } from './otp.entity';
import { BvnEncryptionTransformer } from '@shared/utils/transformers/bvn.transformer';
import { BaseEntity } from '@shared/repositories/base.entity';

@Entity()
export class Onboard extends BaseEntity {
  @Column({ type: 'varchar', unique: true })
  customerId: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'integer', nullable: true })
  mailOtpId: number;

  @Column({ type: 'boolean', nullable: true, default: false })
  emailValidated: boolean;

  @Column({ type: 'integer', nullable: true })
  phoneOtpId: number;

  @Column({ type: 'boolean', nullable: true, default: false })
  phoneValidated: boolean;

  @Column({ type: 'varchar', nullable: true })
  username: string;

  @Column({ type: 'varchar', nullable: true })
  firstname: string;

  @Column({ type: 'varchar', nullable: true })
  middlename: string;

  @Column({ type: 'varchar', nullable: true })
  lastname: string;

  @Column({ type: 'varchar', nullable: true })
  gender: string;

  @Column({ type: 'varchar', nullable: true, unique: true })
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
    nullable: true,
    transformer: new BvnEncryptionTransformer(),
  })
  bvn: string;

  @Column({ type: 'timestamp', nullable: true })
  birth: Date;

  // Relations
  @OneToOne(() => Otp, (otp) => otp.onboardForMail)
  @JoinColumn({ name: 'mail_otp_id' })
  mailOtp: Otp;

  @OneToOne(() => Otp, (otp) => otp.onboardForPhone)
  @JoinColumn({ name: 'phone_otp_id' })
  phoneOtp: Otp;
}
