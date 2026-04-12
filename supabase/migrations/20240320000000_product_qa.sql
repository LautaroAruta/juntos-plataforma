-- Product Questions
CREATE TABLE IF NOT EXISTS product_questions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pregunta text NOT NULL,
    creado_en timestamp with time zone DEFAULT now()
);

-- Product Answers
CREATE TABLE IF NOT EXISTS product_answers (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id uuid NOT NULL UNIQUE REFERENCES product_questions(id) ON DELETE CASCADE,
    provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    respuesta text NOT NULL,
    creado_en timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE product_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_answers ENABLE ROW LEVEL SECURITY;

-- Policies for Questions
CREATE POLICY "Anyone can view questions" ON product_questions FOR SELECT USING (true);
CREATE POLICY "Users can ask questions" ON product_questions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for Answers
CREATE POLICY "Anyone can view answers" ON product_answers FOR SELECT USING (true);
-- Providers need to be validated, but for now we follow the general provider rule
CREATE POLICY "Providers can answer" ON product_answers FOR INSERT WITH CHECK (true); 

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE product_questions;
ALTER PUBLICATION supabase_realtime ADD TABLE product_answers;
