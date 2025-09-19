export interface QueryUsersDto {
  nome?: string;
  usuario?: string;
  ativo?: boolean;
  roleId?: number;
  includeDeleted?: boolean;
  page?: number;
  limit?: number;
}
