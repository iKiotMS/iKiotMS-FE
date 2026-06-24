<!-- BEGIN:nextjs-agent-rules -->

Before performing any task:

1. Read this AGENTS.md completely.
2. Check available skills in .agent/skills.
3. Determine whether one or more skills are applicable.
   Skills location: D:\FPT\2026.SU8\WDP301\skills

# Frontend Agent Guidelines

- At very first, check the components folder, prioritize use components from this folder.
- If not found, use shadcn/ui components, as they are the base of the components folder. check https://ui.shadcn.com/docs/components, if it is available and suitable, must use it.
- Do not add a new UI library without approval.
- Prefer Tailwind class utilities and existing design tokens; avoid inline styles unless required.
- Ensure responsive layouts, accessible labels, and sensible keyboard navigation.
- Ensure consistency in color, styling, and theme.
- Avoid create huge file of code, try to seperate it into each section components
- Use App Router conventions and keep server components as the default.
- Add `use client` only when client-side hooks or browser APIs are required.
- Avoid direct use of `window`/`document` in server components.
- Always write modular, reusable, and maintainable code.
- Strictly follow the DRY (Don't Repeat Yourself) principle.
- Before generating a large block of code or a full page, independently identify UI elements or logic that can be extracted into reusable components (e.g., Cards, Buttons, Inputs, Layout wrappers). If it is already exist, use it or add variance if necessary
- Extract these components into separate functions or files automatically.
- Keep components small and focused on a single responsibility.
- When create new components or pages, default langauge is Vietnamese
- Follow the existing file and naming conventions in the frontend codebase.
- Keep components small and focused; prefer composition over large monolith components.
- Functions in code file for must be written in hooks folder inside the its father folder.
- Do not introduce new dependencies without approval.
- Keep lint clean and match existing formatting rules.
- Use react-hook-form and Zod
<!-- END:nextjs-agent-rules -->
