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
import { MagazineModule } from './magazine/magazine.module';
import { PautaModule } from './pauta/pauta.module';
import { LiveModule } from './live/live.module';
import { UsageTermsPageModule } from './usage-terms-page/usage-terms-page.module';
import { ContactPageModule } from './contact-page/contact-page.module';
import { AboutPageModule } from './about-page/about-page.module';
import { PdfModule } from './pdf/pdf.module';

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
    VideosModule,
    MagazineModule,
    PautaModule,
    LiveModule,
    UsageTermsPageModule,
    ContactPageModule,
    AboutPageModule,
    PdfModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
