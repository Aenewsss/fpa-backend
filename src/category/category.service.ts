// src/categories/categories.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@Injectable()
export class CategoryService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateCategoryDto) {
        return this.prisma.category.create({
            data: dto,
        });
    }

    async findAll(query: PaginationQueryDto) {
        const { page = 1, limit = 10, search } = query;
        const skip = (page - 1) * limit;

        const [items, total] = await this.prisma.$transaction([
            this.prisma.category.findMany({
                where: search
                    ? { name: { contains: search, mode: 'insensitive' }, removed: { not: true } }
                    : undefined,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.category.count({
                where: search
                    ? { name: { contains: search, mode: 'insensitive' }, removed: { not: true } }
                    : undefined,
            }),
        ]);

        return {
            items,
            meta: {
                totalItems: total,
                itemCount: items.length,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
            },
        };
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
}