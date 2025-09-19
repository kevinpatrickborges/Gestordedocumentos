import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Tarefa } from '../../tarefas/entities/tarefa.entity';

export enum TipoNotificacao {
  SOLICITACAO_PENDENTE = 'solicitacao_pendente',
  NOVO_PROCESSO = 'novo_processo',
}

export enum PrioridadeNotificacao {
  BAIXA = 'baixa',
  MEDIA = 'media',
  ALTA = 'alta',
  CRITICA = 'critica',
}

@Entity('notificacoes')
@Index(['usuarioId', 'lida'])
@Index(['tipo', 'createdAt'])
export class Notificacao {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: TipoNotificacao,
    nullable: false,
  })
  tipo: TipoNotificacao;

  @Column({ length: 255, nullable: false })
  titulo: string;

  @Column({ type: 'text', nullable: false })
  descricao: string;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Dados específicos como dias pendentes, número do processo, etc.',
  })
  detalhes: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  lida: boolean;

  @Column({
    type: 'enum',
    enum: PrioridadeNotificacao,
    default: PrioridadeNotificacao.MEDIA,
  })
  prioridade: PrioridadeNotificacao;

  @Column({ name: 'usuario_id', nullable: false })
  usuarioId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  // Relacionamentos opcionais
  @Column({ name: 'solicitacao_id', nullable: true })
  solicitacaoId: number;

  @ManyToOne(() => Tarefa, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'solicitacao_id' })
  solicitacao: Tarefa;

  @Column({ name: 'processo_id', nullable: true })
  processoId: number;

  // Campos de auditoria
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  // Métodos utilitários
  marcarComoLida(): void {
    this.lida = true;
  }

  marcarComoNaoLida(): void {
    this.lida = false;
  }

  isLida(): boolean {
    return this.lida;
  }

  isPendente(): boolean {
    return !this.lida;
  }

  getDiasDesdeCreacao(): number {
    const hoje = new Date();
    const criacao = new Date(this.createdAt);
    const diffTime = hoje.getTime() - criacao.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  getPrioridadeCor(): string {
    switch (this.prioridade) {
      case PrioridadeNotificacao.CRITICA:
        return '#DC2626'; // red-600
      case PrioridadeNotificacao.ALTA:
        return '#EA580C'; // orange-600
      case PrioridadeNotificacao.MEDIA:
        return '#CA8A04'; // yellow-600
      case PrioridadeNotificacao.BAIXA:
        return '#16A34A'; // green-600
      default:
        return '#6B7280'; // gray-500
    }
  }

  getIconePorTipo(): string {
    switch (this.tipo) {
      case TipoNotificacao.SOLICITACAO_PENDENTE:
        return '⏰';
      case TipoNotificacao.NOVO_PROCESSO:
        return '📋';
      default:
        return '🔔';
    }
  }
}