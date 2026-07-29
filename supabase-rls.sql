 -- ============================================================
 -- 开启 RLS 行级安全（在 Supabase SQL Editor 中运行）
 -- ============================================================
 
 -- 1. 笔记表：用户只能看/改自己的数据
 ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
 CREATE POLICY "notes_user_isolation" ON notes
   FOR ALL USING (auth.uid() = user_id)
   WITH CHECK (auth.uid() = user_id);
 
 -- 2. 任务表
 ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
 CREATE POLICY "tasks_user_isolation" ON tasks
   FOR ALL USING (auth.uid() = user_id)
   WITH CHECK (auth.uid() = user_id);
 
 -- 3. 今日重点
 ALTER TABLE focus_checks ENABLE ROW LEVEL SECURITY;
 CREATE POLICY "focus_checks_user_isolation" ON focus_checks
   FOR ALL USING (auth.uid() = user_id)
   WITH CHECK (auth.uid() = user_id);
 
 -- 4. 项目清单
 ALTER TABLE project_summaries ENABLE ROW LEVEL SECURITY;
 CREATE POLICY "project_summaries_user_isolation" ON project_summaries
   FOR ALL USING (auth.uid() = user_id)
   WITH CHECK (auth.uid() = user_id);
 
 -- 5. 合集
 ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
 CREATE POLICY "collections_user_isolation" ON collections
   FOR ALL USING (auth.uid() = user_id)
   WITH CHECK (auth.uid() = user_id);
 
 -- 6. 标签
 ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
 CREATE POLICY "tags_user_isolation" ON tags
   FOR ALL USING (auth.uid() = user_id)
   WITH CHECK (auth.uid() = user_id);
 
 -- 7. 名言表（共享数据，不设 user_id 限制，允许所有人读取）
 ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
 CREATE POLICY "quotes_public_read" ON quotes
   FOR SELECT USING (true);
