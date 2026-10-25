---
layout: post
title: Component test (draft, not published)
date: 2026-10-25
description: Visual check of every blog component. Drafts are only built locally.
series: rl-by-doing
part: 1
toc:
  sidebar: left
related_posts: false
---

This draft exists to check the blog components. It is never deployed. Inline math $$V^{\pi}(s)$$ and a highlighted <mark>key phrase</mark>.

## A history note

{% history Bellman, 1957 %}
Placeholder text for a historical aside. It can hold **markdown**, links, and math such as $$\gamma \in [0, 1)$$.
{% endhistory %}

## An exercise

{% exercise Fixed points %}
Show that the Bellman operator is a contraction:

$$
\| T^{\pi} V - T^{\pi} W \|_\infty \le \gamma \| V - W \|_\infty .
$$

{% hint %}
Write $$T^{\pi}V - T^{\pi}W$$ explicitly; the rewards cancel.
{% endhint %}

{% hint A second hint %}
Bound a convex combination by its largest term.
{% endhint %}

{% answer %}
The rewards cancel, leaving $$\gamma P^{\pi}(V - W)$$, and each row of $$P^{\pi}$$ is a probability vector, so

$$
\| \gamma P^{\pi}(V - W) \|_\infty \le \gamma \| V - W \|_\infty .
$$

```python
def bellman(V, P, r, gamma):
    return r + gamma * P @ V
```
{% endanswer %}
{% endexercise %}

## A second exercise without a title

{% exercise %}
Numbering continues automatically.

{% answer %}
It does.
{% endanswer %}
{% endexercise %}
