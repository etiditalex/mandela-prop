export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string | null;
          role: "admin" | "agent" | "client";
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          phone?: string | null;
          role?: "admin" | "agent" | "client";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      properties: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string;
          price: number;
          location: string;
          property_type: string;
          bedrooms: number;
          bathrooms: number;
          size: number;
          status: "available" | "sold" | "rented";
          agent_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description: string;
          price: number;
          location: string;
          property_type: string;
          bedrooms?: number;
          bathrooms?: number;
          size: number;
          status?: "available" | "sold" | "rented";
          agent_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["properties"]["Insert"]>;
        Relationships: [];
      };
      property_images: {
        Row: {
          id: string;
          property_id: string;
          image_url: string;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          image_url: string;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["property_images"]["Insert"]>;
        Relationships: [];
      };
      saved_properties: {
        Row: {
          id: string;
          user_id: string;
          property_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          property_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["saved_properties"]["Insert"]>;
        Relationships: [];
      };
      inquiries: {
        Row: {
          id: string;
          property_id: string;
          user_id: string;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          user_id: string;
          message: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["inquiries"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      app_role: "admin" | "agent" | "client";
      property_status: "available" | "sold" | "rented";
    };
    CompositeTypes: Record<string, never>;
  };
};
