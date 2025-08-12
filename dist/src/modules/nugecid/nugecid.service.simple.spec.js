"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const nugecid_service_1 = require("./nugecid.service");
const desarquivamento_entity_1 = require("./entities/desarquivamento.entity");
const user_entity_1 = require("../users/entities/user.entity");
const auditoria_entity_1 = require("../audit/entities/auditoria.entity");
describe('NugecidService - Simple Tests', () => {
    let service;
    let desarquivamentoRepository;
    const mockRepository = {
        find: jest.fn(),
        findOne: jest.fn(),
        save: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        createQueryBuilder: jest.fn(() => ({
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            getManyAndCount: jest.fn(),
            getOne: jest.fn(),
        })),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                nugecid_service_1.NugecidService,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(desarquivamento_entity_1.Desarquivamento),
                    useValue: mockRepository,
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(user_entity_1.User),
                    useValue: mockRepository,
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(auditoria_entity_1.Auditoria),
                    useValue: mockRepository,
                },
            ],
        }).compile();
        service = module.get(nugecid_service_1.NugecidService);
        desarquivamentoRepository = module.get((0, typeorm_1.getRepositoryToken)(desarquivamento_entity_1.Desarquivamento));
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    it('should have desarquivamentoRepository defined', () => {
        expect(desarquivamentoRepository).toBeDefined();
    });
});
//# sourceMappingURL=nugecid.service.simple.spec.js.map