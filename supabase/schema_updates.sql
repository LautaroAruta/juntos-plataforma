-- Agregamos las columnas de Cancelación/Arrepentimiento a las Órdenes
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS arrepentimiento_solicitado boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS fecha_arrepentimiento timestamp;

-- Creamos la tabla de Mensajes del Chat
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  sender_type text CHECK (sender_type IN ('cliente', 'proveedor')),
  mensaje text NOT NULL,
  leido boolean DEFAULT false,
  creado_en timestamp DEFAULT now()
);

-- Habilitamos la Seguridad por Nivel de Fila (RLS)
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Política de LECTURA: Solo participan el cliente o el proveedor de la orden
CREATE POLICY "View messages if user or provider" 
ON public.chat_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = chat_messages.order_id
    AND (o.user_id = auth.uid() OR o.provider_id = auth.uid())
  )
);

-- Política de ESCRITURA: Solo el cliente o el proveedor de la orden pueden enviar
CREATE POLICY "Insert messages if user or provider" 
ON public.chat_messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = chat_messages.order_id
    AND (o.user_id = auth.uid() OR o.provider_id = auth.uid())
  )
  AND sender_id = auth.uid()
);

-- Habilitar Tiempo Real (Realtime) para la tabla de chats
-- Si esta publicación ya existe y tiene la tabla, dará un error benigno
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND tablename = 'chat_messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
    END IF;
END
$$;
