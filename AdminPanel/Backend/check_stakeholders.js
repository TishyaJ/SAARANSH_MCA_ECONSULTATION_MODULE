const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkStakeholders() {
  try {
    console.log('\n=== Checking Bill 1 Stakeholders ===\n');
    const result = await pool.query(
      `SELECT stakeholder_type, COUNT(*) as count 
       FROM bill_1_comments 
       GROUP BY stakeholder_type 
       ORDER BY count DESC`
    );
    
    console.log('Stakeholder Types in Bill 1:');
    console.table(result.rows);
    
    console.log('\n=== Sample Records ===\n');
    const samples = await pool.query(
      `SELECT comments_id, commenter_name, stakeholder_type 
       FROM bill_1_comments 
       LIMIT 10`
    );
    console.table(samples.rows);
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

checkStakeholders();
