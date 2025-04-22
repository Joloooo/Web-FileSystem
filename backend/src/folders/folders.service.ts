import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Folder } from './folder.entity';
import { Document } from 'src/documents/document.entity';
import { StorageService } from 'src/storage/storage.service';
import { GenerateSlugId } from 'src/utils/slug.util';


@Injectable()
export class FoldersService {
  constructor(
    @InjectRepository(Folder) private readonly folderRepo: Repository<Folder>,
    @InjectRepository(Document)
    private readonly storage: StorageService,
  ) {}

  async create(name: string | undefined, parentId: string): Promise<Folder> {
    const parent = await this.folderRepo.findOne({ where: { id: parentId } });
    if (!parent) throw new NotFoundException('Parent folder not found');

    let finalName = name;
    if (!finalName) {
      const count = await this.folderRepo.count({
        where: { parent: { id: parentId } },
      });
      //if parent is root uses just number adding but if it is subfolder uses different folder naming convention
      finalName =
        parentId === 'root'
          ? `Folder ${count + 1}`
          : `${parent.name}.${count + 1}`;
    }

    const folder = this.folderRepo.create({
      id: GenerateSlugId(finalName),
      name: finalName,
      parent,
    });

    return this.folderRepo.save(folder);
  }

  async updateName(id: string, newName: string): Promise<Folder> {
    const folder = await this.folderRepo.findOne({ where: { id } });
    if (!folder) throw new NotFoundException('Folder not found');
    folder.name = newName;
    return this.folderRepo.save(folder);
  }

  async delete(id: string): Promise<void> {
    const folder = await this.folderRepo.findOne({
      where: { id },
      relations: ['documents'],
    });
    if (!folder) throw new NotFoundException('Folder not found');

    for (const doc of folder.documents) {
      await this.storage.deleteFile(doc.s3Key);
    }
    await this.folderRepo.remove(folder);
  }

  async getRootTree(): Promise<Folder> {
    let root = await this.folderRepo.findOne({ where: { id: 'root' } });
    if (!root) {
      root = await this.folderRepo.save(
        this.folderRepo.create({ id: 'root', name: 'Root' }),
      );
    }
    const all = await this.folderRepo.find({
      relations: ['parent', 'documents'],
      order: { name: 'ASC' },
    });
    const map = new Map<string, Folder & { children: Folder[] }>();
    for (const f of all) map.set(f.id, { ...f, children: [] });
    for (const f of all)
      if (f.parent) map.get(f.parent.id)!.children.push(map.get(f.id)!);

    return map.get('root')!;
  }
}
