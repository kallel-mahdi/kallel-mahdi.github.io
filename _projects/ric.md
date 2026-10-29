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
  Today classifiers imitate their labels in a single pass and learn to be certain. What if classifiers learned by
  trial and error instead?

hero:
  src: papers/ric/ric-refinement.gif
  caption: >-
    An actor refines its prediction step by step, and each step earns the gain in log probability of the label, shown
    as the green slice of the gauge. A critic estimates the improvement still left: green continues, red stops and
    returns the current prediction.

tldr: >-
  Reinforced Iterative Classification (RIC) rewards a classifier for improving its prediction instead of training it
  to imitate its labels. A recurrent actor refines its prediction step by step and earns a reward for each
  improvement. A critic decides when to stop. Learning from returns gives **fundamentally different learning
  and generalization dynamics** from supervised training, and a better balance of accuracy and calibration across ten
  image benchmarks.

method:
  title: How it works
  intro: >-
    As Andrew Barto put it at RLC 2024, *"in the beginning, machine learning was reinforcement learning."* RIC brings
    this view back to classification by turning each labeled example into a short episode. The prediction starts
    uniform over the $$K$$ classes. At every step a recurrent network reads the input and the current prediction, a
    policy head proposes the next one, and a value head judges whether refining further is worth it.
  steps:
    - title: Reward every improvement
      text: >-
        Cross-entropy asks the model to imitate the label. RIC instead rewards it for improving its prediction: the
        reward is the change in log probability of the true label $$y$$, positive for a step toward $$y$$ and negative
        for a step away. Since the actor samples its predictions, it has to discover by itself which refinements pay
        off.
      eq: r_t = \log a_{t,y} - \log a_{t-1,y}
    - title: Discounting trains every depth
      text: >-
        Over an episode the rewards telescope, leaving only the first and the current prediction. With a discount
        $$\gamma$$, the expected return becomes the log probability of the label at a random depth $$N$$ drawn from a
        geometric distribution. Every depth carries weight, so every intermediate prediction is trained to be a good
        answer and RIC can stop at any step.
      eq: >-
        \mathbb{E}\Big[\textstyle\sum_{t\ge1}\gamma^{t-1} r_t\Big] = \mathbb{E}_{N\sim\mathrm{Geom}(1-\gamma)}\big[\log a_{N,y}\big] + \log K
    - title: Same target, different learning
      text: >-
        For labels drawn from $$q(\cdot \mid x)$$, the expected loss splits into label ambiguity, the error of the
        mean prediction, and the cost of random actions. Maximizing the return removes the last two, so a
        deterministic RIC policy predicts $$q(\cdot \mid x)$$, as cross-entropy does. What differs is the path:
        cross-entropy pushes toward the label while any gap remains, whereas the policy gradient moves a prediction
        only while sampled refinements earn distinguishable returns.
      eq: >-
        \begin{gathered}
        \mathbb{E}_{y\sim q,\,a\sim\pi}\big[-\log a_y\big] = \underbrace{H(q)}_{\text{label ambiguity}} + \underbrace{\mathrm{KL}(q\,\Vert\,\mu)}_{\text{mean prediction error}} + \underbrace{\mathbb{E}\big[D_F(a_y \,\Vert\, \mu_y)\big]}_{\text{cost of stochastic actions}}
        \\
        D_F(u\,\Vert\,v) = u/v - \log(u/v) - 1 \ge 0
        \end{gathered}
    - title: The critic decides when to stop
      text: >-
        Write $$L_t = \mathrm{KL}(q\,\Vert\,a_t)$$ for the error of the current prediction. The value compares it with
        the expected error after further refinement, and since the label ambiguity cancels, it measures only what
        refinement can still fix. RIC refines while $$V(s_t) > 0$$, so ambiguous inputs stop early and confident
        mistakes keep refining, without a ponder penalty or separate halting network.
      eq: >-
        V^\pi(s_t) = L_t - \mathbb{E}_{N\sim\mathrm{Geom}(1-\gamma),\,\pi}\!\left[L_{t+N} \mid s_t\right]

questions:
  title: Results
  intro: >-
    We train RIC with Simple Policy Optimization (RIC-SPO) and compare it with supervised learning (SL) and with
    recurrent and evidential baselines on ten image classification benchmarks, including noisy human labels and
    medical images.
  items:
    - title: How does RIC learn differently?
      thumb: papers/ric/dynamics.png
      figures:
        - src: papers/ric/dynamics.png
          wide: true
          caption: >-
            Training dynamics with (a) the return normalized by $$\log K$$, (b) train and validation accuracy, and
            (c) validation accuracy against training accuracy.
        - src: papers/ric/generalization.png
          wide: true
          caption: >-
            Validation accuracy against training accuracy on three datasets.
      findings:
        - >-
          The main difficulty shifts from overfitting to underfitting. RIC fits more gradually, while validation
          performance remains strong as training continues.

    - title: What happens under label noise?
      thumb: papers/ric/noise.svg
      figures:
        - src: papers/ric/noise.svg
          wide: true
          caption: >-
            Expected calibration error (ECE), the gap between confidence and accuracy, and confidence over training,
            from clean labels (a) to increasingly noisy human labels (b, c).
      findings:
        - >-
          RIC builds confidence at its own pace and stays better calibrated under noisy labels during prolonged
          training.

    - title: How calibrated is RIC at test time?
      thumb: papers/ric/ece_woof.svg
      figures:
        - src: papers/ric/ece_woof.svg
          wide: true
          caption: >-
            Confidence distributions and reliability diagrams on a test set.
        - src: papers/ric/rank_pareto_tradeoff.svg
          caption: >-
            Mean accuracy and ECE ranks across ten datasets. Lower is better.
      findings:
        - >-
          RIC achieves a better balance between accuracy and calibration. Deterministic predictions favor accuracy,
          while stochastic predictions favor calibration.

    - title: Does the critic spend compute where it pays?
      thumb: papers/ric/adaptive_compute.svg
      figures:
        - src: papers/ric/adaptive_compute.svg
          wide: true
          caption: >-
            (a) Return by input difficulty, with halting steps marked, (b) confidence and ECE across inference steps,
            and (c) stopping steps for correct and incorrect predictions.
      findings:
        - >-
          The critic spends computation where further refinement is useful and stops when little improvement
          remains.

remarks:
  title: Takeaways
  items:
    - >-
      RIC offers an alternative way to train classifiers, by reinforcement instead of imitation.
    - >-
      Freed from imitation, the model builds confidence at its own pace, and calibration emerges in training.
    - >-
      The training dynamics favor models that are more robust to label noise.
    - >-
      At deployment, deterministic rollouts favor accuracy and stochastic rollouts favor calibration.
    - >-
      Better reinforcement learning algorithms could improve both speed and performance.

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
