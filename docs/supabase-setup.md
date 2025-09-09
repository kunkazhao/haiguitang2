Supabase 集成指引（数据库 + 图片存储）

一、准备
- 新建 Supabase 项目 → 记下 Project URL 与 anon 公钥（Settings → API）。
- Storage → New bucket → 名称 `riddles`（或自定义，与 `SUPABASE_BUCKET` 保持一致），勾选 Public。

二、SQL（SQL Editor 粘贴执行）
```sql
-- 表：riddles
create table if not exists public.riddles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  surface text,
  bottom text,
  type text default '本格',
  difficulty text default '中等',
  surface_image text,
  bottom_image text,
  cover_image text,
  created_at timestamptz default now()
);

-- 开启 RLS
alter table public.riddles enable row level security;

-- 只读公开访问（列表/详情）
create policy riddle_select_public on public.riddles
  for select
  to anon
  using (true);

-- 写入策略（简单版：允许匿名插入；如需登录，改为 to authenticated 并在前端接入 Auth）
create policy riddle_insert_anon on public.riddles
  for insert
  to anon
  with check (true);
```

三、存储策略
- 创建 bucket 时选 Public 即可（任何人都能访问图片 URL）。
  - 若不公开：改为私有，并在前端用 `getPublicUrl()` 的签名 URL 或生成临时签名。但本项目为静态站点，公开桶最省心。

四、前端配置
- 复制 `.env.example` 为 `.env`，填入：
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_BUCKET`（可选）

五、验证
- 运行 `npm start` 打开 `http://localhost:5173`。
- 在“添加题目”页：
  - 输入标题/汤面/汤底，上传图片或贴 URL。
  - 提交后在列表页/详情页应该能看到刚保存的数据与图片（来自 Supabase）。

安全说明
- 上述策略允许匿名插入，适合小型个人项目或受控分享。若需限制写入：
  - 将 insert 策略改为 `to authenticated` 并接入 Supabase Auth（如魔法链接）。
  - 或将“添加题目”页面仅限内部使用，不开放到公网。

