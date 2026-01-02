const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkVariations() {
  try {
    console.log('\n=== Checking for stakeholder type variations ===\n');
    
    // Get all Industry Body records
    const industryRecords = await pool.query(
      `SELECT comments_id, commenter_name, stakeholder_type, 
       LENGTH(stakeholder_type) as len,
       ENCODE(stakeholder_type::bytea, 'hex') as hex
       FROM bill_1_comments 
       WHERE stakeholder_type ILIKE '%industry%'
       ORDER BY comments_id`
    );
    
    console.log('Industry-related records:');
    console.table(industryRecords.rows);
    
    // Check all unique stakeholder types with their exact byte representation
    const allTypes = await pool.query(
      `SELECT DISTINCT stakeholder_type, 
       LENGTH(stakeholder_type) as len,
       COUNT(*) as count
       FROM bill_1_comments 
       GROUP BY stakeholder_type
       ORDER BY stakeholder_type`
    );
    
    console.log('\nAll unique stakeholder types:');
    console.table(allTypes.rows);
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

checkVariations();
