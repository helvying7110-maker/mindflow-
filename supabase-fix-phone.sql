 -- ============================================================
 -- 修复 profiles 表 phone 字段为 NULL 的问题
 -- 在 Supabase SQL Editor 中运行
 -- ============================================================
 
 -- 1. 修复已有用户的 phone 字段（从 user_metadata 中取）
 UPDATE public.profiles p
 SET phone = u.raw_user_meta_data->>'phone'
 FROM auth.users u
 WHERE p.id = u.id
   AND u.raw_user_meta_data->>'phone' IS NOT NULL;
 
 -- 2. 修复注册触发器，从 user_metadata 取 phone
 CREATE OR REPLACE FUNCTION handle_new_user()
 RETURNS TRIGGER AS $$
 BEGIN
   INSERT INTO public.profiles (id, phone, display_name)
   VALUES (
     NEW.id,
     COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone),
     COALESCE(NEW.raw_user_meta_data->>'display_name', '')
   );
   RETURN NEW;
 END;
 $$ LANGUAGE plpgsql SECURITY DEFINER;
