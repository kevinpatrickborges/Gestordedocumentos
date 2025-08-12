import { IsString, IsNotEmpty, IsDateString, IsOptional, IsEnum, IsBoolean } from 'class-validator';

// Enum para a Coluna B: DESARQUIVAMENTO FÍSICO/DIGITAL
export enum TipoDesarquivamento {
  FISICO = 'Físico',
  DIGITAL = 'Digital',
  NAO_LOCALIZADO = 'Não Localizado',
}

// Enum para a Coluna C: Status
export enum StatusDesarquivamento {
  FINALIZADO = 'Finalizado',
  DESARQUIVADO = 'Desarquivado',
  NAO_COLETADO = 'Não coletado',
  SOLICITADO = 'Solicitado',
  REARQUIVAMENTO_SOLICITADO = 'Rearquivamento Solicitado',
  RETIRADO_PELO_SETOR = 'Retirado pelo setor',
  NAO_LOCALIZADO = 'Não Localizado',
}

export class ImportRegistroDto {
  @IsEnum(TipoDesarquivamento, { message: 'O valor para a coluna "DESARQUIVAMENTO FÍSICO/DIGITAL" é inválido.' })
  @IsNotEmpty({ message: 'A coluna "DESARQUIVAMENTO FÍSICO/DIGITAL" é obrigatória.' })
  desarquivamentoTipo: TipoDesarquivamento;

  @IsEnum(StatusDesarquivamento, { message: 'O valor para a coluna "Status" é inválido.' })
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