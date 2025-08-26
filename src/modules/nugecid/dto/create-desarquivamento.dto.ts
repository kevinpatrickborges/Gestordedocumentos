import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  TipoDesarquivamento,
  TipoDesarquivamentoEnum,
} from '../domain/value-objects/tipo-desarquivamento.vo';
import { TipoSolicitacaoEnum } from '../domain/value-objects/tipo-solicitacao.vo';

export class CreateDesarquivamentoDto {
  @ApiProperty({
    description: 'Tipo de solicitação',
    enum: TipoSolicitacaoEnum,
    example: TipoSolicitacaoEnum.COPIA,
  })
  @IsEnum(TipoSolicitacaoEnum)
  tipoSolicitacao: TipoSolicitacaoEnum;

  @ApiProperty({
    description: 'Nome do solicitante',
    example: 'João da Silva',
  })
  @IsString()
  @IsNotEmpty({ message: 'Nome do solicitante é obrigatório' })
  @MinLength(3)
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  nomeSolicitante: string;

  @ApiProperty({
    description: 'Requerente',
    example: 'João da Silva',
  })
  @IsString()
  @IsNotEmpty({ message: 'Requerente é obrigatório' })
  @MinLength(3)
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  requerente: string;

  @ApiProperty({
    description: 'Número de registro (Processo, NIC, etc.)',
    example: '0800123-45.2025.8.20.0001',
  })
  @IsString()
  @IsNotEmpty({ message: 'Número de registro é obrigatório' })
  @MinLength(3)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  numeroRegistro: string;

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
    description: 'Tipo de desarquivamento (Físico ou Digital)',
    enum: TipoDesarquivamentoEnum,
    example: TipoDesarquivamentoEnum.FISICO,
  })
  @IsEnum(TipoDesarquivamentoEnum, {
    message: 'Tipo de desarquivamento deve ser FÍSICO ou DIGITAL',
  })
  tipoDesarquivamento: TipoDesarquivamentoEnum;

  @ApiPropertyOptional({
    description: 'Número do NIC, Laudo, Auto ou Informação Técnica',
    example: 'NIC 123456',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  numeroNicLaudoAuto?: string;

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
    description: 'Setor que está solicitando o desarquivamento',
    example: 'Delegacia de Plantão da Zona Sul',
  })
  @IsString()
  @IsNotEmpty({ message: 'Setor demandante é obrigatório' })
  @MinLength(2)
  @MaxLength(100)
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

  @ApiPropertyOptional({
    description: 'Indica se há uma solicitação de prorrogação de prazo',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  solicitacaoProrrogacao?: boolean = false;

  @ApiPropertyOptional({
    description: 'Indica se a solicitação é urgente',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  urgente?: boolean = false;
}
