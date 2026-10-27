---
layout: paper
title: "Augmented Bayesian Policy Search"
venue: ICLR 2024
permalink: /papers/abs/
img: assets/img/papers/abs/card.png # card image on the projects page
importance: 2
category: work
description: >-
  Bayesian policy search usually treats the return of a policy as a black box. Augmented Bayesian Search (ABS)
  gives it a prior built from a learned critic, and outperforms earlier Bayesian optimization methods as policies grow.

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
    The paper's acquisition sequence on Pendulum, whose policy has two parameters. The map shows how informative a
    rollout at each point would be about the ascent direction at the policy θ (star). ABS runs the most informative
    rollout, and with each observed return the posterior mean of the gradient (purple) moves away from the critic's
    policy gradient (violet).

tldr: >-
  Deterministic policies are often preferred on physical systems, yet exploration in reinforcement learning is
  largely performed by stochastic policies. First-order Bayesian optimization explores with deterministic policies
  through a probabilistic model of the return and its gradient, but treats policy search as a black box. Augmented
  Bayesian Search (ABS) uses the performance difference lemma to give that model a mean function built from the
  action-value function. The posterior gradient then **augments Bayesian optimization with the deterministic policy
  gradient**, and ABS outperforms earlier Bayesian optimization methods, with the widest margin on
  high-dimensional policies.

method:
  title: How it works
  steps:
    - title: The derivative of a GP is a GP
      text: >-
        Model the policy return as a Gaussian process over the policy parameters. Given a central point $\theta$ and
        the returns $Y$ observed at points $X$, the gradient at $\theta$ has a Gaussian posterior
        $\mathcal{N}(\mu_\theta, \Sigma_\theta)$.
      eq: >-
        \begin{aligned}
        \mu_\theta &= \nabla_\theta m(\theta) + \nabla_\theta K(\theta, X)\,K(X, X)^{-1}\big(Y - m(X)\big), \\
        \Sigma_\theta &= \nabla_\theta K(\theta, \theta) - \nabla_\theta K(\theta, X)\,K(X, X)^{-1}\,\nabla_\theta K(X, \theta)
        \end{aligned}
    - title: Compare any policy to the current one
      text: >-
        The return of any policy $\pi_x$ can be written relative to the current policy $\pi_\theta$, through the
        advantage of $\pi_\theta$ under the states that $\pi_x$ visits.
      eq: >-
        J(\pi_x) = J(\pi_\theta) + \mathbb{E}_{s \sim d^{\pi_x}}\big[A^{\pi_\theta}(s, \pi_x(s))\big]
    - title: The critic becomes the prior
      text: >-
        Roll out the central point $\theta$, collect $\widehat{J}(\pi_\theta)$ and $\widehat{d}^{\pi_\theta}$, and
        train a critic $\widehat{Q}^{\pi_\theta}$. Evaluating the lemma on the states of $\pi_\theta$ gives a good
        prior for the return of any point $x$.
      eq: >-
        \widehat{m}_\phi(x) = \widehat{J}(\pi_\theta) + \mathbb{E}_{s \sim \widehat{d}^{\pi_\theta}}\big[\widehat{A}^{\pi_\theta}_\phi(s, \pi_x(s))\big]
    - title: A policy gradient corrected by the data
      text: >-
        With this mean function, the mean of the gradient posterior is the deterministic policy gradient, corrected
        by a term proportional to how badly the mean function fits the observed returns.
      eq: >-
        \begin{aligned}
        \mu_\theta = {} & \mathbb{E}_{s \sim \widehat{d}^{\pi_\theta}}\big[\nabla_a \widehat{Q}^{\pi_\theta}_\phi(s, a)\,\nabla_\theta \pi_\theta(s)\big] \\
        & + \nabla_\theta K(\theta, X)\,K(X, X)^{-1}\big(\widehat{J}(X) - \widehat{m}_\phi(X)\big)
        \end{aligned}

questions:
  title: Results
  items:
    - title: Queries follow the gradient posterior
      thumb: papers/abs/acquisition.png
      figures:
        - src: papers/abs/acquisition.png
          wide: true
          caption: >-
            Acquisition function of MPD augmented with the advantage mean function, at $t = 0, 1, 2$: first only the
            central point $\theta$ (star) is observed, then the acquisition points $z$ (white).
      findings:
        - "**The next query lies in the direction of the gradient posterior.**"
        - >-
          The maximum of the acquisition function follows the posterior mean $\mu_\theta$ (violet), which corrects
          the mean-function gradient $\nabla_\theta \widehat{m}_\phi$ (pink) when the mean function does not fit the
          observations.
        - >-
          Acquisitions stay in the immediate vicinity of $\theta$, which keeps $\Vert z - \theta \Vert$ small and with it
          the residual term of the decomposition behind the mean function.

    - title: Outperforms Bayesian optimization, most in high dimensions
      thumb: papers/abs/performance_highdim.png
      figures:
        - src: papers/abs/performance.png
          wide: true
          caption: >-
            Maximum discounted return on the MuJoCo-v4 tasks, 5 seeds per algorithm; #n_dims is the number of
            policy parameters.
      findings:
        - "**ABS outperforms MPD, and pulls ahead of ARS on Walker2d and Ant.**"
        - >-
          On low-dimensional tasks ABS is competitive with MPD, the state of the art in local Bayesian optimization,
          and with Augmented Random Search (ARS).
        - >-
          In high dimensions, ARS and MPD struggle to find good ascent directions, while the advantage mean function focuses the search on promising regions of the parameter
          space.

    - title: An imperfect critic is enough
      thumb: papers/abs/r2_hist.png
      figures:
        - src: papers/abs/r2.png
          wide: true
          caption: >-
            Validation and test scores of the critics during one run on HalfCheetah, Walker2d and Ant.
        - src: papers/abs/r2_hist.png
          wide: true
          caption: >-
            Histograms and correlation of the same scores; dashed lines mark the medians, and scores are clipped to
            $[-1, 1]$.
      findings:
        - "**The best critic explains about half of the variance of the observed returns.**"
        - >-
          The validation score stays positive. The test score on new acquisition points is often positive and
          sometimes negative, which is enough: the mean function only has to identify one good ascent direction at
          a time.
        - >-
          The two scores are positively correlated, and validation acts as an upper bound on test, as in supervised
          learning.

    - title: Weighting and resetting critics works best
      thumb: papers/abs/ablation.png
      figures:
        - src: papers/abs/ablation.png
          wide: true
          caption: >-
            Ablation of the critic ensemble: a single critic, average or softmax weighting by validation score, each
            with or without resetting the worst critic (+ R).
      findings:
        - "**Softmax weighting with resets beats every other ensemble.**"
        - >-
          An ensemble outperforms a single critic, and weighting critics by their validation score outperforms
          plain averaging, especially early on, when transition data is scarce.
        - >-
          Resetting the worst critic helps most together with adaptive weighting, since the validation score
          detects a freshly reset critic and ignores its predictions.

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
