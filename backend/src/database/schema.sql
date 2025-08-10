-- CupTrack Database Schema
-- This file contains the complete database schema for the CupTrack application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- For bcrypt hashed passwords
    auth_provider VARCHAR(20) NOT NULL DEFAULT 'email' CHECK (auth_provider IN ('email', 'google', 'apple')), -- OAuth provider
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('user', 'admin'))
);

-- Brews table (main brewing records)
CREATE TABLE IF NOT EXISTS brews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    brew_number VARCHAR(50) NOT NULL,
    user_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_shared BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, brew_number)
);

-- Coffee bean information
CREATE TABLE IF NOT EXISTS brew_beans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brew_id UUID NOT NULL REFERENCES brews(id) ON DELETE CASCADE,
    brand VARCHAR(100) NOT NULL,
    origin VARCHAR(100) NOT NULL,
    processing_method VARCHAR(50) NOT NULL CHECK (processing_method IN ('washed', 'natural', 'honey')),
    altitude INTEGER CHECK (altitude >= 0 AND altitude <= 3000),
    roasting_date DATE,
    roasting_level VARCHAR(50)
);

-- Brewing parameters
CREATE TABLE IF NOT EXISTS brew_parameters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brew_id UUID NOT NULL REFERENCES brews(id) ON DELETE CASCADE,
    brewing_method VARCHAR(50) NOT NULL CHECK (brewing_method IN ('pour-over', 'french-press', 'aeropress')),
    grinder_model VARCHAR(100) NOT NULL,
    grinder_setting VARCHAR(50) NOT NULL,
    water_temperature DECIMAL(4,1) NOT NULL CHECK (water_temperature >= 80.0 AND water_temperature <= 100.0),
    filtering_tools VARCHAR(100),
    water_quality VARCHAR(100)
);

-- Dynamic turbulence steps
CREATE TABLE IF NOT EXISTS turbulence_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brew_id UUID NOT NULL REFERENCES brews(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL CHECK (step_order > 0),
    action_time DECIMAL(6,2),
    action_details TEXT,
    volume DECIMAL(8,2),
    UNIQUE(brew_id, step_order)
);

-- Brewing measurements
CREATE TABLE IF NOT EXISTS brew_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brew_id UUID NOT NULL REFERENCES brews(id) ON DELETE CASCADE,
    coffee_beans_weight DECIMAL(6,2) NOT NULL CHECK (coffee_beans_weight > 0),
    water_weight DECIMAL(8,2) NOT NULL CHECK (water_weight > 0),
    coffee_to_water_ratio DECIMAL(8,4) GENERATED ALWAYS AS (coffee_beans_weight / water_weight) STORED,
    brewed_coffee_weight DECIMAL(8,2) CHECK (brewed_coffee_weight > 0),
    tds_percentage DECIMAL(4,2) CHECK (tds_percentage >= 0 AND tds_percentage <= 3)
);

-- Tasting evaluations
CREATE TABLE IF NOT EXISTS brew_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brew_id UUID NOT NULL REFERENCES brews(id) ON DELETE CASCADE,
    evaluation_type VARCHAR(20) NOT NULL CHECK (evaluation_type IN ('quick', 'sca', 'cva_affective', 'cva_descriptive')),
    scores JSONB NOT NULL,
    overall_quality DECIMAL(4,2),
    final_score DECIMAL(6,2),
    notes TEXT
);

-- User collections
CREATE TABLE IF NOT EXISTS user_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Collection items (many-to-many relationship)
CREATE TABLE IF NOT EXISTS collection_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id UUID NOT NULL REFERENCES user_collections(id) ON DELETE CASCADE,
    brew_id UUID NOT NULL REFERENCES brews(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(collection_id, brew_id)
);

-- User favorites
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    brew_id UUID NOT NULL REFERENCES brews(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, brew_id)
);

-- Community interactions (Future Phase)
CREATE TABLE IF NOT EXISTS community_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    brew_id UUID NOT NULL REFERENCES brews(id) ON DELETE CASCADE,
    interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('like', 'comment', 'share')),
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- User follows (Future Phase)
CREATE TABLE IF NOT EXISTS user_follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    followed_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, followed_id),
    CHECK (follower_id != followed_id)
);

-- Weekly summaries
CREATE TABLE IF NOT EXISTS weekly_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    total_brews INTEGER DEFAULT 0,
    average_quality DECIMAL(4,2),
    summary_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, week_start)
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    changes JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_brews_user_id ON brews(user_id);
CREATE INDEX IF NOT EXISTS idx_brews_created_at ON brews(created_at);
CREATE INDEX IF NOT EXISTS idx_brew_evaluations_overall_quality ON brew_evaluations(overall_quality);
CREATE INDEX IF NOT EXISTS idx_brew_evaluations_final_score ON brew_evaluations(final_score);
CREATE INDEX IF NOT EXISTS idx_brew_measurements_ratio ON brew_measurements(coffee_to_water_ratio);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_collection_id ON collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_weekly_summaries_user_week ON weekly_summaries(user_id, week_start);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE brews ENABLE ROW LEVEL SECURITY;
ALTER TABLE brew_beans ENABLE ROW LEVEL SECURITY;
ALTER TABLE brew_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE turbulence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE brew_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE brew_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_summaries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user data isolation
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their own brews" ON brews
    FOR ALL USING (auth.uid() = user_id OR is_shared = true);

CREATE POLICY "Users can manage their own brews" ON brews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brews" ON brews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own brews" ON brews
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for related brew data (beans, parameters, measurements, etc.)
CREATE POLICY "Users can access brew data for their brews" ON brew_beans
    FOR ALL USING (EXISTS (
        SELECT 1 FROM brews WHERE brews.id = brew_beans.brew_id 
        AND (brews.user_id = auth.uid() OR brews.is_shared = true)
    ));

CREATE POLICY "Users can access brew parameters for their brews" ON brew_parameters
    FOR ALL USING (EXISTS (
        SELECT 1 FROM brews WHERE brews.id = brew_parameters.brew_id 
        AND (brews.user_id = auth.uid() OR brews.is_shared = true)
    ));

CREATE POLICY "Users can access turbulence steps for their brews" ON turbulence_steps
    FOR ALL USING (EXISTS (
        SELECT 1 FROM brews WHERE brews.id = turbulence_steps.brew_id 
        AND (brews.user_id = auth.uid() OR brews.is_shared = true)
    ));

CREATE POLICY "Users can access measurements for their brews" ON brew_measurements
    FOR ALL USING (EXISTS (
        SELECT 1 FROM brews WHERE brews.id = brew_measurements.brew_id 
        AND (brews.user_id = auth.uid() OR brews.is_shared = true)
    ));

CREATE POLICY "Users can access evaluations for their brews" ON brew_evaluations
    FOR ALL USING (EXISTS (
        SELECT 1 FROM brews WHERE brews.id = brew_evaluations.brew_id 
        AND (brews.user_id = auth.uid() OR brews.is_shared = true)
    ));

-- Policies for collections and favorites
CREATE POLICY "Users can manage their own collections" ON user_collections
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their collection items" ON collection_items
    FOR ALL USING (EXISTS (
        SELECT 1 FROM user_collections WHERE user_collections.id = collection_items.collection_id 
        AND user_collections.user_id = auth.uid()
    ));

CREATE POLICY "Users can manage their own favorites" ON user_favorites
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their weekly summaries" ON weekly_summaries
    FOR ALL USING (auth.uid() = user_id);

-- Admin override policies
CREATE POLICY "Admins can view all data" ON users
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
    ));

-- Functions for automatic brew number generation
CREATE OR REPLACE FUNCTION generate_brew_number(user_uuid UUID)
RETURNS VARCHAR(50) AS $$
DECLARE
    next_number INTEGER;
    result VARCHAR(50);
BEGIN
    SELECT COALESCE(MAX(CAST(REGEXP_REPLACE(brew_number, '[^0-9]', '', 'g') AS INTEGER)), 0) + 1
    INTO next_number
    FROM brews
    WHERE user_id = user_uuid
    AND brew_number ~ '^BREW-[0-9]+$';
    
    result := 'BREW-' || LPAD(next_number::TEXT, 4, '0');
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brews_updated_at BEFORE UPDATE ON brews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();