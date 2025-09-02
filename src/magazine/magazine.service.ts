import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MagazineService {
    constructor(private readonly prisma: PrismaService) { }

    async find() {
        return this.prisma.magazine.findFirst()
    }

    async createOrUpdate(pdfUrl: string) {
        const existingMagazine = await this.prisma.magazine.findFirst();

        if (existingMagazine) {
            return this.prisma.magazine.update({
                where: { id: existingMagazine.id },
                data: { pdfUrl },
            });
        } else {
            return this.prisma.magazine.create({
                data: { pdfUrl },
            });
        }
    }

}
