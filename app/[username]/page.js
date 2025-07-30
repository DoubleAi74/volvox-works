"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Plus } from "lucide-react";
import PageCard from "@/components/dashboard/PageCard";
import CreatePageModal from "@/components/dashboard/CreatePageModal";
import EditPageModal from "@/components/dashboard/EditPageModal";
import {
  createPage,
  deletePage,
  getPages,
  updatePage,
  getUserByUsername,
} from "@/lib/data";

// This is now the only component in the file. No more wrappers needed.
export default function UserDashboard({ params }) {
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [pages, setPages] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [loading, setLoading] = useState(true); // 1. Start with loading as true

  const isOwner =
    currentUser && profileUser && currentUser.uid === profileUser.uid;

  const refreshPages = useCallback(async () => {
    if (profileUser) {
      // Pass the `isOwner` flag to the getPages function
      const userPages = await getPages(profileUser.uid, isOwner);
      setPages(userPages);
    }
  }, [profileUser, isOwner]); // Add isOwner to the dependency array

  useEffect(() => {
    const fetchProfileUser = async () => {
      setLoading(true);
      const user = await getUserByUsername(params.username);
      setProfileUser(user);
    };
    fetchProfileUser();
  }, [params.username]);

  useEffect(() => {
    if (profileUser) {
      refreshPages().then(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [profileUser, refreshPages]);

  const handleCreatePage = async (pageData) => {
    if (!isOwner) return;
    try {
      const maxOrder =
        pages.length > 0
          ? Math.max(...pages.map((p) => p.order_index || 0))
          : 0;
      await createPage(
        { ...pageData, order_index: maxOrder + 1 },
        profileUser.uid
      );
      setShowCreateModal(false);
      await refreshPages();
    } catch (error) {
      console.error("Failed to create page:", error);
      alert("Failed to create page.");
    }
  };

  const handleEditPage = async (pageData) => {
    if (!isOwner || !editingPage) return;
    try {
      await updatePage(editingPage.id, pageData, pages);
      setEditingPage(null);
      await refreshPages();
    } catch (error) {
      console.error("Failed to update page:", error);
      alert("Failed to update page.");
    }
  };

  const handleDeletePage = async (pageId) => {
    if (!isOwner) return;
    if (
      confirm(
        "Are you sure you want to delete this page? This cannot be undone."
      )
    ) {
      try {
        await deletePage(pageId);
        await refreshPages();
      } catch (error) {
        console.error("Failed to delete page:", error);
        alert("Failed to delete page.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-neumorphic-bg shadow-neumorphic-inset animate-pulse"></div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="p-16 text-center text-xl text-neumorphic">
        User '{params.username}' not found.
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neumorphic mb-2">
              {params.username}'s Pages
            </h1>
            {isOwner && (
              <p className="text-neumorphic">
                This is your public dashboard. Welcome!
              </p>
            )}
          </div>
          {isOwner && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl btn-neumorphic shadow-neumorphic text-neumorphic-text font-medium hover:shadow-neumorphic-soft active:shadow-neumorphic-pressed"
            >
              <Plus className="w-5 h-5" />
              New Page
            </button>
          )}
        </div>

        {pages.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-neumorphic">
              This user has no public pages yet.
            </h3>
            {isOwner && (
              <p className="text-neumorphic-text mt-2">
                Create your first one to get started!
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pages.map((page) => (
              <PageCard
                key={page.id}
                page={page}
                isOwner={isOwner}
                username={params.username}
                onDelete={() => handleDeletePage(page.id)}
                onEdit={() => setEditingPage(page)}
              />
            ))}
          </div>
        )}

        {isOwner && (
          <>
            <CreatePageModal
              isOpen={showCreateModal}
              onClose={() => setShowCreateModal(false)}
              onSubmit={handleCreatePage}
            />
            <EditPageModal
              isOpen={!!editingPage}
              page={editingPage}
              onClose={() => setEditingPage(null)}
              onSubmit={handleEditPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
