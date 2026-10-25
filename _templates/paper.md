---
layout: paper
title: TITLE
subtitle: # optional second line under the title
venue: VENUE YEAR
permalink: /papers/SLUG/
img: assets/img/papers/SLUG/card.png # card image on the projects page
importance: 1
category: work
description: One sentence for link previews.
# Images are paths relative to assets/img/, e.g. papers/SLUG/figure.svg

authors: # `me: true` sets the name in bold; affil indexes into `affiliations`
  - { name: Mahdi Kallel, url: /, me: true, affil: [1] }
affiliations:
  - University of Würzburg

links: # icon: any Font Awesome / Academicons class
  - { label: Paper, icon: ai ai-arxiv, url: https://arxiv.org/abs/XXXX.XXXXX }
  - { label: Code, icon: fa-brands fa-github, url: https://github.com/kallel-mahdi/REPO }

hook: The central idea in one plain sentence.

tldr: >-
  Two or three sentences. Markdown and $math$ work; <mark>highlight</mark> the key phrase.

method: # optional step-through explanation
  title: How it works
  steps:
    - title: Step title
      text: One or two sentences.
      eq: \max_\theta J(\theta) # optional display equation (LaTeX, no $$)
      image: papers/SLUG/step1.svg # optional
      caption: # optional

questions: # optional numbered question cards; each opens to figures + findings
  title: Questions
  items:
    - title: A question a reader would ask?
      thumb: papers/SLUG/thumb.svg # optional card image
      figures:
        - { src: papers/SLUG/fig.svg, caption: What the figure shows. }
        # add `wide: true` to span the full panel width
      findings:
        - A short finding, grounded in the paper.

remarks: # optional closing bullets
  items:
    - One takeaway.
    - One limitation.

bibtex: |
  @article{key,
    title = {TITLE},
    author = {Kallel, Mahdi},
    year = {YEAR},
  }
---

<!-- Optional free-form markdown; rendered after the TL;DR. -->
