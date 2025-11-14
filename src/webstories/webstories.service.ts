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
        const last = await this.prisma.webstory.findFirst({
            orderBy: { order: 'desc' },
        });

        const nextOrder = (last?.order ?? 0) + 1;

        const { slides, ...rest } = dto;

        return this.prisma.webstory.create({
            data: {
                ...rest,
                order: nextOrder,
                slides: {
                    create: slides.map(slide => ({
                        imageUrl: slide.imageUrl,
                        text: slide.text,
                        order: slide.order ?? 0, // ou você pode usar o índice
                    })),
                },
            },
        });
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

        const items = await this.prisma.webstory.findMany({
            where: filters,
            skip,
            take: limit,
            orderBy: [{ order: 'asc' }, { isFeatured: 'desc' }],
            include: {
                slides: true
            }
        })

        return items

    }

    async findOne(id: string) {
        const item = await this.prisma.webstory.findUnique({ where: { id }, include: { slides: true } });
        if (!item || item.removed) throw new NotFoundException('Webstory not found');
        return item;
    }

    async update(id: string, dto: UpdateWebstoryDto) {
        const { slides, ...rest } = dto;

        return this.prisma.$transaction([
            // Remove os slides antigos
            this.prisma.webstorySlide.deleteMany({
                where: { webstoryId: id },
            }),

            // Atualiza o conteúdo da Webstory e recria os slides
            this.prisma.webstory.update({
                where: { id },
                data: {
                    ...rest,
                    slides: {
                        create: slides?.map(slide => ({
                            imageUrl: slide.imageUrl,
                            text: slide.text,
                            order: slide.order ?? 0,
                        })) || [],
                    },
                },
            }),
        ]).then(([_, updatedWebstory]) => updatedWebstory);
    }

    remove(id: string) {
        return this.prisma.webstory.update({
            where: { id },
            data: { removed: true },
        });
    }

    async reorder(id: string, newOrderInput: number | string) {
        let newOrder = Number(newOrderInput);
        if (isNaN(newOrder)) throw new Error(`Invalid newOrder value: ${newOrderInput}`);
        if (newOrder < 0) newOrder = 0;

        const webstories = await this.prisma.webstory.findMany({
            where: { removed: false },
            orderBy: { order: 'asc' },
        });

        if (webstories.length === 0) {
            throw new Error('No webstories found to reorder.');
        }

        // Encontra o item a ser movido
        const currentIndex = webstories.findIndex((w) => w.id === id);
        if (currentIndex === -1) throw new Error(`Webstory with id ${id} not found.`);

        // Remove o item atual
        const [movedItem] = webstories.splice(currentIndex, 1);

        // Ajusta newOrder se for maior que o total
        if (newOrder >= webstories.length) newOrder = webstories.length;

        // Insere o item na nova posição
        webstories.splice(newOrder, 0, movedItem);

        // Reatribui todos os índices em ordem
        const reordered = webstories.map((w, index) => ({
            id: w.id,
            order: index,
        }));

        // Atualiza todos no banco via transação
        await this.prisma.$transaction(
            reordered.map((w) =>
                this.prisma.webstory.update({
                    where: { id: w.id },
                    data: { order: w.order },
                }),
            ),
        );

        // Retorna o item movido atualizado
        return this.prisma.webstory.findUnique({ where: { id } });
    }
}