import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateRelevantDto {
  @ApiPropertyOptional({
    description: 'Título do vídeo',
    example: 'Atualização do Fato em Foco',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Descrição opcional do vídeo',
    example: 'Este vídeo foi atualizado com novos detalhes.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Chave do novo vídeo no R2 (ex: relevants/video/updated.mp4)',
    example: 'relevants/video/updated.mp4',
  })
  @IsOptional()
  @IsString()
  videoKey?: string;

  @ApiPropertyOptional({
    description: 'Chave da nova capa no R2 (ex: relevants/cover/updated.jpg)',
    example: 'relevants/cover/updated.jpg',
  })
  @IsOptional()
  @IsString()
  coverKey?: string;
}