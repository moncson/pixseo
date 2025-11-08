'use client';

import { useEffect, useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && !editorRef.current.hasAttribute('data-initialized')) {
      editorRef.current.setAttribute('data-initialized', 'true');
      editorRef.current.innerHTML = value;
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    handleInput();
  };

  const insertShortcode = (shortcode: string) => {
    const selection = window.getSelection();
    if (selection && editorRef.current) {
      const range = selection.getRangeAt(0);
      const node = document.createTextNode(shortcode);
      range.insertNode(node);
      range.setStartAfter(node);
      range.setEndAfter(node);
      selection.removeAllRanges();
      selection.addRange(range);
      handleInput();
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* ツールバー */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100"
          title="太字"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100"
          title="斜体"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100"
          title="下線"
        >
          <u>U</u>
        </button>

        <div className="w-px bg-gray-300" />

        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<h2>')}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm"
          title="見出し2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<h3>')}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm"
          title="見出し3"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<h4>')}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm"
          title="見出し4"
        >
          H4
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<p>')}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm"
          title="段落"
        >
          P
        </button>

        <div className="w-px bg-gray-300" />

        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100"
          title="箇条書き"
        >
          ●
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100"
          title="番号付きリスト"
        >
          1.
        </button>

        <div className="w-px bg-gray-300" />

        <button
          type="button"
          onClick={() => {
            const url = prompt('リンクURL:');
            if (url) execCommand('createLink', url);
          }}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm"
          title="リンク"
        >
          🔗
        </button>

        <button
          type="button"
          onClick={() => {
            const url = prompt('画像URL:');
            if (url) execCommand('insertImage', url);
          }}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm"
          title="画像"
        >
          🖼️
        </button>

        <div className="w-px bg-gray-300" />

        {/* ショートコード */}
        <select
          onChange={(e) => {
            if (e.target.value) {
              insertShortcode(e.target.value);
              e.target.value = '';
            }
          }}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm"
        >
          <option value="">ショートコード</option>
          <option value='[button text="ボタン" url="#"]'>ボタン</option>
          <option value='[quote]引用文[/quote]'>引用</option>
          <option value='[reference]参照元[/reference]'>参照</option>
          <option value='[table]<br/>列1 | 列2 | 列3<br/>---<br/>データ1 | データ2 | データ3<br/>[/table]'>表</option>
        </select>
      </div>

      {/* エディター */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[400px] p-4 focus:outline-none prose prose-sm max-w-none"
        style={{ whiteSpace: 'pre-wrap' }}
        data-placeholder={placeholder || '本文を入力...'}
      />
    </div>
  );
}

