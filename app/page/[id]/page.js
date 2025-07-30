// "use client";

// import React, { useState, useEffect } from "react";
// import Link from "next/link";
// import { Plus, ArrowLeft } from "lucide-react";
// import { getPageById, getPostsForPage } from "@/lib/data";
// import PostCard from "@/components/page/PostCard";
// import CreatePostModal from "@/components/page/CreatePostModal";
// import EditPostModal from "@/components/page/EditPostModal";

// // params.id is passed by Next.js from the URL
// export default function PageView({ params }) {
//   const [page, setPage] = useState(null);
//   const [posts, setPosts] = useState([]);
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [editingPost, setEditingPost] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadData = async () => {
//       setLoading(true);
//       const pageData = await getPageById(params.id);
//       setPage(pageData);
//       if (pageData) {
//         const pagePosts = await getPostsForPage(params.id);
//         setPosts(pagePosts);
//       }
//       setLoading(false);
//     };
//     if (params.id) {
//       loadData();
//     }
//   }, [params.id]);

//   // Mock Handlers
//   const handleCreatePost = (postData) => {
//     const newPost = {
//       id: `post-${Date.now()}`,
//       page_id: params.id,
//       created_date: new Date(),
//       ...postData,
//     };
//     setPosts((prev) => [...prev, newPost]);
//     setShowCreateModal(false);
//   };
//   const handleEditPost = (postData) => {
//     setPosts((prev) =>
//       prev.map((p) => (p.id === editingPost.id ? { ...p, ...postData } : p))
//     );
//     setEditingPost(null);
//   };
//   const handleDeletePost = (postId) => {
//     if (confirm("Are you sure?")) {
//       setPosts((prev) => prev.filter((p) => p.id !== postId));
//     }
//   };

//   if (loading) return <div className="p-6 text-center">Loading...</div>;
//   if (!page) return <div className="p-6 text-center">Page not found.</div>;

//   return (
//     <div className="p-6">
//       <div className="max-w-7xl mx-auto">
//         <div className="flex items-center gap-4 mb-6">
//           <Link href="/">
//             <button className="p-3 rounded-xl btn-neumorphic shadow-neumorphic hover:shadow-neumorphic-soft active:shadow-neumorphic-pressed">
//               <ArrowLeft className="w-5 h-5 text-neumorphic-text" />
//             </button>
//           </Link>
//           <div className="flex-1">
//             <h1 className="text-3xl font-bold text-neumorphic">{page.title}</h1>
//             <p className="text-neumorphic mt-1">{page.description}</p>
//           </div>
//           <button
//             onClick={() => setShowCreateModal(true)}
//             className="flex items-center gap-2 px-6 py-3 rounded-xl btn-neumorphic shadow-neumorphic text-neumorphic-text font-medium hover:shadow-neumorphic-soft active:shadow-neumorphic-pressed"
//           >
//             <Plus className="w-5 h-5" />
//             New Post
//           </button>
//         </div>

//         {posts.length === 0 ? (
//           <div className="text-center py-16">
//             <h3 className="text-xl font-semibold text-neumorphic">
//               No posts yet.
//             </h3>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//             {posts.map((post) => (
//               <PostCard
//                 key={post.id}
//                 post={post}
//                 onEdit={() => setEditingPost(post)}
//                 onDelete={() => handleDeletePost(post.id)}
//               />
//             ))}
//           </div>
//         )}

//         <CreatePostModal
//           isOpen={showCreateModal}
//           onClose={() => setShowCreateModal(false)}
//           onSubmit={handleCreatePost}
//         />
//         <EditPostModal
//           isOpen={!!editingPost}
//           post={editingPost}
//           onClose={() => setEditingPost(null)}
//           onSubmit={handleEditPost}
//         />
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Plus, ArrowLeft } from "lucide-react";
import {
  getPageById,
  getPostsForPage,
  createPost,
  updatePost,
  deletePost,
} from "@/lib/data";

import AuthWrapper from "@/components/AuthWrapper";
import PostCard from "@/components/page/PostCard";
import CreatePostModal from "@/components/page/CreatePostModal";
import EditPostModal from "@/components/page/EditPostModal";

function PageViewContent({ params }) {
  const { user } = useAuth();
  const [page, setPage] = useState(null);
  const [posts, setPosts] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [loading, setLoading] = useState(true);

  // Use useCallback to memoize the data fetching function
  const refreshData = useCallback(async () => {
    if (!params.id) return;
    setLoading(true);
    try {
      const pageData = await getPageById(params.id);
      setPage(pageData);
      if (pageData) {
        const pagePosts = await getPostsForPage(params.id);
        setPosts(pagePosts);
      }
    } catch (error) {
      console.error("Failed to load page data:", error);
      setPage(null); // Reset on error
    }
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleCreatePost = async (postData) => {
    try {
      const maxOrder =
        posts.length > 0
          ? Math.max(...posts.map((p) => p.order_index || 0))
          : 0;
      await createPost({
        ...postData,
        page_id: params.id,
        order_index: maxOrder + 1,
      });
      setShowCreateModal(false);
      await refreshData(); // Refresh list from Firestore
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post.");
    }
  };

  const handleEditPost = async (postData) => {
    if (!editingPost) return;
    try {
      // Pass the full `posts` array as the third argument
      await updatePost(editingPost.id, postData, posts);
      setEditingPost(null);
      await refreshData();
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Failed to update post.");
    }
  };

  const handleDeletePost = async (postId) => {
    if (
      confirm(
        "Are you sure you want to delete this post? This cannot be undone."
      )
    ) {
      try {
        await deletePost(postId);
        await refreshData(); // Refresh list from Firestore
      } catch (error) {
        console.error("Error deleting post:", error);
        alert("Failed to delete post.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-neumorphic-bg shadow-neumorphic-inset animate-pulse"></div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="text-center p-16">
        <h2 className="text-2xl font-bold text-neumorphic mb-4">
          Page Not Found
        </h2>
        <p className="text-neumorphic-text mb-6">
          This page may have been deleted or the link is incorrect.
        </p>
        <Link
          href="/"
          className="px-6 py-3 rounded-xl btn-neumorphic shadow-neumorphic text-neumorphic-text font-medium hover:shadow-neumorphic-soft active:shadow-neumorphic-pressed"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Security check: Make sure the fetched page belongs to the current user.
  if (page.userId !== user.uid) {
    return (
      <div className="text-center p-16">
        <h2 className="text-2xl font-bold text-neumorphic">Access Denied</h2>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
          <Link href="/">
            <button className="p-3 w-full md:w-auto rounded-xl btn-neumorphic shadow-neumorphic hover:shadow-neumorphic-soft active:shadow-neumorphic-pressed">
              <ArrowLeft className="w-5 h-5 text-neumorphic-text mx-auto md:mx-0" />
            </button>
          </Link>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-neumorphic">{page.title}</h1>
            {page.description && (
              <p className="text-neumorphic-text mt-1">{page.description}</p>
            )}
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 rounded-xl btn-neumorphic shadow-neumorphic text-neumorphic-text font-medium hover:shadow-neumorphic-soft active:shadow-neumorphic-pressed"
          >
            <Plus className="w-5 h-5" />
            New Post
          </button>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-neumorphic-bg shadow-neumorphic-inset flex items-center justify-center">
              <Plus className="w-12 h-12 text-neumorphic-text" />
            </div>
            <h3 className="text-xl font-semibold text-neumorphic mb-2">
              This page is empty
            </h3>
            <p className="text-neumorphic-text mb-6">
              Create your first post to get started.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 rounded-xl btn-neumorphic shadow-neumorphic text-neumorphic-text font-medium hover:shadow-neumorphic-soft active:shadow-neumorphic-pressed"
            >
              Create First Post
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

// The final default export wraps the page content with the authentication guard.
export default function PageView({ params }) {
  return (
    <AuthWrapper>
      <PageViewContent params={params} />
    </AuthWrapper>
  );
}
