-- PHASE 15: COLLECTIVE CHALLENGES & NEIGHBORHOOD GOVERNANCE

-- Table to manage neighborhood-wide challenges
CREATE TABLE IF NOT EXISTS neighborhood_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    neighborhood_id TEXT NOT NULL, -- Logical neighborhood name or ID
    type TEXT NOT NULL CHECK (type IN ('savings_goal', 'volume_goal', 'new_neighbors_goal')),
    title TEXT NOT NULL,
    description TEXT,
    target_value DECIMAL(12,2) NOT NULL,
    current_value DECIMAL(12,2) DEFAULT 0,
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
    perk_description TEXT, -- Description of what is unlocked (e.g., "Free Delivery Day")
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table to track individual contributions to challenges
CREATE TABLE IF NOT EXISTS challenge_contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_id UUID REFERENCES neighborhood_challenges(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    contribution_value DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE neighborhood_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view challenges" ON neighborhood_challenges FOR SELECT USING (true);
CREATE POLICY "Users can view their contributions" ON challenge_contributions FOR SELECT USING (auth.uid() = user_id);

-- Trigger for update_at
CREATE TRIGGER update_neighborhood_challenges_updated_at
    BEFORE UPDATE ON neighborhood_challenges
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
