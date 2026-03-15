-- PHASE 9: Logistics 2.0 - Independent Hubs (Puntos JUNTOS)

-- 1. Expand pickup_points table
ALTER TABLE public.pickup_points 
ADD COLUMN tipo TEXT DEFAULT 'provider_site' CHECK (tipo IN ('provider_site', 'juntos_hub')),
ADD COLUMN horarios TEXT,
ADD COLUMN telefono_contacto TEXT,
ADD COLUMN manager_id UUID REFERENCES public.users(id),
ADD COLUMN verificado BOOLEAN DEFAULT false;

-- 2. Create hub_receptions table to track handovers
CREATE TABLE public.hub_receptions (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id),
    hub_id UUID NOT NULL REFERENCES public.pickup_points(id),
    estado TEXT NOT NULL DEFAULT 'recibido' CHECK (estado IN ('recibido', 'entregado')),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT now(),
    comprobante_url TEXT,
    notas TEXT
);

-- 3. Enable RLS
ALTER TABLE public.hub_receptions ENABLE ROW LEVEL SECURITY;

-- 4. Policies for hub_receptions
-- Hub managers can see and manage their receptions
CREATE POLICY "Hub managers can manage their receptions"
ON public.hub_receptions
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.pickup_points
        WHERE id = hub_id AND manager_id = auth.uid()
    )
);

-- Customers can see status of their receptions
CREATE POLICY "Users can see their own hub receptions"
ON public.hub_receptions
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.orders
        WHERE id = order_id AND user_id = auth.uid()
    )
);

-- 5. Policies for pickup_points (allow public viewing of verified hubs)
CREATE POLICY "Anyone can view verified hubs"
ON public.pickup_points
FOR SELECT
USING (verificado = true OR manager_id = auth.uid());
