-- INSTRUCCIONES:
-- Copiá y pegá este código completo en el "SQL Editor" de tu panel de control de Supabase.
-- Luego hacé clic en "RUN". Esto asegurará que JUNTOS pueda subir y mostrar fotos de productos.

-- 1. Crear el bucket si no existe (por las dudas)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true) 
ON CONFLICT (id) DO NOTHING;

-- 2. Eliminar políticas viejas para evitar duplicados
DROP POLICY IF EXISTS "Public Access Products" ON storage.objects;
DROP POLICY IF EXISTS "Auth Insert Products" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update Products" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete Products" ON storage.objects;

-- 3. Permitir acceso de lectura a CUALQUIER PERSONA (para que los clientes vean las fotos)
CREATE POLICY "Public Access Products" ON storage.objects
FOR SELECT USING ( bucket_id = 'products' );

-- 4. Permitir SUBIR fotos SOLO a usuarios autenticados (proveedores)
CREATE POLICY "Auth Insert Products" ON storage.objects
FOR INSERT WITH CHECK ( bucket_id = 'products' AND auth.role() = 'authenticated' );

-- 5. Permitir ACTUALIZAR fotos SOLO a usuarios autenticados
CREATE POLICY "Auth Update Products" ON storage.objects
FOR UPDATE WITH CHECK ( bucket_id = 'products' AND auth.role() = 'authenticated' );

-- 6. Permitir BORRAR fotos SOLO a usuarios autenticados
CREATE POLICY "Auth Delete Products" ON storage.objects
FOR DELETE USING ( bucket_id = 'products' AND auth.role() = 'authenticated' );
