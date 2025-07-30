"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, ArrowLeft } from "lucide-react";
import { getPageById, getPostsForPage } from "@/lib/data";
import PostCard from "@/components/page/PostCard";
import CreatePostModal from "@/components/page/CreatePostModal";
import EditPostModal from "@/components/page/EditPostModal";

// params.id is passed by Next.js from the URL
export default function PageView({ params }) {
  const [page, setPage] = useState(null);
  const [posts, setPosts] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const pageData = await getPageById(params.id);
      setPage(pageData);
      if (pageData) {
        const pagePosts = await getPostsForPage(params.id);
        setPosts(pagePosts);
      }
      setLoading(false);
    };
    if (params.id) {
      loadData();
    }
  }, [params.id]);

  // Mock Handlers
  const handleCreatePost = (postData) => {
    const newPost = {
      id: `post-${Date.now()}`,
      page_id: params.id,
      created_date: new Date(),
      ...postData,
    };
    setPosts((prev) => [...prev, newPost]);
    setShowCreateModal(false);
  };
  const handleEditPost = (postData) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === editingPost.id ? { ...p, ...postData } : p))
    );
    setEditingPost(null);
  };
  const handleDeletePost = (postId) => {
    if (confirm("Are you sure?")) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!page) return <div className="p-6 text-center">Page not found.</div>;

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <button className="p-3 rounded-xl btn-neumorphic shadow-neumorphic hover:shadow-neumorphic-soft active:shadow-neumorphic-pressed">
              <ArrowLeft className="w-5 h-5 text-neumorphic-text" />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-neumorphic">{page.title}</h1>
            <p className="text-neumorphic mt-1">{page.description}</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl btn-neumorphic shadow-neumorphic text-neumorphic-text font-medium hover:shadow-neumorphic-soft active:shadow-neumorphic-pressed"
          >
            <Plus className="w-5 h-5" />
            New Post
          </button>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-neumorphic">
              No posts yet.
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onEdit={() => setEditingPost(post)}
                onDelete={() => handleDeletePost(post.id)}
              />
            ))}
          </div>
        )}

        <CreatePostModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePost}
        />
        <EditPostModal
          isOpen={!!editingPost}
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSubmit={handleEditPost}
        />
      </div>
    </div>
  );
}
