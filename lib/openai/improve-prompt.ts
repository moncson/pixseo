import OpenAI from 'openai';

/**
 * GPT-4o を使用してプロンプトを改善
 * ChatGPT UI と同じように、ユーザーのプロンプトを詳細化・改善する
 */
export async function improveImagePrompt(
  prompt: string,
  openai: OpenAI
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert at improving image generation prompts for DALL-E 3. 
Your task is to enhance the user's prompt to be more detailed and specific, while maintaining their original intent.

Guidelines:
- Add specific details about style, composition, lighting, and atmosphere
- Specify colors, textures, and visual elements
- Include technical details (resolution, quality, professional photography terms)
- Keep the core idea from the original prompt
- Output ONLY the improved prompt in English, nothing else
- Do NOT include any explanations or additional text
- Ensure the prompt is safe and appropriate`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const improvedPrompt = response.choices[0]?.message?.content?.trim() || prompt;
    console.log('[Improve Prompt] Original:', prompt);
    console.log('[Improve Prompt] Improved:', improvedPrompt);
    
    return improvedPrompt;
  } catch (error) {
    console.error('[Improve Prompt] Error improving prompt:', error);
    // エラー時は元のプロンプトを返す
    return prompt;
  }
}

