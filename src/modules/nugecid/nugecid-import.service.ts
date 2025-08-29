
import { ImportRegistroDto } from './dto/import-registro.dto';
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { validate } from 'class-validator';

import { DesarquivamentoTypeOrmEntity } from './infrastructure/entities/desarquivamento.typeorm-entity';
import { User } from '../users/entities/user.entity';
import { CreateDesarquivamentoDto } from './dto/create-desarquivamento.dto';
import { ImportResultDto } from './dto/import-result.dto';
import { ImportDesarquivamentoDto } from './dto/import-desarquivamento.dto';
import { NugecidService } from './nugecid.service';
import { TipoDesarquivamentoEnum } from './domain/value-objects/tipo-desarquivamento.vo';

@Injectable()
export class NugecidImportService {
  private readonly logger = new Logger(NugecidImportService.name);

  constructor(
    private readonly nugecidService: NugecidService,
  ) {}

  async importFromXLSX(
    file: Express.Multer.File,
    currentUser: User,
  ): Promise<ImportResultDto> {
    return this.importRegistrosFromXLSX(file, currentUser);
  }

  async importRegistrosFromXLSX(
    file: Express.Multer.File,
    currentUser: User,
  ): Promise<ImportResultDto> {
    if (!file) {
      throw new BadRequestException('Arquivo não enviado.');
    }

    this.logger.log(`Iniciando importação de registros do arquivo: ${file.originalname}`);

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const result = new ImportResultDto();
    result.totalRows = data.length;
    result.successCount = 0;
    result.errorCount = 0;
    result.errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2;

      const importDto = new ImportRegistroDto();
      // Mapeamento baseado na especificação do PRD
      importDto.desarquivamentoTipo =
        row['DESARQUIVAMENTO FÍSICO/DIGITAL'] || row['desarquivamento_tipo'];
      importDto.status = row['Status'] || row['status'];
      importDto.nomeCompleto = row['Nome Completo'] || row['nome_completo'];
      importDto.numDocumento =
        row['Nº DO NIC/LAUDO/AUTO/INFORMAÇÃO TÉCNICA'] || row['num_documento'];
      importDto.numProcesso = row['Nº do Processo'] || row['num_processo'];
      importDto.tipoDocumento =
        row['Tipo de Documento'] || row['tipo_documento'];
      importDto.dataSolicitacao =
        row['Data de solicitação'] || row['data_solicitacao'];
      importDto.dataDesarquivamento =
        row['Data do desarquivamento - SAG'] || row['data_desarquivamento'];
      importDto.dataDevolucao =
        row['Data da devolução pelo setor'] || row['data_devolucao'];
      importDto.setorDemandante =
        row['Setor Demandante'] || row['setor_demandante'];
      importDto.servidorResponsavel =
        row['Servidor Responsável'] || row['servidor_responsavel'];
      importDto.finalidade = row['Finalidade'] || row['finalidade'];

      // Converte prorrogação para boolean
      const prorrogacaoValue = row['Prorrogação'] || row['prorrogacao'];
      if (prorrogacaoValue !== undefined) {
        importDto.prorrogacao =
          prorrogacaoValue === 'Sim' ||
          prorrogacaoValue === 'sim' ||
          prorrogacaoValue === true ||
          prorrogacaoValue === 'true';
      }

      const errors = await validate(importDto);

      if (errors.length > 0) {
        result.errorCount++;
        result.errors.push({
          row: rowNumber,
          details: {
            message: errors
              .map(err => Object.values(err.constraints).join(', '))
              .join('; '),
            data: row,
          },
        });
        continue;
      }

      try {
        const createDto: CreateDesarquivamentoDto = {
          tipoDesarquivamento: this.mapTipoDesarquivamentoFromExcel(
            importDto.desarquivamentoTipo,
          ) as TipoDesarquivamentoEnum,
          nomeCompleto: importDto.nomeCompleto,
          numeroNicLaudoAuto: importDto.numDocumento || 'N/A',
          numeroProcesso: importDto.numProcesso || '',
          tipoDocumento: importDto.tipoDocumento || 'Não especificado',
          dataSolicitacao: importDto.dataSolicitacao || new Date().toISOString(),
          dataDesarquivamentoSAG: importDto.dataDesarquivamento,
          dataDevolucaoSetor: importDto.dataDevolucao,
          setorDemandante: importDto.setorDemandante || 'A verificar',
          servidorResponsavel: importDto.servidorResponsavel || 'A verificar',
          finalidadeDesarquivamento: importDto.finalidade || 'Não especificado',
          solicitacaoProrrogacao: importDto.prorrogacao || false,
        };

        await this.nugecidService.create(createDto, currentUser);
        result.successCount++;
      } catch (error) {
        this.logger.error(
          `Erro ao salvar linha ${rowNumber} do arquivo ${file.originalname}: ${error.message}`,
        );
        result.errorCount++;
        result.errors.push({
          row: rowNumber,
          details: { message: error.message, data: row },
        });
      }
    }

    this.logger.log(
      `Importação de registros concluída para ${file.originalname}: ${result.successCount} sucessos, ${result.errorCount} falhas.`,
    );

    return result;
  }

  private mapTipoDesarquivamentoFromExcel(
    tipo: string,
  ): TipoDesarquivamentoEnum {
    if (!tipo) return TipoDesarquivamentoEnum.FISICO;
    const tipoLower = tipo.toLowerCase().trim();
    if (tipoLower.includes('digital')) return TipoDesarquivamentoEnum.DIGITAL;
    return TipoDesarquivamentoEnum.FISICO;
  }
}
