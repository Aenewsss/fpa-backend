import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';

@Injectable()
export class TagsService {
    constructor(private readonly prisma: PrismaService) { }

    create(dto: CreateTagDto) {
        return this.prisma.tag.create({ data: dto });
    }

    findAll() {
        return this.prisma.tag.findMany({
            where: { removed: false },
            orderBy: { name: 'asc' },
        });
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