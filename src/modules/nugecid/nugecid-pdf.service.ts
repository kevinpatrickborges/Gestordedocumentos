
import { Injectable, Logger } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';

import { DesarquivamentoTypeOrmEntity } from './infrastructure/entities/desarquivamento.typeorm-entity';

@Injectable()
export class NugecidPdfService {
  private readonly logger = new Logger(NugecidPdfService.name);

  async generatePdf(desarquivamento: DesarquivamentoTypeOrmEntity): Promise<Buffer> {
    try {
      this.logger.log(
        `Iniciando geração de PDF para o desarquivamento ID: ${desarquivamento.id}`,
      );
      this.logger.debug(
        'Dados do desarquivamento para o PDF:',
        JSON.stringify(desarquivamento, null, 2),
      );

      const criadoPor = await desarquivamento.criadoPor;
      const responsavel = desarquivamento.responsavel ? await desarquivamento.responsavel : null;

      return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 72, right: 72 },
          bufferPages: true,
        });

        doc
          .font('Helvetica')
          .fontSize(12)
          .text('GOVERNO DO ESTADO DO RIO GRANDE DO NORTE', {
            align: 'center',
          });
        doc.text(
          'SECRETARIA DE ESTADO DA SEGURANÇA PÚBLICA E DA DEFESA SOCIAL',
          { align: 'center' },
        );
        doc.text('INSTITUTO TÉCNICO-CIENTÍFICO DE PERÍCIA - ITEP/RN', {
          align: 'center',
        });
        doc.moveDown(2);

        doc
          .font('Helvetica-Bold')
          .fontSize(16)
          .text('TERMO DE DESARQUIVAMENTO', { align: 'center' });
        doc.moveDown(2);

        const dataSolicitacao = new Date(
          desarquivamento.dataSolicitacao || desarquivamento.createdAt,
        ).toLocaleDateString('pt-BR');
        const texto = `Pelo presente termo, certifico que, para fins de ${desarquivamento.finalidadeDesarquivamento || 'não especificado'}, foi desarquivado o procedimento referente a(o) ${desarquivamento.tipoDocumento || 'documento'} de número ${desarquivamento.numeroNicLaudoAuto}, que tem como solicitante ${desarquivamento.nomeCompleto}. A solicitação foi realizada em ${dataSolicitacao}.`;
        doc.font('Helvetica').fontSize(12).text(texto, { align: 'justify' });
        doc.moveDown(2);

        doc.font('Helvetica-Bold').fontSize(12).text('DETALHES DA SOLICITAÇÃO');
        doc.moveDown();
        doc.font('Helvetica').fontSize(12);
        doc.text(`- Número NIC/Laudo/Auto: ${desarquivamento.numeroNicLaudoAuto}`);
        doc.text(`- Número do Processo: ${desarquivamento.numeroProcesso}`);
        doc.text(`- Solicitante: ${criadoPor?.nome || 'Não informado'}`);
        doc.text(
          `- Data da Solicitação: ${new Date(desarquivamento.dataSolicitacao || desarquivamento.createdAt).toLocaleString('pt-BR')}`,
        );
        if (desarquivamento.dataDesarquivamentoSAG) {
          doc.text(
            `- Data do Desarquivamento SAG: ${new Date(desarquivamento.dataDesarquivamentoSAG).toLocaleDateString('pt-BR')}`,
          );
        }
        doc.moveDown(3);

        doc
          .font('Helvetica')
          .fontSize(12)
          .text('___________________________________________', {
            align: 'center',
          });
        doc.text(
          responsavel
            ? responsavel.nome
            : 'Responsável não atribuído',
          { align: 'center' },
        );
        doc.text('Responsável pelo Desarquivamento', { align: 'center' });
        doc.moveDown(2);

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
}
