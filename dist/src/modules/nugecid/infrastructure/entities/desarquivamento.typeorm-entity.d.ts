import { User } from '../../../users/entities/user.entity';
export declare class DesarquivamentoTypeOrmEntity {
    id: number;
    tipoDesarquivamento: string;
    status: string;
    nomeCompleto: string;
    numeroNicLaudoAuto: string;
    numeroProcesso: string;
    tipoDocumento: string;
    dataSolicitacao: Date;
    dataDesarquivamentoSAG?: Date;
    dataDevolucaoSetor?: Date;
    setorDemandante: string;
    servidorResponsavel: string;
    finalidadeDesarquivamento: string;
    solicitacaoProrrogacao: boolean;
    urgente?: boolean;
    criadoPorId: number;
    get createdBy(): number;
    set createdBy(value: number);
    responsavelId?: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    criadoPor: Promise<User>;
    responsavel?: Promise<User>;
    static fromDomain(domain: any): DesarquivamentoTypeOrmEntity;
    toDomain(): any;
}
