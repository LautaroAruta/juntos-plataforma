-- Add wallet balance to users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS wallet_balance numeric DEFAULT 0;

-- Function to use wallet balance (deduct)
CREATE OR REPLACE FUNCTION public.use_wallet_balance(target_user_id uuid, amount numeric)
RETURNS boolean AS $$
DECLARE
    current_balance numeric;
BEGIN
    SELECT wallet_balance INTO current_balance FROM public.users WHERE id = target_user_id;
    
    IF current_balance >= amount THEN
        UPDATE public.users SET wallet_balance = wallet_balance - amount WHERE id = target_user_id;
        RETURN true;
    ELSE
        RETURN false;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment wallet_balance when a referral is COMPLETED
CREATE OR REPLACE FUNCTION public.reward_referrer_on_complete()
RETURNS trigger AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status = 'pending' THEN
        UPDATE public.users 
        SET wallet_balance = wallet_balance + NEW.reward_amount 
        WHERE id = NEW.referrer_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_reward_referrer
    AFTER UPDATE ON public.referrals
    FOR EACH ROW
    EXECUTE FUNCTION public.reward_referrer_on_complete();
