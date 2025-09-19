import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { ProjetosModule } from '../projetos/projetos.module';
import {
  Tarefa,
  Comentario,
  HistoricoTarefa,
} from './entities';
import { Projeto, MembroProjeto, Coluna } from '../projetos/entities';
import {
  ProjetosService,
  TarefasService,
  ComentariosService,
} from './services';
import {
  ProjetosController,
  TarefasController,
  ComentariosController,
} from './controllers';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tarefa,
      Comentario,
      HistoricoTarefa,
      Projeto,
      MembroProjeto,
      Coluna,
    ]),
    UsersModule,
    forwardRef(() => ProjetosModule),
  ],

  controllers: [
    ProjetosController,
    TarefasController,
    ComentariosController,
  ],
  providers: [
    ProjetosService,
    TarefasService,
    ComentariosService,
  ],
  exports: [
    ProjetosService,
    TarefasService,
    ComentariosService,
  ],
})
export class TarefasModule {}
