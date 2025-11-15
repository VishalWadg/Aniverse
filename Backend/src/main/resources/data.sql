-- ------------------------------
-- USERS
-- ------------------------------

INSERT INTO users (name, username, email, password, profile_pic, bio, created_at)
VALUES
('Alice Johnson', 'alice', 'alice@example.com', 'hash123', 'alice.jpg', 'Loves writing about anime and tech.', NOW()),
('Bob Smith', 'bob', 'bob@example.com', 'hash456', 'bob.png', 'Casual writer and commenter.', NOW()),
('Charlie Brown', 'charlie', 'charlie@example.com', 'hash789', NULL, 'Just here to read interesting posts.', NOW());


-- ------------------------------
-- POSTS
-- ------------------------------

-- Note: user_id = 1, 2, 3 correspond to the order users were inserted
INSERT INTO posts (title, content, is_deleted, created_at, author_id)
VALUES
('Exploring Ghibli Worlds', 'A deep dive into the magic of Studio Ghibli.', true, NOW(), 1),
('Why Attack on Titan’s Ending Works', 'A breakdown of symbolism and character arcs.', false, NOW(), 1),

('How I Learned Java the Hard Way', 'A story of failed projects and persistence.', false, NOW(), 2),
('Top 5 Underrated Anime of 2020', 'You might have missed these gems.', true, NOW(), 2),

('Worldbuilding Tips for Writers', 'How to create immersive fictional universes.', false, NOW(), 3);

-- ------------------------------
-- COMMENTS
-- ------------------------------

-- You can safely refer to posts by their insertion order
INSERT INTO comments (content, created_at, is_deleted, post_id, author_id)
VALUES
('Totally agree! Spirited Away is timeless.', NOW(), false, 1, 2),
('Interesting analysis, though I prefer Mononoke.', NOW(), false, 1, 3),

('The symbolism of freedom really hit me.', NOW(), false, 2, 3),
('Nice take, but I think Titan’s ending could be better.', NOW(), false, 2, 2),

('This helped me fix my first Spring Boot bug. Thanks!', NOW(), false, 3, 1),
('You explained the learning curve perfectly.', NOW(), false, 3, 3),

('Love underrated recommendations! Found 2 new shows.', NOW(), false, 4, 3),

('Great points about pacing and tone!', NOW(), false, 5, 2),
('Well-written! I’d love to see a part 2.', NOW(), false, 5, 1),

('Ghibli truly shaped our childhoods.', NOW(), false, 1, 1);
