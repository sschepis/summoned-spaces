-- Neon PostgreSQL Schema for Summoned Spaces
-- Optimized for quantum/holographic beacon architecture

-- ============================================
-- Enable Extensions
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Enhanced Users Table
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt BYTEA NOT NULL,
    node_public_key BYTEA NOT NULL,
    node_private_key_encrypted BYTEA NOT NULL,
    master_phase_key_encrypted BYTEA NOT NULL,
    pri_public_resonance JSONB NOT NULL,
    pri_private_resonance JSONB NOT NULL,
    pri_fingerprint TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Enhanced Beacons Table with Advanced Indexing
-- ============================================

CREATE TABLE IF NOT EXISTS beacons (
    beacon_id TEXT PRIMARY KEY,
    beacon_type TEXT NOT NULL,
    author_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    prime_indices JSONB NOT NULL,
    epoch BIGINT NOT NULL,
    fingerprint BYTEA NOT NULL,
    signature BYTEA NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Enhanced Spaces Table
-- ============================================

CREATE TABLE IF NOT EXISTS spaces (
    space_id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_public BOOLEAN NOT NULL DEFAULT false,
    owner_id TEXT REFERENCES users(user_id) ON DELETE SET NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Social Features Tables
-- ============================================

CREATE TABLE IF NOT EXISTS follows (
    follower_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    following_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id)
);

CREATE TABLE IF NOT EXISTS likes (
    id SERIAL PRIMARY KEY,
    post_beacon_id TEXT NOT NULL REFERENCES beacons(beacon_id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_beacon_id, user_id)
);

CREATE TABLE IF NOT EXISTS comments (
    comment_id TEXT PRIMARY KEY,
    post_beacon_id TEXT NOT NULL REFERENCES beacons(beacon_id) ON DELETE CASCADE,
    author_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    comment_beacon_id TEXT NOT NULL REFERENCES beacons(beacon_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    recipient_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    sender_id TEXT REFERENCES users(user_id) ON DELETE SET NULL,
    sender_username TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Quaternionic Chat Table
-- ============================================

CREATE TABLE IF NOT EXISTS quaternionic_messages (
    message_id TEXT PRIMARY KEY,
    sender_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    receiver_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    room_id TEXT,
    phase_alignment REAL NOT NULL,
    entropy_level REAL NOT NULL,
    twist_angle REAL NOT NULL,
    is_quantum_delivered BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Performance Indexes
-- ============================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_pri_fingerprint ON users(pri_fingerprint);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Beacon indexes for quantum operations
CREATE INDEX IF NOT EXISTS idx_beacons_author_type ON beacons(author_id, beacon_type);
CREATE INDEX IF NOT EXISTS idx_beacons_type_created ON beacons(beacon_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_beacons_epoch ON beacons(epoch);
CREATE INDEX IF NOT EXISTS idx_beacons_created_at ON beacons(created_at DESC);

-- JSONB indexes for quantum prime indices
CREATE INDEX IF NOT EXISTS idx_beacons_prime_indices ON beacons USING GIN (prime_indices);
CREATE INDEX IF NOT EXISTS idx_beacons_metadata ON beacons USING GIN (metadata);

-- Space-specific beacon queries
CREATE INDEX IF NOT EXISTS idx_beacons_space_id ON beacons ((metadata->>'space_id')) WHERE metadata->>'space_id' IS NOT NULL;

-- User resonance indexes
CREATE INDEX IF NOT EXISTS idx_users_public_resonance ON users USING GIN (pri_public_resonance);
CREATE INDEX IF NOT EXISTS idx_users_private_resonance ON users USING GIN (pri_private_resonance);

-- Space indexes
CREATE INDEX IF NOT EXISTS idx_spaces_public ON spaces(is_public, created_at DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_spaces_owner ON spaces(owner_id) WHERE owner_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_spaces_name ON spaces(name);

-- Social indexes
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_likes_beacon ON likes(post_beacon_id);
CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_beacon_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(recipient_id) WHERE read = false;

-- Quaternionic message indexes
CREATE INDEX IF NOT EXISTS idx_qmsg_sender ON quaternionic_messages(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_qmsg_receiver ON quaternionic_messages(receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_qmsg_room ON quaternionic_messages(room_id, created_at DESC) WHERE room_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_qmsg_quantum ON quaternionic_messages(phase_alignment, entropy_level) WHERE is_quantum_delivered = true;

-- ============================================
-- Quantum Resonance Functions
-- ============================================

-- Function to calculate resonance strength between two prime indices
CREATE OR REPLACE FUNCTION calculate_resonance_strength(
    prime_indices_a JSONB,
    prime_indices_b JSONB
) RETURNS NUMERIC AS $$
DECLARE
    base_resonance NUMERIC;
    amplification_sync NUMERIC;
    phase_alignment NUMERIC;
    entropy_balance NUMERIC;
    resonance_strength NUMERIC;
BEGIN
    -- Extract values from JSONB
    base_resonance := ((prime_indices_a->>'base_resonance')::NUMERIC + 
                      (prime_indices_b->>'base_resonance')::NUMERIC) / 2;
    
    amplification_sync := ABS((prime_indices_a->>'amplification_factor')::NUMERIC - 
                             (prime_indices_b->>'amplification_factor')::NUMERIC);
    
    phase_alignment := 1 - ABS((prime_indices_a->>'phase_alignment')::NUMERIC - 
                              (prime_indices_b->>'phase_alignment')::NUMERIC);
    
    entropy_balance := 1 - ABS((prime_indices_a->>'entropy_level')::NUMERIC - 
                              (prime_indices_b->>'entropy_level')::NUMERIC);
    
    -- Calculate combined resonance strength
    resonance_strength := (
        base_resonance * 0.3 +
        (1 - amplification_sync) * 0.2 +
        phase_alignment * 0.2 +
        entropy_balance * 0.15 +
        0.15 -- Prime sequence correlation placeholder
    );
    
    -- Clamp between 0 and 1
    RETURN GREATEST(0, LEAST(1, resonance_strength));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to find resonant beacons for a user
CREATE OR REPLACE FUNCTION find_resonant_beacons(
    user_id_param TEXT,
    threshold NUMERIC DEFAULT 0.7,
    max_results INTEGER DEFAULT 10
) RETURNS TABLE (
    beacon_id TEXT,
    resonance_score NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.beacon_id,
        calculate_resonance_strength(u.pri_public_resonance, b.prime_indices) as resonance_score
    FROM beacons b
    CROSS JOIN users u
    WHERE u.user_id = user_id_param
      AND b.author_id != user_id_param
      AND calculate_resonance_strength(u.pri_public_resonance, b.prime_indices) >= threshold
    ORDER BY resonance_score DESC
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Automatic Timestamp Updates
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at columns
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_beacons_updated_at 
    BEFORE UPDATE ON beacons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spaces_updated_at 
    BEFORE UPDATE ON spaces
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Quantum Search and Analytics Views
-- ============================================

-- View for quantum resonance analytics
CREATE OR REPLACE VIEW quantum_resonance_stats AS
SELECT 
    b.beacon_type,
    COUNT(*) as total_beacons,
    AVG((b.prime_indices->>'base_resonance')::NUMERIC) as avg_base_resonance,
    AVG((b.prime_indices->>'amplification_factor')::NUMERIC) as avg_amplification,
    AVG((b.prime_indices->>'phase_alignment')::NUMERIC) as avg_phase_alignment,
    AVG((b.prime_indices->>'entropy_level')::NUMERIC) as avg_entropy
FROM beacons b
GROUP BY b.beacon_type;

-- View for space activity analytics
CREATE OR REPLACE VIEW space_activity_stats AS
SELECT 
    s.space_id,
    s.name,
    s.is_public,
    COUNT(b.beacon_id) as beacon_count,
    COUNT(DISTINCT b.author_id) as unique_contributors,
    MAX(b.created_at) as last_activity
FROM spaces s
LEFT JOIN beacons b ON s.space_id = b.metadata->>'space_id'
GROUP BY s.space_id, s.name, s.is_public;

-- View for user quantum profile
CREATE OR REPLACE VIEW user_quantum_profiles AS
SELECT 
    u.user_id,
    u.username,
    (u.pri_public_resonance->>'base_resonance')::NUMERIC as base_resonance,
    (u.pri_public_resonance->>'amplification_factor')::NUMERIC as amplification_factor,
    (u.pri_public_resonance->>'phase_alignment')::NUMERIC as phase_alignment,
    (u.pri_public_resonance->>'entropy_level')::NUMERIC as entropy_level,
    COUNT(b.beacon_id) as total_beacons,
    COUNT(f.following_id) as following_count,
    COUNT(followers.follower_id) as follower_count
FROM users u
LEFT JOIN beacons b ON u.user_id = b.author_id
LEFT JOIN follows f ON u.user_id = f.follower_id
LEFT JOIN follows followers ON u.user_id = followers.following_id
GROUP BY u.user_id, u.username, u.pri_public_resonance;

-- ============================================
-- Security and Data Integrity
-- ============================================

-- Row Level Security (RLS) for sensitive data
-- Disabled for now as we handle authentication at application layer
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE beacons ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE quaternionic_messages ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be expanded)
-- Note: In Neon, we'll handle authentication at the application layer
-- These policies are commented out as Neon doesn't have Supabase's 'authenticated' role
/*
CREATE POLICY user_own_data ON users
    FOR ALL TO neondb_owner
    USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY beacon_visibility ON beacons
    FOR SELECT TO neondb_owner
    USING (true); -- All beacons visible for now

CREATE POLICY quaternionic_message_privacy ON quaternionic_messages
    FOR ALL TO neondb_owner
    USING (
        sender_id = current_setting('app.current_user_id', true) OR
        receiver_id = current_setting('app.current_user_id', true)
    );
*/

-- Data validation constraints
ALTER TABLE beacons ADD CONSTRAINT valid_epoch CHECK (epoch > 0);
ALTER TABLE quaternionic_messages ADD CONSTRAINT valid_phase_alignment 
    CHECK (phase_alignment >= 0 AND phase_alignment <= 1);
ALTER TABLE quaternionic_messages ADD CONSTRAINT valid_entropy_level 
    CHECK (entropy_level >= 0 AND entropy_level <= 1);

-- ============================================
-- Initialization Complete
-- ============================================

-- Log successful schema creation
DO $$
BEGIN
    RAISE NOTICE 'Summoned Spaces Neon PostgreSQL schema initialized successfully';
    RAISE NOTICE 'Quantum resonance functions and indexes are ready';
    RAISE NOTICE 'Your Neon connection: postgresql://neondb_owner:npg_lTUFQG2f8OjV@ep-bold-lake-adgkzwlk-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
END $$;