import { User } from '../../users/entities/user.entity';
import { TipoSolicitacaoEnum } from '../domain/value-objects/tipo-solicitacao.vo';
export declare enum StatusDesarquivamento {
    PENDENTE = "PENDENTE",
    EM_ANDAMENTO = "EM_ANDAMENTO",
    CONCLUIDO = "CONCLUIDO",
    CANCELADO = "CANCELADO"
}
export declare class Desarquivamento {
    id: number;
    codigoBarras: string;
    tipoSolicitacao: TipoSolicitacaoEnum;
    status: StatusDesarquivamento;
    nomeSolicitante: string;
    nomeVitima?: string;
    numeroRegistro: string;
    tipoDocumento?: string;
    dataFato?: Date;
    prazoAtendimento?: Date;
    dataAtendimento?: Date;
    resultadoAtendimento?: string;
    finalidade?: string;
    observacoes?: string;
    urgente: boolean;
    localizacaoFisica?: string;
    responsavelId?: number;
    createdBy: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    criadoPor: User;
    responsavel?: User;
    setDefaultValues(): void;
    updateTimestamp(): void;
    generateBarcode(): string;
    isOverdue(): boolean;
    canBeAccessedBy(user: User): boolean;
    canBeEditedBy(user: User): boolean;
    canBeDeletedBy(user: User): boolean;
    getStatusDisplay(): string;
    getStatusColor(): string;
    getStatusLabel(): string;
    canTransitionTo(newStatus: StatusDesarquivamento): boolean;
    getDaysUntilDeadline(): number | null;
    getPriority(): 'ALTA' | 'MEDIA' | 'BAIXA';
}
