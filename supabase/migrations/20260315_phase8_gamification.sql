-- Phase 8: Gamification System (Penguin XP)

-- 1. Extend Users table with gamification fields
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS experience_points INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 1;

-- 2. Create Badges table
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    nombre TEXT NOT NULL,
    descripcion TEXT,
    icon_name TEXT, -- Lucide icon name
    condition_type TEXT NOT NULL, -- 'savings', 'referrals', 'deals_joined', 'neighborhood'
    condition_value INTEGER NOT NULL,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create User_Badges table (Relational)
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- 4. Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Badges are readable by everyone
CREATE POLICY "Badges are public" ON public.badges
    FOR SELECT USING (true);

-- User badges are readable by everyone, but only system/admin can award them
CREATE POLICY "User badges are readable by everyone" ON public.user_badges
    FOR SELECT USING (true);

-- 6. Insert Initial Badges
INSERT INTO public.badges (nombre, descripcion, icon_name, condition_type, condition_value) VALUES
('Pionero del Ahorro', 'Te uniste a tu primer deal grupal.', 'Zap', 'deals_joined', 1),
('Líder de Manada', 'Invitaste a 5 amigos que completaron una compra.', 'Users', 'referrals', 5),
('Ahorrador Maestro', 'Ahorraste más de $50,000 en total.', 'TrendingUp', 'savings', 50000),
('Guerrero del Barrio', 'Completaste 10 compras en tu zona.', 'MapPin', 'deals_joined', 10);

-- 7. Add comments for clarity
COMMENT ON COLUMN public.users.experience_points IS 'Puntos de experiencia acumulados por el usuario.';
COMMENT ON COLUMN public.users.current_level IS 'Nivel actual del usuario (1: Huevo, 2: Pichón, 3: Pingüino, 4: Emperador).';
