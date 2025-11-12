import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@shared/repositories/base.entity';

@Entity()
export class Media extends BaseEntity {
  @Column({ type: 'uuid' })
  mediaKey: string;

  @Column({ type: 'varchar', nullable: true })
  uri: string;

  @Column({ type: 'char', nullable: true })
  name: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  purpose: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'varchar', nullable: true })
  entity: string;

  @Column({ type: 'integer', nullable: true })
  entityId: number;
}
