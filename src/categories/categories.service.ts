// src/categories/categories.service.ts
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@Injectable()
export class CategoryService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateCategoryDto) {
        const category = await this.prisma.category.findFirst({
            where: {
                OR: [
                    { slug: dto.slug },
                    { name: dto.name }
                ]
            }
        })

        if (category) throw new ConflictException(ResponseMessageEnum.CATEGORY_ALREADY_EXISTS)

        return this.prisma.category.create({
            data: dto,
        });
    }

    async findAll(query: PaginationQueryDto) {
        const { page = 1, limit = 10, search } = query;
        const skip = (page - 1) * limit;

        const items = this.prisma.category.findMany({
            where: search
                ? { name: { contains: search, mode: 'insensitive' }, removed: { not: true } }
                : {removed: false},
            skip,
            take: limit,
            orderBy: { name: 'asc' },
        })

        return items
    }

    async findOne(id: string) {
        const category = await this.prisma.category.findUnique({ where: { id } });
        if (!category) throw new NotFoundException(ResponseMessageEnum.CATEGORY_NOT_FOUND);
        return category;
    }

    async update(id: string, dto: UpdateCategoryDto) {
        await this.findOne(id);
        return this.prisma.category.update({
            where: { id },
            data: dto,
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.category.update({
            where: { id },
            data: { removed: true }
        });
    }

    async reorder(id: string, newOrder: number) {
        const category = await this.findOne(id);
        const currentOrder = category.order;

        if (currentOrder === newOrder) return category;

        const isMovingDown = newOrder > currentOrder;

        // Atualiza os categorys entre a posição atual e a nova
        await this.prisma.category.updateMany({
            where: {
                removed: false,
                id: { not: id },
                order: {
                    gte: isMovingDown ? Number(currentOrder) + 1 : Number(newOrder),
                    lte: isMovingDown ? Number(newOrder) : Number(currentOrder) - 1,
                },
            },
            data: {
                order: {
                    increment: isMovingDown ? -1 : 1,
                },
            },
        });

        // Atualiza o category desejado
        return this.prisma.category.update({
            where: { id },
            data: { order: Number(newOrder) },
        });
    }
}