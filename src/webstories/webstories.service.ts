// webstories.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateWebstoryDto } from './dto/update-webstory.dto';
import { CreateWebstoryDto } from './dto/create-webstory.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class WebstoriesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateWebstoryDto) {
        return this.prisma.webstory.create({ data: { ...dto } });
    }

    async findAll(query: PaginationQueryDto) {
        const { page = 1, limit = 10, search } = query;
        const skip = (page - 1) * limit;

        const filters: Prisma.WebstoryWhereInput = {
            removed: false,
            ...(search && {
                title: {
                    contains: search,
                    mode: Prisma.QueryMode.insensitive, // ✅ Usa enum correta aqui
                },
            }),
        };

        const [items, total] = await this.prisma.$transaction([
            this.prisma.webstory.findMany({
                where: filters,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.webstory.count({ where: filters }),
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
        const item = await this.prisma.webstory.findUnique({ where: { id } });
        if (!item || item.removed) throw new NotFoundException('Webstory not found');
        return item;
    }

    update(id: string, dto: UpdateWebstoryDto) {
        return this.prisma.webstory.update({ where: { id }, data: dto });
    }

    remove(id: string) {
        return this.prisma.webstory.update({
            where: { id },
            data: { removed: true },
        });
    }

    async reorder(id: string, newOrder: number) {
        const webstory = await this.findOne(id);
        const currentOrder = webstory.order;

        if (currentOrder === newOrder) return webstory;

        const isMovingDown = newOrder > currentOrder;

        // Atualiza os webstorys entre a posição atual e a nova
        await this.prisma.webstory.updateMany({
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

        // Atualiza o webstory desejado
        return this.prisma.webstory.update({
            where: { id },
            data: { order: Number(newOrder) },
        });
    }
}