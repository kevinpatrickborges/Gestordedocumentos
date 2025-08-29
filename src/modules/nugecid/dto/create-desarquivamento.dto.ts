import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsDateString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateDesarquivamentoDto {
  @ApiProperty({
    description: 'Tipo de desarquivamento (Físico ou Digital)',
    example: 'FISICO',
  })
  @IsString()
  @IsNotEmpty({ message: 'Tipo de desarquivamento é obrigatório' })
  @Transform(({ value }) => value?.trim())
  tipoDesarquivamento: string;

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
  @IsDateString({}, { message: 'Data de solicitação deve estar em formato válido' })
  @IsNotEmpty({ message: 'Data de solicitação é obrigatória' })
  dataSolicitacao: string;

  @ApiPropertyOptional({
    description: 'Data do desarquivamento no sistema SAG',
    example: '2025-01-20T14:30:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Data de desarquivamento SAG deve estar em formato válido' })
  dataDesarquivamentoSAG?: string;

  @ApiPropertyOptional({
    description: 'Data da devolução pelo setor',
    example: '2025-01-25T16:00:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Data de devolução deve estar em formato válido' })
  dataDevolucaoSetor?: string;

  @ApiProperty({
    description: 'Setor que está solicitando o desarquivamento',
    example: 'Delegacia de Plantão da Zona Sul',
  })
  @IsString()
  @IsNotEmpty({ message: 'Setor demandante é obrigatório' })
  @MinLength(2)
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  setorDemandante: string;

  @ApiProperty({
    description: 'Servidor do ITEP responsável pela solicitação (Nome e Matrícula)',
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
}
