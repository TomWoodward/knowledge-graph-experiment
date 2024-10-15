import { stripHtml } from "string-strip-html";
import _ from 'lodash/fp.js';

const bookData = await fetch('https://openstax.org/apps/archive/20240812.170248/contents/f0fa90be-fca8-43c9-9aad-715c0a2cee2b@8877b40.json')
  .then(response => response.json());

function findPages(tree) {
  const {toc_type, contents} = tree;
  const subPages = contents ? contents.map(findPages).flat() : [];
  return toc_type === 'book-content' ? [tree, ...subPages] : subPages;
}

const allPages = findPages(bookData.tree)
  .map(page => ({
    ...page,
    id: page.id.substring(0, page.id.length-1),
    title: stripHtml(page.title).result
  }));

export const sectionPages = allPages
  .filter(p => p.toc_target_type === 'numbered-section')
;
