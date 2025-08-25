import {
  Desarquivamento,
  StatusDesarquivamento,
} from '../../src/modules/nugecid/entities/desarquivamento.entity';
import { TipoSolicitacaoEnum } from '../../src/modules/nugecid/domain/value-objects/tipo-solicitacao.vo';

export class DesarquivamentoFactory {
  static build(data: Partial<Desarquivamento> = {}): Partial<Desarquivamento> {
    const now = new Date();
    const prazo = new Date();
    prazo.setDate(now.getDate() + 5);

    return {
      codigoBarras: data.codigoBarras || `CB-${Date.now()}`,
      tipoSolicitacao:
        data.tipoSolicitacao || TipoSolicitacaoEnum.DESARQUIVAMENTO,
      nomeSolicitante: data.nomeSolicitante || 'Solicitante Teste',
      numeroRegistro: data.numeroRegistro || '123456',
      dataFato: data.dataFato || now,
      finalidade: data.finalidade || 'Teste de Factory',
      prazoAtendimento: data.prazoAtendimento || prazo,
      status: data.status || StatusDesarquivamento.PENDENTE,
      urgente: data.urgente !== undefined ? data.urgente : false,
      localizacaoFisica: data.localizacaoFisica || 'Arquivo Central',
      ...data,
    };
  }
}
