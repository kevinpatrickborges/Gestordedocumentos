"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DesarquivamentoRepositoryModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const desarquivamento_typeorm_entity_1 = require("./entities/desarquivamento.typeorm-entity");
const desarquivamento_typeorm_repository_1 = require("./repositories/desarquivamento.typeorm-repository");
const desarquivamento_mapper_1 = require("./mappers/desarquivamento.mapper");
const nugecid_constants_1 = require("../domain/nugecid.constants");
let DesarquivamentoRepositoryModule = class DesarquivamentoRepositoryModule {
};
exports.DesarquivamentoRepositoryModule = DesarquivamentoRepositoryModule;
exports.DesarquivamentoRepositoryModule = DesarquivamentoRepositoryModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([desarquivamento_typeorm_entity_1.DesarquivamentoTypeOrmEntity])],
        providers: [
            desarquivamento_mapper_1.DesarquivamentoMapper,
            {
                provide: nugecid_constants_1.DESARQUIVAMENTO_REPOSITORY_TOKEN,
                useClass: desarquivamento_typeorm_repository_1.DesarquivamentoTypeOrmRepository,
            },
        ],
        exports: [nugecid_constants_1.DESARQUIVAMENTO_REPOSITORY_TOKEN, desarquivamento_mapper_1.DesarquivamentoMapper],
    })
], DesarquivamentoRepositoryModule);
//# sourceMappingURL=desarquivamento-repository.module.js.map