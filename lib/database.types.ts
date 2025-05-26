export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      finance_products: {
        Row: {
          id: number
          nombre_del_producto: string | null
          periodo: string | null
          plazo_en_meses: number | null
          clasificacion: string | null
          prima_en_percent: number | null
          moneda_del_producto: string | null
          tipo_de_bien: string | null
          tipo_de_cliente: string | null
          moneda_origen_de_los_recursos: string | null
          tipo_tasa: string | null
          tasa_nominal_percent: string | null
          tasa_moratoria_percent: string | null
          observaciones_a_la_tasa: string | null
          moneda_producto: string | null
          id_oferente: string | null
          oferente: string | null
        }
        Insert: {
          id?: number
          nombre_del_producto?: string | null
          periodo?: string | null
          plazo_en_meses?: number | null
          clasificacion?: string | null
          prima_en_percent?: number | null
          moneda_del_producto?: string | null
          tipo_de_bien?: string | null
          tipo_de_cliente?: string | null
          moneda_origen_de_los_recursos?: string | null
          tipo_tasa?: string | null
          tasa_nominal_percent?: string | null
          tasa_moratoria_percent?: string | null
          observaciones_a_la_tasa?: string | null
          moneda_producto?: string | null
          id_oferente?: string | null
          oferente?: string | null
        }
        Update: {
          id?: number
          nombre_del_producto?: string | null
          periodo?: string | null
          plazo_en_meses?: number | null
          clasificacion?: string | null
          prima_en_percent?: number | null
          moneda_del_producto?: string | null
          tipo_de_bien?: string | null
          tipo_de_cliente?: string | null
          moneda_origen_de_los_recursos?: string | null
          tipo_tasa?: string | null
          tasa_nominal_percent?: string | null
          tasa_moratoria_percent?: string | null
          observaciones_a_la_tasa?: string | null
          moneda_producto?: string | null
          id_oferente?: string | null
          oferente?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: string
        }
        Insert: {
          id: string
          role?: string
        }
        Update: {
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}

export type UserRole = "free_user" | "paid_user" | "admin"

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type Insertables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"]
export type Updateables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"]
