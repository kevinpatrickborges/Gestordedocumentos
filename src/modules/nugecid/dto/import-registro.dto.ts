import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';

// Enums normalizados (sem acentos) apenas para validação do import
export enum TipoDesarquivamento {
  FISICO = 'FISICO',
  DIGITAL = 'DIGITAL',
  NAO_LOCALIZADO = 'NAO_LOCALIZADO',
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

export class ImportRegistroDto {
  // Normalizador auxiliar
  private static norm(v: any): string {
    return (v ?? '')
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  @Transform(({ value }) => {
    const n = ImportRegistroDto.norm(value);
    if (n.includes('digital')) return TipoDesarquivamento.DIGITAL;
    if (n.includes('nao localizado')) return TipoDesarquivamento.NAO_LOCALIZADO;
    return TipoDesarquivamento.FISICO;
  })
  @IsEnum(TipoDesarquivamento, { message: 'Valor inválido para "DESARQUIVAMENTO FISICO/DIGITAL".' })
  @IsNotEmpty({ message: 'A coluna "DESARQUIVAMENTO FISICO/DIGITAL" é obrigatória.' })
  desarquivamentoTipo: TipoDesarquivamento;

  @Transform(({ value }) => {
    const n = ImportRegistroDto.norm(value);
    if (n.includes('finalizado')) return StatusDesarquivamento.FINALIZADO;
    if (n.includes('desarquivado')) return StatusDesarquivamento.DESARQUIVADO;
    if (n.includes('nao coletado')) return StatusDesarquivamento.NAO_COLETADO;
    if (n.includes('rearquivamento solicitado')) return StatusDesarquivamento.REARQUIVAMENTO_SOLICITADO;
    if (n.includes('retirado pelo setor')) return StatusDesarquivamento.RETIRADO_PELO_SETOR;
    if (n.includes('nao localizado')) return StatusDesarquivamento.NAO_LOCALIZADO;
    return StatusDesarquivamento.SOLICITADO;
  })
  @IsEnum(StatusDesarquivamento, { message: 'Valor inválido para a coluna "Status".' })
  @IsNotEmpty({ message: 'A coluna "Status" é obrigatória.' })
  status: StatusDesarquivamento;

  @IsString()
  @IsNotEmpty({ message: 'A coluna "Nome Completo" é obrigatória.' })
  nomeCompleto: string;

  @IsString()
  @IsNotEmpty({ message: 'A coluna "Nº DO NIC/LAUDO/AUTO/INFORMAÇÃO TÉCNICA" é obrigatória.' })
  numDocumento: string;

  @IsString()
  @IsOptional()
  numProcesso?: string;

  @IsString()
  @IsOptional()
  tipoDocumento?: string;

  @IsDateString({}, { message: 'A "Data de solicitação" deve ser uma data válida.' })
  @IsNotEmpty({ message: 'A coluna "Data de solicitação" é obrigatória.' })
  dataSolicitacao: string;

  @IsDateString({}, { message: 'A "Data do desarquivamento - SAG" deve ser uma data válida.' })
  @IsOptional()
  dataDesarquivamento?: string;

  @IsDateString({}, { message: 'A "Data da devolução pelo setor" deve ser uma data válida.' })
  @IsOptional()
  dataDevolucao?: string;

  @IsString()
  @IsOptional()
  setorDemandante?: string;

  @IsString()
  @IsOptional()
  servidorResponsavel?: string;

  @IsString()
  @IsOptional()
  finalidade?: string;

  @IsBoolean({ message: 'A coluna de "Prorrogação" deve ser um valor booleano (sim/não ou true/false).' })
  @IsOptional()
  prorrogacao: boolean;
}
