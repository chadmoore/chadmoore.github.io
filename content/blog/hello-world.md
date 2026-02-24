---
title: Hello World
date: '2026-02-21'
excerpt: Welcome to my blog! This is the first post on my new site.
tags:
  - meta
  - intro
---

## Welcome

This is my first blog post! I built this site with **Next.js**, **React**, and **Tailwind CSS**, and it's hosted on GitHub Pages.

I plan to write about software development, data engineering, and whatever interesting problems I'm working on.

### How This Blog Works

Blog posts are simple Markdown files stored in the `content/blog` directory. To add a new post, I just create a new `.md` file with some frontmatter:

```markdown
---
title: "My Post Title"
date: "2026-02-23"
excerpt: "A short description of the post."
tags: ["tag1", "tag2"]
---

Your content here...
```

The site reads these files at build time and generates static pages for each post. Simple, fast, and easy to maintain.

Using the framework I've built, you can export your LinkedIn profile and extrapolate a configuration file automatically from the data. This will categorize and organize skills and job experience and generate the associated CV page. Depending on available LLM options, the development toolchain can take care of most tasks. Remaining tasks can be handled while interacting with the development server, where blog and category editing is available. It's actually pretty neat. [Check out the repo!](https://github.com/chadmoore/chadmoore.github.io/)

### What's Next

Stay tuned for more posts about the tools and technologies I use day to day. Thanks for visiting!
