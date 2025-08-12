import { format, parseISO, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { StatusDesarquivamento, TipoSolicitacao, TipoDesarquivamento } from '@/types'

// Formatação de datas
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '-'
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return '-'
    
    return format(dateObj, 'dd/MM/yyyy', { locale: ptBR })
  } catch {
    return '-'
  }
}

export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return '-'
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return '-'
    
    return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: ptBR })
  } catch {
    return '-'
  }
}

// Formatação de status
export const getStatusLabel = (status: StatusDesarquivamento): string => {
  const labels = {
    [StatusDesarquivamento.FINALIZADO]: 'Finalizado',
    [StatusDesarquivamento.DESARQUIVADO]: 'Desarquivado',
    [StatusDesarquivamento.NAO_COLETADO]: 'Não coletado',
    [StatusDesarquivamento.SOLICITADO]: 'Solicitado',
    [StatusDesarquivamento.REARQUIVAMENTO_SOLICITADO]: 'Rearquivamento Solicitado',
    [StatusDesarquivamento.RETIRADO_PELO_SETOR]: 'Retirado pelo setor',
    [StatusDesarquivamento.NAO_LOCALIZADO]: 'Não Localizado',
  }
  
  return labels[status] || status
}

export const getStatusColor = (status: StatusDesarquivamento): string => {
  const colors = {
    [StatusDesarquivamento.FINALIZADO]: 'bg-green-100 text-green-800 border-green-200',
    [StatusDesarquivamento.DESARQUIVADO]: 'bg-blue-100 text-blue-800 border-blue-200',
    [StatusDesarquivamento.NAO_COLETADO]: 'bg-orange-100 text-orange-800 border-orange-200',
    [StatusDesarquivamento.SOLICITADO]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    [StatusDesarquivamento.REARQUIVAMENTO_SOLICITADO]: 'bg-purple-100 text-purple-800 border-purple-200',
    [StatusDesarquivamento.RETIRADO_PELO_SETOR]: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    [StatusDesarquivamento.NAO_LOCALIZADO]: 'bg-red-100 text-red-800 border-red-200',
  }
  
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
}

// Formatação de tipos
export const getTipoLabel = (tipo: TipoSolicitacao): string => {
  const labels = {
    [TipoSolicitacao.DESARQUIVAMENTO]: 'Desarquivamento',
    [TipoSolicitacao.COPIA]: 'Cópia',
    [TipoSolicitacao.VISTA]: 'Vista',
    [TipoSolicitacao.CERTIDAO]: 'Certidão',
  }
  
  return labels[tipo] || tipo
}

// Formatação de tipo de desarquivamento
export const getTipoDesarquivamentoLabel = (tipo: TipoDesarquivamento): string => {
  const labels = {
    [TipoDesarquivamento.FISICO]: 'Físico',
    [TipoDesarquivamento.DIGITAL]: 'Digital',
    [TipoDesarquivamento.NAO_LOCALIZADO]: 'Não Localizado',
  }
  
  return labels[tipo] || tipo
}

// Alias para compatibilidade
export const formatTipo = getTipoLabel
export const formatStatus = getStatusLabel

// Formatação de texto
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (!text) return '-'
  if (text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

// Formatação de código de barras
export const formatBarcode = (barcode: string): string => {
  if (!barcode) return '-'
  // Formato: XXXX-XXXX-XXXX
  return barcode.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3')
}

// Validação de vencimento
export const isOverdue = (prazoAtendimento: string | null | undefined): boolean => {
  if (!prazoAtendimento) return false
  
  try {
    const prazo = parseISO(prazoAtendimento)
    const hoje = new Date()
    return prazo < hoje
  } catch {
    return false
  }
}

// Formatação de números
export const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined) return '0'
  return num.toLocaleString('pt-BR')
}