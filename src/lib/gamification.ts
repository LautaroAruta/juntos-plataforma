export type Level = {
  id: number;
  name: string;
  minXp: number;
  color: string;
  icon: string;
};

export const LEVELS: Level[] = [
  { id: 1, name: "Huevo", minXp: 0, color: "text-gray-400", icon: "Egg" },
  { id: 2, name: "Pichón", minXp: 1000, color: "text-[#009EE3]", icon: "Baby" },
  { id: 3, name: "Pingüino de Magallanes", minXp: 5000, color: "text-[#00A650]", icon: "Bird" },
  { id: 4, name: "Pingüino Emperador", minXp: 15000, color: "text-purple-600", icon: "Crown" },
];

/**
 * Calculates the current level based on total XP
 */
export function calculateLevel(xp: number): Level {
  const level = [...LEVELS].reverse().find((l) => xp >= l.minXp);
  return level || LEVELS[0];
}

/**
 * Calculates the progress to the next level (0-100)
 */
export function calculateLevelProgress(xp: number): number {
  const currentLevel = calculateLevel(xp);
  const nextLevel = LEVELS.find((l) => l.id === currentLevel.id + 1);

  if (!nextLevel) return 100;

  const range = nextLevel.minXp - currentLevel.minXp;
  const progress = xp - currentLevel.minXp;
  return (progress / range) * 100;
}

/**
 * XP Earning constants
 */
export const XP_REWARDS = {
  PER_PESO_SAVED: 1,
  REFERRAL_COMPLETED: 500,
  BADGE_EARNED: 100,
};

/**
 * Awards XP to a user and checks for level up
 */
export async function awardXp(supabase: any, userId: string, amount: number) {
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('experience_points, current_level')
    .eq('id', userId)
    .single();

  if (userError || !user) return { error: "User not found" };

  const newXp = (user.experience_points || 0) + amount;
  const newLevel = calculateLevel(newXp);

  const { error: updateError } = await supabase
    .from('users')
    .update({ 
      experience_points: newXp,
      current_level: newLevel.id
    })
    .eq('id', userId);

  return { 
    newXp, 
    levelUp: newLevel.id > (user.current_level || 1),
    error: updateError
  };
}

/**
 * Checks and awards badges based on a condition
 */
export async function checkAndAwardBadges(supabase: any, userId: string, conditionType: string, totalValue: number) {
  // 1. Get potential badges not already owned
  const { data: unownedBadges } = await supabase.rpc('get_unowned_badges', { p_user_id: userId });
  
  if (!unownedBadges) return [];

  const earnedBadges = [];

  for (const badge of unownedBadges) {
    if (badge.condition_type === conditionType && totalValue >= badge.condition_value) {
      // Award badge
      const { error } = await supabase
        .from('user_badges')
        .insert({ user_id: userId, badge_id: badge.id });
      
      if (!error) {
        earnedBadges.push(badge);
        // Also award bonus XP for earning a badge
        await awardXp(supabase, userId, XP_REWARDS.BADGE_EARNED);
      }
    }
  }

  return earnedBadges;
}
