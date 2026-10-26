---
layout: post
title: Component test (draft, not published)
date: 2026-10-25
description: Visual check of the template's blocks used by the series. Drafts are only built locally.
categories: rl-by-doing
toc:
  sidebar: left
related_posts: false
published: false # local component check only; hidden even with --drafts
---

This draft exists to check the blocks the series uses; it is never deployed. Inline math $$V^{\pi}(s)$$.

## A history note

> ##### Bellman, 1957
>
> Placeholder text for a historical aside. It can hold **markdown**, links, and math such as $$\gamma \in [0, 1)$$.

## An exercise

> ##### Exercise 1 · Fixed points
>
> Show that the Bellman operator is a contraction:
> $$\| T^{\pi} V - T^{\pi} W \|_\infty \le \gamma \| V - W \|_\infty .$$
{: .block-tip }

{% details Hint %}
Write $$T^{\pi}V - T^{\pi}W$$ explicitly; the rewards cancel.
{% enddetails %}

{% details Answer %}
The rewards cancel, leaving $$\gamma P^{\pi}(V - W)$$, and each row of $$P^{\pi}$$ is a probability vector, so
$$\| \gamma P^{\pi}(V - W) \|_\infty \le \gamma \| V - W \|_\infty .$$

```python
def bellman(V, P, r, gamma):
    return r + gamma * P @ V
```
{% enddetails %}
