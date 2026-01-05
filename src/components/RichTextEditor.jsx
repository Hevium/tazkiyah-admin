import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useEffect } from "react";

import { Button, Space, Tooltip } from "antd";
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
} from "@ant-design/icons";

const RichTextEditor = ({ value = "", onChange, placeholder }) => {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: value || "",
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
  });

  // 🔥 THIS IS THE MOST IMPORTANT FIX
  useEffect(() => {
    if (!editor) return;

    const currentHTML = editor.getHTML();

    if (value !== currentHTML) {
      editor.commands.setContent(value || "", false);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div
      style={{
        border: "1px solid #d9d9d9",
        background: "#fff",
        borderRadius: 6,
      }}
    >
      {/* ===== Toolbar ===== */}
      <div
        style={{
          borderBottom: "1px solid #f0f0f0",
          padding: "6px 8px",
          background: "#fafafa",
        }}
      >
        <Space>
          <Tooltip title="Bold">
            <Button
              icon={<BoldOutlined />}
              type={editor.isActive("bold") ? "primary" : "default"}
              size="small"
              onClick={() => editor.chain().focus().toggleBold().run()}
            />
          </Tooltip>

          <Tooltip title="Italic">
            <Button
              icon={<ItalicOutlined />}
              type={editor.isActive("italic") ? "primary" : "default"}
              size="small"
              onClick={() =>
                editor.chain().focus().toggleItalic().run()
              }
            />
          </Tooltip>

          <Tooltip title="Underline">
            <Button
              icon={<UnderlineOutlined />}
              type={editor.isActive("underline") ? "primary" : "default"}
              size="small"
              onClick={() =>
                editor.chain().focus().toggleUnderline().run()
              }
            />
          </Tooltip>

          <Tooltip title="Bullet List">
            <Button
              icon={<UnorderedListOutlined />}
              size="small"
              onClick={() =>
                editor.chain().focus().toggleBulletList().run()
              }
            />
          </Tooltip>

          <Tooltip title="Numbered List">
            <Button
              icon={<OrderedListOutlined />}
              size="small"
              onClick={() =>
                editor.chain().focus().toggleOrderedList().run()
              }
            />
          </Tooltip>
        </Space>
      </div>

      {/* ===== Editor Area ===== */}
      <div
        style={{
          padding: 12,
          minHeight: 150,
          position: "relative",
          cursor: "text",
        }}
      >
        <EditorContent editor={editor} />

        {!editor.getText() && placeholder && (
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              opacity: 0.35,
              pointerEvents: "none",
            }}
          >
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;
