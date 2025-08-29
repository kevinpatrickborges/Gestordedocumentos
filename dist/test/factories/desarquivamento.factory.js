"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DesarquivamentoFactory = void 0;
const tipo_desarquivamento_vo_1 = require("../../src/modules/nugecid/domain/value-objects/tipo-desarquivamento.vo");
class DesarquivamentoFactory {
    static build(data = {}) {
        const now = new Date();
        return {
            tipoDesarquivamento: data.tipoDesarquivamento || tipo_desarquivamento_vo_1.TipoDesarquivamentoEnum.FISICO,
            status: data.status || 'SOLICITADO',
            nomeCompleto: data.nomeCompleto || 'Solicitante Teste',
            numeroNicLaudoAuto: data.numeroNicLaudoAuto || `NIC-${Date.now()}`,
            numeroProcesso: data.numeroProcesso || '123456',
            tipoDocumento: data.tipoDocumento || 'Laudo Pericial',
            dataSolicitacao: data.dataSolicitacao || now,
            setorDemandante: data.setorDemandante || 'Setor Teste',
            servidorResponsavel: data.servidorResponsavel || 'Servidor Teste',
            finalidadeDesarquivamento: data.finalidadeDesarquivamento || 'Teste de Factory',
            solicitacaoProrrogacao: data.solicitacaoProrrogacao || false,
            urgente: data.urgente !== undefined ? data.urgente : false,
            criadoPorId: data.criadoPorId || 1,
            responsavelId: data.responsavelId,
            createdAt: data.createdAt || now,
            updatedAt: data.updatedAt || now,
            ...data,
        };
    }
}
exports.DesarquivamentoFactory = DesarquivamentoFactory;
//# sourceMappingURL=desarquivamento.factory.js.map