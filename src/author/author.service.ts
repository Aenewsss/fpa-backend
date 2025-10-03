import { Injectable, NotFoundException } from '@nestjs/common';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAuthorDto } from './dto/create-author.dto';

@Injectable()
export class AuthorService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateAuthorDto) {
        return this.prisma.author.create({
            data: {
                ...dto,
            },
        });
    }
    async findAll() {
        return this.prisma.author.findMany({
            where: { removed: false },
        });
    }

    async findOne(id: string) {
        const author = await this.prisma.author.findUnique({ where: { id } });
        if (!author || author.removed) throw new NotFoundException(ResponseMessageEnum.BANNER_NOT_FOUND);
        return author;
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.author.update({
            where: { id },
            data: { removed: true },
        });
    }

}
