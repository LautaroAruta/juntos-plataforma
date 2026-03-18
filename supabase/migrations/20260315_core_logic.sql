-- Phase 10: Core Functional Logic (Escrow, Logistics & Impact)

-- 1. Extend Support for Escrow
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'escrow_status') THEN
        CREATE TYPE escrow_status AS ENUM ('PENDING_RELEASE', 'RELEASED', 'REFUNDED');
    END IF;
END $$;

ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS escrow_status escrow_status DEFAULT 'PENDING_RELEASE';

-- 2. Extend Support for Impact Algorithm
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS km_to_hub NUMERIC DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS total_carbon_saved NUMERIC DEFAULT 0;

-- 3. Security: Prevent double joining same group deal
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS unique_user_deal;
ALTER TABLE public.orders ADD CONSTRAINT unique_user_deal UNIQUE (user_id, group_deal_id);

-- 4. Logistics: Delivery Tokens
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_token TEXT;

-- 5. Trigger for Real-time Group Progress (Already exists in some form, but ensuring notifications)
-- This table will be used for Phase 19 Social Proof
CREATE TABLE IF NOT EXISTS public.community_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    neighborhood_id TEXT NOT NULL,
    product_id UUID REFERENCES public.products(id),
    event_type TEXT NOT NULL,
    user_name TEXT,
    target_name TEXT,
    impact_text TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for community_events
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view community events" ON public.community_events FOR SELECT USING (true);
