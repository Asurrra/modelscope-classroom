// Auto-generated. Do not edit by hand.
window.LEARNING_DATA = window.LEARNING_DATA || [];
window.LEARNING_DATA.push({
  module: '前沿论文',
  chapters: [
    {
      id: "blog-articles-all2all-survey",
      title: "图像理解与生成统一模型——前沿模型架构理解",
      file: "Blogs/Articles/All2All-Survey/report.md",
      difficulty: "高级",
      duration: "0.5h",
      week: 4,
      phase: 4,
      keywords: ["统一模型", "多模态", "VLM", "Diffusion", "图像理解与生成"],
      content: `# 图像理解与生成统一模型——前沿模型架构理解

生成式多模态模型近年来一直是业界的研究热点。视觉语言模型（VLM）一直是多模态文本生成领域的核心路线，能够完成图像理解任务；扩散模型（Diffusion Model）则一直是图像和视频生成领域的核心方法。今年早期，同时支持图像理解和生成的统一模型如雨后春笋般浮现。统一模型受到青睐，不只是因为它同时支持理解和生成两种任务带来的通用性，更是因为大家看到了任务有机结合带来的多模态学习潜力。一方面，两种任务有机结合使模型能在两种任务上联合优化，提升了图文交错数据的利用率，同时也让学术界看到了任务间互相促进的潜力。另一方面，输出支持多模态，让统一模型在当下火热的模型推理上有了更多的玩法，比如可以开发出基于生成图的推理和基于推理的图生成。

从理解和生成任务出发，在统一模型之前，理解任务由 Vision Language Model 完成，走自回归 AR 路线；而生成任务则由 Diffusion Model 完成，走 DDPM 或者 FlowMatching 的路线。因此，统一模型的技术也是围绕这两个路线出发的。本文将目前典型的统一模型工作分成四类，分别是纯自回归路线，AR + Diffusion 串联结构，AR + Diffusion 并联结构和单一模型同时做 AR + Diffusion。由于 Diffusion 做文本理解的技术和生态尚不成熟，本文不涉及仅基于 Diffusion 的统一模型。

注意，本文并不是一篇完整的综述，可能不会涵盖所有文章，这四个类别是为了更好的抓住不同模型之间的差异。理解一个统一模型最快的思路就是理清它是怎么应对图像理解和生成这两个任务的。对于图像理解任务，现在的统一模型一般都是沿用 VLM 的思路，将图像编码成 Embedding 后，由 LLM 统一处理，这个路线是经过广泛验证的；**不同路线方法在理解任务上的差别在于图像编码的方式**。对图像生成任务的实现方式，不同模型的差异主要体现在几个方面，**分别是是图像如何编码、如何生成图像编码、图像如何解码。**以下每个路线我们都会重点关注这些差异点。

##  纯自回归路线的统一模型

自回归即根据输入序列预测下一个 Token，并将预测的 Token 送回输入进行递归预测。纯自回归路线的统一模型可以看作是 LLM 的文本 Token 预测与 VQGAN\\[1\\] 这个工作中的图像 Token 预测的结合。典型的工作包括 LWM\\[2\\], Chameleon\\[3\\], Emu3\\[4\\], Janus\\[5\\] 和 Janus-Pro\\[6\\] 等。LWM 和 Chameleon 是相对较早的文本和图像统一训练的工作，Emu3 则是进一步扩展了视频生成的模态，Janus 和 Janus-Pro 则是将图像理解的编码独立开来。在这里我们以 Chameleon 和 Janus来分析这个路线的模型。

Chameleon 的模型架构如下图所示。对于图像理解任务，先使用 VQ-VAE 的 Encoder 作为 Image Tokenizer，将图像编码成离散的 Embedding，然后由自回归模型预测文本输出。对于图像生成任务，使用 VQ-VAE 的 Decoder 作为 Image De-Tokenizer，将自回归模型预测的离散图像 Token 解码成图像。

![截屏2025-07-31 11.04.43.png](https://raw.githubusercontent.com/modelscope/modelscope-classroom/main/Blogs/Articles/All2All-Survey/resources/409da4d8.png)

在这个架构基础上，Janus 团队则认为 VQ-VAE 的 Encoder 是通过重建任务训练得到，并不适合于语义空间的图像理解任务，因此，将图像理解任务的 Image-Tokenizer 修改为使用图文对预训练的 SigLIP。架构如下图所示：Und. Encoder（理解部分） 采用 SigLIP，Gen.Encoder（生成部分） 和 Image Decoder则采用 VQVAE。

![image.png](https://raw.githubusercontent.com/modelscope/modelscope-classroom/main/Blogs/Articles/All2All-Survey/resources/164d2b24.png)


简单来看，纯自回归路线的统一模型就是将 VQ-VAE 的离散图像 Token 也纳入 LLM 或 VLM的统一训练中去，它的优点是离散图像 Token 的预测任务与 LLM 的预训练范式高度吻合，也非常符合 AR 模型的特性。但从图像质量来看，这个路线的模型生成的图像质量不尽人意，一方面是由于图像编码空间的离散化带来的效果损失，另一方面则是由于自回归模型无法像扩散模型一样做分布建模。此外，由于无法引入随机噪声，生成图像的多样性差也是这一路线的一大挑战。
##  AR + Diffusion 串联结构的统一模型

 AR 和 Diffusion 分别是图像理解和生成领域的主流路线，因此可能是最简单有效的统一模型路线就是将 AR 和 Diffusion 串联起来，AR 模型完成理解任务，AR 模型的输入作为 Diffusion 的条件，完成生成任务，架构如下图所示（图源：统一模型综述 \\[7\\]）。

![截屏2025-08-22 15.25.01.png](https://raw.githubusercontent.com/modelscope/modelscope-classroom/main/Blogs/Articles/All2All-Survey/resources/244534b3.png)

对于理解任务，图像由语义编码器（一般是 CLIP、SigLIP 或者经过图文对齐训练的 ViT）编码成连续的 Embedding。对于生成（文生图）任务，则由模型处理文本输入后，输出一个中间 Embedding，作为 Diffusion 模型生成图像的条件。在这里，生成任务的图像编码就是 AR 和 Diffusion 模型的中间 Embedding，由 AR 模型直接产生。在这里，我们根据是否显式地监督中间 Embedding，将几个典型的工作分成两类。

### 2.1 使用语义 Embedding 监督的统一建模方法

顾名思义，这类方法是使用损失函数直接监督 AR 模型的输出图像 Embedding，使其有一个明确的 Embedding 输出目标，同时使用这些 Embedding 来训练 Diffusion 模型进行图像重建。典型的方法包括 MetaMorph\\[8\\], Nexus-Gen\\[9\\] 和 Blip-3o\\[10\\]。其典型架构如下图所示：

![截屏2025-08-22 15.53.03.png](https://raw.githubusercontent.com/modelscope/modelscope-classroom/main/Blogs/Articles/All2All-Survey/resources/de912c54.png)

如上图b所示，MetaMorph 和 Nexus-Gen 会使用 Image Loss（一般为 MSE 或者余弦相似度损失） 来使监督 AR 模型，使其学会预测目标图像的语义 Embedding。这样做的原因一方面是**想要从 Joint Training 的角度回答为什么要做统一模型**，在 MetaMorph 的实验中，图像理解和生成任务一起从零开始训练能互相促进彼此的效果。另一方面，Nexus-Gen 的 Unified Image Embedding Space 将理解和生成建模成了一个逆向任务，潜在的好处是可以直接对生成的 Embedding 做理解，从而有多轮推理的潜力。此外，在这一个子路线还存在一个问题，即监督自回归模型来预测连续的图像 Embedding 会导致严重的误差累计问题，MetaMorph 忽略了这一现象，而 Nexus-Gen 则采用了预填充自回归的策略来解决，这个策略本质上与其他工作 (Blip-3o, MetaQuery\\[11\\]) 的 Learnable Query 是一致的。

Blip-3o 也是类似 Embedding 监督训练思路，但他们额外使用 FlowMatching 来对语义 Embedding 做分布建模， 算是在这个架构中分析了自回归模型中无法做分布建模的问题。如下图所示：

![截屏2025-08-22 16.09.16.png](https://raw.githubusercontent.com/modelscope/modelscope-classroom/main/Blogs/Articles/All2All-Survey/resources/a40097db.png)

### 2.2 直接训练 Diffusion 模型的方法


这类方法一般将 AR 模型冻住，直接使用 AR 模型输出的 hidden states 作为Diffusion 模型的条件，只训练 Diffusion 做图像生成。换一个角度，可以把这个路线的方法看成 Diffusion 技术的演进，即将 Diffusion 模型常用的 T5 Text Encoder 换成了 一个更大的多模态生成式模型（例如Qwen2.5-VL-7B ）。典型的方法包括 Uniworld\\[12\\], MetaQuery (特殊说明，MetaQuery 使用的条件提取方式是 Learnable Query，不是 hidden states), Qwen-Image\\[13\\] 和 OmniGen2\\[14\\]。在图像生成任务上，其典型架构如下图所示（图源：Qwen-Image），文本 Prompt 输入 Qwen2.5-Vl，直接输出这些 Token 对应的 hidden states，作为后续 Diffusion Transformer 的文本条件。
![截屏2025-08-22 16.26.38.png](https://raw.githubusercontent.com/modelscope/modelscope-classroom/main/Blogs/Articles/All2All-Survey/resources/1067ae96.png)

除了图像生成外，统一模型一个潜力在于其图像编辑能力，因此，我们在这里额外分析一下这几个模型的图像编辑架构。相比于图像生成任务，使用 Diffusion 模型进行图像编辑时有一个额外的输入条件，即待编辑图像的编码信息。 待编辑图像可以使用两种编码，第一种是语义编码，编码器采用SigLIP等语义编码器。第二种是重建编码，编码器采用VAE。

1.  语义编码架构：以Uniworld为例，采用语义编码的架构如下图所示，着重关注SigLIP部分，如图所示，待编辑图像直接通过SigLIP 和 MLP 之后，作为一个条件输入到 DiT 中。Nexus-Gen也支持图像编辑，采用的条件注入架构也是这种语义编码特征。从 Nexus-Gen 在图像编辑上的实验经验来看，语义特征编码相比于 VAE 编码，编码空间更接近VLM 的输出语义空间，仅需要少量数据训练就可以建立起文本条件和图像条件之间的关系，潜在的优势是更好的指令遵循能力。 这种编码架构的劣势在于，语义编码存在信息损失，重建效果和编码 Token 数量强相关，往往不能做到一对一重建。从图像编辑的重建效果来看，GPT4o-Image 很可能也是采用语义编码。
    

![截屏2025-08-22 16.37.21.png](https://raw.githubusercontent.com/modelscope/modelscope-classroom/main/Blogs/Articles/All2All-Survey/resources/f697f06f.png)

2.  VAE 编码架构：Qwen-Image 和 OmniGen2 采用的是这种架构，目光放远，早些时候开源的 Step1X-Edit 与 Flux-Kontext 都是一模一样的架构。再把目光放远，这种架构和 In-Context LoRA 与 OmniControl 的思路是一致的。以Qwen-Image 为例，架构如下图所示。重点关注 Input Image, 它经过 VAE Encoder 后，作为条件输入 DiT中。在这个架构中，一般会使用位置编码来区分输入图像和去噪图像，像 Qwen-Image\\[15\\] 和 Flux-Kontext\\[16\\] 都是直接在位置编码的第一维（帧id）做区分。
    

![截屏2025-08-22 16.54.17.png](https://raw.githubusercontent.com/modelscope/modelscope-classroom/main/Blogs/Articles/All2All-Survey/resources/fe100074.png)

## AR + Diffusion 并联结构

以上的串联结构是利用 Embedding 作为 AR 和 Diffusion 的桥梁，而这里的串联结构，则是将 Attention 作为 AR 模型和 Diffusion 模型的桥梁。典型的工作包括 LlamaFusion\\[17\\] 和 Bagel\\[18\\]。采用 Bagel 中的定义，可以将这个架构叫做 Mixture-of-Transformer-Experts (MoT)。

### 3.1 LlamaFusion 冻结文本模型


LlamaFusion 的架构如下图所示。给定一个语言模型，如下左图，作者将其参数复制一份，作为右图的图像生成专用参数。对于一个包含文本和噪声图像的序列，文本 Token 使用左图的参数计算，而图像 Token 使用右图的参数训练，但是在 Attention 的计算阶段，所有 Token 拼接到一起做 Self-Attention。由于语言模型冻住，这个架构并不能改变模型的理解能力，所以不涉及图像理解任务中的编码问题。而图像生成使用的编码和解码都是 VAE，尽管模型采用的是语言模型结构，但实际是使用 Diffusion 的路线进行图像生成。
![截屏2025-08-22 17.16.34.png](https://raw.githubusercontent.com/modelscope/modelscope-classroom/main/Blogs/Articles/All2All-Survey/resources/b0aebf44.png)

### 3.2 Bagel 图文混合训练

Bagel 采用和 LlamaFusion 相似的架构，不同的是，模型的图像理解和生成能力全部都是重头开始训练的。_模型的图像理解采用的编码器是_ SigLIP 这类语义编码的模型，而图像生成采用的编码器和解码器是 VAE 这样的重建模型。理解任务使用 AR 的方式自回归地生成文本 Token，而生成任务则采用 Diffusion 的方式生成图像的 VAE 特征。

![截屏2025-08-22 17.03.53.png](https://raw.githubusercontent.com/modelscope/modelscope-classroom/main/Blogs/Articles/All2All-Survey/resources/2def5fb3.png)

严格来讲， Bagel 算是第一个进行了超大规模预训练的统一模型，其独特之处真正做了基模级别的混合模态数据的训练（上一个还是Chameleon），并且论文中也提到了这样 setting 下的 emerging capabilities。

## 单一模型同时做 AR + Diffusion

与前几中路线的 AR + Diffusion 路线不同，这里指的 AR 和 Diffusion 其实是指损失函数的定义。这一路线的思路是仅使用一个Transformer模型来做序列建模和分布建模，在同一个序列中，文本 Token 使用 AR 的 NTP loss来做序列建模，而图像 Token 则使用 Diffusion 的损失函数来学习图像分布。典型的方法包括 Transfusion\\[19\\], Show-O\\[20\\], Show-O2\\[21\\]。

以 Transfuion 为例，其架构图如下所示。模型使用了一个 7B 的 Transformer 模型来做统一的序列和分布建模，对于文本 Token 做序列建模，对于图像 Token 做分布建模。图像理解和生成任务使用的图像编码都是 VAE 特征。Show-O 与 Show-O2 采用了类似的架构，只是它们做 Diffusion 时只有一个轻量的 Flow Head 做图像去噪，这里就不额外分析了。

![截屏2025-08-22 17.56.14.png](https://raw.githubusercontent.com/modelscope/modelscope-classroom/main/Blogs/Articles/All2All-Survey/resources/75f56643.png)

## 总结

总结以上几个路线的工作，目前可以得到的一些结论如下：

1.  对于图像理解任务，图像 tokenizer 适合类语义编码器，如SigLIP。对于图像生成任务，VAE的细节重建效果更好。
    
2.  图像生成的过程中至少有一个环节做图像分布建模，才能保证更好的图像生成质量。
    

从这两点结论来看，仅使用 AR 的路线，对统一模型是不够的，也是因此，既 Janus-Pro 之后，没有太多延完全相同架构的模型开源。后续类似的最新工作，比如 Show-O2, X-Omni\\[22\\] 或者 NextStep\\[23\\] 都至少采用了轻量级 Flow Head 或者比较大的 Diffusion Transformer 来做图像生成。


对于另外几个技术路线的统一模型，目前来看 AR + Diffusion 串联路线是最稳妥也是比较容易出效果的路线。**实际上，训练数据才是模型效果的核心，Data is all you need，真正能被广泛认可和广泛使用的模型都是在架构上没有明显问题，同时训练数据准备充分的模型。**在训练数据不同的情况下，通过模型在 Benchmark 上的指标来反映模型在架构上的优劣势不现实的，况且对于图像生成来说，图像生成效果与现有的评测指标也有 Bias。因此，目前可能没有明确的结论能证明某种架构就是比其他架构好。
但目前的统一模型还需要回答一个核心的问题，任务间互相促进的潜力是否真正存在，理解和生成是否能力互相促进，统一做理解和生成是否能做到1+1>2的效果。如果不谈这些问题，只是为了做统一模型去做统一模型，就很难真正训练出有用的模型，一个比较有反思意义的例子就是很多工作都在用了 Qwen2.5-Vl-7B 作为图像理解基模，也都将基模冻住了，但是在评测图像理解能力的时候出现了很多个不同的评测数值。1+1 能否大于 2 的问题需要一些真正经过大规模训练的工作来验证，比如 Bagel 验证了图文交错数据大规模预训练的有效性，Qwen-Image 的发布也证明了更好的文本编码，能带给生成和编辑的增益是很大的，这是一个很好的开始。

尽管存在上面说的问题，统一模型方向仍然是学术界和工业界都会紧跟的方向，其通用统一的叙事也很符合大家对 AGI 的畅想，况且统一给生成效果带来的增益已经被 Qwen-Image 等前沿基模给证明了。所以，让我们继续紧跟统一模型的发展，见证理解和生成的进化吧！

参考文献：

\\[1\\] Taming Transformers for High-Resolution Image Synthesis

\\[2\\] World Model on Million-Length Video And Language With Blockwise RingAttention

\\[3\\] Chameleon: Mixed-Modal Early-Fusion Foundation Models

\\[4\\] Emu3: Next-Token Prediction is All You Need

\\[5\\] Janus: Decoupling Visual Encoding for Unified Multimodal Understanding and Generation

\\[6\\] Janus-Pro: Unified Multimodal Understanding and Generation with Data and Model Scaling

\\[7\\] Unified Multimodal Understanding and Generation Models: Advances, Challenges, and Opportunities

\\[8\\] MetaMorph: Multimodal Understanding and Generation via Instruction Tuning

\\[9\\] Nexus-Gen: Unified Image Understanding, Generation, and Editing via Prefilled Autoregression in Shared Embedding Space

\\[10\\] BLIP3-o: A Family of Fully Open Unified Multimodal Models—Architecture, Training and Dataset

\\[11\\] Transfer between Modalities with MetaQueries

\\[12\\] UniWorld-V1: High-Resolution Semantic Encoders for Unified Visual Understanding and Generation

\\[13\\] Qwen-Image Technical Report

\\[14\\] OmniGen2: Exploration to Advanced Multimodal Generation

\\[15\\] Step1X-Edit: A Practical Framework for General Image Editing

\\[16\\] FLUX.1 Kontext: Flow Matching for In-Context Image Generation and Editing in Latent Space


\\[17\\] LlamaFusion: Adapting Pretrained Language Models for Multimodal Generation
\\[18\\] Emerging Properties in Unified Multimodal Pretraining

\\[19\\] Transfusion: Predict the Next Token and Diffuse Images with One Multi-Modal Model

\\[20\\] Show-o: One Single Transformer to Unify Multimodal Understanding and Generation

\\[21\\] Show-o2: Improved Native Unified Multimodal Models

\\[22\\] X-Omni: Reinforcement Learning Makes Discrete Autoregressive Image Generative Models Great Again

\\[23\\] NextStep-1: Toward Autoregressive Image Generation with Continuous Tokens at Scale
`
    },
    {
      id: "blog-articles-deep-research-survey",
      title: "万字长文深度解析最新Deep Research技术：前沿架构、核心技术与未来展望",
      file: "Blogs/Articles/Deep-Research-Survey/report.md",
      difficulty: "高级",
      duration: "1.5h",
      week: 0,
      phase: 0,
      keywords: ["Deep Research", "Agent", "前沿架构", "深度研究", "AI Search"],
      content: `# 万字长文深度解析最新Deep Research技术：前沿架构、核心技术与未来展望

## 一.引言

### 近期发生了什么

自 2025 年 2 月 OpenAI 正式发布**Deep Research**以来，深度研究/深度搜索（Deep Research / Deep Search）正在成为信息检索与知识工作的全新范式：系统以多步推理驱动大规模联网检索、跨源证据归并与结构化写作，并产出带引用的研究级结果。2 月底该功能向 Plus 用户开放；4 月又推出“轻量版”，覆盖 Plus/Team/Pro，进一步降低使用门槛。

与此同时，Google 在 I/O 2025 将 AI Mode 从实验推进到正式能力，并把“Deep Search”引入其中：面向复杂问题给出可追溯来源的综合报告，还叠加“代理式（agentic）”操作能力，如代为搜索并引导预订餐厅等；7 月起更与 Gemini 2.5 系列深度结合并逐步向付费层放开。整体上，以 OpenAI 与 Google 为代表的主要玩家，已将“能自主检索与综合、并能执行后续事务”的 Deep Research Agent 推向主流，从而重塑 2025 年的搜索标准，同期也诞生了大量的初创团队或者开发者贡献的开源项目与论文。

当然，新范式也带来方法论与工程化的新要求：如何保证引用与事实核验的可追溯性、在跨源冲突下进行证据选择，以及在长链路推理中平衡成本与时延。这些问题将决定 Deep Research Agent 在真实业务里的可靠性与可用性。

### 本文将回答什么

**问题1：**Deep Research / Deep Search 的定义和能力边界是什么？

**问题2：**Deep Research 的核心技术架构是什么？经历了什么样的快速迭代？

**问题3：**主流方法的架构与设计有什么特点与共性？我们可以得到什么样的 Insight？

注意，本文并不是一篇完整的综述，可能不会涵盖各个方面的工作，也无法对所有方向都提出深入的见解，只是以一个智能体框架开发者的视角梳理部分可能有复用价值的结论，也欢迎大家关注ModelScope近期将持续更新的agent框架[Ms-Agent: Lightweight Framework for Empowering Agents with Autonomous Exploration in Complex Task Scenarios](https://github.com/modelscope/ms-agent)。

## 二.什么是Deep Research Agent？

### 核心定义

**版本1：**一种 LLM 为核心构建的应用系统，试图解决研究（广义）任务的自动化与能力增强问题

**版本2：**“AI agents powered by LLMs, integrating dynamic reasoning, adaptive planning, multi-iteration external data retrieval and tool use, and comprehensive analytical report generation for informational research tasks.”

### 核心能力

**Intelligent Knowledge Discovery：**对于不同的数据源可以进行自主的文献调研、假设生成、研究模式识别；

**End-to-End Workflow Automation：**基于一个 AI 驱动的 pipeline 端到端完成-方案（实验或者调研）设计、数据收集/分析以及结果报告产出；

**Collaborative Intelligence Enhancement：**提供友好的接口促进人机协作，包括以自然语言为主的交互方式、可视化、动态的知识表征等等。

### 定义边界

**与通用模型/Agents的区别：**自动化的 workflow、**专用的研究工具**、端到端的研究规划与编排能力；

**与单功能科研工具的区别：**例如引用管理器、文献搜索引擎、数据分析工具都是孤立组件，而 DR 可以把模型的推理能力和单一工具的能力结合起来，通过编排和规划解决问题；

**与单纯的LLM应用相比：**相比早期单纯为语言模型提供研究导向的 prompt，具备了环境交互、工具集成和工作流自动化的能力。

### 需求分布

![image.png](https://raw.githubusercontent.com/modelscope/modelscope-classroom/main/Blogs/Articles/Deep-Research-Survey/resources/f44301e4.png)


![image.png](https://raw.githubusercontent.com/modelscope/modelscope-classroom/main/Blogs/Articles/Deep-Research-Survey/resources/d4502859.png)
## 三.Deep Research Agent核心技术架构

### 架构&工作流

随着模型能力的不断发展，智能体架构与工作流的设计也在不断发展，按照对LLM本身自主规划、动态调整能力的依赖情况，大体可以将主流的架构分为静态工作流（static workflow）和动态工作流（dynamic workflow）两类。

#### 静态工作流

静态工作流主要依赖于人为定义的任务pipeline，例如将一个调研任务分解为需求处理、信息检索、内容解析、总结输出四个阶段，并且预定义好每个阶段将会调用的工具组件和需要执行的子流程（例如条件判断、循环优化等），随后使用智能体在每个阶段承担一部分或者全部的流程，得到最终需要输出的结果。

静态工作流的优势在于结构清晰且易于实现，由于每个阶段任务的覆盖面不大，开发者更容易设计良好的容错机制，避免模型能力的不稳定导致整个工作链路崩溃，在对于任务交付稳定性要求高、难度不大、链路较长的场景下有一定的优势；其劣势在于泛化能力较为有限，固定的处理步骤导致了工作流无法有效的迁移到不同的任务场景，例如面对如金融、计算机等不同领域的工作时，很可能需要分别定制不同的pipeline。

![image.png](https://raw.githubusercontent.com/modelscope/modelscope-classroom/main/Blogs/Articles/Deep-Research-Survey/resources/bc13d8c6.png)

#### 动态工作流

动态工作流支持动态的任务规划，允许智能体根据任务执行过程中收到的反馈和变化的上下文调整未来的任务执行步骤，完全由模型自主完成任务规划、执行、反思、调整的闭环链路，并交付最终结果。

动态工作流的优势在于很好的解决了静态工作流在灵活性和泛化能力上的问题，在复杂任务上具备更强的处理能力；其劣势则在于对LLM能力的较高要求所带来的不稳定性，由于整个任务都由模型自主规划、自主执行，开发者将更难设计合理的容错机制预防任务的崩溃，排查错误的难度也会有所提升。

事实上，在工程实践中，静态的pipeline和动态的自主规划也并非完全互斥，在智能体框架里良好地协调由智能体自主完成任务和人为定义好流程的部分，可以有效地平衡框架的稳定性和灵活性。

更进一步地，动态工作流可以细分为单智能体（single-agent）架构与多智能体（multi-agent）架构。

![image.png](https://raw.githubusercontent.com/modelscope/modelscope-classroom/main/Blogs/Articles/Deep-Research-Survey/resources/78ae17bc.png)

##### 单智能体架构

单智能体架构通过单一智能体的规划、执行、反思循环来完成任务，通常依赖于模型自身强大的推理能力与较长的上下文窗口。在接收到任务需求之后，模型会自主决定任务所有的步骤，并根据当前的上下文优化任务规划、调用适合的工具并接收反馈。

单智能体架构的优势一方面在于其对上下文历史的完整记忆，不存在信息不透明和协调上的困难，另一方面则在于其支持端到端的强化学习，从而使得推理、规划与工具调用的过程可以得到优化；其劣势在于这种范式对基础模型能力提出了更高的要求，包括需要足够长的上下文窗口、好的上下文理解/推理能力、稳定的工具调用能力等等，此外，如果想要针对性的优化某个环节或者模块，对于这种偏向于端到端的黑盒架构来说也更为困难。

典型的工作例如Agent-R1、ReSearch和Search-R1等，都基于类似ReAct框架的推理、执行、反思循环来执行任务。

##### 多智能体架构

多智能体架构通过多个专用智能体来实现任务的灵活分配，将完成任务的各环节更粒度的分配给不同的智能体，模拟人类的团队协作过程。例如，该架构通常由一个规划者智能体进行任务的理解、拆分与分配，随后由多个子任务智能体（比如代码、搜索、分析等等）接管子任务的执行过程，最后由特定的智能体交付指定形式的结果。


多智能体架构的优势在于其良好的可扩展性和灵活性，在处理复杂任务时，可以根据任务拆解情况选择不同的执行流程，通过顺序执行或者并发执行的配合获得更丰富的任务编排方式，在资源充足的前提下，多个子智能体的并行也可以提高任务完成的效率；其劣势一方面在于多agent之间协调机制的设计困难，例如由于多个agent无法同时共享所有上下文，设计合理的上下文/记忆管理机制对多agent的协作过程来说较为重要，另一方面则在于端到端训练优化的困难。
典型的工作例如OpenManus、deerflow等，都采用了分层的规划者-子任务执行者的架构。

### 工具使用

无论是之前的tool call还是近期兴起的mcp，开发者们一直试图让模型通过与人类相似的工具调用过程来处理复杂的现实任务，下面介绍部分常用工具，包括搜索、代码解释器、多模态处理等。

#### 网络搜索

对于deep research任务而言，搜索质量几乎直接决定了生成报告的质量和成本，如何用最低的成本召回最相关、高质量的信息是需要关注的核心问题。模型集成搜索的方式主要有搜索API和浏览器模拟两种。

##### 基于搜索API

通过向搜索引擎（Google、bing、Tavily等）或者科学数据库提供的检索API发送请求，直接获取结构化的返回数据用于后续处理，通常包含与搜索请求关联的网站url和概要等，并需要按照调用次数支付一定的费用。获取搜索结果后，需要进一步筛选url、请求特定url的网页内容，部分常见方案总结如下：

| **工作** | **API方案** | **特点** |
| --- | --- | --- |
| Gemini DR | 多来源汇总：Google Search API、arXiv API等 | 1.  来源多、范围广、多轮召回（目测单次检索总来源数大于 50） |
| Grok DeepSearch | 通过News-Outlet Feeds、Wikipedia API和X的原生接口持续更新和维护内部的 knowledge index，需要时让 LLM Agent 分解出子 queries 进行index和页面抓取 | 1.  混合索引系统：传统的关键词查找+基于向量的语义索引<br>    <br>2.  需要实时更新 index<br>    <br>3.  并非实时检索互联网信息而是依赖预处理的index<br>    <br>4.  召回范围不太大（个人观察） |
| AgentLaboratory | arXiv API 提取 paper metadata | 1.  来源少、稳定、解析方便 |
| AI Scientist | Semantic Scholar API | 1.  可以解析模型生成的 idea 的新颖性和引用关系 |
| CoSearchAgent | SerpApi | 1.  本质上就是Google、Bing 之类的引擎，是实时的引擎检索<br>    <br>2.  基于 slack 平台 |
| DeepRetrieval | PubMed 和 ClinicalTrials.gov APIs | 1.  基于特定的接口和强化学习框架，专门优化基于 API 的 query，提高生物医学任务的召回 |
| Search-o1 | Bing Search API  + Jina Reader API | 1.  直接完成解析返回推理可用内容<br>    <br>2.  但是依赖于 jina reader 的解析能力，并非完全透明 |

主要缺点：受限于API提供的功能和返回的数据形态，无法灵活的完成表单填写、网页操作，无法获取需要动态加载的内容。

##### 基于浏览器模拟

在本地或者沙箱环境运行的浏览器中直接模拟人类操作，模拟点击、滚动、填写表单、执行JS等操作，实时提取网页内容。下图为ChatGPT agent模式下使用沙箱浏览器进行检索的示意图。

![image.png](https://raw.githubusercontent.com/modelscope/modelscope-classroom/main/Blogs/Articles/Deep-Research-Survey/resources/5e3918d8.png)![image.png](https://raw.githubusercontent.com/modelscope/modelscope-classroom/main/Blogs/Articles/Deep-Research-Survey/resources/0f21a71a.png)

主要缺点：资源消耗较大、延迟较高，解析动态的、种类繁多的网页内容容易遇到瓶颈。

#### 代码解释器（数据分析）


通常在沙箱环境中执行Python代码，为智能体提供数据处理、算法验证和模型仿真能力，可以执行的任务包括：自动计算均值、方差、中位数等；创建图表、热力图等；从文本或表格中提取指标并进行比较。
*   CoSearchAgent：集成SQL查询能力，对数据库进行聚合分析并生成报告。
    
*   ﻿AutoGLM：能从网页的表格中直接提取结构化数据并进行分析。
    

#### 多模态处理与生成

支持对图像、音频、视频的处理，例如完成语音转写、视频概括、图像标注等任务配合后续任务需要，同时可以基于TTS技术、文生图/视频等方式实现多种模态的输出，也可以利用mermaid语法等方式绘制各种常见的流程图和表格。

这一功能目前只有少数成熟的商业或开源项目支持，如Manus、OWL、OpenAI Deep Resesarch、Gemini Deep Research、Grok DeepSearch 等，但其中大部分仍无法支持端到端地生成多模态报告。Ms-Agent项目中的Agentic Insight和Doc Research项目是开源社区中少有的具备端到端图文报告生成能力的工作，其实现主要基于以图表为核心节点的层次化信息抽取策略，可以较好地关联图表与上下文、低成本且高效的产出高质量的图文报告。

### 优化方法

#### 提示词工程

成本最低、迁移速度最快的方法，但受限于LLM自身的泛化能力，在复杂的、变动较大的任务设置中鲁棒性有限，适合快速原型，难以系统性优化复杂工作流，需要反复调试。

*   常见的方法例如ReAct（reasoning & acting）、CoT（chain of thought）、 ToT（tree-of-thought）等
    

#### 监督微调

通过构建高质量的专用微调数据，可以针对性的优化智能体在deep research特定环节上的表现，例如优化搜索查询改写、工具调用和结构化报告生成相关的能力。

*   Open‑RAG：在数据构建中加入检索标记、相关性标记、grounding标记和工具标记等不同的监督信号，通过对抗训练提升过滤无关信息的能力。
    
*   AUTO‑RAG**：**构建基于推理的指令数据集，让模型能在生成过程中自主规划检索查询并执行多轮交互。
    
*   DeepRAG：采用二叉树形式的搜索机制，递归式地生成子查询并构建多轮检索轨迹，在平衡内部和外部知识的同时提高检索效率。
    
*   使用基于拒绝采样的微调方式减少对SFT数据的依赖，如CoRAG、Start和ATLAS，通过从现有问答数据中提取检索链、监控生成过程中的工具调用信息等方式，促使模型学习自主调用工具。
    

#### 强化学习

通过与环境的真实交互和获得的奖励信号优化智能体的信息检索、动态工具调用和复杂推理能力。

*   Agent‑R1：代表一种端到端 RL 训练的综合框架，支持 API、搜索引擎和数据库等多种工具的调用，实现自动化多步任务执行和计划优化。
    
*   WebThinker：引入网络资源检索器模块进行多跳网络搜索，使用迭代式在线偏好优化（Iterative Online DPO）来实现检索、导航、报告撰写的无缝交错。
    
*   Pangu DeepDiver：采用两阶段 SFT+RL 课程训练，通过搜索强度调节机制在开放网络环境中自适应调节搜索深度。
    

在奖励模型（reward model）的选择上，大多数开源实现使用基于规则的奖励模型，显示的定义特定于任务的目标，如检索相关性、信息准确率和工具调用成功率；也有部分工作使用例如PPO、GRPO等策略优化方法。

#### 非参数持续学习

通过持续交互优化外部记忆库、工作流和工具配置优化智能体能力。

*   CBR（Case‑Based Reasoning）：智能体从外部案例库检索、适配和重用已有的结构化问题求解轨迹。例如 DS‑Agent 在自动化数据科学中引入 CBR，从构建的案例库中进行近似在线检索；AgentRxiv 模拟了一个可更新的 arXiv 式平台作为全面的case bank，允许研究智能体共享并复用先前的研究报告。由于无需调整模型参数，CBR 特别适合在数据稀缺或计算资源受限的场景中实现agent能力的持续提升。
    

## 四.主流闭/开源工作分析

### 闭源工作


| **DR Agent** | **Base Model** | **Agent架构** | **SFT** | **RL** | **Key Feature** | **生成时间** |
| --- | --- | --- | --- | --- | --- | --- |
| #### OpenAI Deep Research | GPT-O3 | Single-Agent | not present | detail unknown | 1.  Intent-to-Planning：提出关于问题的一些追问向用户理清细节，随后进行规划。<br>    <br>2.  迭代式的 workflow 优化：在搜索中进一步明晰要求与进一步搜索，逐步深入、进行交叉对比等等。<br>    <br>3.  上下文记忆能力强&支持多模态理解：输入与检索支持多模态理解，文本模态输出。<br>    <br>4.  工具链集成全面：网页搜索、内置的编程工具（一般性的文献调研任务少用）。 | 5～30min |
| #### Gemini Deep Research | Gemini‑2.0‑Flash | Single-Agent | detail unknown | detail unknown | 1.  Unified Intent-Planning：根据调研要求生成一个 plan，随后要求用户确认是否进行 plan 的修改，如果修改的话会进行一轮新的对话；事实上这一步也可以要求对概念之类的东西进行 clarify，然后生成新的 plan。<br>    <br>2.  异步任务管理：采用异步任务管理架构处理多个同时任务。<br>    <br>3.  长上下文窗口 RAG 支持：支持多模态输入，文本模态输出。<br>    <br>4.  高速自适应检索：实现了快速、多轮、信息量更大的网页检索。 | 5～10min |
| #### Perplexity Deep Research | \\ | \\ | \\ | \\ | 1.  Planning-only：根据 query 直接生成计划随后执行。<br>    <br>2.  迭代式信息检索：没有非常细粒度的拆解任务，快速开始进行对多个子主题的多轮搜索，每轮召回来源数量较大（19、20），进行递进式的检索。<br>    <br>3.  动态模型（workflow）选择：基于需求+上下文自动选择合理的架构（模型➕workflow）；也可以预先手动指定特定的搜索源（全网、学术...）和所有类别（学术、金融、生活）。<br>    <br>4.  多模态集成：使用 python 支持图表的生成，包括路线图、csv 等等。 | 2～4min |
| #### Grok DeepSearch | Grok 3 | Single-Agent | not present | detail unknown | 1.  Planning-only：根据 query 直接生成计划随后执行，模型的thinking 过程会去自己明晰实际的概念再逐步递进。<br>    <br>2.  分块式的处理流程： 1.单轮检索（似乎 deepsee arch 模式都是 10 个网页召回）；2.基于**内容框架**逐步进行内容的分析；3.最后整合为一个报告。<br>    <br>3.  动态资源分配（**未验证**）：在轻量检索和密集检索自适应切换，集成安全沙盒环境来进行计算验证。<br>    <br>4.  多模态集成：多模态输入、文本模态输出。 | 5min左右 |
| #### Qwen Deep Research | Qwen3-235B-A22B | Single-Agent | \\ | \\ | 1.  Intent-to-Planning：提出关于问题的一些追问向用户理清细节，随后进行规划。<br>    <br>2.  并发式的任务编排：并行的检索验证分析。<br>    <br>3.  **未集成**多模态：单模态输入、单模态输出。 | 10～20分钟 |
### 开源工作

#### A.deep research

##### 工作来源

*   **作者**：David Zhang Co-founder & CEO @ Aomni (aomni.com)
    
*   **github**：[https://github.com/dzhng/deep-research](https://github.com/dzhng/deep-research) **star 17.6k**
    

##### 主要架构

**1）基础配置**

*   **搜索引擎**：Firecrawl API (for web search and content extraction)
    

*   **模型**：OpenAI API (for o3 mini model)    

**2）架构分类**

*   static workflow
    

**3）工作流程**

![image.png](https://raw.githubusercontent.com/modelscope/modelscope-classroom/main/Blogs/Articles/Deep-Research-Survey/resources/79f19288.png)

*   **query与参数输入**：
    
    *   要求输入 query、depth（循环次数）、breadth（单轮搜索 query数目）以及isReport（报告还是简单回答）。
        
*   **human-in-the-loop**（report模式）：
    
    *   调用模型生成问题询问用户用于澄清研究问题，设置问题数量上限；
        
    *   组合初始 query、follow-up question 和用户回答为输入 query。
        
*   **Deep Research 递归**
    
    *   搜索 query 生成：输入前述 query、已有的研究 learnings要求模型生成 **serp 搜索 query** 和对应的**研究目标**，要求确保多样性和具体、并随着研究深入递进；
        
    *   并发检索与解析：使用firecrawl搜索并抓取内容，输入模型要求总结 learnings 和follow up questions；
        
    *   管理 depth 与 breadth 状态：depth = depth - 1；breadth = breadth / 2；
        
    *   生成新的输入 query：组合历史的研究目标和生成的follow up questions；
        
    *   判断depth条件：（1）大于0 则递归调用Deep Research；（2）等于 0 则递归返回所有 learnings 信息和 url 访问历史；（3）出现错误时丢弃该节点，前序节点的 learnings 信息由同层的其他节点返回。
        
*   **后处理**
    
    *   去重合并：搜索树形成后，保留所有 learnings 和 url 访问历史并且去重。
        
*   **结果生成**
    
    *   调用模型生成报告或者直接回复：输入 learnings、human-in-the-loop 环节得到的组合query、系统提示词、历史 urls（直接回复模式不用，主要用于报告生成引用）。
        

##### 核心特性

*   **迭代搜索**：根据自定义深度和宽度递归构建搜索树，不断基于历史learning迭代生成搜索 query、抓取新内容；
    
*   **query生成**：使用智能体根据研究目标和先前learning生成有针对性的搜索query；
    
*   **深度/广度控制**：显式的暴露搜索树参数，用户决定如何 trade-off；
    
*   **并发处理**：并行处理多个搜索和结果处理（但这会受到 API 调用的影响，非付费用户可能不允许太高的并发量）。
    

##### 小结

*   **使用 LLM 总结提炼 learnings**：在不过度考虑预算和可能引入的幻觉（假设模型能力满足要求）的情况下，对于大量的搜索独立进行总结可能能减少最终生成报告的上下文压力，也可以在提升信息的覆盖度的同时交付比较干净的上下文给报告生成环节，带来生成环节的效果提升。
    
*   **构建搜索树**：扩展简单的线性或循环式的搜索pipeline的方法可以参考递归的构建搜索树，过程中采用同样的历史信息和研究目标自动生成搜索 query。好处在于树状的搜索历史比循环优化或线性的搜索历史感觉有更好的多样性，避免部分场景无法召回理想的来源；但劣势是大量增长的搜索内容可能导致上下文爆炸，就必须跟 LLM 总结提炼 learnings 相配合了。
    
*   **暴露控制选项**：暴露成本和时间控制的选项给用户进行trade-off，避免在token消耗、运行效率和结果质量之间平衡困难。
    
*   **代码实现**：作者提供了非常轻量简洁的实现，支持 api 和命令行调用。
    

#### B.DeerFlow

##### 工作来源

*   **作者：**字节 deerflow 团队
    

*   **github：**[https://github.com/bytedance/deer-flow](https://github.com/bytedance/deer-flow) **star 16.7k**    

##### 主要架构

**1）基础配置**

*   搜索引擎：Tavily (default)、DuckDuckGo、Brave Search、Arxiv
    
*   个人知识库：RAGFlow、vikingdb
    
*   模型：OpenAI-compatible API interface、open source models like Qwen、litellm可集成模型
    

**2）架构分类**

*   Multi-Agent
    

**3）工作流程**

![image.png](https://raw.githubusercontent.com/modelscope/modelscope-classroom/main/Blogs/Articles/Deep-Research-Survey/resources/89cc2348.png)

*   **coordinater判断**：
    
    *   接收用户问题进行回复和工具调用
        
        *   simple greeting or small talk：正确回复；
            
        *   security/moral risk：礼貌拒绝；
            
        *   需要更多信息：正确询问；
            
        *   其他情况：（1）调用handoff\\_to\\_planner，生成 research\\_topic 和 locale，不做任何进一步思考；（2）如果设置了enable\\_background\\_investigation，那么转向 hands off 给background\\_investigator。
            
*   **background\\_investigator搜索**
    
    *   搜索：使用coordinater传递的 research topic 作为 query 直接进行搜索；
        
    *   转移：搜索完成后hands off 给 planner。
        
*   **planner确定研究计划**
    
    *   背景信息获取：如果存在background\\_investigation 则从 state 中添加到上下文后输入planner；
        
    *   检查循环边界：检查 plan 次数是否大于最大次数，否则 hands off 给 reporter；
        
    *   计划生成：基于上下文输出 json 形式的计划，如果生成正确 json 失败则根据是否有过上下文信息决定 hands off 给 reporter 或者 \\_\\_end\\_\\_节点；
        
    *   计划检查：（1）如果上下文已经足够满足回答要求，hands off 给 reporter；（2）**否则 hands off 给human feedback**（正常执行流程中强制的，planner 并不直接通往 researcher）。
        
*   **human feedback修改计划**
    
    *   拒绝计划：传递用户反馈返回 planner 重新进行计划生成，如果正常生成则一定返回human feedback；
        
    *   接收计划：检查state 中 plan 的 json 是否可以正常加载，失败则根据是否有过上下文信息决定 hands off 给 reporter 或者 \\_\\_end\\_\\_；正常加载则 hands off 给 research team。
        
*   **Research Team执行计划**
    
    *   如果研究计划的解析出现问题，返回 planner；
        
    *   根据研究计划的 step 信息依次调用researcher 和 coder进行资料收集或者代码执行，两者均为 react 风格的agent；每次 reseacher 或者 coder 执行结束返回 research team，再按照计划决定下次调用两者的某一个：（1）researcher：网络搜索、本地数据库搜索；（2）coder：可以执行python 工具。
        

    *   完成计划后 hands off 回到 planner的运行逻辑（上方）：（1）若 Planner 认为研究已完成，会 handoff 给 Reporter；（2）否则会继续规划（Re-plan）并 handoff 回 Research Team 进行下一轮研究迭代，直到最终完成。        
*   **Reporter输出报告**
    
    *   获取plan、observation（researcher 和 coder）等上下文信息，生成报告（支持**多模态**）。
        

##### 核心特性

*   **human-in-the-loop**：支持计划修改（类似gemini deep research）。
    
*   **Report Post-Editing**：支持报告生成后继续修改。
    
*   **内容生成**：支持播客与 PPT 多种形式的结果输出。
    

##### 小结

*   **工具实现参考**
    
    *   **检索工具：**只做了简单的搜索引擎封装，调用依赖于模型能力生成输入参数（prompt）；
        
    *   **内容解析与多模态**：（1）依赖于 jina api 进行解析获取图文内容，reporter模型生成对图像的引用；（2）jina 可以获取图像 url、图像描述，模型解析这些内容而非直接理解图像。
        
*   **全局状态管理**：使用一个 state 记录每个节点所需和产出的核心上下文信息在所有 node 间传递；
    
*   **整体评价**：以模型能力为核心的多智能体实现，工具都是 tool 的形式传递给 react 形式的 agent 的，提供大量规范的 prompt 可参考。
    

#### C.sicra(mini-perplex)

**备注**

*   只有 extreme search 部分可能比较偏向于deep search，其他还是比较接近于对标 perplexity，不过extreme search 部分的生成篇幅目前也比较有限，和 perplexity 存在的问题相似。
    

##### 工作来源

*   **作者**：Zaid Mukaddam（独立开发者）
    
*   **github**：[https://github.com/zaidmukaddam/scira](https://github.com/zaidmukaddam/scira) **star 10.5k**
    

##### 主要架构

**1）基础配置**

*   搜索：exa、tavily、x、reddit
    
*   工具：[Google Maps](https://developers.google.com/maps)、[OpenWeather](https://openweathermap.org/) 、[Daytona](https://daytona.io/)、[TMDB](https://www.themoviedb.org/)、[Aviation Stack](https://aviationstack.com/) 
    
*   模型：xAI、Google、Anthropic、OpenAI、GRoq
    

**2）架构分类**

*   pipeline-based
    

**3）工作流程**（extreme mode）

*   **搜索模式分组**
    
    *   前端显式指定搜索模式和使用模型；
        
    *   进行用户信息校验、模型权限校验等等；
        
    *   按照搜索模式分配可用工具组和instruction，比如对应deep search的extreme模式使用extreme search工具、对应的sys prompt。
        
*   **模型流式调用**
    
    *   传入sys prompt、user query和工具（例如Extreme Search Tool，要求模型立刻调用搜索tool并且不修改用户信息）。
        
*   **Extreme Search Tool内部**
    
    *   **plan**：使用原始prompt+内置模型scira-x-fast进行breakdown。
        
        *   要求主题下需要研究的不同关键方面
            
        *   要求为每个方面生成具体、多样的搜索查询
            

    *   **research**：使用plan结果+内置模型scira-x-fast-mini+tools（code和search）进行**search-driven research。**        
        *   要求顺序运行query
            
        *   要求为目标topic进行一定次数范围的search
            
        *   要求丰富调研视角：broad overview → specific details → recent developments → expert opinions
            
        *   要求指定不同分类：news, research papers, company info, financial reports, github
            
        *   要求渐进式完善搜索
            
        *   要求多样性和交叉验证
            
    *   **search tool**：接收 search query 和 category（可能空）进行搜索；对url进行内容解析。
        
        *   搜索：exa + keyword
            
        *   解析：exa的get\\_content接口
            
    *   **coding tool**：接收code使用沙盒运行代码返回结果（可视化、数学计算、数据分析）。
        

##### 核心特性

*   多种搜索模式分配不同需求：Web（通用）、Memory、Analysis、Chat、X、Reddit、Academic、YouTube、**Extreme。**
    
*   为多种功能提供工具适配：Core Search & Information、Academic & Research、Entertainment & Media、Financial & Data Analysis、Location & Travel、Productivity & Utilities。
    

##### 小结

*   按照不同场景制定搜索模式（tool、prompt等等）：交由用户指定，进一步为场景匹配针对性的工具；不识图只用单一pipeline解决所有场景的需求。
    
*   框架依赖 prompt engineering 和简单的模型流式调用进行任务分层，不涉及react等框架：
    
    *   对不同环节和组件按照不同的原则选择模型，用户指定模型（工具调度、分析、报告产出）、工具内模型（plan、research等环节独立调用LLM，同样只用prompt、tool和普通生成）；
        
    *   deep search功能工具化，使用成本更低、特定能力不错的小模型执行具体过程并提供上下文，使用用户指定的能力较强的模型进行分析和调用。
        
*   搜索优化的逻辑可能无法单纯依赖于找到足够强大的搜素引擎：
    
    *   单纯的key word搜索也可以配合prompt实现不错的效果（diversity、category）；
        
    *   更多依赖于Agent能力（提示词、relection），单纯的api更换、搜索引擎更换可能不能带来确定性收益；
        
    *   场景明晰的问题可以依赖于专用引擎作补充：arxiv、x、reddit、semantic scholar等等。
        

#### D.open\\_deep\\_research

##### 工作来源

*   **作者**：langchain-ai
    
*   **github**：[https://github.com/langchain-ai/open\\_deep\\_research](https://github.com/langchain-ai/open_deep_research?tab=readme-ov-file#open-deep-research) **star 8.5k**
    

*   **博客**：[https://blog.langchain.com/open-deep-research](https://blog.langchain.com/open-deep-research/)、[https://rlancemartin.github.io/2025/07/30/bitter\\_lesson](https://rlancemartin.github.io/2025/07/30/bitter_lesson/)    

##### 主要架构

**1）基础配置**

*   搜索：Tavily(默认)、支持anthropic和openai的原生网络搜索、支持MCP
    
*   工具：支持大量的MCP工具兼容
    
*   模型：Summarization(openai:gpt-4.1-mini)、Research/Compression/Final Report Model(openai:gpt-4.1)
    

**2）架构分类**

*   Multi-Agent
    

**3）工作流程**

![image.png](https://raw.githubusercontent.com/modelscope/modelscope-classroom/main/Blogs/Articles/Deep-Research-Survey/resources/1cbe3654.png)

*   **研究范围->确认研究意图**
    
    *   用户意图澄清：要求模型询问用户获取额外的上下文来clarify（可以多轮、few-shot之类）。
        
    *   研究概要生成：生成一段涵盖研究问题、调研要求、调研思路、报告要求之类的重点概要，作为研究全程需要参考的概要。
        
    *   ![image.png](https://raw.githubusercontent.com/modelscope/modelscope-classroom/main/Blogs/Articles/Deep-Research-Survey/resources/72e200de.png)
        
*   **执行研究->获取上下文**
    
    *   Research Supervisor：接收研究概要、并拆分为多个独立的子主题，每个子主题分配给一个sub-agent（上下文隔离）进行并行信息收集。
        
    *   Research Sub-Agents：
        
        *   基于Supervisor分发的子主题、通过tool-caling循环（搜索工具or其他MCP工具）进行调研，不关注全局信息；
            
        *   完成调研后，基于收集的信息（网页、tool call信息）和当前要解决的主题问题进行信息总结、引用形成findings，返回Supervisor。
            
    *   Research Supervisor Iteration：基于Sub-Agents的findings和研究概要进行反思，确定是否需要进一步的信息收集，需要的话产生子主题并分发，直到任务完成。
        
    *   ![image.png](https://raw.githubusercontent.com/modelscope/modelscope-classroom/main/Blogs/Articles/Deep-Research-Survey/resources/0c5d2974.png)
        
*   **撰写报告->形成产出**
    
    *   基于前述过程所积累的findings和最初的研究概要，直接生成最终报告。
        
    *   ![image.png](https://raw.githubusercontent.com/modelscope/modelscope-classroom/main/Blogs/Articles/Deep-Research-Survey/resources/5ec2e8ab.png)
        

##### 核心特性

*   **完整的研究意图澄清：**在类似于OpenAI式的询问问题后主动做了一个不是breakdown计划的总结和reflction。
    

*   **更干净的上下文交付：**三个环节之间、agent之间靠处理后的内容进行交互，具体来说，确认研究意图环节向执行研究环节交付的是模型生成的研究概要，supervisor收到研究概要、生成子主题分发给sub-agent，sub-agent以回复子主题为目的总结检索到的信息将learning总结交付给supervisor，研究概要、所有learnings一起交付给负责报告生成的agent。    

##### 小结

*   **保持deep research工作流的动态特性：**对于不同难度和类型的问题，架构最好是可配置的或者可以自动扩展、动态调整的，比如模型自主调节并发的子topic数量、研究深度。
    
*   **tool-calling循环与workflow需要trade-off：**需要实验验证两者的比例和设计方式，从当前工作给出的结论来看，在sub-agent这一层级放开了模型自主进行tool calling，全局仍然保持了supervisor做规划、反思是可以更好兼顾稳定与灵活的，是一种静态workflow和LLM自主tool calling循环的合理trade-off。即在一个小而聚焦的任务上由子任务智能体完全接管，在全局层面人为定义流程。
    
    *   ![image.png](https://raw.githubusercontent.com/modelscope/modelscope-classroom/main/Blogs/Articles/Deep-Research-Survey/resources/00e69df5.png)
        
*   **multi-agent之间的信息不通、结果连贯性问题可以通过替换中间交付内容的办法来解决：**作者的博客里面提到，如果让每个sub-agent独立完整一个章节再尝试合并，会很难协调连贯性；但是如果让sub-agent只交付搜索、整理得到的信息，让最后的report生成agent来写文章，连贯性问题就会得到解决。
    
*   **上下文的合理设计可以降低对模型能力的过高要求、提高结果质量：**这个工作中用的sub-agent向supervisor提供learnings其实在前文David Zhang的deep research中也有类似操作，加上最近调试智能体在workflow中表现的实验观察，一个初步的结论是觉得干净的、易处理的上下文设计可以提升能力不够强的模型的表现，例如生成报告时避免交付逻辑混乱、结构混乱的上下文可以减少报告出错。
    

#### E.Open Deep Search

##### 工作来源

*   **作者：**Sentient团队（开源AI 平台）
    
*   **github：**[https://github.com/sentient-agi/OpenDeepSearch?tab=readme-ov-file](https://github.com/sentient-agi/OpenDeepSearch?tab=readme-ov-file) **star 3.5k**
    
*   **arxiv：**[https://arxiv.org/abs/2503.20201](https://arxiv.org/pdf/2503.20201)
    

##### 主要架构

**1）基础配置**

*   搜索引擎：serper.dev、SearXNG
    
*   reranking：Jina AI、infinity+Qwen2-7B-instruct（自己部署）
    
*   模型：OpenAI、Anthropic、Google（gemini）、OpenRouter、HuggingFace、FireWorks
    

**2）架构分类**

*   Multi-Agent
    

**3）工作流程**

![image.png](https://raw.githubusercontent.com/modelscope/modelscope-classroom/main/Blogs/Articles/Deep-Research-Survey/resources/42cc10f1.png)

*   **Open Search Tool流程**
    
    *   **查询改写**：
        
        *   基于原始的 query 生成 k个适合搜索的重构 query，要求模型保持语义上下文、适配 Google 等搜索引擎、缩小范围明确目的。
            
    *   **网络检索**：
        

        *   使用SERP（Google）进行搜索召回、来源合法性检验：（1）对于非 pro 模式，只处理 wiki 来源的第一个网页；（2）对于 pro 模式，才会处理召回的来源中所有可访问内容。            
        *   保留元数据用于后续生成：标题、url、描述、授权日期（如果有）。
            
        *   在 LLM 的系统提示词中强调按照可靠性对来源进行排序使用。
            
    *   **内容解析**：
        
        *   使用 crawl4ai 解析各种格式的信息（未使用多模态信息）；
            
        *   对于召回的前 m 个网页，每个chunk后进行 rerank（使用相似度、topk）；
            
        *   所有处理后的内容按照顺序和内容标题用'\\n'拼接；
            
        *   在 LLM 的系统提示词中强调对内容相关性的考虑。
            
    *   **回答生成**：
        
        *   使用 LLM 获取处理后的所有上下文生成响应。
            
*   **Open Reasoning Agent**
    
    *   **ODS-v1 with ReAct Agent**
        
        *   React 框架：完全基于smolagents，直接用的ToolCallingAgent接口，无法正常生成回复时使用Chain-of-Thought Self-Consistency调用 r 次、聚类、随机采样最大的聚类；
            
        *   few-shot prompt 设计：从社区活动中总结获得（[https://github.com/sentient-agi/OpenDeepSearch/blob/main/src/opendeepsearch/prompts.py](https://github.com/sentient-agi/OpenDeepSearch/blob/main/src/opendeepsearch/prompts.py)）；
            
        *   支持三个tool action：Continue thinking、Search internet（前面的 Open Search Tool）、calculate（Wolfram Alpha）。
            
    *   **ODS-v2 with CodeAct Agent**
        
        *   Codeact 框架：完全基于smolagents，直接用的CodeAgent接口，使用 Chain-of-Code；
            
        *   few-shot prompt 设计：使用 smolagents 内置的structured\\_code\\_agent.yaml 中的 prompt；
            
        *   支持一个 tool 和内置的 python 解释器：web\\_search（前面的 Open Search Tool）。
            

##### 核心特性

*   语义搜索：使用 Craw4AI 和语义搜索reranker（qwen2-7b-instruct 或者 jina）提供搜索结果。
    
*   模式选择：
    
    *   默认模式：最小 latency 的快速高效搜索（过于浅度）；
        
    *   pro 模式：需要额外处理时间来获取更深入、更精确结果（其实本质上召回量也不大）。
        
*   可以以工具形态接入 Agents：可以无缝接入 SmolAgents（比如 CodeAgent）。
    

##### 小结

*   搜索部分是一套简洁的 pipeline，可以参考的思想：（1）prompt 中的来源排序要求和内容相关性筛选：[https://github.com/sentient-agi/OpenDeepSearch/blob/main/src/opendeepsearch/prompts.py](https://github.com/sentient-agi/OpenDeepSearch/blob/main/src/opendeepsearch/prompts.py)；（2）显式保留网站元数据辅助来源排序。
    

*   参考与react 集成的逻辑：在框架设计时，可以通过封装子任务智能体为支持tool call或者MCP的工具来提高复用和便于扩展。    

#### F.OpenDeepResearcher

##### 工作来源

*   **作者：**Matt Shumer（AI应用开源贡献者、HyperWriteAI/OthersideAI CEO）
    
*   **github：**[https://github.com/mshumer/OpenDeepResearcher?tab=readme-ov-file](https://github.com/mshumer/OpenDeepResearcher?tab=readme-ov-file) **star 2.7k**
    

##### 主要架构

**1）基础配置**

*   模型服务：OpenRouter API（anthropic/claude-3.5-haiku）
    
*   搜索服务：SERPAPI API
    
*   解析服务：Jina API
    

**2）架构分类**

*   static workflow
    

**3）工作流程**

*   **query改写**：
    
    *   要求模型生成 4 个独立的、精确的**搜索query**来覆盖全面的信息。
        
*   **异步搜索**
    
    *   对于每个独立的搜索 query 使用 SERP API 进行 Google 搜索，维护一个全局的 search query 列表；
        
    *   聚合所有的搜索结果（按照默认数量应该总共 40 个召回来源）并进行来源去重。
        
*   **内容获取与处理**
    
    *   获取：使用 Jina READER API 直接完成网页解析与内容获取；
        
    *   过滤：单独调用一次 LLM 进行网页内容与初始 query 的关联度和有用度判断，直接要求模型回复 yes or no（注意此时是一次新的对话，没有做连续的上下文管理）；
        
    *   提取：要求 LLM 对过滤后（经过上一步筛选）的 page content逐个进行相关内容/信息的提取，要求模型不做任何评论，输入侧给user query、search query 和 page content；
        
    *   记忆：将提取到的有效检索内容（获取、过滤、提取后）合并到全局的记忆中（aggregated contexts）。
        
*   **重新搜索**
    
    *   将记忆、user query、search query 输入模型要求其判定是否需要进行新的搜索，如果需要进行新的搜索的话，给出 4 个新的 search query 并且添加到search query 中；否则的话直接回复 done之类的内容。
        
*   **循环迭代**
    
    *   回到“异步搜索”环节；
        
    *   退出条件：1.最大迭代次数 或 2.llm未输出新的 search query。
        
*   **报告生成**
    
    *   传入user query 和 aggregated contexts进行报告生成。
        

##### 核心特性

*   异步搜索与提取：链接去重、API 处理内容、相关性过滤、关联信息抽取；
    
*   迭代优化：维护一个全局记忆模块来迭代地完善和记录搜索召回的内容；
    
*   报告生成：生成报告依赖于全局记忆模块记录的相关搜索内容与 user query。
    

##### 小结

*   高度依赖 LLM 能力：搜索 query改写、内容提取、迭代优化等过程均依赖于 LLM 能力。
    
*   记忆组件简洁：不涉及对过去状态的追溯管理，只维护对搜索内容的记忆，无全局状态上下文。
    
*   pipeline 设计简单：只做搜索、总结（没有显式的 planning 等环节）。
    

## 五、总结

至此，本文尝试对开篇提出的三个问题进行了回答，在第四节中，本文主要侧重于从工程框架层面审视当下Deep Research Agent领域主流的闭源和开源工作（目前尚未对训练、测评等方面展开充分调研，因为不进行展开），可以得到部分结论如下：


*   **理解模型的能力边界并及时调整任务**：早期由于模型能力有限，人为定义的流程与结构成为了确保agent输出稳定的重要设计，但伴随着工具调用能力增强和mcp协议等技术发展，在全局或是许多子任务层面模型都已经具备交付良好结果的能力。因此，明晰当前设计的结构、及时跟进模型能力进展、重新思考workflow中的哪些结构应该完全由模型接管并及时调整，可能是让agent框架持续从模型能力的进步中受益的关键一步。    
*   **尝试把搜索做成“多轮、可递进”的pipeline**：查询生成始终依据“已学到的 learnings / findings”自适应收敛或发散，避免一次性生成一堆关键词，导致召回大量冗余信息。
    
*   **尝试在每个环节交付更加“干净”的上下文**：多数框架会在每轮去重/重排/提炼，汇成结构化的 learnings/findings，而不是把整页原文塞给报告模型，稳定性更好、成本更低。
    
*   **尝试通过更换每个节点的分工来改善性能**：例如在多智能体架构中，如果多个agent产生的独立段落难以被逻辑连贯的整合在一起，那么尝试将每个agent交付的内容改为前述的learnings可能可以有效缓解。
    
*   **Human-in-the-loop环节简单而重要**：多数非专业的用户可能难以在第一次对话中给出信息完备的需求，配合模型的能力特点设计合理的意图澄清机制重要，典型的方式例如向用户询问问题、生成并允许用户修改计划和综合两者。
    
*   **现阶段智能体依然需要学会用好工具**：以搜索引擎为例，目前依然不存在完美适合智能体的搜索工具，如何进行好的query改写搜集合适的信息依然是可以在设计时考虑优化的因素。
    

尽管 Deep Research Agent 已经在科技、金融等领域中带来了令人惊艳的表现，但与OpenAI、Google这样的头部玩家相比，开源社区还有很长的路要走，相关的技术也仍有许多需要探索之处。

*   **合理且全面的评测基准**：现阶段Deep Research Agent研究仍然缺乏权威的、全面的开源评测基准，大多依赖于QA、搜索或agent能力相关的基准进行测评，而许多QA数据集已经愈发容易被模型的参数化知识攻破，这也让迭代Deep Research能力变得愈发困难，设计符合Deep Research任务特点的端到端测评体系，对优化其检索、推理、报告生成能力有较大价值。
    
*   **扩展信息来源与优化内容解析**：网络搜索与内容解析在Deep Research链路中发挥着决定性的作用，现有的问题一方面是可访问的公网内容有限，未来可能需要通过更丰富的MCP工具支持，让agent可以获取更多专业数据库、专业媒体、学术网站中的高质量数据；另一方面则是网页结构的丰富性带来的内容解析困难，从而导致抓取内容存在缺失与格式混乱，未来需要设计智能体原生的浏览器，便于agent进行检索、导航与信息抓取，例如提供用于单击元素和填写表单的显式 API hook。
`
    },
    {
      id: "blog-articles-ulysses-ring-attention",
      title: "超长序列并行之Ulysses + Ring-Attention技术原理与实现",
      file: "Blogs/Articles/Ulysses_Ring_Attention/report.md",
      difficulty: "高级",
      duration: "1h",
      week: 0,
      phase: 0,
      keywords: ["Ring Attention", "Ulysses", "长序列", "序列并行", "Attention"],
      content: `# 超长序列并行之Ulysses + Ring-Attention技术原理与实现

超长序列的训练一直在大模型训练中是一个重要的方向。在实际推理过程中，尤其是Agent链路中，模型对长序列、复杂场景的泛化性代表着模型在实际应用时的可信度。长序列的场景，对于大模型训练也提出了更高的需求。由于Attention计算的O(N^2^ )复杂度特性，使实际输入序列在增长时，显存使用会呈现指数型爆炸。这对于显存不宽裕的卡型，在长序列训练练场景中的可用性，提出了巨大的挑战。

序列并行（Sequence Parrallel， SP）技术，可以用来在多卡或多机条件下降低长序列训练对于大显存的依赖。简单而言，序列并行可以用如下概念定义：

> 序列并行是在训练过程中，将一个输入序列在不同卡上切分为若干个并行计算的子序列，从而降低训练对于显存的需求。

常用的序列并行方式有下面几种：

1.  Ulysses
    
2.  Ring-Attention
    
3.  Megatron-SP/CP
    

这其中Ulysses和Ring-Attention都是基于Transformers生态的序列并行解决方案，我们在这里主要介绍这两种方案的技术原理和实现。而Megatron-CP\\[1\\]和Ring-Attention可以类比为同类技术，Megatron-SP则针对激活值进行了切分，一般配合Megatron-TP使用。我们在这里都不做具体的展开。

首先，我们看下在融合Ulysses和Ring-Attention两种训练技术后，在Qwen2.5-3B模型上的长序列训练过程中，能达到的降低显存的效果：

| SP size | SP Strategy | GPU memory | training time |
| --- | --- | --- | --- |
| 8 | w/ ulysses=2 ring=4 | **17.92GiB** | 1:07:20 |
| 4 | w/ ulysses=2 ring=2 | 27.78GiB | 37:48 |
| 2 | w/ ulysses=2 | 48.5GiB | 24:16 |
| 1 | w/o SP | 75.35GiB | 19:41 |

注意，由于序列切分带来的通讯量增加和显卡负载的不同，训练时间会有相应的延长。

其中切分为2个子序列的时候使用了Ulysses，切分为4/8个子序列时使用了Ulysses（切分2）+Ring-Attention（切分2或4）。下面我们展开阐述一下这两种技术的原理和实现方案。

# Ulysses

Ulysses是DeepSpeed团队开发的序列并行算法\\[2\\]。Ulysses的思路可以用一句话来概括：

> 在序列被切分为子序列后，在每个layer中Attention计算之前进行激活值交换，使每张卡上组合成完整的序列。而Attention Head会被拆分到不同卡上去，从而达到减少显存的目的。计算完成后再交换回来。

通过这样的方式，虽然QKV计算时仍然是O(N^2^) 的激活值，但由于每张卡上Attention Head减少了，因此显存占用仍然会降低。下图是一个简单的例子，假设切分为两个序列，每个序列有两个attention heads:

![pic1.png](https://raw.githubusercontent.com/modelscope/modelscope-classroom/main/Blogs/Articles/Ulysses_Ring_Attention/resources/21123858.png)

我们放一下论文中给的图：

![image.png](https://raw.githubusercontent.com/modelscope/modelscope-classroom/main/Blogs/Articles/Ulysses_Ring_Attention/resources/a091734d.png)

其中，N代表序列长度，d代表hidden\\_size，也可以具体理解为Attension Head数量\\*实际的hidden\\_size。

Ulysses切分后的状态：

![image.png](https://raw.githubusercontent.com/modelscope/modelscope-classroom/main/Blogs/Articles/Ulysses_Ring_Attention/resources/0d8bd9e0.png)


Ulysses的技术原理非常清晰，关键点是N/P到d/P的all-to-all通讯。由于QKV在Attention计算时是完整的，而不同的Attention-Head分摊在不同的卡上，因此在GQA、MHA等场景下都是通用的，并且完全兼容flash-attn、SDPA、padding\\_free等各种技术。当然，由于存在跨卡通讯，因此backward过程需要额外处理。
但Ulysses的限制也比较明显，即受限于Attension Head的数目。尤其是在KV头数远小于Q头数的GQA中，Ulysses可能无法拆分到更多卡上。

# Ring-Attention

在谈Ring-Attention之前，需要先简单聊一下Flash-Attention。Flash-Attention的原理也可以用一句话解释：

> QKV、softmax可以进行分块并行计算和更新，在最大化利用SRAM的能力的同时，降低显存使用。

![image.png](https://raw.githubusercontent.com/modelscope/modelscope-classroom/main/Blogs/Articles/Ulysses_Ring_Attention/resources/b3e6acfb.png)

flash-attention的forward流程伪代码：

![image.png](https://raw.githubusercontent.com/modelscope/modelscope-classroom/main/Blogs/Articles/Ulysses_Ring_Attention/resources/58824543.png)

注意上面Algorithm1中第10~12行的伪代码，该部分对分块的_LSE(_log-sum-exp_)_：

$\${lse}\\_i^{new} = m\\_i^{new} + \\log\\left(e^{m\\_i - m\\_i^{new}}\\ell\\_i + e^{\\tilde m\\_{ij}-m\\_i^{new}} \\tilde \\ell\\_{ij}\\right)$$

其中：$$m\\_i^{new} = \\max(m\\_i, \\tilde m\\_{ij})$$

和Attention-Out进行了合并更新，即在计算完新的块之后，将新的块的结果和老块的结果进行合并，得到完整的结果。

那么，如果每张卡承载一部分序列长度，计算结果跨卡传递，是不是可以使flash-attention跨卡生效呢？这就是Ring-Attention的基本思想了。

> Ring-Attention：利用Attention计算可以分块进行的原理，将序列块切分到多张卡上分别计算，再将计算结果合并起来得到最终结果。

![image.png](https://raw.githubusercontent.com/modelscope/modelscope-classroom/main/Blogs/Articles/Ulysses_Ring_Attention/resources/2deb45c8.png)

假设有N个块，考虑同一个Q~i~ 以及可以在不同块间通讯流转的K~0~n-1~ V~0~n-1~ ，先考虑Softmax部分：

$$p\\_{ij} = \\frac{e^{x\\_{ij}}}{Z\\_i}$$

其中：$$Z\\_i = \\sum\\_{j=1}^N e^{x\\_{ij}}$$

一般来说，为了数值稳定不会直接计算指数，而是使用数值稳定的计算方式：

$$p\\_{ij} = \\exp(x\\_{ij} - \\text{lse}\\_i)$$

$$\\text{lse}\\_i = \\log \\sum\\_{j=1}^N e^{x\\_{ij}}$$

可以看到使用指数公式展开后，该方式和上面的原始公式是等价的。

下面我们需要递推LSE和Attention-Out的更新，先来看LSE，考虑已经有前置的累加结果和当前块结果，那么新的LSE应该是：

$$Z\\_i^{new} = \\sum\\_{j\\in\\text{prev}} e^{x\\_{ij}} + \\sum\\_{j\\in\\text{block}} e^{x\\_{ij}}$$

那么：

$\${lse}\\_i^{new} = \\log\\!\\big(e^{\\text{lse}\\_i} + e^{\\tilde{\\text{lse}}\\_{ij}}\\big)$$

其中i代表旧的累积值，ij代表当前块的值。针对右侧log进行展开：

$\${lse}\\_i^{new} = {lse}\\_i + \\log\\!\\left(1 + e^{\\tilde{\\text{lse}}\\_{ij} - \\text{lse}\\_i}\\right)$$


同理为了数值稳定，不在这里计算指数，而将右侧合并为logsigmoid的形式。在PyTorch中，logsigmoid的softplus算子会负责数值稳定的计算：
$\${lse}\\_i^{new} = {lse}\\_i - \\mathrm{logsigmoid}(\\text{lse}\\_i - \\tilde{\\text{lse}}\\_{ij})$$

这就是Ring-Attention的LSE更新公式。

下面考虑Attention-Out。我们目前有块LSE、前序累积LSE、块Attention-Out、前序累积Attention-Out四个值，需要用这几个信息递推更新后的整体Attention-Out。

根据Attention计算公式和分块定义，假设之前块的计算结果：

$$A\\_i = \\sum\\_{j \\in \\text{prev}} e^{x\\_{ij}} v\\_j,\\quad   Z\\_i = \\sum\\_{j \\in \\text{prev}} e^{x\\_{ij}}$$

当前块的计算结果：

$$\\tilde A\\_{ij} = \\sum\\_{j \\in \\text{block}} e^{x\\_{ij}} v\\_j,\\quad   \\tilde Z\\_{ij} = \\sum\\_{j \\in \\text{block}} e^{x\\_{ij}}$$

于是：

$$A\\_i^{new} = A\\_i + \\tilde A\\_{ij},\\quad Z\\_i^{new} = Z\\_i + \\tilde Z\\_{ij},\\quad {out}\\_i^{new} = \\frac{A\\_i^{new}}{Z\\_i^{new}}$$

使用LSE来表示上面的公式：

$\${out}\\_i^{new} = \\frac{A\\_i+ \\tilde A\\_{ij}}{e^{\\text{lse}\\_i^{new}}}$$

根据Attention公式：

$$A\\_i = e^{\\text{lse}\\_i} \\cdot \\text{out}\\_i,   \\quad   \\tilde A\\_{ij} = e^{\\tilde{\\text{lse}}\\_{ij}} \\cdot \\tilde{\\text{out}}\\_{ij}$$

代入上面：

$$\\text{out}\\_i^{new} = \\frac{e^{\\text{lse}\\_i}\\,\\text{out}\\_i + e^{\\tilde{\\text{lse}}\\_{ij}}\\,\\tilde{\\text{out}}\\_{ij}}{e^{\\text{lse}\\_i} + e^{\\tilde{\\text{lse}}\\_{ij}}}$$

注意到上面的公式分子左右拆分后，可以变为两个独立的式子相加，并且这两个式子分别是sigmoid的形式，因此得到：

$\${out}\\_i^{new} =     sigmoid(\\text{lse}\\_i - \\tilde{\\text{lse}}\\_{ij}) \\cdot \\text{out}\\_i  + sigmoid(\\tilde{\\text{lse}}\\_{ij} - \\text{lse}\\_i) \\cdot \\tilde{\\text{out}}\\_{ij}$$

> 这两个更新公式和flash-attention论文中给的递归公式是等价的，同样是分块更新和online-softmax的思路。

上面的推导给出了迭代更新的前向计算公式，代码位置在update\\_out\\_and\\_lse中：

[https://github.com/modelscope/ms-swift/blob/main/swift/trainers/sequence\\_parallel/zigzag\\_ring\\_attn.py#L69: https://github.com/modelscope/ms-swift/blob/main/swift/trainers/sequence\\_parallel/zigzag\\_ring\\_attn.py#L69](https://github.com/modelscope/ms-swift/blob/main/swift/trainers/sequence_parallel/zigzag_ring_attn.py#L69)

既然有前向，那就必然有反向。在反向时，需要从最终的i-1逐步还原到第0步，由于篇幅关系，反向公式的推导不在这里展开，代码位置在lse\\_grad中：


[https://github.com/modelscope/ms-swift/blob/main/swift/trainers/sequence\\_parallel/zigzag\\_ring\\_attn.py#L263: https://github.com/modelscope/ms-swift/blob/main/swift/trainers/sequence\\_parallel/zigzag\\_ring\\_attn.py#L263](https://github.com/modelscope/ms-swift/blob/main/swift/trainers/sequence_parallel/zigzag_ring_attn.py#L263)
[https://github.com/modelscope/ms-swift/blob/main/swift/trainers/sequence\\_parallel/zigzag\\_ring\\_attn.py#L458: https://github.com/modelscope/ms-swift/blob/main/swift/trainers/sequence\\_parallel/zigzag\\_ring\\_attn.py#L458](https://github.com/modelscope/ms-swift/blob/main/swift/trainers/sequence_parallel/zigzag_ring_attn.py#L458)

好的，上面我们已经准备好了理论，可以开始实现代码了。

注意，Ring-Attention有多个变种实现，例如strip-ring-attention\\[3\\]。在这些实现中，在负载均衡上最优秀的是zigzag（z字型，或者成为之字形）的实现方式。为了理解原始Ring-Attention的问题，我们看下下面的图：

![image.png](https://raw.githubusercontent.com/modelscope/modelscope-classroom/main/Blogs/Articles/Ulysses_Ring_Attention/resources/51ce37ef.png)

由于GPU 0处理句子的最前部分，因此其他卡的KV流转到GPU 0的时候，GPU由于causal=True的原因根本无法参与计算句子后面的部分，而GPU3可以计算0~2的全部序列，因此每张卡的计算负载并不一致。在这个前提下，Megatron-CP和一些优秀的实现采用了Z字型切分：

![image.png](https://raw.githubusercontent.com/modelscope/modelscope-classroom/main/Blogs/Articles/Ulysses_Ring_Attention/resources/984002ae.png)

假设需要切分到4张卡上，那么在保证序列可以被均分为8片的情况下，将0/7组合到一起，1/6组合到一起，2/5、3/4也分别组合到一起，这样可以保证计算的均衡。并且，这种计算还有一个特性：

1.  在本地计算QKV（序号为0）的时候，causal=True直接计算
    
2.  在流转序号小于等于当前rank时，只需要计算KV的前半部分
    
3.  在流转序号大于当前rank时，只需要计算Q的后半部分
    

![image.png](https://raw.githubusercontent.com/modelscope/modelscope-classroom/main/Blogs/Articles/Ulysses_Ring_Attention/resources/06037e80.png)

这进一步减小了计算量。代码实现参见：

[https://github.com/modelscope/ms-swift/blob/main/swift/trainers/sequence\\_parallel/zigzag\\_ring\\_attn.py#L348: https://github.com/modelscope/ms-swift/blob/main/swift/trainers/sequence\\_parallel/zigzag\\_ring\\_attn.py#L348](https://github.com/modelscope/ms-swift/blob/main/swift/trainers/sequence_parallel/zigzag_ring_attn.py#L348)

# Ulysses和Ring-Attention

不难看出，这两个序列并行方案各有特点。


1.  Ulysses通讯比较低，但受限于Attention Head数量，而且all-to-all通讯对延迟比较敏感，对网络拓扑也有一定要求。    
2.  Ring-Attention的P2P环通讯要求比较低，但通讯量更高一些，也不受限于Attention Head数量。
    

从上面的原理可以看到，Ulysses和Ring-Attention两个技术实际上是可以融合使用的。可以先使用通讯量较低的Ulysses进行切分，如果Attention Head数量不足（GQA），或切分序列数量过大，则补充以Ring-Attention。

SWIFT中实现了这样一个融合计算的技术，并且适用于纯文本、多模态、SFT、DPO、GRPO等各类场景中。在基础代码实现中，我们采用了一些优异的社区开源工作\\[4\\]\\[5\\], 并重写了部分代码。

[https://github.com/modelscope/ms-swift: https://github.com/modelscope/ms-swift](https://github.com/modelscope/ms-swift)

使用方式也非常简单，在命令行中额外增加一个参数：

\`\`\`shell
--sequence_parallel_size N
\`\`\`

框架会自行计算切分方式，甚至当显卡数量不是偶数时（3,5,7等）也可以支持。

## 切分方式

最自然的方式是先用Ulysses做局部gather，整体使用Ring-Attention计算全局LSE和Attention-Out，假设切分为4个子序列(Ulysses world\\_size=2, Ring-Attention world\\_size=2)，模型head=4，那么：

![image.png](https://raw.githubusercontent.com/modelscope/modelscope-classroom/main/Blogs/Articles/Ulysses_Ring_Attention/resources/4345df6f.png)

在Ulysses all-to-all 通讯后，GPU0,1作为同一个Ulysses组均持有序列0/3，但head不同（前半和后半）。GPU2,3同理。在Ring-Attention计算时，GPU0,2作为Ring-Attention组进行环状通讯，GPU1,3同理。

在切分之前，需要对序列进行padding，使其可以被world\\_size\\*2整除（乘以2是因为zigzag需要对子块重新组合）。

## 适配多模态

多模态模型的序列切分适配比较困难，主要原因有：

1.  多模态模型的序列长度在实际forward之前无法确定。部分模型仅使用一个\`\`\`<image> token\`\`\`来代表多模态部分，在ViT对图像编码后，将该token替换为一个非常长的序列。
    
2.  部分模型的输入序列包含了闭合性标签，例如\`\`\`<image></image>\`\`\`，在替换为实际图像编码前不能切分，否则会直接抛错。
    

一般多模态LLM均包含内外两层模型，外层模型包含了ViT处理过程和lm\\_head计算逻辑，内层模型计算decode\\_layers，我们称其为backbone。

为了适配多模态切分，SWIFT在实现过程中，采用了一个工程上的trick：切分不发生在数据准备过程（data\\_collator）中，而发生在backbone的forward hook中。因为在进入backbone时，ViT部分的多模态编码已经和纯文本部分融合完成，此时拿到的embedding是准确长度的。并且，在backbone的hook中进行切分对纯文本模型也是适配的。同时这种方式使得框架不需要保存额外的模型代码，避免了原始模型代码更新时造成的维护成本增大问题。

## 适配padding\\_free

padding\\_free可以理解输入格式为flash-attention的形式：多个sequence拼接为一个超长序列。

![image.png](https://raw.githubusercontent.com/modelscope/modelscope-classroom/main/Blogs/Articles/Ulysses_Ring_Attention/resources/c81d72f5.png)

这种方式给实际的工程实现带来了麻烦。因此在实现中，SWIFT采用了如下的工程方案：

1.  针对原始padding\\_free输入进行拆解，对每个sequence再单独进行padding（被world\\_size\\*2整除）和单独拆分。
    

2.  在计算attention之前，根据padding位置，将QV的padding置为0，对K的padding置为极小值，防止padding对attention计算产生不良影响。    
3.  由于GRPO、DPO最终的loss计算需要完整序列，因此在padding\\_free中，如果先进行logits进行gather会增大通讯量，后进行gather会导致loss计算异常，因此需要完全重写各个训练的loss计算逻辑。
    
4.  由于通讯序号大于rank时Q只有一半，因此在反向梯度更新时需要还原为完整长度，因此需要针对每个sequence的grad单独padding，并且LSE需要padding为极小值。
    

## 反向传播

根据上面的公式推导，LSE和Attention-Out进行块状更新的反向传播需要依次进行，并且需要一些前向的信息，如块LSE、块Attention-Out等，这些信息在前向的flash\\_attn\\_forward中虽然可以拿到，但保存在ctx中可能占用额外显存，因此选择了在后向时重新计算一次flash\\_attn\\_forward的方案，再根据中间结果计算lse\\_grad，以及后续对QKV进行实际的backward。

# 显存优化结果

我们使用了一个3B模型，在8\\*A100显卡上测试显存优化效果：

\`\`\`shell
NPROC_PER_NODE=8 \\
swift sft \\
    --model Qwen/Qwen2.5-3B-Instruct \\
    --dataset 'test.jsonl' \\ # 9000 tokens per sequence
    --train_type lora \\
    --torch_dtype bfloat16 \\
    --per_device_train_batch_size 4 \\
    --target_modules all-linear \\
    --gradient_accumulation_steps 8 \\
    --save_total_limit 2 \\
    --save_only_model true \\
    --save_steps 50 \\
    --max_length 65536 \\
    --warmup_ratio 0.05 \\
    --attn_impl flash_attn \\
    --sequence_parallel_size 8 \\
    --logging_steps 1 \\
    --use_logits_to_keep false \\
    --padding_free true

\`\`\`

如文章开头所示，在切分为8片时，训练显存占用从将近80GiB下降到不到20GiB，达到了普通商业级显卡即可训练的效果。

# 展望

本篇讲解了在SWIFT框架中，实现Ulysses + Ring-Attention的融合训练能力。目前我们对于这方面的进一步优化，也还在继续探索中，例如：

1.  在backward中，重新计算flash\\_attention\\_forward，是否是能达到最佳速度的实现？
    
2.  P2P的通讯量和异步执行方向，仍然有继续优化的可能。
    

对此有兴趣的开发者可以提出宝贵的意见，帮助SWIFT共同改进长序列场景下的大模型训练能力。

引用：

1.  [https://docs.nvidia.com/megatron-core/developer-guide/latest/api-guide/context\\_parallel.html](https://docs.nvidia.com/megatron-core/developer-guide/latest/api-guide/context_parallel.html)
    
2.  [https://arxiv.org/abs/2309.14509](https://arxiv.org/abs/2309.14509)
    
3.  [https://arxiv.org/abs/2311.09431](https://arxiv.org/abs/2311.09431)
    
4.  [https://github.com/deepspeedai/DeepSpeed](https://github.com/deepspeedai/DeepSpeed)
    
5.  [https://github.com/zhuzilin/ring-flash-attention](https://github.com/zhuzilin/ring-flash-attention)
`
    },
    {
      id: "blog-daily-agent-lightning",
      title: "Agent Lightning：面向AI Agents的强化学习框架深度分析报告",
      file: "Blogs/DailyPaper/Agent_Lightning_zh/report.md",
      difficulty: "中级",
      duration: "0.5h",
      week: 4,
      phase: 4,
      keywords: ["Agent Lightning", "强化学习", "AI Agents", "RL", "MDP"],
      content: `# Agent Lightning：面向AI Agents的强化学习框架深度分析报告

## 1. 摘要

本文深入分析了"Agent Lightning"框架，这是一个创新性的强化学习(RL)训练框架，专为解决大型语言模型(LLM)驱动的AI Agents在复杂任务中的训练挑战而设计。研究指出，尽管LLM Agents在搜索、代码生成和工具使用等任务中表现出色，但在多轮编码工作流、私有领域数据集或不熟悉工具等真实场景中仍面临显著局限性。Agent Lightning通过将 Agents执行建模为马尔可夫决策过程(MDP)，实现了 Agents执行与RL训练的完全解耦，使开发者几乎无需修改代码即可训练现有 Agents。该框架已在Text-to-SQL、检索增强生成(RAG)和数学问答等三个不同任务上验证了其有效性，展示了在复杂 Agents场景中稳定提升性能的能力。

![3acd042a.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Agent_Lightning_zh/resources/3acd042a.png)<br>
**图1：Agent Lightning框架概述** - 一个灵活可扩展的框架，使强化学习能够应用于任何AI Agents

## 2. 研究背景与挑战

### 2.1 LLM Agents的现状与局限

近年来，大型语言模型(LLM)驱动的AI Agents在复杂任务中展现出卓越能力，包括搜索、代码生成和工具使用等。这些 Agents通过利用LLM的适应性，能够灵活应对多样化的任务需求。然而，尽管提示工程(prompt engineering)可以提升性能，LLM仍面临显著局限：

- **易错性**：在未明确训练过的场景中容易出错，如多轮编码工作流、私有领域数据集或不熟悉工具
- **可靠性不足**：难以可靠解决端到端软件开发等复杂真实任务(Liu et al., 2024)
- **泛化能力有限**：在动态交互环境中表现不稳定

### 2.2  Agents训练的必要性

研究表明，对 Agents中的模型进行训练或微调对于充分发挥LLM在这些场景中的潜力至关重要(Chen et al., 2023; Jin et al., 2025; Song et al., 2025; Maloo, 2025)。此外，在真实世界 Agents中训练模型将成为推动模型能力前沿的关键：

- **丰富的交互数据**： Agents执行过程中生成的交互数据捕捉了真实问题解决的复杂性
- **超越传统数据集**：这些真实世界经验在规模和多样性上超越传统人工整理的数据集
- **动态环境适应**：为训练更适合动态交互环境的多功能LLM提供基础

### 2.3 强化学习的优势与挑战

强化学习(RL)为优化 Agents场景中的LLM提供了强大范式，已在DeepSeekR1(Guo et al., 2025)和Kimi k1.5(Team et al., 2025)等推理模型中取得进展。相比监督学习，RL具有显著优势：

- **无需详细标注**：仅需基于结果的奖励信号，避免了复杂交互任务中稀缺且昂贵的逐步标注
- **环境反馈学习**：使 Agents能直接从环境反馈中学习理想行为
- **模拟人类学习**：试错过程与人类获取问题解决技能的方式相似

然而，将RL扩展到 Agents场景面临重大挑战：

- **算法设计挑战**：现有RL方法主要针对静态单次调用任务(如偏好对齐或数学推理)
- **系统实现挑战**： Agents执行涉及多次LLM调用、不同提示和响应，以及与外部工具、API或环境的交互
- **多样性挑战**：需要为不同应用场景设计不同的 Agents，增加了RL应用的复杂性

## 3. Agent Lightning框架设计

### 3.1 核心思想：完全解耦设计

Agent Lightning的核心创新在于实现了** Agents执行与RL训练的完全解耦**，使开发者几乎无需修改代码即可训练现有 Agents。这一设计基于以下关键理念：

- ** Agents执行作为MDP**：将 Agents执行建模为马尔可夫决策过程
- **统一数据接口**：抽象底层编排逻辑和 Agents框架细节
- **灵活的上下文构建**：支持高度定制化的优化方法

![9d08e743.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Agent_Lightning_zh/resources/9d08e743.png)<br>
**图2：Agent Lightning的统一数据接口** - 左侧面板展示 Agents执行流程，右侧面板展示执行过程中收集的相应轨迹

### 3.2 MDP建模与统一数据接口

#### 3.2.1 MDP形式化表示

Agent Lightning将 Agents执行形式化为马尔可夫决策过程：

- **状态(State)**： Agents执行的当前快照，包含足够描述执行状态的变量值
- **动作(Action)**：策略LLM生成的输出，用于更新状态
- **奖励(Reward)**：评估执行结果的信号

#### 3.2.2 统一数据接口设计

基于MDP建模，框架提出统一数据接口，将 Agents轨迹结构化为转换序列：

$$\\mathcal{D} = \\{(s_t, a_t, r_t)\\}_{t=1}^T$$

其中每个转换包含：
- 当前状态(即LLM输入)
- 动作(即LLM输出)
- 奖励

这种设计抽象了底层编排逻辑和 Agents框架细节，使其适用于**任何 Agents**。

#### 3.2.3 RAG Agents示例说明

以典型的检索增强生成(RAG) Agents为例(见图2)，其执行流程如下：

1. 用户提交任务(x)和问题(UserInput)
2.  Agents调用LLM生成基于UserInput的搜索查询(Query)
3. 搜索工具使用生成的Query检索相关段落(Passages)
4.  Agents再次调用LLM，利用检索到的Passages和原始UserInput生成最终答案(Answer)

每个状态封装了语义变量的当前值(图2中绿色矩形表示有有效值的变量，灰色矩形表示当前状态中未赋值的变量)。 Agents执行表示为有序调用序列，每个调用包含组件、输入、输出和相关奖励。

### 3.3 LightningRL算法

![34f5f2bc.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Agent_Lightning_zh/resources/34f5f2bc.png)<br>
**图3：LightningRL算法说明** - (a)单次调用GRPO；(b)先前的多轮GRPO；(c)提出的LightningRL

#### 3.3.1 分层强化学习设计

LightningRL是一种分层强化学习(HRL)方法，无缝集成现有单轮RL方法，有效支持任何 Agents场景的优化：

1. **转换分解**：将轨迹分解为转换，每个转换包含当前输入/上下文、输出和奖励
2. **任务级分组**：将同一任务的转换分组进行优势估计
3. **两级信用分配**：
   - 任务级回报R首先通过信用分配模块分配给各个动作
   - 然后进一步分解为每个动作内的token级监督信号

#### 3.3.2 算法优势

LightningRL相比现有方法具有多项优势：

- **与现有RL方法兼容**：可直接使用任何单轮RL算法(如GRPO、PPO、REINFORCE++)，无需修改
- **灵活的上下文构建**：支持高度定制化的上下文构建，如LLM生成的前序步骤摘要、模板组装的结构化提示等
- **避免长序列问题**：将长轨迹分解为转换批次，缓解累积上下文导致的过长序列问题
- **无需复杂掩码**：消除对输入、损失和注意力机制的定制掩码策略需求

#### 3.3.3 信用分配机制

LightningRL采用简单但有效的信用分配策略：
- 假设任务中每个动作具有相同价值，等于最终回报R
- 未来可集成更复杂的策略，如基于启发式或学习模型的信用分配

### 3.4 训练- Agents解耦架构

![fbea43f4.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Agent_Lightning_zh/resources/fbea43f4.png)<br>
**图4：训练- Agents解耦(Training-Agent Disaggregation)架构**

该架构实现了 Agents执行与RL训练的完全分离：
- ** Agents执行层**：负责实际 Agents逻辑和任务执行
- **数据收集层**：捕获 Agents执行过程中的状态转换
- **RL训练层**：基于收集的转换数据优化策略LLM

这种解耦设计使开发者能够专注于 Agents逻辑开发，而无需关心RL训练的复杂性。

## 4. 实验验证

### 4.1 实验设置概览

| 任务 | 框架 | 数据集 | 工具 |  Agents数量 | 微调 Agents数量 |
|------|------|--------|------|----------|--------------|
| Text-to-SQL | LangChain | Spider | SQL执行器 | 3 | 2 |
| 开放域问答 | OpenAI Agents SDK | MuSiQue | Wikipedia检索器 | 1 | 1 |
| 数学问答 | AutoGen | Calc-X | 计算器 | 1 | 1 |

**表1：实验任务和设置总结**

### 4.2 Text-to-SQL任务

#### 4.2.1 任务描述
- **数据集**：Spider(10,000+问题，200+数据库，138个领域)
- **目标**：根据自然语言问题和数据库生成SQL查询并回答问题
- ** Agents设计**：多 Agents系统(3个 Agents)
  - SQL编写 Agents：生成SQL查询
  - 检查 Agents：评估SQL查询正确性和检索信息有效性
  - 重写 Agents：根据检查结果修改查询或生成最终答案
- **微调设置**：同时优化SQL编写和重写 Agents

#### 4.2.2 实验结果

![4516bc9c.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Agent_Lightning_zh/resources/4516bc9c.png)<br>
![cba08d34.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Agent_Lightning_zh/resources/cba08d34.png)<br>
**(a) 训练奖励 (b) 测试奖励**  
**图5：Text-to-SQL任务的奖励曲线**

结果表明，Agent Lightning能够实现稳定的奖励提升，证明其在涉及代码生成和工具使用的复杂多步决策中的有效性。

### 4.3 检索增强生成(RAG)任务

#### 4.3.1 任务描述
- **数据集**：MuSiQue(多跳问答基准，2100万文档的Wikipedia)
- **目标**：生成自然语言查询检索支持文档，然后回答问题
- ** Agents设计**：单 Agents系统
  - 生成查询 → 检索文档 → 决定是否优化查询或生成答案
- **奖励设计**：$R = 0.9 \\times R_{\\text{correctness}} + 0.1 \\times R_{\\text{format}}$
  - 格式分：输出符合特定格式(如\`<think>...</think>\`)得1分
  - 正确分：预测答案与标准答案的词级F1分数

#### 4.3.2 实验结果

![32944064.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Agent_Lightning_zh/resources/32944064.png)<br>
**图6：检索增强生成任务的奖励曲线**

结果表明，Agent Lightning在这一具有挑战性的任务上实现了稳定的性能提升，证明其在更复杂和开放的RAG场景中的有效性。

### 4.4 数学问答任务

#### 4.4.1 任务描述
- **数据集**：Calc-X
- **目标**：解决需要计算器辅助的数学问题
- ** Agents设计**：使用AutoGen框架的单 Agents系统
- **工具**：计算器

#### 4.4.2 实验结果

![15b8f8cf.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Agent_Lightning_zh/resources/15b8f8cf.png)<br>
![35a720ed.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Agent_Lightning_zh/resources/35a720ed.png)<br>
**(a) 训练奖励**  
**图7：计算器任务的奖励曲线**

结果进一步验证了Agent Lightning在不同任务和框架下的通用性和有效性。

## 5. 与现有方法的对比分析

![8b27dd3a.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Agent_Lightning_zh/resources/8b27dd3a.png)<br>
**图8：Agent Lightning进程图**

### 5.1 传统方法的局限

现有方法(如RAGEN、Trinity-RFT、rLLM、SearchR1等)通常采用**连接(concatenation)策略**：
- 将 Agents多轮交互连接成单一长序列
- 使用掩码确保正确优化

这种方法存在以下问题：
- **架构限制**：仅适用于简单顺序工作流的 Agents，难以处理复杂模式
- **长序列问题**：累积上下文导致序列过长，超出LLM输入限制
- **定制掩码需求**：需要为输入、损失和注意力机制设计特定掩码
- **实现复杂性**：掩码策略应用困难，调试复杂，效率低下

### 5.2 Agent Lightning的四大优势

#### 5.2.1 广泛的 Agents架构支持
- **多 Agents编排**：支持复杂 Agents工作流和多 Agents系统
- **训练-部署一致性**：确保RL优化与真实世界 Agents的动态多样性保持一致
- **灵活性**：适用于各种 Agents架构，而不仅限于简单顺序工作流

#### 5.2.2 缓解累积上下文问题
- **转换级处理**：将长轨迹分解为转换批次
- **避免序列过长**：每个转换作为独立样本，显著缓解累积上下文导致的序列增长
- **计算效率**：支持批量累积等技术进行高效更新

#### 5.2.3 消除定制掩码需求
- **简化实现**：仅包含当前LLM输入，无需复杂掩码
- **保持位置连续性**：符合旋转位置编码(RoPE)等位置编码方法的假设
- **降低调试难度**：避免掩码复杂性导致的验证和调试困难

#### 5.2.4 支持高级RL算法
- **分层RL算法**：支持更有效的信用分配机制
- **算法灵活性**：为针对复杂 Agents场景的创新RL方法铺平道路
- **未来扩展性**：可集成更复杂的信用分配策略

## 6. 结论与展望

### 6.1 主要贡献总结

1. **完全解耦设计**：实现 Agents执行与RL训练的完全分离，几乎无需修改代码即可训练现有 Agents
2. **MDP建模与统一接口**：将 Agents执行形式化为MDP，提出适用于任何 Agents的统一数据接口
3. **LightningRL算法**：分层RL方法，无缝集成现有单轮RL方法，有效支持复杂 Agents场景
4. **实证验证**：在三个不同任务和框架上证明了框架的有效性和通用性

### 6.2 未来研究方向

- **更复杂的信用分配**：开发基于启发式或学习模型的高级信用分配策略
- **多LLM联合优化**：探索多 Agents强化学习(MARL)或博弈论方法优化多个LLM
- **更大规模应用**：在更复杂的端到端软件开发等真实场景中验证框架
- **算法扩展**：集成更多先进的RL算法，进一步提升 Agents性能

### 6.3 实践意义

Agent Lightning框架为AI Agents的持续优化提供了实用工具，有望：
- **提升 Agents可靠性**：解决复杂真实任务中的稳定性问题
- **加速能力发展**：利用 Agents执行中生成的丰富交互数据推动模型能力前沿
- **降低开发门槛**：使开发者能够专注于 Agents逻辑，无需深入RL训练细节

通过将LLM生成的文本标记转化为真实世界行动，Agent Lightning为实现真正智能、自适应的AI Agents系统铺平了道路，标志着从静态语言模型向动态交互式智能体的重要转变。`
    },
    {
      id: "blog-daily-dinov3",
      title: "DINOv3: 通过自监督学习扩展视觉基础模型",
      file: "Blogs/DailyPaper/DINOv3_zh/report.md",
      difficulty: "中级",
      duration: "0.5h",
      week: 4,
      phase: 4,
      keywords: ["DINOv3", "自监督学习", "视觉基础模型", "SSL", "Gram Anchoring"],
      content: `<span style="color: darkgreen; font-weight: bold; font-family: monospace;">Powered by [MS-Agent](https://github.com/modelscope/ms-agent) | [DocResearch](https://github.com/modelscope/ms-agent/blob/main/projects/doc_research/README.md)</span>
<br>


---

# DINOv3: 通过自监督学习扩展视觉基础模型

## 摘要

本文深入探讨了新一代视觉基础模型 **DINOv3**。该模型通过大规模自监督学习（Self-Supervised Learning, SSL）旨在创建强大且通用的视觉编码器。文章的核心贡献在于解决了在扩展SSL模型时遇到的**密集特征（dense features）质量下降**的难题，并提出了一种名为 **“Gram锚定”（Gram Anchoring）** 的创新方法。

DINOv3不仅成功训练了一个拥有70亿参数的巨型模型，还通过知识蒸馏技术，构建了一个包含多种尺寸（ViT和ConvNeXt架构）的**DINOv3模型家族**，以适应不同的应用场景和计算资源限制。实验结果表明，DINOv3在各类视觉任务，特别是 **密集预测任务（如分割、深度估计）** 上，显著超越了以往的自监督、弱监督甚至全监督模型，树立了新的技术标杆。

## 1. 引言与背景

### 1.1. 自监督学习（SSL）的崛起

基础模型已成为现代计算机视觉的核心，而自监督学习（SSL）是训练这类模型的强大范式。与需要高质量元数据（标签）的监督学习（SL）或弱监督学习（WSL）不同，SSL能直接从海量原始图像数据中学习，这为训练超大规模视觉编码器提供了几乎无限的数据来源。

![b60962bc.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/DINOv3_zh/resources/b60962bc.png)<br>
![79a8cbfa.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/DINOv3_zh/resources/79a8cbfa.png)<br>
![0c06de91.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/DINOv3_zh/resources/0c06de91.png)<br>
![3637f869.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/DINOv3_zh/resources/3637f869.png)<br>

**图 1**: (a) ImageNet1k线性探测结果的演变，SSL方法后来居上，已达到近年来的精度平台期。(b) DINOv3在密集任务上显著优于顶级的弱监督模型。(c, d) DINOv3在自然图像和航拍图像上提取的高分辨率特征PCA图，展示了其卓越的特征区分能力。

### 1.2. 扩展SSL面临的挑战

尽管SSL潜力巨大，但在实践中将其扩展到更大规模的模型和数据时，会遇到新的问题：
1.  **数据筛选困难**：如何从无标签数据集中筛选出有用的训练数据。
2.  **优化难题**：传统的余弦学习率调度需要预知训练总时长，这在大规模数据上难以确定。
3.  **密集特征退化**：在长时间训练或使用超大模型（如ViT-Large以上）时，模型的密集特征（patch-level features）质量会逐渐下降，影响其在分割、深度估计等任务上的表现。

### 1.3. DINOv3的核心目标

为解决上述挑战，DINOv3的研究围绕以下三个核心目标展开：
1.  **通用性**：训练一个跨任务、跨领域的通用基础模型。
2.  **卓越的密集特征**：显著改善现有SSL模型在密集特征上的短板。
3.  **模型家族**：发布一系列可直接使用、适应不同资源限制的模型。

![54fbfbeb.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/DINOv3_zh/resources/54fbfbeb.png)<br>
![88e884f2.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/DINOv3_zh/resources/88e884f2.png)<br>

**图 2**: DINOv3模型家族在不同基准测试上的性能对比。在密集任务（如ADE20k语义分割和NAVI 3D关键点匹配）上，DINOv3显著超越了其他模型。

## 2. 核心方法论

DINOv3的成功建立在数据、模型架构、训练目标和优化策略的全面革新之上。

### 2.1. 数据策略：精心构建的大规模数据集

为了充分利用无标签数据的优势，DINOv3采用了一种混合数据策略：
- **基础数据集**：通过聚类和检索等自动化方法，从海量原始数据中筛选出一个大规模的“背景”数据集。
- **专业数据混合**：将少量高质量的专业数据集（如ImageNet-1k）与背景数据混合。实验证明，这种混合策略能兼顾不同数据源的优点，在多个下游任务中取得最佳性能。

**表 1: 训练数据对特征质量的影响**
该消融研究表明，本文提出的数据混合方法（LVD-1689M）在多个下游任务（如iNaturalist 2021、Paris Retrieval）上取得了优于单一数据筛选方法（聚类或检索）和原始数据的性能。

| 数据集 | IN1k k-NN | IN1k Linear | ObjectNet | iNaturalist 2021 | Paris Retrieval |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Raw | 80.1 | 84.8 | 70.3 | 70.1 | 63.3 |
| Clustering | 79.4 | 85.4 | 72.3 | 81.3 | 85.2 |
| Retrieval | 84.0 | 86.7 | 70.7 | 86.0 | 82.7 |
| **LVD-1689M (ours)** | **84.6** | **87.2** | **72.8** | **87.0** | **85.9** |

### 2.2. 模型架构与训练策略

#### 2.2.1. 扩展至70亿参数的ViT架构

DINOv3将模型规模扩展到了70亿（7B）参数，远超DINOv2的11亿参数。关键架构更新包括：
- **更大的嵌入维度**：从1536增加到4096。
- **更大的Patch Size**：使用16x16的patch size。
- **RoPE位置编码**：采用旋转位置编码（Rotary Positional Embeddings），增强了模型对不同分辨率和长宽比的适应性。

**表 2: DINOv2 与 DINOv3 教师模型架构对比**

| 特性 | DINOv2 (ViT-giant) | DINOv3 (ViT-7B) |
| :--- | :--- | :--- |
| 参数量 | 1.1B | 6.7B |
| 嵌入维度 | 1536 | 4096 |
| Patch Size | 14 | 16 |
| 位置编码 | Learnable | RoPE |
| DINO原型数量 | 128k | 256k |

#### 2.2.2. 优化的自监督学习目标

DINOv3的训练目标函数组合了多个损失项，以平衡全局和局部特征的学习：
$$
\\mathcal{L}_{\\text{SSL}} = \\mathcal{L}_{\\text{DINO}} + \\mathcal{L}_{\\text{iBOT}} + \\mathcal{L}_{\\text{Koleo}}
$$
- $L_{DINO}$：图像级（全局）对比学习损失。
- $L_{iBOT}$：Patch级（局部）掩码图像建模损失。
- $L_{Koleo}$：特征正则化项，鼓励特征在空间中均匀分布。

#### 2.2.3. 恒定学习率优化

为适应大规模、长周期的训练，DINOv3摒弃了需要预设训练时长的学习率调度策略，转而采用**恒定学习率**、权重衰减和教师模型EMA动量，仅在初始阶段使用线性预热。这使得模型可以持续训练，直到下游任务性能不再提升。

### 2.3. Gram锚定：解决密集特征退化

这是DINOv3最核心的创新。

#### 2.3.1. 问题：密集特征在训练后期退化

研究发现，随着训练的进行，虽然模型的全局分类能力（如ImageNet准确率）持续提升，但其密集任务（如分割）的性能在达到峰值后会显著下降。
![27a6857a.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/DINOv3_zh/resources/27a6857a.png)<br>
![6822f960.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/DINOv3_zh/resources/6822f960.png)<br>

**图 5**: ViT-g和ViT-7B模型的性能演变。分类准确率（IN1k linear）单调上升，而分割性能（VOC）在训练约200k次迭代后开始下降。

这种退化的原因是patch特征之间的相似性结构变得混乱，失去了局部性。
![9c9d407c.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/DINOv3_zh/resources/9c9d407c.png)<br>

**图 6**: 随着训练进行，patch特征的余弦相似度图变得越来越嘈杂，失去了局部性。

#### 2.3.2. 解决方案：Gram锚定（Gram Anchoring）

为了解决此问题，DINOv3引入了一个新的损失项 $L_{Gram}$，其核心思想是：
- **不直接约束特征**：而是约束特征之间的**关系结构**。
- **使用Gram矩阵**：Gram矩阵记录了一张图中所有patch特征两两之间的点积，它代表了特征的相似性结构。
- **锚定到早期模型**：将当前学生模型的Gram矩阵，锚定（对齐）到一个训练早期的、具有良好密集特征的教师模型（称为**Gram教师**）的Gram矩阵。

损失函数定义为：
$$
\\mathcal{L}_{\\text{Gram}} = \\left\\| X_S X_S^T - X_G X_G^T \\right\\|_F^2
$$
其中，$X_S$ 和 $X_G$ 分别是学生模型和Gram教师模型的L2归一化patch特征矩阵。

这个新的训练阶段被称为**精炼步骤（refinement step）**，总损失为：
$$
\\mathcal{L}_{\\text{Ref}} = \\mathcal{L}_{\\text{SSL}} + w_{\\text{Gram}} \\mathcal{L}_{\\text{Gram}}
$$

![3c40c4ef.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/DINOv3_zh/resources/3c40c4ef.png)<br>
![fcc32d59.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/DINOv3_zh/resources/fcc32d59.png)<br>
![a20a653e.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/DINOv3_zh/resources/a20a653e.png)<br>

**图 8**: 应用Gram锚定（$L_{Ref}$）后，模型在密集任务（如ADE20k分割）上的性能迅速回升并持续改进。

#### 2.3.3. 增强：高分辨率Gram锚定

为了获得更优质的锚定目标，研究者进一步提出使用**高分辨率**图像输入Gram教师模型，然后将得到的特征图下采样，以获得更平滑、一致性更好的Gram矩阵。这种方法（$L_{HRef}$）在密集任务上带来了额外的性能提升。

![616e9a4d.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/DINOv3_zh/resources/616e9a4d.png)<br>
![f7455f19.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/DINOv3_zh/resources/f7455f19.png)<br>

**图 9**: (a) 高分辨率输入的Gram矩阵（512）经过下采样后，依然保持了良好的结构性。(b) 消融实验表明，使用早期（如200k次迭代）且高分辨率（x2）的Gram教师效果最好。



**图 10**: 使用高分辨率Gram锚定（$L_{HRef}$）前后，patch特征余弦相似度图的定性对比，可见特征的局部性和一致性得到极大改善。

### 2.4. 高分辨率适应与模型蒸馏

#### 2.4.1. 高分辨率适应

为了让模型能处理更高分辨率的输入，DINOv3在主训练后增加了一个简短的**高分辨率适应**阶段，使用混合分辨率（如512x512, 768x768）的图像进行少量迭代训练。这一步显著提升了模型在高分辨率下的密集任务性能。



**图 4**: DINOv3在高分辨率下的特征PCA可视化。随着分辨率提升，特征图愈发清晰且语义信息丰富，即使在4096x4096分辨率下依然稳定。

#### 2.4.2. 高效的多学生知识蒸馏

为了构建DINOv3模型家族，团队设计了一个**高效的多学生蒸馏**流程。该流程允许多个不同尺寸的学生模型（如ViT-S, B, L）并行地从一个7B教师模型中学习。通过共享教师模型的前向传播计算，极大地节省了计算资源并提高了蒸馏效率。

![c5b031ae.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/DINOv3_zh/resources/c5b031ae.png)<br>

**图 12**: 多学生蒸馏流程图。所有GPU节点共享教师模型的推理计算，然后各自独立进行学生模型的训练，从而最小化等待时间。

## 3. 实验结果与分析

DINOv3在广泛的视觉任务上进行了全面评估，并取得了SotA（State-of-the-Art）或极具竞争力的结果。

### 3.1. 密集特征任务评估

这是DINOv3的核心优势所在。

![aa0644a7.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/DINOv3_zh/resources/aa0644a7.png)<br>

**图 13**: DINOv3与其他视觉骨干网络的密集特征PCA可视化对比。DINOv3的特征图更锐利、噪声更少、语义一致性更强。

#### 3.1.1. 语义分割与单目深度估计（线性探测）

在冻结骨干网络、仅训练一个线性分类器的情况下，DINOv3在多个基准上刷新了记录。

**表 3: 密集任务线性探测结果**
在ADE20k语义分割上，DINOv3（55.9 mIoU）比DINOv2（49.5 mIoU）高出超过6个点。在NYUv2深度估计上，DINOv3的RMSE（0.309）也显著低于所有对比模型。

| 模型 (ViT) | ADE20k mIoU ↑ | Cityscapes mIoU ↑ | NYUv2 RMSE ↓ | KITTI RMSE ↓ |
| :--- | :--- | :--- | :--- | :--- |
| DINOv2 (g/14) | 49.5 | 75.6 | 0.372 | 2.624 |
| AM-RADIOv2.5 (g/14) | 53.0 | 78.4 | 0.340 | 2.918 |
| Web-DINO (7B/14) | 42.7 | 68.3 | 0.466 | 3.158 |
| **DINOv3 (7B/16)** | **55.9** | **81.1** | **0.309** | **2.346** |

#### 3.1.2. 3D一致性与关键点匹配

评估模型在不同视角下对同一关键点的特征一致性。

**表 4: 3D关键点匹配评估（Correspondence Recall %）**
DINOv3在几何（NAVI）和语义（SPair）对应任务上均取得最佳性能，表明其特征具有很强的3D感知能力。

| 模型 (ViT) | NAVI (几何) ↑ | SPair (语义) ↑ |
| :--- | :--- | :--- |
| DINOv2 (g/14) | 60.1 | 56.1 |
| AM-RADIOv2.5 (g/14) | 59.4 | 56.8 |
| **DINOv3 (7B/16)** | **64.4** | **58.7** |

### 3.2. 全局特征任务评估

#### 3.2.1. 图像分类与分布外（OOD）泛化

**表 7: ImageNet1k及其变体上的线性探测准确率**
DINOv3是**首个在分类任务上达到与顶级弱监督和全监督模型相媲美性能的自监督模型**。特别是在鲁棒性测试（如ImageNet-C）和难例测试（如ObjectNet）上表现优异。

| 模型 (ViT) | ImageNet Val | ImageNet-R | ImageNet-A | ObjectNet | ImageNet-C ↓ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| DINOv2 (g/14) | 87.3 | 81.1 | 81.7 | 66.4 | 24.1 |
| SigLIP 2 (g/16) | 89.1 | 92.2 | 84.6 | 78.6 | 30.0 |
| PEcore (G/14) | 89.3 | 92.2 | 89.0 | 80.2 | 22.7 |
| **DINOv3 (7B/16)** | **88.4** | **91.1** | **86.9** | **79.0** | **19.6** |

#### 3.2.2. 细粒度分类

**表 8: 细粒度分类任务准确率**
DINOv3在多个细粒度数据集上表现出色，尤其在最具挑战性的iNaturalist 2021上以89.8%的准确率夺魁，超越了所有对比模型。

| 模型 (ViT) | Fine-S (Avg) | iNat18 | iNat21 |
| :--- | :--- | :--- | :--- |
| DINOv2 (g/14) | 92.6 | 80.7 | 86.1 |
| PEcore (G/14) | 94.5 | 86.6 | 87.0 |
| **DINOv3 (7B/16)** | **93.0** | **85.6** | **89.8** |

### 3.3. 下游系统级应用

通过在冻结的DINOv3骨干网络上训练轻量级解码器，构建了多个SotA系统。

- **目标检测** (表 10): 在COCO和COCO-O数据集上，基于DINOv3的检测器（仅训练解码器）取得了新的SotA，mAP达到65.6，展现了卓越的泛化能力。
- **语义分割** (表 11): 在ADE20k上，基于DINOv3的分割系统mIoU达到62.6，与需要完整微调的SotA模型持平或更高。
- **单目深度估计** (表 12): 结合Depth Anything V2的流程，使用冻结的DINOv3骨干网络在多个真实世界数据集上刷新了SotA记录。
- **3D理解** (表 13): 将VGGT框架中的DINOv2替换为DINOv3 ViT-L，在相机姿态估计、多视图重建等任务上均取得了一致的性能提升。

### 3.4. DINOv3模型家族

通过知识蒸馏，DINOv3家族的小尺寸模型在保持高效的同时，性能也远超同等规模的竞品。

**表 14: DINOv3模型家族与开源替代品对比**
以ViT-L（300M参数）为例，DINOv3在密集任务ADE20k上比DINOv2高出6.1 mIoU，在全局任务ObjectNet上高出10.1个点，实现了全方位超越。

| 模型 (L, ~300M) | IN-ReaL | ObjectNet | ADE20k | NYU ↓ | NAVI |
| :--- | :--- | :--- | :--- | :--- | :--- |
| DINOv2 | 89.7 | 64.7 | 48.8 | 0.394 | 59.9 |
| SigLIP 2 | 90.1 | 75.0 | 43.6 | 0.484 | 47.8 |
| **DINOv3** | **90.2** | **74.8** | **54.9** | **0.352** | **62.3** |

### 3.5. 遥感领域应用

DINOv3的训练范式也被成功应用于遥感领域，通过在卫星图像数据集上进行预训练，在树冠高度预测、地理空间分割与检测等任务上取得了SotA性能，证明了其方法的普适性。

**表 19: 高分辨率地理空间任务对比**
DINOv3 Web模型（在通用网络数据上训练）在多个遥感任务上表现惊人，甚至超越了许多在遥感数据上训练的专业模型，如在iSAID分割和DIOR检测任务上均取得SotA。

| 模型 | LoveDA mIoU | iSAID mIoU | DIOR mAP |
| :--- | :--- | :--- | :--- |
| Prev. SotA | 54.4 | 71.9 | 79.5 |
| DINOv3 Sat (7B) | 55.3 | 64.8 | 76.6 |
| **DINOv3 Web (7B)** | **56.2** | **71.4** | **80.5** |

## 4. 结论

DINOv3项目成功地将自监督学习推向了新的高度，其主要贡献可以总结为：
1.  **解决了SSL扩展的核心难题**：通过创新的**Gram锚定**技术，有效遏制了大规模训练中密集特征的退化问题，实现了全局与局部特征质量的协同提升。
2.  **树立了新的性能标杆**：训练出的7B参数模型及其蒸馏家族，在广泛的视觉任务上，特别是**密集预测任务**，取得了前所未有的性能，其通用性和强大能力使其成为理想的“现成”视觉编码器。
3.  **验证了SSL的巨大潜力**：证明了纯粹基于原始图像的自监督学习，在足够大的模型和数据规模下，其性能可以与甚至超越依赖海量人工标注的监督学习方法，为计算机视觉的未来发展开辟了新的道路。

总而言之，DINOv3不仅是一个性能卓越的模型，更是一套可扩展、可复制的训练范式，为构建下一代更强大、更通用的视觉基础模型奠定了坚实的基础。`
    },
    {
      id: "blog-daily-dynamic-fine-tuning-zh",
      title: "DFT方法在大型语言模型数学推理能力提升中的应用与分析",
      file: "Blogs/DailyPaper/Dynamic_Fine_Tuning_zh/report.md",
      difficulty: "中级",
      duration: "0.5h",
      week: 0,
      phase: 0,
      keywords: ["DFT", "Dynamic Fine-Tuning", "数学推理", "微调", "LLM"],
      content: `<span style="color: darkgreen; font-weight: bold; font-family: monospace;">Powered by [MS-Agent](https://github.com/modelscope/ms-agent) | [DocResearch](https://github.com/modelscope/ms-agent/blob/main/projects/doc_research/README.md)</span>
<br>


# DFT方法在大型语言模型数学推理能力提升中的应用与分析

## 1. 研究背景与方法概述

本文深入探讨了 **动态微调（Dynamic Fine-Tuning, DFT）** 方法在提升大型语言模型（LLM）数学推理能力方面的有效性。DFT是一种创新的微调范式，通过动态重加权机制优化训练过程，与传统的监督微调（Supervised Fine-Tuning, SFT）相比展现出显著优势。

研究在多个维度评估了DFT的性能：
- 在5个数学推理基准测试上的表现（Math500、Minerva Math、Olympiad Bench、AIME 2024、AMC 2023）
- 与标准SFT及其他先进方法的对比
- 学习效率与收敛特性
- 超参数敏感性分析

## 2. DFT与SFT的性能比较

### 2.1 整体性能提升

DFT在所有评估的LLM上均显著优于基础模型和标准SFT。如表1所示，DFT带来的平均性能提升远超SFT：

![d4cc2b90.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Dynamic_Fine_Tuning_zh/resources/d4cc2b90.png)<br>

**表1：五个最先进的大型语言模型在五个数学推理基准上的平均@16准确率**

| 模型 | 方法 | Math500 | Minerva Math | Olympiad Bench | AIME24 | AMC23 | Avg. |
|------|------|---------|-------------|---------------|--------|-------|------|
| LLaMA-3.2-3B | Base | 1.63 | 1.36 | 1.01 | 0.41 | 1.56 | 1.19 |
|  | SFT | 8.65 | 2.38 | 2.06 | 0.00 | 3.13 | 3.24 |
|  | **DFT** | **12.79** | **2.84** | **2.90** | **0.83** | **3.91** | **4.65** |
| LLaMA-3.1-8B | Base | 1.86 | 0.98 | 0.94 | 0.21 | 1.01 | 1.00 |
|  | SFT | 16.85 | 5.78 | 3.88 | 0.00 | 5.16 | 6.33 |
|  | **DFT** | **27.44** | **8.26** | **6.94** | **0.41** | **12.03** | **11.02** |
| DeepSeekMath-7B | Base | 6.15 | 2.15 | 1.74 | 0.21 | 2.97 | 2.64 |
|  | SFT | 26.83 | 7.26 | 6.33 | 0.41 | 8.28 | 9.82 |
|  | **DFT** | **41.46** | **16.79** | **15.00** | **1.24** | **16.25** | **18.15** |
| Qwen2.5-Math-1.5B | Base | 31.66 | 8.51 | 15.88 | 4.16 | 19.38 | 15.92 |
|  | SFT | 43.76 | 13.04 | 12.63 | 1.87 | 18.75 | 18.01 |
|  | **DFT** | **64.89** | **20.94** | **27.08** | **6.87** | **38.13** | **31.58** |
| Qwen2.5-Math-7B | Base | 40.12 | 14.39 | 17.12 | 6.68 | 27.96 | 21.25 |
|  | SFT | 53.96 | 16.66 | 18.93 | 2.48 | 26.09 | 23.62 |
|  | **DFT** | **68.20** | **30.16** | **33.83** | **8.56** | **45.00** | **37.15** |

具体数据表明：
- 对于Qwen2.5-Math-1.5B，DFT比基础模型平均提升+15.66分，是SFT提升(+2.09)的5.9倍
- LLaMA-3.2-3B通过DFT获得+3.46分提升，超过SFT(+2.05)约1.4倍
- LLaMA-3.1-8B通过DFT获得+10.02分提升，超过SFT(+5.33)约1.88倍
- DeepSeekMath-7B通过DFT获得+15.51分提升，是SFT(+7.18)的1.58倍
- Qwen2.5-Math-7B通过DFT获得+15.90分提升，几乎是SFT(+2.37)的3.8倍

### 2.2 在挑战性基准上的表现

DFT在具有挑战性的基准测试上展现出卓越的泛化能力和鲁棒性，而标准SFT在这些任务上往往表现不佳甚至产生负面影响：

- **Olympiad Bench**：SFT导致Qwen2.5-Math-1.5B性能下降（从15.88降至12.63），而DFT将其提升至27.08，比基础模型高出+11.20分
- **AIME24**：SFT使Qwen2.5-Math-7B准确率下降4.20分（从6.68降至2.48），而DFT将其提升至8.56，比基础模型高出+1.88分
- **AMC23**：SFT使Qwen2.5-Math-1.5B性能从19.38降至18.75，而DFT将其提升至38.13，比基础模型高出+18.75分

这些结果表明，DFT不仅在各种模型容量上更有效地扩展，而且在传统SFT难以应对的困难推理任务上展现出更强的韧性。

## 3. DFT的学习效率与收敛特性

DFT展现出更优的学习效率和更快的收敛特性。图1展示了Qwen2.5-Math-1.5B在各数学推理基准上DFT与标准SFT的学习动态差异：



**图1：Qwen2.5-MATH-1.5B在数学基准上的准确率进展，展示DFT相对于SFT的更快收敛和更好性能**

DFT相比SFT展现出三大优势：
1. **更快的收敛速度**：在大多数基准测试中，DFT在前120个训练步骤内即可达到峰值性能
2. **更好的早期阶段表现**：DFT在前10-20个步骤的表现已超过SFT的最佳最终准确率
3. **更高的样本效率**：DFT始终需要更少的更新即可达到相对最优结果

这种加速收敛表明，DFT中的动态重加权机制产生了更具信息量的梯度更新，引导模型在训练早期就找到高质量解决方案。这也表明DFT有助于避免标准SFT中常见的优化平台期或噪声敏感区域，从而更高效地获取复杂的数学推理模式。

## 4. DFT与iw-SFT的比较

DFT在大多数设置中优于同期的Importance-Weighted SFT (iw-SFT)方法：

**表2：与同期工作iw-SFT在数学基准上的比较**

| 模型 | 方法 | Math500 | Minerva Math | Olympiad Bench | AIME24 | AMC23 | Avg. |
|------|------|---------|-------------|---------------|--------|-------|------|
| LLaMA-3.2-3B | iw-SFT | 5.13 | 2.63 | 1.51 | 0.00 | 2.03 | 2.26 |
|  | **DFT** | **12.79** | **2.84** | **2.90** | **0.83** | **3.91** | **4.65** |
| LLaMA-3.1-8B | iw-SFT | 18.21 | 4.31 | 4.31 | 0.20 | 7.34 | 6.87 |
|  | **DFT** | **27.44** | **8.26** | **6.94** | **0.41** | **12.03** | **11.02** |
| DeepSeekMath-7B | iw-SFT | 35.32 | 8.75 | 11.11 | 0.61 | 18.28 | 14.81 |
|  | **DFT** | **41.46** | **16.79** | **15.00** | **1.24** | **16.25** | **18.15** |
| Qwen2.5-Math-1.5B | iw-SFT | 59.38 | 17.08 | 26.82 | 8.13 | 40.00 | 30.28 |
|  | **DFT** | **64.89** | **20.94** | **27.08** | **6.87** | **38.13** | **31.58** |
| Qwen2.5-Math-7B | iw-SFT | 70.28 | 25.70 | 34.46 | 16.46 | 51.09 | 39.60 |
|  | **DFT** | **68.20** | **30.16** | **33.83** | **8.56** | **45.00** | **37.15** |

具体表现：
- DFT在大多数模型家族上实现了更高的平均准确率：LLaMA-3.2-3B (+2.39)、LLaMA-3.1-8B (+4.15)、DeepSeekMath-7B (+3.34)和Qwen2.5-Math-1.5B (+1.30)
- 虽然iw-SFT在Qwen2.5-Math-7B上略优于DFT (+2.45)，但这种改进在数据集间并不一致
- iw-SFT在LLaMA模型家族上表现出有限的鲁棒性：
  - LLaMA-3.2-3B：iw-SFT在Math500 (5.13 vs. 8.65)和AMC23 (2.03 vs. 3.13)上表现不如标准SFT
  - LLaMA-3.1-8B：iw-SFT在Minerva Math (4.31 vs. 5.78)和AMC23 (7.34 vs. 8.28)上表现更差

这些案例表明，iw-SFT可能难以泛化到特定训练信号之外，在分布偏移或更难的基准测试上甚至可能导致性能下降。相比之下，DFT在几乎所有数据集上都一致地改进了基础模型和SFT，包括iw-SFT失败的那些数据集。

此外，iw-SFT需要额外的参考模型来计算重要性权重，增加了计算开销，而DFT直接从模型的token概率动态导出其权重，实现了更高效的训练过程。

## 5. DFT在离线强化学习设置中的应用

研究还探索了DFT在离线强化学习(RL)设置中的应用，其中奖励稀疏性问题可能比SFT设置得到缓解：

**表3：在使用拒绝采样的离线强化学习设置中，在五个数学推理基准上的评估结果**

| 模型 | 设置 | Math500 | Minerva Math | Olympiad Bench | AIME24 | AMC23 | Avg. |
|------|------|---------|-------------|---------------|--------|-------|------|
| Qwen2.5-Math-1.5B | - | 31.66 | 8.51 | 15.88 | 4.16 | 19.38 | 15.92 |
| Qwen2.5-Math-1.5B w/SFT | SFT | 43.14 | 11.64 | 13.41 | 1.03 | 14.84 | 16.81 |
| Qwen2.5-Math-1.5B w/iw-SFT | SFT | 59.38 | 17.08 | 26.82 | 8.13 | 40.00 | 30.28 |
| Qwen2.5-Math-1.5B w/DFT | SFT | 62.50 | 22.94 | 26.87 | 7.31 | 33.75 | 30.67 |
| Qwen2.5-Math-1.5B w/DPO | Offline | 46.89 | 11.53 | 22.86 | 4.58 | 30.16 | 23.20 |
| Qwen2.5-Math-1.5B w/RFT | Offline | 48.23 | 14.19 | 22.29 | 4.37 | 30.78 | 23.97 |
| Qwen2.5-Math-1.5B w/PPO | Online | 56.10 | 15.41 | 26.33 | 7.50 | 37.97 | 28.66 |
| Qwen2.5-Math-1.5B w/GRPO | Online | 62.86 | 18.93 | 28.62 | 8.34 | 41.25 | 32.00 |
| Qwen2.5-Math-1.5B w/iw-SFT | Offline | 60.80 | 18.13 | 27.83 | 8.33 | 44.21 | 31.86 |
| Qwen2.5-Math-1.5B w/DFT | Offline | **64.71** | **25.16** | **30.93** | **7.93** | **48.44** | **35.43** |

实验方法：
- 采用常用的拒绝采样微调(RFT)框架
- 从基础模型本身为10,000个数学问题采样响应，温度为1.0，每个问题生成4个响应
- 使用math verify识别正确响应并保留为训练数据，约140,000个示例
- 对于DPO训练，从生成的响应中构建100,000个正负偏好对

结果表明：
- DFT在离线RL设置中实现了最佳整体性能，平均得分为35.43
- DFT超越了所有离线(RFT、DPO)和在线(PPO、GRPO)基线方法
- 在AMC23基准上，DFT达到了48.44的高分，远超其他方法

![8bf10d17.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Dynamic_Fine_Tuning_zh/resources/8bf10d17.png)<br>

**图2：训练集上的token概率分布在DFT、SFT和各种RL方法（包括DPO、PPO和GRPO）微调前后的对比，y轴使用对数刻度以提高可视化清晰度**

图2展示了不同方法对token概率分布的影响，进一步说明了DFT如何有效调整模型的输出分布以提高数学推理能力。

## 6. 超参数敏感性分析

为评估DFT对关键训练超参数的鲁棒性，研究进行了针对学习率和批量大小的消融实验：

![9e0f911a.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Dynamic_Fine_Tuning_zh/resources/9e0f911a.png)<br>
![9b81e5be.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Dynamic_Fine_Tuning_zh/resources/9b81e5be.png)<br>

**图3：对DFT和SFT在Qwen2.5-Math-1.5B模型上的训练超参数（学习率和批量大小）的消融研究**

研究旨在回答两个核心问题：
1. DFT与SFT之间的性能差距是否源于SFT的次优超参数配置？
2. 两种方法对学习率和批量大小的变化有多敏感？

### 6.1 学习率敏感性

评估了四种学习率：2e-4、1e-4、5e-5和1e-5。结果显示：
- 两种方法对学习率都表现出一定程度的敏感性
- DFT在所有配置下始终优于SFT，表明性能差距不能仅归因于SFT的次优超参数选择
- 对于两种方法，中等学习率(1e-4和5e-5)产生最佳结果
- 学习率过低(1e-5)或过高(2e-4)都会导致明显性能下降
- 这一发现强调了在基于梯度的微调中适当调整学习率的重要性

### 6.2 批量大小敏感性

评估了从32到256的批量大小。结果显示：
- DFT和SFT在批量大小的全范围内都表现出相对稳定的性能
- 虽然观察到轻微波动，但没有一致的趋势表明较大或较小的批量会显著影响最终准确率
- 这表明批量大小在此设置中不是主导因素，实践中默认值可能就足够

## 7. 结论与启示

本研究全面评估了DFT方法在提升LLM数学推理能力方面的有效性，得出以下关键结论：

1. **显著性能提升**：DFT在所有评估的LLM上均显著优于基础模型和标准SFT，平均提升幅度是SFT的1.4-5.9倍

2. **卓越的鲁棒性**：DFT在具有挑战性的基准测试（如Olympiad Bench、AIME24和AMC23）上表现出色，而SFT在这些任务上往往表现不佳甚至产生负面影响

3. **高效的学习特性**：DFT展现出更快的收敛速度、更好的早期阶段表现和更高的样本效率，通常在前120个训练步骤内即可达到峰值性能

4. **优于竞争方法**：DFT在大多数设置中优于同期的iw-SFT方法，且在LLaMA模型家族上展现出更好的泛化能力

5. **离线RL中的优势**：DFT在离线强化学习设置中也表现出色，超越了各种离线和在线基线方法

6. **超参数鲁棒性**：DFT对学习率和批量大小的变化表现出良好的鲁棒性，性能优势不依赖于特定的超参数配置

这些发现表明，DFT是一种简单而有效的微调策略，特别适用于需要复杂推理能力的任务。与传统RL流水线相比，DFT在偏好监督可用但奖励建模或在线响应采样成本高昂或不切实际的领域中具有明显优势。

未来研究方向可能包括将DFT应用于其他推理密集型任务（如代码生成、科学推理等），以及进一步优化其动态重加权机制以适应更广泛的应用场景。`
    },
    {
      id: "blog-daily-intern-s1",
      title: "Intern-S1：开源科学多模态大推理模型技术报告",
      file: "Blogs/DailyPaper/Intern-S1_Tech_Report/report.md",
      difficulty: "中级",
      duration: "0.5h",
      week: 0,
      phase: 0,
      keywords: ["Intern-S1", "科学多模态", "大推理模型", "InternLM", "技术报告"],
      content: `<span style="color: darkgreen; font-weight: bold; font-family: monospace;">Powered by [MS-Agent](https://github.com/modelscope/ms-agent) | [DocResearch](https://github.com/modelscope/ms-agent/blob/main/projects/doc_research/README.md)</span>
<br>


---
# Intern-S1：开源科学多模态大推理模型技术报告

![fbccf864.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Intern-S1_Tech_Report/resources/fbccf864.png)<br>

## 1. 摘要

本文介绍**Intern-S1**，一个专为解决复杂科学任务设计的开源多模态大推理模型。该模型能够处理图像、文本和科学数据（包括非自然视觉数据、分子结构和时间序列信号），旨在弥合开源与闭源模型在科学理解与推理能力方面的差距。Intern-S1在科学领域基准测试中表现卓越，显著缩小了与闭源模型的性能差距，为加速科学发现提供了基础工具。

## 2. 背景与挑战

### 2.1 科学AI研究的重要性

科学研究所代表的人工通用智能(AGI)终极目标之一，因其推动人类社会根本性突破的潜力而备受重视。科学AI对模型提出了独特而严格的要求：

- 理解和捕捉多样但低资源分布的科学模态（从分子结构到时间序列信号）的内在规律
- 执行长期、严谨的推理过程，如假设验证和实验设计优化

### 2.2 当前开源模型的局限性

尽管开源多模态大模型和大推理模型(LRMs)在公众关注领域（如自然图像理解、数学问题解决和代码生成）已接近或部分超越闭源模型，但在高价值科学领域：

- 开源基础模型的发展显著落后于其在数学和代码等领域的进展
- 开源与闭源模型在科学领域仍存在显著差距，限制了前者对前沿研究的实质性贡献

![f7118c51.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Intern-S1_Tech_Report/resources/f7118c51.png)<br>
**图1：开源和闭源模型在图像-文本和纯文本基准测试中的性能比较**  
结果显示，Intern-S1在开源模型中具有顶级的一般推理能力，并在科学领域超越闭源模型。  
- **通用基准**：MMLU-Pro（纯文本）、GPQA（纯文本）、AIME2025（纯文本）、MMMU、MMStar  
- **科学基准**：SmolInstruct（纯文本）、ChemBench（纯文本）、MatBench（纯文本）、SFE、Physics

![7f137696.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Intern-S1_Tech_Report/resources/7f137696.png)<br>
**图2：LLM在流行和低资源（科学）任务上的性能趋势**  
- X轴：三个流行通用基准的平均值（MMLU-Pro、GPQA、AIME2025）
- Y轴：三个科学领域基准的平均值（SmolInstruct、ChemBench、MatBench）
- 尽管顶级开源LLM在流行任务上快速提升性能，但在科学任务上的表现并未同步增长

## 3. Intern-S1模型概述

Intern-S1是一个开源科学多模态模型，旨在解决复杂科学任务。其核心目标是探索一条可行的AGI发展路径，特别是在数据稀缺的科学领域。

### 3.1 核心挑战与解决方案

**关键问题**：如何以可扩展的方式增强模型处理低资源任务的能力？

**解决方案**：从预训练和后训练阶段的可扩展角度入手：

1. **预训练阶段**：构建高质量、高比例的科学数据集
2. **后训练阶段**：开发混合奖励框架(MoR)，整合多任务学习

## 4. 模型架构与技术创新

### 4.1 整体架构

![beace069.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Intern-S1_Tech_Report/resources/beace069.png)<br>
**图3：Intern-S1架构**  
由以下组件构成：
- MoE LLM（专家混合语言模型）
- 视觉编码器（InternViT-6B用于Intern-S1，InternViT-300M用于Intern-S1-mini）
- 时间序列编码器
- 动态分词器：针对自然语言和科学输入切换分词和嵌入策略

### 4.2 视觉编码器

- **Intern-S1**：采用InternViT-6B，通过从对比预训练到LLM耦合的下一个标记预测进行增量优化，提供强大的高分辨率、细粒度视觉表示
- **Intern-S1-mini**：采用InternViT-300M，是6B教师模型的蒸馏版本，进一步使用NLP损失训练，提供高效编码器
- **处理能力**：可在固定输入大小448×448像素或动态分辨率下操作
- **视觉标记处理**：采用像素解混洗(pixel unshuffle)将视觉标记数量减少4倍，然后通过MLP投影器与语言模型嵌入空间对齐

### 4.3 动态分词器技术

#### 4.3.1 问题背景

科学数据结构（如分子式和蛋白质序列）作为标记序列处理时面临两个关键问题：

1. **分词策略单一**：静态分词器对所有序列应用相同的分割策略，导致科学领域压缩效率低下
2. **嵌入共享问题**：同一字符在不同模态中共享相同嵌入，可能偏向最频繁的用法，限制科学模态性能

#### 4.3.2 动态分词器解决方案

![00240097.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Intern-S1_Tech_Report/resources/00240097.png)<br>
**图4：动态分词器工作流程与压缩率比较**  
- **左图**：动态分词器工作流程
  1. 使用基于规则的检测器或用户标注的特殊标签检测输入字符串中的模式
  2. 将输入字符串分割成不同部分
  3. 每部分使用不同策略进行分词，其嵌入空间相互正交
  4. 将这些向量连接作为常规Transformer输入
- **右图**：不同分词器在科学数据（SMILES格式）上的压缩率比较
  - Intern-S1比其他模型（GPTOSS-120B、Deepseek-R1、Qwen3系列）高出70%以上

#### 4.3.3 压缩率计算

分词效率通过字符每标记(Characters-per-Token)量化：

$$
CR(\\tau, D) = \\frac{\\sum_{x \\in D} \\text{len}(x)}{\\sum_{x \\in D} |\\tau(x)|}
$$

其中字符串长度以Unicode字符测量。

Intern-S1目前支持四种模态（未来计划扩展），每种模态可通过特殊标签标记（如\`<FASTA>\`、\`<SMILES>\`），并使用启发式规则和领域特定工具（如RDKit）自动检测分子和蛋白质字符串。

## 5. 训练数据处理

### 5.1 PDF文档解析

![f05474ca.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Intern-S1_Tech_Report/resources/f05474ca.png)<br>
**图7：PDF文档解析流程**  
- 将PDF文档拆分为页面，使用低成本解析器获取文本数据
- 采用方程和符号标记检测器检查页面是否需要通过高成本解析器(VLMs)进行高级处理
- 低/高成本解析器的后处理不同，因为它们有专门的错误案例模式
- 所有解析页面合并为单一数据样本

**关键发现**：
- 解析质量对PDF文档至关重要，尤其对包含大量方程和符号的科学领域
- 无现有解析工具能完美处理所有PDF类型，成本差异大
- 采用页面级解析管道：先用低成本解析器(MinerU)，再根据方程/符号数量决定是否使用高成本解析器(VLMs)
- 高成本解析器速度比低成本慢20倍，仅对5%（存档库）或3%（网络爬取）的页面使用

### 5.2 基于域的网络数据解析

![61705d87.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Intern-S1_Tech_Report/resources/61705d87.png)<br>
**图8：基于域的网络数据解析流程**  
- 按URL地址对网页分组
- 对每个URL域，采样数百个页面并输入LLM分类器
- 根据所有采样页面的分类结果，按启发式规则做决策
- 三种可能操作：
  1. 丢弃：如果质量低且信息不足
  2. 重写：如果质量低但内容信息丰富
  3. 选择：作为训练数据候选

**动机**：同一URL域的页面通常共享特征（如解析问题），而LLM分类器成本高，域级解析可在可接受成本下识别结构模式。

### 5.3 科学数据召回与过滤

![aee79fc5.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Intern-S1_Tech_Report/resources/aee79fc5.png)<br>
**图9：科学数据召回与过滤流程**  
- 根据涵盖各种科学和通用领域的分类法，为每个目标域构建专门的召回和过滤管道
- 准备域内和域外验证集以自动优化提示
- 提示触发LLM注释大型银集，训练低成本分类器过滤网络数据池

**效果**：手动评估显示，六个目标域中目标域数据比例从2%提高到50%。

![f363b30b.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Intern-S1_Tech_Report/resources/f363b30b.png)<br>
**图6：文本CPT数据总体统计**  
- **左图**：继续预训练5T高质量文本标记，其中科学数据占2.5T以上
- **右图**：重点关注的六个科学领域分布（如生命科学采用严格过滤，材料科学采用宽松过滤）

### 5.4 多模态科学数据管道

在图像-文本继续预训练(CPT)阶段，构建两类数据集：
1. 交错图像-文本数据集
2. 纯文本数据集

**数据来源**：
- InternVL3的多模态预训练语料库（涵盖图像描述、通用问答、数学、图表等）
- 第4.1.1节描述的文本语料库
- 多模态科学数据（覆盖专业领域）

**总训练标记**：约2500亿，包括700亿语言数据和1800亿交错图像-文本数据（其中科学数据300亿）。

## 6. 训练策略

### 6.1 批量大小策略

![beaa12f2.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Intern-S1_Tech_Report/resources/beaa12f2.png)<br>
**图10：不同批量大小策略的性能趋势**  
- 红/蓝线：训练过程中使用固定批量大小
- 紫线：训练4000亿标记后，批量大小从4M切换到10M

**发现**：
- 早期阶段（前7000亿标记），小批量训练的模型优于大批量训练的模型
- 大批量提供更高训练效率
- 最佳策略：分阶段训练，初期采用小批量，后期切换到大批量

### 6.2 起始点选择

![1efd0c13.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Intern-S1_Tech_Report/resources/1efd0c13.png)<br>
**图11：选择不同起点（基础模型和指令模型）的比较**

**研究结论**：
- 指令模型在编码基准上表现略好
- 指令模型作为CPT起点在最终性能上可接受
- 当后训练显著提升模型能力时，指令模型是更好的选择（但仅在特定领域观察到此效果）
- 基础模型初始熵略高（0.19 vs 0.15），但可通过RL超参数调整缓解

### 6.3 混合奖励框架(MoR)

![2c66f385.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Intern-S1_Tech_Report/resources/2c66f385.png)<br>
**图12：混合奖励框架**  
- 整合来自1000多个任务的多样化奖励信号
- 使模型同时获得领域专业化和通用能力
- 通过跨任务策略优化，保持专业任务高性能，同时保持开放对话场景的鲁棒性和适应性

### 6.4 混合数据过滤策略

**离线过滤阶段**：
- 使用小型密集SFT模型和大型MoE SFT模型对原始数据集进行rollout
- 每个问题生成8次，与参考解决方案比较计算通过率$\\hat{r}$
- 丢弃$\\hat{r}_{dense}(x) = 1.0$（过于简单）和$\\hat{r}_{dense}(x) \\leq 0.25$（噪声数据）的问题

**在线过滤阶段**：
- 每个问题以8次rollout为一组处理
- 过滤所有rollout完全正确或完全错误的轨迹
- 移除包含乱码文本或无限重复的错误样本

![9047f361.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Intern-S1_Tech_Report/resources/9047f361.png)<br>
**图13：与DAPO策略的比较**  
- 使用本文策略的模型在AIME2024评估集上比DAPO过滤方法有显著更快的改进

### 6.5 熵控制

![04e97f65.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Intern-S1_Tech_Report/resources/04e97f65.png)<br>
**图14：有无熵控制的Intern-S1 MoE模型的熵和平均验证集准确率**  
- 采用KL-Cov熵控制策略，保持训练过程中的探索
- 设置效果标记比$k$为0.2，KL系数$\\beta$为0.01
- 模型熵保持在约0.2，正确率在多个评估集上持续上升

## 7. 实验结果

### 7.1 评估设置

**解码参数**：

| 参数 | Intern-S1 | Intern-S1-mini |
|------|-----------|----------------|
| max tokens | 65536 | 65536 |
| temperature | 0.7 | 0.8 |
| top p | 0.95 | 0.95 |
| top k | 50 | 50 |
| repetition penalty | 1.0 | 1.0 |

**表1：评估中使用的解码参数**

### 7.2 一般推理能力评估


**图5：Intern-S1的四个训练阶段**  
仅第一阶段在单一模态上训练

**表2：Intern-S1在一般推理基准测试上的定量性能**

| 模型类型 | 指标 | Intern-S1 | 最佳闭源模型 | 最佳开源模型 |
|----------|------|-----------|--------------|--------------|
| **闭源API模型** | MMLU-Pro | - | 86.0 (Gemini-2.5 Pro) | - |
|  | GPQA | - | 83.8 (Gemini-2.5 Pro) | - |
|  | AIME2025 | - | 88.9 (OpenAI o3) | - |
|  | IFEval | - | 92.2 (OpenAI o3) | - |
|  | MathVista | - | 80.3 (Gemini-2.5 Pro) | - |
|  | MMMU | - | 81.9 (Gemini-2.5 Pro) | - |
|  | MathVision | - | 73.0 (Gemini-2.5 Pro) | - |
|  | MMStar | - | 79.3 (Gemini-2.5 Pro) | - |
| **开源LLM** | MMLU-Pro | **83.5** | 86.0 | 83.5 |
|  | GPQA | **77.3** | 83.8 | 77.3 |
|  | AIME2025 | **86.0** | 88.9 | 86.0 |
|  | IFEval | **86.7** | 92.2 | 86.7 |
|  | MathVista | **81.5** | 80.3 | 81.5 |
|  | MMMU | **77.7** | 81.9 | 77.7 |
|  | MathVision | **62.5** | 73.0 | 62.5 |
|  | MMStar | **74.9** | 79.3 | 74.9 |

**关键发现**：
- Intern-S1是所有八项任务中表现最佳的开源多模态模型
- 在MathVista上取得最佳结果(81.5)
- 显著优于先前开源MLLM（如MathVista：比InternVL3-78B/Qwen2.5VL-72B高+2.5/+6.7）
- 在纯文本GPQA和IFEval上仍落后于领先API模型，但在AIME2025上具有竞争力

### 7.3 科学领域推理能力评估

**表3：Intern-S1在科学相关基准测试（纯文本）上的定量性能**

| 模型类型 | 指标 | Intern-S1 | 最佳闭源模型 | 最佳开源模型 |
|----------|------|-----------|--------------|--------------|
| **闭源API模型** | SmolInstruct | - | 47.3 (Grok-4) | - |
|  | ChemBench | - | 83.3 (Grok-4) | - |
|  | MatBench | - | 67.9 (Grok-4) | - |
|  | ProteinLMBench | - | 67.7 (OpenAI o3) | - |
| **开源LLM** | SmolInstruct | **51.0** | 47.3 | 51.0 |
|  | ChemBench | **83.4** | 83.3 | 83.4 |
|  | MatBench | **75.0** | 67.9 | 75.0 |
|  | ProteinLMBench | **63.1** | 67.7 | 63.1 |

**表4：Intern-S1在科学相关基准测试（多模态）上的定量性能**

| 模型类型 | 指标 | Intern-S1 | 最佳闭源模型 | 最佳开源模型 |
|----------|------|-----------|--------------|--------------|
| **闭源API模型** | SFE | - | 44.3 (Intern-S1) | - |
|  | Physics | - | 47.9 (OpenAI o3) | - |
|  | MicroVQA | - | 63.9 (Intern-S1) | - |
|  | MSEarthMCQ | - | 65.7 (Intern-S1) | - |
|  | XLRS-Bench | - | 55.0 (Intern-S1) | - |
| **开源LLM** | SFE | **44.3** | 44.3 | 44.3 |
|  | Physics | **44.0** | 47.9 | 44.0 |
|  | MicroVQA | **63.9** | 63.9 | 63.9 |
|  | MSEarthMCQ | **65.7** | 65.7 | 65.7 |
|  | XLRS-Bench | **55.0** | 55.0 | 55.0 |

**关键发现**：
- **纯文本科学基准**：Intern-S1在四个数据集中的三个上取得最佳结果（SmolInstruct 51.0、ChemBench 83.4、MatBench 75.0），大幅领先先前开源MLLM（如MatBench：比InternVL3-78B高+25.7）
- **多模态科学基准**：Intern-S1在5个数据集中的4个上取得最佳结果（SFE 44.3、MicroVQA 63.9、MSEarthMCQ 65.7、XLRS-Bench 55.0），在Physics上排名第二（44.0 vs o3的47.9）
- 与开源基线相比，增益一致且显著

### 7.4 Intern-S1-mini性能评估

**表5：Intern-S1-mini在一般推理基准测试上的定量性能**

| 模型 | MMLU-Pro | GPQA | AIME2025 | IFEval | MathVista | MMMU | MathVision | MMStar |
|------|----------|------|----------|--------|-----------|------|------------|--------|
| Qwen3-8B | 73.7 | 62.0 | 67.3 | 85.0 | - | - | - | - |
| GLM-4.1V-Thinking | 57.1 | 50.3 | 32.0 | 71.5 | 80.7 | 69.9 | 53.9 | 71.5 |
| MiMo-VL-7B-RL-2508 | 73.9 | 60.4 | 64.4 | 71.4 | 79.4 | 70.6 | 38.1 | 72.9 |
| **Intern-S1-mini** | **74.8** | **65.2** | **80.0** | **81.2** | **70.3** | **72.3** | **51.4** | **65.2** |

**表6：Intern-S1-mini在科学相关基准测试（纯文本）上的定量性能**

| 模型 | SmolInstruct | ChemBench | MatBench | ProteinLMBench |
|------|--------------|-----------|----------|----------------|
| Qwen3-8B | 17.6 | 61.1 | 45.2 | 59.1 |
| GLM-4.1V-Thinking | 18.1 | 56.2 | 54.3 | 58.3 |
| MiMo-VL-7B-RL-2508 | 16.1 | 66.8 | 46.9 | 59.8 |
| **Intern-S1-mini** | **32.2** | **76.5** | **61.6** | **63.1** |

**表7：Intern-S1-mini在科学相关基准测试（多模态）上的定量性能**

| 模型 | SFE | Physics | MicroVQA | MSEarthMCQ | XLRS-Bench |
|------|-----|---------|----------|------------|------------|
| GLM-4.1V-Thinking | 43.2 | 28.3 | 50.2 | 50.3 | 49.8 |
| MiMo-VL-7B-RL-2508 | 43.9 | 28.2 | 51.0 | 47.3 | 12.3 |
| **Intern-S1-mini** | **35.8** | **28.8** | **56.6** | **58.1** | **51.6** |

**关键发现**：
- Intern-S1-mini在一般推理和科学领域基准测试中均优于同类开源模型
- 在科学任务上表现尤为突出，如ChemBench达到76.5，MatBench达到61.6
- 证明了模型架构和训练方法的有效性在不同规模模型上的可迁移性

## 8. 结论与展望

### 8.1 主要贡献

1. **科学多模态模型**：Intern-S1是首个专注于科学领域的开源多模态大推理模型，在科学基准测试中显著缩小了与闭源模型的差距
2. **动态分词器**：创新性地解决了科学数据处理中的分词和嵌入问题，压缩率提高70%以上
3. **数据处理管道**：开发了高质量的PDF解析、基于域的网络数据解析和科学数据召回过滤方法
4. **混合奖励框架**：实现了1000多个任务的同时学习，平衡了专业能力和通用性

### 8.2 未来展望

- 扩展支持的科学模态类型
- 优化模型在指令遵循约束方面的表现
- 进一步缩小与闭源模型在通用推理任务上的差距
- 探索模型在实际科学发现中的应用

Intern-S1代表了向AGI迈进的重要一步，特别是在数据稀缺的科学领域。通过开源这一模型，研究社区可以共同推进科学AI的发展，加速人类社会的根本性突破。`
    },
    {
      id: "blog-daily-longcat",
      title: "LongCat-Flash模型技术报告",
      file: "Blogs/DailyPaper/LongCat_report_zh/report.md",
      difficulty: "中级",
      duration: "0.5h",
      week: 0,
      phase: 0,
      keywords: ["LongCat-Flash", "技术报告", "大模型", "美团", "MoE"],
      content: `# LongCat-Flash模型技术报告



## 1. 模型概述

LongCat-Flash是由美团推出的5600亿参数混合专家（Mixture-of-Experts, MoE）语言模型，专为计算效率和高级 Agent能力而设计。该模型在保持高性能的同时实现了显著的计算效率提升，主要特点包括：

- **参数规模**：总参数5600亿，采用MoE架构
- **动态计算**：通过Zero-computation Experts实现动态计算预算分配，根据上下文需求激活186-313亿参数（平均270亿/每token）
- **训练规模**：在30天内完成超过20万亿token的训练
- **推理性能**：推理速度超过100 tokens/s，成本为每百万输出token 0.70美元
- **开源状态**：模型检查点已开源，促进社区研究


![9baaec30.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/LongCat_report_zh/resources/9baaec30.png)<br>
**图1：LongCat-Flash基准性能测试结果**

## 2. 核心技术创新

### 2.1 Zero-computation Experts

Zero-computation Experts是LongCat-Flash的核心创新之一，实现了动态计算资源分配机制：

- **工作原理**：在标准FFN专家基础上扩展Z个零计算专家，这些专家直接返回输入$x_t$作为输出，不引入额外计算成本
- **动态激活**：路由器为每个token分配K个专家，根据上下文重要性动态调整激活的FFN专家数量
- **数学表达**：
  $$
  y_t = \\sum_{i=1}^{K} R(x_t)_i \\cdot f_i(x_t)
  $$
  其中$R$表示softmax路由器，$b_i$是第$i$个专家对应的专家偏差

- **专家偏差机制**：采用PID控制器更新专家偏差，确保token分配收敛到目标比例
  $$
  \\Delta b_i = \\mu \\cdot \\left(K_e - \\frac{T_i}{T_{all}}\\right)
  $$
  其中$\\mu$表示偏差适应率，$T_{all}$表示全局批次中的token数量，$T_i$表示路由到第$i$个专家的token数量，$K_e$表示预期激活的FFN专家数量

![04824d0f.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/LongCat_report_zh/resources/04824d0f.png)<br>
**图3：(a) 在匹配计算预算下，有/无零计算专家的模型验证损失曲线比较；(b) LongCat-Flash训练期间激活的FFN专家平均数量；(c) 激活FFN专家的标准差增长到3，表明不同token间激活参数的显著变异性**

### 2.2 Shortcut-connected MoE (ScMoE)

ScMoE是LongCat-Flash的另一项关键创新，通过重新排序执行流水线显著提升效率：

- **核心机制**：引入跨层快捷连接，使前一个块的密集FFN与当前MoE层的调度/组合通信并行执行
- **优势**：
  - 扩大计算-通信重叠窗口，提升训练和推理效率
  - 与模型规模和注意力架构选择正交，不影响模型质量
  - 允许密集FFN的内部节点张量并行通信与专家并行通信同时进行

![77b00734.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/LongCat_report_zh/resources/77b00734.png)<br>
**图2：LongCat-Flash采用的架构。每层使用带有零计算专家的Shortcut-connected MoE (ScMoE)**

![74aca5f6.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/LongCat_report_zh/resources/74aca5f6.png)<br>
**图4：在四种不同模型配置下，比较基线模型（无ScMoE）与其ScMoE增强对应模型的训练损失曲线**

## 3. 模型架构优化

### 3.1 改进的多头潜在注意力(MLA)

LongCat-Flash采用改进的多头潜在注意力(MLA)机制，引入缩放校正因子$\\alpha_q$和$\\alpha_{kv}$解决不对称低秩分解中的方差不平衡问题：

- **数学表达**：
  $$
  \\text{MLA}(h_t) = \\text{Concat}(\\alpha_q \\cdot q^C_t, \\alpha_q \\cdot q^R_t) \\cdot \\text{Softmax}\\left(\\frac{(\\alpha_{kv} \\cdot k^C_t + \\alpha_{kv} \\cdot k^R_t)^T}{\\sqrt{d_k}}\\right) \\cdot v_t
  $$

- **缩放校正因子**：
  $$
  \\alpha_q = \\sqrt{\\frac{d_{model}}{d_q}}, \\quad \\alpha_{kv} = \\sqrt{\\frac{d_{model}}{d_{kv}}}
  $$

![e001fc1e.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/LongCat_report_zh/resources/e001fc1e.png)<br>
**图5：(a) 在1B激活MoE模型上，MLA中引入缩放校正因子显示出改进的收敛性（更低的损失）；(b) 模型增长实验中6B激活MoE模型的验证损失曲线**

### 3.2 细粒度专家策略与方差补偿

LongCat-Flash采用细粒度专家策略，将每个专家分割为$m$个更细粒度的专家，以增强组合灵活性和知识专业化：

- **方差补偿机制**：解决专家分割导致的初始化方差降低问题
  $$
  y_t = \\gamma \\cdot \\sum_{i=1}^{mN} g_i \\cdot f_i(x_t)
  $$
  其中$\\gamma = m$，$g_i$是$mN$个细粒度专家上的路由器输出

- **补偿原理**：补偿门控稀释和维度降低导致的方差减少
  - 门控稀释：将原始$N$个专家分解为$m$个更细粒度的专家，输出方差减少约$m$倍
  - 维度降低：每个细粒度专家的中间隐藏维度减少$m$倍，输出方差再减少$m$倍

## 4. 训练方法与框架

### 4.1 超参数转移策略

LongCat-Flash采用基于宽度缩放的超参数转移策略高效训练大规模模型：

- **转移机制**：以宽度缩放因子$s = n_{target}/n_{proxy}$为中心
- **Adam LR Full Align规则**：针对标准参数化的理论驱动缩放规则

![cec50112.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/LongCat_report_zh/resources/cec50112.png)<br>
**表1：实用超参数转移规则及其基础缩放指数，源自标准参数化的Adam LR Full Align原则**

| 组件 | 目标模型设置 | 缩放指数 |
|------|------------|---------|
| 嵌入层（初始化方差, $\\sigma^2$） | $\\sigma^2_{target} = \\sigma^2_{proxy}$ | 0 |
| 嵌入层（学习率, $\\eta$） | $\\eta_{target} = \\eta_{proxy}$ | 0 |
| 隐藏层/非嵌入层（初始化方差, $\\sigma^2$） | $\\sigma^2_{target} = \\sigma^2_{proxy}/s$ | -1 |
| 隐藏层/非嵌入层（学习率, $\\eta$） | $\\eta_{target} = \\eta_{proxy}/s$ | -1 |

### 4.2 训练稳定性保障

LongCat-Flash从三个维度增强训练稳定性：

#### 4.2.1 路由器稳定性
- **挑战**：语言建模(LM)损失与辅助负载均衡(LB)损失之间的张力
- **监控框架**：
  - 路由器权重相似度：测量专家权重向量间的平均成对余弦相似度
  - 梯度范数比($R_g$)：量化两个损失对批次平均专家概率向量$\\vec{P}$的相对影响
    $$
    R_g = \\frac{\\|\\nabla_{\\vec{P}} L_{LB}\\|}{\\|\\nabla_{\\vec{P}} L_{LM}\\|}
    $$
- **实践指南**：选择使$R_g < 0.1$的系数$\\alpha$，确保负载均衡项作为正则化器而不压倒LM损失

#### 4.2.2 激活稳定性（隐藏z-loss）
- **设计目的**：抑制训练中广泛出现的大规模激活现象
- **数学表达**：
  $$
  L_{hidden-z} = \\lambda \\cdot \\frac{1}{|x_t|} \\sum_{i=1}^{|x_t|} \\text{abs}(\\log(\\text{softmax}(x_t)_i)^2)
  $$
  其中$\\lambda$是加权损失的系数

![753d4ed8.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/LongCat_report_zh/resources/753d4ed8.png)<br>
**图6：具有次优超参数的小模型中最后一层隐藏状态的L2范数和训练损失。引入可忽略系数的隐藏z-loss稳定了范数曲线而不降低训练损失**

#### 4.2.3 优化器稳定性（Adam的Epsilon配置）
- **关键发现**：随着模型规模增大，Adam优化器中的epsilon($\\epsilon$)参数变得至关重要
- **阈值效应**：当$\\epsilon$接近观察到的梯度RMS范数时，性能显著下降
- **实践建议**：将$\\epsilon$设置为比预期梯度RMS范数小几个数量级的值
- **LongCat-Flash配置**：$\\epsilon = 1e-16$

![d863e715.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/LongCat_report_zh/resources/d863e715.png)<br>
**图7：探索梯度RMS范数和epsilon对不同模型大小损失的影响**

### 4.3 预训练与后训练

#### 4.3.1 数据处理流程
- **内容提取**：使用定制版trafilatura处理通用网络内容，专用流程处理STEM材料
- **质量过滤**：两步过滤方法，先移除明显低质量文档，再基于流畅度和内容完整性进行精细筛选
- **去重**：使用高效MinHash实现大规模去重，补充识别和处理重复网页模板的策略

#### 4.3.2 数据混合策略
- **阶段1**：采用SampleMix的实例级数据混合策略，平衡数据质量和多样性
  - 基于质量和多样性分数计算初始采样分布
  - 根据细粒度领域和写作风格标签进一步调整分布倾向
  - 下采样冗余低价值领域（如广告、体育、招聘），上采样推理丰富领域（如科学）
  
- **阶段2**：优先考虑推理密集型领域，STEM和代码占最终混合的70%
  - 通过连续困惑度监控实现代码比例的渐进式增加
  - 确保平滑过渡而不损害一般性能

#### 4.3.3 上下文长度扩展
- **两阶段策略**：
  1. 上下文窗口从8k扩展到32k，使用800亿训练token，RoPE基础频率从1,000,000提高到5,000,000
  2. 进一步扩展到128k，通过额外200亿token，基础频率提高到10,000,000

- **数据构建**：基于自然长文本数据（高质量书籍和小说）构建训练语料库
  - 开发系统方法组织仓库级源代码，提高模型长上下文能力
  - 仔细选择高质量仓库，应用多阶段过滤流程

## 5. 性能评估

### 5.1 基础模型评估


**表2：LongCat-Flash与其他基础模型的比较**

LongCat-Flash Base模型在紧凑的激活/总参数规模下实现了与最先进基础模型相当的性能：
- **一般领域**：在MMLU-Pro基准测试中表现突出（70.32分）
- **推理任务**：在大多数基准测试中获得更高的平均分数
- **数学和编码任务**：在大多数基准测试中优于DeepSeek-V3.1 Base，仅在CRUXEval和MultiPL-E上略有差距

### 5.2 指令微调模型评估


**表3：前沿聊天模型的评估结果**

LongCat-Flash在多个维度展现出强大而多功能的能力：

#### 5.2.1 一般领域
- 在ArenaHard-V2上获得86.50分，排名第二
- 在MMLU上获得89.71分，在CEval上获得90.44分，与领先模型相当
- 以比竞争对手更少的参数实现高效性能

#### 5.2.2 指令遵循
- 在IFEval上获得最高分89.65，优于所有其他模型
- 在COLLIE（57.10）和Meeseeks-zh（43.03）上获得最佳分数
- 在英语和中文的多样化和复杂指令集中表现出色

#### 5.2.3 数学推理
- 在MATH500上获得96.40分
- 在更复杂的竞赛级基准测试AIME25（61.25）和BeyondAIME（43.00）上表现优异
- 展示出高级多步逻辑推理和问题解决能力

#### 5.2.4 一般推理
- 在ZebraLogic上获得89.30分，结构化逻辑推理能力突出
- 在阅读理解基准DROP上获得79.06分
- 在GPQA-diamond（73.23）和GraphWalks（51.05）上有改进空间

#### 5.2.5 编码能力
- 在TerminalBench上获得39.51分，排名第二
- 在SWE-Bench-Verified上获得60.4分
- 在Humaneval+和MBPP+等基础代码生成任务上表现稳健

#### 5.2.6  Agent工具使用
- 在τ²-Bench上表现优异，即使与参数更多的模型相比
- 在高度复杂场景中，在VitaBench上获得最高分24.30

#### 5.2.7 安全性
- 在Harmful（83.98）和Criminal（91.24）领域表现出色
- 在识别和缓解风险方面展现出卓越能力

![50424bb8.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/LongCat_report_zh/resources/50424bb8.png)<br>
**图11：不同基准测试中激活的FFN专家平均数量**

## 6. 推理与部署优化

### 6.1 模型特定推理优化

#### 6.1.1 计算与通信协调
- **ScMoE架构**：实现单批次重叠(Single Batch Overlap, SBO)流水线
  - 阶段1：单独执行，因为MLA输出是后续阶段的输入
  - 阶段2：将all-to-all调度与Dense FFN和Attn0(QKV投影)重叠
  - 阶段3：独立执行MoE GEMM
  - 阶段4：将Attn1(核心注意力和输出投影)和Dense FFN与all-to-all组合重叠

![b3c9e1df.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/LongCat_report_zh/resources/b3c9e1df.png)<br>
**图9：重叠策略概述**

#### 6.1.2 推测解码(Speculative Decoding)
- **速度提升公式**：
  $$
  \\text{Speedup} = \\frac{T_{SD}^{Avg}}{T_T} = \\frac{\\gamma T_D + T_V(\\gamma)}{T_T \\cdot \\Omega(\\gamma, \\alpha)}
  $$
  其中$T_{SD}^{Avg}$、$T_T$、$T_D$分别表示推测解码、目标模型和草案模型的预期每token延迟，$\\gamma$表示每解码步骤的草案token数量，$\\Omega(\\gamma, \\alpha)$表示给定步骤$\\gamma$和接受率$\\alpha$的预期接受长度，$T_V(\\gamma)$表示目标验证的预期延迟

- **优化策略**：
  - **预期接受长度**：采用MTP，集成单个MTP头，测试集上获得约90%的接受率
  - **草案与目标成本比**：采用轻量级MTP架构，单个密集层优于ScMoE层
  - **目标验证与解码成本比**：采用C2T方法，使用分类模型在验证前过滤不太可能被接受的token

![20e67ef6.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/LongCat_report_zh/resources/20e67ef6.png)<br>
**表5：不同MTP头结构在MT-Bench上的草案token接受率**

| MTP头结构 | 激活参数比例 | 接受率$\\alpha$ |
|-----------|------------|--------------|
| 密集层 | 1.41% | 92.1% |
| ScMoE层 | 4.17% | 92.9% |

#### 6.1.3 KV缓存优化
- **MLA机制**：采用64头的MLA，减少注意力组件的计算负载，实现卓越的KV缓存压缩
- **多步重叠调度器**：动态预分配多个未来步骤的KV缓存槽位
  - 解决推测解码中接受长度未知的问题
  - 确保下一迭代的安全KV缓存分配

![a0479351.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/LongCat_report_zh/resources/a0479351.png)<br>
**图10：多步重叠调度器（以4步为例）**

### 6.2 系统级推理技术

#### 6.2.1 最小化调度开销
- **TVD融合策略**：将目标前向、验证和草案前向融合为单个CUDA图
- **多步重叠调度器**：在单个调度迭代中启动多个前向步骤的内核
  - 有效隐藏CPU调度和同步
  - 确保GPU持续占用

#### 6.2.2 自定义内核
- **确定性FAG**：开发高效确定性FAG内核，使用有限额外工作区按确定顺序累加瓦片
  - 性能达到原始确定性版本的1.6倍
  - 达到非确定性版本的0.95倍

- **确定性ScatterAdd**：提出分层归约算法，跨所有可用处理器并行化梯度聚合
  - 实现与非确定性版本相当的性能

- **优化分组GEMM**：
  - 双缓冲流水线：重叠计算、内存I/O和尾声
  - 对角线瓦片：缓解L2缓存冲突
  - HBM带宽控制：通过计算单元限制重叠分组GEMM与调度/组合通信

- **融合GemmAdd**：将FP32加法融合到GEMM尾声中
  - 避免中间写回
  - 隐藏加法在瓦片GEMM流水线内
  - 实现3.12x至3.86x的加速

#### 6.2.3 量化
- 采用量化技术进一步降低推理成本
- 在保持性能的同时显著减少内存占用和计算需求

### 6.3 部署与性能

#### 6.3.1 测量性能
![5e4be833.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/LongCat_report_zh/resources/5e4be833.png)<br>
**表6：不同设置下LongCat-Flash的性能**

| 配置 | 注意力 | 平均上下文 | Hopper GPU数量 | TGS | TPS/u |
|------|-------|-----------|--------------|-----|-------|
| DeepSeek-V3-profile | bf16 | 4096 | 128 | 2324 | 20 |
| DeepSeek-V3-blog | bf16 | 4989 | 144 | 1850 | 20~22 |
| LongCat-Flash | bf16 | 5000 | 128 | 3785 | 35 |
| LongCat-Flash | bf16 | 5000 | 128 | 2205 | 68.9 |
| LongCat-Flash | bf16 | 5000 | 128 | 804 | 100.5 |
| LongCat-Flash | fp8 | 5000 | 128 | 4230 | 26.4 |
| LongCat-Flash | fp8 | 8192 | 128 | 3240 | 33.8 |

- **TGS**（每GPU每秒token数）：表示每设备生成吞吐量（值越高表示成本越低）
- **TPS/u**（每用户每秒token数）：表示单个用户的生成速度（值越高越好）

#### 6.3.2 理论性能
![9b3c60d4.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/LongCat_report_zh/resources/9b3c60d4.png)<br>
**表7：不同模型的理论解码时间和成本**

| 指标 | DeepSeek-V3 | Qwen3-235B-A22B | LongCat-Flash |
|------|-------------|----------------|---------------|
| MTP | 有 | 无 | 有 |
| 层数 | 61 | 94 | 28 |
| 每设备批次 | 96 | 96 | 96 |
| 注意力时间(us) | 471 | 314 | 264 |
| all-to-all调度(us) | 275 | 157 | 236 |
| MoE(us) | 77 | 29 | 60 |
| all-to-all组合(us) | 551 | 315 | 472 |
| 重叠策略 | TBO | TBO | SBO |
| TPOT(ms) | 30 | 26.2 | 16 |
| $/1M输出token | 0.17 | 0.15 | 0.09 |

- **理论TPOT**：LongCat-Flash的理论极端TPOT可表示为：
  $$
  \\text{TPOT} = \\frac{\\text{TPL}}{1000}
  $$
  其中TPL表示每层时间成本

- **成本效益**：在H800 GPU每小时2美元的成本假设下，LongCat-Flash的输出token价格为0.09美元/百万

## 7. 结论

LongCat-Flash通过三项关键创新实现了高效且强大的语言模型：
1. **上下文感知的动态计算机制和快捷连接MoE**：在训练和推理中实现高效率
2. **集成策略确保大规模训练稳定**：包括超参数转移、模型增长初始化、多方面稳定性套件和确定性计算
3. **多阶段训练管道**：培养LongCat-Flash的 Agent能力，使其能够执行需要迭代推理和环境交互的复杂任务

该模型在30天内完成了超过20万亿token的训练，推理速度超过100 tokens/s，成本仅为每百万输出token 0.70美元。在 Agent应用场景中，LongCat-Flash能够将单轮工具调用延迟控制在1秒以内，显著提升 Agent应用的交互性。

通过将LongCat-Flash作为开源模型发布，美团旨在推动高效MoE架构、高质量数据策略和 Agent模型开发的研究，促进大型语言模型领域的社区驱动创新。

`
    },
    {
      id: "blog-daily-m3-agent",
      title: "M3-Agent：具有长期记忆的多模态智能体框架分析报告",
      file: "Blogs/DailyPaper/M3_Agent_zh/report.md",
      difficulty: "中级",
      duration: "0.5h",
      week: 0,
      phase: 0,
      keywords: ["M3-Agent", "长期记忆", "多模态智能体", "Agent", "Memory"],
      content: `# M3-Agent：具有长期记忆的多模态智能体框架分析报告

## 1. 引言与概述

### 1.1 研究背景与动机

在未来的智能家居场景中，家庭机器人能够自主执行家务任务而无需明确指令，例如早晨无需询问"咖啡还是茶？"就能递上用户习惯的咖啡。这种智能水平的实现依赖于三个核心能力：
- 通过多模态传感器持续感知世界
- 将经验存储在长期记忆中并逐步构建环境知识
- 基于积累的记忆进行推理以指导行动

当前的多模态智能体在长期记忆构建和基于记忆的推理方面仍存在显著局限，难以实现类似人类的持续学习和环境理解能力。

### 1.2 M3-Agent核心创新

M3-Agent（**M**ulti **M**odal **M**emory Agent）是一种新型多模态智能体框架，具有以下关键创新：


**图1：多模态智能体持续感知环境、构建以实体为中心的多模态长期记忆并进行推理**

- **长期记忆能力**：能够处理实时视觉和听觉输入，构建和更新长期记忆
- **双类型记忆系统**：
  - *情景记忆*：记录具体事件（如"Alice拿起咖啡说'早上没这个不行'"）
  - *语义记忆*：推导一般知识（如"Alice喜欢早上喝咖啡"）
- **实体中心记忆组织**：以图结构组织记忆，将同一实体（如人脸、声音、知识）连接起来
- **多轮迭代推理**：自主执行多轮推理并从记忆中检索相关信息完成任务

### 1.3 主要贡献

1. 提出M3-Agent框架，实现类似人类的长期记忆构建与推理能力
2. 开发M3-Bench基准测试，包含100个机器人视角真实视频和920个网络视频
3. 在多模态智能体的长期记忆和基于记忆的推理方面取得显著性能提升
4. 开源模型、代码和数据，促进多模态智能体研究发展

## 2. M3-Agent架构

### 2.1 整体框架

M3-Agent由多模态大语言模型(MLLM)和多模态长期记忆模块组成，通过两个并行过程运作：

![f266228d.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/M3_Agent_zh/resources/f266228d.png)<br>
**图1：M3-Agent架构，包含多模态大语言模型(MLLM)和多模态长期记忆。系统由两个并行过程组成：记忆(memorization)和控制(control)**

- **记忆过程(memorization)**：实时处理视频和音频流，生成情景记忆和语义记忆
- **控制过程(control)**：解释外部指令，基于长期记忆进行推理并执行任务

### 2.2 记忆过程

记忆过程负责将实时多模态输入转化为结构化记忆，具有两大关键挑战：

1. **无限信息处理**：需处理无限长的输入流，而非传统方法处理的有限长度离线视频
2. **世界知识构建**：超越低级视觉细节，构建高级世界知识（如人物身份和实体属性）

记忆过程生成两类记忆：

| 记忆类型 | 描述 | 示例 |
|---------|------|------|
| **情景记忆** | 记录视频中观察到的具体事件 | "Alice拿起咖啡说'早上没这个不行'"<br>"Alice把空瓶子扔进绿色垃圾桶" |
| **语义记忆** | 从片段中推导一般知识 | "Alice喜欢早上喝咖啡"<br>"绿色垃圾桶用于回收" |

### 2.3 长期记忆组织

长期记忆以实体为中心的图结构组织，具有以下特点：

- **多模态支持**：存储文本、图像、音频等多种模态信息
- **节点属性**：每个节点包含ID、类型、内容、嵌入向量、权重和额外元数据
- **关系连接**：节点通过边连接，表示逻辑关系，便于记忆检索

**表3：记忆节点的属性及其描述**

| 属性 | 描述 |
|------|------|
| id | 节点的唯一标识符 |
| type | 节点的模态类型（如文本、图像、音频） |
| content | 节点的原始内容，如纯文本、base64图像或base64音频 |
| embedding | 节点内容的向量表示，用于基于相似度的检索 |
| weight | 表示节点置信度的数值 |
| extra_data | 包含额外元数据的JSON对象，如时间戳 |

记忆系统提供两种搜索工具：

**表4：长期记忆支持的搜索功能**

| 搜索功能 | 描述 |
|---------|------|
| search_node | 接受查询并返回最相关的前k个节点。支持多模态查询（文本、图像或音频）和特定模态检索 |
| search_clip | 为文本查询检索相关的前k个视频片段，包括情景记忆和语义记忆 |

### 2.4 控制过程

控制过程使M3-Agent能够基于长期记忆执行任务：

- **自主检索**：跨不同维度（如事件或人物）从长期记忆中检索相关信息
- **多轮推理**：采用强化学习实现多轮推理和迭代记忆检索，而非单轮检索增强生成(RAG)
- **任务执行**：解释指令，推理记忆内容，生成并执行相应动作

## 3. M3-Bench基准测试

### 3.1 数据集概述

M3-Bench是一个长视频问答(LVQA)数据集，用于评估多模态智能体基于长期记忆进行推理的能力：

- **M3-Bench-robot**：100个从机器人第一人称视角录制的真实世界视频
- **M3-Bench-web**：920个来自网络的多样化场景视频

![1a2cdd30.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/M3_Agent_zh/resources/1a2cdd30.png)<br>
**图2：M3-Bench示例。M3-Bench-robot包含来自真实机器人工作场景的长视频，而M3-Bench-web扩展了视频多样性以支持更广泛的评估**

### 3.2 问题类型设计

M3-Bench设计了五种问题类型，全面评估智能体的记忆构建和推理能力：

**表1：M3-Bench中不同问题类型的解释及示例**

| 问题类型 | 解释 | 示例 |
|---------|------|------|
| **多细节推理** | 需要聚合视频中分散的多条信息 | "视频中展示的五件物品中，哪件的起拍价最高？"智能体必须从五个不同片段识别并回忆起拍价，然后比较确定最高价 |
| **多跳推理** | 需要跨不同片段逐步推理得出结论 | "去Ding Cha后他们去了哪家奶茶店？"智能体必须先定位到Ding Cha的访问，然后跟随后续片段确定下一家奶茶店 |
| **跨模态推理** | 需要跨多种模态（如视觉和音频内容）进行推理 | "(Bob向Robot展示红色文件夹说'机密文件应放这个文件夹'，然后展示白色文件夹说'普通文件应放这个')机密文件应放在哪个文件夹？"智能体必须结合视觉线索（文件夹颜色）和对话推断正确答案 |
| **人类理解** | 涉及对人类相关属性（如身份、情绪、个性或关系）的推理 | "Lucas烹饪技术好吗？"视频未直接揭示答案，但智能体必须聚合Lucas在多个烹饪场景中的行为推断其技能水平 |
| **一般知识提取** | 评估智能体能否从特定事件中提取一般知识 | "(一个人展示将不同杂货分类到冰箱的不同架子上)哪个架子适合存放蔬菜？"智能体必须从观察中识别典型存储规则来回答 |

### 3.3 数据集统计

![8810378e.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/M3_Agent_zh/resources/8810378e.png)<br>
![860da643.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/M3_Agent_zh/resources/860da643.png)<br>
![c78caa38.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/M3_Agent_zh/resources/c78caa38.png)<br>
**图3：M3-Bench基准的统计概览。(a) M3-Bench-robot拍摄地点分布；(b) M3-Bench-web视频类别分布；(c) M3-Bench问题类型分布（每个问题可能对应多种类型）**

**表2：M3-Bench与现有长视频问答基准在关键维度上的比较**

| 基准 | #视频 | 长度(秒) | #QA对 | 标注方法 | 问题格式 | 智能体存在 | 跨模态QA | 人类QA | 知识QA |
|------|-------|----------|-------|----------|----------|------------|-----------|---------|---------|
| EgoSchema | 5,063 | 180.0 | 5,063 | M/A | C | ✗ | ✗ | ✗ | ✗ |
| LongVideoBench | 3,763 | 473.0 | 6,678 | M | C | ✗ | ✗ | ✗ | ✗ |
| HourVideo | 500 | 2,742.0 | 12,976 | M/A | C | ✗ | ✗ | ✗ | ✗ |
| MVBench | 3,641 | 16.0 | 4,000 | A | C | ✗ | ✗ | ✗ | ✗ |
| Video-MME | 900 | 1,017.9 | 2,700 | M | C | ✗ | ✗ | ✗ | ✗ |
| MLVU | 1,730 | 930.0 | 3,102 | M/A | O/C | ✗ | ✗ | ✗ | ✗ |
| **M3-Bench-robot** | **100** | **2,039.9** | **1,276** | **M** | **O** | **✓** | **✓** | **✓** | **✓** |
| **M3-Bench-web** | **920** | **1,630.7** | **3,214** | **M** | **O** | **✗** | **✓** | **✓** | **✓** |

*注：M/A表示手动/自动标注；O/C表示开放式/封闭式问题*

### 3.4 M3-Bench-robot数据集构建

M3-Bench-robot通过以下步骤构建：

1. **脚本设计**：
   - 覆盖7种日常场景：客厅、厨房、卧室、书房、办公室、会议室和健身房
   - 每个场景设计多个主题变体（如客厅场景包括会友、家庭对话、感恩节聚会等）
   - 每个脚本包含至少70个事件，确保视频时长至少30分钟

2. **视频拍摄**：
   - 采用真人演员模拟机器人行为，佩戴头戴式摄像设备捕捉第一人称视角
   - 在51个不同地点拍摄，招募67名演员，每个地点不超过3个视频
   - 收集两种音频：头戴设备原始音频和演员佩戴的领夹麦克风高保真音频

3. **标注过程**：
   - 为每个视频创建至少12个问题-答案对
   - 问题需符合五种问题类型之一
   - 标注员需指定问题提出的确切时间戳（必须在机器人响应前）
   - 生成字幕，标注对话起止时间、说话人身份和转录内容

## 4. 实验结果与分析

### 4.1 主要性能结果

**表5：M3-Bench-robot、M3-Bench-web和VideoMME-long上的结果**

| 方法 | M3-Bench-robot |  |  |  |  |  | M3-Bench-web |  |  |  |  |  | VideoMME-Long |
|------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|
|  | MD | MH | CM | HU | GK | All | MD | MH | CM | HU | GK | All |  |
| Socratic Model | - | - | - | - | - | - | - | - | - | - | - | - | - |
| Qwen2.5-Omni-7b | 2.1 | 1.4 | 1.5 | 1.5 | 2.1 | 2.0 | 8.9 | 8.8 | 13.7 | 10.8 | 14.1 | 11.3 | 42.2 |
| Qwen2.5-VL-7b | 2.9 | 3.8 | 3.6 | 4.6 | 3.4 | 3.4 | 11.9 | 10.5 | 13.4 | 14.0 | 20.9 | 14.9 | 46.9 |
| Gemini-1.5-Pro | 6.5 | 7.5 | 8.0 | 9.7 | 7.6 | 8.0 | 18.0 | 17.9 | 23.8 | 23.1 | 28.7 | 23.2 | 38.0 |
| GPT-4o | 9.3 | 9.0 | 8.4 | 10.2 | 7.3 | 8.5 | 21.3 | 21.9 | 30.9 | 27.1 | 39.6 | 28.7 | 38.8 |
| MovieChat | 13.3 | 9.8 | 12.2 | 15.7 | 7.0 | 11.2 | 12.2 | 6.6 | 12.5 | 17.4 | 11.1 | 12.6 | 19.4 |
| MA-LMM | 25.6 | 23.4 | 22.7 | 39.1 | 14.4 | 24.4 | 26.8 | 10.5 | 22.4 | 39.3 | 15.8 | 24.3 | 7.2 |
| Flash-VStream | 21.6 | 19.4 | 19.3 | 24.3 | 14.1 | 19.4 | 24.5 | 10.3 | 24.6 | 32.5 | 20.2 | 23.6 | 25.0 |
| Gemini-Agent | 15.8 | 17.1 | 15.3 | 20.0 | 15.5 | 16.9 | 29.3 | 20.9 | 33.8 | 34.6 | 45.0 | 34.1 | 55.1 |
| Gemini-GPT4o-Hybrid | 21.3 | 25.5 | 22.7 | 28.8 | 23.1 | 24.0 | 35.9 | 26.2 | 37.6 | 43.8 | 52.2 | 41.2 | 56.5 |
| **M3-Agent** | **32.8** | **29.4** | **31.2** | **43.3** | **19.1** | **30.7** | **45.9** | **28.4** | **44.3** | **59.3** | **53.9** | **48.9** | **61.8** |

*注：MD=多细节推理，MH=多跳推理，CM=跨模态推理，HU=人类理解，GK=一般知识提取*

**关键发现**：
- M3-Agent在所有基准测试上均优于所有基线方法
- 在M3-Bench-robot上，比最强基线(MA-LMM)准确率提高6.3%
- 在M3-Bench-web和VideoMME-long上，比最强基线(Gemini-GPT4o-Hybrid)分别提高7.7%和5.3%
- 在人类理解和跨模态推理方面表现尤为突出

### 4.2 按问题类型分析

M3-Agent在不同问题类型上展现出了卓越性能：

- **人类理解**：在M3-Bench-robot上比MA-LMM提高4.2%，在M3-Bench-web上比Gemini-GPT4o-Hybrid提高15.5%
- **跨模态推理**：在M3-Bench-robot上比MA-LMM提高8.5%，在M3-Bench-web上比Gemini-GPT4o-Hybrid提高6.7%

这些结果证明了M3-Agent在维持角色一致性、深化人类理解以及有效整合多模态信息方面的优势。

### 4.3 消融实验分析

#### 4.3.1 记忆模型影响

**表6：不同记忆模型对最终性能的影响（控制模型固定为control-32b-rl）**

| 方法 | M3-Bench-robot | M3-Bench-web | VideoMME-Long |
|------|----------------|--------------|---------------|
| memory-gemini-prompt | 28.7 | 46.3 | 52.7 |
| memory-7b-prompt | 25.3 | 39.9 | 50.8 |
| memory-7b-sft (M3-Agent) | 30.7 | 48.9 | 61.8 |
| memory-7b-sft w/o equivalence | 19.5 | 39.7 | 52.1 |
| memory-7b-sft w/o semantic memory | 13.6 | 29.7 | 48.7 |

**关键发现**：
- memory-7b-sft比memory-gemini-prompt生成更高质量的记忆
- 通过模仿学习生成的记忆比直接提示生成的记忆更有效
- 移除角色身份等价性或语义记忆会显著降低QA性能

#### 4.3.2 控制方法影响

**表7：控制方法对最终性能的影响（记忆模型固定为memory-7b-sft）**

| 方法 | M3-Bench-robot | M3-Bench-web | VideoMME-Long |
|------|----------------|--------------|---------------|
| control-32b-grpo | 30.0 | 47.7 | 58.7 |
| control-8b-prompt | 16.4 | 35.7 | 45.3 |
| control-8b-rl | 24.6 | 40.5 | 50.8 |
| control-14b-rl | 28.2 | 46.9 | 56.0 |
| control-32b-prompt | 20.7 | 40.9 | 52.5 |
| control-32b-rl (M3-Agent) | 30.7 | 48.9 | 61.8 |
| control-32b-prompt w/o inter-turn instruction | 12.8 | 32.3 | 48.3 |
| control-32b-rl w/o inter-turn instruction | 20.2 | 43.1 | 55.9 |
| control-32b-rl w/o reasoning | 19.0 | 40.1 | 52.3 |

**关键发现**：
- DAPO训练算法比GRPO更有效
- 随着模型规模增大，DAPO的性能提升更显著
- control-32b-rl比control-32b-prompt在所有测试集上提高约10%
- 移除轮间指令或推理会导致显著性能下降

### 4.4 记忆生成质量评估

**表13：使用AutoDQ和等价性(Eq.)指标评估记忆模型**

| 方法 | AutoDQ-P | AutoDQ-R | AutoDQ-F1 | Eq.-P | Eq.-R | Eq.-F1 |
|------|----------|----------|-----------|-------|-------|--------|
| memory-gemini-prompt | 0.692 | 0.539 | 0.606 | 0.472 | 0.805 | 0.595 |
| memory-7b-prompt | 0.495 | 0.355 | 0.414 | 0.117 | 0.192 | 0.145 |
| memory-7b-sft (1 epoch) | 0.634 | 0.596 | 0.616 | 0.742 | 0.817 | 0.778 |
| memory-7b-sft (2 epochs) | 0.628 | 0.610 | 0.619 | 0.845 | 0.810 | 0.827 |
| memory-7b-sft (3 epochs) | 0.635 | 0.620 | 0.627 | 0.836 | 0.856 | 0.846 |
| memory-7b-sft (4 epochs) | 0.616 | 0.618 | 0.617 | 0.825 | 0.839 | 0.832 |
| memory-7b-sft (5 epochs) | 0.609 | 0.621 | 0.615 | 0.813 | 0.840 | 0.827 |

M3-Agent的记忆生成模型在等价性指标上表现优异，证明其能有效建立角色身份关联。

### 4.5 记忆生成示例

**表15：memory-7b-sft与memory-gemini-prompt在案例KHslnSzK2SU（M3-Bench-web，23:00-23:30）上的记忆生成比较**

![0921e5a2.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/M3_Agent_zh/resources/0921e5a2.png)<br>


**人脸标识与语义记忆示例**

*黄色高亮表示我们的模型提供的额外重要细节*

M3-Agent的记忆生成模型能够：
- 准确建立人脸与声音的身份等价关系
- 捕捉人物性格特征和关系
- 提取场景中的上下文和一般知识
- 生成更丰富、更准确的记忆表示

![22ad81ec.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/M3_Agent_zh/resources/22ad81ec.png)<br>


**另一案例的记忆生成示例**

### 4.6 训练过程分析

![ec784433.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/M3_Agent_zh/resources/ec784433.png)<br>
**图4：DAPO训练过程中的平均得分（训练集）和准确率（开发集）曲线**

训练曲线显示：
- 随着训练步数增加，得分稳步提高
- 训练集和开发集性能同步提升，表明模型有效学习
- 指数移动平均(EMA)平滑后的曲线显示稳定的训练过程

## 5. 结论与展望

### 5.1 主要发现

1. **长期记忆框架的有效性**：M3-Agent通过实体中心的多模态记忆组织，实现了类似人类的长期记忆构建能力
   
2. **记忆与推理的协同作用**：记忆过程和控制过程的并行设计使智能体能够持续感知环境、构建记忆并基于记忆进行推理

3. **基准测试的必要性**：M3-Bench填补了评估多模态智能体长期记忆能力的空白，特别关注机器人应用场景

4. **性能显著提升**：M3-Agent在M3-Bench-robot、M3-Bench-web和VideoMME-long上分别比最强基线提高6.7%、7.7%和5.3%

### 5.2 未来工作方向

1. **记忆压缩与优化**：探索更高效的记忆存储和检索机制，支持更长时间跨度的记忆

2. **记忆更新机制**：研究如何处理记忆冲突和知识更新，使记忆系统更加动态和自适应

3. **跨任务记忆共享**：探索不同任务间记忆的迁移和共享，提高智能体的泛化能力

4. **真实场景部署**：将M3-Agent部署到真实机器人系统中，验证其在实际应用中的效果

### 5.3 资源信息

- **项目主页**：[https://m3-agent.github.io](https://m3-agent.github.io)
- **代码与模型**：[https://github.com/bytedance-seed/m3-agent](https://github.com/bytedance-seed/m3-agent)
- **通讯作者**：linyuan.0@bytedance.com
- **发布日期**：2025年8月18日

M3-Agent代表了多模态智能体向更类人长期记忆能力的重要进展，为构建能够真正理解环境、与人类自然交互的智能系统提供了新的思路和工具。`
    },
    {
      id: "blog-daily-memento",
      title: "Memento：无需微调的自适应LLM Agents",
      file: "Blogs/DailyPaper/Memento_zh/report.md",
      difficulty: "中级",
      duration: "0.5h",
      week: 0,
      phase: 0,
      keywords: ["Memento", "自适应", "LLM Agents", "免微调", "Memory"],
      content: `# Memento：无需微调的自适应LLM Agents

## 1. 研究概述

### 1.1 研究背景与问题

当前基于大型语言模型的智能体系统（LLM Agents)面临两大挑战：
- **僵化性问题**：现有方法多依赖静态、手工设计的反思工作流，缺乏灵活性
- **计算成本问题**：需要对LLM参数进行梯度更新，计算资源消耗大

### 1.2 研究目标

提出一种新型学习范式，使LLM Agents能够：
- 无需微调底层LLM即可实现持续适应
- 通过低计算成本实现在线学习
- 有效处理分布外任务

### 1.3 主要贡献

- 提出**记忆增强马尔可夫决策过程**(M-MDP)框架
- 设计基于案例的推理(CBR)机制，实现无需参数更新的持续学习
- 实现**Memento** Agents，在GAIA验证集上达到**87.88% Pass@3**，测试集上**79.40%**
- 在DeepResearcher数据集上达到**66.6% F1**和**80.4% PM**，超越现有基于训练的方法
- 在分布外任务上，基于案例的记忆带来**4.7%~9.6%**的绝对性能提升

## 2. 方法论

### 2.1 问题形式化：记忆增强马尔可夫决策过程(M-MDP)

定义3.1 (记忆增强马尔可夫决策过程)：M-MDP是一个元组⟨𝒮, 𝒜, 𝒫, ℛ, γ, ℳ⟩，其中：
- 𝒮是状态空间
- 𝒜是动作空间
- 𝒫: 𝒮 × 𝒜 → ∆(𝒮)是转移动态
- ℛ: 𝒮 × 𝒜 → ℝ是奖励函数
- γ ∈ [0, 1)是折扣因子
- ℳ = (𝒮 × 𝒜 × ℝ)*是记忆空间

![d5390d10.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Memento_zh/resources/d5390d10.png)<br>
**图2：基于记忆的马尔可夫决策过程的图形模型**

关键区别在于引入了记忆空间作为过去经验的集合。在CBR Agents设置中，状态空间和动作空间都被定义为预定义词汇表𝒱上所有有限长度序列的集合。

### 2.2 案例库(Case Bank)设计

在时间步t，维护案例库$M_t = \\{c_i\\}_{i=1}^{N_t}$，每个案例$c_i$是一个元组$(s_i, a_i, r_i)$，$N_t$是当前案例库中的案例数量。

给定当前状态$s_t$，CBR Agents首先检索案例$c_t \\sim \\mu(\\cdot|s_t, M_t)$，然后通过LLM重用和调整它，即$a_t \\sim p_{\\text{LLM}}(\\cdot|s_t, c_t)$。其中$\\mu$表示案例检索策略。

### 2.3 案例推理 Agents定义

定义3.2 (案例推理 Agents)：基于当前状态和有限记忆的过去经验做出决策的 Agents。形式化定义为：

$$\\pi(a|s,M) = \\sum_{c \\in M} \\mu(c|s,M) \\cdot p_{\\text{LLM}}(a|s,c)$$

轨迹$\\tau$可描述为：$\\tau = \\{M_0, s_0, c_0, a_0, r_0, M_1, s_1, c_1, a_1, r_1, \\cdots\\}$

轨迹采样概率为：

$$p(\\tau) = \\prod_{t=0}^{T-1} I(M_{t+1} = M_t \\cup \\{(s_t,a_t,r_t)\\}) \\cdot I(r_t = \\mathcal{R}(s_t,a_t)) \\cdot \\mu(c_t|s_t,M_t) \\cdot p_{\\text{LLM}}(a_t|s_t,c_t)$$

### 2.4 基于软Q学习的CBR Agents优化

为优化CBR策略$\\pi$，目标是学习案例检索策略$\\mu$，同时保持LLM组件$p_{\\text{LLM}}$固定。应用最大熵RL框架，优化目标为：

$$J(\\mu) = \\mathbb{E}_{\\tau \\sim p_\\mu} \\left[ \\sum_{t=0}^{T-1} r(s_t,a_t) + \\alpha \\mathcal{H}(\\mu(\\cdot|s_t,M_t)) \\right]$$

其中$\\alpha$是熵权重，$\\mathcal{H}$是策略熵。

### 2.5 基于状态相似性的Q学习增强

为解决自然语言形式的复杂状态和案例描述带来的挑战，提出通过基于核的估计来近似Q值：

$$Q(s,c) \\approx f_\\theta(s,c) = \\sum_{(s_i,c_i,Q_i) \\in \\mathcal{D}_c} w_i Q_i, \\quad w_i = \\frac{k_\\theta(s,s_i)}{\\sum_{s_j \\in \\mathcal{D}_c} k_\\theta(s,s_j)}$$

其中$\\mathcal{D}_c = \\{(s_i,c_i,Q_i) \\in \\mathcal{D}: c_i = c\\}$表示在情节记忆$\\mathcal{D}$中具有相同检索案例$c$的过去交互。

### 2.6 Memento架构

![f333154f.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Memento_zh/resources/f333154f.png)<br>
**图3：具有参数化记忆的Memento架构**

Memento实现为一个**规划-执行器框架**，在基于案例的规划(阶段1)和基于工具的执行(阶段2)之间交替：
- **规划器**：基于LLM的CBR Agents，由案例记忆模块增强
  - **写入**：记录新案例并在线优化Q函数
  - **读取**：通过学习的检索策略检索案例以进行自适应案例选择
- **执行器**：基于LLM的MCP客户端，通过MCP协议调用MCP服务器上托管的外部工具

## 3. 实验设置

### 3.1 基准测试

- **GAIA**：评估长视野规划、工具编排和执行能力
- **DeepResearcher**：测试实时网络研究、证据检索、跨页面综合和多跳推理
- **Humanity's Last Exam (HLE)**：评估人类知识前沿和长尾专业领域中的复杂推理能力
- **SimpleQA**：评估单跳事实问答中的可靠性和抗幻觉能力

### 3.2 评估指标

- **精确匹配(EM)**：用于GAIA，要求预测与标准答案完全匹配
- **宏F1分数**：用于DeepResearcher、SimpleQA和HLE数据集
- **部分匹配(PM)**：表示LLM生成答案与黄金答案之间的部分语义匹配分数

### 3.3 实验配置

- **规划器**：GPT-4.1
- **执行器**：o4-mini
- **工具**：搜索引擎、浏览器等MCP工具
- **案例库**：从零开始初始化，迭代存储成功和失败的轨迹

## 4. 实验结果

### 4.1 主要性能结果

![bca0cf3c.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Memento_zh/resources/bca0cf3c.png)<br>
![2e51de8f.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Memento_zh/resources/2e51de8f.png)<br>
![75751b75.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Memento_zh/resources/75751b75.png)<br>
**图1：Memento在基线、基准、记忆设计和泛化方面的评估概述**

#### GAIA基准测试结果

![7b4a79de.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Memento_zh/resources/7b4a79de.png)<br>
**表2：截至2025年6月26日GAIA排行榜的顶级结果**

| 验证数据集 | 模型家族 | 平均分数(%) | Level 1(%) | Level 2(%) | Level 3(%) |
|------------|----------|------------|------------|------------|------------|
| Memento (Pass@3) | GPT4.1, o3 | 87.88 | 96.23 | 90.70 | 61.54 |
| Alita | Claude 4 Sonnet, GPT-4o | 87.27 | 88.68 | 89.53 | 76.92 |
| Skywork Super Agents v1.1 | skywork-agent, Claude 3.7 Sonnet, Whisper | 82.42 | 92.45 | 83.72 | 57.69 |

| 测试数据集 | 模型家族 | 平均分数(%) | Level 1(%) | Level 2(%) | Level 3(%) |
|------------|----------|------------|------------|------------|------------|
| Su Zero Ultra | - | 80.40 | 93.55 | 77.36 | 65.31 |
| h2oGPTe Agent v1.6.33 | Claude 3.7 Sonnet, Gemini 2.5 Pro | 79.73 | 89.25 | 79.87 | 61.22 |
| **Memento** | **GPT4.1, o3** | **79.40** | **90.32** | **75.47** | **71.43** |

- Memento在验证集上获得**Top-1**排名，在测试集上排名**第4**
- 超越大多数现有 Agents框架，包括Manus、Aworld和OWL

#### DeepResearcher数据集结果

![2b7e6661.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Memento_zh/resources/2b7e6661.png)<br>
**表1：在七个开放域QA数据集上prompt-based、training-based和我们的方法的性能比较**

| 方法 | NQ.F1 | NQ.PM | TQ.F1 | TQ.PM | HotpotQA.F1 | HotpotQA.PM | ... | Avg.F1 | Avg.PM |
|------|-------|-------|-------|-------|-------------|-------------|-----|--------|--------|
| Prompt Based | - | - | - | - | - | - | ... | 59.9 | 72.2 |
| CoT | 19.8 | 32.0 | 45.6 | 48.2 | 24.4 | 27.9 | ... | 23.6 | 26.1 |
| CoT + RAG | 42.0 | 59.6 | 68.9 | 75.8 | 37.1 | 43.8 | ... | 37.7 | 43.2 |
| DeepResearcher | 39.6 | 61.9 | 78.4 | 85.0 | 52.8 | 64.3 | ... | 51.8 | 60.5 |
| **Memento** | **42.0** | **74.6** | **85.5** | **93.9** | **66.5** | **81.6** | ... | **66.6** | **80.4** |

- Memento在七个DeepResearcher基准测试上达到平均**66.6% F1**，几乎是CoT + RAG基线(37.7% F1)的两倍
- 在Musique和Bamboogle等复杂多跳推理任务上表现尤为突出

#### HLE和SimpleQA结果


**图4：在SimpleQA和HLE上的性能**

- **HLE**：Memento达到**24.4% PM**，排名第二，仅比GPT5(25.32%)低0.92分
- **SimpleQA**：Memento达到**95.0%**准确率，超越WebSailor(93.5%)、WebDancer(90.5%)等基线

### 4.2 消融研究


**表5：三个基准上的消融结果**

| 方法 | Humanities/SC | Math | Chemistry | ... | Avg |
|------|---------------|------|-----------|-----|-----|
| Offline Executor | 5.2/9.6 | 7.1/5.8 | 2.3/7.9 | ... | 6.4/8.7 |
| Online Executor | 10.8/24.9 | 13.1/16.0 | 6.9/9.3 | ... | 11.2/15.8 |
| Memento w/o CBR | 25.5/29.2 | 24.9/16.3 | 17.4/21.1 | ... | 22.2/17.4 |
| **Memento** | **28.4/33.0** | **30.9/24.2** | **18.7/22.7** | ... | **26.7/24.4** |

- 从离线执行器到在线工具通常减少幻觉并提高F1和PM分数
- 引入规划(Memento w/o CBR)带来稳健提升(HLE: +11.0/+1.6, SimpleQA: +32.5/+4.9)
- 案例推理提供一致的附加改进(HLE: +4.5/+7.0, SimpleQA: +3.7/+5.3)

### 4.3 分布外泛化能力


**图1(d)：Memento在分布外数据集上的准确率提升**

- 在分布外任务上，基于案例的记忆带来**4.7%~9.6%**的绝对性能提升
- 这表明记忆机制能有效提升模型在未见过任务上的泛化能力

### 4.4 持续学习曲线


**图1(c)：不同记忆设计的持续学习曲线**

| 基线 | Iter 1 | Iter 2 | Iter 3 | Iter 4 | Iter 5 |
|------|--------|--------|--------|--------|--------|
| Memento w/o CBR | 78.65 | 80.93 | 82.62 | 83.53 | 84.47 |
| Memento w/ Non-Parametric CBR | 79.84 | 81.87 | 83.09 | 84.03 | 84.85 |
| **Memento w/ Parametric CBR** | **80.46** | **82.84** | **84.10** | **84.85** | **85.44** |

- 完整的Memento架构在所有迭代中始终优于消融版本
- 移除CBR会导致性能明显下降，证明参数化CBR和非参数化CBR组件的有效性


**表3：Memento在DeepResearcher数据集上不同案例数量的性能**

| 数据集 | K=0.F1 | K=0.PM | K=1.F1 | K=1.PM | K=2.F1 | K=2.PM | ... | K=32.F1 | K=32.PM |
|--------|--------|--------|--------|--------|--------|--------|-----|---------|---------|
| NQ | 39.5 | 67.8 | 41.1 | 74.4 | 41.3 | 72.7 | ... | 42.2 | 75.4 |
| TQ | 81.1 | 89.1 | 86.1 | 93.8 | 86.2 | 93.9 | ... | 85.5 | 93.9 |
| HotpotQA | 62.0 | 76.0 | 65.4 | 80.7 | 65.7 | 81.3 | ... | 66.4 | 83.2 |
| **Average** | **59.9** | **72.2** | **63.6** | **77.9** | **63.7** | **78.1** | ... | **63.9** | **78.1** |

- 随着案例数量增加，性能持续提升，但收益递减
- K=1时已有显著提升，K=4后提升趋于平缓

### 4.5 效率分析

![d6f338b0.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Memento_zh/resources/d6f338b0.png)<br>
**图6：GAIA上的令牌成本**

- **输入令牌**随任务难度急剧增加：
  - Level 1：26k输入令牌，4.7k输出令牌
  - Level 2：48k输入令牌，6.9k输出令牌
  - Level 3：121k输入令牌，9.8k输出令牌
- **输出令牌**在任务级别间保持稳定，表明系统有效控制生成长度
- 复杂场景中的主要计算负担来自整合和分析多步工具输出

![56034bc1.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Memento_zh/resources/56034bc1.png)<br>
**图5：每个任务类型在各难度级别的平均数量**

- 随着难度级别增加，代码、搜索和爬取任务占主导地位
- Level 3任务需要更长的推理范围和高级工具协调

## 5. 讨论与分析

### 5.1 与其他记忆机制的比较


**表7：记忆机制的详细比较**

| 方法 | 核 | 神经Q | Q函数 | 读取 | 写入 | 梯度 |
|------|-----|-------|-------|------|------|------|
| 表格Q学习 | 无 | 无 | Q表 | 精确匹配 | Eq. (8) | - |
| 深度Q学习 | 无 | 有 | 神经网络 | Eq. (7) | Eq. (24) | Eq. (25) |
| 神经情节控制 | 有 | 无 | Eq. (9) | Eq. (7) | Eq. (10) | Eq. (11) |
| 非参数记忆 | 无 | 无 | 无 | Eq. (13) | Eq. (12) | - |
| **参数记忆** | **无** | **有** | **神经网络** | **Eq. (16)** | **Eq. (15)** | **Eq. (26)** |

- **表格Q学习**：在离散空间中有效，但无法泛化
- **深度Q学习**：通过共享参数实现泛化，但优化不稳定且数据需求大
- **神经情节控制**：通过可学习核正则化值估计，平衡泛化与稳定性
- **Memento参数记忆**：在保持数据高效适应的同时实现状态空间泛化

### 5.2 方法优势与局限性

**优势**：
- **无需微调**：避免了LLM参数更新的高计算成本
- **持续学习**：通过记忆机制实现在线适应
- **分布外泛化**：在未见过的任务上表现优异
- **模块化设计**：规划器与执行器分离，便于扩展

**局限性**：
- **案例库饱和**：约3k训练数据后性能提升有限
- **Level 3任务挑战**：需要更长推理范围和高级工具协调的任务仍有困难
- **依赖基础模型**：在缺乏足够领域知识的情况下，难以处理专业级任务

## 6. 结论

Memento提出了一种创新的自适应LLM Agents学习范式，通过基于记忆的在线强化学习实现无需微调的持续适应：

1. **理论贡献**：形式化了记忆增强马尔可夫决策过程(M-MDP)，为LLM Agents提供理论基础
   
2. **技术贡献**：
   - 设计了案例库(Case Bank)机制存储和利用过去经验
   - 提出记忆读写机制实现策略的持续改进
   - 实现了规划-执行器框架，有效整合工具使用

3. **实证贡献**：
   - 在GAIA验证集上达到**87.88% Pass@3**，测试集上**79.40%**
   - 在DeepResearcher数据集上达到**66.6% F1**和**80.4% PM**
   - 在分布外任务上带来**4.7%~9.6%**的绝对性能提升

4. **实践意义**：
   - 为开发能够连续、实时学习的通用LLM Agents提供了可扩展且高效的途径
   - 推动机器学习向开放式技能获取和深度研究场景发展

Memento证明了无需参数更新的持续学习是可行的，为LLM Agents研究开辟了新方向。代码已在[https://github.com/Agent-on-the-Fly/Memento](https://github.com/Agent-on-the-Fly/Memento)公开。`
    },
    {
      id: "blog-daily-os-agents",
      title: "OS Agents研究综述报告",
      file: "Blogs/DailyPaper/OS_Agents_zh/report.md",
      difficulty: "中级",
      duration: "0.5h",
      week: 0,
      phase: 0,
      keywords: ["OS Agents", "操作系统代理", "GUI Agent", "智能体", "综述"],
      content: `# OS Agents研究综述报告




## 1. 引言与基础

### 1.1 OS Agents定义

OS Agents（操作系统代理）是指能够理解、交互和操作操作系统界面（包括GUI、命令行等）的智能代理系统。这类代理通过感知操作系统环境、规划任务执行路径、记忆历史交互信息并执行具体操作，实现对计算机系统的自主控制。

### 1.2 OS Agents基础组件


![8bb0b4c0.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/OS_Agents_zh/resources/8bb0b4c0.png)<br>

**Figure 1: OS Agents基础框架**

如图1所示，OS Agents的核心基础包括两个主要方面：
- **基础模型**：提供语言理解、推理和生成能力
- **代理框架**：实现感知、规划、记忆和行动的闭环系统

OS Agents的关键能力在于能够将自然语言指令转化为对操作系统界面的具体操作，实现人机交互的自动化。

## 2. OS Agents构建方法

### 2.1 基础模型

![78de22de.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/OS_Agents_zh/resources/78de22de.png)<br>

**Figure 2: OS Agents基础模型构建方法**

#### 2.1.1 架构设计

OS Agents的基础模型架构主要分为四类：
- **现有模型(Existing)**：直接使用现有的多模态语言模型(MLLMs)或大型语言模型(LLMs)
- **修改模型(Modified)**：对现有模型进行架构调整以适应OS环境
- **拼接模型(Concatenated)**：将多个模型组件拼接形成完整系统
- **专用架构**：为OS任务专门设计的新型架构

#### 2.1.2 训练策略

基础模型的训练策略主要包括：

| 训练策略 | 描述 | 代表工作 |
|---------|------|---------|
| **预训练(Pre-training)** | 在大规模OS相关数据上进行预训练 | ScreenAI, TinyClick |
| **监督微调(Supervised Fine-tuning)** | 使用人工标注的OS操作数据进行微调 | UIX, Ferret-UI 2 |
| **强化学习(Reinforcement Learning)** | 通过与环境交互获得奖励信号进行优化 | GLAINTEL, WebAI |

![edc18201.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/OS_Agents_zh/resources/edc18201.png)<br>

**Table 1: 近期OS Agents基础模型概览**

该表格详细列出了40余种OS Agents基础模型，按时间顺序从2017年至今。主要发现：
- 近两年(2023-2024)研究爆发式增长，占全部模型的90%以上
- 多模态语言模型(MLLMs)是主流架构选择(占比约75%)
- 监督微调(SFT)是最常用的训练策略(占比约85%)
- 强化学习(RL)应用逐渐增多，但占比仍较低(约20%)

### 2.2 代理框架

![f7241aec.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/OS_Agents_zh/resources/f7241aec.png)<br>

**Figure 3: OS Agents代理框架组件**

OS Agents的代理框架由四个核心组件构成，形成完整的感知-规划-记忆-行动闭环：

#### 2.2.1 感知(Perception)

感知组件负责收集和分析操作系统环境信息，主要分为两类：

- **文本描述(Textual Description)**：将OS状态转换为文本描述
  - 代表工作：MobileGPT, ACE, Laser
  - 优势：与LLM原生兼容
  - 局限：丢失视觉信息

- **GUI截图(GUI Screenshots)**：直接处理界面视觉信息
  - 代表工作：OSCAR, AppAgent, Mobile-Agent
  - 优势：保留完整界面信息
  - 局限：需要多模态处理能力

此外，还有**视觉定位(Visual Grounding)**、**语义定位(Semantic Grounding)**和**双定位(Dual Grounding)**等高级感知技术。

#### 2.2.2 规划(Planning)

规划组件负责制定任务执行策略，主要方法包括：

- **全局规划(Global Planning)**：一次性生成完整任务计划
- **迭代规划(Iterative Planning)**：逐步生成并调整执行计划
- **分层规划(Hierarchical Planning)**：将任务分解为子任务序列

代表工作：OS-Copilot(全局规划)、AppAgent(迭代规划)、Thil等(分层规划)

#### 2.2.3 记忆(Memory)

记忆组件管理历史交互信息，主要技术包括：

- **经验增强(Experience-Augmented)**：存储成功/失败案例
- **自动化探索(Automated Exploration)**：主动收集新经验
- **记忆管理(Memory Management)**：优化记忆存储与检索

代表工作：Agent S(经验增强+自动化探索)、WebVoyager(记忆管理)

#### 2.2.4 行动(Action)

行动组件执行具体操作，主要包括三类：

- **输入操作(Input Operations)**：文本输入、表单填写等
- **导航操作(Navigation Operations)**：点击、滑动、滚动等
- **扩展操作(Extended Operations)**：截图、复制粘贴等高级操作

![dab40d99.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/OS_Agents_zh/resources/dab40d99.png)<br>

**Table 2: 近期OS Agents代理框架概览**

该表格详细比较了30余种OS Agents代理框架，主要发现：
- GUI截图(GS)是最主流的感知方式(占比约70%)
- 迭代规划(IT)是主要的规划策略(占比约50%)
- 自动化探索(AE)是常用的记忆技术(占比约45%)
- 输入操作(IO)和导航操作(NO)是最基本的行动能力

## 3. OS Agents评估方法

### 3.1 评估协议

#### 3.1.1 评估原则

OS Agents的评估需要结合客观与主观方法：
- **客观评估**：基于标准化数值指标的量化评估
- **主观评估**：通过人类评估代理的实际可用性

评估应覆盖多维度能力：
- 感知准确性：正确理解OS界面的能力
- 内容质量：生成内容的相关性和准确性
- 行动有效性：执行操作的成功率
- 操作效率：完成任务所需的时间和步骤

#### 3.1.2 评估指标

主要评估指标包括：
- **精确匹配(Exact Match)**：完全匹配预期结果
- **模糊匹配(Fuzzy Match)**：部分匹配或语义相似
- **语义匹配(Semantic Matching)**：基于语义理解的评估
- **任务成功率(Task Success Rate)**：完成任务的比例
- **操作效率(Operation Efficiency)**：完成任务所需的步骤数

### 3.2 评估基准

![883d67bb.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/OS_Agents_zh/resources/883d67bb.png)<br>

**Table 3: 近期OS Agents评估基准**

#### 3.2.1 评估平台

OS Agents评估基准主要分为三类平台：
- **移动设备(Mobile/PC)**：AndroidControl, AndroidWorld, B-MoCA
- **桌面系统(PC)**：WindowsAgentArena, OfficeBench, OSWorld
- **Web平台(Web)**：Mind2Web, WebArena, WorkArena

#### 3.2.2 基准设置

基准设置分为两类：
- **交互式(Interactive)**：需要与真实环境交互(占比约60%)
- **静态(Static)**：基于预录数据集进行评估(占比约40%)

#### 3.2.3 任务类型

主要任务类型包括：
- **GUI定位(GUI Grounding)**：将指令映射到界面元素
- **信息处理(Information Processing)**：从界面提取信息
- **代理任务(Agentic Tasks)**：完成端到端操作任务
- **代码生成(Code Generation)**：生成可执行代码

## 4. 挑战与未来方向

### 4.1 安全与隐私

#### 4.1.1 攻击

OS Agents面临多种安全威胁：
- 恶意指令注入攻击
- 界面欺骗攻击
- 权限滥用风险
- 敏感信息泄露

#### 4.1.2 防御

主要防御策略包括：
- 输入验证与过滤
- 操作权限限制
- 安全沙箱环境
- 人类监督机制

#### 4.1.3 基准测试

需要开发专门的安全评估基准，如：
- 安全漏洞检测测试集
- 隐私保护能力评估
- 对抗攻击鲁棒性测试

### 4.2 个性化与自我进化

#### 4.2.1 个性化

- 适应用户习惯和偏好
- 学习用户特定工作流程
- 个性化界面理解

#### 4.2.2 自我进化

- 在线学习与适应
- 错误恢复与自我修正
- 经验积累与知识迁移

## 5. 结论

OS Agents作为连接自然语言与操作系统界面的桥梁，正处于快速发展阶段。当前研究主要集中在基础模型构建和代理框架设计上，多模态语言模型成为主流技术路线。评估方法逐渐标准化，但仍需更全面的基准测试。未来研究应重点关注安全性、隐私保护以及个性化能力，推动OS Agents向更实用、更可靠的方向发展。

随着技术的不断进步，OS Agents有望成为人机交互的新范式，使普通用户能够通过自然语言指令高效地操作系统和应用程序，极大降低数字技术的使用门槛。`
    },
    {
      id: "blog-daily-qwen-image",
      title: "Qwen-Image：先进的图像生成基础模型技术报告",
      file: "Blogs/DailyPaper/Qwen-Image_Tech_Report/report.md",
      difficulty: "中级",
      duration: "1h",
      week: 0,
      phase: 0,
      keywords: ["Qwen-Image", "图像生成", "文本渲染", "图像编辑", "通义千问"],
      content: `<span style="color: darkgreen; font-weight: bold; font-family: monospace;">Powered by [MS-Agent](https://github.com/modelscope/ms-agent) | [DocResearch](https://github.com/modelscope/ms-agent/blob/main/projects/doc_research/README.md)</span>
<br>


---
# Qwen-Image：先进的图像生成基础模型技术报告

## 1. 概述

Qwen-Image是通义千问系列中的一款图像生成基础模型，专注于解决**复杂文本渲染**和**精确图像编辑**两大关键挑战。该模型在多项基准测试中达到或超越现有最先进水平，尤其在中文文本渲染方面表现突出。

### 1.1 主要创新点

- **卓越的文本渲染能力**：支持多行布局、段落级语义和细粒度细节，同时兼容英文字母语言和中文象形文字
- **一致的图像编辑能力**：通过改进的多任务训练范式，实现语义一致性和视觉保真度的平衡
- **强大的跨基准性能**：在多个生成和编辑任务中表现出色，建立了强大的图像生成基础模型




### 1.2 性能概览

Qwen-Image在图像生成和编辑任务中表现出色，在文本渲染方面尤其突出：

![d2d5a109.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/d2d5a109.png)<br>

*图1(a)：Qwen-Image在图像生成和编辑基准测试中的表现*

![59d82703.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/59d82703.png)<br>

*图1(b)：Qwen-Image在文本渲染基准测试中的表现，特别是在中文方面*

## 2. 模型架构

### 2.1 整体架构

Qwen-Image采用标准的双流MMDiT（Multimodal Diffusion Transformer）架构，主要组件包括：

- **Qwen2.5-VL**：提供输入表示的视觉语言模型
- **VAE编码器**：提供重建表示
- **MMDiT**：联合建模文本和图像

![d0b3b3fc.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/d0b3b3fc.png)<br>

*图6：Qwen-Image架构概览*

### 2.2 创新性位置编码：MSRoPE

Qwen-Image引入了**多模态可扩展RoPE（MSRoPE）**，解决了传统位置编码在文本-图像联合任务中的局限性：

- 将文本视为2D张量，对两个维度应用相同的位置ID
- 文本概念上沿图像网格对角线连接
- 保留图像分辨率缩放优势，同时保持与1D-RoPE在文本侧的功能等效性

![193720b6.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/193720b6.png)<br>

*图8：不同图像-文本联合位置编码策略比较*

### 2.3 模型配置

| 组件 | 属性 | 值 |
|------|------|-----|
| VLM.ViT | 层数 | 32 |
| VLM.LLM | 层数 | 28 |
| VAE.Enc | 层数 | 11 |
| VAE.Dec | 层数 | 15 |
| MMDiT | 层数 | 60 |
| VLM.ViT | 头数 (Q/KV) | 16/16 |
| VLM.LLM | 头数 (Q/KV) | 28/4 |
| MMDiT | 头数 (Q/KV) | 24/24 |
| MMDiT | 头尺寸 | 128 |
| MMDiT | 中间层尺寸 | 12,288 |
| VAE.Enc | 通道尺寸 | 16 |
| VAE.Dec | 通道尺寸 | 16 |
| VLM.ViT | 参数量 | 7B |
| VAE.Enc | 参数量 | 54M |
| VAE.Dec | 参数量 | 73M |
| MMDiT | 参数量 | 20B |

*表1：Qwen-Image架构配置*

## 3. 数据处理

### 3.1 数据收集策略

Qwen-Image系统地收集和标注了数十亿图像-文本对，重点关注数据质量和平衡分布，构建了一个能反映真实场景的代表性数据集。数据集分为四大主要领域：

![497bf359.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/497bf359.png)<br>

*图9：数据收集概览*

- **自然类（55%）**：包括物体、风景、城市景观、植物、动物、室内和食物等子类别
- **设计类（27%）**：包括海报、用户界面、演示文稿以及各种艺术形式
- **人物类（13%）**：包括肖像、体育和人类活动等
- **合成数据（5%）**：通过受控文本渲染技术合成的数据

### 3.2 多阶段数据过滤管道

Qwen-Image采用七阶段数据过滤管道，逐步提高数据质量：

![edae161c.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/edae161c.png)<br>

*图10：多阶段数据过滤管道概览*

#### 3.2.1 阶段1：初始预训练数据整理
- 应用损坏文件过滤器、文件大小过滤器
- 分辨率过滤器、去重过滤器
- NSFW过滤器（排除性、暴力或其他冒犯性内容）

#### 3.2.2 阶段2：图像质量增强
- 旋转过滤器（移除显著旋转或翻转的图像）
- 清晰度过滤器（丢弃模糊或失焦图像）
- 亮度过滤器、饱和度过滤器
- 熵过滤器、纹理过滤器

![6e940eb7.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/6e940eb7.png)<br>

*图11：过滤操作符示例*

#### 3.2.3 阶段3：图像-文本对齐改进
- 将数据集分为原始标题、重新标注和融合标题三个部分
- 应用中文CLIP和SigLIP 2过滤器
- 令牌长度过滤器、无效标题过滤器

#### 3.2.4 阶段4：文本渲染增强
- 将数据集分为英语、中文、其他语言和无文本四个部分
- 引入合成文本渲染数据
- 应用密集文本过滤器和小字符过滤器

#### 3.2.5 阶段5：高分辨率优化
- 图像质量过滤器、分辨率过滤器
- 审美过滤器、异常元素过滤器

#### 3.2.6 阶段6：类别平衡和肖像增强
- 将数据集重新分类为通用、肖像和文本渲染三类
- 通过关键词检索和图像检索技术增强数据集
- 应用过滤器移除面部马赛克或模糊的图像

#### 3.2.7 阶段7：平衡的多尺度训练
- 在640p和1328p分辨率上联合训练
- 设计层次分类系统进行图像分类
- 采用特殊重采样策略平衡文本渲染数据

### 3.3 文本感知图像合成

针对真实世界图像中文本的长尾分布问题，Qwen-Image提出三阶段文本感知图像合成管道：

![b7fe627f.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/b7fe627f.png)<br>

*图13：数据合成概览*

#### 3.3.1 简单背景中的纯渲染
- 从大规模高质量语料库中提取文本段落
- 使用动态布局算法在干净背景上渲染
- 严格的质量控制机制确保字符完整性

#### 3.3.2 上下文场景中的组合渲染
- 将合成文本嵌入到现实视觉上下文中
- 模拟文本写在或打印在各种物理媒介上
- 使用Qwen-VL Captioner生成描述性标题

#### 3.3.3 结构化模板中的复杂渲染
- 基于预定义模板的程序化编辑
- 设计基于规则的系统自动化替换占位符文本
- 保持布局结构、对齐和格式的完整性

## 4. 训练策略

### 4.1 渐进式训练方法

Qwen-Image采用渐进式训练策略，从非文本到文本渲染，从简单到复杂的文本输入，逐步扩展到段落级描述：

- 从基本图像生成开始
- 逐步引入简单文本渲染
- 过渡到复杂文本布局和语义
- 最终实现段落级文本渲染能力

这种方法显著提高了模型的原生文本渲染能力。

### 4.2 多任务训练范式

为增强图像编辑一致性，Qwen-Image引入改进的多任务训练范式：

- 传统文本到图像（T2I）任务
- 文本-图像到图像（TI2I）任务
- 图像到图像（I2I）重建任务

这种多任务训练有效对齐了Qwen2.5-VL和MMDiT之间的潜在表示。

### 4.3 双编码机制

Qwen-Image采用双编码机制处理图像编辑任务：

- 将原始图像分别输入Qwen2.5-VL和VAE编码器
- 分别获得语义表示和重建表示
- 使编辑模块能够在保持语义一致性和视觉保真度之间取得平衡

![c4a825e1.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/c4a825e1.png)<br>

*图14：图像编辑（TI2I）任务概览*

## 5. 评估结果

### 5.1 VAE重建性能

Qwen-Image的VAE在图像重建方面表现出色，特别是在文本渲染方面：

| 模型 | Imagenet_256x256.PSNR | Imagenet_256x256.SSIM | Text_256x256.PSNR | Text_256x256.SSIM |
|------|------------------------|------------------------|--------------------|--------------------|
| Wan2.1-VAE | 31.29 | 0.8870 | 26.77 | 0.9386 |
| Hunyuan-VAE | 33.21 | 0.9143 | 32.83 | 0.9773 |
| FLUX-VAE | 32.84 | 0.9155 | 32.65 | 0.9792 |
| Cosmos-CI-VAE | 32.23 | 0.9010 | 30.62 | 0.9664 |
| SD-3.5-VAE | 31.22 | 0.8839 | 29.93 | 0.9658 |
| **Qwen-Image-VAE** | **33.42** | **0.9159** | **36.63** | **0.9839** |

*表2：VAE的定量评估结果*

![0c764f8b.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/0c764f8b.png)<br>

*图17：VAE重建可视化，比较不同VAE在密集文档图像中重建小文本的能力*

### 5.2 文本到图像（T2I）任务评估

#### 5.2.1 通用生成能力

Qwen-Image在多个通用图像生成基准测试中表现优异：

**DPG基准测试结果：**

| 模型 | Global | Entity | Attribute | Relation | Other | Overall |
|------|--------|--------|-----------|----------|-------|---------|
| SD v1.5 | 74.63 | 74.23 | 75.39 | 73.49 | 67.81 | 63.18 |
| ... | ... | ... | ... | ... | ... | ... |
| GPT Image 1 [High] | 90.97 | 89.61 | 88.39 | 90.58 | 89.83 | 83.50 |
| **Qwen-Image** | **91.32** | **91.56** | **92.02** | **94.31** | **92.73** | **88.32** |

*表3：DPG基准测试的定量评估结果*

**GenEval基准测试结果：**

| 模型 | Single Object | Two Object | Counting | Colors | Position | Attribute Binding | Overall |
|------|---------------|------------|----------|--------|----------|-------------------|---------|
| Show-o | 0.95 | 0.52 | 0.49 | 0.82 | 0.11 | 0.28 | 0.53 |
| ... | ... | ... | ... | ... | ... | ... | ... |
| GPT Image 1 [High] | 0.99 | 0.92 | 0.85 | 0.92 | 0.75 | 0.61 | 0.84 |
| **Qwen-Image** | **0.99** | **0.92** | **0.89** | **0.88** | **0.76** | **0.77** | **0.87** |
| Qwen-Image-RL | 1.00 | 0.95 | 0.93 | 0.92 | 0.87 | 0.83 | 0.91 |

*表4：GenEval基准测试的定量评估结果*

**OneIG-Bench基准测试结果：**

| 模型 | Alignment | Text | Reasoning | Style | Diversity | Overall |
|------|-----------|------|-----------|-------|-----------|---------|
| Janus-Pro | 0.553 | 0.001 | 0.139 | 0.276 | 0.365 | 0.267 |
| ... | ... | ... | ... | ... | ... | ... |
| GPT Image 1 [High] | 0.851 | 0.857 | 0.345 | 0.462 | 0.151 | 0.533 |
| **Qwen-Image** | **0.882** | **0.891** | **0.306** | **0.418** | **0.197** | **0.539** |

*表5：OneIG-EN基准测试的定量评估结果*

| 模型 | Alignment | Text | Reasoning | Style | Diversity | Overall |
|------|-----------|------|-----------|-------|-----------|---------|
| Janus-Pro | 0.324 | 0.148 | 0.104 | 0.264 | 0.358 | 0.240 |
| ... | ... | ... | ... | ... | ... | ... |
| GPT Image 1 [High] | 0.812 | 0.650 | 0.300 | 0.449 | 0.159 | 0.474 |
| **Qwen-Image** | **0.825** | **0.963** | **0.267** | **0.405** | **0.279** | **0.548** |

*表6：OneIG-ZH基准测试的定量评估结果*

**TIIF基准测试结果：**

| 模型 | Overall short | Basic Following | Advanced Following | Designer |
|------|---------------|-----------------|--------------------|----------|
| ... | ... | ... | ... | ... |
| GPT Image 1 [High] | 89.15 | 90.75 | 88.55 | 89.73 |
| **Qwen-Image** | **86.14** | **86.18** | **79.30** | **90.30** |

*表7：TIIF Bench mini基准测试的定量评估结果*

#### 5.2.2 文本渲染能力

**CVTG-2K英文文本渲染评估：**

| 模型 | Word Accuracy (avg) | NED | CLIPScore |
|------|---------------------|-----|-----------|
| SD3.5 Large | 0.6548 | 0.8470 | 0.7797 |
| ... | ... | ... | ... |
| GPT Image 1 [High] | 0.8569 | 0.9478 | 0.7982 |
| **Qwen-Image** | **0.8288** | **0.9116** | **0.8017** |

*表8：CVTG-2K英文文本渲染的定量评估结果*

**ChineseWord中文文本渲染评估：**

| 模型 | Level-1 Acc | Level-2 Acc | Level-3 Acc | Overall |
|------|-------------|-------------|-------------|---------|
| Seedream 3.0 | 53.48 | 26.23 | 1.25 | 33.05 |
| GPT Image 1 [High] | 68.37 | 15.97 | 3.55 | 36.14 |
| **Qwen-Image** | **97.29** | **40.53** | **6.48** | **58.30** |

*表9：ChineseWord中文文本渲染的定量评估结果*

**LongText-Bench长文本渲染评估：**

| 模型 | LongText-Bench-EN | LongText-Bench-ZH |
|------|-------------------|-------------------|
| Janus-Pro | 0.019 | 0.006 |
| ... | ... | ... |
| GPT Image 1 [High] | 0.956 | 0.619 |
| **Qwen-Image** | **0.943** | **0.946** |

*表10：LongText-Bench长文本渲染的定量评估结果*

### 5.3 图像编辑（TI2I）任务评估

#### 5.3.1 通用图像编辑

**GEdit-Bench评估结果：**

| 模型 | GEdit-Bench-EN (G_SC) | GEdit-Bench-EN (G_PQ) | GEdit-Bench-EN (G_O) | GEdit-Bench-CN (G_SC) | GEdit-Bench-CN (G_PQ) | GEdit-Bench-CN (G_O) |
|------|------------------------|------------------------|------------------------|------------------------|------------------------|------------------------|
| ... | ... | ... | ... | ... | ... | ... |
| GPT Image 1 [High] | 7.85 | 7.62 | 7.53 | 7.67 | 7.56 | 7.30 |
| **Qwen-Image** | **8.00** | **7.86** | **7.56** | **7.82** | **7.79** | **7.52** |

*表11：GEdit-Bench的语义一致性、感知质量和总体评分比较*

**ImgEdit评估结果：**

| 模型 | Add | Adjust | Extract | Replace | Remove | Background | Style | Hybrid | Action | Overall |
|------|-----|--------|---------|---------|--------|------------|-------|--------|--------|---------|
| ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |
| GPT Image 1 [High] | 4.61 | 4.33 | 2.90 | 4.35 | 3.66 | 4.57 | 4.93 | 3.96 | 4.89 | 4.20 |
| **Qwen-Image** | **4.38** | **4.16** | **3.43** | **4.66** | **4.14** | **4.38** | **4.81** | **3.82** | **4.69** | **4.27** |

*表12：ImgEdit基准测试的定量比较结果*

#### 5.3.2 3D视觉任务

**GSO数据集上的新视角合成：**

| 模型 | PSNR | SSIM | LPIPS |
|------|------|------|-------|
| Zero123 | 13.48 | 0.854 | 0.166 |
| ... | ... | ... | ... |
| GPT Image 1 [High] | 12.07 | 0.804 | 0.361 |
| **Qwen-Image** | **15.11** | **0.884** | **0.153** |

*表13：新视角合成的定量比较*

**深度估计任务：**

| 模型 | KITTI (AbsRel) | KITTI (δ1) | NYUv2 (AbsRel) | NYUv2 (δ1) | ScanNet (AbsRel) | ScanNet (δ1) | DIODE (AbsRel) | DIODE (δ1) | ETH3D (AbsRel) | ETH3D (δ1) |
|------|----------------|------------|----------------|------------|-----------------|--------------|----------------|-------------|----------------|-------------|
| ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |
| Depth Pro | 0.055 | 0.974 | 0.042 | 0.977 | 0.041 | 0.978 | 0.217 | 0.764 | 0.043 | 0.974 |
| **Qwen-Image** | **0.078** | **0.951** | **0.055** | **0.967** | **0.047** | **0.974** | **0.197** | **0.832** | **0.066** | **0.962** |

*表14：深度估计任务的定量比较结果*

## 6. 案例展示

### 6.1 文本渲染能力展示



*图2：Qwen-Image在复杂文本渲染方面的展示，包括多行布局、段落级语义和细粒度细节*

![02a326aa.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/02a326aa.png)<br>
![71c801ce.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/71c801ce.png)<br>

*图18-19：英文文本渲染能力比较*

![0c2b282d.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/0c2b282d.png)<br>
![20e108e0.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/20e108e0.png)<br>

*图20-21：中文文本渲染能力比较*

### 6.2 通用图像生成展示

![0af9f8c9.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/0af9f8c9.png)<br>

*图3：Qwen-Image在通用图像生成方面的展示，支持多种艺术风格*

![fcc5f816.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/fcc5f816.png)<br>
![c21ea5d8.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/c21ea5d8.png)<br>
![91f87b95.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/91f87b95.png)<br>
![155268ee.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/155268ee.png)<br>
![1415ab16.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/1415ab16.png)<br>

*图22：多对象建模能力比较*

![b16de4f6.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/b16de4f6.png)<br>
![f619ee08.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/f619ee08.png)<br>
![83c63040.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/83c63040.png)<br>
![7666d586.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/7666d586.png)<br>
![e5b3c7da.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/e5b3c7da.png)<br>
![0ae04418.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/0ae04418.png)<br>

*图23：空间关系建模能力比较*

### 6.3 图像编辑能力展示

![919f7725.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/919f7725.png)<br>

*图4：Qwen-Image在通用图像编辑方面的展示，包括风格转换、文本编辑、背景更改、对象添加、移除和替换、姿态操作等*

![d08eefac.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/d08eefac.png)<br>
![07fee2fa.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/07fee2fa.png)<br>
![fecd3f20.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/fecd3f20.png)<br>
![708a8831.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/708a8831.png)<br>
![ae437950.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/ae437950.png)<br>
![dbf98a7e.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/dbf98a7e.png)<br>

*图24：文本和材质修改的定性比较*

![c72b58a5.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/c72b58a5.png)<br>
![990f8c48.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/990f8c48.png)<br>
![28c87ff8.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/28c87ff8.png)<br>
![fb884244.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/fb884244.png)<br>
![7f77ef28.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/7f77ef28.png)<br>
![320e0546.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/320e0546.png)<br>

*图25：对象编辑（添加、移除和替换）的定性比较*

![638f55e3.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/638f55e3.png)<br>
![02af7d57.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/02af7d57.png)<br>
![09f9478e.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/09f9478e.png)<br>
![52f59d4b.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/52f59d4b.png)<br>
![a7ce6bac.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/a7ce6bac.png)<br>
![27b2b04c.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/27b2b04c.png)<br>
![f541d6b7.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/f541d6b7.png)<br>

*图26：姿态操作的定性比较*


![1d6b7a53.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/1d6b7a53.png)<br>
![3e94aa25.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/3e94aa25.png)<br>

![9dc1692e.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/9dc1692e.png)<br>
![0cdd20a1.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/0cdd20a1.png)<br>
![5c67eb5e.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/5c67eb5e.png)<br>
![95796815.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/95796815.png)<br>
![f8a6f732.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/f8a6f732.png)<br>
![379abfaf.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/379abfaf.png)<br>

*图27：链式编辑的示例*

![45362bd1.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/45362bd1.png)<br>
![aa609d11.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/aa609d11.png)<br>
![7da67bdc.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/7da67bdc.png)<br>

*图28：新视角合成的定性比较*

### 6.4 图像理解任务展示

![c5d6d0ef.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Qwen-Image_Tech_Report/resources/c5d6d0ef.png)<br>

*图5：Qwen-Image在图像理解任务中的展示，包括检测、分割、深度/边缘估计、新视角合成和超分辨率*

## 7. 结论

Qwen-Image作为一款先进的图像生成基础模型，在以下方面取得了显著进展：

1. **复杂文本渲染**：通过全面的数据管道和渐进式训练策略，实现了高质量的多语言文本渲染，尤其在中文象形文字方面表现突出
   
2. **精确图像编辑**：通过改进的多任务训练范式和双编码机制，有效平衡了语义一致性和视觉保真度
   
3. **广泛的适用性**：不仅支持标准的文本到图像生成，还能处理图像编辑、新视角合成、深度估计等多种任务

Qwen-Image在多个基准测试中达到或超越现有最先进水平，特别是在文本渲染和图像编辑方面。其开源实现可在以下平台获取：

- GitHub: [https://github.com/QwenLM/Qwen-Image](https://github.com/QwenLM/Qwen-Image)
- ModelScope: [https://modelscope.cn/models/Qwen/Qwen-Image](https://modelscope.cn/models/Qwen/Qwen-Image)
- Hugging Face: [https://huggingface.co/Qwen/Qwen-Image](https://huggingface.co/Qwen/Qwen-Image)

Qwen-Image代表了图像生成模型在文本渲染和图像编辑能力方面的重要突破，为未来的研究和应用提供了坚实基础。`
    },
    {
      id: "blog-daily-survey-self-evolving",
      title: "自演进AI智能体：从静态模型到自主进化的范式转变",
      file: "Blogs/DailyPaper/Survey_Agent_Self-Evolving_zh/report.md",
      difficulty: "中级",
      duration: "0.5h",
      week: 0,
      phase: 0,
      keywords: ["自演进", "Agent", "综述", "Self-Evolving", "智能体进化"],
      content: `# 自演进AI智能体：从静态模型到自主进化的范式转变

## 1. 引言

### 1.1 大型语言模型的发展背景

近年来，大型语言模型(LLMs)在人工智能领域取得了显著进展。通过大规模预训练、监督微调和强化学习等技术，LLMs在规划、推理和自然语言理解方面展现出卓越能力（Zhao et al., 2023; Grattafiori et al., 2024; Yang et al., 2025a; Guo et al., 2025）。这些进步催生了基于LLM的智能体（LLM-based agents）——一类以LLM作为决策/策略模块的AI智能体（Wang et al., 2024c; Luo et al., 2025a）。

![292e61a2.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Survey_Agent_Self-Evolving_zh/resources/292e61a2.png)<br>
**图1：LLM-centric学习的演进过程**  
LLM-centric学习正从纯粹基于静态数据的学习，发展到与动态环境交互，最终迈向通过多智能体协作和自我演进实现的终身学习。

### 1.2 LLM智能体的定义与架构

LLM-based agents是自主系统，利用LLM作为核心推理组件，在开放、真实环境中理解输入、规划行动并生成输出（Wang et al., 2024c; Xi et al., 2025; Luo et al., 2025a）。典型的AI智能体包含以下关键组件：

- **基础模型**（如LLM）：核心组件，负责解释目标、制定计划和执行行动
- **感知模块**（Shridhar et al., 2021; Zheng et al., 2024）：帮助智能体感知输入
- **规划模块**（Yao et al., 2023a,b; Besta et al., 2024）：用于任务分解
- **记忆模块**（Modarressi et al., 2023; Zhong et al., 2024）：保留上下文信息
- **工具模块**（Schick et al., 2023; Gou et al., 2024; Liu et al., 2025d）：与外部工具交互

### 1.3 现有系统的局限性

尽管单智能体系统在各种任务中展现出强大的泛化和适应能力，但在动态复杂环境中常面临任务专业化和协调方面的挑战（Wu et al., 2024a; Qian et al., 2024）。这促使了多智能体系统(MAS)的发展，其中多个智能体协作解决复杂问题。与单智能体系统相比，MAS具有以下优势：

- **功能专业化**：每个智能体专精于特定子任务或领域
- **交互协作**：智能体间可交换信息、协调行为以实现共同目标
- **能力扩展**：能够处理超出单个智能体能力范围的任务

LLM-based智能体系统已成功应用于代码生成（Jiang et al., 2024）、科学研究（Lu et al., 2024a）、网页导航（Lai et al., 2024a）以及生物医学（Kim et al., 2024）和金融（Tian et al., 2025）等特定领域。

然而，现有系统（无论是单智能体还是多智能体）大多严重依赖人工设计的配置，部署后通常保持静态架构和固定功能。而现实环境是动态变化的，例如用户意图转变、任务需求变化、外部工具或信息源随时间变化等。在这种情况下，手动重新配置智能体系统耗时、费力且难以扩展。

## 2. 自演进AI智能体的概念框架

### 2.1 自演进AI智能体的定义

为应对上述挑战，研究者提出了**自演进AI智能体**（Self-Evolving AI Agents）这一新范式——一类能够自主适应和持续自我改进的智能体系统，将基础模型与终身学习的智能体系统连接起来。

### 2.2 自演进AI智能体的三定律

受阿西莫夫机器人三定律启发，文章提出了"自演进AI智能体的三定律"，作为确保安全演进的基本原则：

1. **持久性**（Endure - 安全适应）：自演进AI智能体在任何修改过程中必须保持安全性和稳定性
2. **卓越性**（Excel - 性能保持）：在满足第一定律的前提下，自演进AI智能体必须保持或提升现有任务性能
3. **演进性**（Evolve - 自主演进）：在满足前两定律的前提下，自演进AI智能体必须能够自主优化其内部组件，以响应变化的任务、环境或资源

### 2.3 LLM-centric学习范式的演进

文章将LLM-based系统的发展划分为四个递进的范式，从静态、冻结的基础模型逐步发展为完全自主、自我演进的智能体系统：


**表1：四种LLM-centric学习范式的比较**  
- **MOP**（Model Offline Pretraining，模型离线预训练）：初始阶段，专注于在大规模静态语料库上预训练基础模型，然后以固定、冻结状态部署，不再进行进一步适应
- **MOA**（Model Online Adaptation，模型在线适应）：在MOP基础上，引入部署后适应，通过监督微调、低秩适配器（LoRA）或基于人类反馈的强化学习（RLHF）等技术更新基础模型
- **MAO**（Multi-Agent Orchestration，多智能体编排）：超越单一基础模型，协调多个LLM智能体通过消息交换或辩论提示进行通信和协作，解决复杂任务而不修改底层模型参数
- **MASE**（Multi-Agent Self-Evolving，多智能体自演进）：引入终身自演进循环，智能体群体基于环境反馈和元奖励持续优化提示、记忆、工具使用策略甚至交互模式

从MOP到MASE的演进代表了LLM-based系统开发的根本性转变：从静态、人工配置的架构转向能够响应变化需求和环境的适应性、数据驱动系统。自演进AI智能体将基础模型的静态能力与终身智能体系统所需的持续适应性连接起来，为更自主、更具弹性和可持续的AI提供了路径。

## 3. 自演进智能体的核心组件

### 3.1 概念框架

自演进过程通常通过迭代优化实现，形成一个包含四个关键组件的闭环反馈循环：

![01ae718e.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Survey_Agent_Self-Evolving_zh/resources/01ae718e.png)<br>
**图3：自演进智能体系统的概念框架**  
该过程形成一个迭代优化循环，包含四个组件：系统输入、智能体系统、环境和优化器。

1. **系统输入**（System Inputs）：定义任务设置（如任务级或实例级），包括高级描述、输入数据、上下文信息或具体示例
2. **智能体系统**（Agent System）：以单智能体或多智能体架构执行指定任务
3. **环境**（Environment）：提供操作上下文，并通过代理指标提供反馈
4. **优化器**（Optimiser）：通过定义的搜索空间和优化算法更新智能体系统，直到达到性能目标

该过程开始于任务规范，智能体系统在环境中执行任务，环境提供反馈信号，优化器基于反馈更新系统，形成迭代闭环。当达到预定义性能阈值或满足收敛标准时，循环终止。

### 3.2 核心组件详解

- **系统输入**：定义智能体需要解决的问题，可以是任务描述、输入数据、上下文信息或示例
- **智能体系统**：执行任务的核心，可以是单智能体或多智能体架构
- **环境**：提供运行上下文并生成反馈信号，反馈基于预定义评估指标
- **优化器**：应用特定算法和策略更新智能体系统，如调整LLM参数、修改提示或优化系统结构

基于MASE概念框架，EvoAgentX是首个应用此自演进智能体过程的开源框架，旨在自动化生成、执行、评估和优化智能体系统（Wang et al., 2025i）。

## 4. 自演进技术分类

### 4.1 单智能体优化

单智能体优化专注于提升单个智能体系统的性能。根据优化反馈循环，关键挑战在于设计用于更新系统的优化器，包括确定要优化的系统组件（搜索空间）、要增强的特定能力以及选择适当的优化策略（优化算法）。

![2cc3484a.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Survey_Agent_Self-Evolving_zh/resources/2cc3484a.png)<br>
**图4：单智能体优化方法概述**  
按智能体系统内目标组件分类：提示、记忆和工具。

单智能体优化方法主要分为四类：

1. **LLM行为优化**：通过参数调整或测试时扩展技术提升LLM的推理和规划能力
2. **提示优化**：调整提示以引导LLM生成更准确、更符合任务的输出
3. **记忆优化**：增强智能体存储、检索和推理历史信息或外部知识的能力
4. **工具优化**：提升智能体有效利用现有工具，或自主创建/配置新工具以完成复杂任务的能力

### 4.2 多智能体优化

多智能体工作流定义了多个智能体如何通过结构化拓扑和交互模式协作解决复杂任务。该领域经历了根本性转变：从人工设计的智能体架构（研究者明确指定协作模式和通信协议）到自动发现有效协作策略的自演进系统。

![0c9d27f4.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Survey_Agent_Self-Evolving_zh/resources/0c9d27f4.png)<br>
**图6：多智能体系统优化方法概述**  
左侧为核心优化元素（空间、方法和目标），右侧为优化维度（提示、拓扑、统一和LLM骨干）。

多智能体工作流优化可从四个关键维度进行考察：

1. **手动设计范式**：建立基础原则，研究者明确指定协作模式和通信协议
2. **提示级优化**：在固定拓扑内优化智能体行为
3. **拓扑优化**：发现完成特定任务的最有效多智能体架构
4. **统一优化**：同时考虑多个优化空间，综合优化提示、拓扑和其他系统参数
5. **LLM骨干优化**：通过针对性训练增强智能体的基础推理和协作能力

该领域逐步扩展了对"可搜索和可优化参数"的理解范围，从智能体指令和通信结构到基础模型的核心能力。

### 4.3 领域特定优化

![b78f87c7.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Survey_Agent_Self-Evolving_zh/resources/b78f87c7.png)<br>
**图2：AI智能体演进和优化技术的可视化分类**  
分为三大方向：单智能体优化、多智能体优化和领域特定优化。树状结构展示了2023-2025年这些方法的发展，包括各分支的代表性方法。

![a7a983f3.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/Survey_Agent_Self-Evolving_zh/resources/a7a983f3.png)<br>
**图5：智能体自演进方法的分层分类**  
涵盖单智能体、多智能体和领域特定优化类别，并附有代表性工作示例。

领域特定优化针对特定应用场景（如操作系统智能体、医疗健康智能体等）开发专门的演进策略。这些方法考虑领域特有约束和需求，实现更有效的自演进能力。

## 5. 评估、安全与伦理考量

### 5.1 评估方法

评估自演进智能体系统需要考虑多维度指标：
- **任务性能**：在特定任务上的准确性和效率
- **适应能力**：面对新任务或环境变化时的适应速度和效果
- **稳定性**：演进过程中性能波动程度
- **安全性**：是否遵守三定律，特别是安全适应原则

### 5.2 安全考虑

自演进过程中必须确保：
- **行为一致性**：演进不应导致智能体行为与设计意图严重偏离
- **风险控制**：建立安全边界，防止演进导致有害行为
- **可解释性**：理解演进决策的原因，便于人工干预

### 5.3 伦理问题

自演进智能体引发的伦理问题包括：
- **责任归属**：当自演进系统产生不良后果时，责任如何界定
- **价值对齐**：确保演进过程与人类价值观保持一致
- **透明度**：用户应了解系统正在演进及其可能影响

## 6. 挑战与未来方向

### 6.1 现有挑战

1. **安全演进保障**：如何在保持系统安全的同时实现有效演进
2. **性能稳定性**：避免演进过程中出现性能退化
3. **评估标准缺失**：缺乏统一的评估框架衡量自演进能力
4. **资源效率**：自演进过程通常需要大量计算资源
5. **理论基础不足**：缺乏对自演进过程的理论分析和保证

### 6.2 未来研究方向

1. **安全演进机制**：开发更可靠的演进安全保障技术
2. **高效演进算法**：减少演进所需的计算资源和数据量
3. **跨领域迁移**：研究演进知识在不同任务间的迁移能力
4. **人机协同演进**：探索人类与智能体共同演进的机制
5. **理论框架构建**：建立自演进过程的理论分析框架

## 7. 结论

自演进AI智能体代表了AI系统发展的新范式，通过将基础模型与终身学习能力相结合，有望解决传统智能体系统在动态环境中的适应性问题。从MOP到MASE的范式演进展示了AI系统从静态模型向自主进化的转变历程。

尽管完全实现自演进AI智能体仍面临诸多挑战，但当前在单智能体优化、多智能体优化和领域特定优化方面的进展为未来研究奠定了基础。遵循"三定律"原则，结合系统化的概念框架和优化方法，研究者有望开发出更自主、更具适应性和更安全的AI系统，推动人工智能向更高级的自主智能发展。

未来研究应重点关注安全演进机制、高效演进算法和理论基础构建，同时加强评估标准和伦理框架的制定，确保自演进AI智能体的健康发展和负责任部署。`
    },
    {
      id: "blog-daily-dft-en",
      title: "Dynamic Fine-Tuning (DFT) for Mathematical Reasoning in LLMs: Performance Analysis Report",
      file: "Blogs/DailyPaper/dft_dynamic_fine_tuning/report.md",
      difficulty: "中级",
      duration: "1h",
      week: 0,
      phase: 0,
      keywords: ["DFT", "Dynamic Fine-Tuning", "Mathematical Reasoning", "LLM", "Fine-Tuning"],
      content: `<span style="color: darkgreen; font-weight: bold; font-family: monospace;">Powered by [MS-Agent](https://github.com/modelscope/ms-agent) | [DocResearch](https://github.com/modelscope/ms-agent/blob/main/projects/doc_research/README.md)</span>
<br>


# Dynamic Fine-Tuning (DFT) for Mathematical Reasoning in LLMs: Performance Analysis Report

## Executive Summary

This report analyzes the performance of Dynamic Fine-Tuning (DFT), a novel fine-tuning approach for enhancing mathematical reasoning capabilities in Large Language Models (LLMs). The analysis demonstrates that DFT consistently outperforms standard Supervised Fine-Tuning (SFT) across multiple model families and sizes, with particularly strong results on challenging mathematical benchmarks. DFT shows superior generalization, faster convergence, and better robustness compared to existing methods, establishing it as a promising technique for mathematical reasoning tasks.

---

## 1. Performance Comparison: DFT vs. SFT

### 1.1 Overall Performance Gains

DFT consistently yields significantly higher performance improvements over base models compared to standard SFT across all evaluated LLMs. The performance gains are substantial and consistent across different model families:

- **Qwen2.5-Math-1.5B**: DFT achieves +15.66 points average gain over base model, which is **5.9× larger** than SFT's +2.09 points
- **LLaMA-3.2-3B**: DFT achieves +3.46 points gain, exceeding SFT's +2.05 by **1.4×**
- **LLaMA-3.1-8B**: DFT achieves +10.02 points gain, surpassing SFT's +5.33 by **1.88×**
- **DeepSeekMath-7B**: DFT achieves +15.51 points gain, which is **1.58× larger** than SFT's +7.18
- **Qwen2.5-Math-7B**: DFT achieves +15.90 points gain, nearly **3.8× higher** than SFT's +2.37

### 1.2 Comprehensive Benchmark Results

The complete performance comparison across five mathematical reasoning benchmarks is presented in Table 1 below:

![d4cc2b90.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/dft_dynamic_fine_tuning/resources/d4cc2b90.png)<br>

**Table 1: Average@16 accuracy of five state-of-the-art large language models on five mathematical reasoning benchmarks**

| Model | Method | Math500 | Minerva Math | Olympiad Bench | AIME24 | AMC23 | Avg. |
|-------|--------|---------|--------------|----------------|--------|-------|------|
| LLaMA-3.2-3B | Base | 1.63 | 1.36 | 1.01 | 0.41 | 1.56 | 1.19 |
|  | SFT | 8.65 | 2.38 | 2.06 | 0.00 | 3.13 | 3.24 |
|  | **DFT** | **12.79** | **2.84** | **2.90** | **0.83** | **3.91** | **4.65** |
| LLaMA-3.1-8B | Base | 1.86 | 0.98 | 0.94 | 0.21 | 1.01 | 1.00 |
|  | SFT | 16.85 | 5.78 | 3.88 | 0.00 | 5.16 | 6.33 |
|  | **DFT** | **27.44** | **8.26** | **6.94** | **0.41** | **12.03** | **11.02** |
| DeepSeekMath-7B | Base | 6.15 | 2.15 | 1.74 | 0.21 | 2.97 | 2.64 |
|  | SFT | 26.83 | 7.26 | 6.33 | 0.41 | 8.28 | 9.82 |
|  | **DFT** | **41.46** | **16.79** | **15.00** | **1.24** | **16.25** | **18.15** |
| Qwen2.5-Math-1.5B | Base | 31.66 | 8.51 | 15.88 | 4.16 | 19.38 | 15.92 |
|  | SFT | 43.76 | 13.04 | 12.63 | 1.87 | 18.75 | 18.01 |
|  | **DFT** | **64.89** | **20.94** | **27.08** | **6.87** | **38.13** | **31.58** |
| Qwen2.5-Math-7B | Base | 40.12 | 14.39 | 17.12 | 6.68 | 27.96 | 21.25 |
|  | SFT | 53.96 | 16.66 | 18.93 | 2.48 | 26.09 | 23.62 |
|  | **DFT** | **68.20** | **30.16** | **33.83** | **8.56** | **45.00** | **37.15** |

*Note: Bold values indicate the best performance for each model across methods.*

---

## 2. Generalization and Robustness Analysis

### 2.1 Performance on Challenging Benchmarks

DFT demonstrates superior generalization and robustness, particularly on challenging benchmarks where standard SFT yields minimal or even negative impact:

- **Olympiad Bench (Qwen2.5-Math-1.5B)**:
  - SFT degrades performance from 15.88 to 12.63 (-3.25 points)
  - DFT boosts performance to 27.08 (+11.20 points over base)

- **AIME24 (Qwen2.5-Math-7B)**:
  - SFT reduces accuracy from 6.68 to 2.48 (-4.20 points)
  - DFT improves to 8.56 (+1.88 points over base)

- **AMC23 (Qwen2.5-Math-1.5B)**:
  - SFT reduces performance from 19.38 to 18.75 (-0.63 points)
  - DFT raises it to 38.13 (+18.75 points over base)

- **Qwen2.5-Math-7B on AMC23**:
  - SFT yields only marginal improvement (+1.86 points)
  - DFT achieves a substantial +17.04 point gain

These results underscore DFT's resilience on difficult reasoning tasks where traditional SFT struggles, highlighting its potential as a more robust fine-tuning paradigm for mathematical reasoning.

---

## 3. Learning Efficiency and Convergence

### 3.1 Faster Convergence Characteristics

DFT exhibits significantly better learning efficiency and faster convergence compared to standard SFT:



**Figure 1: Accuracy progression for Qwen2.5-MATH-1.5B across mathematical benchmarks**

DFT demonstrates three distinct advantages in learning dynamics:

1. **Faster convergence**: Achieves peak performance within the first 120 training steps on most benchmarks
2. **Better early-stage performance**: Outperforms the best final accuracy of SFT within the first 10-20 steps
3. **Higher sample efficiency**: Consistently requires fewer updates to reach optimal results

This accelerated convergence indicates that DFT's dynamic reweighting mechanism leads to more informative gradient updates, guiding models toward high-quality solutions early in training. It also suggests DFT helps avoid optimization plateaus or noise-prone regions often encountered in standard SFT.

---

## 4. Comparison with Importance-Weighted SFT (iw-SFT)

### 4.1 Performance Comparison

DFT outperforms the concurrent Importance-Weighted SFT (iw-SFT) in most settings across model families and benchmarks:

**Table 2: Comparison with concurrent work iw-SFT on math benchmarks**

| Model | Method | Math500 | Minerva Math | Olympiad Bench | AIME24 | AMC23 | Avg. |
|-------|--------|---------|--------------|----------------|--------|-------|------|
| LLaMA-3.2-3B | iw-SFT | 5.13 | 2.63 | 1.51 | 0.00 | 2.03 | 2.26 |
|  | **DFT** | **12.79** | **2.84** | **2.90** | **0.83** | **3.91** | **4.65** |
| LLaMA-3.1-8B | iw-SFT | 18.21 | 4.31 | 4.31 | 0.20 | 7.34 | 6.87 |
|  | **DFT** | **27.44** | **8.26** | **6.94** | **0.41** | **12.03** | **11.02** |
| DeepSeekMath-7B | iw-SFT | 35.32 | 8.75 | 11.11 | 0.61 | 18.28 | 14.81 |
|  | **DFT** | **41.46** | **16.79** | **15.00** | **1.24** | **16.25** | **18.15** |
| Qwen2.5-Math-1.5B | iw-SFT | 59.38 | 17.08 | 26.82 | 8.13 | 40.00 | 30.28 |
|  | **DFT** | **64.89** | **20.94** | **27.08** | **6.87** | **38.13** | **31.58** |
| Qwen2.5-Math-7B | iw-SFT | 70.28 | 25.70 | 34.46 | 16.46 | 51.09 | 39.60 |
|  | DFT | 68.20 | 30.16 | 33.83 | 8.56 | 45.00 | 37.15 |

DFT achieves higher average accuracy than iw-SFT on most model families:
- LLaMA-3.2-3B: +2.39 points
- LLaMA-3.1-8B: +4.15 points 
- DeepSeekMath-7B: +3.34 points
- Qwen2.5-Math-1.5B: +1.30 points

While iw-SFT slightly outperforms DFT on Qwen2.5-Math-7B (+2.45 points), this improvement is inconsistent across datasets.

### 4.2 Robustness Comparison

iw-SFT exhibits limited robustness on the LLaMA model family:
- For LLaMA-3.2-3B, iw-SFT underperforms standard SFT on Math500 (5.13 vs. 8.65) and AMC23 (2.03 vs. 3.13)
- For LLaMA-3.1-8B, iw-SFT results in worse performance than SFT on Minerva Math (4.31 vs. 5.78) and AMC23 (7.34 vs. 8.28)

These cases demonstrate that iw-SFT might struggle to generalize beyond specific training signals and may degrade performance under distribution shifts. In contrast, DFT consistently improves upon both the base model and SFT across nearly all datasets.

### 4.3 Computational Efficiency

DFT offers a computational advantage over iw-SFT:
- iw-SFT requires a separate reference model to compute importance weights
- DFT dynamically derives its own weighting directly from the model's token probabilities
- This results in a more efficient training procedure with reduced computational overhead

---

## 5. Offline Reinforcement Learning Application

### 5.1 Performance in Offline RL Setting

DFT demonstrates strong performance in offline reinforcement learning settings, where it addresses the sparsity of reward issue:

**Table 3: Evaluation results on five mathematical reasoning benchmarks in an offline reinforcement learning setting**

| Model & Method | Setting | Math500 | Minerva Math | Olympiad Bench | AIME24 | AMC23 | Avg. |
|----------------|---------|---------|--------------|----------------|--------|-------|------|
| Qwen2.5-Math-1.5B | Base | 31.66 | 8.51 | 15.88 | 4.16 | 19.38 | 15.92 |
| Qwen2.5-Math-1.5B w/SFT | SFT | 43.14 | 11.64 | 13.41 | 1.03 | 14.84 | 16.81 |
| Qwen2.5-Math-1.5B w/iw-SFT | SFT | 59.38 | 17.08 | 26.82 | 8.13 | 40.00 | 30.28 |
| Qwen2.5-Math-1.5B w/DFT | SFT | 62.50 | 22.94 | 26.87 | 7.31 | 33.75 | 30.67 |
| Qwen2.5-Math-1.5B w/DPO | Offline | 46.89 | 11.53 | 22.86 | 4.58 | 30.16 | 23.20 |
| Qwen2.5-Math-1.5B w/RFT | Offline | 48.23 | 14.19 | 22.29 | 4.37 | 30.78 | 23.97 |
| Qwen2.5-Math-1.5B w/PPO | Online | 56.10 | 15.41 | 26.33 | 7.50 | 37.97 | 28.66 |
| Qwen2.5-Math-1.5B w/GRPO | Online | 62.86 | 18.93 | 28.62 | 8.34 | 41.25 | 32.00 |
| Qwen2.5-Math-1.5B w/iw-SFT | Offline | 60.80 | 18.13 | 27.83 | 8.33 | 44.21 | 31.86 |
| **Qwen2.5-Math-1.5B w/DFT** | **Offline** | **64.71** | **25.16** | **30.93** | **7.93** | **48.44** | **35.43** |

DFT achieves the best overall performance (35.43 average), surpassing both offline (RFT, DPO) and online (PPO, GRPO) baselines. This demonstrates DFT's efficiency and strength as a simple yet effective fine-tuning strategy in offline RL settings.

### 5.2 Token Probability Analysis

![8bf10d17.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/dft_dynamic_fine_tuning/resources/8bf10d17.png)<br>

**Figure 2: Token probability distributions on the training set before and after fine-tuning**

The token probability distributions reveal how DFT affects model behavior compared to other methods. The logarithmic scale visualization shows that DFT produces a more favorable distribution for mathematical reasoning tasks compared to SFT and other RL methods (DPO, PPO, GRPO).

---

## 6. Hyperparameter Sensitivity Analysis

### 6.1 Learning Rate Impact

![9e0f911a.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/dft_dynamic_fine_tuning/resources/9e0f911a.png)<br>

**Figure 3 (left): Impact of learning rate on DFT and SFT performance**

An ablation study evaluated both DFT and SFT across four learning rates (2e-4, 1e-4, 5e-5, and 1e-5):

- Both methods exhibit sensitivity to learning rate
- **DFT consistently outperforms SFT under all configurations**, confirming the performance gap is not due to suboptimal hyperparameter choices in SFT
- Intermediate learning rates (1e-4 and 5e-5) yield best results for both methods
- Both lower (1e-5) and higher (2e-4) values lead to noticeable performance degradation

### 6.2 Batch Size Impact

![9b81e5be.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/dft_dynamic_fine_tuning/resources/9b81e5be.png)<br>

**Figure 3 (right): Impact of batch size on DFT and SFT performance**

The study also assessed the impact of batch size (32 to 256):

- Both DFT and SFT exhibit relatively stable performance across the full range of batch sizes
- Minor fluctuations are observed, but no consistent trend indicates that larger or smaller batches significantly affect final accuracy
- Batch size is not a dominant factor for either method in this setup
- Default values may suffice in practice without extensive tuning

---

## 7. Conclusion

### 7.1 Key Findings

1. **Superior Performance**: DFT consistently outperforms standard SFT across all evaluated LLMs, with performance gains ranging from 1.4× to 5.9× depending on the model.

2. **Enhanced Robustness**: DFT demonstrates exceptional resilience on challenging benchmarks where SFT often degrades performance, making it particularly valuable for difficult mathematical reasoning tasks.

3. **Faster Convergence**: DFT achieves peak performance within the first 120 training steps and outperforms SFT's best results within the first 10-20 steps, indicating significantly better learning efficiency.

4. **Stronger than Alternatives**: DFT outperforms iw-SFT in most settings while avoiding iw-SFT's robustness issues on certain benchmarks.

5. **Offline RL Effectiveness**: DFT achieves the best overall performance in offline reinforcement learning settings, surpassing both offline and online baselines.

6. **Hyperparameter Robustness**: DFT maintains its performance advantage across different learning rates and batch sizes, confirming its reliability in practical applications.

### 7.2 Implications

DFT represents a significant advancement in fine-tuning techniques for mathematical reasoning in LLMs. Its dynamic reweighting mechanism appears to effectively address key limitations of standard SFT, particularly in handling challenging mathematical problems and optimizing training efficiency. The method's success in offline RL settings further demonstrates its versatility and potential applicability to other domains where preference supervision is available but reward modeling is challenging.

For practitioners, DFT offers a computationally efficient alternative to more complex RL-based approaches, delivering superior performance with simpler implementation requirements. The consistent gains across model sizes suggest DFT could be particularly valuable for smaller models where performance improvements are most impactful.`
    },
    {
      id: "blog-daily-dft-zh",
      title: "DFT方法在大型语言模型数学推理能力提升中的应用与分析",
      file: "Blogs/DailyPaper/dft_dynamic_fine_tuning_zh/report.md",
      difficulty: "中级",
      duration: "0.5h",
      week: 0,
      phase: 0,
      keywords: ["DFT", "动态微调", "数学推理", "大模型", "微调技术"],
      content: `<span style="color: darkgreen; font-weight: bold; font-family: monospace;">Powered by [MS-Agent](https://github.com/modelscope/ms-agent) | [DocResearch](https://github.com/modelscope/ms-agent/blob/main/projects/doc_research/README.md)</span>
<br>


# DFT方法在大型语言模型数学推理能力提升中的应用与分析

## 1. 研究背景与方法概述

本文深入探讨了 **动态微调（Dynamic Fine-Tuning, DFT）** 方法在提升大型语言模型（LLM）数学推理能力方面的有效性。DFT是一种创新的微调范式，通过动态重加权机制优化训练过程，与传统的监督微调（Supervised Fine-Tuning, SFT）相比展现出显著优势。

研究在多个维度评估了DFT的性能：
- 在5个数学推理基准测试上的表现（Math500、Minerva Math、Olympiad Bench、AIME 2024、AMC 2023）
- 与标准SFT及其他先进方法的对比
- 学习效率与收敛特性
- 超参数敏感性分析

## 2. DFT与SFT的性能比较

### 2.1 整体性能提升

DFT在所有评估的LLM上均显著优于基础模型和标准SFT。如表1所示，DFT带来的平均性能提升远超SFT：

![d4cc2b90.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/dft_dynamic_fine_tuning_zh/resources/d4cc2b90.png)<br>

**表1：五个最先进的大型语言模型在五个数学推理基准上的平均@16准确率**

| 模型 | 方法 | Math500 | Minerva Math | Olympiad Bench | AIME24 | AMC23 | Avg. |
|------|------|---------|-------------|---------------|--------|-------|------|
| LLaMA-3.2-3B | Base | 1.63 | 1.36 | 1.01 | 0.41 | 1.56 | 1.19 |
|  | SFT | 8.65 | 2.38 | 2.06 | 0.00 | 3.13 | 3.24 |
|  | **DFT** | **12.79** | **2.84** | **2.90** | **0.83** | **3.91** | **4.65** |
| LLaMA-3.1-8B | Base | 1.86 | 0.98 | 0.94 | 0.21 | 1.01 | 1.00 |
|  | SFT | 16.85 | 5.78 | 3.88 | 0.00 | 5.16 | 6.33 |
|  | **DFT** | **27.44** | **8.26** | **6.94** | **0.41** | **12.03** | **11.02** |
| DeepSeekMath-7B | Base | 6.15 | 2.15 | 1.74 | 0.21 | 2.97 | 2.64 |
|  | SFT | 26.83 | 7.26 | 6.33 | 0.41 | 8.28 | 9.82 |
|  | **DFT** | **41.46** | **16.79** | **15.00** | **1.24** | **16.25** | **18.15** |
| Qwen2.5-Math-1.5B | Base | 31.66 | 8.51 | 15.88 | 4.16 | 19.38 | 15.92 |
|  | SFT | 43.76 | 13.04 | 12.63 | 1.87 | 18.75 | 18.01 |
|  | **DFT** | **64.89** | **20.94** | **27.08** | **6.87** | **38.13** | **31.58** |
| Qwen2.5-Math-7B | Base | 40.12 | 14.39 | 17.12 | 6.68 | 27.96 | 21.25 |
|  | SFT | 53.96 | 16.66 | 18.93 | 2.48 | 26.09 | 23.62 |
|  | **DFT** | **68.20** | **30.16** | **33.83** | **8.56** | **45.00** | **37.15** |

具体数据表明：
- 对于Qwen2.5-Math-1.5B，DFT比基础模型平均提升+15.66分，是SFT提升(+2.09)的5.9倍
- LLaMA-3.2-3B通过DFT获得+3.46分提升，超过SFT(+2.05)约1.4倍
- LLaMA-3.1-8B通过DFT获得+10.02分提升，超过SFT(+5.33)约1.88倍
- DeepSeekMath-7B通过DFT获得+15.51分提升，是SFT(+7.18)的1.58倍
- Qwen2.5-Math-7B通过DFT获得+15.90分提升，几乎是SFT(+2.37)的3.8倍

### 2.2 在挑战性基准上的表现

DFT在具有挑战性的基准测试上展现出卓越的泛化能力和鲁棒性，而标准SFT在这些任务上往往表现不佳甚至产生负面影响：

- **Olympiad Bench**：SFT导致Qwen2.5-Math-1.5B性能下降（从15.88降至12.63），而DFT将其提升至27.08，比基础模型高出+11.20分
- **AIME24**：SFT使Qwen2.5-Math-7B准确率下降4.20分（从6.68降至2.48），而DFT将其提升至8.56，比基础模型高出+1.88分
- **AMC23**：SFT使Qwen2.5-Math-1.5B性能从19.38降至18.75，而DFT将其提升至38.13，比基础模型高出+18.75分

这些结果表明，DFT不仅在各种模型容量上更有效地扩展，而且在传统SFT难以应对的困难推理任务上展现出更强的韧性。

## 3. DFT的学习效率与收敛特性

DFT展现出更优的学习效率和更快的收敛特性。图1展示了Qwen2.5-Math-1.5B在各数学推理基准上DFT与标准SFT的学习动态差异：



**图1：Qwen2.5-MATH-1.5B在数学基准上的准确率进展，展示DFT相对于SFT的更快收敛和更好性能**

DFT相比SFT展现出三大优势：
1. **更快的收敛速度**：在大多数基准测试中，DFT在前120个训练步骤内即可达到峰值性能
2. **更好的早期阶段表现**：DFT在前10-20个步骤的表现已超过SFT的最佳最终准确率
3. **更高的样本效率**：DFT始终需要更少的更新即可达到相对最优结果

这种加速收敛表明，DFT中的动态重加权机制产生了更具信息量的梯度更新，引导模型在训练早期就找到高质量解决方案。这也表明DFT有助于避免标准SFT中常见的优化平台期或噪声敏感区域，从而更高效地获取复杂的数学推理模式。

## 4. DFT与iw-SFT的比较

DFT在大多数设置中优于同期的Importance-Weighted SFT (iw-SFT)方法：

**表2：与同期工作iw-SFT在数学基准上的比较**

| 模型 | 方法 | Math500 | Minerva Math | Olympiad Bench | AIME24 | AMC23 | Avg. |
|------|------|---------|-------------|---------------|--------|-------|------|
| LLaMA-3.2-3B | iw-SFT | 5.13 | 2.63 | 1.51 | 0.00 | 2.03 | 2.26 |
|  | **DFT** | **12.79** | **2.84** | **2.90** | **0.83** | **3.91** | **4.65** |
| LLaMA-3.1-8B | iw-SFT | 18.21 | 4.31 | 4.31 | 0.20 | 7.34 | 6.87 |
|  | **DFT** | **27.44** | **8.26** | **6.94** | **0.41** | **12.03** | **11.02** |
| DeepSeekMath-7B | iw-SFT | 35.32 | 8.75 | 11.11 | 0.61 | 18.28 | 14.81 |
|  | **DFT** | **41.46** | **16.79** | **15.00** | **1.24** | **16.25** | **18.15** |
| Qwen2.5-Math-1.5B | iw-SFT | 59.38 | 17.08 | 26.82 | 8.13 | 40.00 | 30.28 |
|  | **DFT** | **64.89** | **20.94** | **27.08** | **6.87** | **38.13** | **31.58** |
| Qwen2.5-Math-7B | iw-SFT | 70.28 | 25.70 | 34.46 | 16.46 | 51.09 | 39.60 |
|  | **DFT** | **68.20** | **30.16** | **33.83** | **8.56** | **45.00** | **37.15** |

具体表现：
- DFT在大多数模型家族上实现了更高的平均准确率：LLaMA-3.2-3B (+2.39)、LLaMA-3.1-8B (+4.15)、DeepSeekMath-7B (+3.34)和Qwen2.5-Math-1.5B (+1.30)
- 虽然iw-SFT在Qwen2.5-Math-7B上略优于DFT (+2.45)，但这种改进在数据集间并不一致
- iw-SFT在LLaMA模型家族上表现出有限的鲁棒性：
  - LLaMA-3.2-3B：iw-SFT在Math500 (5.13 vs. 8.65)和AMC23 (2.03 vs. 3.13)上表现不如标准SFT
  - LLaMA-3.1-8B：iw-SFT在Minerva Math (4.31 vs. 5.78)和AMC23 (7.34 vs. 8.28)上表现更差

这些案例表明，iw-SFT可能难以泛化到特定训练信号之外，在分布偏移或更难的基准测试上甚至可能导致性能下降。相比之下，DFT在几乎所有数据集上都一致地改进了基础模型和SFT，包括iw-SFT失败的那些数据集。

此外，iw-SFT需要额外的参考模型来计算重要性权重，增加了计算开销，而DFT直接从模型的token概率动态导出其权重，实现了更高效的训练过程。

## 5. DFT在离线强化学习设置中的应用

研究还探索了DFT在离线强化学习(RL)设置中的应用，其中奖励稀疏性问题可能比SFT设置得到缓解：

**表3：在使用拒绝采样的离线强化学习设置中，在五个数学推理基准上的评估结果**

| 模型 | 设置 | Math500 | Minerva Math | Olympiad Bench | AIME24 | AMC23 | Avg. |
|------|------|---------|-------------|---------------|--------|-------|------|
| Qwen2.5-Math-1.5B | - | 31.66 | 8.51 | 15.88 | 4.16 | 19.38 | 15.92 |
| Qwen2.5-Math-1.5B w/SFT | SFT | 43.14 | 11.64 | 13.41 | 1.03 | 14.84 | 16.81 |
| Qwen2.5-Math-1.5B w/iw-SFT | SFT | 59.38 | 17.08 | 26.82 | 8.13 | 40.00 | 30.28 |
| Qwen2.5-Math-1.5B w/DFT | SFT | 62.50 | 22.94 | 26.87 | 7.31 | 33.75 | 30.67 |
| Qwen2.5-Math-1.5B w/DPO | Offline | 46.89 | 11.53 | 22.86 | 4.58 | 30.16 | 23.20 |
| Qwen2.5-Math-1.5B w/RFT | Offline | 48.23 | 14.19 | 22.29 | 4.37 | 30.78 | 23.97 |
| Qwen2.5-Math-1.5B w/PPO | Online | 56.10 | 15.41 | 26.33 | 7.50 | 37.97 | 28.66 |
| Qwen2.5-Math-1.5B w/GRPO | Online | 62.86 | 18.93 | 28.62 | 8.34 | 41.25 | 32.00 |
| Qwen2.5-Math-1.5B w/iw-SFT | Offline | 60.80 | 18.13 | 27.83 | 8.33 | 44.21 | 31.86 |
| Qwen2.5-Math-1.5B w/DFT | Offline | **64.71** | **25.16** | **30.93** | **7.93** | **48.44** | **35.43** |

实验方法：
- 采用常用的拒绝采样微调(RFT)框架
- 从基础模型本身为10,000个数学问题采样响应，温度为1.0，每个问题生成4个响应
- 使用math verify识别正确响应并保留为训练数据，约140,000个示例
- 对于DPO训练，从生成的响应中构建100,000个正负偏好对

结果表明：
- DFT在离线RL设置中实现了最佳整体性能，平均得分为35.43
- DFT超越了所有离线(RFT、DPO)和在线(PPO、GRPO)基线方法
- 在AMC23基准上，DFT达到了48.44的高分，远超其他方法

![8bf10d17.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/dft_dynamic_fine_tuning_zh/resources/8bf10d17.png)<br>

**图2：训练集上的token概率分布在DFT、SFT和各种RL方法（包括DPO、PPO和GRPO）微调前后的对比，y轴使用对数刻度以提高可视化清晰度**

图2展示了不同方法对token概率分布的影响，进一步说明了DFT如何有效调整模型的输出分布以提高数学推理能力。

## 6. 超参数敏感性分析

为评估DFT对关键训练超参数的鲁棒性，研究进行了针对学习率和批量大小的消融实验：

![9e0f911a.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/dft_dynamic_fine_tuning_zh/resources/9e0f911a.png)<br>
![9b81e5be.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/dft_dynamic_fine_tuning_zh/resources/9b81e5be.png)<br>

**图3：对DFT和SFT在Qwen2.5-Math-1.5B模型上的训练超参数（学习率和批量大小）的消融研究**

研究旨在回答两个核心问题：
1. DFT与SFT之间的性能差距是否源于SFT的次优超参数配置？
2. 两种方法对学习率和批量大小的变化有多敏感？

### 6.1 学习率敏感性

评估了四种学习率：2e-4、1e-4、5e-5和1e-5。结果显示：
- 两种方法对学习率都表现出一定程度的敏感性
- DFT在所有配置下始终优于SFT，表明性能差距不能仅归因于SFT的次优超参数选择
- 对于两种方法，中等学习率(1e-4和5e-5)产生最佳结果
- 学习率过低(1e-5)或过高(2e-4)都会导致明显性能下降
- 这一发现强调了在基于梯度的微调中适当调整学习率的重要性

### 6.2 批量大小敏感性

评估了从32到256的批量大小。结果显示：
- DFT和SFT在批量大小的全范围内都表现出相对稳定的性能
- 虽然观察到轻微波动，但没有一致的趋势表明较大或较小的批量会显著影响最终准确率
- 这表明批量大小在此设置中不是主导因素，实践中默认值可能就足够

## 7. 结论与启示

本研究全面评估了DFT方法在提升LLM数学推理能力方面的有效性，得出以下关键结论：

1. **显著性能提升**：DFT在所有评估的LLM上均显著优于基础模型和标准SFT，平均提升幅度是SFT的1.4-5.9倍

2. **卓越的鲁棒性**：DFT在具有挑战性的基准测试（如Olympiad Bench、AIME24和AMC23）上表现出色，而SFT在这些任务上往往表现不佳甚至产生负面影响

3. **高效的学习特性**：DFT展现出更快的收敛速度、更好的早期阶段表现和更高的样本效率，通常在前120个训练步骤内即可达到峰值性能

4. **优于竞争方法**：DFT在大多数设置中优于同期的iw-SFT方法，且在LLaMA模型家族上展现出更好的泛化能力

5. **离线RL中的优势**：DFT在离线强化学习设置中也表现出色，超越了各种离线和在线基线方法

6. **超参数鲁棒性**：DFT对学习率和批量大小的变化表现出良好的鲁棒性，性能优势不依赖于特定的超参数配置

这些发现表明，DFT是一种简单而有效的微调策略，特别适用于需要复杂推理能力的任务。与传统RL流水线相比，DFT在偏好监督可用但奖励建模或在线响应采样成本高昂或不切实际的领域中具有明显优势。

未来研究方向可能包括将DFT应用于其他推理密集型任务（如代码生成、科学推理等），以及进一步优化其动态重加权机制以适应更广泛的应用场景。
`
    },
    {
      id: "blog-daily-transformers-report",
      title: "Analysis and Summary Report: The Transformer Model",
      file: "Blogs/DailyPaper/transformers_report/report.md",
      difficulty: "中级",
      duration: "0.5h",
      week: 0,
      phase: 0,
      keywords: ["Transformer", "Self-Attention", "Analysis Report", "Architecture", "NLP"],
      content: `<span style="color: darkgreen; font-weight: bold; font-family: monospace;">Powered by [MS-Agent](https://github.com/modelscope/ms-agent) | [DocResearch](https://github.com/modelscope/ms-agent/blob/main/projects/doc_research/README.md)</span>
<br>

# **Analysis and Summary Report: The Transformer Model**

This report provides a structured, MECE-compliant (Mutually Exclusive and Collectively Exhaustive) summary of the key components, architecture, performance, and experimental findings related to the **Transformer** model as described in the provided document. The analysis preserves critical figures, tables, formulas, and contextual relationships in a concise, visually supported markdown format.

---

## **1. Overview of Neural Sequence Transduction Models**

Most neural sequence-to-sequence models follow an **encoder-decoder structure**:

- **Encoder**: Maps input sequence $(x_1, ..., x_n)$ into continuous representations $z = (z_1, ..., z_n)$.
- **Decoder**: Autoregressively generates output sequence $(y_1, ..., y_m)$, using previously generated symbols and encoder outputs at each step.

The **Transformer** adopts this encoder-decoder framework but replaces recurrent and convolutional layers with **self-attention mechanisms**, enabling parallelization and improved long-range dependency modeling.

![f1289feb.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/transformers_report/resources/f1289feb.png)<br>

---

## **2. Transformer Architecture**

### **2.1 High-Level Structure**

The Transformer consists of:
- **Stacked self-attention and feed-forward layers** in both encoder and decoder.
- **No recurrence or convolutions** — relies entirely on attention mechanisms.



### **2.2 Encoder**

- Composed of **N = 6 identical layers**.
- Each layer has two sub-layers:
  1. **Multi-Head Self-Attention**
  2. **Position-wise Fully Connected Feed-Forward Network**
- Residual connections and layer normalization are applied around each sub-layer.

### **2.3 Decoder**

- Also composed of **N = 6 identical layers**.
- Adds a third sub-layer:
  1. **Masked Multi-Head Self-Attention** (prevents attending to future tokens)
  2. **Multi-Head Attention over Encoder Output**
  3. **Feed-Forward Network**
- Uses masking to ensure auto-regressive generation.

---

## **3. Attention Mechanisms**

### **3.1 Scaled Dot-Product Attention**

Given query ($Q$), key ($K$), and value ($V$) matrices:

$$
\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V
$$

- Scaling by $\\sqrt{d_k}$ prevents small gradients in softmax.
- Designed for parallel computation across all positions.



### **3.2 Multi-Head Attention**

$$
\\text{MultiHead}(Q, K, V) = \\text{Concat}(\\text{head}_1, ..., \\text{head}_h)W^O
$$
where
$$
\\text{head}_i = \\text{Attention}(QW^Q_i, KW^K_i, VW^V_i)
$$

- Projects queries, keys, values $h$ times with different learned linear projections.
- Enables the model to attend to information from different representation subspaces.



---

## **4. Model Advantages and Complexity Analysis**

### **4.1 Computational Efficiency and Path Length**

| Layer Type | Complexity per Layer | Sequential Ops | Max Path Length |
|-----------|------------------------|----------------|------------------|
| **Self-Attention** | $O(n^2 \\cdot d)$ | $O(1)$ | $O(1)$ |
| **Recurrent** | $O(n \\cdot d^2)$ | $O(n)$ | $O(n)$ |
| **Convolutional** | $O(k \\cdot n \\cdot d^2)$ | $O(1)$ | $O(\\log_k n)$ |
| **Restricted Self-Att.** | $O(r \\cdot n \\cdot d)$ | $O(1)$ | $O(n/r)$ |

> **Key Insight**: Self-attention has **constant maximum path length**, enabling faster training due to better gradient flow and parallelization.

![a10d7698.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/transformers_report/resources/a10d7698.png)<br>

---

## **5. Training Details and Regularization**

### **5.1 Embedding and Output Layers**

- Input/output tokens mapped via **learned embeddings** of dimension $d_{\\text{model}}$.
- Shared weight matrix between:
  - Input embedding
  - Output embedding
  - Pre-softmax linear transformation
- Embedding weights scaled by $\\sqrt{d_{\\text{model}}}$.

### **5.2 Regularization Techniques**

Three types used during training:
1. **Residual Dropout**: Applied to output of each sub-layer before addition and normalization.
2. **Label Smoothing**: With $\\epsilon_{\\text{ls}} = 0.1$, improves BLEU by encouraging uncertainty.
3. **Attention Dropout**: Used in multi-head attention layers.

---

## **6. Performance Evaluation**

### **6.1 Machine Translation Results (Table 2)**

| Model | BLEU (En-De) | BLEU (En-Fr) | Training Cost (FLOPs) |
|------|---------------|---------------|-------------------------|
| ByteNet | 23.75 | — | — |
| GNMT + RL | 24.60 | 39.92 | $2.3 \\times 10^{19}$ |
| ConvS2S | 25.16 | 40.46 | $9.6 \\times 10^{18}$ |
| MoE | 26.03 | 40.56 | $2.0 \\times 10^{19}$ |
| **Transformer (Base)** | **27.3** | **38.1** | **$3.3 \\times 10^{18}$** |
| **Transformer (Big)** | **28.4** | **41.8** | **$2.3 \\times 10^{19}$** |

> ✅ **Key Result**: Transformer achieves **higher BLEU scores at lower computational cost** than prior models.

![56375b63.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/transformers_report/resources/56375b63.png)<br>

---

## **7. Ablation Studies (Table 3)**

Impact of architectural variations on English-German translation (newstest2013):

| Variation | BLEU (dev) | PPL (dev) | Notes |
|--------|------------|-----------|-------|
| **Base Model** | 25.8 | 4.92 | $N=6$, $d_{\\text{model}}=512$, $h=8$ |
| $h=1$ | 24.9 | 5.29 | Single-head attention degrades performance |
| $h=16$ | 25.8 | 4.91 | Optimal head count balances expressiveness and efficiency |
| $h=32$ | 25.4 | 5.01 | Too many heads reduce gains |
| $d_{\\text{model}}=256$ | 24.5 | 5.75 | Smaller model underfits |
| $d_{\\text{model}}=1024$ | 26.0 | 4.66 | Larger model improves accuracy |
| $d_{ff}=4096$ | 26.2 | 4.75 | Increased feed-forward capacity helps |
| No Dropout ($P_{\\text{drop}}=0.0$) | 24.6 | 5.77 | Overfitting observed |
| Dropout $P_{\\text{drop}}=0.2$ | 25.5 | 4.95 | Better generalization |
| No Label Smoothing | 25.3 | 4.67 | Slight drop in BLEU |
| Positional Embedding (vs sinusoids) | 25.7 | 4.92 | Comparable performance |

> 🔍 **Insights**:
> - Multi-head attention is crucial; too few or too many heads hurt performance.
> - Larger models ($d_{\\text{model}}, d_{ff}$) improve results.
> - Dropout and label smoothing are essential for regularization.

![7db087c2.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/transformers_report/resources/7db087c2.png)<br>

---

## **8. Attention Visualization and Interpretability**

### **8.1 Long-Distance Dependency (Figure 3)**

- In encoder self-attention (Layer 5), multiple heads attend from "making" to distant words completing the phrase *"making...more difficult"*.
- Demonstrates the model’s ability to capture **long-range syntactic dependencies**.

![d82d99fa.png](file:///Users/asura/IdeaProjects/github/modelscope-classroom/Blogs/DailyPaper/transformers_report/resources/d82d99fa.png)<br>

### **8.2 Anaphora Resolution (Figure 4)**

- Attention heads focus sharply on pronoun "its", linking it to its antecedent.
- Shows **semantic role understanding** and coreference resolution capability.

### **8.3 Structural Awareness (Figure 5)**

- Different attention heads learn distinct structural patterns (e.g., syntax, local vs global context).
- Indicates **emergent specialization** within the attention mechanism.

---

## **9. Generalization to Other Tasks: Constituency Parsing**

### **9.1 Experimental Setup**

- Task: English constituency parsing on **Penn Treebank (WSJ)**.
- Model: 4-layer Transformer, $d_{\\text{model}} = 1024$.
- Settings:
  - Supervised: 40K sentences
  - Semi-supervised: ~17M sentences

### **9.2 Results (Table 4)**

| Model | Training Regime | F1 Score (WSJ 23) |
|------|------------------|--------------------|
| BerkeleyParser | WSJ only | 90.4 |
| Dyer et al. (RNN Grammar) | WSJ only | 91.7 |
| **Transformer (4-layer)** | WSJ only | **91.3** |
| McClosky et al. | Semi-supervised | 92.1 |
| Vinyals et al. | Semi-supervised | 92.1 |
| **Transformer (4-layer)** | Semi-supervised | **92.7** |
| Dyer et al. (RNN Grammar) | Generative | 93.3 |

> ✅ **Conclusion**: Transformer performs **on par with or better than most prior models**, even without task-specific architecture changes. Outperforms RNN-based models in low-data settings.

---

## **10. Conclusion and Key Takeaways**

| Category | Key Finding |
|--------|-------------|
| **Architecture** | Replaces recurrence with self-attention; fully parallelizable. |
| **Efficiency** | Lower training cost and faster convergence than RNN/CNN models. |
| **Performance** | Achieves state-of-the-art BLEU scores in machine translation. |
| **Generalization** | Effective on structured tasks like parsing without architectural changes. |
| **Interpretability** | Attention heads learn interpretable functions (syntax, coreference, structure). |
| **Design Insights** | Multi-head attention, residual connections, and regularization are critical. |

---

## **References**

[5] Cho et al., 2014 — RNN Encoder-Decoder  
[8] Dyer et al., 2016 — RNN Grammar  
[9] Gehring et al., 2017 — ConvS2S  
[30] Press & Wolf, 2016 — Tied Embeddings  
[32] Shazeer et al., 2017 — Mixture-of-Experts  
[35] Sutskever et al., 2014 — Sequence-to-Sequence Learning  
[37] Vinyals et al., 2015 — Grammar as Foreign Language  
[38] Wu et al., 2016 — GNMT  
[39] Zhou et al., 2016 — Deep Attention + PosUnk  
[40] Zhu et al., 2013 — Fast Constituent Parsing  

--- 

> **Report End**  
> Generated in compliance with MECE principles, preserving key visuals, formulas, and data integrity.`
    }
  ]
});
