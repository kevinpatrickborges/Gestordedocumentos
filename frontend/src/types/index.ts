// Enums
export enum TipoSolicitacao {
  DESARQUIVAMENTO = 'DESARQUIVAMENTO',
  COPIA = 'COPIA',
  VISTA = 'VISTA',
  CERTIDAO = 'CERTIDAO',
}

export enum StatusDesarquivamento {
  FINALIZADO = 'FINALIZADO',
  DESARQUIVADO = 'DESARQUIVADO',
  NAO_COLETADO = 'NAO_COLETADO',
  SOLICITADO = 'SOLICITADO',
  REARQUIVAMENTO_SOLICITADO = 'REARQUIVAMENTO_SOLICITADO',
  RETIRADO_PELO_SETOR = 'RETIRADO_PELO_SETOR',
  NAO_LOCALIZADO = 'NAO_LOCALIZADO',
}

export enum TipoDesarquivamento {
  FISICO = 'FISICO',
  DIGITAL = 'DIGITAL',
  NAO_LOCALIZADO = 'NAO_LOCALIZADO',
}

export enum UserRole {
  ADMIN = 'admin',
  COORDENADOR = 'coordenador',
  USUARIO = 'usuario',
  NUGECID_OPERATOR = 'nugecid_operator'
}

// Interfaces
export interface User {
  id: number
  nome: string
  usuario: string
  role: {
    id: number;
    name: string;
    description: string;
    permissions: string[];
  }
  ativo: boolean
  createdAt: string
  updatedAt: string
}

export interface Desarquivamento {
  id: number
  codigoBarras: string
  tipoDesarquivamento: TipoDesarquivamento
  status: StatusDesarquivamento
  nomeCompleto: string
  numeroNicLaudoAuto?: string
  numeroProcesso: string
  tipoDocumento?: string
  dataSolicitacao: string
  dataDesarquivamentoSag?: string
  dataDevolucaoSetor?: string
  setorDemandante?: string
  servidorResponsavel?: string
  finalidadeDesarquivamento?: string
  solicitacaoProrrogacao?: boolean
  // Campos legados para compatibilidade
  tipo?: TipoSolicitacao
  nomeRequerente?: string
  nomeVitima?: string
  numeroRegistro?: string
  dataFato?: string
  finalidade?: string
  observacoes?: string
  urgente?: boolean
  localizacaoFisica?: string
  prazoAtendimento?: string
  dataAtendimento?: string
  usuarioId: number
  responsavelId?: number
  createdAt: string
  updatedAt: string
  deletedAt?: string
  usuario?: User
  responsavel?: User
}

// DTOs
export interface CreateDesarquivamentoDto {
  tipo: TipoSolicitacao
  nomeRequerente: string
  nomeVitima?: string
  numeroRegistro: string
  tipoDocumento?: string
  dataFato?: string
  finalidade?: string
  observacoes?: string
  urgente?: boolean
  localizacaoFisica?: string
  prazoAtendimento?: string
  responsavelId?: number
}

export interface UpdateDesarquivamentoDto extends Partial<CreateDesarquivamentoDto> {
  status?: StatusDesarquivamento
  dataAtendimento?: string
}

export interface QueryDesarquivamentoDto {
  page?: number
  limit?: number
  search?: string
  status?: StatusDesarquivamento | StatusDesarquivamento[]
  tipo?: TipoSolicitacao | TipoSolicitacao[]
  usuarioId?: number
  responsavelId?: number
  dataInicio?: string
  dataFim?: string
  urgente?: boolean
  vencidos?: boolean
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
  incluirExcluidos?: boolean
  formato?: string
}

// API Response Types
export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Auth Types
export interface LoginDto {
  usuario: string
  senha: string
}

export interface LoginResponse {
  success: boolean
  data: {
    user: User
    accessToken: string
  }
  message: string
}

// Dashboard Types
export interface DashboardStats {
  totalDesarquivamentos: number
  pendentes: number
  emAndamento: number
  concluidos: number
  cancelados: number
  urgentes: number
  vencidos: number
  porTipo: Record<TipoSolicitacao, number>
  porStatus: Record<StatusDesarquivamento, number>
  recentes: Desarquivamento[]
}

// Form Types
export interface FormErrors {
  [key: string]: string | undefined
}

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  width?: string
}

export interface FilterOption {
  value: string
  label: string
}

// User Management Types
export interface UsersQueryParams {
  page?: number
  limit?: number
  search?: string
  role?: UserRole
  active?: boolean
}

export interface CreateUserDto {
  nome: string
  usuario: string
  senha: string
  role: UserRole
}

export interface UpdateUserDto {
  nome?: string
  usuario?: string
  senha?: string
  role?: UserRole
  ativo?: boolean
}

export interface UsersResponse {
  success: boolean
  data: User[]
  meta: PaginationMeta
}

export interface UserResponse {
  success: boolean
  data: User
  message?: string
}

export interface DeleteResponse {
  success: boolean
  message: string
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}