 -- ============================================================
 -- MindFlow 数据库建表脚本 (MVP)
 -- 在 Supabase SQL Editor 中运行
 -- ============================================================
 
 -- 1. 用户资料表
 CREATE TABLE IF NOT EXISTS profiles (
   id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
   phone TEXT,
   display_name TEXT DEFAULT '',
   created_at TIMESTAMPTZ DEFAULT NOW(),
   updated_at TIMESTAMPTZ DEFAULT NOW()
 );
 
 -- 2. 笔记表
 CREATE TABLE IF NOT EXISTS notes (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
   title TEXT NOT NULL DEFAULT '',
   excerpt TEXT DEFAULT '',
   content TEXT DEFAULT '',
   tag TEXT DEFAULT '',
   timestamp TEXT DEFAULT '',
   collection TEXT DEFAULT '',
   cover_image TEXT DEFAULT '',
   images JSONB DEFAULT '[]',
   is_private BOOLEAN DEFAULT FALSE,
   created_at TIMESTAMPTZ DEFAULT NOW(),
   updated_at TIMESTAMPTZ DEFAULT NOW()
 );
 
 -- 3. 任务表
 CREATE TABLE IF NOT EXISTS tasks (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
   title TEXT NOT NULL DEFAULT '',
   details TEXT DEFAULT '',
   sub_items JSONB DEFAULT '[]',
   deadline TEXT DEFAULT '',
   badge TEXT DEFAULT '',
   badge_type TEXT DEFAULT 'normal' CHECK (badge_type IN ('overdue', 'urgent', 'upcoming', 'normal')),
   accent_color TEXT DEFAULT 'grey' CHECK (accent_color IN ('red', 'yellow', 'green', 'grey')),
   completed BOOLEAN DEFAULT FALSE,
   tags JSONB DEFAULT '[]',
   created_at TIMESTAMPTZ DEFAULT NOW(),
   updated_at TIMESTAMPTZ DEFAULT NOW()
 );
 
 -- 4. 今日重点表
 CREATE TABLE IF NOT EXISTS focus_checks (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
   title TEXT NOT NULL DEFAULT '',
   completed BOOLEAN DEFAULT FALSE,
   created_at TIMESTAMPTZ DEFAULT NOW(),
   updated_at TIMESTAMPTZ DEFAULT NOW()
 );
 
 -- 5. 项目清单表
 CREATE TABLE IF NOT EXISTS project_summaries (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
   title TEXT NOT NULL DEFAULT '',
   items JSONB DEFAULT '[]',
   created_at TIMESTAMPTZ DEFAULT NOW(),
   updated_at TIMESTAMPTZ DEFAULT NOW()
 );
 
 -- 6. 合集表
 CREATE TABLE IF NOT EXISTS collections (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
   name TEXT NOT NULL DEFAULT '',
   count INTEGER DEFAULT 0,
   icon_name TEXT DEFAULT 'BookOpen',
   color_class TEXT DEFAULT 'bg-[#e3e2df] text-[#1b1c1a]',
   avatars JSONB DEFAULT '[]',
   created_at TIMESTAMPTZ DEFAULT NOW(),
   updated_at TIMESTAMPTZ DEFAULT NOW()
 );
 
 -- 7. 标签表
 CREATE TABLE IF NOT EXISTS tags (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
   name TEXT NOT NULL DEFAULT '',
   color_dot TEXT DEFAULT 'bg-emerald-500',
   created_at TIMESTAMPTZ DEFAULT NOW()
 );
 
 -- 8. 毛选名言表
 CREATE TABLE IF NOT EXISTS quotes (
   id SERIAL PRIMARY KEY,
   quote TEXT NOT NULL,
   author TEXT NOT NULL DEFAULT '毛泽东',
   source TEXT DEFAULT '',
   type TEXT NOT NULL DEFAULT 'quote' CHECK (type IN ('quote', 'excerpt')),
   created_at TIMESTAMPTZ DEFAULT NOW()
 );
 
 -- ============================================================
 -- 索引
 -- ============================================================
 CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id);
 CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);
 CREATE INDEX IF NOT EXISTS idx_focus_checks_user ON focus_checks(user_id);
 
 -- ============================================================
 -- 自动更新 updated_at 的触发器
 -- ============================================================
 CREATE OR REPLACE FUNCTION update_updated_at()
 RETURNS TRIGGER AS $$
 BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
 END;
 $$ LANGUAGE plpgsql;
 
 DO $$
 BEGIN
   IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_profiles_updated_at') THEN
     CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
   END IF;
   IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_notes_updated_at') THEN
     CREATE TRIGGER set_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
   END IF;
   IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_tasks_updated_at') THEN
     CREATE TRIGGER set_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
   END IF;
   IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_focus_checks_updated_at') THEN
     CREATE TRIGGER set_focus_checks_updated_at BEFORE UPDATE ON focus_checks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
   END IF;
   IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_project_summaries_updated_at') THEN
     CREATE TRIGGER set_project_summaries_updated_at BEFORE UPDATE ON project_summaries FOR EACH ROW EXECUTE FUNCTION update_updated_at();
   END IF;
   IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_collections_updated_at') THEN
     CREATE TRIGGER set_collections_updated_at BEFORE UPDATE ON collections FOR EACH ROW EXECUTE FUNCTION update_updated_at();
   END IF;
 END $$;
 
 -- ============================================================
 -- 新用户注册时自动创建 profile
 -- ============================================================
 CREATE OR REPLACE FUNCTION handle_new_user()
 RETURNS TRIGGER AS $$
 BEGIN
   INSERT INTO public.profiles (id, phone, display_name)
   VALUES (NEW.id, NEW.phone, COALESCE(NEW.raw_user_meta_data->>'display_name', ''));
   RETURN NEW;
 END;
 $$ LANGUAGE plpgsql SECURITY DEFINER;
 
 DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
 CREATE TRIGGER on_auth_user_created
   AFTER INSERT ON auth.users
   FOR EACH ROW EXECUTE FUNCTION handle_new_user();
