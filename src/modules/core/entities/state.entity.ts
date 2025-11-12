import { Entity, Column, OneToMany } from 'typeorm';
import { Lga } from './lga.entity';
import { BaseEntity } from '@shared/repositories/base.entity';

@Entity()
export class State extends BaseEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  shortname: string;

  @Column({ type: 'numeric', nullable: true })
  minLatitude: number;

  @Column({ type: 'numeric', nullable: true })
  maxLatitude: number;

  @Column({ type: 'numeric', nullable: true })
  minLongitude: number;

  @Column({ type: 'numeric', nullable: true })
  maxLongitude: number;

  @Column({ type: 'numeric', nullable: true })
  latitude: number;

  @Column({ type: 'numeric', nullable: true })
  longitude: number;

  @Column({ type: 'varchar' })
  capital: string;

  // Relations
  @OneToMany(() => Lga, (lga) => lga.state)
  lgas: Lga[];
}
