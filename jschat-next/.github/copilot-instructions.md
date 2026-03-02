---
name: jsChat-next workspace
description: "Use when working with jsChat-next Next.js project. Enforces: Next.js MCP initialization, TypeScript strictness, Server Components, Radix UI + Tailwind styling, proper error handling, and multi-provider AI integration."
---

# jsChat-next Development Guidelines

## Critical Startup Requirement

**IMPORTANT: Start every Next.js session by calling the init tool.**

Before making any changes to the application:

- Call the `nextjs_index` tool (or `mcp_io_github_ver_init` to initialize context)
- This ensures you have access to Next.js DevTools MCP for diagnostics and runtime information
- Use browser automation to verify pages actually render correctly

## Tech Stack Overview

jsChat-next is a **Next.js AI chat application** built with:

**Core Framework & Routing**

- Next.js with App Router
- TypeScript with strict mode (ES2017 target)
- TailwindCSS + Shadcn for consistent, accessible components
- Custom Glass morphism plugin for modern UI effects

**AI & LLM Integrations**

- OpenAI (primary provider)
- Anthropic Claude
- Google Genai/Gemini
- Groq
- DeepInfra
- Tavily (search grounding)
- Semantic Scholar API

**Authentication & Data**

- NextAuth + MongoDB Adapter
- MongoDB database
- Session management via `session.js`

**Payment & Communication**

- Stripe integration
- Nodemailer for email
- React Email for email templates

**UI Components**

- MUI Material components
- FontAwesome icons
- Radix UI primitives
- Custom TailwindCSS utilities
- Lucide React icons

## Coding Conventions

### 1. Always Initialize Next.js MCP at Session Start ⭐

When you begin working on this project:

1. Run the `nextjs_index` tool to discover running dev servers and available MCP tools
2. Use Next.js MCP tools for:
   - Getting runtime errors and diagnostics
   - Checking compilation status
   - Route discovery
   - Cache management
3. Fallback to browser automation if you need to verify page rendering or client-side behavior

**Why:** Next.js MCP gives direct access to the dev server's internals, catching hydration issues, runtime errors, and type mismatches that you won't see with static analysis alone.

### 2. TypeScript Strict Mode (No 'any' Types)

- All code must compile with `strict: true` enabled
- Avoid `any` types — use specific types or generics
- Define proper interfaces for props, state, and API responses
- Use path aliases (`@/*`) for clean imports
- Example: `import { ChatMessage } from '@/types'` (not relative paths)

**Files to check for TypeScript errors:** Run type checking before committing

```
pnpm tsc --noEmit
```

### 3. Use Server Components by Default

- **Default:** Write components as Server Components (async functions work naturally)
- **Client-side only:** Mark with `'use client'` when you need hooks, event handlers, or browser APIs
- Keep Server Components for data fetching, auth checks, and rendering
- Move interactivity to smaller `'use client'` components at leaf nodes

**Pattern:**

```tsx
// app/chat/page.tsx — Server Component
export default async function ChatPage() {
  const chats = await fetchUserChats();
  return <ChatList chats={chats} />;
}

// components/ChatList.tsx — Client Component
("use client");
export function ChatList({ chats }) {
  const [selected, setSelected] = useState(null);
  // Interactive logic here
}
```

### 4. Consistent Styling: shadcn/ui, Radix UI + TailwindCSS

**Using shadcn/ui Components:**

- shadcn/ui components (wrapper around Radix UI + Tailwind) provide pre-built, accessible components
- Use shadcn tools when adding or managing components:
  - `mcp_shadcn_get_project_registries` — Get available registries
  - `mcp_shadcn_search_items_in_registries` — Find components (e.g., "button", "dialog")
  - `mcp_shadcn_view_items_in_registries` — View component source and structure
  - `mcp_shadcn_get_item_examples_from_registries` — Get usage examples and demos
  - `mcp_shadcn_get_add_command_for_items` — Get the CLI add command
  - `mcp_shadcn_get_audit_checklist` — Verify components are working after setup

**Example shadcn/ui Component Workflow:**

```tsx
// 1. Search for button component
// Use: mcp_shadcn_search_items_in_registries with query "button"

// 2. View examples
// Use: mcp_shadcn_get_item_examples_from_registries with "@shadcn/button-demo"

// 3. Add to project
// Use: mcp_shadcn_get_add_command_for_items with ["@shadcn/button"]
// Run: pnpm shadcn-ui@latest add button

// 4. Import and use
import { Button } from "@/components/ui/button";

export function MyComponent() {
  return <Button variant="default">Click me</Button>;
}
```

**General Styling Guidelines:**

- Use Radix UI primitives or shadcn/ui components for interactive elements
- Style with Tailwind utility classes — avoid inline styles or CSS-in-JS
- Reference the custom Glass morphism plugin (`tailwind-glass-plugin.js`) for glassmorphism effects
- MUI Material components are available but shadcn/ui + Tailwind preferred for new code
- Apply dark mode support via `next-themes`

### 5. Proper Error Handling & Boundaries

- Wrap async operations in try-catch blocks
- Add error boundaries for component trees (especially in chat views)
- Log errors with context (user ID, operation name, timestamp)
- Use loading states (`.../loading.js` files or skeleton components) for data fetching
- See: `components/ThinkingSkeleton.jsx`, `components/SkeletonCard.js` for example loading patterns

**API route error handling:**

```tsx
export async function POST(req) {
  try {
    const data = await req.json();
    // Process request
    return Response.json({ success: true });
  } catch (error) {
    console.error("[chat-error]", error);
    return Response.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}
```

### 6. API Route Structure

- Keep API routes (`app/api/`) lean and focused
- Delegate business logic to `/lib/` utility files (e.g., `lib/chatUtils.js`, `lib/aiRSCUtils.js`)
- Use named exports for reusable server actions
- Validate input early and return 400 for invalid requests
- Return typed JSON responses

**Pattern:**

```tsx
// app/api/chat/route.js — thin wrapper
import { processChat } from "@/lib/chatUtils";

export async function POST(req) {
  const { chatId, message } = await req.json();
  const result = await processChat(chatId, message);
  return Response.json(result);
}
```

### 7. Multi-Provider AI Integration

- **Decision Rule:** Use the most appropriate AI provider for each use case:
  - **OpenAI (default):** Fast responses, balanced quality
  - **Anthropic Claude:** Complex reasoning, long context windows
  - **Google Genai:** Specialized multimodal tasks
  - **Groq:** Ultra-fast inference
  - **DeepInfra:** Cost-effective alternatives
- Implement provider selection in configuration (`envConfig.ts`)
- Do NOT hardcode provider selection — always make it configurable per endpoint
- Use the Vercel `ai` SDK (version 4.1.16) for unified streaming responses

**Example:**

```tsx
import { openai, anthropic, groq } from "@ai-sdk/...";

// Use 'model' parameter to switch providers at request time
const model = getSelectedModel(userId); // Returns 'gpt-4', 'claude-3', 'groq-...', etc.
const response = await generateText({ model });
```

## Development Workflow

### Running the Project

```bash
pnpm dev        # Start Next.js dev server (runs on :3000)
pnpm build      # Production build
pnpm start      # Production server
pnpm lint       # Run ESLint
```

### Database & Auth

- MongoDB connection configured in `lib/db.ts`
- Session handling in `session.js` (NextAuth setup)
- Auth config in `auth.config.ts` and `auth.ts`

### Making Changes

1. **Before any change:** Initialize Next.js MCP
   - Call `nextjs_index` to check for running dev server
   - Monitor for build errors and type issues

2. **For UI changes:** Use shadcn tools and verify visually with browser automation
   - Use `mcp_shadcn_search_items_in_registries` to find available components
   - Use `mcp_shadcn_get_add_command_for_items` to add new components to project
   - Use `mcp_shadcn_get_item_examples_from_registries` to view component patterns
   - Load the page in a real browser using browser automation
   - Check dark mode (next-themes) if applicable
   - Test shadcn/ui and Radix UI interactions work smoothly
   - Run `mcp_shadcn_get_audit_checklist` to verify all components are functional

3. **For API/data changes:**
   - Update types in `types/` folder
   - Test with existing test endpoints (e.g., `/api/hello`, `/api/test`)
   - Validate error handling paths

4. **For AI integrations:**
   - Test streaming responses
   - Validate token limits and model availability
   - Check provider fallback logic

### Project Structure Key Files

| Path                 | Purpose                                           |
| -------------------- | ------------------------------------------------- |
| `app/`               | Next.js App Router pages and API routes           |
| `components/`        | Reusable React components                         |
| `lib/`               | Server-side utilities, database logic, AI helpers |
| `types/`             | TypeScript interface definitions                  |
| `public/`            | Static assets                                     |
| `styles/`            | Global CSS (markdown, animations)                 |
| `hooks/`             | React hooks (custom hooks)                        |
| `envConfig.ts`       | Environment & configuration management            |
| `tailwind.config.js` | TailwindCSS configuration + Glass plugin          |

## Debugging & Testing Approach

**Error Investigation Priority:**

1. Check Next.js MCP diagnostics (compilation errors, runtime issues)
2. Review browser console for client-side errors (use browser automation)
3. Validate TypeScript types (`pnpm tsc --noEmit`)
4. Check database connection and API responses
5. Trace AI provider responses and streaming issues

**Testing Pages:**

- Always use browser automation to verify real rendering
- Check both light and dark modes (next-themes)
- Validate form submissions and error states
- Test AI streaming responses in chat interface

## Performance Considerations

- Lazy load heavy components (markdown viewers, TTS, canvas)
- Use Next.js Image optimization for modal/profile images
- Leverage Server Components for fast data fetching
- Implement pagination for large chat histories or search results
- Monitor AI token usage and implement rate limiting

## Common Gotchas

❌ **Don't:**

- Use `client` components for simple data display (kills SSR benefits)
- Mix Radix UI with MUI in the same component (styling conflicts)
- Hardcode API provider selection (always make it configurable)
- Return untyped JSON from API routes
- Ignore TypeScript strict mode warnings

✅ **Do:**

- Start sessions with `nextjs_index` or `mcp_io_github_ver_init`
- Use shadcn tools when adding/managing shadcn/ui components
- Test with browser automation before committing UI changes
- Keep API routes thin and business logic in `/lib/`
- Use loading states and error boundaries liberally
- Document AI provider selection logic in comments

## Additional Resources

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Radix UI Components](https://www.radix-ui.com/docs/primitives/overview/introduction)
- [TailwindCSS](https://tailwindcss.com/docs)
- [NextAuth Documentation](https://next-auth.js.org/)
- [Vercel ai SDK](https://sdk.vercel.ai/)
- Auth config: `auth.config.ts`, `auth.ts`
- Example API: `app/api/chat/route.js`, `app/api/openai/route.js`
