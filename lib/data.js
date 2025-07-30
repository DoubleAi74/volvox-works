// This file mocks a database connection.
// In the final version, these functions will interact with Firestore.

const MOCK_PAGES = [
  {
    id: "page-1",
    title: "My First Page",
    description: "This is a collection of interesting links and notes.",
    thumbnail:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400",
    created_date: new Date("2023-10-26T10:00:00Z"),
    order_index: 1,
  },
  {
    id: "page-2",
    title: "Project Ideas",
    description: "A space for brainstorming new projects and features.",
    thumbnail: null,
    created_date: new Date("2023-10-25T11:00:00Z"),
    order_index: 2,
  },
];

const MOCK_POSTS = [
  {
    id: "post-1",
    page_id: "page-1",
    title: "Interesting Article on React",
    description: "A deep dive into the latest server components feature.",
    thumbnail:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400",
    content_type: "url",
    content:
      "https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023",
    created_date: new Date("2023-10-26T12:05:00Z"),
    order_index: 1,
  },
  {
    id: "post-2",
    page_id: "page-1",
    title: "My Notes on Neumorphism",
    description: "Key takeaways on how to implement this design style.",
    thumbnail: null,
    content_type: "text",
    content:
      "<h1>Neumorphism Design</h1><p>The key is using soft shadows from both sides. One light, one dark. Use a monochromatic color scheme.</p><p><strong>Key CSS properties:</strong> <code>box-shadow</code>, <code>background-color</code>.</p>",
    created_date: new Date("2023-10-26T14:20:00Z"),
    order_index: 2,
  },
  {
    id: "post-3",
    page_id: "page-2",
    title: "Initial Brainstorm",
    description: "Just getting some ideas down.",
    thumbnail: null,
    content_type: "text",
    content:
      "<h2>Project Ideas</h2><ul><li>A personal dashboard (this project!)</li><li>A recipe sharing app</li><li>A workout tracker</li></ul>",
    created_date: new Date("2023-10-25T15:00:00Z"),
    order_index: 1,
  },
];

// --- Mock API Functions ---

export const getPages = async () => {
  console.log("Fetching all pages...");
  return MOCK_PAGES.sort((a, b) => a.order_index - b.order_index);
};

export const getPageById = async (id) => {
  console.log(`Fetching page with id: ${id}`);
  return MOCK_PAGES.find((p) => p.id === id);
};

export const getPostsForPage = async (pageId) => {
  console.log(`Fetching posts for page id: ${pageId}`);
  return MOCK_POSTS.filter((p) => p.page_id === pageId).sort(
    (a, b) => a.order_index - b.order_index
  );
};

export const getPostById = async (id) => {
  console.log(`Fetching post with id: ${id}`);
  return MOCK_POSTS.find((p) => p.id === id);
};

export const getMockUser = () => ({
  full_name: "Demo User",
  email: "demo@example.com",
});
