"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Plus } from "lucide-react";
import PageCard from "@/components/dashboard/PageCard";
import CreatePageModal from "@/components/dashboard/CreatePageModal";
import EditPageModal from "@/components/dashboard/EditPageModal"; // 1. Import the new modal
import { createPage, deletePage, getPages, updatePage } from "@/lib/data"; // 2. Import updatePage
import AuthWrapper from "@/components/AuthWrapper";

function DashboardContent() {
  const { user } = useAuth();
  const [pages, setPages] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPage, setEditingPage] = useState(null); // 3. Add state for the page being edited
  const [loadingPages, setLoadingPages] = useState(true);

  const refreshPages = useCallback(async () => {
    if (user) {
      setLoadingPages(true);
      const userPages = await getPages(user.uid);
      setPages(userPages);
      setLoadingPages(false);
    }
  }, [user]);

  useEffect(() => {
    refreshPages();
  }, [refreshPages]);

  const handleCreatePage = async (pageData) => {
    if (!user) return alert("You must be logged in.");
    try {
      const maxOrder =
        pages.length > 0
          ? Math.max(...pages.map((p) => p.order_index || 0))
          : 0;
      await createPage({ ...pageData, order_index: maxOrder + 1 }, user.uid);
      setShowCreateModal(false);
      await refreshPages();
    } catch (error) {
      console.error("Failed to create page:", error);
      alert("Failed to create page.");
    }
  };

  // 4. Add the handler for editing a page
  const handleEditPage = async (pageData) => {
    if (!editingPage) return;
    try {
      // Pass the full `pages` array as the third argument
      await updatePage(editingPage.id, pageData, pages);
      setEditingPage(null);
      await refreshPages();
    } catch (error) {
      console.error("Failed to update page:", error);
      alert("Failed to update page.");
    }
  };

  const handleDeletePage = async (pageId) => {
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

  if (loadingPages) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-neumorphic-bg shadow-neumorphic-inset animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* ... (Header section of the dashboard is unchanged) ... */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neumorphic mb-2">
              Your Pages
            </h1>
            <p className="text-neumorphic">Welcome, {user.email}</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl btn-neumorphic shadow-neumorphic text-neumorphic-text font-medium hover:shadow-neumorphic-soft active:shadow-neumorphic-pressed"
          >
            <Plus className="w-5 h-5" />
            New Page
          </button>
        </div>

        {pages.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-neumorphic">
              No pages yet. Create one!
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pages.map((page) => (
              <PageCard
                key={page.id}
                page={page}
                onDelete={() => handleDeletePage(page.id)}
                onEdit={() => setEditingPage(page)} // 5. Pass the onEdit handler
              />
            ))}
          </div>
        )}

        <CreatePageModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePage}
        />

        {/* 6. Render the new EditPageModal */}
        <EditPageModal
          isOpen={!!editingPage}
          page={editingPage}
          onClose={() => setEditingPage(null)}
          onSubmit={handleEditPage}
        />
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <AuthWrapper>
      <DashboardContent />
    </AuthWrapper>
  );
}
