import { Module } from '@nestjs/common';
import { PautaService } from './pauta.service';
import { PautaController } from './pauta.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadService } from 'src/uploads/upload.service';

@Module({
  providers: [PautaService, PrismaService, UploadService],
  controllers: [PautaController]
})
export class PautaModule { }
