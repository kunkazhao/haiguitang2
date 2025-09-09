// Supabase 轻客户端封装（浏览器端）
// 依赖：在 HTML 中通过 <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
// 暴露全局对象 SupabaseUtil，提供最少的方法给现有页面调用。

const SupabaseUtil = {
  _client: null,

  // 是否配置了 Supabase（通过 EnvConfig 提供）
  isConfigured() {
    try {
      const cfg = EnvConfig.getConfig();
      return Boolean(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);
    } catch (_) {
      return false;
    }
  },

  // 获取/初始化 client
  client() {
    if (!this.isConfigured()) return null;
    if (this._client) return this._client;
    const cfg = EnvConfig.getConfig();
    if (!window.supabase || !window.supabase.createClient) {
      console.warn('supabase-js UMD 未加载，跳过远程调用');
      return null;
    }
    this._client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
      auth: { persistSession: false }
    });
    return this._client;
  },

  // Bucket 名称（默认 riddles）
  bucket() {
    const cfg = EnvConfig.getConfig();
    return cfg.SUPABASE_BUCKET || 'riddles';
  },

  // 将 dataURL 转为 Blob
  _dataUrlToBlob(dataUrl) {
    const [meta, data] = String(dataUrl).split(',');
    const contentType = /data:(.*?);/i.exec(meta)?.[1] || 'image/png';
    const bytes = atob(data);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    return new Blob([arr], { type: contentType });
  },

  // 上传图片：支持 File/Blob 或 dataURL 字符串
  async uploadImage(input, kind = 'misc') {
    const c = this.client();
    if (!c) return { url: '', path: '' };

    try {
      let file;
      let contentType = 'image/png';
      if (typeof input === 'string') {
        const blob = this._dataUrlToBlob(input);
        contentType = blob.type || contentType;
        file = blob;
      } else if (input) {
        file = input;
        contentType = input.type || contentType;
      } else {
        return { url: '', path: '' };
      }

      const ext = contentType.split('/')[1] || 'png';
      const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const filePath = `${kind}/${filename}`;

      const { error: uploadError } = await c
        .storage
        .from(this.bucket())
        .upload(filePath, file, { contentType, upsert: false });
      if (uploadError) throw uploadError;

      const { data } = c.storage.from(this.bucket()).getPublicUrl(filePath);
      return { url: data?.publicUrl || '', path: filePath };
    } catch (e) {
      console.error('Supabase 上传失败:', e);
      return { url: '', path: '' };
    }
  },

  // 新增题目到数据库
  async insertRiddle(payload) {
    const c = this.client();
    if (!c) return { data: null, error: new Error('Supabase 未配置') };
    try {
      const { data, error } = await c.from('riddles').insert(payload).select().single();
      return { data, error };
    } catch (e) {
      return { data: null, error: e };
    }
  },

  // 更新题目
  async updateRiddle(id, updates) {
    const c = this.client();
    if (!c) return { data: null, error: new Error('Supabase 未配置') };
    try {
      const { data, error } = await c
        .from('riddles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    } catch (e) {
      return { data: null, error: e };
    }
  },

  // 删除题目
  async deleteRiddle(id) {
    const c = this.client();
    if (!c) return { error: new Error('Supabase 未配置') };
    try {
      const { error } = await c.from('riddles').delete().eq('id', id);
      return { error };
    } catch (e) {
      return { error: e };
    }
  },

  // 清空所有题目（谨慎使用）
  async deleteAllRiddles() {
    const c = this.client();
    if (!c) return { error: new Error('Supabase 未配置') };
    try {
      const { error } = await c.from('riddles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      return { error };
    } catch (e) {
      return { error: e };
    }
  },

  // 查询列表
  async fetchRiddles() {
    const c = this.client();
    if (!c) return { data: [], error: new Error('Supabase 未配置') };
    try {
      const { data, error } = await c
        .from('riddles')
        .select('*')
        .order('created_at', { ascending: false });
      return { data: data || [], error };
    } catch (e) {
      return { data: [], error: e };
    }
  },

  // 按 id 查询
  async fetchRiddleById(id) {
    const c = this.client();
    if (!c) return { data: null, error: new Error('Supabase 未配置') };
    try {
      const { data, error } = await c
        .from('riddles')
        .select('*')
        .eq('id', id)
        .single();
      return { data, error };
    } catch (e) {
      return { data: null, error: e };
    }
  }
};
