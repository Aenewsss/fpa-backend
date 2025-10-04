// src/posts/dto/update-post.dto.ts
import {
    IsString,
    IsOptional,
    IsEnum,
    IsBoolean,
    IsArray,
    IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PostStatus } from '@prisma/client';

export class UpdatePostDto {
    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    postTitle?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    postContent?: string;

    @IsOptional()
    @IsEnum(PostStatus)
    @ApiPropertyOptional({ enum: PostStatus })
    postStatus?: PostStatus;

    @ApiPropertyOptional()
    @IsUUID()
    @IsOptional()
    articleAuthorId?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    postCategoryId?: string;

    @IsOptional()
    @IsArray()
    @ApiPropertyOptional({ type: [String] })
    tagIds?: string[];

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    thumbnailUrl?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    slug?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    summary?: string;

    @IsOptional()
    @IsBoolean()
    @ApiPropertyOptional()
    isFeatured?: boolean;
}