const ImageGenerator = {
  // 读取环境配置
  getConfig() {
    return EnvConfig.getConfig();
  },

  // 生成英文提示词；失败则返回空串
  async generatePrompt(surface) {
    try {
      const cfg = this.getConfig();
      const base = String(cfg.SILICONFLOW_PROXY_URL || '').replace(/\/$/, '');
      const resp = await fetch(`${base}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cfg.SILICONFLOW_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'Qwen/QwQ-32B',
          messages: [
            {
              role: 'user',
              content: `请根据以下海龟汤汤面内容，提取视觉要素（场景/氛围/道具/人物），生成一个适合作为封面图的英文提示词。要求神秘、悬疑、故事氛围，风格统一。\n\n汤面内容：${surface}\n\n请直接返回英文提示词，不要包含其他解释。`
            }
          ]
        })
      });
      if (!resp.ok) {
        console.warn('generatePrompt HTTP error', resp.status);
        return '';
      }
      const data = await resp.json();
      return (data?.choices?.[0]?.message?.content || '').trim();
    } catch (e) {
      console.error('Error generating prompt:', e);
      return '';
    }
  },

  // 根据提示词生成图片；失败返回空串
  async generateImage(prompt) {
    try {
      const cfg = this.getConfig();
      const base = String(cfg.SILICONFLOW_PROXY_URL || '').replace(/\/$/, '');
      const resp = await fetch(`${base}/v1/images/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cfg.SILICONFLOW_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'stabilityai/stable-diffusion-3-5-large',
          prompt: `${prompt}, mysterious atmosphere, dark theme, suspenseful mood, cinematic lighting, high quality`,
          size: '1024x1024',
          n: 1
        })
      });
      if (!resp.ok) {
        console.warn('generateImage HTTP error', resp.status);
        return '';
      }
      const data = await resp.json();
      const entry = (data && data.data && data.data[0]) ? data.data[0] : {};
      if (entry && entry.url && String(entry.url).trim() !== '') {
        return String(entry.url).trim();
      }
      if (entry && (entry.b64_json || entry.base64 || entry.image_base64)) {
        const b64 = entry.b64_json || entry.base64 || entry.image_base64;
        return `data:image/png;base64,${b64}`;
      }
      return '';
    } catch (e) {
      console.error('Error generating image:', e);
      return '';
    }
  },

  // 综合：若提示词生成失败，回退直接用汤面文本
  async generateCoverImage(surface) {
    try {
      let prompt = await this.generatePrompt(surface);
      if (!prompt) {
        const baseText = String(surface || '').slice(0, 280);
        prompt = `${baseText}, mysterious atmosphere, dark theme, suspenseful mood, cinematic lighting, high quality`;
      }
      return await this.generateImage(prompt);
    } catch (e) {
      console.error('Error generating cover image:', e);
      return '';
    }
  }
};
