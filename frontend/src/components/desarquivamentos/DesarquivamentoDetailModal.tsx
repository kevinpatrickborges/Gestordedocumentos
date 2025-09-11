import React from 'react'
import { X, FileText, ClipboardList, Calendar, User, AlertTriangle } from 'lucide-react'
import { useDesarquivamento } from '@/hooks/useDesarquivamentos'
import { getStatusLabel, getTipoDesarquivamentoLabel, formatDate } from '@/utils/format'

interface DesarquivamentoDetailModalProps {
  id: number
  onClose: () => void
}

export const DesarquivamentoDetailModal: React.FC<DesarquivamentoDetailModalProps> = ({ id, onClose }) => {
  const { data: response, isLoading } = useDesarquivamento(id)
  const item = response?.data

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Detalhes da Solicitação</h3>
              <p className="text-sm text-gray-500">Informações completas do desarquivamento</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
            title="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : item ? (
            <div className="space-y-6">
              {/* Resumo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">Desarquivamento</div>
                  <div className="text-sm font-medium">{getTipoDesarquivamentoLabel(item.tipoDesarquivamento as any)}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">Status</div>
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {getStatusLabel(item.status as any)}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">Data de Solicitação</div>
                  <div className="text-sm font-medium">{formatDate(item.dataSolicitacao || (item as any).createdAt)}</div>
                </div>
              </div>

              {/* Dados principais */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <h4 className="text-sm font-semibold text-gray-800">Dados do Documento</h4>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Detail label="Nome completo" value={item.nomeCompleto} />
                  <Detail label="Nº NIC/Laudo/Auto" value={item.numeroNicLaudoAuto?.startsWith('MISSING-') ? 'N/A' : item.numeroNicLaudoAuto} />
                  <Detail label="Nº Processo" value={item.numeroProcesso} />
                  <Detail label="Tipo de Documento" value={item.tipoDocumento} />
                </div>
              </div>

              {/* Datas e Setor */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <h4 className="text-sm font-semibold text-gray-800">Prazos e Movimentação</h4>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Detail label="Data Desarquivamento - SAG" value={item.dataDesarquivamentoSAG ? formatDate(item.dataDesarquivamentoSAG) : '-'} />
                  <Detail label="Data Devolução pelo Setor" value={item.dataDevolucaoSetor ? formatDate(item.dataDevolucaoSetor) : '-'} />
                  <Detail label="Setor Demandante" value={item.setorDemandante} />
                  <Detail label="Servidor Responsável" value={item.servidorResponsavel} />
                </div>
              </div>

              {/* Finalidade e flags */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <h4 className="text-sm font-semibold text-gray-800">Finalidade e Indicadores</h4>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Detail label="Finalidade" value={item.finalidadeDesarquivamento} />
                  <Detail label="Prorrogação" value={item.solicitacaoProrrogacao ? 'Sim' : 'Não'} />
                  {(item as any).urgente !== undefined && (
                    <div className="md:col-span-2">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium ${item.urgente ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'}`}>
                        <AlertTriangle className="h-3 w-3" />
                        {item.urgente ? 'Urgente' : 'Não urgente'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">Registro não encontrado</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

const Detail = ({ label, value }: { label: string; value?: any }) => (
  <div>
    <div className="text-xs text-gray-500 mb-1">{label}</div>
    <div className="text-sm text-gray-900 break-words">{value || '-'}</div>
  </div>
)

export default DesarquivamentoDetailModal

