import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsUrl, IsUUID, IsArray, ArrayNotEmpty, IsInt, Min, IsEmpty } from 'class-validator';
import { PostStatus } from '@prisma/client';
import { Transform } from 'class-transformer';

export class CreatePostDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    postTitle: string;

    @ApiProperty({ type: 'object', description: 'Conteúdo do post em JSON (Tiptap)', additionalProperties: true })
    @IsNotEmpty()
    postContent: string;


    @ApiProperty()
    @IsUUID()
    @IsOptional()
    postAuthorId?: string;

    @ApiProperty({ enum: PostStatus })
    @IsEnum(PostStatus)
    postStatus: PostStatus;

    @ApiPropertyOptional()
    @IsUUID()
    @IsOptional()
    @Transform(({ value }) => (value === '' ? undefined : value))
    postParentId?: string;

    @ApiProperty()
    @IsUUID()
    postCategoryId: string;

    @ApiProperty({ type: [String], description: 'IDs das tags relacionadas' })
    @IsArray()
    @IsOptional()
    @IsUUID('all', { each: true })
    @Transform(({ value }) => typeof value === 'string' ? value.split(',').map(v => v.trim()) : value)
    relatedTags?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsUrl()
    thumbnailUrl?: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    slug: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    summary?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true')
    isFeatured?: boolean = false;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    @Min(0)
    @Transform(({ value }) => parseInt(value))
    viewCount?: number = 0;

    @IsArray()
    @IsOptional()
    @IsUUID('all', { each: true })
    @ApiProperty({ type: [String], description: 'IDs das tags relacionadas' })
    @Transform(({ value }) => typeof value === 'string' ? value.split(',').map(v => v.trim()) : value)
    tagIds?: string[];
}