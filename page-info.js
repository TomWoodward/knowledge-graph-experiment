import { stringify } from 'csv-stringify';
import { sectionPages } from './lib/content.js';

const stringifier = stringify({
  header: true,
  columns: ['id', 'title', 'index']
});

stringifier.pipe(process.stdout);

for (const [i, page] of sectionPages.entries()) {
  stringifier.write([ page.id, page.title, i ]);
};
