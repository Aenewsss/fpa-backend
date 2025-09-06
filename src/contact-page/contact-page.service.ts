import { Injectable } from '@nestjs/common';
import { UpdatePageDto } from 'src/common/dto/update-page.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ContactPageService {
    constructor(private readonly prisma: PrismaService) { }

    async update(dto: UpdatePageDto) {
        const contactPage = await this.prisma.contactPage.findFirst()
        if (!contactPage) return this.prisma.contactPage.create({ data: dto });
        return this.prisma.contactPage.update({ where: { id: contactPage.id }, data: dto });
    }


    async findOne() {
        return await this.prisma.contactPage.findFirst()
    }
}
