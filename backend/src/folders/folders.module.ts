import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Folder } from './folder.entity';
import { FoldersService } from './folders.service';
import { FoldersController } from './folders.controller';
import { StorageModule } from '../storage/storage.module';
import { DocumentsModule } from 'src/documents/documents.module';
import { Document } from 'src/documents/document.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Folder, Document]),
  //for circular dependency telling it to import it but wait and not to resolve immediately
  forwardRef(() => DocumentsModule),
  StorageModule,

],
  providers: [FoldersService],
  controllers: [FoldersController],
  exports: [FoldersService], 
})
export class FoldersModule {}
