---
layout: paper
title: "Augmented Bayesian Policy Search"
venue: ICLR 2024
permalink: /papers/abs/
img: assets/img/papers/abs/card.png # card image on the projects page
importance: 2
category: work
description: >-
  ABS builds a better Gaussian process prior for policy search from a learned critic. Observed returns correct the
  critic's policy gradient, allowing Bayesian optimization to scale to high-dimensional control problems while
  keeping exploration deterministic.

authors:
  - { name: Mahdi Kallel, url: /, me: true, affil: [1] }
  - { name: Debabrota Basu, affil: [2] }
  - { name: Riad Akrour, affil: [2] }
  - { name: Carlo D'Eramo, affil: [1, 3, 4] }
affiliations:
  - Center for Artificial Intelligence and Data Science, University of Würzburg
  - Univ. Lille, Inria, CNRS, Centrale Lille, UMR 9189 – CRIStAL
  - Department of Computer Science, TU Darmstadt
  - Hessian Center for Artificial Intelligence (hessian.AI)

links:
  - { label: Paper, icon: ai ai-arxiv, url: "https://arxiv.org/abs/2407.04864" }
  - { label: OpenReview, icon: fa-solid fa-comments, url: "https://openreview.net/forum?id=OvlcyABNQT" }
  - { label: Code, icon: fa-brands fa-github, url: "https://github.com/kallel-mahdi/abs" }

hook: >-
  What if Bayesian policy search knew it was solving an MDP?

hero:
  src: papers/abs/acquisition_paper.gif
  caption: >-
    One ABS iteration on Pendulum with a two-parameter policy. The map shows how
    informative a rollout at each point would be about the ascent direction at the policy θ (star). ABS runs the most
    informative rollout, and with each return the posterior mean of the gradient (dark purple) corrects the critic's
    policy gradient (pink). θ then steps along the most probable ascent direction.

tldr: >-
  ABS builds a better Gaussian process prior for policy search from a learned critic. The prior guides search with
  the deterministic policy gradient, corrected by observed returns. ABS scales Bayesian optimization to
  high-dimensional control problems while keeping exploration deterministic.

method:
  title: How it works
  intro: >-
    Deterministic policies are useful on physical systems because they avoid erratic actions and are easier to
    implement and interpret. Bayesian optimization explores directly over policy parameters, but usually uses only
    the return from each rollout. ABS also uses the trajectory. A learned critic turns this experience into a prior
    over nearby policies, giving the search useful information before it collects more returns.
  steps:
    - title: The gradient of a GP is a GP
      text: >-
        ABS builds on Maximum Probability of Descent (MPD), a local Bayesian optimization method. MPD models the
        policy return as a Gaussian process with prior mean $$m$$ and kernel $$K$$. The
        derivative of a Gaussian process is again a Gaussian process, so after observing returns $$Y$$ at points $$X$$,
        the gradient at $$\theta$$ has a Gaussian posterior $$\mathcal{N}(\mu_\theta, \Sigma_\theta)$$. Its mean starts
        from the gradient of the prior, $$\nabla_\theta m(\theta)$$, and corrects it where the prior misses the
        observations. The usual prior is constant, so that first term vanishes and the data must do all the work. A
        prior that already knows the slope of the return would give a good gradient from few rollouts.
      eq: >-
        \begin{aligned}
        \mu_\theta &= \nabla_\theta m(\theta) + \nabla_\theta K(\theta, X)\,K(X, X)^{-1}\big(Y - m(X)\big), \\
        \Sigma_\theta &= \left.\nabla_\theta\nabla_{\theta'}^\top K(\theta, \theta')\right|_{\theta'=\theta} - \nabla_\theta K(\theta, X)\,K(X, X)^{-1}\,\nabla_\theta K(X, \theta)
        \end{aligned}
    - title: Performance difference lemma
      text: >-
        The performance difference lemma provides such a prior. It writes the return of any policy $$\pi_x$$ as the
        return of the current policy $$\pi_\theta$$ plus the expected discounted sum of its advantages along trajectories
        of $$\pi_x$$. Everything on the right concerns $$\pi_\theta$$, whose trajectories we have, except the
        unnormalized discounted state visitation measure $$d^{\pi_x}$$ of a policy we have not run.
      eq: >-
        J(\pi_x) = J(\pi_\theta) + \mathbb{E}_{s \sim d^{\pi_x}}\big[A^{\pi_\theta}(s, \pi_x(s))\big]
    - title: Advantage mean function
      text: >-
        ABS rolls out the central point $$\theta$$, collects its return $$\widehat{J}(\pi_\theta)$$ and states
        $$\widehat{d}^{\pi_\theta}$$, and trains a critic $$\widehat{Q}^{\pi_\theta}_\phi$$ on its transitions, which
        gives the advantage $$\widehat{A}^{\pi_\theta}_\phi$$. Replacing the unknown $$d^{\pi_x}$$ by
        $$\widehat{d}^{\pi_\theta}$$ leaves a residual, which the paper bounds in Lipschitz MDPs by how far the actions
        of the two policies differ. Near $$\theta$$ the residual is small, so the remaining term is a good prior for the
        return of any point $$x$$. It acts like a first-order expansion of the return around $$\theta$$, and the Gaussian
        process only has to model what it misses.
      eq: >-
        \widehat{m}_\phi(x) = \widehat{J}(\pi_\theta) + \mathbb{E}_{s \sim \widehat{d}^{\pi_\theta}}\big[\widehat{A}^{\pi_\theta}_\phi(s, \pi_x(s))\big]
    - title: Fitness-aware policy gradient
      text: >-
        ABS starts from the critic's deterministic policy gradient and corrects it with observed returns. The same
        estimate combines information from trajectories with the outcomes of policy evaluations.
      eq: >-
        \begin{aligned}
        \mu_\theta = {}& \underbrace{\mathbb{E}_{s \sim \widehat{d}^{\pi_\theta}}\big[\nabla_a \widehat{Q}^{\pi_\theta}_\phi(s, a)\big|_{a=\pi_\theta(s)}\nabla_\theta \pi_\theta(s)\big]}_{\text{deterministic policy gradient}} \\
        &+ \underbrace{\nabla_\theta K(\theta, X)\,K(X, X)^{-1}\big(\widehat{J}(X) - \widehat{m}_\phi(X)\big)}_{\text{correction from the observed returns}}
        \end{aligned}
    - title: A criterion to validate critics
      text: >-
        The same lemma also measures how good a critic is. Rolling out any point $$x$$ gives its return
        $$\widehat{J}(\pi_x)$$ and its own states $$\widehat{d}^{\pi_x}$$. On those states the lemma holds exactly, so a
        good critic should reproduce the observed return, and the prediction error tests the critic on trajectories it
        was not trained on. Every acquisition thus becomes validation data, and ABS uses this score to weight an
        ensemble of critics.
      eq: >-
        \begin{aligned}
        \widetilde{m}_\phi(x) &= \widehat{J}(\pi_\theta) + \mathbb{E}_{s \sim \widehat{d}^{\pi_x}}\big[\widehat{A}^{\pi_\theta}_\phi(s, \pi_x(s))\big], \\
        \text{error}_\phi(x) &= \big(\widetilde{m}_\phi(x) - \widehat{J}(\pi_x)\big)^2
        \end{aligned}

questions:
  title: Results
  intro: >-
    We compare ABS with MPD and with Augmented Random Search (ARS) on MuJoCo locomotion tasks of increasing
    dimension.
  items:
    - title: Where does ABS look next?
      thumb: papers/abs/acquisition.png
      figures:
        - src: papers/abs/acquisition.png
          wide: true
          caption: >-
            Acquisition function around the central point $$\theta$$ (star) over three queries, with acquisitions in
            white.
      findings:
        - >-
          ABS targets rollouts that are most informative about the local ascent direction. Each observed return
          refines the gradient estimate used for the next policy update.

    - title: Is the advantage mean function a good prior?
      thumb: papers/abs/r2_hist.png
      figures:
        - src: papers/abs/r2.png
          wide: true
          caption: >-
            Validation and test scores ($$R^2$$) of the critics during training.
        - src: papers/abs/r2_hist.png
          wide: true
          caption: >-
            Histograms and correlation of the same scores.
      findings:
        - >-
          The learned prior captures useful structure in policy returns. Its predictions guide the local search,
          while validation against observed returns helps ABS choose which critics to trust.

    - title: Does it make Bayesian optimization more efficient?
      thumb: papers/abs/performance_highdim.png
      figures:
        - src: papers/abs/performance.png
          wide: true
          caption: >-
            Maximum return on MuJoCo tasks, where #n_dims is the number of policy parameters.
      findings:
        - >-
          ABS consistently outperforms MPD. Its advantage becomes clearest in high-dimensional policy spaces, where
          the learned prior gives the search a useful direction.

    - title: Does the validation criterion help pick critics?
      thumb: papers/abs/ablation.png
      figures:
        - src: papers/abs/ablation.png
          wide: true
          caption: >-
            Ablation of the critic ensemble with a single critic, an average, or a validation-weighted ensemble, each
            with or without resetting the worst critic (+ R).
      findings:
        - >-
          Validation weighting and critic resets work best together. Poorly performing critics receive less weight
          while they relearn, so resetting them does not overwhelm the ensemble.

remarks:
  items:
    - >-
      The advantage mean function acts like a first-order Taylor expansion of the policy return, bridging Bayesian
      optimization and reinforcement learning.
    - >-
      ABS explores with deterministic policies, learns effectively in an episodic setting, and lets one trade compute
      for learning speed.

bibtex: |
  @inproceedings{kallel2024abs,
    author    = {Mahdi Kallel and Debabrota Basu and Riad Akrour and Carlo D'Eramo},
    title     = {Augmented Bayesian Policy Search},
    booktitle = {International Conference on Learning Representations},
    year      = {2024},
    url       = {https://openreview.net/forum?id=OvlcyABNQT},
  }
---
