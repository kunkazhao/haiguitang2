const ImageGenerator = {
  API_KEY: 'sk-wxfsotjcavldkdcgavgjjswbfzuilfrxzazleqxujjkytevx',
  
  async generatePrompt(surface) {
    try {
      const response = await fetch('https://proxy-api.trickle-app.host/?url=https://api.siliconflow.cn/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ImageGenerator.API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'Qwen/QwQ-32B',
          messages: [
            {
              role: 'user',
              content: `请根据以下海龟汤汤面内容，提取视觉要素（场景/氛围/道具/人物轮廓），生成一个适合作为封面图的英文提示词。要求神秘、悬疑、故事氛围，风格统一。

汤面内容：${surface}

请直接返回英文提示词，不要包含其他解释。`
            }
          ]
        })
      });
      
      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (error) {
      console.error('Error generating prompt:', error);
      return '';
    }
  },
  
  async generateImage(prompt) {
    try {
      const response = await fetch('https://proxy-api.trickle-app.host/?url=https://api.siliconflow.cn/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ImageGenerator.API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'stabilityai/stable-diffusion-3-5-large',
          prompt: `${prompt}, mysterious atmosphere, dark theme, suspenseful mood, cinematic lighting, high quality`,
          size: '1024x1024',
          n: 1
        })
      });
      
      const data = await response.json();
      return data.data?.[0]?.url || '';
    } catch (error) {
      console.error('Error generating image:', error);
      return '';
    }
  },
  
  async generateCoverImage(surface) {
    try {
      const prompt = await ImageGenerator.generatePrompt(surface);
      if (!prompt) return '';
      
      const imageUrl = await ImageGenerator.generateImage(prompt);
      return imageUrl;
    } catch (error) {
      console.error('Error generating cover image:', error);
      return '';
    }
  }
};