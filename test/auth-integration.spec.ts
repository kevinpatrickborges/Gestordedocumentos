import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';

import { AppModule } from '../src/app.module';
import { User } from '../src/modules/users/entities/user.entity';
import { Role } from '../src/modules/users/entities/role.entity';
import { Auditoria } from '../src/modules/audit/entities/auditoria.entity';

describe('Authentication Integration Tests', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const mockUser = {
    id: 1,
    nome: 'Test User',
    usuario: 'testuser',
    senha: 'hashedPassword',
    ativo: true,
    role: {
      id: 1,
      name: 'user',
    },
    validatePassword: jest.fn().mockResolvedValue(true),
    isBlocked: jest.fn().mockReturnValue(false),
    isAdmin: jest.fn().mockReturnValue(false),
    tentativasLogin: 0,
    ultimoLogin: new Date(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockRoleRepository = {
    findOne: jest.fn(),
    find: jest.fn().mockResolvedValue([]),
  };

  const mockAuditoriaRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue(mockUserRepository)
      .overrideProvider(getRepositoryToken(Role))
      .useValue(mockRoleRepository)
      .overrideProvider(getRepositoryToken(Auditoria))
      .useValue(mockAuditoriaRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    jwtService = moduleFixture.get<JwtService>(JwtService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v2/auth/login', () => {
    it('should login successfully and return JWT with 50m expiration', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockAuditoriaRepository.create.mockReturnValue({});
      mockAuditoriaRepository.save.mockResolvedValue({});

      const loginDto = {
        usuario: 'testuser',
        password: 'password123',
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/v2/auth/login')
        .send(loginDto)
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        user: {
          userId: 1,
          usuario: 'testuser',
          role: 'user',
        },
        accessToken: expect.any(String),
        expiresIn: '50m',
      });
    });

    it('should return 401 for invalid credentials', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);
      mockAuditoriaRepository.create.mockReturnValue({});
      mockAuditoriaRepository.save.mockResolvedValue({});

      const loginDto = {
        usuario: 'invaliduser',
        password: 'wrongpassword',
      };

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/api/v2/auth/login')
        .send(loginDto)
        .expect(401);

      expect(response.body.message).toBe('Credenciais inválidas');
    });

    it('should return 400 for invalid request body', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .post('/api/v2/auth/login')
        .send({})
        .expect(400);
    });
  });

  describe('Global JWT Protection', () => {
    it('should allow access to public login endpoint without token', async () => {
      // Act & Assert
      await request(app.getHttpServer()).get('/auth/login').expect(200);
    });

    it('should allow access to public API v2 login endpoint without token', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockAuditoriaRepository.create.mockReturnValue({});
      mockAuditoriaRepository.save.mockResolvedValue({});

      const loginDto = {
        usuario: 'testuser',
        password: 'password123',
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/api/v2/auth/login')
        .send(loginDto)
        .expect(200);
    });

    it('should deny access to protected routes without token', async () => {
      // Act & Assert
      await request(app.getHttpServer()).get('/auth/profile').expect(401);

      await request(app.getHttpServer()).get('/auth/check').expect(401);
    });

    it('should allow access to protected routes with valid token', async () => {
      // Arrange
      const payload = {
        sub: 1,
        usuario: 'testuser',
        role: 'user',
      };
      const token = jwtService.sign(payload);

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Act & Assert
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('should deny access to protected routes with invalid token', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should deny access to protected routes with expired token', async () => {
      // Arrange
      const payload = {
        sub: 1,
        usuario: 'testuser',
        role: 'user',
      };
      const expiredToken = jwtService.sign(payload, { expiresIn: '-1h' });

      // Act & Assert
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });
  });

  describe('JWT Token Validation', () => {
    it('should validate JWT token structure from API v2 login', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockAuditoriaRepository.create.mockReturnValue({});
      mockAuditoriaRepository.save.mockResolvedValue({});

      const loginDto = {
        usuario: 'testuser',
        password: 'password123',
      };

      // Act
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v2/auth/login')
        .send(loginDto)
        .expect(200);

      const { accessToken } = loginResponse.body;
      const decodedToken = jwtService.decode(accessToken) as any;

      // Assert
      expect(decodedToken).toMatchObject({
        sub: 1,
        usuario: 'testuser',
        role: 'user',
        iat: expect.any(Number),
        exp: expect.any(Number),
      });

      // Verify token expires in approximately 50 minutes (3000 seconds)
      const tokenLifetime = decodedToken.exp - decodedToken.iat;
      expect(tokenLifetime).toBeCloseTo(3000, -2); // Allow 100 seconds tolerance
    });
  });
});
