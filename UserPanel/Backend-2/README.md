# MCA SIH Backend

Backend API for MCA SIH E-Consultation platform. Stores comments and form submissions to PostgreSQL (Neon).

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure `.env` file with your Neon database URL

3. Run development server:
```bash
npm run dev
```

Or production:
```bash
npm start
```

## API Endpoints

### POST /api/submit-comment
Submit comment/form data to the database.

**Request Body:**
```json
{
  "documentId": 1,
  "section": "Section 1",
  "commentData": "This is my detailed comment",
  "sentiment": "positive",
  "summary": "Brief summary of the comment",
  "commenterName": "John Doe",
  "commenterEmail": "john@example.com",
  "commenterPhone": "9876543210",
  "commenterAddress": "123 Main St",
  "idType": "aadhar",
  "idNumber": "123456789012",
  "stakeholderType": "individual",
  "supportedDocFilename": "document.pdf",
  "supportedDocData": null
}
```

**Response:**
```json
{
  "success": true,
  "message": "Comment submitted successfully",
  "data": {
    "comments_id": 1,
    "document_id": 1,
    "section": "Section 1",
    ...
  }
}
```

### GET /api/comments/:documentId
Retrieve all comments for a specific document.

**Response:**
```json
{
  "success": true,
  "data": [...]
}
```

### GET /api/comments
Retrieve all comments across all documents (admin only).

**Response:**
```json
{
  "success": true,
  "data": [...]
}
```

### PUT /api/comments/:commentId
Update an existing comment.

**Request Body:**
```json
{
  "commentData": "Updated comment text",
  "sentiment": "negative",
  "summary": "Updated summary"
}
```

## Database Table Schema

```sql
CREATE TABLE IF NOT EXISTS bill_1_comments (
    comments_id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL REFERENCES documents(document_id) ON DELETE CASCADE,
    section VARCHAR(255),
    comment_data TEXT NOT NULL,
    sentiment VARCHAR(20),
    summary TEXT,
    supported_doc BYTEA,
    supported_doc_filename VARCHAR(255),
    commenter_name VARCHAR(255),
    commenter_email VARCHAR(320),
    commenter_phone VARCHAR(30),
    commenter_address TEXT,
    id_type VARCHAR(100),
    id_number VARCHAR(200),
    stakeholder_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

  -- Migration note:
  -- If you are upgrading an existing database, run the SQL in `migrations/20251205_add_ml_columns.sql` to add ML metadata columns (`confidence_score`, `ml_used`, `ml_model`).
```

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string (Neon)
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment mode (development/production)
