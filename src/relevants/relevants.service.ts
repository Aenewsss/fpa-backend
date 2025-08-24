// relevants.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateRelevantDto } from './dto/update-relevant.dto';
import { CreateRelevantDto } from './dto/create-relevant.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class RelevantsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateRelevantDto) {
        return this.prisma.relevant.create({ data: { ...dto } });
    }

    async findAll(query: PaginationQueryDto) {
        const { page = 1, limit = 10, search } = query;
        const skip = (page - 1) * limit;

        const filters: Prisma.RelevantWhereInput = {
            removed: false,
            ...(search && {
                title: {
                    contains: search,
                    mode: Prisma.QueryMode.insensitive, // ✅ Usa enum correta aqui
                },
            }),
        };

        const [items, total] = await this.prisma.$transaction([
            this.prisma.relevant.findMany({
                where: filters,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.relevant.count({ where: filters }),
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
        const item = await this.prisma.relevant.findUnique({ where: { id } });
        if (!item || item.removed) throw new NotFoundException('Relevant not found');
        return item;
    }

    update(id: string, dto: UpdateRelevantDto) {
        return this.prisma.relevant.update({ where: { id }, data: dto });
    }

    remove(id: string) {
        return this.prisma.relevant.update({
            where: { id },
            data: { removed: true },
        });
    }
}