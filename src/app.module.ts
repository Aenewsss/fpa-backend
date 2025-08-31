import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { CategoryModule } from './categories/categories.module';
import { TagModule } from './tags/tags.module';
import { PostsModule } from './posts/posts.module';
import { BannersModule } from './banners/banners.module';
import { WebstoriesModule } from './webstories/webstories.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { RelevantsModule } from './relevants/relevants.module';
import { TwitterModule } from './twitter/twitter.module';
import { VideosModule } from './videos/video.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // torna disponível em toda a aplicação
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoryModule,
    TagModule,
    PostsModule,
    BannersModule,
    WebstoriesModule,
    RelevantsModule,
    DashboardModule,
    TwitterModule,
    VideosModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
