"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPostById } from "@/lib/data";

export default function TextPost({ params }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const postData = await getPostById(params.id);
      setPost(postData);
      setLoading(false);
    };
    if (params.id) {
      loadData();
    }
  }, [params.id]);

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!post) return <div className="p-6 text-center">Post not found.</div>;

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/page/${post.page_id}`}>
            <button className="p-3 rounded-xl btn-neumorphic shadow-neumorphic hover:shadow-neumorphic-soft active:shadow-neumorphic-pressed">
              <ArrowLeft className="w-5 h-5 text-neumorphic-text" />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-neumorphic">{post.title}</h1>
            {post.description && (
              <p className="text-neumorphic mt-2">{post.description}</p>
            )}
          </div>
        </div>

        <div className="bg-neumorphic-bg rounded-2xl shadow-neumorphic-inset p-8">
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
            style={{
              color: "#6d6d6d", // A slightly darker shade for readability
              lineHeight: "1.701",
            }}
          />
        </div>
      </div>
    </div>
  );
}
