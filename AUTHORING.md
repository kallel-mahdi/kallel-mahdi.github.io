# Authoring guide

How this site is organized and how to add content. The site is a customized
[al-folio](https://github.com/alshedivat/al-folio) (Jekyll).

## Preview locally

```bash
docker compose up        # http://localhost:8080, rebuilds on save
```

Changes to `_config.yml`, `_plugins/` or `_data/` need a restart (`docker compose restart`).
Drafts in `_drafts/` are shown locally only, never deployed.

## Where things live

| What | Where |
| --- | --- |
| Colors (light and dark), fonts, radii, widths | `_sass/_themes.scss` (CSS variables; use only these in styles) |
| Site-wide typography, navbar, footer | `_sass/_site.scss` |
| Home, featured cards, series, exercise/hint/answer/history | `_sass/_components.scss` |
| Paper page styles | `_sass/_paper.scss` |
| Name, description, fonts URL | `_config.yml` |
| Social links | `_data/socials.yml` |
| Home page text and sections | `_pages/about.md` |
| Featured papers on the home page | `_data/featured.yml` |
| Blog series and their outlines | `_data/series.yml` |
| Publications list | `_bibliography/papers.bib` |
| News | `_news/YYYY-MM-DD-slug.md` |
| CV page | `_data/cv.yml` |
| Templates for new content | `_templates/post.md`, `_templates/paper.md` |

## A new blog post

```bash
bin/new post "Policy iteration"     # creates _drafts/policy-iteration.md
```

Write it, preview it, then publish by moving it to `_posts/YYYY-MM-DD-policy-iteration.md`.

**Series.** Add `series: rl-by-doing` and `part: 1` to the front matter. The post gets a series
banner at the top and previous/next links at the bottom, and replaces the "soon" entry for that part
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
Highlight a key phrase with `<mark>...</mark>`.

## A new paper page

```bash
bin/new paper ppoplus     # creates _papers/ppoplus.md and assets/img/papers/ppoplus/
```

Everything on the page comes from the front matter; `_templates/paper.md` documents each field.
Sections appear only when their key is present: header and links, hook, TL;DR, method stepper,
question cards (each opens to figures and findings), final remarks, BibTeX.

The page is served at `/papers/<slug>/`. To link it:

- from the publications list: `website = {/papers/<slug>/}` in `papers.bib`;
- from the home page: set `url: /papers/<slug>/` in `_data/featured.yml`.

**Figures.** Convert PDF figures to SVG (or PNG for heavy plots):

```bash
pdftocairo -svg figure.pdf assets/img/papers/<slug>/figure.svg
pdftocairo -png -singlefile -scale-to-x 1600 -scale-to-y -1 figure.pdf assets/img/papers/<slug>/figure
```

## Deploy

Pushing to `main` builds the site with GitHub Actions and publishes it to the `gh-pages` branch.
