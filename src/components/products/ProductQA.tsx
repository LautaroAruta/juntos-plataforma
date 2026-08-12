'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { HelpCircle, MessageCircle, Send, User, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

interface Question {
  id: string;
  pregunta: string;
  creado_en: string;
  user_id: string;
  user_nombre?: string;
  answer?: {
    id: string;
    respuesta: string;
    creado_en: string;
    provider_nombre: string;
  };
}

export default function ProductQA({ productId, userId }: { productId: string, userId?: string }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchQuestions();
    
    // Real-time subscription
    const channel = supabase
      .channel(`product-qa-${productId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'product_questions', filter: `product_id=eq.${productId}` }, () => fetchQuestions())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'product_answers' }, () => fetchQuestions())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [productId]);

  async function fetchQuestions() {
    try {
      const { data, error } = await supabase
        .from('product_questions')
        .select(`
          *,
          user:users (nombre),
          answer:product_answers (
            *,
            provider:providers (nombre_empresa)
          )
        `)
        .eq('product_id', productId)
        .order('creado_en', { ascending: false });

      if (error) throw error;
      
      const formatted = data.map((q: any) => ({
        id: q.id,
        pregunta: q.pregunta,
        creado_en: q.creado_en,
        user_id: q.user_id,
        user_nombre: q.user?.nombre || 'Vecino',
        answer: q.answer?.[0] ? {
          id: q.answer[0].id,
          respuesta: q.answer[0].respuesta,
          creado_en: q.answer[0].creado_en,
          provider_nombre: q.answer[0].provider?.nombre_empresa || 'Proveedor'
        } : undefined
      }));

      setQuestions(formatted);
    } catch (err) {
      console.error("Error fetching QA:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!userId) {
      toast.error("Debes iniciar sesión para preguntar");
      return;
    }
    if (!newQuestion.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('product_questions')
        .insert({
          product_id: productId,
          user_id: userId,
          pregunta: newQuestion.trim()
        });

      if (error) throw error;
      
      setNewQuestion('');
      toast.success("Pregunta enviada. El proveedor te responderá pronto.");
    } catch (err) {
      toast.error("Error al enviar pregunta");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="h-20 animate-pulse bg-bandha-subtle rounded-2xl" />;

  const displayQuestions = showAll ? questions : questions.slice(0, 3);

  return (
    <div className="mt-12 space-y-8">
      <div className="flex items-center gap-3">
        <HelpCircle className="text-[#FF5C00]" size={24} />
        <h2 className="text-xl font-black text-black tracking-tighter uppercase">Preguntas y Respuestas</h2>
      </div>

      {/* Input de pregunta */}
      <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.05)]">
        <p className="text-[9px] font-black text-black/40 uppercase tracking-[0.3em] mb-4">¿Tenés alguna duda sobre el producto?</p>
        <div className="relative">
          <textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="PREGUNTALE AL PROVEEDOR..."
            className="w-full bg-[#F5F5F5] border border-black p-4 text-xs font-bold uppercase outline-none resize-none min-h-[100px] focus:bg-white transition-all overflow-hidden"
          />
          <button
            onClick={handleSubmit}
            disabled={submitting || !newQuestion.trim()}
            className="absolute bottom-4 right-4 bg-[#FF5C00] hover:bg-black text-white p-3 border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:bg-black/10 disabled:shadow-none"
          >
            {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={18} />}
          </button>
        </div>
        {!userId && <p className="text-[8px] text-black/30 mt-3 font-black uppercase tracking-widest italic">Iniciá sesión para preguntar</p>}
      </div>

      {/* Lista de preguntas */}
      <div className="space-y-8">
        {questions.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-black/10">
            <MessageCircle className="mx-auto text-black/10 mb-4" size={48} />
            <p className="text-black/30 font-black uppercase text-[10px] tracking-widest">Nadie preguntó nada todavía. ¡Sé el primero!</p>
          </div>
        ) : (
          <>
            {displayQuestions.map((q) => (
              <div key={q.id} className="group border-b border-black/5 pb-5 last:border-0">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-[#F5F5F5] border border-black flex items-center justify-center text-black/30 shrink-0">
                    <User size={14} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-black text-black leading-tight mb-2 uppercase italic">&quot;{q.pregunta}&quot;</p>
                    <p className="text-[8px] font-black text-black/30 uppercase tracking-[0.2em]">
                      {q.user_nombre} • {formatDistanceToNow(new Date(q.creado_en), { addSuffix: true, locale: es })}
                    </p>

                    {q.answer ? (
                      <div className="mt-4 ml-2 pl-4 border-l-2 border-[#FF5C00] bg-white p-4 border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageCircle size={12} className="text-[#FF5C00]" />
                          <span className="text-[9px] font-black text-[#FF5C00] uppercase tracking-[0.2em]">Respuesta de {q.answer.provider_nombre}</span>
                        </div>
                        <p className="text-[13px] font-bold text-black leading-relaxed uppercase tracking-tight">{q.answer.respuesta}</p>
                        <p className="text-[8px] text-black/30 font-black mt-3 uppercase tracking-widest">
                           {formatDistanceToNow(new Date(q.answer.creado_en), { addSuffix: true, locale: es })}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-3 text-[8px] font-black italic text-[#FF5C00] uppercase tracking-widest">Esperando respuesta del proveedor...</p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {questions.length > 3 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full py-4 text-xs font-black text-bandha-primary uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-bandha-primary/5 rounded-2xl transition-all"
              >
                {showAll ? (
                  <>Ver menos preguntas <ChevronUp size={16} /></>
                ) : (
                  <>Ver las {questions.length} preguntas <ChevronDown size={16} /></>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
