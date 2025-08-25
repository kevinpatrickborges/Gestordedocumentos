"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var RegistrosService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrosService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const class_validator_1 = require("class-validator");
const XLSX = require("xlsx");
const registro_entity_1 = require("./entities/registro.entity");
const import_registro_dto_1 = require("./dto/import-registro.dto");
let RegistrosService = RegistrosService_1 = class RegistrosService {
    constructor(registroRepository) {
        this.registroRepository = registroRepository;
        this.logger = new common_1.Logger(RegistrosService_1.name);
    }
    async importFromXlsx(file) {
        const workbook = XLSX.read(file.buffer, {
            type: 'buffer',
            cellDates: true,
        });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);
        const totalRows = data.length;
        let successCount = 0;
        const errors = [];
        for (let i = 0; i < totalRows; i++) {
            const row = data[i];
            const registroDto = new import_registro_dto_1.ImportRegistroDto();
            registroDto.numero_processo = row['numero_processo'];
            registroDto.delegacia_origem = row['delegacia_origem'];
            registroDto.nome_vitima = row['nome_vitima'];
            registroDto.data_fato = new Date(row['data_fato']);
            registroDto.investigador_responsavel = row['investigador_responsavel'];
            registroDto.idade_vitima = row['idade_vitima'];
            const validationErrors = await (0, class_validator_1.validate)(registroDto);
            if (validationErrors.length > 0) {
                errors.push({
                    row: i + 2,
                    data: row,
                    errors: validationErrors.map(err => ({
                        property: err.property,
                        constraints: err.constraints,
                    })),
                });
            }
            else {
                try {
                    const newRegistro = this.registroRepository.create(registroDto);
                    await this.registroRepository.save(newRegistro);
                    successCount++;
                }
                catch (dbError) {
                    this.logger.error(`Erro ao salvar no banco de dados na linha ${i + 2}:`, dbError);
                    errors.push({
                        row: i + 2,
                        data: row,
                        errors: [
                            {
                                property: 'database',
                                constraints: {
                                    save: 'Falha ao inserir o registro no banco de dados.',
                                },
                            },
                        ],
                    });
                }
            }
        }
        if (errors.length > 0) {
            this.logger.warn(`${errors.length} linhas continham erros e não foram importadas.`);
        }
        return {
            totalRows,
            successCount,
            errorCount: errors.length,
            errors,
        };
    }
};
exports.RegistrosService = RegistrosService;
exports.RegistrosService = RegistrosService = RegistrosService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(registro_entity_1.Registro)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RegistrosService);
//# sourceMappingURL=registros.service.js.map