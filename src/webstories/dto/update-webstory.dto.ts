import { PartialType } from '@nestjs/swagger';
import { CreateWebstoryDto } from './create-webstory.dto';

export class UpdateWebstoryDto extends PartialType(CreateWebstoryDto) { }