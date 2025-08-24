import { PartialType } from '@nestjs/swagger';
import { CreateRelevantDto } from './create-relevant.dto';

export class UpdateRelevantDto extends PartialType(CreateRelevantDto) { }