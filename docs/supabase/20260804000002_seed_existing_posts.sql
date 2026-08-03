-- One-time data migration: moves the posts currently living as .md files in
-- src/lib/posts/ into public.posts, so the homepage can switch from reading
-- files at build time to reading this table at request time. Safe to re-run
-- (skips slugs that already exist); not a schema change, so it isn't part of
-- the numbered migrations above in spirit, only in naming.
--
-- Run this AFTER 20260804000000 and 20260804000001. Then confirm the posts
-- show up on the homepage before deleting src/lib/posts.ts and
-- src/lib/posts/*.md from the repo.

insert into public.posts (slug, title, body_md, status, author_id, published_at)
select v.slug, v.title, v.body_md, 'published', u.id, v.published_at
from (
  values
    (
      'whos-it',
      'Who''s it?',
      $md$Okay... I created this only because I needed to choose who starts first, and **Chwazi** isn't available on iPhone.

It took me *15 minutes* to build and ship this — both code and deploy — so have mercy 😵

> No design system. No tests. Just vibes and a coin flip.

→ [Choose who starts first](https://whosit.valentinomettifogo.com)$md$,
      '2026-07-28T00:00:00Z'::timestamptz
    ),
    (
      'aurora',
      'Aurora''s here!',
      $md$# 🌸 Welcome to the world, little one! 🌸

Today is a day we will never, ever forget. With hearts overflowing with love and joy, we are thrilled to announce that our baby daughter **Aurora Linh Lam** was born today! 💕

Both mom and baby are doing wonderfully, and we are officially over the moon (and fully prepared to learn the true meaning of sleep deprivation!).

![A warm welcome](https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=1000&auto=format&fit=crop)

A huge thank you to everyone who supported us with kind words, advice, and love throughout these months.

Now, we're taking a little time to soak in every single second of this amazing new adventure together. 👶✨

*Here’s to our new chapter!* ❤️$md$,
      '2026-07-31T00:00:00Z'::timestamptz
    ),
    (
      'budget-tracker',
      'My Costs Tracker is finally online!',
      $md$I wanted a simple way to see what I was spending — and *where* it was actually going — so I built one.

![Costs Tracker logo](https://raw.githubusercontent.com/valentinomettifogo/costs-tracker-v2/main/static/images/logo-navbar.png)

Nothing fancy: **Svelte 5** on the frontend, **Supabase** on the backend, mostly as an excuse to learn both by doing.

<u>Give it a try</u> and let me know what you think.

→ [How much do you spend?](https://budget.valentinomettifogo.com)$md$,
      '2026-03-02T00:00:00Z'::timestamptz
    ),
    (
      'blackjack',
      'Luca''2 Blackjack',
      $md$Today is my best man's birthday, so I decided to make him go a little crazy with a simple game.

It's **Blackjack** — but with a couple of extra cards *(my friends' faces, to be exact)*.

Win 5 matches in a row and you get rewarded. 🃏

→ [Let's play a game](https://buoncompleannoluca.vercel.app)$md$,
      '2025-09-24T00:00:00Z'::timestamptz
    ),
    (
      'linkedin',
      'Hey! I update my LinkedIn',
      $md$I'm officially a **Team Leader** now!

Feel free to add me — I don't have many connections yet, but *I'm working on it*.

→ [Check my profile](https://www.linkedin.com/in/valentino-mettifogo)$md$,
      '2025-09-06T00:00:00Z'::timestamptz
    ),
    (
      'github',
      'Here''s my GitHub',
      $md$Okay, I'm not *really* a coder — but I like it.

Mostly **Go**: more skeletons than finished projects. <u>Minimalist development</u>, one piece at a time.

→ [Open profile](https://github.com/valentinomettifogo)$md$,
      '2025-01-23T00:00:00Z'::timestamptz
    )
) as v(slug, title, body_md, published_at)
cross join (
  select id from auth.users where email = 'valentino.mettifogo@gmail.com'
) as u
where not exists (select 1 from public.posts p where p.slug = v.slug);
