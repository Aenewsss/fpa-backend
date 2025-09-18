import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateVideoDto } from "./dto/create-video.dto";
import { ResponseMessageEnum } from "src/common/enums/response-message.enum";

@Injectable()
export class VideosService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateVideoDto) {
        return this.prisma.video.create({
            data: dto,
        });
    }

    async findAll() {
        return this.prisma.video.findMany({
            where: { removed: false },
            orderBy: { isFeatured: 'desc' }
        });
    }

    async findOne(id: string) {
        const video = await this.prisma.video.findUnique({ where: { id } });
        if (!video || video.removed) throw new NotFoundException(ResponseMessageEnum.BANNER_NOT_FOUND);
        return video;
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.video.update({
            where: { id },
            data: { removed: true },
        });
    }
}