import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Param,
  Body,
} from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { FoldersService } from './folders.service';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { FolderTreeDto } from './dtos/folder-tree.dto';

//4 api endpoints related to foldersare define here which all link to foldersService 
@Controller('api/v2/folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post()
  create(@Body() body: { parentId?: string; name?: string }) {
    if (!body.parentId) {
      throw new BadRequestException('parentId is required');
    }
    return this.foldersService.create(body.name, body.parentId);
  }  

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { name: string }) {
    return this.foldersService.updateName(id, body.name);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.foldersService.delete(id);
  }

  @Get()
  @Serialize(FolderTreeDto)
  getTree() {
    return this.foldersService.getRootTree();
  }
}
