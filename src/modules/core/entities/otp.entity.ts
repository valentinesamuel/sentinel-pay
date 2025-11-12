import { Entity, Column, OneToOne } from 'typeorm';
import { Onboard } from './onboard.entity';
import { BaseEntity } from '@shared/repositories/base.entity';

export enum OtpType {
  EMAIL = 'email',
  SMS = 'sms',
}

export enum OtpEntity {
  CUSTOMER = 'customer',
  ONBOARD = 'onboard',
}

@Entity()
export class Otp extends BaseEntity {
  @Column({ type: 'varchar', enum: OtpType })
  type: OtpType;

  @Column({ type: 'enum', nullable: true, enum: OtpEntity })
  entity: OtpEntity;

  @Column({ type: 'varchar', nullable: true })
  entityId: string;

  @Column({ type: 'varchar', nullable: true })
  otp: string;

  @Column({ type: 'boolean', nullable: false, default: false })
  isVerified: boolean;

  @Column({ type: 'timestamp', nullable: false })
  expiresAt: Date;

  // Relations
  @OneToOne(() => Onboard, (onboard) => onboard.mailOtp)
  onboardForMail: Onboard;

  @OneToOne(() => Onboard, (onboard) => onboard.phoneOtp)
  onboardForPhone: Onboard;
}
