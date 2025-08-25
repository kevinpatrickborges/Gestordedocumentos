// src/modules/registros/registros.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Registro } from './entities/registro.entity';
import { RegistrosController } from './registros.controller';
import { RegistrosService } from './registros.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Registro]), AuthModule],
  controllers: [RegistrosController],
  providers: [RegistrosService],
})
export class RegistrosModule {}
