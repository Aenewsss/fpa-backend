import { Injectable } from '@nestjs/common';
import { UpdatePageDto } from 'src/common/dto/update-page.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsageTermsPageService {
    constructor(private readonly prisma: PrismaService) { }

    async update(dto: UpdatePageDto) {
        const usageTermsPage = await this.prisma.usageTermsPage.findFirst()
        if (!usageTermsPage) return this.prisma.usageTermsPage.create({ data: dto });
        return this.prisma.usageTermsPage.update({ where: { id: usageTermsPage.id }, data: dto });
    }


    async findOne() {
        return await this.prisma.usageTermsPage.findFirst()
    }
}
