"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrosModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const registro_entity_1 = require("./entities/registro.entity");
const registros_controller_1 = require("./registros.controller");
const registros_service_1 = require("./registros.service");
const auth_module_1 = require("../auth/auth.module");
let RegistrosModule = class RegistrosModule {
};
exports.RegistrosModule = RegistrosModule;
exports.RegistrosModule = RegistrosModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([registro_entity_1.Registro]),
            auth_module_1.AuthModule,
        ],
        controllers: [registros_controller_1.RegistrosController],
        providers: [registros_service_1.RegistrosService],
    })
], RegistrosModule);
//# sourceMappingURL=registros.module.js.map