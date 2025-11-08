// ショートコード処理用のユーティリティ

interface ShortCode {
  name: string;
  pattern: RegExp;
  render: (matches: RegExpMatchArray) => string;
}

const shortCodes: ShortCode[] = [
  // ボタンショートコード [button url="https://example.com"]テキスト[/button]
  {
    name: 'button',
    pattern: /\[button\s+url="([^"]+)"\](.*?)\[\/button\]/g,
    render: (matches) => {
      const url = matches[1];
      const text = matches[2];
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">${text}</a>`;
    },
  },
  // 表ショートコード [table]...[/table]
  {
    name: 'table',
    pattern: /\[table\](.*?)\[\/table\]/gs,
    render: (matches) => {
      const content = matches[1];
      return `<div class="overflow-x-auto my-6"><table class="min-w-full border-collapse border border-gray-300">${content}</table></div>`;
    },
  },
  // 引用ショートコード [quote]...[/quote]
  {
    name: 'quote',
    pattern: /\[quote\](.*?)\[\/quote\]/gs,
    render: (matches) => {
      const content = matches[1];
      return `<blockquote class="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-700">${content}</blockquote>`;
    },
  },
  // 参照ショートコード [reference]...[/reference]
  {
    name: 'reference',
    pattern: /\[reference\](.*?)\[\/reference\]/gs,
    render: (matches) => {
      const content = matches[1];
      return `<p class="reference">参照：${content}</p>`;
    },
  },
];

const ShortCodeRenderer = {
  process: (content: string): string => {
    let processedContent = content;
    
    shortCodes.forEach((shortCode) => {
      processedContent = processedContent.replace(
        shortCode.pattern,
        (match, ...args) => {
          const matches = [match, ...args] as RegExpMatchArray;
          return shortCode.render(matches);
        }
      );
    });
    
    return processedContent;
  },
};

export default ShortCodeRenderer;

