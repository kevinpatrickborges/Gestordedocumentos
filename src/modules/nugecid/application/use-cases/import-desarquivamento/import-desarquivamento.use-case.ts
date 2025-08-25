import { Injectable } from '@nestjs/common';
import * as xlsx from 'xlsx';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateDesarquivamentoDto } from '../../../dto/create-desarquivamento.dto';
import {
  CreateDesarquivamentoUseCase,
  CreateDesarquivamentoRequest,
} from '../create-desarquivamento/create-desarquivamento.use-case';

interface ImportResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: { row: number; details: any }[];
}

@Injectable()
export class ImportDesarquivamentoUseCase {
  constructor(
    private readonly createDesarquivamentoUseCase: CreateDesarquivamentoUseCase,
  ) {}

  async execute(
    fileBuffer: Buffer,
    criadoPorId: number = 1,
  ): Promise<ImportResult> {
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    const result: ImportResult = {
      totalRows: data.length,
      successCount: 0,
      errorCount: 0,
      errors: [],
    };

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const dto = plainToClass(CreateDesarquivamentoDto, row);
      const validationErrors = await validate(dto);

      if (validationErrors.length > 0) {
        result.errorCount++;
        result.errors.push({ row: i + 2, details: validationErrors });
      } else {
        try {
          // Criar request para o use case
          const request: CreateDesarquivamentoRequest = {
            tipoSolicitacao: dto.tipoSolicitacao,
            nomeSolicitante: dto.nomeSolicitante,
            nomeVitima: dto.nomeVitima,
            numeroRegistro: dto.numeroRegistro,
            tipoDocumento: dto.tipoDocumento,
            dataFato: dto.dataFato,
            prazoAtendimento: dto.prazoAtendimento,
            finalidade: dto.finalidade,
            observacoes: dto.observacoes,
            urgente: dto.urgente || false,
            localizacaoFisica: dto.localizacaoFisica,
            criadoPorId,
            responsavelId: dto.responsavelId,
          };

          // Usar o CreateDesarquivamentoUseCase
          await this.createDesarquivamentoUseCase.execute(request);
          result.successCount++;
        } catch (error) {
          result.errorCount++;
          result.errors.push({ row: i + 2, details: error.message });
        }
      }
    }

    return result;
  }
}
