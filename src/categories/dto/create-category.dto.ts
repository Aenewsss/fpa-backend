import { IsString, IsOptional, IsBoolean, IsInt, IsUrl, IsBooleanString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
    @ApiProperty({ description: 'Nome da categoria' })
    @IsString()
    name: string;

    @ApiProperty({ description: 'Slug da categoria (único)' })
    @IsString()
    slug: string;

    @ApiProperty({ description: 'Descrição opcional da categoria', required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ description: 'ID da categoria pai, se houver', required: false })
    @IsOptional()
    @IsString()
    parentId?: string;

    // @ApiProperty({ description: 'URL do ícone da categoria', required: false })
    // @IsOptional()
    // @IsUrl()
    // iconUrl?: string;

    @ApiProperty({ description: 'Ordem de exibição da categoria', required: false, default: 0 })
    @IsOptional()
    @IsInt()
    order?: number;

    @ApiProperty({ description: 'Determina se a categoria está visível', required: false, default: true })
    @IsOptional()
    @IsBoolean()
    isVisible?: boolean;

    @ApiProperty()
    @IsString()
    color: string;

    @ApiProperty({ description: 'Determina se a categoria será destaque na home', required: false, default: false })
    @IsOptional()
    @IsBooleanString()
    isFeatured?: any;

    @ApiProperty()
    @IsOptional()
    thumbnailUrl?: string
}