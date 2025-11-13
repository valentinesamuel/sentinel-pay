import {
  BaseEntity as TypeOrmBaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Column,
  Index,
  Generated,
} from 'typeorm';

import { IsDateString, IsOptional } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

export abstract class BaseEntity extends TypeOrmBaseEntity {
  @Exclude({ toPlainOnly: true })
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @Index({ unique: true })
  @Generated('uuid')
  @Column({ type: 'uuid', unique: true })
  @Expose({ name: 'id' })
  publicId: string;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @IsOptional()
  @IsDateString()
  @DeleteDateColumn()
  deletedAt?: Date;

  @Column({ type: 'varchar', nullable: true })
  updatedBy: string;

  @Column({ type: 'varchar' })
  createdBy: string;
}
