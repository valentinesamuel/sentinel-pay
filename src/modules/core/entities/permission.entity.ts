import { BaseEntity } from '@shared/repositories/base.entity';
import { Entity, Column } from 'typeorm';

@Entity()
export class Permission extends BaseEntity {
  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'integer', nullable: true })
  alias: number;

  @Column({ type: 'text', nullable: true })
  description: string;
}
