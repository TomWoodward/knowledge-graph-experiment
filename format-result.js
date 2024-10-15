import { sectionPages } from './lib/content.js';
import { db } from './lib/neo4j.js';

for (const [i, page] of sectionPages.entries()) {

  const { records } = await db.executeQuery(`
    MATCH (p:Page {id: $id})-[:has_prerequisite_v1]->(d:Page)
    WHERE NOT EXISTS(
      (p)-[*2..]->(d)
    ) RETURN d
  `,
    { id: page.id },
    { database: 'neo4j' }
  );

  console.log(`## ${page.title}
### Prerequisites`);

  if (records.length < 1) {
    console.log('none');
    continue;
  }

  const prerequisiteIds = records.map(record => record.get('d').properties.id);

  for (const outputPage of sectionPages) {
    if (!prerequisiteIds.includes(outputPage.id)) continue;
    console.log('  - ' + outputPage.title);
  }
  console.log('\n');
};


db.close();
