import { Expose, Type } from 'class-transformer';
import { DocumentSimpleDto } from './document-simple.dto';

//defining which column variable is exposed so that parent is not being sent in frontend
export class FolderTreeDto {
  @Expose() id: string;
  @Expose() name: string;

  @Expose()
  @Type(() => FolderTreeDto)
  children: FolderTreeDto[];

  @Expose()
  @Type(() => DocumentSimpleDto)     
  documents: DocumentSimpleDto[];
}
