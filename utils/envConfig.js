// 环境变量加载工具
const EnvConfig = {
  // 从.env文件或环境变量中获取配置
  getConfig: function() {
    // 在生产环境中，这些值应该通过构建工具注入
    // 在开发环境中，我们提供默认值
    return {
      SILICONFLOW_API_KEY: this.getEnvVar('SILICONFLOW_API_KEY', 'sk-wxfsotjcavldkdcgavgjjswbfzuilfrxzazleqxujjkytevx'),
      SILICONFLOW_PROXY_URL: this.getEnvVar('SILICONFLOW_PROXY_URL', 'https://proxy-api.trickle-app.host/?url=https://api.siliconflow.cn'),
      // Supabase（仅前端 anon key）
      SUPABASE_URL: this.getEnvVar('SUPABASE_URL', ''),
      SUPABASE_ANON_KEY: this.getEnvVar('SUPABASE_ANON_KEY', ''),
      SUPABASE_BUCKET: this.getEnvVar('SUPABASE_BUCKET', 'riddles')
    };
  },

  // 获取环境变量（支持多种来源）
  getEnvVar: function(key, defaultValue) {
    // 1. 尝试从 process.env 获取（Node.js环境）
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }

    // 2. 尝试从 window.ENV 获取（浏览器环境，可由构建工具注入）
    if (typeof window !== 'undefined' && window.ENV && window.ENV[key]) {
      return window.ENV[key];
    }

    // 3. 尝试从 localStorage 获取（开发时手动设置）
    if (typeof localStorage !== 'undefined') {
      const storedValue = localStorage.getItem(`ENV_${key}`);
      if (storedValue) {
        return storedValue;
      }
    }

    // 4. 返回默认值
    return defaultValue;
  },

  // 在开发环境中手动设置环境变量到 localStorage
  setDevEnv: function(key, value) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`ENV_${key}`, value);
      console.log(`✅ 环境变量 ${key} 已设置`);
    }
  },

  // 清除开发环境变量
  clearDevEnv: function() {
    if (typeof localStorage !== 'undefined') {
      Object.keys(localStorage)
        .filter(key => key.startsWith('ENV_'))
        .forEach(key => localStorage.removeItem(key));
      console.log('✅ 开发环境变量已清除');
    }
  }
};
