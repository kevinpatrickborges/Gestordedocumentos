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
import { Exclude } from 'class-transformer';

import { User } from '../../users/entities/user.entity';
import { RoleType } from '../../users/enums/role-type.enum';

// Legacy exports for backward compatibility
export { StatusDesarquivamento, StatusDesarquivamentoEnum } from '../domain/value-objects/status-desarquivamento.vo';
export { TipoSolicitacao, TipoSolicitacaoEnum } from '../domain/value-objects/tipo-solicitacao.vo';
export { TipoDesarquivamento, TipoDesarquivamentoEnum } from '../domain/value-objects/tipo-desarquivamento.vo';

@Entity('desarquivamentos')
@Index(['numeroNicLaudoAuto'], { unique: true })
@Index(['numeroProcesso'])
@Index(['status'])
@Index(['tipoDesarquivamento'])
@Index(['dataSolicitacao'])
@Index(['createdBy'])
export class Desarquivamento {
  @ApiProperty({
    description: 'ID único do desarquivamento',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Tipo do desarquivamento',
    example: 'FISICO',
    enum: ['FISICO', 'DIGITAL', 'NAO_LOCALIZADO'],
  })
  @Column({ name: 'tipo_desarquivamento', type: 'varchar', nullable: false })
  tipoDesarquivamento: string;

  @ApiProperty({
    description: 'Status atual da solicitação',
    enum: ['FINALIZADO', 'DESARQUIVADO', 'NAO_COLETADO', 'SOLICITADO', 'REARQUIVAMENTO_SOLICITADO', 'RETIRADO_PELO_SETOR', 'NAO_LOCALIZADO'],
    example: 'SOLICITADO',
  })
  @Column({ type: 'varchar', default: 'SOLICITADO' })
  status: string;

  @ApiProperty({
    description: 'Nome completo do solicitante',
    example: 'João Silva Santos',
  })
  @Column({ name: 'nome_completo', length: 255, nullable: false })
  nomeCompleto: string;

  @ApiProperty({
    description: 'Número do NIC/LAUDO/AUTO/INFORMAÇÃO TÉCNICA',
    example: '2024.001.123456',
  })
  @Column({ name: 'numero_nic_laudo_auto', length: 100, nullable: false, unique: true })
  numeroNicLaudoAuto: string;

  @ApiProperty({
    description: 'Número do processo',
    example: '2024.001.123456',
  })
  @Column({ name: 'numero_processo', length: 100, nullable: false })
  numeroProcesso: string;

  @ApiProperty({
    description: 'Tipo do documento',
    example: 'Laudo Pericial',
  })
  @Column({ name: 'tipo_documento', length: 100, nullable: false })
  tipoDocumento: string;

  @ApiProperty({
    description: 'Data de solicitação',
    example: '2024-01-15T08:30:00Z',
  })
  @Column({ name: 'data_solicitacao', type: 'timestamptz', nullable: false })
  dataSolicitacao: Date;

  @ApiPropertyOptional({
    description: 'Data do desarquivamento - SAG',
    example: '2024-02-10T14:30:00Z',
    type: 'string',
    format: 'date-time',
  })
  @Column({ name: 'data_desarquivamento_sag', type: 'timestamptz', nullable: true })
  dataDesarquivamentoSAG?: Date;

  @ApiPropertyOptional({
    description: 'Data da devolução pelo setor',
    example: '2024-02-15T10:00:00Z',
    type: 'string',
    format: 'date-time',
  })
  @Column({ name: 'data_devolucao_setor', type: 'timestamptz', nullable: true })
  dataDevolucaoSetor?: Date;

  @ApiProperty({
    description: 'Setor demandante',
    example: 'Perícia Criminal',
  })
  @Column({ name: 'setor_demandante', length: 255, nullable: false })
  setorDemandante: string;

  @ApiProperty({
    description: 'Servidor do ITEP responsável (matrícula)',
    example: '12345',
  })
  @Column({ name: 'servidor_responsavel', length: 255, nullable: false })
  servidorResponsavel: string;

  @ApiProperty({
    description: 'Finalidade do desarquivamento',
    example: 'Processo judicial em andamento',
  })
  @Column({ name: 'finalidade_desarquivamento', type: 'text', nullable: false })
  finalidadeDesarquivamento: string;

  @ApiProperty({
    description: 'Solicitação de prorrogação de prazo',
    example: false,
  })
  @Column({ name: 'solicitacao_prorrogacao', type: 'boolean', default: false })
  solicitacaoProrrogacao: boolean;

  @ApiPropertyOptional({
    description: 'Indica se a solicitação é urgente',
    example: false,
  })
  @Column({ name: 'urgente', type: 'boolean', nullable: true, default: false })
  urgente?: boolean;

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

  // Alias para compatibilidade
  get criadoPorId(): number {
    return this.createdBy;
  }

  set criadoPorId(value: number) {
    this.createdBy = value;
  }

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
    // Set default values if needed
  }

  @BeforeUpdate()
  updateTimestamp() {
    // Update timestamp automatically
  }

  /**
   * Verifica se a solicitação está finalizada
   */
  isFinalized(): boolean {
    return this.status === 'FINALIZADO';
  }

  /**
   * Verifica se o usuário pode acessar esta solicitação
   */
  canBeAccessedBy(user: User): boolean {
    // Administradores podem acessar tudo
    if (user.role?.name === RoleType.ADMIN) {
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
    // Administradores podem editar tudo
    if (user.role?.name === RoleType.ADMIN) {
      return true;
    }

    // Solicitações finalizadas não podem ser editadas
    if (this.status === 'FINALIZADO') {
      return false;
    }

    // Criador pode editar se ainda estiver solicitado
    if (
      this.criadoPor.id === user.id &&
      this.status === 'SOLICITADO'
    ) {
      return true;
    }

    // Responsável pode editar se estiver desarquivado
    if (
      this.responsavelId === user.id &&
      this.status === 'DESARQUIVADO'
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
      'FINALIZADO': 'Finalizado',
      'DESARQUIVADO': 'Desarquivado',
      'NAO_COLETADO': 'Não Coletado',
      'SOLICITADO': 'Solicitado',
      'REARQUIVAMENTO_SOLICITADO': 'Rearquivamento Solicitado',
      'RETIRADO_PELO_SETOR': 'Retirado pelo Setor',
      'NAO_LOCALIZADO': 'Não Localizado',
    };

    return statusMap[this.status] || this.status;
  }

  getStatusColor(): string {
    const colors = {
      'FINALIZADO': 'success',
      'DESARQUIVADO': 'info',
      'NAO_COLETADO': 'warning',
      'SOLICITADO': 'primary',
      'REARQUIVAMENTO_SOLICITADO': 'secondary',
      'RETIRADO_PELO_SETOR': 'info',
      'NAO_LOCALIZADO': 'danger',
    };
    return colors[this.status] || 'secondary';
  }

  getStatusLabel(): string {
    return this.getStatusDisplay();
  }

  /**
   * Verifica se é possível transicionar para um novo status
   */
  canTransitionTo(newStatus: string): boolean {
    const transitions = {
      'SOLICITADO': ['DESARQUIVADO', 'NAO_LOCALIZADO'],
      'DESARQUIVADO': ['RETIRADO_PELO_SETOR', 'NAO_COLETADO', 'REARQUIVAMENTO_SOLICITADO'],
      'RETIRADO_PELO_SETOR': ['FINALIZADO'],
      'NAO_COLETADO': ['REARQUIVAMENTO_SOLICITADO'],
      'REARQUIVAMENTO_SOLICITADO': ['FINALIZADO'],
      'NAO_LOCALIZADO': [],
      'FINALIZADO': [],
    };

    return transitions[this.status]?.includes(newStatus) || false;
  }

  /**
   * Retorna a prioridade baseada na urgência
   */
  getPriority(): 'ALTA' | 'MEDIA' | 'BAIXA' {
    if (this.urgente) return 'ALTA';
    return 'MEDIA';
  }
}
