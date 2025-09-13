# GRPO及其后续改进

本文将详细介绍GRPO和后续的各种改进，主要围绕一系列论文展开，论文列表来自于[这个仓库](https://github.com/xhyumiracle/Awesome-AgenticLLM-RL-Papers?tab=readme-ov-file#sec27-agentic-rl-algorithms)。

> [!INFO] AI使用声明
> 本文部分数学公式的Latex使用Qwen识别然后提供

## 前置知识

要完全的介绍GRPO的前置知识，则几乎不可避免要从强化学习的基本概念开始，或者至少从策略梯度开始，这需要不少的篇幅，我也不认为我的理解能将这么多内容讲解清楚，所以这里我们只从PPO开始。如果希望了解更多的前置知识，以下资料或许有帮助

[【策略梯度定理】推导、证明、深入理解与代码实现](https://zhuanlan.zhihu.com/p/491647161)

[强化学习进阶 第七讲 TRPO](https://zhuanlan.zhihu.com/p/26308073)

[Proximal Policy Optimization (PPO) 算法理解：从策略梯度开始](https://zhuanlan.zhihu.com/p/614115887)

PPO，即Proximal Policy Optimization或近端策略优化，是OpenAI在2017年提出的一种策略优化算法，论文在[这里](https://arxiv.org/pdf/1707.06347)。PPO主要是在之前的[TRPO](https://arxiv.org/pdf/1502.05477)上做的改进，它实际上有两个版本，分别是Clipped版本和自适应KL惩罚版本，即PPO-Clip和PPO-Penalty，其中PPO-Clip流传最广，以至于后来称PPO默认都是指PPO-Clip。

PPO-Clip的优化目标是
$$
L^{\text{CLIP}}(\theta) = \hat{\mathbb{E}}_t\left[\min(r_t(\theta)\hat{A}_t, \text{clip}(r_t(\theta), 1 - \epsilon, 1 + \epsilon)\hat{A}_t)\right]
$$
这里的 $r_t(\theta)$ 是重要性采样中的重要性比率，即
$$
r_t(\theta) = \frac{\pi_\theta(a_t \mid s_t)}{\pi_{\theta_{\text{old}}}(a_t \mid s_t)}
$$
$\hat{A}_t$ 表示优势函数的估计，所谓优势函数，即指当前的状态-动作价值函数或者其他的策略梯度定理中允许在这一项的函数减去一个baseline，减去baseline目的在于减小方差，在RLHF中，这个baseline通常是有另一个模型预测，该模型称为value model或critic model。

我们进行clip操作，主要是隐性地约束更新的步伐不要过大，并采用悲观的策略与没有clip操作的目标取其较小值。PPO使用这个clip实现了对模型更新后与reference model的差距的约束，从而不再使用TRPO中的KL惩罚项。

PPO是一个重要的策略梯度优化算法，ChatGPT的训练中的RLHF就是用的PPO。在RLHF中，对于大语言模型，我们如果把生成一个token视为一个动作的化，那么PPO的公式就变成了
$$
\mathcal{J}_{\text{PPO}}(\theta) = \mathbb{E}_{[q \sim P(Q),\, o \sim \pi_{\theta_{\text{old}}}(O|q)]} \left[ \frac{1}{|o|} \sum_{t=1}^{|o|} \min \left[ \frac{\pi_\theta(o_t | q, o_{<t})}{\pi_{\theta_{\text{old}}}(o_t | q, o_{<t})} A_t,\, \text{clip} \left( \frac{\pi_\theta(o_t | q, o_{<t})}{\pi_{\theta_{\text{old}}}(o_t | q, o_{<t})}, 1 - \varepsilon, 1 + \varepsilon \right) A_t \right] \right]
$$
这里基本就是把PPO的公式套到了RLHF中而已，所谓的actor model或者策略，实际上就是要训练的语言模型，这里有所不同的是优势函数 $\hat{A}$ 的计算，其中用到的baseline或者value，是由一个value model计算得到的，它也在训练的过程中更新，它的优化目标有很多种，但基本的思想都是求与期望折扣奖励的均方误差。为了缓解奖励函数的过度优化，通常不会直接把奖励模型得到的奖励分数作为实际使用的奖励，而是要减去KL惩罚。根据[论文](https://arxiv.org/pdf/2009.01325)的解释，这个KL惩罚主要有两个作用：

1. 作为熵奖励，鼓励策略模型进行探索
2. 确保模型不会生成与奖励模型训练时见过的语料差距过大的内容

> 实事求是地讲，我并没有理解这里KL惩罚的作用

## GRPO

观察上面PPO的优化目标，我们不仅需要训练本来的大语言模型（也称actor model），还需要训练一个value model，它的大小经常与actor model相当，这对显存和计算能力有相当的耗费，同时也带来了训练的不稳定等问题。为此，DeepSeek提出了GRPO，抛弃了value model，改为使用多个roll out或sample的平均奖励作为baseline，论文在[这里](https://arxiv.org/pdf/2402.03300)。

> 很多论文提到GRPO的时候总是引用DeepSeek-R1的[论文](https://arxiv.org/pdf/2501.12948)，但实际上GRPO是DeepSeek在DeepSeek-R1之前的DeepSeekMath就提出了，他们在DeepSeek-R1中提到GRPO也是引用的DeepSeekMath，但DeepSeek-R1影响太大，以至于大家想到GRPO第一反应都是DeepSeek-R1。

GRPO的优化目标是
$$
\mathcal{J}_{\text{GRPO}}(\theta) = \mathbb{E}_{q \sim P(Q), \{o_i\}_{i=1}^G \sim \pi_{\theta_{\text{old}}}(O|q)} \left[ \frac{1}{G} \sum_{i=1}^G \frac{1}{|o_i|} \sum_{t=1}^{|o_i|} \{\min\left( \frac{\pi_\theta(o_{i,t}|q, o_{i,<t})}{\pi_{\theta_{\text{old}}}(o_{i,t}|q, o_{i,<t})} \hat{A}_{i,t},\ \text{clip}\left( \frac{\pi_\theta(o_{i,t}|q, o_{i,<t})}{\pi_{\theta_{\text{old}}}(o_{i,t}|q, o_{i,<t})},\ 1 - \varepsilon,\ 1 + \varepsilon \right) \hat{A}_{i,t} \right) - \beta \mathbb{D}_{\text{KL}}\left[\pi_\theta \,\|\, \pi_{\text{ref}}\right] \right]\}
$$

## 后续改进