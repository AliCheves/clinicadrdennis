
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "appointment_types": {
                  Row: {
                    "active": boolean,"code": string,"duration_min": number,"id": number,"name": string
                  }
                  ComputedFields: never
                  Insert: {
                    "active"?: boolean,"code": string,"duration_min"?: number,"id": number,"name": string
                  }
                  Update: {
                    "active"?: boolean,"code"?: string,"duration_min"?: number,"id"?: number,"name"?: string
                  }
                  Relationships: [
                    
                  ]
                },"appointments": {
                  Row: {
                    "calendar_title": string | null,"cancel_reason": string | null,"cancelled_at": string | null,"confirmed_at": string | null,"created_at": string,"created_by": string | null,"ends_at": string,"google_etag": string | null,"google_event_id": string | null,"id": string,"note": string | null,"patient_id": string | null,"source": Database["public"]['Enums']["appointment_source"],"starts_at": string,"status": Database["public"]['Enums']["appointment_status"],"type_id": number | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "calendar_title"?: string | null,"cancel_reason"?: string | null,"cancelled_at"?: string | null,"confirmed_at"?: string | null,"created_at"?: string,"created_by"?: string | null,"ends_at": string,"google_etag"?: string | null,"google_event_id"?: string | null,"id"?: string,"note"?: string | null,"patient_id"?: string | null,"source": Database["public"]['Enums']["appointment_source"],"starts_at": string,"status"?: Database["public"]['Enums']["appointment_status"],"type_id"?: number | null,"updated_at"?: string
                  }
                  Update: {
                    "calendar_title"?: string | null,"cancel_reason"?: string | null,"cancelled_at"?: string | null,"confirmed_at"?: string | null,"created_at"?: string,"created_by"?: string | null,"ends_at"?: string,"google_etag"?: string | null,"google_event_id"?: string | null,"id"?: string,"note"?: string | null,"patient_id"?: string | null,"source"?: Database["public"]['Enums']["appointment_source"],"starts_at"?: string,"status"?: Database["public"]['Enums']["appointment_status"],"type_id"?: number | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "appointments_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "staff_users"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "appointments_patient_id_fkey"
      columns: ["patient_id"]
isOneToOne: false
      referencedRelation: "patients"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "appointments_type_id_fkey"
      columns: ["type_id"]
isOneToOne: false
      referencedRelation: "appointment_types"
      referencedColumns: ["id"]
    }
                  ]
                },"audit_log": {
                  Row: {
                    "action": string,"actor_id": string | null,"at": string,"detail": Json | null,"entity": string,"entity_id": string | null,"id": number
                  }
                  ComputedFields: never
                  Insert: {
                    "action": string,"actor_id"?: string | null,"at"?: string,"detail"?: Json | null,"entity": string,"entity_id"?: string | null,"id"?: never
                  }
                  Update: {
                    "action"?: string,"actor_id"?: string | null,"at"?: string,"detail"?: Json | null,"entity"?: string,"entity_id"?: string | null,"id"?: never
                  }
                  Relationships: [
                    
                  ]
                },"availability_exceptions": {
                  Row: {
                    "created_by": string | null,"ends_at": string,"id": string,"kind": string,"reason": string | null,"starts_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_by"?: string | null,"ends_at": string,"id"?: string,"kind": string,"reason"?: string | null,"starts_at": string
                  }
                  Update: {
                    "created_by"?: string | null,"ends_at"?: string,"id"?: string,"kind"?: string,"reason"?: string | null,"starts_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "availability_exceptions_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "staff_users"
      referencedColumns: ["id"]
    }
                  ]
                },"availability_rules": {
                  Row: {
                    "end_time": string,"id": string,"slot_capacity": number,"slot_step_min": number,"start_time": string,"valid_from": string,"valid_to": string | null,"weekday": number
                  }
                  ComputedFields: never
                  Insert: {
                    "end_time": string,"id"?: string,"slot_capacity"?: number,"slot_step_min"?: number,"start_time": string,"valid_from"?: string,"valid_to"?: string | null,"weekday": number
                  }
                  Update: {
                    "end_time"?: string,"id"?: string,"slot_capacity"?: number,"slot_step_min"?: number,"start_time"?: string,"valid_from"?: string,"valid_to"?: string | null,"weekday"?: number
                  }
                  Relationships: [
                    
                  ]
                },"calendar_sync_state": {
                  Row: {
                    "calendar_id": string,"channel_expires_at": string | null,"channel_id": string | null,"last_synced_at": string | null,"sync_token": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "calendar_id": string,"channel_expires_at"?: string | null,"channel_id"?: string | null,"last_synced_at"?: string | null,"sync_token"?: string | null
                  }
                  Update: {
                    "calendar_id"?: string,"channel_expires_at"?: string | null,"channel_id"?: string | null,"last_synced_at"?: string | null,"sync_token"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"conversations": {
                  Row: {
                    "context": NonNullable<Json>,"id": string,"last_inbound_at": string | null,"needs_human": boolean,"patient_id": string | null,"state": string,"updated_at": string,"wa_phone": string
                  }
                  ComputedFields: never
                  Insert: {
                    "context"?: NonNullable<Json>,"id"?: string,"last_inbound_at"?: string | null,"needs_human"?: boolean,"patient_id"?: string | null,"state"?: string,"updated_at"?: string,"wa_phone": string
                  }
                  Update: {
                    "context"?: NonNullable<Json>,"id"?: string,"last_inbound_at"?: string | null,"needs_human"?: boolean,"patient_id"?: string | null,"state"?: string,"updated_at"?: string,"wa_phone"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "conversations_patient_id_fkey"
      columns: ["patient_id"]
isOneToOne: false
      referencedRelation: "patients"
      referencedColumns: ["id"]
    }
                  ]
                },"handoff_requests": {
                  Row: {
                    "assigned_to": string | null,"conversation_id": string,"created_at": string,"id": string,"reason": string,"resolution_note": string | null,"resolved_at": string | null,"status": Database["public"]['Enums']["handoff_status"]
                  }
                  ComputedFields: never
                  Insert: {
                    "assigned_to"?: string | null,"conversation_id": string,"created_at"?: string,"id"?: string,"reason": string,"resolution_note"?: string | null,"resolved_at"?: string | null,"status"?: Database["public"]['Enums']["handoff_status"]
                  }
                  Update: {
                    "assigned_to"?: string | null,"conversation_id"?: string,"created_at"?: string,"id"?: string,"reason"?: string,"resolution_note"?: string | null,"resolved_at"?: string | null,"status"?: Database["public"]['Enums']["handoff_status"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "handoff_requests_assigned_to_fkey"
      columns: ["assigned_to"]
isOneToOne: false
      referencedRelation: "staff_users"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "handoff_requests_conversation_id_fkey"
      columns: ["conversation_id"]
isOneToOne: false
      referencedRelation: "conversations"
      referencedColumns: ["id"]
    }
                  ]
                },"messages": {
                  Row: {
                    "body": string | null,"conversation_id": string,"created_at": string,"delivery_status": string | null,"direction": string,"id": string,"kind": string,"sent_by": string | null,"wa_message_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "body"?: string | null,"conversation_id": string,"created_at"?: string,"delivery_status"?: string | null,"direction": string,"id"?: string,"kind": string,"sent_by"?: string | null,"wa_message_id"?: string | null
                  }
                  Update: {
                    "body"?: string | null,"conversation_id"?: string,"created_at"?: string,"delivery_status"?: string | null,"direction"?: string,"id"?: string,"kind"?: string,"sent_by"?: string | null,"wa_message_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "messages_conversation_id_fkey"
      columns: ["conversation_id"]
isOneToOne: false
      referencedRelation: "conversations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "messages_sent_by_fkey"
      columns: ["sent_by"]
isOneToOne: false
      referencedRelation: "staff_users"
      referencedColumns: ["id"]
    }
                  ]
                },"patients": {
                  Row: {
                    "birth_date": string | null,"consent_at": string | null,"consent_text_version": string | null,"created_at": string,"dui_encrypted": string | null,"dui_hash": string | null,"email": string | null,"full_name": string,"id": string,"phone_e164": string,"source": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "birth_date"?: string | null,"consent_at"?: string | null,"consent_text_version"?: string | null,"created_at"?: string,"dui_encrypted"?: string | null,"dui_hash"?: string | null,"email"?: string | null,"full_name": string,"id"?: string,"phone_e164": string,"source"?: string,"updated_at"?: string
                  }
                  Update: {
                    "birth_date"?: string | null,"consent_at"?: string | null,"consent_text_version"?: string | null,"created_at"?: string,"dui_encrypted"?: string | null,"dui_hash"?: string | null,"email"?: string | null,"full_name"?: string,"id"?: string,"phone_e164"?: string,"source"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"reminders": {
                  Row: {
                    "appointment_id": string,"channel": Database["public"]['Enums']["reminder_channel"],"error": string | null,"id": string,"kind": Database["public"]['Enums']["reminder_kind"],"provider_message_id": string | null,"scheduled_for": string,"sent_at": string | null,"status": Database["public"]['Enums']["reminder_status"]
                  }
                  ComputedFields: never
                  Insert: {
                    "appointment_id": string,"channel": Database["public"]['Enums']["reminder_channel"],"error"?: string | null,"id"?: string,"kind": Database["public"]['Enums']["reminder_kind"],"provider_message_id"?: string | null,"scheduled_for": string,"sent_at"?: string | null,"status"?: Database["public"]['Enums']["reminder_status"]
                  }
                  Update: {
                    "appointment_id"?: string,"channel"?: Database["public"]['Enums']["reminder_channel"],"error"?: string | null,"id"?: string,"kind"?: Database["public"]['Enums']["reminder_kind"],"provider_message_id"?: string | null,"scheduled_for"?: string,"sent_at"?: string | null,"status"?: Database["public"]['Enums']["reminder_status"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "reminders_appointment_id_fkey"
      columns: ["appointment_id"]
isOneToOne: false
      referencedRelation: "appointments"
      referencedColumns: ["id"]
    }
                  ]
                },"staff_users": {
                  Row: {
                    "active": boolean,"auth_user_id": string,"created_at": string,"full_name": string,"id": string,"phone_e164": string | null,"role": Database["public"]['Enums']["staff_role"]
                  }
                  ComputedFields: never
                  Insert: {
                    "active"?: boolean,"auth_user_id": string,"created_at"?: string,"full_name": string,"id"?: string,"phone_e164"?: string | null,"role": Database["public"]['Enums']["staff_role"]
                  }
                  Update: {
                    "active"?: boolean,"auth_user_id"?: string,"created_at"?: string,"full_name"?: string,"id"?: string,"phone_e164"?: string | null,"role"?: Database["public"]['Enums']["staff_role"]
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "current_staff_role":
{ Args: Record<PropertyKey, never>; Returns: Database["public"]['Enums']["staff_role"]
                           },
"doctor_get_dui":
{ Args: { "p_patient_id": string }; Returns: string
                           },
"is_doctor":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"is_secretary":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"is_staff":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"log_audit":
{ Args: { "p_action": string,"p_detail"?: Json,"p_entity": string,"p_entity_id": string }; Returns: undefined
                           }
          }
          Enums: {
            "appointment_source": "bot"|"calendario_manual"|"panel","appointment_status": "programada"|"confirmada"|"cancelada"|"completada"|"no_asistio","handoff_status": "abierto"|"en_curso"|"resuelto","reminder_channel": "whatsapp"|"email","reminder_kind": "dos_dias"|"mismo_dia","reminder_status": "pendiente"|"enviado"|"fallido"|"omitido","staff_role": "doctor"|"secretaria"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            "appointment_source": ["bot", "calendario_manual", "panel"],"appointment_status": ["programada", "confirmada", "cancelada", "completada", "no_asistio"],"handoff_status": ["abierto", "en_curso", "resuelto"],"reminder_channel": ["whatsapp", "email"],"reminder_kind": ["dos_dias", "mismo_dia"],"reminder_status": ["pendiente", "enviado", "fallido", "omitido"],"staff_role": ["doctor", "secretaria"]
          }
        }
} as const
