
import { Entity, PrimaryColumn, Column, ManyToOne } from 'typeorm';
import { Folder } from 'src/folders/folder.entity';

//defininng all the variables for document
@Entity()
export class Document {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  s3Key: string;

  @Column({ nullable: true })
  mimeType: string;

  @ManyToOne(() => Folder, folder => folder.documents, { nullable: false, onDelete: 'CASCADE' })
  folder: Folder;
}
