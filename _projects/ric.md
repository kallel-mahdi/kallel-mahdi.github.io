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
  Today classifiers imitate their labels in a single pass and learn to be certain. What if classification used the
  full strength of reinforcement learning?

hero:
  src: papers/ric/ric-refinement.gif
  caption: >-
    An actor refines its prediction step by step, and a critic estimates the improvement still left and decides when
    to stop. Green means continue, red means stop and return the current prediction.

tldr: >-
  Reinforced Iterative Classification (RIC) rewards a classifier for improving its prediction instead of training it
  to imitate its labels. A recurrent actor refines its prediction step by step and earns a reward for every step
  toward the label, and a critic decides when to stop. Learning from returns gives **fundamentally different learning
  and generalization dynamics** from supervised training, and a better balance of accuracy and calibration across ten
  image benchmarks.

method:
  title: How it works
  intro: >-
    Early learning systems learned by trial and error, improving a little at a time. As Andrew Barto put it at RLC
    2024, *"in the beginning, machine learning was reinforcement learning."* RIC brings this view back to
    classification. Each labeled example becomes a short episode. The prediction starts uniform over the $K$ classes,
    and at every step a recurrent network reads the input and the current prediction, a policy head proposes the next
    class distribution, and a value head estimates whether refining further is worth it. The four steps below show
    what this agent is trained for and why it learns differently from cross-entropy.
  steps:
    - title: Reward every improvement
      text: >-
        Cross-entropy tells the model what to output. RIC only tells it how much its last step helped. The reward is
        the change in log probability that the prediction assigns to the true label $y$, positive for a step toward
        $y$ and negative for a step away from it. Because the actor samples its predictions, it has to find out by
        itself which refinements pay off.
      eq: r_t = \log a_{t,y} - \log a_{t-1,y}
    - title: Discounting trains every depth
      text: >-
        Over an episode the rewards telescope, and only the first and the current prediction remain. With a discount
        $\gamma$, the expected return becomes the log probability of the label at a random depth $N$ drawn from a
        geometric distribution. Every depth carries weight, so every intermediate prediction is trained to be a good
        answer. RIC can therefore stop at any step and still return a useful prediction, and the critic of step 4
        decides when.
      eq: >-
        \mathbb{E}\Big[\textstyle\sum_{t\ge1}\gamma^{t-1} r_t\Big] = \mathbb{E}_{N\sim\mathrm{Geom}(1-\gamma)}\big[\log a_{N,y}\big] + \log K
    - title: Same target, different learning
      text: >-
        For labels drawn from the true conditional $q(\cdot \mid x)$, the expected cross-entropy of a stochastic
        prediction with mean $\mu$ splits into three parts. No model can remove the label ambiguity, while the error
        of the mean prediction and the cost of random actions can be removed. Maximizing the return drives these two
        to zero at every depth, so a deterministic RIC policy predicts $q(\cdot \mid x)$, the same target as
        cross-entropy.


        The two objectives differ in how they reach it. Cross-entropy differentiates the loss of each prediction and
        pushes it toward the label as long as any gap remains, so confidence grows with fitting. RIC learns through
        the policy gradient, which moves a prediction only while its sampled refinements earn distinguishable
        returns. This difference in learning is the source of the different dynamics in the results.
      eq: >-
        \mathbb{E}_{y\sim q,\,a\sim\pi}\big[-\log a_y\big] = \underbrace{H(q)}_{\text{label ambiguity}} + \underbrace{\mathrm{KL}(q\,\Vert\,\mu)}_{\text{mean prediction error}} + \underbrace{\mathbb{E}\big[D_F(a_y \,\Vert\, \mu_y)\big]}_{\text{cost of stochastic actions}}
    - title: The critic decides when to stop
      text: >-
        Write $L_t = \mathrm{KL}(q\,\Vert\,a_t)$ for the error of the current prediction. The value of a state
        compares this error with the expected error after further refinement. The label ambiguity is the same now and
        later and cancels, so the critic measures only the error that refinement can still remove. Refinement
        continues while $V(s_t) > 0$ and stops once $V(s_t) \le 0$. An ambiguous input can stop early with an
        uncertain prediction, and a confident but wrong one keeps refining. The stopping rule comes from the critic
        RIC already trains, with no ponder penalty or separate halting network.
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
            Training dynamics with (a) the return normalized by $\log K$, (b) train and validation accuracy, and
            (c) validation accuracy against training accuracy.
        - src: papers/ric/generalization.png
          wide: true
          caption: >-
            Validation accuracy against training accuracy on three datasets.
      findings:
        - "**SL's validation return declines while RIC's holds.**"
        - >-
          RIC fits the training set more gradually and generalizes better at the same training accuracy. It keeps
          improving where supervised training starts to overfit.

    - title: What happens under label noise?
      thumb: papers/ric/noise.svg
      figures:
        - src: papers/ric/noise.svg
          wide: true
          caption: >-
            Expected calibration error (ECE), the gap between confidence and accuracy, and confidence over training,
            from clean labels (a) to increasingly noisy human labels (b, c).
      findings:
        - "**At every noise level, RIC ends training better calibrated than SL.**"
        - >-
          Cross-entropy ties confidence to fitting, so SL becomes near certain early. RIC builds confidence at its
          own pace and keeps moderate probabilities on mislabeled examples.

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
        - "**SL is overconfident. RIC stays close to calibrated.**"
        - >-
          Across ten datasets, the deterministic readout of RIC favors accuracy and the stochastic readout favors
          calibration, and together they form the Pareto front.
        - >-
          Recurrent baselines trained with cross-entropy are calibrated like SL, so the gain comes from learning
          from returns.

    - title: Does the critic spend compute where it pays?
      thumb: papers/ric/adaptive_compute.svg
      figures:
        - src: papers/ric/adaptive_compute.svg
          wide: true
          caption: >-
            (a) Return by input difficulty, with halting steps marked, (b) confidence and ECE across inference steps,
            and (c) stopping steps for correct and incorrect predictions.
      findings:
        - "**Easy inputs saturate fast. Hard ones stop before reward turns negative.**"
        - >-
          The critic makes the right stop-or-continue call on most states, without any extra halting machinery.

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
