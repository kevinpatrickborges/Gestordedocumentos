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
  DashboardStats,
  UsersQueryParams,
  UsersResponse,
  UserResponse,
  CreateUserDto,
  UpdateUserDto,
  DeleteResponse
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
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('accessToken')
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

  // Dashboard endpoints
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const response: AxiosResponse<ApiResponse<DashboardStats>> = await this.api.get('/nugecid/dashboard')
    return response.data
  }

  // NUGECID endpoints
  async getDesarquivamentos(params?: QueryDesarquivamentoDto): Promise<PaginatedResponse<Desarquivamento>> {
    const response: AxiosResponse<PaginatedResponse<Desarquivamento>> = await this.api.get('/nugecid', { params })
    return response.data
  }

  async getDesarquivamento(id: number): Promise<ApiResponse<Desarquivamento>> {
    const response: AxiosResponse<ApiResponse<Desarquivamento>> = await this.api.get(`/nugecid/${id}`)
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

  async deleteDesarquivamento(id: number): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.delete(`/nugecid/${id}`)
    return response.data
  }

  async getDesarquivamentoByBarcode(barcode: string): Promise<ApiResponse<Desarquivamento>> {
    const response: AxiosResponse<ApiResponse<Desarquivamento>> = await this.api.get(`/nugecid/barcode/${barcode}`)
    return response.data
  }

  // Users endpoints
  async getUsers(params?: UsersQueryParams): Promise<UsersResponse> {
    try {
      const response: AxiosResponse<UsersResponse> = await this.api.get('/users', { params })
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
}

const apiService = new ApiService();
const api = (apiService as any).api as AxiosInstance;

export { api, apiService };
