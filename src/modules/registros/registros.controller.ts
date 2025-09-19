// src/modules/registros/registros.controller.ts
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RoleType } from '../users/enums/role-type.enum';

import { RegistrosService } from './registros.service';

@ApiTags('Registros')
@Controller('registros')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RegistrosController {
  constructor(private readonly registrosService: RegistrosService) {}

  @Post('import')
  @Roles(RoleType.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Importa registros de uma planilha XLSX.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Arquivo XLSX contendo os registros a serem importados.',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Relatório da importação.' })
  @ApiResponse({
    status: 400,
    description: 'Arquivo inválido ou erro de validação.',
  })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  async importRegistros(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5 MB
          new FileTypeValidator({
            fileType:
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    try {
      const result = await this.registrosService.importFromXlsx(file);
      return result;
    } catch (error) {
      throw new HttpException(
        `Falha ao processar o arquivo: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
