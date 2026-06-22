window.LEARNING_DATA = window.LEARNING_DATA || [];
window.LEARNING_DATA.push({
  module: '大模型教程',
  chapters: [
    {
      id: "adv-06-01-intro",
      title: "6.1 第六章 模型推理优化",
      file: "大模型教程/06-模型推理优化/00-引言.md",
      difficulty: "中级-高级",
      duration: "0.5h",
      week: 0,
      phase: 0,
      keywords: ["第六章", "模型推理优化", "LLM", "Compute", "Memory", "GPU"],
      content: `# 第六章 模型推理优化

大语言模型的训练成本高昂，但推理成本才是长期运营的主要开销。一个 70B 参数的模型，在单卡上每秒只能生成几十个 token；要服务成千上万的并发用户，推理优化至关重要。本章从 LLM 推理的基本流程出发，介绍关键的优化技术。

## 推理的计算特点

LLM 推理与训练有本质不同：

**训练**：
- 整个序列一次性输入
- 可以大批量并行
- 计算密集型（Compute-bound）

**推理**：
- 逐 token 生成，存在依赖
- 批量大小受限于内存
- 内存密集型（Memory-bound）

推理的瓶颈在于**内存带宽**：每生成一个 token，都需要从显存加载全部模型参数。GPU 的算力很高，但显存带宽有限，大部分时间在等待数据传输。

## 推理的两个阶段

LLM 推理分为两个截然不同的阶段：

**Prefill（预填充）**：
- 处理用户输入的 prompt
- 所有 token 可以并行计算
- 计算密集型，类似训练

**Decode（解码）**：
- 逐个生成输出 token
- 每个 token 依赖前一个
- 内存密集型，难以并行

理解这两个阶段的差异，是设计优化策略的基础。

## 关键优化技术

本章将介绍以下优化技术：

| 技术 | 优化目标 | 核心思想 |
|------|----------|----------|
| KV Cache | 减少重复计算 | 缓存历史 K、V |
| 解码策略 | 生成质量/速度 | 贪婪、Beam、采样 |
| Paged Attention | 显存利用率 | 分页管理 KV Cache |
| Continuous Batching | 吞吐量 | 动态组批 |

这些技术往往需要组合使用，形成完整的推理系统（如 vLLM、TensorRT-LLM）。

## 性能指标

评估推理系统的关键指标：

**延迟**（Latency）：
- **首 token 延迟**（Time to First Token, TTFT）：用户等待第一个输出的时间
- **生成延迟**（Time per Output Token, TPOT）：每个 token 的生成时间
- **端到端延迟**：完成整个请求的时间

**吞吐量**（Throughput）：
- **Token 吞吐**：每秒生成的 token 数
- **请求吞吐**：每秒完成的请求数

**资源效率**：
- **显存利用率**：实际使用 / 可用显存
- **GPU 利用率**：计算单元的繁忙程度
- **成本效率**：每 1000 token 的费用

不同场景对这些指标的权重不同：交互式应用重视延迟，批量处理重视吞吐量。
`
    },
    {
      id: "adv-06-02-prefill-decode",
      title: "6.1 Prefill 与 Decode",
      file: "大模型教程/06-模型推理优化/01-Prefill与Decode.md",
      difficulty: "中级-高级",
      duration: "0.5h",
      week: 3,
      phase: 3,
      keywords: ["Prefill", "Decode", "LLM"],
      content: `# 6.1 Prefill 与 Decode

LLM 的自回归生成可以分解为两个阶段：**Prefill**（预填充）处理输入 prompt，**Decode**（解码）逐个生成输出 token。这两个阶段的计算特性截然不同，理解它们是优化推理的基础。

想象你去一家餐厅点餐。服务员先花一段时间「通读」你写好的整张菜单（Prefill），然后逐道菜确认口味、一道一道地下单到厨房（Decode）。第一步可以一目十行地并行处理，第二步却必须等上一道菜确认后才能问下一道——这正是大模型推理中两个阶段的核心差异。

\`\`\`mermaid
graph LR
    A[用户输入] --> B[Prefill阶段]
    B -->|并行处理所有token| C[生成KV Cache]
    C --> D[Decode阶段]
    D -->|逐token生成| E[输出token]
    E -->|未结束| D
    E -->|生成结束| F[完整输出]
\`\`\`

## 6.1.1 自回归生成的基本流程

### Transformer 推理

给定输入序列 $x_1, x_2, \\ldots, x_n$，Transformer 的推理过程是：

1. **Embedding**：将 token 转换为向量
2. **逐层计算**：通过 $L$ 层 Transformer block
3. **输出**：最后一层的隐藏状态通过 LM head 得到 logits

对于自回归语言模型，关键在于：生成第 $t+1$ 个 token 时，需要访问前 $t$ 个 token 的信息。这通过**因果注意力**（Causal Attention）实现——每个位置只能看到自己和之前的位置。

举个例子：你在写一封邮件，写到第 5 个字的时候，你的大脑会参考前 4 个字来决定第 5 个字该用什么。你不能「偷看」后面还没写的内容——这就是因果注意力的直觉。

### 朴素实现的问题

最朴素的实现：每生成一个新 token，重新计算整个序列的注意力。

这就像每次续写一段文字时，都要从头到尾把整篇文章重新默读一遍——文章越长，每写一个字的代价就越大。

设序列长度为 $n$，生成 $m$ 个 token，总计算量为：

$$\\sum_{t=n}^{n+m-1} O(t^2 \\cdot d) = O((n+m)^2 \\cdot m \\cdot d)$$

其中：
- $n$ 表示输入 prompt 的长度（token 数）
- $m$ 表示待生成的输出 token 数
- $d$ 表示模型隐藏层维度
- $t$ 表示当前已有的序列长度，从 $n$ 增长到 $n+m-1$

说白了，每生成一个新 token 都要对已有的全部 $t$ 个 token 做一次 $O(t^2 \\cdot d)$ 的注意力计算，而 $t$ 随生成过程持续增长，后续 token 的成本急剧攀升。想象你写一篇 1000 字的作文，每写一个字都要重读前面全部内容——写到第 500 字时，每个字的思考成本已是第 10 字时的 2500 倍。对于长 prompt 或长输出，这个开销显然不可接受。

## 6.1.2 Prefill 阶段

### 定义

**Prefill**（预填充）阶段处理用户输入的 prompt。所有 prompt token 已知，可以一次性并行处理。

设 prompt 长度为 $n$，Prefill 需要：

1. 计算所有 $n$ 个 token 的 embedding
2. 逐层计算注意力和 FFN
3. 为 Decode 阶段准备 KV Cache

### 计算特点

**并行性好**：所有 token 可同时计算，类似训练的前向传播。回到餐厅场景——服务员看菜单时，所有菜名同时映入眼帘，无需逐字阅读。

**计算密集**：瓶颈在矩阵乘法（Q、K、V 投影与注意力计算），GPU 利用率高。

**一次性开销**：每个请求只做一次 Prefill，如同考试时的审题——审题只需一次，之后全力作答。

### 计算量分析

Prefill 的主要计算：

**注意力计算**：

$$\\text{Attention}(\\mathbf{Q}, \\mathbf{K}, \\mathbf{V}) = \\text{softmax}\\left(\\frac{\\mathbf{Q}\\mathbf{K}^\\top}{\\sqrt{d_k}}\\right)\\mathbf{V}$$

其中：
- $\\mathbf{Q}, \\mathbf{K}, \\mathbf{V} \\in \\mathbb{R}^{n \\times d}$ 分别为查询、键、值矩阵，由输入通过线性变换得到
- $d_k$ 为每个注意力头的维度，缩放因子 $\\sqrt{d_k}$ 防止点积过大导致 softmax 饱和
- $n$ 为序列长度，$d$ 为隐藏层维度

各步骤的计算量：
- $\\mathbf{Q}, \\mathbf{K}, \\mathbf{V}$ 的线性投影：$O(n \\cdot d^2)$（$n$ 个 token 各做一次 $d \\to d$ 的矩阵乘法）
- $\\mathbf{Q}\\mathbf{K}^\\top$：$O(n^2 \\cdot d)$（$n \\times n$ 个点积，每个涉及 $d$ 维向量）
- $\\text{softmax} \\cdot \\mathbf{V}$：$O(n^2 \\cdot d)$（加权求和）

**FFN 计算**：

$$\\text{FFN}(\\mathbf{x}) = \\text{GELU}(\\mathbf{x}\\mathbf{W}_1)\\mathbf{W}_2$$

其中：
- $\\mathbf{x} \\in \\mathbb{R}^{n \\times d}$ 为输入
- $\\mathbf{W}_1 \\in \\mathbb{R}^{d \\times d_{ff}}$、$\\mathbf{W}_2 \\in \\mathbb{R}^{d_{ff} \\times d}$ 为 FFN 的两层权重
- $d_{ff}$ 为 FFN 中间维度，通常取 $4d$

FFN 每层计算量为 $O(n \\cdot d \\cdot d_{ff})$。

综合以上，Prefill 阶段**每层**总计算量：

$$O(L \\cdot (n^2 \\cdot d + n \\cdot d^2))$$

其中 $L$ 为 Transformer 层数。当 prompt 较短时，$n \\cdot d^2$（线性投影）主导计算量；当 $n > d$ 时，$n^2 \\cdot d$（注意力计算）成为瓶颈——这正是长 prompt 处理速度下降的根本原因。

### TTFT 优化

**TTFT**（Time to First Token）是用户感知的首要延迟，主要由 Prefill 决定。优化方向：

1. **Flash Attention**：减少显存访问，加速注意力计算
2. **Tensor 并行**：多卡分担计算
3. **量化**：减少计算精度
4. **Prefix Caching**：缓存公共前缀的 KV

## 6.1.3 Decode 阶段

### 定义

**Decode**（解码）阶段逐个生成输出 token。每一步：

1. 将上一步生成的 token 输入模型
2. 计算该 token 的隐藏状态
3. 通过 LM head 得到下一个 token 的概率分布
4. 采样得到下一个 token
5. 重复直到生成结束符或达到最大长度

### 计算特点

**串行依赖**：每个 token 依赖前一个，无法并行生成（不考虑投机解码）。这就像多米诺骨牌——必须等前一块倒下，后一块才会跟着倒。

**内存密集**：每步只处理一个 token，计算量小，但需要加载全部模型参数。想象一下：你只想查字典里的一个字，但每次都要把整本字典从书架上搬下来翻一遍。

**重复开销**：生成 $m$ 个 token 需要 $m$ 次前向传播。

### 算术强度分析

**算术强度**（Arithmetic Intensity）= 计算量 / 数据传输量

设模型参数量为 $P$，每步 Decode：

- 计算量：$O(d^2 \\cdot L)$（一个 token 经过 $L$ 层，每层主要做 $d \\times d$ 的矩阵乘法）
- 数据传输量：$O(P)$（需要从显存加载全部模型参数）

其中：
- $d$ 表示隐藏层维度
- $L$ 表示 Transformer 层数
- $P$ 表示模型总参数量（约 $12 \\cdot L \\cdot d^2$ 量级）

算术强度 = $O(d^2 \\cdot L) / O(P) \\approx O(1)$，远低于 GPU 的算术强度阈值，GPU 大部分时间在等数据从显存搬到计算单元——这就是 Decode 阶段**内存带宽受限**（Memory-bound）的本质。打个比方：GPU 像一位算力惊人的数学天才，但每次做题前都要等快递把 140GB 的「参数教材」送到手边，带宽通道再宽也需要时间，结果天才大部分时间不是在计算而是在等快递。

### 量化示例

以 LLaMA-70B 为例：

- 参数量：70B
- FP16 显存：140GB
- A100 显存带宽：2TB/s
- 加载模型一次：140GB / 2TB/s = 70ms

这意味着每个 token 至少需要 70ms（不计算开销），即最多 ~14 tokens/s。

实际上通过 KV Cache 和批处理可以改善，但内存带宽仍是核心瓶颈。

\`\`\`mermaid
graph TD
    subgraph Prefill
        P1[所有Prompt Token] -->|并行计算| P2[QKV矩阵]
        P2 --> P3[注意力 + FFN]
        P3 --> P4[KV Cache]
    end
    subgraph Decode
        D1[上一个Token] -->|单token计算| D2[新QKV]
        D2 -->|拼接KV Cache| D3[注意力 + FFN]
        D3 --> D4[下一个Token]
        D4 -->|循环| D1
    end
    P4 --> D2
\`\`\`

## 6.1.4 Prefill 与 Decode 的对比

| 维度 | Prefill | Decode |
|------|---------|--------|
| 处理内容 | Prompt（已知） | 输出（逐个生成） |
| 并行性 | 高（所有 token 并行） | 低（串行依赖） |
| 计算特点 | Compute-bound | Memory-bound |
| 主要瓶颈 | 注意力的 $O(n^2)$ | 内存带宽 |
| 批处理效果 | 好 | 有限 |

### 系统设计启示

这种差异对系统设计有深刻影响：

**分离调度**：Prefill 与 Decode 可分开调度甚至部署到不同硬件，如同物流公司将分拣中心与末端配送设在不同地点，各取所长。

**批处理策略**：Prefill 受益于大批量；Decode 则依赖 Continuous Batching 等专用优化。

**资源分配**：Prefill 需要算力，Decode 需要带宽，二者的资源画像截然不同。

## 6.1.5 Chunked Prefill

### 长 Prompt 的问题

当 prompt 很长（如 100K token）时，Prefill 的 $O(n^2)$ 注意力计算和显存占用成为瓶颈——10 万个 token 意味着注意力矩阵达 $10^{10}$ 量级元素，光存储这张关系表就可能撑爆显存。具体表现为：

1. **显存溢出**：$n \\times n$ 的注意力矩阵可能超出显存容量
2. **延迟尖峰**：长 Prefill 阻塞其他请求，如同高速入口处的超长货车挡住后面所有车辆
3. **批处理困难**：不同长度的 prompt 难以高效组批

### Chunked Prefill

**Chunked Prefill** 将长 prompt 分块处理，如同把厚书分成章节逐章消化，而非一口气读完：

1. 将 prompt 分成大小为 $C$ 的 chunk
2. 逐 chunk 进行 Prefill，累积 KV Cache
3. 最后一个 chunk 后进入 Decode

其中 $C$ 为分块大小（chunk size），通常取几千（如 $C = 2048$），远小于完整 prompt 长度 $n$。

优势：
- 显存占用可控——注意力矩阵从 $O(n^2)$ 降为 $O(C^2)$，峰值显存由 chunk 大小而非总 prompt 长度决定
- 长 prompt 不会阻塞其他请求
- 可以与 Decode 请求混合调度

代价：
- 总计算量略增（chunk 边界的处理）
- 实现复杂度增加

\`\`\`mermaid
graph LR
    A[长Prompt] --> B[分块 Chunk 1]
    A --> C[分块 Chunk 2]
    A --> D[分块 Chunk N]
    B -->|逐块Prefill| E[累积KV Cache]
    C --> E
    D --> E
    E --> F[进入Decode]
\`\`\`

## 6.1.6 Prefill-Decode 分离架构

### 动机

Prefill 和 Decode 对硬件的需求不同：

- Prefill：高算力，适合 GPU
- Decode：高带宽，适合多卡并行或定制硬件

将两者分离可以独立优化和扩展。

### 分离部署

**物理分离**：
- Prefill 服务器：高算力 GPU（如 H100）
- Decode 服务器：多卡并行或专用硬件
- 通过网络传递 KV Cache

**逻辑分离**：
- 同一 GPU 上，Prefill 和 Decode 请求分开调度
- Prefill 使用大 batch，Decode 使用 Continuous Batching

\`\`\`mermaid
graph LR
    A[用户请求] --> B[Prefill服务器]
    B -->|高速网络传输KV Cache| C[Decode服务器]
    C --> D[逐token生成]
    D --> E[返回结果]
\`\`\`

### Disaggregated Serving

**Disaggregated Serving** 是一种极端的分离架构：

1. Prefill 节点专门处理 prompt
2. KV Cache 通过高速网络（如 NVLink、InfiniBand）传递
3. Decode 节点专门生成输出

该架构在大规模部署中可显著提高资源利用率，代价是系统复杂度的上升。
`
    },
    {
      id: "adv-06-03-kvcache",
      title: "6.2 KV Cache",
      file: "大模型教程/06-模型推理优化/02-KVCache.md",
      difficulty: "中级-高级",
      duration: "0.5h",
      week: 3,
      phase: 3,
      keywords: ["KV", "Cache", "LLM", "Key", "Value"],
      content: `# 6.2 KV Cache

**KV Cache** 是 LLM 推理中最基础也最重要的优化技术。它通过缓存历史 token 的 Key 和 Value，避免 Decode 阶段的重复计算，将生成每个 token 的复杂度从 $O(n)$ 降为 $O(1)$（相对于序列长度）。

想象你是一家餐厅的服务员，每次顾客加点一道菜，你都得重新走一遍所有桌子，把之前每位客人点了什么重新问一遍——这显然荒谬。聪明的做法是拿一本「点单本」（KV Cache），把之前的订单都记在上面，新加的菜直接追加到末尾就行。这就是 KV Cache 的精髓。

## 6.2.1 为什么需要 KV Cache

### 注意力计算回顾

自注意力的计算：

$$\\text{Attention}(\\mathbf{Q}, \\mathbf{K}, \\mathbf{V}) = \\text{softmax}\\left(\\frac{\\mathbf{Q}\\mathbf{K}^\\top}{\\sqrt{d_k}}\\right)\\mathbf{V}$$

对于因果语言模型，位置 $t$ 的输出只依赖位置 $1, 2, \\ldots, t$ 的信息。

### 朴素实现的冗余

考虑生成第 $t+1$ 个 token。朴素实现需要：

1. 计算位置 $1$ 到 $t+1$ 的 $\\mathbf{Q}, \\mathbf{K}, \\mathbf{V}$
2. 计算完整的注意力矩阵 $(t+1) \\times (t+1)$
3. 得到位置 $t+1$ 的输出

但位置 $1$ 到 $t$ 的 $\\mathbf{K}, \\mathbf{V}$ 在生成前 $t$ 个 token 时已经计算过。重复计算是巨大的浪费。

回到点单本的场景：顾客加的第 6 道菜不会改变前 5 道菜的内容。既然前 5 道菜的「订单信息」不变，为什么要重新记录呢？直接查点单本即可。

### KV Cache 的思想

**KV Cache** 的核心思想：缓存所有历史位置的 $\\mathbf{K}, \\mathbf{V}$，每步只计算新 token 的 $\\mathbf{Q}, \\mathbf{K}, \\mathbf{V}$。

生成第 $t+1$ 个 token 时：

1. 只计算位置 $t+1$ 的 $\\mathbf{q}_{t+1}, \\mathbf{k}_{t+1}, \\mathbf{v}_{t+1}$
2. 将 $\\mathbf{k}_{t+1}, \\mathbf{v}_{t+1}$ 追加到 Cache
3. 用 $\\mathbf{q}_{t+1}$ 与缓存的 $\\mathbf{K}_{1:t+1}, \\mathbf{V}_{1:t+1}$ 计算注意力

\`\`\`mermaid
graph LR
    subgraph 首次计算
        A[Prompt Tokens] --> B[计算K,V]
        B --> C[存入KV Cache]
    end
    subgraph 后续生成
        D[新Token] --> E[仅计算新K,V]
        E --> F[追加到Cache]
        F --> G[与全部K,V做注意力]
        G --> H[输出]
    end
    C --> G
\`\`\`

## 6.2.2 KV Cache 的实现

### 数据结构

对于每一层，维护两个张量：

$$\\mathbf{K}_{\\text{cache}} \\in \\mathbb{R}^{B \\times H \\times L_{\\max} \\times d_k}$$
$$\\mathbf{V}_{\\text{cache}} \\in \\mathbb{R}^{B \\times H \\times L_{\\max} \\times d_v}$$

其中：
- $B$：批大小
- $H$：注意力头数
- $L_{\\max}$：最大序列长度
- $d_k, d_v$：Key/Value 维度

### Prefill 阶段

Prefill 时，一次性计算所有 prompt token 的 $\\mathbf{K}, \\mathbf{V}$ 并存入 Cache：

\`\`\`python
# 计算 Q, K, V
Q = x @ W_Q  # [B, n, d]
K = x @ W_K  # [B, n, d]
V = x @ W_V  # [B, n, d]

# 存入 Cache
kv_cache.K[:, :, :n, :] = K
kv_cache.V[:, :, :n, :] = V

# 计算注意力
attn_output = attention(Q, K, V)
\`\`\`

### Decode 阶段

Decode 时，每步只计算一个 token：

\`\`\`python
# 计算新 token 的 Q, K, V
q = x_new @ W_Q  # [B, 1, d]
k = x_new @ W_K  # [B, 1, d]
v = x_new @ W_V  # [B, 1, d]

# 追加到 Cache
kv_cache.K[:, :, t, :] = k
kv_cache.V[:, :, t, :] = v

# 用完整的 K, V 计算注意力
K_full = kv_cache.K[:, :, :t+1, :]  # [B, H, t+1, d]
V_full = kv_cache.V[:, :, :t+1, :]  # [B, H, t+1, d]
attn_output = attention(q, K_full, V_full)  # [B, 1, d]
\`\`\`

### 计算量对比

| 阶段 | 无 KV Cache | 有 KV Cache |
|------|------------|-------------|
| Prefill（$n$ tokens） | $O(n^2 \\cdot d)$ | $O(n^2 \\cdot d)$ |
| Decode（每个 token） | $O(t^2 \\cdot d)$ | $O(t \\cdot d)$ |
| Decode（$m$ tokens 总计） | $O(m \\cdot n^2 \\cdot d)$ | $O(m \\cdot n \\cdot d)$ |

其中：
- $n$ 为 prompt 长度，$m$ 为生成长度，$d$ 为隐藏层维度
- $t$ 为 Decode 时当前序列长度（逐步增长）
- 无 KV Cache 时，生成每个 token 需要重新计算完整 $t \\times t$ 注意力矩阵（$O(t^2 \\cdot d)$）
- 有 KV Cache 时，只需计算新 token 与缓存的 $t$ 个 K/V 的点积（$O(t \\cdot d)$）

这个公式告诉我们：KV Cache 将 Decode 的复杂度从二次降为线性。没有 KV Cache 时，生成第 1000 个 token 的成本是第 10 个 token 的一万倍；有了 KV Cache 只是 100 倍——这就是「查点单本」与「重新问一遍」的差距。

## 6.2.3 显存占用分析

### KV Cache 大小

设模型有 $L$ 层，隐藏维度 $d$，序列长度 $n$，批大小 $B$。

每层 KV Cache：$2 \\times n \\times d$ 个元素（K 和 V 各一份）

总 KV Cache：

$$\\text{KV Cache} = 2 \\times L \\times B \\times n \\times d \\times \\text{sizeof(dtype)}$$

其中：
- $L$ 为 Transformer 层数
- $B$ 为批大小（并发请求数）
- $n$ 为序列长度（token 数）
- $d$ 为隐藏层维度
- $\\text{sizeof(dtype)}$ 为每个元素的字节数（FP16 为 2，FP32 为 4）
- 因子 2 表示 K 和 V 各占一份

换句话说，KV Cache 的显存占用与序列长度线性增长——每生成一个新 token 就多存一组 K 和 V 向量，序列足够长时，缓存本身的显存占用可能超过模型参数。

以 LLaMA-70B 为例（$L=80$，$d=8192$，$n=4096$，$B=1$，FP16）：

$$2 \\times 80 \\times 1 \\times 4096 \\times 8192 \\times 2 \\text{ bytes} = 10{,}737{,}418{,}240 \\text{ bytes} \\approx 10.7 \\text{ GB}$$

**单个请求的 KV Cache 就占用 10.7GB**！这是 LLM 推理显存紧张的主要原因。

作为参照，一张普通照片约 5MB，10.7GB 的 KV Cache 相当于约 2000 张照片。每来一个用户就占据这么多显存，GPU 显存永远紧张也就不足为奇了。

### 与模型参数的对比

LLaMA-70B 参数量：140GB（FP16）

KV Cache（4K 上下文）：10.7GB / 请求

批大小 8 时，KV Cache 总计 85.6GB，已接近模型参数量——服务 8 个并发用户时，「点单本」占用的空间几乎和「菜谱」本身一样大。

### GQA 对 KV Cache 的影响

**GQA**（Grouped Query Attention）让多个 Query 头共享一组 KV 头，从而缩小 KV Cache。打个比方，原来 64 个参会者每人各做笔记（MHA），现在 8 个小组各共享一份笔记（GQA），笔记本总量缩减为原来的 1/8。

设 Query 头数为 $H_Q$，KV 头数为 $H_{KV}$：

$$\\text{KV Cache} = 2 \\times L \\times B \\times n \\times H_{KV} \\times d_k \\times \\text{sizeof(dtype)}$$

其中：
- $H_Q$ 为 Query 注意力头数
- $H_{KV}$ 为 KV 注意力头数，GQA 中 $H_{KV} < H_Q$
- $d_k = d / H_Q$ 为每个注意力头的维度
- 总隐藏维度 $d = H_Q \\times d_k$

GQA 的缩减比为 $H_{KV} / H_Q$。LLaMA-2 70B 使用 GQA（$H_Q=64$，$H_{KV}=8$），KV Cache 缩小为 MHA 的 $8/64 = 1/8$。

## 6.2.4 KV Cache 优化技术

### 量化

将 KV Cache 从 FP16 量化到 INT8 或 INT4：

- INT8：显存减半
- INT4：显存减少 75%

量化可能影响生成质量，需要在精度和效率之间权衡。

### 压缩

**Key/Value 压缩**：用低秩分解或学习到的压缩函数减少 KV 维度。

**稀疏化**：只保留重要位置的 KV（如 H2O、StreamingLLM）。

### Sliding Window

**滑动窗口注意力**：只保留最近 $W$ 个位置的 KV Cache。

$$\\mathbf{K}_{\\text{cache}} = \\mathbf{K}_{t-W+1:t}$$

其中 $W$ 为窗口大小（token 数），$t$ 为当前位置。只保留最近 $W$ 个位置的 K/V，显存占用从 $O(n)$ 降为 $O(W)$，与序列总长无关。

这就像手机聊天记录的「只显示最近 N 条」功能——不再保存所有历史消息，只留最近的对话上下文。Mistral 等模型原生支持滑动窗口，适合长序列场景。

### Prefix Caching

对于共享前缀的多个请求（如 few-shot 或系统提示），可以缓存前缀的 KV：

1. 首次计算公共前缀的 KV
2. 后续请求直接复用，跳过前缀的 Prefill

这在多轮对话和批量处理中非常有效。

\`\`\`mermaid
graph TD
    subgraph MHA
        A1[64个Q头] --> A2[64个KV头]
        A2 --> A3[KV Cache: 64份]
    end
    subgraph GQA
        B1[64个Q头] --> B2[8个KV头]
        B2 --> B3[KV Cache: 8份]
    end
    subgraph MQA
        C1[64个Q头] --> C2[1个KV头]
        C2 --> C3[KV Cache: 1份]
    end
\`\`\`

## 6.2.5 Multi-Query 与 Grouped-Query Attention

### MHA 的冗余

标准 **MHA**（Multi-Head Attention）每个头有独立的 $\\mathbf{W}_K, \\mathbf{W}_V$，产生独立的 KV Cache。

但研究表明，不同头的 KV 具有较高相似性，存在显著冗余。

### MQA

**MQA**（Multi-Query Attention）所有 Query 头共享一组 KV：

$$H_{KV} = 1$$

KV Cache 大小降为 MHA 的 $1/H$，显著减少显存。

代价：生成质量可能略有下降。

### GQA

**GQA**（Grouped-Query Attention）是 MHA 和 MQA 的折中：

$$1 < H_{KV} < H_Q$$

将 Query 头分组，每组共享一组 KV。

例如 $H_Q = 64$，$H_{KV} = 8$：每 8 个 Query 头共享一组 KV。

GQA 在质量和效率之间取得了很好的平衡，被 LLaMA-2、Mistral 等主流模型采用。

### 转换

已有的 MHA 模型可以转换为 GQA/MQA：

1. 对每组 Query 头，将对应的 $\\mathbf{W}_K, \\mathbf{W}_V$ 取平均
2. 在小数据集上微调恢复质量

## 6.2.6 KV Cache 的内存管理

### 预分配 vs 动态分配

**预分配**：按最大长度 $L_{\\max}$ 预分配 KV Cache。

- 优点：简单，无碎片
- 缺点：浪费（大多数请求不会达到最大长度）

**动态分配**：按实际长度分配。

- 优点：节省显存
- 缺点：内存碎片，分配开销

### 碎片问题

动态分配会导致内存碎片：

\`\`\`text
|--KV1--|    |--KV2--|      |--KV3--|
        ^空隙^        ^空隙^
\`\`\`

短请求结束释放后，留下的空隙往往无法容纳新的长请求——就像停车场里小车离开后，留下的空位太小，大巴士停不进去；显存明明有剩余却无法使用。

### Paged Attention

**Paged Attention**（下一节详述）借鉴操作系统的分页内存管理，将 KV Cache 分成固定大小的"页"，动态分配和回收。这是解决 KV Cache 内存管理的核心技术。
`
    },
    {
      id: "adv-06-04-decoding-strategy",
      title: "6.3 解码策略",
      file: "大模型教程/06-模型推理优化/03-解码策略.md",
      difficulty: "中级-高级",
      duration: "0.5h",
      week: 3,
      phase: 3,
      keywords: ["解码策略", "Decoding", "Strategy", "Beam", "Search", "MTP"],
      content: `# 6.3 解码策略

模型输出的是下一个 token 的概率分布，如何从分布中选择 token？不同的**解码策略**（Decoding Strategy）会产生截然不同的输出。本节讨论常用的解码方法：贪婪采样、Beam Search、随机采样及其变体，以及新兴的 MTP 解码。

假设你站在一个十字路口，导航告诉你前方有三条路，各自的“到达概率”不同。你是每次都走概率最高的那条（贪婪），还是同时派出几个分身探路（Beam Search），或者按概率随机赌一把（采样）？这就是解码策略要回答的问题。

\`\`\`mermaid
graph TD
    A[Logits概率分布] --> B{需要确定性?}
    B -->|是| C{需要全局最优?}
    C -->|否| D[贪婪解码]
    C -->|是| E[Beam Search]
    B -->|否| F[温度调节]
    F --> G[Top-k过滤]
    G --> H[Top-p过滤]
    H --> I[随机采样]
\`\`\`

## 6.3.1 贪婪解码

### 定义

**贪婪解码**（Greedy Decoding）每一步选择概率最高的 token：

$$x_{t+1} = \\arg\\max_{x} P(x \\mid x_{1:t})$$

其中 $x_{1:t}$ 表示已生成的前 $t$ 个 token，$P(x \\mid x_{1:t})$ 是模型输出的下一个 token 的条件概率分布。$\\arg\\max$ 表示选择概率最高的那个 token。

### 特点

**优点**：
- 实现简单，计算高效
- 确定性输出，可复现

**缺点**：
- 局部最优不等于全局最优
- 输出单调，缺乏多样性
- 容易陷入重复

### 重复问题

贪婪解码有个致命弱点——它倾向于生成重复内容。这就像一个只会走「最短路」的人，一旦走进了死胡同，就会反复在同一个圈里转：

\`\`\`text
The cat sat on the mat. The cat sat on the mat. The cat sat on the mat...
\`\`\`

一旦进入重复模式，每步的 argmax 都指向相同的 token 序列。

### 适用场景

- 确定性任务（如代码生成的简单补全）
- 调试和测试
- 作为其他方法的基线

## 6.3.2 Beam Search

### 动机

贪婪解码的问题在于：每步的局部最优选择可能导致全局次优。想象你下棋，每步只看当前最有利的一步而不考虑后续局面，很可能走入陷阱。能否同时考虑多条路径，选择整体概率最高的？

### 算法

**Beam Search** 维护 $k$ 条候选序列（beam），每步扩展所有候选，保留概率最高的 $k$ 条。这就像你同时派出 $k$ 个侦察兵分头探路，每到一个岩口就淘汰方向最差的几个，只留下前景最好的 $k$ 路继续前进：

1. 初始化：$k$ 条相同的空序列
2. 对每条序列，计算所有可能的下一 token，得到 $k \\times V$ 个候选
3. 按序列概率排序，保留 top-$k$
4. 重复直到所有序列结束

### 序列概率

为了比较不同长度的序列，通常用**长度归一化**的对数概率：

$$\\text{score}(x_{1:t}) = \\frac{1}{t^\\alpha} \\sum_{i=1}^t \\log P(x_i \\mid x_{1:i-1})$$

其中：
- $x_{1:t}$ 为候选序列，长度为 $t$
- $\\log P(x_i \\mid x_{1:i-1})$ 为每个 token 的对数概率，累加得到序列对数概率
- $\\alpha \\in [0.6, 1.0]$ 为长度惩罚参数：$\\alpha = 0$ 表示不做长度归一化，$\\alpha = 1$ 表示完全归一化

背后的含义是：若不做长度归一化，Beam Search 会偏好短序列（短序列累积对数概率更大），除以 $t^\\alpha$ 正是为了抵消这种偏差。

### 计算开销

Beam Search 的开销是贪婪解码的 $k$ 倍：

- 维护 $k$ 个 KV Cache
- 每步 $k$ 次前向传播（可以批处理）
- 显存占用增加 $k$ 倍

### 适用场景

- 机器翻译等有标准答案的任务
- 需要高质量单一输出的场景
- 不适合开放式生成（输出较为死板）

## 6.3.3 随机采样

### 温度采样

**温度采样**（Temperature Sampling）从经过温度调节的分布中随机采样：

$$P_\\tau(x) = \\frac{\\exp(z_x / \\tau)}{\\sum_{x'} \\exp(z_{x'} / \\tau)}$$

其中：
- $z_x$ 为模型输出的原始 logit（未经 softmax 的分数）
- $\\tau > 0$ 为温度参数，控制分布的“尖锐程度”
- 分母是对所有候选 token 的指数求和，保证概率和为 1

你可以把温度理解为一个「冒险旋钮」：

- $\\tau = 1$：原始分布（正常发挥）
- $\\tau < 1$：分布更尖锐，倾向高概率 token（保守稳健）
- $\\tau > 1$：分布更平坦，增加随机性（大胆冒险）
- $\\tau \\to 0$：退化为贪婪解码（完全不冒险）

### Top-k 采样

**Top-k 采样**只从概率最高的 $k$ 个 token 中采样：

1. 选出 top-$k$ 个 token
2. 重新归一化它们的概率
3. 从归一化后的分布采样

$$P_{k}(x) = \\begin{cases} P(x) / \\sum_{x' \\in \\text{top-}k} P(x') & \\text{if } x \\in \\text{top-}k \\\\ 0 & \\text{otherwise} \\end{cases}$$

其中：
- $k$ 为保留的候选 token 数量
- 分母 $\\sum_{x' \\in \\text{top-}k} P(x')$ 保证筛选后的概率重新归一化为 1
- 未进入 top-$k$ 的 token 概率置为 0，不可能被采样到

Top-k 避免采样到概率极低的 token，同时保持多样性——就像点菜时只看「热卖榜」前 $k$ 名，而不会随机点一道从来没听说过的菜。

### Top-p（Nucleus）采样

**Top-p 采样**选择累积概率达到 $p$ 的最小 token 集合：

1. 按概率降序排列 token
2. 选择前 $m$ 个，使得 $\\sum_{i=1}^m P(x_i) \\geq p$
3. 从这 $m$ 个 token 中采样

Top-p 相比 Top-k 更灵活：分布集中时候选集小，分布分散时候选集大。比如模型对下一个词很确定时（「中华人民共和___」），候选集可能只有 1 个词；而不确定性高时（「今天天气真___」），候选集可能有几十个词。这种自适应性正是 Top-p 的精妙之处。

### 组合使用

实践中常组合使用多种策略：

\`\`\`python
logits = model(input_ids)
logits = logits / temperature  # 温度调节
logits = top_k_filter(logits, k=50)  # Top-k 过滤
logits = top_p_filter(logits, p=0.95)  # Top-p 过滤
probs = softmax(logits)
next_token = sample(probs)
\`\`\`

### 典型参数

| 场景 | Temperature | Top-k | Top-p |
|------|-------------|-------|-------|
| 代码生成 | 0.2-0.4 | 10-40 | 0.9 |
| 创意写作 | 0.7-1.0 | 40-100 | 0.95 |
| 对话 | 0.5-0.7 | 40-50 | 0.9-0.95 |

## 6.3.4 采样控制技术

### 重复惩罚

**重复惩罚**（Repetition Penalty）降低已出现 token 的概率：

$$P'(x) = P(x) / \\theta^{\\mathbb{1}[x \\in x_{1:t}]}$$

其中：
- $\\theta > 1$ 为惩罚系数，典型值为 1.1–1.3
- $\\mathbb{1}[x \\in x_{1:t}]$ 为指示函数：若 token $x$ 已在已生成序列中出现过则为 1，否则为 0
- 已出现的 token 概率被除以 $\\theta$，从而降低其再次被采样的可能性

本质上，$\\theta$ 越大对重复的惩罚越重，但过大会导致生成内容不连贯。

变体：
- **频率惩罚**：按出现次数惩罚
- **存在惩罚**：只要出现就惩罚（不累加）

### 长度控制

**最小/最大长度**：强制生成至少/最多 $L$ 个 token。

**长度惩罚**：在 Beam Search 中调整长度归一化参数 $\\alpha$。

**EOS 概率调节**：在期望长度附近提高/降低 EOS 的概率。

### 词汇约束

**Constrained Decoding**：强制输出包含或排除特定 token。

应用：
- JSON 格式输出
- 关键词必须出现
- 敏感词过滤

## 6.3.5 投机解码

### 动机

Decode 阶段是内存带宽瓶颈，每步只生成一个 token 效率低。能否“猜测”多个 token，然后一次性验证？

这就像写作文时的「草稿—审阅」模式：与其一个字一个字地斟酌，不如先快速写出一段草稿，然后让更有经验的人一次性审核——能用的留下，不行的划掉重写。

### 算法

**投机解码**（Speculative Decoding）正是这个思路——用小模型（draft model，相当于写草稿的实习生）猜测多个 token，用大模型（相当于主编）验证：

1. Draft 模型自回归生成 $k$ 个 token：$\\tilde{x}_1, \\ldots, \\tilde{x}_k$
2. Target 模型并行计算这 $k+1$ 个位置的概率
3. 从左到右验证：如果 draft 的 token 被 target 接受，保留；否则从 target 分布重新采样
4. 重复

\`\`\`mermaid
graph LR
    A[Draft模型] -->|快速生成k个token| B[候选序列]
    B --> C[Target模型]
    C -->|并行验证k+1个位置| D{接受?}
    D -->|是| E[保留token]
    D -->|否| F[从该位置重新采样]
    E --> A
    F --> A
\`\`\`

### 接受条件

为了保证输出分布与纯 target 模型相同，使用**拒绝采样**：

$$P(\\text{accept } \\tilde{x}_t) = \\min\\left(1, \\frac{P_{\\text{target}}(\\tilde{x}_t)}{P_{\\text{draft}}(\\tilde{x}_t)}\\right)$$

其中：
- $P_{\\text{target}}(\\tilde{x}_t)$ 为大模型（target）对该 token 的概率
- $P_{\\text{draft}}(\\tilde{x}_t)$ 为小模型（draft）对该 token 的概率
- 当 $P_{\\text{target}} \\geq P_{\\text{draft}}$ 时，接受概率为 1（大模型“更认可”此 token）
- 当 $P_{\\text{target}} < P_{\\text{draft}}$ 时，以比例概率接受，保证最终分布与纯 target 模型一致

若拒绝，从调整后的分布采样：

$$P'(x) \\propto \\max(0, P_{\\text{target}}(x) - P_{\\text{draft}}(x))$$

这里的精妙之处在于：即使 draft 模型质量较差，经过拒绝采样后的最终输出分布仍严格等价于纯 target 模型生成。draft 只是加速手段，不影响输出质量。

### 加速比

加速比取决于 draft 模型的接受率 $\\alpha$：

$$\\text{Speedup} \\approx \\frac{1}{1 - \\alpha}$$

其中 $\\alpha$ 为 draft 模型的平均接受率（被 target 模型接受的 token 比例）。例如 $\\alpha = 0.8$ 意味着 80% 的“草稿”被“主编”采纳，理论加速比 $1/(1-0.8) = 5\\times$。实际受 draft 模型开销影响，通常 2–3x。

### 变体

**Self-Speculative Decoding**：用模型自身的早期层作为 draft。

**Medusa**：给 target 模型添加多个预测头，同时预测多个 token。

**Lookahead Decoding**：用 n-gram 缓存加速。

## 6.3.6 MTP 解码

### Multi-Token Prediction

**MTP**（Multi-Token Prediction）模型训练时预测未来多个 token：

$$\\mathcal{L} = -\\sum_{t=1}^T \\sum_{k=1}^K \\log P(x_{t+k} \\mid x_{1:t})$$

其中：
- $T$ 为训练序列总长度
- $K$ 为同时预测的未来 token 数（如 $K = 4$）
- $P(x_{t+k} \\mid x_{1:t})$ 为在位置 $t$ 预测未来第 $k$ 个 token 的概率

用大白话讲，与标准语言模型只预测下一个 token（$K=1$）不同，MTP 要求模型同时对未来 $K$ 个位置都做出准确预测，从而在推理时一步生成多个 token。

### MTP 解码流程

1. 模型输出 $K$ 个位置的分布
2. 取 top 预测，验证一致性
3. 接受连续一致的前 $m$ 个 token
4. 从位置 $m+1$ 继续

### 与投机解码的关系

MTP 解码可以视为**自投机**：模型自己既是 draft 也是 target。

优势：
- 无需额外 draft 模型
- 训练时已学习多 token 预测

挑战：
- 训练成本增加
- 多头预测的一致性

## 6.3.7 解码策略选择

### 决策树

\`\`\`text
需要确定性输出？
├── 是 → 贪婪解码或 Beam Search
└── 否 → 需要多样性？
    ├── 是 → 高温度 + Top-p
    └── 否 → 低温度 + Top-k
\`\`\`

### 任务匹配

| 任务类型 | 推荐策略 |
|----------|----------|
| 翻译、摘要 | Beam Search |
| 代码生成 | 贪婪或低温度采样 |
| 创意写作 | 高温度 + Top-p |
| 对话 | 中等温度 + Top-p |
| 多样化生成 | 高温度 + 重复惩罚 |

### 评估权衡

- **质量 vs 多样性**：低温度/贪婪提高质量，高温度增加多样性
- **速度 vs 质量**：贪婪最快，Beam Search 最慢
- **一致性 vs 创造性**：重复惩罚增加变化，但可能降低连贯性
`
    },
    {
      id: "adv-06-05-pagedattention",
      title: "6.4 Paged Attention",
      file: "大模型教程/06-模型推理优化/04-PagedAttention.md",
      difficulty: "中级-高级",
      duration: "0.5h",
      week: 3,
      phase: 3,
      keywords: ["Paged", "Attention", "LLM"],
      content: `# 6.4 Paged Attention

**Paged Attention** 是 vLLM 提出的核心技术，借鉴操作系统的虚拟内存管理，将 KV Cache 分成固定大小的“页”进行管理。这一技术解决了 KV Cache 的内存碎片问题，大幅提升了显存利用率和系统吞吐量。

想象一座图书馆的书架管理。传统方式是给每本书预留一整排书架，即使只用了一半位置，剩下的也不允许其他书放入。Paged Attention 则把书架分成固定大小的格子，每本书可分散存放在不同格子里，用一张索引卡记录「哪一章在哪个格子」——空间利用率大幅提升，不再有空置浪费。

## 6.4.1 KV Cache 管理的挑战

### 传统方法的问题

回顾传统的 KV Cache 管理：

**预分配**：按最大序列长度 $L_{\\max}$ 为每个请求预分配 KV Cache。

问题：
- 大多数请求远不及 $L_{\\max}$，造成严重浪费
- 设 $L_{\\max} = 2048$，平均实际长度 512，浪费率 75%

这就像酒店给每位客人都预留一整层楼，即使大多数人只用了一个房间。

**动态分配**：按实际长度分配连续内存。

问题：
- 不同请求长度不同，释放后留下碎片
- 碎片导致无法容纳新请求，即使总空闲内存足够

### 碎片示例

\`\`\`text
时刻 T1: |---Req1(1024)---|---Req2(512)---|---Req3(1024)---|---Free---|
时刻 T2: |---Req1(1024)---|-----Free-----|---Req3(1024)---|---Free---|
                          ^Req2 结束
时刻 T3: 新请求 Req4 需要 1024，但最大连续空闲只有 512，无法分配
\`\`\`

即使总空闲内存足够（512 + 剩余 Free），也因碎片无法使用——好比停车场里很多空位全是零散的半个车位，大车根本停不进去。

### 显存利用率

研究表明，传统方法的有效显存利用率仅 20–40%，大量显存被预分配而未使用，或因碎片而无法利用。

## 6.4.2 Paged Attention 原理

### 核心思想

**Paged Attention** 将 KV Cache 划分为固定大小的**块**（block / page），类似操作系统的分页内存：

1. 物理内存（显存）被划分为等大小的物理页
2. 每个请求的 KV Cache 由多个页组成，不必连续
3. 用页表（page table）记录虚拟页到物理页的映射

回到图书馆的例子：物理页就是书架上的格子，页表就是索引卡。一本书的各章节无需放在连续格子里，只要索引卡记录清楚「第 3 章在 A 区第 7 格，第 4 章在 C 区第 2 格」，就能随时找到。

\`\`\`mermaid
graph TD
    A[逻辑KV序列] --> B[逻辑块 0]
    A --> C[逻辑块 1]
    A --> D[逻辑块 2]
    B -->|页表映射| E[物理块 7]
    C -->|页表映射| F[物理块 2]
    D -->|页表映射| G[物理块 15]
    E --> H[显存]
    F --> H
    G --> H
\`\`\`

### 块的定义

一个**块**（block）包含固定数量 $B$ 个 token 的 KV 向量：

$$\\text{Block size} = B \\times H \\times d_k \\times 2 \\text{ (K 和 V)}$$

其中：
- $B$ 为块内 token 数（典型值 16），即每个物理页存储 $B$ 个连续 token 的 KV
- $H$ 为注意力头数
- $d_k$ 为每个头的维度
- 因子 2 表示 K 和 V 各占一份

典型的 $B = 16$。例如 LLaMA-7B（$H=32$，$d_k=128$，FP16），每块占用 $16 \\times 32 \\times 128 \\times 2 \\times 2 = 262{,}144 \\text{ bytes} = 256$ KB。

### 地址映射

每个请求维护一个**块表**（block table）：

\`\`\`text
请求 1 的块表: [物理块 7, 物理块 2, 物理块 15, ...]
请求 2 的块表: [物理块 3, 物理块 9, ...]
\`\`\`

访问第 $t$ 个 token 的 KV：
1. 计算逻辑块号：$b = \\lfloor t / B \\rfloor$
2. 查块表得物理块号
3. 计算块内偏移：$o = t \\mod B$

### 动态增长

请求生成新 token 时：
1. 若当前块未满，直接写入
2. 若当前块已满，分配新的物理块，加入块表

无需预分配，内存精确使用——就像在笔记本上写字，写满一页再翻下一页，而非一开始就准备 100 页空白纸。

## 6.4.3 实现细节

### 物理内存管理

维护一个**空闲块列表**（free block list）：

- 初始：所有物理块都在空闲列表
- 分配：从空闲列表取出块
- 释放：请求结束后，归还块到空闲列表

与操作系统的页框分配完全类似。

### 注意力计算

Paged Attention 的注意力计算需要处理非连续的 KV：

\`\`\`python
def paged_attention(query, key_cache, value_cache, block_tables, context_lens):
    # query: [batch, 1, heads, head_dim]
    # key_cache: [num_blocks, block_size, heads, head_dim]
    # block_tables: [batch, max_blocks]
    
    outputs = []
    for i in range(batch):
        # 收集该请求的所有 KV 块
        blocks = block_tables[i, :num_blocks_for_request_i]
        keys = key_cache[blocks].reshape(-1, heads, head_dim)  # 拼接
        values = value_cache[blocks].reshape(-1, heads, head_dim)
        
        # 标准注意力计算
        attn = softmax(query[i] @ keys.T / sqrt(d)) @ values
        outputs.append(attn)
    return stack(outputs)
\`\`\`

实际实现使用 CUDA kernel 优化，避免显式拼接。

### vLLM 的 Paged Attention Kernel

vLLM 实现了高效的 Paged Attention CUDA kernel：

1. **分块加载**：按块加载 KV，无需连续内存
2. **融合计算**：注意力计算和 KV 读取融合
3. **向量化**：利用 GPU 的向量指令

相比朴素实现有显著加速。

## 6.4.4 Copy-on-Write 与并行采样

### 并行采样的挑战

Beam Search 或并行采样需要从同一前缀生成多个分支。传统方法：

1. 复制整个 KV Cache（显存翻倍）
2. 或重新 Prefill（计算翻倍）

### Copy-on-Write

**Copy-on-Write**（CoW）借鉴自操作系统，理解起来很直觉——假设你和室友合看一套笔记，只要两人都只是「读」，共享一份就够了；只有当其中一人要「写」（修改）时，才需要复印被修改的那一页：

1. 分支时，新请求共享原请求的块（只复制块表）
2. 当某个分支写入已共享的块时，才真正复制该块

示例：
\`\`\`text
原请求: [块1, 块2, 块3]
分支后:
  请求A: [块1, 块2, 块3] (共享)
  请求B: [块1, 块2, 块3] (共享)
  
请求A 生成新 token，写入块3:
  请求A: [块1, 块2, 块3'] (块3' 是块3 的副本)
  请求B: [块1, 块2, 块3]  (保持原块3)
\`\`\`

\`\`\`mermaid
graph TD
    A[原始请求] --> B["块表: [块1, 块2, 块3]"]
    B --> C[分支 A]
    B --> D[分支 B]
    C --> E["共享块1,2 + 块3'(副本)"]
    D --> F["共享块1,2 + 块3(原始)"]
    E -.->|写时复制| G[仅复制被修改的块]
\`\`\`

### 引用计数

每个物理块维护**引用计数**：

- 分配时：引用计数 = 1
- 共享时：引用计数 += 1
- 释放时：引用计数 -= 1；若为 0，归还空闲列表

CoW 使 Beam Search 的显存开销从 $O(k \\cdot n)$ 降为 $O(n + k \\cdot \\Delta)$。

其中：
- $k$ 为 Beam 宽度（分支数）
- $n$ 为共享前缀的序列长度
- $\\Delta$ 为每个分支在共享前缀之后新增的平均 token 数

从实际意义来看，共享前缀只存一份，只有真正“分叉”的新增块才需复制，显存节省显著。

## 6.4.5 Prefix Caching

### 共享前缀

多个请求可能有相同的前缀：

- 系统提示（System Prompt）
- Few-shot 示例
- 多轮对话的历史

为每个请求独立存储前缀是浪费。

### 基于 Paged Attention 的 Prefix Caching

利用 Paged Attention 的分页特性：

1. 计算前缀的哈希值
2. 若缓存命中，新请求直接引用已有的块
3. 新请求只需分配后续 token 的块

\`\`\`text
前缀 "You are a helpful assistant..." 的块: [块10, 块11, 块12]

请求 A: [块10, 块11, 块12, 块20, 块21] (共享前缀，独有后缀)
请求 B: [块10, 块11, 块12, 块30]       (共享前缀，独有后缀)
\`\`\`

### 自动 Prefix Caching

vLLM 支持自动检测可共享的前缀：

1. 对 KV 块计算内容哈希
2. 维护哈希到物理块的映射
3. 新请求的 Prefill 可以跳过已缓存的部分

这对有大量相似请求的场景（如 chatbot）非常有效。

## 6.4.6 性能分析

### 显存利用率提升

Paged Attention 将显存利用率从 20–40% 提升到接近 100%（仅最后一个未填满的块有浪费）——从「给每本书预留整排书架」变成了「按需分配格子」。

设块大小 $B = 16$，最坏情况每个请求浪费 15 个 token 的空间，浪费率：

$$\\text{浪费} < \\frac{B - 1}{\\text{平均序列长度}}$$

其中 $B$ 为块大小（token 数）。最坏情况下每个请求的最后一个块浪费 $B-1$ 个位置。

对于平均长度 512 的请求，浪费 < 3%——相比传统预分配方法 20–40% 的浪费率，提升巨大。

### 吞吐量提升

更高的显存利用率 → 更大的批处理 → 更高的吞吐量。

vLLM 论文报告，相比 HuggingFace Transformers：

- 吞吐量提升 2-4x
- 可同时服务的请求数增加 10-20x

### 延迟影响

Paged Attention 引入了页表查询和非连续内存访问的开销，但：

1. 精心优化的 kernel 使开销很小
2. 更高的批处理效率弥补了开销

整体延迟与传统方法相当或更好。

## 6.4.7 与其他技术的结合

### 与 Continuous Batching

Paged Attention 天然支持 Continuous Batching：

- 新请求加入：分配新块
- 请求结束：释放块
- 无需等待批内所有请求结束

### 与量化

KV Cache 量化（INT8/INT4）与 Paged Attention 正交：

- 块内数据按量化格式存储
- 页表管理方式不变

两者结合可以进一步降低显存占用。

### 与模型并行

在 Tensor Parallel 下，每个 GPU 管理自己的 KV Cache 部分。Paged Attention 的分页策略可以独立应用于每个 GPU。

在 Pipeline Parallel 下，KV Cache 可以在 stage 之间传递，Paged Attention 的块可以高效序列化/反序列化。
`
    },
    {
      id: "adv-06-06-continuousbatching",
      title: "6.5 Continuous Batching",
      file: "大模型教程/06-模型推理优化/05-ContinuousBatching.md",
      difficulty: "中级-高级",
      duration: "0.5h",
      week: 3,
      phase: 3,
      keywords: ["Continuous", "Batching", "LLM"],
      content: `# 6.5 Continuous Batching

**Continuous Batching**（连续批处理）是 LLM 推理系统的核心调度技术。传统的静态批处理必须等待批内所有请求完成才能开始新批次，导致严重的资源浪费。Continuous Batching 允许请求动态加入和离开批次，大幅提升系统吞吐量。

想象机场安检的场景。传统的静态批处理就像「分批放行」：等一组 10 人全部通过安检后，才放下一组 10 人进入。如果第 1 个人只背了个小包，30 秒就过了，但第 8 个人托运了 3 个行李箱，需要 5 分钟——所有人都得傻等。而 Continuous Batching 就像现实中的安检通道：前一个人一走，后一个人立刻补上，通道始终保持满载运行。

\`\`\`mermaid
graph TD
    subgraph 静态批处理
        S1[收集B个请求] --> S2[组成批次]
        S2 --> S3[所有请求Decode]
        S3 --> S4[等待最慢的完成]
        S4 --> S5[返回结果]
        S5 --> S1
    end
    subgraph Continuous Batching
        C1[请求到达] --> C2[动态加入批次]
        C2 --> C3[生成token]
        C3 --> C4{某请求完成?}
        C4 -->|是| C5[移出已完成请求]
        C5 --> C6[新请求补入]
        C6 --> C3
        C4 -->|否| C3
    end
\`\`\`

## 6.5.1 静态批处理的问题

### 传统流程

静态批处理（Static Batching）的流程：

1. 收集 $B$ 个请求组成一个批次
2. Prefill 所有请求
3. Decode 直到**所有**请求结束
4. 返回结果，开始下一批

### 效率问题

**等待浪费**：批内请求的输出长度参差不齐，短请求先结束却必须等最长的请求完成——如同团建活动里跑最快的人必须在终点等最慢的人到齐才能开始下一环。

示例：
\`\`\`text
请求 1: 输出 50 tokens，耗时 5s
请求 2: 输出 500 tokens，耗时 50s
请求 3: 输出 100 tokens，耗时 10s

静态批处理：必须等 50s，请求 1、3 的 GPU 利用率极低
\`\`\`

**Padding 浪费**：长度对齐需要 padding，填充部分产生无效的注意力计算开销。

**延迟尖峰**：批次边界造成等待，新请求的延迟取决于批内最慢的请求。

### 资源利用率

假设批内请求的输出长度均匀分布在 $[L_{\\min}, L_{\\max}]$，有效利用率：

$$\\text{利用率} = \\frac{\\text{平均长度}}{\\text{最大长度}} = \\frac{(L_{\\min} + L_{\\max})/2}{L_{\\max}}$$

其中：
- $L_{\\min}$、$L_{\\max}$ 分别为批内请求输出长度的最小值和最大值
- 假设输出长度在 $[L_{\\min}, L_{\\max}]$ 上均匀分布
- “利用率”度量的是 GPU 有效计算时间占总时间的比例——短请求先完成后空等的时间均为浪费

若 $L_{\\min} = 10$，$L_{\\max} = 500$，利用率仅 $(10+500)/(2 \\times 500) = 51\\%$——接近一半的 GPU 时间被浪费在空等上。

## 6.5.2 Continuous Batching 原理

### 核心思想

**Continuous Batching**（也称 Iteration-Level Scheduling）在每个 Decode 迭代后重新评估批次组成：

- 已完成的请求立即移出
- 新到达的请求立即加入
- 批次大小动态变化

### 调度流程

\`\`\`text
迭代 1: [Req1, Req2, Req3] → 生成 token → Req1 结束
迭代 2: [Req2, Req3, Req4] → 加入新请求 Req4，生成 token
迭代 3: [Req2, Req3, Req4] → 生成 token → Req3 结束
迭代 4: [Req2, Req4, Req5] → 加入 Req5，生成 token
...
\`\`\`

没有明确的“批次边界”，请求流水式处理——正如机场安检通道的工作方式，不存在「第一批」「第二批」的划分，旅客的流动是连续的。

### 优势

1. **无等待**：请求完成即返回，无需等待同批其他请求
2. **高利用率**：GPU 始终满负载运行
3. **低延迟**：新请求可立即加入，无需等待批次结束
4. **灵活调度**：可优先处理紧急请求

## 6.5.3 Prefill 与 Decode 的调度

### 混合批处理

Continuous Batching 需要处理两类请求：

- **Prefill 请求**：新到达，需要处理 prompt
- **Decode 请求**：正在生成中

两者计算特性不同：Prefill 是计算密集型，Decode 是内存密集型。

### 调度策略

**串行策略**：先完成所有 Prefill，再 Decode。

- 简单，但可能饿死 Decode 请求

**交错策略**：每几个迭代做一次 Prefill。

- 平衡延迟和吞吐

**分离策略**：Prefill 和 Decode 用不同的 GPU。

- 最优利用率，但增加复杂度

### Chunked Prefill 与调度

结合 Chunked Prefill，可以将长 Prefill 分块，与 Decode 请求混合：

\`\`\`text
迭代 1: [Decode: Req1, Req2] + [Prefill Chunk: Req3_part1]
迭代 2: [Decode: Req1, Req2] + [Prefill Chunk: Req3_part2]
迭代 3: [Decode: Req1, Req2, Req3] → Req3 Prefill 完成，加入 Decode
\`\`\`

这避免了长 Prefill 阻塞 Decode。

## 6.5.4 实现挑战

### KV Cache 管理

Continuous Batching 的 KV Cache 管理更复杂：

- 请求动态加入/离开，KV Cache 需要动态分配/释放
- 不同请求的 KV Cache 长度不同

**Paged Attention** 是理想的解决方案：分页管理天然支持动态分配。

### 变长序列处理

批内请求长度不同，如何高效计算？

**Padding**：填充到最长，简单但浪费。

**Packed Attention**：将多个短序列拼接成一个长序列，用注意力掩码区分。

**Ragged Tensor**：使用不规则张量，避免 padding。

vLLM 等系统使用定制的 kernel 处理变长序列，避免 padding 开销。

### 内存碎片

请求频繁加入/离开可能导致显存碎片。Paged Attention 的分页机制有效缓解了这一问题。

## 6.5.5 调度算法

### First-Come-First-Served (FCFS)

最简单的策略：按到达顺序处理。

- 公平，但可能延迟长请求

### Shortest-Job-First (SJF)

优先处理预计最快完成的请求。

- 最小化平均延迟
- 需要预测输出长度（不准确）
- 可能饿死长请求

### 优先级调度

根据请求优先级调度：

- 付费用户 > 免费用户
- 交互式 > 批处理
- 紧急 > 普通

### 公平调度

保证所有请求获得公平的资源份额：

$$\\text{Fair share} = \\frac{\\text{总资源}}{\\text{活跃请求数}}$$

其中“总资源”指 GPU 显存和计算时间，“活跃请求数”指当前正在处理的请求数量。已获得较多资源的请求被降低优先级，确保每个请求获得大致等量的服务时间。

### vLLM 的调度

vLLM 使用**FCFS + 抢占**策略：

1. 默认 FCFS
2. 当显存不足时，抢占最后加入的请求（暂停并 swap out）
3. 显存空闲时恢复被抢占的请求

## 6.5.6 Preemption 与 Swap

### 抢占的必要性

当并发请求过多，KV Cache 显存不足时，需要**抢占**（Preemption）部分请求。这就像机场安检通道突然拥挤时，不得不让部分旅客暂时回到候机区等待，等通道空出来再继续。

\`\`\`mermaid
graph TD
    A[显存不足] --> B{抢占策略}
    B --> C[丢弃KV Cache]
    B --> D[Swap到CPU]
    B --> E[重新计算]
    C --> F[之后重Prefill]
    D --> G[显存空闲时换回]
    E --> H[保存token后重Prefill]
\`\`\`

### 抢占策略

**丢弃**：丢弃被抢占请求的 KV Cache，之后重新 Prefill。

- 简单，但浪费已做的计算

**Swap**：将 KV Cache 换出到 CPU 内存，之后再换回——类似把行李先存到候机区寄存处，有位置后取回继续。

- 保留进度，但增加 I/O 开销

**Recompute**：只保存 prompt 和已生成的 token，被抢占后重新 Prefill。

- 中间方案，适合 Prefill 开销较小的情况

### vLLM 的 Swap 机制

vLLM 支持 KV Cache 的 GPU-CPU swap：

1. 显存不足时，选择最后进入的请求
2. 将其 KV Cache 异步拷贝到 CPU
3. 释放 GPU 上的块
4. 显存空闲时，异步拷回并恢复

Paged Attention 使 swap 可以按块进行，更加灵活。

## 6.5.7 性能优化

### 批大小选择

Continuous Batching 的有效批大小动态变化。目标是：

- 最大化 GPU 利用率
- 不超出显存限制
- 保持合理延迟

通常设置一个最大批大小，由调度器动态调整。

### Prefill 优先级

Prefill 会影响正在 Decode 的请求的延迟。策略：

- **立即 Prefill**：新请求立即处理，可能增加 Decode 延迟
- **延迟 Prefill**：积累请求后批量 Prefill，减少中断
- **Chunked Prefill**：分块处理，平滑影响

### 负载均衡

多 GPU 部署时，需要将请求均匀分配：

- **轮询**：简单但不考虑负载
- **最少连接**：分配给当前请求最少的 GPU
- **加权**：考虑 GPU 能力差异

### 监控指标

- **队列深度**：待处理请求数，反映系统负载
- **延迟分布**：P50、P95、P99 延迟
- **吞吐量**：每秒处理的 token 数
- **抢占率**：被抢占的请求比例，反映资源压力

## 6.5.8 系统实现

### vLLM

vLLM 是 Continuous Batching + Paged Attention 的标杆实现：

- Python API + C++/CUDA kernel
- 支持多种模型（LLaMA、Mistral、Qwen 等）
- 集成 Ray 实现分布式推理

### TensorRT-LLM

NVIDIA 的 TensorRT-LLM 提供类似功能：

- 高度优化的 CUDA kernel
- 与 Triton Inference Server 集成
- 支持多 GPU 并行

### SGLang

SGLang 在 Continuous Batching 基础上优化了编程接口：

- RadixAttention：更高效的 Prefix Caching
- 结构化生成优化
- 控制流支持
`
    },
    {
      id: "adv-07-01-intro",
      title: "7.1 第七章 模型并行训练与优化",
      file: "大模型教程/07-模型并行训练与优化/00-引言.md",
      difficulty: "中级-高级",
      duration: "0.5h",
      week: 0,
      phase: 0,
      keywords: ["第七章", "模型并行训练与优化", "GPU", "LLaMA", "FP32", "FP16"],
      content: `# 第七章 模型并行训练与优化

大语言模型的规模已从十亿参数跃升至万亿参数。单张 GPU 显存不足以容纳模型参数，单机算力不足以在合理时间内完成训练。**分布式训练**成为必然选择。本章系统介绍大模型训练中的并行策略和优化技术。

## 规模的挑战

以 LLaMA-70B 为例：

- 参数量：70B
- FP32 参数显存：280GB
- FP16 参数显存：140GB
- Adam 优化器状态（FP32）：280GB × 2 = 560GB
- 梯度（FP16）：140GB
- **总计**：约 1TB

单卡 A100（80GB）远远不够。即使使用 FP16/BF16 混合精度，仍需多卡协同。

## 并行维度

大模型训练涉及多个并行维度：

| 并行类型 | 英文 | 切分对象 | 代表框架 |
|----------|------|----------|----------|
| 数据并行 | Data Parallel (DP) | 数据批次 | PyTorch DDP |
| 全切片数据并行 | Fully Sharded DP (FSDP) | 参数 + 梯度 + 优化器 | PyTorch FSDP, DeepSpeed ZeRO |
| 张量并行 | Tensor Parallel (TP) | 层内权重矩阵 | Megatron-LM |
| 流水线并行 | Pipeline Parallel (PP) | 层间切分 | GPipe, PipeDream |
| 专家并行 | Expert Parallel (EP) | MoE 专家 | DeepSpeed, Megatron |
| 序列并行 | Sequence Parallel (SP) | 序列维度 | Megatron-LM |
| 上下文并行 | Context Parallel (CP) | 长序列切分 | Ring Attention |

实际训练通常组合多种并行，称为**多维并行**（如 3D 并行、5D 并行）。

## 通信原语

分布式训练的核心是**集合通信**（Collective Communication）：

| 原语 | 功能 | 典型用途 |
|------|------|----------|
| Broadcast | 一对多广播 | 参数初始化 |
| Reduce | 多对一聚合 | 梯度聚合 |
| AllReduce | 多对多聚合 | 数据并行梯度同步 |
| AllGather | 收集所有分片 | FSDP 参数重建 |
| ReduceScatter | 聚合并分发 | FSDP 梯度分片 |
| AllToAll | 全交换 | 专家并行 |

通信效率往往决定了分布式训练的扩展性。

## 章节结构

本章从底层优化技术出发，逐步构建完整的分布式训练体系：

1. **Flash Attention**：算子级优化，减少显存访问
2. **Triton 与算子融合**：自定义高效算子
3. **数据并行**：DDP 与 FSDP，显存与通信的权衡
4. **张量并行**：层内切分，减少单卡显存
5. **流水线并行**：层间切分，平衡计算与通信
6. **专家并行**：MoE 模型的专用并行策略
7. **序列与上下文并行**：处理超长序列
8. **多维并行**：组合多种策略的 5D 并行

## 符号约定

| 符号 | 含义 |
|------|------|
| $N$ | 数据并行度 |
| $T$ | 张量并行度 |
| $P$ | 流水线并行度 |
| $E$ | 专家并行度 |
| $S$ | 序列并行度 |
| $B$ | 全局批大小 |
| $b$ | 微批大小 |
`
    },
    {
      id: "adv-07-02-flashattention",
      title: "7.1 Flash Attention",
      file: "大模型教程/07-模型并行训练与优化/01-FlashAttention.md",
      difficulty: "中级-高级",
      duration: "0.5h",
      week: 0,
      phase: 0,
      keywords: ["Flash", "Attention", "Dao"],
      content: `# 7.1 Flash Attention

**Flash Attention** 是 Dao et al.（2022）提出的高效注意力算法，通过精心设计的分块计算和内存访问模式，在不牺牲精度的情况下，大幅减少显存占用并提升计算速度。Flash Attention 已成为现代 LLM 训练和推理的标准组件。

假设你要读一本 500 页的书，传统的做法是把整本书全部摆在桌子上（注意力矩阵存入显存），但桌子太小放不下。Flash Attention 的思路是：每次只从书架取几页到桌上读，读完做好笔记就放回去，再取下几页。桌子（SRAM）虽小但速度快，书架（HBM）虽大但取书慢——关键是尽量减少走向书架的次数。

## 7.1.1 标准注意力的瓶颈

### 计算过程

标准自注意力的计算：

$$\\mathbf{S} = \\mathbf{Q}\\mathbf{K}^\\top / \\sqrt{d_k}$$
$$\\mathbf{P} = \\text{softmax}(\\mathbf{S})$$
$$\\mathbf{O} = \\mathbf{P}\\mathbf{V}$$

其中：
- $\\mathbf{Q}, \\mathbf{K}, \\mathbf{V} \\in \\mathbb{R}^{N \\times d}$，$N$ 为序列长度，$d$ 为每个注意力头的维度
- $\\mathbf{S} \\in \\mathbb{R}^{N \\times N}$ 为注意力分数矩阵
- $\\mathbf{P} \\in \\mathbb{R}^{N \\times N}$ 为 softmax 归一化后的注意力权重
- $\\mathbf{O} \\in \\mathbb{R}^{N \\times d}$ 为最终输出

### 显存问题

中间结果 $\\mathbf{S}, \\mathbf{P} \\in \\mathbb{R}^{N \\times N}$，显存占用 $O(N^2)$。

对于 $N = 8192$，$\\mathbf{S}$ 和 $\\mathbf{P}$ 各占 $8192^2 \\times 4 \\approx 256$ MB（FP32）或 $128$ MB（FP16）。在多层、多头的情况下（例如 32 层 $\\times$ 32 头），总额外显存达到数百 GB——这正是标准注意力的核心瓶颈。

### 内存带宽瓶颈

GPU 的计算能力远超内存带宽。以 A100 为例：

- 计算能力：312 TFLOPS（FP16 Tensor Core）
- 显存带宽：2 TB/s
- 算术强度阈值：$312 \\text{ TFLOPS} / 2 \\text{ TB/s} = 156$ FLOPS/byte

其中算术强度阈值表示：当一个算子的“每字节计算次数”低于该值时，它就是内存带宽受限的；GPU 花在“搬运数据”上的时间多于“计算”。

标准注意力的算术强度远低于该阈值——大量时间花在读写中间结果 $\\mathbf{S}$、$\\mathbf{P}$ 上，而非实际计算。就像一位算力惊人的数学家，大部分时间不是在计算，而是在翻找和抄写草稿纸。

## 7.1.2 Flash Attention 原理

### 核心思想

Flash Attention 的核心思想是**分块计算**（Tiling）——回到读书的场景，就是「每次只取几页到桌上，读完放回再取」：

1. 将 $\\mathbf{Q}, \\mathbf{K}, \\mathbf{V}$ 分成小块
2. 每次只加载一块到 GPU 的高速缓存（SRAM，相当于桌面）
3. 在 SRAM 中完成该块的全部计算
4. 将结果增量写回 HBM（显存，相当于书架）
5. **不存储完整的** $\\mathbf{S}$ **和** $\\mathbf{P}$——省去了「把整本书摆在桌上」的开销

\`\`\`mermaid
graph TD
    A[分块Q/K/V] --> B[从 HBM 加载块到 SRAM]
    B --> C[在 SRAM 中计算注意力]
    C --> D[在线 Softmax 更新]
    D --> E[累积输出写回 HBM]
    E --> F{还有下一块?}
    F -->|是| B
    F -->|否| G[最终输出 O]
\`\`\`

### 在线 Softmax

分块计算 softmax 的难点：softmax 需要全局归一化，但我们不想存储完整的 $\\mathbf{S}$。

这就像考试时排名次——你需要知道所有人的分数才能确定每个人的百分位排名。但如果学生一个个进来报分，你能不能「边收分边更新排名」而不用等所有人都到齐？在线 Softmax 算法正是这个思路。

**在线 Softmax**（Online Softmax）算法解决了这个问题。维护两个统计量：

- $m$：当前最大值
- $l$：当前指数和

对于新的一块 $\\mathbf{S}_{\\text{new}}$：

1. 计算新块的最大值 $m_{\\text{new}}$
2. 更新全局最大值 $m = \\max(m, m_{\\text{new}})$
3. 用 $m$ 校正之前的指数和
4. 累加新块的指数和

这样，softmax 可以分块计算，无需存储完整的 $\\mathbf{S}$。

### 分块计算流程

设块大小为 $B_r$（Query 块）和 $B_c$（Key/Value 块）。

外循环遍历 Key/Value 块，内循环遍历 Query 块：

\`\`\`
for j in range(0, N, B_c):  # Key/Value 块
    K_j, V_j = load(K[j:j+B_c], V[j:j+B_c])  # 从 HBM 加载到 SRAM
    
    for i in range(0, N, B_r):  # Query 块
        Q_i = load(Q[i:i+B_r])
        O_i, m_i, l_i = load(O[i:i+B_r], m[i:i+B_r], l[i:i+B_r])
        
        # 在 SRAM 中计算
        S_ij = Q_i @ K_j.T / sqrt(d)
        m_ij = max(S_ij, dim=-1)
        P_ij = exp(S_ij - m_ij)
        l_ij = sum(P_ij, dim=-1)
        
        # 更新 O, m, l（在线 softmax）
        m_new = max(m_i, m_ij)
        l_new = exp(m_i - m_new) * l_i + exp(m_ij - m_new) * l_ij
        O_new = (exp(m_i - m_new) * l_i * O_i + exp(m_ij - m_new) * P_ij @ V_j) / l_new
        
        # 写回 HBM
        store(O[i:i+B_r], O_new)
        store(m[i:i+B_r], m_new)
        store(l[i:i+B_r], l_new)
\`\`\`

### 复杂度分析

**显存**：

- 标准注意力：$O(N^2)$（存储 $\\mathbf{S}$ 和 $\\mathbf{P}$，每个均为 $N \\times N$ 矩阵）
- Flash Attention：$O(N)$（只存储输出 $\\mathbf{O} \\in \\mathbb{R}^{N \\times d}$ 以及每行的统计量 $m, l \\in \\mathbb{R}^{N}$）

拆开来看：标准注意力需要存储完整的 $N \\times N$ 中间矩阵，而 Flash Attention 通过分块计算和在线 Softmax，将显存从平方级降到线性级——这是支撑长序列训练的关键。

**HBM 访问**：

- 标准注意力：$O(N^2 d + N^2)$（读写 $\\mathbf{Q}, \\mathbf{K}, \\mathbf{V}, \\mathbf{S}, \\mathbf{P}, \\mathbf{O}$）
- Flash Attention：$O(N^2 d^2 / M)$

其中：
- $M$ 为 GPU SRAM（高速缓存）大小（A100 为 192 KB / SM）
- 分母中的 $M$ 反映了“桌面越大，走向书架的次数越少”这一直觉
- 当 $M = \\Theta(Nd)$ 时，HBM 访问量为 $O(Nd)$，变为线性，达到理论下界

当 $M$ 足够大时，Flash Attention 的 HBM 访问量显著减少。

\`\`\`mermaid
graph LR
    subgraph 标准注意力
        SA1[Q,K,V] --> SA2["存储S: O(N²)"]
        SA2 --> SA3["存储P: O(N²)"]
        SA3 --> SA4[输出 O]
    end
    subgraph Flash Attention
        FA1[Q,K,V] --> FA2[分块加载到SRAM]
        FA2 --> FA3[计算+在线Softmax]
        FA3 --> FA4["只存储O,m,l: O(N)"]
    end
\`\`\`

## 7.1.3 Flash Attention 2

### 改进

**Flash Attention 2**（Dao, 2023）在原版基础上进一步优化：

1. **减少非矩阵乘法操作**：将更多计算表示为矩阵乘法，充分利用 Tensor Core
2. **优化 warp 调度**：在 Query 和 Key/Value 块之间更好地平衡并行
3. **支持更大的头维度**：优化 $d = 128, 256$ 等较大头维度

### 性能提升

相比 Flash Attention 1，Flash Attention 2 在 A100 上：

- 前向传播快约 2x
- 反向传播快约 1.5-2x
- 达到理论 FLOPS 的 50-73%

### 反向传播

Flash Attention 的反向传播也需要特殊处理。由于不存储 $\\mathbf{S}$ 和 $\\mathbf{P}$，需要在反向时重新计算（recomputation）。

这看似「丢了草稿纸还得重新算」，但省下的显存使得可以使用更大批次或更长序列，总体上是划算的——用计算时间换显存空间，而显存正是瓶颈所在。

## 7.1.4 因果掩码与变长序列

### 因果掩码

语言模型使用因果注意力，需要下三角掩码。Flash Attention 原生支持：

- 只计算下三角部分
- 上三角部分不存储、不计算

这进一步减少了计算量和显存。

### 变长序列

批内序列长度不同时，标准实现需要 padding。Flash Attention 支持**变长序列**：

1. 将多个序列拼接成一个长序列
2. 使用累积序列长度数组标记边界
3. 注意力计算自动处理边界

这避免了 padding 的浪费。

## 7.1.5 Flash Attention 3

### 新硬件优化

**Flash Attention 3**（2024）针对 Hopper 架构（H100）优化：

1. **异步执行**：利用 Hopper 的异步执行能力，重叠计算和数据传输
2. **低精度计算**：支持 FP8，利用 Hopper 的 FP8 Tensor Core
3. **Warp 专用化**：不同 warp 执行不同任务（生产者-消费者模式）

### 性能

在 H100 上，Flash Attention 3 达到：

- 前向传播：达到 740 TFLOPS（理论峰值的 75%）
- 显著优于 Flash Attention 2

## 7.1.6 应用与集成

### 框架集成

Flash Attention 已集成到主流框架：

- **PyTorch 2.0+**：\`torch.nn.functional.scaled_dot_product_attention\` 自动使用
- **Transformers**：指定 \`attn_implementation="flash_attention_2"\`
- **vLLM / TensorRT-LLM**：默认启用

### 使用示例

\`\`\`python
# PyTorch 2.0+
import torch.nn.functional as F

# 自动选择最优实现（Flash Attention / Memory Efficient / Math）
output = F.scaled_dot_product_attention(
    query, key, value,
    attn_mask=None,
    dropout_p=0.0,
    is_causal=True  # 因果掩码
)

# Transformers
from transformers import AutoModelForCausalLM

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-7b-hf",
    torch_dtype=torch.bfloat16,
    attn_implementation="flash_attention_2"
)
\`\`\`

### 与其他优化的组合

Flash Attention 可以与其他优化技术组合：

- **量化**：与 INT8/FP8 计算结合
- **张量并行**：与 Megatron 风格的 TP 结合
- **KV Cache**：推理时与 KV Cache 结合
- **投机解码**：验证阶段使用 Flash Attention

## 7.1.7 Memory Efficient Attention

### xFormers

在 Flash Attention 之前，**xFormers** 提供了 Memory Efficient Attention，思路类似但实现不同。

xFormers 的优势：
- 更广泛的硬件支持（包括较旧的 GPU）
- 灵活的注意力模式（稀疏、局部等）

Flash Attention 在性能上通常更优，但 xFormers 仍是重要的备选。

### 选择建议

| 场景 | 推荐 |
|------|------|
| 训练（Ampere/Hopper） | Flash Attention 2/3 |
| 推理（通用） | PyTorch SDPA（自动选择） |
| 特殊注意力模式 | xFormers |
| 旧 GPU | xFormers 或 PyTorch Math |
`
    },
    {
      id: "adv-07-03-triton",
      title: "7.2 Triton 优化与算子融合",
      file: "大模型教程/07-模型并行训练与优化/02-Triton优化与算子融合.md",
      difficulty: "中级-高级",
      duration: "0.5h",
      week: 0,
      phase: 0,
      keywords: ["Triton", "优化与算子融合", "OpenAI", "GPU", "Python"],
      content: `# 7.2 Triton 优化与算子融合

**Triton** 是 OpenAI 开发的 GPU 编程语言和编译器，它让开发者能够以接近 Python 的简洁语法编写高效的 GPU 算子。结合**算子融合**（Operator Fusion），Triton 成为大模型优化的利器。

举个生活中的例子：你要做一道菜，需要切菜、炒菜、调味三个步骤。传统做法是每步都把食材从冰箱取出来、处理完再放回冰箱，下一步再取出来——明显荒谬。算子融合就是把这三步合并成一气呵成：食材取出来一次性切、炒、调味，中间不用反复进出冰箱（显存）。

## 7.2.1 GPU 编程的挑战

### CUDA 的复杂性

传统 CUDA 编程需要处理：

- 线程块、线程束（warp）的组织
- 共享内存的分配和同步
- 内存访问模式的优化（合并访问、bank conflict）
- 寄存器分配
- 指令级并行

编写高效的 CUDA kernel 需要深厚的硬件知识，门槛很高。打个比方，CUDA 就像要求你从种菜、养鸡开始全部自己干，而 Triton 给你提供半成品食材——你只需关注怎么烧菜，底层的种菜养鸡由编译器搞定。

### 框架算子的局限

PyTorch 等框架提供了丰富的算子库，但：

1. **Kernel Launch 开销**：每个算子一次 kernel launch，累积开销大
2. **中间结果**：算子之间需要写回显存、再读取
3. **灵活性不足**：框架算子是预定义的，特殊需求难以满足

## 7.2.2 Triton 简介

### 设计理念

Triton 的设计理念是**块级编程**（Block-Level Programming）：

- 程序员以"块"（block）为单位思考，而非单个线程
- 编译器自动处理线程级细节
- 内存访问模式自动优化

### 基本语法

Triton 使用 Python 语法装饰器定义 kernel：

\`\`\`python
import triton
import triton.language as tl

@triton.jit
def add_kernel(
    x_ptr, y_ptr, output_ptr,
    n_elements,
    BLOCK_SIZE: tl.constexpr,
):
    # 每个 program 处理一个 block
    pid = tl.program_id(0)
    
    # 计算该 block 处理的元素范围
    block_start = pid * BLOCK_SIZE
    offsets = block_start + tl.arange(0, BLOCK_SIZE)
    mask = offsets < n_elements
    
    # 加载数据
    x = tl.load(x_ptr + offsets, mask=mask)
    y = tl.load(y_ptr + offsets, mask=mask)
    
    # 计算
    output = x + y
    
    # 存储结果
    tl.store(output_ptr + offsets, output, mask=mask)
\`\`\`

### 编译与执行

Triton kernel 在首次调用时 JIT 编译为 PTX/CUDA：

\`\`\`python
# 启动 kernel
grid = lambda meta: (triton.cdiv(n_elements, meta['BLOCK_SIZE']),)
add_kernel[grid](x, y, output, n_elements, BLOCK_SIZE=1024)
\`\`\`

编译器自动优化内存访问、寄存器分配等。

## 7.2.3 算子融合

### 融合的收益

**算子融合**（Operator Fusion）将多个连续算子合并为一个 kernel，收益显著：

1. **减少 kernel launch**：N 个 launch → 1 个 launch
2. **减少显存访问**：中间结果保持在寄存器/共享内存，不用「放回冰箱再取出」
3. **提高算术强度**：计算/访存比提升

\`\`\`mermaid
graph LR
    subgraph 未融合
        A1[读取x] --> A2["kernel1: x*scale"]
        A2 --> A3[写回显存]
        A3 --> A4[读取y]
        A4 --> A5["kernel2: y+bias"]
        A5 --> A6[写回显存]
        A6 --> A7[读取y]
        A7 --> A8["kernel3: gelu(y)"]
        A8 --> A9[写回显存]
    end
    subgraph 融合后
        B1[读取x] --> B2["单kernel: gelu(x*scale+bias)"]
        B2 --> B3[写回显存]
    end
\`\`\`

### 融合示例

未融合：
\`\`\`python
# 3 次 kernel launch，2 次中间结果写回显存
y = x * scale  # kernel 1
y = y + bias   # kernel 2
y = gelu(y)    # kernel 3
\`\`\`

融合后：
\`\`\`python
@triton.jit
def fused_scale_bias_gelu(x_ptr, scale_ptr, bias_ptr, y_ptr, ...):
    # 一次 kernel 完成全部计算
    x = tl.load(x_ptr + offsets)
    scale = tl.load(scale_ptr + offsets)
    bias = tl.load(bias_ptr + offsets)
    
    y = x * scale + bias
    y = gelu(y)
    
    tl.store(y_ptr + offsets, y)
\`\`\`

### 常见融合模式

| 融合模式 | 原始算子 | 融合后 |
|----------|----------|--------|
| Bias + Activation | Linear → Add → GELU | FusedLinear |
| LayerNorm | Mean → Sub → Var → Div → Scale | FusedLayerNorm |
| Softmax | Max → Sub → Exp → Sum → Div | FusedSoftmax |
| Attention | QK → Softmax → V | FlashAttention |

## 7.2.4 Triton 实战：Fused Softmax

### 标准 Softmax

\`\`\`python
def naive_softmax(x):
    x_max = x.max(dim=-1, keepdim=True).values
    x = x - x_max  # 数值稳定
    exp_x = x.exp()
    return exp_x / exp_x.sum(dim=-1, keepdim=True)
\`\`\`

这需要 4 次 kernel launch，多次显存读写。

### Triton Fused Softmax

\`\`\`python
@triton.jit
def softmax_kernel(
    input_ptr, output_ptr,
    n_cols,
    BLOCK_SIZE: tl.constexpr,
):
    row_idx = tl.program_id(0)
    row_start = row_idx * n_cols
    
    # 加载一行
    col_offsets = tl.arange(0, BLOCK_SIZE)
    mask = col_offsets < n_cols
    row = tl.load(input_ptr + row_start + col_offsets, mask=mask, other=-float('inf'))
    
    # 计算 softmax（在寄存器中完成）
    row_max = tl.max(row, axis=0)
    row = row - row_max
    exp_row = tl.exp(row)
    sum_exp = tl.sum(exp_row, axis=0)
    softmax_row = exp_row / sum_exp
    
    # 存储
    tl.store(output_ptr + row_start + col_offsets, softmax_row, mask=mask)
\`\`\`

一次 kernel 完成全部计算，中间结果不离开寄存器——食材从冰箱取出来之后，切、炒、调味一口气完成，直接装盘。

## 7.2.5 Triton 在大模型中的应用

### Flash Attention

Flash Attention 的 Triton 实现展示了复杂算子的编写能力：

- 分块加载 Q、K、V
- 在线 softmax 计算
- 累积输出结果

Triton 版 Flash Attention 与 CUDA 版性能接近，但代码量少得多。

### RMS Norm

\`\`\`python
@triton.jit
def rms_norm_kernel(x_ptr, weight_ptr, out_ptr, eps, N, BLOCK_SIZE: tl.constexpr):
    row = tl.program_id(0)
    x_row_ptr = x_ptr + row * N
    out_row_ptr = out_ptr + row * N
    
    # 加载并计算
    offsets = tl.arange(0, BLOCK_SIZE)
    mask = offsets < N
    x = tl.load(x_row_ptr + offsets, mask=mask, other=0.0)
    weight = tl.load(weight_ptr + offsets, mask=mask, other=0.0)
    
    # RMS
    x_sq = x * x
    mean_sq = tl.sum(x_sq) / N
    rms = tl.sqrt(mean_sq + eps)
    
    # Normalize
    out = x / rms * weight
    tl.store(out_row_ptr + offsets, out, mask=mask)
\`\`\`

### SwiGLU

\`\`\`python
@triton.jit
def swiglu_kernel(x_ptr, w1_ptr, w2_ptr, out_ptr, ...):
    # 融合 gate 和 up projection
    gate = tl.load(x_ptr + ...) @ tl.load(w1_ptr + ...)
    up = tl.load(x_ptr + ...) @ tl.load(w2_ptr + ...)
    
    # SiLU(gate) * up
    out = (gate * tl.sigmoid(gate)) * up
    tl.store(out_ptr + ..., out)
\`\`\`

## 7.2.6 torch.compile 与算子融合

### 自动融合

PyTorch 2.0 的 \`torch.compile\` 可以自动进行算子融合：

\`\`\`python
@torch.compile
def forward(x):
    x = self.norm(x)
    x = self.linear(x)
    x = F.gelu(x)
    return x
\`\`\`

编译器会自动识别融合机会，生成优化的 kernel。

### TorchInductor

\`torch.compile\` 的默认后端 **TorchInductor** 可以生成 Triton kernel：

1. 将 PyTorch 代码转换为中间表示（IR）
2. 识别融合模式
3. 生成 Triton 代码
4. JIT 编译执行

### 与手写 Triton 的对比

| 维度 | torch.compile | 手写 Triton |
|------|---------------|-------------|
| 开发效率 | 高（自动） | 低（手动） |
| 性能 | 好 | 最优 |
| 灵活性 | 受限 | 完全控制 |
| 调试 | 困难 | 直接 |

对于关键路径（如注意力），手写 Triton 仍有价值；对于常规计算，\`torch.compile\` 足够。

## 7.2.7 实践建议

### 何时使用 Triton

1. **热点算子**：profiling 显示的耗时大户
2. **特殊计算模式**：框架没有提供的融合算子
3. **内存敏感**：显存是瓶颈时，融合可以减少中间结果

### 优化技巧

1. **选择合适的块大小**：通常是 2 的幂，需要调优
2. **利用共享内存**：跨线程复用的数据放入共享内存
3. **避免 bank conflict**：共享内存访问模式要注意
4. **向量化加载**：使用 \`tl.load\` 的向量化功能

### 调试方法

1. **对比基准**：与 PyTorch 实现对比输出
2. **数值稳定性**：检查 inf/nan
3. **性能分析**：使用 \`triton.testing.do_bench\` 计时
4. **CUDA 调试器**：Nsight Compute 分析 kernel

\`\`\`python
# 性能测试
@triton.testing.perf_report(
    triton.testing.Benchmark(
        x_names=['N'],
        x_vals=[2**i for i in range(10, 15)],
        line_arg='provider',
        line_vals=['triton', 'torch'],
        ...
    )
)
def benchmark(N, provider):
    ...
\`\`\`
`
    },
    {
      id: "adv-07-04-sec-03",
      title: "7.3 数据并行",
      file: "大模型教程/07-模型并行训练与优化/03-数据并行.md",
      difficulty: "中级-高级",
      duration: "1h",
      week: 0,
      phase: 0,
      keywords: ["数据并行", "Data", "Parallelism", "DDP", "FSDP", "GPU"],
      content: `# 7.3 数据并行

**数据并行**（Data Parallelism）是最基础的分布式训练策略：将数据批次切分到多个设备，每个设备持有完整的模型副本。本节介绍从简单的 DP 到现代的 DDP 和 FSDP 的演进。

想象一个大厨房里有 8 个厨师，每人手上都有一本完全相同的菜谱（模型副本）。老板把当天 800 份订单平均分给 8 人，每人负责 100 份。大家同时开工，完成后交流心得（梯度平均），统一调整菜谱（参数更新）。

## 7.3.1 数据并行基础

### 原理

假设有 $N$ 个 GPU，全局批大小为 $B$：

1. 将 batch 均分为 $N$ 份，每份大小 $b = B/N$
2. 每个 GPU 用自己的数据计算前向、反向
3. 所有 GPU 的梯度求平均（AllReduce）
4. 各自用平均梯度更新参数

\`\`\`mermaid
graph TD
    A[全局Batch] --> B[分片 1]
    A --> C[分片 2]
    A --> D[分片 N]
    B --> E[GPU 1: 前向+反向]
    C --> F[GPU 2: 前向+反向]
    D --> G[GPU N: 前向+反向]
    E --> H[AllReduce梯度平均]
    F --> H
    G --> H
    H --> I[同步更新参数]
\`\`\`

### 数学表示

设第 $i$ 个 GPU 计算的梯度为 $\\mathbf{g}_i$，全局梯度：

$$\\mathbf{g} = \\frac{1}{N} \\sum_{i=1}^N \\mathbf{g}_i$$

其中：
- $N$ 为 GPU 数量
- $\\mathbf{g}_i$ 为第 $i$ 个 GPU 上计算的局部梯度（基于 $b = B/N$ 个样本）
- $\\mathbf{g}$ 为全局平均梯度，数学上等价于在全局 batch $B$ 上计算的梯度

换句话说，每个厨师独立评判自己负责的 100 份菜，然后取平均意见——结果与一个厨师尝遍 800 份的效果等价。

### 简单 DP（PyTorch DataParallel）

PyTorch 的 \`torch.nn.DataParallel\`（DP）是最简单的实现：

\`\`\`python
model = nn.DataParallel(model)
\`\`\`

问题：
- **单进程多线程**：受 Python GIL 限制
- **GPU 0 瓶颈**：梯度聚合和参数广播都在 GPU 0
- **效率低**：实际训练很少使用

## 7.3.2 DDP：分布式数据并行

### 多进程架构

**DDP**（DistributedDataParallel）采用多进程架构：

- 每个 GPU 一个进程
- 进程间通过 NCCL 通信
- 无 GIL 限制

\`\`\`python
# 初始化进程组
torch.distributed.init_process_group(backend='nccl')

# 包装模型
model = torch.nn.parallel.DistributedDataParallel(
    model.to(rank),
    device_ids=[rank]
)
\`\`\`

### Gradient Bucketing

DDP 的关键优化是**梯度分桶**（Gradient Bucketing）：

1. 将参数按一定大小分成多个"桶"
2. 反向传播时，一个桶的梯度全部计算完成后，立即开始 AllReduce
3. 通信与计算重叠

\`\`\`
时间线：
反向传播: [Layer N] [Layer N-1] [Layer N-2] ...
AllReduce:          [Bucket 1]  [Bucket 2]  ...
\`\`\`

### Ring-AllReduce

DDP 默认使用 **Ring-AllReduce** 算法：

1. 将 $N$ 个 GPU 组成逻辑环
2. 每个 GPU 将数据分成 $N$ 份
3. 第一轮：每个 GPU 向下一个发送一份，同时接收上一个的一份，并累加
4. 经过 $N-1$ 轮，每个 GPU 持有一份完整的部分和
5. 再经过 $N-1$ 轮广播，所有 GPU 持有完整结果

通信量：$2 \\cdot (N-1) / N \\cdot |\\mathbf{g}|$

其中：
- $|\\mathbf{g}|$ 为梯度向量的总字节数（即模型参数量 $P$ $\\times$ 每参数字节数）
- 因子 $(N-1)/N$ 说明每个 GPU 传输的数据量接近于一份完整梯度，与 GPU 数量 $N$ 几乎无关
- 因子 2 来自 Ring-AllReduce 的两个阶段：Reduce-Scatter（$N-1$ 轮求和）和 AllGather（$N-1$ 轮广播）

这意味着 Ring-AllReduce 的通信量与 GPU 数量几乎无关（当 $N$ 较大时 $(N-1)/N \\approx 1$），这是它适合大规模分布式训练的关键原因。

## 7.3.3 DDP 的显存分析

### 显存组成

每个 GPU 需要存储：

| 组件 | 大小（FP16/FP32） |
|------|-------------------|
| 模型参数 | $2P$ / $4P$ |
| 梯度 | $2P$ / $4P$ |
| 优化器状态（Adam） | $8P$（FP32） |
| 激活值 | 与 batch 和模型相关 |

其中：
- $P$ 为模型参数量
- $2P$：FP16 存储（每参数 2 字节），$4P$：FP32 存储（每参数 4 字节）
- Adam 优化器状态包含 FP32 参数副本（$4P$）、一阶矩 $m$（$4P$）、二阶矩 $v$（约 $4P$），共 $\\sim 12P$（当使用混合精度时约简为 $8P$ 字节）

总计：混合精度 + Adam 时每卡约需 $16P$ 字节（不含激活值）。比如 7B 模型，$16 \\times 7 \\times 10^9 \\approx 112$ GB——这解释了为什么 80GB 的 A100 可能都放不下一个 7B 模型的训练状态。

### 显存冗余

**DDP 的问题**：每个 GPU 存储完整的模型、梯度、优化器状态——$N$ 倍冗余。如同 8 个厨师每人都备了一套完整厨具、一本完整笔记、一套完整报表，明明共享一套就够了。

对于 70B 模型，单卡需要 ~1TB 显存，即使有 8 卡也放不下。

## 7.3.4 FSDP：全切片数据并行

### ZeRO 优化

**ZeRO**（Zero Redundancy Optimizer，DeepSpeed）提出了三级显存优化：

| 级别 | 切分内容 | 单卡显存 |
|------|----------|----------|
| ZeRO-1 | 优化器状态 | $4P + 2P + 8P/N$ |
| ZeRO-2 | + 梯度 | $4P + 2P/N + 8P/N$ |
| ZeRO-3 | + 参数 | $4P/N + 2P/N + 8P/N$ |

其中：
- $P$ 为模型参数量
- $N$ 为 GPU 数量
- $4P$ 为 FP32 参数副本（混合精度训练时的主副本），$2P$ 为 FP16 梯度，$8P$ 为 Adam 优化器状态（包含一阶矩 $4P$ + 二阶矩 $4P$）
- ZeRO-1 只切分优化器状态：$8P/N$；参数和梯度仍为完整副本
- ZeRO-2 额外切分梯度：$2P/N$
- ZeRO-3 全部切分：单卡显存降为 $14P/N$，约为原始 DDP 的 $1/N$

用大白话讲：DDP 中每个 GPU 存储完整的参数、梯度、优化器状态（约 $16P$ 字节），$N$ 卡就有 $N$ 倍冗余。ZeRO 通过逐步切分这些状态来消除冗余，代价是计算时需通信收集完整数据。

ZeRO-3 将所有内容切片，单卡显存降为 $1/N$。

\`\`\`mermaid
graph TD
    subgraph "DDP: 完整副本"
        D1[每卡存储全部参数]
        D2[每卡存储全部梯度]
        D3[每卡存储全部优化器]
    end
    subgraph "ZeRO-1: 切分优化器"
        Z1[全部参数] --> Z2[全部梯度]
        Z2 --> Z3[优化器 1/N]
    end
    subgraph "ZeRO-2: +切分梯度"
        Z4[全部参数] --> Z5[梯度 1/N]
        Z5 --> Z6[优化器 1/N]
    end
    subgraph "ZeRO-3/FSDP: 全切分"
        Z7[参数 1/N] --> Z8[梯度 1/N]
        Z8 --> Z9[优化器 1/N]
    end
\`\`\`

### FSDP 原理

**FSDP**（Fully Sharded Data Parallel）是 PyTorch 对 ZeRO-3 的实现。

回到厨房场景：现在 8 个厨师不再每人备齐全套厨具，而是每人只保管八分之一的工具。需要用某把刀时向保管者借一下（AllGather），用完立即归还。每人工作台空间小得多，但也需要更频繁的交流。

**切片存储**：每个 GPU 只存储 $1/N$ 的参数、梯度、优化器状态。

**计算时重建**：需要某层参数时，通过 AllGather 收集完整参数。

**计算后丢弃**：计算完成后，丢弃非本地的参数分片。

### FSDP 训练流程

\`\`\`
前向传播:
  for layer in layers:
    AllGather(layer.params)      # 收集完整参数
    output = layer(input)        # 前向计算
    discard(non_local_params)    # 丢弃非本地参数

反向传播:
  for layer in reversed(layers):
    AllGather(layer.params)      # 收集完整参数
    backward(layer)              # 反向计算
    ReduceScatter(layer.grads)   # 聚合并切片梯度
    discard(non_local_params)    # 丢弃非本地参数
\`\`\`

### 通信开销

FSDP 的通信量增加了（毕竟借工具需要时间）：

- 前向：每层 AllGather
- 反向：每层 AllGather + ReduceScatter

总通信量约为 DDP 的 1.5 倍，但换来了显著的显存节省。这是经典的空间换通信权衡——每个厨师的工作台整洁了，但借还工具的次数多了。

### 使用示例

\`\`\`python
from torch.distributed.fsdp import FullyShardedDataParallel as FSDP
from torch.distributed.fsdp import ShardingStrategy

model = FSDP(
    model,
    sharding_strategy=ShardingStrategy.FULL_SHARD,  # ZeRO-3
    # sharding_strategy=ShardingStrategy.SHARD_GRAD_OP,  # ZeRO-2
    mixed_precision=MixedPrecision(...),
    auto_wrap_policy=...,
)
\`\`\`

## 7.3.5 FSDP 高级配置

### 分片策略

| 策略 | 等价 | 显存 | 通信 |
|------|------|------|------|
| FULL_SHARD | ZeRO-3 | 最低 | 最高 |
| SHARD_GRAD_OP | ZeRO-2 | 中等 | 中等 |
| NO_SHARD | DDP | 最高 | 最低 |

### 自动包装

\`auto_wrap_policy\` 决定如何划分 FSDP 单元：

\`\`\`python
from torch.distributed.fsdp.wrap import transformer_auto_wrap_policy

# Transformer 层级包装
auto_wrap_policy = functools.partial(
    transformer_auto_wrap_policy,
    transformer_layer_cls={TransformerBlock}
)
\`\`\`

每个 TransformerBlock 作为一个 FSDP 单元，粒度适中。

### 混合精度

\`\`\`python
from torch.distributed.fsdp import MixedPrecision

mixed_precision_policy = MixedPrecision(
    param_dtype=torch.bfloat16,    # 参数类型
    reduce_dtype=torch.bfloat16,   # 通信类型
    buffer_dtype=torch.bfloat16,   # buffer 类型
)
\`\`\`

### CPU Offload

将不活跃的参数/梯度卸载到 CPU：

\`\`\`python
from torch.distributed.fsdp import CPUOffload

model = FSDP(
    model,
    cpu_offload=CPUOffload(offload_params=True)
)
\`\`\`

进一步降低显存，但增加 CPU-GPU 传输开销。

## 7.3.6 DDP vs FSDP 选择

| 维度 | DDP | FSDP |
|------|-----|------|
| 显存效率 | 低（冗余存储） | 高（切片存储） |
| 通信量 | 低 | 高 |
| 实现复杂度 | 简单 | 较复杂 |
| 适用规模 | 小模型 | 大模型 |

**选择建议**：

- 模型能放入单卡 → DDP
- 模型放不下单卡 → FSDP
- 追求最高吞吐 → 结合 TP/PP

## 7.3.7 梯度累积

### 大 Batch 训练

大模型训练通常需要大 batch（数千甚至数万），但显存限制了单步 batch 大小。

**梯度累积**（Gradient Accumulation）解决这个问题：

\`\`\`python
accumulation_steps = 8
optimizer.zero_grad()

for i, batch in enumerate(dataloader):
    loss = model(batch) / accumulation_steps
    loss.backward()  # 梯度累加
    
    if (i + 1) % accumulation_steps == 0:
        optimizer.step()
        optimizer.zero_grad()
\`\`\`

等效 batch 大小 = 实际 batch × 累积步数 × GPU 数。

### 与 DDP/FSDP 结合

梯度累积与数据并行正交。累积期间不需要通信，只在 \`optimizer.step()\` 前同步梯度。

\`\`\`python
# FSDP 中使用 no_sync 跳过中间同步
with model.no_sync():
    for micro_batch in micro_batches[:-1]:
        loss = model(micro_batch)
        loss.backward()

# 最后一个 micro_batch 正常同步
loss = model(micro_batches[-1])
loss.backward()
optimizer.step()
\`\`\`
`
    },
    {
      id: "adv-07-05-sec-04",
      title: "7.4 张量并行",
      file: "大模型教程/07-模型并行训练与优化/04-张量并行.md",
      difficulty: "中级-高级",
      duration: "0.5h",
      week: 0,
      phase: 0,
      keywords: ["张量并行", "Tensor", "Parallelism", "Megatron", "Transformer", "GPT"],
      content: `# 7.4 张量并行

**张量并行**（Tensor Parallelism, TP）将单个层的权重矩阵切分到多个设备，实现层内并行。TP 是 Megatron-LM 的核心技术，特别适合 Transformer 的大矩阵运算。

假设你面前有一幅巨大的拼图，一个人拼不完——桌子都放不下。张量并行把拼图切成几块分给不同的人同时拼，每人只需一小块桌面空间，但拼完后需要拼接的交流（通信）。

## 7.4.1 张量并行的动机

### 单层的显存瓶颈

考虑 GPT-3 175B 的 FFN 层：

- 隐藏维度 $d = 12288$
- FFN 中间维度 $d_{ff} = 4 \\times d = 49152$
- $\\mathbf{W}_1 \\in \\mathbb{R}^{d \\times d_{ff}}$：$12288 \\times 49152 \\times 2 = 1.2$ GB（FP16）
- $\\mathbf{W}_2 \\in \\mathbb{R}^{d_{ff} \\times d}$：同样 1.2 GB
- 单层 FFN：2.4 GB

96 层 FFN：230 GB——**单层都可能超过单卡显存**，必须切开分给多卡。

### FSDP 不够

FSDP 切分的是参数副本，但计算时仍需完整参数。当单层参数超过单卡显存时，FSDP 无能为力。

张量并行在**计算级别**切分，每个 GPU 只需部分参数即可完成部分计算。

## 7.4.2 行切分与列切分

### 矩阵乘法切分

矩阵乘法 $\\mathbf{Y} = \\mathbf{X}\\mathbf{W}$ 可以按两种方式切分。用拼图来理解：假设权重矩阵是一幅由很多列组成的画，你可以竖着切（列切分），也可以横着切（行切分）：

**列切分**（Column Parallel）：将 $\\mathbf{W}$ 按列切分

$$\\mathbf{W} = [\\mathbf{W}_1 | \\mathbf{W}_2], \\quad \\mathbf{Y} = [\\mathbf{X}\\mathbf{W}_1 | \\mathbf{X}\\mathbf{W}_2]$$

其中 $\\mathbf{W}_i \\in \\mathbb{R}^{d \\times (d_{\\text{out}}/T)}$，$T$ 为 TP 度数。每个 GPU 持有权重的一部分列，输入 $\\mathbf{X}$ 需广播到所有 GPU，输出是部分结果（拼接即得完整输出）。

**行切分**（Row Parallel）：将 $\\mathbf{W}$ 按行切分

$$\\mathbf{W} = \\begin{bmatrix} \\mathbf{W}_1 \\\\ \\mathbf{W}_2 \\end{bmatrix}, \\quad \\mathbf{X} = [\\mathbf{X}_1 | \\mathbf{X}_2]$$

$$\\mathbf{Y} = \\mathbf{X}_1\\mathbf{W}_1 + \\mathbf{X}_2\\mathbf{W}_2$$

其中 $\\mathbf{W}_i \\in \\mathbb{R}^{(d_{\\text{in}}/T) \\times d_{\\text{out}}}$，$\\mathbf{X}_i$ 为输入对应的切片。每个 GPU 计算局部乘积，最终通过 AllReduce 求和得到完整输出。

\`\`\`mermaid
graph LR
    subgraph "列切分 (Column Parallel)"
        X1[输入 X] --> W1["W₁ (GPU 0)"]
        X1 --> W2["W₂ (GPU 1)"]
        W1 --> Y1["部分输出 Y₁"]
        W2 --> Y2["部分输出 Y₂"]
    end
    subgraph "行切分 (Row Parallel)"
        X3["X₁ (GPU 0)"] --> W3["W₁ (GPU 0)"]
        X4["X₂ (GPU 1)"] --> W4["W₂ (GPU 1)"]
        W3 --> AR[AllReduce求和]
        W4 --> AR
        AR --> Y3[最终输出 Y]
    end
\`\`\`

## 7.4.3 Megatron 风格的 TP

### FFN 的切分

Transformer 的 FFN：$\\mathbf{Y} = \\text{GELU}(\\mathbf{X}\\mathbf{W}_1)\\mathbf{W}_2$

Megatron 的切分策略：

1. $\\mathbf{W}_1$ **列切分**：每个 GPU 计算部分激活
2. 激活函数本地计算（element-wise，无需通信）
3. $\\mathbf{W}_2$ **行切分**：每个 GPU 计算部分结果
4. **AllReduce** 求和得到最终输出

\`\`\`
GPU 0: X → [X @ W1_0] → GELU → [· @ W2_0] ─┐
                                            ├→ AllReduce → Y
GPU 1: X → [X @ W1_1] → GELU → [· @ W2_1] ─┘
\`\`\`

这种「列—行」组合只需 **一次 AllReduce**（在 $\\mathbf{W}_2$ 之后）。

\`\`\`mermaid
graph LR
    X[输入 X] --> A1["GPU 0: X×W1_0"]
    X --> A2["GPU 1: X×W1_1"]
    A1 --> B1[GELU]
    A2 --> B2[GELU]
    B1 --> C1["×W2_0"]
    B2 --> C2["×W2_1"]
    C1 --> D[AllReduce]
    C2 --> D
    D --> Y[输出 Y]
\`\`\`

### 注意力层的切分

自注意力：$\\mathbf{O} = \\text{softmax}(\\mathbf{Q}\\mathbf{K}^\\top / \\sqrt{d_k}) \\mathbf{V}$

切分策略：

1. $\\mathbf{W}_Q, \\mathbf{W}_K, \\mathbf{W}_V$ **列切分**：按注意力头切分
2. 每个 GPU 独立计算部分头的注意力
3. $\\mathbf{W}_O$ **行切分**：拼接后投影
4. **AllReduce** 求和

\`\`\`
GPU 0: [Q_heads_0, K_heads_0, V_heads_0] → Attention → [· @ W_O_0] ─┐
                                                                    ├→ AllReduce → O
GPU 1: [Q_heads_1, K_heads_1, V_heads_1] → Attention → [· @ W_O_1] ─┘
\`\`\`

### 通信分析

每个 Transformer 层需要 **2 次 AllReduce**：

- FFN 后 1 次
- Attention 后 1 次

通信量：$2 \\times 2 \\times B \\times S \\times d$（前向 + 反向）

其中：
- $B$ 为批大小，$S$ 为序列长度，$d$ 为隐藏层维度
- 第一个因子 2 表示每层有 2 次 AllReduce（注意力后 1 次 + FFN 后 1 次）
- 第二个因子 2 表示前向和反向传播各需一次 AllReduce
- $B \\times S \\times d$ 是每次 AllReduce 的数据量（即激活值张量的大小）

说白了，TP 的通信量与批大小和序列长度成正比——序列越长、batch 越大，通信开销越高，这正是 TP 必须依赖 NVLink 等高带宽低延迟互联的原因。

## 7.4.4 TP 的实现

### Megatron-LM 风格

\`\`\`python
class ColumnParallelLinear(nn.Module):
    def __init__(self, in_features, out_features, world_size, rank):
        self.weight = nn.Parameter(
            torch.empty(out_features // world_size, in_features)
        )
    
    def forward(self, x):
        # 本地计算
        output = F.linear(x, self.weight)
        return output  # 部分结果

class RowParallelLinear(nn.Module):
    def __init__(self, in_features, out_features, world_size, rank):
        self.weight = nn.Parameter(
            torch.empty(out_features, in_features // world_size)
        )
    
    def forward(self, x):
        # 本地计算
        output = F.linear(x, self.weight)
        # AllReduce 求和
        dist.all_reduce(output, group=tp_group)
        return output
\`\`\`

### PyTorch 原生支持

PyTorch 2.0+ 提供了 \`torch.distributed.tensor\` 支持张量并行：

\`\`\`python
from torch.distributed.tensor.parallel import (
    ColwiseParallel,
    RowwiseParallel,
    parallelize_module,
)

plan = {
    "attention.q_proj": ColwiseParallel(),
    "attention.k_proj": ColwiseParallel(),
    "attention.v_proj": ColwiseParallel(),
    "attention.o_proj": RowwiseParallel(),
    "ffn.gate_proj": ColwiseParallel(),
    "ffn.up_proj": ColwiseParallel(),
    "ffn.down_proj": RowwiseParallel(),
}

model = parallelize_module(model, device_mesh, plan)
\`\`\`

## 7.4.5 TP 的限制

### 通信开销

TP 的通信发生在每一层，通信量与序列长度、batch 大小成正比。

当 TP 度数增加时，每次 AllReduce 的参与者增多，延迟上升——拼图人数越多，每次对齐边界的协调成本越高。

### 跨机通信

TP 要求低延迟通信。跨机器的网络延迟（几百微秒）会严重影响性能。

**最佳实践**：TP 限制在单机内（NVLink 连接），跨机使用 DP 或 PP。

### 头数限制

注意力的 TP 需要头数能被 TP 度数整除。例如 32 个头，TP=8 可以，TP=7 不行。

GQA 模型还需要 KV 头数能整除 TP 度数。

## 7.4.6 与其他并行的结合

### TP + DP

最常见的组合：

- **TP**：单机内多卡，低延迟通信
- **DP**：跨机器，高延迟但通信量可控

例如：8 机 64 卡，TP=8（单机内），DP=8（跨机）。

### TP + PP

超大模型需要同时使用：

- **TP**：切分单层，解决单层过大
- **PP**：切分多层，解决总层数过多

例如：TP=8 + PP=4 = 32 卡训练。

### TP + FSDP

FSDP 可以在 TP 之上进一步切分：

- TP 切分每层的计算
- FSDP 切分优化器状态和不活跃参数

这种组合在某些场景下比纯 TP 更高效。

## 7.4.7 实践建议

### TP 度数选择

| 模型规模 | 推荐 TP |
|----------|---------|
| 7B | 1-2 |
| 13B | 2-4 |
| 70B | 4-8 |
| 175B+ | 8 |

### 硬件配置

- **NVLink**：TP 强烈依赖，无 NVLink 的机器不适合高 TP
- **A100/H100**：NVLink 600GB/s，TP=8 效率良好
- **消费级 GPU**：PCIe 连接，TP 效率低

### 调优要点

1. **避免跨机 TP**：延迟是杀手
2. **平衡 TP 与 DP**：TP 增加层内通信，DP 增加梯度同步
3. **与 PP 配合**：TP 解决宽度，PP 解决深度
4. **监控通信**：使用 NCCL 的 profiling 工具
`
    },
    {
      id: "adv-07-06-sec-05",
      title: "7.5 流水线并行",
      file: "大模型教程/07-模型并行训练与优化/05-流水线并行.md",
      difficulty: "中级-高级",
      duration: "0.5h",
      week: 0,
      phase: 0,
      keywords: ["流水线并行", "Pipeline", "Parallelism", "Transformer", "Stage", "Layers"],
      content: `# 7.5 流水线并行

**流水线并行**（Pipeline Parallelism, PP）将模型按层切分到多个设备，形成流水线。PP 解决了模型深度方向的扩展问题，但需要精心设计调度策略以平衡计算和气泡。

想象一家汽车工厂的装配线：第一个工位装底盘，第二个工位装发动机，第三个工位装车身，第四个工位装内饰。每个工位将半成品传给下一个，多辆车同时在不同工位上被加工。流水线并行正是这个思路——模型的不同层就是不同工位，数据在它们之间流动。

## 7.5.1 流水线并行的基本概念

### 层间切分

将 $L$ 层 Transformer 分配到 $P$ 个 stage：

\`\`\`
Stage 0: Layers 0 ~ L/P-1
Stage 1: Layers L/P ~ 2L/P-1
...
Stage P-1: Layers (P-1)L/P ~ L-1
\`\`\`

每个 stage 在不同的 GPU 上，数据在 stage 之间流动。

\`\`\`mermaid
graph LR
    subgraph 模型分层
        A["Stage 0: Layer 0~L/P-1"] -->|传递激活值| B["Stage 1: Layer L/P~2L/P-1"]
        B -->|传递激活值| C["Stage 2: ..."]
        C -->|传递激活值| D["Stage P-1: 最后几层"]
    end
\`\`\`

### 朴素流水线

最简单的流水线：

\`\`\`
Stage 0: [  F0  ][     ][     ][     ][  B0  ][     ][     ][     ]
Stage 1: [     ][  F1  ][     ][     ][     ][  B1  ][     ][     ]
Stage 2: [     ][     ][  F2  ][     ][     ][     ][  B2  ][     ]
Stage 3: [     ][     ][     ][  F3  ][     ][     ][     ][  B3  ]
\`\`\`

F = Forward，B = Backward

问题：大量**气泡**（bubble）——GPU 空闲等待。回到工厂的场景：如果只有一辆车在装配线上，当它在第 2 工位时，第 1、3、4 工位的工人都在发呆——这就是气泡。

### 气泡分析

设 PP 度数为 $P$，气泡时间占比约为：

$$\\text{Bubble fraction} \\approx \\frac{P-1}{P + m - 1}$$

其中：
- $P$ 为流水线 stage 数（即 PP 度数）
- $m$ 为微批次数（micro-batch count）
- 分子 $P-1$ 代表流水线启动和排空阶段的气泡时间（第一个微批次要经过 $P$ 个 stage 才能开始反向）
- 分母 $P + m - 1$ 为总时间步数

说白了，当 $m \\gg P$ 时气泡比例趋近于 0（装配线上同时有足够多的车，工位不会空闲）。但实际中 $m$ 受显存限制，不可能无限增大。例如 $P=4, m=12$ 时气泡约 $3/15 = 20\\%$。

## 7.5.2 GPipe

### 微批次

**GPipe**（Huang et al., 2019）通过将 batch 切分为多个**微批次**（micro-batch）来填充气泡。这就像工厂同时放多辆车上装配线——当第 1 辆车到了第 2 工位时，第 2 辆车已经进入第 1 工位，这样每个工位都有活干：

\`\`\`
Stage 0: [F0.0][F0.1][F0.2][F0.3][   ][   ][   ][B0.3][B0.2][B0.1][B0.0]
Stage 1: [   ][F1.0][F1.1][F1.2][F1.3][   ][B1.3][B1.2][B1.1][B1.0][   ]
Stage 2: [   ][   ][F2.0][F2.1][F2.2][F2.3][B2.2][B2.1][B2.0][   ][   ]
Stage 3: [   ][   ][   ][F3.0][F3.1][F3.2][B3.1][B3.0][   ][   ][   ]
\`\`\`

微批次数 $m$ 越大，气泡越少——装配线上同时有越多车，每个工位就越不容易空闲。

### 同步梯度更新

GPipe 的特点是**同步**更新：

1. 所有微批次完成前向
2. 所有微批次完成反向
3. 聚合梯度并更新

这保证了训练的数学等价性，但需要存储所有微批次的激活值。

### 激活重计算

显存限制下，GPipe 使用**激活重计算**（Activation Recomputation / Checkpointing）：

- 只保存 stage 边界的激活
- 反向时重新计算中间激活
- 以计算换显存

## 7.5.3 PipeDream 系列

### 1F1B 调度

**PipeDream** 提出了 **1F1B**（One Forward One Backward）调度——就像装配线上的工人不再「先装完所有车的底盘，再统一装发动机」，而是交替进行前向和反向操作：

\`\`\`
Stage 0: [F0][F1][F2][F3][B0][F4][B1][F5][B2][F6][B3][B4][B5][B6]
Stage 1: [  ][F0][F1][F2][F3][B0][F4][B1][F5][B2][B3][B4][B5][B6]
...
\`\`\`

稳态时交替执行一次前向、一次反向，气泡只在启动和结束阶段。整条装配线的“开工率”显著提升。

\`\`\`mermaid
graph TD
    subgraph GPipe
        G1["微批次0,1,2,3 全部前向"] --> G2["微批次0,1,2,3 全部反向"]
        G2 --> G3[聚合梯度并更新]
    end
    subgraph 1F1B
        F1["启动: 多次前向填充流水线"] --> F2["稳态: 交替1次前向+1次反向"]
        F2 --> F3["排空: 多次反向清空流水线"]
    end
\`\`\`

### 内存优势

1F1B 的显存占用更优：

- GPipe：需要存储所有微批次的激活
- 1F1B：只需存储 $P$ 个微批次的激活

$$\\text{Peak memory} \\propto P \\times \\text{activation per micro-batch}$$

其中 $P$ 为 PP stage 数。GPipe 需要存储所有 $m$ 个微批次的激活值，而 1F1B 在稳态阶段最多同时保留 $P$ 个微批次的激活值（因为每完成一次反向就释放对应的激活值）。当 $m \\gg P$ 时，1F1B 的显存优势非常显著。

### 异步 vs 同步

PipeDream 原版是异步的（权重版本不一致），引入了训练不稳定性。

后续工作（如 **PipeDream-2BW**、**DAPPLE**）通过权重缓存等技术实现了同步训练。

## 7.5.4 交错流水线

### Interleaved Schedule

Megatron-LM 引入了**交错流水线**（Interleaved Pipeline）：

每个 stage 不是连续的层，而是分散的多个**虚拟 stage**。

例如 16 层模型，4 个 GPU，每 GPU 2 个虚拟 stage：

\`\`\`
GPU 0: Layers 0-1, 8-9
GPU 1: Layers 2-3, 10-11
GPU 2: Layers 4-5, 12-13
GPU 3: Layers 6-7, 14-15
\`\`\`

### 减少气泡

交错流水线的气泡更少：

$$\\text{Bubble} = \\frac{P - 1}{P \\times v + m - 1}$$

其中：
- $P$ 为物理 GPU 数（PP 度数）
- $v$ 为每个 GPU 上的虚拟 stage 数
- $m$ 为微批次数

从实际意义来看，交错流水线的分母从 $P + m - 1$ 变为 $P \\times v + m - 1$，等效于将 stage 数“乘以” $v$ 倍，气泡比例大幅下降。例如 $P=4, v=2, m=12$ 时气泡约 $3/19 \\approx 16\\%$，低于非交错的 20%。

### 通信增加

代价是通信增加：数据需要在 GPU 之间来回传递。

适用于机内 PP（NVLink），不适合跨机。

## 7.5.5 PP 与显存

### 显存组成

每个 PP stage 的显存：

| 组件 | 说明 |
|------|------|
| 模型参数 | 本 stage 的层 |
| 激活值 | 与微批次数相关 |
| 梯度 | 本 stage 的层 |
| 优化器状态 | 本 stage 的层 |

PP 将模型显存均摊到各 stage，但激活值开销仍然存在。

### 与 TP 的配合

PP + TP 的典型配置：

- PP=4，TP=8：32 卡
- 每个 PP stage 内使用 TP=8

TP 减少单层显存，PP 减少层数，两者互补。

## 7.5.6 负载均衡

### 层分配问题

不同层的计算量可能不同：

- Embedding 层：计算少，参数多
- Transformer 层：计算量大致相等
- LM Head：与 Embedding 共享权重

### 均衡策略

1. **按计算量分配**：profiling 后调整层分配
2. **Embedding 特殊处理**：Embedding 和 LM Head 放在首尾 stage
3. **虚拟 stage 调整**：通过虚拟 stage 微调负载

### 动态负载均衡

序列长度变化会影响计算量。一些高级系统支持动态调整。

## 7.5.7 PP 实践

### Megatron-LM 配置

\`\`\`python
# 3D 并行配置
TENSOR_MP_SIZE = 8      # TP
PIPELINE_MP_SIZE = 4    # PP
DATA_PARALLEL_SIZE = 4  # DP
# 总计 8 * 4 * 4 = 128 GPU

# 微批次
MICRO_BATCH_SIZE = 1
GLOBAL_BATCH_SIZE = 512
# 梯度累积 = 512 / (1 * 4) = 128 steps
\`\`\`

### DeepSpeed 配置

\`\`\`json
{
    "train_batch_size": 512,
    "train_micro_batch_size_per_gpu": 1,
    "pipeline": {
        "pipe_partitioned": true,
        "grad_partitioned": true,
        "stages": 4
    }
}
\`\`\`

### 调优建议

| 参数 | 调优方向 |
|------|----------|
| PP 度数 | 减少气泡，但通信增加 |
| 微批次数 | 越多气泡越少，但显存增加 |
| 虚拟 stage | 减少气泡，但通信增加 |
| 激活重计算 | 节省显存，增加计算 |

### 常见问题

**气泡过大**：增加微批次数或使用交错流水线。

**显存溢出**：减少微批次数或启用激活重计算。

**负载不均**：检查层分配，调整虚拟 stage。

**通信瓶颈**：PP 跨机时检查网络带宽。
`
    },
    {
      id: "adv-07-07-sec-06",
      title: "7.6 专家并行",
      file: "大模型教程/07-模型并行训练与优化/06-专家并行.md",
      difficulty: "中级-高级",
      duration: "0.5h",
      week: 0,
      phase: 0,
      keywords: ["专家并行", "Expert", "Parallelism", "MoE", "Mixture", "Experts"],
      content: `# 7.6 专家并行

**专家并行**（Expert Parallelism, EP）是 MoE（Mixture of Experts）模型的专用并行策略。MoE 模型通过稀疏激活扩大参数规模，EP 将不同专家分布到不同设备，配合 All-to-All 通信实现高效训练。

想象一家大医院的门诊：有 64 个专科医生（专家），每个患者（token）根据症状被分诊到 2 个科室。并不是每个患者都要看所有科，而是根据病情精准分流——这就是 MoE 的「稀疏激活」思想。专家并行则是把这些医生分布在不同的诊所大楼（GPU）里。

## 7.6.1 MoE 模型回顾

### MoE 结构

MoE 层将 FFN 替换为多个"专家"FFN，每个 token 只路由到 top-$k$ 个专家：

$$\\text{MoE}(\\mathbf{x}) = \\sum_{i \\in \\text{top-}k} g_i(\\mathbf{x}) \\cdot E_i(\\mathbf{x})$$

其中：
- $\\mathbf{x}$ 为单个 token 的隐藏向量
- $g_i(\\mathbf{x})$ 为门控网络（Router）对专家 $i$ 的权重，满足 $\\sum_{i \\in \\text{top-}k} g_i = 1$
- $E_i(\\mathbf{x})$ 为第 $i$ 个专家网络（通常是一个 FFN）的输出
- top-$k$ 表示只激活门控权重最高的 $k$ 个专家（典型 $k=2$）

\`\`\`mermaid
graph LR
    A[Token] --> B[门控网络/Router]
    B --> C{"Top-k路由"}
    C --> D["Expert 0 (GPU 0)"]
    C --> E["Expert 3 (GPU 1)"]
    D --> F[加权求和]
    E --> F
    F --> G[输出]
\`\`\`

### 稀疏激活的优势

- **参数量大**：总参数 = 专家数 × 单专家参数
- **计算量小**：每个 token 只激活 top-$k$ 专家
- **条件计算**：不同输入使用不同专家

例如：64 个专家，top-2 路由，参数量 64×，计算量 2×。这就像医院虽然有 64 个医生，但每个患者只需要看 2 个科——服务能力巨大，但每次实际动用的资源很少。

## 7.6.2 专家并行的必要性

### 单卡装不下

Mixtral 8×7B：8 个专家，每个 7B 参数。

- 单专家显存：14GB（FP16）
- 8 个专家：112GB——超过单卡

### TP 的局限

TP 可以切分单个专家，但：

1. 通信发生在每个专家内部
2. 专家数越多，通信开销越大
3. 每次 All-to-All 后还需 AllReduce

EP 是更自然的选择：每个 GPU 负责若干完整的专家，如同每树诊所大楼各自安排几个科室，患者按分诊结果到对应大楼就诊。

## 7.6.3 EP 的工作原理

### 专家分配

设有 $E$ 个专家，$N$ 个 GPU，每个 GPU 持有 $E/N$ 个专家。

\`\`\`
GPU 0: Expert 0, Expert 1
GPU 1: Expert 2, Expert 3
GPU 2: Expert 4, Expert 5
GPU 3: Expert 6, Expert 7
\`\`\`

### All-to-All 通信

MoE 前向传播的流程就像医院的分诊系统：

1. **门控计算**：所有 GPU 计算路由决策（分诊台确定应该去哪个科）
2. **All-to-All（dispatch）**：将 token 发送到目标专家所在的 GPU（患者转移到对应科室）
3. **专家计算**：各 GPU 计算本地专家（医生诊疗）
4. **All-to-All（combine）**：将结果发回原 GPU（诊疗报告送回分诊台）
5. **加权求和**：按门控权重合并

\`\`\`
Token 分发：
GPU 0: [t0, t1, t2, t3] ──All2All──> GPU 0: [t0_e0, t2_e1]
                                     GPU 1: [t1_e2, t3_e3]
                                     GPU 2: [t0_e4, t1_e5]
                                     GPU 3: [t2_e6, t3_e7]
\`\`\`

\`\`\`mermaid
graph TD
    A[所有GPU计算路由决策] --> B["All-to-All: 分发token到目标GPU"]
    B --> C["GPU 0: Expert 0,1 计算"]
    B --> D["GPU 1: Expert 2,3 计算"]
    B --> E["GPU 2: Expert 4,5 计算"]
    B --> F["GPU 3: Expert 6,7 计算"]
    C --> G["All-to-All: 结果发回原GPU"]
    D --> G
    E --> G
    F --> G
    G --> H[加权合并输出]
\`\`\`

### All-to-All 通信量

每个 token 发送到 top-$k$ 个专家，通信量：

$$\\text{通信量} = 2 \\times B \\times S \\times k \\times d / N$$

其中：
- $B$ 为批大小，$S$ 为序列长度
- $k$ 为每个 token 激活的专家数（top-$k$）
- $d$ 为隐藏层维度
- $N$ 为 EP 度数（GPU 数）
- 因子 2 来自 dispatch 和 combine 两次 All-to-All

拆开来看：每个 token 需发送到 $k$ 个专家，然后结果发回。通信量与 $k$ 和 $d$ 成正比，被 $N$ 个 GPU 均摊。当专家数很多时（如 64 个），All-to-All 通信可能成为瓶颈。

## 7.6.4 负载均衡

### 负载不均问题

如果所有 token 都路由到少数专家：

1. 这些专家所在的 GPU 过载——就像所有患者都挤到同一个科室
2. 其他 GPU 空闲——其他科室门可罗雀
3. 训练效率低下

### 辅助损失

**负载均衡损失**（Load Balancing Loss）鼓励均匀路由：

$$L_{\\text{balance}} = \\alpha \\cdot N \\cdot \\sum_{i=1}^N f_i \\cdot P_i$$

其中：
- $N$ 为专家数量
- $f_i$ 为实际路由到专家 $i$ 的 token 比例（$\\sum_i f_i = k$，因为每个 token 路由到 $k$ 个专家）
- $P_i$ 为门控网络分配给专家 $i$ 的平均概率
- $\\alpha$ 为辅助损失权重（典型值 0.01）
- 前缀因子 $N$ 用于归一化

直觉上，当所有专家负载均匀时 $f_i = k/N$，$P_i = 1/N$，损失取最小值。若某个专家同时拥有高 $f_i$ 和高 $P_i$（又忙又被指名），损失增大，梯度优化会引导 Router 分散路由——如同医院设置分流奖励，避免某个科室挤爆。

### Capacity Factor

**容量因子**（Capacity Factor）限制每个专家处理的 token 数：

$$\\text{Capacity} = \\frac{B \\times S}{E} \\times \\text{CF}$$

其中：
- $B \\times S$ 为总 token 数
- $E$ 为专家数
- $B \\times S / E$ 为理想均匀分配时每个专家的 token 数
- CF（Capacity Factor）为容量余量系数

超过容量的 token 被丢弃或使用备选专家。CF 太小会导致大量 token 丢弃，CF 太大则浪费计算和显存。典型值 1.25 表示留 25% 余量。

### Expert Choice 路由

**Expert Choice**（Zhou et al., 2022）反转路由逻辑：

- 传统：每个 token 选择专家
- Expert Choice：每个专家选择 token

每个专家选择固定数量的 token，天然负载均衡。

## 7.6.5 EP 与其他并行的组合

### EP + TP

当单个专家太大时，结合 EP 和 TP：

- EP：不同专家在不同 GPU 组
- TP：每个专家内部切分

通信：EP 的 All-to-All + TP 的 AllReduce

### EP + DP

数据并行时，每个 DP rank 持有完整的专家副本。

**专家复制**（Expert Replication）：

- 高频专家复制多份，分布在多个 GPU
- 低频专家可能只有一份

这增加了显存，但减少了通信。

### EP + PP

流水线并行中，MoE 层可能分布在不同 stage：

- 某些 stage 有 MoE，需要 EP 通信
- 某些 stage 只有普通 Transformer 层

调度需要协调 PP 的流水线和 EP 的 All-to-All。

## 7.6.6 通信优化

### 重叠计算与通信

All-to-All 通信可以与计算重叠：

1. 分块发送/接收
2. 已到达的 token 立即计算
3. 计算结果立即发回

\`\`\`
All2All chunk 1 → Compute chunk 1 → All2All chunk 1 back
    All2All chunk 2 → Compute chunk 2 → ...
\`\`\`

### 拓扑感知路由

网络拓扑影响 All-to-All 效率：

- 同一交换机下的 GPU 通信更快
- 可以将常一起路由的专家放在临近 GPU

### 专家 Offload

低频专家可以 offload 到 CPU/磁盘：

1. 当 token 路由到 offload 专家时，按需加载
2. 计算完成后卸载
3. 适合推理场景

## 7.6.7 框架支持

### DeepSpeed MoE

DeepSpeed 提供了完整的 MoE 支持：

\`\`\`python
from deepspeed.moe.layer import MoE

moe_layer = MoE(
    hidden_size=hidden_size,
    expert=expert_module,
    num_experts=64,
    ep_size=8,  # EP 并行度
    k=2,        # top-k
    capacity_factor=1.25,
    use_residual=True,
)
\`\`\`

### Megatron-DeepSpeed

结合 Megatron 的 TP/PP 和 DeepSpeed 的 EP：

\`\`\`
3D + Expert 并行:
  TP = 8 (单机内)
  PP = 4 (跨机)
  EP = 8 (专家分布)
  DP = 4 (数据复制)
  总计: 8 × 4 × 4 = 128 GPU (EP 与 DP 共享维度)
\`\`\`

### Tutel

微软的 **Tutel** 专门优化 MoE 通信：

- 自适应路由算法
- 动态容量调整
- All-to-All 优化

## 7.6.8 实践建议

### EP 度数选择

| 专家数 | 推荐 EP |
|--------|---------|
| 8 | 2-8 |
| 64 | 8-64 |
| 128 | 16-128 |

原则：EP ≤ 专家数，且与网络拓扑匹配。

### 负载均衡参数

| 参数 | 典型值 | 说明 |
|------|--------|------|
| 辅助损失权重 | 0.01 | 太大影响主任务 |
| Capacity Factor | 1.25 | 留一定余量 |
| top-k | 2 | 平衡效率和效果 |

### 监控指标

- **路由熵**：衡量路由的均匀程度
- **专家利用率**：各专家处理的 token 比例
- **Token 丢弃率**：因容量不足丢弃的 token
- **All-to-All 时间**：通信开销
`
    },
    {
      id: "adv-07-08-sec-07",
      title: "7.7 序列并行与上下文并行",
      file: "大模型教程/07-模型并行训练与优化/07-序列并行与上下文并行.md",
      difficulty: "中级-高级",
      duration: "0.5h",
      week: 0,
      phase: 0,
      keywords: ["序列并行与上下文并行", "Sequence", "Parallelism", "Context", "Transformer"],
      content: `# 7.7 序列并行与上下文并行

当序列长度达到数万甚至数百万 token 时，激活值的显存占用成为瓶颈。**序列并行**（Sequence Parallelism, SP）和**上下文并行**（Context Parallelism, CP）通过切分序列维度来解决这一问题。

假设你要读一本超长的小说（128K token），一个人的桌子上根本放不下整本书的笔记。前面的并行方法是把「笔记内容」切分（TP 切隐藏维度），但笔记的「页数」（序列长度）没变。序列并行和上下文并行则是把这本小说的不同章节分给不同的人读，每个人只负责一部分页码的笔记。

## 7.7.1 长序列的挑战

### 激活值显存

Transformer 的激活值显存与序列长度成正比（甚至平方关系）：

| 组件 | 显存复杂度 |
|------|------------|
| 输入 embedding | $O(S \\cdot d)$ |
| 注意力 $\\mathbf{Q}, \\mathbf{K}, \\mathbf{V}$ | $O(S \\cdot d)$ |
| 注意力分数 $\\mathbf{S}$ | $O(S^2)$（无 Flash Attention） |
| FFN 中间激活 | $O(S \\cdot d_{ff})$ |

对于 $S = 128K$，$d = 8192$，单层激活可达数十 GB。

### TP 无法解决

TP 切分的是隐藏维度 $d$，不影响序列维度 $S$。每个 GPU 仍需存储完整序列的激活。

用读书的比喻来说：TP 相当于每个人读完整本书但只做部分类型的笔记，序列维度（书的页数）没有减少。我们需要新的并行维度——切分序列本身，让每个人只负责一部分页码。

## 7.7.2 Megatron 序列并行

### 基本思想

Megatron 的 **SP** 与 TP 配合工作，切分 TP 中**不需要通信**的部分：

- LayerNorm、Dropout 等算子是 element-wise 的
- 它们不需要跨设备通信
- 可以沿序列维度切分

### 工作方式

考虑 TP + SP 的组合：

1. **注意力和 FFN**：使用 TP，需要 AllReduce
2. **LayerNorm、Dropout**：使用 SP，沿序列切分
3. **TP → SP 转换**：AllReduce 后 scatter 到序列维度
4. **SP → TP 转换**：AllGather 恢复完整序列

\`\`\`
[TP 区域: 注意力/FFN] 
    → AllReduce 
    → Scatter (序列维度)
[SP 区域: LayerNorm, Dropout]
    → AllGather (序列维度)
[TP 区域: 下一层注意力/FFN]
\`\`\`

\`\`\`mermaid
graph TD
    A["TP区域: 注意力/FFN"] --> B[AllReduce]
    B --> C["Scatter(序列维度)"]
    C --> D["SP区域: LayerNorm, Dropout"]
    D --> E["AllGather(序列维度)"]
    E --> F["TP区域: 下一层注意力/FFN"]
\`\`\`

### 显存节省

SP 将 LayerNorm 和 Dropout 的激活均摊到 TP 组：

- 无 SP：每个 GPU 存储 $O(S \\cdot d)$ 激活
- 有 SP：每个 GPU 存储 $O(S/T \\cdot d)$ 激活

配合 TP=$T$，这部分激活减少 $T$ 倍。

### 局限性

Megatron SP 只能切分 element-wise 操作，无法切分注意力计算本身。当 $S^2$ 的注意力成为瓶颈时，需要更强的并行策略。

## 7.7.3 上下文并行（Context Parallelism）

### 动机

长上下文模型（如 128K、1M token）的核心瓶颈是注意力的 $O(S^2)$ 复杂度。

**上下文并行**（CP）直接切分序列，让注意力计算也能并行：

$$\\mathbf{Q} = [\\mathbf{Q}_1 | \\mathbf{Q}_2 | \\ldots | \\mathbf{Q}_C]$$
$$\\mathbf{K} = [\\mathbf{K}_1 | \\mathbf{K}_2 | \\ldots | \\mathbf{K}_C]$$
$$\\mathbf{V} = [\\mathbf{V}_1 | \\mathbf{V}_2 | \\ldots | \\mathbf{V}_C]$$

其中 $C$ 是 CP 度数。

### 挑战

注意力计算需要**全局信息**：

$$\\text{Attention}(\\mathbf{Q}_i, \\mathbf{K}, \\mathbf{V}) = \\text{softmax}\\left(\\frac{\\mathbf{Q}_i \\mathbf{K}^\\top}{\\sqrt{d_k}}\\right) \\mathbf{V}$$

其中：
- $\\mathbf{Q}_i$ 为第 $i$ 个 GPU 持有的查询块（序列的一部分）
- $\\mathbf{K}, \\mathbf{V}$ 为完整的键和值矩阵（分布在所有 GPU 上）
- $d_k$ 为每个注意力头的维度

核心困难在于：$\\mathbf{Q}_i$ 需要与**所有** $\\mathbf{K}, \\mathbf{V}$ 交互，而不仅仅是本地那一块——就像读小说时第 50 章可能需要参考前 49 章任何地方的线索，不能完全独立地读某一章。这就是为什么需要 Ring Attention 或 Ulysses 等复杂通信策略。

## 7.7.4 Ring Attention

### 基本思想

**Ring Attention**（Liu et al., 2023）通过环形通信解决 CP 的挑战。想象一个读书会，每个人持有小说的一章，大家围成一圈。每个人保留自己的章节（Q），但把笔记（K、V）按顺时针传给下一个人，同时从上一个人那里收到新的笔记。每收到一份笔记就更新自己的理解，转一圈后每个人就看过了所有章节的笔记：

1. 将 GPU 组成逻辑环
2. 每个 GPU 持有一块 $\\mathbf{Q}$
3. $\\mathbf{K}, \\mathbf{V}$ 块在环中循环传递
4. 每个 GPU 累积计算部分注意力

### 算法流程

设 CP 度数为 $C$，GPU $i$ 持有 $\\mathbf{Q}_i$，初始持有 $\\mathbf{K}_i, \\mathbf{V}_i$。

\`\`\`python
for step in range(C):
    # 当前 GPU 持有 K_j, V_j (j = (i + step) % C)
    # 计算 Q_i 与 K_j, V_j 的部分注意力
    partial_out, partial_lse = attention(Q_i, K_j, V_j)
    
    # 累积结果（在线 softmax）
    out, lse = merge_attention(out, lse, partial_out, partial_lse)
    
    # 环形传递 K, V
    K_j = ring_send_recv(K_j, direction='next')
    V_j = ring_send_recv(V_j, direction='next')
\`\`\`

\`\`\`mermaid
graph LR
    subgraph Ring Attention
        R1["GPU 0: 持有Q₀"] --> R2["接收K,V块"]
        R2 --> R3["计算部分注意力"]
        R3 --> R4["传递K,V到下一GPU"]
        R4 --> R5{"转完一圈?"}
        R5 -->|否| R2
        R5 -->|是| R6["在线Softmax合并"]
    end
\`\`\`

### 在线合并

不同块的注意力结果需要正确合并。利用在线 softmax 的 log-sum-exp（LSE）：

$$\\text{out} = \\frac{e^{\\text{lse}_1} \\cdot \\text{out}_1 + e^{\\text{lse}_2} \\cdot \\text{out}_2}{e^{\\text{lse}_1} + e^{\\text{lse}_2}}$$

其中：
- $\\text{out}_1, \\text{out}_2$ 为两个块的局部注意力输出
- $\\text{lse}_1, \\text{lse}_2$ 为对应块的 log-sum-exp 值（$\\text{lse} = \\log \\sum_j e^{s_j}$，其中 $s_j$ 为注意力分数）
- 分母 $e^{\\text{lse}_1} + e^{\\text{lse}_2}$ 保证合并后的注意力权重仍然正确归一化

这个公式告诉我们：可以将两个局部 softmax 的结果正确合并为一个全局 softmax 的结果。这与 Flash Attention 中的在线 Softmax 原理完全一致——都是通过维护 LSE 统计量来避免存储完整的注意力矩阵。

这保证了数值正确性。

### 通信与计算重叠

Ring Attention 的精髓在于通信与计算的重叠——当你在读当前收到的笔记时，下一份笔记已在传递路上：

- 当前块的注意力计算
- 下一块 K、V 的发送/接收

通信被计算完全掩盖（理想情况下）。

## 7.7.5 Ulysses

### DeepSpeed Ulysses

**Ulysses**（DeepSpeed, 2024）是另一种 CP 实现，使用 All-to-All 而非环形通信。

### 工作方式

1. **All-to-All 分发**：将按序列切分的 Q、K、V 变换为按头切分
2. **本地注意力**：每个 GPU 计算部分头的完整序列注意力
3. **All-to-All 聚合**：将结果变换回按序列切分

\`\`\`
输入: 每个 GPU 持有序列的一部分，所有头
      GPU_i: [seq_chunk_i, all_heads]

All-to-All 转置:
      GPU_i: [all_seq, head_chunk_i]

本地注意力计算:
      GPU_i: Attention on head_chunk_i with full sequence

All-to-All 转回:
      GPU_i: [seq_chunk_i, all_heads]
\`\`\`

\`\`\`mermaid
graph TD
    subgraph Ulysses
        U1["按序列切分: GPU_i持有seq_chunk_i"] --> U2["All-to-All: 转为按头切分"]
        U2 --> U3["每GPU计算部分头的完整序列注意力"]
        U3 --> U4["All-to-All: 转回按序列切分"]
    end
\`\`\`

### 与 Ring Attention 的对比

| 维度 | Ring Attention | Ulysses |
|------|----------------|---------|
| 通信模式 | P2P 环形 | All-to-All |
| 通信轮次 | $C$ 轮 | 2 轮 |
| 计算-通信重叠 | 天然支持 | 需要额外优化 |
| 适用拓扑 | 环形连接 | 全连接 |

Ring Attention 在环形拓扑（如 NVLink 环）下更优；Ulysses 在全连接拓扑下更高效。

## 7.7.6 实践配置

### 与其他并行的组合

典型的长序列训练配置：

\`\`\`
TP = 8 (机内)
SP = 8 (与 TP 相同)
CP = 4 (跨机)
DP = 8 (跨机)
PP = 1 (通常不与 CP 组合)

总 GPU = 8 × 4 × 8 = 256
\`\`\`

### 框架支持

**Megatron-LM**：原生支持 SP 和 CP

\`\`\`python
# Context Parallel 配置
context_parallel_size = 4
\`\`\`

**DeepSpeed Ulysses**：

\`\`\`python
from deepspeed.sequence.layer import DistributedAttention

attention = DistributedAttention(local_attention, sp_group)
\`\`\`

### 序列长度选择

| 序列长度 | 推荐配置 |
|----------|----------|
| 4K-8K | TP + SP |
| 32K-128K | TP + SP + CP |
| 128K-1M | TP + SP + CP (高度数) |

## 7.7.7 变长序列处理

### 问题

CP 假设序列长度固定且能整除 CP 度数。实际中序列长度各异。

### 解决方案

**序列打包**（Sequence Packing）：

1. 将多个短序列拼接成一个长序列
2. 用注意力掩码区分不同序列
3. 拼接后的长度统一，适合 CP

\`\`\`
Original: [seq1 (100)] [seq2 (200)] [seq3 (50)]
Packed:   [seq1 | seq2 | seq3 | padding] (length = 4K)
Mask:     Prevent cross-sequence attention
\`\`\`

### 动态序列并行

一些研究探索动态调整 CP：

- 短序列：不使用 CP
- 长序列：启用 CP

但实现复杂，需要运行时决策。
`
    },
    {
      id: "adv-07-09-sec-08",
      title: "7.8 多维并行",
      file: "大模型教程/07-模型并行训练与优化/08-多维并行.md",
      difficulty: "中级-高级",
      duration: "1h",
      week: 0,
      phase: 0,
      keywords: ["多维并行", "Multi", "Parallelism", "Batch", "AllReduce"],
      content: `# 7.8 多维并行

实际的大模型训练往往需要组合多种并行策略，形成**多维并行**（Multi-dimensional Parallelism）。从经典的 3D 并行（DP + TP + PP）到现代的 5D 并行（+ SP + EP），本节讨论如何设计和调优多维并行配置。

假设你要组织一家超大型工厂生产汽车。单一的策略不够用：你需要装配线（流水线并行）、每个工位多人协作（张量并行）、多条装配线同时运行（数据并行），还可能需要专业外包团队（专家并行）。多维并行就是把这些策略组合起来，让整个工厂高效运转。

## 7.8.1 并行维度回顾

| 维度 | 符号 | 切分对象 | 通信模式 |
|------|------|----------|----------|
| 数据并行 | $N$ 或 $D$ | Batch | AllReduce |
| 张量并行 | $T$ | 层内权重 | AllReduce |
| 流水线并行 | $P$ | 层间 | P2P |
| 序列并行 | $S$ | 序列（element-wise） | Scatter/Gather |
| 上下文并行 | $C$ | 序列（注意力） | Ring/All2All |
| 专家并行 | $E$ | MoE 专家 | All2All |

总 GPU 数：$N \\times T \\times P \\times C$（某些维度可能共享）

其中：
- $N$（或 $D$）为数据并行度数
- $T$ 为张量并行度数
- $P$ 为流水线并行度数
- $C$ 为上下文并行度数

各并行维度的乘积决定总 GPU 需求。实际中 EP 与 DP 可能共享同一 GPU 维度，因此总数可能小于简单乘积。配置设计的核心是在显存约束、通信效率和计算利用率之间找到平衡。

\`\`\`mermaid
graph TD
    subgraph "多维并行组合"
        DP["数据并行(DP): 切分Batch"] --> TP["张量并行(TP): 切分层内权重"]
        TP --> PP["流水线并行(PP): 切分层间"]
        PP --> SP["序列并行(SP): 切分序列"]
        SP --> EP["专家并行(EP): 切分专家"]
    end
    subgraph "通信模式"
        DP2[AllReduce] --- TP2[AllReduce]
        TP2 --- PP2[P2P]
        PP2 --- SP2[Scatter/Gather]
        SP2 --- EP2[All-to-All]
    end
\`\`\`

## 7.8.2 3D 并行

### 经典组合

**3D 并行** = DP + TP + PP，是大模型训练的标准配置。用工厂的比喻来说：TP 是每个工位内多人分工，PP 是多个工位组成装配线，DP 是多条装配线同时运行。

\`\`\`
示例：128 GPU 训练 175B 模型
  TP = 8 (单机 8 卡)
  PP = 4 (4 个 stage)
  DP = 4 (4 份数据副本)
  总计: 8 × 4 × 4 = 128 GPU
\`\`\`

### 通信组划分

不同并行维度使用不同的通信组：

\`\`\`python
# 假设 128 GPU，按 [DP, PP, TP] 组织为 [4, 4, 8]
world_size = 128
tp_size, pp_size, dp_size = 8, 4, 4

# TP 组：同一机器的 8 卡
tp_group = ranks[dp_idx, pp_idx, :]  # e.g., [0,1,2,3,4,5,6,7]

# PP 组：跨机器的流水线
pp_group = ranks[dp_idx, :, tp_idx]  # e.g., [0,8,16,24]

# DP 组：不同数据副本
dp_group = ranks[:, pp_idx, tp_idx]  # e.g., [0,32,64,96]
\`\`\`

### 通信拓扑优化

**原则**：高带宽需求分配给低延迟连接——需要频繁传递零件的工位要紧挨着，只需偶尔交流的部门可以距离远一点：

- **TP**：通信频繁（每层 2 次），放在 NVLink 连接的机内
- **PP**：P2P 通信，可跨机（IB）
- **DP**：AllReduce 可重叠，跨机可接受

## 7.8.3 4D 并行

### 加入序列/上下文并行

长序列训练需要 SP 或 CP：

\`\`\`
4D 并行 = DP + TP + PP + CP

示例：256 GPU，128K 序列
  TP = 8
  PP = 2
  CP = 4
  DP = 4
  总计: 8 × 2 × 4 × 4 = 256 GPU
\`\`\`

### SP 与 TP 的关系

Megatron 的 SP 与 TP **共享通信组**：

- SP 和 TP 使用相同的 GPU 集合
- SP 不增加 GPU 数量，只改变激活的分布

因此 4D 并行中的 "S" 通常与 T 合并计数。

### CP 的独立性

CP 可以独立于 TP：

- CP 组内做 Ring Attention 或 All2All
- CP 组可以跨机（长序列需要很多 GPU）

## 7.8.4 5D 并行

### 加入专家并行

MoE 模型的完整并行：

\`\`\`
5D 并行 = DP + TP + PP + CP + EP

示例：Mixtral 8×7B 训练
  TP = 4 (每专家内)
  EP = 8 (8 个专家)
  PP = 2
  DP = 4
  总计: 4 × 8 × 2 × 4 = 256 GPU
  (EP 和 TP 通常在同一组 GPU 上交替)
\`\`\`

### EP 与其他维度的交互

EP 的 All2All 与其他并行的通信可能冲突：

- EP All2All 在专家并行组内
- TP AllReduce 在张量并行组内
- 需要协调通信顺序

### 混合并行组

实际中，EP 和 DP 可能**共享 GPU 维度**：

\`\`\`
物理布局: 32 GPU
  TP = 8 (同机)
  EP × DP = 4 (跨机)
  
可以是:
  EP = 4, DP = 1 (纯专家并行)
  EP = 2, DP = 2 (混合)
  EP = 1, DP = 4 (纯数据并行)
\`\`\`

## 7.8.5 配置设计原则

### 显存约束

首先确保模型能装下：

1. 估算单卡显存需求
2. 选择 TP 使单层能装下
3. 选择 PP 使所有层能装下
4. 选择 FSDP 级别（ZeRO-1/2/3）

### 通信效率

然后优化通信：

1. TP 限制在机内（NVLink）
2. PP 的 stage 数不宜过多（气泡）
3. DP 越大越好（吞吐量）
4. CP 根据序列长度决定

### 计算效率

最后优化计算：

1. 避免太小的 micro-batch（GPU 利用率低）
2. 避免过多的梯度累积（通信延迟）
3. 专家负载均衡

\`\`\`mermaid
graph TD
    A[确定显存约束] --> B[选择TP使单层装下]
    B --> C[选择PP使所有层装下]
    C --> D[选择FSDP级别]
    D --> E[优化通信]
    E --> F["TP限制在机内(NVLink)"]
    F --> G[PP stage数不宜过多]
    G --> H[最大化DP度数]
    H --> I[根据序列长度决定CP]
\`\`\`

## 7.8.6 典型配置示例

### LLaMA-70B (Dense)

\`\`\`
硬件: 64 × A100-80GB
模型: 70B 参数

配置 A (Megatron 风格):
  TP = 8
  PP = 2
  DP = 4
  
配置 B (FSDP 风格):
  TP = 1
  PP = 1
  DP = 64 (FSDP FULL_SHARD)
\`\`\`

### Mixtral 8×7B (MoE)

\`\`\`
硬件: 32 × A100-80GB
模型: 8 专家，每个 7B

配置:
  TP = 4
  EP = 2
  DP = 4
  (PP = 1, 单层可装下)
\`\`\`

### GPT-4 级别 (推测)

\`\`\`
硬件: 数千 GPU
模型: ~1T 参数 (MoE)

推测配置:
  TP = 8
  PP = 8-16
  EP = 8-16
  DP = 大
  CP = 用于长上下文训练
\`\`\`

## 7.8.7 框架支持

### Megatron-LM

Megatron 原生支持 3D + SP：

\`\`\`bash
--tensor-model-parallel-size 8 \\
--pipeline-model-parallel-size 4 \\
--sequence-parallel \\
--context-parallel-size 4
\`\`\`

### DeepSpeed

DeepSpeed 支持 ZeRO + 3D + MoE：

\`\`\`json
{
    "zero_optimization": {"stage": 3},
    "pipeline": {"stages": 4},
    "moe": {"ep_size": 8}
}
\`\`\`

### Megatron-DeepSpeed

结合两者优势：

- Megatron 的 TP/PP/SP
- DeepSpeed 的 ZeRO/MoE

### PyTorch 原生

PyTorch 2.0+ 的 \`DeviceMesh\` 支持多维并行：

\`\`\`python
from torch.distributed.device_mesh import init_device_mesh

# 定义 2D mesh: DP × TP
mesh = init_device_mesh("cuda", (4, 8), mesh_dim_names=("dp", "tp"))
\`\`\`

## 7.8.8 调优实践

### Profiling

使用工具分析瓶颈：

\`\`\`bash
# NVIDIA Nsight Systems
nsys profile python train.py

# PyTorch Profiler
with torch.profiler.profile(...) as prof:
    train_step()
prof.export_chrome_trace("trace.json")
\`\`\`

### 常见问题诊断

| 现象 | 可能原因 | 解决方案 |
|------|----------|----------|
| GPU 利用率低 | Micro-batch 太小 | 增大 batch 或减少 PP |
| 通信占比高 | TP 跨机 | TP 限制在机内 |
| 显存溢出 | 激活值过大 | 启用激活重计算或 CP |
| PP 气泡大 | 微批次少 | 增加微批次或用交错调度 |
| MoE 负载不均 | 路由不均匀 | 调整负载均衡损失权重 |

### 迭代调优流程

1. **基线配置**：从简单开始（如 FSDP only）
2. **识别瓶颈**：profiling 找出最慢的部分
3. **针对性优化**：加入合适的并行维度
4. **验证正确性**：检查 loss 曲线和收敛性
5. **重复迭代**：直到达到目标效率
`
    },
    {
      id: "adv-08-01-intro",
      title: "8.1 第八章 AI for Science",
      file: "大模型教程/08-AI-for-Science/00-引言.md",
      difficulty: "中级-高级",
      duration: "0.5h",
      week: 0,
      phase: 0,
      keywords: ["第八章", "AI", "for", "Science", "AlphaFold", "Transformer"],
      content: `# 第八章 AI for Science

科学研究正在经历一场深刻变革。传统的"假设-实验-验证"范式正被数据驱动的方法所增强，深度学习已在蛋白质结构预测、分子设计、材料发现等领域取得突破性进展。本章介绍 AI for Science 的两个代表性方向：AlphaFold 与图神经网络。

## 科学发现的新范式

科学研究可以分为四种范式：

1. **实验科学**：观察和实验（数千年）
2. **理论科学**：数学模型和推导（数百年）
3. **计算科学**：数值模拟和仿真（数十年）
4. **数据科学**：从数据中发现规律（近年）

AI for Science 代表了第四范式的成熟，其特点是：

- 直接从海量数据中学习复杂模式
- 处理传统方法难以建模的高维问题
- 加速从假设到验证的周期

## 深度学习的独特优势

科学问题往往涉及复杂的结构和相互作用，深度学习提供了强大的工具：

| 科学问题 | 数据特点 | 深度学习方法 |
|----------|----------|--------------|
| 蛋白质结构 | 序列 + 三维结构 | Transformer + 注意力 |
| 分子性质 | 图结构 | 图神经网络 |
| 物理模拟 | 时空数据 | 神经算子 |
| 基因组学 | 长序列 | CNN + Transformer |

## 章节内容

本章聚焦两个方向：

**AlphaFold**：蛋白质结构预测的里程碑。从序列预测三维结构，解决了生物学五十年的难题。AlphaFold 的成功展示了深度学习在科学发现中的巨大潜力。

**图神经网络**（GNN）：处理图结构数据的通用框架。分子、晶体、社交网络都可以表示为图，GNN 能够学习图中节点和边的表示，广泛应用于药物发现、材料设计等领域。

## 与大语言模型的交汇

AI for Science 与大语言模型正在融合：

- **科学文献理解**：LLM 辅助阅读和总结论文
- **假设生成**：LLM 提出新的研究方向
- **代码生成**：LLM 生成科学计算代码
- **多模态科学**：结合文本、图像、分子结构

这种融合正在催生新的科学发现工具。
`
    },
    {
      id: "adv-08-02-alphafold",
      title: "8.1 AlphaFold：蛋白质结构预测",
      file: "大模型教程/08-AI-for-Science/01-AlphaFold.md",
      difficulty: "中级-高级",
      duration: "0.5h",
      week: 0,
      phase: 0,
      keywords: ["AlphaFold：蛋白质结构预测", "AlphaFold", "DeepMind", "CASP14"],
      content: `# 8.1 AlphaFold：蛋白质结构预测

**AlphaFold** 是 DeepMind 开发的蛋白质结构预测系统，在 2020 年的 CASP14 竞赛中取得了革命性突破。AlphaFold 能够从氨基酸序列直接预测蛋白质的三维结构，精度接近实验方法，解决了困扰生物学界五十年的难题。

想象一下折纸：你手里拿到一张方方正正的纸（氨基酸序列），上面印着折痕线（序列中蕴含的物理化学信息）。虽然折痕线全部可见，但如果不亲手去折，你很难想象最终会折出一只纸鹤还是一朵玫瑰。蛋白质折叠问题的核心困难就在这里——知道"纸"是什么样，并不意味着知道最终的立体形状。AlphaFold 做到的事，相当于让计算机只看折痕线，就能精确预测折纸的最终造型。

## 8.1.1 蛋白质折叠问题

### 从序列到结构

蛋白质是由 20 种氨基酸组成的链状分子。氨基酸序列（一级结构）决定了蛋白质最终折叠成的三维结构（三级结构）。

**Anfinsen 假说**：蛋白质的氨基酸序列完全决定其三维结构。

但从序列预测结构极其困难：

- **组合爆炸**：一个 100 残基的蛋白质有约 $10^{100}$ 种可能构象
- **Levinthal 悖论**：随机搜索需要天文数字的时间
- **物理建模复杂**：涉及复杂的原子间相互作用

回到折纸的场景：假设一张纸上有 100 条折痕，每条折痕可以选择向上折或向下折、折多大角度——排列组合之后的可能性是天文数字。然而自然界的蛋白质在毫秒级别就能折好，说明它们并不是在"盲目尝试"，而是沿着能量最低的路径快速收敛。这个巨大的反差，就是 Levinthal 悖论的精髓。

### 传统方法

**同源建模**：如果已知相似序列的结构，可以借鉴。但限于有模板的情况。

**从头预测**：基于物理能量函数搜索最低能量构象。计算量巨大，精度有限。

**片段组装**：用已知结构的片段组装新结构。如 Rosetta。

### CASP 竞赛

**CASP**（Critical Assessment of protein Structure Prediction）是蛋白质结构预测的奥林匹克，每两年举办一次。AlphaFold 2 在 CASP14（2020）中的表现震惊了学界：

- 中值 GDT-TS 分数：92.4/100
- 接近实验精度（约 90 为实验级）
- 远超第二名和历史最佳

## 8.1.2 AlphaFold 2 架构

AlphaFold 2 的整体流程可以概括为以下管线：

\`\`\`mermaid
graph LR
    A[氨基酸序列] --> B[MSA特征提取]
    A --> C[配对表示初始化]
    B --> D[Evoformer]
    C --> D
    D --> E[Structure Module]
    E --> F[3D坐标预测]
    F --> G{循环细化}
    G -->|反馈| D
    G -->|收敛| H[最终结构]
\`\`\`

### 输入表示

AlphaFold 2 的输入包含两部分：

**多序列比对**（MSA）：将目标序列与数据库中的同源序列比对，得到 $N_{\\text{seq}} \\times L$ 的矩阵。MSA 蕴含了进化信息：共变的位置往往在空间上接近。

这就像你在研究一种折纸方式时，收集了世界各地上百位折纸爱好者对同一图案的折法变体。虽然每个人折出来的细节略有不同，但关键折痕总是同时出现——如果某位爱好者把第 3 条折痕换了方向，第 47 条折痕也随之改变。这种"共变"模式正是 MSA 提供的核心线索：两个位置总是一起变化，暗示它们在最终的三维结构中彼此靠近。

**配对表示**（Pair representation）：$L \\times L$ 的矩阵，编码残基对之间的关系。初始化可以来自模板或序列特征。

### Evoformer

**Evoformer** 是 AlphaFold 2 的核心模块，交替更新 MSA 表示和配对表示。可以把 Evoformer 想象成一个反复传阅的讨论会：先让同一张折纸图案内部的各条折痕交流信息（行注意力），再让不同爱好者之间对比笔记（列注意力），最后把所有汇总的线索写到一张大地图上（配对表示更新）。

**MSA 行注意力**：序列内部的注意力，学习残基之间的关系

$$\\mathbf{m}_{si} \\leftarrow \\text{RowAttention}(\\mathbf{m}_{s:}, \\mathbf{z})$$

其中 $\\mathbf{m}_{si}$ 为第 $s$ 条序列中第 $i$ 个残基的 MSA 表示，$\\mathbf{m}_{s:}$ 表示该序列的整行特征，$\\mathbf{z}$ 为配对表示矩阵。行注意力以配对表示作为偏置，在同一序列内部建立残基间的上下文关联。

**MSA 列注意力**：跨序列的注意力，学习进化模式

$$\\mathbf{m}_{si} \\leftarrow \\text{ColAttention}(\\mathbf{m}_{:i})$$

其中 $\\mathbf{m}_{:i}$ 表示所有序列在位置 $i$ 上的特征列向量。列注意力跨不同同源序列聚合信息，捕获进化过程中位置 $i$ 的共变模式。

举个例子：行注意力好比你阅读一份折纸说明书时，注意到第 3 步和第 7 步之间存在关联；列注意力好比你翻看多份说明书后发现，不同版本在第 5 步都出现了类似的折法——这暗示第 5 步是一个结构上的关键节点。

**配对更新**：三角形注意力和三角形乘法更新

$$\\mathbf{z}_{ij} \\leftarrow \\text{TriangleAttention}(\\mathbf{z})$$
$$\\mathbf{z}_{ij} \\leftarrow \\text{TriangleMultiplication}(\\mathbf{z})$$

其中 $\\mathbf{z}_{ij}$ 为配对表示矩阵中残基 $i$ 与残基 $j$ 之间的关系编码，$\\mathbf{z}$ 为完整的 $L \\times L$ 配对表示。三角形注意力沿行或列对 $\\mathbf{z}$ 做注意力更新，三角形乘法则通过中间残基 $k$ 以乘法方式融合 $\\mathbf{z}_{ik}$ 和 $\\mathbf{z}_{kj}$ 来更新 $\\mathbf{z}_{ij}$。

**三角形约束**的动机：如果残基 $i$ 接近 $j$，$j$ 接近 $k$，则 $i$ 应该接近 $k$（三角不等式）。假设你正在确定地图上三个城市的位置——已知北京到上海 1000 公里，上海到杭州 200 公里，那么北京到杭州不可能是 5000 公里。三角形注意力将这种朴素的几何直觉注入到了网络结构中。

### Structure Module

Structure Module 将抽象表示转化为具体的三维坐标——从"知道谁和谁应该靠近"过渡到"具体放在空间中的什么位置"。

**IPA**（Invariant Point Attention）：一种对旋转和平移不变的注意力机制。为什么需要"不变"？因为同一个蛋白质无论你怎么旋转或平移它，形状都不应该改变。这就像你拍一张集体照，无论把照片倒过来看还是左右翻转，人与人之间的距离关系不会变。

**刚体变换**：将每个残基表示为一个刚体（局部坐标系），迭代更新位置和朝向

**侧链预测**：在主链确定后，预测侧链的扭转角。如果把主链比作树干，侧链就是伸出去的树枝——树干的走向确定了，树枝朝哪个方向生长就容易推断得多。

### 损失函数

AlphaFold 使用多种损失的组合：

**FAPE**（Frame Aligned Point Error）：对齐后的坐标误差

$$L_{\\text{FAPE}} = \\frac{1}{N^2} \\sum_{i,j} \\| T_i^{-1} \\mathbf{x}_j - T_i^{-1} \\hat{\\mathbf{x}}_j \\|$$

其中 $N$ 为残基总数，$T_i \\in SE(3)$ 为残基 $i$ 的局部坐标系（刚体变换），$\\mathbf{x}_j$ 和 $\\hat{\\mathbf{x}}_j$ 分别为残基 $j$ 的预测坐标和真实坐标，$T_i^{-1}$ 将全局坐标变换到残基 $i$ 的局部参考系下。FAPE 的核心思想是：在每个残基的局部坐标系中分别度量其他残基的位置误差，然后取平均。这种设计使得损失对全局平移和旋转不敏感，同时能够捕获局部结构的精度。

**辅助损失**：MSA 掩码预测、配对距离预测等

**pLDDT**：per-residue 置信度预测

### 循环细化

AlphaFold 采用**循环**（recycling）机制：

1. 首次预测得到初步结构
2. 将结构信息反馈到输入
3. 再次运行 Evoformer 和 Structure Module
4. 重复 3 次

每次循环利用上一次的结构预测，逐步精化。这和我们写文章的过程很像：初稿写完之后，你通读一遍（第一次循环），发现第三段和结尾有矛盾，于是调整；再读一遍（第二次循环），语句更通顺了但某个论据不够有力，继续打磨。每轮修改都在前一版的基础上做精细调整，而不是从白纸重写。

## 8.1.3 AlphaFold 3

### 主要改进

**AlphaFold 3**（2024）将预测范围扩展到整个分子复合物：

- 蛋白质-蛋白质相互作用
- 蛋白质-核酸复合物
- 蛋白质-小分子结合

### 扩散模型

AlphaFold 3 引入了**扩散模型**进行结构生成：

- 训练时：向真实结构添加噪声
- 推理时：从噪声逐步去噪得到结构

假设你在一间完全漆黑的房间里寻找出口。扩散模型的思路是先随机乱走（纯噪声），然后每一步根据"哪里更像出口"的线索逐渐逼近正确位置。这种方式天然适合表达不确定性：如果蛋白质可能有多种构象，模型可以从不同的噪声起点出发，探索到不同的合理结构。

### 统一架构

AlphaFold 3 使用统一的 token 表示处理不同分子类型：

- 氨基酸
- 核苷酸
- 小分子原子
- 离子

这使得模型可以端到端地预测复合物结构。

## 8.1.4 应用与影响

### 科学发现

AlphaFold 已预测了超过 2 亿种蛋白质的结构，覆盖了几乎所有已知蛋白质。这些结构：

- 公开可用（AlphaFold Protein Structure Database）
- 加速了药物发现、酶工程、生物研究

### 药物设计

蛋白质结构是药物设计的基础：

- 了解靶点结构，设计结合分子
- AlphaFold 提供了以前无法获得的结构信息
- 显著降低了结构解析的成本和时间

### 局限性

AlphaFold 仍有局限：

- **动态性**：蛋白质是动态的，AlphaFold 只预测静态结构
- **构象多样性**：某些蛋白质有多种构象
- **无序区域**：内在无序蛋白质难以预测
- **突变效应**：预测突变对结构的影响仍有挑战

## 8.1.5 技术启示

### 数据与归纳偏置

AlphaFold 的成功结合了：

- **大规模数据**：进化序列（MSA）提供了丰富的共变信息
- **物理约束**：三角形注意力、SE(3) 等变性等编码了物理先验
- **端到端学习**：从序列直接到结构的端到端训练

### 对 LLM 的启示

AlphaFold 的设计思想影响了 LLM：

- **注意力机制**：MSA 和配对表示的交叉注意力
- **迭代精化**：循环机制类似于推理时的迭代思考
- **多尺度表示**：同时维护局部和全局信息

蛋白质语言模型（如 ESM）也借鉴了 Transformer 架构，在序列上预训练。
`
    },
    {
      id: "adv-08-03-gnn",
      title: "8.3 图神经网络",
      file: "大模型教程/08-AI-for-Science/02-图神经网络.md",
      difficulty: "中级-高级",
      duration: "0.5h",
      week: 0,
      phase: 0,
      keywords: ["图神经网络", "CNN", "RNN", "Graph", "Neural", "Network"],
      content: `# 图神经网络

## 图结构数据的普遍性

在科学研究与工程实践中，大量数据天然地以图结构呈现。分子可以表示为原子节点与化学键边的组合，蛋白质相互作用网络刻画了生物功能模块，晶体材料的原子排列形成周期性图结构，社交网络反映人际关系的拓扑特征。这些图结构数据具有以下共同特点：节点数目可变、边的连接模式不规则、全局结构包含丰富的语义信息。

想象一下你小区的社交网络：每个人是一个节点，两个人之间的友谊是一条边。有的人朋友多，有的人朋友少；有的人圈子重叠，有的人各自独立——这种不规则的连接模式正是图结构的特征。传统的深度学习工具就像拿着一把直尺去量一棵树的枝条走向——工具不对。

传统的深度学习方法（如CNN、RNN）针对欧几里得空间中的规则数据（图像、序列）设计，无法直接处理图结构。将图数据强行转换为向量会丢失拓扑信息，而枚举所有节点对的方法在计算上不可行。图神经网络（Graph Neural Network, GNN）的提出正是为了在保持图结构的前提下进行表示学习。

## 消息传递范式

现代图神经网络的核心思想是消息传递（Message Passing），通过迭代地聚合邻居信息来更新节点表示。最直观的理解方式是邻里传言：小区里每个人先向自己的邻居收集消息，汇总之后更新自己对世界的认知。第一轮，你只知道紧邻的情况；第二轮，你通过邻居的邻居获取了更远的信息；几轮之后，整个小区的动态你都心中有数了。

\`\`\`mermaid
graph LR
    A[节点v] --> B[收集邻居消息]
    B --> C[AGGREGATE聚合]
    C --> D[UPDATE更新]
    D --> E[新表示 h_v]
    E --> F{重复k轮}
    F -->|继续| B
    F -->|完成| G[最终节点表示]
\`\`\`

形式化地说，设图 $G = (V, E)$ 包含节点集 $V$ 和边集 $E$，节点 $v$ 的特征为 $\\mathbf{h}_v$，边 $(u, v)$ 的特征为 $\\mathbf{e}_{uv}$。消息传递的一般形式为：

$$\\mathbf{m}_v^{(l)} = \\text{AGGREGATE}^{(l)}\\left(\\left\\{\\mathbf{h}_u^{(l-1)} : u \\in \\mathcal{N}(v)\\right\\}\\right)$$

$$\\mathbf{h}_v^{(l)} = \\text{UPDATE}^{(l)}\\left(\\mathbf{h}_v^{(l-1)}, \\mathbf{m}_v^{(l)}\\right)$$

其中 $\\mathcal{N}(v)$ 表示节点 $v$ 的邻居集合，$l$ 表示层数。AGGREGATE函数将邻居信息汇聚成消息，UPDATE函数结合节点自身信息与消息进行更新。不同的GNN变体主要在这两个函数的设计上有所区别。

## 经典图神经网络架构

### 图卷积网络（GCN）

图卷积网络将卷积操作推广到图结构上。谱方法从图的拉普拉斯矩阵出发，在频域定义卷积；空域方法直接在节点邻域上定义聚合操作。Kipf与Welling提出的GCN采用一阶近似：

$$\\mathbf{H}^{(l)} = \\sigma\\left(\\tilde{\\mathbf{D}}^{-1/2}\\tilde{\\mathbf{A}}\\tilde{\\mathbf{D}}^{-1/2}\\mathbf{H}^{(l-1)}\\mathbf{W}^{(l)}\\right)$$

其中 $\\tilde{\\mathbf{A}} = \\mathbf{A} + \\mathbf{I}$ 是添加自环的邻接矩阵，$\\tilde{\\mathbf{D}}$ 是对应的度矩阵，$\\mathbf{W}^{(l)}$ 是可学习权重。这一形式等价于对节点特征进行加权平均后通过线性变换：

$$\\mathbf{h}_v^{(l)} = \\sigma\\left(\\mathbf{W}^{(l)} \\sum_{u \\in \\mathcal{N}(v) \\cup \\{v\\}} \\frac{\\mathbf{h}_u^{(l-1)}}{\\sqrt{d_v d_u}}\\right)$$

其中 $\\mathbf{h}_v^{(l)}$ 为节点 $v$ 在第 $l$ 层的表示，$d_v$、$d_u$ 分别为节点 $v$ 和 $u$ 的度（含自环），$\\sigma$ 为非线性激活函数。该式等价于对节点及其邻居的特征做度归一化加权平均后，再经过线性变换与激活。

GCN的优势在于简洁高效，但其聚合权重完全由图结构决定，缺乏对不同邻居重要性的区分。回到社交网络的场景：GCN 等于让你的每个邻居说话的音量一样大，而不管对方是一位老街坊还是一个刚搬来的陌生人。显然这不够智能。

### 图注意力网络（GAT）

图注意力网络引入注意力机制，使模型能够学习邻居的重要性权重——也就是说，你会根据每个邻居的可信度来决定听谁的多一点。对于节点 $v$ 及其邻居 $u$，注意力系数计算为：

$$e_{vu} = \\text{LeakyReLU}\\left(\\mathbf{a}^T[\\mathbf{W}\\mathbf{h}_v \\| \\mathbf{W}\\mathbf{h}_u]\\right)$$

$$\\alpha_{vu} = \\text{softmax}_u(e_{vu}) = \\frac{\\exp(e_{vu})}{\\sum_{k \\in \\mathcal{N}(v)} \\exp(e_{vk})}$$

其中 $\\mathbf{W}$ 为共享的线性变换矩阵，$\\mathbf{a}$ 为注意力向量（可学习参数），$\\|$ 表示向量拼接，$e_{vu}$ 为未归一化的注意力分数，$\\alpha_{vu}$ 为经 softmax 归一化后的注意力系数，反映邻居 $u$ 对节点 $v$ 的重要程度。该机制允许模型自动学习哪些邻居的信息更值得关注。

节点更新采用注意力加权聚合：

$$\\mathbf{h}_v^{(l)} = \\sigma\\left(\\sum_{u \\in \\mathcal{N}(v)} \\alpha_{vu} \\mathbf{W}\\mathbf{h}_u^{(l-1)}\\right)$$

每个邻居 $u$ 的特征经线性变换后，由其注意力系数 $\\alpha_{vu}$ 加权求和，再经激活函数得到新表示。

多头注意力机制进一步增强了模型的表达能力：

$$\\mathbf{h}_v^{(l)} = \\Big\\|_{k=1}^K \\sigma\\left(\\sum_{u \\in \\mathcal{N}(v)} \\alpha_{vu}^k \\mathbf{W}^k\\mathbf{h}_u^{(l-1)}\\right)$$

其中 $K$ 为注意力头数，$\\|$ 表示拼接操作，第 $k$ 个头使用独立的参数 $\\mathbf{W}^k$ 和 $\\alpha_{vu}^k$。多头机制允许模型从不同子空间同时关注不同类型的邻居关系。

### GraphSAGE

GraphSAGE（Graph Sample and Aggregate）针对大规模图的可扩展性问题，采用采样与聚合策略。在每一层，从邻居中采样固定数目的节点进行聚合，避免了全图计算。聚合函数可以是均值、最大池化或LSTM：

$$\\mathbf{h}_{\\mathcal{N}(v)}^{(l)} = \\text{AGGREGATE}^{(l)}\\left(\\left\\{\\mathbf{h}_u^{(l-1)} : u \\in \\text{Sample}(\\mathcal{N}(v), K)\\right\\}\\right)$$

$$\\mathbf{h}_v^{(l)} = \\sigma\\left(\\mathbf{W}^{(l)} \\cdot [\\mathbf{h}_v^{(l-1)} \\| \\mathbf{h}_{\\mathcal{N}(v)}^{(l)}]\\right)$$

其中 $\\text{Sample}(\\mathcal{N}(v), K)$ 从邻居中随机采样 $K$ 个节点，$\\|$ 为向量拼接。GraphSAGE 先聚合采样邻居的信息，再与节点自身特征拼接后经线性变换与激活。

这种归纳式（inductive）学习方法使模型能够泛化到训练时未见过的节点。假设你搬到了一个新小区，GraphSAGE 的策略是随机找几个邻居聊天，迅速了解周围环境，而不需要把整个小区所有人全部认识一遍。

## 消息传递的表达能力

### Weisfeiler-Leman测试

消息传递神经网络的表达能力与Weisfeiler-Leman（WL）图同构测试密切相关。1-WL测试通过迭代更新节点颜色来判断两个图是否同构：

$$c_v^{(l)} = \\text{HASH}\\left(c_v^{(l-1)}, \\{\\!\\{c_u^{(l-1)} : u \\in \\mathcal{N}(v)\\}\\!\\}\\right)$$

其中 $\\{\\!\\{\\cdot\\}\\!\\}$ 表示多重集。Xu等人证明，标准的消息传递GNN最多达到1-WL测试的判别能力。这意味着存在1-WL无法区分的非同构图，GNN同样无法区分。

### 图同构网络（GIN）

图同构网络通过设计特殊的聚合函数，达到1-WL测试的上界：

$$\\mathbf{h}_v^{(l)} = \\text{MLP}^{(l)}\\left((1 + \\epsilon^{(l)}) \\cdot \\mathbf{h}_v^{(l-1)} + \\sum_{u \\in \\mathcal{N}(v)} \\mathbf{h}_u^{(l-1)}\\right)$$

其中 $\\epsilon$ 可以是可学习参数或固定为0。GIN使用求和聚合而非均值或最大值，因为求和能够保持多重集的完整信息。举个例子：你问邻居们家里有几只猫，三家都答"两只"。如果取均值或最大值，你得到的都是 2，跟只有一家邻居养了两只猫的情况没法区分。但求和得到 6 对 2，明确区分了两种情况。

### 超越1-WL的方法

为了提升表达能力，研究者提出了多种超越1-WL的方法：

| 方法类别 | 代表工作 | 核心思想 |
|---------|---------|---------|
| 高阶WL | k-GNN | 在k元组上进行消息传递 |
| 子图方法 | ESAN, DS-GNN | 基于子图结构的编码 |
| 距离编码 | DE-GNN | 加入节点间距离信息 |
| 随机特征 | RNI | 添加随机节点标识 |

这些方法在理论表达能力上更强，但通常伴随着更高的计算复杂度。

## 图级任务与池化

许多科学应用需要获得整个图的表示，如分子性质预测、图分类等。图池化（Graph Pooling）将节点表示聚合为图表示。

### 读出函数

如果节点表示是每个人的个人档案，图级表示就像给整个小区写一份总结报告。最简单的方法是对所有节点表示进行置换不变的聚合：

$$\\mathbf{h}_G = \\text{READOUT}\\left(\\left\\{\\mathbf{h}_v^{(L)} : v \\in V\\right\\}\\right)$$

常用的READOUT函数包括求和、均值、最大值及其组合。Set2Set使用注意力机制进行更精细的聚合。

### 层次池化

层次池化方法逐步粗化图结构。DiffPool学习软聚类分配矩阵：

$$\\mathbf{S}^{(l)} = \\text{softmax}\\left(\\text{GNN}_{\\text{pool}}^{(l)}(\\mathbf{A}^{(l)}, \\mathbf{H}^{(l)})\\right)$$

$$\\mathbf{H}^{(l+1)} = {\\mathbf{S}^{(l)}}^T \\mathbf{H}^{(l)}, \\quad \\mathbf{A}^{(l+1)} = {\\mathbf{S}^{(l)}}^T \\mathbf{A}^{(l)} \\mathbf{S}^{(l)}$$

其中 $\\mathbf{S}^{(l)} \\in \\mathbb{R}^{n_l \\times n_{l+1}}$ 为软聚类分配矩阵，每一行表示一个节点被分配到各聚类的概率，$\\mathbf{A}^{(l)}$ 和 $\\mathbf{H}^{(l)}$ 分别为当前层的邻接矩阵与节点特征矩阵。通过分配矩阵的转置乘法，将原图的节点特征和邻接关系“压缩”到粗化后的图结构中，实现层次化池化。

Top-k池化则根据节点得分选择保留的节点：

$$\\text{idx} = \\text{top-k}(\\mathbf{H}^{(l)} \\mathbf{p}, k)$$

$$\\mathbf{H}^{(l+1)} = \\mathbf{H}^{(l)}[\\text{idx}] \\odot \\text{sigmoid}(\\mathbf{H}^{(l)}[\\text{idx}] \\mathbf{p})$$

其中 $\\mathbf{p}$ 为可学习的投影向量，$\\mathbf{H}^{(l)} \\mathbf{p}$ 计算每个节点的重要性得分，top-k 选取得分最高的 $k$ 个节点，$\\odot$ 为逐元素乘法，sigmoid 门控信号对保留节点的特征进行软选择。这种方法直接保留重要节点，丢弃次要节点，更加简洁高效。

## 边特征与几何信息

### 边特征的处理

在分子等应用中，边（化学键）携带重要信息如键类型、键长等。边特征可以在消息计算中使用：

$$\\mathbf{m}_{vu} = \\text{MSG}(\\mathbf{h}_v, \\mathbf{h}_u, \\mathbf{e}_{vu})$$

其中 $\\mathbf{e}_{vu}$ 为边 $(v,u)$ 的特征向量，MSG 函数综合两个端点的节点特征与边特征来计算消息。

MPNN框架提供了统一的边消息传递形式。GatedGCN使用门控机制融合边特征：

$$\\mathbf{m}_{vu} = \\eta_{vu} \\odot \\mathbf{W}\\mathbf{h}_u, \\quad \\eta_{vu} = \\sigma(\\mathbf{e}_{vu})$$

其中 $\\eta_{vu}$ 为由边特征经 sigmoid 激活得到的门控信号（取值在 0 到 1 之间），$\\odot$ 为逐元素乘法。门控信号根据边的属性（如键类型、键长等）对邻居信息进行选择性通过。

### 几何图神经网络

在分子和材料模拟中，原子的三维坐标至关重要。这就像在小区里不仅要知道谁和谁是朋友，还得知道每家每户的具体坐标——住在隔壁和住在十公里外的邻居，关系强度截然不同。几何图神经网络需要满足几何对称性：

- **平移等变性**：整体平移不改变相对位置
- **旋转等变性**：输出随输入旋转而相应旋转
- **置换等变性**：节点重排序不改变结果

SchNet使用径向基函数编码原子间距离：

$$\\mathbf{m}_{vu} = \\mathbf{h}_u \\odot \\mathbf{W} \\cdot \\text{RBF}(\\|\\mathbf{r}_v - \\mathbf{r}_u\\|)$$

其中 $\\mathbf{r}_v$、$\\mathbf{r}_u$ 分别为原子 $v$ 和 $u$ 的三维坐标，$\\|\\mathbf{r}_v - \\mathbf{r}_u\\|$ 为原子间距离，RBF 为径向基函数将标量距离展开为高维特征向量，$\\mathbf{W}$ 为可学习权重。该式通过距离信息调制邻居特征的传递强度，使得较远的原子贡献较少、较近的原子贡献较多。

DimeNet进一步加入角度信息，PaiNN和EGNN实现了完整的E(3)等变性。

## 科学应用实例

### 分子性质预测

分子可以自然地表示为图，原子为节点，化学键为边。GNN在药物发现中广泛应用于：

- **ADMET预测**：吸收、分布、代谢、排泄、毒性
- **分子生成**：设计满足特定性质的新分子
- **反应预测**：预测化学反应产物
- **构象生成**：预测分子三维结构

预训练策略（如对比学习、掩码预测）能够有效提升下游任务性能。

### 材料科学

晶体材料的周期性结构需要特殊处理。常见做法是在单胞内建图，并考虑周期性边界条件下的邻居。CGCNN、MEGNet、M3GNet等模型在材料性质预测、势能面拟合方面取得成功。

材料图神经网络的典型流程：

\`\`\`
原子结构 → 建图（邻居搜索）→ 初始特征（元素嵌入）→ 消息传递 → 池化 → 性质预测
\`\`\`

### 动力学模拟

GNN可以作为分子动力学的力场替代品。给定原子位置，预测原子受力和系统能量：

$$E = \\text{GNN}_E(\\{(\\mathbf{r}_i, z_i)\\}), \\quad \\mathbf{F}_i = -\\frac{\\partial E}{\\partial \\mathbf{r}_i}$$

其中 $E$ 为系统总能量，$\\mathbf{r}_i$ 为原子 $i$ 的三维坐标，$z_i$ 为其原子序数（元素类型），$\\mathbf{F}_i$ 为原子 $i$ 所受的力。力由能量对坐标的负梯度得到，这一物理约束保证了力场的守恒性。

NequIP、Allegro等等变GNN力场在精度和效率之间取得良好平衡，使长时间尺度的分子动力学模拟成为可能。

## 大规模图的训练策略

科学数据中常出现大规模图（百万节点以上），全图训练面临显存限制。

### Mini-batch训练

GraphSAGE风格的采样方法对每个目标节点采样固定数目的邻居，形成计算子图。ClusterGCN先将图聚类，每个batch包含若干聚类及其内部边。GraphSAINT采用更灵活的子图采样策略。

### 预计算方法

对于节点分类任务，可以预先计算消息传递的结果。SGC（Simplified GCN）移除非线性激活：

$$\\mathbf{H}^{(L)} = \\tilde{\\mathbf{A}}^L \\mathbf{X} \\mathbf{W}$$

其中 $\\tilde{\\mathbf{A}}$ 为归一化邻接矩阵，$L$ 为传播层数，$\\mathbf{X}$ 为原始节点特征，$\\mathbf{W}$ 为可学习权重。由于移除了非线性激活，$\\tilde{\\mathbf{A}}^L \\mathbf{X}$ 可以在训练前一次性预计算，之后，训练退化为简单的线性模型，极大提升效率。

### 异构图与知识图谱

科学知识通常以异构图或知识图谱形式组织，包含多种类型的节点和边。关系图卷积网络（R-GCN）为每种关系类型学习独立的权重：

$$\\mathbf{h}_v^{(l)} = \\sigma\\left(\\sum_{r \\in \\mathcal{R}} \\sum_{u \\in \\mathcal{N}_r(v)} \\frac{1}{|\\mathcal{N}_r(v)|} \\mathbf{W}_r^{(l)} \\mathbf{h}_u^{(l-1)}\\right)$$

其中 $\\mathcal{R}$ 为关系类型集合，$\\mathcal{N}_r(v)$ 为节点 $v$ 在关系 $r$ 下的邻居集，$\\mathbf{W}_r^{(l)}$ 为关系 $r$ 在第 $l$ 层的独立权重矩阵。各关系的邻居特征经各自的线性变换后求和，并以邻居数 $|\\mathcal{N}_r(v)|$ 归一化，从而在一个统一框架内处理多种类型的边关系。

这种方法可以整合文献、实验、数据库等多源科学知识。

图神经网络通过在图结构上进行端到端的表示学习，为科学数据分析提供了强大的工具。回头看整个发展脉络：最早的 GCN 就像让所有邻居平等发言，GAT 加入了“谁的话更值得听”的权重，GraphSAGE 解决了“小区太大无法每个人都聊”的问题，而几何 GNN 则进一步将“住在哪里”的空间信息纳入考量。从分子模拟到材料设计，从蛋白质结构预测到知识整合，GNN正在成为AI for Science的核心技术之一。随着几何深度学习、等变网络等方向的发展，图神经网络在精确建模物理对称性、处理大规模科学数据方面将发挥更大作用。
`
    },
    {
      id: "adv-09-01-intro",
      title: "9.1 具身智能引言",
      file: "大模型教程/09-具身智能/00-引言.md",
      difficulty: "中级-高级",
      duration: "0.5h",
      week: 0,
      phase: 0,
      keywords: ["具身智能引言", "Embodied", "Intelligence", "API", "OpenAI", "Gym"],
      content: `# 具身智能引言

## 从感知智能到具身智能

人工智能的发展经历了从符号推理到感知智能再到生成智能的演进。然而，无论是图像识别、语言理解还是内容生成，这些能力都在数字世界中运行，与物理世界之间存在着本质的隔阂。具身智能（Embodied Intelligence）试图弥合这一鸿沟，让智能体通过物理身体与真实世界交互，在交互中学习、适应和进化。

具身智能的核心假设是：真正的智能必须具有身体，并通过身体与环境的主动交互来获得。这一观点可追溯至现象学传统——梅洛-庞蒂指出，身体不仅是认知的载体，更是认知的构成要素。在机器人学与人工智能的交叉领域，具身智能强调感知、决策、执行的闭环统一。

## 具身智能的研究范式

传统机器人控制采用感知-规划-执行的流水线架构，各模块独立开发后串联。这种方法在结构化环境中有效，但面对开放世界的复杂性时显得力不从心。现代具身智能研究转向端到端学习，直接从传感器输入到执行器输出建立映射：

| 范式 | 感知 | 决策 | 执行 | 特点 |
|-----|------|------|------|------|
| 经典控制 | 状态估计 | 运动规划 | 轨迹跟踪 | 模块化、可解释 |
| 行为克隆 | 神经网络 | 端到端 | 直接输出 | 数据驱动、快速部署 |
| 强化学习 | 神经网络 | 策略优化 | 动作采样 | 自主探索、在线适应 |
| 基础模型 | 预训练视觉 | 语言推理 | 技能调用 | 泛化能力强 |

端到端方法的优势在于能够发现人类难以手工设计的控制策略，但同时带来了可解释性与安全性的挑战。

## 仿真环境的核心作用

真实机器人的数据采集成本高昂且存在安全风险，仿真环境成为具身智能研究的关键基础设施。高质量的仿真器需要提供：

- **物理真实性**：准确的刚体动力学、接触力学、软体仿真
- **渲染真实性**：逼真的视觉外观，支持域随机化
- **交互便捷性**：标准化的API接口，便于算法开发
- **并行效率**：支持大规模并行采样，加速训练

OpenAI Gym确立了强化学习环境的标准接口，其后继者Gymnasium延续了这一传统。MuJoCo提供了高效准确的物理仿真，而Isaac Gym、Isaac Sim等利用GPU加速实现了大规模并行。Habitat、AI2-THOR则专注于室内导航与操作场景。

## Sim-to-Real迁移

仿真与现实之间存在不可避免的差异（Reality Gap），导致仿真中训练的策略难以直接部署到真实机器人。缩小这一差距的方法包括：

**域随机化**：在仿真中随机化物理参数、视觉外观，使策略对扰动具有鲁棒性：
- 物理随机化：质量、摩擦系数、关节阻尼
- 视觉随机化：光照、纹理、相机参数
- 动力学随机化：传动延迟、传感器噪声

**域适应**：利用少量真实数据调整仿真策略或学习仿真-现实的映射。

**系统辨识**：精确测量真实系统参数并在仿真中复现。

成功的Sim-to-Real案例表明，结合大规模仿真训练与精心设计的迁移策略，可以实现灵巧操作、敏捷运动等复杂技能。

## 机器人形态的多样性

具身智能的载体——机器人——呈现出丰富的形态多样性。不同形态适应不同的任务场景：

**机械臂**是工业与服务场景中最常见的形态，具有成熟的运动学与动力学理论基础。多自由度的冗余设计提供了灵活性，末端执行器（夹爪、吸盘、灵巧手）决定了操作能力的边界。

**四足机器人**在非结构化地形中展现出优越的稳定性与通过性。相比轮式机器人，四足平台能够跨越障碍、攀爬台阶、适应崎岖地面。Boston Dynamics的Spot、宇树科技的产品代表了这一领域的工程高度。

**双足机器人**追求人形设计，旨在复用人类环境中的基础设施。双足行走的动态平衡是经典的控制难题，涉及步态生成、反应式稳定、全身协调等子问题。人形机器人被视为通用具身智能的终极载体。

## 大模型与具身智能的融合

大语言模型与视觉-语言模型的突破为具身智能带来了新的可能性。这些模型具备：

- 丰富的世界知识与常识推理能力
- 自然语言理解与指令跟随能力
- 视觉场景理解与物体识别能力

将大模型作为具身智能的"大脑"，可以实现：
- 自然语言任务指定："请把红色杯子放到桌子上"
- 任务规划与分解：将高层目标拆解为原子动作
- 常识推理：理解物理规律、因果关系
- 交互式学习：通过对话获取人类反馈

代表性工作如PaLM-E、RT-2将视觉-语言模型与机器人动作空间直接对接，实现了零样本泛化与指令跟随。

## 本章内容安排

本章系统介绍具身智能的核心技术与典型平台。首先讨论仿真环境与Sim-to-Real迁移方法，这是具身智能研究的基础设施。随后分析三种主要机器人形态的控制技术：机械臂操作侧重于抓取与精细操作，四足机器人聚焦于运动控制与地形适应，双足机器人则需要解决动态平衡与人形设计的独特挑战。

具身智能代表了人工智能从数字世界走向物理世界的关键一步。随着仿真技术、强化学习、大模型的协同进步，通用具身智能正在从愿景逐步走向现实。
`
    },
    {
      id: "adv-09-02-gym-sim2real",
      title: "9.2 仿真环境与Sim-to-Real",
      file: "大模型教程/09-具身智能/01-Gym与Sim2Real.md",
      difficulty: "中级-高级",
      duration: "1h",
      week: 0,
      phase: 0,
      keywords: ["仿真环境与Sim", "to", "Real", "Sim", "Gym", "Gymnasium"],
      content: `# 仿真环境与Sim-to-Real

假设你要培训一名飞行员。直接让新手上真机练习显然太危险、太昂贵，所以航空业发明了飞行模拟器——在安全的环境中无限次练习起降、应对紧急情况、练习各种天气条件。具身智能的仿真训练思路完全一样：先在虚拟世界里让机器人反复练习，然后再迁移到真实世界。但模拟器和现实之间的差距（就像飞行模拟器再逼真也不是真飞机），是这条路径上最大的挑战。

## 强化学习环境接口标准

### Gym/Gymnasium接口

OpenAI Gym（现由Farama Foundation维护，更名为Gymnasium）确立了强化学习环境的标准接口。其核心抽象极为简洁，本质上就是两个动作的循环：智能体观察环境→做出决策→环境反馈结果→智能体再观察……这就像飞行模拟器的工作流程：飞行员看仪表盘（观察），拉操纵杆（动作），模拟器给出飞机的新状态（转移）：

\`\`\`mermaid
graph LR
    A[agent.act] -->|动作| B[env.step]
    B -->|观测, 奖励, done| C[agent.learn]
    C -->|更新策略| A
\`\`\`

\`\`\`python
import gymnasium as gym

env = gym.make("CartPole-v1")
observation, info = env.reset(seed=42)

for _ in range(1000):
    action = policy(observation)  # 智能体策略
    observation, reward, terminated, truncated, info = env.step(action)
    
    if terminated or truncated:
        observation, info = env.reset()

env.close()
\`\`\`

接口的核心方法包括：

| 方法 | 输入 | 输出 | 说明 |
|-----|------|------|------|
| \`reset()\` | seed, options | observation, info | 重置环境到初始状态 |
| \`step()\` | action | obs, reward, terminated, truncated, info | 执行动作，返回转移 |
| \`render()\` | - | frame/None | 可视化当前状态 |
| \`close()\` | - | - | 释放资源 |

**空间定义**是Gym的另一核心概念。动作空间（action_space）与观测空间（observation_space）明确定义了有效的动作与观测范围。以飞行模拟器来说：动作空间就是操纵杆能推的范围（连续空间），而“打开起落架”或“收起”就是离散空间：

\`\`\`python
from gymnasium.spaces import Box, Discrete, Dict, Tuple

# 连续动作空间：[-1, 1]^3
action_space = Box(low=-1.0, high=1.0, shape=(3,), dtype=np.float32)

# 离散动作空间：{0, 1, 2, 3}
action_space = Discrete(4)

# 复合空间
observation_space = Dict({
    "image": Box(0, 255, (84, 84, 3), dtype=np.uint8),
    "state": Box(-np.inf, np.inf, (10,), dtype=np.float32)
})
\`\`\`

### 环境包装器

Wrapper机制允许在不修改原始环境的前提下添加功能：

\`\`\`python
class FrameStack(gym.Wrapper):
    """堆叠连续帧以提供时序信息"""
    def __init__(self, env, num_stack=4):
        super().__init__(env)
        self.num_stack = num_stack
        self.frames = deque(maxlen=num_stack)
        
    def reset(self, **kwargs):
        obs, info = self.env.reset(**kwargs)
        for _ in range(self.num_stack):
            self.frames.append(obs)
        return self._get_obs(), info
    
    def step(self, action):
        obs, reward, term, trunc, info = self.env.step(action)
        self.frames.append(obs)
        return self._get_obs(), reward, term, trunc, info
    
    def _get_obs(self):
        return np.stack(self.frames, axis=0)
\`\`\`

常用的预置Wrapper包括：
- \`TimeLimit\`：限制episode最大步数
- \`RecordVideo\`：录制环境视频
- \`NormalizeObservation\`：观测归一化
- \`ClipAction\`：动作裁剪

### 向量化环境

强化学习训练需要大量样本，向量化环境通过并行多个环境实例提升采样效率。这就像航空学校同时开设 16 台飞行模拟器，每台上都有一个学员在练习，所有经验汇总起来共同优化一套飞行策略：

\`\`\`python
envs = gym.vector.make("HalfCheetah-v4", num_envs=16, asynchronous=True)
observations, infos = envs.reset()

# 批量执行动作
actions = policy(observations)  # shape: (16, action_dim)
observations, rewards, terminateds, truncateds, infos = envs.step(actions)
\`\`\`

同步模式（SyncVectorEnv）等待所有环境完成后返回，异步模式（AsyncVectorEnv）使用多进程实现真正的并行。

## 物理仿真引擎

### MuJoCo

MuJoCo（Multi-Joint dynamics with Contact）是DeepMind维护的高性能物理仿真引擎，以其数值稳定性和仿真速度著称。

**模型定义**采用MJCF（MuJoCo XML）格式：

\`\`\`xml
<mujoco model="simple_arm">
  <worldbody>
    <body name="link1" pos="0 0 0">
      <joint name="joint1" type="hinge" axis="0 0 1"/>
      <geom type="capsule" size="0.05" fromto="0 0 0 0.5 0 0"/>
      <body name="link2" pos="0.5 0 0">
        <joint name="joint2" type="hinge" axis="0 0 1"/>
        <geom type="capsule" size="0.04" fromto="0 0 0 0.4 0 0"/>
      </body>
    </body>
  </worldbody>
  <actuator>
    <motor joint="joint1" ctrlrange="-1 1"/>
    <motor joint="joint2" ctrlrange="-1 1"/>
  </actuator>
</mujoco>
\`\`\`

**核心数据结构**包含模型参数（mjModel）与仿真状态（mjData）：

\`\`\`python
import mujoco

model = mujoco.MjModel.from_xml_path("arm.xml")
data = mujoco.MjData(model)

# 设置关节位置
data.qpos[:] = [0.1, 0.2]
# 前向动力学
mujoco.mj_forward(model, data)
# 获取末端位置
end_effector_pos = data.site_xpos[0]

# 仿真一步
data.ctrl[:] = [0.5, -0.3]  # 控制输入
mujoco.mj_step(model, data)
\`\`\`

MuJoCo的优势在于：
- 快速准确的接触动力学
- 自动计算雅可比矩阵与质量矩阵
- 支持柔性体与肌腱建模
- 开源且持续维护

### Isaac Gym/Isaac Sim

NVIDIA Isaac平台利用GPU实现大规模并行物理仿真，仿真速度可达数万FPS。

**Isaac Gym**直接在GPU上运行物理仿真，与PyTorch深度集成：

\`\`\`python
from isaacgym import gymapi, gymtorch

gym = gymapi.acquire_gym()
sim = gym.create_sim(0, 0, gymapi.SIM_PHYSX, sim_params)

# 创建多个环境实例
for i in range(num_envs):
    env = gym.create_env(sim, lower, upper, num_per_row)
    actor = gym.create_actor(env, asset, pose, "robot", i, 0)

# GPU张量直接获取状态
root_states = gymtorch.wrap_tensor(gym.acquire_actor_root_state_tensor(sim))
\`\`\`

**Isaac Sim**基于Omniverse平台，提供更丰富的渲染能力和场景编辑功能，支持光线追踪、合成数据生成等高级特性。

### 其他仿真平台

| 平台 | 特点 | 适用场景 |
|-----|------|---------|
| PyBullet | 开源、易用 | 快速原型验证 |
| SAPIEN | 关节物体仿真 | 操作任务 |
| Habitat | 大规模室内场景 | 导航任务 |
| AI2-THOR | 交互式场景 | 家居机器人 |
| CARLA | 自动驾驶仿真 | 车辆控制 |

## Sim-to-Real迁移技术

\`\`\`mermaid
graph LR
    A[仿真环境训练] --> B[域随机化]
    B --> C[策略鲁棒性提升]
    C --> D[迁移与微调]
    D --> E[真实环境部署]
    E -->|反馈| A
\`\`\`

### Reality Gap分析

仿真与现实的差距主要来源于三个层面。回想飞行模拟器的场景：模拟器里的风是简化的数学模型，真实的乱流却复杂得多；模拟器里的天空质感均匀平整，真实的云层、光线千变万化；模拟器里按下按钮立即响应，真机的液压系统总有那么一丝延迟。具体来说：

**物理差距**：
- 接触模型简化（刚体假设、离散化）
- 参数不确定性（质量、摩擦、阻尼）
- 未建模动力学（柔性、延迟、非线性）

**视觉差距**：
- 渲染与真实图像的分布差异
- 光照条件变化
- 传感器噪声与畸变

**控制差距**：
- 执行器响应差异
- 通信延迟
- 采样频率不匹配

### 域随机化

域随机化（Domain Randomization）通过在仿真中引入大量随机变化，使策略对变化具有鲁棒性。核心假设是：如果策略能够处理仿真中的大量变化，真实世界将只是其中一种情况。

假设你正在训练飞行员应对侧风着陆。你不是只练 10 节的侧风，而是随机在 0～30 节之间变化，有时还加上突然的阵风。练多了之后，飞行员对任何强度的侧风都能从容应对——包括从未见过的 17.3 节。这就是域随机化的精髓。

**物理域随机化**：

\`\`\`python
class RandomizedEnv(gym.Wrapper):
    def reset(self, **kwargs):
        # 随机化物理参数
        self.model.body_mass[1] *= np.random.uniform(0.8, 1.2)
        self.model.geom_friction[:] *= np.random.uniform(0.5, 2.0)
        self.model.dof_damping[:] *= np.random.uniform(0.5, 1.5)
        
        # 随机化初始状态
        qpos = self.init_qpos + np.random.uniform(-0.1, 0.1, self.model.nq)
        qvel = self.init_qvel + np.random.uniform(-0.1, 0.1, self.model.nv)
        
        return super().reset(**kwargs)
\`\`\`

**视觉域随机化**涉及：
- 纹理随机化：物体表面、背景
- 光照随机化：位置、强度、颜色
- 相机随机化：视角、焦距、噪声
- 干扰物随机化：遮挡、杂乱背景

**动力学随机化**可以通过网络适应层处理：

$$\\mathbf{a} = \\pi(\\mathbf{o}, \\mathbf{z}), \\quad \\mathbf{z} = \\phi(\\mathbf{o}_{1:t}, \\mathbf{a}_{1:t-1})$$

其中 $\\pi$ 为策略网络，$\\mathbf{o}$ 为当前观测，$\\mathbf{a}$ 为输出动作，$\\mathbf{z}$ 为从历史观测-动作序列 $(\\mathbf{o}_{1:t}, \\mathbf{a}_{1:t-1})$ 中由编码器 $\\phi$ 推断出的隐式环境参数。$\\mathbf{z}$ 编码了当前环境的动力学特征（如质量、摩擦等），使策略能够自适应不同的物理参数配置。

### 系统辨识与仿真校准

精确测量真实系统参数可以显著缩小Reality Gap：

**几何参数**：
- 激光扫描获取精确尺寸
- 运动捕捉标定关节位置

**动力学参数**：
- 摆锤实验测量转动惯量
- 阶跃响应辨识执行器模型
- 接触实验测量摩擦系数

**仿真校准**流程：

\`\`\`
真实数据采集 → 参数优化 → 仿真更新 → 误差评估 → 迭代
\`\`\`

目标函数通常为轨迹匹配误差：

$$\\mathcal{L} = \\sum_{t} \\|\\mathbf{s}_t^{\\text{real}} - \\mathbf{s}_t^{\\text{sim}}(\\theta)\\|^2$$

其中 $\\mathbf{s}_t^{\\text{real}}$ 为时刻 $t$ 的真实系统状态，$\\mathbf{s}_t^{\\text{sim}}(\\theta)$ 为以参数 $\\theta$ 运行的仿真系统在同一时刻的状态，$\\theta$ 为待辨识的仿真参数（如质量、摩擦系数、阻尼等）。该损失函数通过最小化仿真轨迹与真实轨迹的差距，优化仿真器参数以缩小 Reality Gap。

### 迁移学习方法

**微调（Fine-tuning）**：在仿真中预训练后，使用少量真实数据继续训练。需要平衡适应速度与灾难性遗忘。

**渐进式网络（Progressive Networks）**：为真实域添加新的网络列，同时保持仿真知识：

$$\\mathbf{h}_i^{(k)} = \\sigma\\left(\\mathbf{W}_i^{(k)} \\mathbf{h}_{i-1}^{(k)} + \\sum_{j<k} \\mathbf{U}_i^{(j:k)} \\mathbf{h}_{i-1}^{(j)}\\right)$$

其中 $k$ 为域索引（$k=1$ 为仿真域，$k>1$ 为真实域），$i$ 为层索引，$\\mathbf{W}_i^{(k)}$ 为第 $k$ 域第 $i$ 层的权重，$\\mathbf{U}_i^{(j:k)}$ 为从域 $j$ 向域 $k$ 的侧向连接权重。第 $k$ 域的每一层不仅接收本域前一层的输出，还通过侧向连接接收所有先前域的特征，从而在保留仿真域知识的同时适应真实域。

**对抗域适应**：学习域不变的特征表示，使判别器无法区分仿真与真实特征。

### 实例：灵巧手操作的Sim-to-Real

OpenAI在魔方求解任务中展示了成功的Sim-to-Real迁移。关键技术包括：

1. **自动域随机化**（ADR）：根据策略性能自适应调整随机化范围
2. **记忆增强策略**：LSTM处理部分可观测性
3. **触觉反馈**：利用关节力矩推断接触状态
4. **课程学习**：从简单到复杂逐步增加任务难度

训练规模：约10,000年仿真时间（利用大规模并行），迁移到真实Shadow Hand后实现约60%成功率。

## 基准任务与评估

### 运动控制基准

MuJoCo提供的经典连续控制任务：

| 环境 | 观测维度 | 动作维度 | 任务描述 |
|-----|---------|---------|---------|
| HalfCheetah | 17 | 6 | 半猎豹前进 |
| Ant | 111 | 8 | 蚂蚁移动 |
| Humanoid | 376 | 17 | 人形行走 |
| Walker2d | 17 | 6 | 双足行走 |

这些任务的奖励通常结合前进速度、能量消耗、存活奖励等多个因素。

### 操作任务基准

**Meta-World**提供50种桌面操作任务，支持多任务与元学习研究：
- 单任务学习（ML1）：单一任务多种初始化
- 多任务学习（MT10/MT50）：同时学习多种技能
- 元学习（ML10/ML45）：快速适应新任务

**RLBench**基于CoppeliaSim，提供100+操作任务，支持多种观测模态（RGB、深度、点云、状态）。

### 导航基准

**Habitat Challenge**评估室内导航能力：
- PointNav：到达指定坐标
- ObjectNav：找到指定类别物体
- ImageNav：到达图像显示位置

评估指标包括成功率（Success）、SPL（Success weighted by Path Length）、软SPL等。

仿真环境与Sim-to-Real技术是具身智能研究的基础设施。标准化的接口降低了算法开发门槛，高效的物理仿真实现了大规模数据生成，而 Sim-to-Real 方法则是将仿真成果转化为实际应用的桥梁。就像航空业从最早的简陋模拟器发展到今天几乎以假乱真的全动模拟，机器人的仿真训练也在快速走向成熟。随着仿真精度的提升与迁移技术的进步，仿真训练正在成为机器人技能获取的主流范式。
`
    },
    {
      id: "adv-09-03-robot-control",
      title: "9.3 机器人控制",
      file: "大模型教程/09-具身智能/02-机器人控制.md",
      difficulty: "中级-高级",
      duration: "1h",
      week: 0,
      phase: 0,
      keywords: ["机器人控制", "Forward", "Kinematics", "Inverse", "Delta"],
      content: `# 机器人控制

\`\`\`mermaid
graph LR
    A[感知] --> B[规划]
    B --> C[控制]
    C --> D[执行]
    D --> E[环境反馈]
    E --> A
\`\`\`

## 机械臂操作

### 运动学基础

机械臂是具身智能中研究最充分的平台。其运动学描述了关节角度与末端执行器位姿之间的映射关系。

我们可以用骑自行车来建立直觉。运动学就是研究自行车的几何结构：车把转多少度，前轮会指向哪里？脚踏板踩几圈，车会前进多少？这些只涉及几何关系，不关心力。而动力学则是理解力如何让自行车动起来：你踩踏板时用多大力，地面的摩擦力多大，上坡时重力怎么影响速度。

**正运动学**（Forward Kinematics）给定关节角度 $\\mathbf{q} \\in \\mathbb{R}^n$，求末端位姿 $\\mathbf{T} \\in SE(3)$：

$$\\mathbf{T} = f_{FK}(\\mathbf{q}) = \\mathbf{T}_1(\\mathbf{q}_1) \\mathbf{T}_2(\\mathbf{q}_2) \\cdots \\mathbf{T}_n(\\mathbf{q}_n)$$

其中 $\\mathbf{q} = (\\mathbf{q}_1, \\dots, \\mathbf{q}_n)^T$ 为各关节角度组成的向量，$n$ 为自由度数，$\\mathbf{T}_i(\\mathbf{q}_i) \\in SE(3)$ 为第 $i$ 个关节的齐次变换矩阵（包含旋转与平移），$\\mathbf{T} \\in SE(3)$ 为末端执行器的位姿。正运动学将各关节的局部变换依次累乘，得到末端在世界坐标系中的最终位姿。举个例子：想象你的胳膊，肩关节转 30°、肘关节弯 45°、腕关节旋 10°——指尖最终到达的位置，就是这三个角度依次复合的结果。正运动学做的正是这件事。

**逆运动学**（Inverse Kinematics）是正运动学的逆问题：给定期望末端位姿，求解关节角度。对于冗余机械臂（自由度大于6），逆运动学解不唯一，通常采用基于雅可比矩阵的迭代方法：

$$\\Delta \\mathbf{q} = \\mathbf{J}^{\\dagger}(\\mathbf{q}) \\Delta \\mathbf{x}$$

其中 $\\Delta \\mathbf{x}$ 为末端当前位姿与目标位姿的偏差，$\\mathbf{J}^{\\dagger}$ 为雅可比矩阵 $\\mathbf{J}(\\mathbf{q})$ 的伪逆（Moore-Penrose 伪逆），$\\Delta \\mathbf{q}$ 为关节角度的迭代修正量。雅可比矩阵描述了关节速度与末端速度之间的线性映射，其伪逆提供了最小范数解。奇异位形附近需要使用阻尼最小二乘或其他正则化方法。假设你想把手指尖精确地点在鼻子上（目标位姿），逆运动学要做的就是反向推算：肩、肘、腕分别该转多少度？这通常比正运动学难得多，因为可能存在多个解或无解。

**动力学**描述力/力矩与运动之间的关系：

$$\\mathbf{M}(\\mathbf{q})\\ddot{\\mathbf{q}} + \\mathbf{C}(\\mathbf{q}, \\dot{\\mathbf{q}})\\dot{\\mathbf{q}} + \\mathbf{g}(\\mathbf{q}) = \\boldsymbol{\\tau}$$

其中 $\\mathbf{M}$ 是质量矩阵，$\\mathbf{C}$ 是科里奥利/离心力矩阵，$\\mathbf{g}$ 是重力项，$\\boldsymbol{\\tau}$ 是关节力矩。回到骑自行车的场景：$\\mathbf{M}$ 就是车和人的总重量（质量越大越难加速），$\\mathbf{C}$ 是拐弯时的离心力，$\\mathbf{g}$ 是上坡时的重力阻力，$\\boldsymbol{\\tau}$ 是你脚踏的力。机械臂的动力学完全同理，只是关节更多、方程更复杂。

### 运动规划

运动规划的目标是生成从起点到目标的无碰撞轨迹。假设你骑自行车穿越一个停满车的停车场，需要找一条不碰到任何车的路线——这就是运动规划的本质。

**采样规划**方法在配置空间中随机采样并构建路径图：

- **PRM**（Probabilistic Roadmap）：预先构建可达性图，在线查询路径
- **RRT**（Rapidly-exploring Random Tree）：从起点向随机方向快速扩展
- **RRT***：RRT的渐近最优版本，收敛到最短路径

\`\`\`python
def rrt(start, goal, sample_fn, steer_fn, collision_fn, max_iter=10000):
    tree = {start: None}
    for _ in range(max_iter):
        q_rand = sample_fn()
        q_nearest = nearest(tree, q_rand)
        q_new = steer_fn(q_nearest, q_rand)
        
        if not collision_fn(q_nearest, q_new):
            tree[q_new] = q_nearest
            if distance(q_new, goal) < threshold:
                return extract_path(tree, q_new)
    return None
\`\`\`

**轨迹优化**方法将规划问题转化为优化问题。CHOMP、STOMP、TrajOpt等方法在初始轨迹基础上迭代优化，同时考虑平滑性与碰撞代价。

### 抓取与操作

抓取是机械臂操作的核心能力。你可能觉得“拿东西”是世界上最简单的事，但对机器人来说，这涉及视觉感知、接触力控制、手指协调等多个难题的交叉。传统方法基于几何分析计算力闭合抓取：

$$\\mathbf{G} \\mathbf{f} = \\mathbf{w}, \\quad \\mathbf{f} \\geq 0$$

其中 $\\mathbf{G} \\in \\mathbb{R}^{6 \\times m}$ 为抓取矩阵（将 $m$ 个接触点的力映射到物体质心上的力与力矩），$\\mathbf{f} \\in \\mathbb{R}^m$ 为各接触点的接触力向量（非负约束保证只能推不能拉），$\\mathbf{w} \\in \\mathbb{R}^6$ 为外部施加的力旋量。力闭合抓取要求：对于任意外力 $\\mathbf{w}$，都存在非负的接触力 $\\mathbf{f}$ 能够平衡它。

**数据驱动抓取**方法直接从视觉输入预测抓取位姿：

- **GraspNet**系列：预测点云上的6-DoF抓取位姿
- **接触图预测**：预测末端与物体的接触点分布
- **强化学习抓取**：通过试错学习抓取策略

**灵巧操作**涉及抓取后的物体重定位、旋转、装配等复杂任务。关键挑战包括：
- 接触状态变化的检测与处理
- 长时序任务的规划与执行
- 力控制与位置控制的切换

### 模仿学习在操作中的应用

**行为克隆**（Behavior Cloning）从专家示范中学习策略映射：

$$\\pi^* = \\arg\\min_\\pi \\mathbb{E}_{(\\mathbf{o}, \\mathbf{a}) \\sim \\mathcal{D}} [\\mathcal{L}(\\pi(\\mathbf{o}), \\mathbf{a})]$$

其中 $\\pi$ 为策略网络，$\\mathcal{D}$ 为专家示范数据集（包含观测-动作对），$\\mathcal{L}$ 为损失函数（如均方误差或交叉熵）。行为克隆直接通过监督学习拟合专家的观测到动作的映射。

**扩散策略**（Diffusion Policy）将动作生成建模为去噪扩散过程：

$$\\mathbf{a}_0 = \\text{denoise}(\\mathbf{a}_T, \\mathbf{o}), \\quad \\mathbf{a}_T \\sim \\mathcal{N}(0, \\mathbf{I})$$

其中 $\\mathbf{a}_T$ 为从标准正态分布采样的初始噪声，$\\mathbf{o}$ 为当前观测，$\\text{denoise}$ 为经 $T$ 步迭代去噪后得到的清晰动作 $\\mathbf{a}_0$。扩散策略将动作生成建模为条件去噪过程，能够表示多模态动作分布。

示范数据可通过遥操作、运动捕捉、VR设备等方式采集。

**ACT**（Action Chunking with Transformers）使用Transformer架构预测动作序列：

$$\\mathbf{a}_{t:t+k} = \\text{Transformer}(\\mathbf{o}_t, \\mathbf{z})$$

其中 $\\mathbf{z}$ 是从变分编码器采样的风格变量，$k$ 是动作块长度。

## 四足机器人

### 四足运动的特点

四足机器人在非结构化环境中展现出独特优势。与轮式移动机器人相比：

| 特性 | 轮式 | 四足 |
|-----|------|------|
| 平坦地面效率 | 高 | 中 |
| 崎岖地形通过性 | 低 | 高 |
| 垂直障碍跨越 | 差 | 好 |
| 机械复杂度 | 低 | 高 |
| 能量消耗 | 低 | 高 |

四足运动的核心挑战在于协调 12 个（每腿 3 自由度）或更多关节，同时保持动态平衡。想象一下同时骑四辆自行车，还得保证它们排成方阵不散架——四足控制的复杂度可见一斑。

### 步态与相位

步态定义了四条腿的协调模式。常见步态包括：

**静态步态**：任意时刻至少三条腿接地，重心始终在支撑多边形内。
- walk（行走）：按顺序逐一抬腿

**动态步态**：存在腾空相或不稳定瞬间。
- trot（对角小跑）：对角腿同步
- pace（同侧步）：同侧腿同步
- bound（跳跃）：前后腿同步
- gallop（飞奔）：四腿顺序抬起

步态可以用相位参数化。设腿 $i$ 的相位为 $\\phi_i \\in [0, 2\\pi)$，则：

$$\\phi_i(t) = \\phi_i^0 + \\omega t \\mod 2\\pi$$

其中 $\\phi_i(t)$ 为腿 $i$ 在时刻 $t$ 的相位，$\\phi_i^0$ 为初始相位偏移，$\\omega$ 为步态角频率（所有腿共享）。不同步态通过设置不同的初始相位差来实现；例如 trot 步态中对角腿相位差为 $\\pi$，意味着它们的摆动周期刚好相差半个周期。举个例子：观察一只狗小跑时，你会发现左前腿和右后腿总是同时着地，右前腿和左后腿同样如此——这就是对角 trot 步态，相位差恰好是半个周期。

### 传统控制方法

**模型预测控制**（MPC）在滚动时域内优化控制序列：

$$\\min_{\\mathbf{u}_{0:N-1}} \\sum_{k=0}^{N} \\|\\mathbf{x}_k - \\mathbf{x}_k^{\\text{ref}}\\|_Q^2 + \\|\\mathbf{u}_k\\|_R^2$$
$$\\text{s.t.} \\quad \\mathbf{x}_{k+1} = f(\\mathbf{x}_k, \\mathbf{u}_k), \\quad \\mathbf{u}_k \\in \\mathcal{U}$$

其中 $\\mathbf{x}_k$ 为时步 $k$ 的系统状态，$\\mathbf{x}_k^{\\text{ref}}$ 为参考轨迹，$\\mathbf{u}_k$ 为控制输入，$Q$ 和 $R$ 分别为状态跟踪与控制耗费的权重矩阵，$N$ 为预测时域长度，$f$ 为动力学模型，$\\mathcal{U}$ 为控制约束集。MPC 在每个时步求解该有限时域优化问题，只执行第一步控制，然后滚动重复。实际实现中，通常将复杂的全身动力学简化为单刚体模型，以实现实时求解。

**全身控制**（Whole-Body Control）在操作空间定义任务，并通过优化求解关节力矩：

$$\\min_{\\ddot{\\mathbf{q}}, \\mathbf{f}, \\boldsymbol{\\tau}} \\sum_i w_i \\|\\mathbf{J}_i \\ddot{\\mathbf{q}} + \\dot{\\mathbf{J}}_i \\dot{\\mathbf{q}} - \\ddot{\\mathbf{x}}_i^{\\text{des}}\\|^2$$
$$\\text{s.t.} \\quad \\mathbf{M}\\ddot{\\mathbf{q}} + \\mathbf{h} = \\mathbf{S}^T \\boldsymbol{\\tau} + \\mathbf{J}_c^T \\mathbf{f}$$

其中 $\\ddot{\\mathbf{q}}$ 为关节加速度，$\\mathbf{f}$ 为接触力，$\\boldsymbol{\\tau}$ 为关节力矩，$w_i$ 为第 $i$ 个任务的权重，$\\mathbf{J}_i$ 为第 $i$ 个任务的雅可比矩阵，$\\ddot{\\mathbf{x}}_i^{\\text{des}}$ 为期望的操作空间加速度。约束为全身动力学方程，其中 $\\mathbf{M}$ 为质量矩阵，$\\mathbf{h}$ 为科里奥利力、离心力与重力的合力项，$\\mathbf{S}$ 为执行器选择矩阵，$\\mathbf{J}_c$ 为接触点雅可比矩阵。全身控制在满足动力学约束的前提下，尽可能跟踪多个操作空间任务。

### 基于学习的四足控制

强化学习在四足控制中取得了显著成功。典型的状态与动作定义：

**状态空间**：
- 机身姿态（roll, pitch, yaw）
- 机身角速度
- 关节位置与速度
- 足端接触状态
- 地形估计（可选）

**动作空间**：
- 关节位置目标（PD控制器跟踪）
- 关节速度目标
- 足端位置目标（逆运动学转换）

**奖励设计**是关键。典型的奖励组成：

\`\`\`python
reward = (
    w_vel * reward_velocity()      # 跟踪速度命令
    + w_alive * reward_alive()     # 存活奖励
    - w_torque * cost_torque()     # 力矩惩罚
    - w_action * cost_action_rate() # 动作平滑惩罚
    - w_collision * cost_collision() # 碰撞惩罚
    - w_orientation * cost_orientation() # 姿态惩罚
)
\`\`\`

**课程学习**逐步增加任务难度：
1. 平坦地面行走
2. 添加小型障碍
3. 增加地形复杂度
4. 引入外部扰动

### 地形适应

盲足控制（Blind Locomotion）仅依赖本体感知，不使用视觉或雷达。关键技术包括：

**隐式地形估计**：从本体感知历史推断地形特征：

$$\\mathbf{z}_{\\text{terrain}} = \\phi(\\mathbf{o}_{t-H:t})$$

其中 $\\mathbf{o}_{t-H:t}$ 为过去 $H$ 步的本体感知观测序列（关节位置、速度、姿态等），$\\phi$ 为编码器网络，$\\mathbf{z}_{\\text{terrain}}$ 为推断出的地形潜在特征。机器人仅通过近期的步态历史信息（而非视觉）来隐式估计当前的地形类型。

**足端力估计**：从电机电流推断接触力，判断接触状态。

**自适应控制**：根据估计的地形在线调整步态参数。

视觉辅助的地形适应可以提前规划落足点，避开危险区域。典型流程：

\`\`\`
深度图像 → 地形分割 → 可通行性分析 → 落足点规划 → 运动控制
\`\`\`

## 双足机器人

### 双足行走的挑战

双足行走是动态平衡的典型例子。与四足相比，双足机器人：
- 支撑面积更小，稳定性更差
- 单腿支撑相占比更大
- 需要更精确的动量管理
- 对模型误差更敏感

人形机器人追求人类形态，以便复用人类环境与工具。这带来了额外的设计约束与控制挑战。

### 简化模型

**线性倒立摆模型**（LIPM）将复杂的全身动力学简化为质心动力学：

$$\\ddot{x} = \\omega^2(x - p), \\quad \\omega = \\sqrt{\\frac{g}{z_c}}$$

其中 $x$ 为质心水平位置，$p$ 为压力中心（ZMP，Zero Moment Point）位置，$z_c$ 为质心高度（假设恒定），$g$ 为重力加速度，$\\omega$ 为自然频率。该模型将复杂的全身动力学简化为一个以质心高度为参数的线性倒立摆，质心的水平加速度与其对压力中心的偏移成正比。为什么用倒立摆？因为人站立时本质上就像一根倒立的棍子——重心在上，支撑点在下，随时可能倒下。行走就是在不断地"快要摔倒——迈出一步接住"的过程中前进。

**捕获点**（Capture Point）定义为：

$$x_{cp} = x + \\frac{\\dot{x}}{\\omega}$$

其中 $x$ 为质心水平位置，$\\dot{x}$ 为质心水平速度，$\\omega$ 为 LIPM 自然频率。捕获点是机器人“迈一步就能停住”所需的趺足位置——只要将足放在捕获点处，倒立摆就会收敛到该点。

捕获点在支撑多边形内是保持平衡的充分条件。

**角动量线性倒立摆**（ALIP）扩展LIPM，考虑角动量变化：

$$\\dot{L} = m g (x - p)$$

其中 $L$ 为系统角动量，$m$ 为质量，$g$ 为重力加速度，$x$ 为质心位置，$p$ 为压力中心。ALIP 在 LIPM 基础上纳入了角动量的变化，能够更准确地描述包含手臂摆动等情形下的双足行走动力学。

### 步态生成

**预览控制**基于LIPM，优化未来若干步的ZMP轨迹：

$$\\min_{\\dddot{x}_{0:N}} \\sum_{k=0}^{N} \\|p_k - p_k^{\\text{ref}}\\|^2 + R \\dddot{x}_k^2$$

其中 $p_k$ 为时步 $k$ 的 ZMP 位置，$p_k^{\\text{ref}}$ 为参考 ZMP 轨迹，$\\dddot{x}_k$ 为质心加加速度（jerk，控制量），$R$ 为控制能耗的权重。该优化问题在跟踪参考 ZMP 的同时，抑制质心运动的急剧变化，保证行走的平稳性。

**足步规划**确定落足点位置与时间：

\`\`\`
当前状态 → 参考速度 → 捕获点计算 → 落足点选择 → 轨迹生成
\`\`\`

实时调整落足点是应对扰动的关键。Raibert控制器提供了直观的启发式：当身体前倾过快时，把脚往前多迈一点；当前进速度不够时，把脚往后缩一点。就像你被人从背后推了一下，本能地会快走几步来恢复平衡：

$$x_{\\text{foot}} = x + \\frac{\\dot{x}}{2\\omega} + k_v(\\dot{x} - \\dot{x}^{\\text{des}})$$

其中 $x$ 为当前质心位置，$\\dot{x}$ 为当前质心速度，$\\omega$ 为 LIPM 自然频率，$\\dot{x}^{\\text{des}}$ 为期望速度，$k_v$ 为速度反馈增益。前两项对应捕获点的一半（在步态周期中间时刻评估），第三项根据当前速度与期望速度的偏差进行修正——走得太快就抬足往前多迈一点，太慢就往回缩一点。

通过求解Riccati方程获得最优控制律。

### 全身运动控制

给定质心轨迹与足端轨迹，全身控制求解关节运动与接触力。

**基于QP的全身控制**：

$$\\min_{\\ddot{\\mathbf{q}}, \\mathbf{f}} \\sum_i w_i \\|\\mathbf{A}_i \\begin{bmatrix} \\ddot{\\mathbf{q}} \\\\ \\mathbf{f} \\end{bmatrix} - \\mathbf{b}_i\\|^2$$

约束包括：
- 动力学一致性：$\\mathbf{M}\\ddot{\\mathbf{q}} + \\mathbf{h} = \\mathbf{S}^T \\boldsymbol{\\tau} + \\mathbf{J}_c^T \\mathbf{f}$
- 摩擦锥约束：$\\mathbf{f} \\in \\mathcal{FC}$
- 关节限位：$\\mathbf{q}_{\\min} \\leq \\mathbf{q} \\leq \\mathbf{q}_{\\max}$
- 力矩限制：$|\\boldsymbol{\\tau}| \\leq \\boldsymbol{\\tau}_{\\max}$

### 基于学习的双足控制

强化学习在双足控制中面临更大挑战：

**高维状态-动作空间**：人形机器人可能有30+自由度。

**稀疏奖励**：行走成功是稀疏信号，需要精心设计辅助奖励。

**安全约束**：摔倒会损坏硬件，需要安全的探索策略。

成功的方法包括：

**分层强化学习**：高层策略输出步态参数或速度命令，低层控制器执行：

$$\\mathbf{a}_{\\text{high}} = \\pi_{\\text{high}}(\\mathbf{o}), \\quad \\mathbf{a}_{\\text{low}} = \\pi_{\\text{low}}(\\mathbf{o}, \\mathbf{a}_{\\text{high}})$$

其中 $\\pi_{\\text{high}}$ 为高层策略，根据观测 $\\mathbf{o}$ 输出步态参数或速度命令 $\\mathbf{a}_{\\text{high}}$；$\\pi_{\\text{low}}$ 为低层控制器，将高层指令转化为具体的关节动作 $\\mathbf{a}_{\\text{low}}$。分层设计降低了各层策略的学习难度。

**模仿学习引导**：使用运动捕捉数据初始化策略或提供参考奖励：

$$r_{\\text{imitation}} = \\exp(-\\|\\mathbf{q} - \\mathbf{q}^{\\text{ref}}\\|^2 / \\sigma^2)$$

其中 $\\mathbf{q}$ 为当前关节配置，$\\mathbf{q}^{\\text{ref}}$ 为参考运动捕捉数据中的关节配置，$\\sigma$ 为容差参数。当机器人姿态越接近参考动作，奖励越接近 1；偏离越大，奖励越接近 0。

**残差学习**：在传统控制器基础上学习残差修正：

$$\\boldsymbol{\\tau} = \\boldsymbol{\\tau}_{\\text{nominal}}(\\mathbf{q}, \\dot{\\mathbf{q}}) + \\Delta\\boldsymbol{\\tau}_{\\text{RL}}(\\mathbf{o})$$

其中 $\\boldsymbol{\\tau}_{\\text{nominal}}$ 为传统控制器计算的名义力矩（基于模型的前馈控制），$\\Delta\\boldsymbol{\\tau}_{\\text{RL}}$ 为强化学习网络输出的残差修正量。残差学习将传统控制的稳定性与学习方法的自适应能力相结合，RL 只需学习模型误差的补偿量，而非从零学习全部控制策略。

### 人形机器人的发展

近年来人形机器人领域出现了显著进展：

| 平台 | 组织 | 特点 |
|-----|------|------|
| Atlas | Boston Dynamics | 液压驱动，高动态 |
| Optimus | Tesla | 电机驱动，面向生产 |
| Digit | Agility Robotics | 轻量化，物流场景 |
| Figure 01/02 | Figure AI | 集成大模型 |
| 1X | 1X Technologies | 软体执行器 |

大模型与人形机器人的结合是当前热点。视觉-语言模型提供场景理解与任务规划能力，动作生成模型输出底层控制命令。代表性工作如Google RT-X系列、1X的NEO等，正在探索通用人形机器人的可行路径。

机器人控制从经典的模型-规划范式向数据驱动的学习范式演进。回头看整个发展脉络：最早我们用几何和物理公式精确建模（就像精确测量自行车每个零件的尺寸），后来发现让机器人自己在试错中学习往往更高效（就像孩子学骑车，不需要理解欧拉方程，摔几次就学会了）。无论是机械臂的灵巧操作、四足的敏捷运动，还是双足的动态平衡，强化学习与模仿学习都展现出强大的能力。大模型的引入进一步赋予机器人语言理解、常识推理、任务泛化的能力。随着硬件成本降低、仿真精度提升、迁移技术成熟，具身智能正在从实验室走向实际应用。
`
    },
  ]
});
