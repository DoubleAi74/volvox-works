"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic"; // 1. Import dynamic
import { X, Upload, Link as LinkIcon, Type, File } from "lucide-react";
import ImageWithLoader from "@/components/ImageWithLoader";

import { uploadFile } from "@/lib/data";

// 2. Use dynamic import to load the editor only on the client-side
const RichTextEditor = dynamic(() => import("./RichTextEditor"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[150px] rounded-xl bg-neumorphic-bg shadow-neumorphic-inset animate-pulse"></div>
  ),
});

export default function EditPostModal({ isOpen, post, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thumbnail: "",
    content_type: "text",
    content: "",
    order_index: 0,
  });

  const [thumbUploading, setThumbUploading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || "",
        description: post.description || "",
        thumbnail: post.thumbnail || "",
        content_type: post.content_type || "text",
        content: post.content || "",
        order_index: post.order_index || 0,
      });
    }
  }, [post]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    const dataToSend = {
      ...formData,
      order_index: Number(formData.order_index) || 0,
    };

    onSubmit(dataToSend);
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
    }
    setFileUploading(false);
  };

  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      {/* 1. Add `flex flex-col` */}
      <div className="bg-neumorphic-bg rounded-2xl shadow-neumorphic p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 className="text-xl font-bold text-neumorphic">Edit Post</h2>
          <button onClick={onClose} /* ... */>
            <X className="w-5 h-5 text-neumorphic-text" />
          </button>
        </div>

        {/* 2. Main scrollable area */}
        <div className="flex-grow overflow-y-auto pr-2">
          <form
            id="edit-post-form"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* ... all your other form fields are correct ... */}
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
            <div>
              <label className="block text-sm font-medium text-neumorphic mb-2">
                Order Index
              </label>
              <input
                type="number"
                min="0"
                value={formData.order_index}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    order_index: value === "" ? "" : parseInt(value, 10),
                  }));
                }}
                className="w-full px-4 py-3 rounded-xl bg-neumorphic-bg shadow-neumorphic-inset text-neumorphic-text placeholder-neumorphic-text focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neumorphic mb-2">
                Thumbnail Image
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
                    <Upload className="w-6 h-6 text-neumorphic-text" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    className="hidden"
                    id="edit-thumbnail-upload"
                  />
                  <label
                    htmlFor="edit-thumbnail-upload"
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg btn-neumorphic shadow-neumorphic text-sm text-neumorphic-text cursor-pointer hover:shadow-neumorphic-soft active:shadow-neumorphic-pressed"
                  >
                    <Upload className="w-4 h-4" />
                    {thumbUploading ? "Uploading..." : "Change Thumbnail"}
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
                    id="edit-content-file-upload"
                  />
                  <label
                    htmlFor="edit-content-file-upload"
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl btn-neumorphic shadow-neumorphic text-neumorphic-text cursor-pointer w-full hover:shadow-neumorphic-soft active:shadow-neumorphic-pressed"
                  >
                    <Upload className="w-4 h-4" />
                    {fileUploading ? "Uploading..." : "Change File"}
                  </label>
                  {formData.content && !fileUploading && (
                    <p className="text-xs text-center text-neumorphic-text truncate">
                      Current file: {formData.content}
                    </p>
                  )}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* 3. Sticky action buttons */}
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
            form="edit-post-form" // This associates the button with the form
            className="flex-1 py-3 rounded-xl btn-neumorphic shadow-neumorphic text-neumorphic-text font-medium disabled:opacity-50"
            disabled={
              !formData.title.trim() ||
              !formData.content.trim() ||
              thumbUploading ||
              fileUploading
            }
          >
            Update Post
          </button>
        </div>
      </div>
    </div>
  );
}
