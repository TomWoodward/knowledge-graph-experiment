import neo4j from 'neo4j-driver';

const URI = 'neo4j://localhost'
const USER = 'neo4j'
const PASSWORD = 'neo4j'

export const db = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
