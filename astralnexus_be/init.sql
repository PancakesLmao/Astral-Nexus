-- This script is automatically run when the PostgreSQL container starts

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Game Categories table
CREATE TABLE IF NOT EXISTS game_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table - Now uses Supabase UUID directly as the primary ID
-- This eliminates the need for legacy provider_id and maintains consistency
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY, -- Supabase UUID stored as VARCHAR for compatibility
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    picture TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Posts table - author_id now references Supabase user ID
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    published BOOLEAN DEFAULT FALSE,
    visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'followers')),
    game_id UUID REFERENCES game_categories(id) ON DELETE SET NULL,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comments table - author_id now references Supabase user ID
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Post Likes table (Many-to-many relationship)
CREATE TABLE IF NOT EXISTS post_likes (
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id)
);

-- Comment Likes table (Many-to-many relationship)
CREATE TABLE IF NOT EXISTS comment_likes (
    comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (comment_id, user_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'mention', 'system')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Administrators table (for future admin panel - NOT used for OAuth)
CREATE TABLE IF NOT EXISTS administrators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin', 'moderator')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
CREATE INDEX IF NOT EXISTS idx_posts_visibility ON posts(visibility);
CREATE INDEX IF NOT EXISTS idx_posts_game_id ON posts(game_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_comment_id ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_post_id ON notifications(post_id);
CREATE INDEX IF NOT EXISTS idx_notifications_comment_id ON notifications(comment_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_administrators_email ON administrators(email);
CREATE INDEX IF NOT EXISTS idx_administrators_role ON administrators(role);

-- Update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updating likes_count in posts
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger for updating comments_count in posts
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger for updating likes_count in comments
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE comments SET likes_count = likes_count - 1 WHERE id = OLD.comment_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_administrators_updated_at BEFORE UPDATE ON administrators FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_post_likes_count_trigger AFTER INSERT OR DELETE ON post_likes FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();
CREATE TRIGGER update_post_comments_count_trigger AFTER INSERT OR DELETE ON comments FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();
CREATE TRIGGER update_comment_likes_count_trigger AFTER INSERT OR DELETE ON comment_likes FOR EACH ROW EXECUTE FUNCTION update_comment_likes_count();

-- Insert sample data for development
-- Insert game categories
INSERT INTO game_categories (game_name) VALUES
('Genshin Impact'),
('Honkai Star Rail'),
('Zenless Zone Zero'),
('Honkai Impact 3rd'),
('All Games')
ON CONFLICT (game_name) DO NOTHING;

-- Insert sample admin user
DO $$
DECLARE
    admin_user_id VARCHAR(255);
    all_games_id UUID;
    welcome_post_id UUID;
BEGIN
    -- Define a fixed UUID for the admin user (for development/sample data)
    admin_user_id := '00000000-0000-0000-0000-000000000001';
    
    -- Insert admin user if not exists
    INSERT INTO users (id, email, name, picture) 
    VALUES (admin_user_id, 'admin@astralnexus.com', 'AstralNexus Admin', 'https://korekawaii.com/cdn/shop/files/Sdb20e75f940c4a6a91a5f540f45a8a48c.webp?v=1695314987')
    ON CONFLICT (email) DO NOTHING;
    
    -- Get user ID
    SELECT id INTO admin_user_id FROM users WHERE email = 'admin@astralnexus.com';
    
    -- Get game category ID
    SELECT id INTO all_games_id FROM game_categories WHERE game_name = 'All Games';
    
    -- Insert welcome post if not exists
    INSERT INTO posts (title, content, author_id, published, visibility, game_id) 
    VALUES (
        'Welcome to AstralNexus!', 
        'Welcome to AstralNexus - your premier destination for gaming content and community discussions!

This platform is designed to bring together gamers from all backgrounds to share experiences, tips, and connect with fellow enthusiasts. Whether you''re into action RPGs, strategy games, or indie titles, you''ll find a home here.

Features of our platform:
• Share gaming experiences and achievements
• Discuss strategies and tips
• Connect with fellow gamers
• Stay updated with gaming news
• Join community events and tournaments

Start exploring, create your first post, and join our growing community! We''re excited to have you here.

Happy gaming!', 
        admin_user_id, 
        TRUE, 
        'public', 
        all_games_id
    ) 
    ON CONFLICT DO NOTHING
    RETURNING id INTO welcome_post_id;
    
    -- If post already exists, get its ID
    IF welcome_post_id IS NULL THEN
        SELECT id INTO welcome_post_id FROM posts WHERE title = 'Welcome to AstralNexus!';
    END IF;
    
    -- Insert welcome comment if not exists  
    INSERT INTO comments (content, post_id, author_id) 
    VALUES (
        'Thanks for joining AstralNexus! 

Please take a moment to:
- Read our community guidelines
- Complete your profile setup  
- Explore different game categories
- Introduce yourself to the community

If you have any questions, feel free to ask! Our community is here to help.

Welcome aboard!', 
        welcome_post_id, 
        admin_user_id
    )
    ON CONFLICT DO NOTHING;
    
    -- Insert a second sample post
    INSERT INTO posts (title, content, author_id, published, visibility, game_id) 
    VALUES (
        'Community Guidelines and Best Practices', 
        'To maintain a positive and welcoming environment for all gamers, please follow these community guidelines:

**Be Respectful**
• Treat all members with kindness and respect
• No harassment, bullying, or toxic behavior
• Respect different gaming preferences and skill levels

**Quality Content**
• Share meaningful gaming experiences
• Provide helpful tips and strategies
• Use descriptive titles for your posts
• Add relevant game categories

**Gaming Discussions**
• Stay on topic for each game category
• Avoid spoilers without proper warnings
• Share constructive feedback and reviews
• Support fellow gamers in their journeys

**What''s Not Allowed**
• Spam or excessive self-promotion
• Offensive language or inappropriate content
• Sharing personal information
• Cheating methods or exploits

Let''s build an amazing gaming community together! 🎊', 
        admin_user_id, 
        TRUE, 
        'public', 
        all_games_id
    )
    ON CONFLICT DO NOTHING;
    
END $$;

-- Insert default administrator account
INSERT INTO administrators (email, name, role) 
VALUES ('admin@astralnexus.com', 'AstralNexus Admin', 'super_admin')
ON CONFLICT (email) DO NOTHING;