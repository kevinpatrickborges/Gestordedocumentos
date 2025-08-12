import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from './user.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true, nullable: false })
  name: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  permissions: string[];

  @Column({ name: 'ativo', type: 'boolean', default: true })
  ativo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relacionamentos
  @OneToMany(() => User, user => user.role)
  users: User[];

  // Métodos
  hasPermission(permission: string): boolean {
    return this.permissions?.includes(permission) || false;
  }

  isAdmin(): boolean {
    return this.name === 'admin';
  }

  isEditor(): boolean {
    return this.name === 'editor';
  }
}
