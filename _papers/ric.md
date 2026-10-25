---
layout: paper
title: "Do Not Imitate, Reinforce"
subtitle: Iterative Classification via Belief Refinement
venue: TMLR 2026
description: >-
  Reinforced Iterative Classification (RIC) trains a classifier to refine its own class distribution
  step by step with reinforcement learning, and a learned critic decides when to stop.

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
  A classifier does not have to copy its labels in one shot: RIC lets it refine its own class
  distribution step by step, rewards each improvement, and uses a learned critic to decide when to stop.

tldr: >-
  Reinforced Iterative Classification (RIC) casts classification as a Markov decision process in which
  a recurrent actor iteratively refines a predictive distribution and is rewarded for the increase in log
  probability assigned to the label; a critic estimates the value of continued refinement and supplies a
  stopping rule at inference. In the deterministic limit RIC targets the same prediction as cross-entropy,
  but it reaches that target along a different path: <mark>accuracy rises ahead of confidence</mark>.
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
      image: papers/ric/ric_arch.svg
      caption: >-
        Recurrent actor-critic architecture. The policy head samples the next class distribution; the
        value head predicts future improvement and supplies the stopping rule at inference.
    - title: Reward each improvement
      text: >-
        Each step is paid for the increase in log probability on the observed label. The reward telescopes,
        so the discounted return scores the prediction reached at a random, geometrically distributed
        refinement depth. This makes RIC an anytime classifier.
      eq: >-
        r_t = \log a_{t,y} - \log a_{t-1,y}, \qquad
        J_{x,y}(\theta) = \mathbb{E}_{N\sim\mathrm{Geom}(1-\gamma),\,\pi_\theta}\!\left[\log a_{N,y} \mid x,y\right] - \log a_{0,y}
    - title: Stop when the critic sees no more to gain
      text: >-
        The critic's value equals the current KL error minus the expected future KL error. At inference,
        refinement continues while the value is positive and returns the current prediction once it is not.
      eq: >-
        V^\pi(s_t) = L_t - \mathbb{E}_{N\sim\mathrm{Geom}(1-\gamma),\,\pi}\!\left[L_{t+N} \mid s_t\right],
        \qquad L_j = \mathrm{KL}\big(q(\cdot\mid x)\,\|\,a_j\big)
      image: papers/ric/ric-refinement.gif
      caption: >-
        RIC unrolled across refinement steps: green means continue; red means stop and return the current
        belief. All recurrent blocks share weights.

questions:
  title: Questions
  items:
    - title: Does RIC learn something different from cross-entropy?
      findings:
        - >-
          The expected loss splits into label ambiguity, mean prediction error, and the cost of stochastic
          actions:
          $\mathbb{E}[-\log a_y] = H(q) + \mathrm{KL}(q\,\Vert\,\mu) + \mathbb{E}[D_F(a_y\,\Vert\,\mu_y)]$.
          The last two terms vanish only when the mean prediction is $q(\cdot\mid x)$ and the policy is
          deterministic.
        - >-
          So deterministic RIC and cross-entropy select the same probability target, at every refinement depth.
        - >-
          The difference is the path. Cross-entropy pushes predictions toward the label for as long as any
          gap remains; the policy gradient moves a prediction only while stochastic refinements earn
          distinguishable returns.

    - title: Does it beat supervised training on accuracy and calibration?
      thumb: papers/ric/rank_pareto_tradeoff.svg
      figures:
        - src: papers/ric/rank_pareto_tradeoff.svg
          caption: >-
            Mean accuracy and ECE ranks across ten datasets with validation-loss checkpoint selection.
            Lower is better.
      findings:
        - >-
          The deterministic and stochastic RIC-SPO readouts form the Pareto front of mean accuracy and ECE
          ranks; SL, EDL, ACT and PonderNet are dominated.
        - >-
          Deterministic mean-policy rollouts have the strongest accuracy profile, while stochastic evaluation
          lowers ECE on eight of the ten datasets.
        - >-
          On MedMNIST, the deterministic readout takes the best or tied accuracy on four of five subsets and
          the stochastic readout the best or tied ECE on all five. On CIFAR-10N Worst, stochastic evaluation
          reduces ECE from 0.284 to 0.051, while deterministic evaluation keeps roughly nine more accuracy points.

    - title: What do the predictions look like on a fine-grained dataset?
      thumb: papers/ric/ece_woof.svg
      figures:
        - src: papers/ric/ece_woof.svg
          wide: true
          caption: >-
            Confidence distributions and reliability diagrams on ImageWoof (test), aggregated over five
            models selected by validation loss. RIC-SPO is evaluated deterministically.
      findings:
        - >-
          Deterministic RIC-SPO raises accuracy from 82.1% to 85.3% and reduces ECE from 0.085 to 0.038
          relative to SL.
        - >-
          SL's confidence histogram is sharply peaked near extreme values, and its reliability diagram is
          overconfident in every bin.
        - >-
          RIC-SPO's confidence distribution is broader and mildly underconfident across most bins, with
          accuracy and confidence much better aligned.

    - title: Does RIC fit the training data the same way supervised learning does?
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
        - >-
          RIC-SPO's policy-gradient updates have higher variance and reach the high-accuracy regime more gradually.
        - >-
          It attains higher normalized validation return and keeps it through the end of training, while
          SL's normalized validation return declines.
        - >-
          At matched training accuracy, deterministic RIC-SPO reaches higher validation accuracy on CIFAR-10,
          Galaxy10 and ImageWoof.

    - title: When does confidence catch up with accuracy?
      thumb: papers/ric/noise.svg
      figures:
        - src: papers/ric/noise.svg
          wide: true
          caption: >-
            Validation ECE and confidence over training (deterministic evaluation) on (a) CIFAR-10,
            (b) CIFAR-10N with aggregated human labels (9.03% noise), and (c) CIFAR-10N with worst-case
            labels (40.21% noise).
      findings:
        - >-
          With RIC-SPO, confidence evolves more slowly than accuracy. The model is underconfident early, and
          ECE peaks above 0.6 before confidence catches up.
        - >-
          SL confidence saturates within tens of epochs, and its ECE grows with label noise.
        - >-
          RIC-SPO confidence rises toward a lower asymptote as noise increases, which keeps predictions on noisy
          examples away from the simplex boundary. Deterministic evaluation ends training with the lower ECE
          in all three settings.

    - title: Is it the recurrence, the Dirichlet head, or the reinforcement?
      thumb: papers/ric/abl.svg
      figures:
        - src: papers/ric/abl.svg
          wide: true
          caption: >-
            Ablation: (a) normalized return, (b) validation accuracy, and (c) ECE over training for RIC-SPO,
            RIC-PPO, and RIC-SPO with a logistic Gaussian head.
      findings:
        - >-
          ACT and PonderNet use the same GRU refinement module, with PonderNet's halting prior matched to
          RIC's discount, yet their ECE tracks SL's. Adaptive recurrence alone does not calibrate.
        - >-
          EDL shares the Dirichlet output family and improves on SL only modestly. What remains specific to
          RIC-SPO is learning the refinements through stochastic returns and policy optimization.
        - >-
          In the ablation, the Dirichlet head is more stable and trains faster than a logistic Gaussian head,
          and RIC-PPO (same MDP, PPO update) trains faster but has higher ECE.

    - title: Does the critic know when to stop?
      thumb: papers/ric/adaptive_compute.svg
      figures:
        - src: papers/ric/adaptive_compute.svg
          wide: true
          caption: >-
            Adaptive computation on ImageWoof (test): (a) discounted return by difficulty, with halting steps
            marked; (b) confidence and ECE across inference steps; (c) stopping steps for correctly and
            incorrectly classified inputs.
      findings:
        - >-
          Grouped by the consensus of five supervised models, easy inputs saturate quickly, intermediate
          inputs benefit from more refinement steps, and on hard images the policy stops before additional
          negative reward accrues.
        - >-
          Confidence rises and ECE falls across refinement steps; the value rule stops inference once further
          refinement yields marginal gains.
        - >-
          The critic allocates more steps to inputs that end up correctly classified and stops early on
          misclassified hard images. Some inputs reach the 20-step horizon when the critic overestimates the
          remaining return.

    - title: How accurate is the critic's stop-or-continue decision?
      thumb: papers/ric/critic_policy_comparison.svg
      figures:
        - src: papers/ric/critic_policy_comparison.svg
          caption: >-
            Return-to-go from vine rollouts and critic value, with correct stop and continue decisions below,
            for stochastic (top) and deterministic mean-policy trajectories (bottom).
      findings:
        - >-
          Against vine estimates of the future return, the critic makes the correct stop or continue decision
          on 69 to 87% of qualifying states on CIFAR-10 and CIFAR-10N (Agg.), under both deployments.
        - >-
          The deterministic critic errs toward stopping early.
        - >-
          At 40% label noise, it detects 83% of harmful continuations but only 44% of beneficial ones.

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
