import { INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../src/modules/users/entities/user.entity';
import { Desarquivamento } from '../src/modules/nugecid/entities/desarquivamento.entity';
export declare class TestBed {
    private _module;
    private _app;
    private constructor();
    static init(imports?: any[]): Promise<TestBed>;
    getApp(): INestApplication;
    getService<T>(service: new (...args: any[]) => T): T;
    getRepository<T>(entity: new (...args: any[]) => T): Repository<T>;
    createAuthenticatedUser(roleName: 'admin' | 'editor' | 'user'): Promise<string>;
    createDesarquivamento(createdBy: User, data?: Partial<Desarquivamento>): Promise<Desarquivamento>;
    close(): Promise<void>;
}
