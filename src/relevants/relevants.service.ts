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
        const last = await this.prisma.relevant.findFirst({
            orderBy: { order: 'desc' },
        });

        const nextOrder = (last?.order ?? 0) + 1;

        const { ...rest } = dto;

        return this.prisma.relevant.create({
            data: {
                ...rest,
                order: nextOrder
            }
        });
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

        const items = this.prisma.relevant.findMany({
            where: filters,
            skip,
            take: limit,
            orderBy: { order: 'desc' },
        });

        return items

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

    async reorder(id: string, newOrderInput: number | string) {
        let newOrder = Number(newOrderInput);
        if (isNaN(newOrder)) throw new Error(`Invalid newOrder value: ${newOrderInput}`);
        if (newOrder < 0) newOrder = 0;

        const relevants = await this.prisma.relevant.findMany({
            where: { removed: false },
            orderBy: { order: 'asc' },
        });

        if (relevants.length === 0) {
            throw new Error('No relevants found to reorder.');
        }

        // Encontra o item a ser movido
        const currentIndex = relevants.findIndex((w) => w.id === id);
        if (currentIndex === -1) throw new Error(`Webstory with id ${id} not found.`);

        // Remove o item atual
        const [movedItem] = relevants.splice(currentIndex, 1);

        // Ajusta newOrder se for maior que o total
        if (newOrder >= relevants.length) newOrder = relevants.length;

        // Insere o item na nova posição
        relevants.splice(newOrder, 0, movedItem);

        // Reatribui todos os índices em ordem
        const reordered = relevants.map((w, index) => ({
            id: w.id,
            order: index,
        }));

        // Atualiza todos no banco via transação
        await this.prisma.$transaction(
            reordered.map((w) =>
                this.prisma.relevant.update({
                    where: { id: w.id },
                    data: { order: w.order },
                }),
            ),
        );

        // Retorna o item movido atualizado
        return this.prisma.webstory.findUnique({ where: { id } });
    }
}