import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
  MaxLength,
  MinLength,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { StatusDesarquivamento } from '../entities/desarquivamento.entity';
import { TipoSolicitacaoEnum } from '../domain/value-objects/tipo-solicitacao.vo';

export class UpdateDesarquivamentoDto {
  @ApiPropertyOptional({
    description: 'Tipo da solicitação',
    enum: TipoSolicitacaoEnum,
    example: TipoSolicitacaoEnum.DESARQUIVAMENTO,
  })
  @IsOptional()
  @IsEnum(TipoSolicitacaoEnum, {
    message: 'Tipo deve ser um dos valores válidos: DESARQUIVAMENTO, COPIA, VISTA, CERTIDAO',
  })
  tipo?: TipoSolicitacaoEnum;

  @ApiPropertyOptional({
    description: 'Status da solicitação',
    enum: StatusDesarquivamento,
    example: StatusDesarquivamento.EM_ANDAMENTO,
  })
  @IsOptional()
  @IsEnum(StatusDesarquivamento, {
    message: 'Status deve ser um dos valores válidos: PENDENTE, EM_ANDAMENTO, CONCLUIDO, CANCELADO',
  })
  status?: StatusDesarquivamento;

  @ApiPropertyOptional({
    description: 'Nome completo do requerente',
    example: 'João Silva Santos',
    minLength: 2,
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Nome do requerente deve ser uma string' })
  @MinLength(2, { message: 'Nome do requerente deve ter pelo menos 2 caracteres' })
  @MaxLength(255, { message: 'Nome do requerente deve ter no máximo 255 caracteres' })
  @Transform(({ value }) => value?.trim())
  nomeRequerente?: string;

  @ApiPropertyOptional({
    description: 'Nome da vítima (quando aplicável)',
    example: 'Maria Oliveira',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Nome da vítima deve ser uma string' })
  @MaxLength(255, { message: 'Nome da vítima deve ter no máximo 255 caracteres' })
  @Transform(({ value }) => value?.trim())
  nomeVitima?: string;

  @ApiPropertyOptional({
    description: 'Número do registro/processo',
    example: '2024.001.123456',
    minLength: 3,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Número do registro deve ser uma string' })
  @MinLength(3, { message: 'Número do registro deve ter pelo menos 3 caracteres' })
  @MaxLength(50, { message: 'Número do registro deve ter no máximo 50 caracteres' })
  @Transform(({ value }) => value?.trim())
  numeroRegistro?: string;

  @ApiPropertyOptional({
    description: 'Tipo do documento solicitado',
    example: 'Laudo Pericial',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Tipo do documento deve ser uma string' })
  @MaxLength(100, { message: 'Tipo do documento deve ter no máximo 100 caracteres' })
  @Transform(({ value }) => value?.trim())
  tipoDocumento?: string;

  @ApiPropertyOptional({
    description: 'Data do fato/ocorrência',
    example: '2024-01-15',
    type: 'string',
    format: 'date',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Data do fato deve estar no formato válido (YYYY-MM-DD)' })
  @Transform(({ value }) => value ? new Date(value) : null)
  dataFato?: Date;

  @ApiPropertyOptional({
    description: 'Finalidade da solicitação',
    example: 'Processo judicial em andamento',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Finalidade deve ser uma string' })
  @MaxLength(500, { message: 'Finalidade deve ter no máximo 500 caracteres' })
  @Transform(({ value }) => value?.trim())
  finalidade?: string;

  @ApiPropertyOptional({
    description: 'Observações adicionais',
    example: 'Solicitação urgente para audiência',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString({ message: 'Observações devem ser uma string' })
  @MaxLength(1000, { message: 'Observações devem ter no máximo 1000 caracteres' })
  @Transform(({ value }) => value?.trim())
  observacoes?: string;

  @ApiPropertyOptional({
    description: 'Indica se a solicitação é urgente',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Urgente deve ser um valor booleano' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true' || value === '1';
    }
    return Boolean(value);
  })
  urgente?: boolean;

  @ApiPropertyOptional({
    description: 'Localização física do documento/processo',
    example: 'Arquivo Central - Estante 15, Prateleira 3',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Localização física deve ser uma string' })
  @MaxLength(255, { message: 'Localização física deve ter no máximo 255 caracteres' })
  @Transform(({ value }) => value?.trim())
  localizacaoFisica?: string;

  @ApiPropertyOptional({
    description: 'Data limite para atendimento',
    example: '2024-02-15T10:00:00Z',
    type: 'string',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Prazo de atendimento deve estar no formato válido' })
  @Transform(({ value }) => value ? new Date(value) : null)
  prazoAtendimento?: Date;

  @ApiPropertyOptional({
    description: 'ID do usuário responsável pelo atendimento',
    example: 2,
    type: 'integer',
    minimum: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'ID do responsável deve ser um número' })
  @Min(1, { message: 'ID do responsável deve ser maior que 0' })
  responsavelId?: number;

  @ApiPropertyOptional({
    description: 'Data de conclusão da solicitação',
    example: '2024-02-10T14:30:00Z',
    type: 'string',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Data de conclusão deve estar no formato válido' })
  @Transform(({ value }) => value ? new Date(value) : null)
  dataAtendimento?: Date;

  @ApiPropertyOptional({
    description: 'Resultado ou observações do atendimento',
    example: 'Documento localizado e disponibilizado',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString({ message: 'Resultado do atendimento deve ser uma string' })
  @MaxLength(1000, { message: 'Resultado do atendimento deve ter no máximo 1000 caracteres' })
  @Transform(({ value }) => value?.trim())
  resultadoAtendimento?: string;
}
