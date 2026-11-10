const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function applySchema() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:Div@postgre1888@localhost:5432/DWMS_TestDB';
  console.log('[DWMS] Connecting to PostgreSQL to execute schema migration...');

  const client = new Client({ connectionString });
  await client.connect();
  console.log('[DWMS] Connected to PostgreSQL successfully!');

  const sqlPath = path.join(__dirname, 'dwms_wear_monitoring_schema_v1.0.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('[DWMS] Executing dwms_wear_monitoring_schema_v1.0.sql...');
  await client.query(sql);

  console.log('[DWMS] ✓ Schema dwms and all 35 tables, 7 views, triggers and partitions created successfully!');

  // Verify created tables in dwms schema
  const res = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'dwms'
    ORDER BY table_name;
  `);

  console.log(`[DWMS] Total tables and views in schema 'dwms': ${res.rows.length}`);
  console.log(res.rows.map(r => r.table_name).join(', '));

  await client.end();
}

applySchema().catch(err => {
  console.error('[DWMS] Error applying schema:', err);
  process.exit(1);
});

