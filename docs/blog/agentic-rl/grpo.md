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

$\hat{A}_t$ 表示优势函数的估计，所谓优势函数，即指当前的状态-动作价值函数或者其他的策略梯度定理中允许在这一项的函数减去一个基线（实际上通常就是期望），减去基线目的在于减小方差，在人类反馈强化学习中，这个基线通常是有另一个模型预测，该模型称为价值模型或评论模型。

我们进行clip操作，主要是隐性地约束更新的步伐不要过大，并采用悲观的策略与没有clip操作的目标取其较小值。PPO使用这个clip实现了对模型更新后与参考模型的差距的约束，从而不再使用TRPO中的KL惩罚项。

PPO是一个重要的策略梯度优化算法，ChatGPT的训练中的人类反馈强化学习就是用的PPO。在人类反馈强化学习中，对于大语言模型，我们如果把生成一个标记（token）视为一个动作的话，那么PPO的公式就变成了

$$
\mathcal{J}_{\text{PPO}}(\theta) = \mathbb{E}_{[q \sim P(Q),\, o \sim \pi_{\theta_{\text{old}}}(O|q)]} \left[ \frac{1}{|o|} \sum_{t=1}^{|o|} \min \left[ \frac{\pi_\theta(o_t | q, o_{<t})}{\pi_{\theta_{\text{old}}}(o_t | q, o_{<t})} A_t,\, \text{clip} \left( \frac{\pi_\theta(o_t | q, o_{<t})}{\pi_{\theta_{\text{old}}}(o_t | q, o_{<t})}, 1 - \varepsilon, 1 + \varepsilon \right) A_t \right] \right]
$$

这里基本就是把PPO的公式套到了人类反馈强化学习中而已，所谓的策略模型，实际上就是要训练的语言模型，这里有所不同的是优势函数 $\hat{A}$ 计算中基线或者价值的计算，是由一个价值模型计算得到的，它也在训练的过程中更新，它的优化目标有很多种，但基本的思想都是求与期望折扣奖励的均方误差。为了缓解奖励函数的过度优化，通常不会直接把奖励模型得到的奖励分数作为实际使用的奖励，而是要减去KL惩罚。根据[论文](https://arxiv.org/pdf/2009.01325)的解释，这个KL惩罚主要有两个作用：

1. 作为熵奖励，鼓励策略模型进行探索
2. 确保模型不会生成与奖励模型训练时见过的语料差距过大的内容

::: tip
实事求是地讲，我并没有完全理解这里KL惩罚的作用，上面的解释我也只是直接从论文翻译来的
:::

## GRPO

观察上面PPO的优化目标，我们不仅需要训练本来的大语言模型（也称策略模型），还需要训练一个价值模型，它的大小经常与策略模型相当，这对显存和计算能力有相当的耗费，同时也带来了训练的不稳定等问题。为此，DeepSeek提出了GRPO（Group Relative Policy Optimization，分组相对策略优化），抛弃了价值模型，改为使用多个样本的平均奖励作为基线，论文在[这里](https://arxiv.org/pdf/2402.03300)。

:::details GRPO的引用问题
很多论文提到GRPO的时候总是引用DeepSeek-R1的[论文](https://arxiv.org/pdf/2501.12948)，但实际上GRPO是DeepSeek在DeepSeek-R1之前的DeepSeekMath就提出了，他们在DeepSeek-R1中提到GRPO也是引用的DeepSeekMath，但DeepSeek-R1影响太大，以至于大家想到GRPO第一反应都是DeepSeek-R1。
:::

GRPO的优化目标是

$$
\mathcal{J}_{\text{GRPO}}(\theta) = \mathbb{E}_{q \sim P(Q), \{o_i\}_{i=1}^G \sim \pi_{\theta_{\text{old}}}(O|q)} \left[ \frac{1}{G} \sum_{i=1}^G \frac{1}{|o_i|} \sum_{t=1}^{|o_i|} \{\min\left( \frac{\pi_\theta(o_{i,t}|q, o_{i,<t})}{\pi_{\theta_{\text{old}}}(o_{i,t}|q, o_{i,<t})} \hat{A}_{i,t},\ \text{clip}\left( \frac{\pi_\theta(o_{i,t}|q, o_{i,<t})}{\pi_{\theta_{\text{old}}}(o_{i,t}|q, o_{i,<t})},\ 1 - \varepsilon,\ 1 + \varepsilon \right) \hat{A}_{i,t} \right) - \beta \mathbb{D}_{\text{KL}}\left[\pi_\theta \,\|\, \pi_{\text{ref}}\right] \right]\}
$$

符号的意义基本上跟PPO是一样的，区别主要在于 $\hat{A}$ 表示的优势是相对于分组内的优势。具体而言，对于基于结果的奖励，我们对一个分组的 $G$ 个样本分别给出其奖励分数 $\mathbf{r} = \{r_1, r_2, \cdots, r_G\}$ ，那么对于第 $i$ 个样本，它的优势计算公式是

$$
\hat{A}_{i,t} = \tilde{r}_i = \frac{r_i - \text{mean}(\mathbf{r})}{\text{std}(\mathbf{r})}
$$

实际上每个标记的奖励和优势是相同的。如果是基于过程的奖励，那么需要把对应的 $r_i$ 改为该标记所在过程的奖励，而平均值和标准差需要对所有样本的所有过程奖励求取，即我们对于 $G$ 个样本得到了奖励 $\mathbf{R} = \left\{ \left\{ r_1^{\text{index}(1)}, \ldots, r_1^{\text{index}(K_1)} \right\}, \ldots, \left\{ r_G^{\text{index}(1)}, \ldots, r_G^{\text{index}(K_G)} \right\} \right\}$ ，对应的 $r_i^{\text{index}(j)} = \frac{r_i^{\text{index}(j)} - \text{mean}(\mathbf{R})}{\text{std}(\mathbf{R})}$ ，于是优势为

$$
\hat{A}_{i,t} = \sum_{\text{index}(j) \geq t} \widetilde{r}_i^{\text{index}(j)}
$$

与此同时，GRPO不再将KL惩罚添加在奖励上，而是直接加在优化目标上，也即上面我们看到的 $\mathbb{D}_{\text{KL}}\left[\pi_\theta \,\|\, \pi_{\text{ref}}\right]$ ，以简化 $\hat{A}_{i,t}$ 的计算。与PPO中的KL散度计算不同的是，这里用的是KL散度的一个无偏估计

$$
\mathbb{D}_{KL}\left[\pi_\theta \mid\mid \pi_{\text{ref}}\right] = \frac{\pi_{\text{ref}}(o_{i,t} \mid q, o_{i,<t})}{\pi_\theta(o_{i,t} \mid q, o_{i,<t})} - \log \frac{\pi_{\text{ref}}(o_{i,t} \mid q, o_{i,<t})}{\pi_\theta(o_{i,t} \mid q, o_{i,<t})} - 1
$$

实际在大语言模型的强化学习中，GRPO的一个基本流程如下所示

![grpo-algorithm](./images/grpo-algorithm.png)

:::tip
GRPO提出是在DeepSeekMath，后来应用于DeepSeek-R1，这两个模型的训练中，用到GRPO的都是推理能力的增强，而不再是之前的人类反馈强化学习，它们的奖励函数多是基于结果或基于过程的奖励，不是之前的由表示人类偏好的奖励模型给出。
:::

## 后续改进

GRPO提出后，特别是DeepSeek-R1引起广大关注后，由于其训练稳定、显存占用少（少于PPO）、实现简单等优势，已经成为现今大多数对于大语言模型的强化学习训练，特别是针对模型推理能力的训练的首先选择。与此同时，也有不少人提出了一些对其的改进，它们中有些也体现出比较深刻的观察并得到足够的实验的验证。

### DAPO

DAPO是字节跳动和清华大学提出的一个对GRPO的改进，其全称是裁剪解耦与动态采样策略优化（**D**ecoupled
Clip and **D**ynamic s**A**mpling **P**olicy **O**ptimization），论文在[这里](https://arxiv.org/pdf/2503.14476)，其优化目标为

$$
\begin{array}{l}
\mathcal{J}_{\text{DAPO}}(\theta) = \mathbb{E}_{(q,a)\sim\mathcal{D},\,\{o_i\}_{i=1}^G\sim\pi_{\theta_{\text{old}}}(\cdot\mid q)} \left[ \frac{1}{\sum_{i=1}^G |o_i|} \sum_{i=1}^G \sum_{t=1}^{|o_i|} \min\left(r_{i,t}(\theta)\hat{A}_{i,t},\ \text{clip}\left(r_{i,t}(\theta), 1 - \varepsilon_{\text{low}}, 1 + \varepsilon_{\text{high}}\right)\hat{A}_{i,t}\right) \right] \\
\text{s.t.}\quad 0 < \left| \left\{ o_i \mid \text{is\_equivalent}(a, o_i) \right\} \right| < G
\end{array}
$$

其中

$$
r_{i,t}(\theta) = \dfrac{\pi_\theta(o_{i,t} \mid q, o_{i,<t})}{\pi_{\theta_{\text{old}}}(o_{i,t} \mid q, o_{i,<t})}, \quad 
\hat{A}_{i,t} = \dfrac{R_i - \text{mean}(\{R_i\}_{i=1}^G)}{\text{std}(\{R_i\}_{i=1}^G)}
$$

它主要做的改进包括四个方面：

#### 提高裁剪的上界

这个改进主要基于研究团队在GRPO训练过程中观察到的一个现象——策略模型输出的熵快速下降。这意味着模型随着训练的进行，越来越倾向于利用之前的经验，而很少进行新的探索。研究团队认为，这跟裁剪的上界有关，他们认为，同样的裁剪上界 $\epsilon$ ，对于较高概率的行为，其被限制后仍然能达到很高的概率，但较低概率的行为，则限制更严。这个某种意义上是有道理的，因为我们裁剪的是重要性比率，即 $\dfrac{\pi_\theta}{\pi_{\theta_{\text{old}}}}$ ，实际作用到 $\pi_\theta$ 上的上界是 $(1+\epsilon)\pi_{\theta_\text{old}}$ ，原来 $\pi_{\theta_\text{old}}$ 越高的，其能增加的也越高。研究团队实验也发现，被上界裁剪的确实多是一些概率较低的标记。于是研究团队将重要性比率裁剪的上下界进行了解耦，允许使用不同的 $\epsilon$ ，其中 $\epsilon_{\text{high}}$ 会设置的更大一些。

#### 动态采样

GRPO中，使用基于规则的奖励，优势的计算是用奖励减去分组的平均奖励再除以分组奖励的标准差，如果对于一个提示词的准确率为0或1，那么所有的奖励都相同，于是优势变为0，导致没有产生梯度更新。在实际训练中，我们不是一个分组一个分组的进行训练，而是会有一个批次的分组同时计算梯度更新，一个分组的梯度更新为0事实上导致了训练批次的梯度更新变小，也带来了批次的梯度更新的方差变大，产生噪声。于是研究团队采用了动态采样的策略，过滤掉准确率为0或1的分组，不断采样直到批次内的所有分组的准确率都不为0和1。

#### 使用标记级别的损失

这主要是针对长思维链强化学习场景提出的改进，在原来GRPO中，分组内每个样本的损失被赋予了相同的权重（我们是先求每个标记的平均损失，然后再求每个样本的平均损失），这导致了长的优质回答不容易被学习，而长的错误模式（比如不必要的重复等）又不容易被惩罚，导致回答的熵和长度出现异常的增长。研究团队对此提出了新的损失计算方法，每个样本的损失赋予一个等于其响应长度的权重，实际上写成公式就是标记级别的损失。

:::tip
这个改变不太容易发现，因为我们观察一个公式的时候有时不会去看外面的求和符号～
:::

#### 超长奖励调整

论文主要研究的是长思维链推理能力的增强，对于一些问题，模型的响应可能会过长，超过了预设的长度限制，传统的做法是进行截断并赋予一个长度惩罚，但这样未免有些粗暴。论文研究团队首先实验了直接在计算损失时不计入被截断的过长样本的损失，发现这样可以很好地稳定训练并提升模型表现。随后，论文研究团队又提出了一个弹性超长惩罚，对于被截断的过长样本，在一定的区间内不予惩罚，超过一定程度后逐步线性增加惩罚，直到一个预设的最大长度，惩罚保持为-1。即

$$
\begin{array}{l}
R_{\text{length}}(y) = 
\begin{cases}
0, & |y| \leq L_{\max} - L_{\text{cache}} \\
\dfrac{(L_{\max} - L_{\text{cache}}) - |y|}{L_{\text{cache}}}, & L_{\max} - L_{\text{cache}} < |y| \leq L_{\max} \\
-1, & L_{\max} < |y|
\end{cases}
\end{array}
$$

:::tip
我们可以看到，这篇论文很多改进都是研究团队基于在实验中发现的问题提出的，这也是大语言模型训练中一个常见的情况，有些想法可能看起来很简单，但确实能解决对训练有很大影响的问题。
:::

:::tip
这篇论文的排版和书写还是挺好的，特别是有一些详细的对比和颜色标注，很多问题看我的文章的语言描述后无法理解的，可以看原论文，会更容易理解一些。
:::
