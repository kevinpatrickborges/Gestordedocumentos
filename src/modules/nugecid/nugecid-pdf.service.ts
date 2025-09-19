import { Injectable, Logger } from '@nestjs/common';

import { DesarquivamentoTypeOrmEntity } from './infrastructure/entities/desarquivamento.typeorm-entity';

export interface TermoDesarquivamentoOptions {
  header?: {
    titulo?: string;
    subtitulo?: string;
    informacoesAdicionais?: string[];
  };
  footer?: {
    linhas?: string[];
  };
}

@Injectable()
export class NugecidPdfService {
  private readonly logger = new Logger(NugecidPdfService.name);

  async generatePdf(
    desarquivamento: DesarquivamentoTypeOrmEntity,
  ): Promise<Buffer> {
    try {
      // Carrega pdfkit somente quando necessário para evitar depender do pacote em build
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const PDFDocument: any = require('pdfkit');
      this.logger.log(
        `Iniciando geração de PDF para o desarquivamento ID: ${desarquivamento.id}`,
      );
      this.logger.debug(
        'Dados do desarquivamento para o PDF:',
        JSON.stringify(desarquivamento, null, 2),
      );

      const criadoPor = await desarquivamento.criadoPor;
      const responsavel = desarquivamento.responsavel
        ? await desarquivamento.responsavel
        : null;

      return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 72, right: 72 },
          bufferPages: true,
        });

        // PDF content generation logic was here. It seems to have been corrupted.
        doc.text('Conteúdo do PDF corrompido.');
        doc.moveDown();

        const dataGeracao = new Date().toLocaleString('pt-BR');
        doc
          .font('Helvetica')
          .fontSize(10)
          .text(`Gerado em: ${dataGeracao} - SGC/ITEP`, { align: 'center' });

        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });
        doc.on('error', err => {
          this.logger.error('Erro no stream do PDF:', err);
          reject(err);
        });
        doc.end();
      });
    } catch (error) {
      this.logger.error(
        `Erro catastrófico ao gerar PDF para ID ${desarquivamento?.id}:`,
        error.stack,
      );
      throw error;
    }
  }

  async generateBatchTermoPdf(
    desarquivamentos: DesarquivamentoTypeOrmEntity[],
    options?: TermoDesarquivamentoOptions,
  ): Promise<Buffer> {
    if (!Array.isArray(desarquivamentos) || desarquivamentos.length === 0) {
      throw new Error(
        'É necessário informar ao menos um desarquivamento para gerar o termo.',
      );
    }

    // Carregamento dinâmico do pdfkit, assim como na geração individual
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const PDFDocument: any = require('pdfkit');

    this.logger.log(
      `Gerando termo de desarquivamento para ${desarquivamentos.length} item(ns).`,
    );

    const quantidadeItens = desarquivamentos.length;

    const formatDate = (date?: Date) => {
      if (!date) {
        return 'Não informado';
      }

      try {
        return new Date(date).toLocaleDateString('pt-BR');
      } catch (error) {
        this.logger.warn(
          `Não foi possível formatar a data "${date}": ${(error as Error).message}`,
        );
        return 'Não informado';
      }
    };

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 72, right: 72 },
        bufferPages: true,
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const tituloPrincipal =
        options?.header?.titulo ||
        'TERMO DE DESARQUIVAMENTO E RETIRADA DE DOCUMENTOS';
      const subtituloPrincipal =
        options?.header?.subtitulo ||
        'Registro de retirada de documentos físicos sob responsabilidade do solicitante';

      doc.font('Helvetica').fontSize(12);
      doc.text('GOVERNO DO ESTADO DO RIO GRANDE DO NORTE', { align: 'center' });
      doc.text('SECRETARIA DE ESTADO DA SEGURANÇA PÚBLICA E DA DEFESA SOCIAL', {
        align: 'center',
      });
      doc.text('INSTITUTO TÉCNICO-CIENTÍFICO DE PERÍCIA - ITEP/RN', {
        align: 'center',
      });
      doc.moveDown(1.5);

      doc
        .font('Helvetica-Bold')
        .fontSize(16)
        .text(tituloPrincipal, { align: 'center' });
      doc.moveDown(0.5);
      doc
        .font('Helvetica')
        .fontSize(12)
        .text(subtituloPrincipal, { align: 'center' });

      if (options?.header?.informacoesAdicionais?.length) {
        doc.moveDown(0.5);
        options.header.informacoesAdicionais.forEach(info => {
          doc.text(info, { align: 'center' });
        });
      }

      doc.moveDown(1.5);

      doc
        .font('Helvetica')
        .fontSize(12)
        .text(
          `Este termo certifica que o solicitante recebeu ${
            quantidadeItens === 1
              ? 'o item relacionado'
              : `${quantidadeItens} itens relacionados`
          } abaixo, comprometendo-se a mantê-los sob sua guarda e responsabilidade, bem como devolvê-los no prazo estabelecido pela unidade administrativa responsável.`,
          {
            align: 'justify',
          },
        );

      doc.moveDown(1.5);

      doc.font('Helvetica-Bold').fontSize(12).text('Resumo da Retirada');
      doc.moveDown(0.5);
      doc.font('Helvetica').fontSize(12);
      doc.text(`Quantidade de Itens: ${quantidadeItens}`);

      const dataRetirada = desarquivamentos
        .map(
          item =>
            item.dataDesarquivamentoSAG ||
            item.dataDevolucaoSetor ||
            item.updatedAt,
        )
        .filter(Boolean)
        .sort(
          (a, b) =>
            new Date(b as Date).getTime() - new Date(a as Date).getTime(),
        )[0];

      doc.text(
        `Data da Retirada: ${formatDate(dataRetirada as Date | undefined)}`,
      );
      doc.moveDown(1.5);

      doc.font('Helvetica-Bold').fontSize(12).text('Itens Retirados');
      doc.moveDown(0.5);

      desarquivamentos.forEach((item, index) => {
        doc
          .font('Helvetica-Bold')
          .fontSize(12)
          .text(`${index + 1}. ${item.nomeCompleto}`);
        doc.font('Helvetica').fontSize(12);
        doc.text(
          `Tipo de Documento: ${item.tipoDocumento || 'Não informado'}`,
          {
            indent: 20,
          },
        );
        doc.text(
          `Número NIC/Laudo/Auto: ${item.numeroNicLaudoAuto || 'Não informado'}`,
          {
            indent: 20,
          },
        );
        doc.text(
          `Tipo de Desarquivamento: ${item.tipoDesarquivamento || 'Não informado'}`,
          {
            indent: 20,
          },
        );
        doc.text(
          `Data da Retirada: ${formatDate(
            item.dataDesarquivamentoSAG ||
              item.dataDevolucaoSetor ||
              item.updatedAt,
          )}`,
          { indent: 20 },
        );
        doc.moveDown();
      });

      doc.moveDown(1.5);
      doc
        .font('Helvetica')
        .fontSize(12)
        .text('___________________________________________', {
          align: 'center',
        });
      doc.text('Solicitante/Responsável pela Retirada', { align: 'center' });
      doc.moveDown(1.5);
      doc.text('___________________________________________', {
        align: 'center',
      });
      doc.text('Servidor Responsável pelo Desarquivamento', {
        align: 'center',
      });

      if (options?.footer?.linhas?.length) {
        doc.moveDown(1);
        doc.font('Helvetica').fontSize(10);
        options.footer.linhas.forEach(linha =>
          doc.text(linha, { align: 'center' }),
        );
      } else {
        const dataGeracao = new Date().toLocaleString('pt-BR');
        doc.moveDown(1);
        doc
          .font('Helvetica')
          .fontSize(10)
          .text(
            `Gerado em: ${dataGeracao} - Sistema de Gestão de Documentos / NUGECID`,
            {
              align: 'center',
            },
          );
      }

      doc.end();
    });
  }
}
