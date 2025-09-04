import { Injectable } from '@nestjs/common';
import { UpdateLiveDto } from './dto/update-live.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LiveService {
    constructor(private readonly prisma: PrismaService) { }

    async update(dto: UpdateLiveDto) {
        const live = await this.prisma.live.findFirst()
        if (!live) return this.prisma.live.create({ data: dto });
        return this.prisma.live.update({ where: { id: live.id }, data: dto });
    }


    async findOne() {
        return await this.prisma.live.findFirst()
    }
}
