 -- ============================================================
 -- 将 ID 列从 UUID 改为 TEXT（兼容前端现有的字符串 ID）
 -- 在 Supabase SQL Editor 中运行
 -- ============================================================
 
 ALTER TABLE notes ALTER COLUMN id TYPE TEXT;
 ALTER TABLE notes ALTER COLUMN id DROP DEFAULT;
 
 ALTER TABLE tasks ALTER COLUMN id TYPE TEXT;
 ALTER TABLE tasks ALTER COLUMN id DROP DEFAULT;
 
 ALTER TABLE focus_checks ALTER COLUMN id TYPE TEXT;
 ALTER TABLE focus_checks ALTER COLUMN id DROP DEFAULT;
 
 ALTER TABLE project_summaries ALTER COLUMN id TYPE TEXT;
 ALTER TABLE project_summaries ALTER COLUMN id DROP DEFAULT;
 
 ALTER TABLE collections ALTER COLUMN id TYPE TEXT;
 ALTER TABLE collections ALTER COLUMN id DROP DEFAULT;
 
 ALTER TABLE tags ALTER COLUMN id TYPE TEXT;
 ALTER TABLE tags ALTER COLUMN id DROP DEFAULT;
