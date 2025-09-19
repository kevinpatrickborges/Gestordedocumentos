import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstatisticasController } from './estatisticas.controller';
import { EstatisticasService } from './estatisticas.service';
// import { Atendimento } from '../nugecid/entities/atendimento.entity';
import { DesarquivamentoTypeOrmEntity } from '../nugecid/infrastructure/entities/desarquivamento.typeorm-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([/* Atendimento, */ DesarquivamentoTypeOrmEntity]),
  ],
  controllers: [EstatisticasController],
  providers: [EstatisticasService],
})
export class EstatisticasModule {}
