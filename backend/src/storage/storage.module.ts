import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { ConfigModule } from '@nestjs/config';

//exporting StorageService to be used in the documents module to individually execute upload/download/delete operations
@Module({
  imports: [ConfigModule], 
  providers: [StorageService],
  exports: [StorageService], 
})
export class StorageModule {}
