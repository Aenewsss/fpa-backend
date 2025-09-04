import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdatePautaDto } from './dto/update-pauta.dto';

@Injectable()
export class PautaService {
    constructor(
        private readonly prisma: PrismaService
    ) { }

    async update(dto: UpdatePautaDto) {
        const pauta = await this.prisma.pauta.findFirst()
        // @ts-ignore
        if (!pauta) return this.prisma.pauta.create({ data: dto });
        return this.prisma.pauta.update({ where: { id: pauta.id }, data: dto });
    }


    async findOne() {
        return await this.prisma.pauta.findFirst()
    }
}
