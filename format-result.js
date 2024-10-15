import { sectionPages } from './lib/content.js';
import { db } from './lib/neo4j.js';

for (const [i, page] of sectionPages.entries()) {

  const prerequisiteRecords = (await db.executeQuery(`
    MATCH (p:Page {id: $id})-[r:has_prerequisite_v1]->(d:Page)
    WHERE NOT EXISTS(
      (p)-[*2..]->(d)
    ) RETURN d, r
  `,
    { id: page.id },
    { database: 'neo4j' }
  )).records;

  const dependsOnRecords = (await db.executeQuery(`
    MATCH (p:Page {id: $id})-[r:has_prerequisite_v1]->(d:Page)
    WHERE EXISTS(
      (p)-[*2..]->(d)
    ) RETURN d, r
  `,
    { id: page.id },
    { database: 'neo4j' }
  )).records;

  console.log(`## ${page.title}
### Direct Dependencies`);

  if (prerequisiteRecords.length < 1) {
    console.log('none');
    continue;
  }

  for (const outputPage of sectionPages) {
    const prerequisite = prerequisiteRecords.find(record => record.get('d').properties.id === outputPage.id);
    if (!prerequisite) continue;

    const weight = prerequisite.get('r').properties.weight.toNumber();
    console.log(`  - ${outputPage.title} (${(weight/10).toFixed(2)})`);
  }

  console.log(`### Indirect Dependencies`);

  if (dependsOnRecords.length < 1) {
    console.log('none');
    continue;
  }

  for (const outputPage of sectionPages) {
    const dependsOn = dependsOnRecords.find(record => record.get('d').properties.id === outputPage.id);
    if (!dependsOn) continue;

    const weight = dependsOn.get('r').properties.weight.toNumber();
    console.log(`  - ${outputPage.title} (${(weight/10).toFixed(2)})`);
  }
  console.log('\n');
};


db.close();
