// app/[usernameTag]/[pageSlug]/page.js

import {
  getUserByUsername,
  getPageBySlug,
  getPostsForPage,
  fetchUserPage,
  fetchDashboardPreviews, // Ensure this returns { blurDataURL, thumbnail }
  getDashboardCount, // Ensure this returns an integer
} from "@/lib/data";
import PageViewClient from "@/components/page/PageViewClient";

// ----------------------------------------------------------------
// CONFIGURATION
// Toggle this to TRUE to fetch the first 20 blurry previews for the Back button
// Toggle this to FALSE to show blank cards for the Back button
// ----------------------------------------------------------------
const LOAD_DASH_PREVIEWS = true;

// Helper for Firestore Timestamp
const convertTimestamp = (data) => {
  if (data && typeof data.toDate === "function") {
    return data.toDate().toISOString();
  }
  return data;
};

export default async function Page({ params }) {
  const resolvedParams = await params;
  const { usernameTag, pageSlug } = resolvedParams;

  let profileUser = null;
  let pageData = null;
  let initialPosts = [];
  let initialInfoTexts = [];

  // New State Variables
  let dashboardPreviews = [];
  let totalDashboardCount = 0;

  let error = null;

  try {
    // 1. Fetch user
    profileUser = await getUserByUsername(usernameTag);

    if (!profileUser) {
      return (
        <div className="p-16 text-center text-xl text-neumorphic">
          User <b>{usernameTag}</b> not found.
        </div>
      );
    }

    // 2. Fetch page metadata
    pageData = await getPageBySlug(profileUser.uid, pageSlug);

    if (!pageData) {
      return (
        <div className="p-16 text-center text-xl text-neumorphic">
          Page <b>/{pageSlug}</b> not found.
        </div>
      );
    }

    // Convert timestamps
    if (pageData.updatedAt) {
      pageData.updatedAt = convertTimestamp(pageData.updatedAt);
    }

    // 3. Parallel Fetch
    // We always get the total count. We conditionally get the previews.
    const [posts, infoTexts, totalCount] = await Promise.all([
      getPostsForPage(pageData.id),
      fetchUserPage(pageData.id),
      getDashboardCount(profileUser.uid),
    ]);

    totalDashboardCount = totalCount;

    // 4. Conditional Data Fetch (No padding needed)
    if (LOAD_DASH_PREVIEWS && totalCount > 0) {
      dashboardPreviews = await fetchDashboardPreviews(profileUser.uid);
    }

    initialPosts = posts.map((post) => {
      if (post.createdAt) {
        post.createdAt = convertTimestamp(post.createdAt);
      }
      return post;
    });

    initialInfoTexts = infoTexts;
  } catch (err) {
    console.error("SERVER FETCH FAILED:", err);
    error = "Unable to connect to server. Please try again shortly.";
  }

  // If database fetch crashed — show fallback UI
  if (error) {
    return (
      <div className="p-16 text-center text-xl text-neumorphic">⚠️ {error}</div>
    );
  }

  // Pass separate props for Data and Metadata
  return (
    <PageViewClient
      profileUser={profileUser}
      initialPage={pageData}
      initialPosts={initialPosts}
      initialInfoTexts={initialInfoTexts}
      dashboardPreviews={dashboardPreviews} // Array of objects (max 20)
      totalDashboardCount={totalDashboardCount} // Integer (Total count)
      params={resolvedParams}
    />
  );
}
