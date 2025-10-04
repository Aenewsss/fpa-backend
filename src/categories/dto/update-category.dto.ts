import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Tecnologia' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Notícias e artigos sobre inovação e tecnologia' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'tecnologia' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({ example: '#FF5733' })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Optional image file for category',
  })
  @IsOptional()
  file?: Express.Multer.File;
}