-- Pickup Points Table
CREATE TABLE IF NOT EXISTS public.pickup_points (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    address text NOT NULL,
    provider_id uuid REFERENCES public.providers(id) ON DELETE CASCADE,
    latitude numeric,
    longitude numeric,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for pickup_points
ALTER TABLE public.pickup_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active pickup points" 
    ON public.pickup_points FOR SELECT 
    USING (active = true);

CREATE POLICY "Providers can manage their own pickup points" 
    ON public.pickup_points FOR ALL 
    USING (auth.uid() IN (SELECT user_id FROM public.providers WHERE id = provider_id));

-- Add pickup_point_id to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pickup_point_id uuid REFERENCES public.pickup_points(id);

-- Deliveries Table (for Premium track)
CREATE TABLE IF NOT EXISTS public.order_deliveries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
    verified_at timestamp with time zone DEFAULT now(),
    verification_method text DEFAULT 'qr', -- qr, manual, signature
    notes text,
    signature_data text -- optional base64 signature
);

-- RLS for deliveries
ALTER TABLE public.order_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own order deliveries"
    ON public.order_deliveries FOR SELECT
    USING (auth.uid() IN (SELECT user_id FROM public.orders WHERE id = order_id));

CREATE POLICY "Providers can create deliveries for their orders"
    ON public.order_deliveries FOR INSERT
    WITH CHECK (auth.uid() IN (
        SELECT p.user_id 
        FROM public.providers p
        JOIN public.group_deals gd ON gd.provider_id = p.id
        JOIN public.orders o ON o.group_deal_id = gd.id
        WHERE o.id = order_id
    ));
