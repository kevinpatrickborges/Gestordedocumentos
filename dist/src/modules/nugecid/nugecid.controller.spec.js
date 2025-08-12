"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const nugecid_controller_1 = require("./nugecid.controller");
const use_cases_1 = require("./application/use-cases");
const desarquivamento_entity_1 = require("./entities/desarquivamento.entity");
const role_type_enum_1 = require("../users/enums/role-type.enum");
const tipo_solicitacao_vo_1 = require("./domain/value-objects/tipo-solicitacao.vo");
describe('NugecidController', () => {
    let controller;
    let createDesarquivamentoUseCase;
    let findAllDesarquivamentosUseCase;
    let findDesarquivamentoByIdUseCase;
    let updateDesarquivamentoUseCase;
    let deleteDesarquivamentoUseCase;
    let importDesarquivamentoUseCase;
    const mockAdminRole = {
        id: 1,
        name: role_type_enum_1.RoleType.ADMIN,
        description: 'Administrator',
        permissions: [],
        ativo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        users: [],
        hasPermission: jest.fn().mockReturnValue(true),
        isAdmin: jest.fn().mockReturnValue(true),
        isEditor: jest.fn().mockReturnValue(false),
    };
    const mockEditorRole = {
        id: 2,
        name: role_type_enum_1.RoleType.COORDENADOR,
        description: 'Coordinator',
        permissions: [],
        ativo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        users: [],
        hasPermission: jest.fn().mockReturnValue(true),
        isAdmin: jest.fn().mockReturnValue(false),
        isEditor: jest.fn().mockReturnValue(true),
    };
    const mockAdminUser = {
        id: 1,
        nome: 'Admin User',
        usuario: 'admin',
        role: mockAdminRole,
        roleId: 1,
        senha: 'hashedpassword',
        ativo: true,
        ultimoLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        tentativasLogin: 0,
        bloqueadoAte: null,
        tokenReset: null,
        tokenResetExpira: null,
        desarquivamentos: [],
        auditorias: [],
        validatePassword: jest.fn().mockResolvedValue(true),
        isAdmin: jest.fn().mockReturnValue(true),
        isEditor: jest.fn().mockReturnValue(false),
        canManageUser: jest.fn().mockReturnValue(true),
        canViewAllRecords: jest.fn().mockReturnValue(true),
        isBlocked: jest.fn().mockReturnValue(false),
        toJSON: jest.fn(),
        serialize: jest.fn(),
        hashPassword: jest.fn(),
    };
    const mockEditorUser = {
        id: 2,
        nome: 'Editor User',
        usuario: 'editor',
        role: mockEditorRole,
        roleId: 2,
        senha: 'hashedpassword',
        ativo: true,
        ultimoLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        tentativasLogin: 0,
        bloqueadoAte: null,
        tokenReset: null,
        tokenResetExpira: null,
        desarquivamentos: [],
        auditorias: [],
        validatePassword: jest.fn().mockResolvedValue(true),
        isAdmin: jest.fn().mockReturnValue(false),
        isEditor: jest.fn().mockReturnValue(true),
        canManageUser: jest.fn().mockReturnValue(true),
        canViewAllRecords: jest.fn().mockReturnValue(false),
        isBlocked: jest.fn().mockReturnValue(false),
        toJSON: jest.fn(),
        serialize: jest.fn(),
        hashPassword: jest.fn(),
    };
    const mockDesarquivamento = {
        id: 1,
        tipoSolicitacao: tipo_solicitacao_vo_1.TipoSolicitacaoEnum.DESARQUIVAMENTO,
        status: desarquivamento_entity_1.StatusDesarquivamento.PENDENTE,
        codigoBarras: 'DES202400001',
        urgente: false,
        createdBy: mockEditorUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        nomeSolicitante: 'João Silva',
        numeroRegistro: '12345',
    };
    const mockPaginatedResult = {
        data: [mockDesarquivamento],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
    };
    const mockCreateDesarquivamentoUseCase = { execute: jest.fn() };
    const mockFindAllDesarquivamentosUseCase = { execute: jest.fn() };
    const mockFindDesarquivamentoByIdUseCase = { execute: jest.fn() };
    const mockUpdateDesarquivamentoUseCase = { execute: jest.fn() };
    const mockDeleteDesarquivamentoUseCase = { execute: jest.fn() };
    const mockGenerateTermoEntregaUseCase = { execute: jest.fn() };
    const mockGetDashboardStatsUseCase = { execute: jest.fn() };
    const mockImportDesarquivamentoUseCase = { execute: jest.fn() };
    const mockImportRegistrosUseCase = { execute: jest.fn() };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [nugecid_controller_1.NugecidController],
            providers: [
                {
                    provide: use_cases_1.CreateDesarquivamentoUseCase,
                    useValue: mockCreateDesarquivamentoUseCase,
                },
                {
                    provide: use_cases_1.FindAllDesarquivamentosUseCase,
                    useValue: mockFindAllDesarquivamentosUseCase,
                },
                {
                    provide: use_cases_1.FindDesarquivamentoByIdUseCase,
                    useValue: mockFindDesarquivamentoByIdUseCase,
                },
                {
                    provide: use_cases_1.UpdateDesarquivamentoUseCase,
                    useValue: mockUpdateDesarquivamentoUseCase,
                },
                {
                    provide: use_cases_1.DeleteDesarquivamentoUseCase,
                    useValue: mockDeleteDesarquivamentoUseCase,
                },
                {
                    provide: use_cases_1.GenerateTermoEntregaUseCase,
                    useValue: mockGenerateTermoEntregaUseCase,
                },
                {
                    provide: use_cases_1.GetDashboardStatsUseCase,
                    useValue: mockGetDashboardStatsUseCase,
                },
                {
                    provide: use_cases_1.ImportDesarquivamentoUseCase,
                    useValue: mockImportDesarquivamentoUseCase,
                },
                {
                    provide: use_cases_1.ImportRegistrosUseCase,
                    useValue: mockImportRegistrosUseCase,
                },
            ],
        }).compile();
        controller = module.get(nugecid_controller_1.NugecidController);
        createDesarquivamentoUseCase = module.get(use_cases_1.CreateDesarquivamentoUseCase);
        findAllDesarquivamentosUseCase = module.get(use_cases_1.FindAllDesarquivamentosUseCase);
        findDesarquivamentoByIdUseCase = module.get(use_cases_1.FindDesarquivamentoByIdUseCase);
        updateDesarquivamentoUseCase = module.get(use_cases_1.UpdateDesarquivamentoUseCase);
        deleteDesarquivamentoUseCase = module.get(use_cases_1.DeleteDesarquivamentoUseCase);
        importDesarquivamentoUseCase = module.get(use_cases_1.ImportDesarquivamentoUseCase);
        jest.clearAllMocks();
    });
    describe('create', () => {
        const createDto = {
            tipoSolicitacao: tipo_solicitacao_vo_1.TipoSolicitacaoEnum.DESARQUIVAMENTO,
            nomeSolicitante: 'João Silva',
            numeroRegistro: '12345',
        };
        it('should create a new desarquivamento successfully', async () => {
            mockCreateDesarquivamentoUseCase.execute.mockResolvedValue(mockDesarquivamento);
            const mockReq = {
                headers: { accept: 'application/json' },
            };
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                redirect: jest.fn(),
            };
            await controller.create(createDto, mockEditorUser, mockReq, mockRes);
            expect(createDesarquivamentoUseCase.execute).toHaveBeenCalledWith({
                ...createDto,
                urgente: false,
                criadoPorId: mockEditorUser.id,
            });
            expect(mockRes.status).toHaveBeenCalledWith(common_1.HttpStatus.CREATED);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Desarquivamento criado com sucesso',
                data: mockDesarquivamento,
            });
        });
    });
    describe('findAll', () => {
        const queryDto = { page: 1, limit: 10 };
        it('should return a paginated list of desarquivamentos', async () => {
            mockFindAllDesarquivamentosUseCase.execute.mockResolvedValue(mockPaginatedResult);
            const mockReq = {
                headers: { accept: 'application/json' },
            };
            const mockRes = {
                json: jest.fn(),
                render: jest.fn(),
            };
            await controller.findAll(queryDto, mockAdminUser, mockReq, mockRes);
            expect(findAllDesarquivamentosUseCase.execute).toHaveBeenCalledWith({
                ...queryDto,
                userId: mockAdminUser.id,
                userRoles: [mockAdminUser.role.name],
            });
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockPaginatedResult,
                meta: {
                    page: mockPaginatedResult.page,
                    limit: mockPaginatedResult.limit,
                    total: mockPaginatedResult.total,
                    totalPages: mockPaginatedResult.totalPages,
                },
            });
        });
    });
    describe('findOne', () => {
        it('should return a single desarquivamento by ID', async () => {
            mockFindDesarquivamentoByIdUseCase.execute.mockResolvedValue(mockDesarquivamento);
            const mockReq = {
                headers: { accept: 'application/json' },
            };
            const mockRes = {
                json: jest.fn(),
                render: jest.fn(),
            };
            await controller.findOne(1, mockEditorUser, mockReq, mockRes);
            expect(findDesarquivamentoByIdUseCase.execute).toHaveBeenCalledWith({
                id: 1,
                userId: mockEditorUser.id,
                userRoles: [mockEditorUser.role.name],
            });
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockDesarquivamento,
            });
        });
    });
    describe('update', () => {
        const updateDto = {
            status: desarquivamento_entity_1.StatusDesarquivamento.EM_ANDAMENTO,
        };
        it('should update a desarquivamento successfully', async () => {
            const updatedDesarquivamento = { ...mockDesarquivamento, ...updateDto };
            mockUpdateDesarquivamentoUseCase.execute.mockResolvedValue(updatedDesarquivamento);
            const mockReq = {
                headers: { accept: 'application/json' },
            };
            const mockRes = {
                json: jest.fn(),
                redirect: jest.fn(),
            };
            await controller.update(1, updateDto, mockEditorUser, mockReq, mockRes);
            expect(updateDesarquivamentoUseCase.execute).toHaveBeenCalledWith({
                id: 1,
                ...updateDto,
                userId: mockEditorUser.id,
                userRoles: [mockEditorUser.role.name],
            });
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Desarquivamento atualizado com sucesso',
                data: updatedDesarquivamento,
            });
        });
    });
    describe('remove', () => {
        it('should remove a desarquivamento successfully', async () => {
            mockDeleteDesarquivamentoUseCase.execute.mockResolvedValue(undefined);
            const mockReq = {
                headers: { accept: 'application/json' },
            };
            const mockRes = {
                json: jest.fn(),
                redirect: jest.fn(),
            };
            await controller.remove(1, mockAdminUser, mockReq, mockRes);
            expect(deleteDesarquivamentoUseCase.execute).toHaveBeenCalledWith({
                id: 1,
                userId: mockAdminUser.id,
                userRoles: [mockAdminUser.role.name],
                permanent: false,
            });
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Desarquivamento removido com sucesso',
            });
        });
    });
    describe('importDesarquivamentos', () => {
        const mockFile = {
            buffer: Buffer.from('mock file content'),
        };
        const mockImportResult = {
            totalRows: 10,
            successCount: 8,
            errorCount: 2,
            errors: [
                { row: 5, details: 'Erro na linha 5' },
                { row: 7, details: 'Erro na linha 7' },
            ],
        };
        it('should import data from a file successfully', async () => {
            mockImportDesarquivamentoUseCase.execute.mockResolvedValue(mockImportResult);
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            await controller.importDesarquivamentos(mockFile, mockAdminUser, mockRes);
            expect(importDesarquivamentoUseCase.execute).toHaveBeenCalledWith(mockFile.buffer, mockAdminUser.id);
            expect(mockRes.status).toHaveBeenCalledWith(common_1.HttpStatus.OK);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                data: expect.objectContaining(mockImportResult),
            }));
        });
        it('should throw BadRequestException if no file is provided', async () => {
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            await expect(controller.importDesarquivamentos(null, mockAdminUser, mockRes)).rejects.toThrow(common_1.BadRequestException);
        });
    });
});
//# sourceMappingURL=nugecid.controller.spec.js.map