'use client';

import { TableOfContentsItem } from '@/types/article';
import { useState, useEffect } from 'react';

interface TableOfContentsProps {
  items: TableOfContentsItem[];
}

export default function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // 配列チェック
    if (!Array.isArray(items) || items.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    items.forEach((item) => {
      if (item && item.id) {
        const element = document.getElementById(item.id);
        if (element) observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [items]);

  // 配列でない場合の安全チェック（useEffect の後）
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border-l-4 border-blue-600 p-8 mb-8">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-100">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-3 shadow-md">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-wide">
          目次
        </h2>
      </div>
      <nav>
        <ul className="space-y-1">
          {items.map((item, index) => {
            // 各アイテムの安全チェック
            if (!item || !item.id || !item.text) {
              return null;
            }
            
            const isActive = activeId === item.id;
            const levelStyles = {
              2: 'ml-0 text-base font-semibold',
              3: 'ml-6 text-sm font-medium',
              4: 'ml-12 text-sm font-normal',
            };
            
            return (
              <li
                key={item.id || `toc-${index}`}
                className={levelStyles[item.level as keyof typeof levelStyles] || 'ml-0'}
              >
                <button
                  onClick={() => handleClick(item.id)}
                  className={`
                    w-full text-left py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2 group
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 shadow-sm' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                    }
                  `}
                >
                  <span className={`
                    w-1.5 h-1.5 rounded-full transition-all duration-200
                    ${isActive ? 'bg-blue-600 scale-125' : 'bg-gray-400 group-hover:bg-blue-500'}
                  `} />
                  <span className="flex-1 leading-relaxed tracking-wide">
                    {item.text}
                  </span>
                  {isActive && (
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

