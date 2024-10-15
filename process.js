import ollama from 'ollama'
import _ from 'lodash/fp.js';
import {stringify} from 'csv-stringify';
import { sectionPages } from './lib/content.js';

const system = `Identify the textbook sections that are prerequisites for the section in question. respond with only the chosen uuids. do not respond with commentary or notes.`;

const stringifier = stringify({
  header: true,
  columns: ['dependent_id', 'prerequisite_id', 'weight']
});

stringifier.pipe(process.stdout);

for (const [i, page] of sectionPages.entries()) {
  //const previousPages = sectionPages.slice(0, i);
  //const falsePages = _.shuffle(sectionPages).slice(0, 5);

  const prerequisites = {};

  for (let shot = 0; shot < 10; shot++) {
    //const groups = _.chunk(10, _.shuffle([...previousPages, ...falsePages]));
    const groups = _.chunk(1000, _.shuffle(sectionPages.filter(p => p != page)));

    for (const group of groups) {
      const prompt = `<|start_header_id|>system<|end_header_id|>${system}<|eot_id|>

<|start_header_id|>user<|end_header_id|>
Identify if any of the following sections contain content that would be necessary to understand "1.4 Test Page"

possible prerequisites:
69384c47-c27c-4602-b60a-b4cd2d81fefd: 1.3 Another Test Page
7d654feb-bbb3-4d37-88ce-a8bf021a5e53: 1.2 Who needs Test Pagse
<|eot_id|>
<|start_header_id|>assistant<|end_header_id|>
prerequisite uuids on separate lines:
7d654feb-bbb3-4d37-88ce-a8bf021a5e53
<|eot_id|>

<|start_header_id|>user<|end_header_id|>
Identify if any of the following sections contain content that would be necessary to understand "5.3 Advanced Page"

possible prerequisites:
69384c47-c27c-4602-b60a-b4cd2d81fefd: 1.3 Another Test Page
7d654feb-bbb3-4d37-88ce-a8bf021a5e53: 1.2 Who needs Test Page
40a5b85a-5cb8-4b02-87b2-23873f7baa98: 3.1 More Test Page
<|eot_id|>
<|start_header_id|>assistant<|end_header_id|>
prerequisite uuids on separate lines:
7d654feb-bbb3-4d37-88ce-a8bf021a5e53
40a5b85a-5cb8-4b02-87b2-23873f7baa98
<|eot_id|>

<|start_header_id|>user<|end_header_id|>
Identify if any of the following sections contain content that would be necessary to understand "1.1 Other Test Page"

possible prerequisites:
69384c47-c27c-4602-b60a-b4cd2d81fefd: 1.3 Another Test Page
7d654feb-bbb3-4d37-88ce-a8bf021a5e53: 1.2 Who needs Test Pagse
<|eot_id|>
<|start_header_id|>assistant<|end_header_id|>
prerequisite uuids on separate lines:
no results
<|eot_id|>

<|start_header_id|>user<|end_header_id|>
Identify if any of the following sections contain content that would be necessary to understand "${page.title}"

possible prerequisites:
${group.map(g => `${g.id}: ${g.title}`).join('\n')}
<|eot_id|>
<|start_header_id|>assistant<|end_header_id|>
prerequisite uuids on separate lines:`;

      const request = await ollama.generate({
        model: 'llama3.1',
        prompt,
        raw: true,
        stream: false,
         "options": {
            "num_ctx": 4096
          }
      });

      const trimmed = request.response.trim().replace(/\s+/g, '\n');
      
      if (!trimmed.match(/^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\s*)+$/g)) {
        console.error('dumping werid response', request.response);
        continue;
      }

      const newPrereqIds = trimmed.split('\n');

      for (const newId of newPrereqIds) {
        prerequisites[newId] |= 0;
        prerequisites[newId]++;
      }
    }
  }

  for (const [id, weight] of Object.entries(prerequisites)) {
    stringifier.write([
      page.id,
      id,
      weight,
    ]);
  }

};
