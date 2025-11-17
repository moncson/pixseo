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
          content: `あなたはDALL-E 3用の画像生成プロンプトを改善する専門家です。
ユーザーのプロンプトをより詳細で具体的にすることがあなたの仕事ですが、元の意図は維持してください。

以下を行ってください：
- スタイル、構図、照明、雰囲気について具体的な詳細を追加
- 色、質感、視覚要素を明確に指定
- 技術的な詳細を含める（解像度、品質、プロ写真用語）
- 元のプロンプトの核となるアイデアは維持
- 改善されたプロンプトのみを英語で出力、他には何も出力しない
- 説明や追加テキストを含めない
- プロンプトが安全で適切であることを確認
- DALL·E（gpt-image-1）が高品質に生成できる長文プロンプトへ変換して返す。

重要：ネガティブプロンプトも必ず生成してください。`,
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

