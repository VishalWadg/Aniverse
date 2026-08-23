CREATE TABLE pending_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_type VARCHAR(50) NOT NULL, -- e.g., 'EMBED_FEEDBACK', 'CREATE_GITHUB_ISSUE'
    reference_id UUID NOT NULL, -- e.g., feedback ID or feedback group ID
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    attempt_count INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 5,
    next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pending_jobs_status_next_attempt ON pending_jobs (status, next_attempt_at);

ALTER TYPE feedback_group_status ADD VALUE IF NOT EXISTS 'AWAITING_ISSUE' AFTER 'PENDING';