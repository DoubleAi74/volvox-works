"use client";

import ImageWithLoader from "@/components/ImageWithLoader";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  X,
  Upload,
  Link as LinkIcon,
  File,
  Image as ImageIcon,
} from "lucide-react";
import { uploadFile } from "@/lib/data";

import { useAuth } from "@/context/AuthContext";

// Dynamically import the RichTextEditor with SSR disabled and Dark Mode styling
const RichTextEditor = dynamic(() => import("./RichTextEditor"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[150px] rounded-[3px] bg-white/5 border border-white/10 animate-pulse"></div>
  ),
});

const initialFormData = {
  title: "",
  description: "",
  thumbnail: "",
  content_type: "url", // Default changed from 'text' to 'url'
  content: "",
};

export default function CreatePostModal({ isOpen, onClose, onSubmit }) {
  const { user } = useAuth();

  const [formData, setFormData] = useState(initialFormData);
  const [thumbUploading, setThumbUploading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // When the modal is opened, reset the form data and uploading statuses
    if (isOpen) {
      setFormData(initialFormData);
      setThumbUploading(false);
      setFileUploading(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    // Lock body scroll to prevent background scrolling
    const scrollY = window.scrollY;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    document.body.style.overscrollBehavior = "none";

    return () => {
      const y = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.paddingRight = "";
      document.body.style.overscrollBehavior = "";
      if (y) window.scrollTo(0, parseInt(y, 10) * -1);
    };
  }, [isOpen]);

  const handleSubmit = async (e) => {
    console.log("Submitting form");
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    if (isSubmitting) return;

    let postData = { ...formData };
    setFormData(postData);

    setIsSubmitting(true);
    try {
      await onSubmit(postData);
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    let userId = null;
    try {
      userId = user?.uid;
    } catch (e) {
      userId = "iSoumGsivCO1Bm8kU50oiFsBKm33"; // Fallback ID from your original code
    }

    if (!userId) return alert("You must be logged in.");

    setThumbUploading(true);
    try {
      const securePath = `users/${userId}/post-thumbnails`;
      const file_url = await uploadFile(file, securePath);
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

    const userId = user?.uid;
    if (!userId) return alert("You must be logged in.");

    setFileUploading(true);
    try {
      const securePath = `users/${userId}/post-content-files`;
      const file_url = await uploadFile(file, securePath);
      setFormData((prev) => ({ ...prev, content: file_url }));
    } catch (error) {
      console.error("Content file upload failed:", error);
      alert("Content file upload failed.");
    }
    setFileUploading(false);
  };

  if (!isOpen) return null;

  // Shared input style class
  const inputBaseClass =
    "w-full px-4 py-2.5 rounded-[3px] bg-white/5 border border-white/10 text-white/90 placeholder-white/30 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-colors duration-150 focus:ring-1 focus:ring-white/10";

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[200] p-4">
      {/* Main Card Container */}
      <div className="bg-neutral-900/90 backdrop-blur-[4px] border border-white/[0.08] rounded-[5px] p-6 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 className="text-lg font-semibold text-white">Create New Post</h2>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-[2px] bg-white/[0.06] hover:bg-white/12 active:bg-white/15 text-white/50 hover:text-white/90 transition-all duration-150"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto pr-2">
          <form
            id="create-post-form"
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Post Title <span className="text-amber-400/80">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className={inputBaseClass}
                placeholder="Enter post title"
                required
              />
            </div>

            {/* Description - NOW RICHTEXT */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Description
              </label>
              <div className="min-h-[150px]">
                <RichTextEditor
                  value={formData.description}
                  onChange={(content) =>
                    setFormData((prev) => ({ ...prev, description: content }))
                  }
                  variant="dark"
                  placeholder="Write a description for your post..."
                />
              </div>
            </div>

            {/* Thumbnail Upload */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Thumbnail Image (Optional)
              </label>
              <div className="flex items-center gap-4">
                {/* Preview Box */}
                <div className="w-16 h-16 rounded-[1px] overflow-hidden border border-white/10 flex-shrink-0 relative">
                  {formData.thumbnail ? (
                    <ImageWithLoader
                      src={formData.thumbnail}
                      alt="Thumbnail Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/[0.03] flex items-center justify-center">
                      {thumbUploading ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-white/20" />
                      )}
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    className="hidden"
                    id="post-thumbnail-upload"
                    disabled={thumbUploading}
                  />
                  <label
                    htmlFor="post-thumbnail-upload"
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-[2px] bg-white/[0.06] border border-white/10 text-sm text-white/60 cursor-pointer hover:bg-white/10 hover:text-white/80 hover:border-white/15 active:bg-white/15 transition-all duration-150 ${
                      thumbUploading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span className="truncate">
                      {thumbUploading
                        ? "Uploading..."
                        : formData.thumbnail
                        ? "Change Image"
                        : "Select Image"}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Content Type Selector - TEXT REMOVED */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Content Type <span className="text-amber-400/80">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "url", icon: LinkIcon, label: "URL" },
                  { value: "file", icon: File, label: "File" },
                ].map(({ value, icon: Icon, label }) => {
                  const isActive = formData.content_type === value;
                  return (
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
                      className={`p-3 rounded-[3px] flex flex-col items-center justify-center gap-2 text-sm border transition-all duration-150 ${
                        isActive
                          ? "bg-white/10 border-white/20 text-white/90 shadow-sm shadow-black/20"
                          : "bg-white/[0.04] border-transparent text-white/50 hover:bg-white/[0.08] hover:text-white/70"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Content Input - RICHTEXT REMOVED HERE */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Content Source <span className="text-amber-400/80">*</span>
              </label>

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
                  className={inputBaseClass}
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
                    disabled={fileUploading}
                  />
                  <label
                    htmlFor="content-file-upload"
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-[2px] bg-white/[0.06] border border-white/10 text-white/60 cursor-pointer w-full hover:bg-white/10 hover:text-white/80 hover:border-white/15 active:bg-white/15 transition-all duration-150 ${
                      fileUploading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    {fileUploading
                      ? "Uploading..."
                      : formData.content
                      ? "Change File"
                      : "Upload File"}
                  </label>
                  {formData.content && !fileUploading && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-[2px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400/90 text-xs truncate">
                      <File className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{formData.content}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 pt-4 mt-auto flex-shrink-0 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-[3px] bg-white/[0.04] border border-white/[0.08] text-white/50 font-medium hover:bg-white/[0.08] hover:border-white/15 hover:text-white/70 active:bg-white/12 transition-all duration-150"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-post-form"
            className="flex-1 py-2.5 rounded-[3px] bg-neutral-100/90 text-neutral-900 font-semibold hover:bg-neutral-100 active:bg-neutral-100/80 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-neutral-100/90 transition-all duration-100 shadow-lg shadow-white/10"
            disabled={
              !formData.title.trim() ||
              !formData.content.trim() ||
              thumbUploading ||
              fileUploading ||
              isSubmitting
            }
          >
            {isSubmitting ? "Creating..." : "Create Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
