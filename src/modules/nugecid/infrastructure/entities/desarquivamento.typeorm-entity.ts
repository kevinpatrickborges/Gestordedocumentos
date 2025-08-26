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
import { User } from '../../../users/entities/user.entity';

@Entity('desarquivamentos')
@Index(['codigoBarras'], { unique: true })
@Index(['numeroRegistro'])
@Index(['status'])
@Index(['tipoSolicitacao'])
@Index(['createdAt'])
@Index(['criadoPorId'])
@Index(['responsavelId'])
export class DesarquivamentoTypeOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'codigo_barras', unique: true, length: 20 })
  codigoBarras: string;

  @Column({
    name: 'tipo_solicitacao',
    type: 'varchar',
    default: 'DESARQUIVAMENTO',
  })
  tipoSolicitacao: string;

  @Column({ type: 'varchar', default: 'PENDENTE' })
  status: string;

  @Column({ name: 'nome_solicitante', length: 255, nullable: false })
  nomeSolicitante: string;

  @Column({ name: 'requerente', length: 255, nullable: false })
  requerente: string;

  @Column({ name: 'nome_vitima', length: 255, nullable: true })
  nomeVitima?: string;

  @Column({ name: 'numero_registro', length: 50, nullable: false })
  numeroRegistro: string;

  @Column({ name: 'numero_processo', length: 50, nullable: false })
  numeroProcesso: string;

  @Column({ name: 'tipo_documento', length: 100, nullable: true })
  tipoDocumento?: string;

  @Column({ name: 'data_fato', type: 'date', nullable: true })
  dataFato?: Date;

  @Column({ name: 'prazo_atendimento', type: 'timestamptz', nullable: true })
  prazoAtendimento?: Date;

  @Column({ name: 'data_atendimento', type: 'timestamptz', nullable: true })
  dataAtendimento?: Date;

  @Column({ name: 'resultado_atendimento', type: 'text', nullable: true })
  resultadoAtendimento?: string;

  @Column({ name: 'finalidade', type: 'text', nullable: true })
  finalidade?: string;

  @Column({ name: 'observacoes', type: 'text', nullable: true })
  observacoes?: string;

  @Column({ name: 'urgente', type: 'boolean', default: false })
  urgente: boolean;

  @Column({ name: 'localizacao_fisica', length: 255, nullable: true })
  localizacaoFisica?: string;

  @Column({ name: 'created_by', nullable: false })
  criadoPorId: number;

  // Alias para compatibilidade com testes
  get createdBy(): number {
    return this.criadoPorId;
  }

  set createdBy(value: number) {
    this.criadoPorId = value;
  }

  @Column({ name: 'responsavel_id', nullable: true })
  responsavelId?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  // Relacionamentos (lazy loading para performance)
  @ManyToOne(() => User, { lazy: true })
  @JoinColumn({ name: 'created_by' })
  criadoPor: Promise<User>;

  @ManyToOne(() => User, { lazy: true })
  @JoinColumn({ name: 'responsavel_id' })
  responsavel?: Promise<User>;

  // Métodos auxiliares para conversão
  static fromDomain(domain: any): DesarquivamentoTypeOrmEntity {
    const entity = new DesarquivamentoTypeOrmEntity();

    if (domain.id) {
      entity.id = domain.id.value;
    }

    entity.codigoBarras = domain.codigoBarras.value;
    entity.tipoSolicitacao = domain.tipoSolicitacao.value;
    entity.status = domain.status.value;
    entity.nomeSolicitante = domain.nomeSolicitante;
    entity.nomeVitima = domain.nomeVitima;
    entity.numeroRegistro = domain.numeroRegistro.value;
    entity.numeroProcesso = domain.numeroProcesso;
    entity.tipoDocumento = domain.tipoDocumento;
    entity.dataFato = domain.dataFato;
    entity.prazoAtendimento = domain.prazoAtendimento;
    entity.dataAtendimento = domain.dataAtendimento;
    entity.resultadoAtendimento = domain.resultadoAtendimento;
    entity.finalidade = domain.finalidade;
    entity.observacoes = domain.observacoes;
    entity.urgente = domain.urgente;
    entity.localizacaoFisica = domain.localizacaoFisica;
    entity.criadoPorId = domain.criadoPorId;
    entity.responsavelId = domain.responsavelId;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.deletedAt = domain.deletedAt;

    return entity;
  }

  toDomain(): any {
    return {
      id: this.id,
      codigoBarras: this.codigoBarras,
      tipoSolicitacao: this.tipoSolicitacao,
      status: this.status,
      nomeSolicitante: this.nomeSolicitante,
      nomeVitima: this.nomeVitima,
      numeroRegistro: this.numeroRegistro,
      numeroProcesso: this.numeroProcesso,
      tipoDocumento: this.tipoDocumento,
      dataFato: this.dataFato,
      prazoAtendimento: this.prazoAtendimento,
      dataAtendimento: this.dataAtendimento,
      resultadoAtendimento: this.resultadoAtendimento,
      finalidade: this.finalidade,
      observacoes: this.observacoes,
      urgente: this.urgente,
      localizacaoFisica: this.localizacaoFisica,
      criadoPorId: this.criadoPorId,
      responsavelId: this.responsavelId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }
}
