// src/common/interfaces/standard-response.interface.ts
import { ResponseMessageEnum } from '../enums/response-message.enum';

export interface StandardResponse<T = any> {
  error?: boolean;
  message: ResponseMessageEnum;
  data: T;
}
