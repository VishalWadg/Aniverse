CREATE TYPE feedback_group_status AS ENUM ('PENDING', 'APPROVED', 'DISCARDED', 'RESOLVED');

CREATE TABLE feedback_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    representative_embedding vector(768),
    status feedback_group_status NOT NULL DEFAULT 'PENDING',
    github_issue_number INT,
    github_issue_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_feedback_groups_embedding
ON feedback_groups USING hnsw (representative_embedding vector_cosine_ops);

ALTER TABLE feedbacks
ADD COLUMN group_id UUID REFERENCES feedback_groups(id) ON DELETE SET NULL;

-- Backfill: Create singleton groups for existing un-grouped feedbacks
DO $$
DECLARE
    f RECORD;
    new_group_id UUID;
BEGIN
    FOR f IN SELECT * FROM feedbacks WHERE group_id IS NULL LOOP
        INSERT INTO feedback_groups (title, representative_embedding, status)
        VALUES (LEFT(f.content, 255), f.embedding, 'PENDING')
        RETURNING id INTO new_group_id;

        UPDATE feedbacks SET group_id = new_group_id WHERE id = f.id;
    END LOOP;
END $$;

-- Cleanup legacy columns from feedbacks table
ALTER TABLE feedbacks
DROP COLUMN IF EXISTS status,
DROP COLUMN IF EXISTS impact_count,
DROP COLUMN IF EXISTS github_issue_id;