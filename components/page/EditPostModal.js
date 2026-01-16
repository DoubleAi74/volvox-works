"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  X,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  File,
} from "lucide-react";
import ImageWithLoader from "@/components/ImageWithLoader";
import { processImage } from "@/lib/processImage";
import { useAuth } from "@/context/AuthContext";

// Dynamically import the RichTextEditor with SSR disabled
const RichTextEditor = dynamic(() => import("./RichTextEditor"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[120px] rounded-[3px] bg-white/5 border border-white/10 animate-pulse"></div>
  ),
});

// File size limit for content files
const CONTENT_FILE_MAX_SIZE = 50 * 1024 * 1024; // 50MB

// Helper to extract filename from R2 URL
const getFilenameFromUrl = (url) => {
  if (!url) return "";
  try {
    const pathname = new URL(url).pathname;
    const filename = pathname.split("/").pop();
    return decodeURIComponent(filename) || "";
  } catch {
    return "";
  }
};

const initialFormData = {
  title: "",
  description: "",
  thumbnail: "",
  blurDataURL: "",
  pendingFile: null,
  needsServerBlur: false,
  content_type: "photo-only",
  content: "",
  contentFile: null, // For new file uploads
  contentFileName: "", // Display name for content file
  urlInput: "", // Separate field for URL input when switching from non-URL type
  order_index: 0,
  // Track original values to detect changes
  originalContentType: "photo-only",
  originalContent: "",
};

export default function EditPostModal({ isOpen, post, onClose, onSubmit }) {
  const { user } = useAuth();

  const [formData, setFormData] = useState(initialFormData);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsProcessing(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    // 1. Save scroll position
    const scrollY = window.scrollY;

    // 2. Measure scrollbar width (prevents layout shift)
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    // 3. Lock body scroll
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    document.body.style.overscrollBehavior = "none";

    return () => {
      // 4. Restore scroll
      const y = document.body.style.top;

      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.paddingRight = "";
      document.body.style.overscrollBehavior = "";

      if (y) {
        window.scrollTo(0, parseInt(y, 10) * -1);
      }
    };
  }, [isOpen]);

  // Populate form when post changes
  useEffect(() => {
    if (post) {
      const contentType = post.content_type || "photo-only";
      const rawContent = post.content || "";

      // Check if content looks like an R2 URL (contains the R2 domain)
      const isR2Url = rawContent && typeof rawContent === "string" &&
        rawContent.includes(process.env.NEXT_PUBLIC_R2_DOMAIN || "r2.cloudflarestorage");

      // Determine the actual content to use:
      // - If type is "file", use the content as-is (it's the R2 URL)
      // - If type is "url" and content is an R2 URL, it's stale data - use empty
      // - If type is "url" and content is NOT an R2 URL, it's a real URL - use it
      // - If type is "photo-only", content should be empty
      let content = rawContent;
      if (contentType === "photo-only") {
        content = "";
      } else if (contentType === "url" && isR2Url) {
        content = ""; // Stale R2 URL from before type switch - ignore it
      }

      setFormData({
        title: post.title || "",
        description: post.description || "",
        thumbnail: post.thumbnail || "",
        blurDataURL: post.blurDataURL || "",
        pendingFile: null,
        needsServerBlur: false,
        content_type: contentType,
        content: content,
        contentFile: null,
        // For existing file posts, extract filename from URL
        // Only show filename if type is "file" AND content is a valid R2 URL
        contentFileName: contentType === "file" && isR2Url ? getFilenameFromUrl(rawContent) : "",
        urlInput: "", // Reset URL input field
        order_index: post.order_index || 0,
        // Track originals for cleanup detection
        originalContentType: contentType,
        originalContent: rawContent,
      });
    }
  }, [post]);

  const handleContentFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (50MB limit for content files)
    if (file.size > CONTENT_FILE_MAX_SIZE) {
      alert("Content file must be less than 50MB.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      contentFile: file,
      contentFileName: file.name,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    onSubmit({
      title: formData.title,
      description: formData.description,
      thumbnail: formData.thumbnail,
      blurDataURL: formData.blurDataURL,
      pendingFile: formData.pendingFile,
      needsServerBlur: formData.needsServerBlur,
      content_type: formData.content_type,
      content: formData.content,
      contentFile: formData.contentFile, // New file upload
      order_index: Number(formData.order_index) || 0,
      // Pass originals for cleanup detection
      originalContentType: formData.originalContentType,
      originalContent: formData.originalContent,
    });

    onClose();
  };

  const handleThumbnailSelect = async (e) => {
    const rawFile = e.target.files[0];
    if (!rawFile) return;

    const userId = user?.uid;
    if (!userId) return alert("You must be logged in.");

    setIsProcessing(true);

    try {
      const {
        file: processedFile,
        blurDataURL,
        needsServerBlur,
      } = await processImage(rawFile);

      console.log("[EditPostModal] Image processed:", {
        hasBlur: !!blurDataURL,
        needsServerBlur,
      });

      setFormData((prev) => ({
        ...prev,
        blurDataURL: blurDataURL || "",
        pendingFile: processedFile,
        needsServerBlur: needsServerBlur,
        thumbnail: "", // Clear old thumbnail URL since we have a new pending file
        fileName: rawFile.name,
      }));
    } catch (error) {
      console.error("Image processing failed:", error);
      alert("Failed to process image.");
    }

    setIsProcessing(false);
  };

  if (!isOpen || !post) return null;

  // Determine what to show for thumbnail preview
  const hasNewPendingFile = !!formData.pendingFile;
  const hasExistingThumbnail = !!formData.thumbnail;
  const hasBlurPreview = !!formData.blurDataURL;

  const canSubmit = !isProcessing && !isSubmitting;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[200] p-4">
      <div className="bg-neutral-900/90 backdrop-blur-[4px] border border-white/[0.08] rounded-[5px] p-6 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl shadow-black/50">
        {/* Title and close button */}
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 className="text-lg font-semibold text-white">
            {formData.content_type === "photo-only"
              ? "Edit image post"
              : formData.content_type === "url"
              ? "Edit URL post"
              : "Edit file post"}
          </h2>
          <div className="flex items-center gap-3">
            {/* Content Type Tabs */}
            <div className="flex items-center gap-1 p-1 mr-3 rounded-[3px] bg-white/[0.03]">
              {[
                { value: "photo-only", icon: ImageIcon, label: "Photo" },
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
                      }))
                    }
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[2px] text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-white/10 text-white/90 shadow-sm shadow-black/20"
                        : "text-white/40 hover:text-white/60 hover:bg-white/[0.04]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-[2px] bg-white/[0.06] hover:bg-white/12 active:bg-white/15 text-white/50 hover:text-white/90 transition-all duration-150"
            >
              <X className="w-4 h-4" />
              <span className="text-sm">Close</span>
            </button>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto pr-2">
          <form
            id="edit-post-form"
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Post title input */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-4 py-2.5 rounded-[3px] bg-white/5 border border-white/10 text-white/90 placeholder-white/30 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-colors duration-150 focus:ring-1 focus:ring-white/10"
                placeholder="Enter post title"
              />
            </div>

            {/* Upload Section */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Upload
              </label>
              <div className="flex items-center gap-4">
                {/* Thumbnail Preview */}
                {hasNewPendingFile ? (
                  // New file selected - show blur preview or checkmark
                  <div className="w-16 h-16 rounded-[1px] overflow-hidden border-2 border-emerald-500/40 relative flex-shrink-0">
                    {hasBlurPreview ? (
                      <img
                        src={formData.blurDataURL}
                        alt="New Thumbnail Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      // HEIC file - no blur yet, show checkmark
                      <div className="w-full h-full bg-emerald-500/20 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2.5}
                          stroke="currentColor"
                          className="w-6 h-6 text-emerald-400"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m4.5 12.75 6 6 9-13.5"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                ) : hasExistingThumbnail ? (
                  // Existing thumbnail from server
                  <div className="w-16 h-16 rounded-[1px] overflow-hidden border-2 border-emerald-500/40 flex-shrink-0">
                    <ImageWithLoader
                      src={formData.thumbnail}
                      alt="Thumbnail Preview"
                      className="w-full h-full object-cover"
                      sizes="64px"
                      priority={true}
                    />
                  </div>
                ) : (
                  // No thumbnail
                  <div className="w-16 h-16 rounded-[3px] bg-white/[0.03] border border-dashed border-white/15 flex items-center justify-center flex-shrink-0">
                    {isProcessing ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-white/20" />
                    )}
                  </div>
                )}

                {/* Button Group Wrapper */}
                <div className="flex-1 relative">
                  <div className="flex gap-1 sm:gap-2 items-center">
                    {/* Select Image Button */}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailSelect}
                        className="hidden"
                        id="edit-thumbnail-upload"
                        disabled={isProcessing}
                      />
                      <label
                        htmlFor="edit-thumbnail-upload"
                        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-[2px] bg-white/[0.06] border border-white/10 text-sm text-white/60 cursor-pointer hover:bg-white/10 hover:text-white/80 hover:border-white/15 active:bg-white/15 transition-all duration-150 ${
                          isProcessing ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <Upload className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">
                          {isProcessing
                            ? "Processing..."
                            : hasNewPendingFile || hasExistingThumbnail
                            ? "Change Image"
                            : "Select Image"}
                        </span>
                      </label>
                    </div>

                    {/* File Upload Button - only shown for file mode */}
                    {formData.content_type === "file" && (
                      <div className="flex-1">
                        <input
                          type="file"
                          onChange={handleContentFileSelect}
                          className="hidden"
                          id="edit-content-file-upload"
                        />
                        <label
                          htmlFor="edit-content-file-upload"
                          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[2px] bg-white/[0.06] border border-white/10 text-sm text-white/60 cursor-pointer hover:bg-white/10 hover:text-white/80 hover:border-white/15 active:bg-white/15 transition-all duration-150"
                        >
                          <File className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">
                            {formData.contentFile || formData.contentFileName
                              ? "Change File"
                              : "Select File"}
                          </span>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Filenames: Absolutely positioned so they don't push the buttons up */}
                  {(formData.fileName || (formData.content_type === "file" && formData.contentFileName)) && (
                    <div className="absolute top-full left-0 right-0 mt-1 flex justify-between text-xs">
                      <span
                        className="text-white/40 truncate max-w-[50%] ml-1"
                        title={formData.fileName}
                      >
                        {formData.fileName}
                      </span>
                      {formData.content_type === "file" && formData.contentFileName && (
                        <span
                          className="text-emerald-400/70 truncate max-w-[50%] text-right mr-1"
                          title={formData.contentFileName}
                        >
                          {formData.contentFileName}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* URL Input - shown beneath upload when URL mode is selected */}
              {formData.content_type === "url" && (
                <div className="mt-4">
                  <input
                    type="url"
                    value={formData.originalContentType === "url" ? formData.content : (formData.urlInput || "")}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        // If original was URL, update content directly; otherwise use urlInput
                        ...(prev.originalContentType === "url"
                          ? { content: e.target.value }
                          : { urlInput: e.target.value, content: e.target.value }),
                      }))
                    }
                    className="w-full px-4 py-2.5 rounded-[3px] bg-white/5 border border-white/10 text-white/90 placeholder-white/30 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-colors duration-150 focus:ring-1 focus:ring-white/10"
                    placeholder="https://example.com"
                  />
                </div>
              )}
            </div>

            {/* Order Index */}
            <div className="flex justify-end">
              {/* Order Index - Right side */}
              <div className="w-32">
                <label className="block text-sm text-end font-medium text-white/60 mt-[10px] mb-[7px]">
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
                  className="w-full px-4 py-2.5 rounded-[3px] bg-white/5 border border-white/10 text-white/90 placeholder-white/30 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-colors duration-150 focus:ring-1 focus:ring-white/10"
                />
              </div>
            </div>

            {/* Description input with RichTextEditor */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Description
              </label>
              <RichTextEditor
                value={formData.description}
                onChange={(content) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: content,
                  }))
                }
                placeholder="Enter post description..."
                variant="dark"
                minHeight="80px"
              />
            </div>
          </form>
        </div>

        {/* Cancel and submit buttons */}
        <div className="flex gap-3 pt-4 mt-auto flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-[3px] bg-white/[0.04] border border-white/[0.08] text-white/50 font-medium hover:bg-white/[0.08] hover:border-white/15 hover:text-white/70 active:bg-white/12 transition-all duration-150"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-post-form"
            className="flex-1 py-2.5 rounded-[3px] bg-neutral-100/90 text-neutral-900 font-semibold hover:bg-neutral-100 active:bg-neutral-100/80 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-neutral-100/90 transition-all duration-100 shadow-lg shadow-white/10"
            disabled={!canSubmit}
          >
            {isSubmitting ? "Updating..." : "Update Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
