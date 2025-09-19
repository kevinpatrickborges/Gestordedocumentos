import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsDateString,
  MaxLength,
  MinLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { TipoDesarquivamentoEnum } from '../domain/enums/tipo-desarquivamento.enum';
import { StatusDesarquivamentoEnum } from '../domain/enums/status-desarquivamento.enum';

export class CreateDesarquivamentoDto {
  @ApiProperty({
    description: 'Desarquivamento Físico/Digital ou não localizado',
    example: 'FISICO',
    enum: ['FISICO', 'DIGITAL', 'NAO_LOCALIZADO'],
  })
  @Transform(({ value, obj }) => {
    const v = value ?? obj?.desarquivamentoFisicoDigital;
    if (typeof v !== 'string') return v;
    return v
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();
  })
  @IsNotEmpty({ message: 'Tipo de desarquivamento é obrigatório' })
  tipoDesarquivamento: string;

  @ApiProperty({
    description:
      'Desarquivamento Físico/Digital ou não localizado (compatibilidade)',
    example: TipoDesarquivamentoEnum.FISICO,
    enum: TipoDesarquivamentoEnum,
  })
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    return value
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();
  })
  @IsOptional()
  @IsEnum(TipoDesarquivamentoEnum, {
    message:
      'Tipo de desarquivamento deve ser FISICO, DIGITAL ou NAO_LOCALIZADO',
  })
  @IsNotEmpty({ message: 'Tipo de desarquivamento é obrigatório' })
  desarquivamentoFisicoDigital?: TipoDesarquivamentoEnum;

  @ApiProperty({
    description: 'Nome completo do solicitante',
    example: 'João da Silva Santos',
  })
  @IsString()
  @IsNotEmpty({ message: 'Nome completo é obrigatório' })
  @MinLength(3)
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  nomeCompleto: string;

  @ApiProperty({
    description: 'Número do NIC, Laudo, Auto ou Informação Técnica',
    example: 'NIC-123456/2025',
  })
  @IsString()
  @IsNotEmpty({ message: 'Número NIC/Laudo/Auto é obrigatório' })
  @MinLength(3)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  numeroNicLaudoAuto: string;

  @ApiProperty({
    description: 'Número do processo',
    example: '2025.001.123456',
  })
  @IsString()
  @IsNotEmpty({ message: 'Número do processo é obrigatório' })
  @MinLength(3)
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  numeroProcesso: string;

  @ApiProperty({
    description: 'Tipo do documento',
    example: 'Laudo de Perícia Criminal',
  })
  @IsString()
  @IsNotEmpty({ message: 'Tipo de documento é obrigatório' })
  @MinLength(3)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  tipoDocumento: string;

  @ApiProperty({
    description: 'Data da solicitação',
    example: '2025-01-15T10:30:00Z',
  })
  @IsDateString(
    {},
    { message: 'Data de solicitação deve estar em formato válido' },
  )
  @IsNotEmpty({ message: 'Data de solicitação é obrigatória' })
  dataSolicitacao: string;

  @ApiPropertyOptional({
    description: 'Data do desarquivamento no sistema SAG',
    example: '2025-01-20T14:30:00Z',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'Data de desarquivamento SAG deve estar em formato válido' },
  )
  dataDesarquivamentoSAG?: string;

  @ApiPropertyOptional({
    description: 'Data da devolução pelo setor',
    example: '2025-01-25T16:00:00Z',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'Data de devolução deve estar em formato válido' },
  )
  dataDevolucaoSetor?: string;

  @ApiProperty({
    description: 'Setor que está solicitando o desarquivamento',
    example: 'Instituto de Identificação',
  })
  @IsString()
  @IsNotEmpty({ message: 'Setor demandante é obrigatório' })
  @MinLength(2)
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  setorDemandante: string;

  @ApiProperty({
    description:
      'Servidor do ITEP responsável pela solicitação (Nome e Matrícula)',
    example: 'Maria Oliveira (mat. 654321)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Servidor responsável é obrigatório' })
  @MinLength(3)
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  servidorResponsavel: string;

  @ApiProperty({
    description: 'Finalidade e justificativa para o desarquivamento',
    example: 'Para instrução em processo judicial.',
  })
  @IsString()
  @IsNotEmpty({ message: 'Finalidade é obrigatória' })
  @MinLength(10)
  @MaxLength(1000)
  @Transform(({ value }) => value?.trim())
  finalidadeDesarquivamento: string;

  @ApiProperty({
    description: 'Indica se há uma solicitação de prorrogação de prazo',
    default: false,
  })
  @IsBoolean()
  @IsNotEmpty({ message: 'Solicitação de prorrogação é obrigatória' })
  solicitacaoProrrogacao: boolean;

  @ApiPropertyOptional({
    description: 'Indica se a solicitação é urgente',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  urgente?: boolean = false;

  @ApiPropertyOptional({
    description: 'Status inicial do desarquivamento (opcional em importações)',
    enum: StatusDesarquivamentoEnum,
  })
  @IsOptional()
  @IsEnum(StatusDesarquivamentoEnum, {
    message: 'Status deve ser um dos valores válidos',
  })
  status?: StatusDesarquivamentoEnum;
}
