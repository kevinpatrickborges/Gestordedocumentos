// src/modules/nugecid/nugecid.service.simple.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NugecidService } from './nugecid.service';
import { Desarquivamento } from './entities/desarquivamento.entity';
import { User } from '../users/entities/user.entity';
import { Auditoria } from '../audit/entities/auditoria.entity';

describe('NugecidService - Simple Tests', () => {
  let service: NugecidService;
  let desarquivamentoRepository: Repository<Desarquivamento>;

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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NugecidService,
        {
          provide: getRepositoryToken(Desarquivamento),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Auditoria),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<NugecidService>(NugecidService);
    desarquivamentoRepository = module.get<Repository<Desarquivamento>>(
      getRepositoryToken(Desarquivamento),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have desarquivamentoRepository defined', () => {
    expect(desarquivamentoRepository).toBeDefined();
  });
});