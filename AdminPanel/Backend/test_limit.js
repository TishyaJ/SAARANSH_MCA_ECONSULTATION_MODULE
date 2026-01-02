const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testNewLimit() {
  try {
    console.log('\n=== Testing with new limit (1000) ===\n');
    
    const result = await pool.query(
      'SELECT * FROM bill_1_comments ORDER BY created_at DESC LIMIT 1000'
    );
    
    console.log('Total comments returned:', result.rows.length);
    
    const stakeholderCounts = {};
    result.rows.forEach(r => {
      const type = r.stakeholder_type;
      stakeholderCounts[type] = (stakeholderCounts[type] || 0) + 1;
    });
    
    console.log('\nStakeholder counts:');
    console.table(stakeholderCounts);
    
    console.log('\n✅ All Industry Body records should now be included!');
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

testNewLimit();
