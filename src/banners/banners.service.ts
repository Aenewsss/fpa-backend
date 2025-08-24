import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateBannerDto } from "./dto/create-banner.dto";
import { UpdateBannerDto } from "./dto/update-banner.dto";
import { ResponseMessageEnum } from "src/common/enums/response-message.enum";

@Injectable()
export class BannersService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateBannerDto) {
        const lastBanner = await this.prisma.banner.findFirst({
            orderBy: { order: 'desc' },
        });

        const nextOrder = (lastBanner?.order ?? 0) + 1;

        return this.prisma.banner.create({
            data: {
                ...dto,
                order: nextOrder,
            },
        });
    }

    async findAll() {
        return this.prisma.banner.findMany({
            where: { removed: false },
            orderBy: { order: 'asc' },
        });
    }

    async findOne(id: string) {
        const banner = await this.prisma.banner.findUnique({ where: { id } });
        if (!banner || banner.removed) throw new NotFoundException(ResponseMessageEnum.BANNER_NOT_FOUND);
        return banner;
    }

    async update(id: string, dto: UpdateBannerDto) {
        await this.findOne(id);
        return this.prisma.banner.update({ where: { id }, data: dto });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.banner.update({
            where: { id },
            data: { removed: true },
        });
    }

    async reorder(id: string, newOrder: number) {
        const banner = await this.findOne(id);
        const currentOrder = banner.order;

        if (currentOrder === newOrder) return banner;

        const isMovingDown = newOrder > currentOrder;

        return this.prisma.$transaction(async (tx) => {
            // 1. Remove temporariamente o banner da ordem atual
            await tx.banner.update({
                where: { id },
                data: { order: -1 }, // valor temporário
            });

            // 2. Atualiza os banners entre as posições
            await tx.banner.updateMany({
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

            // 3. Atualiza o banner para a nova posição
            return tx.banner.update({
                where: { id },
                data: { order: Number(newOrder) },
            });
        });
    }
}