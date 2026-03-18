-- Create community_events table for Phase 18
CREATE TABLE IF NOT EXISTS community_events (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    neighborhood_id text NOT NULL,
    product_id uuid REFERENCES products(id) ON DELETE SET NULL, -- New field for targeting
    event_type text NOT NULL, -- 'deal_joined', 'deal_closed', 'review_posted', 'milestone_reached', 'cheer'
    user_name text NOT NULL,
    target_name text NOT NULL,
    impact_text text,
    metadata jsonb DEFAULT '{}'::jsonb,
    creado_en timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE community_events ENABLE ROW LEVEL SECURITY;

-- Everyone can read events
CREATE POLICY "Anyone can view community events" ON community_events
    FOR SELECT USING (true);

-- Only service role or specific triggers can insert for now (to keep it clean)
-- Or authenticated users for 'cheers' eventually.

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE community_events;
