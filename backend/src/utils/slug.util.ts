import slugify from 'slugify';

//no extra functionality added just lowercasing &  replaces periods with hypens too 
export function GenerateSlugId(name: string): string {
  return slugify(name.replace(/\./g, '-'), {
    lower: true,
    strict: true,
  });
}