"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestBed = void 0;
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("@nestjs/typeorm");
const user_entity_1 = require("../src/modules/users/entities/user.entity");
const role_entity_1 = require("../src/modules/users/entities/role.entity");
const desarquivamento_entity_1 = require("../src/modules/nugecid/entities/desarquivamento.entity");
const auditoria_entity_1 = require("../src/modules/audit/entities/auditoria.entity");
const user_factory_1 = require("./factories/user.factory");
const role_factory_1 = require("./factories/role.factory");
const desarquivamento_factory_1 = require("./factories/desarquivamento.factory");
class TestBed {
    constructor(module, app) {
        this._module = module;
        this._app = app;
    }
    static async init(imports = []) {
        const module = await testing_1.Test.createTestingModule({
            imports: [
                typeorm_1.TypeOrmModule.forRoot({
                    type: 'sqlite',
                    database: ':memory:',
                    entities: [user_entity_1.User, role_entity_1.Role, desarquivamento_entity_1.Desarquivamento, auditoria_entity_1.Auditoria],
                    synchronize: true,
                    logging: false,
                    dropSchema: true,
                    extra: {
                        pragma: 'PRAGMA foreign_keys = OFF;'
                    },
                }),
                typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, role_entity_1.Role, desarquivamento_entity_1.Desarquivamento, auditoria_entity_1.Auditoria]),
                jwt_1.JwtModule.register({
                    secret: 'test-secret-for-e2e',
                    signOptions: { expiresIn: '1h' },
                }),
                ...imports,
            ],
        }).compile();
        const app = module.createNestApplication();
        app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
        await app.init();
        return new TestBed(module, app);
    }
    getApp() {
        return this._app;
    }
    getService(service) {
        return this._module.get(service);
    }
    getRepository(entity) {
        return this._module.get((0, typeorm_2.getRepositoryToken)(entity));
    }
    async createAuthenticatedUser(roleName) {
        const roleRepository = this.getRepository(role_entity_1.Role);
        const userRepository = this.getRepository(user_entity_1.User);
        const jwtService = this.getService(jwt_1.JwtService);
        const roleData = role_factory_1.RoleFactory.build({ name: roleName });
        const role = await roleRepository.save(roleData);
        const userData = user_factory_1.UserFactory.build({ usuario: roleName, role: role });
        const user = userRepository.create(userData);
        await userRepository.save(user);
        return jwtService.sign({ sub: user.id, usuario: user.usuario, role: user.role.name });
    }
    async createDesarquivamento(createdBy, data = {}) {
        const desarquivamentoRepository = this.getRepository(desarquivamento_entity_1.Desarquivamento);
        const factoryData = desarquivamento_factory_1.DesarquivamentoFactory.build({ ...data, criadoPor: createdBy });
        const desarquivamento = desarquivamentoRepository.create(factoryData);
        return desarquivamentoRepository.save(desarquivamento);
    }
    async close() {
        await this._app.close();
    }
}
exports.TestBed = TestBed;
//# sourceMappingURL=test-bed.js.map