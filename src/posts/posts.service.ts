import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@Injectable()
export class PostsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreatePostDto, authorId: string) {
        return this.prisma.post.create({
            data: {
                postTitle: dto.postTitle,
                postContent: dto.postContent,
                postAuthorId: authorId,
                postStatus: dto.postStatus,
                postCategoryId: dto.postCategoryId,
                thumbnailUrl: dto.thumbnailUrl,
                slug: dto.slug,
                summary: dto.summary,
                isFeatured: dto.isFeatured ?? false,
                relatedTags: {
                    connect: dto.tagIds?.map((id) => ({ id })) || [],
                },
                postParentId: dto.postParentId || undefined,
            },
        });
    }

    async update(id: string, dto: UpdatePostDto) {
        const post = await this.prisma.post.findUnique({ where: { id } });
        if (!post) throw new NotFoundException(ResponseMessageEnum.POST_NOT_FOUND);

        return this.prisma.post.update({
            where: { id },
            data: {
                ...dto,
                relatedTags: dto.tagIds
                    ? {
                        set: [], // limpa as tags antigas
                        connect: dto.tagIds.map((id) => ({ id })),
                    }
                    : undefined,
            },
        });
    }

    async findAll(query: PaginationQueryDto) {
        const { page = 1, limit = 10, search } = query;

        const where: any = {
            postTitle: search ? { contains: search, mode: 'insensitive' } : undefined,
            removed: false,
        };

        const items = this.prisma.post.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                postAuthor: true,
                postCategory: true,
                relatedTags: true,
            },
        });

        return items
    }

    async findFeatured() {
        const items = this.prisma.post.findMany({
            where: {
                isFeatured: true,
                removed: false,
            },
            orderBy: { createdAt: 'desc' },
            include: {
                postAuthor: true,
                postCategory: true,
                relatedTags: true,
            },
            take: 3
        });

        return items
    }

    async findOne(id: string) {
        const post = await this.prisma.post.findUnique({
            where: { id },
            include: {
                postAuthor: true,
                postCategory: true,
                relatedTags: true,
            },
        });

        if (!post || post.postStatus === 'removed') {
            throw new NotFoundException(ResponseMessageEnum.POST_NOT_FOUND);
        }

        return post;
    }

    async remove(id: string) {
        const post = await this.prisma.post.findUnique({ where: { id } });

        if (!post || post.postStatus === 'removed') throw new NotFoundException(ResponseMessageEnum.POST_NOT_FOUND);

        return this.prisma.post.update({
            where: { id },
            data: {
                postStatus: 'removed',
                removed: true
            },
        });
    }

    async increment(id: string) {
        return this.prisma.post.update({
            where: { id },
            data: {
                views: {
                    increment: 1,
                },
            },
        });
    }

}