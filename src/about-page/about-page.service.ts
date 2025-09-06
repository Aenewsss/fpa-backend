import { Injectable } from '@nestjs/common';
import { UpdatePageDto } from 'src/common/dto/update-page.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AboutPageService {
    constructor(private readonly prisma: PrismaService) { }

    async update(dto: UpdatePageDto) {
        console.log(dto)
        const aboutPage = await this.prisma.aboutPage.findFirst()
        if (!aboutPage) return this.prisma.aboutPage.create({ data: dto });
        return this.prisma.aboutPage.update({ where: { id: aboutPage.id }, data: dto });
    }


    async findOne() {
        return await this.prisma.aboutPage.findFirst()
    }
}
