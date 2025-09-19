import { api } from './api';
import { Nugecid, NugecidPage } from '@/pages/nugecid/types/nugecid.types';
import { ImportResultDto } from '@/modules/nugecid/dto/import-result.dto';

const API_URL = '/nugecid';

const getById = (id: number): Promise<Nugecid> => {
  return api.get(`${API_URL}/${id}`);
};

const getPaginated = (page: number, pageSize: number, filters: any): Promise<NugecidPage> => {
  return api.get(API_URL, { params: { page, pageSize, ...filters } });
};

const create = (data: Partial<Nugecid>): Promise<Nugecid> => {
  return api.post(API_URL, data);
};

const update = (id: number, data: Partial<Nugecid>): Promise<Nugecid> => {
  return api.patch(`${API_URL}/${id}`, data);
};

const remove = (id: number): Promise<void> => {
  return api.delete(`${API_URL}/${id}`);
};

const exportPdf = (filters: any): Promise<Blob> => {
  return api.get(`${API_URL}/export/pdf`, { 
    params: filters,
    responseType: 'blob' 
  });
};

const exportXlsx = (filters: any): Promise<Blob> => {
  return api.get(`${API_URL}/export/xlsx`, { 
    params: filters,
    responseType: 'blob' 
  });
};

const importPlanilha = async (file: File): Promise<ImportResultDto> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<ImportResultDto>(`${API_URL}/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response;
};

export const nugecidService = {
  getById,
  getPaginated,
  create,
  update,
  remove,
  exportPdf,
  exportXlsx,
  importPlanilha
};