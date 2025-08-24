import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private readonly prisma: PrismaService) { }

    async getMonthlySummary() {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const [totalPosts, activeBanners, webStories, categories] = await Promise.all([
            this.prisma.post.count({
                where: {
                    createdAt: { gte: startOfMonth },
                },
            }),
            this.prisma.banner.count({
                where: {
                    createdAt: { gte: startOfMonth },
                    removed: false,
                },
            }),
            this.prisma.webstory.count({
                where: {
                    createdAt: { gte: startOfMonth },
                },
            }),
            this.prisma.category.count({
                where: {
                    createdAt: { gte: startOfMonth },
                },
            }),
        ]);

        return {
            totalPostsThisMonth: totalPosts,
            activeBannersThisMonth: activeBanners,
            webStoriesThisMonth: webStories,
            categoriesThisMonth: categories,
        };
    }
}
