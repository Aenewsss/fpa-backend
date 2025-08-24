import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsUrl, IsUUID, IsArray, ArrayNotEmpty, IsInt, Min } from 'class-validator';
import { PostStatus } from '@prisma/client';

export class CreatePostDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    postTitle: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    postContent: string;

    @ApiProperty()
    @IsUUID()
    postAuthorId: string;

    @ApiProperty({ enum: PostStatus })
    @IsEnum(PostStatus)
    postStatus: PostStatus;

    @ApiPropertyOptional()
    @IsUUID()
    @IsOptional()
    postParentId?: string;

    @ApiProperty()
    @IsUUID()
    postCategoryId: string;

    @ApiProperty({ type: [String], description: 'IDs das tags relacionadas' })
    @IsArray()
    @ArrayNotEmpty()
    @IsUUID('all', { each: true })
    relatedTags: string[];

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
    isFeatured?: boolean = false;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    @Min(0)
    viewCount?: number = 0;

    @IsArray()
    @ArrayNotEmpty()
    @IsUUID('all', { each: true })
    @ApiProperty({ type: [String], description: 'IDs das tags relacionadas' })
    tagIds: string[];
}