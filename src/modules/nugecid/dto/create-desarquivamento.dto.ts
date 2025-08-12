import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { TipoSolicitacaoEnum } from '../domain/value-objects/tipo-solicitacao.vo';

export class CreateDesarquivamentoDto {
  @ApiProperty({
    description: 'Tipo da solicitação',
    enum: TipoSolicitacaoEnum,
    example: TipoSolicitacaoEnum.DESARQUIVAMENTO,
  })
  @IsEnum(TipoSolicitacaoEnum, {
    message: 'Tipo deve ser um dos valores válidos: DESARQUIVAMENTO, COPIA, VISTA, CERTIDAO',
  })
  tipoSolicitacao: TipoSolicitacaoEnum;

  @ApiProperty({
    description: 'Nome completo do requerente',
    example: 'João Silva Santos',
    minLength: 2,
    maxLength: 255,
  })
  @IsString({ message: 'Nome do requerente deve ser uma string' })
  @IsNotEmpty({ message: 'Nome do requerente é obrigatório' })
  @MinLength(2, { message: 'Nome do solicitante deve ter pelo menos 2 caracteres' })
  @MaxLength(255, { message: 'Nome do solicitante deve ter no máximo 255 caracteres' })
  @Transform(({ value }) => value?.trim())
  nomeSolicitante: string;

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

  @ApiProperty({
    description: 'Número do registro/processo',
    example: '2024.001.123456',
    minLength: 3,
    maxLength: 50,
  })
  @IsString({ message: 'Número do registro deve ser uma string' })
  @IsNotEmpty({ message: 'Número do registro é obrigatório' })
  @MinLength(3, { message: 'Número do registro deve ter pelo menos 3 caracteres' })
  @MaxLength(50, { message: 'Número do registro deve ter no máximo 50 caracteres' })
  @Transform(({ value }) => value?.trim())
  numeroRegistro: string;

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
  @IsString({ message: 'Observações deve ser uma string' })
  @MaxLength(1000, { message: 'Observações deve ter no máximo 1000 caracteres' })
  @Transform(({ value }) => value?.trim())
  observacoes?: string;

  @ApiPropertyOptional({
    description: 'Indica se a solicitação é urgente',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Urgente deve ser um valor booleano' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true' || value === '1';
    }
    return Boolean(value);
  })
  urgente?: boolean = false;

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
  @Transform(({ value }) => (value ? new Date(value) : null))
  prazoAtendimento?: Date;

  @ApiPropertyOptional({
    description: 'ID do usuário responsável pelo atendimento',
    example: 2,
    type: 'integer',
  })
  @IsOptional()
  responsavelId?: number;
}
