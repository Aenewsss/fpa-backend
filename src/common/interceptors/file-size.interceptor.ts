import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  BadRequestException,
} from '@nestjs/common'
import { Observable } from 'rxjs'

@Injectable()
export class FileSizeInterceptor implements NestInterceptor {
  constructor(
    private readonly fieldLimits: Record<string, number> 
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const files = request.files

    for (const field in this.fieldLimits) {
      const maxSize = this.fieldLimits[field]
      const uploadedFiles: Express.Multer.File[] = files?.[field] || []

      for (const file of uploadedFiles) {
        if (file.size > maxSize) {
          throw new BadRequestException(
            `Arquivo do campo '${field}' excede o tamanho máximo permitido de ${maxSize / (1024 * 1024)}MB`
          )
        }
      }
    }

    return next.handle()
  }
}