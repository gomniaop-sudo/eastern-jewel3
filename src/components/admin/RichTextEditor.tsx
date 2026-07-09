/**
 * Professional Rich Text Editor with Live Preview
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heading1, Heading2, Heading3, Bold, Italic, Underline, Quote, List, ListOrdered, Minus, Code, Code as Code2, Link2, Image, CircleAlert as AlertCircle, Eye, CreditCard as Edit3, Columns2 as Columns, Save } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  dir?: 'ltr' | 'rtl';
  language?: 'en' | 'ar';
  onSaveDraft?: (value: string) => void;
  onRestoreDraft?: () => string | null;
}

interface Selection {
  start: number;
  end: number;
}

interface WordStats {
  words: number;
  characters: number;
  readingTime: string;
}

const STORAGE_KEY_PREFIX = 'journal_draft_';

function calculateWordStats(text: string): WordStats {
  const characters = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(words / 200));
  return { words, characters, readingTime: `${readingTime} min read` };
}

function renderMarkdownToHTML(text: string, dir: 'ltr' | 'rtl'): string {
  let html = text
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-luxury-light/10 p-4 rounded-sm overflow-x-auto my-4"><code class="text-sm text-gray-300">$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-luxury-light/20 px-1.5 py-0.5 rounded text-gold-400 text-sm">$1</code>')
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
    .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em class="italic">$1</em>')
    .replace(/_(.*?)_/g, '<u class="underline">$1</u>')
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-display text-white mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-display text-white mt-6 mb-3">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-display text-white mt-6 mb-4">$1</h1>')
    .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-gold-500 pl-4 py-2 my-4 bg-luxury-light/10 text-gray-300 italic">$1</blockquote>')
    .replace(/^- (.*$)/gm, '<li class="text-gray-300 ml-6 list-disc">$1</li>')
    .replace(/^(\d+)\. (.*$)/gm, '<li class="text-gray-300 ml-6 list-decimal">$2</li>')
    .replace(/^---$/gm, '<hr class="border-t border-luxury-light/20 my-6" />')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-sm my-4" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-gold-400 hover:text-gold-300 underline">$1</a>')
    .replace(/^:::callout\s*$/gm, '<div class="bg-gold-500/10 border border-gold-500/30 rounded-sm p-4 my-4">')
    .replace(/^:::\s*$/gm, '</div>')
    .replace(/\n\n/g, '</p><p class="text-gray-300 mb-4">')
    .replace(/\n/g, '<br />');

  if (!html.startsWith('<')) {
    html = `<p class="text-gray-300 mb-4">${html}</p>`;
  }

  if (dir === 'rtl') {
    html = `<div dir="rtl" class="text-right">${html}</div>`;
  }

  return html;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing...',
  dir = 'ltr',
  language = 'en',
  onSaveDraft,
  onRestoreDraft,
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selection, setSelection] = useState<Selection>({ start: 0, end: 0 });
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [calloutModalOpen, setCalloutModalOpen] = useState(false);
  const [calloutText, setCalloutText] = useState('');
  const [draftStatus, setDraftStatus] = useState<'saved' | 'restored' | 'none'>('none');
  const [showDraftNotification, setShowDraftNotification] = useState(false);
  const lastSavedRef = useRef<string>('');
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const wordStats = useMemo(() => calculateWordStats(value), [value]);

  const previewHTML = useMemo(() => renderMarkdownToHTML(value, dir), [value, dir]);

  useEffect(() => {
    if (onRestoreDraft) {
      const draft = onRestoreDraft();
      if (draft && draft !== value) {
        onChange(draft);
        setDraftStatus('restored');
        setShowDraftNotification(true);
        setTimeout(() => setShowDraftNotification(false), 3000);
      }
    }
  }, []);

  useEffect(() => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    if (value !== lastSavedRef.current && onSaveDraft) {
      autosaveTimerRef.current = setTimeout(() => {
        onSaveDraft(value);
        lastSavedRef.current = value;
        setDraftStatus('saved');
        setShowDraftNotification(true);
        setTimeout(() => setShowDraftNotification(false), 2000);
      }, 2000);
    }

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [value, onSaveDraft]);

  const saveSelection = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      setSelection({
        start: textarea.selectionStart,
        end: textarea.selectionEnd,
      });
    }
  }, []);

  const insertAtCursor = useCallback(
    (before: string, after: string = '', replaceSelection: boolean = false) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);

      let newText: string;
      let newCursorPos: number;

      if (replaceSelection && selectedText) {
        newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
        newCursorPos = start + before.length + selectedText.length + after.length;
      } else if (selectedText) {
        newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
        newCursorPos = start + before.length + selectedText.length;
      } else {
        newText = value.substring(0, start) + before + after + value.substring(end);
        newCursorPos = start + before.length;
      }

      onChange(newText);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    },
    [value, onChange]
  );

  const insertLineStart = useCallback(
    (prefix: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const beforeLine = value.substring(0, lineStart);
      const afterLine = value.substring(lineStart);

      const newText = beforeLine + prefix + afterLine;
      onChange(newText);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(lineStart + prefix.length, lineStart + prefix.length);
      }, 0);
    },
    [value, onChange]
  );

  const handleToolbarAction = useCallback(
    (action: string) => {
      switch (action) {
        case 'h1':
          insertLineStart('# ');
          break;
        case 'h2':
          insertLineStart('## ');
          break;
        case 'h3':
          insertLineStart('### ');
          break;
        case 'paragraph':
          break;
        case 'bold':
          insertAtCursor('**', '**', true);
          break;
        case 'italic':
          insertAtCursor('*', '*', true);
          break;
        case 'underline':
          insertAtCursor('_', '_', true);
          break;
        case 'quote':
          insertLineStart('> ');
          break;
        case 'ul':
          insertLineStart('- ');
          break;
        case 'ol':
          insertLineStart('1. ');
          break;
        case 'divider':
          insertAtCursor('\n---\n', '', false);
          break;
        case 'inline-code':
          insertAtCursor('`', '`', true);
          break;
        case 'code-block':
          insertAtCursor('\n```\n', '\n```\n', true);
          break;
        case 'link':
          saveSelection();
          setLinkText(value.substring(selection.start, selection.end));
          setLinkUrl('');
          setLinkModalOpen(true);
          break;
        case 'image':
          saveSelection();
          setImageUrl('');
          setImageAlt('');
          setImageModalOpen(true);
          break;
        case 'callout':
          saveSelection();
          setCalloutText('');
          setCalloutModalOpen(true);
          break;
      }
    },
    [insertAtCursor, insertLineStart, saveSelection, value, selection]
  );

  const handleMarkdownShortcut = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            handleToolbarAction('bold');
            return;
          case 'i':
            e.preventDefault();
            handleToolbarAction('italic');
            return;
          case 'k':
            e.preventDefault();
            handleToolbarAction('link');
            return;
        }
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        insertAtCursor('  ', '');
        return;
      }

      if (e.key === ' ' && textarea.selectionStart === textarea.selectionEnd) {
        const cursorPos = textarea.selectionStart;
        const lineStart = value.lastIndexOf('\n', cursorPos - 1) + 1;
        const lineText = value.substring(lineStart, cursorPos);

        const headingMatch = lineText.match(/^(#{1,3})$/);
        if (headingMatch) {
          e.preventDefault();
          const hash = headingMatch[1];
          const before = value.substring(0, lineStart);
          const after = value.substring(cursorPos);
          onChange(before + hash + ' ' + after);
          setTimeout(() => {
            textarea.setSelectionRange(lineStart + hash.length + 1, lineStart + hash.length + 1);
          }, 0);
          return;
        }

        const listMatch = lineText.match(/^(-|\*|\d+\.)$/);
        if (listMatch) {
          e.preventDefault();
          const marker = listMatch[1];
          const before = value.substring(0, lineStart);
          const after = value.substring(cursorPos);
          const prefix = marker === '-' || marker === '*' ? '- ' : marker + ' ';
          onChange(before + prefix + after);
          setTimeout(() => {
            textarea.setSelectionRange(lineStart + prefix.length, lineStart + prefix.length);
          }, 0);
          return;
        }

        const quoteMatch = lineText.match(/^>$/);
        if (quoteMatch) {
          e.preventDefault();
          const before = value.substring(0, lineStart);
          const after = value.substring(cursorPos);
          onChange(before + '> ' + after);
          setTimeout(() => {
            textarea.setSelectionRange(lineStart + 2, lineStart + 2);
          }, 0);
          return;
        }
      }
    },
    [value, onChange, handleToolbarAction, insertAtCursor]
  );

  const handleLinkSubmit = () => {
    const text = linkText || 'link';
    const markdown = `[${text}](${linkUrl || 'https://'})`;
    insertAtCursor(markdown, '');
    setLinkModalOpen(false);
    setLinkUrl('');
    setLinkText('');
  };

  const handleImageSubmit = () => {
    const markdown = `![${imageAlt || 'image'}](${imageUrl || 'https://'})`;
    insertAtCursor(markdown, '');
    setImageModalOpen(false);
    setImageUrl('');
    setImageAlt('');
  };

  const handleCalloutSubmit = () => {
    const markdown = `:::callout\n${calloutText}\n:::`;
    insertAtCursor(markdown, '');
    setCalloutModalOpen(false);
    setCalloutText('');
  };

  const toolbarGroups = [
    [
      { icon: Heading1, action: 'h1', title: 'Heading 1', shortcut: '# ' },
      { icon: Heading2, action: 'h2', title: 'Heading 2', shortcut: '## ' },
      { icon: Heading3, action: 'h3', title: 'Heading 3', shortcut: '### ' },
    ],
    [
      { icon: Bold, action: 'bold', title: 'Bold', shortcut: 'Ctrl+B' },
      { icon: Italic, action: 'italic', title: 'Italic', shortcut: 'Ctrl+I' },
      { icon: Underline, action: 'underline', title: 'Underline', shortcut: '_' },
    ],
    [
      { icon: Quote, action: 'quote', title: 'Blockquote', shortcut: '> ' },
      { icon: List, action: 'ul', title: 'Bullet List', shortcut: '- ' },
      { icon: ListOrdered, action: 'ol', title: 'Numbered List', shortcut: '1. ' },
    ],
    [
      { icon: Code, action: 'inline-code', title: 'Inline Code', shortcut: '`' },
      { icon: Code2, action: 'code-block', title: 'Code Block', shortcut: '```' },
      { icon: Minus, action: 'divider', title: 'Horizontal Divider', shortcut: '---' },
    ],
    [
      { icon: Link2, action: 'link', title: 'Hyperlink', shortcut: 'Ctrl+K' },
      { icon: Image, action: 'image', title: 'Image', shortcut: '' },
      { icon: AlertCircle, action: 'callout', title: 'Callout Box', shortcut: '' },
    ],
  ];

  const viewModes = [
    { mode: 'edit' as const, icon: Edit3, label: 'Edit' },
    { mode: 'preview' as const, icon: Eye, label: 'Preview' },
    { mode: 'split' as const, icon: Columns, label: 'Split' },
  ];

  return (
    <div className="border border-luxury-light/20 rounded-sm overflow-hidden bg-luxury-black">
      <div className="flex items-center justify-between border-b border-luxury-light/20 bg-luxury-light/5">
        <div className="flex items-center gap-1 p-2 overflow-x-auto">
          {toolbarGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="flex items-center gap-1">
              {groupIdx > 0 && <div className="w-px h-6 bg-luxury-light/20 mx-1" />}
              {group.map((btn) => (
                <button
                  key={btn.action}
                  type="button"
                  onClick={() => handleToolbarAction(btn.action)}
                  title={btn.title + (btn.shortcut ? ` (${btn.shortcut})` : '')}
                  aria-label={btn.title}
                  className="p-1.5 hover:bg-luxury-light/20 rounded text-gray-400 hover:text-white transition-colors shrink-0"
                >
                  <btn.icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1 p-2 border-l border-luxury-light/20">
          {viewModes.map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              title={label}
              aria-label={`${label} view`}
              className={`p-1.5 rounded transition-colors ${
                viewMode === mode
                  ? 'bg-gold-500/20 text-gold-400'
                  : 'text-gray-400 hover:text-white hover:bg-luxury-light/20'
              }`}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      <div className="flex">
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div
            className={`${
              viewMode === 'split' ? 'w-1/2 border-r border-luxury-light/20' : 'w-full'
            }`}
          >
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleMarkdownShortcut}
              onSelect={saveSelection}
              dir={dir}
              placeholder={placeholder}
              rows={16}
              className="w-full px-4 py-3 bg-transparent text-white placeholder-gray-500 focus:outline-none resize-none font-mono text-sm leading-relaxed"
              aria-label="Rich text editor content"
            />
          </div>
        )}

        {(viewMode === 'preview' || viewMode === 'split') && (
          <div
            className={`${
              viewMode === 'split' ? 'w-1/2' : 'w-full'
            } overflow-y-auto max-h-[500px]`}
          >
            {value ? (
              <div
                className="px-4 py-3 prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: previewHTML }}
              />
            ) : (
              <div className="px-4 py-3 text-gray-500 italic">
                {language === 'ar' ? 'لا يوجد محتوى' : 'No content to preview'}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-2 border-t border-luxury-light/20 bg-luxury-light/5 text-xs text-gray-400">
        <div className="flex items-center gap-4">
          <span aria-label="Word count">{wordStats.words} words</span>
          <span aria-label="Character count">{wordStats.characters} chars</span>
          <span aria-label="Reading time">{wordStats.readingTime}</span>
        </div>
        <div className="flex items-center gap-2">
          {showDraftNotification && (
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1 text-gold-400"
            >
              <Save className="w-3 h-3" />
              {draftStatus === 'saved' && (language === 'ar' ? 'تم الحفظ' : 'Draft saved')}
              {draftStatus === 'restored' && (language === 'ar' ? 'تم الاستعادة' : 'Draft restored')}
            </motion.span>
          )}
        </div>
      </div>

      <AnimatePresence>
        {linkModalOpen && (
          <Modal isOpen={linkModalOpen} onClose={() => setLinkModalOpen(false)} title="Insert Link">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Link Text</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-3 py-2 bg-luxury-light/10 border border-luxury-light/20 rounded-sm text-white focus:outline-none focus:ring-1 focus:ring-gold-500"
                  placeholder="Display text"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-luxury-light/10 border border-luxury-light/20 rounded-sm text-white focus:outline-none focus:ring-1 focus:ring-gold-500"
                  placeholder="https://..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setLinkModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLinkSubmit}
                  className="px-4 py-2 text-sm bg-gold-500 hover:bg-gold-400 text-luxury-black rounded-sm"
                >
                  Insert
                </button>
              </div>
            </div>
          </Modal>
        )}

        {imageModalOpen && (
          <Modal isOpen={imageModalOpen} onClose={() => setImageModalOpen(false)} title="Insert Image">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-luxury-light/10 border border-luxury-light/20 rounded-sm text-white focus:outline-none focus:ring-1 focus:ring-gold-500"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Alt Text</label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  className="w-full px-3 py-2 bg-luxury-light/10 border border-luxury-light/20 rounded-sm text-white focus:outline-none focus:ring-1 focus:ring-gold-500"
                  placeholder="Image description"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setImageModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImageSubmit}
                  className="px-4 py-2 text-sm bg-gold-500 hover:bg-gold-400 text-luxury-black rounded-sm"
                >
                  Insert
                </button>
              </div>
            </div>
          </Modal>
        )}

        {calloutModalOpen && (
          <Modal isOpen={calloutModalOpen} onClose={() => setCalloutModalOpen(false)} title="Insert Callout">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Callout Content</label>
                <textarea
                  value={calloutText}
                  onChange={(e) => setCalloutText(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-luxury-light/10 border border-luxury-light/20 rounded-sm text-white focus:outline-none focus:ring-1 focus:ring-gold-500 resize-none"
                  placeholder="Important notice or highlight..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCalloutModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCalloutSubmit}
                  className="px-4 py-2 text-sm bg-gold-500 hover:bg-gold-400 text-luxury-black rounded-sm"
                >
                  Insert
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-luxury-black border border-luxury-light/20 rounded-sm w-full max-w-md p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-display text-white mb-4">{title}</h3>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function createDraftKey(fieldName: string, itemId?: string): string {
  return `${STORAGE_KEY_PREFIX}${fieldName}_${itemId || 'new'}`;
}

export function saveDraft(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage might be full or unavailable
  }
}

export function restoreDraft(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function clearDraft(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Storage might be unavailable
  }
}

export default RichTextEditor;
