-- Product Reviews
CREATE TABLE IF NOT EXISTS product_reviews (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id uuid NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comentario text,
    fotos text[] DEFAULT '{}',
    creado_en timestamp with time zone DEFAULT now()
);

-- RLS
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON product_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews for their orders" ON product_reviews 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE product_reviews;

-- Storage Bucket (Handled via SQL if possible, or manual)
-- Note: inserting into storage.buckets requires specific permissions, usually handled via UI or Admin API
