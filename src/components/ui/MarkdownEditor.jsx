import React, { useRef } from 'react';
import { Bold, Italic, List, ListOrdered, Table } from 'lucide-react';

function MarkdownEditor({ name, value, onChange, placeholder, style }) {
  const textareaRef = useRef(null);

  const insertText = (prefix, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let replacement = prefix + selectedText + suffix;
    if (!selectedText && suffix === '') {
       replacement = prefix;
    } else if (!selectedText) {
       replacement = prefix + 'text' + suffix;
    }

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    
    onChange({ target: { name, type: 'textarea', value: newValue } });
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText ? selectedText.length : (suffix ? 4 : 0)));
    }, 0);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="rte-toolbar">
        <button type="button" onClick={() => insertText('**', '**')} className="rte-btn" title="Bold"><Bold className="w-4 h-4" /></button>
        <button type="button" onClick={() => insertText('*', '*')} className="rte-btn" title="Italic"><Italic className="w-4 h-4" /></button>
        <div className="rte-divider"></div>
        <button type="button" onClick={() => insertText('- ')} className="rte-btn" title="Bullet List"><List className="w-4 h-4" /></button>
        <button type="button" onClick={() => insertText('1. ')} className="rte-btn" title="Numbered List"><ListOrdered className="w-4 h-4" /></button>
        <div className="rte-divider"></div>
        <button type="button" onClick={() => insertText('\n| Column 1 | Column 2 |\n| -------- | -------- |\n| Text     | Text     |\n')} className="rte-btn" title="Table"><Table className="w-4 h-4" /></button>
      </div>
      <textarea
        ref={textareaRef}
        name={name}
        value={value}
        onChange={onChange}
        className="rte-textarea"
        placeholder={placeholder}
        style={style}
      />
    </div>
  );
}

export default MarkdownEditor;
