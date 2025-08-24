import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { DashboardOverviewDto } from './dto/dashboard-overview.dto';
import { DashboardTotalCountsDto } from './dto/dashboard-total-counts.dto';

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

    async getContentOverview(): Promise<DashboardOverviewDto> {
        const [publishedPosts, draftPosts, activeBanners, webStories, categories, totalTags] = await Promise.all([
            this.prisma.post.count({ where: { postStatus: 'posted' } }),
            this.prisma.post.count({ where: { postStatus: 'draft' } }),
            this.prisma.banner.count({ where: { removed: false } }),
            this.prisma.webstory.count({ where: { removed: false } }),
            this.prisma.category.count({ where: { removed: false } }),
            this.prisma.tag.count({}),
        ])

        return {
            publishedPosts,
            draftPosts,
            activeBanners,
            webStories,
            categories,
            totalTags,
        }
    }

    async getDashboardTotals(): Promise<DashboardTotalCountsDto> {
        const [
            totalPosts,
            totalBanners,
            totalWebStories,
            totalCategories,
            totalTags,
            totalUsers,
            totalRelevants,
        ] = await Promise.all([
            this.prisma.post.count(),
            this.prisma.banner.count(),
            this.prisma.webstory.count(),
            this.prisma.category.count(),
            this.prisma.tag.count(),
            this.prisma.user.count(),
            this.prisma.relevant.count(),
        ])

        return {
            totalPosts,
            totalBanners,
            totalWebStories,
            totalCategories,
            totalTags,
            totalUsers,
            totalRelevants,
        }
    }
}
