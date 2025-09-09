import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { validate } from 'class-validator';

import { User } from '../users/entities/user.entity';
import { CreateDesarquivamentoDto } from './dto/create-desarquivamento.dto';
import { ImportResultDto } from './dto/import-result.dto';
import { ImportRegistroDto } from './dto/import-registro.dto';
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
    // Validações iniciais do arquivo
    if (!file) {
      throw new BadRequestException('Arquivo não enviado.');
    }

    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('O arquivo enviado está vazio.');
    }

    this.logger.log(`Iniciando importação de registros do arquivo: ${file.originalname}`);
    this.logger.log(`Tamanho do arquivo: ${file.size} bytes`);
    this.logger.log(`Tipo MIME: ${file.mimetype}`);

    try {
      // Tentar ler o arquivo Excel
      const workbook = XLSX.read(file.buffer, {
        type: 'buffer',
        cellDates: true,
        dateNF: 'yyyy-mm-dd'
      });

      // Pega a primeira planilha
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        throw new BadRequestException('O arquivo Excel não contém planilhas válidas.');
      }

      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) {
        throw new BadRequestException('A planilha está vazia.');
      }

      // Converte a planilha para JSON
      const data = XLSX.utils.sheet_to_json(worksheet, {
        header: 1, // Usa a numeração das linhas
        defval: '', // Valor padrão para células vazias
      });

      if (!data || data.length === 0) {
        throw new BadRequestException('Nenhum dado encontrado na planilha.');
      }

      this.logger.log(`Planilha "${sheetName}" carregada com ${data.length - 1} linhas de dados`);

      const result = new ImportResultDto();
      result.totalRows = data.length - 1; // Remove o cabeçalho
      result.successCount = 0;
      result.errorCount = 0;
      result.errors = [];

      // Remove o cabeçalho da primeira linha
      const rows = data.slice(1);

      for (let i = 0; i < rows.length; i++) {
        const rowData = rows[i] as any[];
        const rowNumber = i + 2; // +2 para contar cabeçalho + índice base 0

        try {
          // Mapeamento das colunas baseado na estrutura esperada
          const importDto = new ImportRegistroDto();

          try {
            // Mapear dados da coluna baseada na estrutura original da planilha

            // TIPO DE DESARQUIVAMENTO (Coluna A - DESARQUIVAMENTO FÍSICO/DIGITAL)
            const tipoValue = (rowData[0] || '').toString().toLowerCase().trim();
            if (tipoValue.includes('digital')) {
              importDto.desarquivamentoTipo = 'DIGITAL' as any;
            } else if (tipoValue.includes('não localizado') || tipoValue.includes('nao localizado')) {
              importDto.desarquivamentoTipo = 'NAO_LOCALIZADO' as any;
            } else {
              importDto.desarquivamentoTipo = 'FÍSICO' as any;
            }

            // STATUS (Coluna B - Status)
            const statusValue = (rowData[1] || '').toString().toLowerCase().trim();
            this.logger.log(`Debug status: "${statusValue}"`);

            if (statusValue.includes('finalizado')) {
              importDto.status = 'FINALIZADO' as any;
            } else if (statusValue.includes('desarquivado')) {
              importDto.status = 'DESARQUIVADO' as any;
            } else if (statusValue.includes('não coletado') || statusValue.includes('nao coletado')) {
              importDto.status = 'NAO_COLETADO' as any;
            } else if (statusValue.includes('rearquivamento solicitado')) {
              importDto.status = 'REARQUIVAMENTO_SOLICITADO' as any;
            } else if (statusValue.includes('retirado pelo setor')) {
              importDto.status = 'RETIRADO_PELO_SETOR' as any;
            } else if (statusValue.includes('não localizado') || statusValue.includes('nao localizado')) {
              importDto.status = 'NAO_LOCALIZADO' as any;
            } else {
              // Valor padrão
              importDto.status = 'SOLICITADO' as any;
            }

            // NOME COMPLETO (Coluna C)
            importDto.nomeCompleto = (rowData[2] || '').toString().trim() || 'N/A';

            // DOCUMENTO (Coluna D - Nº DO NIC/LAUDO/AUTO/INFORMAÇÃO TÉCNICA)
            importDto.numDocumento = (rowData[3] || '').toString().trim() || 'N/A';

            // PROCESSO (Coluna E - Nº do Processo)
            importDto.numProcesso = (rowData[4] || '').toString().trim() || '';

            // TIPO DE DOCUMENTO (Coluna F)
            importDto.tipoDocumento = (rowData[5] || '').toString().trim() || 'Não especificado';

            // DATA DE SOLICITAÇÃO (Coluna G)
            const dataSolicitacaoRaw = rowData[6];
            if (dataSolicitacaoRaw && this.isValidDate(dataSolicitacaoRaw)) {
              importDto.dataSolicitacao = this.formatDate(dataSolicitacaoRaw);
            } else if (dataSolicitacaoRaw) {
              try {
                const date = this.parseDate(dataSolicitacaoRaw);
                importDto.dataSolicitacao = date.toISOString().split('T')[0];
              } catch {
                importDto.dataSolicitacao = new Date().toISOString().split('T')[0];
              }
            } else {
              importDto.dataSolicitacao = new Date().toISOString().split('T')[0];
            }

            // DATA DO DESARQUIVAMENTO (Coluna H) - OPCIONAL
            const dataDesarquivamentoRaw = rowData[7];
            if (dataDesarquivamentoRaw && this.isValidDate(dataDesarquivamentoRaw)) {
              importDto.dataDesarquivamento = this.formatDate(dataDesarquivamentoRaw);
            } else if (dataDesarquivamentoRaw) {
              try {
                const date = this.parseDate(dataDesarquivamentoRaw);
                importDto.dataDesarquivamento = date.toISOString().split('T')[0];
              } catch {
                importDto.dataDesarquivamento = undefined;
              }
            }

            // DATA DA DEVOLUÇÃO (Coluna I) - OPCIONAL
            const dataDevolucaoRaw = rowData[8];
            if (dataDevolucaoRaw && this.isValidDate(dataDevolucaoRaw)) {
              importDto.dataDevolucao = this.formatDate(dataDevolucaoRaw);
            } else if (dataDevolucaoRaw) {
              try {
                const date = this.parseDate(dataDevolucaoRaw);
                importDto.dataDevolucao = date.toISOString().split('T')[0];
              } catch {
                importDto.dataDevolucao = undefined;
              }
            }

            // SETOR DEMANDANTE (Coluna J)
            importDto.setorDemandante = (rowData[9] || '').toString().trim() || 'A verificar';

            // SERVIDOR RESPONSÁVEL (Coluna K)
            importDto.servidorResponsavel = (rowData[10] || '').toString().trim() || 'A verificar';

            // FINALIDADE (Coluna L)
            importDto.finalidade = (rowData[11] || '').toString().trim() || 'Não especificado';

            // PRORROGAÇÃO (Coluna M) - OPCIONAL
            const prorrogacaoValue = (rowData[12] || '').toString().toLowerCase().trim();
            if (prorrogacaoValue === 'sim' || prorrogacaoValue === 's' ||
                prorrogacaoValue === 'true' || prorrogacaoValue === '1' ||
                prorrogacaoValue === 's') {
              importDto.prorrogacao = true;
            } else if (prorrogacaoValue === 'não' || prorrogacaoValue === 'n' ||
                      prorrogacaoValue === 'false' || prorrogacaoValue === '0' ||
                      prorrogacaoValue === 'não') {
              importDto.prorrogacao = false;
            } else {
              importDto.prorrogacao = false; // Valor padrão
            }

          } catch (mappingError) {
            this.logger.error(`Erro ao mapear linha ${rowNumber}:`, mappingError);
            // Configura dados básicos para evitar falha completa
            importDto.desarquivamentoTipo = 'FÍSICO' as any;
            importDto.status = 'SOLICITADO' as any;
            importDto.nomeCompleto = (rowData[2] || '').toString().trim() || 'Erro de Mapeamento';
            importDto.numDocumento = (rowData[3] || '').toString().trim() || 'ERRO';
            importDto.numProcesso = (rowData[4] || '').toString().trim() || '';
            importDto.tipoDocumento = (rowData[5] || '').toString().trim() || 'Não especificado';
            importDto.dataSolicitacao = new Date().toISOString().split('T')[0];
            importDto.dataDesarquivamento = undefined;
            importDto.dataDevolucao = undefined;
            importDto.setorDemandante = 'A verificar';
            importDto.servidorResponsavel = 'A verificar';
            importDto.finalidade = 'Erro no mapeamento de dados';
            importDto.prorrogacao = false;
          }

          this.logger.log(`Linha ${rowNumber} - Dados mapeados:`, {
            nome: importDto.nomeCompleto,
            documento: importDto.numDocumento,
            processo: importDto.numProcesso,
            tipo: importDto.desarquivamentoTipo
          });

          // Validação dos dados
          const errors = await validate(importDto);
          if (errors.length > 0) {
            this.logger.warn(`Erro de validação na linha ${rowNumber}:`);
            errors.forEach(err => this.logger.warn(err));

            result.errorCount++;
            result.errors.push({
              row: rowNumber,
              details: {
                message: `Erro de validação: ${errors.map(err => Object.values(err.constraints).join(', ')).join('; ')}`,
                data: rowData,
              },
            });
            continue;
          }

          // Criar DTO para criação
          const createDto: CreateDesarquivamentoDto = {
            tipoDesarquivamento: this.mapTipoDesarquivamentoFromExcel(
              importDto.desarquivamentoTipo,
            ),
            desarquivamentoFisicoDigital: this.mapTipoDesarquivamentoFromExcel(
              importDto.desarquivamentoTipo,
            ),
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

          // Criar registro no banco
          await this.nugecidService.create(createDto, currentUser);
          result.successCount++;

          this.logger.log(`✅ Linha ${rowNumber} importada com sucesso: ${importDto.nomeCompleto}`);

        } catch (error) {
          this.logger.error(`❌ Erro ao processar linha ${rowNumber}:`, error);

          result.errorCount++;
          result.errors.push({
            row: rowNumber,
            details: {
              message: error.message || 'Erro desconhecido',
              data: rowData,
            },
          });
        }
      }

      this.logger.log(
        `📊 Importação finalizada: ${result.successCount} sucessos, ${result.errorCount} erros`,
      );

      return result;

    } catch (error) {
      this.logger.error(`❌ Erro crítico na importação: ${error.message}`, error.stack);
      throw new BadRequestException(
        `Erro ao processar arquivo Excel: ${error.message}`,
      );
    }
  }

  private mapTipoDesarquivamentoFromExcel(tipo: string): TipoDesarquivamentoEnum {
    if (!tipo) return TipoDesarquivamentoEnum.FISICO;

    const tipoLower = tipo.toString().toLowerCase().trim();

    if (tipoLower.includes('digital') || tipoLower.includes('DIGITAL')) {
      return TipoDesarquivamentoEnum.DIGITAL;
    }

    return TipoDesarquivamentoEnum.FISICO;
  }

  // Utilitários para trabalhar com datas do Excel
  private isValidDate(value: any): boolean {
    if (!value) return false;
    const date = new Date(value);
    return !isNaN(date.getTime()) && date.getFullYear() > 1970;
  }

  private parseDate(value: any): Date {
    let date: Date;

    if (value instanceof Date) {
      date = new Date(value);
    } else if (typeof value === 'number') {
      // Excel date serial number
      date = new Date((value - 25569) * 86400 * 1000);
    } else {
      // Try parsing as string
      date = new Date(value);
    }

    if (!this.isValidDate(date)) {
      throw new Error(`Data inválida: ${value}`);
    }

    return date;
  }

  private formatDate(value: any): string {
    const date = this.parseDate(value);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  }
}
