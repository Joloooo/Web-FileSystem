import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Document } from 'src/documents/document.entity';

@Entity()
export class Folder {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Folder, folder => folder.children, { nullable: true, onDelete: 'CASCADE' })
  parent: Folder;

  @OneToMany(() => Folder, folder => folder.parent)
  children: Folder[];

  @OneToMany(() => Document, document => document.folder, { cascade: true })
  documents: Document[];
}
