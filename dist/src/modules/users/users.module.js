"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const users_controller_1 = require("./users.controller");
const users_service_1 = require("./users.service");
const user_entity_1 = require("./entities/user.entity");
const role_entity_1 = require("./entities/role.entity");
const auditoria_entity_1 = require("../audit/entities/auditoria.entity");
const use_cases_1 = require("./application/use-cases");
const repositories_1 = require("./infrastructure/repositories");
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, role_entity_1.Role, auditoria_entity_1.Auditoria])],
        controllers: [users_controller_1.UsersController],
        providers: [
            users_service_1.UsersService,
            {
                provide: 'IUserRepository',
                useClass: repositories_1.TypeOrmUserRepository,
            },
            {
                provide: 'IRoleRepository',
                useClass: repositories_1.TypeOrmRoleRepository,
            },
            use_cases_1.CreateUserUseCase,
            use_cases_1.UpdateUserUseCase,
            use_cases_1.DeleteUserUseCase,
            use_cases_1.GetUserByIdUseCase,
            use_cases_1.GetUsersUseCase,
            use_cases_1.RestoreUserUseCase,
            use_cases_1.GetUserStatisticsUseCase,
            use_cases_1.GetRolesUseCase,
        ],
        exports: [
            users_service_1.UsersService,
            typeorm_1.TypeOrmModule,
            use_cases_1.CreateUserUseCase,
            use_cases_1.UpdateUserUseCase,
            use_cases_1.DeleteUserUseCase,
            use_cases_1.GetUserByIdUseCase,
            use_cases_1.GetUsersUseCase,
            use_cases_1.RestoreUserUseCase,
            use_cases_1.GetUserStatisticsUseCase,
            use_cases_1.GetRolesUseCase,
        ],
    })
], UsersModule);
//# sourceMappingURL=users.module.js.map