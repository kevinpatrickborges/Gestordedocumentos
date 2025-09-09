"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const nugecid_service_1 = require("./nugecid.service");
const tipo_desarquivamento_vo_1 = require("./domain/value-objects/tipo-desarquivamento.vo");
const status_desarquivamento_vo_1 = require("./domain/value-objects/status-desarquivamento.vo");
const desarquivamento_typeorm_entity_1 = require("./infrastructure/entities/desarquivamento.typeorm-entity");
const user_entity_1 = require("../users/entities/user.entity");
const auditoria_entity_1 = require("../audit/entities/auditoria.entity");
jest.mock('fs');
jest.mock('xlsx');
describe('NugecidService', () => {
    let service;
    let desarquivamentoRepository;
    let userRepository;
    let auditoriaRepository;
    const mockAdminUser = {
        id: 1,
        nome: 'Admin User',
        usuario: 'admin',
        role: { id: 1, name: 'admin' },
        isAdmin: () => true,
        isEditor: () => false,
        canViewAllRecords: () => true,
    };
    const mockEditorUser = {
        id: 2,
        nome: 'Editor User',
        usuario: 'editor',
        role: { id: 2, name: 'editor' },
        isAdmin: () => false,
        isEditor: () => true,
        canViewAllRecords: () => false,
    };
    const mockDesarquivamento = {
        id: 1,
        numeroNicLaudoAuto: 'SGC20250001',
        tipoDesarquivamento: tipo_desarquivamento_vo_1.TipoDesarquivamentoEnum.FISICO,
        nomeCompleto: 'João Silva',
        numeroProcesso: '2024001',
        status: 'SOLICITADO',
        tipoDocumento: 'Laudo',
        dataSolicitacao: new Date(),
        setorDemandante: 'Delegacia',
        servidorResponsavel: 'Servidor Teste',
        finalidadeDesarquivamento: 'Processo judicial',
        solicitacaoProrrogacao: false,
        urgente: false,
        criadoPorId: mockEditorUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        criadoPor: Promise.resolve(mockEditorUser),
    };
    const mockDesarquivamentoRepository = {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        findAndCount: jest.fn(),
        count: jest.fn(),
        softDelete: jest.fn(),
        restore: jest.fn(),
        createQueryBuilder: jest.fn(() => ({
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            getManyAndCount: jest.fn(),
        })),
    };
    const mockUserRepository = {
        findOne: jest.fn(),
    };
    const mockAuditoriaRepository = {
        create: jest.fn(),
        save: jest.fn(),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                nugecid_service_1.NugecidService,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(desarquivamento_typeorm_entity_1.DesarquivamentoTypeOrmEntity),
                    useValue: mockDesarquivamentoRepository,
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(user_entity_1.User),
                    useValue: mockUserRepository,
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(auditoria_entity_1.Auditoria),
                    useValue: mockAuditoriaRepository,
                },
            ],
        }).compile();
        service = module.get(nugecid_service_1.NugecidService);
        desarquivamentoRepository = module.get((0, typeorm_1.getRepositoryToken)(desarquivamento_typeorm_entity_1.DesarquivamentoTypeOrmEntity));
        userRepository = module.get((0, typeorm_1.getRepositoryToken)(user_entity_1.User));
        auditoriaRepository = module.get((0, typeorm_1.getRepositoryToken)(auditoria_entity_1.Auditoria));
        jest.clearAllMocks();
    });
    describe('create', () => {
        const createDto = {
            tipoDesarquivamento: tipo_desarquivamento_vo_1.TipoDesarquivamentoEnum.FISICO,
            desarquivamentoFisicoDigital: tipo_desarquivamento_vo_1.TipoDesarquivamentoEnum.FISICO,
            nomeCompleto: 'João Silva',
            numeroNicLaudoAuto: 'NIC-2024001',
            numeroProcesso: '2024001-PROC',
            tipoDocumento: 'Laudo',
            dataSolicitacao: new Date().toISOString(),
            setorDemandante: 'Delegacia',
            servidorResponsavel: 'Servidor Teste',
            finalidadeDesarquivamento: 'Processo judicial',
            solicitacaoProrrogacao: false,
            urgente: false,
        };
        it('deve criar um desarquivamento com sucesso', async () => {
            const savedDesarquivamento = { ...mockDesarquivamento, ...createDto };
            mockDesarquivamentoRepository.create.mockReturnValue(savedDesarquivamento);
            mockDesarquivamentoRepository.save.mockResolvedValue(savedDesarquivamento);
            mockDesarquivamentoRepository.findOne.mockResolvedValue(savedDesarquivamento);
            mockAuditoriaRepository.create.mockReturnValue({});
            mockAuditoriaRepository.save.mockResolvedValue({});
            const result = await service.create(createDto, mockEditorUser);
            expect(mockDesarquivamentoRepository.create).toHaveBeenCalledWith({
                ...createDto,
                criadoPor: mockEditorUser,
                status: 'SOLICITADO',
            });
            expect(mockDesarquivamentoRepository.save).toHaveBeenCalled();
            expect(result).toEqual(savedDesarquivamento);
        });
        it('deve registrar auditoria ao criar', async () => {
            const savedDesarquivamento = { ...mockDesarquivamento, ...createDto };
            mockDesarquivamentoRepository.create.mockReturnValue(savedDesarquivamento);
            mockDesarquivamentoRepository.save.mockResolvedValue(savedDesarquivamento);
            mockDesarquivamentoRepository.findOne.mockResolvedValue(savedDesarquivamento);
            mockAuditoriaRepository.create.mockReturnValue({});
            mockAuditoriaRepository.save.mockResolvedValue({});
            await service.create(createDto, mockEditorUser);
            expect(mockAuditoriaRepository.save).toHaveBeenCalled();
        });
    });
    describe('findAll', () => {
        const queryDto = {
            page: 1,
            limit: 10,
        };
        it('admin deve ver todos os registros', async () => {
            const mockQueryBuilder = {
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                take: jest.fn().mockReturnThis(),
                getManyAndCount: jest
                    .fn()
                    .mockResolvedValue([[mockDesarquivamento], 1]),
            };
            mockDesarquivamentoRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
            const result = await service.findAll(queryDto);
            expect(mockQueryBuilder.andWhere).not.toHaveBeenCalledWith('desarquivamento.createdById = :userId', expect.any(Object));
            expect(result.desarquivamentos).toHaveLength(1);
            expect(result.total).toBe(1);
        });
        it('deve retornar todos os registros sem filtro de usuário', async () => {
            const mockQueryBuilder = {
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                take: jest.fn().mockReturnThis(),
                getManyAndCount: jest
                    .fn()
                    .mockResolvedValue([[mockDesarquivamento], 1]),
            };
            mockDesarquivamentoRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
            const result = await service.findAll(queryDto);
            expect(mockQueryBuilder.andWhere).not.toHaveBeenCalledWith('desarquivamento.createdById = :userId', expect.any(Object));
            expect(result.desarquivamentos).toHaveLength(1);
        });
        it('deve aplicar filtros de busca', async () => {
            const queryWithSearch = { ...queryDto, search: 'João' };
            const mockQueryBuilder = {
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                take: jest.fn().mockReturnThis(),
                getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
            };
            mockDesarquivamentoRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
            await service.findAll(queryWithSearch);
            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(expect.stringContaining('nomeSolicitante'), expect.objectContaining({ search: '%João%' }));
        });
    });
    describe('findOne', () => {
        it('deve retornar desarquivamento encontrado', async () => {
            const mockDesarquivamentoFound = {
                ...mockDesarquivamento,
                canBeAccessedBy: jest.fn().mockReturnValue(true),
            };
            mockDesarquivamentoRepository.findOne.mockResolvedValue(mockDesarquivamentoFound);
            const result = await service.findOne(1);
            expect(result).toEqual(mockDesarquivamentoFound);
            expect(mockDesarquivamentoRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['usuario', 'responsavel'],
            });
        });
        it('deve lançar NotFoundException se registro não existe', async () => {
            mockDesarquivamentoRepository.findOne.mockResolvedValue(null);
            await expect(service.findOne(999)).rejects.toThrow(common_1.NotFoundException);
        });
        it('deve retornar desarquivamento mesmo sem verificar acesso', async () => {
            const mockDesarquivamentoWithoutAccess = {
                ...mockDesarquivamento,
                canBeAccessedBy: jest.fn().mockReturnValue(false),
            };
            mockDesarquivamentoRepository.findOne.mockResolvedValue(mockDesarquivamentoWithoutAccess);
            const result = await service.findOne(1);
            expect(result).toEqual(mockDesarquivamentoWithoutAccess);
        });
    });
    describe('update', () => {
        const updateDto = {
            status: status_desarquivamento_vo_1.StatusDesarquivamentoEnum.FINALIZADO,
        };
        it('deve atualizar desarquivamento se usuário pode editar', async () => {
            const mockDesarquivamentoToUpdate = {
                ...mockDesarquivamento,
                canBeEditedBy: jest.fn().mockReturnValue(true),
            };
            mockDesarquivamentoRepository.findOne.mockResolvedValue(mockDesarquivamentoToUpdate);
            mockDesarquivamentoRepository.save.mockResolvedValue({
                ...mockDesarquivamentoToUpdate,
                ...updateDto,
            });
            mockAuditoriaRepository.create.mockReturnValue({});
            mockAuditoriaRepository.save.mockResolvedValue({});
            const result = await service.update(1, updateDto, mockEditorUser);
            expect(mockDesarquivamentoToUpdate.canBeEditedBy).toHaveBeenCalledWith(mockEditorUser);
            expect(mockDesarquivamentoRepository.save).toHaveBeenCalled();
            expect(result.status).toBe(status_desarquivamento_vo_1.StatusDesarquivamentoEnum.FINALIZADO);
        });
        it('deve lançar ForbiddenException se usuário não pode editar', async () => {
            const mockDesarquivamentoNoEdit = {
                ...mockDesarquivamento,
                canBeEditedBy: jest.fn().mockReturnValue(false),
            };
            mockDesarquivamentoRepository.findOne.mockResolvedValue(mockDesarquivamentoNoEdit);
            await expect(service.update(1, updateDto, mockEditorUser)).rejects.toThrow(common_1.ForbiddenException);
        });
    });
    describe('remove', () => {
        it('deve fazer soft delete se usuário pode deletar', async () => {
            const mockDesarquivamentoToDelete = {
                ...mockDesarquivamento,
                canBeDeletedBy: jest.fn().mockReturnValue(true),
            };
            mockDesarquivamentoRepository.findOne.mockResolvedValue(mockDesarquivamentoToDelete);
            mockDesarquivamentoRepository.softDelete.mockResolvedValue({
                affected: 1,
            });
            mockAuditoriaRepository.create.mockReturnValue({});
            mockAuditoriaRepository.save.mockResolvedValue({});
            await service.remove(1, mockEditorUser);
            expect(mockDesarquivamentoToDelete.canBeDeletedBy).toHaveBeenCalledWith(mockEditorUser);
            expect(mockDesarquivamentoRepository.softDelete).toHaveBeenCalledWith(1);
        });
        it('deve lançar ForbiddenException se usuário não pode deletar', async () => {
            const mockDesarquivamentoNoDelete = {
                ...mockDesarquivamento,
                canBeDeletedBy: jest.fn().mockReturnValue(false),
            };
            mockDesarquivamentoRepository.findOne.mockResolvedValue(mockDesarquivamentoNoDelete);
            await expect(service.remove(1, mockEditorUser)).rejects.toThrow(common_1.ForbiddenException);
        });
    });
    describe('findByBarcode', () => {
        it('deve encontrar desarquivamento por código de barras', async () => {
            const mockDesarquivamentoWithBarcode = {
                ...mockDesarquivamento,
                codigoBarras: 'DES202400001',
                canBeAccessedBy: jest.fn().mockReturnValue(true),
            };
            mockDesarquivamentoRepository.findOne.mockResolvedValue(mockDesarquivamentoWithBarcode);
            const result = await service.findByBarcode('DES202400001');
            expect(result).toEqual(mockDesarquivamentoWithBarcode);
            expect(mockDesarquivamentoRepository.findOne).toHaveBeenCalledWith({
                where: { codigoBarras: 'DES202400001' },
                relations: ['usuario', 'responsavel'],
            });
        });
    });
    describe('getDashboardStats', () => {
        it('deve retornar estatísticas do dashboard', async () => {
            const mockQueryBuilder = {
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                addSelect: jest.fn().mockReturnThis(),
                groupBy: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                take: jest.fn().mockReturnThis(),
                getCount: jest.fn().mockResolvedValue(5),
                getRawMany: jest.fn().mockResolvedValue([]),
                getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
            };
            mockDesarquivamentoRepository.count
                .mockResolvedValueOnce(100)
                .mockResolvedValueOnce(25)
                .mockResolvedValueOnce(30)
                .mockResolvedValueOnce(45);
            mockDesarquivamentoRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
            mockDesarquivamentoRepository.find.mockResolvedValue([]);
        });
    });
});
//# sourceMappingURL=nugecid.service.spec.js.map