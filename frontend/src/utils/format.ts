import { TipoDesarquivamento, TipoSolicitacao, StatusDesarquivamento } from '@/types'

export const getTipoDesarquivamentoLabel = (tipo: TipoDesarquivamento): string => {
  const labels: Record<TipoDesarquivamento, string> = {
    [TipoDesarquivamento.FISICO]: 'Físico',
    [TipoDesarquivamento.DIGITAL]: 'Digital',
    [TipoDesarquivamento.NAO_LOCALIZADO]: 'Não Localizado',
  }
  return labels[tipo] || tipo
}

export const getTipoSolicitacaoLabel = (tipo: TipoSolicitacao): string => {
  const labels: Record<TipoSolicitacao, string> = {
    [TipoSolicitacao.DESARQUIVAMENTO]: 'Desarquivamento',
    [TipoSolicitacao.COPIA]: 'Cópia',
    [TipoSolicitacao.VISTA]: 'Vista',
    [TipoSolicitacao.CERTIDAO]: 'Certidão',
  }
  return labels[tipo] || tipo
}

export const getStatusLabel = (status: StatusDesarquivamento): string => {
  const labels: Record<StatusDesarquivamento, string> = {
    [StatusDesarquivamento.FINALIZADO]: 'Finalizado',
    [StatusDesarquivamento.DESARQUIVADO]: 'Desarquivado',
    [StatusDesarquivamento.NAO_COLETADO]: 'Não Coletado',
    [StatusDesarquivamento.SOLICITADO]: 'Solicitado',
    [StatusDesarquivamento.REARQUIVAMENTO_SOLICITADO]: 'Rearquivamento Solicitado',
    [StatusDesarquivamento.RETIRADO_PELO_SETOR]: 'Retirado pelo Setor',
    [StatusDesarquivamento.NAO_LOCALIZADO]: 'Não Localizado',
  }
  return labels[status] || status
}

export const getTipoLabel = (tipo: TipoSolicitacao): string => {
  return getTipoSolicitacaoLabel(tipo)
}

export const formatDate = (dateString: string | Date): string => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date)
  } catch (error) {
    return 'Data inválida'
  }
}
