import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstatisticasController } from './estatisticas.controller';
import { EstatisticasService } from './estatisticas.service';
// import { Atendimento } from '../nugecid/entities/atendimento.entity';
import { Desarquivamento } from '../nugecid/entities/desarquivamento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([/* Atendimento, */ Desarquivamento])],
  controllers: [EstatisticasController],
  providers: [EstatisticasService],
})
export class EstatisticasModule {}
