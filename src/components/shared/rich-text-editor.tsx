"use client";

import { useCallback, useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { Link as TiptapLink } from "@tiptap/extension-link";
import { Image as TiptapImage } from "@tiptap/extension-image";
import {
  Bold,
  Underline as UnderlineIcon,
  Highlighter,
  Palette,
  Undo2,
  Redo2,
  Link,
  Image,
  Loader2,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6",
  "#8b5cf6", "#ec4899", "#6b7280", "#000000", "#ffffff",
];

const HIGHLIGHT_COLORS = [
  "#fef08a", "#fde68a", "#bbf7d0", "#bfdbfe",
  "#ddd6fe", "#fecaca", "#fed7aa", "#e9d5ff",
];

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "输入内容...",
  className,
  minHeight = "300px",
}: RichTextEditorProps) {
  const [textColorOpen, setTextColorOpen] = useState(false);
  const [highlightOpen, setHighlightOpen] = useState(false);
  const [fontSizeOpen, setFontSizeOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [customColor, setCustomColor] = useState("#000000");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  // Custom TextStyle that renders fontSize as CSS
  const TextStyleWithFontSize = TextStyle.extend({
    addAttributes() {
      return {
        fontSize: {
          default: null,
          parseHTML: (element) => element.style.fontSize || null,
          renderHTML: (attributes) => {
            if (!attributes.fontSize) return {};
            return { style: `font-size: ${attributes.fontSize}` };
          },
        },
      };
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Underline,
      TextStyleWithFontSize,
      Color,
      Highlight.configure({ multicolor: true }),
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      TiptapImage.configure({
        HTMLAttributes: { class: "rounded-md max-w-full my-2" },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none",
          "min-h-[var(--editor-min-height)] p-3"
        ),
        style: `--editor-min-height: ${minHeight}`,
      },
    },
    immediatelyRender: false,
  });

  // ── Font Size ───────────────────────────────────

  const FONT_SIZES = [
    { label: "小", value: "12px" },
    { label: "默认", value: "16px" },
    { label: "中", value: "20px" },
    { label: "大", value: "24px" },
    { label: "特大", value: "32px" },
    { label: "标题", value: "40px" },
  ];

  const currentFontSize = useCallback(() => {
    if (!editor) return "16px";
    const attrs = editor.getAttributes("textStyle");
    return attrs.fontSize || "16px";
  }, [editor]);

  const setFontSize = useCallback(
    (size: string) => {
      if (!editor) return;
      if (size === "16px") {
        editor.chain().focus().setMark("textStyle", { fontSize: null }).run();
      } else {
        editor.chain().focus().setMark("textStyle", { fontSize: size }).run();
      }
      setFontSizeOpen(false);
    },
    [editor]
  );

  // ── Color ──────────────────────────────────────

  const setColor = useCallback(
    (color: string) => {
      editor?.chain().focus().setColor(color).run();
      setTextColorOpen(false);
    },
    [editor]
  );

  const unsetColor = useCallback(() => {
    editor?.chain().focus().unsetColor().run();
    setTextColorOpen(false);
  }, [editor]);

  // ── Highlight ──────────────────────────────────

  const setHighlight = useCallback(
    (color: string) => {
      editor?.chain().focus().toggleHighlight({ color }).run();
      setHighlightOpen(false);
    },
    [editor]
  );

  // ── Link ───────────────────────────────────────

  const openLinkPopover = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link");
    setLinkUrl(prev.href || "");
    setLinkOpen(true);
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const url = linkUrl.trim();
    if (!url) {
      editor.chain().focus().unsetLink().run();
    } else {
      // Add https:// if no protocol
      const fullUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
      editor.chain().focus().extendMarkRange("link").setLink({ href: fullUrl }).run();
    }
    setLinkOpen(false);
  }, [editor, linkUrl]);

  const removeLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
    setLinkOpen(false);
  }, [editor]);

  // ── Image Upload ───────────────────────────────

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;

      // Validate
      if (!file.type.startsWith("image/")) {
        toast.error("请选择图片文件");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("图片不能超过 5MB");
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload/image", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Upload failed");
        const json = await res.json();
        // Insert image wrapped in a clickable link to view original
        editor
          .chain()
          .focus()
          .insertContent(
            `<a href="${json.data.url}" target="_blank" rel="noopener noreferrer" class="image-link"><img src="${json.data.url}" alt="uploaded image" /></a><p></p>`
          )
          .run();
        toast.success("图片已插入（点击可查看原图）");
      } catch {
        toast.error("图片上传失败");
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [editor]
  );

  if (!editor) {
    return (
      <div
        className={cn(
          "rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground",
          className
        )}
        style={{ minHeight }}
      >
        加载编辑器中...
      </div>
    );
  }

  return (
    <div className={cn("rounded-md border overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b bg-muted/30">
        {/* Bold */}
        <Button
          variant="ghost" size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn("h-8 w-8 p-0", editor.isActive("bold") && "bg-accent")}
          title="加粗"
        >
          <Bold className="h-4 w-4" />
        </Button>

        {/* Underline */}
        <Button
          variant="ghost" size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn("h-8 w-8 p-0", editor.isActive("underline") && "bg-accent")}
          title="下划线"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>

        {/* Font Size */}
        <Popover open={fontSizeOpen} onOpenChange={setFontSizeOpen}>
          <PopoverTrigger
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-8 px-1.5 gap-0.5 hover:bg-accent hover:text-accent-foreground"
            title="字体大小"
          >
            <Type className="h-4 w-4" />
            <span className="text-[10px] leading-none mt-0.5">▼</span>
          </PopoverTrigger>
          <PopoverContent className="w-36" align="start">
            <div className="space-y-1">
              <p className="text-xs font-medium px-1 pb-1">字体大小</p>
              {FONT_SIZES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setFontSize(s.value)}
                  className={cn(
                    "w-full text-left px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors",
                    currentFontSize() === s.value && "bg-accent font-medium"
                  )}
                >
                  <span style={{ fontSize: s.value === "12px" ? "12px" : "14px" }}>
                    {s.label}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {s.value}
                  </span>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Text Color */}
        <Popover open={textColorOpen} onOpenChange={setTextColorOpen}>
          <PopoverTrigger
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground",
              editor.isActive("textStyle") && "bg-accent"
            )}
            title="字体颜色"
          >
            <Palette className="h-4 w-4" />
          </PopoverTrigger>
          <PopoverContent className="w-52" align="start">
            <div className="space-y-2">
              <p className="text-xs font-medium">字体颜色</p>
              <div className="flex flex-wrap gap-1">
                {COLORS.map((color) => (
                  <button
                    key={color} type="button"
                    onClick={() => setColor(color)}
                    className="h-6 w-6 rounded border cursor-pointer hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }} title={color}
                  />
                ))}
              </div>
              {/* Custom color picker */}
              <div className="flex items-center gap-2 pt-1.5 border-t">
                <button
                  type="button"
                  onClick={() => colorInputRef.current?.click()}
                  className="h-8 w-8 rounded border-2 border-input hover:border-foreground transition-colors cursor-pointer flex-shrink-0 relative overflow-hidden"
                  title="打开取色器"
                  style={{ backgroundColor: customColor }}
                >
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="h-3 w-3 rounded-full border border-white/30"
                      style={{
                        background: `conic-gradient(red,yellow,lime,cyan,blue,magenta,red)`,
                      }}
                    />
                  </span>
                </button>
                <input
                  ref={colorInputRef}
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="sr-only"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 flex-1"
                  onClick={() => setColor(customColor)}
                >
                  吸取并应用
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="w-full text-xs" onClick={unsetColor}>
                清除颜色
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Highlight */}
        <Popover open={highlightOpen} onOpenChange={setHighlightOpen}>
          <PopoverTrigger
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground",
              editor.isActive("highlight") && "bg-accent"
            )}
            title="荧光标记"
          >
            <Highlighter className="h-4 w-4" />
          </PopoverTrigger>
          <PopoverContent className="w-52" align="start">
            <div className="space-y-2">
              <p className="text-xs font-medium">荧光标记颜色</p>
              <div className="flex flex-wrap gap-1">
                {HIGHLIGHT_COLORS.map((color) => (
                  <button
                    key={color} type="button"
                    onClick={() => setHighlight(color)}
                    className="h-6 w-6 rounded border cursor-pointer hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }} title={color}
                  />
                ))}
              </div>
              <Button
                variant="ghost" size="sm" className="w-full text-xs"
                onClick={() => { editor.chain().focus().unsetHighlight().run(); setHighlightOpen(false); }}
              >
                清除标记
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Insert Link */}
        <Popover open={linkOpen} onOpenChange={setLinkOpen}>
          <PopoverTrigger
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground",
              editor.isActive("link") && "bg-accent"
            )}
            title="插入链接"
            onClick={openLinkPopover}
          >
            <Link className="h-4 w-4" />
          </PopoverTrigger>
          <PopoverContent className="w-64" align="start">
            <div className="space-y-3">
              <p className="text-xs font-medium">
                {editor.isActive("link") ? "编辑链接" : "插入链接"}
              </p>
              <div>
                <Label className="text-xs">URL</Label>
                <Input
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && setLink()}
                />
              </div>
              <div className="flex gap-2 justify-between">
                {editor.isActive("link") && (
                  <Button variant="ghost" size="sm" className="text-destructive text-xs" onClick={removeLink}>
                    移除链接
                  </Button>
                )}
                <div className="flex gap-2 ml-auto">
                  <Button variant="ghost" size="sm" onClick={() => setLinkOpen(false)}>取消</Button>
                  <Button size="sm" onClick={setLink} disabled={!linkUrl.trim()}>
                    {editor.isActive("link") ? "更新" : "插入"}
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Insert Image */}
        <>
          <Button
            variant="ghost" size="sm"
            onClick={() => fileInputRef.current?.click()}
            className={cn("h-8 w-8 p-0", uploading && "opacity-50")}
            title="上传图片"
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Image className="h-4 w-4" />
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Undo / Redo */}
        <Button
          variant="ghost" size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          className="h-8 w-8 p-0" title="撤销"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost" size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          className="h-8 w-8 p-0" title="重做"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="prose prose-sm dark:prose-invert max-w-none [&_.ProseMirror]:min-h-[var(--editor-min-height)] [&_.ProseMirror]:p-3 [&_.ProseMirror]:outline-none [&_.ProseMirror]:h-full [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md"
        style={{ minHeight } as React.CSSProperties}
      />
    </div>
  );
}
