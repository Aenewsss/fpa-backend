import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateBannerDto } from "./dto/create-banner.dto";
import { UpdateBannerDto } from "./dto/update-banner.dto";
import { ResponseMessageEnum } from "src/common/enums/response-message.enum";

@Injectable()
export class BannersService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateBannerDto) {
        return this.prisma.banner.create({ data: dto });
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
        await this.findOne(id);
        return this.prisma.banner.update({
            where: { id },
            data: { order: newOrder },
        });
    }
}