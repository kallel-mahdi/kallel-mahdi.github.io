---
layout: page
title: series
permalink: /series/
description: Multi-part posts that build one topic from the ground up.
nav: true
nav_order: 4
---

## Reinforcement Learning by Doing

The classical ideas of reinforcement learning, rebuilt one question at a time. Each part starts from the problem
its authors faced, then asks you to derive the key step yourself, with a hint and an answer one click away.
{% if site.categories['rl-by-doing'] %}Published parts are listed in the [series category]({{ '/blog/category/rl-by-doing/' | relative_url }}).{% endif %}

<!-- PROPOSED outline, following the course sheets; to be approved and edited. -->

1. **Policy iteration.** Evaluate a policy exactly, improve it greedily, and see why the loop terminates.
2. **The policy gradient theorem.** Differentiate expected return without differentiating the environment.
3. **Temporal-difference learning.** Evaluate a policy from samples by bootstrapping on your own estimates.
4. **Why TD converges.** Stochastic approximation, the ODE method, and a Lyapunov argument for tabular TD.
5. **TD with linear function approximation.** Where the tabular argument breaks, and the positive-definiteness that rescues it on-policy.
6. **Actor-critic.** Replace returns with a learned critic and track what that costs.
7. **Trust regions, TRPO and PPO.** Bound how far one update can move the policy, then make it cheap.
8. **Natural policy gradient.** Measure step size in policy space rather than parameter space.
