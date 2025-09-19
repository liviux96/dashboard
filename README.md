# Dashboard

This project is a Next.js dashboard that now authenticates users against Supabase. The demo username/password flow has been removed in favour of real Supabase email/password authentication.

## Configuration

1. Copy `.env.example` to `.env.local` in the project root:

   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and fill in your Supabase project credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

   These values correspond to the `Project URL` and the `anon` public API key from the Supabase dashboard.

3. Ensure the Supabase user you created has a `display_name` (or `full_name`) set in their profile metadata. The automation in this repository cannot update Supabase user profiles directly, so this step must be completed manually within the Supabase dashboard.

## Running locally

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Then visit [http://localhost:3000](http://localhost:3000) and log in using any email/password combination that exists in your Supabase project's Authentication users list.
