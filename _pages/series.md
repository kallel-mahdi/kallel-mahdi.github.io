---
layout: page
title: series
permalink: /series/
description: Multi-part posts that build one topic from the ground up.
nav: true
nav_order: 3
---

{% for entry in site.data.series %}
  {% assign key = entry[0] %}
  {% assign series = entry[1] %}
  <section class="series-section" id="{{ key }}">
    <h2 class="series-page-title">{{ series.title }}</h2>
    <p>{{ series.blurb }}</p>
    {% include series_outline.liquid key=key goals=true %}
  </section>
{% endfor %}
