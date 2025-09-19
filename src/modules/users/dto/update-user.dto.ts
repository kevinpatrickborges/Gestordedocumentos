import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  nome?: string;

  @ApiProperty({
    description: 'Nome de usuário',
    example: 'joao.silva',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Usuário deve ser uma string' })
  @MinLength(3, { message: 'Usuário deve ter pelo menos 3 caracteres' })
  @MaxLength(50, { message: 'Usuário deve ter no máximo 50 caracteres' })
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message:
      'Usuário deve conter apenas letras, números, pontos, hífens e underscores',
  })
  usuario?: string;

  @ApiProperty({
    description: 'Nova senha do usuário',
    example: 'novaSenha123',
    minLength: 6,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Senha deve ser uma string' })
  senha?: string;

  @ApiProperty({
    description: 'Role do usuário',
    example: 'admin',
    enum: ['admin', 'coordenador', 'usuario'],
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Role deve ser uma string' })
  role?: string;

  @ApiProperty({
    description: 'Se o usuário está ativo',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Ativo deve ser um valor booleano' })
  ativo?: boolean;
}
