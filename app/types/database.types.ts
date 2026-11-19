export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          weight_kg: number | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          weight_kg?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          weight_kg?: number | null;
          created_at?: string;
        };
      };
      snacks: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          brand: string | null;
          is_generic: boolean;
          serving_size_g: number;
          calories_kcal: number;
          carbs_g: number;
          sugars_g: number;
          fat_g: number;
          protein_g: number;
          sodium_mg: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          brand?: string | null;
          is_generic?: boolean;
          serving_size_g?: number;
          calories_kcal: number;
          carbs_g?: number;
          sugars_g?: number;
          fat_g?: number;
          protein_g?: number;
          sodium_mg?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          brand?: string | null;
          is_generic?: boolean;
          serving_size_g?: number;
          calories_kcal?: number;
          carbs_g?: number;
          sugars_g?: number;
          fat_g?: number;
          protein_g?: number;
          sodium_mg?: number;
          created_at?: string;
        };
      };
      menus: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          duration_type: 'half_day' | 'single_day' | 'multi_day' | string;
          target_calories: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          duration_type: 'half_day' | 'single_day' | 'multi_day' | string;
          target_calories?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          duration_type?: 'half_day' | 'single_day' | 'multi_day' | string;
          target_calories?: number | null;
          created_at?: string;
        };
      };
      menu_items: {
        Row: {
          id: string;
          menu_id: string;
          snack_id: string;
          servings: number;
        };
        Insert: {
          id?: string;
          menu_id: string;
          snack_id: string;
          servings?: number;
        };
        Update: {
          id?: string;
          menu_id?: string;
          snack_id?: string;
          servings?: number;
        };
      };
      favorites: {
        Row: {
          user_id: string;
          snack_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          snack_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          snack_id?: string;
          created_at?: string;
        };
      };
    };
  };
}
