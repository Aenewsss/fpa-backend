// src/dashboard/dto/dashboard-overview.dto.ts
import { ApiProperty } from '@nestjs/swagger'

export class DashboardOverviewDto {
    @ApiProperty({ example: 25 })
    publishedPosts: number

    @ApiProperty({ example: 8 })
    draftPosts: number

    @ApiProperty({ example: 3 })
    activeBanners: number

    @ApiProperty({ example: 5 })
    webStories: number

    @ApiProperty({ example: 7 })
    categories: number

    @ApiProperty({ example: 12 })
    totalTags: number
}