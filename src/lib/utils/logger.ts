import { createClient } from "@/lib/supabase/server";

export type LogService = 'mercadopago' | 'resend' | 'supabase' | 'auth' | 'general';
export type LogSeverity = 'info' | 'warning' | 'error' | 'critical';

interface LogOptions {
  service: LogService;
  eventType: string;
  message: string;
  severity?: LogSeverity;
  payload?: any;
  orderId?: string;
  userId?: string;
}

/**
 * Standardized server-side logging for production monitoring
 */
export async function logError(opts: LogOptions) {
  try {
    const supabase = await createClient(true); // Service role to bypass RLS for logging
    
    const { error } = await supabase
      .from('error_logs')
      .insert({
        service: opts.service,
        event_type: opts.eventType,
        severity: opts.severity || 'error',
        message: opts.message,
        payload: opts.payload,
        order_id: opts.orderId,
        user_id: opts.userId
      });

    if (error) {
       console.error("Critical error: Failed to write to error_logs", error);
    }
    
    // In a real production environment, you might also trigger an alert
    // to Slack, Discord or email if severity is 'critical'.
    if (opts.severity === 'critical') {
       console.warn("CRITICAL ERROR DETECTED:", opts.message);
    }

  } catch (err) {
    console.error("Logger utility failed:", err);
  }
}
