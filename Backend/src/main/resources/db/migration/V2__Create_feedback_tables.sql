-- Enable pgvector extension (required for vector columns)
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Create the feedback status ENUM
CREATE TYPE feedback_status AS ENUM ('NEW', 'IN_REVIEW', 'LINKED', 'RESOLVED', 'DISMISSED');

-- 2. Create feedbacks Table
CREATE TABLE feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    embedding vector(768), 
    impact_count INT NOT NULL DEFAULT 1,
    status feedback_status NOT NULL DEFAULT 'NEW',
    github_issue_id INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create tags Catalog Table (with its own vector column for semantic tag suggestions)
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    embedding vector(768),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create feedback_tags Junction Table (Many-to-Many relationship)
CREATE TABLE feedback_tags (
    feedback_id UUID NOT NULL REFERENCES feedbacks(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (feedback_id, tag_id)
);

-- 5. Regular Indexes for fast lookup performance
CREATE INDEX idx_feedbacks_status ON feedbacks(status);
CREATE INDEX idx_feedback_tags_tag_id ON feedback_tags(tag_id);

-- 6. HNSW Vector Indexes for similarity search
-- Using vector_cosine_ops because we will use cosine similarity (<=> operator)
CREATE INDEX idx_feedbacks_embedding ON feedbacks USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_tags_embedding ON tags USING hnsw (embedding vector_cosine_ops);
