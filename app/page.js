"use client";

import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import PageCard from "@/components/dashboard/PageCard";
import CreatePageModal from "@/components/dashboard/CreatePageModal";
import { getPages } from "@/lib/data"; // Using mock data function

export default function Dashboard() {
  const [pages, setPages] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const userPages = await getPages();
      setPages(userPages);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleCreatePage = (pageData) => {
    // This is a mock implementation. It adds to the local state.
    const newPage = {
      id: `page-${Date.now()}`,
      created_date: new Date(),
      ...pageData,
    };
    setPages((prev) => [...prev, newPage]);
    setShowCreateModal(false);
    alert("Mock page created! Data will not persist on refresh.");
  };

  const handleDeletePage = (pageId) => {
    if (confirm("Are you sure you want to delete this page? (Mock deletion)")) {
      setPages((prev) => prev.filter((p) => p.id !== pageId));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-neumorphic-bg shadow-neumorphic-inset animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neumorphic mb-2">
              Your Pages
            </h1>
            <p className="text-neumorphic">
              Create and organize your content pages
            </p>
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
              />
            ))}
          </div>
        )}

        <CreatePageModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePage}
        />
      </div>
    </div>
  );
}
