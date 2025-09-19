import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Tarefa } from './tarefa.entity';

export enum TipoAcaoHistorico {
  CRIACAO = 'criacao',
  EDICAO = 'edicao',
  MOVIMENTACAO = 'movimentacao',
  ATRIBUICAO = 'atribuicao',
  PRAZO_ALTERADO = 'prazo_alterado',
  PRIORIDADE_ALTERADA = 'prioridade_alterada',
  COMENTARIO_ADICIONADO = 'comentario_adicionado',
  COMENTARIO = 'comentario',
  ANEXO_ADICIONADO = 'anexo_adicionado',
  CHECKLIST_ADICIONADO = 'checklist_adicionado',
  ITEM_CHECKLIST_CONCLUIDO = 'item_checklist_concluido',
  TAG_ADICIONADA = 'tag_adicionada',
  TAG_REMOVIDA = 'tag_removida',
  EXCLUSAO = 'exclusao',
}

@Entity('historico_tarefas')
export class HistoricoTarefa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'tarefa_id', nullable: false })
  tarefaId: number;

  @ManyToOne(() => Tarefa, tarefa => tarefa.historico, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tarefa_id' })
  tarefa: Tarefa;

  @Column({ name: 'usuario_id', nullable: false })
  usuarioId: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column({
    type: 'enum',
    enum: TipoAcaoHistorico,
    nullable: false,
  })
  acao: TipoAcaoHistorico;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  dadosAnteriores: any;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  dadosNovos: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Métodos
  getAcaoLabel(): string {
    switch (this.acao) {
      case TipoAcaoHistorico.CRIACAO:
        return 'criou a tarefa';
      case TipoAcaoHistorico.EDICAO:
        return 'editou a tarefa';
      case TipoAcaoHistorico.MOVIMENTACAO:
        return 'moveu a tarefa';
      case TipoAcaoHistorico.ATRIBUICAO:
        return 'atribuiu a tarefa';
      case TipoAcaoHistorico.PRAZO_ALTERADO:
        return 'alterou o prazo';
      case TipoAcaoHistorico.PRIORIDADE_ALTERADA:
        return 'alterou a prioridade';
      case TipoAcaoHistorico.COMENTARIO_ADICIONADO:
        return 'adicionou um comentário';
      case TipoAcaoHistorico.ANEXO_ADICIONADO:
        return 'adicionou um anexo';
      case TipoAcaoHistorico.CHECKLIST_ADICIONADO:
        return 'adicionou uma checklist';
      case TipoAcaoHistorico.ITEM_CHECKLIST_CONCLUIDO:
        return 'concluiu um item da checklist';
      case TipoAcaoHistorico.TAG_ADICIONADA:
        return 'adicionou uma tag';
      case TipoAcaoHistorico.TAG_REMOVIDA:
        return 'removeu uma tag';
      case TipoAcaoHistorico.COMENTARIO:
        return 'comentou na tarefa';
      case TipoAcaoHistorico.EXCLUSAO:
        return 'excluiu a tarefa';
      default:
        return 'realizou uma ação';
    }
  }

  getTimeAgo(): string {
    const now = new Date();
    const diffMs = now.getTime() - this.createdAt.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;

    return this.createdAt.toLocaleDateString('pt-BR');
  }

  getFormattedDescription(): string {
    if (this.descricao) return this.descricao;

    // Gerar descrição baseada nos dados
    switch (this.acao) {
      case TipoAcaoHistorico.MOVIMENTACAO:
        if (this.dadosAnteriores?.coluna && this.dadosNovos?.coluna) {
          return `de "${this.dadosAnteriores.coluna}" para "${this.dadosNovos.coluna}"`;
        }
        break;
      case TipoAcaoHistorico.ATRIBUICAO:
        if (this.dadosNovos?.responsavel) {
          return `para ${this.dadosNovos.responsavel}`;
        }
        break;
      case TipoAcaoHistorico.PRIORIDADE_ALTERADA:
        if (this.dadosAnteriores?.prioridade && this.dadosNovos?.prioridade) {
          return `de "${this.dadosAnteriores.prioridade}" para "${this.dadosNovos.prioridade}"`;
        }
        break;
    }

    return '';
  }

  static createHistorico(
    tarefaId: number,
    usuarioId: number,
    acao: TipoAcaoHistorico,
    descricao?: string,
    dadosAnteriores?: any,
    dadosNovos?: any,
  ): Partial<HistoricoTarefa> {
    return {
      tarefaId,
      usuarioId,
      acao,
      descricao,
      dadosAnteriores,
      dadosNovos,
    };
  }
}
