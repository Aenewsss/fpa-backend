import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@Injectable()
export class TagsService {
    constructor(private readonly prisma: PrismaService) { }

    create(dto: CreateTagDto) {
        return this.prisma.tag.create({ data: dto });
    }

    async findAll(query: PaginationQueryDto) {
        const { page = 1, limit = 10, search } = query;
        const skip = (page - 1) * limit;

        const [items, total] = await this.prisma.$transaction([
            this.prisma.tag.findMany({
                where: search
                    ? { name: { contains: search, mode: 'insensitive' }, removed: { not: true } }
                    : undefined,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.tag.count({
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
        const tag = await this.prisma.tag.findUnique({ where: { id } });
        if (!tag || tag.removed) throw new NotFoundException(ResponseMessageEnum.TAG_NOT_FOUND);
        return tag;
    }

    async update(id: string, dto: UpdateTagDto) {
        await this.findOne(id);
        return this.prisma.tag.update({ where: { id }, data: dto });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.tag.update({ where: { id }, data: { removed: true } });
    }
}