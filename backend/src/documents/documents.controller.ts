
import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Param,
    Body,
    UploadedFile,
    UseInterceptors,
    Res,
    NotFoundException,
    BadRequestException
  } from '@nestjs/common';
  import { randomUUID } from 'crypto';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { DocumentsService } from './documents.service';
  import { Response } from 'express';
  

  //rest of the four endpoints for 
  @Controller('api/v2/documents')
  export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) {}
  
    @Post()
    @UseInterceptors(FileInterceptor('data'))  
    async upload(
      @UploadedFile() file: Express.Multer.File,
      @Body() body: { parentId: string },    
    ) {
      if (!file) throw new BadRequestException('No file uploaded');
    
 
      const name     = file.originalname;
      const s3Key = randomUUID(); 
      const mimeType = file.mimetype;
    
      return this.documentsService.upload(
        name,
        s3Key,
        mimeType,
        body.parentId,
        file,
      );
    }
    
  
    @Get(':id')
    async download(@Param('id') id: string, @Res() res: Response) {
      const { fileStream, document } = await this.documentsService.getFileWithStream(id);
  
      if (!fileStream) throw new NotFoundException('File not found in S3');
  
      res.set({
        'Content-Type': document.mimeType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${document.name}"`,
      });
  
      fileStream.pipe(res);
    }
  
    @Patch(':id')
    async rename(@Param('id') id: string, @Body() body: { name: string }) {
      return this.documentsService.updateName(id, body.name);
    }
  
    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.documentsService.delete(id);
    }
  }
  