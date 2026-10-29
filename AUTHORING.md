# Authoring guide

How this site works and how to add content. It runs on [al-folio](https://github.com/alshedivat/al-folio) v1.2:
layouts, includes, styles and plugins come from gems pinned in `Gemfile`, and this repo holds content, config, and a
small amount of custom code (listed below). Before building something, check the al-folio docs
(`docs/CUSTOMIZE.md` upstream); most needs have a built-in feature.

## Preview locally

```bash
docker compose up        # http://localhost:8080; rebuilds on save, restarts itself when _config.yml changes
```

Posts in `_drafts/` are built locally only (`--drafts` in `bin/entry_point.sh`) and never deployed.
`_drafts/component-test.md` shows the blocks used by the series.

`docker-compose.override.yml` is git-ignored and local to this machine: it mounts the main repository's `.git` so
the container works from a git worktree.

## Where content lives

| What | Where |
| --- | --- |
| Name, description, site options | `_config.yml` |
| Home page text and sections | `_pages/about.md` (front matter turns selected papers, socials, news, latest posts on or off) |
| Publications | `_bibliography/papers.bib` |
| News | `_news/YYYY-MM-DD-slug.md` (`inline: true` for a one-line item) |
| Social links | `_data/socials.yml` |
| CV | `_data/cv.yml`, RenderCV format; `_pages/cv.md` has `cv_format: rendercv` |
| Blog posts | `_posts/YYYY-MM-DD-slug.md` (drafts in `_drafts/`) |
| Paper pages | `_projects/<slug>.md`, figures in `assets/img/papers/<slug>/` |
| Templates for new content | `_templates/post.md`, `_templates/paper.md` |

**Bibliography fields.** `preview = {file.png}` shows a thumbnail from `assets/img/publication_preview/`;
`selected = {true}` lists the paper on the home page. Link a paper page with `website = {/papers/<slug>/}`, not
`html` (the theme prefixes relative `html` values with `/assets/html/`). Other supported fields (`pdf`, `code`,
`arxiv`, `bibtex_show`, ...) are listed in the upstream docs.

**CV PDF.** Pushing a change to `_data/cv.yml` or `assets/rendercv/*.yaml` runs the `render-cv` workflow, which
renders the PDF into `assets/rendercv/rendercv_output/` and commits it. To show a download button on the CV page, set
`cv_pdf: /assets/rendercv/rendercv_output/<file>.pdf` in `_pages/cv.md`.

## Writing a post

```bash
bin/new post "Policy iteration"     # creates _drafts/policy-iteration.md from _templates/post.md
```

Write and preview it, then publish by moving it to `_posts/YYYY-MM-DD-policy-iteration.md`. Posts use the theme's
`post` layout and its native blocks:

- **Callouts** (exercises, historical notes): a blockquote whose first line is a `#####` heading, followed by a
  class line. `block-tip`, `block-warning` and `block-danger` are colored; without a class it is a plain quote.

  ```markdown
  > ##### Exercise 1 · Fixed points
  >
  > State the target.
  {: .block-tip }
  ```

- **Hints and answers**: `{% details Hint %} ... {% enddetails %}` gives a collapsible block. Markdown, math and
  code work inside. With `layout: exercises` (the post template's default; it is the theme's post layout plus
  `assets/js/hints.js`), a Hint placed right after an exercise callout becomes a "?" button in the callout's
  corner: hover previews it, a click pins it. Answers stay ordinary collapsible blocks.
- **Math**: MathJax. `$$...$$` inside a paragraph is inline, on its own paragraph it is display;
  `\begin{equation}` numbers equations and `\eqref` refers to them. Prefer `$$` over single `$` in posts, since
  kramdown leaves `$$` content untouched.
- **Table of contents**: `toc: { sidebar: left }` in the front matter (already in the template).
- **Tabs**: set `tabs: true` in the front matter, then `{% tabs name %}{% tab name label %}...{% endtab %}{% endtabs %}`.
- Put a key phrase in **bold**; the theme has no separate highlight style.

**Series.** A part of *Reinforcement Learning by Doing* is a normal post with `categories: rl-by-doing`; the theme
lists the parts at `/blog/category/rl-by-doing/`. The category link on `/blog/` appears once the first part is
published (`_pages/blog.md` hides categories with no posts). `featured: true` pins a post on the blog page.

## A paper page

```bash
bin/new paper ppoplus     # creates _projects/ppoplus.md and assets/img/papers/ppoplus/
```

Paper pages are entries of the theme's `projects` collection with `layout: paper` and
`permalink: /papers/<slug>/`. They appear as cards on `/projects/` (`img`, `importance`, `category: work`); make every card image 16:10 (e.g. 1200x750), since the theme shows it uncropped. Link
the page from the publications list with `website = {/papers/<slug>/}` in `papers.bib`.

Everything on the page comes from front matter; `_templates/paper.md` documents each field and
`_projects/ric.md` is a full example. Sections render only when their key is present, in this order:

| Key | Section |
| --- | --- |
| `venue`, `title`, `subtitle`, `authors` (`me: true` bolds a name, `affil` indexes `affiliations`), `links` | Header |
| `hook` | One-line question under the header |
| `hero` | `{ src, caption, width }`: the signature figure or GIF, shown large under the hook; `width` caps a portrait image |
| `tldr` | TL;DR paragraph |
| page body | Free markdown after the TL;DR; built-ins such as `tabs` or `images.compare` work here |
| `method.steps[]` (`title`, `text`, `eq`, `image`, `caption`) | Step-through explanation |
| `questions.items[]` (`title`, `thumb`, `figures[]` with `src`, `caption`, `wide`; `findings[]`) | Numbered cards that open to figures and findings |
| `remarks.items[]` | Closing bullets (title defaults to "Final remarks") |
| `bibtex` | Citation block with the theme's copy button |

Image paths in front matter are relative to `assets/img/`, e.g. `papers/<slug>/figure.svg`.

**Math in front matter.** Text fields are run through markdown. Use `$$...$$` for inline math so kramdown preserves
LaTeX commands and subscripts. Display equations in `eq` are LaTeX without `$$`.

**Figures.** Convert PDF figures to SVG, or to PNG for heavy plots:

```bash
pdftocairo -svg figure.pdf assets/img/papers/<slug>/figure.svg
pdftocairo -png -singlefile -scale-to-x 1600 -scale-to-y -1 figure.pdf assets/img/papers/<slug>/figure
```

The build generates resized copies of PNG and JPEG images (`imagemagick` in `_config.yml`); GIFs are served as they
are, so keep them small.

## Custom code

Everything else comes from the gems. The custom pieces are:

- the paper layout: `_layouts/paper.liquid`, `_includes/paper/stepper.liquid`, `_includes/paper/question_cards.liquid`,
  `assets/js/paper.js`;
- the hint button for exercise posts: `_layouts/exercises.liquid`, `assets/js/hints.js`, `_sass/site/_exercises.scss`;
- their styles in `_sass/site/` (`_tokens.scss`, `_mixins.scss`, `_paper.scss`, `_exercises.scss`, `_cv.scss`, `_publications.scss` for larger publication thumbnails), loaded through `_sass/_site.scss` by
  one `@use "site"` line at the end of `assets/css/main.scss` (an override of the theme's file);
- `_includes/cv/render.liquid`, an override of the CV gem's template that renders sections in `cv.yml` order,
  shows RenderCV's `headline` and `location`, and renders any section whose title contains "Experience" (e.g.
  "Research Experience", "Industry Experience") as experience entries;
- `_includes/cv/experience.liquid` and `_includes/cv/education.liquid`, overrides of the gem's entry templates that
  widen the date column and add an organization logo above the date: `_data/cv_logos.yml` maps the exact `company` / `institution` name in `cv.yml` to a file
  in `assets/img/cv-logos/` (styles in `_sass/site/_cv.scss`). Entries without a mapping show no logo.

Rules: prefer a built-in feature over new code; prefer a new file over overriding a theme file. When an override is
unavoidable, record it with `bin/al-folio upgrade overrides accept <path>`, which writes its checksums to
`.al-folio-overrides.yml`.

## Upgrading al-folio

Bump the gem pins in `Gemfile` as the release notes say, then run:

```bash
bin/al-folio upgrade audit             # config and API contract checks
bin/al-folio upgrade overrides audit   # flags overrides whose upstream file changed
bin/al-folio upgrade overrides diff <path>
```

Reconcile any stale override, then accept it again. Upgrade and override audits also run in CI.

## Deploy

Pushing to `main` builds the site with GitHub Actions and publishes it to the `gh-pages` branch. PurgeCSS runs on
deploy and keeps only classes it finds in the built HTML and JS, so a class that only JavaScript adds must appear
literally in a `.js` file (as `is-active` and `is-open` do in `assets/js/paper.js`) or be listed in the safelist in
`purgecss.config.js`.
