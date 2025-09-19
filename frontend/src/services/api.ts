import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { 
  ApiResponse, 
  PaginatedResponse, 
  Desarquivamento, 
  CreateDesarquivamentoDto, 
  UpdateDesarquivamentoDto, 
  QueryDesarquivamentoDto,
  LoginDto,
  LoginResponse,
  User,
  UserSettings,
  DashboardStats,
  UsersQueryParams,
  UsersResponse,
  UserResponse,
  CreateUserDto,
  UpdateUserDto,
  DeleteResponse,
  DesarquivamentoComment
} from '@/types'

export class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: '/api',
      timeout: 10000,
      withCredentials: true,
      headers: {
        'Accept': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config
        
        console.log('🔍 Interceptor de resposta - erro capturado:', {
          code: error.code,
          message: error.message,
          status: error.response?.status,
          url: originalRequest?.url
        })

        // Verificar se é erro de conectividade (backend indisponível)
        if (error.code === 'ERR_NETWORK' || error.message?.includes('ERR_ABORTED') || error.message?.includes('fetch')) {
          console.warn('🔌 Backend indisponível - não fazendo logout automático')
          return Promise.reject(error)
        }

        // Não fazer logout em caso de falha no login
        if (originalRequest.url === '/auth/login') {
          return Promise.reject(error)
        }
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true
          
          try {
            const refreshToken = localStorage.getItem('refreshToken')
            if (refreshToken) {
              console.log('🔄 Tentando renovar token via interceptor...')
              const response = await this.api.post('/auth/refresh', { refreshToken })
              const { accessToken } = response.data // Direct access since backend returns { accessToken, expiresIn }
              
              localStorage.setItem('accessToken', accessToken)
              console.log('✅ Token renovado com sucesso via interceptor')
              
              // Retry the original request with the new token
              originalRequest.headers.Authorization = `Bearer ${accessToken}`
              return this.api(originalRequest)
            }
          } catch (refreshError: any) {
            console.error('❌ Falha ao renovar token via interceptor:', refreshError)
            
            // Só fazer logout se não for erro de conectividade
            if (refreshError.code !== 'ERR_NETWORK' && !refreshError.message?.includes('ERR_ABORTED')) {
              console.log('🚪 Fazendo logout devido a falha de autenticação')
              localStorage.removeItem('accessToken')
              localStorage.removeItem('refreshToken')
              localStorage.removeItem('user')
              window.location.href = '/login'
            }
            return Promise.reject(refreshError)
          }
        }
        
        // Só fazer logout para 401 se não for erro de conectividade
        if (error.response?.status === 401) {
          console.log('🚪 Token inválido - fazendo logout')
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          window.location.href = '/login'
        }
        
        return Promise.reject(error)
      }
    )
  }

  // Auth endpoints
  async login(credentials: LoginDto): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await this.api.post('/auth/login', credentials)
    return response.data
  }

  async logout(): Promise<void> {
    await this.api.post('/auth/logout')
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.get('/auth/profile')
    return response.data
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<{ accessToken: string; expiresIn: string }>> {
    const response: AxiosResponse<{ accessToken: string; expiresIn: string }> = await this.api.post('/auth/refresh', { refreshToken })
    return {
      success: true,
      data: response.data
    }
  }

  // Dashboard endpoints
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const response: AxiosResponse<ApiResponse<DashboardStats>> = await this.api.get('/nugecid/dashboard')
    return response.data
  }

  // NUGECID endpoints
  async getDesarquivamentos(params?: QueryDesarquivamentoDto): Promise<PaginatedResponse<Desarquivamento>> {
    try {
      const response: AxiosResponse<PaginatedResponse<Desarquivamento>> = await this.api.get('/nugecid', { params })
      return response.data
    } catch (error: any) {
      // Log for debugging and return a safe fallback so UI can render gracefully
      // without showing the generic error screen when transient caching/network
      // issues occur (304/Not Modified handled by proxy/browser can surface
      // as errors in some setups).
      // eslint-disable-next-line no-console
      console.error('[ApiService] getDesarquivamentos error:', error?.message || error)

      return {
        success: false,
        data: [],
        meta: {
          total: 0,
          page: params?.page || 1,
          limit: params?.limit || 10,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      } as PaginatedResponse<Desarquivamento>
    }
  }

  async getDesarquivamento(id: number): Promise<ApiResponse<Desarquivamento>> {
    const response: AxiosResponse<ApiResponse<Desarquivamento>> = await this.api.get(`/nugecid/${id}`)
    return response.data
  }

  async getDesarquivamentoComments(id: number): Promise<ApiResponse<DesarquivamentoComment[]>> {
    const response: AxiosResponse<ApiResponse<DesarquivamentoComment[]>> = await this.api.get(`/nugecid/${id}/comments`)
    return response.data
  }

  async addDesarquivamentoComment(id: number, comment: string): Promise<ApiResponse<DesarquivamentoComment>> {
    const response: AxiosResponse<ApiResponse<DesarquivamentoComment>> = await this.api.post(`/nugecid/${id}/comments`, { comment })
    return response.data
  }

  async createDesarquivamento(data: CreateDesarquivamentoDto): Promise<ApiResponse<Desarquivamento>> {
    const response: AxiosResponse<ApiResponse<Desarquivamento>> = await this.api.post('/nugecid', data)
    return response.data
  }

  async updateDesarquivamento(id: number, data: UpdateDesarquivamentoDto): Promise<ApiResponse<Desarquivamento>> {
    const response: AxiosResponse<ApiResponse<Desarquivamento>> = await this.api.patch(`/nugecid/${id}`, data)
    return response.data
  }

  async deleteDesarquivamento(id: string | number): Promise<ApiResponse<void>> {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [ApiService] deleteDesarquivamento INICIADO - ID: ${id} (tipo: ${typeof id})`);
    
    try {
      // Validar se o ID é válido
      if (id === null || id === undefined || id === '') {
        throw new Error('ID é obrigatório');
      }
      
      const idStr = String(id).trim();
      
      // Converter para número se for string numérica
      let numericId: number;
      if (typeof id === 'string') {
        numericId = parseInt(idStr, 10);
        if (isNaN(numericId)) {
          throw new Error(`ID deve ser um número válido. Recebido: '${id}'`);
        }
      } else {
        numericId = id;
      }
      
      // Validar se é um número positivo
      if (numericId <= 0 || !Number.isInteger(numericId)) {
        console.error(`[${timestamp}] [ApiService] ❌ ID INVÁLIDO - não é um número positivo: ${numericId}`);
        throw new Error(
          `ID deve ser um número inteiro positivo maior que zero. Recebido: ${numericId}`
        );
      }
      
      console.log(`[${timestamp}] [ApiService] ✅ ID validado com sucesso: ${numericId}`);
      
      // Enviar apenas o ID numérico validado
      const response: AxiosResponse<ApiResponse<void>> = await this.api.delete(`/nugecid/${numericId}`);
      
      console.log(`[${timestamp}] [ApiService] deleteDesarquivamento SUCESSO - ID: ${numericId}`, response.data);
      return response.data;
    } catch (error: any) {
      const errorTimestamp = new Date().toISOString();
      console.error(`[${errorTimestamp}] [ApiService] deleteDesarquivamento ERRO:`, error);
      
      if (axios.isAxiosError && axios.isAxiosError(error)) {
        console.error(`[${errorTimestamp}] 📋 Detalhes do erro:`, {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          stack: error.stack
        });
        
        // Re-throw com informações mais detalhadas
        throw new Error(
          error.response?.data?.message || 
          error.message || 
          'Erro ao excluir desarquivamento'
        );
      }
      
      throw error;
    }
  }

  async getDesarquivamentoByBarcode(barcode: string): Promise<ApiResponse<Desarquivamento>> {
    const response: AxiosResponse<ApiResponse<Desarquivamento>> = await this.api.get(`/nugecid/barcode/${barcode}`)
    return response.data
  }

  async importDesarquivamentos(file: File): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);

    const response: AxiosResponse<ApiResponse<any>> = await this.api.post('/nugecid/import-desarquivamentos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Users endpoints
  async getUsers(params?: UsersQueryParams): Promise<UsersResponse> {
    try {
      const response: AxiosResponse<UsersResponse> = await this.api.get('/users/api', { params })
      return response.data
    } catch (error: any) {
      // Log for debugging and return a safe fallback so UI can render gracefully
      // without showing the generic error screen when transient caching/network
      // issues occur (304/Not Modified handled by proxy/browser can surface
      // as errors in some setups).
      // eslint-disable-next-line no-console
      console.error('[ApiService] getUsers error:', error?.message || error)

      return {
        success: false,
        data: [],
        meta: {
          total: 0,
          page: params?.page || 1,
          limit: params?.limit || 10,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      } as UsersResponse
    }
  }

  async getUser(id: number): Promise<UserResponse> {
    const response: AxiosResponse<UserResponse> = await this.api.get(`/users/${id}`)
    return response.data
  }

  async createUser(data: CreateUserDto): Promise<UserResponse> {
    const response: AxiosResponse<UserResponse> = await this.api.post('/users', data)
    return response.data
  }

  async updateUser(id: number, data: UpdateUserDto): Promise<UserResponse> {
    const response: AxiosResponse<UserResponse> = await this.api.patch(`/users/${id}`, data)
    return response.data
  }

  async deleteUser(id: number): Promise<DeleteResponse> {
    const response: AxiosResponse<DeleteResponse> = await this.api.delete(`/users/${id}`)
    return response.data
  }

  async reactivateUser(id: number): Promise<UserResponse> {
    const response: AxiosResponse<UserResponse> = await this.api.patch(`/users/${id}/reativar`)
    return response.data
  }

  // Role settings endpoints (admin)
  async getRoleSettings(roleId: number): Promise<ApiResponse<{ theme?: 'light' | 'dark'; notifications?: { email?: boolean; push?: boolean; desktop?: boolean; sound?: boolean } }>> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get(`/users/roles/${roleId}/settings`)
    return response.data
  }

  async updateRoleSettings(roleId: number, settings: { theme?: 'light' | 'dark'; notifications?: { email?: boolean; push?: boolean; desktop?: boolean; sound?: boolean } }): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.patch(`/users/roles/${roleId}/settings`, settings)
    return response.data
  }

  async getMySettings(): Promise<ApiResponse<UserSettings>> {
    const response: AxiosResponse<ApiResponse<UserSettings>> = await this.api.get('/users/me/settings')
    return response.data
  }

  async updateMySettings(settings: Partial<UserSettings>): Promise<ApiResponse<UserSettings>> {
    const response: AxiosResponse<ApiResponse<UserSettings>> = await this.api.patch('/users/me/settings', settings)
    return response.data
  }

  // Lixeira endpoints
  async getDesarquivamentosLixeira(params?: QueryDesarquivamentoDto): Promise<PaginatedResponse<Desarquivamento>> {
    try {
      const response: AxiosResponse<PaginatedResponse<Desarquivamento>> = await this.api.get('/nugecid/lixeira', { params })
      return response.data
    } catch (error: any) {
      console.error('[ApiService] getDesarquivamentosLixeira error:', error?.message || error)

      return {
        success: false,
        data: [],
        meta: {
          total: 0,
          page: params?.page || 1,
          limit: params?.limit || 10,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      } as PaginatedResponse<Desarquivamento>
    }
  }

  async restoreDesarquivamento(id: string | number): Promise<ApiResponse<Desarquivamento>> {
    try {
      const response: AxiosResponse<ApiResponse<Desarquivamento>> = await this.api.patch(`/nugecid/lixeira/${id}/restaurar`)
      console.debug('[ApiService] restoreDesarquivamento response:', response.status, response.data)
      return response.data
    } catch (error: any) {
      console.error('[ApiService] restoreDesarquivamento error:', error?.response?.status, error?.response?.data || error?.message)
      throw error
    }
  }

  async deleteDesarquivamentoPermanente(id: string | number): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await this.api.delete(`/nugecid/lixeira/${id}/permanente`);
      return response.data;
    } catch (error: any) {
      console.error('[ApiService] deleteDesarquivamentoPermanente error:', error?.response?.status, error?.response?.data || error?.message)
      throw error;
    }
  }
}

const apiService = new ApiService();
const api = (apiService as any).api as AxiosInstance;

export { api, apiService };
