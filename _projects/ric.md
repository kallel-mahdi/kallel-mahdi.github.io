---
layout: paper
title: "Do Not Imitate, Reinforce"
subtitle: Iterative Classification via Belief Refinement
venue: TMLR 2026
permalink: /papers/ric/
img: assets/img/papers/ric/ric-card.png # card image on the projects page
importance: 1
category: work
description: >-
  Reinforced Iterative Classification (RIC) trains a classifier with reinforcement learning instead of
  cross-entropy. It refines its prediction step by step and achieves a better balance of accuracy and
  calibration than supervised training.

authors:
  - { name: Mahdi Kallel, url: /, me: true, affil: [1] }
  - { name: Johannes Tölle, affil: [2] }
  - { name: Ahmed Hendawy, affil: [3] }
  - { name: Carlo D'Eramo, affil: [1] }
affiliations:
  - Center for Artificial Intelligence and Data Science, University of Würzburg
  - Automation and Robotics Research Group, SnT, University of Luxembourg
  - Department of Computer Science, Technical University of Darmstadt

links:
  - { label: Paper, icon: ai ai-arxiv, url: "https://arxiv.org/abs/2604.22110" }
  - { label: OpenReview, icon: fa-solid fa-comments, url: "https://openreview.net/forum?id=7xXijNfm8j" }
  - { label: Code, icon: fa-brands fa-github, url: "https://github.com/kallel-mahdi/ric" }

hook: >-
  A classifier rewarded for improving its prediction, not for copying the label.

hero:
  src: papers/ric/ric-refinement.gif
  caption: >-
    An actor refines its prediction; a critic decides when
    to stop (green: continue, red: stop and return the current belief).

tldr: >-
  Reinforced Iterative Classification (RIC) casts classification as a Markov decision process in which
  a recurrent actor iteratively refines a predictive distribution and is rewarded for the increase in log
  probability assigned to the label; a critic estimates the value of continued refinement and supplies a
  stopping rule at inference. In the deterministic limit RIC targets the same prediction as cross-entropy,
  but it reaches that target along a different path: **accuracy rises ahead of confidence**.
  Across ten image classification benchmarks, including medical images, RIC-SPO (RIC trained with Simple
  Policy Optimization) achieves a better balance between accuracy and calibration than single-pass and
  adaptive supervised baselines.

method:
  title: How it works
  steps:
    - title: Start from a uniform belief
      text: >-
        Each labeled example is its own small episode. The state holds the input, the current prediction,
        and a latent state, and the prediction starts from the uniform prior over the $K$ classes.
      eq: s_0 = (x, a_0, \tau_0), \qquad a_0 = [1/K, \dots, 1/K], \qquad \tau_0 = \mathbf{0}
    - title: Refine the class distribution
      text: >-
        A recurrent backbone updates the latent state from the input and the previous prediction. A
        Dirichlet policy head then samples the next class distribution on the simplex, and a value head
        predicts how much refinement remains useful.
      eq: \tau_{t+1} = f_\theta(x, \tau_t, a_t), \qquad a_{t+1} \sim \mathrm{Dir}(c\mu)
    - title: Discounting trains every refinement depth
      text: >-
        Reward the gain in label log-probability. The rewards telescope, so the discounted return scores the
        prediction at a random, geometrically distributed depth $N$: every step has to be a good answer,
        which makes RIC an anytime classifier.
      eq: >-
        r_t = \log a_{t,y} - \log a_{t-1,y}, \qquad
        \mathbb{E}\Big[\textstyle\sum_{t\ge1}\gamma^{t-1} r_t\Big] = \mathbb{E}_{N\sim\mathrm{Geom}(1-\gamma)}\big[\log a_{N,y}\big] + \log K
    - title: The critic measures the improvement left
      text: >-
        Measure the error $L_t = \mathrm{KL}(q\,\Vert\,a_t)$ to the true conditional $q$. Label ambiguity
        cancels, so the value tracks only reducible error: refinement continues while $V(s_t) > 0$ and stops
        once $V(s_t) \le 0$.
      eq: >-
        V^\pi(s_t) = L_t - \mathbb{E}_{N\sim\mathrm{Geom}(1-\gamma),\,\pi}\!\left[L_{t+N} \mid s_t\right]

questions:
  title: Results
  items:
    - title: Different generalization dynamics
      thumb: papers/ric/dynamics.png
      figures:
        - src: papers/ric/dynamics.png
          wide: true
          caption: >-
            CIFAR-10 training dynamics over 1000 epochs, five seeds: (a) normalized return, (b) train and
            validation accuracy, (c) validation accuracy against training accuracy.
        - src: papers/ric/generalization.png
          wide: true
          caption: >-
            Validation accuracy against training accuracy on (a) CIFAR-10, (b) Galaxy10, and (c) ImageWoof.
      findings:
        - "**SL's validation return declines while RIC's holds.**"
        - >-
          Policy-gradient updates are noisier, so RIC-SPO fits the training set more gradually, yet at matched
          training accuracy it generalizes better on CIFAR-10, Galaxy10 and ImageWoof.

    - title: More robust to label noise
      thumb: papers/ric/noise.svg
      figures:
        - src: papers/ric/noise.svg
          wide: true
          caption: >-
            Validation ECE and confidence over training (deterministic evaluation) on (a) CIFAR-10,
            (b) CIFAR-10N with aggregated human labels (9.03% noise), and (c) CIFAR-10N with worst-case
            labels (40.21% noise).
      findings:
        - "**At every noise level, RIC ends training with lower ECE than SL.**"
        - >-
          Cross-entropy ties confidence to fitting, so SL is near certain within tens of epochs. In RIC,
          **accuracy rises ahead of confidence**, and calibration emerges
          as confidence catches up.
        - >-
          With noisy labels the target itself is less certain, so RIC's confidence settles lower and
          mislabeled examples keep moderate probabilities.

    - title: Calibrated at test time
      thumb: papers/ric/ece_woof.svg
      figures:
        - src: papers/ric/ece_woof.svg
          wide: true
          caption: >-
            Confidence distributions and reliability diagrams on ImageWoof (test), aggregated over five
            models selected by validation loss. RIC-SPO is evaluated deterministically.
        - src: papers/ric/rank_pareto_tradeoff.svg
          caption: >-
            Mean accuracy and ECE ranks across ten datasets with validation-loss checkpoint selection.
            Lower is better.
      findings:
        - "**SL is overconfident in every bin. RIC is mildly underconfident in most.**"
        - >-
          On ImageWoof, RIC-SPO raises accuracy from 82.1% to 85.3% and more than halves ECE, from 0.085 to 0.038.
        - >-
          Across ten datasets, the deterministic and stochastic readouts form the Pareto front. On medical
          imaging, stochastic RIC is best or tied on ECE for 5 of 5 MedMNIST subsets, deterministic RIC on
          accuracy for 4 of 5.
        - >-
          ACT and PonderNet refine recurrently too, yet their calibration tracks SL's.

    - title: Compute goes where it still pays
      thumb: papers/ric/adaptive_compute.svg
      figures:
        - src: papers/ric/adaptive_compute.svg
          wide: true
          caption: >-
            Adaptive computation on ImageWoof (test): (a) discounted return by difficulty, with halting steps
            marked; (b) confidence and ECE across inference steps; (c) stopping steps for correctly and
            incorrectly classified inputs.
      findings:
        - "**Easy images saturate fast. Hard ones stop before reward turns negative.**"
        - >-
          Inputs that end up correctly classified receive more refinement steps than those that end up wrong.
        - >-
          Against vine estimates of the true future return, the critic makes the right stop-or-continue call
          on 69 to 87% of states, erring toward stopping early.

remarks:
  items:
    - >-
      RIC-SPO exposes an accuracy-calibration trade-off at deployment: deterministic mean-policy rollouts are
      generally more accurate, while stochastic rollouts are generally better calibrated and may lose accuracy.
    - >-
      Relative to supervised learning, RIC-SPO requires an order of magnitude more training epochs, roughly
      ten times slower training. Better reinforcement learning algorithms could improve both efficiency and
      final performance while preserving the training dynamics observed here.
    - >-
      The Dirichlet distribution becomes unstable near the simplex boundary as the number of classes grows,
      which limits the current validation to relatively small label spaces. Temperature scaling and label
      smoothing are orthogonal to RIC; combining them with it is left to future work.

bibtex: |
  @article{kallel2026ric,
    author        = {Mahdi Kallel and Johannes T{\"o}lle and Ahmed Hendawy and Carlo D'Eramo},
    title         = {Do Not Imitate, Reinforce: Iterative Classification via Belief Refinement},
    journal       = {Transactions on Machine Learning Research},
    year          = {2026},
    url           = {https://openreview.net/forum?id=7xXijNfm8j},
    eprint        = {2604.22110},
    archivePrefix = {arXiv},
  }
---
