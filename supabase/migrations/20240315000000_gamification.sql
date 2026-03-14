-- Add gamification columns to users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS savings_streak integer DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS total_saved numeric DEFAULT 0;

-- Function to increment streak and update savings
CREATE OR REPLACE FUNCTION public.process_delivery_rewards(target_user_id uuid, saved_amount numeric)
RETURNS void AS $$
BEGIN
    UPDATE public.users 
    SET 
        savings_streak = savings_streak + 1,
        total_saved = total_saved + saved_amount
    WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql;

-- Table for neighborhood collective savings (Zone-based)
CREATE TABLE IF NOT EXISTS public.neighborhood_impact (
    zone_name text PRIMARY KEY,
    total_collective_savings numeric DEFAULT 0,
    active_users_count integer DEFAULT 0,
    updated_at timestamp with time zone DEFAULT now()
);

-- Initial seed for a zone
INSERT INTO public.neighborhood_impact (zone_name, total_collective_savings, active_users_count)
VALUES ('Caballito/Almagro', 15420, 84)
ON CONFLICT DO NOTHING;
