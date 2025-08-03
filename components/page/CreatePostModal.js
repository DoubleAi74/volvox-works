"use client";

import ImageWithLoader from "@/components/ImageWithLoader";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  X,
  Upload,
  Link as LinkIcon,
  Type,
  File,
  Image as ImageIcon,
} from "lucide-react";
import { uploadFile } from "@/lib/data";

// Dynamically import the RichTextEditor with SSR disabled
const RichTextEditor = dynamic(() => import("./RichTextEditor"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[150px] rounded-xl bg-neumorphic-bg shadow-neumorphic-inset animate-pulse"></div>
  ),
});

const initialFormData = {
  title: "",
  description: "",
  thumbnail: "",
  content_type: "text",
  content: "",
};

export default function CreatePostModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState(initialFormData);
  const [thumbUploading, setThumbUploading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);

  useEffect(() => {
    // When the modal is opened, reset the form data and uploading statuses
    if (isOpen) {
      setFormData(initialFormData);
      setThumbUploading(false);
      setFileUploading(false);
    }
  }, [isOpen]);

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
      const file_url = await uploadFile(file, "post-thumbnails");
      setFormData((prev) => ({ ...prev, thumbnail: file_url }));
    } catch (error) {
      console.error("Thumbnail upload failed:", error);
      alert("Thumbnail upload failed.");
    }
    setThumbUploading(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileUploading(true);
    try {
      const file_url = await uploadFile(file, "post-content-files");
      setFormData((prev) => ({ ...prev, content: file_url }));
    } catch (error) {
      console.error("Content file upload failed:", error);
      alert("Content file upload failed.");
    }
    setFileUploading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      {/* 1. Add `flex flex-col` to make this a flex container */}
      <div className="bg-neumorphic-bg rounded-2xl shadow-neumorphic p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 className="text-xl font-bold text-neumorphic">Create New Post</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg btn-neumorphic shadow-neumorphic hover:shadow-neumorphic-soft active:shadow-neumorphic-pressed"
          >
            <X className="w-5 h-5 text-neumorphic-text" />
          </button>
        </div>

        {/* 2. We no longer need the form tag to wrap everything */}
        {/* The form tag will now be inside the scrollable area */}

        {/* 3. This div will be the main scrollable area */}
        <div className="flex-grow overflow-y-auto pr-2">
          <form
            id="create-post-form"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
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
                className="w-full px-4 py-3 rounded-xl bg-neumorphic-bg shadow-neumorphic-inset text-neumorphic-text placeholder-neumorphic-text/70 focus:outline-none"
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
                className="w-full px-4 py-3 rounded-xl bg-neumorphic-bg shadow-neumorphic-inset text-neumorphic-text placeholder-neumorphic-text/70 focus:outline-none resize-none"
                placeholder="Enter post description"
                rows="2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neumorphic mb-2">
                Thumbnail Image (Optional)
              </label>
              <div className="flex items-center gap-4">
                {formData.thumbnail ? (
                  <div className="w-16 h-16 rounded-lg overflow-hidden shadow-neumorphic-inset">
                    <ImageWithLoader
                      src={formData.thumbnail}
                      alt="Thumbnail Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-neumorphic-bg shadow-neumorphic-inset flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-neumorphic-text" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    className="hidden"
                    id="post-thumbnail-upload"
                  />
                  <label
                    htmlFor="post-thumbnail-upload"
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg btn-neumorphic shadow-neumorphic text-sm text-neumorphic-text cursor-pointer hover:shadow-neumorphic-soft active:shadow-neumorphic-pressed"
                  >
                    <Upload className="w-4 h-4" />
                    {thumbUploading ? "Uploading..." : "Upload Image"}
                  </label>
                </div>
              </div>
            </div>

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
                    setFormData((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 rounded-xl bg-neumorphic-bg shadow-neumorphic-inset text-neumorphic-text placeholder-neumorphic-text/70 focus:outline-none"
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
          </form>
        </div>
        <div className="flex gap-4 pt-4 mt-auto flex-shrink-0 border-t border-neumorphic-shadow-dark/20">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl btn-neumorphic shadow-neumorphic text-neumorphic-text hover:shadow-neumorphic-soft active:shadow-neumorphic-pressed"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-post-form" // This associates the button with the form
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
      </div>
    </div>
  );
}
