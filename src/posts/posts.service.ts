import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PostsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreatePostDto, authorId: string) {
        const data = Prisma.validator<Prisma.PostUncheckedCreateInput>()({
            postTitle: dto.postTitle,
            postContent: dto.postContent,
            postAuthorId: authorId,
            articleAuthorId: dto.articleAuthorId,
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
        });

        return this.prisma.post.create({ data });
    }

    async update(id: string, dto: UpdatePostDto) {
        const existingPost = await this.prisma.post.findUnique({ where: { id } })
        if (!existingPost) throw new NotFoundException(ResponseMessageEnum.POST_NOT_FOUND)

        // 🔄 Keep old thumbnail if a new one isn’t provided
        const thumbnailUrl = dto.thumbnailUrl ?? existingPost.thumbnailUrl

        // 🔄 Merge tags only if explicitly provided
        const relatedTags =
            dto.tagIds && dto.tagIds.length > 0
                ? {
                    set: [], // clear old tags
                    connect: dto.tagIds.map((id) => ({ id })),
                }
                : undefined

        return this.prisma.post.update({
            where: { id },
            data: {
                postTitle: dto.postTitle ?? existingPost.postTitle,
                postContent: dto.postContent ?? existingPost.postContent,
                postStatus: dto.postStatus ?? existingPost.postStatus,
                postCategoryId: dto.postCategoryId ?? existingPost.postCategoryId,
                slug: dto.slug ?? existingPost.slug,
                summary: dto.summary ?? existingPost.summary,
                isFeatured:
                    typeof dto.isFeatured === 'boolean'
                        ? dto.isFeatured
                        : existingPost.isFeatured,
                thumbnailUrl,
                relatedTags,
                // keep author if not changed
                articleAuthorId: dto.articleAuthorId ?? existingPost.articleAuthorId,
                updatedAt: new Date(),
            },
        })
    }

    async findAll(query: PaginationQueryDto) {
        const { page = 1, limit = 30, search, categoryId, authorId, currentPostId } = query;

        const isArticle = categoryId == "articles"

        const searchQuery = (search || isArticle) ? { contains: search || "Artigo", mode: 'insensitive' } : undefined;

        const where: any = {
            postTitle: searchQuery,
            removed: false,
            postCategoryId: (!isArticle && categoryId) ? categoryId : undefined,
            articleAuthorId: authorId || undefined,
            NOT: currentPostId ? { id: currentPostId, postStatus: 'removed' } : { postStatus: 'removed' },
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
                articleAuthor: true,
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
            take: 4
        });

        return items
    }

    async findCategoryFeatured() {
        // Buscar até 3 categorias destacadas
        const categories = await this.prisma.category.findMany({
            where: {
                isFeatured: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 4,
        });

        // Se não houver categorias destacadas, retorne os 3 últimos posts normais
        if (categories.length === 0) {
            const fallbackPosts = await this.prisma.post.findMany({
                where: { removed: false },
                orderBy: { createdAt: 'desc' },
                include: {
                    postAuthor: true,
                    postCategory: true,
                    relatedTags: true,
                },
                take: 3,
            });

            return { categories: [], postsByCategory: {}, fallbackPosts };
        }

        // Para cada categoria destacada, buscar até 4 posts
        const postsByCategory = {};

        for (const category of categories) {
            const posts = await this.prisma.post.findMany({
                where: {
                    removed: false,
                    postCategoryId: category.id,
                },
                orderBy: { createdAt: 'desc' },
                include: {
                    postAuthor: true,
                    postCategory: true,
                    relatedTags: true,
                },
                take: 4,
            });

            postsByCategory[category.id] = posts;
        }

        return {
            categories,
            postsByCategory,
            fallbackPosts: [],
        };
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

    async mostViewed() {
        const posts = await this.prisma.post.findMany({
            where: {
                removed: false,
                isFeatured: false,
                views: { gt: 0 }
            },
            orderBy: {
                views: 'desc',
            },
            take: 8,
            include: {
                postAuthor: true,
                postCategory: true,
                relatedTags: true,
            },
        });

        return posts;
    }

    async findRemoved() {
        const posts = await this.prisma.post.findMany({
            where: { removed: true },
            orderBy: { updatedAt: 'desc' },
            include: {
                postAuthor: true,
                postCategory: true,
                relatedTags: true,
            },
        });

        return posts;
    }

    /**
     * Restaura um post removido (soft delete) para ativo novamente.
     */
    async restore(id: string) {
        const post = await this.prisma.post.findUnique({
            where: { id },
        });

        if (!post || !post.removed) {
            throw new NotFoundException(ResponseMessageEnum.POST_NOT_FOUND);
        }

        return this.prisma.post.update({
            where: { id },
            data: {
                removed: false,
            },
        });
    }
}