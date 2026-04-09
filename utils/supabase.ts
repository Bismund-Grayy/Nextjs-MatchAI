import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Utility to log user activities into the 'activities' table
 */
export const logActivity = async (userId: string, activityType: string, details?: any) => {
  try {
    const { error } = await supabase
      .from('activities')
      .insert([
        { 
          user_id: userId, 
          activity_type: activityType, 
          details: details || {},
          timestamp: new Date().toISOString()
        }
      ]);
    
    if (error) {
      console.error("Error logging activity:", error.message);
    }
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
};