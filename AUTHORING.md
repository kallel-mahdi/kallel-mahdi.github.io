# Authoring guide

How this site is organized and how to add content. The site runs on
[al-folio](https://github.com/alshedivat/al-folio) v1.2: the theme's layouts, includes and styles come from
pinned gems (see `Gemfile`), and files in this repo either add to them or override them. Before building
something, check the al-folio docs (`docs/CUSTOMIZE.md` upstream); most needs have a built-in feature.

## Preview locally

```bash
docker compose up        # http://localhost:8080, rebuilds on save; restarts itself when _config.yml changes
```

Changes to `_plugins/` need `docker compose restart`. Drafts in `_drafts/` are shown locally only
(`--drafts` in `bin/entry_point.sh`), never deployed.

## Where things live

| What | Where |
| --- | --- |
| Colors (light and dark), fonts, radii, widths | `_sass/site/_tokens.scss` (CSS variables; use only these in styles) |
| Featured cards, series, exercise/hint/answer/history, paper pages | `_sass/site/_featured.scss`, `_series.scss`, `_teaching.scss`, `_paper.scss` |
| How those styles are loaded | `assets/css/main.scss` (the theme's file plus `@use "site"`) and `_sass/_site.scss` |
| Name, description, fonts URL | `_config.yml` (fonts: `third_party_libraries.google_fonts`) |
| Social links | `_data/socials.yml` |
| Home page text and sections | `_pages/about.md` (featured cards and series outline are included in its body) |
| Featured papers on the home page | `_data/featured.yml` |
| Blog series and their outlines | `_data/series.yml` |
| Publications list | `_bibliography/papers.bib` |
| News | `_news/YYYY-MM-DD-slug.md` |
| CV page and PDF | `_data/cv.yml` (RenderCV format; the `render-cv` workflow builds the PDF) |
| Templates for new content | `_templates/post.md`, `_templates/paper.md` |

## A new blog post

```bash
bin/new post "Policy iteration"     # creates _drafts/policy-iteration.md
```

Write it, preview it, then publish by moving it to `_posts/YYYY-MM-DD-policy-iteration.md`.

**Series.** Use `layout: series-post` and add `series: rl-by-doing` and `part: 1` to the front matter.
The post gets a series banner at the top and previous/next links at the bottom, and replaces the "soon" entry for that part
on the series page and the home page. Edit the outline in `_data/series.yml`.

**Teaching blocks.** Markdown and math work inside all of them.

```liquid
{% history Bellman, 1957 %}
A short historical note.
{% endhistory %}

{% exercise Optional title %}
The question.

{% hint %} A nudge. {% endhint %}
{% hint A second hint %} Another nudge. {% endhint %}
{% answer %} The worked answer. {% endanswer %}
{% endexercise %}
```

Exercises are numbered automatically per post. Math: `$inline$` and `$$display$$`.
Highlight a key phrase with `<mark>...</mark>`. For simple callouts use the theme's built-in blocks
(`> ##### TIP` followed by `{: .block-tip }`, also `block-warning`, `block-danger`); for plain
collapsibles, the built-in `{% details Summary %}...{% enddetails %}`.

## A new paper page

```bash
bin/new paper ppoplus     # creates _papers/ppoplus.md and assets/img/papers/ppoplus/
```

Everything on the page comes from the front matter; `_templates/paper.md` documents each field.
Sections appear only when their key is present: header and links, hook, TL;DR, method stepper,
question cards (each opens to figures and findings), final remarks, BibTeX (a code block, so the
theme's copy button applies). Other built-ins work in the page body too: `images.compare`/`slider`,
`chart.*`, `tabs`, `marimo` (see the al-folio docs).

The page is served at `/papers/<slug>/`. To link it:

- from the publications list: `website = {/papers/<slug>/}` in `papers.bib` (not `html`, which the theme
  prefixes with `/assets/html/`);
- from the home page: set `url: /papers/<slug>/` in `_data/featured.yml`.

**Figures.** Convert PDF figures to SVG (or PNG for heavy plots):

```bash
pdftocairo -svg figure.pdf assets/img/papers/<slug>/figure.svg
pdftocairo -png -singlefile -scale-to-x 1600 -scale-to-y -1 figure.pdf assets/img/papers/<slug>/figure
```

## Deploy

Pushing to `main` builds the site with GitHub Actions and publishes it to the `gh-pages` branch.
Classes that only JavaScript adds must appear literally in a `.js` file (PurgeCSS runs on deploy).

## Upgrading al-folio

Bump the gem pins in `Gemfile` as the release notes say, then run `bin/al-folio upgrade audit`.
Local overrides of theme files are tracked in `.al-folio-overrides.yml`; review them with
`bin/al-folio upgrade overrides audit` after each upgrade.
