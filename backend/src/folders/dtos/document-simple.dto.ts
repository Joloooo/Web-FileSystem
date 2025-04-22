import { Expose } from 'class-transformer';

export class DocumentSimpleDto {
  @Expose() id: string;
  @Expose() name: string;
}
