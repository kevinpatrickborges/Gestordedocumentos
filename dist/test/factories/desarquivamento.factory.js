"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DesarquivamentoFactory = void 0;
const desarquivamento_entity_1 = require("../../src/modules/nugecid/entities/desarquivamento.entity");
const tipo_solicitacao_vo_1 = require("../../src/modules/nugecid/domain/value-objects/tipo-solicitacao.vo");
class DesarquivamentoFactory {
    static build(data = {}) {
        const now = new Date();
        const prazo = new Date();
        prazo.setDate(now.getDate() + 5);
        return {
            codigoBarras: data.codigoBarras || `CB-${Date.now()}`,
            tipoSolicitacao: data.tipoSolicitacao || tipo_solicitacao_vo_1.TipoSolicitacaoEnum.DESARQUIVAMENTO,
            nomeSolicitante: data.nomeSolicitante || 'Solicitante Teste',
            numeroRegistro: data.numeroRegistro || '123456',
            dataFato: data.dataFato || now,
            finalidade: data.finalidade || 'Teste de Factory',
            prazoAtendimento: data.prazoAtendimento || prazo,
            status: data.status || desarquivamento_entity_1.StatusDesarquivamento.PENDENTE,
            urgente: data.urgente !== undefined ? data.urgente : false,
            localizacaoFisica: data.localizacaoFisica || 'Arquivo Central',
            ...data,
        };
    }
}
exports.DesarquivamentoFactory = DesarquivamentoFactory;
//# sourceMappingURL=desarquivamento.factory.js.map