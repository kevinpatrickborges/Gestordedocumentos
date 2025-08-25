import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Transform } from 'class-transformer';

import { User } from '../../users/entities/user.entity';
import { RoleType } from '../../users/enums/role-type.enum';
import { TipoSolicitacaoEnum } from '../domain/value-objects/tipo-solicitacao.vo';

export enum StatusDesarquivamento {
  PENDENTE = 'PENDENTE',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDO = 'CONCLUIDO',
  CANCELADO = 'CANCELADO',
}

// Removido enum local - usando o do domínio

@Entity('desarquivamentos')
@Index(['codigoBarras'], { unique: true })
@Index(['numeroRegistro'])
@Index(['status'])
@Index(['tipoSolicitacao'])
@Index(['createdAt'])
export class Desarquivamento {
  @ApiProperty({
    description: 'ID único do desarquivamento',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Código de barras único gerado automaticamente',
    example: 'DES202401150001',
  })
  @Column({ name: 'codigo_barras', unique: true, length: 20 })
  codigoBarras: string;

  @ApiProperty({
    description: 'Tipo da solicitação',
    enum: TipoSolicitacaoEnum,
    example: TipoSolicitacaoEnum.DESARQUIVAMENTO,
  })
  @Column({
    name: 'tipo_solicitacao',
    type: 'varchar',
    default: TipoSolicitacaoEnum.DESARQUIVAMENTO,
  })
  tipoSolicitacao: TipoSolicitacaoEnum;

  @ApiProperty({
    description: 'Status atual da solicitação',
    enum: StatusDesarquivamento,
    example: StatusDesarquivamento.PENDENTE,
  })
  @Column({ type: 'varchar', default: StatusDesarquivamento.PENDENTE })
  status: StatusDesarquivamento;

  @ApiProperty({
    description: 'Nome completo do requerente',
    example: 'João Silva Santos',
  })
  @Column({ name: 'nome_solicitante', length: 255, nullable: false })
  nomeSolicitante: string;

  @ApiPropertyOptional({
    description: 'Nome da vítima (quando aplicável)',
    example: 'Maria Oliveira',
  })
  @Column({ name: 'nome_vitima', length: 255, nullable: true })
  nomeVitima?: string;

  @ApiProperty({
    description: 'Número do registro/processo',
    example: '2024.001.123456',
  })
  @Column({ name: 'numero_registro', length: 50, nullable: false })
  numeroRegistro: string;

  @ApiPropertyOptional({
    description: 'Tipo do documento solicitado',
    example: 'Laudo Pericial',
  })
  @Column({ name: 'tipo_documento', length: 100, nullable: true })
  tipoDocumento?: string;

  @ApiPropertyOptional({
    description: 'Data do fato/ocorrência',
    example: '2024-01-15',
    type: 'string',
    format: 'date',
  })
  @Column({ name: 'data_fato', type: 'date', nullable: true })
  @Transform(({ value }) => (value ? value.toISOString().split('T')[0] : null))
  dataFato?: Date;

  @ApiPropertyOptional({
    description: 'Data limite para atendimento',
    example: '2024-02-15T10:00:00Z',
    type: 'string',
    format: 'date-time',
  })
  @Column({ name: 'prazo_atendimento', type: 'timestamptz', nullable: true })
  prazoAtendimento?: Date;

  @ApiPropertyOptional({
    description: 'Data de conclusão da solicitação',
    example: '2024-02-10T14:30:00Z',
    type: 'string',
    format: 'date-time',
  })
  @Column({ name: 'data_atendimento', type: 'timestamptz', nullable: true })
  dataAtendimento?: Date;

  @ApiPropertyOptional({
    description: 'Resultado ou observações do atendimento',
    example: 'Documento localizado e disponibilizado',
  })
  @Column({ name: 'resultado_atendimento', type: 'text', nullable: true })
  resultadoAtendimento?: string;

  @ApiPropertyOptional({
    description: 'Finalidade da solicitação',
    example: 'Processo judicial em andamento',
  })
  @Column({ name: 'finalidade', type: 'text', nullable: true })
  finalidade?: string;

  @ApiPropertyOptional({
    description: 'Observações adicionais',
    example: 'Solicitação urgente para audiência',
  })
  @Column({ name: 'observacoes', type: 'text', nullable: true })
  observacoes?: string;

  @ApiProperty({
    description: 'Indica se a solicitação é urgente',
    example: false,
  })
  @Column({ name: 'urgente', type: 'boolean', default: false })
  urgente: boolean;

  @ApiPropertyOptional({
    description: 'Localização física do documento/processo',
    example: 'Arquivo Central - Estante 15, Prateleira 3',
  })
  @Column({ name: 'localizacao_fisica', length: 255, nullable: true })
  localizacaoFisica?: string;

  @ApiPropertyOptional({
    description: 'ID do usuário responsável pelo atendimento',
    example: 2,
  })
  @Column({ name: 'responsavel_id', nullable: true })
  responsavelId?: number;

  @ApiProperty({
    description: 'ID do usuário que criou o registro',
    example: 1,
  })
  @Column({ name: 'created_by', nullable: false })
  createdBy: number;

  @ApiProperty({
    description: 'Data de criação do registro',
    example: '2024-01-15T08:30:00Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2024-01-15T10:45:00Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Data de exclusão (soft delete)',
    example: null,
  })
  @DeleteDateColumn({ name: 'deleted_at' })
  @Exclude()
  deletedAt?: Date;

  // Relacionamentos
  @ApiProperty({
    description: 'Usuário solicitante',
    type: () => User,
  })
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'created_by' })
  criadoPor: User;

  @ApiPropertyOptional({
    description: 'Usuário responsável pelo atendimento',
    type: () => User,
  })
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'responsavel_id' })
  responsavel?: User;

  // Hooks
  @BeforeInsert()
  setDefaultValues() {
    if (!this.codigoBarras) {
      this.codigoBarras = this.generateBarcode();
    }
  }

  @BeforeUpdate()
  updateTimestamp() {
    // Atualiza automaticamente o timestamp de atualização
  }

  // Métodos de negócio
  generateBarcode(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const timestamp = now.getTime().toString().slice(-4);

    return `DES${year}${month}${day}${timestamp}`;
  }

  /**
   * Verifica se a solicitação está em atraso
   */
  isOverdue(): boolean {
    if (!this.prazoAtendimento) return false;
    return (
      new Date() > this.prazoAtendimento &&
      this.status !== StatusDesarquivamento.CONCLUIDO &&
      this.status !== StatusDesarquivamento.CANCELADO
    );
  }

  /**
   * Verifica se o usuário pode acessar esta solicitação
   */
  canBeAccessedBy(user: User): boolean {
    // Administradores e coordenadores podem acessar tudo
    if (
      user.role?.name === RoleType.ADMIN ||
      user.role?.name === RoleType.COORDENADOR
    ) {
      return true;
    }

    // Usuários podem acessar suas próprias solicitações
    if (this.criadoPor.id === user.id) return true;

    // Responsáveis podem acessar solicitações atribuídas a eles
    if (this.responsavelId === user.id) return true;

    return false;
  }

  /**
   * Verifica se o usuário pode editar esta solicitação
   */
  canBeEditedBy(user: User): boolean {
    // Administradores e coordenadores podem editar tudo
    if (
      user.role?.name === RoleType.ADMIN ||
      user.role?.name === RoleType.COORDENADOR
    ) {
      return true;
    }

    // Solicitações concluídas ou canceladas não podem ser editadas
    if (
      this.status === StatusDesarquivamento.CONCLUIDO ||
      this.status === StatusDesarquivamento.CANCELADO
    ) {
      return false;
    }

    // Criador pode editar se ainda estiver pendente
    if (
      this.criadoPor.id === user.id &&
      this.status === StatusDesarquivamento.PENDENTE
    ) {
      return true;
    }

    // Responsável pode editar se estiver em andamento
    if (
      this.responsavelId === user.id &&
      this.status === StatusDesarquivamento.EM_ANDAMENTO
    ) {
      return true;
    }

    return false;
  }

  canBeDeletedBy(user: User): boolean {
    return user.isAdmin() || user.id === this.criadoPor.id;
  }

  /**
   * Retorna a descrição amigável do status
   */
  getStatusDisplay(): string {
    const statusMap = {
      [StatusDesarquivamento.PENDENTE]: 'Pendente',
      [StatusDesarquivamento.EM_ANDAMENTO]: 'Em Andamento',
      [StatusDesarquivamento.CONCLUIDO]: 'Concluído',
      [StatusDesarquivamento.CANCELADO]: 'Cancelado',
    };

    return statusMap[this.status] || this.status;
  }

  getStatusColor(): string {
    const colors = {
      [StatusDesarquivamento.PENDENTE]: 'warning',
      [StatusDesarquivamento.EM_ANDAMENTO]: 'info',
      [StatusDesarquivamento.CONCLUIDO]: 'success',
      [StatusDesarquivamento.CANCELADO]: 'danger',
    };
    return colors[this.status] || 'secondary';
  }

  getStatusLabel(): string {
    const labels = {
      [StatusDesarquivamento.PENDENTE]: 'Pendente',
      [StatusDesarquivamento.EM_ANDAMENTO]: 'Em Andamento',
      [StatusDesarquivamento.CONCLUIDO]: 'Concluído',
      [StatusDesarquivamento.CANCELADO]: 'Cancelado',
    };
    return labels[this.status] || 'Desconhecido';
  }

  /**
   * Verifica se é possível transicionar para um novo status
   */
  canTransitionTo(newStatus: StatusDesarquivamento): boolean {
    const transitions = {
      [StatusDesarquivamento.PENDENTE]: [
        StatusDesarquivamento.EM_ANDAMENTO,
        StatusDesarquivamento.CANCELADO,
      ],
      [StatusDesarquivamento.EM_ANDAMENTO]: [
        StatusDesarquivamento.CONCLUIDO,
        StatusDesarquivamento.CANCELADO,
      ],
      [StatusDesarquivamento.CONCLUIDO]: [],
      [StatusDesarquivamento.CANCELADO]: [],
    };

    return transitions[this.status]?.includes(newStatus) || false;
  }

  /**
   * Calcula os dias restantes até o prazo
   */
  getDaysUntilDeadline(): number | null {
    if (!this.prazoAtendimento) return null;

    const now = new Date();
    const deadline = new Date(this.prazoAtendimento);
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  /**
   * Retorna a prioridade baseada na urgência e prazo
   */
  getPriority(): 'ALTA' | 'MEDIA' | 'BAIXA' {
    if (this.urgente) return 'ALTA';

    const daysUntilDeadline = this.getDaysUntilDeadline();
    if (daysUntilDeadline === null) return 'BAIXA';

    if (daysUntilDeadline <= 3) return 'ALTA';
    if (daysUntilDeadline <= 7) return 'MEDIA';

    return 'BAIXA';
  }
}
