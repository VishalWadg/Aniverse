-- ------------------------------
-- USERS
-- ------------------------------
-- User 1 (Alice): 550e8400-e29b-41d4-a716-446655440001
-- User 2 (Bob):   550e8400-e29b-41d4-a716-446655440002
-- User 3 (Charlie):550e8400-e29b-41d4-a716-446655440003

INSERT INTO users (id, name, username, email, password, profile_pic, bio, role, created_at)
VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Alice Johnson', 'alice', 'alice@example.com', 'hash1234', 'alice.jpg', 'Loves writing about anime and tech.', 'ADMIN', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Bob Smith', 'bob', 'bob@example.com', 'hash4564', 'bob.png', 'Casual writer and commenter.', 'USER', NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Charlie Brown', 'charlie', 'charlie@example.com', 'hash7890', NULL, 'Just here to read interesting posts.', 'USER', NOW());


-- ------------------------------
-- POSTS
-- ------------------------------
-- P1: 660e8400-e29b-41d4-a716-446655440001
-- P2: 660e8400-e29b-41d4-a716-446655440002
-- P3: 660e8400-e29b-41d4-a716-446655440003
-- P4: 660e8400-e29b-41d4-a716-446655440004
-- P5: 660e8400-e29b-41d4-a716-446655440005

INSERT INTO posts (id, title, content, is_deleted, created_at, author_id)
VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Exploring Ghibli Worlds', 'A deep dive into the magic of Studio Ghibli.', true, NOW(), '550e8400-e29b-41d4-a716-446655440001'),
('660e8400-e29b-41d4-a716-446655440002', 'Why Attack on Titan’s Ending Works', 'A breakdown of symbolism and character arcs.', false, NOW(), '550e8400-e29b-41d4-a716-446655440001'),

('660e8400-e29b-41d4-a716-446655440003', 'How I Learned Java the Hard Way', 'A story of failed projects and persistence.', false, NOW(), '550e8400-e29b-41d4-a716-446655440002'),
('660e8400-e29b-41d4-a716-446655440004', 'Top 5 Underrated Anime of 2020', 'You might have missed these gems.', true, NOW(), '550e8400-e29b-41d4-a716-446655440002'),

('660e8400-e29b-41d4-a716-446655440005', 'Worldbuilding Tips for Writers', 'How to create immersive fictional universes.', false, NOW(), '550e8400-e29b-41d4-a716-446655440003');


-- ------------------------------
-- COMMENTS
-- ------------------------------
INSERT INTO comments (id, content, created_at, is_deleted, post_id, author_id)
VALUES
-- Comments on Post 1 (Exploring Ghibli Worlds)
('770e8400-e29b-41d4-a716-446655440001', 'Totally agree! Spirited Away is timeless.', NOW(), false, '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440002', 'Interesting analysis, though I prefer Mononoke.', NOW(), false, '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003'),
('770e8400-e29b-41d4-a716-446655440010', 'Ghibli truly shaped our childhoods.', NOW(), false, '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001'),

-- Comments on Post 2 (Why Attack on Titan’s Ending Works)
('770e8400-e29b-41d4-a716-446655440003', 'The symbolism of freedom really hit me.', NOW(), false, '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003'),
('770e8400-e29b-41d4-a716-446655440004', 'Nice take, but I think Titan’s ending could be better.', NOW(), false, '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002'),

-- Comments on Post 3 (How I Learned Java the Hard Way)
('770e8400-e29b-41d4-a716-446655440005', 'This helped me fix my first Spring Boot bug. Thanks!', NOW(), false, '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440006', 'You explained the learning curve perfectly.', NOW(), false, '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003'),

-- Comments on Post 4 (Top 5 Underrated Anime of 2020)
('770e8400-e29b-41d4-a716-446655440007', 'Love underrated recommendations! Found 2 new shows.', NOW(), false, '660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003'),

-- Comments on Post 5 (Worldbuilding Tips for Writers)
('770e8400-e29b-41d4-a716-446655440008', 'Great points about pacing and tone!', NOW(), false, '660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440009', 'Well-written! I’d love to see a part 2.', NOW(), false, '660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001');