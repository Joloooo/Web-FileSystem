import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './document.entity';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { FoldersModule } from '../folders/folders.module';
import { StorageModule } from '../storage/storage.module';
import { Folder } from 'src/folders/folder.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([Document, Folder]),
    forwardRef(() => FoldersModule), 
    StorageModule,
  ],
  providers: [DocumentsService],
  controllers: [DocumentsController],
  exports: [DocumentsService],
})
export class DocumentsModule {}
