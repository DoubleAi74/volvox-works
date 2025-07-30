"use client";

import React, { useState } from "react";
import { X, Upload, Link as LinkIcon, Type, File } from "lucide-react";
import RichTextEditor from "./RichTextEditor";

// MOCK FUNCTION - This will be replaced by Firebase Storage
const UploadFile = async ({ file }) => {
  console.log("Simulating upload for:", file.name);
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const isImage = file.type.startsWith("image/");
  // For non-image files, we can't create a preview URL this way, but it's fine for the mock.
  return {
    file_url: isImage
      ? URL.createObjectURL(file)
      : "https://mock.file.url/document.pdf",
  };
};

export default function CreatePostModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thumbnail: "",
    content_type: "text",
    content: "",
  });

  const [thumbUploading, setThumbUploading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;
    onSubmit(formData);
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setThumbUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setFormData((prev) => ({ ...prev, thumbnail: file_url }));
    } catch (error) {
      console.error("Thumbnail upload failed:", error);
    }
    setThumbUploading(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setFormData((prev) => ({ ...prev, content: file_url }));
    } catch (error) {
      console.error("Content file upload failed:", error);
    }
    setFileUploading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-neumorphic-bg rounded-2xl shadow-neumorphic p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-neumorphic">Create New Post</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg btn-neumorphic shadow-neumorphic hover:shadow-neumorphic-soft active:shadow-neumorphic-pressed"
          >
            <X className="w-5 h-5 text-neumorphic-text" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title and Description fields are identical to CreatePageModal */}
          <div>
            <label className="block text-sm font-medium text-neumorphic mb-2">
              Post Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full px-4 py-3 rounded-xl bg-neumorphic-bg shadow-neumorphic-inset text-neumorphic-text placeholder-neumorphic-text focus:outline-none"
              placeholder="Enter post title"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neumorphic mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full px-4 py-3 rounded-xl bg-neumorphic-bg shadow-neumorphic-inset text-neumorphic-text placeholder-neumorphic-text focus:outline-none resize-none"
              placeholder="Enter post description"
              rows="2"
            />
          </div>

          {/* Thumbnail Upload field is also similar */}
          <div>
            <label className="block text-sm font-medium text-neumorphic mb-2">
              Thumbnail Image (Optional)
            </label>
            {/* ... copy from CreatePageModal.js or implement from scratch ... */}
          </div>

          {/* Content Type Selection */}
          <div>
            <label className="block text-sm font-medium text-neumorphic mb-2">
              Content Type *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "text", icon: Type, label: "Text" },
                { value: "file", icon: File, label: "File" },
                { value: "url", icon: LinkIcon, label: "URL" },
              ].map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      content_type: value,
                      content: "",
                    }))
                  }
                  className={`p-3 rounded-xl flex flex-col items-center justify-center gap-2 btn-neumorphic text-sm transition-all duration-200 ${
                    formData.content_type === value
                      ? "shadow-neumorphic-inset"
                      : "shadow-neumorphic hover:shadow-neumorphic-soft"
                  }`}
                >
                  <Icon className="w-5 h-5 text-neumorphic-text" />
                  <span className="text-neumorphic-text">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Content Input */}
          <div>
            <label className="block text-sm font-medium text-neumorphic mb-2">
              Content *
            </label>
            {formData.content_type === "text" && (
              <RichTextEditor
                value={formData.content}
                onChange={(content) =>
                  setFormData((prev) => ({ ...prev, content }))
                }
              />
            )}
            {formData.content_type === "url" && (
              <input
                type="url"
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, content: e.target.value }))
                }
                className="w-full px-4 py-3 rounded-xl bg-neumorphic-bg shadow-neumorphic-inset text-neumorphic-text placeholder-neumorphic-text focus:outline-none"
                placeholder="https://example.com"
                required
              />
            )}
            {formData.content_type === "file" && (
              <div className="space-y-2">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="content-file-upload"
                />
                <label
                  htmlFor="content-file-upload"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl btn-neumorphic shadow-neumorphic text-neumorphic-text cursor-pointer w-full hover:shadow-neumorphic-soft active:shadow-neumorphic-pressed"
                >
                  <Upload className="w-4 h-4" />
                  {fileUploading
                    ? "Uploading..."
                    : formData.content
                    ? "Change File"
                    : "Upload File"}
                </label>
                {formData.content && !fileUploading && (
                  <p className="text-xs text-center text-neumorphic-text truncate">
                    File: {formData.content}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl btn-neumorphic shadow-neumorphic text-neumorphic-text hover:shadow-neumorphic-soft active:shadow-neumorphic-pressed"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl btn-neumorphic shadow-neumorphic text-neumorphic-text font-medium disabled:opacity-50"
              disabled={
                !formData.title.trim() ||
                !formData.content.trim() ||
                thumbUploading ||
                fileUploading
              }
            >
              Create Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
