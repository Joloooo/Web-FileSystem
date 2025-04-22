import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './document.entity';
import { Folder } from 'src/folders/folder.entity';
import { StorageService } from 'src/storage/storage.service';
import { Readable } from 'stream';
import { GenerateSlugId } from 'src/utils/slug.util';


//importing storage StorageService in here to individually use them for actually uploading and downloading while also doing basic 
// validation and does the DB entry for that file for that reason constructor is instantiating both document and folder entities
@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepo: Repository<Document>,

    @InjectRepository(Folder)
    private readonly folderRepo: Repository<Folder>,

    private storageService: StorageService,
  ) {}
  //method calls storageservice to actually execute the service upload the file for upload and saves file details in the postgres db
  async upload(
    name: string,
    s3Key: string,
    mimeType: string,
    parentId: string,
    file: Express.Multer.File,
  ): Promise<Document> {
    const folder = await this.folderRepo.findOne({ where: { id: parentId } });
    if (!folder) throw new NotFoundException('Parent folder not found');

    await this.storageService.uploadFile(file, s3Key);

    const doc = this.documentRepo.create({ id: GenerateSlugId(name), name, s3Key, mimeType, folder });
    return this.documentRepo.save(doc);
  }
  //getFileWithStreamcalls  getFileStream general download method from storage to download a file from s3 while also looking
  //  up file in database and returning file stream and returning  the document details
  async getFileWithStream(id: string): Promise<{ fileStream: Readable; document: Document }> {
    const document = await this.documentRepo.findOne({ where: { id } });
    if (!document) throw new NotFoundException('Document not found');

    const fileStream = this.storageService.getFileStream(document.s3Key);
    return { fileStream, document };
  }

  async updateName(id: string, newName: string): Promise<Document> {
    const doc = await this.documentRepo.findOne({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');

    doc.name = newName;
    return this.documentRepo.save(doc);
  }
  //similarily calls deleteFile method from storageService to delete files and at the sametime delete document from postgres
  async delete(id: string): Promise<void> {
    const doc = await this.documentRepo.findOne({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');

    await this.storageService.deleteFile(doc.s3Key);
    await this.documentRepo.remove(doc);
  }
}
