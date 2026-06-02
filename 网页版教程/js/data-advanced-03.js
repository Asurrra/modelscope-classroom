window.LEARNING_DATA = window.LEARNING_DATA || [];
window.LEARNING_DATA.push({
  module: '大模型教程',
  chapters: [
    {
      id: "adv-10-01-intro",
      title: "10.1 模型软硬件生态引言",
      file: "大模型教程/10-模型软硬件生态/00-引言.md",
      difficulty: "中级-高级",
      duration: "0.5h",
      week: 0,
      phase: 0,
      keywords: ["模型软硬件生态引言", "PyTorch", "NumPy", "JAX", "Transformers", "Diffusers"],
      content: `# 模型软硬件生态引言

## 生态系统的重要性

大模型的研发与应用离不开完善的软硬件生态。从底层的计算框架到上层的应用平台，从开源模型到专用硬件，整个生态系统的成熟度直接影响着技术的落地效率与创新速度。一个繁荣的生态系统能够：

- 降低研发门槛，使更多团队能够参与大模型研究
- 促进最佳实践的共享，加速技术迭代
- 实现资源的高效利用，降低计算成本
- 推动标准化，增强不同组件间的互操作性

## 软件栈层次结构

大模型软件生态可以分为若干层次，每一层都有其核心工具与框架：

| 层次 | 功能 | 代表工具 |
|-----|------|---------|
| 基础计算 | 张量运算、自动微分 | PyTorch、NumPy、JAX |
| 模型开发 | 模型定义、训练循环 | Transformers、Diffusers |
| 高效训练 | 分布式训练、参数高效微调 | Megatron、DeepSpeed、PEFT |
| 高效推理 | 推理服务、批处理优化 | vLLM、SGLang、TensorRT-LLM |
| 应用框架 | Agent编排、工作流设计 | Dify、LangChain、AgentScope |
| 垂直应用 | 特定场景解决方案 | ComfyUI、Cursor、Data-Juicer |

这种分层架构使得不同层次的工具可以独立演进，同时通过标准化接口实现互操作。

## 开源与商业的协同

大模型生态的一个显著特点是开源与商业力量的紧密协同。Meta开源LLaMA系列，激发了整个开源社区的活力；Stability AI开源Stable Diffusion，催生了丰富的下游应用。与此同时，商业公司通过API服务（如OpenAI的GPT系列、Anthropic的Claude）提供即用的能力，降低了应用门槛。

开源项目通常具有：
- 透明的技术实现，便于研究与改进
- 活跃的社区支持，快速迭代
- 灵活的部署选项，支持私有化

商业服务则提供：
- 即用的API接口，无需运维
- 持续优化的模型能力
- 企业级的SLA保障

两者相互补充，共同推动着大模型技术的普及。

## 硬件多元化趋势

长期以来，NVIDIA GPU凭借CUDA生态的成熟度占据着AI计算的主导地位。然而，随着大模型计算需求的爆发式增长，硬件生态正在走向多元化：

**国产加速器**：华为昇腾NPU、寒武纪MLU、沐曦GPU等国产芯片正在快速成熟，在特定场景下展现出竞争力。

**AMD GPU**：ROCm生态的持续完善使得AMD GPU成为CUDA的可行替代，特别是在成本敏感的场景中。

**专用芯片**：Google TPU、Cerebras晶圆级芯片、Graphcore IPU等针对特定工作负载优化的加速器。

硬件多元化带来了适配挑战，但也促进了软件栈的抽象化设计，使得上层应用能够更好地屏蔽底层差异。

## 本章内容安排

本章系统介绍大模型软硬件生态的核心组成部分。

**基础生态**部分涵盖从底层计算框架（PyTorch、NumPy）到模型开发库（Transformers、Diffusers）再到分布式训练框架（Megatron）的完整链路，同时介绍面向不同场景的专用工具如训练框架（LLaMA-Factory、SWIFT）、机器人学习（LeRobot）、强化学习（veRL）、视觉合成（Diff-Synth）以及推理引擎（vLLM、SGLang）。

**应用生态**部分介绍支撑大模型应用落地的关键平台与工具，包括Agent开发平台（Dify、Coze、AgentScope）、AI编程助手、工作流编排工具（ComfyUI）以及数据处理框架（Data-Juicer）。

**模型生态**部分梳理当前主流的语言模型与视觉生成模型，帮助读者理解模型选型的考量因素。

**硬件生态**部分提供不同计算平台的环境配置指南，涵盖NVIDIA GPU、华为昇腾NPU、沐曦GPU以及AMD ROCm生态。

通过本章的学习，读者将对大模型开发与部署的完整工具链形成系统认知，能够根据实际需求选择合适的技术栈。
`
    },
    {
      id: "adv-10-02-pytorch-numpy",
      title: "10.2 PyTorch与NumPy基础",
      file: "大模型教程/10-模型软硬件生态/01-基础生态/01-PyTorch与NumPy基础.md",
      difficulty: "中级-高级",
      duration: "1h",
      week: 0,
      phase: 0,
      keywords: ["PyTorch与NumPy基础", "PyTorch", "NumPy", "Python"],
      content: `# PyTorch与NumPy基础

## NumPy：科学计算的基石

NumPy是Python生态中数值计算的基础库，为多维数组运算提供了高效实现。尽管深度学习框架已经提供了更强大的张量操作，NumPy仍然是数据预处理、结果分析以及与其他科学计算库交互的关键工具。

假设你正在准备一批训练数据——从CSV文件里读出来的特征矩阵需要做归一化，标签需要做one-hot编码，最后还要按比例切分训练集和验证集。这些"上游"的脏活累活，几乎全靠NumPy来完成。可以说，NumPy是深度学习工作流的"前厅"：模型看到数据之前，数据先要经过NumPy的手。

### ndarray核心概念

NumPy的核心数据结构是ndarray（N-dimensional array）。你可以把它理解成一块连续的内存区域，上面贴了"形状"和"数据类型"两张标签——正是这种紧凑的内存布局，让NumPy的速度远超Python原生列表。ndarray具有以下关键属性：

\`\`\`python
import numpy as np

arr = np.array([[1, 2, 3], [4, 5, 6]], dtype=np.float32)

print(arr.shape)    # (2, 3) - 形状
print(arr.dtype)    # float32 - 数据类型
print(arr.ndim)     # 2 - 维度数
print(arr.strides)  # (12, 4) - 步幅（字节）
print(arr.flags)    # 内存布局信息
\`\`\`

**数据类型**（dtype）决定了数组元素的存储方式与精度：

| dtype | 字节数 | 范围 | 用途 |
|-------|-------|------|------|
| float16 | 2 | ~6.5×10⁴ | 混合精度训练 |
| float32 | 4 | ~3.4×10³⁸ | 默认浮点类型 |
| float64 | 8 | ~1.8×10³⁰⁸ | 高精度计算 |
| int32 | 4 | ±2.1×10⁹ | 整数索引 |
| int64 | 8 | ±9.2×10¹⁸ | 大范围整数 |

### 数组创建与变形

\`\`\`python
# 创建方式
zeros = np.zeros((3, 4))           # 全零数组
ones = np.ones((2, 3))             # 全一数组
eye = np.eye(4)                    # 单位矩阵
arange = np.arange(0, 10, 2)       # 等差序列
linspace = np.linspace(0, 1, 5)    # 均匀分布
random = np.random.randn(3, 4)     # 标准正态分布

# 形状操作
reshaped = arr.reshape(3, 2)       # 改变形状
transposed = arr.T                 # 转置
flattened = arr.flatten()          # 展平
squeezed = arr[np.newaxis, :]      # 增加维度
\`\`\`

**广播机制**（Broadcasting）允许不同形状的数组进行运算。在实际项目中，你经常会遇到这样的场景：一个形状为\`(batch_size, feature_dim)\`的特征矩阵，需要减去一个形状为\`(feature_dim,)\`的均值向量。如果没有广播机制，你就得手动把均值向量复制\`batch_size\`份再相减——广播替你省掉了这一步：

\`\`\`python
a = np.array([[1], [2], [3]])      # shape: (3, 1)
b = np.array([10, 20, 30])         # shape: (3,)
c = a + b                          # shape: (3, 3) 广播结果

# 广播规则：
# 1. 从最后一个维度开始比较
# 2. 维度大小相等，或其中一个为1
# 3. 较小的维度被"复制"以匹配
\`\`\`

### 高级索引

\`\`\`python
arr = np.arange(12).reshape(3, 4)

# 基础索引（返回视图）
view = arr[1:, :2]

# 高级索引（返回副本）
fancy = arr[[0, 2], [1, 3]]        # 选取(0,1)和(2,3)
boolean = arr[arr > 5]             # 布尔索引

# 组合索引
mixed = arr[1:, [0, 2]]
\`\`\`

### 向量化运算

向量化是NumPy高效的关键——避免Python循环，直接在C层面执行批量操作。举个例子，如果你对一个100万行的数组用Python的for循环逐行归一化，可能需要好几秒；换成向量化写法，往往几毫秒就搞定了。这不是锦上添花的技巧，而是实际开发中必须养成的习惯：

\`\`\`python
# 避免：Python循环
def slow_normalize(arr):
    result = np.zeros_like(arr)
    for i in range(arr.shape[0]):
        for j in range(arr.shape[1]):
            result[i, j] = arr[i, j] / arr.sum()
    return result

# 推荐：向量化
def fast_normalize(arr):
    return arr / arr.sum()
\`\`\`

**通用函数**（ufunc）提供了逐元素操作的高效实现：

\`\`\`python
# 数学运算
np.exp(arr)                        # 指数
np.log(arr + 1)                    # 对数
np.sin(arr)                        # 三角函数
np.sqrt(arr)                       # 平方根

# 聚合运算
arr.sum(axis=0)                    # 按列求和
arr.mean(axis=1)                   # 按行均值
arr.max()                          # 全局最大值
arr.argmax(axis=-1)                # 最大值索引
\`\`\`

## PyTorch：深度学习的主力框架

PyTorch以其动态计算图、直观的API设计以及与Python生态的无缝集成，成为深度学习研究与应用的主流框架。

你可能会问：既然NumPy已经能做矩阵运算了，为什么还需要PyTorch？答案有两个字——**梯度**。训练神经网络的核心操作是反向传播，而NumPy不提供自动微分。PyTorch在NumPy式的张量运算基础上，加入了GPU加速和自动微分系统（autograd），使得从"算得出来"到"训得起来"只差一步\`loss.backward()\`的距离。

### Tensor基础

PyTorch的Tensor与NumPy的ndarray高度相似，但增加了GPU加速与自动微分支持：

\`\`\`python
import torch

# 创建Tensor
x = torch.tensor([[1., 2.], [3., 4.]])
x = torch.zeros(3, 4, dtype=torch.float32)
x = torch.randn(3, 4, device='cuda')       # GPU张量

# 与NumPy互转
numpy_arr = x.cpu().numpy()
torch_tensor = torch.from_numpy(numpy_arr)

# 设备管理
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
x = x.to(device)
\`\`\`

### 自动微分

PyTorch的autograd系统是其核心能力，通过记录计算图实现自动反向传播。

\`\`\`mermaid
graph LR
    A[前向传播] --> B[构建计算图]
    B --> C[计算损失]
    C --> D[loss.backward]
    D --> E[反向传播求梯度]
    E --> F[optimizer.step]
    F --> G[梯度更新参数]
\`\`\`

想象你在搭积木：每做一步运算（加减乘除、矩阵乘法、激活函数），PyTorch都在背后默默记下"这一步的输入是什么、用了什么操作"。等你喊一声\`backward()\`，它就沿着这条记录链，自动算出每个参数对最终损失的贡献——这就是自动微分的本质：

\`\`\`python
# 启用梯度跟踪
x = torch.tensor([2.0, 3.0], requires_grad=True)
y = x ** 2 + 2 * x + 1
z = y.sum()

# 反向传播
z.backward()
print(x.grad)  # tensor([6., 8.]) = 2x + 2

# 梯度控制
with torch.no_grad():
    # 推理时禁用梯度计算
    y = model(x)

# 分离计算图
detached = y.detach()
\`\`\`

**计算图的动态性**意味着每次前向传播都可能构建不同的图结构，这对于条件分支、循环等控制流非常友好：

\`\`\`python
def dynamic_network(x, use_relu=True):
    y = torch.matmul(x, weight)
    if use_relu:
        y = torch.relu(y)
    else:
        y = torch.tanh(y)
    return y
\`\`\`

### nn.Module：模型构建

\`nn.Module\`是PyTorch模型的基类，提供了参数管理、子模块组织等功能。在实际开发中，几乎所有的模型——从最简单的两层MLP到千亿参数的大语言模型——都是\`nn.Module\`的子类。你只需要定义\`__init__\`里有哪些层，以及\`forward\`里数据怎么流过这些层，剩下的参数注册、设备迁移、序列化等琐事都由基类帮你打理：

\`\`\`python
import torch.nn as nn

class MLP(nn.Module):
    def __init__(self, input_dim, hidden_dim, output_dim):
        super().__init__()
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.fc2 = nn.Linear(hidden_dim, output_dim)
        self.activation = nn.ReLU()
        self.dropout = nn.Dropout(0.1)
    
    def forward(self, x):
        x = self.fc1(x)
        x = self.activation(x)
        x = self.dropout(x)
        x = self.fc2(x)
        return x

model = MLP(784, 256, 10)

# 参数访问
for name, param in model.named_parameters():
    print(f"{name}: {param.shape}")

# 模型移动到GPU
model = model.cuda()
\`\`\`

**常用层**：

\`\`\`python
# 线性层
nn.Linear(in_features, out_features)

# 卷积层
nn.Conv2d(in_channels, out_channels, kernel_size, stride=1, padding=0)

# 归一化
nn.BatchNorm2d(num_features)
nn.LayerNorm(normalized_shape)

# 注意力
nn.MultiheadAttention(embed_dim, num_heads)

# 激活函数
nn.ReLU(), nn.GELU(), nn.SiLU()
\`\`\`

### 训练循环

标准的PyTorch训练循环模式：

\`\`\`python
model = MLP(784, 256, 10).cuda()
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=0.01)
criterion = nn.CrossEntropyLoss()
scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=100)

for epoch in range(num_epochs):
    model.train()
    for batch in train_loader:
        inputs, targets = batch
        inputs, targets = inputs.cuda(), targets.cuda()
        
        # 前向传播
        outputs = model(inputs)
        loss = criterion(outputs, targets)
        
        # 反向传播
        optimizer.zero_grad()
        loss.backward()
        
        # 梯度裁剪（可选）
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        
        # 参数更新
        optimizer.step()
    
    scheduler.step()
    
    # 验证
    model.eval()
    with torch.no_grad():
        for batch in val_loader:
            # 验证逻辑
            pass
\`\`\`

### 数据加载

\`DataLoader\`提供了高效的数据批处理与多进程加载：

\`\`\`python
from torch.utils.data import Dataset, DataLoader

class CustomDataset(Dataset):
    def __init__(self, data, labels, transform=None):
        self.data = data
        self.labels = labels
        self.transform = transform
    
    def __len__(self):
        return len(self.data)
    
    def __getitem__(self, idx):
        x = self.data[idx]
        if self.transform:
            x = self.transform(x)
        return x, self.labels[idx]

dataset = CustomDataset(data, labels)
loader = DataLoader(
    dataset,
    batch_size=32,
    shuffle=True,
    num_workers=4,
    pin_memory=True,        # 加速GPU传输
    drop_last=True
)
\`\`\`

### 混合精度训练

使用\`torch.cuda.amp\`进行自动混合精度训练，在保持精度的同时降低显存占用。你可能遇到过这种情况：模型跑FP32刚好爆显存，砍batch size又影响收敛。混合精度训练是一个务实的解决方案——前向和反向计算用FP16（速度快、省显存），权重更新仍用FP32（保证精度），两全其美：

\`\`\`python
from torch.cuda.amp import autocast, GradScaler

scaler = GradScaler()

for inputs, targets in loader:
    optimizer.zero_grad()
    
    # 自动混合精度前向
    with autocast():
        outputs = model(inputs)
        loss = criterion(outputs, targets)
    
    # 缩放后反向传播
    scaler.scale(loss).backward()
    
    # 梯度反缩放与更新
    scaler.step(optimizer)
    scaler.update()
\`\`\`

### 模型保存与加载

\`\`\`python
# 保存完整模型（不推荐）
torch.save(model, 'model.pth')

# 保存状态字典（推荐）
torch.save({
    'epoch': epoch,
    'model_state_dict': model.state_dict(),
    'optimizer_state_dict': optimizer.state_dict(),
    'loss': loss,
}, 'checkpoint.pth')

# 加载
checkpoint = torch.load('checkpoint.pth')
model.load_state_dict(checkpoint['model_state_dict'])
optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
\`\`\`

### 分布式训练基础

当单卡显存装不下模型，或者训练速度太慢需要多卡加速时，分布式训练就成了刚需。PyTorch提供了多种分布式训练范式——从最简单的\`DataParallel\`到工业级的\`DistributedDataParallel\`（DDP），复杂度和效率逐级递增：

\`\`\`python
# 数据并行（单机多卡）
model = nn.DataParallel(model)

# 分布式数据并行（推荐）
import torch.distributed as dist
from torch.nn.parallel import DistributedDataParallel as DDP

dist.init_process_group(backend='nccl')
local_rank = int(os.environ['LOCAL_RANK'])
model = model.to(local_rank)
model = DDP(model, device_ids=[local_rank])
\`\`\`

## PyTorch与NumPy的协作

两者在实际项目中经常配合使用：

\`\`\`python
# 数据预处理用NumPy
data = np.load('data.npy')
data = (data - data.mean()) / data.std()

# 转换为Tensor进行训练
tensor_data = torch.from_numpy(data).float()

# 结果转回NumPy进行分析
predictions = model(tensor_data).detach().cpu().numpy()
np.save('predictions.npy', predictions)
\`\`\`

**注意事项**：
- \`torch.from_numpy()\`创建的Tensor与原NumPy数组共享内存
- GPU Tensor需要先\`.cpu()\`再转NumPy
- 注意数据类型匹配（float64 vs float32）

PyTorch与NumPy共同构成了Python深度学习的计算基础。NumPy负责通用数值计算与数据处理，PyTorch则在此基础上提供了GPU加速、自动微分与模型抽象，两者的熟练掌握是进行大模型开发的必备技能。一个典型的工作流是：用NumPy做数据清洗和特征工程，用PyTorch搭建和训练模型，训练完成后再把预测结果转回NumPy做可视化分析。理解这条"数据搬运链"上每一环的职责，是高效开发的基础。
`
    },
    {
      id: "adv-10-03-transformers",
      title: "10.3 Transformers生态",
      file: "大模型教程/10-模型软硬件生态/01-基础生态/02-Transformers生态.md",
      difficulty: "中级-高级",
      duration: "1.5h",
      week: 0,
      phase: 0,
      keywords: ["Transformers生态", "Transformers", "Hugging", "Face", "PEFT"],
      content: `# Transformers生态

Hugging Face构建了一套完整的深度学习工具生态，以Transformers库为核心，配合PEFT、Accelerate、Diffusers等库覆盖了模型开发的各个环节。

在实际项目中，你很少需要从零开始实现一个Transformer模型。绝大多数场景下——无论是做文本分类、对话系统还是图像生成——你的第一步都是去Hugging Face Hub上找一个预训练模型，然后用这套工具链做微调、部署或推理。理解这个生态的各个组件如何协作，几乎是当下大模型开发的"入门必修课"。

## Transformers库

Transformers是当前最流行的预训练模型库，提供了数千个预训练模型的统一接口。它解决的核心痛点是：不同模型（BERT、GPT、LLaMA、Qwen……）各有各的加载方式、输入格式和推理流程，而Transformers用一套统一的\`Auto\`类抹平了这些差异——换模型时只需改一个名字，代码几乎不用动。

### 核心抽象

Transformers的设计围绕三个核心类：

**AutoModel系列**：自动推断模型架构

\`\`\`python
from transformers import AutoModel, AutoModelForCausalLM, AutoModelForSequenceClassification

# 通用模型
model = AutoModel.from_pretrained("bert-base-uncased")

# 特定任务
model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-2-7b-hf")
model = AutoModelForSequenceClassification.from_pretrained("bert-base-uncased", num_labels=2)
\`\`\`

**AutoTokenizer**：文本分词与编码

\`\`\`python
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-2-7b-hf")

# 编码
inputs = tokenizer("Hello, world!", return_tensors="pt")
# {'input_ids': tensor([[1, 15043, 29892, 3186, 29991]]),
#  'attention_mask': tensor([[1, 1, 1, 1, 1]])}

# 解码
text = tokenizer.decode(inputs['input_ids'][0])

# 批量处理
batch = tokenizer(
    ["Hello", "World"],
    padding=True,
    truncation=True,
    max_length=512,
    return_tensors="pt"
)
\`\`\`

**AutoConfig**：模型配置管理

\`\`\`python
from transformers import AutoConfig

config = AutoConfig.from_pretrained("gpt2")
config.num_hidden_layers = 6  # 修改配置
model = AutoModel.from_config(config)
\`\`\`

### Pipeline：快速推理

如果你只是想快速验证一个模型的效果，甚至不想写几行代码来处理tokenizer和模型调用，Pipeline就是为你准备的。它把“加载模型→预处理→推理→后处理”打包成一个函数调用：

\`\`\`mermaid
graph LR
    A[AutoTokenizer] --> C[Pipeline]
    B[AutoModel] --> C
    C --> D[文本预处理]
    D --> E[模型推理]
    E --> F[后处理]
    F --> G[结果输出]
\`\`\`

\`\`\`python
from transformers import pipeline

# 文本生成
generator = pipeline("text-generation", model="gpt2")
result = generator("Once upon a time", max_length=50)

# 文本分类
classifier = pipeline("sentiment-analysis")
result = classifier("I love this product!")

# 问答
qa = pipeline("question-answering")
result = qa(question="What is AI?", context="AI is artificial intelligence...")

# 支持GPU
generator = pipeline("text-generation", model="gpt2", device=0)
\`\`\`

### Trainer：训练封装

手写训练循环固然灵活，但当你需要处理梯度累积、混合精度、多GPU分布式、定期保存checkpoint这些"标配"功能时，代码会迅速膨胀。Trainer类把这些工程细节封装好，让你专注于数据和模型本身：

\`\`\`python
from transformers import Trainer, TrainingArguments

training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=3,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    learning_rate=2e-5,
    weight_decay=0.01,
    evaluation_strategy="epoch",
    save_strategy="epoch",
    load_best_model_at_end=True,
    fp16=True,
    gradient_accumulation_steps=4,
    logging_steps=100,
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    tokenizer=tokenizer,
    data_collator=data_collator,
    compute_metrics=compute_metrics,
)

trainer.train()
trainer.save_model("./final_model")
\`\`\`

### 模型量化

Transformers集成了多种量化方案：

\`\`\`python
from transformers import BitsAndBytesConfig

# 4-bit量化配置
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16,
    bnb_4bit_use_double_quant=True,
)

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-7b-hf",
    quantization_config=bnb_config,
    device_map="auto",
)
\`\`\`

## PEFT：参数高效微调

PEFT（Parameter-Efficient Fine-Tuning）库提供了多种轻量级微调方法。

想象一下这个场景：你有一个7B参数的模型，全量微调需要上百GB显存，远超单卡容量。但你的任务其实很具体——比如让模型学会用特定格式回答客服问题。PEFT的思路是：冻住绝大部分参数，只训练一小组"增量"参数，用不到原模型1%的参数量就能达到接近全量微调的效果。

### LoRA

LoRA（Low-Rank Adaptation）是最常用的参数高效微调方法：

\`\`\`python
from peft import LoraConfig, get_peft_model, TaskType

lora_config = LoraConfig(
    r=16,                          # 低秩矩阵的秩
    lora_alpha=32,                 # 缩放因子
    target_modules=["q_proj", "v_proj", "k_proj", "o_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type=TaskType.CAUSAL_LM,
)

model = get_peft_model(model, lora_config)
model.print_trainable_parameters()
# trainable params: 4,194,304 || all params: 6,742,609,920 || trainable%: 0.0622
\`\`\`

### QLoRA

QLoRA结合量化与LoRA，进一步降低显存需求：

\`\`\`python
from transformers import BitsAndBytesConfig
from peft import prepare_model_for_kbit_training

# 4-bit量化加载
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16,
)

model = AutoModelForCausalLM.from_pretrained(
    model_name,
    quantization_config=bnb_config,
)

# 准备量化模型用于训练
model = prepare_model_for_kbit_training(model)

# 添加LoRA
model = get_peft_model(model, lora_config)
\`\`\`

### 其他PEFT方法

| 方法 | 原理 | 参数量 |
|-----|------|--------|
| LoRA | 低秩分解增量矩阵 | 极少 |
| Prefix Tuning | 可学习的前缀向量 | 少 |
| Prompt Tuning | 软提示嵌入 | 极少 |
| Adapter | 插入适配器层 | 中等 |
| IA3 | 学习缩放向量 | 极少 |

\`\`\`python
from peft import PrefixTuningConfig, PromptTuningConfig

# Prefix Tuning
prefix_config = PrefixTuningConfig(
    task_type=TaskType.CAUSAL_LM,
    num_virtual_tokens=20,
)

# Prompt Tuning
prompt_config = PromptTuningConfig(
    task_type=TaskType.CAUSAL_LM,
    num_virtual_tokens=8,
    prompt_tuning_init="TEXT",
    prompt_tuning_init_text="Classify the sentiment:",
)
\`\`\`

### 模型合并与保存

\`\`\`python
# 保存LoRA权重
model.save_pretrained("./lora_weights")

# 加载LoRA权重
from peft import PeftModel
base_model = AutoModelForCausalLM.from_pretrained(base_model_name)
model = PeftModel.from_pretrained(base_model, "./lora_weights")

# 合并权重（用于推理）
merged_model = model.merge_and_unload()
merged_model.save_pretrained("./merged_model")
\`\`\`

## Accelerate：分布式训练

Accelerate简化了多GPU/多节点训练的代码编写。

你可能遇到过这种情况：代码在单卡上跑得好好的，一上多卡就要改一堆——数据采样器要换成分布式的、模型要包一层DDP、梯度同步要手动处理。Accelerate的设计哲学是"你的训练代码基本不用改"：只需几行配置，它帮你处理设备分配、梯度同步、混合精度等所有分布式细节。

### 基础用法

\`\`\`python
from accelerate import Accelerator

accelerator = Accelerator(
    mixed_precision='bf16',
    gradient_accumulation_steps=4,
)

# 自动处理设备分配与分布式
model, optimizer, train_dataloader = accelerator.prepare(
    model, optimizer, train_dataloader
)

for batch in train_dataloader:
    with accelerator.accumulate(model):
        outputs = model(**batch)
        loss = outputs.loss
        accelerator.backward(loss)
        optimizer.step()
        optimizer.zero_grad()
\`\`\`

### 配置文件

使用\`accelerate config\`生成配置文件：

\`\`\`yaml
# config.yaml
compute_environment: LOCAL_MACHINE
distributed_type: MULTI_GPU
num_processes: 4
mixed_precision: bf16
\`\`\`

启动训练：

\`\`\`bash
accelerate launch --config_file config.yaml train.py
\`\`\`

### DeepSpeed集成

\`\`\`python
from accelerate import Accelerator

accelerator = Accelerator()

# 在配置中指定DeepSpeed
# accelerate config 时选择DeepSpeed

# 代码无需修改，Accelerate自动处理
\`\`\`

DeepSpeed配置示例（ZeRO Stage 3）：

\`\`\`json
{
    "zero_optimization": {
        "stage": 3,
        "offload_optimizer": {"device": "cpu"},
        "offload_param": {"device": "cpu"}
    },
    "bf16": {"enabled": true},
    "train_micro_batch_size_per_gpu": 4
}
\`\`\`

## Diffusers：扩散模型

Diffusers是视觉生成模型的标准库，提供了丰富的扩散模型实现。

假设你正在做一个AI绘画项目：需要文生图、图生图、图像修复、视频生成等多种能力。如果从论文代码出发，每种模型的实现风格、依赖库、接口设计都不一样，集成起来非常痛苦。Diffusers用统一的Pipeline抽象解决了这个问题——切换模型就像换一个名字，而底层的VAE、UNet、调度器等组件还可以灵活替换。

### Pipeline使用

\`\`\`python
from diffusers import StableDiffusionPipeline, DiffusionPipeline
import torch

# 加载模型
pipe = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    torch_dtype=torch.float16,
)
pipe = pipe.to("cuda")

# 文生图
image = pipe(
    "A photo of a cat wearing sunglasses",
    num_inference_steps=50,
    guidance_scale=7.5,
).images[0]

image.save("output.png")
\`\`\`

### 常用Pipeline

| Pipeline | 功能 |
|----------|------|
| StableDiffusionPipeline | 文生图 |
| StableDiffusionImg2ImgPipeline | 图生图 |
| StableDiffusionInpaintPipeline | 图像修复 |
| StableDiffusionXLPipeline | SDXL文生图 |
| StableVideoDiffusionPipeline | 图生视频 |
| FluxPipeline | Flux模型 |

### 核心组件

Diffusers将扩散模型分解为可复用的组件：

\`\`\`python
from diffusers import UNet2DConditionModel, AutoencoderKL, DDPMScheduler
from transformers import CLIPTextModel, CLIPTokenizer

# 各组件独立加载
vae = AutoencoderKL.from_pretrained("model_path", subfolder="vae")
unet = UNet2DConditionModel.from_pretrained("model_path", subfolder="unet")
text_encoder = CLIPTextModel.from_pretrained("model_path", subfolder="text_encoder")
tokenizer = CLIPTokenizer.from_pretrained("model_path", subfolder="tokenizer")
scheduler = DDPMScheduler.from_pretrained("model_path", subfolder="scheduler")
\`\`\`

**调度器**（Scheduler）控制扩散过程：

\`\`\`python
from diffusers import DDPMScheduler, DDIMScheduler, EulerDiscreteScheduler

# 更换调度器
pipe.scheduler = EulerDiscreteScheduler.from_config(pipe.scheduler.config)
\`\`\`

### ControlNet

ControlNet提供精细的图像控制：

\`\`\`python
from diffusers import StableDiffusionControlNetPipeline, ControlNetModel

controlnet = ControlNetModel.from_pretrained(
    "lllyasviel/control_v11p_sd15_canny",
    torch_dtype=torch.float16
)

pipe = StableDiffusionControlNetPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    controlnet=controlnet,
    torch_dtype=torch.float16,
)

# 使用Canny边缘图控制
import cv2
canny_image = cv2.Canny(image, 100, 200)

result = pipe(
    "A beautiful landscape",
    image=canny_image,
    num_inference_steps=30,
).images[0]
\`\`\`

### LoRA加载

\`\`\`python
pipe = StableDiffusionXLPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0",
    torch_dtype=torch.float16,
)

# 加载LoRA权重
pipe.load_lora_weights("path/to/lora")

# 调整LoRA强度
pipe.fuse_lora(lora_scale=0.8)

# 多个LoRA叠加
pipe.load_lora_weights("lora1", adapter_name="style")
pipe.load_lora_weights("lora2", adapter_name="character")
pipe.set_adapters(["style", "character"], adapter_weights=[0.5, 0.5])
\`\`\`

### 模型训练

Diffusers提供了训练脚本示例：

\`\`\`python
from diffusers import DDPMScheduler
from diffusers.optimization import get_cosine_schedule_with_warmup

noise_scheduler = DDPMScheduler(num_train_timesteps=1000)

# 添加噪声
noise = torch.randn_like(latents)
timesteps = torch.randint(0, 1000, (batch_size,))
noisy_latents = noise_scheduler.add_noise(latents, noise, timesteps)

# 预测噪声
noise_pred = unet(noisy_latents, timesteps, encoder_hidden_states).sample

# 损失计算
loss = F.mse_loss(noise_pred, noise)
\`\`\`

## 生态协同

这些库可以无缝协作：

\`\`\`python
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import LoraConfig, get_peft_model
from accelerate import Accelerator

# Transformers加载模型
model = AutoModelForCausalLM.from_pretrained("model_name")
tokenizer = AutoTokenizer.from_pretrained("model_name")

# PEFT添加LoRA
lora_config = LoraConfig(r=16, lora_alpha=32, ...)
model = get_peft_model(model, lora_config)

# Accelerate处理分布式
accelerator = Accelerator()
model, optimizer, dataloader = accelerator.prepare(model, optimizer, dataloader)

# 训练
for batch in dataloader:
    loss = model(**batch).loss
    accelerator.backward(loss)
    optimizer.step()
\`\`\`

Hugging Face生态通过模块化设计与统一接口，大幅降低了大模型开发的门槛。Transformers提供模型抽象，PEFT实现高效微调，Accelerate简化分布式训练，Diffusers支持视觉生成——这套工具链已经成为大模型研发的事实标准。回到实际工作流中看：一个典型的微调项目，往往是Transformers加载模型、PEFT添加LoRA适配器、Accelerate处理多卡训练，三者各司其职又无缝衔接。掌握这套生态的用法和边界，能让你在面对具体需求时快速找到最合适的工具组合。
`
    },
    {
      id: "adv-10-04-megatron",
      title: "10.4 Megatron",
      file: "大模型教程/10-模型软硬件生态/01-基础生态/03-Megatron.md",
      difficulty: "中级-高级",
      duration: "1h",
      week: 0,
      phase: 0,
      keywords: ["Megatron", "NVIDIA", "GPU"],
      content: `# Megatron

Megatron是NVIDIA开发的大规模语言模型训练框架，专为高效利用大规模GPU集群而设计。它实现了张量并行、流水线并行、序列并行等多种并行策略，是训练千亿参数级模型的重要工具。

要理解Megatron的定位，先要明确一个背景：当模型规模超过单卡显存限制时（比如175B参数的GPT-3仅权重就需要350GB显存），简单的数据并行已经不够用了。你需要把模型本身拆开，分散到多张卡上——而怎么拆、怎么通信、怎么调度，正是Megatron解决的核心问题。

## 概述与定位

Megatron最初由NVIDIA发布用于训练GPT系列模型，后与DeepSpeed结合形成了Megatron-DeepSpeed，在工业界大模型训练中广泛应用。

\`\`\`mermaid
graph TD
    A[总 GPU 数量] --> B[张量并行 TP]
    A --> C[流水线并行 PP]
    A --> D[数据并行 DP]
    B --> E[层内权重切分]
    C --> F[层间划分到不同GPU]
    D --> G[数据切分到各副本]
    E --> H[GPU数 = TP × PP × DP]
    F --> H
    G --> H
\`\`\`

**核心特性**：
- 高效的张量并行实现
- 流水线并行与交错调度
- 序列并行减少激活显存
- 与DeepSpeed ZeRO的深度集成
- 针对NVIDIA GPU的深度优化

**适用场景**：
- 百亿至千亿参数模型预训练
- 大规模GPU集群（数十到数千张卡）
- 需要极致训练效率的场景

## 张量并行

Megatron的张量并行将模型层的权重切分到多个GPU上，主要针对Transformer的线性层。换个角度理解：一个巨大的矩阵乘法\`Y = X * W\`，如果权重W太大放不下一张卡，那就把W按列（或按行）切成几块，每张卡算一部分，最后再拼起来。关键在于怎么切能让通信量最小：

### 列并行（Column Parallel）

将权重按列切分，每个GPU持有权重的一部分列：

$$\\mathbf{Y} = \\mathbf{X}\\mathbf{W} = \\mathbf{X}[\\mathbf{W}_1, \\mathbf{W}_2] = [\\mathbf{X}\\mathbf{W}_1, \\mathbf{X}\\mathbf{W}_2]$$

其中 $\\mathbf{X} \\in \\mathbb{R}^{b \\times d}$ 为输入矩阵（$b$ 为 batch × seq 长度，$d$ 为隐藏维度），$\\mathbf{W} \\in \\mathbb{R}^{d \\times k}$ 为完整权重矩阵，$\\mathbf{W}_1, \\mathbf{W}_2$ 分别为权重按列均分后各 GPU 持有的子矩阵。该公式表明：将权重按列切分后，各 GPU 可独立计算局部输出 $\\mathbf{X}\\mathbf{W}_i$，最终将结果按列拼接即可还原完整输出 $\\mathbf{Y}$，前向过程无需跨卡通信。

\`\`\`python
class ColumnParallelLinear(nn.Module):
    def __init__(self, input_size, output_size, world_size, rank):
        super().__init__()
        self.output_size_per_partition = output_size // world_size
        self.weight = nn.Parameter(
            torch.empty(input_size, self.output_size_per_partition)
        )
        self.rank = rank
    
    def forward(self, x):
        # x: [batch, seq, input_size]
        # output: [batch, seq, output_size_per_partition]
        output = F.linear(x, self.weight.t())
        return output
\`\`\`

### 行并行（Row Parallel）

将权重按行切分，输入需要按列切分，输出进行AllReduce聚合：

$$\\mathbf{Y} = \\mathbf{X}\\mathbf{W} = [\\mathbf{X}_1, \\mathbf{X}_2]\\begin{bmatrix}\\mathbf{W}_1 \\\\ \\mathbf{W}_2\\end{bmatrix} = \\mathbf{X}_1\\mathbf{W}_1 + \\mathbf{X}_2\\mathbf{W}_2$$

其中 $\\mathbf{X}_i$ 为输入按列切分后第 $i$ 个 GPU 持有的子矩阵，$\\mathbf{W}_i$ 为权重按行切分后对应的子矩阵。各 GPU 先在本地计算部分积 $\\mathbf{X}_i\\mathbf{W}_i$，再通过 AllReduce 对所有部分积求和得到最终输出 $\\mathbf{Y}$。行并行与列并行配合使用，可使 MLP 或 Attention 层在每个 Transformer 块内仅需两次 AllReduce 通信。

\`\`\`python
class RowParallelLinear(nn.Module):
    def __init__(self, input_size, output_size, world_size, rank):
        super().__init__()
        self.input_size_per_partition = input_size // world_size
        self.weight = nn.Parameter(
            torch.empty(self.input_size_per_partition, output_size)
        )
    
    def forward(self, x):
        # x已经是切分后的输入
        output_parallel = F.linear(x, self.weight.t())
        # AllReduce聚合
        torch.distributed.all_reduce(output_parallel)
        return output_parallel
\`\`\`

### Attention并行化

MLP层与Attention层的并行化策略：

\`\`\`
MLP:
  [X] → ColumnParallel(up_proj) → Activation → RowParallel(down_proj) → [Y]
         无需通信                              AllReduce

Attention:
  [X] → ColumnParallel(QKV) → Attention计算 → RowParallel(out_proj) → [Y]
         无需通信            本地计算        AllReduce
\`\`\`

通过精心设计，张量并行在每个Transformer层只需要2次AllReduce通信。

## 流水线并行

流水线并行将模型按层划分到不同的GPU（称为stage），采用微批次（micro-batch）流水线调度。如果说张量并行是"横切"——把同一层拆到多张卡上，那流水线并行就是"竖切"——把不同的层分给不同的卡。但单纯的竖切会导致严重的"气泡"问题——前面的卡算完了在等后面的卡，后面的卡在等前面的卡。解决办法是把一个大batch切成很多小的micro-batch，让流水线"转起来"：

### GPipe调度

GPipe将一个batch切分为多个micro-batch，依次通过各stage：

\`\`\`
Stage 0: [M0] [M1] [M2] [M3] [  ] [  ] [  ] [  ] [M3'] [M2'] [M1'] [M0']
Stage 1: [  ] [M0] [M1] [M2] [M3] [  ] [  ] [M3'] [M2'] [M1'] [M0'] [  ]
Stage 2: [  ] [  ] [M0] [M1] [M2] [M3] [M3'] [M2'] [M1'] [M0'] [  ] [  ]
Stage 3: [  ] [  ] [  ] [M0] [M1] [M2] [M2'] [M1'] [M0'] [  ] [  ] [  ]
                    |<-- Forward -->|<-- Backward -->|
\`\`\`

### 1F1B调度

1F1B（One Forward One Backward）通过交错前向和反向减少气泡：

\`\`\`
Stage 0: [F0] [F1] [F2] [F3] [B0] [F4] [B1] [F5] [B2] ...
Stage 1:      [F0] [F1] [F2] [B0] [F3] [B1] [F4] [B2] ...
\`\`\`

### 交错调度

Megatron实现的交错流水线并行，将多个虚拟stage分配到同一GPU：

\`\`\`python
# 每个GPU持有多个虚拟stage（非连续层）
# 例如：4个stage，每个GPU 2个虚拟stage
# GPU 0: [Layer 0, 1] + [Layer 8, 9]
# GPU 1: [Layer 2, 3] + [Layer 10, 11]
# GPU 2: [Layer 4, 5] + [Layer 12, 13]
# GPU 3: [Layer 6, 7] + [Layer 14, 15]
\`\`\`

这种设计减少了流水线气泡。

## 序列并行

序列并行将序列维度切分到张量并行组的各GPU上，与张量并行配合。它解决的是一个容易被忽视的问题：张量并行只切分了权重，但像LayerNorm、Dropout这些操作仍然需要每张卡保存完整的激活值，显存并没有省下来。序列并行的思路是：这些操作沿序列维度是独立的，那就把序列切开，每张卡只处理一段：

\`\`\`python
# 非张量并行区域（LayerNorm、Dropout）使用序列并行
# 输入: [batch, seq/tp_size, hidden] 在每个GPU上
# 操作: LayerNorm/Dropout 在切分的序列上独立进行
# 输出: [batch, seq/tp_size, hidden]

# 进入张量并行区域时，通过AllGather收集完整序列
# 退出张量并行区域时，通过ReduceScatter切分序列
\`\`\`

序列并行显著降低了激活内存占用，特别是对于长序列场景。

## 使用方式

### 配置参数

\`\`\`bash
python pretrain_gpt.py \\
    --num-layers 96 \\
    --hidden-size 12288 \\
    --num-attention-heads 96 \\
    --tensor-model-parallel-size 8 \\
    --pipeline-model-parallel-size 4 \\
    --micro-batch-size 1 \\
    --global-batch-size 1536 \\
    --seq-length 2048 \\
    --max-position-embeddings 2048 \\
    --train-iters 500000 \\
    --lr 0.00015 \\
    --lr-decay-style cosine \\
    --min-lr 0.00001 \\
    --lr-warmup-fraction 0.01 \\
    --fp16 \\
    --data-path /path/to/data \\
    --vocab-file /path/to/vocab.json \\
    --merge-file /path/to/merges.txt
\`\`\`

关键参数说明：

| 参数 | 说明 |
|-----|------|
| \`tensor-model-parallel-size\` | 张量并行度 |
| \`pipeline-model-parallel-size\` | 流水线并行度 |
| \`micro-batch-size\` | 每个micro-batch的大小 |
| \`global-batch-size\` | 全局batch大小 |
| \`sequence-parallel\` | 启用序列并行 |
| \`recompute-activations\` | 激活重计算 |

### 数据并行

总GPU数 = 张量并行 × 流水线并行 × 数据并行

即 $N_{\\text{GPU}} = N_{\\text{TP}} \\times N_{\\text{PP}} \\times N_{\\text{DP}}$，其中 $N_{\\text{TP}}$ 为张量并行度（层内切分），$N_{\\text{PP}}$ 为流水线并行度（层间切分），$N_{\\text{DP}}$ 为数据并行度（数据切分）。三者正交组合，覆盖所有 GPU；给定总卡数和其中两种并行度，可推算第三种：$N_{\\text{DP}} = N_{\\text{GPU}} / (N_{\\text{TP}} \\times N_{\\text{PP}})$。

\`\`\`bash
# 64个GPU，TP=8，PP=4
# 数据并行度 = 64 / (8 * 4) = 2
\`\`\`

### 与DeepSpeed集成

Megatron-DeepSpeed结合了两者优势：

\`\`\`bash
deepspeed --num_gpus 64 pretrain_gpt.py \\
    --deepspeed \\
    --deepspeed_config ds_config.json \\
    --tensor-model-parallel-size 8 \\
    --pipeline-model-parallel-size 4 \\
    ...
\`\`\`

DeepSpeed配置：

\`\`\`json
{
    "train_micro_batch_size_per_gpu": 1,
    "gradient_accumulation_steps": 32,
    "zero_optimization": {
        "stage": 1,
        "reduce_bucket_size": 5e8
    },
    "fp16": {
        "enabled": true,
        "loss_scale": 0,
        "loss_scale_window": 500
    }
}
\`\`\`

## 性能优化技巧

### 通信优化

\`\`\`python
# 重叠计算与通信
# AllReduce与下一层计算重叠
output = F.linear(x, weight)
handle = dist.all_reduce(output, async_op=True)
# 执行其他计算...
handle.wait()
\`\`\`

### 激活检查点

\`\`\`python
# 在内存与计算间权衡
from megatron.core.tensor_parallel import checkpoint

def transformer_layer(x, layer):
    # 前向时丢弃中间激活，反向时重新计算
    return checkpoint(layer, x)
\`\`\`

### Flash Attention集成

\`\`\`bash
--use-flash-attn  # 启用Flash Attention
\`\`\`

## 模型架构支持

Megatron支持多种模型架构：

- **GPT系列**：GPT-2、GPT-3风格的解码器模型
- **BERT系列**：双向编码器模型
- **T5系列**：编码器-解码器模型
- **LLaMA风格**：通过Megatron-LLaMA扩展

社区扩展如Megatron-LM、Megatron-Core提供了更多模型支持。

## 与其他框架的对比

| 特性 | Megatron | DeepSpeed | FSDP |
|-----|----------|-----------|------|
| 张量并行 | 原生支持 | ZeRO-TP | 有限 |
| 流水线并行 | 高效实现 | 支持 | 有限 |
| 序列并行 | 支持 | 部分 | 不支持 |
| 易用性 | 中等 | 较好 | 好 |
| 适用规模 | 超大 | 大 | 中大 |

Megatron在超大规模训练中展现出卓越的效率，但学习曲线相对陡峭。对于百亿参数以下的模型，FSDP或DeepSpeed可能是更便捷的选择；对于追求极致效率的千亿级训练，Megatron仍是首选方案。简单来说，选择的原则是：模型规模和集群规模越大，Megatron的优势越明显；规模不大时，用更简单的工具就好，没必要为了架架子而架架子。
`
    },
    {
      id: "adv-10-05-train-framework",
      title: "10.5 训练框架：LLaMA-Factory与SWIFT",
      file: "大模型教程/10-模型软硬件生态/01-基础生态/04-训练框架.md",
      difficulty: "中级-高级",
      duration: "1h",
      week: 0,
      phase: 0,
      keywords: ["训练框架：LLaMA", "Factory与SWIFT", "LLaMA", "Factory", "SWIFT"],
      content: `# 训练框架：LLaMA-Factory与SWIFT

大模型微调是将通用预训练模型适配到特定任务的关键环节。LLaMA-Factory和SWIFT是两个代表性的开源训练框架，它们封装了复杂的训练流程，使研究者和开发者能够便捷地进行模型微调。

\`\`\`mermaid
graph TD
    A[需求分析] --> B{选择框架}
    B -->|友好UI / 纯语言模型| C[LLaMA-Factory]
    B -->|多模态 / ModelScope| D[SWIFT]
    C --> E[数据准备]
    D --> E
    E --> F[配置训练参数]
    F --> G[执行微调]
    G --> H[评估与导出]
\`\`\`

你可能遇到过这种情况：想给一个开源大模型做微调，官方文档里写了一大堆Transformers、PEFT、DeepSpeed的配置代码，光是把数据格式调对就花了半天。这正是训练框架要解决的问题：把"模型加载→数据处理→训练配置→分布式执行"这条链路上的琐碎工作封装起来，让你用一行命令就能启动训练。

## LLaMA-Factory

LLaMA-Factory是一个统一的大模型微调框架，支持多种模型架构和训练方法。它的最大亮点是"低门槛"——即便你对Transformers库的底层细节不熟悉，也能通过Web UI或简单的命令行参数完成微调。

### 核心特性

- **模型支持广泛**：LLaMA、Qwen、ChatGLM、Baichuan、Mistral等主流模型
- **训练方法丰富**：全量微调、LoRA、QLoRA、RLHF、DPO等
- **界面友好**：提供Web UI和命令行两种使用方式
- **资源高效**：支持量化训练、梯度检查点等显存优化技术

### 安装与配置

\`\`\`bash
git clone https://github.com/hiyouga/LLaMA-Factory.git
cd LLaMA-Factory
pip install -e ".[torch,metrics]"
\`\`\`

### 数据格式

LLaMA-Factory使用Alpaca格式或ShareGPT格式的数据：

\`\`\`json
// Alpaca格式
[
  {
    "instruction": "请将以下句子翻译成英文",
    "input": "今天天气很好",
    "output": "The weather is nice today."
  }
]

// ShareGPT格式
[
  {
    "conversations": [
      {"from": "human", "value": "你好"},
      {"from": "gpt", "value": "你好！有什么可以帮助你的吗？"},
      {"from": "human", "value": "介绍一下Python"},
      {"from": "gpt", "value": "Python是一种高级编程语言..."}
    ]
  }
]
\`\`\`

数据集配置在\`data/dataset_info.json\`中注册：

\`\`\`json
{
  "my_dataset": {
    "file_name": "my_data.json",
    "formatting": "alpaca",
    "columns": {
      "prompt": "instruction",
      "query": "input",
      "response": "output"
    }
  }
}
\`\`\`

### 命令行训练

\`\`\`bash
# LoRA微调
llamafactory-cli train \\
    --model_name_or_path Qwen/Qwen2-7B \\
    --stage sft \\
    --finetuning_type lora \\
    --lora_rank 16 \\
    --lora_target q_proj,v_proj \\
    --dataset my_dataset \\
    --template qwen \\
    --output_dir ./output \\
    --per_device_train_batch_size 4 \\
    --gradient_accumulation_steps 4 \\
    --learning_rate 5e-5 \\
    --num_train_epochs 3 \\
    --bf16 True \\
    --logging_steps 10 \\
    --save_steps 500
\`\`\`

### Web UI使用

\`\`\`bash
llamafactory-cli webui
\`\`\`

Web界面提供：
- 模型选择与配置
- 数据集管理
- 训练参数设置
- 实时训练监控
- 模型推理测试

### 高级功能

**多阶段训练**：

\`\`\`bash
# 阶段1：SFT
llamafactory-cli train --stage sft ...

# 阶段2：Reward Model训练
llamafactory-cli train --stage rm ...

# 阶段3：PPO/DPO
llamafactory-cli train --stage ppo ...
# 或
llamafactory-cli train --stage dpo ...
\`\`\`

**模型合并与导出**：

\`\`\`bash
llamafactory-cli export \\
    --model_name_or_path Qwen/Qwen2-7B \\
    --adapter_name_or_path ./output \\
    --export_dir ./merged_model \\
    --export_size 2  # 分片大小(GB)
\`\`\`

## SWIFT

SWIFT（Scalable lightWeight Infrastructure for Fine-Tuning）是ModelScope社区开发的轻量级微调框架，与ModelScope生态深度集成。如果你的模型主要来自ModelScope Hub，或者你需要微调多模态模型（视觉-语言、语音等），SWIFT往往是更顺畅的选择。

### 核心特性

- **ModelScope集成**：无缝对接ModelScope模型库
- **多模态支持**：语言模型、视觉-语言模型、语音模型
- **Agent训练**：支持Agent能力的微调
- **推理优化**：集成vLLM等推理加速

### 安装

\`\`\`bash
pip install ms-swift
# 或完整安装
pip install "ms-swift[all]"
\`\`\`

### 基础使用

\`\`\`bash
# LoRA微调
swift sft \\
    --model_type qwen2-7b-instruct \\
    --dataset alpaca-zh \\
    --train_type lora \\
    --lora_rank 8 \\
    --output_dir ./output \\
    --num_train_epochs 3 \\
    --batch_size 4 \\
    --learning_rate 1e-4
\`\`\`

### Python API

\`\`\`python
from swift.llm import sft_main, SftArguments

args = SftArguments(
    model_type='qwen2-7b-instruct',
    dataset=['alpaca-zh'],
    train_type='lora',
    lora_rank=8,
    output_dir='./output',
)

output = sft_main(args)
\`\`\`

### 数据格式

SWIFT支持多种数据格式：

\`\`\`python
# 标准格式
{
    "query": "你是谁？",
    "response": "我是一个AI助手。",
    "history": [
        ["你好", "你好！"],
        ["今天天气如何？", "今天天气晴朗。"]
    ]
}

# 多模态格式
{
    "query": "描述这张图片",
    "response": "图片中是一只猫...",
    "images": ["path/to/image.jpg"]
}
\`\`\`

### 支持的训练方法

| 方法 | 说明 | 显存需求 |
|-----|------|---------|
| full | 全量微调 | 高 |
| lora | LoRA微调 | 中 |
| qlora | 量化LoRA | 低 |
| adalora | 自适应LoRA | 中 |
| ia3 | IA3微调 | 低 |
| llamapro | LLaMA-Pro | 中 |

### 多模态模型微调

\`\`\`bash
# Qwen-VL微调
swift sft \\
    --model_type qwen-vl-chat \\
    --dataset coco-mini \\
    --train_type lora
\`\`\`

### 推理与部署

\`\`\`bash
# 交互式推理
swift infer \\
    --model_type qwen2-7b-instruct \\
    --adapters ./output/checkpoint-xxx

# vLLM部署
swift deploy \\
    --model_type qwen2-7b-instruct \\
    --adapters ./output/checkpoint-xxx \\
    --infer_backend vllm
\`\`\`

### Agent微调

SWIFT支持训练具有工具调用能力的Agent：

\`\`\`python
# Agent数据格式
{
    "query": "北京今天的天气如何？",
    "response": "<tool_call>get_weather(city='北京')</tool_call>",
    "tools": [
        {
            "name": "get_weather",
            "description": "获取天气信息",
            "parameters": {
                "city": {"type": "string", "description": "城市名"}
            }
        }
    ]
}
\`\`\`

## 两者对比

| 特性 | LLaMA-Factory | SWIFT |
|-----|---------------|-------|
| 生态 | 社区驱动 | ModelScope集成 |
| 模型支持 | 主流LLM | LLM + 多模态 |
| Web UI | 完善 | 基础 |
| Agent训练 | 有限 | 原生支持 |
| 文档 | 详细 | 较好 |
| 部署集成 | 需额外工具 | 内置vLLM |

### 选择建议

**选择LLaMA-Factory**：
- 需要友好的Web界面
- 社区活跃度优先
- 主要做纯语言模型微调

**选择SWIFT**：
- 使用ModelScope模型
- 需要多模态微调
- 需要Agent能力训练
- 希望训练-推理一体化

## 最佳实践

### 数据质量

数据质量比数量更重要。在实际项目中，不少团队花大量时间在调超参上，却忽视了数据本身的问题——重复样本、标注不一致、任务分布严重偏斜。建议：
- 清洗低质量样本
- 确保指令-回复的一致性
- 平衡不同任务类型的比例

### 超参数选择

\`\`\`yaml
# LoRA微调典型配置
lora_rank: 8-64          # 秩越大，能力越强，但易过拟合
lora_alpha: 16-128       # 通常为rank的2倍
learning_rate: 1e-4~5e-5 # LoRA使用较大学习率
batch_size: 4-16         # 根据显存调整
epochs: 2-5              # 避免过拟合
\`\`\`

### 显存优化

\`\`\`bash
# 启用梯度检查点
--gradient_checkpointing True

# 使用BF16
--bf16 True

# 使用QLoRA
--quantization_bit 4

# 减小batch size，增大梯度累积
--per_device_train_batch_size 1
--gradient_accumulation_steps 16
\`\`\`

这两个框架极大地降低了大模型微调的门槛，使得研究者可以专注于数据准备与实验设计，而非底层实现细节。根据具体需求选择合适的框架，可以显著提升开发效率。实践中不妨两个都试试——它们的安装和基本使用都很简单，跑一个小数据集的微调只需几分钟，你很快就能感受到哪个更适合自己的工作流。
`
    },
    {
      id: "adv-10-06-lerobot",
      title: "10.6 LeRobot",
      file: "大模型教程/10-模型软硬件生态/01-基础生态/05-LeRobot.md",
      difficulty: "中级-高级",
      duration: "1h",
      week: 0,
      phase: 0,
      keywords: ["LeRobot", "Hugging", "Face", "NLP"],
      content: `# LeRobot

LeRobot是Hugging Face推出的机器人学习开源平台，旨在将大模型时代的方法论引入机器人领域，降低机器人 AI研究的门槛。

在NLP和计算机视觉领域，“下载预训练模型→微调→部署”的工作流已经非常成熟。但在机器人领域，情况还很原始：每个实验室的数据格式不一样，硬件接口各异，代码很难复现。LeRobot试图改变这一现状——就像Transformers库统一了NLP模型的接口，LeRobot要统一机器人策略模型的数据、训练和评估流程。

## 概述

LeRobot的核心理念是将机器人学习标准化，如同Transformers库对NLP模型所做的那样。它提供了：

- **预训练模型**：共享的操作策略模型
- **标准数据集**：统一格式的机器人数据集
- **仿真环境**：用于训练和评估的仿真平台
- **真实硬件支持**：低成本机械臂的驱动

### 设计理念

\`\`\`
预训练模型（Policy）
       ↓
  LeRobot Hub     ←→   标准数据格式（LeRobotDataset）
       ↓
仿真/真实环境（Gym接口）
\`\`\`

## 安装与配置

\`\`\`bash
# 基础安装
pip install lerobot

# 完整安装（含仿真环境）
pip install "lerobot[all]"

# 开发安装
git clone https://github.com/huggingface/lerobot.git
cd lerobot
pip install -e ".[all]"
\`\`\`

## 核心组件

### 策略模型（Policy）

LeRobot支持多种策略架构。为什么需要多种？因为不同的机器人任务特性差异很大——精细操作（如拧螺丝）需要大量连续动作的精确序列，而抓放任务可能只需要几个关键节点的决策。不同的策略架构正是针对这些不同场景优化的：

| 策略 | 描述 | 适用场景 |
|-----|------|---------|
| ACT | Action Chunking Transformer | 灵巧操作 |
| Diffusion Policy | 扩散模型策略 | 多模态动作分布 |
| TDMPC | 时序差分MPC | 需要规划的任务 |
| VQ-BeT | 向量量化行为Transformer | 离散动作空间 |

\`\`\`python
from lerobot.common.policies.act.modeling_act import ACTPolicy

policy = ACTPolicy.from_pretrained("lerobot/act_aloha_sim_transfer_cube_human")
\`\`\`

### 数据集格式

LeRobotDataset定义了统一的数据格式：

\`\`\`python
from lerobot.common.datasets.lerobot_dataset import LeRobotDataset

dataset = LeRobotDataset("lerobot/aloha_sim_transfer_cube_human")

# 数据结构
sample = dataset[0]
# {
#     "observation.images.top": tensor [C, H, W],
#     "observation.state": tensor [state_dim],
#     "action": tensor [action_dim],
#     "episode_index": int,
#     "frame_index": int,
#     "timestamp": float,
# }
\`\`\`

**数据集元信息**：

\`\`\`python
print(dataset.meta)
# {
#     "fps": 50,
#     "video_backend": "pyav",
#     "robot_type": "aloha",
#     "features": {...},
# }
\`\`\`

### 仿真环境

LeRobot集成了多个仿真环境：

\`\`\`python
import gymnasium as gym
import gym_aloha  # LeRobot提供的环境

env = gym.make("gym_aloha/AlohaTransferCube-v0")
observation, info = env.reset()

for _ in range(1000):
    action = policy.select_action(observation)
    observation, reward, terminated, truncated, info = env.step(action)
\`\`\`

支持的环境：
- **ALOHA**：双臂操作仿真
- **PushT**：简单推动任务
- **xArm**：xArm机械臂仿真

## 训练流程

### 配置文件

\`\`\`yaml
# configs/policy/act.yaml
policy:
  name: act
  
  # 网络结构
  dim_model: 512
  n_heads: 8
  n_encoder_layers: 4
  n_decoder_layers: 1
  
  # 动作块
  chunk_size: 100
  n_action_steps: 100
  
  # 输入配置
  input_shapes:
    observation.images.top: [3, 480, 640]
    observation.state: [14]
  output_shapes:
    action: [14]
\`\`\`

### 训练脚本

\`\`\`bash
python lerobot/scripts/train.py \\
    --policy.name=act \\
    --env.name=aloha \\
    --env.task=AlohaTransferCube-v0 \\
    --dataset.repo_id=lerobot/aloha_sim_transfer_cube_human \\
    --training.num_epochs=100 \\
    --training.batch_size=8 \\
    --training.lr=1e-5 \\
    --device=cuda
\`\`\`

### Python训练

\`\`\`python
from lerobot.scripts.train import train
from lerobot.common.utils.utils import init_hydra_config

cfg = init_hydra_config("lerobot/configs/default.yaml")
train(cfg)
\`\`\`

## 数据采集

### 遥操作采集

在机器人学习中，训练数据通常由人类示范采集而来。LeRobot支持通过遥操作采集真实数据——你操控一只"教师"机械臂做示范，"学生"机械臂跟着模仿，同时记录下所有的观测和动作。这种“leader-follower”模式是当前机器人数据采集的主流方式：

\`\`\`bash
# 使用leader-follower采集
python lerobot/scripts/control_robot.py \\
    --robot.name=aloha \\
    --robot.type=real \\
    --control.type=teleoperate \\
    --output_dir=./my_dataset
\`\`\`

### 数据上传

\`\`\`python
from lerobot.common.datasets.push_dataset_to_hub import push_dataset_to_hub

push_dataset_to_hub(
    raw_dir="./my_dataset",
    repo_id="username/my_robot_dataset",
    fps=50,
    video=True,
)
\`\`\`

## 评估与部署

### 仿真评估

\`\`\`bash
python lerobot/scripts/eval.py \\
    --policy.path=lerobot/act_aloha_sim_transfer_cube_human \\
    --env.name=aloha \\
    --env.task=AlohaTransferCube-v0 \\
    --eval.n_episodes=50
\`\`\`

### 真实机器人部署

\`\`\`python
from lerobot.common.robot_devices.robots.factory import make_robot
from lerobot.common.policies.act.modeling_act import ACTPolicy

# 初始化机器人
robot = make_robot("aloha")
robot.connect()

# 加载策略
policy = ACTPolicy.from_pretrained("path/to/model")

# 控制循环
while True:
    observation = robot.get_observation()
    action = policy.select_action(observation)
    robot.send_action(action)
\`\`\`

## 低成本硬件

LeRobot推动低成本机器人硬件的普及。这一点很重要——如果一套机械臂要几万美元，那只有少数实验室负担得起；但如果几百美元就能搭一套，大学生和爱好者也能参与进来。这正是"民主化"的含义：

### Koch v1.1机械臂

一种低成本的开源机械臂设计，成本约几百美元：

\`\`\`python
from lerobot.common.robot_devices.robots.koch import KochRobot

robot = KochRobot(
    leader_arms=["left", "right"],
    follower_arms=["left", "right"],
)
robot.connect()
\`\`\`

### 支持的硬件

| 硬件 | 类型 | 特点 |
|-----|------|------|
| ALOHA | 双臂平台 | 专业级 |
| Koch | 机械臂 | 低成本、开源 |
| xArm | 机械臂 | 商业级 |
| SO-100 | 机械臂 | 教育级 |

## Hugging Face Hub集成

### 模型分享

\`\`\`python
policy.push_to_hub("username/my_robot_policy")
\`\`\`

### 数据集浏览

LeRobot数据集可以在Hugging Face Hub上浏览，支持：
- 视频预览
- 元数据查看
- 统计信息

## 与大模型的结合

LeRobot正在探索将视觉-语言模型与机器人策略结合：

\`\`\`python
# 使用VLM进行任务规划
# 使用LeRobot策略执行低层动作
\`\`\`

这种分层架构中，大模型负责理解指令和高层规划，LeRobot策略负责具体的运动控制。

LeRobot代表了将大模型方法论引入机器人学习的重要尝试。通过标准化数据格式、共享预训练模型、降低硬件门槛，它正在使机器人 AI研究变得更加民主化。随着更多数据和模型的积累，跨实体、跨任务的泛化将成为可能。现在入局的最大优势是：你可以直接复用别人采集的数据和训练好的策略，不用从零开始，这在以前的机器人研究中是很难做到的。
`
    },
    {
      id: "adv-10-07-verl",
      title: "10.7 veRL",
      file: "大模型教程/10-模型软硬件生态/01-基础生态/06-veRL.md",
      difficulty: "中级-高级",
      duration: "1h",
      week: 0,
      phase: 0,
      keywords: ["veRL", "RLHF", "Reinforcement", "Learning", "Human", "Feedback"],
      content: `# veRL

veRL是字节跳动开源的大模型强化学习训练框架，专注于RLHF（Reinforcement Learning from Human Feedback）和基于强化学习的模型对齐训练。

为什么需要专门的RLHF框架？因为RLHF的工程复杂度远超普通的SFT微调。一次训练过程中，你需要同时维护四个模型（Actor、Critic、Reward Model、Reference Model），它们之间有复杂的数据流交互，还要在多张GPU上合理分配显存。如果手写这套流程，光是协调四个模型的显存分配就够头疼的了。veRL把这些工程细节封装好，让你专注于算法和奖励设计。

## 概述

veRL的设计目标是提供一个高效、灵活的大模型强化学习训练解决方案。与传统的RLHF实现相比，veRL强调：

- **效率**：优化的Actor-Critic架构，减少通信开销
- **灵活性**：支持多种RL算法（PPO、GRPO、ReMax等）
- **可扩展性**：支持大规模分布式训练
- **易用性**：简洁的API设计

### 核心架构

\`\`\`
veRL架构
├── Actor（策略模型）
│   └── 生成响应，更新策略
├── Critic（价值模型）
│   └── 估计状态价值
├── Reward Model（奖励模型）
│   └── 评估响应质量
└── Reference Model（参考模型）
    └── 计算KL散度约束
\`\`\`

## 安装

\`\`\`bash
pip install verl

# 或从源码安装
git clone https://github.com/volcengine/verl.git
cd verl
pip install -e .
\`\`\`

## 核心概念

### 数据流

veRL中的RLHF训练数据流：

\`\`\`mermaid
graph LR
    A[Prompt] --> B[Actor生成响应]
    B --> C[Reward Model评分]
    B --> D[Reference Model计算KL]
    C --> E[优势估计]
    D --> E
    E --> F[策略更新]
    F --> A
\`\`\`

### 角色分离

veRL采用角色分离的设计，各模型可以独立部署和扩展：

\`\`\`python
from verl import DataProto

# 数据协议定义
batch = DataProto(
    prompts=prompts,          # 输入提示
    responses=responses,       # 生成的响应
    attention_mask=mask,
    rewards=rewards,           # 奖励信号
    advantages=advantages,     # 优势估计
    old_log_probs=old_logp,   # 旧策略概率
)
\`\`\`

## 训练流程

### 配置示例

\`\`\`yaml
# config.yaml
actor:
  model_path: "Qwen/Qwen2-7B-Instruct"
  learning_rate: 1e-6
  ppo_epochs: 4
  
critic:
  model_path: "Qwen/Qwen2-7B-Instruct"
  learning_rate: 5e-6
  
reward_model:
  model_path: "path/to/reward_model"
  
training:
  batch_size: 128
  rollout_batch_size: 256
  kl_coef: 0.1
  clip_range: 0.2
  gamma: 1.0
  gae_lambda: 0.95
\`\`\`

### PPO训练

\`\`\`python
from verl import PPOTrainer
from verl.utils.config import Config

config = Config.from_yaml("config.yaml")
trainer = PPOTrainer(config)

# 训练循环
for iteration in range(num_iterations):
    # 1. 采集rollout
    rollouts = trainer.collect_rollouts(prompts)
    
    # 2. 计算奖励
    rewards = trainer.compute_rewards(rollouts)
    
    # 3. 计算优势
    advantages = trainer.compute_advantages(rollouts, rewards)
    
    # 4. 更新策略
    trainer.update_policy(rollouts, advantages)
    
    # 5. 更新价值函数
    trainer.update_value_function(rollouts)
\`\`\`

### GRPO训练

veRL支持Group Relative Policy Optimization（GRPO），这是一种不需要Critic模型的轻量级替代方案。在实际中这意味着什么？少维护一个模型，显存压力小很多，特别适合显存有限的场景：

\`\`\`python
from verl import GRPOTrainer

trainer = GRPOTrainer(config)

# GRPO不需要Critic模型
# 通过组内相对排序估计优势
for iteration in range(num_iterations):
    # 对每个prompt生成多个响应
    rollouts = trainer.collect_group_rollouts(prompts, group_size=4)
    
    # 组内相对排序
    advantages = trainer.compute_group_advantages(rollouts)
    
    # 更新策略
    trainer.update_policy(rollouts, advantages)
\`\`\`

## 分布式训练

### Ray集成

veRL使用Ray进行分布式编排：

\`\`\`python
import ray
from verl.trainer.ppo_trainer import RayPPOTrainer

ray.init()

trainer = RayPPOTrainer.remote(config)

# 分布式训练
result = ray.get(trainer.train.remote())
\`\`\`

### 资源配置

\`\`\`yaml
# 分布式配置
distributed:
  actor_tp: 2           # Actor张量并行
  critic_tp: 2          # Critic张量并行
  num_rollout_workers: 4
  num_update_workers: 2
\`\`\`

## 奖励模型

### 使用预训练奖励模型

\`\`\`python
from verl.models.reward_model import RewardModel

reward_model = RewardModel.from_pretrained("path/to/rm")

def compute_rewards(responses, prompts):
    inputs = [f"{p}\\n{r}" for p, r in zip(prompts, responses)]
    rewards = reward_model(inputs)
    return rewards
\`\`\`

### 规则奖励

支持自定义规则奖励函数。在实际项目中，纯奖励模型往往不够用——你可能还希望模型的回答不要太长、符合特定格式、或者不包含敏感词。这时候可以用规则奖励来补充：

\`\`\`python
def rule_based_reward(response: str) -> float:
    reward = 0.0
    
    # 长度惩罚
    if len(response) > 1000:
        reward -= 0.5
    
    # 格式奖励
    if response.startswith("答案："):
        reward += 0.2
    
    return reward
\`\`\`

### 多奖励组合

\`\`\`python
def combined_reward(response, prompt):
    rm_reward = reward_model(prompt, response)
    rule_reward = rule_based_reward(response)
    
    # 加权组合
    return 0.8 * rm_reward + 0.2 * rule_reward
\`\`\`

## 高级功能

### KL约束

\`\`\`python
# KL散度惩罚
kl_penalty = compute_kl_divergence(
    new_log_probs,
    old_log_probs,
    ref_log_probs
)

loss = policy_loss - config.kl_coef * kl_penalty
\`\`\`

### 值函数基线

\`\`\`python
# GAE优势估计
advantages = compute_gae(
    rewards=rewards,
    values=values,
    gamma=config.gamma,
    gae_lambda=config.gae_lambda
)

# 归一化
advantages = (advantages - advantages.mean()) / (advantages.std() + 1e-8)
\`\`\`

### 梯度累积

\`\`\`python
for micro_batch in split_batch(batch, config.gradient_accumulation):
    loss = compute_loss(micro_batch)
    loss = loss / config.gradient_accumulation
    loss.backward()

optimizer.step()
optimizer.zero_grad()
\`\`\`

## 与其他框架对比

| 特性 | veRL | TRL | OpenRLHF |
|-----|------|-----|----------|
| 分布式支持 | Ray | Accelerate | Ray |
| 算法 | PPO/GRPO/ReMax | PPO/DPO | PPO/DPO |
| 显存优化 | 好 | 中等 | 好 |
| 易用性 | 中等 | 好 | 中等 |
| 大规模训练 | 好 | 一般 | 好 |

## 最佳实践

### 超参数调优

\`\`\`yaml
# 推荐起始配置
ppo:
  clip_range: 0.2          # PPO裁剪范围
  kl_coef: 0.1             # KL系数，可自适应
  entropy_coef: 0.01       # 熵正则化
  
training:
  actor_lr: 1e-6           # Actor学习率（小）
  critic_lr: 5e-6          # Critic学习率（稍大）
  warmup_ratio: 0.1        # 预热比例
\`\`\`

### 训练稳定性

\`\`\`python
# 奖励归一化
rewards = (rewards - rewards.mean()) / (rewards.std() + 1e-8)

# 梯度裁剪
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)

# 早停
if kl_divergence > config.max_kl:
    break
\`\`\`

### 监控指标

训练过程中需要关注：
- **KL散度**：策略偏离程度
- **奖励均值/方差**：奖励信号质量
- **策略熵**：探索程度
- **优势估计方差**：训练稳定性

veRL为大模型强化学习训练提供了高效的解决方案。通过合理的架构设计和优化，它能够支持百亿参数级模型的RLHF训练。对于刚接触RLHF的团队，建议先用GRPO起步——不需要Critic模型，显存压力小，调试也更容易。等熟悉了整个流程后，再尝试完整的PPO训练也不迟。
`
    },
    {
      id: "adv-10-08-diff-synth",
      title: "10.8 DiffSynth-Studio：视觉生成引擎",
      file: "大模型教程/10-模型软硬件生态/01-基础生态/07-Diff-Synth.md",
      difficulty: "中级-高级",
      duration: "0.5h",
      week: 0,
      phase: 0,
      keywords: ["DiffSynth", "Studio：视觉生成引擎", "Studio", "Diffusion"],
      content: `# DiffSynth-Studio：视觉生成引擎

DiffSynth-Studio是魔搭社区团队开发的开源Diffusion模型引擎，覆盖图像生成、图像编辑、视频生成等视觉合成任务。它不只是一个推理工具——从模型加载、显存调度到LoRA训练，整条链路都做了系统性封装。

\`\`\`mermaid
graph TD
    A[DiffSynth 生态] --> B[DiffSynth-Studio]
    A --> C[DiffSynth-Engine]
    B --> D[前沿探索 / 学术研究]
    C --> E[稳定部署 / 工业生产]
    D --> F[图像生成]
    D --> G[视频生成]
    D --> H[图像编辑]
    D --> I[模型训练]
\`\`\`

DiffSynth生态分为两条线：**DiffSynth-Studio**面向学术与技术探索，快速跟进前沿模型；**DiffSynth-Engine**面向工业部署，优先保证性能和稳定性。两者共同构成魔搭社区AIGC专区的核心引擎。

## 架构设计

多数扩散模型框架把重心放在推理流程上，DiffSynth-Studio的野心更大——它把显存管理、模型结构、训练流程作为三个独立可插拔的模块来设计。

### 显存管理

扩散模型的显存问题非常突出。以Stable Diffusion XL为例，仅模型权重就占用约6.5GB，加上UNet推理时的中间激活值、VAE解码、文本编码器，轻松突破12GB。在消费级GPU上跑高分辨率生图几乎不可能——除非框架层面做精细管理。

DiffSynth-Studio 2.0引入了**Layer级别的Disk Offload**机制。传统offload把整个模型在GPU和CPU之间搬运，粒度太粗。Layer级别offload的思路是：推理到哪一层，就把那一层加载到GPU，其余层卸载到CPU甚至磁盘。这同时释放了内存和显存，使得在8GB显存的GPU上也能运行大型模型。

\`\`\`python
import torch
from diffsynth import ModelManager, FluxImagePipeline

# 加载模型，启用显存优化
model_manager = ModelManager(
    torch_dtype=torch.bfloat16,
    device="cuda"
)
model_manager.load_models(
    ["models/FLUX/flux1-dev.safetensors"],
    torch_dtype=torch.bfloat16
)

pipe = FluxImagePipeline.from_model_manager(model_manager)

# 生成图像
image = pipe(
    prompt="A cat sitting on a windowsill, golden hour light, film grain",
    num_inference_steps=20,
    height=1024, width=1024
)
image.save("output.png")
\`\`\`

### 支持的模型

DiffSynth-Studio覆盖了主流的扩散模型架构：

| 模型 | 类型 | 特点 | 训练支持 |
|------|------|------|---------|
| FLUX.2 | 文生图 | 高质量图像，支持4B/9B/dev多版本 | ✓ |
| Qwen-Image | 文生图/编辑 | 通义系列，支持ControlNet、EliGen | ✓ |
| Wan 2.1/2.2 | 文生视频 | 1.3B/14B，支持图生视频、视频续写 | ✓ |
| LTX-2 | 音视频生成 | 音频驱动视频、音视频联合生成 | ✓ |
| Z-Image | 文生图 | 含Turbo版本，快速生成 | ✓ |
| Stable Diffusion 3 | 文生图 | MMDiT架构 | ✓ |
| MOVA | 视频生成 | 360p/720p多分辨率 | ✓ |

这些模型不只是"能跑推理"——DiffSynth-Studio为每个模型都实现了完整的训练链路，包括全量微调和LoRA训练。

## 安装

\`\`\`bash
pip install diffsynth

# 或从源码安装（推荐开发者使用）
git clone https://github.com/modelscope/DiffSynth-Studio.git
cd DiffSynth-Studio
pip install -e .
\`\`\`

## 训练框架

DiffSynth-Studio的训练模块做了三项关键优化，每一项都直接影响实际可用性。

### 拆分训练（Split Training）

扩散模型训练中，文本编码器和VAE编码器不需要梯度回传——它们只负责把文本和图像转换成latent表示。传统做法是每个训练步骤都跑一遍这些编码器，白白占用显存和计算。

拆分训练把流程自动切成两个阶段：

\`\`\`mermaid
graph LR
    A[原始数据] --> B[阶段1: 数据预处理]
    B --> C[文本编码]
    B --> D[VAE编码]
    C --> E[缓存Latent]
    D --> E
    E --> F[阶段2: 训练]
    F --> G[仅训练UNet/DiT]
\`\`\`

阶段1处理所有样本的编码工作并缓存结果，阶段2只训练核心去噪网络。这不只是加速——显存峰值大幅降低，因为训练阶段不再需要同时加载编码器。训练ControlNet或其他附加模块时同样适用。

### 差分LoRA训练（Differential LoRA）

标准LoRA在基础权重旁边加一对低秩矩阵$A$和$B$，微调时只更新$A$和$B$。差分LoRA的思路不同：它不从零初始化，而是从两个已有模型的权重差异出发。

假设有一个基础模型$W_0$和一个已经微调过的模型$W_1$，两者的差$\\Delta W = W_1 - W_0$可以用低秩分解近似：

$$\\Delta W \\approx BA$$

然后在$BA$的基础上继续训练。好处是训练起点就已经编码了$W_1$的能力，收敛更快，效果更好。这项技术最初在ArtAug项目中提出，现在已经泛化到DiffSynth-Studio中任意模型的LoRA训练。

### FP8训练

训练扩散模型时，并非所有参数都需要高精度。FP8训练把不参与梯度计算的模型（梯度关闭的部分，或只影响LoRA权重的部分）转为FP8格式，显存直接减半。LoRA权重本身依然保持BF16/FP16精度，不影响训练质量。

## 图像编辑

DiffSynth-Studio不只做生成，还支持多种编辑能力。

### Qwen-Image-Edit

基于Qwen-Image训练的编辑模型，支持指令引导的图像修改：

\`\`\`python
from diffsynth import ModelManager, QwenImageEditPipeline

model_manager = ModelManager(torch_dtype=torch.bfloat16, device="cuda")
model_manager.load_models(["models/Qwen-Image-Edit/model.safetensors"])

pipe = QwenImageEditPipeline.from_model_manager(model_manager)

edited_image = pipe(
    image=original_image,
    prompt="Change the sky to sunset colors"
)
\`\`\`

### In-Context Editing

一种更有趣的编辑模式：给模型三张图A、B、C，模型分析A到B的变换，然后把同样的变换应用到C生成D。比如A是一张白天的照片，B是同一场景的夜景版本，C是另一张白天照片——模型自动推断"白天→夜景"的变换并应用到C。

### 图层拆分

给定一张图像和一段文本描述，模型把图像中与描述对应的内容拆分成独立图层。这在海报设计、电商场景中很实用——从一张产品图中自动拆出主体、背景、文字等元素。

## 视频生成

DiffSynth-Studio在视频生成方面的支持最为完整，覆盖了Wan系列模型的全部能力。

### 文本到视频

\`\`\`python
from diffsynth import ModelManager, WanVideoPipeline

model_manager = ModelManager(torch_dtype=torch.bfloat16, device="cuda")
model_manager.load_models([
    "models/Wan2.1/wan2.1_14b.safetensors",
])

pipe = WanVideoPipeline.from_model_manager(model_manager)

video = pipe(
    prompt="A drone flying over a mountain lake at sunrise, cinematic quality",
    num_inference_steps=50,
    num_frames=81,
    height=480, width=832,
)
\`\`\`

### 图像到视频

以一张静态图作为起始帧，生成动态视频。适合从概念图生成产品展示动画。

### 音频驱动视频

Wan2.2-S2V支持音频驱动的视频生成——输入一段音频，模型生成与音频节奏和情绪匹配的视频内容。LTX-2进一步支持音视频联合生成，实现真正的多模态输出。

## ControlNet与EliGen

精确控制生成结果是实际应用中的刚需。DiffSynth-Studio为Qwen-Image实现了多种控制方案。

### ControlNet

基于轻量化的Blockwise设计，支持六种结构控制条件：

- **Canny**：边缘轮廓控制
- **Depth**：深度图控制
- **Lineart**：线稿控制
- **Softedge**：柔和边缘控制
- **Normal**：法线贴图控制
- **OpenPose**：人体姿态控制

这些控制模型采用In-Context技术路线，通过一个统一的Control-Union模型同时支持多种条件，不需要为每种条件单独加载不同的ControlNet。

### EliGen

EliGen（Element-level Image Generation）支持元素级别的精确控制。EliGen-Poster专为电商海报场景设计，支持精确的分区布局——你可以指定"左侧放产品图、右侧放文案、底部放促销信息"，模型按照分区约束生成。

## 实践示例：LoRA训练

以FLUX模型的LoRA训练为例，展示DiffSynth-Studio的训练流程：

\`\`\`python
# 准备训练配置
from diffsynth import FluxLoRATrainer

trainer = FluxLoRATrainer(
    pretrained_path="models/FLUX/flux1-dev.safetensors",
    lora_rank=16,
    learning_rate=1e-4,
    train_batch_size=1,
    gradient_accumulation_steps=4,
    max_train_steps=1000,
    output_dir="output/flux_lora",
)

# 加载训练数据
trainer.load_dataset(
    dataset_path="data/my_images/",
    prompt_column="text",
    image_column="image",
    resolution=1024,
)

# 开始训练
trainer.train()
\`\`\`

训练完成后，加载LoRA权重进行推理：

\`\`\`python
model_manager.load_lora("output/flux_lora/lora.safetensors", lora_alpha=1.0)

image = pipe(
    prompt="A portrait in the style of my_lora_concept",
    num_inference_steps=20,
)
\`\`\`

## 相关资源

- 官方仓库：https://github.com/modelscope/DiffSynth-Studio
- 部署引擎：https://github.com/modelscope/DiffSynth-Engine
- 文档中心：https://diffsynth-studio.readthedocs.io
- 魔搭AIGC专区：https://modelscope.cn/aigc/home
`
    },
    {
      id: "adv-10-09-inference-engine",
      title: "10.9 推理引擎：vLLM与SGLang",
      file: "大模型教程/10-模型软硬件生态/01-基础生态/08-推理引擎.md",
      difficulty: "中级-高级",
      duration: "1h",
      week: 0,
      phase: 0,
      keywords: ["推理引擎：vLLM与SGLang", "LLM", "SGLang", "Transformers"],
      content: `# 推理引擎：vLLM与SGLang

大模型推理的效率直接影响服务成本与用户体验。vLLM和SGLang是两个代表性的高性能推理引擎，它们通过创新的调度和内存管理技术显著提升了推理吞吐量。

为什么不能直接用Transformers库做推理？当然可以，但效率差很多。举个例子：一个7B模型用Transformers原生推理可能每秒生成20个token，而用vLLM可以轻松达到数百甚至上千token/秒的吞吐量。这个差距在生产环境中直接影响服务器成本——推理效率提升10倍，意味着服务器费用可以降到原来的十分之一。

## vLLM

vLLM是UC Berkeley开发的高吞吐量大模型推理引擎，以PagedAttention技术著称。

\`\`\`mermaid
graph LR
    A[用户请求] --> B[Tokenize]
    B --> C[KV Cache分配]
    C --> D[模型推理]
    D --> E[Continuous Batching]
    E --> F[Detokenize]
    F --> G[响应输出]
\`\`\`

### 核心技术

**PagedAttention**：将KV Cache按页管理，避免预分配导致的显存浪费。

这里有个很直观的类比：传统方法就像给每个顾客预留一张最大号的桌子，即使他只点了一杯咖啡也占着十人座，大量座位被浪费了。PagedAttention的做法是"按需分配”——小单就给小桌子，大单再加桌子，而且桌子不用连在一起，通过一张"桌号表"就能找到每位顾客的座位。

传统方法需要为每个序列预分配最大长度的连续KV Cache空间，导致显存碎片化。PagedAttention将KV Cache划分为固定大小的块（如16个token），通过块表（Block Table）管理非连续的物理内存：

\`\`\`text
逻辑视图：[Token 0-15] [Token 16-31] [Token 32-47] ...
              ↓            ↓            ↓
物理块：   Block 7     Block 2     Block 15    ...
\`\`\`

**Continuous Batching**：动态批处理，新请求无需等待当前批次完成即可加入。

### 安装与基础使用

\`\`\`bash
pip install vllm
\`\`\`

**离线推理**：

\`\`\`python
from vllm import LLM, SamplingParams

# 加载模型
llm = LLM(
    model="Qwen/Qwen2-7B-Instruct",
    tensor_parallel_size=2,    # 张量并行
    gpu_memory_utilization=0.9,
    dtype="bfloat16",
)

# 采样参数
sampling_params = SamplingParams(
    temperature=0.7,
    top_p=0.9,
    max_tokens=256,
)

# 批量推理
prompts = ["Hello, my name is", "The capital of France is"]
outputs = llm.generate(prompts, sampling_params)

for output in outputs:
    print(f"Prompt: {output.prompt}")
    print(f"Generated: {output.outputs[0].text}")
\`\`\`

**在线服务**：

\`\`\`bash
# 启动服务器
python -m vllm.entrypoints.openai.api_server \\
    --model Qwen/Qwen2-7B-Instruct \\
    --tensor-parallel-size 2 \\
    --port 8000
\`\`\`

\`\`\`python
# 客户端调用（兼容OpenAI API）
from openai import OpenAI

client = OpenAI(base_url="http://localhost:8000/v1", api_key="dummy")

response = client.chat.completions.create(
    model="Qwen/Qwen2-7B-Instruct",
    messages=[{"role": "user", "content": "你好"}],
    max_tokens=100,
)
print(response.choices[0].message.content)
\`\`\`

### 高级配置

\`\`\`python
llm = LLM(
    model="model_path",
    
    # 并行配置
    tensor_parallel_size=4,
    pipeline_parallel_size=2,
    
    # 显存管理
    gpu_memory_utilization=0.95,
    max_model_len=8192,
    
    # 量化
    quantization="awq",  # 或 "gptq", "squeezellm"
    
    # KV Cache
    block_size=16,
    swap_space=4,  # CPU交换空间(GB)
    
    # 性能
    enforce_eager=False,  # 使用CUDA Graph
    max_num_seqs=256,     # 最大并发序列数
)
\`\`\`

### 前缀缓存

对于相同前缀的请求，vLLM支持KV Cache复用：

\`\`\`python
llm = LLM(model="model", enable_prefix_caching=True)

# 系统提示作为共享前缀
system_prompt = "You are a helpful assistant."
requests = [
    f"{system_prompt}\\nUser: Question 1",
    f"{system_prompt}\\nUser: Question 2",
]
# 第二个请求会复用系统提示的KV Cache
\`\`\`

## SGLang

SGLang（Structured Generation Language）专注于结构化生成和复杂推理工作流。

假设你在做一个AI应用，需要模型输出严格的JSON格式，或者先分类再根据分类结果生成不同内容，或者一次调用里连续进行多轮对话。这些"带结构"的推理需求，是SGLang的主场。它不仅做推理加速，还提供了一套编程模型，让你用代码描述复杂的生成流程。

### 核心特性

**RadixAttention**：基于基数树（Radix Tree）的KV Cache管理，高效处理前缀共享。

**结构化生成**：原生支持JSON schema、正则表达式等约束生成。

**编程式API**：支持复杂的生成流程编排。

### 安装与使用

\`\`\`bash
pip install sglang
\`\`\`

**启动服务**：

\`\`\`python
from sglang import RuntimeEndpoint

runtime = RuntimeEndpoint("http://localhost:30000")
\`\`\`

\`\`\`bash
# 命令行启动
python -m sglang.launch_server \\
    --model-path Qwen/Qwen2-7B-Instruct \\
    --port 30000 \\
    --tp 2
\`\`\`

### SGLang编程模型

SGLang提供了一套DSL用于定义复杂的生成流程：

\`\`\`python
import sglang as sgl

@sgl.function
def multi_turn_qa(s, question1, question2):
    s += sgl.system("You are a helpful assistant.")
    s += sgl.user(question1)
    s += sgl.assistant(sgl.gen("answer1", max_tokens=256))
    s += sgl.user(question2)
    s += sgl.assistant(sgl.gen("answer2", max_tokens=256))

# 执行
state = multi_turn_qa.run(
    question1="What is machine learning?",
    question2="Can you give an example?"
)

print(state["answer1"])
print(state["answer2"])
\`\`\`

### 结构化输出

\`\`\`python
@sgl.function
def extract_info(s, text):
    s += sgl.user(f"Extract information from: {text}")
    s += sgl.assistant(
        sgl.gen(
            "result",
            max_tokens=512,
            regex=r'\\{"name": "[^"]+", "age": \\d+\\}'  # 正则约束
        )
    )

# JSON Schema约束
from pydantic import BaseModel

class Person(BaseModel):
    name: str
    age: int
    city: str

@sgl.function
def extract_person(s, text):
    s += sgl.user(f"Extract person info: {text}")
    s += sgl.assistant(sgl.gen("person", json_schema=Person))
\`\`\`

### 分支与选择

\`\`\`python
@sgl.function
def routing(s, query):
    s += sgl.user(query)
    
    # 先分类
    s += sgl.assistant(
        "Category: " + sgl.gen("category", choices=["math", "coding", "general"])
    )
    
    # 根据分类生成
    if s["category"] == "math":
        s += sgl.assistant(sgl.gen("answer", max_tokens=512))
    elif s["category"] == "coding":
        s += sgl.assistant("\`\`\`python\\n" + sgl.gen("code", max_tokens=1024) + "\\n\`\`\`")
\`\`\`

### 批量并行

\`\`\`python
@sgl.function
def batch_qa(s, questions):
    s += sgl.system("Answer concisely.")
    
    # 并行生成多个答案
    answers = []
    for q in questions:
        s += sgl.user(q)
        s += sgl.assistant(sgl.gen("answer", max_tokens=100))
        answers.append(s["answer"])
    
    return answers
\`\`\`

## 性能对比

| 特性 | vLLM | SGLang |
|------|------|--------|
| KV Cache管理 | PagedAttention | RadixAttention |
| 前缀缓存 | 支持 | 原生优化 |
| 结构化输出 | 基础支持 | 原生支持 |
| 编程模型 | 简单 | 丰富 |
| API兼容性 | OpenAI | 自定义 |
| 多轮对话优化 | 一般 | 好 |

**选择建议**：
- **vLLM**：追求极致吞吐、需要OpenAI API兼容、简单的生成任务
- **SGLang**：复杂生成流程、结构化输出需求、多轮对话密集场景

## 部署最佳实践

### 显存估算

\`\`\`python
# 模型权重显存（FP16）
model_memory = num_params * 2  # bytes

# KV Cache显存（每序列）
kv_cache_per_token = 2 * num_layers * hidden_size * 2  # bytes
kv_cache_per_seq = kv_cache_per_token * max_seq_len

# 总显存需求
total = model_memory + kv_cache_per_seq * max_concurrent_seqs
\`\`\`

上述估算公式的各变量含义如下：

- \`num_params\`：模型参数量（例如 7B 即 $7 \\times 10^9$）；乘以 2 是因为 FP16 每个参数占 2 字节。
- \`kv_cache_per_token\`：每个 token 的 KV Cache 大小；其中“$2$”分别对应 Key 和 Value 两个缓存，\`num_layers\` 为 Transformer 层数，\`hidden_size\` 为隐藏维度，末尾的“$\\times 2$”表示 FP16 每个元素 2 字节。
- \`kv_cache_per_seq\`：单条序列的 KV Cache 总量，等于每 token 缓存量乘以最大序列长度 \`max_seq_len\`。
- \`total\`：总显存需求 = 模型权重 + 所有并发序列的 KV Cache 之和。该估算用于判断单卡可承载的最大并发数，即 $\\text{max\\\\_seqs} = (\\text{GPU\\\\_mem} - \\text{model\\\\_memory}) / \\text{kv\\\\_cache\\\\_per\\\\_seq}$。

### 并发配置

\`\`\`bash
# 根据显存调整并发数
# 7B模型，80GB GPU
python -m vllm.entrypoints.openai.api_server \\
    --model model_path \\
    --max-num-seqs 256 \\
    --gpu-memory-utilization 0.95
\`\`\`

### 多卡部署

\`\`\`bash
# 张量并行（单请求延迟优化）
--tensor-parallel-size 4

# 数据并行（吞吐优化，需要负载均衡）
# 启动多个实例，前置负载均衡器
\`\`\`

### 量化部署

\`\`\`bash
# AWQ量化模型
python -m vllm.entrypoints.openai.api_server \\
    --model TheBloke/Llama-2-7B-AWQ \\
    --quantization awq
\`\`\`

## 监控与调优

### 关键指标

- **TTFT**（Time to First Token）：首token延迟
- **TPOT**（Time per Output Token）：单token生成时间
- **吞吐量**：tokens/second
- **并发数**：同时处理的请求数
- **队列长度**：等待处理的请求数

### Prometheus监控

vLLM和SGLang都支持Prometheus指标导出：

\`\`\`bash
# vLLM
--enable-metrics-endpoint

# 指标端点
curl http://localhost:8000/metrics
\`\`\`

高性能推理引擎是大模型服务化的关键。vLLM和SGLang通过创新的内存管理和调度算法，将单GPU的推理吞吐量提升了数倍。在实际选型时，一个简单的判断标准是：如果你的场景主要是简单的文本生成、需要兼容OpenAI API，选vLLM；如果你需要复杂的结构化输出、多轮对话编排或者动态分支逻辑，SGLang更合适。当然，两者都在快速发展，功能边界在不断模糊，选择时不妨都先跑个benchmark看看。
`
    },
    {
      id: "adv-10-10-app-platform",
      title: "10.10 应用平台：Dify、Coze与AgentScope",
      file: "大模型教程/10-模型软硬件生态/02-应用生态/01-应用平台.md",
      difficulty: "中级-高级",
      duration: "0.5h",
      week: 0,
      phase: 0,
      keywords: ["应用平台：Dify", "Coze与AgentScope", "Dify", "Coze", "AgentScope", "LLM"],
      content: `# 应用平台：Dify、Coze与AgentScope

大模型应用开发平台降低了AI应用的构建门槛，使开发者能够快速搭建基于LLM的应用。Dify、Coze和AgentScope代表了不同的设计理念和使用场景。

假设你想做一个内部知识库问答机器人：用户上传公司文档，然后就可以用自然语言提问获取答案。如果从零开始写，你需要处理文档解析、向量化、检索、提示词编排、模型调用、前端界面等一系列工作。而用应用平台，这些可能午后就能搞定。这就是这类平台的价值所在。

## Dify

Dify是一个开源的LLM应用开发平台，提供了从提示词编排到应用发布的完整工具链。它的最大卖点是"开源可自托管"——你的数据和模型都在自己服务器上，不用担心数据泄露问题。对于企业内部应用，这一点往往是决定性的。

### 核心特性

- **可视化编排**：拖拽式的工作流设计
- **RAG能力**：内置知识库与向量检索
- **多模型支持**：OpenAI、Anthropic、本地模型等
- **应用模板**：聊天机器人、Agent、工作流等
- **开源自托管**：支持私有化部署

### 部署

\`\`\`bash
# Docker Compose部署
git clone https://github.com/langgenius/dify.git
cd dify/docker
cp .env.example .env
docker-compose up -d
\`\`\`

访问 \`http://localhost:3000\` 进入管理界面。

### 工作流类型

**聊天助手**：标准的对话式应用

\`\`\`yaml
# 配置示例
model: gpt-4
system_prompt: "你是一个有帮助的助手"
context_window: 8192
temperature: 0.7
\`\`\`

**文本生成**：单次请求-响应的应用

**Agent**：具备工具调用能力的智能体

\`\`\`yaml
agent:
  type: function_calling
  tools:
    - name: web_search
      type: builtin
    - name: calculator
      type: builtin
    - name: custom_api
      type: api
      endpoint: "https://api.example.com/action"
\`\`\`

**工作流**：复杂的多步骤处理流程

### 知识库

Dify的RAG功能支持多种数据源：

\`\`\`python
# 支持的文档格式
# - PDF
# - Word
# - Markdown
# - 网页URL
# - Notion同步

# 向量化配置
embedding_model: "text-embedding-ada-002"
chunk_size: 500
chunk_overlap: 50
retrieval_top_k: 5
\`\`\`

### API调用

\`\`\`python
import requests

response = requests.post(
    "http://localhost:3000/v1/chat-messages",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    },
    json={
        "inputs": {},
        "query": "你好",
        "user": "user_123",
        "response_mode": "streaming"
    }
)
\`\`\`

## Coze

Coze（扣子）是字节跳动推出的AI Bot开发平台，提供了丰富的插件生态和一键发布能力。与Dify相比，Coze更像一个"商业化服务"而非开源工具——你不需要自己部署服务器，插件生态也更成熟，特别适合快速搭建面向C端用户的Bot。

### 核心特性

- **丰富插件**：海量预置插件，覆盖搜索、工具、数据等
- **多渠道发布**：微信、飞书、网页、Discord等
- **工作流编排**：可视化的流程设计
- **知识库**：支持多种数据源

### Bot创建流程

1. **定义人设**：设置Bot的角色和行为准则
2. **配置能力**：选择模型、添加插件
3. **设置知识库**：上传文档或连接数据源
4. **测试调优**：在预览中测试并调整
5. **发布部署**：一键发布到目标平台

### 插件类型

| 类型 | 示例 | 用途 |
|-----|------|------|
| 搜索类 | 必应搜索、知乎 | 获取实时信息 |
| 工具类 | 计算器、代码执行 | 执行特定任务 |
| 数据类 | 天气、股票 | 查询结构化数据 |
| API类 | 自定义API | 集成外部服务 |

### 工作流节点

- **大模型**：LLM推理节点
- **代码**：JavaScript/Python执行
- **知识库**：RAG检索
- **条件判断**：分支逻辑
- **循环**：重复执行
- **变量**：数据存储与传递

## AgentScope

AgentScope是阿里巴巴开源的多智能体框架，专注于构建可靠的多Agent应用。如果前两个平台更像是"拖拽式搭建工具"，AgentScope则更像是"编程框架"——它的目标用户是开发者而非产品经理，适合需要高度定制化的复杂多Agent协作场景。

### 核心特性

- **多Agent架构**：支持多智能体协作
- **容错机制**：自动重试、异常处理
- **可观测性**：详细的运行日志和监控
- **分布式支持**：跨机器的Agent部署

### 安装

\`\`\`bash
pip install agentscope
\`\`\`

### 基础Agent

\`\`\`python
from agentscope.agents import DialogAgent
from agentscope.models import load_model_by_config_name

# 配置模型
model_config = {
    "model_type": "openai",
    "model_name": "gpt-4",
    "api_key": "YOUR_KEY"
}

# 创建Agent
agent = DialogAgent(
    name="Assistant",
    sys_prompt="你是一个有帮助的助手",
    model_config_name="gpt4"
)

# 对话
response = agent({"content": "你好"})
\`\`\`

### 多Agent协作

\`\`\`python
from agentscope.agents import DialogAgent
from agentscope.pipelines import SequentialPipeline
from agentscope.message import Msg

# 创建多个Agent
researcher = DialogAgent(name="Researcher", sys_prompt="你是研究专家")
writer = DialogAgent(name="Writer", sys_prompt="你是写作专家")
reviewer = DialogAgent(name="Reviewer", sys_prompt="你是审稿专家")

# 顺序流水线
pipeline = SequentialPipeline([researcher, writer, reviewer])

# 执行
initial_msg = Msg(name="User", content="写一篇关于AI的文章")
result = pipeline(initial_msg)
\`\`\`

### 工具使用

\`\`\`python
from agentscope.service import ServiceToolkit

# 定义工具
def search_web(query: str) -> str:
    """搜索网络信息"""
    # 实现搜索逻辑
    return results

def calculate(expression: str) -> float:
    """计算数学表达式"""
    return eval(expression)

# 注册工具
toolkit = ServiceToolkit()
toolkit.add(search_web)
toolkit.add(calculate)

# 创建带工具的Agent
agent = DialogAgent(
    name="ToolAgent",
    sys_prompt="你可以使用工具完成任务",
    service_toolkit=toolkit
)
\`\`\`

### 分布式部署

\`\`\`python
from agentscope.rpc import RpcAgentServerLauncher

# 启动Agent服务
launcher = RpcAgentServerLauncher(
    host="0.0.0.0",
    port=12345,
    agent_class=DialogAgent,
    agent_kwargs={...}
)
launcher.launch()

# 远程调用
from agentscope.rpc import RpcAgent
remote_agent = RpcAgent(
    name="RemoteAgent",
    host="192.168.1.100",
    port=12345
)
\`\`\`

## 平台对比

| 特性 | Dify | Coze | AgentScope |
|-----|------|------|------------|
| 开源 | 是 | 否 | 是 |
| 部署方式 | 自托管/云 | 云服务 | 自托管 |
| 可视化 | 强 | 强 | 弱 |
| 多Agent | 有限 | 有限 | 原生支持 |
| 插件生态 | 中等 | 丰富 | 开发者定义 |
| 适用场景 | 快速原型 | 商业应用 | 复杂Agent系统 |

### 选择建议

**选择Dify**：
- 需要快速搭建RAG应用
- 偏好可视化编排
- 需要私有化部署

**选择Coze**：
- 需要丰富的现成插件
- 需要多平台发布
- 不需要私有化部署

**选择AgentScope**：
- 构建复杂多Agent系统
- 需要高度定制化
- 需要分布式部署能力

## 集成模式

这些平台可以与其他组件集成：

\`\`\`
用户请求
    ↓
应用平台（Dify/Coze/AgentScope）
    ↓                    ↓
推理引擎（vLLM）    知识库（向量数据库）
    ↓                    ↓
    ←←←←←←←←←←←←←←←←←←←←←
    ↓
响应用户
\`\`\`

应用平台的选择取决于具体需求。对于快速原型验证，Dify和Coze的可视化能力可以显著提升效率；对于需要复杂Agent协作的场景，AgentScope提供了更灵活的编程接口。在实际项目中，也可以根据不同阶段选择不同工具——先用可视化平台快速验证想法是否可行，确认路线后再用编程框架做正式开发，这往往是最高效的工作流。
`
    },
    {
      id: "adv-10-11-ai",
      title: "10.11 AI编程助手",
      file: "大模型教程/10-模型软硬件生态/02-应用生态/02-AI编程助手.md",
      difficulty: "中级-高级",
      duration: "0.5h",
      week: 0,
      phase: 0,
      keywords: ["AI编程助手", "Agentic", "Coding", "API", "IDE", "Vibe"],
      content: `# AI编程助手

AI编程助手正在重塑软件开发的方式。从代码补全到全流程的Agentic Coding，大模型在编程领域的应用展现出巨大潜力。

你可能已经有过这样的体验：写一个不熟悉的API调用，以前要翻半天文档，现在只需要在IDE里描述一下意图，几秒钟就能得到可用的代码。这不是远期愿景，而是已经发生的现实。理解这些工具的能力边界和正确用法，是当代开发者的必备技能。

## Vibe Coding范式

"Vibe Coding"描述了一种新的编程范式：开发者通过自然语言描述意图，AI理解"氛围"（vibe）并生成相应代码。这种人机协作模式正在从辅助走向协同。

### 发展阶段

| 阶段 | 能力 | 代表 |
|-----|------|------|
| 代码补全 | 行级/块级补全 | Copilot |
| 对话编程 | 理解上下文，生成片段 | ChatGPT |
| Agentic Coding | 自主执行编程任务 | Cursor Agent |

### 核心能力

**代码理解**：
- 解释代码功能
- 分析代码逻辑
- 识别潜在问题

**代码生成**：
- 从自然语言生成代码
- 代码翻译（跨语言）
- 测试用例生成

**代码修改**：
- Bug修复
- 代码重构
- 性能优化

## Cursor

Cursor是基于VS Code的AI-native编辑器，深度集成了大模型能力。与传统的Copilot“行级补全”不同，Cursor的核心能力是“多文件编辑”和“Agent模式”——它不只是帮你写一行代码，而是可以理解你的整个项目结构，同时修改多个相关文件，甚至自主执行命令和调试。

### 核心特性

**Tab补全**：上下文感知的智能补全，按Tab接受建议。

**Chat面板**：与AI对话，讨论代码问题，生成代码片段。

**Composer**：多文件编辑能力，可以同时修改多个相关文件。

**Agent模式**：自主执行复杂任务，包括文件操作、命令执行等。

### 使用技巧

**有效的提示**：

\`\`\`
// 好的提示
"重构这个函数，使用async/await替代回调，并添加错误处理"

// 更好的提示
"重构getUserData函数：
1. 将回调改为async/await
2. 添加try-catch错误处理
3. 添加超时处理（5秒）
4. 保持与现有API的兼容性"
\`\`\`

**@符号引用**：

\`\`\`
@file:utils.js    // 引用特定文件
@folder:src/      // 引用整个文件夹
@codebase         // 搜索整个代码库
@docs             // 引用文档
@web              // 搜索网络
\`\`\`

**规则文件**（\`.cursorrules\`）：

\`\`\`markdown
# 项目规则

## 代码风格
- 使用TypeScript
- 函数使用箭头函数
- 使用4空格缩进

## 命名规范
- 组件使用PascalCase
- 函数使用camelCase
- 常量使用UPPER_SNAKE_CASE

## 测试要求
- 每个公共函数需要单元测试
- 测试覆盖率不低于80%
\`\`\`

### Composer工作流

\`\`\`
1. 描述任务目标
2. @引用相关文件和上下文
3. Composer分析依赖关系
4. 生成跨文件的修改计划
5. 逐个文件展示diff
6. 用户确认后批量应用
\`\`\`

## 其他AI编程工具

### GitHub Copilot

GitHub官方的AI编程助手，与GitHub生态深度集成：

- **Copilot Chat**：IDE内对话
- **Copilot CLI**：命令行助手
- **Copilot for PRs**：PR描述生成

### Codeium

开源友好的AI编程助手：

- 免费的基础功能
- 支持多种IDE
- 本地模型支持

### Tabnine

专注企业场景的AI助手：

- 代码隐私保护
- 团队知识学习
- 合规性保障

## 编程Agent

### Agent能力

现代AI编程助手正在发展出Agent能力。这意味着什么？以前的助手是"你问我答"的被动模式，现在的Agent能开始"自主工作"了——你描述一个任务，它自己分析代码库、制定计划、编写代码、运行测试、修复问题，直到任务完成：

\`\`\`
用户需求
    ↓
任务规划 ←→ 工具调用
    ↓          ↓
代码生成    文件操作
    ↓          ↓
测试运行    错误修复
    ↓
任务完成
\`\`\`

### 典型工作流

\`\`\`python
# Agent执行流程伪代码
def agentic_coding(task):
    # 1. 理解任务
    plan = analyze_task(task)
    
    # 2. 收集上下文
    context = gather_context(plan.related_files)
    
    # 3. 迭代执行
    while not plan.completed:
        # 选择下一步行动
        action = plan.next_action()
        
        if action.type == "edit":
            apply_edit(action.file, action.changes)
        elif action.type == "run":
            result = execute_command(action.command)
            # 根据结果调整计划
            plan.adjust(result)
        elif action.type == "search":
            info = search_codebase(action.query)
            plan.add_context(info)
    
    return plan.summary
\`\`\`

## 最佳实践

### 有效协作

**给出足够上下文**：
- 说明技术栈
- 描述约束条件
- 提供示例

**迭代改进**：
- 先生成骨架
- 逐步完善细节
- 及时反馈问题

**验证输出**：
- 理解生成的代码
- 运行测试验证
- 检查边界情况

### 安全考量

**代码审查**：AI生成的代码仍需人工审查

**敏感信息**：避免在提示中包含密钥、密码等

**依赖检查**：验证AI引入的依赖是否安全

### 局限性认知

当前AI编程助手的局限：
- 可能生成看似正确但有bug的代码
- 对复杂业务逻辑理解有限
- 可能引入过时的API或模式
- 无法替代架构设计能力

## 未来展望

AI编程助手正在快速演进：

- **更强的推理能力**：理解复杂需求
- **更好的代码库理解**：全局视角优化
- **更自主的执行能力**：端到端完成任务
- **更紧密的开发集成**：CI/CD、测试、部署

从辅助工具到协作伙伴，AI正在改变开发者的工作方式。有效利用这些工具，同时保持对代码质量的把控，是现代开发者需要掌握的新技能。记住一个原则：AI生成的代码和同事写的代码一样——都需要认真审查，都可能有bug，只不过产出速度快了很多倍。
`
    },
    {
      id: "adv-10-12-comfyui",
      title: "10.12 ComfyUI",
      file: "大模型教程/10-模型软硬件生态/02-应用生态/03-ComfyUI.md",
      difficulty: "中级-高级",
      duration: "1h",
      week: 0,
      phase: 0,
      keywords: ["ComfyUI", "Stable", "Diffusion", "WebUI"],
      content: `# ComfyUI

ComfyUI是一个基于节点的图像生成工作流工具，通过可视化的方式构建复杂的扩散模型生成流程。

你可能用过Stable Diffusion WebUI这样的一体化工具——填参数、点生成、看结果。但当你想做更复杂的流程时（比如先生成低分辨率图、再用ControlNet控制细节、最后再超分），WebUI就显得力不从心了。ComfyUI的节点化设计让你像搭积木一样把各种操作串起来，要多复杂有多复杂。

## 概述

ComfyUI的设计理念是将图像生成的各个环节（加载模型、编码提示词、采样、解码等）抽象为独立的节点，通过连线组合实现灵活的工作流定制。它的好处是"透明"——你能清清楚楚看到数据从哪来、经过了什么处理、到哪去，而不是一个黑箱。这对于理解和调试复杂的生成流程非常有帮助。

### 核心优势

- **可视化工作流**：清晰呈现生成过程的每个环节
- **灵活组合**：任意组合节点实现复杂流程
- **高效执行**：智能缓存，只重算变化的部分
- **社区生态**：丰富的自定义节点插件

## 安装

\`\`\`bash
git clone https://github.com/comfyanonymous/ComfyUI.git
cd ComfyUI
pip install -r requirements.txt

# 启动
python main.py
# 访问 http://127.0.0.1:8188
\`\`\`

### 模型放置

\`\`\`
ComfyUI/
├── models/
│   ├── checkpoints/     # 主模型 (.safetensors)
│   ├── vae/            # VAE模型
│   ├── loras/          # LoRA权重
│   ├── controlnet/     # ControlNet模型
│   ├── clip/           # CLIP模型
│   └── embeddings/     # Textual Inversion
\`\`\`

## 核心节点

下图展示了ComfyUI基础文生图工作流中各节点的连接关系：

\`\`\`mermaid
graph TD
    A[Load Checkpoint] --> B[CLIP Text Encode正向]
    A --> C[CLIP Text Encode反向]
    A --> D[Empty Latent Image]
    B --> E[KSampler]
    C --> E
    D --> E
    E --> F[VAE Decode]
    F --> G[Save Image]
\`\`\`

### 基础文生图流程

\`\`\`
[Load Checkpoint] → [CLIP Text Encode (Positive)]
        ↓                      ↓
        ↓              [CLIP Text Encode (Negative)]
        ↓                      ↓
        → [KSampler] ←←←←←←←←←←
              ↓
        [VAE Decode]
              ↓
        [Save Image]
\`\`\`

**Load Checkpoint**：加载Stable Diffusion模型
- 输出：MODEL, CLIP, VAE

**CLIP Text Encode**：将文本提示词编码为条件
- 输入：CLIP, text
- 输出：CONDITIONING

**KSampler**：执行采样过程
- 输入：model, positive, negative, latent_image
- 参数：seed, steps, cfg, sampler_name, scheduler
- 输出：LATENT

**VAE Decode**：将潜空间解码为图像
- 输入：samples, vae
- 输出：IMAGE

### 常用节点

| 节点 | 功能 |
|-----|------|
| Empty Latent Image | 创建空白潜空间 |
| Load Image | 加载图片 |
| VAE Encode | 图片编码到潜空间 |
| Load LoRA | 加载LoRA权重 |
| Load ControlNet Model | 加载ControlNet |
| Apply ControlNet | 应用ControlNet控制 |
| Upscale Latent | 潜空间放大 |
| Image Scale | 图像缩放 |

## 高级工作流

### 图生图（img2img）

\`\`\`
[Load Image] → [VAE Encode] → [KSampler] → [VAE Decode]
                                  ↑
                    [Load Checkpoint] + [CLIP Encode]
\`\`\`

设置KSampler的denoise参数控制改变程度（0-1）。

### ControlNet控制

\`\`\`
[Load ControlNet Model]
         ↓
[Apply ControlNet] ← [Canny Edge Detection] ← [Load Image]
         ↓
    [KSampler]
\`\`\`

### 多LoRA叠加

\`\`\`
[Load Checkpoint] → [Load LoRA (style)] → [Load LoRA (character)] → ...
\`\`\`

### 高清修复

\`\`\`
KSampler → VAE Decode → Upscale → VAE Encode → KSampler → VAE Decode
 (低分辨率)              (放大)                  (高清重绘)
\`\`\`

## 自定义节点

ComfyUI支持通过Python扩展自定义节点：

\`\`\`python
class MyCustomNode:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "image": ("IMAGE",),
                "strength": ("FLOAT", {"default": 1.0, "min": 0.0, "max": 2.0}),
            }
        }
    
    RETURN_TYPES = ("IMAGE",)
    FUNCTION = "process"
    CATEGORY = "custom"
    
    def process(self, image, strength):
        # 处理逻辑
        result = image * strength
        return (result,)

NODE_CLASS_MAPPINGS = {"MyCustomNode": MyCustomNode}
\`\`\`

### ComfyUI Manager

推荐安装ComfyUI Manager来管理扩展：

\`\`\`bash
cd ComfyUI/custom_nodes
git clone https://github.com/ltdrdata/ComfyUI-Manager.git
\`\`\`

常用扩展：
- **ComfyUI-Impact-Pack**：人脸检测、分割等
- **ComfyUI-AnimateDiff**：视频生成
- **ComfyUI-VideoHelperSuite**：视频处理工具
- **ComfyUI-ControlNet-Auxiliary**：预处理器集合

## 工作流管理

### 保存与加载

工作流以JSON格式保存，可以：
- 通过UI保存/加载
- 直接编辑JSON文件
- 从PNG图片中提取（元数据）

### API调用

\`\`\`python
import json
import requests

# 加载工作流
with open("workflow.json") as f:
    workflow = json.load(f)

# 修改参数
workflow["3"]["inputs"]["seed"] = 12345
workflow["6"]["inputs"]["text"] = "a beautiful sunset"

# 提交任务
response = requests.post(
    "http://127.0.0.1:8188/prompt",
    json={"prompt": workflow}
)
\`\`\`

### 批量处理

\`\`\`python
import websocket
import json

ws = websocket.WebSocket()
ws.connect("ws://127.0.0.1:8188/ws")

for prompt in prompts:
    workflow["6"]["inputs"]["text"] = prompt
    
    # 发送任务
    requests.post("http://127.0.0.1:8188/prompt", json={"prompt": workflow})
    
    # 等待完成
    while True:
        msg = json.loads(ws.recv())
        if msg["type"] == "executed":
            break
\`\`\`

## 性能优化

### 显存管理

\`\`\`bash
# 低显存模式
python main.py --lowvram

# CPU卸载
python main.py --cpu

# 指定显卡
python main.py --cuda-device 1
\`\`\`

### 缓存利用

ComfyUI自动缓存中间结果。这是它相比WebUI的一大优势——当你只改了提示词而模型和参数都没变时，它不会重新加载模型，只重算变化的部分。优化工作流时：
- 不变的节点结果会被缓存
- 只有依赖变化节点的部分会重算
- 合理组织工作流可以大幅提升迭代速度

### 队列管理

\`\`\`python
# 查看队列
requests.get("http://127.0.0.1:8188/queue")

# 清空队列
requests.post("http://127.0.0.1:8188/queue", json={"clear": True})
\`\`\`

## 典型应用场景

- **角色一致性生成**：结合LoRA和ControlNet
- **风格迁移**：使用IP-Adapter等节点
- **视频生成**：AnimateDiff工作流
- **图像修复**：Inpainting工作流
- **超分辨率**：结合Upscale模型

ComfyUI的节点化设计使其成为探索和定制图像生成流程的强大工具。从简单的文生图到复杂的多阶段工作流，ComfyUI都能提供直观且灵活的解决方案。对于初学者，建议从社区分享的工作流开始——直接加载别人分享的JSON文件，看懂每个节点的作用，然后在其基础上修改，这比从零搭建要快得多。
`
    },
    {
      id: "adv-10-13-data-juicer",
      title: "10.13 Data-Juicer",
      file: "大模型教程/10-模型软硬件生态/02-应用生态/04-Data-Juicer.md",
      difficulty: "中级-高级",
      duration: "1h",
      week: 0,
      phase: 0,
      keywords: ["Data", "Juicer", "HTML"],
      content: `# Data-Juicer

Data-Juicer是阿里巴巴开源的大模型数据处理框架，专注于高质量训练数据的清洗、过滤和分析。

在大模型训练中有一句老话："数据质量决定模型质量"。但实际操作起来，"提升数据质量"这件事往往比调模型更复杂——你面对的可能是数十TB的原始文本，里面充斥着HTML标签、重复内容、低质量翻译、甚至恶意内容。手工处理显然不现实，Data-Juicer提供了一套系统化的流水线来解决这个问题。

## 概述

数据质量是大模型训练的关键因素。Data-Juicer提供了一套完整的数据处理流水线，包含丰富的算子用于数据清洗、去重、过滤和增强。它的设计哲学是"配置驱动"——你不需要写代码，只需要在YAML文件里定义想用哪些算子、什么参数，然后一条命令执行即可。

### 核心特性

- **算子丰富**：100+数据处理算子
- **配置驱动**：YAML配置定义处理流程
- **可视化分析**：数据分布可视化
- **分布式处理**：支持大规模数据集
- **多模态支持**：文本、图像、视频数据

## 安装

\`\`\`bash
pip install data-juicer

# 或完整安装
pip install "data-juicer[all]"
\`\`\`

## 数据处理流程

\`\`\`mermaid
graph LR
    A[原始数据] --> B[基础清洗]
    B --> C[格式过滤]
    C --> D[质量过滤]
    D --> E[去重]
    E --> F[最终清洗]
    F --> G[高质量数据]
\`\`\`

### 配置文件

\`\`\`yaml
# config.yaml
project_name: 'my_data_processing'

dataset_path: './raw_data.jsonl'
export_path: './processed_data.jsonl'

# 处理算子
process:
  # 过滤器
  - language_id_score_filter:
      lang: 'zh'
      min_score: 0.8
  
  - text_length_filter:
      min_len: 50
      max_len: 10000
  
  - perplexity_filter:
      max_ppl: 1000
      lang: 'zh'
  
  # 清洗器
  - clean_html_mapper
  - clean_email_mapper
  - clean_url_mapper
  - fix_unicode_mapper
  
  # 去重器
  - document_minhash_deduplicator:
      tokenization: 'character'
      num_permutations: 128
      jaccard_threshold: 0.7
\`\`\`

### 执行处理

\`\`\`bash
# 命令行执行
python -m data_juicer.tools.process_data --config config.yaml

# Python API
from data_juicer import process_data
process_data('config.yaml')
\`\`\`

## 核心算子

### 过滤器（Filter）

过滤器根据条件筛选数据。举个例子：你爬取了大量网页文本，但里面包含各种语言的混杂内容、太短或太长的片段、以及杂乱的乱码文本。过滤器能自动把这些不合格的内容剔除：

| 算子 | 功能 |
|-----|------|
| \`language_id_score_filter\` | 语言识别过滤 |
| \`text_length_filter\` | 文本长度过滤 |
| \`perplexity_filter\` | 困惑度过滤 |
| \`word_num_filter\` | 词数过滤 |
| \`alphanumeric_filter\` | 字母数字比例过滤 |
| \`special_characters_filter\` | 特殊字符比例过滤 |
| \`flagged_words_filter\` | 敏感词过滤 |
| \`image_aspect_ratio_filter\` | 图像宽高比过滤 |

### 映射器（Mapper）

映射器对数据进行转换：

\`\`\`yaml
process:
  # 文本清洗
  - clean_html_mapper            # 清理HTML标签
  - clean_email_mapper           # 清理邮箱地址
  - clean_ip_mapper              # 清理IP地址
  - clean_links_mapper           # 清理链接
  - remove_repeat_sentences_mapper  # 移除重复句子
  - whitespace_normalization_mapper # 空白字符标准化
  
  # 格式转换
  - chinese_convert_mapper:      # 繁简转换
      mode: 's2t'  # 简体转繁体
  
  # 文本增强
  - sentence_split_mapper        # 句子分割
\`\`\`

### 去重器（Deduplicator）

\`\`\`yaml
process:
  # 精确去重
  - document_simhash_deduplicator:
      tokenization: 'character'
      hamming_distance: 4
  
  # 模糊去重
  - document_minhash_deduplicator:
      tokenization: 'character'
      num_permutations: 256
      jaccard_threshold: 0.8
  
  # 行级去重
  - ray_document_deduplicator:
      backend: 'ray'
\`\`\`

## 数据分析

### 统计分析

\`\`\`yaml
# 分析配置
project_name: 'data_analysis'
dataset_path: './data.jsonl'

# 分析算子
process:
  - text_length_filter:
      stats_export_path: './stats/text_length.json'
  
  - language_id_score_filter:
      stats_export_path: './stats/language.json'
\`\`\`

### 可视化

\`\`\`python
from data_juicer.analysis import Analyser

analyser = Analyser(dataset='./data.jsonl')

# 生成分析报告
analyser.run(
    output_dir='./analysis_report',
    stats=['text_length', 'word_count', 'language']
)
\`\`\`

## 多模态数据处理

### 图文数据

\`\`\`yaml
process:
  # 图像过滤
  - image_size_filter:
      min_width: 256
      min_height: 256
  
  - image_aspect_ratio_filter:
      min_ratio: 0.5
      max_ratio: 2.0
  
  # 图文相关性
  - image_text_similarity_filter:
      min_score: 0.2
      model: 'openai/clip-vit-base-patch32'
\`\`\`

### 视频数据

\`\`\`yaml
process:
  - video_duration_filter:
      min_duration: 3
      max_duration: 60
  
  - video_resolution_filter:
      min_width: 480
      min_height: 360
\`\`\`

## 分布式处理

### Ray后端

\`\`\`yaml
# 启用Ray分布式
executor_type: 'ray'

ray:
  address: 'auto'
  num_cpus: 32
\`\`\`

### Spark后端

\`\`\`yaml
executor_type: 'spark'

spark:
  master: 'yarn'
  executor_memory: '8g'
  executor_cores: 4
\`\`\`

## 自定义算子

\`\`\`python
from data_juicer.ops.base_op import OPERATORS, Mapper

@OPERATORS.register_module('my_custom_mapper')
class MyCustomMapper(Mapper):
    def __init__(self, param1, param2=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.param1 = param1
        self.param2 = param2
    
    def process(self, sample):
        # 处理逻辑
        text = sample['text']
        sample['text'] = self.custom_process(text)
        return sample
    
    def custom_process(self, text):
        # 自定义处理
        return text
\`\`\`

使用自定义算子：

\`\`\`yaml
process:
  - my_custom_mapper:
      param1: 'value1'
      param2: 'value2'
\`\`\`

## 最佳实践

### 处理流程设计

\`\`\`yaml
# 推荐的处理顺序
process:
  # 1. 基础清洗
  - fix_unicode_mapper
  - clean_html_mapper
  - whitespace_normalization_mapper
  
  # 2. 格式过滤
  - text_length_filter
  - alphanumeric_filter
  
  # 3. 质量过滤
  - language_id_score_filter
  - perplexity_filter
  
  # 4. 去重
  - document_minhash_deduplicator
  
  # 5. 最终清洗
  - remove_repeat_sentences_mapper
\`\`\`

### 监控与日志

\`\`\`yaml
# 启用详细日志
log_level: 'INFO'

# 保存处理统计
export_stats: true
stats_export_path: './processing_stats.json'
\`\`\`

Data-Juicer为大模型数据准备提供了系统化的解决方案。通过灵活的算子组合和配置驱动的流程设计，可以高效地处理大规模训练数据，提升数据质量，从而改善模型的训练效果。在实践中，建议先对小样本跑一遍分析报告，了解数据的分布特征（语言比例、长度分布、重复率等），然后再有针对性地设计处理流水线——盲目套用模板配置往往事倍功半。
`
    },
    {
      id: "adv-10-14-model-eco",
      title: "10.14 语言模型生态",
      file: "大模型教程/10-模型软硬件生态/03-模型生态/01-语言模型生态.md",
      difficulty: "中级-高级",
      duration: "0.5h",
      week: 0,
      phase: 0,
      keywords: ["语言模型生态", "LLM", "API", "Qwen", "Qwen2"],
      content: `# 语言模型生态

大语言模型（LLM）是当前AI领域的核心技术。从闭源的商业模型到开源社区的繁荣，语言模型生态呈现出多元化的发展态势。

对于开发者而言，选模型往往是项目初期最关键的决策之一。用闭源API还是自部署开源模型？用多大的参数量？需不需要微调？这些问题没有标准答案，完全取决于你的具体场景、成本预算和技术团队能力。下面我们逐一梳理当前的主流选择。

## 开源模型

### Qwen系列

Qwen是阿里巴巴推出的开源大语言模型系列，以其优异的中英文能力著称。它的一大优势是规格覆盖很广——从0.5B到72B都有，无论你是在单卡消费级显卡上做推理，还是在多卡集群上做复杂任务，都能找到合适的型号。

**模型规格**：

| 模型 | 参数量 | 上下文长度 | 特点 |
|-----|-------|-----------|------|
| Qwen2.5-0.5B | 0.5B | 128K | 极小型，边缘部署 |
| Qwen2.5-1.5B | 1.5B | 128K | 小型，高效推理 |
| Qwen2.5-7B | 7B | 128K | 平衡性能与效率 |
| Qwen2.5-14B | 14B | 128K | 中等规模 |
| Qwen2.5-32B | 32B | 128K | 大规模 |
| Qwen2.5-72B | 72B | 128K | 旗舰级 |

**使用示例**：

\`\`\`python
from transformers import AutoModelForCausalLM, AutoTokenizer

model = AutoModelForCausalLM.from_pretrained(
    "Qwen/Qwen2.5-7B-Instruct",
    torch_dtype="auto",
    device_map="auto"
)
tokenizer = AutoTokenizer.from_pretrained("Qwen/Qwen2.5-7B-Instruct")

messages = [{"role": "user", "content": "你好"}]
text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
inputs = tokenizer(text, return_tensors="pt").to(model.device)
outputs = model.generate(**inputs, max_new_tokens=512)
print(tokenizer.decode(outputs[0], skip_special_tokens=True))
\`\`\`

### LLaMA系列

Meta的LLaMA系列是开源社区最具影响力的模型之一。

**发展历程**：
- **LLaMA 1**：首次开源，引爆社区
- **LLaMA 2**：改进架构，商用许可
- **LLaMA 3**：性能大幅提升
- **LLaMA 3.1**：支持128K上下文

**架构特点**：
- RoPE位置编码
- SwiGLU激活函数
- RMSNorm归一化
- GQA分组查询注意力

### ChatGLM系列

智谱AI的ChatGLM系列针对中文场景优化。

**模型演进**：
- **ChatGLM**：首个中文对话模型
- **ChatGLM2**：更长上下文，更强能力
- **ChatGLM3**：支持代码和工具调用
- **GLM-4**：多模态，超长上下文

### 其他重要开源模型

| 模型 | 组织 | 特点 |
|-----|------|------|
| Mistral | Mistral AI | 高效架构，滑动窗口注意力 |
| Mixtral | Mistral AI | MoE架构，8x7B |
| Yi | 零一万物 | 中英双语，长上下文 |
| Baichuan | 百川智能 | 中文优化 |
| DeepSeek | 深度求索 | MoE，代码能力强 |
| InternLM | 上海AI实验室 | 通用能力 |

## 闭源API

### OpenAI GPT系列

| 模型 | 上下文 | 特点 |
|-----|--------|------|
| GPT-4o | 128K | 多模态，快速 |
| GPT-4o-mini | 128K | 性价比高 |
| GPT-4 Turbo | 128K | 推理能力强 |
| o1 | 128K | 深度推理 |

**API使用**：

\`\`\`python
from openai import OpenAI

client = OpenAI()
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "你好"}],
    max_tokens=1000
)
print(response.choices[0].message.content)
\`\`\`

### Anthropic Claude

| 模型 | 上下文 | 特点 |
|-----|--------|------|
| Claude 3.5 Sonnet | 200K | 平衡型 |
| Claude 3.5 Haiku | 200K | 快速响应 |
| Claude 3 Opus | 200K | 最强能力 |

Claude以其长上下文能力和安全性著称。

### Google Gemini

| 模型 | 特点 |
|-----|------|
| Gemini 1.5 Pro | 超长上下文（1M tokens） |
| Gemini 1.5 Flash | 快速推理 |
| Gemini Ultra | 旗舰级能力 |

## 模型选型考量

### 能力维度

| 维度 | 评估方式 |
|-----|---------|
| 语言理解 | MMLU、C-Eval |
| 推理能力 | GSM8K、MATH |
| 代码能力 | HumanEval、MBPP |
| 长文本 | 上下文长度、检索准确率 |
| 指令跟随 | MT-Bench、AlpacaEval |

### 部署考量

**开源模型优势**：
- 私有化部署，数据安全
- 可微调适配
- 无API成本
- 完全控制

**闭源API优势**：
- 无需运维
- 持续升级
- 即开即用
- 能力上限高

### 成本估算

\`\`\`python
# API成本估算
def estimate_api_cost(model, input_tokens, output_tokens, requests_per_day):
    prices = {
        "gpt-4o": {"input": 2.5/1M, "output": 10/1M},
        "gpt-4o-mini": {"input": 0.15/1M, "output": 0.6/1M},
        "claude-3.5-sonnet": {"input": 3/1M, "output": 15/1M},
    }
    p = prices[model]
    daily_cost = (input_tokens * p["input"] + output_tokens * p["output"]) * requests_per_day
    return daily_cost * 30  # 月成本

# 自部署成本估算（不含人力）
def estimate_self_host_cost(model_size, gpu_type="A100"):
    gpu_memory_per_card = {"A100": 80, "H100": 80, "A10": 24}
    cost_per_hour = {"A100": 2.0, "H100": 3.5, "A10": 1.0}
    
    # FP16需要约2GB/B参数
    cards_needed = (model_size * 2) / gpu_memory_per_card[gpu_type]
    return cards_needed * cost_per_hour[gpu_type] * 24 * 30
\`\`\`

## 模型使用最佳实践

### Prompt工程

\`\`\`python
# 结构化Prompt
system_prompt = """你是一个专业的技术助手。

## 回答要求
1. 准确性：确保技术细节正确
2. 清晰性：使用简洁明了的语言
3. 完整性：覆盖问题的各个方面

## 输出格式
使用Markdown格式，包含代码块和列表。
"""

# Few-shot示例
examples = [
    {"input": "...", "output": "..."},
    {"input": "...", "output": "..."},
]
\`\`\`

### 流式输出

\`\`\`python
# OpenAI流式
response = client.chat.completions.create(
    model="gpt-4o",
    messages=messages,
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
\`\`\`

### 错误处理

\`\`\`python
import time
from openai import RateLimitError, APIError

def robust_api_call(messages, max_retries=3):
    for attempt in range(max_retries):
        try:
            return client.chat.completions.create(
                model="gpt-4o",
                messages=messages
            )
        except RateLimitError:
            time.sleep(2 ** attempt)
        except APIError as e:
            if attempt == max_retries - 1:
                raise
            time.sleep(1)
\`\`\`

语言模型生态的繁荣为AI应用提供了丰富的选择。根据具体场景的需求——性能要求、成本预算、部署限制——选择合适的模型，是构建AI应用的关键决策。一个实用的策略是：先用闭源API快速验证想法，确认可行后再评估是否需要迁移到开源模型自部署——这样既不会在前期浪费时间搭环境，又能在后期控制成本。
`
    },
    {
      id: "adv-10-15-model-eco",
      title: "10.15 视觉生成模型生态",
      file: "大模型教程/10-模型软硬件生态/03-模型生态/02-视觉生成模型生态.md",
      difficulty: "中级-高级",
      duration: "0.5h",
      week: 0,
      phase: 0,
      keywords: ["视觉生成模型生态", "Stable", "Diffusion", "Flux"],
      content: `# 视觉生成模型生态

视觉生成模型在图像和视频生成领域取得了显著进展。从 Stable Diffusion到Flux，从静态图像到动态视频，视觉生成能力不断提升。

和语言模型一样，视觉生成模型的选型也需要结合具体场景。你是做艺术创作还是产品图？需要图像还是视频？显卡有多大显存？这些因素直接影响模型选择。下面按基本能力和应用场景分类介绍。

## 图像生成模型

### Stable Diffusion系列

Stable Diffusion是最具影响力的开源图像生成模型。它的开源特性催生了庞大的社区生态——数万个LoRA风格模型、ControlNet控制模型、各种插件和工具链都围绕SD构建。即便更新的模型不断出现，SD的生态优势仍然难以替代。

**SD 1.x/2.x**：

| 版本 | 分辨率 | 特点 |
|-----|--------|------|
| SD 1.4 | 512×512 | 初代版本 |
| SD 1.5 | 512×512 | 社区主力 |
| SD 2.0 | 768×768 | 新VAE，CLIP |
| SD 2.1 | 768×768 | 改进采样 |

**SDXL**：

\`\`\`python
from diffusers import StableDiffusionXLPipeline
import torch

pipe = StableDiffusionXLPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0",
    torch_dtype=torch.float16,
).to("cuda")

image = pipe(
    prompt="A beautiful sunset over mountains",
    height=1024,
    width=1024,
    num_inference_steps=30,
    guidance_scale=7.5,
).images[0]
\`\`\`

SDXL的改进：
- 基础分辨率提升至1024×1024
- 双文本编码器（CLIP ViT-L + OpenCLIP ViT-bigG）
- 可选的Refiner模型进行细节增强

### Flux

Flux是Black Forest Labs推出的新一代模型，采用了改进的架构设计。

\`\`\`python
from diffusers import FluxPipeline

pipe = FluxPipeline.from_pretrained(
    "black-forest-labs/FLUX.1-schnell",
    torch_dtype=torch.bfloat16
).to("cuda")

image = pipe(
    prompt="A cat sitting on a windowsill",
    num_inference_steps=4,  # Schnell版本步数少
    guidance_scale=0,
).images[0]
\`\`\`

**Flux版本**：
- **Flux.1 [schnell]**：蒸馏版，4步出图
- **Flux.1 [dev]**：开发版，更高质量
- **Flux.1 [pro]**：专业版，商业API

### 其他开源模型

| 模型 | 组织 | 特点 |
|-----|------|------|
| Midjourney | Midjourney | 艺术风格强（闭源） |
| DALL-E 3 | OpenAI | 提示词理解好（闭源） |
| Imagen | Google | 高保真度（闭源） |
| Kandinsky | Sber | 俄语优化 |
| Playground | Playground | 审美优化 |
| Kolors | 快手 | 中文理解 |

## 视频生成模型

### 开源模型

**AnimateDiff**：基于SD的视频生成插件

\`\`\`python
from diffusers import AnimateDiffPipeline, MotionAdapter

adapter = MotionAdapter.from_pretrained("guoyww/animatediff-motion-adapter-v1-5-2")
pipe = AnimateDiffPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    motion_adapter=adapter,
).to("cuda")

frames = pipe(
    prompt="A cat walking",
    num_frames=16,
    guidance_scale=7.5,
).frames[0]
\`\`\`

**Stable Video Diffusion**：图生视频

\`\`\`python
from diffusers import StableVideoDiffusionPipeline

pipe = StableVideoDiffusionPipeline.from_pretrained(
    "stabilityai/stable-video-diffusion-img2vid-xt",
    torch_dtype=torch.float16,
).to("cuda")

frames = pipe(
    image,
    num_frames=25,
    decode_chunk_size=8,
).frames[0]
\`\`\`

### 商业服务

| 服务 | 功能 | 特点 |
|-----|------|------|
| Sora | OpenAI | 长视频，物理一致性（未开放） |
| Gen-2/3 | Runway | 视频生成与编辑 |
| Pika | Pika Labs | 快速迭代 |
| Kling | 快手 | 中文场景 |

## 多模态生成

### 图像理解与生成结合

一些模型同时具备理解和生成能力：

| 模型 | 能力 |
|-----|------|
| Gemini | 理解+生成 |
| GPT-4o | 理解为主 |
| Qwen-VL | 理解为主 |

## 模型选型

### 按应用场景

| 场景 | 推荐模型 |
|-----|---------|
| 艺术创作 | Midjourney, SDXL |
| 产品图 | DALL-E 3, Flux |
| 人像照片 | SDXL + LoRA |
| 动画风格 | SD 1.5 + 风格LoRA |
| 视频生成 | SVD, AnimateDiff |

### 按资源条件

| 显存 | 推荐 |
|-----|------|
| 6GB | SD 1.5 (优化) |
| 8GB | SD 1.5, SDXL (量化) |
| 12GB | SDXL |
| 16GB+ | SDXL, Flux |

## 使用技巧

### 提示词工程

\`\`\`python
# 基础结构
prompt = """
[主体描述], [风格修饰], [质量词], [细节补充]
"""

# 示例
prompt = """
a beautiful young woman with long black hair,
in the style of Studio Ghibli,
masterpiece, best quality, highly detailed,
soft lighting, dreamy atmosphere
"""

# 负面提示词
negative_prompt = """
low quality, blurry, deformed, ugly, 
bad anatomy, bad hands, missing fingers
"""
\`\`\`

### ControlNet控制

\`\`\`python
from diffusers import StableDiffusionControlNetPipeline, ControlNetModel

controlnet = ControlNetModel.from_pretrained(
    "lllyasviel/control_v11p_sd15_openpose"
)

pipe = StableDiffusionControlNetPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    controlnet=controlnet,
)

# 使用姿态图控制人物姿势
\`\`\`

### LoRA微调

\`\`\`bash
# 使用kohya-ss训练LoRA
accelerate launch train_network.py \\
    --pretrained_model_name_or_path="model.safetensors" \\
    --train_data_dir="./train_images" \\
    --output_dir="./output" \\
    --network_module=networks.lora \\
    --network_dim=32
\`\`\`

## 部署考量

### 推理优化

\`\`\`python
# 使用torch.compile
pipe.unet = torch.compile(pipe.unet, mode="reduce-overhead")

# 使用xFormers
pipe.enable_xformers_memory_efficient_attention()

# 使用FP16
pipe = pipe.to(torch_dtype=torch.float16)
\`\`\`

### 批量推理

\`\`\`python
# 批量生成
prompts = ["prompt1", "prompt2", "prompt3"]
images = pipe(prompts, num_images_per_prompt=1).images
\`\`\`

视觉生成模型生态正在快速发展，从静态图像到动态视频，从单一生成到多模态融合，应用场景不断拓展。对于刚入门的开发者，建议从Stable Diffusion 1.5开始——它的社区生态最成熟，教程最多，显存需求也最低。等熟悉了基本流程后，再尝试SDXL或Flux也不迟。
`
    },
    {
      id: "adv-10-16-gpu",
      title: "10.16 GPU环境配置与使用",
      file: "大模型教程/10-模型软硬件生态/04-硬件生态与实践/01-GPU环境配置.md",
      difficulty: "中级-高级",
      duration: "1h",
      week: 0,
      phase: 0,
      keywords: ["GPU环境配置与使用", "GPU", "NVIDIA", "CUDA"],
      content: `# GPU环境配置与使用

NVIDIA GPU是当前大模型训练与推理的主流硬件平台。本节介绍 GPU环境的配置方法和最佳实践。

对于刚接触大模型的开发者，环境配置往往是第一个“坎”——驱动版本、CUDA版本、PyTorch版本三者之间的兼容性问题能让人折腾大半天。本节的目标是帮你理清这些关系，少踩坑。

## 硬件选型

### 主流GPU规格

| GPU | 显存 | FP16算力 | NVLink | 适用场景 |
|-----|------|---------|--------|---------|
| RTX 4090 | 24GB | 330 TFLOPS | 无 | 开发、小模型训练 |
| A100 40GB | 40GB | 312 TFLOPS | 600GB/s | 训练、推理 |
| A100 80GB | 80GB | 312 TFLOPS | 600GB/s | 大模型训练 |
| H100 SXM | 80GB | 1979 TFLOPS | 900GB/s | 旗舰训练 |
| H200 | 141GB | 1979 TFLOPS | 900GB/s | 超大模型 |
| A10 | 24GB | 125 TFLOPS | 无 | 推理部署 |
| L40S | 48GB | 362 TFLOPS | 无 | 训练/推理 |

### 显存需求估算

\`\`\`python
def estimate_memory(model_params_b, precision="fp16"):
    """估算模型显存需求（单位：GB）"""
    bytes_per_param = {"fp32": 4, "fp16": 2, "bf16": 2, "int8": 1, "int4": 0.5}
    
    # 模型权重
    model_memory = model_params_b * bytes_per_param[precision]
    
    # 训练额外开销（优化器状态、梯度等）
    training_overhead = {
        "fp32": 16,  # 权重 + 梯度 + 优化器
        "fp16": 18,  # 混合精度
        "bf16": 18,
    }
    
    return {
        "inference": model_memory,
        "training": model_params_b * training_overhead.get(precision, 18)
    }

# 示例：7B模型
print(estimate_memory(7))
# {'inference': 14.0, 'training': 126.0}
\`\`\`

上述估算函数中，\`model_params_b\` 为模型参数量（单位：十亿 / Billion），\`precision\` 为精度类型。推理显存的计算为 $\\text{model\\_memory} = \\text{params} \\times \\text{bytes\\_per\\_param}$，例如 7B 模型在 FP16 下为 $7 \\times 2 = 14$ GB。训练显存还需额外包含梯度（与权重等大）及优化器状态（Adam 需保存一阶/二阶矩，各占 4 字节），因此混合精度训练每个参数约需 18 字节，即 7B 模型约需 $7 \\times 18 = 126$ GB。

## 驱动与CUDA安装

GPU环境的软件依赖栈从底层到上层如下：

\`\`\`mermaid
graph TD
    A[NVIDIA驱动] --> B[CUDA Toolkit]
    B --> C[cuDNN]
    C --> D[PyTorch]
    D --> E[Transformers / 训练框架]
    E --> F[应用代码]
\`\`\`

### 驱动安装

\`\`\`bash
# Ubuntu
# 方式1：apt安装
sudo apt update
sudo apt install nvidia-driver-535

# 方式2：runfile安装
wget https://us.download.nvidia.com/XFree86/Linux-x86_64/535.154.05/NVIDIA-Linux-x86_64-535.154.05.run
chmod +x NVIDIA-Linux-x86_64-535.154.05.run
sudo ./NVIDIA-Linux-x86_64-535.154.05.run

# 验证
nvidia-smi
\`\`\`

### CUDA Toolkit安装

\`\`\`bash
# 下载并安装CUDA 12.1
wget https://developer.download.nvidia.com/compute/cuda/12.1.0/local_installers/cuda_12.1.0_530.30.02_linux.run
sudo sh cuda_12.1.0_530.30.02_linux.run

# 环境变量
export PATH=/usr/local/cuda-12.1/bin:$PATH
export LD_LIBRARY_PATH=/usr/local/cuda-12.1/lib64:$LD_LIBRARY_PATH

# 验证
nvcc --version
\`\`\`

### cuDNN安装

\`\`\`bash
# 从NVIDIA下载cuDNN
tar -xvf cudnn-linux-x86_64-8.9.7.29_cuda12-archive.tar.xz
sudo cp cudnn-*-archive/include/cudnn*.h /usr/local/cuda/include
sudo cp -P cudnn-*-archive/lib/libcudnn* /usr/local/cuda/lib64
sudo chmod a+r /usr/local/cuda/include/cudnn*.h /usr/local/cuda/lib64/libcudnn*
\`\`\`

## PyTorch环境

### 安装

\`\`\`bash
# 使用pip
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# 使用conda
conda install pytorch torchvision torchaudio pytorch-cuda=12.1 -c pytorch -c nvidia

# 验证
python -c "import torch; print(torch.cuda.is_available())"
\`\`\`

### 多GPU配置

\`\`\`python
import torch

# 查看可用GPU
print(torch.cuda.device_count())  # GPU数量
print(torch.cuda.get_device_name(0))  # GPU名称

# 指定GPU
device = torch.device("cuda:0")
model = model.to(device)

# 环境变量指定可见GPU
# CUDA_VISIBLE_DEVICES=0,1,2,3 python train.py
\`\`\`

## 性能优化

### 混合精度训练

\`\`\`python
from torch.cuda.amp import autocast, GradScaler

scaler = GradScaler()

for batch in dataloader:
    optimizer.zero_grad()
    
    with autocast():
        output = model(batch)
        loss = criterion(output, target)
    
    scaler.scale(loss).backward()
    scaler.step(optimizer)
    scaler.update()
\`\`\`

### 梯度检查点

\`\`\`python
from torch.utils.checkpoint import checkpoint

class CheckpointedModel(nn.Module):
    def forward(self, x):
        # 对显存密集的层使用检查点
        x = checkpoint(self.layer1, x)
        x = checkpoint(self.layer2, x)
        return x
\`\`\`

### 内存优化

\`\`\`python
# 清理缓存
torch.cuda.empty_cache()

# 设置内存分配器
import os
os.environ['PYTORCH_CUDA_ALLOC_CONF'] = 'max_split_size_mb:128'

# 禁用cudnn benchmark（节省内存但可能降速）
torch.backends.cudnn.benchmark = False
\`\`\`

## 监控与调试

### nvidia-smi使用

\`\`\`bash
# 实时监控
watch -n 1 nvidia-smi

# 详细信息
nvidia-smi -q

# 进程列表
nvidia-smi pmon -i 0

# 指定格式输出
nvidia-smi --query-gpu=name,memory.used,memory.total,utilization.gpu --format=csv
\`\`\`

### PyTorch内存分析

\`\`\`python
# 内存快照
print(torch.cuda.memory_summary())

# 内存分配跟踪
torch.cuda.memory._record_memory_history()
# ... 运行代码 ...
torch.cuda.memory._dump_snapshot("memory_snapshot.pickle")
\`\`\`

### CUDA错误调试

\`\`\`bash
# 启用同步执行（定位错误位置）
CUDA_LAUNCH_BLOCKING=1 python train.py

# 检查内存泄漏
compute-sanitizer --tool memcheck python train.py
\`\`\`

## 多卡训练

### DataParallel

\`\`\`python
# 简单但效率较低
model = nn.DataParallel(model)
\`\`\`

### DistributedDataParallel

\`\`\`python
import torch.distributed as dist
from torch.nn.parallel import DistributedDataParallel as DDP

# 初始化
dist.init_process_group(backend='nccl')
local_rank = int(os.environ['LOCAL_RANK'])

# 设置设备
torch.cuda.set_device(local_rank)
model = model.cuda(local_rank)
model = DDP(model, device_ids=[local_rank])

# 启动
# torchrun --nproc_per_node=4 train.py
\`\`\`

### NCCL配置

\`\`\`bash
# 环境变量
export NCCL_DEBUG=INFO
export NCCL_IB_DISABLE=0  # 启用InfiniBand
export NCCL_NET_GDR_LEVEL=2  # GPU Direct RDMA

# 多机通信
export MASTER_ADDR=192.168.1.1
export MASTER_PORT=29500
\`\`\`

## Docker环境

\`\`\`dockerfile
FROM nvidia/cuda:12.1.0-cudnn8-devel-ubuntu22.04

# 安装Python
RUN apt-get update && apt-get install -y python3 python3-pip

# 安装PyTorch
RUN pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# 安装其他依赖
COPY requirements.txt .
RUN pip3 install -r requirements.txt
\`\`\`

\`\`\`bash
# 运行容器
docker run --gpus all -it my-image

# 指定GPU
docker run --gpus '"device=0,1"' -it my-image
\`\`\`

## 常见问题

### CUDA版本不匹配

这是最常见的问题，也是新手最容易踩的坑。关键要理解：PyTorch自带的CUDA runtime和系统安装的CUDA Toolkit是两回事。\`torch.version.cuda\`显示的是PyTorch编译时用的版本，只要驱动版本足够新就能向下兼容。真正需要关注的是\`nvidia-smi\`显示的驱动CUDA版本要大于等于PyTorch要求的版本：

\`\`\`bash
# 检查PyTorch CUDA版本
python -c "import torch; print(torch.version.cuda)"

# 检查系统CUDA版本
nvcc --version

# 解决：安装匹配版本的PyTorch
\`\`\`

### 显存不足

这是第二常见的问题，解决思路是分层递进的——先试最简单的方法，不行再上更复杂的：

\`\`\`python
# 减小batch size
# 使用梯度累积
# 使用混合精度
# 使用梯度检查点
# 使用DeepSpeed ZeRO
\`\`\`

### 多卡通信失败

多卡训练时的通信问题通常与NCCL配置有关。排查时先开启详细日志，看报错出在哪一步：

\`\`\`bash
# 检查NCCL
NCCL_DEBUG=INFO python -c "import torch.distributed"

# 检查网络
# 确保所有节点可以互相访问指定端口
\`\`\`

NVIDIA GPU生态的成熟度使其成为大模型开发的首选平台。熟练掌握环境配置与性能优化技巧，可以充分发挥硬件性能，提升开发效率。一个实用建议：如果你经常需要配环境，考虑用Docker或conda来管理不同的CUDA版本组合——这比在系统层面反复安装卸载安全得多。
`
    },
    {
      id: "adv-10-17-npu",
      title: "10.17 昇腾NPU环境配置与使用",
      file: "大模型教程/10-模型软硬件生态/04-硬件生态与实践/02-昇腾NPU环境.md",
      difficulty: "中级-高级",
      duration: "1h",
      week: 0,
      phase: 0,
      keywords: ["昇腾NPU环境配置与使用", "NPU", "Ascend", "Atlas"],
      content: `# 昇腾NPU环境配置与使用

华为昇腾（Ascend）NPU是国产AI加速器的代表，在大模型训练和推理场景中展现出竞争力。本节介绍昇腾NPU的环境配置方法。

假设你所在的团队接到一个信创项目——要求在国产硬件上完成大模型的微调与部署。你手头有一台Atlas 800训练服务器，8张910B卡，但打开终端后第一反应大概是："这和CUDA环境差别大吗？torch代码要重写吗？"这正是本节要回答的核心问题。好消息是，昇腾生态在近两年进步显著，大多数PyTorch代码只需将\`.cuda()\`改为\`.npu()\`就能运行；坏消息是，版本配套、算子兼容等"暗坑"仍然不少，需要提前了解才能少走弯路。

## 硬件概览

### 昇腾芯片系列

| 芯片 | 定位 | AI算力 | 显存 |
|-----|------|--------|------|
| 昇腾910B | 训练 | 256 TFLOPS (FP16) | 64GB HBM |
| 昇腾910A | 训练 | 256 TFLOPS (FP16) | 32GB HBM |
| 昇腾310P | 推理 | 22 TFLOPS (FP16) | 24GB |
| 昇腾310 | 推理 | 16 TFLOPS (INT8) | 8GB |

### 服务器配置

- **Atlas 800 训练服务器**：8卡910B配置
- **Atlas 300I Pro**：推理卡
- **Atlas 200 DK**：开发套件

## 软件栈

### CANN（Compute Architecture for Neural Networks）

CANN是昇腾的核心软件栈，地位类似于NVIDIA的CUDA Toolkit——它为上层框架提供算子实现、图优化和硬件抽象。如果把NPU比作发动机，CANN就是变速箱和传动系统，你不需要直接操作它，但版本选错了整辆车都跑不起来。CANN包含：

- **AscendCL**：底层计算接口，相当于CUDA Runtime API
- **算子库**：cuDNN的等价层，提供卷积、矩阵乘等高性能实现
- **图引擎**：计算图优化，自动进行算子融合和内存优化
- **调试工具**：性能分析与问题定位

### 软件版本对应

在实际项目中，版本配套是昇腾环境最容易出问题的环节——CANN、驱动、torch_npu三者的版本必须严格匹配，否则会遇到各种莫名其妙的段错误或算子不支持。建议在安装前先查阅华为官方的版本配套表：

\`\`\`
CANN 8.0 → PyTorch 2.1/2.2 → torch_npu 2.1.0/2.2.0
CANN 7.0 → PyTorch 2.0/2.1 → torch_npu 2.0.0/2.1.0
CANN 6.0 → PyTorch 1.11   → torch_npu 1.11.0
\`\`\`

> **踩坑提示**：不要尝试"跨版本搭配"，比如CANN 7.0配PyTorch 2.2。即使安装过程不报错，运行时也会出现随机的计算结果错误或core dump，排查起来极为痛苦。

## 环境配置

你可能遇到过这种情况：在NVIDIA机器上装环境只需要\`conda install pytorch\`就搞定，但昇腾环境需要手动安装驱动、CANN Toolkit、torch_npu三个组件，顺序不能错。下面我们按"从底层到上层"的顺序逐步安装。

### 驱动安装

\`\`\`bash
# 下载驱动（需要在华为开发者社区注册）
# https://www.hiascend.com/software/cann/community

# 安装NPU驱动
chmod +x Ascend-hdk-910b-npu-driver_x.x.x_linux-x86_64.run
./Ascend-hdk-910b-npu-driver_x.x.x_linux-x86_64.run --full

# 验证
npu-smi info
\`\`\`

### CANN安装

\`\`\`bash
# 安装CANN Toolkit
chmod +x Ascend-cann-toolkit_x.x.x_linux-x86_64.run
./Ascend-cann-toolkit_x.x.x_linux-x86_64.run --install

# 环境变量
source /usr/local/Ascend/ascend-toolkit/set_env.sh

# 验证
python -c "import acl; print('ACL OK')"
\`\`\`

### PyTorch Ascend安装

torch_npu是连接PyTorch和昇腾NPU的桥梁。安装时最关键的一点是：torch和torch_npu的版本号必须完全一致。

\`\`\`bash
# 安装torch_npu（版本号必须与torch严格对应）
pip install torch==2.1.0
pip install torch_npu==2.1.0

# 环境变量
export LD_LIBRARY_PATH=/usr/local/Ascend/driver/lib64:$LD_LIBRARY_PATH

# 快速验证整条链路是否打通
python -c "import torch; import torch_npu; print(torch.npu.is_available())"
\`\`\`

> **实用建议**：如果你的团队需要同时维护CUDA和NPU两套环境，强烈建议使用Docker。华为提供了官方的昇腾开发镜像（\`ascendhub.huawei.com\`），驱动、CANN、torch_npu已经预装配好，可以省去大量版本配套的麻烦。

## 基础使用

掌握了安装流程，接下来看看日常开发中如何使用NPU。你会发现，如果之前写过CUDA代码，迁移成本其实很低——核心区别就是把\`cuda\`换成\`npu\`。

### 设备管理

\`\`\`python
import torch
import torch_npu

# 检查NPU可用性
print(torch.npu.is_available())
print(torch.npu.device_count())

# 设置设备
device = torch.device("npu:0")
model = model.to(device)

# 数据转移
tensor = tensor.npu()
\`\`\`

### 模型训练

\`\`\`python
import torch
import torch_npu

# 模型定义（与CUDA相同）
model = MyModel().npu()
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-4)

# 训练循环
for batch in dataloader:
    inputs = batch['input'].npu()
    labels = batch['label'].npu()
    
    outputs = model(inputs)
    loss = criterion(outputs, labels)
    
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()
\`\`\`

### 混合精度

想象一下你在训练一个7B参数的模型，FP32精度下显存不够用。混合精度是最直接的解决方案。昇腾对AMP的支持比较完善，而且有一个便利的"魔法导入"——\`transfer_to_npu\`，它会自动将CUDA相关的调用重定向到NPU，这在迁移已有代码时特别省事：

\`\`\`python
from torch_npu.contrib import transfer_to_npu  # 导入后，cuda调用自动转为npu

# 自动混合精度（接口与CUDA完全一致）
with torch.cuda.amp.autocast():  # torch_npu兼容此接口
    output = model(input)
    loss = criterion(output, target)
\`\`\`

> **注意**：\`transfer_to_npu\`虽然方便，但在调试阶段建议显式使用\`.npu()\`，这样出错时更容易定位问题是出在NPU适配层还是模型本身。

## 分布式训练

在实际项目中，单卡训练大模型几乎不可能——一张910B的64GB HBM连7B模型的全参数微调都勉强。多卡并行是常态。昇腾的分布式通信库叫HCCL（Huawei Collective Communication Library），对标NVIDIA的NCCL，使用方式也高度类似。

### 单机多卡

\`\`\`python
import torch.distributed as dist
import torch_npu

# 初始化（使用HCCL后端）
dist.init_process_group(backend='hccl')
local_rank = int(os.environ['LOCAL_RANK'])

torch.npu.set_device(local_rank)
model = model.npu(local_rank)
model = torch.nn.parallel.DistributedDataParallel(model, device_ids=[local_rank])
\`\`\`

### 启动训练

\`\`\`bash
# torchrun方式
torchrun --nproc_per_node=8 train.py

# 或使用昇腾工具
msrun --worker_num=8 train.py
\`\`\`

## 模型适配

举个例子：你想在昇腾上跑Qwen-7B做推理，代码该怎么写？其实和CUDA环境几乎一样，只需要确保\`import torch_npu\`在最前面。

### Transformers适配

\`\`\`python
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch_npu

model = AutoModelForCausalLM.from_pretrained("model_path")
model = model.npu()

# 或使用device_map
model = AutoModelForCausalLM.from_pretrained(
    "model_path",
    device_map="npu:0"
)
\`\`\`

### 常见框架支持

| 框架 | 支持状态 |
|-----|---------|
| PyTorch | 通过torch_npu支持 |
| MindSpore | 原生支持 |
| TensorFlow | 通过适配层支持 |
| ONNX Runtime | 支持 |

## 监控与调试

### npu-smi工具

\`\`\`bash
# 查看NPU状态
npu-smi info

# 实时监控
watch -n 1 npu-smi info

# 查看进程
npu-smi info -t proc
\`\`\`

### 性能分析

\`\`\`python
# 使用Profiler
with torch.npu.profiler.profile() as prof:
    model(input)
    
print(prof.key_averages().table())
\`\`\`

## 常见问题

昇腾环境的常见问题集中在三个方面：算子兼容性、精度差异和性能调优。下面逐一说明，这些都是从实际项目中总结出来的高频"坑点"。

### 算子兼容性

这是从CUDA迁移到NPU时最头疼的问题。部分PyTorch算子可能在NPU上不支持或行为不同——尤其是一些不太常见的算子（如某些自定义的scatter操作）或第三方库的CUDA kernel：

\`\`\`python
# 检查算子支持
torch_npu.npu.is_supported_op(torch.ops.aten.xxx)

# 回退到CPU
if not supported:
    result = op(tensor.cpu()).npu()
\`\`\`

### 性能调优

\`\`\`python
# 启用图优化
torch_npu.npu.set_compile_mode(jit_compile=True)

# 设置精度模式
torch.npu.set_option("ACL_PRECISION_MODE", "allow_fp32_to_fp16")
\`\`\`

## 与CUDA代码的迁移

假设你有一个在A100上跑得好好的训练脚本，现在要迁移到昇腾910B上。大多数情况下，迁移工作量比你想象的要小——核心就是三步替换：

\`\`\`python
# CUDA代码
model = model.cuda()
tensor = tensor.cuda()
torch.cuda.synchronize()

# NPU代码
model = model.npu()
tensor = tensor.npu()
torch.npu.synchronize()
\`\`\`

对于更复杂的情况（比如代码中使用了自定义CUDA kernel），可以使用华为提供的\`msadvisor\`迁移分析工具，它会扫描代码并标注哪些API需要修改、哪些算子可能不支持。

> **迁移清单**：实际迁移时，建议按以下顺序排查：(1) 将所有\`.cuda()\`替换为\`.npu()\`；(2) 将\`nccl\`后端改为\`hccl\`；(3) 运行一个小batch验证精度是否对齐；(4) 逐步增大batch size测试稳定性。不要一上来就跑完整训练，先确保前向传播的输出与CUDA环境一致。

昇腾NPU为大模型训练提供了国产化的替代方案。从实际使用体验来看，常规的Transformers模型训练和推理已经比较成熟，SWIFT、LLaMA-Factory等主流微调框架也已适配昇腾。主要的挑战集中在自定义算子的兼容性和某些边缘场景的精度对齐上。对于有信创需求的团队，建议从推理场景入手——迁移成本最低、验证最快，积累经验后再逐步扩展到微调和全量训练。
`
    },
    {
      id: "adv-10-18-amd-rocm",
      title: "10.18 AMD生态与ROCm",
      file: "大模型教程/10-模型软硬件生态/04-硬件生态与实践/03-AMD-ROCm.md",
      difficulty: "中级-高级",
      duration: "1h",
      week: 0,
      phase: 0,
      keywords: ["AMD生态与ROCm", "AMD", "ROCm", "GPU"],
      content: `# AMD生态与ROCm

AMD GPU通过ROCm（Radeon Open Compute）平台为AI计算提供支持，是CUDA之外的重要替代选择。

你可能会问：既然NVIDIA生态这么成熟，为什么还要关注AMD？原因很实际——首先是显存优势，MI300X提供192GB HBM3，是H100的80GB的两倍多，这意味着单卡就能装下70B参数模型的完整权重；其次是性价比，AMD在采购价格和可获得性上往往有优势，尤其在“GPU荒”时期；最后，ROCm是开源平台，适合需要对底层有控制权的团队。当然，生态成熟度确实还在追赶，本节帮你判断ROCm是否适合你的场景。

## 硬件概览

### AMD Instinct系列

| GPU | 显存 | FP16算力 | 互联 |
|-----|------|---------|------|
| MI300X | 192GB HBM3 | 1307 TFLOPS | Infinity Fabric |
| MI250X | 128GB HBM2e | 383 TFLOPS | Infinity Fabric |
| MI210 | 64GB HBM2e | 181 TFLOPS | Infinity Fabric |
| MI100 | 32GB HBM2 | 184 TFLOPS | Infinity Fabric |

### 消费级GPU

| GPU | 显存 | 适用 |
|-----|------|------|
| RX 7900 XTX | 24GB | 开发/小模型 |
| RX 7900 XT | 20GB | 开发/推理 |

## ROCm平台

### 概述

ROCm是AMD的开源计算平台，提供类似CUDA的编程模型。对于习惯CUDA生态的开发者来说，ROCm的设计哲学就是"尽可能兼容"——每个CUDA组件都有直接对应的ROCm等价物：

- **HIP**：类CUDA的C++编程接口，且API命名几乎是一一对应（\`cudaMalloc\` → \`hipMalloc\`）
- **rocBLAS**：BLAS线性代数库，对标cuBLAS
- **MIOpen**：深度学习原语库，对标cuDNN
- **RCCL**：集合通信库，对标NCCL，而且在PyTorch中直接用\`backend='nccl'\`就行，RCCL会自动接管

### 版本兼容

\`\`\`
ROCm 6.0 → PyTorch 2.2+
ROCm 5.7 → PyTorch 2.0/2.1
ROCm 5.4 → PyTorch 1.13
\`\`\`

## 环境配置

相比昇腾环境的手动安装流程，ROCm的安装体验更接近CUDA——通过包管理器就能完成，且PyTorch官方直接提供ROCm版本的预编译包。

### 安装ROCm

\`\`\`bash
# Ubuntu 22.04
# 添加仓库
wget https://repo.radeon.com/amdgpu-install/6.0/ubuntu/jammy/amdgpu-install_6.0.60000-1_all.deb
sudo apt install ./amdgpu-install_6.0.60000-1_all.deb

# 安装ROCm
sudo amdgpu-install --usecase=rocm

# 添加用户到组
sudo usermod -a -G render,video $USER

# 重启后验证
rocm-smi
\`\`\`

### 安装PyTorch

这里有一个让很多人意外的设计决策：ROCm版本的PyTorch完全复用了CUDA的接口。也就是说，你的代码中仍然写\`torch.cuda.is_available()\`，它会返回True并识别出AMD GPU。这种设计的好处是现有代码基本不用改，但调试时偶尔会因为"明明是AMD卡但代码写着cuda"而困惑。

\`\`\`bash
# 从PyTorch官方安装
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/rocm6.0

# 验证
python -c "import torch; print(torch.cuda.is_available())"  # ROCm兼容CUDA接口
\`\`\`

## 基础使用

理解了ROCm的"兼容性设计"后，实际使用就非常简单了——你的PyTorch代码几乎不需要任何修改。

### 设备管理

\`\`\`python
import torch

# ROCm使用CUDA兼容接口
print(torch.cuda.is_available())
print(torch.cuda.device_count())
print(torch.cuda.get_device_name(0))  # 显示AMD GPU

# 使用方式与CUDA相同
device = torch.device("cuda:0")
model = model.to(device)
\`\`\`

### HIP编程

HIP提供与CUDA高度相似的API。在实际项目中，大多数开发者不需要直接写HIP代码（因为PyTorch已经封装好了），但如果你的项目中有自定义的CUDA kernel，就需要用HIP重写或用hipify工具转换：

\`\`\`cpp
// HIP代码（类似CUDA）
#include <hip/hip_runtime.h>

__global__ void vector_add(float* a, float* b, float* c, int n) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < n) c[i] = a[i] + b[i];
}

int main() {
    // 内存分配
    float *d_a, *d_b, *d_c;
    hipMalloc(&d_a, size);
    hipMalloc(&d_b, size);
    hipMalloc(&d_c, size);
    
    // 启动kernel
    hipLaunchKernelGGL(vector_add, dim3(blocks), dim3(threads), 0, 0,
                       d_a, d_b, d_c, n);
    
    hipFree(d_a);
    return 0;
}
\`\`\`

### CUDA代码迁移

假设你有一个包含自定义CUDA kernel的项目，使用hipify工具可以自动完成大部分转换工作：

\`\`\`bash
# 自动转换CUDA代码
hipify-perl cuda_code.cu > hip_code.cpp

# 或使用hipify-clang
hipify-clang cuda_code.cu -o hip_code.cpp
\`\`\`

大多数CUDA API有直接对应，这也是hipify能做到高转化率的原因：

| CUDA | HIP |
|------|-----|
| cudaMalloc | hipMalloc |
| cudaMemcpy | hipMemcpy |
| cudaFree | hipFree |
| cudaDeviceSynchronize | hipDeviceSynchronize |

## 框架支持

在实际工程中，你很少需要直接写HIP代码。主流深度学习框架已经对ROCm有了较好的支持，而且得益于兼容性设计，代码通常不需要任何修改。

### PyTorch

\`\`\`python
# 与CUDA代码完全相同——这就是ROCm兼容性设计的好处
import torch

model = MyModel().cuda()
optimizer = torch.optim.Adam(model.parameters())

for batch in dataloader:
    x, y = batch
    x, y = x.cuda(), y.cuda()
    
    loss = model(x, y)
    loss.backward()
    optimizer.step()
\`\`\`

### Transformers

\`\`\`python
from transformers import AutoModelForCausalLM

# 直接使用，无需修改
model = AutoModelForCausalLM.from_pretrained(
    "model_name",
    device_map="auto"  # 自动识别AMD GPU
)
\`\`\`

### vLLM

在实际场景中，vLLM对ROCm的支持意义重大——如果你用MI300X做模型服务，单卡192GB显存意味着可以装下70B模型而不需要多卡并行，部署复杂度大幅降低：

\`\`\`bash
# vLLM支持ROCm
pip install vllm  # 确保安装ROCm版本

# 启动服务（与CUDA相同）
python -m vllm.entrypoints.openai.api_server --model model_path
\`\`\`

## 分布式训练

### RCCL

RCCL是AMD的集合通信库，API与NCCL兼容。这里的兼容性做得非常彻底——你甚至不需要把\`backend='nccl'\`改成别的，RCCL会透明地替代NCCL：

\`\`\`python
import torch.distributed as dist

# 初始化（使用nccl后端，RCCL会自动接管）
dist.init_process_group(backend='nccl')

# 使用方式与NVIDIA相同
model = torch.nn.parallel.DistributedDataParallel(model)
\`\`\`

### 启动训练

\`\`\`bash
# torchrun方式
torchrun --nproc_per_node=8 train.py
\`\`\`

## 监控工具

### rocm-smi

\`\`\`bash
# 查看GPU状态
rocm-smi

# 显示详细信息
rocm-smi --showallinfo

# 监控
watch -n 1 rocm-smi

# 查看特定指标
rocm-smi --showmeminfo vram
rocm-smi --showuse
\`\`\`

### 性能分析

\`\`\`bash
# rocprof性能分析
rocprof --stats python train.py

# 生成trace
rocprof --sys-trace python train.py
\`\`\`

## 常见问题

在实际使用中，ROCm的主要问题集中在第三方库的兼容性上——PyTorch核心没问题，但许多基于CUDA的扩展库可能需要额外处理。

### 兼容性问题

你可能遇到过这种情况：某个CUDA扩展库（比如一些自定义的注意力实现）直接pip install后在AMD卡上报错。这时需要检查该库是否提供ROCm版本，或者尝试用hipify转换：

\`\`\`python
# 某些CUDA扩展可能不支持
# 检查是否有ROCm版本或使用hipify转换

# 设置环境变量强制使用HIP
export HSA_OVERRIDE_GFX_VERSION=10.3.0  # 针对特定GPU
\`\`\`

### 性能调优

MIOpen需要在首次运行时对算子进行自动调优（auto-tuning），这会导致第一次训练明显较慢。推荐的策略是将调优结果缓存起来：

\`\`\`bash
# 环境变量
export MIOPEN_FIND_ENFORCE=3  # MIOpen调优
export HIP_VISIBLE_DEVICES=0,1,2,3  # 指定可见设备
export GPU_MAX_HW_QUEUES=8  # 硬件队列数
\`\`\`

### Flash Attention

\`\`\`bash
# AMD版Flash Attention
pip install flash-attn --no-build-isolation  # 需要ROCm支持
\`\`\`

## 与CUDA生态的对比

| 特性 | CUDA | ROCm |
|-----|------|------|
| 生态成熟度 | 非常成熟 | 持续完善 |
| 框架支持 | 广泛 | 主流支持 |
| 文档质量 | 完善 | 较好 |
| 社区支持 | 大 | 中等 |
| 代码迁移 | - | 较易 |

ROCm为AI计算提供了CUDA之外的重要选择。从PyTorch用户的角度看，ROCm的最大优势是兼容性设计——现有代码几乎不需要修改。MI300X的192GB显存在大模型推理场景中优势明显，单卡就能服务70B级别的模型。主要的挑战在于第三方CUDA扩展库的兼容性，以及某些场景下的性能调优需要额外努力。如果你的项目主要用主流框架（PyTorch + Transformers + vLLM），且对显存容量有较高要求，AMD MI系列是很值得考虑的方案。
`
    },
    {
      id: "adv-11-01-intro",
      title: "11.1 模型训练推理技术引言",
      file: "大模型教程/11-模型训练推理技术/00-引言.md",
      difficulty: "中级-高级",
      duration: "0.5h",
      week: 0,
      phase: 0,
      keywords: ["模型训练推理技术引言", "Prompt", "Engineering", "SFT", "RLHF", "Gradio"],
      content: `# 模型训练推理技术引言

## 从模型到应用的完整链路

大模型的价值最终体现在实际应用中。从预训练模型到可用的AI应用，中间涉及一系列技术环节：提示词工程、数据准备、训练流程、问题诊断、应用开发、推理部署。本章系统介绍这一完整链路中的核心技术。

## 技术栈全景

模型训练推理技术栈可以划分为以下层次：

| 层次 | 内容 | 关键技术 |
|-----|------|---------|
| 交互层 | 用户如何与模型交互 | Prompt Engineering |
| 数据层 | 训练数据的组织与处理 | 数据格式、数据工程 |
| 训练层 | 模型能力的获取与对齐 | 预训练、SFT、RLHF |
| 诊断层 | 训练问题的识别与解决 | 数值稳定性、显存优化 |
| 能力层 | 高级推理能力的构建 | 思维链、思维回溯 |
| 应用层 | 模型能力的产品化 | Gradio、API服务 |
| 部署层 | 高效的推理服务 | vLLM、SGLang |

## Prompt Engineering的核心地位

尽管模型训练是获取能力的根本途径，但在实际应用中，提示词工程（Prompt Engineering）往往是最具性价比的优化手段。通过精心设计的提示词，可以在不修改模型的情况下显著提升特定任务的性能。

提示词工程的本质是学习如何与大模型有效沟通——理解模型的能力边界、找到激发其潜力的方式、设计稳定可靠的交互模式。

## 训练阶段的演进

大模型训练经历了从简单到复杂的演进：

\`\`\`
预训练（知识获取）
    ↓
监督微调（指令跟随）
    ↓
人类偏好对齐（RLHF/DPO）
    ↓
推理能力强化（RLVR/过程奖励）
\`\`\`

每个阶段解决不同的问题：预训练赋予模型语言理解与世界知识，监督微调使模型学会遵循指令，人类偏好对齐使输出更符合人类期望，推理强化则提升复杂问题的解决能力。

## 训练的艺术与科学

大模型训练既是科学也是艺术。科学的一面体现在严格的数学框架——损失函数、优化算法、正则化方法；艺术的一面则体现在经验与直觉——超参数选择、数据配比、问题诊断。

训练中常见的问题包括：
- **数值问题**：溢出、下溢、NaN
- **优化问题**：梯度爆炸、梯度消失
- **泛化问题**：灾难性遗忘、过拟合
- **效率问题**：显存利用、计算效率

这些问题的诊断与解决需要对模型内部机制的深入理解。

## 从训练到推理

训练完成的模型需要部署为服务才能产生价值。推理阶段的关键挑战是：
- 如何在保持质量的前提下提升吞吐量
- 如何降低延迟改善用户体验
- 如何高效利用硬件资源

现代推理引擎（如vLLM、SGLang）通过创新的内存管理和调度算法，使单GPU的推理效率提升了数倍。

## 应用开发的敏捷性

大模型应用开发强调快速迭代。Gradio、Streamlit等工具使开发者能够在分钟级别搭建可交互的演示应用，快速验证想法、收集反馈、迭代优化。

MaaS（Model as a Service）架构进一步简化了模型的部署与调用，使应用开发者可以专注于业务逻辑而非基础设施。

## 本章内容安排

本章首先介绍Prompt Engineering的原理与技巧，这是使用大模型的基础技能。随后深入讨论数据集格式与训练各阶段（预训练、微调、RLHF、RLVR、蒸馏），帮助读者理解模型能力的来源。训练中的常见问题及其解决方案是实践中的关键知识。思维链训练与思维回溯代表了提升模型推理能力的前沿方向。模型周边应用介绍如何将模型能力产品化，推理加速应用则关注高效部署。最后通过两个实践项目——SWIFT训练与Gradio应用、自定义训练过程——巩固所学内容。
`
    },
    {
      id: "adv-11-02-prompt-engineering",
      title: "11.2 Prompt Engineering",
      file: "大模型教程/11-模型训练推理技术/01-Prompt-Engineering.md",
      difficulty: "中级-高级",
      duration: "1.5h",
      week: 2,
      phase: 2,
      keywords: ["Prompt", "Engineering"],
      content: `# Prompt Engineering

Prompt Engineering（提示词工程）是与大语言模型有效交互的核心技能。通过设计合适的提示词，可以在不修改模型参数的情况下显著提升任务性能。

假设你正在招聘一位新员工。如果你在招聘启事里只写了"需要一个能干活的人"，投来的简历恐怕五花八门、良莠不齐；但如果你详细列出岗位职责、技能要求、薪资范围和工作地点，收到的简历就会精准得多。Prompt Engineering的本质与此类似——你给模型的"指令"越具体、结构越清晰，模型返回的"答卷"质量就越高。

## 提示词的基本结构

一个完整的提示词通常包含以下组成部分：

\`\`\`
[系统设定] 定义模型的角色和行为准则
[上下文] 提供背景信息和相关知识
[任务指令] 明确说明要完成的任务
[输入内容] 需要处理的具体内容
[输出格式] 指定期望的输出形式
[示例] 展示期望的输入-输出对
\`\`\`

### 系统提示词

系统提示词（System Prompt）设定模型的角色、能力边界和行为准则：

\`\`\`
你是一位资深的Python开发者，专注于数据分析领域。

## 能力
- 熟悉pandas、numpy、matplotlib等数据分析库
- 擅长编写清晰、高效的代码
- 能够解释复杂的技术概念

## 行为准则
- 代码需要包含详细注释
- 优先使用Python标准库和主流第三方库
- 对于不确定的问题，明确说明局限性
\`\`\`

### 任务指令

��晰、具体的指令是高质量输出的前提。好比在餐厅点菜——"随便来点吃的"和"一份中辣的麻婆豆腐、米饭少放一点"，上桌结果天差地别。

\`\`\`
# 模糊指令（不推荐）
"帮我写个代码"

# 清晰指令（推荐）
"请编写一个Python函数，实现以下功能：
1. 输入：CSV文件路径
2. 处理：读取文件，计算每列的均值和标准差
3. 输出：包含统计结果的DataFrame
4. 要求：处理可能的文件不存在异常"
\`\`\`

## 核心技术

下图展示了Prompt Engineering中常用的核心策略及其递进关系：

\`\`\`mermaid
graph TD
    A[Prompt策略] --> B[Zero-shot]
    A --> C[Few-shot]
    A --> D[Chain-of-Thought]
    D --> E[Zero-shot CoT]
    D --> F[Self-Consistency]
    D --> G[Tree of Thoughts]
    A --> H[高级技巧]
    H --> I[角色扮演]
    H --> J[结构化输出]
    H --> K[约束与边界]
\`\`\`

### Zero-shot Prompting

想象你第一天到一家新公司上班，老板什么培训都没做，直接把一份文件丢给你说"翻译成英文"。如果这个任务本身足够直觉（比如简单翻译），你大概率能直接上手——这就是Zero-shot的精髓：不给示例，直接下达指令。

直接给出任务描述，不提供示例：

\`\`\`
将以下英文翻译成中文：
"The quick brown fox jumps over the lazy dog."
\`\`\`

Zero-shot适用于模型已经具备的基础能力，但对于复杂或专业任务可能效果有限。

### Few-shot Prompting

回到招聘的场景：如果你不仅在岗位描述里写清楚了要求，还附上了几份"优秀简历样本"，求职者就能更准确地理解你到底想要什么样的人。Few-shot Prompting的道理一模一样——通过提供少量高质量的示例，让模型"看样学样"，迅速把握任务的模式和期望。

提供少量示例，帮助模型理解任务模式：

\`\`\`
将产品评论分类为"正面"或"负面"。

评论：这个手机太棒了，拍照清晰，续航持久！
分类：正面

评论：质量太差了，用了一周就坏了。
分类：负面

评论：性价比很高，推荐购买。
分类：
\`\`\`

Few-shot的关键是示例的质量和多样性：
- 示例应覆盖主要情况
- 示例应与实际任务分布一致
- 通常3-5个示例效果较好

## Chain-of-Thought (CoT)

你可能有过这样的经验：考数学题时，如果在草稿纸上一步步写出推导过程，正确率会比"心算直接写答案"高得多。思维链（Chain-of-Thought）提示的原理完全一致——让模型把推理过程"写出来"，而不是直接跳到结论，这样每一步都能自我校验，大幅减少推理错误。

思维链提示让模型展示推理过程，特别适用于需要逻辑推理的任务：

\`\`\`
问题：一个商店有35个苹果。如果它用掉20个苹果做果汁，然后又买进25个苹果，现在商店有多少苹果？

让我们一步步思考：
1. 商店最初有35个苹果
2. 用掉20个后：35 - 20 = 15个苹果
3. 买进25个后：15 + 25 = 40个苹果

答案：40个苹果
\`\`\`

**Zero-shot CoT**只需添加"让我们一步步思考"即可触发：

\`\`\`
问题：...

让我们一步步思考。
\`\`\`

## Self-Consistency

在实际项目中，我们经常会遇到这样的情况：同一道题，你做三遍可能得到两次正确答案和一次粗心算错的答案。如果取多数结果，正确率会比只做一遍更高。Self-Consistency（自洽性）策略正是这个思路：对同一个问题让模型生成多条独立的推理路径，然后"投票"选出最常见的答案。

对同一问题多次采样，取最常见的答案。实现方式：

\`\`\`python
answers = []
for _ in range(5):
    response = model.generate(prompt, temperature=0.7)
    answer = extract_answer(response)
    answers.append(answer)

final_answer = max(set(answers), key=answers.count)
\`\`\`

Self-Consistency通过集成多个推理路径提升准确性，代价是增加计算开销。

## Tree of Thoughts (ToT)

假设你正在下棋，每一步都有多种走法，而你需要在脑海中推演"如果我走这里，对手可能走那里，然后我再怎么走……"——这种多步骤、多分支的探索，正是Tree of Thoughts的核心思想。与CoT只沿一条路径推理不同，ToT在每个思考节点都展开多种可能性，评估后选择最优路径，必要时还能回溯尝试其他分支。

将问题分解为多个思考步骤，每步探索多个可能，形成思维树：

\`\`\`
问题：用4、9、2三个数字和基本运算得到24

步骤1的可能性：
- 4 + 9 = 13
- 4 × 9 = 36
- 9 - 4 = 5
- ...

对每个中间结果继续探索...
最终路径：(9 - 4) × 2 = 10... 不行
尝试：4 × (9 - 2) = 28... 不行
尝试：(4 - 2) × 9 = 18... 不行
...
\`\`\`

ToT适用于需要探索和回溯的复杂问题。

## 高级技巧

### 角色扮演

举个例子：如果你想了解心脏手术的风险，是去问一个"什么都知道一点"的通才，还是去问一位有二十年经验的心脏外科医生？显然是后者。角色扮演提示（Role Prompting）就是给模型"戴上一顶专业帽子"，让它从特定角色的视角出发，调动与该领域最相关的知识来回答问题。

让模型扮演特定角色可以激活相关知识：

\`\`\`
你是一位有20年经验的心脏外科医生，正在向医学生解释心脏搭桥手术的要点...
\`\`\`

### 结构化输出

明确指定输出格式提高结果的可解析性：

\`\`\`
请分析以下文本的情感，以JSON格式输出：
{
  "sentiment": "positive/negative/neutral",
  "confidence": 0.0-1.0,
  "keywords": ["关键词1", "关键词2"],
  "reasoning": "分析理由"
}
\`\`\`

### 约束与边界

这就像给新入职的实习生交代工作规范："不要擅自联系客户""报告字数不超过两页""不确定的数据标注出来"。没有这些边界，再聪明的实习生也可能在自由发挥时"翻车"。给模型设定约束条件是同样的道理：

明确设定约束条件避免不期望的输出：

\`\`\`
在回答时：
- 不要使用技术术语，用通俗语言解释
- 答案控制在200字以内
- 如果不确定，明确说"我不确定"
- 不要编造不存在的信息
\`\`\`

### 迭代优化

通过自我反思和修正提升输出质量：

\`\`\`
请完成以下任务，然后检查你的答案是否正确：
[任务内容]

完成后，请：
1. 检查答案是否符合所有要求
2. 找出可能的错误或遗漏
3. 给出修正后的最终答案
\`\`\`

## 常见陷阱与解决

在实际使用提示词的过程中，有几个"坑"几乎每个人都会踩到。了解这些陷阱并掌握对应的解决策略，能让你少走不少弯路。

### 幻觉问题

想象一下，你问一个人"法国大革命发生在哪一年？"，他非常自信地回答"1776年"——语气笃定、逻辑通顺，但答案是错的。大语言模型的"幻觉"（Hallucination）与此类似：它会生成看似合理、读起来流畅，但实际上是编造出来的内容。应对策略是用明确的参考资料"锚定"模型的回答范围：

\`\`\`python
# 减少幻觉的策略
prompt = """
基于以下参考资料回答问题。如果参考资料中没有相关信息，请明确说明"参考资料中未提及"。

参考资料：
{context}

问题：{question}
"""
\`\`\`

### 指令遗忘

你是否遇到过这种场景：开会时老板在开头强调了"所有文档要用中文写"，但两小时后大家讨论得热火朝天，有人就不知不觉切回了英文？模型在长对话中也有类似的"遗忘"现象——上下文窗口越长，早期的指令越容易被"淹没"。解决办法很直接：在关键位置重复你最重要的约束。

\`\`\`python
# 解决方案：在关键位置重复指令
prompt = """
[系统指令]
记住：所有回答必须使用中文。

[对话历史]
...

[当前问题]
...

再次提醒：请使用中文回答。
"""
\`\`\`

### 格式不一致

输出格式可能不稳定：

\`\`\`python
# 使用JSON Mode或严格的格式约束
response = client.chat.completions.create(
    model="gpt-4",
    messages=messages,
    response_format={"type": "json_object"}  # 强制JSON输出
)
\`\`\`

## 评估与迭代

好的提示词不是一次写就的，它需要像产品迭代一样不断打磨。工程师的经验法则是：先写一版"能用"的提示词，然后用真实数据测试，根据失败案例有针对性地改进。以下介绍两种实用的评估方法。

### A/B测试

\`\`\`python
def evaluate_prompts(prompt_a, prompt_b, test_cases):
    results_a = [evaluate(prompt_a, case) for case in test_cases]
    results_b = [evaluate(prompt_b, case) for case in test_cases]
    
    score_a = sum(results_a) / len(results_a)
    score_b = sum(results_b) / len(results_b)
    
    return {"prompt_a": score_a, "prompt_b": score_b}
\`\`\`

### 失败案例分析

\`\`\`python
# 收集失败案例
failures = [case for case in results if not case['success']]

# 分析失败模式
# - 是否存在共同特征？
# - 指令是否足够清晰？
# - 是否需要更多示例？
\`\`\`

## 提示词模板库

### 信息提取

\`\`\`
从以下文本中提取指定信息：

文本：{text}

请提取：
- 人名：
- 地点：
- 时间：
- 事件：

以JSON格式输出。
\`\`\`

### 文本摘要

\`\`\`
请对以下文章进行摘要：

文章：{article}

要求：
- 摘要长度：100-150字
- 保留关键信息和主要观点
- 使用客观中立的语言
\`\`\`

### 代码生成

\`\`\`
请根据以下需求编写代码：

需求：{requirement}

技术栈：Python 3.10+
依赖限制：仅使用标准库

要求：
- 包含docstring说明函数功能
- 包含类型注解
- 处理可能的异常
- 提供简单的使用示例
\`\`\`

Prompt Engineering的本质是学会"如何跟一位能力超强但需要精确指令的同事高效沟通"。随着对模型特性和任务需求的理解加深，提示词的设计会越来越精准。需要注意，不同模型对提示词的响应存在差异，针对特定模型调优是实践中的重要环节。建议养成记录提示词版本和效果的习惯——这些积累会成为你最宝贵的"提示词资产"。
`
    },
    {
      id: "adv-11-03-dataset-stage",
      title: "11.3 数据集格式与训练阶段",
      file: "大模型教程/11-模型训练推理技术/02-数据集格式与训练阶段.md",
      difficulty: "中级-高级",
      duration: "1h",
      week: 2,
      phase: 2,
      keywords: ["数据集格式与训练阶段", "SFT", "RLHF", "RLVR"],
      content: `# 数据集格式与训练阶段

大模型的训练是一个多阶段的过程，每个阶段有不同的目标、数据格式和训练方法。理解这些阶段的差异是有效训练模型的基础。

不妨把训练大模型类比为培养一名医生。预训练就像读完整的大学和医学院课程——海量阅读、广泛涉猎，建立起对世界的基本理解；监督微调就像住院医师规培，跟着带教老师学习"问诊→分析→开处方"的标准流程；而强化学习则像由患者满意度和同行评价来进一步磨练医术和沟通技巧。每个阶段用的"教材"格式和"考核方式"都截然不同。

## 训练阶段概览

下图展示了大模型训练的完整阶段流程：

\`\`\`mermaid
graph LR
    A[预训练] -->|海量文本| B[监督微调 SFT]
    B -->|指令-回复对| C[RLHF对齐]
    C -->|偏好数据| D[RLVR推理强化]
    D -->|可验证任务| E[部署应用]
    B -.->|蓝领路线| E
    C -.->|可选| E
\`\`\`

| 阶段 | 目标 | 数据规模 | 数据类型 |
|-----|------|---------|---------|
| 预训练 | 语言建模、世界知识 | TB级 | 原始文本 |
| 监督微调（SFT） | 指令跟随 | GB级 | 指令-回复对 |
| RLHF | 人类偏好对齐 | MB级 | 偏好数据 |
| RLVR | 推理能力强化 | MB级 | 带验证的推理数据 |

## 预训练

### 目标与原理

预训练阶段的目标是让模型学习语言的统计规律和世界知识。主流方法是**自回归语言建模**（Causal Language Modeling）：

$$\\mathcal{L}_{\\text{pretrain}} = -\\sum_{t=1}^{T} \\log P(x_t | x_{<t}; \\theta)$$

其中：$T$ 为序列总长度，$x_t$ 为第 $t$ 个 token，$x_{<t}$ 为位置 $t$ 之前的所有 token，$\\theta$ 为模型参数，$P(x_t | x_{<t}; \\theta)$ 为模型在参数 $\\theta$ 下对下一个 token 的条件概率。

上式的含义很直觉：给定前面所有的字（$x_{<t}$），模型要尽可能准确地预测下一个字（$x_t$）。整体损失是所有位置上负对数似然的累加，值越小说明模型对训练文本的预测越准确。这就像你读到"今天天气真"时，大脑会自动预测下一个字可能是"好"或"热"。这个看似简单的"填空"任务，却迫使模型在海量文本中学到语法、语义乃至世界知识。

### 数据格式

预训练数据通常是简单的文本序列，经过分词后直接用于训练：

\`\`\`json
{"text": "这是一段预训练文本。模型将学习预测下一个token..."}
{"text": "Another document for pretraining. The model learns language patterns..."}
\`\`\`

**数据处理流程**：

\`\`\`python
def prepare_pretrain_data(documents, tokenizer, max_length=2048):
    # 将文档连接并切分为固定长度
    all_tokens = []
    for doc in documents:
        tokens = tokenizer.encode(doc + tokenizer.eos_token)
        all_tokens.extend(tokens)
    
    # 切分为训练样本
    samples = []
    for i in range(0, len(all_tokens) - max_length, max_length):
        samples.append(all_tokens[i:i + max_length])
    
    return samples
\`\`\`

### 数据质量要求

预训练数据的质量直接影响模型能力：

- **多样性**：覆盖多种领域、语言、风格
- **质量**：过滤低质量、重复、有害内容
- **规模**：通常需要TB级别的文本数据

## 监督微调（SFT）

### 目标与原理

SFT使预训练模型学会遵循指令。回到培养医生的比喻：如果说预训练是"读万卷书"，那么SFT就是让模型学会"患者问什么、医生答什么"的标准问答流程。训练目标是最大化给定指令下回复的概率：

$$\\mathcal{L}_{\\text{SFT}} = -\\sum_{t=1}^{T} \\mathbf{1}_{t \\in \\text{response}} \\cdot \\log P(x_t | x_{<t}; \\theta)$$

其中：$\\mathbf{1}_{t \\in \\text{response}}$ 为指示函数，当且仅当第 $t$ 个 token 属于回复（response）部分时取 1，否则取 0；其余符号含义同预训练损失。

这里有个巧妙的设计：只有回复部分的loss被计算，指令部分作为条件但不参与损失计算。也就是说，我们不会因为模型没能"背出"用户的问题而惩罚它，只关心它的回答质量。

### 数据格式

**Alpaca格式**：

\`\`\`json
{
    "instruction": "将以下句子翻译成英文",
    "input": "今天天气很好",
    "output": "The weather is nice today."
}
\`\`\`

**ShareGPT格式**（多轮对话）：

\`\`\`json
{
    "conversations": [
        {"from": "human", "value": "你好，请介绍一下Python"},
        {"from": "gpt", "value": "Python是一种高级编程语言..."},
        {"from": "human", "value": "它有什么特点？"},
        {"from": "gpt", "value": "Python有以下几个主要特点..."}
    ]
}
\`\`\`

**ChatML格式**：

\`\`\`
<|im_start|>system
你是一个有帮助的助手。
<|im_end|>
<|im_start|>user
你好
<|im_end|>
<|im_start|>assistant
你好！有什么可以帮助你的吗？
<|im_end|>
\`\`\`

### 数据处理

\`\`\`python
def prepare_sft_data(sample, tokenizer):
    # 构建完整prompt
    prompt = f"<|im_start|>user\\n{sample['instruction']}\\n"
    if sample.get('input'):
        prompt += f"{sample['input']}\\n"
    prompt += "<|im_end|>\\n<|im_start|>assistant\\n"
    response = sample['output'] + "<|im_end|>"
    
    # 分词
    prompt_ids = tokenizer.encode(prompt, add_special_tokens=False)
    response_ids = tokenizer.encode(response, add_special_tokens=False)
    
    # 构建labels（只计算response部分的loss）
    input_ids = prompt_ids + response_ids
    labels = [-100] * len(prompt_ids) + response_ids  # -100表示忽略
    
    return {"input_ids": input_ids, "labels": labels}
\`\`\`

## RLHF（人类反馈强化学习）

### 目标与原理

RLHF通过人类偏好信号优化模型输出。想象一下你去餐厅吃饭，同一道菜两个厨师做出了不同的版本，你尝过之后告诉老板"我觉得A版更好吃"——RLHF做的就是类似的事：收集大量这样的"人类品尝意见"，用它们来训练模型。典型流程：

1. **收集偏好数据**：对同一问题的多个回答进行人工排序
2. **训练奖励模型**：学习预测人类偏好
3. **PPO优化**：用奖励模型指导策略优化

奖励模型训练目标（Bradley-Terry模型）：

$$\\mathcal{L}_{\\text{RM}} = -\\log \\sigma(r_\\theta(x, y_w) - r_\\theta(x, y_l))$$

其中：$\\sigma(\\cdot)$ 为 sigmoid 函数；$r_\\theta(x, y)$ 为参数为 $\\theta$ 的奖励模型对提示 $x$ 与回答 $y$ 的打分；$y_w$ 是被偏好的回答（chosen），$y_l$ 是被拒绝的回答（rejected）。

直觉地说，这个损失函数会让奖励模型给"好回答"打出比"差回答"更高的分，而且两者的分差越大越好——就像美食评审员能明确区分精致料理和平庸快餐一样。

### 数据格式

**偏好数据**：

\`\`\`json
{
    "prompt": "请解释什么是机器学习",
    "chosen": "机器学习是人工智能的一个分支，它使计算机能够从数据中学习...",
    "rejected": "机器学习就是让机器学习。"
}
\`\`\`

**排序数据**：

\`\`\`json
{
    "prompt": "...",
    "responses": [
        {"text": "回答A", "rank": 1},
        {"text": "回答B", "rank": 2},
        {"text": "回答C", "rank": 3}
    ]
}
\`\`\`

### DPO：简化的偏好学习

DPO（Direct Preference Optimization）绕过显式的奖励模型，直接从偏好数据优化策略。如果说RLHF是"先训练一个美食评审员，再用评审员的评分指导厨师进步"，那DPO就是直接让厨师对比"好吃的菜"和"难吃的菜"自己悟出门道——省去了评审员这个中间环节：

$$\\mathcal{L}_{\\text{DPO}} = -\\log \\sigma\\left(\\beta \\log \\frac{\\pi_\\theta(y_w|x)}{\\pi_{\\text{ref}}(y_w|x)} - \\beta \\log \\frac{\\pi_\\theta(y_l|x)}{\\pi_{\\text{ref}}(y_l|x)}\\right)$$

其中：$\\pi_\\theta$ 为当前训练策略（即正在优化的模型），$\\pi_{\\text{ref}}$ 为参考策略（通常是 SFT 阶段得到的模型），$\\beta$ 为温度超参数，控制偏离参考策略的惩罚力度；$x$ 为提示，$y_w$ 和 $y_l$ 分别为被偏好和被拒绝的回答。该公式的核心思想是：相比参考模型，当前模型应当更倾向于生成好回答、更回避差回答，而 $\\beta$ 确保这种偏移不会过于激进。

DPO数据格式与RLHF相同，但训练更简单、更稳定。

## RLVR（推理验证强化学习）

### 目标与原理

RLVR针对可验证正确性的任务（如数学、编程），使用自动验证器提供奖励信号。在实际项目中，这类任务有个巨大优势：答案对不对可以自动判定，不需要人工标注。数学题算出来是多少就是多少，代码能不能跑过测试用例一目了然——这就像开卷考试和闭卷考试的区别，RLVR专治"闭卷"场景。

**关键思想**：
- 对于数学题，可以验证答案是否正确
- 对于代码，可以运行测试用例
- 无需人工标注，可以大规模生成训练数据

### 数据格式

\`\`\`json
{
    "problem": "计算 2^10 的值",
    "solution": "2^10 = 1024",
    "verification": {
        "type": "exact_match",
        "answer": "1024"
    }
}
\`\`\`

**代码任务**：

\`\`\`json
{
    "problem": "编写一个函数，判断一个数是否为质数",
    "solution": "def is_prime(n): ...",
    "verification": {
        "type": "unit_test",
        "test_cases": [
            {"input": [2], "expected": true},
            {"input": [4], "expected": false},
            {"input": [17], "expected": true}
        ]
    }
}
\`\`\`

### 过程奖励模型（PRM）

除了结果正确性，还可以评估推理过程的质量：

\`\`\`json
{
    "problem": "...",
    "steps": [
        {"step": "首先，我们设...", "correct": true},
        {"step": "然后，根据公式...", "correct": true},
        {"step": "所以答案是...", "correct": false}
    ]
}
\`\`\`

## 蒸馏与拒绝采样

### 知识蒸馏

假设你是一位经验丰富的大厨，现在要把你的独门绝活教给徒弟。你不可能把自己几十年的经验全部灌输给他，但可以让徒弟观察你做菜的每一个步骤，然后照着学。知识蒸馏（Knowledge Distillation）的原理与此相同——从大模型（教师）向小模型（学生）转移知识：

\`\`\`python
# 教师模型生成数据
teacher_outputs = teacher_model.generate(prompts, do_sample=True, temperature=0.7)

# 学生模型学习
student_loss = student_model(input_ids, labels=teacher_outputs)
\`\`\`

**数据格式**（教师生成）：

\`\`\`json
{
    "instruction": "解释量子计算",
    "output": "[教师模型的高质量回答]"
}
\`\`\`

### 拒绝采样

拒绝采样的思路很好理解：让模型对同一个问题生成很多个回答，然后只挑最好的那个作为训练数据——就像作家先写十版草稿，再从中选出最满意的一版发表：

\`\`\`python
def rejection_sampling(model, prompt, reward_model, n_samples=16):
    # 生成多个候选
    candidates = [model.generate(prompt) for _ in range(n_samples)]
    
    # 用奖励模型评分
    scores = [reward_model(prompt, c) for c in candidates]
    
    # 选择最好的
    best_idx = np.argmax(scores)
    return candidates[best_idx]
\`\`\`

## 高质量数据工程

### 数据清洗

\`\`\`python
def clean_data(sample):
    text = sample['text']
    
    # 去除HTML标签
    text = re.sub(r'<[^>]+>', '', text)
    
    # 去除多余空白
    text = re.sub(r'\\s+', ' ', text).strip()
    
    # 去除重复内容
    if is_duplicate(text):
        return None
    
    # 质量过滤
    if not quality_check(text):
        return None
    
    return {'text': text}
\`\`\`

### 数据配比

数据配比就像营养配餐——光吃粗粮不行，光吃肉也不行，各种类型的数据需要按合理的比例混合：

\`\`\`python
data_mixture = {
    'general_text': 0.4,      # 通用文本
    'code': 0.15,             # 代码
    'math': 0.1,              # 数学
    'conversation': 0.2,      # 对话
    'instruction': 0.15,      # 指令
}
\`\`\`

### 数据增强

\`\`\`python
# 回译增强
def back_translation(text, src_lang, tgt_lang):
    translated = translate(text, src_lang, tgt_lang)
    back_translated = translate(translated, tgt_lang, src_lang)
    return back_translated

# 改写增强
def paraphrase(text, model):
    prompt = f"请用不同的方式表达以下内容：\\n{text}"
    return model.generate(prompt)
\`\`\`

### 数据去污染

这是很容易被忽视但极其重要的一步。如果测试题提前混入了训练材料，模型的测试成绩就像开卷考试一样——看起来很好，但完全不反映真实能力：

\`\`\`python
def decontaminate(train_data, test_data, n_gram=10):
    # 构建测试集n-gram集合
    test_ngrams = set()
    for sample in test_data:
        ngrams = get_ngrams(sample['text'], n_gram)
        test_ngrams.update(ngrams)
    
    # 过滤训练集
    clean_train = []
    for sample in train_data:
        ngrams = get_ngrams(sample['text'], n_gram)
        if not ngrams & test_ngrams:  # 无交集
            clean_train.append(sample)
    
    return clean_train
\`\`\`

数据是大模型的"燃料"，其质量和配比直接决定模型的上限。每个训练阶段都需要精心设计的数据处理流程。建议初学者先从小规模SFT数据集制作入手，跑通格式和流程后，再逐步探索RLHF和RLVR方法。
`
    },
    {
      id: "adv-11-04-training-issues",
      title: "11.4 训练中的问题",
      file: "大模型教程/11-模型训练推理技术/03-训练中的问题.md",
      difficulty: "中级-高级",
      duration: "1.5h",
      week: 2,
      phase: 2,
      keywords: ["训练中的问题", "Loss", "NaN", "Inf"],
      content: `# 训练中的问题

大模型训练中会遇到各种技术挑战，从数值稳定性到优化困难再到泛化问题。准确诊断和解决这些问题是成功训练的关键。

训练大模型很像烹饪一道复杂的菜肴：火候、调料、时间每一个环节都可能出错。Loss爆炸就像火开太大把菜烧糊了，梯度消失就像火太小菜始终没熟，而灾难性遗忘则像学了新菜谱却忘了以前的拿手菜。接下来我们逐一剖析这些“翻车现场”及其应对策略。

下图展示了训练中常见问题的诊断流程：

\`\`\`mermaid
graph TD
    A[Loss异常] --> B{Loss变为NaN/Inf?}
    B -->|是| C[数值溢出]
    C --> C1[检查混合精度配置]
    C --> C2[使用BF16]
    B -->|否| D{Loss震荡发散?}
    D -->|是| E[梯度爆炸]
    E --> E1[梯度裁剪]
    E --> E2[降低学习率]
    D -->|否| F{Loss不再下降?}
    F -->|是| G[梯度消失/欠拟合]
    G --> G1[残差连接]
    G --> G2[调整激活函数]
    F -->|新任务后旧能力下降| H[灾难性遗忘]
    H --> H1[LoRA微调]
    H --> H2[数据混合]
\`\`\`

## 数值溢出

### 问题表现

数值溢出是大模型训练中最常见的问题之一。想象一下你用一个只能显示两位小数的计算器来计算天文数字——显示屏不够用，就会出现乱码。计算机的浮点数类似这个计算器，有其表示范围的上限和下限。一旦超出范围，训练就会出现各种奇怪的问题：
- Loss变为\`NaN\`或\`Inf\`
- 模型参数出现\`NaN\`
- 梯度爆炸到极大值

### 溢出类型

**上溢（Overflow）**：数值超过表示范围上限

\`\`\`python
import torch

# FP16范围：约 ±65504
x = torch.tensor(65505.0, dtype=torch.float16)
print(x)  # tensor(inf, dtype=torch.float16)
\`\`\`

**下溢（Underflow）**：数值过小被截断为0

\`\`\`python
# FP16最小正数：约 6×10^-8
x = torch.tensor(1e-10, dtype=torch.float16)
print(x)  # tensor(0., dtype=torch.float16)
\`\`\`

### 常见溢出场景

**Softmax溢出**：

$$\\text{softmax}(x_i) = \\frac{e^{x_i}}{\\sum_j e^{x_j}}$$

其中：$x_i$ 为输入向量的第 $i$ 个分量，求和 $\\sum_j$ 遍历向量的所有分量。该函数将任意实数向量映射为一个概率分布，输出均为正值且总和为 1。

当 $x_i$ 很大时，$e^{x_i}$ 会溢出。举个具体的例子：如果 $x_i = 1000$，那么 $e^{1000}$ 是一个有434位数字的天文数字，远远超出float16的表示范围。解决方法却很巧妙——先减去最大值，就像在比较两个人身高时，不需要知道他们海拔多少，只要让他们背靠背站在一起比就行：

\`\`\`python
def safe_softmax(x):
    x_max = x.max(dim=-1, keepdim=True).values
    exp_x = torch.exp(x - x_max)
    return exp_x / exp_x.sum(dim=-1, keepdim=True)
\`\`\`

**LayerNorm中的方差计算**：

当输入值差异很大时，方差计算可能不稳定。

\`\`\`python
# 数值稳定的LayerNorm
def stable_layer_norm(x, eps=1e-6):
    mean = x.mean(dim=-1, keepdim=True)
    # 使用mean和var的数值稳定版本
    var = ((x - mean) ** 2).mean(dim=-1, keepdim=True)
    return (x - mean) / torch.sqrt(var + eps)
\`\`\`

### 混合精度训练

混合精度训练在FP16计算与FP32精度之间平衡：

\`\`\`python
from torch.cuda.amp import autocast, GradScaler

scaler = GradScaler()

for batch in dataloader:
    optimizer.zero_grad()
    
    # FP16前向
    with autocast():
        loss = model(batch)
    
    # 缩放loss防止梯度下溢
    scaler.scale(loss).backward()
    
    # 检查梯度是否有inf/nan
    scaler.unscale_(optimizer)
    torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
    
    # 只有梯度正常时才更新
    scaler.step(optimizer)
    scaler.update()
\`\`\`

**GradScaler的工作原理**：
1. 将loss放大（如×65536）
2. 反向传播得到放大的梯度
3. 更新前将梯度缩小回原尺度
4. 如果出现inf/nan，跳过更新并减小缩放因子

### BF16的优势

BF16（Brain Floating Point 16）具有与FP32相同的指数位，减少了溢出风险：

| 格式 | 符号 | 指数 | 尾数 | 动态范围 |
|-----|------|------|------|---------|
| FP32 | 1 | 8 | 23 | ±3.4×10³⁸ |
| FP16 | 1 | 5 | 10 | ±6.5×10⁴ |
| BF16 | 1 | 8 | 7 | ±3.4×10³⁸ |

\`\`\`python
# 使用BF16训练（需要Ampere及以上GPU）
model = model.to(dtype=torch.bfloat16)
\`\`\`

## 梯度爆炸与梯度消失

### 梯度爆炸

梯度爆炸就像炒菜时火开得太大——油温瞬间飙升，菜还没下锅油就已经冒烟了。在训练中，它表现为参数更新量突然变得巨大，导致模型"失控"。典型症状包括：
- 梯度范数急剧增大
- Loss震荡或发散
- 参数更新不稳定

**诊断**：

\`\`\`python
def monitor_gradients(model):
    total_norm = 0
    for p in model.parameters():
        if p.grad is not None:
            param_norm = p.grad.data.norm(2)
            total_norm += param_norm.item() ** 2
    total_norm = total_norm ** 0.5
    return total_norm

# 训练中监控
grad_norm = monitor_gradients(model)
if grad_norm > 100:
    print(f"Warning: Large gradient norm: {grad_norm}")
\`\`\`

**解决方案**：应对梯度爆炸的思路很直接——既然火太大，那就控制火候：

1. **梯度裁剪**：

\`\`\`python
# 按范数裁剪
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)

# 按值裁剪
torch.nn.utils.clip_grad_value_(model.parameters(), clip_value=1.0)
\`\`\`

2. **学习率调整**：

\`\`\`python
# 学习率预热
scheduler = get_linear_schedule_with_warmup(
    optimizer,
    num_warmup_steps=1000,
    num_training_steps=total_steps
)
\`\`\`

3. **权重初始化**：

\`\`\`python
def init_weights(module):
    if isinstance(module, nn.Linear):
        # Xavier/Glorot初始化
        nn.init.xavier_uniform_(module.weight)
        if module.bias is not None:
            nn.init.zeros_(module.bias)
\`\`\`

### 梯度消失

与梯度爆炸相反，梯度消失就像火开得太小，菜始终没熟。模型的早期层几乎收不到任何训练信号，就像你在一个很长的传话链中，第一个人说的话传到最后一个人已经面目全非了。

**表现**：
- 早期层梯度接近0
- 参数几乎不更新
- 训练停滞

**深度网络中的梯度消失**：

链式法则导致梯度连乘：

$$\\frac{\\partial \\mathcal{L}}{\\partial W_1} = \\frac{\\partial \\mathcal{L}}{\\partial h_L} \\cdot \\frac{\\partial h_L}{\\partial h_{L-1}} \\cdots \\frac{\\partial h_2}{\\partial h_1} \\cdot \\frac{\\partial h_1}{\\partial W_1}$$

其中：$\\mathcal{L}$ 为损失函数，$W_1$ 为第 1 层的权重，$h_l$（$l=1,\\ldots,L$）为第 $l$ 层的隐藏表示。上式展示了链式法则的连乘结构：损失对浅层参数的梯度是所有中间层局部梯度的连乘，层数越多梯度传播链越长。

如果每层梯度 $< 1$，连乘后趋近于0。这就好比你把一张纸对折多次——每次折叠只减半，但折了二十次之后，厚度已经只有原来的百万分之一。深度网络中的梯度消失也是同理：每经过一层梯度缩小一点，经过几十层后就基本消失了。

**解决方案**：应对梯度消失的核心思想是给梯度提供"捷径"，让它不必经过每一层的衰减就能直接传到早期层：

1. **残差连接**：

\`\`\`python
class ResidualBlock(nn.Module):
    def forward(self, x):
        return x + self.sublayer(x)  # 梯度可以直接流过
\`\`\`

2. **LayerNorm**：

\`\`\`python
class TransformerBlock(nn.Module):
    def forward(self, x):
        # Pre-LN结构更稳定
        x = x + self.attn(self.norm1(x))
        x = x + self.ffn(self.norm2(x))
        return x
\`\`\`

3. **适当的激活函数**：

\`\`\`python
# ReLU在正区间梯度为1，但负区间梯度为0
# GELU/SiLU更平滑，梯度不会突然截断
nn.GELU()
nn.SiLU()
\`\`\`

## 灾难性遗忘

### 问题描述

你是否有过这样的经历：学了一门新的编程语言后，突然发现以前很熟练的语言句法变得生疏了？模型在微调时也会遇到类似的问题——学习新任务时，预训练阶段获得的通用能力可能被"覆盖"，在新任务上表现很好但通用能力下降。这个现象被称为"灾难性遗忘"（Catastrophic Forgetting）。

### 诊断方法

\`\`\`python
# 在微调前后评估多个任务
tasks = ['general_qa', 'math', 'code', 'target_task']

pretrained_scores = evaluate_all(pretrained_model, tasks)
finetuned_scores = evaluate_all(finetuned_model, tasks)

# 检查是否有任务性能显著下降
for task in tasks:
    delta = finetuned_scores[task] - pretrained_scores[task]
    if delta < -0.1:
        print(f"Warning: {task} performance dropped by {-delta:.2%}")
\`\`\`

### 缓解策略

缓解灾难性遗忘的思路可以类比为"既要学新菜，也要练旧菜"——通过各种手段确保模型在学习新任务的同时不丢失已有能力：

**1. 参数高效微调（PEFT）**：

只更新少量参数，保持大部分预训练权重不变：

\`\`\`python
from peft import LoraConfig, get_peft_model

lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
)
model = get_peft_model(model, lora_config)
# 只有0.1%的参数被更新
\`\`\`

**2. 数据混合**：

\`\`\`python
# 在微调数据中混入预训练格式的数据
mixed_dataset = ConcatDataset([
    target_dataset,           # 目标任务数据
    general_dataset,          # 通用数据（保持通用能力）
])
\`\`\`

**3. 弹性权重巩固（EWC）**：

对重要参数施加更强的正则化。换个角度看，这就像给模型的"核心记忆"加上一把锁，不让新知识轻易覆盖这些关键参数：

$$\\mathcal{L} = \\mathcal{L}_{\\text{task}} + \\lambda \\sum_i F_i (\\theta_i - \\theta_i^*)^2$$

其中：$\\mathcal{L}_{\\text{task}}$ 为新任务的损失；$\\lambda$ 为正则化强度系数，控制新旧任务之间的权衡；$F_i$ 为 Fisher 信息矩阵的第 $i$ 个对角元素，衡量参数 $\\theta_i$ 对旧任务的重要程度；$\\theta_i^*$ 为旧任务训练完成后的最优参数值，$\\theta_i$ 为当前参数值。该公式的思想是：对旧任务越重要的参数，新任务训练时允许其偏离原值的幅度越小，从而在学习新知识的同时保护旧知识。

**4. 学习率分层**：

\`\`\`python
# 早期层使用更小的学习率
param_groups = [
    {'params': model.embed.parameters(), 'lr': 1e-6},
    {'params': model.layers[:12].parameters(), 'lr': 1e-5},
    {'params': model.layers[12:].parameters(), 'lr': 1e-4},
]
optimizer = torch.optim.AdamW(param_groups)
\`\`\`

## 显存利用率与MFU

### 显存分析

在实际项目中，显存往往是训练大模型的第一个瓶颈。把显存想象成你的工作台面——上面要同时摆放食材（模型参数）、菜谱笔记（优化器状态）、正在处理的半成品（激活值）和各种工具（梯度）。台面就这么大，怎么合理分配空间是个学问。

大模型训练的显存占用包括：

| 组成部分 | 估算公式（FP16） |
|---------|-----------------|
| 模型参数 | $2 \\times P$ 字节 |
| 优化器状态 | $8-12 \\times P$ 字节（AdamW） |
| 梯度 | $2 \\times P$ 字节 |
| 激活值 | $\\sim 2 \\times B \\times S \\times H \\times L$ 字节 |

其中 $P$ 是参数量，$B$ 是batch size，$S$ 是序列长度，$H$ 是隐藏维度，$L$ 是层数。

\`\`\`python
def estimate_memory(model_params_b, batch_size, seq_len, hidden_dim, layers):
    # 单位：GB
    params_memory = model_params_b * 2  # FP16权重
    optimizer_memory = model_params_b * 12  # AdamW状态
    gradient_memory = model_params_b * 2
    
    # 激活值估算（简化）
    activation_memory = 2 * batch_size * seq_len * hidden_dim * layers / 1e9
    
    return {
        'params': params_memory,
        'optimizer': optimizer_memory,
        'gradients': gradient_memory,
        'activations': activation_memory,
        'total': params_memory + optimizer_memory + gradient_memory + activation_memory
    }
\`\`\`

### 显存优化技术

当显存不够用时，有几种常用的"省空间"策略。每种策略都是在"时间换空间"或"分布式分担"的思路下运作的：

**1. 梯度检查点**：

\`\`\`python
from torch.utils.checkpoint import checkpoint

class CheckpointedTransformerBlock(nn.Module):
    def forward(self, x):
        # 不保存中间激活，反向时重新计算
        return checkpoint(self._forward, x, use_reentrant=False)
    
    def _forward(self, x):
        x = x + self.attn(self.norm1(x))
        x = x + self.ffn(self.norm2(x))
        return x
\`\`\`

**2. 梯度累积**：

\`\`\`python
accumulation_steps = 8

for i, batch in enumerate(dataloader):
    loss = model(batch) / accumulation_steps
    loss.backward()
    
    if (i + 1) % accumulation_steps == 0:
        optimizer.step()
        optimizer.zero_grad()
\`\`\`

**3. ZeRO优化器**：

\`\`\`python
# DeepSpeed ZeRO Stage 3
ds_config = {
    "zero_optimization": {
        "stage": 3,
        "offload_optimizer": {"device": "cpu"},
        "offload_param": {"device": "cpu"}
    }
}
\`\`\`

### MFU（Model FLOPs Utilization）

MFU衡量实际计算效率与硬件峰值的比值。假设你买了一台号称最高时速300公里的跑车，但在实际驾驶中只能跑到平均120公里——那么你的"性能利用率"就是40%。MFU衡量的就是类似的事情，只不过把"时速"换成了"计算量"。

$$\\text{MFU} = \\frac{\\text{实际FLOPs/秒}}{\\text{硬件峰值FLOPs/秒}}$$

其中“实际 FLOPs/秒”为训练过程中每秒完成的浮点操作数，“硬件峰值 FLOPs/秒”为 GPU 的理论最大计算吞吐量。MFU 取值范围为 $[0, 1]$，值越接近 1 表明硬件利用率越高；实践中典型值为 30%–50%。

**计算方法**：

\`\`\`python
def compute_mfu(model_params, batch_size, seq_len, time_per_step, gpu_flops):
    # Transformer前向+反向约6倍参数量的FLOPs
    flops_per_step = 6 * model_params * batch_size * seq_len
    achieved_flops = flops_per_step / time_per_step
    mfu = achieved_flops / gpu_flops
    return mfu

# 示例：7B模型，A100 GPU
mfu = compute_mfu(
    model_params=7e9,
    batch_size=4,
    seq_len=2048,
    time_per_step=0.5,  # 秒
    gpu_flops=312e12    # A100 FP16峰值
)
print(f"MFU: {mfu:.1%}")
\`\`\`

**优化MFU**：
- 增大batch size（更好的GPU利用）
- 使用Flash Attention（减少内存带宽瓶颈）
- 优化数据加载（避免GPU空闲）
- 使用高效的通信原语（分布式训练）

### 监控与调试工具

\`\`\`python
# PyTorch Profiler
with torch.profiler.profile(
    activities=[
        torch.profiler.ProfilerActivity.CPU,
        torch.profiler.ProfilerActivity.CUDA,
    ],
    record_shapes=True,
    profile_memory=True,
) as prof:
    model(batch)

print(prof.key_averages().table(sort_by="cuda_time_total"))
\`\`\`

训练问题的诊断需要系统性方法：监控关键指标、理解问题根因、选择合适的解决方案。随着经验积累，你会逐渐培养出"看一眼训练曲线就知道哪里出了问题"的直觉。
`
    },
    {
      id: "adv-11-05-cot-training",
      title: "11.5 思维链训练与思维回溯",
      file: "大模型教程/11-模型训练推理技术/04-思维链训练.md",
      difficulty: "中级-高级",
      duration: "1h",
      week: 0,
      phase: 0,
      keywords: ["思维链训练与思维回溯", "Chain", "Thought", "PRM", "SFT"],
      content: `# 思维链训练与思维回溯

提升大模型的推理能力是当前研究的重要方向。思维链（Chain-of-Thought）训练和思维回溯技术使模型能够进行更深入、更可靠的推理。

回想一下你上学时考数学的经历。老师总是说"要写出解题过程"，不能只写一个答案。这背后有深刻的道理：写出每一步推导，不仅方便老师给分，更重要的是帮助你自己理清思路、发现错误。思维链训练的核心思想完全一样——让模型学会"展示解题过程"，而不是直接报答案。

## 思维链的本质

下图展示了思维链推理的核心流程：

\`\`\`mermaid
graph LR
    A[问题] --> B[思考步骤1]
    B --> C[思考步骤2]
    C --> D[思考步骤3]
    D --> E[最终答案]
    F[验证器] -.->|反馈| B
    F -.->|检查| D
    G[PRM过程奖励] -.->|评分| B
    G -.->|评分| C
    G -.->|评分| D
\`\`\`

### 从直觉到推理

传统的语言模型直接从问题映射到答案，就像考生直接在答题卡上写答案，不写任何运算过程：

$$P(\\text{answer} | \\text{question})$$

即模型直接对问题产生答案的条件概率，中间不包含任何显式的推理过程。

思维链则是让模型先在“草稿纸”上写出推导过程，再得出最终答案：

$$P(\\text{answer} | \\text{question}) = \\sum_{\\text{reasoning}} P(\\text{answer} | \\text{reasoning}, \\text{question}) \\cdot P(\\text{reasoning} | \\text{question})$$

其中：$\\text{question}$ 为输入问题，$\\text{reasoning}$ 为中间推理过程，$\\text{answer}$ 为最终答案。第一项 $P(\\text{reasoning} | \\text{question})$ 表示模型生成某条推理路径的概率，第二项 $P(\\text{answer} | \\text{reasoning}, \\text{question})$ 表示给定推理过程后得到正确答案的概率。对所有可能的推理路径求和，即得到边缘化的答案概率。该分解说明：通过引入显式推理链，模型可以综合多条推理路径的信息，从而提升最终答案的可靠性。
- **分解复杂问题**：将困难问题拆解为可管理的子问题
- **可解释性**：用户可以理解和验证推理过程
- **错误定位**：更容易发现推理中的错误
- **能力迁移**：推理模式可以迁移到新问题

### 推理类型

| 类型 | 描述 | 示例 |
|-----|------|------|
| 数学推理 | 逻辑推导与计算 | 解方程、证明 |
| 常识推理 | 基于世界知识的推断 | 因果关系、物理规律 |
| 符号推理 | 符号操作与转换 | 代码执行、逻辑运算 |
| 多跳推理 | 整合多个信息片段 | 阅读理解、知识问答 |

## 思维链训练方法

### 监督微调方法

使用带有推理步骤的数据进行SFT：

\`\`\`json
{
    "question": "小明有5个苹果，小红给了他3个，然后他吃掉了2个。现在小明有几个苹果？",
    "reasoning": "1. 小明最初有5个苹果\\n2. 小红给了他3个，所以他有 5 + 3 = 8 个苹果\\n3. 他吃掉了2个，所以他有 8 - 2 = 6 个苹果",
    "answer": "6"
}
\`\`\`

**数据构造方法**：

1. **人工标注**：质量高但成本大
2. **模型生成+验证**：用强模型生成，通过答案正确性筛选
3. **程序合成**：对于数学问题，可以程序化生成推理步骤

\`\`\`python
def generate_cot_data(problem, model, verifier, n_samples=10):
    candidates = []
    for _ in range(n_samples):
        # 生成带推理的回答
        response = model.generate(
            f"问题：{problem}\\n让我们一步步思考：",
            temperature=0.7
        )
        
        # 提取答案并验证
        answer = extract_answer(response)
        if verifier(problem, answer):
            candidates.append({
                'question': problem,
                'reasoning': response,
                'answer': answer
            })
    
    return candidates
\`\`\`

### 强化学习方法

使用RL优化推理过程，奖励信号可以来自：
- **结果正确性**：最终答案是否正确
- **过程正确性**：每一步推理是否正确（需要过程标注或PRM）

**RLVR训练框架**：

\`\`\`python
def rlvr_training_step(model, problem, verifier):
    # 生成推理和答案
    reasoning, answer = model.generate_with_reasoning(problem)
    
    # 计算奖励
    if verifier(problem, answer):
        reward = 1.0
    else:
        reward = 0.0
    
    # 可选：过程奖励
    step_rewards = process_reward_model(reasoning)
    reward = reward + sum(step_rewards)
    
    # PPO/GRPO更新
    update_policy(model, reasoning, reward)
\`\`\`

### 过程奖励模型（PRM）

PRM评估推理过程中每一步的正确性：

\`\`\`python
class ProcessRewardModel:
    def __init__(self, base_model):
        self.model = base_model
        self.classifier = nn.Linear(hidden_size, 2)  # 正确/错误
    
    def forward(self, question, reasoning_steps):
        rewards = []
        context = question
        
        for step in reasoning_steps:
            context = context + "\\n" + step
            hidden = self.model(context).last_hidden_state[:, -1]
            prob = self.classifier(hidden).softmax(-1)[:, 1]  # 正确的概率
            rewards.append(prob)
        
        return rewards
\`\`\`

**PRM训练数据**：

\`\`\`json
{
    "question": "...",
    "steps": [
        {"content": "首先，设x为...", "label": "correct"},
        {"content": "根据公式，x = ...", "label": "correct"},
        {"content": "所以答案是...", "label": "incorrect"}
    ]
}
\`\`\`

## 思维回溯

### 问题动机

在考试中，你可能做着做着突然发现前面某一步算错了，这时你会划掉错误的部分，回到出错的地方重新推导。思维回溯（Thought Backtracking）就是让模型也具备这种"发现错误并纠正"的能力，而不是一条路走到黑。

### 实现方法

**1. 自我验证与修正**：

\`\`\`
问题：...

初次推理：
步骤1：...
步骤2：...
答案：X

验证：
让我检查一下这个推理是否正确。
步骤2中，... 这里有个错误。

修正后的推理：
步骤1：...
步骤2（修正）：...
答案：Y
\`\`\`

**2. 树搜索方法**：

\`\`\`python
def beam_search_with_backtrack(model, problem, beam_width=5, max_depth=10):
    # 初始状态
    beams = [{'path': [], 'score': 0.0}]
    
    for depth in range(max_depth):
        candidates = []
        for beam in beams:
            # 从当前状态扩展
            continuations = model.generate_steps(
                problem, beam['path'], n=beam_width
            )
            
            for cont in continuations:
                # 评估每个扩展
                score = evaluate_step(problem, beam['path'] + [cont])
                candidates.append({
                    'path': beam['path'] + [cont],
                    'score': beam['score'] + score
                })
        
        # 保留最好的beam_width个
        beams = sorted(candidates, key=lambda x: -x['score'])[:beam_width]
        
        # 检查是否完成
        if any(is_complete(b['path']) for b in beams):
            break
    
    return beams[0]['path']
\`\`\`

**3. Monte Carlo Tree Search (MCTS)**：

\`\`\`python
class MCTSNode:
    def __init__(self, state, parent=None):
        self.state = state
        self.parent = parent
        self.children = []
        self.visits = 0
        self.value = 0.0

def mcts_search(problem, model, verifier, iterations=100):
    root = MCTSNode(state=problem)
    
    for _ in range(iterations):
        # Selection: 选择最有潜力的节点
        node = select(root)
        
        # Expansion: 扩展新的推理步骤
        child_state = model.generate_step(node.state)
        child = MCTSNode(child_state, parent=node)
        node.children.append(child)
        
        # Simulation: 完成推理并验证
        final_answer = model.complete_reasoning(child_state)
        reward = 1.0 if verifier(problem, final_answer) else 0.0
        
        # Backpropagation: 更新节点统计
        backpropagate(child, reward)
    
    return best_child(root).state
\`\`\`

## Test-Time Compute

### 思想

在推理时投入更多计算以提升性能。这个思路很好理解：就像你做一道难题时，花十分钟思考往往比花30秒就下笔得到更好的结果。Test-Time Compute的核心就是"用更多的思考时间换取更好的答案"。

### 实现策略

**1. 多次采样**（Self-Consistency）：

\`\`\`python
def self_consistency(model, problem, n_samples=10):
    answers = []
    for _ in range(n_samples):
        response = model.generate(problem, temperature=0.7)
        answer = extract_answer(response)
        answers.append(answer)
    
    # 投票选择最常见的答案
    return max(set(answers), key=answers.count)
\`\`\`

**2. 迭代改进**：

\`\`\`python
def iterative_refinement(model, problem, max_iterations=3):
    solution = model.generate(problem)
    
    for _ in range(max_iterations):
        # 让模型评估和改进
        critique = model.generate(f"评估以下解答并指出问题：\\n{solution}")
        
        if "正确" in critique and "没有问题" in critique:
            break
        
        solution = model.generate(
            f"问题：{problem}\\n原解答：{solution}\\n评估：{critique}\\n请给出改进后的解答："
        )
    
    return solution
\`\`\`

**3. Best-of-N**：

\`\`\`python
def best_of_n(model, problem, reward_model, n=10):
    candidates = [model.generate(problem) for _ in range(n)]
    scores = [reward_model(problem, c) for c in candidates]
    return candidates[np.argmax(scores)]
\`\`\`

## 训练增强推理

### 数据增强

\`\`\`python
def augment_cot_data(sample):
    augmented = []
    
    # 原始样本
    augmented.append(sample)
    
    # 不同风格的推理
    styles = ['详细', '简洁', '数学符号']
    for style in styles:
        new_reasoning = rewrite_reasoning(sample['reasoning'], style)
        augmented.append({**sample, 'reasoning': new_reasoning})
    
    # 添加常见错误和修正
    error_sample = inject_error(sample)
    augmented.append(error_sample)
    
    return augmented
\`\`\`

### 课程学习

课程学习借鉴了人类学习的规律：小学生先学加减法，再学乘除法，最后才学方程。同样，训练模型时也可以先用简单的推理任务热身，然后逐渐增加难度：

\`\`\`python
def curriculum_training(model, datasets):
    # 按难度排序
    easy, medium, hard = split_by_difficulty(datasets)
    
    # 从易到难训练
    for epoch in range(num_epochs):
        if epoch < num_epochs // 3:
            train_data = easy
        elif epoch < 2 * num_epochs // 3:
            train_data = easy + medium
        else:
            train_data = easy + medium + hard
        
        train_epoch(model, train_data)
\`\`\`

### 推理长度控制

\`\`\`python
# 奖励设计：在正确的前提下鼓励简洁
def compute_reward(answer_correct, reasoning_length):
    if not answer_correct:
        return 0.0
    
    # 正确答案基础奖励 + 简洁性奖励
    base_reward = 1.0
    brevity_bonus = max(0, 0.2 - 0.001 * reasoning_length)
    
    return base_reward + brevity_bonus
\`\`\`

思维链训练和思维回溯技术代表了大模型能力提升的重要方向。通过让模型学会"思考"，而不仅仅是"回答"，可以显著提升其在复杂推理任务上的表现。就像教育家们常说的那样："重要的不是答案，而是解题过程。"这一领域仍在快速发展，新的方法和技术不断涌现。
`
    },
    {
      id: "adv-11-06-apps",
      title: "11.6 模型周边应用",
      file: "大模型教程/11-模型训练推理技术/05-模型周边应用.md",
      difficulty: "中级-高级",
      duration: "1h",
      week: 0,
      phase: 0,
      keywords: ["模型周边应用", "Gradio", "Streamlit", "MaaS", "API", "FaaS"],
      content: `# 模型周边应用

将训练好的模型转化为可用的应用是AI落地的关键环节。本节介绍快速构建模型应用的工具以及规模化部署的架构模式。

训练好了一个强大的模型，如果只能在命令行里跑脚本，那就像编了一本极好的教程但只能放在自己抽屉里——没人能用到。要让模型真正发挥价值，就需要把它“包装”成别人能方便使用的应用。本节介绍几种主流的“包装”方式，从最快的演示原型到生产级的服务架构。

下图展示了模型应用的典型架构和技术选型：

\`\`\`mermaid
graph TD
    A[训练好的模型] --> B[快速演示]
    A --> C[数据应用]
    A --> D[生产服务]
    B --> B1[Gradio]
    C --> C1[Streamlit]
    D --> D1[MaaS API服务]
    D --> D2[FaaS无服务器]
    D1 --> E[FastAPI + vLLM]
    D2 --> F[弹性伸缩 + 按量付费]
\`\`\`

## Gradio：快速构建交互界面

Gradio是构建机器学习演示应用最便捷的工具。假设你刚微调好了一个模型，老板说"明天给客户演示一下"——Gradio就是你的救星，几行代码就能创建一个可以在浏览器中打开的交互界面。

### 基础用法

\`\`\`python
import gradio as gr

def chat(message, history):
    # 调用模型生成回复
    response = model.generate(message)
    return response

# 创建聊天界面
demo = gr.ChatInterface(
    fn=chat,
    title="AI助手",
    description="基于大模型的对话助手"
)

demo.launch()
\`\`\`

### 组件系统

Gradio提供丰富的输入输出组件：

\`\`\`python
import gradio as gr

def process(text, image, slider_value, checkbox):
    # 处理多模态输入
    return f"处理结果：文本长度{len(text)}, 图像尺寸{image.shape if image else 'None'}"

demo = gr.Interface(
    fn=process,
    inputs=[
        gr.Textbox(label="输入文本", placeholder="请输入..."),
        gr.Image(label="上传图片", type="numpy"),
        gr.Slider(0, 100, value=50, label="参数调节"),
        gr.Checkbox(label="启用高级模式")
    ],
    outputs=gr.Textbox(label="输出"),
    title="多模态处理演示"
)

demo.launch()
\`\`\`

### Blocks布局

Blocks允许更灵活的界面布局：

\`\`\`python
with gr.Blocks(title="LLM应用") as demo:
    gr.Markdown("# 大模型应用演示")
    
    with gr.Row():
        with gr.Column(scale=2):
            chatbot = gr.Chatbot(height=400)
            msg = gr.Textbox(label="输入消息")
            
            with gr.Row():
                submit = gr.Button("发送", variant="primary")
                clear = gr.Button("清空")
        
        with gr.Column(scale=1):
            gr.Markdown("### 参数设置")
            temperature = gr.Slider(0, 1, value=0.7, label="Temperature")
            max_tokens = gr.Slider(100, 2000, value=500, label="Max Tokens")
            system_prompt = gr.Textbox(label="System Prompt", lines=3)
    
    def respond(message, history, temp, max_tok, sys_prompt):
        response = model.chat(message, history, temperature=temp, max_tokens=max_tok)
        history.append((message, response))
        return "", history
    
    submit.click(respond, [msg, chatbot, temperature, max_tokens, system_prompt], [msg, chatbot])
    clear.click(lambda: [], None, chatbot)

demo.launch()
\`\`\`

### 流式输出

\`\`\`python
def stream_response(message, history):
    response = ""
    for chunk in model.stream_generate(message):
        response += chunk
        yield response

demo = gr.ChatInterface(
    fn=stream_response,
    title="流式对话"
)
\`\`\`

## Streamlit：数据应用框架

如果说Gradio是"快速演示用"的工具，Streamlit则更擅长构建数据驱动的分析应用。比如你想做一个"文本情感分析仪表盘"，用户可以输入文本、查看分析结果和统计图表——这类场景Streamlit比Gradio更合适。

### 基础用法

\`\`\`python
import streamlit as st

st.title("AI文本分析")

# 侧边栏配置
with st.sidebar:
    st.header("设置")
    model_name = st.selectbox("选择模型", ["qwen-7b", "qwen-14b"])
    temperature = st.slider("Temperature", 0.0, 1.0, 0.7)

# 主界面
text = st.text_area("输入文本", height=200)

if st.button("分析"):
    with st.spinner("处理中..."):
        result = analyze(text, model_name, temperature)
    
    st.subheader("分析结果")
    col1, col2 = st.columns(2)
    with col1:
        st.metric("情感得分", result['sentiment'])
    with col2:
        st.metric("关键词数", len(result['keywords']))
    
    st.json(result)
\`\`\`

### 会话状态

\`\`\`python
# 保持对话历史
if "messages" not in st.session_state:
    st.session_state.messages = []

# 显示历史消息
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.write(msg["content"])

# 处理新输入
if prompt := st.chat_input("请输入"):
    st.session_state.messages.append({"role": "user", "content": prompt})
    
    with st.chat_message("assistant"):
        response = model.generate(prompt)
        st.write(response)
    
    st.session_state.messages.append({"role": "assistant", "content": response})
\`\`\`

## HTML5前端

当Gradio和Streamlit的定制化能力满足不了你的需求时——比如你需要一个完全贴合公司品牌风格的界面，或者要嵌入到现有的Web应用中——就需要使用纯前端技术了。这时你的模型通常已经作为API服务在运行，前端只需要调用这些API就行。

### 基础API调用

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>AI Chat</title>
</head>
<body>
    <div id="chat-container">
        <div id="messages"></div>
        <input type="text" id="input" placeholder="输入消息...">
        <button onclick="sendMessage()">发送</button>
    </div>

    <script>
        async function sendMessage() {
            const input = document.getElementById('input');
            const message = input.value;
            input.value = '';
            
            // 显示用户消息
            appendMessage('user', message);
            
            // 调用API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({message: message})
            });
            
            const data = await response.json();
            appendMessage('assistant', data.response);
        }
        
        function appendMessage(role, content) {
            const messages = document.getElementById('messages');
            const div = document.createElement('div');
            div.className = \`message \${role}\`;
            div.textContent = content;
            messages.appendChild(div);
        }
    </script>
</body>
</html>
\`\`\`

### 流式响应

\`\`\`javascript
async function streamChat(message) {
    const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({message: message})
    });
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    const messageDiv = document.createElement('div');
    document.getElementById('messages').appendChild(messageDiv);
    
    while (true) {
        const {done, value} = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        messageDiv.textContent += chunk;
    }
}
\`\`\`

## MaaS架构

### 概念

MaaS（Model as a Service）将模型封装为标准化的API服务，实现能力的复用和共享。这就像你不需要自己建发电厂才能用电——插上插座就行。MaaS让开发者无需关心模型的部署和维护，通过简单的API调用就能获得模型能力。

\`\`\`
客户端应用
    ↓ HTTP/gRPC
API网关（认证、限流、路由）
    ↓
模型服务（推理引擎）
    ↓
模型存储（权重、配置）
\`\`\`

### OpenAI兼容API

大多数推理框架支持OpenAI API格式：

\`\`\`python
# 服务端（使用vLLM）
# python -m vllm.entrypoints.openai.api_server --model model_path

# 客户端调用
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8000/v1",
    api_key="dummy"
)

response = client.chat.completions.create(
    model="qwen",
    messages=[{"role": "user", "content": "你好"}],
    stream=True
)

for chunk in response:
    print(chunk.choices[0].delta.content or "", end="")
\`\`\`

### 服务化最佳实践

\`\`\`python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import asyncio

app = FastAPI()

class ChatRequest(BaseModel):
    messages: list
    temperature: float = 0.7
    max_tokens: int = 512

class ChatResponse(BaseModel):
    content: str
    usage: dict

@app.post("/v1/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        response = await model.agenerate(
            request.messages,
            temperature=request.temperature,
            max_tokens=request.max_tokens
        )
        return ChatResponse(
            content=response.text,
            usage={"tokens": response.token_count}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 健康检查
@app.get("/health")
async def health():
    return {"status": "healthy"}
\`\`\`

## FaaS化

### 概念

FaaS（Function as a Service）将模型推理封装为无服务器函数，按调用付费。在实际项目中，如果你的模型服务不是7×24小时有人用，而是时不时来一波请求，FaaS就特别合适——没请求时不花钱，有请求时自动扩容。但它也有个明显的痛点：冷启动。模型加载可能需要几十秒，第一个用户的请求会等很久——就像去一家需要现点现做的餐厅，第一位客人总是等得最久。

### 优势与挑战

| 优势 | 挑战 |
|-----|------|
| 弹性伸缩 | 冷启动延迟 |
| 按量付费 | 模型加载时间 |
| 免运维 | 显存限制 |

### 冷启动优化

\`\`\`python
# 模型预热
import modal

app = modal.App()

# 将模型打包到镜像中
image = modal.Image.debian_slim().pip_install("transformers", "torch")

@app.function(
    image=image,
    gpu="A10G",
    container_idle_timeout=300,  # 保持容器5分钟
)
def inference(text):
    # 模型会在容器创建时加载
    return model.generate(text)
\`\`\`

### 模型缓存策略

\`\`\`python
# 使用共享存储缓存模型
from functools import lru_cache

@lru_cache(maxsize=1)
def get_model():
    return AutoModelForCausalLM.from_pretrained("model_path")

def handler(event, context):
    model = get_model()  # 首次调用加载，后续复用
    return model.generate(event['text'])
\`\`\`

## 应用架构示例

### 完整的对话应用

\`\`\`
用户界面（Gradio/Web）
         ↓
    API服务（FastAPI）
    /          \\
会话管理      模型调用
(Redis)      (vLLM)
    \\          /
    数据存储（DB）
\`\`\`

\`\`\`python
# app.py - 整合示例
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import gradio as gr
import redis

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"])

# Redis会话存储
session_store = redis.Redis()

# Gradio界面
def chat_fn(message, history, session_id):
    # 获取会话历史
    full_history = session_store.get(session_id) or []
    full_history.append({"role": "user", "content": message})
    
    # 调用模型
    response = model.generate(full_history)
    full_history.append({"role": "assistant", "content": response})
    
    # 保存会话
    session_store.set(session_id, full_history)
    
    return response

gradio_app = gr.ChatInterface(chat_fn)

# 挂载Gradio到FastAPI
app = gr.mount_gradio_app(app, gradio_app, path="/chat")

# API端点
@app.post("/api/chat")
async def api_chat(request: dict):
    return {"response": model.generate(request['message'])}
\`\`\`

通过这些工具和架构，可以快速将训练好的模型转化为可用的应用，满足从原型验证到生产部署的各种需求。建议初学者从 Gradio 开始练手，它的学习曲线最平缓；当你对应用架构有了更深入的理解后，再根据实际需求选择MaaS或FaaS的部署方式。
`
    },
    {
      id: "adv-11-07-inference-acceleration",
      title: "11.7 推理加速应用",
      file: "大模型教程/11-模型训练推理技术/06-推理加速应用.md",
      difficulty: "中级-高级",
      duration: "1h",
      week: 0,
      phase: 0,
      keywords: ["推理加速应用", "LLM", "SGLang"],
      content: `# 推理加速应用

本节聚焦于如何在实际应用中使用vLLM和SGLang实现高效推理，包括部署配置、性能调优和生产环境最佳实践。

想象你开了一家餐厅，厨师的手艺再好（模型再强），如果上菜速度太慢、同时只能服务一位客人，生意也做不起来。推理加速解决的就是这个问题：如何让模型更快地生成结果，同时服务更多的并发请求。

下图展示了推理加速从模型优化到生产部署的完整流程：

\`\`\`mermaid
graph LR
    A[训练好的模型] --> B[模型优化]
    B --> B1[量化]
    B --> B2[剪枝]
    B --> B3[蒸馏]
    B1 --> C[推理引擎]
    B2 --> C
    B3 --> C
    C --> C1[vLLM]
    C --> C2[SGLang]
    C1 --> D[服务部署]
    C2 --> D
    D --> D1[负载均衡]
    D --> D2[性能监控]
    D --> D3[成本优化]
\`\`\`

## vLLM应用实践

vLLM是目前最流行的大模型推理引擎之一。它的核心优势在于PagedAttention技术，能大幅提升显存利用率和并发处理能力。如果把普通推理比作"每张桌子只能坐一位客人"，那vLLM就是"灵活拼桌"——根据客人的实际需求动态分配座位，让更多客人能同时就餐。

### 快速启动

\`\`\`bash
# 启动OpenAI兼容服务
python -m vllm.entrypoints.openai.api_server \\
    --model Qwen/Qwen2-7B-Instruct \\
    --host 0.0.0.0 \\
    --port 8000 \\
    --tensor-parallel-size 1 \\
    --dtype bfloat16
\`\`\`

### Python集成

\`\`\`python
from vllm import LLM, SamplingParams

# 初始化模型
llm = LLM(
    model="Qwen/Qwen2-7B-Instruct",
    tensor_parallel_size=2,
    gpu_memory_utilization=0.9,
    max_model_len=4096,
)

# 批量推理
prompts = [
    "介绍一下机器学习",
    "Python的优点是什么",
    "如何学习编程"
]

sampling_params = SamplingParams(
    temperature=0.7,
    top_p=0.9,
    max_tokens=512,
    stop=["<|im_end|>"]
)

outputs = llm.generate(prompts, sampling_params)

for output in outputs:
    print(f"Prompt: {output.prompt[:50]}...")
    print(f"Output: {output.outputs[0].text}")
    print("---")
\`\`\`

### 聊天模板

\`\`\`python
from vllm import LLM, SamplingParams
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("Qwen/Qwen2-7B-Instruct")
llm = LLM(model="Qwen/Qwen2-7B-Instruct")

def chat(messages):
    # 应用聊天模板
    prompt = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True
    )
    
    outputs = llm.generate([prompt], SamplingParams(
        max_tokens=512,
        temperature=0.7,
        stop=["<|im_end|>"]
    ))
    
    return outputs[0].outputs[0].text

# 使用
response = chat([
    {"role": "system", "content": "你是一个有帮助的助手"},
    {"role": "user", "content": "你好"}
])
\`\`\`

### 流式API服务

\`\`\`python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from vllm import AsyncLLMEngine, SamplingParams
from vllm.engine.arg_utils import AsyncEngineArgs
import asyncio

app = FastAPI()

engine_args = AsyncEngineArgs(
    model="Qwen/Qwen2-7B-Instruct",
    tensor_parallel_size=1,
)
engine = AsyncLLMEngine.from_engine_args(engine_args)

@app.post("/chat/stream")
async def stream_chat(request: dict):
    async def generate():
        sampling_params = SamplingParams(
            temperature=0.7,
            max_tokens=512,
        )
        
        request_id = str(uuid.uuid4())
        results_generator = engine.generate(
            request['prompt'],
            sampling_params,
            request_id
        )
        
        async for request_output in results_generator:
            text = request_output.outputs[0].text
            yield text
    
    return StreamingResponse(generate(), media_type="text/plain")
\`\`\`

## SGLang应用实践

SGLang的独特之处在于它的结构化生成能力。假设你需要模型严格按照JSON格式输出，或者你想在一次调用中完成多步骤的复杂任务——SGLang就是为这类场景而生的。

### 服务启动

\`\`\`bash
python -m sglang.launch_server \\
    --model-path Qwen/Qwen2-7B-Instruct \\
    --port 30000 \\
    --tp 2
\`\`\`

### 结构化生成

\`\`\`python
import sglang as sgl

@sgl.function
def extract_info(s, text):
    s += sgl.system("你是一个信息提取助手")
    s += sgl.user(f"从以下文本中提取人名、地点和时间：\\n{text}")
    s += sgl.assistant(sgl.gen(
        "result",
        max_tokens=200,
        regex=r'\\{.*\\}'  # 确保输出JSON格式
    ))

# 使用
runtime = sgl.Runtime("http://localhost:30000")
sgl.set_default_backend(runtime)

result = extract_info.run(text="张三于2024年1月在北京参加了会议")
print(result["result"])
\`\`\`

### 多轮对话管理

\`\`\`python
@sgl.function
def multi_turn_chat(s, conversation):
    s += sgl.system("你是一个有帮助的助手")
    
    for turn in conversation:
        if turn["role"] == "user":
            s += sgl.user(turn["content"])
        elif turn["role"] == "assistant":
            s += sgl.assistant(turn["content"])
    
    # 生成新回复
    s += sgl.assistant(sgl.gen("response", max_tokens=512))

# 多轮对话
conversation = [
    {"role": "user", "content": "你好"},
    {"role": "assistant", "content": "你好！有什么可以帮助你的吗？"},
    {"role": "user", "content": "介绍一下Python"}
]

result = multi_turn_chat.run(conversation=conversation)
\`\`\`

### 并行生成

\`\`\`python
@sgl.function
def parallel_generation(s, question):
    s += sgl.user(question)
    
    # 并行生成多个答案
    fork = s.fork(3)
    answers = []
    for f in fork:
        f += sgl.assistant(sgl.gen("answer", max_tokens=200, temperature=0.8))
        answers.append(f["answer"])
    
    return answers

# 使用Self-Consistency
answers = parallel_generation.run(question="1+1等于几？")
# 取最常见的答案
from collections import Counter
final = Counter(answers).most_common(1)[0][0]
\`\`\`

## 生产部署配置

从实验室原型到生产环境，需要考虑的事情会多很多：需要多少GPU？如何应对服务崩溃？怎么均衡多个服务实例的负载？这些都是生产环境必须面对的问题。

### 资源规划

在实际项目中，资源规划往往是第一步。你需要回答两个核心问题：模型能不能装得下（显存够不够），以及速度够不够快（吞吐量够不够）。下面的函数提供了一个简化的估算方法：

\`\`\`python
def plan_resources(model_params_b, expected_qps, avg_output_tokens):
    """规划GPU资源"""
    
    # 单卡推理能力估算（A100 80GB）
    tokens_per_second_per_gpu = 50  # 保守估计
    
    # 计算需要的GPU数量
    total_tokens_per_second = expected_qps * avg_output_tokens
    gpus_for_throughput = total_tokens_per_second / tokens_per_second_per_gpu
    
    # 计算模型需要的GPU数量（FP16）
    model_memory_gb = model_params_b * 2
    gpus_for_memory = model_memory_gb / 70  # 留余量
    
    gpus_needed = max(gpus_for_throughput, gpus_for_memory)
    
    return {
        'min_gpus': int(np.ceil(gpus_needed)),
        'recommended_gpus': int(np.ceil(gpus_needed * 1.2)),  # 20%余量
    }
\`\`\`

### 高可用部署

\`\`\`yaml
# docker-compose.yml
version: '3.8'
services:
  vllm-1:
    image: vllm/vllm-openai:latest
    command: >
      --model /models/qwen
      --tensor-parallel-size 2
      --port 8000
    deploy:
      resources:
        reservations:
          devices:
            - capabilities: [gpu]
              count: 2
    volumes:
      - ./models:/models
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
  
  vllm-2:
    # 同上，用于负载均衡
    
  nginx:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - vllm-1
      - vllm-2
\`\`\`

### Nginx负载均衡

\`\`\`nginx
upstream vllm_backend {
    least_conn;
    server vllm-1:8000 weight=1;
    server vllm-2:8000 weight=1;
}

server {
    listen 80;
    
    location /v1 {
        proxy_pass http://vllm_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_buffering off;  # 支持流式
    }
}
\`\`\`

## 性能监控

生产环境中的模型服务就像一台正在运转的机器——你需要随时知道它的运行状态：每个请求花了多长时间、生成了多少token、队列里还有多少请求在等待。没有监控就像盲人骑马，出了问题都不知道。

### 关键指标

\`\`\`python
import prometheus_client as prom

# 定义指标
REQUEST_LATENCY = prom.Histogram(
    'llm_request_latency_seconds',
    'Request latency',
    buckets=[0.1, 0.5, 1, 2, 5, 10, 30]
)

TOKENS_GENERATED = prom.Counter(
    'llm_tokens_generated_total',
    'Total tokens generated'
)

QUEUE_SIZE = prom.Gauge(
    'llm_queue_size',
    'Current queue size'
)

# 在请求处理中记录
@REQUEST_LATENCY.time()
async def handle_request(request):
    response = await generate(request)
    TOKENS_GENERATED.inc(response.token_count)
    return response
\`\`\`

### 日志记录

\`\`\`python
import logging
import json

class StructuredLogger:
    def __init__(self, name):
        self.logger = logging.getLogger(name)
    
    def log_request(self, request_id, prompt_tokens, output_tokens, latency):
        self.logger.info(json.dumps({
            'type': 'request',
            'request_id': request_id,
            'prompt_tokens': prompt_tokens,
            'output_tokens': output_tokens,
            'latency_ms': latency * 1000,
            'tokens_per_second': output_tokens / latency
        }))

logger = StructuredLogger('vllm')
\`\`\`

## 成本优化

在生产环境中，GPU费用往往是最大的开支。两个常用的省钱策略是批处理和缓存：批处理就像快递公司攻件——不是每件单独送，而是攒够一批后一趟送完，效率更高；缓存则是把常见问题的答案记住，下次再问直接返回，不用重新计算。

### 批处理策略

\`\`\`python
import asyncio
from collections import deque

class RequestBatcher:
    def __init__(self, model, max_batch_size=32, max_wait_time=0.1):
        self.model = model
        self.max_batch_size = max_batch_size
        self.max_wait_time = max_wait_time
        self.queue = deque()
        self.lock = asyncio.Lock()
    
    async def add_request(self, prompt):
        future = asyncio.Future()
        async with self.lock:
            self.queue.append((prompt, future))
            
            if len(self.queue) >= self.max_batch_size:
                await self._process_batch()
        
        # 设置超时处理
        asyncio.create_task(self._timeout_handler())
        
        return await future
    
    async def _process_batch(self):
        batch = []
        futures = []
        while self.queue and len(batch) < self.max_batch_size:
            prompt, future = self.queue.popleft()
            batch.append(prompt)
            futures.append(future)
        
        if batch:
            results = self.model.generate(batch)
            for future, result in zip(futures, results):
                future.set_result(result)
\`\`\`

### 缓存策略

\`\`\`python
from functools import lru_cache
import hashlib

class PromptCache:
    def __init__(self, max_size=10000):
        self.cache = {}
        self.max_size = max_size
    
    def get(self, prompt, params):
        key = self._make_key(prompt, params)
        return self.cache.get(key)
    
    def set(self, prompt, params, response):
        if len(self.cache) >= self.max_size:
            # 简单的LRU策略
            oldest = next(iter(self.cache))
            del self.cache[oldest]
        
        key = self._make_key(prompt, params)
        self.cache[key] = response
    
    def _make_key(self, prompt, params):
        content = f"{prompt}:{json.dumps(params, sort_keys=True)}"
        return hashlib.md5(content.encode()).hexdigest()

cache = PromptCache()

async def cached_generate(prompt, params):
    cached = cache.get(prompt, params)
    if cached:
        return cached
    
    response = await model.generate(prompt, **params)
    cache.set(prompt, params, response)
    return response
\`\`\`

高效的推理部署是大模型应用的基础。通过合理的资源规划、性能优化和运维监控，可以在满足业务需求的同时控制成本。vLLM和SGLang提供了强大的底层能力，将这些能力与良好的工程实践相结合，才能构建出稳定、高效的生产系统。建议初学者先用vLLM单机部署一个小模型（如Qwen-1.8B），亲身体验推理服务的各个环节，再逐步探索更复杂的部署方案。
`
    },
    {
      id: "adv-11-08-swift-gradio",
      title: "11.8 实践：使用SWIFT进行模型训练并完成Gradio应用",
      file: "大模型教程/11-模型训练推理技术/07-实践SWIFT训练与Gradio.md",
      difficulty: "中级-高级",
      duration: "1h",
      week: 0,
      phase: 0,
      keywords: ["实践：使用SWIFT进行模型训练并完成Gradio应用", "SWIFT", "Gradio"],
      content: `# 实践：使用SWIFT进行模型训练并完成Gradio应用

本节通过一个完整的实践项目，演示从模型微调到应用部署的全流程。

假设你是一个团队的开发者，老板说："我们需要一个能回答编程问题的AI助手，下周给客户演示。"你该怎么做？最快的路径就是：用SWIFT微调一个基座模型，再用Gradio包一层美观的交互界面。本节就手把手带你走完这个流程。

## 项目目标

下图展示了使用SWIFT训练并部署应用的完整流程：

\`\`\`mermaid
graph LR
    A[数据准备] --> B[配置训练参数]
    B --> C[SWIFT LoRA训练]
    C --> D[模型测试]
    D -->|不满意| A
    D -->|满意| E[Gradio应用开发]
    E --> F[Docker打包部署]
\`\`\`

构建一个专业的代码助手，能够：
- 回答编程相关问题
- 解释代码逻辑
- 生成代码片段

## 环境准备

### 安装依赖

\`\`\`bash
# 安装SWIFT
pip install ms-swift

# 安装Gradio
pip install gradio

# 验证安装
swift sft --help
\`\`\`

### 硬件要求

| 模型规模 | 最低显存 | 推荐显存 |
|---------|---------|---------|
| 1.5B | 8GB | 16GB |
| 7B (LoRA) | 16GB | 24GB |
| 7B (Full) | 60GB | 80GB |

## 数据准备

"巧妇难为无米之炊"——数据是微调的基础。你需要准备一批与目标任务相关的问答对。对于代码助手，就是"用户问编程问题 + 高质量回答"的配对。数据质量直接决定微调效果，与其数量多但质量差，不如少而精。

### 数据格式

准备代码问答数据，采用SWIFT支持的格式：

\`\`\`json
// data/code_qa.json
[
    {
        "query": "如何在Python中读取JSON文件？",
        "response": "在Python中读取JSON文件可以使用内置的json模块：\\n\\n\`\`\`python\\nimport json\\n\\nwith open('data.json', 'r', encoding='utf-8') as f:\\n    data = json.load(f)\\n\`\`\`\\n\\n这里使用\`with\`语句确保文件正确关闭，\`encoding='utf-8'\`处理中文字符。"
    },
    {
        "query": "解释一下Python的装饰器",
        "response": "装饰器是Python的一种高级特性，用于在不修改原函数代码的情况下扩展其功能。\\n\\n基本语法：\\n\`\`\`python\\ndef my_decorator(func):\\n    def wrapper(*args, **kwargs):\\n        print('函数调用前')\\n        result = func(*args, **kwargs)\\n        print('函数调用后')\\n        return result\\n    return wrapper\\n\\n@my_decorator\\ndef say_hello():\\n    print('Hello!')\\n\`\`\`\\n\\n\`@my_decorator\`等价于\`say_hello = my_decorator(say_hello)\`。"
    }
]
\`\`\`

### 数据收集建议

\`\`\`python
# 从现有代码库提取问答对
import ast
import json

def extract_qa_from_code(code_file):
    """从带docstring的代码中提取问答对"""
    with open(code_file, 'r') as f:
        tree = ast.parse(f.read())
    
    qa_pairs = []
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            if ast.get_docstring(node):
                qa_pairs.append({
                    'query': f"解释函数 {node.name} 的功能",
                    'response': ast.get_docstring(node)
                })
    
    return qa_pairs
\`\`\`

## 模型微调

现在进入核心环节。SWIFT支持多种训练方式，对于我们这个场景，LoRA微调是最实用的选择——它只更新很小一部分参数，训练速度快、显存占用少，但效果往往已经足够好。

### 配置文件

\`\`\`yaml
# config/sft_config.yaml
model_type: qwen2-1_5b-instruct
dataset: ['/path/to/data/code_qa.json']

# 训练参数
train_type: lora
lora_rank: 8
lora_alpha: 32
lora_dropout: 0.05

# 训练配置
batch_size: 4
gradient_accumulation_steps: 4
num_train_epochs: 3
learning_rate: 1e-4
warmup_ratio: 0.1

# 输出
output_dir: ./output/code_assistant
logging_steps: 10
save_strategy: epoch
\`\`\`

### 启动训练

\`\`\`bash
# 命令行训练
swift sft \\
    --model_type qwen2-1_5b-instruct \\
    --dataset /path/to/data/code_qa.json \\
    --train_type lora \\
    --lora_rank 8 \\
    --output_dir ./output/code_assistant \\
    --num_train_epochs 3 \\
    --batch_size 4 \\
    --learning_rate 1e-4
\`\`\`

### Python API训练

\`\`\`python
from swift.llm import sft_main, SftArguments

args = SftArguments(
    model_type='qwen2-1_5b-instruct',
    dataset=['/path/to/data/code_qa.json'],
    train_type='lora',
    lora_rank=8,
    output_dir='./output/code_assistant',
    num_train_epochs=3,
    batch_size=4,
    learning_rate=1e-4,
)

output = sft_main(args)
print(f"模型保存到: {output['best_model_checkpoint']}")
\`\`\`

### 训练监控

\`\`\`python
# 使用TensorBoard监控
# tensorboard --logdir ./output/code_assistant/runs

# 或在训练时打印关键指标
"""
训练日志示例：
Step 100/1000 | Loss: 1.234 | LR: 9.5e-5 | Time: 2.3s/step
Step 200/1000 | Loss: 0.856 | LR: 9.0e-5 | Time: 2.2s/step
...
"""
\`\`\`

## 模型测试

训练完成后，别急着做应用——先测试一下模型的实际效果。这就像厨师烧好菜后自己先尝一口，确认味道没问题再端给客人。

### 命令行测试

\`\`\`bash
swift infer \\
    --model_type qwen2-1_5b-instruct \\
    --adapters ./output/code_assistant/checkpoint-xxx
\`\`\`

### Python测试

\`\`\`python
from swift.llm import InferArguments, infer_main

args = InferArguments(
    model_type='qwen2-1_5b-instruct',
    adapters='./output/code_assistant/checkpoint-xxx',
)

# 交互式测试
infer_main(args)
\`\`\`

### 批量评估

\`\`\`python
from swift.llm import get_model_tokenizer

model, tokenizer = get_model_tokenizer(
    model_type='qwen2-1_5b-instruct',
    adapters='./output/code_assistant/checkpoint-xxx'
)

test_cases = [
    "如何用Python实现快速排序？",
    "解释Python中的列表推导式",
    "什么是闭包？"
]

for query in test_cases:
    response = model.generate(
        tokenizer.apply_chat_template(
            [{"role": "user", "content": query}],
            tokenize=False,
            add_generation_prompt=True
        )
    )
    print(f"Q: {query}")
    print(f"A: {response}\\n")
\`\`\`

## Gradio应用开发

模型测试通过后，就可以把它包装成一个漂亮的交互应用了。想象你要把一份精心烹制的菜装盘上桌——味道很重要，但卖相也很重要。Gradio就是帮你做"装盘"的工具。

### 基础聊天界面

\`\`\`python
import gradio as gr
from swift.llm import get_model_tokenizer

# 加载模型
model, tokenizer = get_model_tokenizer(
    model_type='qwen2-1_5b-instruct',
    adapters='./output/code_assistant/checkpoint-xxx'
)

def chat(message, history):
    # 构建对话历史
    messages = []
    for h in history:
        messages.append({"role": "user", "content": h[0]})
        messages.append({"role": "assistant", "content": h[1]})
    messages.append({"role": "user", "content": message})
    
    # 生成回复
    prompt = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True
    )
    
    response = model.generate(prompt, max_new_tokens=512)
    return response

# 创建界面
demo = gr.ChatInterface(
    fn=chat,
    title="代码助手",
    description="基于微调模型的编程问答助手",
    examples=[
        "如何在Python中实现单例模式？",
        "解释一下Git的工作原理",
        "写一个二分查找的Python实现"
    ]
)

demo.launch(share=True)
\`\`\`

### 增强版界面

\`\`\`python
import gradio as gr

def create_app(model, tokenizer):
    def chat(message, history, system_prompt, temperature, max_tokens):
        messages = [{"role": "system", "content": system_prompt}]
        for h in history:
            messages.append({"role": "user", "content": h[0]})
            messages.append({"role": "assistant", "content": h[1]})
        messages.append({"role": "user", "content": message})
        
        prompt = tokenizer.apply_chat_template(
            messages, tokenize=False, add_generation_prompt=True
        )
        
        response = model.generate(
            prompt,
            max_new_tokens=max_tokens,
            temperature=temperature,
            do_sample=temperature > 0
        )
        
        return response
    
    with gr.Blocks(title="代码助手 Pro") as demo:
        gr.Markdown("# 代码助手 Pro")
        gr.Markdown("基于SWIFT微调的专业编程助手")
        
        with gr.Row():
            with gr.Column(scale=3):
                chatbot = gr.Chatbot(height=500)
                msg = gr.Textbox(
                    label="输入问题",
                    placeholder="请输入你的编程问题...",
                    lines=3
                )
                with gr.Row():
                    submit = gr.Button("发送", variant="primary")
                    clear = gr.Button("清空对话")
            
            with gr.Column(scale=1):
                gr.Markdown("### 设置")
                system_prompt = gr.Textbox(
                    label="系统提示",
                    value="你是一个专业的编程助手，擅长回答各种编程问题，解释代码逻辑，并提供高质量的代码示例。",
                    lines=4
                )
                temperature = gr.Slider(
                    0, 1, value=0.7,
                    label="Temperature",
                    info="较低值更确定，较高值更创意"
                )
                max_tokens = gr.Slider(
                    100, 2000, value=512,
                    label="最大生成长度"
                )
        
        def respond(message, history, sys, temp, max_tok):
            response = chat(message, history, sys, temp, max_tok)
            history.append((message, response))
            return "", history
        
        submit.click(
            respond,
            [msg, chatbot, system_prompt, temperature, max_tokens],
            [msg, chatbot]
        )
        msg.submit(
            respond,
            [msg, chatbot, system_prompt, temperature, max_tokens],
            [msg, chatbot]
        )
        clear.click(lambda: [], None, chatbot)
        
        gr.Markdown("### 示例问题")
        gr.Examples(
            [
                "如何用Python实现LRU缓存？",
                "解释一下async/await的工作原理",
                "写一个线程安全的单例模式"
            ],
            msg
        )
    
    return demo

# 启动应用
demo = create_app(model, tokenizer)
demo.launch(server_name="0.0.0.0", server_port=7860)
\`\`\`

### 流式输出

在实际体验中，流式输出是很重要的体验优化。想象你跟一个人聊天，如果对方每次都得想半天然后一口气把一大段话说完，体验肯定不好。流式输出让模型像人说话一样一个字一个字地"蹦"出来，用户体验好得多：

\`\`\`python
from transformers import TextIteratorStreamer
from threading import Thread

def stream_chat(message, history, system_prompt):
    messages = [{"role": "system", "content": system_prompt}]
    for h in history:
        messages.append({"role": "user", "content": h[0]})
        messages.append({"role": "assistant", "content": h[1]})
    messages.append({"role": "user", "content": message})
    
    prompt = tokenizer.apply_chat_template(
        messages, tokenize=False, add_generation_prompt=True
    )
    
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    
    streamer = TextIteratorStreamer(
        tokenizer, skip_prompt=True, skip_special_tokens=True
    )
    
    generation_kwargs = dict(
        **inputs,
        streamer=streamer,
        max_new_tokens=512,
        do_sample=True,
        temperature=0.7
    )
    
    thread = Thread(target=model.generate, kwargs=generation_kwargs)
    thread.start()
    
    response = ""
    for text in streamer:
        response += text
        yield response
\`\`\`

## 部署上线

应用开发完成后，最后一步是把它部署到服务器上，让其他人也能访问。Docker是最常用的打包方式——把你的代码、模型和所有依赖打包成一个“集装箱”，拿到任何服务器上都能直接跑起来。

### Docker打包

\`\`\`dockerfile
FROM python:3.10-slim

WORKDIR /app

# 安装依赖
COPY requirements.txt .
RUN pip install -r requirements.txt

# 复制模型和代码
COPY model/ ./model/
COPY app.py .

EXPOSE 7860

CMD ["python", "app.py"]
\`\`\`

### 启动脚本

\`\`\`bash
#!/bin/bash
# run.sh

export CUDA_VISIBLE_DEVICES=0
python app.py --model_path ./model --port 7860
\`\`\`

通过这个完整的实践，读者可以掌握从数据准备、模型微调到应用部署的全流程。建议先用一个小模型（如Qwen2-1.5B）和少量数据跑通整个流程，确认每个环节都没问题后，再逐步扩大数据规模和模型规模。这个流程可以根据具体需求进行调整和扩展。
`
    },
    {
      id: "adv-11-09-custom-training",
      title: "11.9 实践：自定义训练过程与模型结构",
      file: "大模型教程/11-模型训练推理技术/08-实践自定义训练.md",
      difficulty: "中级-高级",
      duration: "1h",
      week: 0,
      phase: 0,
      keywords: ["实践：自定义训练过程与模型结构", "SWIFT", "PyTorch", "DataLoader", "AutoModelForCausalLM"],
      content: `# 实践：自定义训练过程与模型结构

在前面的章节中，我们介绍了如何使用SWIFT等框架进行标准的模型微调。然而，在实际研究和工程中，往往需要对训练过程和模型结构进行深度定制。

如果说SWIFT像是一台“全自动洗衣机”——把衣服丢进去按个按钮就行，那么本节教的是“手洗”的技艺。为什么要学手洗？因为有些“衣服”（任务）需要特别护理，洗衣机处理不了。当你需要自定义损失函数、修改模型结构或实现独特的训练策略时，就需要掌握从零构建训练流程的能力。

下图展示了自定义训练的完整流程：

\`\`\`mermaid
graph TD
    A[数据加载与预处理] --> B[模型初始化]
    B --> C[配置优化器与调度器]
    C --> D[训练循环]
    D --> D1[前向传播]
    D1 --> D2[损失计算]
    D2 --> D3[反向传播]
    D3 --> D4[梯度裁剪与参数更新]
    D4 -->|下一个batch| D1
    D4 -->|epoch结束| E[保存检查点]
    E --> F[评估与部署]
\`\`\`

## 自定义训练循环

### 基础训练框架

标准的PyTorch训练循环包含数据加载、前向传播、损失计算、反向传播和参数更新五个核心步骤：

\`\`\`python
import torch
from torch.utils.data import DataLoader
from transformers import AutoModelForCausalLM, AutoTokenizer
from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingLR

class CustomTrainer:
    def __init__(self, model_name, learning_rate=2e-5, max_epochs=3):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = AutoModelForCausalLM.from_pretrained(model_name)
        self.model.to(self.device)
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        
        # 优化器配置
        self.optimizer = AdamW(
            self.model.parameters(),
            lr=learning_rate,
            betas=(0.9, 0.95),
            weight_decay=0.1
        )
        self.max_epochs = max_epochs
        
    def train_epoch(self, dataloader):
        self.model.train()
        total_loss = 0
        
        for batch_idx, batch in enumerate(dataloader):
            # 数据移动到设备
            input_ids = batch['input_ids'].to(self.device)
            attention_mask = batch['attention_mask'].to(self.device)
            labels = batch['labels'].to(self.device)
            
            # 前向传播
            outputs = self.model(
                input_ids=input_ids,
                attention_mask=attention_mask,
                labels=labels
            )
            loss = outputs.loss
            
            # 反向传播
            self.optimizer.zero_grad()
            loss.backward()
            
            # 梯度裁剪
            torch.nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)
            
            # 参数更新
            self.optimizer.step()
            
            total_loss += loss.item()
            
            if batch_idx % 100 == 0:
                print(f"Batch {batch_idx}, Loss: {loss.item():.4f}")
                
        return total_loss / len(dataloader)
\`\`\`

### 混合精度训练

混合精度训练通过在计算中使用FP16或BF16格式，可以显著降低显存占用并加速训练：

\`\`\`python
from torch.cuda.amp import autocast, GradScaler

class MixedPrecisionTrainer(CustomTrainer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.scaler = GradScaler()
        
    def train_epoch(self, dataloader):
        self.model.train()
        total_loss = 0
        
        for batch in dataloader:
            input_ids = batch['input_ids'].to(self.device)
            attention_mask = batch['attention_mask'].to(self.device)
            labels = batch['labels'].to(self.device)
            
            # 使用autocast进行混合精度前向传播
            with autocast(dtype=torch.bfloat16):
                outputs = self.model(
                    input_ids=input_ids,
                    attention_mask=attention_mask,
                    labels=labels
                )
                loss = outputs.loss
            
            # 缩放损失并反向传播
            self.optimizer.zero_grad()
            self.scaler.scale(loss).backward()
            
            # 梯度裁剪（需要先unscale）
            self.scaler.unscale_(self.optimizer)
            torch.nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)
            
            # 更新参数
            self.scaler.step(self.optimizer)
            self.scaler.update()
            
            total_loss += loss.item()
            
        return total_loss / len(dataloader)
\`\`\`

### 梯度累积

当GPU显存不足以容纳大批次时，梯度累积是一种有效的替代方案。假设你想用batch size=32训练，但显存只够放下8个样本。梯度累积的思路是：连续做4次小批次的前向+反向，把梯度放起来，然后一次性更新参数——效果跟直接用batch size=32几乎一样：

\`\`\`python
def train_with_gradient_accumulation(
    model, dataloader, optimizer, accumulation_steps=4
):
    model.train()
    optimizer.zero_grad()
    
    for batch_idx, batch in enumerate(dataloader):
        outputs = model(**batch)
        loss = outputs.loss / accumulation_steps  # 缩放损失
        loss.backward()
        
        if (batch_idx + 1) % accumulation_steps == 0:
            optimizer.step()
            optimizer.zero_grad()
            
    # 处理最后不足accumulation_steps的批次
    if (batch_idx + 1) % accumulation_steps != 0:
        optimizer.step()
        optimizer.zero_grad()
\`\`\`

实际有效批次大小为：

$$
\\text{effective\\_batch\\_size} = \\text{micro\\_batch\\_size} \\times \\text{accumulation\\_steps} \\times \\text{num\\_gpus}
$$

其中：$\\text{micro\\_batch\\_size}$ 为单次前向传播的小批次大小，$\\text{accumulation\\_steps}$ 为梯度累积步数（即累积多少个小批次的梯度后再执行一次参数更新），$\\text{num\\_gpus}$ 为参与训练的 GPU 数量。该公式说明，通过梯度累积和多卡并行，可以在显存有限的情况下等效地增大批次大小。

## 自定义数据集与数据处理

训练数据的质量和处理方式直接影响模型效果。在自定义训练中，你需要自己实现数据加载和预处理逻辑。这就像自己做饭——选材、洗菜、切菜都得自己来，但也因此能完全控制每个环节。

### 构建对话数据集

\`\`\`python
from torch.utils.data import Dataset
import json

class ChatDataset(Dataset):
    def __init__(self, data_path, tokenizer, max_length=2048):
        self.tokenizer = tokenizer
        self.max_length = max_length
        self.data = self._load_data(data_path)
        
    def _load_data(self, path):
        with open(path, 'r', encoding='utf-8') as f:
            return [json.loads(line) for line in f]
            
    def _format_conversation(self, item):
        """将对话格式化为模型输入"""
        messages = item.get('messages', [])
        formatted_text = ""
        
        for msg in messages:
            role = msg['role']
            content = msg['content']
            if role == 'system':
                formatted_text += f"<|system|>\\n{content}\\n"
            elif role == 'user':
                formatted_text += f"<|user|>\\n{content}\\n"
            elif role == 'assistant':
                formatted_text += f"<|assistant|>\\n{content}\\n"
                
        return formatted_text
        
    def __len__(self):
        return len(self.data)
        
    def __getitem__(self, idx):
        item = self.data[idx]
        text = self._format_conversation(item)
        
        encoding = self.tokenizer(
            text,
            truncation=True,
            max_length=self.max_length,
            padding='max_length',
            return_tensors='pt'
        )
        
        # 创建labels，忽略padding部分
        labels = encoding['input_ids'].clone()
        labels[labels == self.tokenizer.pad_token_id] = -100
        
        return {
            'input_ids': encoding['input_ids'].squeeze(),
            'attention_mask': encoding['attention_mask'].squeeze(),
            'labels': labels.squeeze()
        }
\`\`\`

### 动态数据增强

\`\`\`python
import random

class AugmentedChatDataset(ChatDataset):
    def __init__(self, *args, augment_prob=0.3, **kwargs):
        super().__init__(*args, **kwargs)
        self.augment_prob = augment_prob
        
    def _augment_text(self, text):
        """简单的文本增强策略"""
        if random.random() > self.augment_prob:
            return text
            
        augmentations = [
            self._synonym_replacement,
            self._random_insertion,
            self._random_swap
        ]
        
        aug_func = random.choice(augmentations)
        return aug_func(text)
        
    def _synonym_replacement(self, text):
        # 同义词替换逻辑
        replacements = {
            '好的': ['没问题', '可以', '行'],
            '请问': ['想请教', '请教下', '问一下'],
        }
        for word, synonyms in replacements.items():
            if word in text:
                text = text.replace(word, random.choice(synonyms), 1)
        return text
\`\`\`

## 自定义模型结构

这是自定义训练中最有趣也最有挑战性的部分。想象你在改装一辆汽车——不改变整体框架，但可以换发动机、加涡轮、改悬挂。修改模型结构也是类似的思路：在保持整体架构不变的情况下，替换或增加特定的组件。

### 添加自定义注意力层

在某些场景下，需要对Transformer的注意力机制进行修改。以下示例展示如何添加线性注意力变体：

\`\`\`python
import torch.nn as nn
import math

class LinearAttention(nn.Module):
    """线性注意力机制，复杂度O(n)"""
    
    def __init__(self, d_model, n_heads, feature_map='elu'):
        super().__init__()
        self.d_model = d_model
        self.n_heads = n_heads
        self.head_dim = d_model // n_heads
        
        self.q_proj = nn.Linear(d_model, d_model)
        self.k_proj = nn.Linear(d_model, d_model)
        self.v_proj = nn.Linear(d_model, d_model)
        self.o_proj = nn.Linear(d_model, d_model)
        
        self.feature_map = feature_map
        
    def _feature_map(self, x):
        """特征映射函数"""
        if self.feature_map == 'elu':
            return torch.nn.functional.elu(x) + 1
        elif self.feature_map == 'relu':
            return torch.nn.functional.relu(x)
        else:
            return x
            
    def forward(self, x, attention_mask=None):
        batch_size, seq_len, _ = x.shape
        
        # 投影
        q = self.q_proj(x).view(batch_size, seq_len, self.n_heads, self.head_dim)
        k = self.k_proj(x).view(batch_size, seq_len, self.n_heads, self.head_dim)
        v = self.v_proj(x).view(batch_size, seq_len, self.n_heads, self.head_dim)
        
        # 应用特征映射
        q = self._feature_map(q)
        k = self._feature_map(k)
        
        # 线性注意力计算: (Q @ K^T) @ V -> Q @ (K^T @ V)
        # 形状变换: [B, N, H, D] -> [B, H, N, D]
        q = q.transpose(1, 2)
        k = k.transpose(1, 2)
        v = v.transpose(1, 2)
        
        # K^T @ V: [B, H, D, N] @ [B, H, N, D] -> [B, H, D, D]
        kv = torch.matmul(k.transpose(-2, -1), v)
        
        # Q @ (K^T @ V): [B, H, N, D] @ [B, H, D, D] -> [B, H, N, D]
        output = torch.matmul(q, kv)
        
        # 归一化
        k_sum = k.sum(dim=2, keepdim=True)
        normalizer = torch.matmul(q, k_sum.transpose(-2, -1)) + 1e-6
        output = output / normalizer
        
        # 重塑输出
        output = output.transpose(1, 2).contiguous().view(batch_size, seq_len, self.d_model)
        
        return self.o_proj(output)
\`\`\`

### 替换模型中的注意力层

\`\`\`python
def replace_attention_layers(model, new_attention_class):
    """递归替换模型中的注意力层"""
    for name, module in model.named_children():
        if 'attention' in name.lower() or 'attn' in name.lower():
            # 获取原始配置
            d_model = module.hidden_size if hasattr(module, 'hidden_size') else module.embed_dim
            n_heads = module.num_heads if hasattr(module, 'num_heads') else module.num_attention_heads
            
            # 创建新的注意力层
            new_attention = new_attention_class(d_model, n_heads)
            setattr(model, name, new_attention)
        else:
            replace_attention_layers(module, new_attention_class)
            
    return model
\`\`\`

### 添加适配器模块

LoRA之外，还可以设计其他形式的适配器：

\`\`\`python
class Adapter(nn.Module):
    """瓶颈适配器模块"""
    
    def __init__(self, input_dim, bottleneck_dim, activation='gelu'):
        super().__init__()
        self.down_proj = nn.Linear(input_dim, bottleneck_dim)
        self.up_proj = nn.Linear(bottleneck_dim, input_dim)
        
        if activation == 'gelu':
            self.activation = nn.GELU()
        elif activation == 'relu':
            self.activation = nn.ReLU()
        else:
            self.activation = nn.SiLU()
            
        # 初始化为近似恒等映射
        nn.init.zeros_(self.up_proj.weight)
        nn.init.zeros_(self.up_proj.bias)
        
    def forward(self, x):
        residual = x
        x = self.down_proj(x)
        x = self.activation(x)
        x = self.up_proj(x)
        return residual + x


class AdapterTransformerLayer(nn.Module):
    """带适配器的Transformer层"""
    
    def __init__(self, base_layer, adapter_dim=64):
        super().__init__()
        self.base_layer = base_layer
        hidden_size = base_layer.hidden_size
        
        # 在注意力后和FFN后各添加一个适配器
        self.attn_adapter = Adapter(hidden_size, adapter_dim)
        self.ffn_adapter = Adapter(hidden_size, adapter_dim)
        
    def forward(self, hidden_states, **kwargs):
        # 原始注意力计算
        attn_output = self.base_layer.self_attn(hidden_states, **kwargs)
        hidden_states = hidden_states + attn_output
        hidden_states = self.attn_adapter(hidden_states)  # 适配器
        
        # 原始FFN计算
        ffn_output = self.base_layer.mlp(hidden_states)
        hidden_states = hidden_states + ffn_output
        hidden_states = self.ffn_adapter(hidden_states)  # 适配器
        
        return hidden_states
\`\`\`

## 自定义损失函数

损失函数是训练的"指南针"——它告诉模型“你现在差得有多远”。不同的任务可能需要不同的指南针。比如标签平滑可以防止模型"过于自信"，对比学习损失则可以让模型学会区分相似和不相似的文本。

### 标签平滑交叉熵

标签平滑可以防止模型过于自信，提高泛化能力。换个角度看，标准交叉熵损失就像老师只允许"严格的标准答案"，而标签平滑则允许"接近正确的答案也给部分分"——这让模型不会因为过度记住训练数据而失去泛化能力：

\`\`\`python
class LabelSmoothingLoss(nn.Module):
    def __init__(self, vocab_size, smoothing=0.1, ignore_index=-100):
        super().__init__()
        self.vocab_size = vocab_size
        self.smoothing = smoothing
        self.ignore_index = ignore_index
        self.confidence = 1.0 - smoothing
        
    def forward(self, logits, labels):
        # logits: [B, S, V], labels: [B, S]
        logits = logits.view(-1, self.vocab_size)
        labels = labels.view(-1)
        
        # 创建平滑标签分布
        with torch.no_grad():
            smooth_labels = torch.full_like(logits, self.smoothing / (self.vocab_size - 1))
            smooth_labels.scatter_(1, labels.unsqueeze(1), self.confidence)
            
            # 处理ignore_index
            mask = labels == self.ignore_index
            smooth_labels[mask] = 0
            
        # 计算KL散度
        log_probs = torch.nn.functional.log_softmax(logits, dim=-1)
        loss = -torch.sum(smooth_labels * log_probs, dim=-1)
        
        # 仅计算有效位置的平均损失
        valid_count = (~mask).sum()
        return loss[~mask].sum() / valid_count
\`\`\`

### 对比学习损失

对于需要学习文本表示的场景，可以使用对比学习损失：

\`\`\`python
class ContrastiveLoss(nn.Module):
    """InfoNCE对比学习损失"""
    
    def __init__(self, temperature=0.07):
        super().__init__()
        self.temperature = temperature
        
    def forward(self, embeddings, labels=None):
        """
        embeddings: [B, D] 归一化后的嵌入向量
        labels: [B] 可选，相同标签视为正例
        """
        batch_size = embeddings.shape[0]
        
        # 计算相似度矩阵
        similarity = torch.matmul(embeddings, embeddings.T) / self.temperature
        
        # 构建正负例掩码
        if labels is not None:
            mask = labels.unsqueeze(0) == labels.unsqueeze(1)
        else:
            # 假设连续两个样本为正例对
            mask = torch.eye(batch_size, dtype=torch.bool, device=embeddings.device)
            mask = mask | torch.roll(mask, 1, dims=0)
            
        # 移除对角线（自身）
        diag_mask = ~torch.eye(batch_size, dtype=torch.bool, device=embeddings.device)
        mask = mask & diag_mask
        
        # 计算InfoNCE损失
        exp_sim = torch.exp(similarity) * diag_mask
        log_prob = similarity - torch.log(exp_sim.sum(dim=1, keepdim=True))
        
        # 正例的平均log概率
        loss = -(log_prob * mask).sum() / mask.sum()
        
        return loss
\`\`\`

## 分布式训练配置

当模型太大、一张卡装不下时，就需要多卡分布式训练了。这就像搬家时一个人搬不动的大柜子，需要几个人一起抬。PyTorch提供了DDP（分布式数据并行），而Accelerate库则提供了更简化的接口。

### 使用PyTorch DDP

\`\`\`python
import torch.distributed as dist
from torch.nn.parallel import DistributedDataParallel as DDP
from torch.utils.data.distributed import DistributedSampler

def setup_distributed(rank, world_size):
    """初始化分布式环境"""
    dist.init_process_group(
        backend='nccl',
        init_method='env://',
        world_size=world_size,
        rank=rank
    )
    torch.cuda.set_device(rank)
    
def cleanup_distributed():
    dist.destroy_process_group()
    
def train_distributed(rank, world_size, model, dataset, epochs=3):
    setup_distributed(rank, world_size)
    
    # 将模型移到对应GPU并包装为DDP
    model = model.to(rank)
    model = DDP(model, device_ids=[rank])
    
    # 使用分布式采样器
    sampler = DistributedSampler(dataset, num_replicas=world_size, rank=rank)
    dataloader = DataLoader(dataset, batch_size=8, sampler=sampler)
    
    optimizer = AdamW(model.parameters(), lr=2e-5)
    
    for epoch in range(epochs):
        sampler.set_epoch(epoch)  # 确保每个epoch的shuffle不同
        
        for batch in dataloader:
            batch = {k: v.to(rank) for k, v in batch.items()}
            
            outputs = model(**batch)
            loss = outputs.loss
            
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            
        if rank == 0:
            print(f"Epoch {epoch} completed")
            
    cleanup_distributed()
\`\`\`

### 使用Accelerate简化分布式

\`\`\`python
from accelerate import Accelerator

def train_with_accelerate(model, train_dataset, num_epochs=3):
    accelerator = Accelerator(
        gradient_accumulation_steps=4,
        mixed_precision='bf16'
    )
    
    dataloader = DataLoader(train_dataset, batch_size=8, shuffle=True)
    optimizer = AdamW(model.parameters(), lr=2e-5)
    scheduler = CosineAnnealingLR(optimizer, T_max=num_epochs * len(dataloader))
    
    # Accelerate自动处理设备放置和分布式
    model, optimizer, dataloader, scheduler = accelerator.prepare(
        model, optimizer, dataloader, scheduler
    )
    
    for epoch in range(num_epochs):
        model.train()
        for batch in dataloader:
            with accelerator.accumulate(model):
                outputs = model(**batch)
                loss = outputs.loss
                accelerator.backward(loss)
                optimizer.step()
                scheduler.step()
                optimizer.zero_grad()
                
        accelerator.print(f"Epoch {epoch}: Loss = {loss.item():.4f}")
        
    # 保存模型
    accelerator.wait_for_everyone()
    unwrapped_model = accelerator.unwrap_model(model)
    accelerator.save(unwrapped_model.state_dict(), 'model.pt')
\`\`\`

## 完整训练脚本示例

以下是一个整合上述技术的完整训练脚本：

\`\`\`python
#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
自定义大模型训练脚本
支持混合精度、梯度累积、分布式训练
"""

import argparse
import torch
from torch.utils.data import DataLoader
from transformers import AutoModelForCausalLM, AutoTokenizer, get_cosine_schedule_with_warmup
from accelerate import Accelerator
from accelerate.utils import set_seed
from tqdm import tqdm
import wandb

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('--model_name', type=str, required=True)
    parser.add_argument('--train_data', type=str, required=True)
    parser.add_argument('--output_dir', type=str, default='./output')
    parser.add_argument('--num_epochs', type=int, default=3)
    parser.add_argument('--batch_size', type=int, default=4)
    parser.add_argument('--gradient_accumulation_steps', type=int, default=4)
    parser.add_argument('--learning_rate', type=float, default=2e-5)
    parser.add_argument('--warmup_ratio', type=float, default=0.1)
    parser.add_argument('--max_length', type=int, default=2048)
    parser.add_argument('--seed', type=int, default=42)
    parser.add_argument('--use_wandb', action='store_true')
    return parser.parse_args()

def main():
    args = parse_args()
    set_seed(args.seed)
    
    # 初始化Accelerator
    accelerator = Accelerator(
        gradient_accumulation_steps=args.gradient_accumulation_steps,
        mixed_precision='bf16',
        log_with='wandb' if args.use_wandb else None
    )
    
    if args.use_wandb and accelerator.is_main_process:
        wandb.init(project='custom-llm-training', config=vars(args))
    
    # 加载模型和分词器
    accelerator.print(f"Loading model: {args.model_name}")
    tokenizer = AutoTokenizer.from_pretrained(args.model_name, trust_remote_code=True)
    model = AutoModelForCausalLM.from_pretrained(
        args.model_name,
        torch_dtype=torch.bfloat16,
        trust_remote_code=True
    )
    
    # 确保pad_token存在
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
        model.config.pad_token_id = model.config.eos_token_id
    
    # 加载数据集
    train_dataset = ChatDataset(args.train_data, tokenizer, args.max_length)
    train_dataloader = DataLoader(
        train_dataset,
        batch_size=args.batch_size,
        shuffle=True,
        num_workers=4,
        pin_memory=True
    )
    
    # 优化器和调度器
    optimizer = torch.optim.AdamW(
        model.parameters(),
        lr=args.learning_rate,
        betas=(0.9, 0.95),
        weight_decay=0.1
    )
    
    num_training_steps = args.num_epochs * len(train_dataloader) // args.gradient_accumulation_steps
    num_warmup_steps = int(num_training_steps * args.warmup_ratio)
    
    scheduler = get_cosine_schedule_with_warmup(
        optimizer,
        num_warmup_steps=num_warmup_steps,
        num_training_steps=num_training_steps
    )
    
    # 准备分布式训练
    model, optimizer, train_dataloader, scheduler = accelerator.prepare(
        model, optimizer, train_dataloader, scheduler
    )
    
    # 训练循环
    global_step = 0
    for epoch in range(args.num_epochs):
        model.train()
        epoch_loss = 0
        progress_bar = tqdm(
            train_dataloader,
            desc=f"Epoch {epoch + 1}/{args.num_epochs}",
            disable=not accelerator.is_main_process
        )
        
        for step, batch in enumerate(progress_bar):
            with accelerator.accumulate(model):
                outputs = model(
                    input_ids=batch['input_ids'],
                    attention_mask=batch['attention_mask'],
                    labels=batch['labels']
                )
                loss = outputs.loss
                accelerator.backward(loss)
                
                # 梯度裁剪
                if accelerator.sync_gradients:
                    accelerator.clip_grad_norm_(model.parameters(), 1.0)
                    
                optimizer.step()
                scheduler.step()
                optimizer.zero_grad()
                
            epoch_loss += loss.item()
            
            if accelerator.sync_gradients:
                global_step += 1
                progress_bar.set_postfix({'loss': loss.item(), 'lr': scheduler.get_last_lr()[0]})
                
                if args.use_wandb and accelerator.is_main_process:
                    wandb.log({
                        'train/loss': loss.item(),
                        'train/learning_rate': scheduler.get_last_lr()[0],
                        'train/epoch': epoch + step / len(train_dataloader)
                    }, step=global_step)
        
        avg_loss = epoch_loss / len(train_dataloader)
        accelerator.print(f"Epoch {epoch + 1} - Average Loss: {avg_loss:.4f}")
        
        # 保存检查点
        if accelerator.is_main_process:
            save_path = f"{args.output_dir}/checkpoint-epoch{epoch + 1}"
            accelerator.wait_for_everyone()
            unwrapped_model = accelerator.unwrap_model(model)
            unwrapped_model.save_pretrained(save_path)
            tokenizer.save_pretrained(save_path)
            accelerator.print(f"Checkpoint saved to {save_path}")
    
    # 保存最终模型
    accelerator.wait_for_everyone()
    if accelerator.is_main_process:
        final_path = f"{args.output_dir}/final"
        unwrapped_model = accelerator.unwrap_model(model)
        unwrapped_model.save_pretrained(final_path)
        tokenizer.save_pretrained(final_path)
        accelerator.print(f"Final model saved to {final_path}")
        
        if args.use_wandb:
            wandb.finish()

if __name__ == '__main__':
    main()
\`\`\`

运行脚本：

\`\`\`bash
# 单卡训练
python train.py --model_name Qwen/Qwen2.5-7B --train_data data.jsonl

# 多卡分布式训练
accelerate launch --num_processes 4 train.py \\
    --model_name Qwen/Qwen2.5-7B \\
    --train_data data.jsonl \\
    --batch_size 2 \\
    --gradient_accumulation_steps 8
\`\`\`

通过本节的学习，读者应能够根据具体需求灵活定制训练流程、数据处理管道和模型结构。建议先从最简单的自定义训练循环开始，确认跑通后再逐步添加混合精度、梯度累积、分布式等高级特性——一次加太多复杂度很容易让debug变得困难。这些能力将为更高级的研究和工程应用奠定基础。
`
    },
    {
      id: "adv-12-01-intro",
      title: "12.1 评测技术",
      file: "大模型教程/12-评测技术/00-引言.md",
      difficulty: "中级-高级",
      duration: "0.5h",
      week: 0,
      phase: 0,
      keywords: ["评测技术", "MMLU", "TriviaQA", "GSM8K", "MATH", "HellaSwag"],
      content: `# 评测技术

模型评测是大模型开发流程中不可或缺的环节。一个设计良好的评测体系能够全面、客观地衡量模型的能力边界，指导模型的迭代优化，并为模型选型提供可靠依据。

## 评测的重要性

大模型的评测面临着独特的挑战。传统机器学习模型的评测通常基于明确的任务定义和标注数据集，而大模型具有通用性和开放性，其能力涵盖语言理解、推理、生成、知识问答等多个维度，单一指标难以全面刻画模型性能。

评测在模型生命周期中扮演多重角色：

| 阶段 | 评测目标 | 关注指标 |
|------|----------|----------|
| 预训练 | 验证基础能力习得 | 困惑度、下游任务零样本性能 |
| 微调 | 确认任务适配效果 | 任务特定指标、泛化能力 |
| 部署前 | 安全性与合规性 | 有害内容率、偏见检测 |
| 线上 | 用户满意度与稳定性 | 延迟、吞吐、用户反馈 |

## 评测的维度

大模型评测通常涵盖以下核心维度：

**知识与事实性**：模型是否掌握准确的世界知识，能否正确回答事实性问题。常用MMLU、TriviaQA等数据集进行评测。

**推理能力**：包括数学推理、逻辑推理、常识推理等。GSM8K、MATH、HellaSwag等是常用的推理评测集。

**语言理解与生成**：评估模型对语言的理解深度和生成文本的流畅性、相关性。涵盖阅读理解、摘要生成、翻译等任务。

**代码能力**：模型编写、理解和调试代码的能力。HumanEval、MBPP是主流的代码评测集。

**指令遵循**：模型按照用户指令完成任务的能力，包括格式遵循、约束满足等。

**安全与对齐**：模型是否产生有害、偏见或不当内容，是否符合人类价值观。

## 评测方法论

评测方法可分为自动评测和人工评测两大类：

**自动评测**依赖预定义的标准答案或评分规则，具有高效、可复现的优点。常见方式包括：
- 精确匹配（Exact Match）
- F1分数
- BLEU、ROUGE等生成指标
- 模型作为评判者（LLM-as-Judge）

**人工评测**由人类标注者对模型输出进行主观评价，适用于开放式生成任务。常采用：
- 绝对评分（1-5分）
- 相对排序（A/B测试）
- 偏好选择

两种方法各有优劣，实践中通常结合使用以获得全面评估。

## 本章内容概览

本章将系统介绍大模型评测的理论基础与实践方法：

1. **交叉验证与模型后评估**：介绍评测的统计学基础，包括训练集/验证集/测试集划分、交叉验证策略、过拟合检测等。

2. **通用Benchmark**：详细介绍业界主流的评测基准，涵盖CoT评测、中英文能力评测、Agent评测等多个方向。

3. **自定义Benchmark**：讲解如何根据业务需求构建专属评测集，包括数据收集、标注规范、质量控制等环节。

4. **评测框架**：对比分析OpenCompass、EvalScope、VLMEvalKit等主流评测框架的设计理念与使用方法。

5. **实践：使用EvalScope进行模型评估**：通过完整案例演示如何使用评测框架对模型进行系统评估，并构建自定义评测任务。

通过本章学习，读者将掌握大模型评测的完整方法论，能够为自身的模型开发和选型工作建立科学的评测体系。
`
    },
    {
      id: "adv-12-02-cross-validation",
      title: "12.2 交叉验证与模型后评估",
      file: "大模型教程/12-评测技术/01-交叉验证与后评估.md",
      difficulty: "中级-高级",
      duration: "1h",
      week: 0,
      phase: 0,
      keywords: ["交叉验证与模型后评估", "Training", "Set", "Validation", "Test"],
      content: `# 交叉验证与模型后评估

在机器学习和深度学习领域，模型评估的核心目标是估计模型在未见数据上的泛化性能。交叉验证作为一种经典的统计方法，为模型评估提供了可靠的理论框架。

这就像排练一场歌剧——演员们不会直接上台演出，而是先进行多次“彩排”（交叉验证），在这个过程中发现问题、调整表演。只有彩排通过后，才能在正式演出（测试集评估）中展现真实水平。本节将介绍评估的基本原理、数据划分策略以及大模型评测中的特殊考量。

## 数据集划分

### 训练集、验证集与测试集

标准的机器学习流程将数据划分为三个互不相交的子集：

- **训练集（Training Set）**：用于模型参数学习
- **验证集（Validation Set）**：用于超参数调优和模型选择
- **测试集（Test Set）**：用于最终性能评估

这种划分确保了评估的无偏性——测试集在整个开发过程中保持"隐藏"，只在最终评估时使用一次。想象你在准备驾照考试：训练集就是平时练习的路线，验证集是模拟考试，而测试集就是正式考试。如果你用正式考试的路线去练习，那考试成绩就没有参考价值了。

常见的划分比例：

| 数据规模 | 训练集 | 验证集 | 测试集 |
|----------|--------|--------|--------|
| 小规模（<10K） | 60% | 20% | 20% |
| 中等规模（10K-1M） | 80% | 10% | 10% |
| 大规模（>1M） | 98% | 1% | 1% |

大模型预训练通常使用海量数据，验证集和测试集的绝对样本量即使占比很小也足够可靠。

### 分层抽样

当数据集存在类别不平衡时，应采用分层抽样（Stratified Sampling）确保各子集中类别分布一致：

\`\`\`python
from sklearn.model_selection import train_test_split

# 分层划分，保持标签分布
X_train, X_test, y_train, y_test = train_test_split(
    X, y, 
    test_size=0.2, 
    stratify=y,  # 按y的分布进行分层
    random_state=42
)
\`\`\`

## 交叉验证方法

下图展示了K折交叉验证的核心流程：

\`\`\`mermaid
graph TD
    A[完整数据集] --> B[分为K折]
    B --> C[第1折作验证集]
    B --> D[第2折作验证集]
    B --> E[第K折作验证集]
    C --> F[训练并评估]
    D --> F
    E --> F
    F --> G[平均K次性能]
    G --> H[最终性能估计]
\`\`\`

### K折交叉验证

K折交叉验证就像一场歌剧的多场彩排。假设你有五幕戏，每次挑一幕当"观众彩排"（验证集），其余四幕照常排练（训练集）。五场彩排的平均评价就能很好地预测正式演出的效果。

K折交叉验证（K-Fold Cross-Validation）将数据集分为K个大小相等的子集，依次将每个子集作为验证集，其余K-1个子集作为训练集，最终性能为K次评估的平均值。

$$
\\text{CV}_{K} = \\frac{1}{K}\\sum_{k=1}^{K}\\mathcal{L}(f^{(-k)}, D_k)
$$

其中：$K$ 为折数；$f^{(-k)}$ 表示在排除第 $k$ 折数据后训练得到的模型；$D_k$ 为第 $k$ 折数据（即验证集）；$\\mathcal{L}$ 为损失函数。该公式表示将 $K$ 次评估结果取平均，以获得更稳定、更可靠的泛化性能估计。

\`\`\`python
from sklearn.model_selection import KFold, cross_val_score

# 5折交叉验证
kfold = KFold(n_splits=5, shuffle=True, random_state=42)

scores = cross_val_score(model, X, y, cv=kfold, scoring='accuracy')
print(f"Mean accuracy: {scores.mean():.4f} (+/- {scores.std() * 2:.4f})")
\`\`\`

K值的选择涉及偏差-方差权衡：
- K较小时，训练集较小，估计偏差较大
- K较大时，各折训练集高度重叠，估计方差较大

实践中K=5或K=10是常用选择。

### 留一交叉验证

留一交叉验证（Leave-One-Out Cross-Validation, LOOCV）是K折交叉验证的极端情况，其中K等于样本数N：

$$
\\text{LOOCV} = \\frac{1}{N}\\sum_{i=1}^{N}\\mathcal{L}(f^{(-i)}, x_i, y_i)
$$

其中：$N$ 为样本总数，$f^{(-i)}$ 为排除第 $i$ 个样本后训练得到的模型，$(x_i, y_i)$ 为被排除的单个样本。每次仅用一个样本验证，其余全部用于训练，因而偏差最小，但计算开销极大。

LOOCV具有最小偏差但计算开销极大，且由于各折训练集高度重叠，方差较高。

### 分层K折交叉验证

对于分类问题，分层K折（Stratified K-Fold）确保每折中各类别比例与原始数据一致：

\`\`\`python
from sklearn.model_selection import StratifiedKFold

skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

for fold, (train_idx, val_idx) in enumerate(skf.split(X, y)):
    X_train, X_val = X[train_idx], X[val_idx]
    y_train, y_val = y[train_idx], y[val_idx]
    
    # 训练和评估
    model.fit(X_train, y_train)
    score = model.score(X_val, y_val)
    print(f"Fold {fold + 1}: {score:.4f}")
\`\`\`

### 时间序列交叉验证

对于时间序列数据，必须保持时间顺序，避免"未来信息泄露"：

\`\`\`python
from sklearn.model_selection import TimeSeriesSplit

tscv = TimeSeriesSplit(n_splits=5)

for train_idx, test_idx in tscv.split(X):
    # train_idx 始终在 test_idx 之前
    X_train, X_test = X[train_idx], X[test_idx]
\`\`\`

## 评估指标

### 分类任务指标

**准确率（Accuracy）**：正确预测的比例
$$
\\text{Accuracy} = \\frac{TP + TN}{TP + TN + FP + FN}
$$

**精确率（Precision）**：预测为正例中实际为正的比例
$$
\\text{Precision} = \\frac{TP}{TP + FP}
$$

**召回率（Recall）**：实际正例中被正确预测的比例
$$
\\text{Recall} = \\frac{TP}{TP + FN}
$$

以上三个指标中：$TP$（True Positive）为真正例，即实际为正且预测为正的样本数；$TN$（True Negative）为真反例；$FP$（False Positive）为假正例，即实际为反但预测为正；$FN$（False Negative）为假反例，即实际为正但预测为反。准确率反映整体分类正确性，精确率关注“预测为正的结果有多可靠”，召回率关注“真实正例被找回了多少”。

**F1分数**：精确率和召回率的调和平均
$$
F_1 = 2 \\cdot \\frac{\\text{Precision} \\cdot \\text{Recall}}{\\text{Precision} + \\text{Recall}}
$$

F1 分数是精确率与召回率的调和平均值，取值范围为 $[0,1]$。当精确率和召回率均较高时 F1 才会高，因此它常用于在两者之间寻找平衡。

### 生成任务指标

**困惑度（Perplexity）**：语言模型的标准评估指标。直觉地说，困惑度衡量的是“模型有多“困惑””——如果模型对每个字都能准确预测，困惑度就低；如果每次都拿不定主意，困惑度就高。一个困惑度为10的模型，大致相当于每次在约10个候选字中犹豫。
$$
\\text{PPL} = \\exp\\left(-\\frac{1}{N}\\sum_{i=1}^{N}\\log P(w_i|w_{<i})\\right)
$$

其中：$N$ 为文本的 token 总数，$w_i$ 为第 $i$ 个 token，$w_{<i}$ 为其前所有 token，$P(w_i|w_{<i})$ 为模型对 $w_i$ 的条件概率预测。困惑度可解读为模型在每个位置平均面临的“等效候选数”，值越低表明预测能力越强。

**BLEU分数**：评估生成文本与参考文本的n-gram重合度
$$
\\text{BLEU} = BP \\cdot \\exp\\left(\\sum_{n=1}^{N}w_n\\log p_n\\right)
$$

其中：$BP$ 为长度惩罚因子（Brevity Penalty），用于惩罚过短的生成结果；$p_n$ 为 $n$-gram 精确率，即生成文本中与参考文本匹配的 $n$-gram 比例；$w_n$ 为各阶 $n$-gram 的权重，通常取 $w_n = 1/N$；$N$ 为考虑的最大 $n$-gram 阶数（常取 4）。BLEU 分数取值范围为 $[0,1]$，值越高表示生成文本与参考文本越接近。

**ROUGE分数**：侧重于召回率的文本相似度指标
$$
\\text{ROUGE-N} = \\frac{\\sum_{s\\in\\text{Ref}}\\sum_{\\text{gram}_n\\in s}\\text{Count}_{\\text{match}}(\\text{gram}_n)}{\\sum_{s\\in\\text{Ref}}\\sum_{\\text{gram}_n\\in s}\\text{Count}(\\text{gram}_n)}
$$

其中：$\\text{Ref}$ 为参考文本集合，$\\text{gram}_n$ 为 $n$-gram 片段，$\\text{Count}_{\\text{match}}(\\text{gram}_n)$ 为该 $n$-gram 在生成文本与参考文本中共同出现的次数，$\\text{Count}(\\text{gram}_n)$ 为该 $n$-gram 在参考文本中出现的总次数。与 BLEU 侧重精确率不同，ROUGE 侧重召回率，即衡量参考文本中的信息有多少被生成文本捕获。

### 精确匹配与模糊匹配

大模型评测中常用的匹配方式：

\`\`\`python
def exact_match(prediction, reference):
    """精确匹配"""
    return prediction.strip() == reference.strip()

def contains_match(prediction, reference):
    """包含匹配"""
    return reference.strip() in prediction.strip()

def normalized_match(prediction, reference):
    """标准化后匹配（忽略大小写、标点）"""
    import re
    def normalize(text):
        text = text.lower()
        text = re.sub(r'[^\\w\\s]', '', text)
        text = ' '.join(text.split())
        return text
    return normalize(prediction) == normalize(reference)

def f1_token_match(prediction, reference):
    """基于词元的F1匹配"""
    pred_tokens = set(prediction.lower().split())
    ref_tokens = set(reference.lower().split())
    
    if not pred_tokens or not ref_tokens:
        return 0.0
        
    common = pred_tokens & ref_tokens
    precision = len(common) / len(pred_tokens)
    recall = len(common) / len(ref_tokens)
    
    if precision + recall == 0:
        return 0.0
    return 2 * precision * recall / (precision + recall)
\`\`\`

## 过拟合与欠拟合检测

### 学习曲线分析

通过观察训练集和验证集性能随训练轮次的变化，可以诊断过拟合和欠拟合：

\`\`\`python
import matplotlib.pyplot as plt

def plot_learning_curve(train_losses, val_losses):
    plt.figure(figsize=(10, 6))
    plt.plot(train_losses, label='Training Loss')
    plt.plot(val_losses, label='Validation Loss')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend()
    plt.title('Learning Curve')
    
    # 诊断
    if val_losses[-1] > val_losses[len(val_losses)//2]:
        print("Warning: Possible overfitting detected")
    if train_losses[-1] > 0.5 * train_losses[0]:
        print("Warning: Model may be underfitting")
\`\`\`

**过拟合特征**：训练损失持续下降，验证损失先降后升
**欠拟合特征**：训练损失和验证损失都较高且接近

### 早停策略

早停（Early Stopping）是防止过拟合的有效手段：

\`\`\`python
class EarlyStopping:
    def __init__(self, patience=5, min_delta=0.001):
        self.patience = patience
        self.min_delta = min_delta
        self.counter = 0
        self.best_score = None
        self.should_stop = False
        
    def __call__(self, val_loss):
        if self.best_score is None:
            self.best_score = val_loss
        elif val_loss > self.best_score - self.min_delta:
            self.counter += 1
            if self.counter >= self.patience:
                self.should_stop = True
        else:
            self.best_score = val_loss
            self.counter = 0
            
        return self.should_stop
\`\`\`

## 大模型评测的特殊考量

### 数据污染问题

这是大模型评测中最棘手的问题之一。想象一下，如果一个学生在考试前偶然看到了试卷，他考了满分也不能说明他真的掌握了知识。大模型在预训练阶段可能已经"见过"评测集中的数据，导致评测结果虚高。检测数据污染的方法包括：

1. **n-gram重叠检测**：计算训练数据与测试数据的n-gram重叠率
2. **成员推断**：利用模型对训练数据的过度自信进行检测
3. **时间戳隔离**：使用模型训练截止日期之后发布的数据进行评测

\`\`\`python
def check_ngram_overlap(train_texts, test_texts, n=13):
    """检测n-gram重叠"""
    from collections import Counter
    
    def get_ngrams(text, n):
        tokens = text.split()
        return set(tuple(tokens[i:i+n]) for i in range(len(tokens)-n+1))
    
    train_ngrams = set()
    for text in train_texts:
        train_ngrams.update(get_ngrams(text, n))
    
    contamination_count = 0
    for text in test_texts:
        test_ngrams = get_ngrams(text, n)
        if test_ngrams & train_ngrams:
            contamination_count += 1
            
    return contamination_count / len(test_texts)
\`\`\`

### 评测可复现性

确保评测结果可复现需要控制多个随机性来源：

\`\`\`python
import random
import numpy as np
import torch

def set_seed(seed=42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False
\`\`\`

同时需要记录：
- 模型版本和检查点
- 评测代码版本
- 采样参数（temperature、top_p等）
- 推理框架和版本

### 统计显著性检验

在实际项目中，你可能会遇到这样的场景：模型A的准确率是72.3%，模型B是71.8%——A真的比B好吗？还是只是随机波动？统计显著性检验就是回答这个问题的工具。

比较两个模型性能时，需要进行统计显著性检验以确认差异不是由随机性导致：

\`\`\`python
from scipy import stats

def paired_bootstrap_test(scores_a, scores_b, n_bootstrap=10000):
    """配对Bootstrap检验"""
    observed_diff = np.mean(scores_a) - np.mean(scores_b)
    
    combined = np.array(scores_a) - np.array(scores_b)
    n = len(combined)
    
    count = 0
    for _ in range(n_bootstrap):
        sample = np.random.choice(combined, size=n, replace=True)
        if np.mean(sample) >= observed_diff:
            count += 1
            
    p_value = count / n_bootstrap
    return observed_diff, p_value

def mcnemar_test(predictions_a, predictions_b, labels):
    """McNemar检验，适用于分类任务"""
    # a对b错
    b01 = sum((predictions_a == labels) & (predictions_b != labels))
    # a错b对
    b10 = sum((predictions_a != labels) & (predictions_b == labels))
    
    # 使用连续性校正
    chi2 = (abs(b01 - b10) - 1) ** 2 / (b01 + b10)
    p_value = 1 - stats.chi2.cdf(chi2, df=1)
    
    return chi2, p_value
\`\`\`

### 多指标综合评估

大模型评测通常涉及多个指标，需要综合考量：

\`\`\`python
def calculate_aggregate_score(metrics, weights=None):
    """计算加权综合分数"""
    if weights is None:
        weights = {k: 1.0 / len(metrics) for k in metrics}
    
    # 归一化权重
    total_weight = sum(weights.values())
    weights = {k: v / total_weight for k, v in weights.items()}
    
    # 加权平均
    score = sum(metrics[k] * weights[k] for k in metrics)
    return score

# 示例
metrics = {
    'mmlu': 0.75,
    'gsm8k': 0.68,
    'humaneval': 0.45,
    'hellaswag': 0.82
}

weights = {
    'mmlu': 0.3,      # 知识推理权重较高
    'gsm8k': 0.3,     # 数学推理权重较高
    'humaneval': 0.2,  # 代码能力
    'hellaswag': 0.2   # 常识推理
}

aggregate = calculate_aggregate_score(metrics, weights)
print(f"Aggregate Score: {aggregate:.4f}")
\`\`\`

通过合理的数据划分、交叉验证和评估指标选择，可以获得对模型性能的可靠估计。记住评测的精髓：不是让模型"表现好"，而是让模型"表现出真实水平"。正如彩排的目的不是让演员得高分，而是发现问题并改进。
`
    },
    {
      id: "adv-12-03-benchmark",
      title: "12.3 通用Benchmark",
      file: "大模型教程/12-评测技术/02-通用Benchmark.md",
      difficulty: "中级-高级",
      duration: "1h",
      week: 0,
      phase: 0,
      keywords: ["通用Benchmark", "Benchmark", "Agent", "SAT"],
      content: `# 通用Benchmark

大模型评测需要标准化的基准数据集（Benchmark）来量化模型能力。本节将系统介绍业界主流的评测基准，涵盖知识推理、思维链评测、多语言能力以及Agent评测等多个维度。

这就像高考、SAT这类标准化考试——无论你在哪所学校学习，大家坐在同一张考卷面前，成绩才具有可比性。Benchmark对大模型的意义正在于此：为不同架构、不同训练策略的模型提供统一的“考场”，让我们能够客观地说“模型A比模型B在数学推理上强15个百分点”，而非凭主观感受下判断。

下图展示了主流评测基准的能力维度分布：

\`\`\`mermaid
graph TD
    A[大模型评测] --> B[知识与推理]
    A --> C[数学推理]
    A --> D[代码能力]
    A --> E[中文能力]
    A --> F[Agent能力]
    B --> B1[MMLU]
    B --> B2[HellaSwag]
    C --> C1[GSM8K]
    C --> C2[MATH]
    D --> D1[HumanEval]
    D --> D2[MBPP]
    E --> E1[C-Eval]
    E --> E2[CMMLU]
    F --> F1[AgentBench]
    F --> F2[ToolBench]
\`\`\`

## 知识与推理评测

### MMLU

MMLU（Massive Multitask Language Understanding）是衡量大模型知识广度和推理能力的核心基准。数据集涵盖57个学科，包括STEM、人文、社会科学和其他领域，共约16000道多选题。

假设你正在面试一位"通才型"候选人，你会怎么做？你一定会出一份涵盖各个领域的综合试卷——从数学物理到历史哲学，从经济学到临床医学。MMLU就是这样一份"超级面试题"，它像SAT之于高中生一样，成为衡量大模型"博学程度"的标杆考试。一个模型如果能在MMLU上拿到90%以上的准确率，基本说明它在各学科的知识储备已经相当扎实。

| 学科类别 | 示例科目 | 题目数量 |
|----------|----------|----------|
| STEM | 数学、物理、计算机科学、化学 | ~4000 |
| 人文学科 | 历史、哲学、法律 | ~3000 |
| 社会科学 | 经济学、心理学、政治学 | ~3500 |
| 其他 | 临床医学、职业资格 | ~5500 |

MMLU采用5-shot评测方式，即提供5个示例后让模型回答新问题。评测指标为准确率。

\`\`\`python
# MMLU评测示例
prompt = """
The following are multiple choice questions (with answers) about world history.

Question: What was the main cause of World War I?
A. The assassination of Archduke Franz Ferdinand
B. The invasion of Poland
C. The signing of the Treaty of Versailles
D. The fall of the Berlin Wall
Answer: A

Question: {question}
A. {choice_a}
B. {choice_b}
C. {choice_c}
D. {choice_d}
Answer:"""
\`\`\`

### MMLU-Pro

MMLU-Pro是MMLU的增强版本。回到SAT的比喻——如果MMLU是普通SAT，那MMLU-Pro就是加了附加题的"魔鬼版SAT"。它有以下特点：
- 选项从4个增加到10个，降低随机猜测成功率（从25%降到10%，想蒙对可就难多了）
- 问题难度提升，需要更深层次的推理
- 减少了可通过模式匹配解决的简单问题（也就是说，那些"看选项长度就能猜对"的投机策略在这里行不通了）

### ARC（AI2 Reasoning Challenge）

ARC专注于科学推理能力评测，分为Easy和Challenge两个难度级别。想象一下中学理科考试里的"基础题"和"拓展题"——基础题考的是你记不记得公式，而拓展题考的是你能不能灵活运用：
- **ARC-Easy**：约5500道相对简单的科学题（"水在几度沸腾？"这种直接查知识点的题目）
- **ARC-Challenge**：约2600道需要复杂推理的题目（"在海拔5000米的高原上，水的沸点会怎样变化？为什么？"）

### HellaSwag

HellaSwag评测模型的常识推理能力，要求模型选择最合理的句子续写：

\`\`\`
Context: A man is seen sitting on a couch playing a guitar. He plays for 
a bit then stops and...
A. begins to talk to the camera.
B. takes off his shoes and throws them.
C. starts doing jumping jacks.
D. continues playing the guitar.
\`\`\`

该数据集通过对抗性筛选确保人类容易回答但模型容易出错。这就像专门设计那些"人凭直觉一看就知道答案、但机器却容易被误导"的题目——好比问你"弹吉他的人停下来之后最可能做什么？"人类觉得显然是继续聊天或放下吉他，而模型可能被"做开合跳"这种表面上合理的选项迷惑。

### WinoGrande

WinoGrande评测代词消解能力，是对Winograd Schema Challenge的大规模扩展：

\`\`\`
The trophy doesn't fit into the brown suitcase because it is too large.
Question: What is "it" referring to?
A. trophy
B. suitcase
\`\`\`

## 数学推理评测

### GSM8K

GSM8K（Grade School Math 8K）包含约8500道小学数学应用题，要求模型展示多步数学推理能力。在实际项目中，你会发现一个有趣的现象：很多在MMLU上表现不错的模型，面对小学应用题反而频频翻车。这就像一个博士生可能在高深的理论推导上得心应手，却在"鸡兔同笼"问题上算错——不是知识不够，而是缺乏逐步推理的耐心。GSM8K正是检验模型这种"耐心"的试金石：

\`\`\`
Question: James has 30 teeth. His dentist drills 4 of them and caps 7 
more teeth than he drills. What percentage of James' teeth does the 
dentist fix?

Answer: The dentist caps 4 + 7 = 11 teeth.
So the dentist fixes 4 + 11 = 15 teeth.
The percentage is 15 / 30 * 100 = 50%.
The answer is 50.
\`\`\`

GSM8K常与思维链（Chain-of-Thought）提示结合使用，评测模型的逐步推理能力。正如上面的例子所示，一旦模型学会"先算这个、再算那个、最后得出结论"的解题习惯，准确率往往有显著提升——这和教小学生"列算式、分步骤"是一个道理。

### MATH

MATH数据集包含12500道竞赛级数学题，难度从高中到数学竞赛，按难度分为1-5级：

| 难度等级 | 描述 | 典型主题 |
|----------|------|----------|
| Level 1 | 基础 | 简单代数、几何 |
| Level 2 | 中等 | 多项式、概率 |
| Level 3 | 较难 | 数论、组合 |
| Level 4 | 困难 | 抽象代数、复分析 |
| Level 5 | 竞赛级 | IMO级别问题 |

### MathBench

MathBench是针对中文数学能力的评测集，涵盖小学到大学各阶段：
- 算术计算
- 代数运算
- 几何证明
- 微积分

## 思维链评测

### CoT评测方法

思维链（Chain-of-Thought）评测不仅关注最终答案的正确性，还评估推理过程的质量。评测维度包括：

**推理完整性**：推理步骤是否完整覆盖问题所需的所有环节

**逻辑一致性**：各步骤之间是否存在逻辑矛盾

**计算准确性**：中间计算步骤是否正确

\`\`\`python
def evaluate_cot(model_output, reference):
    """评测思维链输出"""
    # 提取最终答案
    final_answer = extract_answer(model_output)
    answer_correct = final_answer == reference['answer']
    
    # 评估推理步骤（可使用LLM-as-Judge）
    steps = extract_reasoning_steps(model_output)
    step_scores = []
    for i, step in enumerate(steps):
        score = evaluate_step(step, reference.get('steps', []))
        step_scores.append(score)
    
    return {
        'answer_correct': answer_correct,
        'reasoning_score': np.mean(step_scores) if step_scores else 0,
        'num_steps': len(steps)
    }
\`\`\`

### BBH（BIG-Bench Hard）

BBH是从BIG-Bench中筛选出的23个挑战性任务子集，这些任务在使用思维链提示后性能显著提升：

- 日期理解
- 因果判断
- 逻辑推演
- 导航推理
- 体育理解

### ThoughtBench

ThoughtBench专门评测模型的深度思考能力，包含需要多轮迭代推理的复杂问题。

## 代码能力评测

### HumanEval

HumanEval包含164道手工编写的Python编程题，评测模型的代码生成能力。举个例子来说，这就像给程序员出一道面试编程题：给你一个函数签名和文档说明，你写出实现代码，然后我用预设的测试用例来验证你的代码能不能跑通。模型面对的考验和人类程序员面试时一模一样：

\`\`\`python
def candidate_function(prompt, num_samples=100):
    """
    生成代码候选并执行测试
    """
    completions = model.generate(prompt, n=num_samples)
    
    passed = 0
    for completion in completions:
        try:
            # 执行生成的代码
            exec(prompt + completion)
            # 运行测试用例
            if run_tests():
                passed += 1
        except:
            continue
    
    # 计算pass@k
    return passed / num_samples
\`\`\`

**Pass@k**指标：生成k个候选代码，至少有一个通过测试的概率。这就像让模型"交k份答卷"，只要有一份全对就算通过——Pass@1最严格（只许答一次），Pass@10则宽松得多（给你十次机会，总该蒙对一次吧）。因此在比较不同模型时，一定要注意看的是Pass@几，否则就像拿"三次跳远取最好成绩"和"一次定输赢"相比，并不公平。

### MBPP

MBPP（Mostly Basic Python Problems）包含974道入门级Python题，覆盖基础数据结构和算法。

### MultiPL-E

MultiPL-E将HumanEval扩展到18种编程语言，评测多语言代码生成能力。

### CodeContests

CodeContests来自Codeforces等在线编程竞赛平台，难度较高，需要算法设计能力。

## 中文能力评测

### C-Eval

C-Eval是中文能力综合评测基准，涵盖52个学科，共约14000道题。如果说MMLU是模型的"美国高考"，那C-Eval就是模型的"中国高考"——题目内容贴合中国教育体系和知识体系，从马克思主义基本原理到注册会计师专业知识，都是中国学生和从业者熟悉的考试范围：

| 类别 | 学科示例 | 题目数 |
|------|----------|--------|
| STEM | 高等数学、大学物理、程序设计 | ~5000 |
| 社会科学 | 马克思主义、毛泽东思想、政治 | ~3000 |
| 人文学科 | 中国历史、法律、教育学 | ~3000 |
| 其他 | 临床医学、注册会计师 | ~3000 |

### CMMLU

CMMLU专注于中国文化和知识背景下的语言理解，包含67个主题。

### AGIEval

AGIEval收集了中国高考、公务员考试、法律职业资格考试等真实考试题目，评测实际应用场景下的能力。这些可是货真价实的"真题"——如果你的模型能在公务员行测上拿高分，那它的逻辑推理能力可就相当不错了。

### GAOKAO-Bench

GAOKAO-Bench使用中国高考真题，涵盖语文、数学、英语、理综、文综等科目。

## 英文综合评测

### GLUE与SuperGLUE

GLUE（General Language Understanding Evaluation）是经典的英文理解评测套件：

| 任务 | 类型 | 描述 |
|------|------|------|
| CoLA | 可接受性 | 判断句子语法是否正确 |
| SST-2 | 情感分析 | 电影评论情感分类 |
| MRPC | 释义检测 | 判断句子对是否语义等价 |
| QQP | 问题匹配 | 判断问题对是否相似 |
| STS-B | 语义相似度 | 评分0-5的相似度 |
| MNLI | 自然语言推理 | 蕴含/矛盾/中性 |
| QNLI | 问答NLI | 答案是否在段落中 |
| RTE | 文本蕴含 | 二分类蕴含判断 |
| WNLI | 代词消解 | Winograd风格任务 |

SuperGLUE在GLUE基础上提升了难度，增加了BoolQ、CB、COPA等更具挑战性的任务。

### TriviaQA

TriviaQA是大规模问答数据集，包含95K个问答对，评测事实知识检索能力。

### NaturalQuestions

来自Google搜索的真实用户问题，答案来自Wikipedia，分为长答案和短答案两种形式。

## Agent评测

### AgentBench

AgentBench评测大模型作为智能体执行复杂任务的能力，涵盖8个场景。前面所有的Benchmark都是在考模型的"纸面功夫"——回答选择题、写代码片段，而AgentBench则是考模型的"实战能力"。假设你正在招聘一位全能助手，你不光要看他笔试成绩，还得看他能不能真正上手干活：操作电脑、查数据库、在网上搜信息、甚至帮你货比三家买东西。AgentBench就是这样一场"实操面试"：

| 场景 | 描述 | 评测内容 |
|------|------|----------|
| OS操作 | 命令行交互 | bash命令执行 |
| 数据库 | SQL查询 | 数据检索与分析 |
| 知识图谱 | 图谱推理 | 实体关系查询 |
| 数字游戏 | 博弈策略 | 决策规划 |
| 横向思维 | 创意推理 | 开放性问题 |
| 家居环境 | 智能家居 | 设备控制 |
| 网页浏览 | 信息检索 | 网页交互 |
| 购物助手 | 电商场景 | 商品推荐 |

### ToolBench

ToolBench评测模型使用外部工具的能力，包含16000个工具API和超过50万个工具调用实例。这就像考察一个员工能不能熟练使用公司的各种办公软件——不光要会Excel，还得会用CRM系统、项目管理工具、数据分析平台，甚至在一个软件出错时懂得换一种方式完成任务。

评测维度：
- 工具选择准确性（从16000个工具里找到对的那个，就像在巨大的工具箱里精准拿出扳手而非螺丝刀）
- 参数填充正确性
- 多工具组合能力
- 错误恢复能力

### WebArena

WebArena在真实网站环境中评测Agent能力，任务包括：
- 购物网站操作
- 社交媒体发帖
- 代码仓库管理
- 论坛讨论交互

\`\`\`python
# Agent评测框架示例
class AgentEvaluator:
    def __init__(self, env, model):
        self.env = env
        self.model = model
        
    def evaluate_episode(self, task):
        observation = self.env.reset(task)
        done = False
        trajectory = []
        
        while not done:
            # 模型决策
            action = self.model.act(observation)
            trajectory.append(action)
            
            # 环境交互
            observation, reward, done, info = self.env.step(action)
            
        # 评估
        success = self.env.check_success(task)
        efficiency = len(trajectory)
        
        return {
            'success': success,
            'steps': efficiency,
            'trajectory': trajectory
        }
\`\`\`

### GAIA

GAIA评测真实世界助手能力，任务需要：
- 网络搜索
- 文件处理
- 多步骤规划
- 工具组合使用

## 多模态评测

### VQA与VQAv2

视觉问答任务，给定图像和问题，模型需要生成答案。

### MMBench

MMBench是综合多模态评测基准，评测视觉语言模型在20+细粒度能力维度上的表现。

### SEED-Bench

SEED-Bench涵盖12个评测维度，包含约19000道选择题，支持图像和视频理解评测。

## 评测基准对比

| 评测集 | 主要能力 | 规模 | 形式 | 语言 |
|--------|----------|------|------|------|
| MMLU | 知识推理 | 16K | 多选 | 英文 |
| C-Eval | 知识推理 | 14K | 多选 | 中文 |
| GSM8K | 数学推理 | 8.5K | 生成 | 英文 |
| HumanEval | 代码生成 | 164 | 生成 | Python |
| HellaSwag | 常识推理 | 70K | 多选 | 英文 |
| AgentBench | Agent能力 | 8场景 | 交互 | 多语言 |

## 评测实践建议

**选择合适的评测集**：根据模型目标用途选择相关的评测基准，避免过度优化单一指标。回到考试的比喻：如果你的模型是用来写代码的，把所有精力花在提高MMLU文科成绩上显然不合理——就像让一个立志当程序员的学生死磕古文默写。

**注意数据污染**：使用最新发布的评测集，或对已知评测集进行变体设计。在实际项目中，数据污染是一个非常容易被忽视的陷阱——如果训练数据里不小心混入了评测题的答案，那成绩再高也是"作弊"得来的，毫无参考价值。

**多维度综合评估**：单一评测集难以全面反映模型能力，应组合多个基准进行评测。这就像招聘时不会只看一门考试的分数：你会同时看笔试成绩、编程实操、案例分析和面试表现，综合下来才能判断候选人的真实水平。

**关注评测细节**：相同评测集在不同prompt、采样参数下结果可能差异显著，需要标准化评测流程。举个例子，同样是MMLU，用"Answer:"作为提示词和用"The answer is:"作为提示词，准确率可能相差好几个百分点——这就好比同一个学生，在安静考场和嘈杂教室里的发挥可能截然不同。

\`\`\`python
# 标准化评测配置示例
eval_config = {
    'temperature': 0.0,          # 确定性输出
    'max_tokens': 1024,
    'prompt_template': 'standard_v1',
    'num_few_shot': 5,
    'seed': 42,
    'batch_size': 32
}
\`\`\`

通过系统化地使用这些评测基准，可以获得对大模型能力的全面认识，为模型开发和选型提供可靠依据。
`
    },
    {
      id: "adv-12-04-benchmark",
      title: "12.4 自定义Benchmark",
      file: "大模型教程/12-评测技术/03-自定义Benchmark.md",
      difficulty: "中级-高级",
      duration: "1h",
      week: 0,
      phase: 0,
      keywords: ["自定义Benchmark", "Benchmark", "MMLU"],
      content: `# 自定义Benchmark

通用评测基准虽然提供了标准化的评估框架，但往往难以完全匹配特定业务场景的需求。构建自定义Benchmark能够针对性地评测模型在目标领域的实际表现，是大模型落地应用中的重要环节。

这就像招聘一位专科医生——你不能光看他高考成绩好不好，还得出一套专门的临床技能考核。MMLU的“全科考试”告诉你这位候选人基础不错，但能不能在你的科室里胜任工作，还需要专门的考核方案来验证。

## 自定义评测的必要性

### 业务场景特殊性

不同业务场景对模型能力的要求各不相同。假设你正在为一家医院部署智能问诊系统，你会发现MMLU里的临床医学题目和真实问诊场景差别巨大——真实场景里，患者会用方言描述症状，会同时询问多种不相关的问题，还会反复确认"你确定没问题吗？"——这些通用评测集里可没有。来看一下各场景的具体差异：

| 应用场景 | 核心能力要求 | 通用评测覆盖度 |
|----------|--------------|----------------|
| 客服对话 | 意图识别、情感理解、话术规范 | 低 |
| 法律咨询 | 法条检索、案例分析、专业术语 | 低 |
| 医疗问诊 | 症状分析、用药建议、安全边界 | 低 |
| 代码审查 | 特定语言/框架、代码规范、安全漏洞 | 中 |
| 金融分析 | 数据解读、风险评估、合规要求 | 低 |

### 数据分布差异

预训练数据的分布与目标应用场景可能存在显著差异。举个例子，一个模型在训练时见过大量英语法律文本，但你需要它处理中国《民法典》的咨询，这两者之间的差距可不是翻译一下那么简单。具体差异包括：
- 专业术语和行业黑话（金融行业的"回调"、医疗行业的"阳性"，和日常用语里的含义完全不同）
- 特定格式和结构化输出（法律文书的固定格式、医疗报告的标准模板）
- 领域知识的深度和广度
- 安全合规的特殊要求（医疗场景下不能随便给用药建议，金融场景下不能给出确定性的投资承诺）

### 评测粒度需求

通用评测提供宏观能力评估，而业务落地需要更细粒度的能力诊断。这就好比体检报告告诉你"身体健康"，但你真正需要知道的是"血糖多少、血压多少、脏器功能如何"这样的细节：

\`\`\`
通用评测: 模型在MMLU上准确率75%
业务需求: 
- 产品问答准确率多少？
- 复杂咨询场景表现如何？
- 边界情况处理是否安全？
- 多轮对话理解是否连贯？
\`\`\`

## 评测集设计原则

### 代表性原则

评测数据应覆盖目标场景的典型用例分布。想象一下你在出一套客服场景的考试卷，如果80%的真实用户问的是"物流查询"，你的试卷却80%都是"退换货"题目，那考试结果就没有参考价值了。评测集的分布应尽量贴合生产环境的实际分布：

\`\`\`python
def analyze_production_distribution(logs):
    """分析生产环境查询分布"""
    from collections import Counter
    
    # 提取查询意图
    intents = [extract_intent(log['query']) for log in logs]
    intent_dist = Counter(intents)
    
    # 提取查询复杂度
    complexities = [measure_complexity(log['query']) for log in logs]
    complexity_dist = {
        'simple': sum(1 for c in complexities if c < 0.3),
        'medium': sum(1 for c in complexities if 0.3 <= c < 0.7),
        'complex': sum(1 for c in complexities if c >= 0.7)
    }
    
    return {
        'intent_distribution': dict(intent_dist.most_common()),
        'complexity_distribution': complexity_dist
    }
\`\`\`

评测集应按照生产环境的分布进行采样或加权。

### 区分度原则

好的评测集应能有效区分不同能力水平的模型。回到招聘的比喻：如果面试题太简单，每个候选人都能拿满分，你就没法筛选出最优秀的那个；反之如果太难，每个人都交白卷，同样无法区分。好的试卷应该让不同水平的候选人拉开差距：

- 避免过于简单的题目（所有模型都能答对，没有区分价值）
- 避免过于困难的题目（所有模型都答错，同样无法区分）
- 设置不同难度梯度（就像高考试卷的“基础题—中等题—压轴题”配比）

\`\`\`python
def calculate_discrimination(item_scores):
    """计算题目区分度"""
    # 将考生按总分分为高分组和低分组
    n = len(item_scores)
    high_group = item_scores[:n//3]  # 前1/3
    low_group = item_scores[-n//3:]   # 后1/3
    
    # 区分度 = 高分组正确率 - 低分组正确率
    discrimination = np.mean(high_group) - np.mean(low_group)
    
    # 区分度解释
    # > 0.4: 很好
    # 0.3-0.4: 良好
    # 0.2-0.3: 可接受
    # < 0.2: 需修改
    
    return discrimination
\`\`\`

### 可扩展性原则

评测框架应支持持续迭代。在实际项目中，业务需求是不断变化的——今天可能加了新的产品线，明天可能改了客服话术规范。你的评测集必须能够跟上这种变化，而不是“一锤子买卖”。以下是一个支持版本管理和增量更新的评测集框架：

\`\`\`python
class EvalDataset:
    def __init__(self, version='1.0'):
        self.version = version
        self.items = []
        self.metadata = {
            'created_at': datetime.now(),
            'version': version,
            'categories': set()
        }
        
    def add_item(self, item):
        """添加评测项"""
        item['id'] = self._generate_id()
        item['added_version'] = self.version
        self.items.append(item)
        self.metadata['categories'].add(item.get('category', 'default'))
        
    def filter_by_version(self, min_version):
        """按版本筛选"""
        return [item for item in self.items 
                if item['added_version'] >= min_version]
        
    def get_subset(self, category=None, difficulty=None, n_samples=None):
        """获取子集"""
        subset = self.items
        if category:
            subset = [x for x in subset if x.get('category') == category]
        if difficulty:
            subset = [x for x in subset if x.get('difficulty') == difficulty]
        if n_samples and len(subset) > n_samples:
            subset = random.sample(subset, n_samples)
        return subset
\`\`\`

## 数据收集方法

### 从生产日志提取

真实用户查询是最有价值的评测数据来源。这就像一家餐厅想知道菜品好不好吃，与其自己在后厨试吃，不如直接看顾客的真实反馈——哪些菜点的多、哪些菜被退回、哪些菜被反复追问"这个能不能不放辣"。同理，从生产日志里挖掘出的真实用户问题，最能反映模型在实战中的真实表现：

\`\`\`python
def extract_eval_candidates(logs, min_quality_score=0.7):
    """从生产日志中提取评测候选"""
    candidates = []
    
    for log in logs:
        # 过滤低质量交互
        if log.get('user_rating', 0) < 3:
            continue
            
        # 提取有明确答案的查询
        if log.get('has_ground_truth', False):
            candidates.append({
                'query': log['query'],
                'reference': log['response'],
                'context': log.get('context'),
                'metadata': {
                    'source': 'production',
                    'timestamp': log['timestamp'],
                    'user_rating': log.get('user_rating')
                }
            })
            
    # 去重
    candidates = deduplicate(candidates, key='query')
    
    return candidates
\`\`\`

### 专家标注

领域专家提供高质量的问答对。如果生产日志是"顾客反馈"，那专家标注就是"米其林评审员"的专业评价。专家能够构造出那些生产环境中不常见、但一旦出现就很关键的边界场景：

\`\`\`python
# 标注任务模板
annotation_template = {
    'task_id': str,
    'query': str,
    'expected_answer': str,
    'acceptable_variants': list,  # 可接受的答案变体
    'difficulty': ['easy', 'medium', 'hard'],
    'category': str,
    'reasoning_required': bool,
    'annotator_notes': str,
    'quality_check': {
        'reviewed_by': str,
        'review_date': str,
        'approved': bool
    }
}
\`\`\`

### 合成数据生成

利用规则或模型生成评测数据。当真实数据不够用时，可以让一个更强的模型来帮忙"出题"——就像让一位资深教师根据教学大纲编写练习题。不过要注意，合成数据的质量必须经过人工核查，否则就像让AI自己出题自己答——题目和答案里的错误可能会“共谋”而难以发现：

\`\`\`python
def generate_synthetic_qa(seed_data, model, n_samples=100):
    """合成问答数据"""
    generated = []
    
    for seed in seed_data:
        prompt = f"""
基于以下信息生成一个问答对：

背景知识：{seed['knowledge']}
主题：{seed['topic']}
难度：{seed['difficulty']}

请生成：
1. 一个自然的用户问题
2. 准确、完整的答案
3. 该问题测试的能力点

输出JSON格式：
{{"question": "...", "answer": "...", "skill_tested": "..."}}
"""
        response = model.generate(prompt)
        qa = json.loads(response)
        qa['source'] = 'synthetic'
        qa['seed_id'] = seed['id']
        generated.append(qa)
        
    return generated
\`\`\`

### 对抗样本构造

创建挑战模型弱点的测试用例。这是评测集中最“恶意”但也最有价值的部分——专门找模型的软肋下手。就像一个好的临床考试不会只考常见病，还会故意出一些容易混淆的症状描述、带有误导性信息的病例，看你会不会被带偏：

\`\`\`python
def create_adversarial_samples(original_samples, attack_types):
    """构造对抗样本"""
    adversarial = []
    
    for sample in original_samples:
        for attack in attack_types:
            if attack == 'typo':
                # 引入拼写错误
                perturbed = introduce_typos(sample['query'])
            elif attack == 'paraphrase':
                # 同义改写
                perturbed = paraphrase(sample['query'])
            elif attack == 'negation':
                # 添加否定
                perturbed = add_negation(sample['query'])
            elif attack == 'distractor':
                # 添加干扰信息
                perturbed = add_distractor(sample['query'])
                
            adversarial.append({
                'query': perturbed,
                'original_query': sample['query'],
                'expected_answer': sample['expected_answer'],
                'attack_type': attack
            })
            
    return adversarial
\`\`\`

## 标注规范设计

### 标注指南示例

\`\`\`markdown
# 客服对话评测标注指南 v1.0

## 任务描述
评估模型回复是否满足客服场景的质量要求

## 评分维度

### 1. 准确性 (1-5分)
- 5分：完全正确，无事实错误
- 4分：基本正确，有轻微不准确
- 3分：部分正确，有明显错误但核心正确
- 2分：大部分错误，仅少量正确
- 1分：完全错误或无关

### 2. 完整性 (1-5分)
- 5分：完整回答所有问题点
- 4分：回答主要问题，遗漏次要点
- 3分：回答部分问题
- 2分：回答不完整，遗漏重要信息
- 1分：几乎未回答问题

### 3. 话术规范 (1-5分)
- 5分：完全符合客服话术规范
- 4分：基本符合，有轻微偏差
- 3分：部分符合
- 2分：多处不符合
- 1分：严重违反规范

### 4. 安全性 (通过/不通过)
- 通过：无敏感信息泄露、无误导性内容
- 不通过：存在安全风险

## 标注示例

[示例1]
用户：我的订单什么时候到？
模型：根据物流信息，您的订单预计明天下午送达。
准确性：4（假设物流信息正确）
完整性：4（未提供物流单号）
话术规范：5
安全性：通过
\`\`\`

### 标注质量控制

\`\`\`python
class AnnotationQualityControl:
    def __init__(self, min_agreement=0.8):
        self.min_agreement = min_agreement
        
    def calculate_inter_annotator_agreement(self, annotations):
        """计算标注者一致性（Cohen's Kappa）"""
        from sklearn.metrics import cohen_kappa_score
        
        annotator_pairs = list(combinations(annotations.keys(), 2))
        kappa_scores = []
        
        for a1, a2 in annotator_pairs:
            labels1 = [annotations[a1][item_id] for item_id in sorted(annotations[a1])]
            labels2 = [annotations[a2][item_id] for item_id in sorted(annotations[a2])]
            kappa = cohen_kappa_score(labels1, labels2)
            kappa_scores.append(kappa)
            
        return np.mean(kappa_scores)
        
    def adjudicate_disagreements(self, annotations, threshold=2):
        """处理标注分歧"""
        adjudicated = {}
        
        for item_id in annotations:
            labels = [ann[item_id] for ann in annotations.values()]
            
            if max(labels) - min(labels) > threshold:
                # 分歧过大，需要专家仲裁
                adjudicated[item_id] = {
                    'status': 'needs_review',
                    'labels': labels
                }
            else:
                # 取众数或均值
                adjudicated[item_id] = {
                    'status': 'resolved',
                    'final_label': statistics.median(labels)
                }
                
        return adjudicated
\`\`\`

## 评测指标设计

### 任务特定指标

\`\`\`python
class CustomMetrics:
    @staticmethod
    def intent_accuracy(predictions, references):
        """意图识别准确率"""
        correct = sum(p['intent'] == r['intent'] 
                     for p, r in zip(predictions, references))
        return correct / len(predictions)
        
    @staticmethod
    def slot_f1(predictions, references):
        """槽位填充F1"""
        true_positives = 0
        pred_count = 0
        ref_count = 0
        
        for p, r in zip(predictions, references):
            pred_slots = set(p.get('slots', {}).items())
            ref_slots = set(r.get('slots', {}).items())
            
            true_positives += len(pred_slots & ref_slots)
            pred_count += len(pred_slots)
            ref_count += len(ref_slots)
            
        precision = true_positives / pred_count if pred_count else 0
        recall = true_positives / ref_count if ref_count else 0
        f1 = 2 * precision * recall / (precision + recall) if (precision + recall) else 0
        
        return f1
        
    @staticmethod
    def safety_rate(predictions, safety_checker):
        """安全通过率"""
        safe_count = sum(safety_checker(p['response']) for p in predictions)
        return safe_count / len(predictions)
        
    @staticmethod
    def format_compliance(predictions, format_spec):
        """格式合规率"""
        compliant = sum(validate_format(p['response'], format_spec) 
                       for p in predictions)
        return compliant / len(predictions)
\`\`\`

### LLM-as-Judge评测

使用大模型作为评判者进行主观维度评测。这是一个非常巧妙的思路：既然人工评分成本高、耗时长，为什么不用一个更强的模型来当"考官"呢？这就像让一位资深主管来评估初级员工的工作成果。不过要注意，LLM评判者自身也有偏见（比如偏好更长的回答、偏好自己风格的回答），因此多评判者共识机制很重要：

\`\`\`python
def llm_judge_evaluate(model_output, reference, judge_model, criteria):
    """使用LLM作为评判者"""
    prompt = f"""
请作为专业评审员，评估以下回答的质量。

【问题】
{model_output['query']}

【标准答案】
{reference}

【待评估回答】
{model_output['response']}

【评分标准】
{criteria}

请按照以下格式输出评分：
1. 各维度分数（1-5分）
2. 总体评价
3. 改进建议

输出JSON格式：
{{
    "scores": {{"准确性": X, "完整性": X, "流畅性": X}},
    "overall": X,
    "comments": "..."
}}
"""
    
    judge_response = judge_model.generate(prompt, temperature=0)
    return json.loads(judge_response)


def multi_judge_consensus(model_output, reference, judges, criteria):
    """多评判者共识"""
    scores = []
    
    for judge in judges:
        score = llm_judge_evaluate(model_output, reference, judge, criteria)
        scores.append(score)
        
    # 计算平均分并检测异常值
    avg_scores = {}
    for key in scores[0]['scores']:
        values = [s['scores'][key] for s in scores]
        avg_scores[key] = np.mean(values)
        
        # 检测异常（偏离均值超过1.5分）
        if max(values) - min(values) > 1.5:
            print(f"Warning: Large disagreement on {key}")
            
    return avg_scores
\`\`\`

## 评测集管理

### 版本控制

\`\`\`python
class BenchmarkVersion:
    def __init__(self, version_id, parent_version=None):
        self.version_id = version_id
        self.parent_version = parent_version
        self.items = []
        self.changelog = []
        
    def add_items(self, items, reason):
        """添加新题目"""
        self.items.extend(items)
        self.changelog.append({
            'action': 'add',
            'count': len(items),
            'reason': reason,
            'timestamp': datetime.now()
        })
        
    def remove_items(self, item_ids, reason):
        """移除题目"""
        self.items = [x for x in self.items if x['id'] not in item_ids]
        self.changelog.append({
            'action': 'remove',
            'count': len(item_ids),
            'reason': reason,
            'timestamp': datetime.now()
        })
        
    def export(self, path):
        """导出评测集"""
        data = {
            'version': self.version_id,
            'parent': self.parent_version,
            'items': self.items,
            'changelog': self.changelog,
            'statistics': self.get_statistics()
        }
        with open(path, 'w') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
\`\`\`

### 数据污染防护

\`\`\`python
class ContaminationGuard:
    def __init__(self, benchmark_data):
        self.benchmark_hashes = self._compute_hashes(benchmark_data)
        
    def _compute_hashes(self, data):
        """计算评测数据的指纹"""
        import hashlib
        hashes = set()
        
        for item in data:
            # 对问题文本计算hash
            text = item['query'].lower().strip()
            h = hashlib.md5(text.encode()).hexdigest()
            hashes.add(h)
            
            # n-gram hash
            words = text.split()
            for n in [5, 10, 15]:
                for i in range(len(words) - n + 1):
                    ngram = ' '.join(words[i:i+n])
                    h = hashlib.md5(ngram.encode()).hexdigest()
                    hashes.add(h)
                    
        return hashes
        
    def check_training_data(self, training_texts):
        """检查训练数据是否包含评测数据"""
        contaminated = []
        
        for i, text in enumerate(training_texts):
            text_hash = hashlib.md5(text.lower().strip().encode()).hexdigest()
            if text_hash in self.benchmark_hashes:
                contaminated.append(i)
                
        contamination_rate = len(contaminated) / len(training_texts)
        return {
            'contaminated_indices': contaminated,
            'contamination_rate': contamination_rate
        }
\`\`\`

## 完整评测集构建流程

下图展示了构建自定义Benchmark的完整流程：

\`\`\`mermaid
graph TD
    A[需求分析] --> B[数据收集]
    B --> B1[生产日志提取]
    B --> B2[专家标注]
    B --> B3[合成数据生成]
    B1 --> C[数据清洗与去重]
    B2 --> C
    B3 --> C
    C --> D[质量筛选与难度标注]
    D --> E[平衡采样]
    E --> F[标注验证]
    F --> G[版本发布]
\`\`\`

\`\`\`python
def build_custom_benchmark(config):
    """构建自定义评测集的完整流程"""
    
    # 1. 数据收集
    print("Step 1: Collecting data...")
    production_data = collect_from_logs(config['log_path'])
    expert_data = load_expert_annotations(config['annotation_path'])
    synthetic_data = generate_synthetic(config['seed_data'], config['model'])
    
    # 2. 数据清洗
    print("Step 2: Cleaning data...")
    all_data = production_data + expert_data + synthetic_data
    cleaned_data = clean_and_deduplicate(all_data)
    
    # 3. 质量筛选
    print("Step 3: Quality filtering...")
    filtered_data = filter_by_quality(cleaned_data, min_score=config['min_quality'])
    
    # 4. 难度标注
    print("Step 4: Difficulty annotation...")
    for item in filtered_data:
        item['difficulty'] = estimate_difficulty(item)
        
    # 5. 平衡采样
    print("Step 5: Balanced sampling...")
    balanced_data = stratified_sample(
        filtered_data,
        strata=['category', 'difficulty'],
        target_size=config['target_size']
    )
    
    # 6. 标注验证
    print("Step 6: Annotation verification...")
    verified_data = verify_annotations(balanced_data, config['validators'])
    
    # 7. 创建评测集
    print("Step 7: Creating benchmark...")
    benchmark = BenchmarkVersion(version_id=config['version'])
    benchmark.add_items(verified_data, reason='Initial creation')
    
    # 8. 导出
    print("Step 8: Exporting...")
    benchmark.export(config['output_path'])
    
    # 9. 生成报告
    print("Step 9: Generating report...")
    report = generate_benchmark_report(benchmark)
    
    return benchmark, report
\`\`\`

总结一下，构建自定义Benchmark的过程很像设计一场高质量的招聘考试：你需要明确岗位能力要求（业务场景分析）、出一套有区分度的试卷（题目设计）、让多个考官交叉评分（质量控制）、并且随着业务发展持续更新题库（版本迭代）。通过这样科学的评测集设计和严格的质量控制，自定义Benchmark能够为特定业务场景提供精准的模型能力评估，有效指导模型的迭代优化和选型决策。
`
    },
    {
      id: "adv-12-05-eval-framework",
      title: "12.5 评测框架",
      file: "大模型教程/12-评测技术/04-评测框架.md",
      difficulty: "中级-高级",
      duration: "1h",
      week: 0,
      phase: 0,
      keywords: ["评测框架", "OpenCompass", "EvalScope", "VLMEvalKit", "Benchmark", "LLM"],
      content: `# 评测框架

大模型评测涉及数据加载、推理执行、指标计算、结果聚合等多个环节。专业的评测框架将这些环节标准化、模块化，大幅提升评测效率和可复现性。本节将介绍三个主流评测框架：OpenCompass、EvalScope和VLMEvalKit。

在实际项目中，手工搞评测就像用算盘做会计——理论上能完成，但效率低且容易出错。评测框架就是你的“财务软件”：它把数据加载、模型推理、分数计算、报表生成这些繁琐工作全部自动化，你只需要配置好“要考什么”和“考谁”，剩下的交给框架来处理。

下图展示了评测框架的通用流水线：

\`\`\`mermaid
graph LR
    A[选择Benchmark] --> B[数据准备]
    B --> C[模型推理]
    C --> D[自动评分]
    D --> E[结果聚合]
    E --> F[可视化报告]
    C -.->|多模型对比| C
    D -.->|LLM-as-Judge| D
\`\`\`

## OpenCompass

OpenCompass是由上海人工智能实验室开发的开源大模型评测平台，支持100+评测数据集和多种主流模型。如果把评测框架比作考试系统，OpenCompass就是那个"题库最全、考场最正规"的考试院——它背后有学术界的深度支持，几乎每个主流Benchmark都能在这里找到。

### 核心架构

OpenCompass采用模块化设计，主要包含以下组件。整个架构就像一个考试管理系统：configs是"考试计划"，datasets是"题库"，models是"考生接口"，metrics是"评分标准"，summarizers是"成绩单生成器"：

\`\`\`
OpenCompass
├── configs/           # 配置文件
│   ├── datasets/     # 数据集配置
│   ├── models/       # 模型配置
│   └── eval_*.py     # 评测任务配置
├── opencompass/
│   ├── datasets/     # 数据集加载器
│   ├── models/       # 模型适配器
│   ├── tasks/        # 任务执行器
│   ├── metrics/      # 评测指标
│   └── summarizers/  # 结果汇总器
└── data/             # 数据存储
\`\`\`

### 安装与配置

\`\`\`bash
# 克隆仓库
git clone https://github.com/open-compass/opencompass.git
cd opencompass

# 安装依赖
pip install -e .

# 下载数据集
python tools/download_data.py
\`\`\`

### 基础使用

运行单个评测任务：

\`\`\`bash
# 评测Qwen模型在MMLU上的表现
python run.py \\
    --models qwen/Qwen2.5-7B-Instruct \\
    --datasets mmlu \\
    --work-dir outputs/qwen-mmlu
\`\`\`

### 配置文件编写

OpenCompass使用Python配置文件定义评测任务：

\`\`\`python
# configs/eval_qwen_comprehensive.py

from mmengine.config import read_base

with read_base():
    # 引入数据集配置
    from .datasets.mmlu.mmlu_gen import mmlu_datasets
    from .datasets.gsm8k.gsm8k_gen import gsm8k_datasets
    from .datasets.humaneval.humaneval_gen import humaneval_datasets
    
    # 引入模型配置
    from .models.qwen.qwen2_5_7b_instruct import models

# 组合数据集
datasets = mmlu_datasets + gsm8k_datasets + humaneval_datasets

# 评测配置
work_dir = './outputs/qwen_comprehensive'

# 推理配置
infer_cfg = dict(
    inferencer=dict(
        type='GenInferencer',
        max_out_len=512,
    ),
    runner=dict(
        type='LocalRunner',
        max_num_workers=4,
        task=dict(type='OpenICLInferTask'),
    ),
)
\`\`\`

### 自定义模型适配

\`\`\`python
# opencompass/models/my_custom_model.py

from opencompass.models.base import BaseModel

class MyCustomModel(BaseModel):
    def __init__(self, model_path, **kwargs):
        super().__init__(**kwargs)
        self.model = self._load_model(model_path)
        
    def _load_model(self, path):
        from transformers import AutoModelForCausalLM, AutoTokenizer
        self.tokenizer = AutoTokenizer.from_pretrained(path)
        return AutoModelForCausalLM.from_pretrained(path)
        
    def generate(self, inputs, max_out_len=512, **kwargs):
        """生成接口"""
        encoded = self.tokenizer(inputs, return_tensors='pt', padding=True)
        outputs = self.model.generate(
            **encoded,
            max_new_tokens=max_out_len,
            **kwargs
        )
        return self.tokenizer.batch_decode(outputs, skip_special_tokens=True)
        
    def get_ppl(self, inputs, mask_length=None):
        """计算困惑度"""
        # 实现困惑度计算逻辑
        pass
\`\`\`

### 自定义数据集

\`\`\`python
# opencompass/datasets/my_dataset.py

from datasets import load_dataset
from opencompass.datasets.base import BaseDataset
from opencompass.registry import LOAD_DATASET

@LOAD_DATASET.register_module()
class MyCustomDataset(BaseDataset):
    @staticmethod
    def load(path):
        dataset = load_dataset('json', data_files=path)
        
        def format_item(item):
            return {
                'input': f"Question: {item['question']}\\nAnswer:",
                'output': item['answer'],
                'category': item.get('category', 'default')
            }
            
        return dataset.map(format_item)
\`\`\`

### 分布式评测

OpenCompass支持多机多卡分布式评测。当你需要评测一个72B参数的大模型时，单张GPU可能连模型都加载不下，更别说跑完整个评测集。这时候分布式评测就像把一场大考试分成多个考场同时进行，大大缩短总时间：

\`\`\`bash
# 使用Slurm调度
python run.py \\
    --models qwen/Qwen2.5-72B-Instruct \\
    --datasets mmlu ceval gsm8k \\
    --slurm \\
    --partition gpu \\
    --quotatype auto \\
    -a $ACCOUNT
\`\`\`

### 结果分析

\`\`\`python
# 读取评测结果
import json
from pathlib import Path

results_dir = Path('outputs/qwen_comprehensive')
summary_path = results_dir / 'summary' / 'summary.json'

with open(summary_path) as f:
    summary = json.load(f)
    
# 分析各数据集表现
for dataset, scores in summary['results'].items():
    print(f"{dataset}: {scores['accuracy']:.2%}")
\`\`\`

## EvalScope

EvalScope是阿里巴巴ModelScope团队开发的评测框架，与ModelScope生态深度集成，支持大模型和多模态模型评测。如果说OpenCompass是"学术派考试院"，EvalScope就像是"企业内部的能力评估中心"——它的优势在于与ModelScope Hub无缝对接，加上独特的Arena竞技场评测功能，让你可以直接让两个模型"当场对决"。

### 核心特性

- 与ModelScope Hub无缝集成
- 支持Arena竞技场评测
- 内置多种评测报告生成
- 支持自定义评测流程

### 安装

\`\`\`bash
pip install evalscope

# 安装可选依赖（多模态评测）
pip install evalscope[vlm]
\`\`\`

### 基础用法

\`\`\`python
from evalscope import Evaluator

# 创建评估器
evaluator = Evaluator(
    model_id='Qwen/Qwen2.5-7B-Instruct',
    datasets=['mmlu', 'gsm8k', 'humaneval'],
    output_dir='./eval_results'
)

# 运行评测
results = evaluator.run()

# 查看结果
print(results.summary())
\`\`\`

### 命令行使用

\`\`\`bash
# 基础评测
evalscope run \\
    --model Qwen/Qwen2.5-7B-Instruct \\
    --datasets mmlu gsm8k \\
    --output-dir ./results

# 指定评测参数
evalscope run \\
    --model Qwen/Qwen2.5-7B-Instruct \\
    --datasets mmlu \\
    --num-fewshot 5 \\
    --batch-size 8 \\
    --max-length 2048
\`\`\`

### 自定义评测任务

\`\`\`python
from evalscope import EvalTask, Dataset, Metric

# 定义自定义数据集
class CustomerServiceDataset(Dataset):
    def __init__(self, data_path):
        self.data = self._load_data(data_path)
        
    def _load_data(self, path):
        import json
        with open(path) as f:
            return [json.loads(line) for line in f]
            
    def __len__(self):
        return len(self.data)
        
    def __getitem__(self, idx):
        item = self.data[idx]
        return {
            'input': item['query'],
            'reference': item['response'],
            'metadata': item.get('metadata', {})
        }

# 定义自定义指标
class ServiceQualityMetric(Metric):
    def compute(self, predictions, references):
        scores = []
        for pred, ref in zip(predictions, references):
            # 多维度评分
            accuracy = self._score_accuracy(pred, ref)
            completeness = self._score_completeness(pred, ref)
            politeness = self._score_politeness(pred)
            
            scores.append({
                'accuracy': accuracy,
                'completeness': completeness,
                'politeness': politeness,
                'overall': (accuracy + completeness + politeness) / 3
            })
        return scores

# 创建评测任务
task = EvalTask(
    name='customer_service_eval',
    dataset=CustomerServiceDataset('data/cs_eval.jsonl'),
    metrics=[ServiceQualityMetric()],
    prompt_template="请回答用户问题：{input}\\n回答："
)

# 运行评测
from evalscope import Evaluator
evaluator = Evaluator(model_id='Qwen/Qwen2.5-7B-Instruct')
results = evaluator.evaluate(task)
\`\`\`

### Arena评测

EvalScope支持模型对战评测。这是EvalScope最有特色的功能之一——想象一下拳击比赛的赛制，两个模型对同一个问题各自作答，然后由一个更强的"裁判模型"评判谁答得更好。经过多轮对战，用ELO评分系统（和国际象棋等级分一样）给每个模型排名：

\`\`\`python
from evalscope.arena import Arena

# 创建竞技场
arena = Arena(
    models=[
        'Qwen/Qwen2.5-7B-Instruct',
        'meta-llama/Llama-3.1-8B-Instruct',
        'mistralai/Mistral-7B-Instruct-v0.3'
    ],
    judge_model='Qwen/Qwen2.5-72B-Instruct'  # 裁判模型
)

# 单轮对战
result = arena.battle(
    prompt="请解释量子纠缠现象",
    criteria=['准确性', '易懂性', '完整性']
)

print(f"Winner: {result.winner}")
print(f"Scores: {result.scores}")

# 批量对战统计
battle_results = arena.run_battles(
    prompts=test_prompts,
    num_rounds=100
)

# 计算ELO评分
elo_ratings = arena.compute_elo(battle_results)
\`\`\`

### 评测报告生成

\`\`\`python
from evalscope.report import ReportGenerator

# 生成HTML报告
generator = ReportGenerator(results)
generator.generate_html('eval_report.html')

# 生成对比报告
generator.generate_comparison_report(
    baseline_results=baseline,
    current_results=current,
    output_path='comparison_report.html'
)
\`\`\`

## VLMEvalKit

VLMEvalKit专注于视觉语言模型（VLM）的评测，支持主流多模态模型和30+评测基准。前面两个框架主要考的是模型的"读写能力"，而VLMEvalKit考的是模型的"视力"——能不能看懂图片、理解图表、识别文字，这些都是多模态模型特有的能力维度。

### 安装

\`\`\`bash
git clone https://github.com/open-compass/VLMEvalKit.git
cd VLMEvalKit
pip install -e .
\`\`\`

### 支持的评测基准

| 基准 | 类型 | 描述 |
|------|------|------|
| MMBench | 综合 | 多维度多模态能力评测 |
| SEED-Bench | 综合 | 图像和视频理解 |
| MME | 综合 | 感知和认知能力 |
| POPE | 幻觉 | 对象存在性幻觉检测 |
| HallusionBench | 幻觉 | 多维度幻觉评测 |
| OCRBench | OCR | 文字识别能力 |
| TextVQA | VQA | 图像中文字问答 |
| ChartQA | 图表 | 图表理解能力 |

### 基础使用

\`\`\`bash
# 评测单个模型
python run.py \\
    --model qwen-vl-chat \\
    --data MMBench_DEV_EN SEED_IMG

# 指定GPU
CUDA_VISIBLE_DEVICES=0,1 python run.py \\
    --model internvl2-8b \\
    --data MMBench_DEV_CN
\`\`\`

### Python API

\`\`\`python
from vlmeval.config import supported_VLM
from vlmeval.run import run_evaluation

# 查看支持的模型
print(supported_VLM.keys())

# 运行评测
results = run_evaluation(
    model='qwen-vl-chat',
    datasets=['MMBench_DEV_EN', 'SEED_IMG'],
    work_dir='./vlm_results',
    nproc=4
)
\`\`\`

### 自定义多模态模型

\`\`\`python
from vlmeval.vlm.base import BaseModel
from vlmeval.smp import load_image

class MyVLM(BaseModel):
    INSTALL_REQ = True
    INTERLEAVE = False  # 是否支持图文交织
    
    def __init__(self, model_path, **kwargs):
        self.model = self._load_model(model_path)
        self.processor = self._load_processor(model_path)
        
    def generate_inner(self, message, dataset=None):
        """核心生成方法"""
        # 解析消息中的图像和文本
        images = [load_image(m['value']) for m in message if m['type'] == 'image']
        texts = [m['value'] for m in message if m['type'] == 'text']
        
        # 处理输入
        inputs = self.processor(
            images=images,
            text=texts,
            return_tensors='pt'
        )
        
        # 生成输出
        outputs = self.model.generate(**inputs, max_new_tokens=512)
        response = self.processor.decode(outputs[0])
        
        return response
\`\`\`

### 评测配置

\`\`\`python
# vlmeval_config.py

model_configs = {
    'my_vlm': {
        'class': 'MyVLM',
        'model_path': '/path/to/model',
        'max_new_tokens': 512,
        'temperature': 0.0
    }
}

dataset_configs = {
    'custom_vqa': {
        'type': 'VQA',
        'data_path': '/path/to/data.json',
        'image_root': '/path/to/images'
    }
}
\`\`\`

## 框架对比与选型

### 功能对比

| 特性 | OpenCompass | EvalScope | VLMEvalKit |
|------|-------------|-----------|------------|
| 语言模型评测 | ✓ | ✓ | ✗ |
| 多模态评测 | 部分 | ✓ | ✓ |
| 分布式支持 | ✓ | ✓ | ✓ |
| 自定义数据集 | ✓ | ✓ | ✓ |
| Arena对战 | ✗ | ✓ | ✗ |
| 报告生成 | ✓ | ✓ | ✓ |
| ModelScope集成 | ✗ | ✓ | ✗ |
| 评测基准数量 | 100+ | 50+ | 30+ |

### 选型建议

**选择OpenCompass**：
- 需要全面的语言模型评测
- 对评测基准覆盖度要求高
- 需要与学术界评测标准对齐

**选择EvalScope**：
- 使用ModelScope生态
- 需要Arena对战评测
- 需要灵活的自定义评测流程

**选择VLMEvalKit**：
- 专注于多模态模型评测
- 需要丰富的VLM评测基准
- 需要与OpenCompass互补

### 框架集成使用

在实际项目中，可以组合使用多个框架。这就像一家招聘公司可能同时用笔试系统、技能考核系统和综合面试系统——每个系统考察不同维度，综合起来才是全面的评估。以下示例展示了如何将三个框架整合为一个统一的评测流水线：

\`\`\`python
class UnifiedEvaluator:
    def __init__(self, model_path):
        self.model_path = model_path
        
    def evaluate_llm(self, datasets):
        """使用OpenCompass评测语言能力"""
        import subprocess
        cmd = f"python -m opencompass.run --models {self.model_path} --datasets {' '.join(datasets)}"
        subprocess.run(cmd, shell=True)
        
    def evaluate_vlm(self, datasets):
        """使用VLMEvalKit评测多模态能力"""
        from vlmeval.run import run_evaluation
        return run_evaluation(
            model=self.model_path,
            datasets=datasets
        )
        
    def run_arena(self, competitors, prompts):
        """使用EvalScope进行Arena评测"""
        from evalscope.arena import Arena
        arena = Arena(models=[self.model_path] + competitors)
        return arena.run_battles(prompts)
        
    def comprehensive_eval(self):
        """综合评测"""
        results = {}
        
        # 语言能力
        results['language'] = self.evaluate_llm(['mmlu', 'gsm8k', 'humaneval'])
        
        # 多模态能力（如果模型支持）
        if self.supports_vision:
            results['multimodal'] = self.evaluate_vlm(['MMBench', 'SEED_IMG'])
            
        # Arena排名
        results['arena'] = self.run_arena(
            competitors=['baseline_model_1', 'baseline_model_2'],
            prompts=arena_prompts
        )
        
        return results
\`\`\`

总结一下：选择评测框架就像选择工具——没有最好的，只有最合适的。学术研究主用OpenCompass，ModelScope生态内工作选EvalScope，专攻多模态用VLMEvalKit。而在生产环境中，往往需要将多个框架组合使用，才能获得对模型能力的全面认识。通过合理选择和组合评测框架，可以构建完整、高效的模型评测体系，为模型开发和选型提供全面的数据支撑。
`
    },
    {
      id: "adv-12-06-evalscope",
      title: "12.6 实践：使用EvalScope进行模型评估",
      file: "大模型教程/12-评测技术/05-实践EvalScope评估.md",
      difficulty: "中级-高级",
      duration: "1h",
      week: 0,
      phase: 0,
      keywords: ["实践：使用EvalScope进行模型评估", "EvalScope", "Qwen"],
      content: `# 实践：使用EvalScope进行模型评估

本节将通过完整的实践案例，演示如何使用EvalScope评测框架对大模型进行系统评估，包括标准基准评测、自定义数据集评测以及评测结果分析。

假设你的老板说：“我们最近微调了一个Qwen 7B模型做客服，你用EvalScope跑一下评测，明天给我出一份报告。”这就是本节要解决的实际问题——从环境安装到报告生成，手把手走完整个流程。

下图展示了使用EvalScope进行模型评估的完整工作流：

\`\`\`mermaid
graph TD
    A[环境准备] --> B[选择评测数据集]
    B --> C[配置评测参数]
    C --> D[运行模型推理]
    D --> E[自动评分]
    E --> F[结果分析]
    F --> G[生成可视化报告]
    B -.->|标准Benchmark| D
    B -.->|自定义数据集| D
\`\`\`

## 环境准备

### 安装EvalScope

“工欲善其事，必先利其器。”在开始评测之前，先把环境搭建好。建议在一个干净的conda环境中安装，避免依赖冲突：

\`\`\`bash
# 基础安装
pip install evalscope

# 安装完整依赖（包含多模态支持）
pip install evalscope[all]

# 验证安装
python -c "import evalscope; print(evalscope.__version__)"
\`\`\`

### 配置环境

这里有几个常用的环境变量配置。在实际项目中，模型文件往往很大，建议把缓存目录设置到空间充足的磁盘上，否则下载到一半磁盘满了可就尴尬了：

\`\`\`python
import os

# 设置ModelScope缓存目录（可选）
os.environ['MODELSCOPE_CACHE'] = '/data/modelscope_cache'

# 设置GPU
os.environ['CUDA_VISIBLE_DEVICES'] = '0'

# 关闭wandb（可选）
os.environ['WANDB_DISABLED'] = 'true'
\`\`\`

## 基础评测实践

### 评测单个模型

使用命令行进行快速评测。这是最简单的使用方式，一行命令就能跑起来——就像在线考试系统里点一下"开始考试"按钮：

\`\`\`bash
# 评测Qwen2.5-7B在MMLU和GSM8K上的表现
evalscope run \\
    --model Qwen/Qwen2.5-7B-Instruct \\
    --datasets mmlu gsm8k \\
    --output-dir ./eval_results/qwen2.5-7b
\`\`\`

使用Python API进行更灵活的评测。当命令行不够用时（比如你想自定义推理参数、控制few-shot数量、或者在代码里后续处理结果），Python API给你完全的控制权：

\`\`\`python
from evalscope import Evaluator
from evalscope.config import EvalConfig

# 创建评测配置
config = EvalConfig(
    model_id='Qwen/Qwen2.5-7B-Instruct',
    datasets=['mmlu', 'gsm8k', 'humaneval'],
    output_dir='./eval_results',
    
    # 推理参数
    generation_config={
        'max_new_tokens': 512,
        'temperature': 0.0,
        'do_sample': False
    },
    
    # 评测参数
    num_fewshot=5,  # few-shot数量
    batch_size=8,
    
    # 资源配置
    num_gpus=1,
    tensor_parallel_size=1
)

# 创建评估器并运行
evaluator = Evaluator(config)
results = evaluator.run()

# 打印结果摘要
print(results.summary())
\`\`\`

### 评测结果解析

\`\`\`python
import json
from pathlib import Path

def analyze_results(output_dir):
    """分析评测结果"""
    output_path = Path(output_dir)
    
    # 读取各数据集结果
    results = {}
    for result_file in output_path.glob('**/results.json'):
        dataset_name = result_file.parent.name
        with open(result_file) as f:
            results[dataset_name] = json.load(f)
            
    # 汇总统计
    summary = {}
    for dataset, data in results.items():
        summary[dataset] = {
            'accuracy': data.get('accuracy', 0),
            'total_samples': data.get('total', 0),
            'correct_samples': data.get('correct', 0)
        }
        
    return summary

# 分析结果
summary = analyze_results('./eval_results/qwen2.5-7b')
for dataset, metrics in summary.items():
    print(f"{dataset}: {metrics['accuracy']:.2%}")
\`\`\`

## 多模型对比评测

在实际工作中，我们很少只评测一个模型——更常见的场景是老板问"这3个模型哪个最好？"这时候你需要让它们在相同的考试下打分、排名，就像招聘时让多个候选人做同一套笔试题一样。

### 批量评测多个模型

\`\`\`python
from evalscope import BatchEvaluator

# 定义待评测模型列表
models = [
    'Qwen/Qwen2.5-7B-Instruct',
    'Qwen/Qwen2.5-14B-Instruct',
    'meta-llama/Llama-3.1-8B-Instruct'
]

# 定义评测数据集
datasets = ['mmlu', 'gsm8k', 'humaneval', 'hellaswag']

# 批量评测
batch_evaluator = BatchEvaluator(
    models=models,
    datasets=datasets,
    output_dir='./comparison_results'
)

all_results = batch_evaluator.run()

# 生成对比表格
comparison_table = batch_evaluator.generate_comparison_table()
print(comparison_table)
\`\`\`

### 可视化对比结果

数字列表看多了容易眼花，用图表展示更直观。以下代码生成一个热力图，让你一眼就能看出哪个模型在哪个维度上表现最好（颜色越深分数越高）：

\`\`\`python
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

def plot_model_comparison(results, models, datasets):
    """绘制模型对比图"""
    # 构建数据矩阵
    data = []
    for model in models:
        row = []
        for dataset in datasets:
            score = results[model][dataset].get('accuracy', 0)
            row.append(score)
        data.append(row)
        
    df = pd.DataFrame(data, index=models, columns=datasets)
    
    # 绘制热力图
    fig, ax = plt.subplots(figsize=(12, 6))
    im = ax.imshow(df.values, cmap='YlGn', aspect='auto')
    
    # 设置标签
    ax.set_xticks(np.arange(len(datasets)))
    ax.set_yticks(np.arange(len(models)))
    ax.set_xticklabels(datasets, rotation=45, ha='right')
    ax.set_yticklabels([m.split('/')[-1] for m in models])
    
    # 添加数值标注
    for i in range(len(models)):
        for j in range(len(datasets)):
            text = ax.text(j, i, f'{df.values[i, j]:.1%}',
                          ha='center', va='center', color='black')
    
    plt.colorbar(im)
    plt.title('Model Comparison Across Benchmarks')
    plt.tight_layout()
    plt.savefig('model_comparison.png', dpi=150)
    plt.show()

# 绘制对比图
plot_model_comparison(all_results, models, datasets)
\`\`\`

## 自定义数据集评测

标准Benchmark能告诉你模型的“综合学力”，但它回答不了你最关心的问题："在我的业务场景里，这个模型到底行不行？"这就需要自定义评测数据集了。

### 准备评测数据

首先准备符合格式要求的评测数据。这一步就像出考卷一样——你需要明确每道题的题目、参考答案、所属类别和难度等级。注意，参考答案的质量直接决定了评测的可信度——如果标准答案本身就有错，那打分结果就毫无意义了：

\`\`\`python
# 创建自定义评测数据集
import json

eval_data = [
    {
        "id": "001",
        "question": "什么是机器学习中的过拟合？如何避免？",
        "reference": "过拟合是指模型在训练数据上表现很好，但在新数据上表现差的现象。避免方法包括：1）增加训练数据；2）使用正则化；3）早停；4）Dropout；5）数据增强等。",
        "category": "machine_learning",
        "difficulty": "medium"
    },
    {
        "id": "002", 
        "question": "请解释Transformer中的自注意力机制",
        "reference": "自注意力机制通过Query、Key、Value三个矩阵计算序列中各位置之间的关联权重。计算公式为Attention(Q,K,V) = softmax(QK^T/√d_k)V。它使模型能够捕获长距离依赖关系。",
        "category": "deep_learning",
        "difficulty": "hard"
    },
    {
        "id": "003",
        "question": "Python中列表和元组的区别是什么？",
        "reference": "列表(list)是可变的，可以增删改元素；元组(tuple)是不可变的，创建后不能修改。列表用方括号[]，元组用圆括号()。元组的性能略优于列表，且可以作为字典的键。",
        "category": "programming",
        "difficulty": "easy"
    }
]

# 保存为JSONL格式
with open('custom_eval_data.jsonl', 'w', encoding='utf-8') as f:
    for item in eval_data:
        f.write(json.dumps(item, ensure_ascii=False) + '\\n')
\`\`\`

### 定义自定义评测任务

\`\`\`python
from evalscope.datasets import BaseDataset
from evalscope.metrics import BaseMetric
from evalscope.tasks import EvalTask

class TechQADataset(BaseDataset):
    """技术问答评测数据集"""
    
    def __init__(self, data_path):
        super().__init__()
        self.data = self._load_data(data_path)
        
    def _load_data(self, path):
        import json
        data = []
        with open(path, 'r', encoding='utf-8') as f:
            for line in f:
                data.append(json.loads(line))
        return data
        
    def __len__(self):
        return len(self.data)
        
    def __getitem__(self, idx):
        item = self.data[idx]
        return {
            'id': item['id'],
            'input': item['question'],
            'reference': item['reference'],
            'metadata': {
                'category': item.get('category'),
                'difficulty': item.get('difficulty')
            }
        }
        
    def get_prompt_template(self):
        return "请回答以下技术问题：\\n\\n{input}\\n\\n回答："


class TechQAMetric(BaseMetric):
    """技术问答评测指标"""
    
    def __init__(self, use_llm_judge=True, judge_model=None):
        self.use_llm_judge = use_llm_judge
        self.judge_model = judge_model
        
    def compute(self, predictions, references, metadata=None):
        results = []
        
        for pred, ref, meta in zip(predictions, references, metadata or [{}]*len(predictions)):
            if self.use_llm_judge:
                score = self._llm_judge(pred, ref)
            else:
                score = self._rule_based_score(pred, ref)
                
            results.append({
                'score': score,
                'category': meta.get('category'),
                'difficulty': meta.get('difficulty')
            })
            
        return self._aggregate_results(results)
        
    def _llm_judge(self, prediction, reference):
        """使用LLM作为评判者"""
        prompt = f"""
请评估以下回答的质量，与参考答案对比。

问题回答：
{prediction}

参考答案：
{reference}

请从以下维度评分（1-5分）：
1. 准确性：回答是否准确
2. 完整性：是否涵盖了关键点
3. 清晰度：表述是否清晰易懂

输出JSON格式：{{"accuracy": X, "completeness": X, "clarity": X, "overall": X}}
"""
        response = self.judge_model.generate(prompt)
        scores = json.loads(response)
        return scores['overall'] / 5.0  # 归一化到0-1
        
    def _rule_based_score(self, prediction, reference):
        """基于规则的评分"""
        # 关键词匹配
        ref_keywords = set(reference.lower().split())
        pred_keywords = set(prediction.lower().split())
        
        overlap = len(ref_keywords & pred_keywords)
        precision = overlap / len(pred_keywords) if pred_keywords else 0
        recall = overlap / len(ref_keywords) if ref_keywords else 0
        
        f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
        return f1
        
    def _aggregate_results(self, results):
        """聚合结果"""
        import numpy as np
        from collections import defaultdict
        
        # 总体统计
        overall_score = np.mean([r['score'] for r in results])
        
        # 按类别统计
        by_category = defaultdict(list)
        for r in results:
            if r.get('category'):
                by_category[r['category']].append(r['score'])
                
        category_scores = {cat: np.mean(scores) for cat, scores in by_category.items()}
        
        # 按难度统计
        by_difficulty = defaultdict(list)
        for r in results:
            if r.get('difficulty'):
                by_difficulty[r['difficulty']].append(r['score'])
                
        difficulty_scores = {diff: np.mean(scores) for diff, scores in by_difficulty.items()}
        
        return {
            'overall_score': overall_score,
            'by_category': category_scores,
            'by_difficulty': difficulty_scores,
            'num_samples': len(results)
        }
\`\`\`

### 运行自定义评测

\`\`\`python
from evalscope import Evaluator
from evalscope.models import load_model

# 加载评测模型
eval_model = load_model('Qwen/Qwen2.5-7B-Instruct')

# 加载评判模型（用于LLM-as-Judge）
judge_model = load_model('Qwen/Qwen2.5-72B-Instruct')

# 创建数据集和指标
dataset = TechQADataset('custom_eval_data.jsonl')
metric = TechQAMetric(use_llm_judge=True, judge_model=judge_model)

# 创建评测任务
task = EvalTask(
    name='tech_qa_eval',
    dataset=dataset,
    metrics=[metric],
    generation_config={
        'max_new_tokens': 512,
        'temperature': 0.0
    }
)

# 运行评测
evaluator = Evaluator(model=eval_model)
results = evaluator.evaluate(task)

# 输出结果
print("=" * 50)
print("评测结果")
print("=" * 50)
print(f"总体得分: {results['overall_score']:.2%}")
print("\\n按类别得分:")
for cat, score in results['by_category'].items():
    print(f"  {cat}: {score:.2%}")
print("\\n按难度得分:")
for diff, score in results['by_difficulty'].items():
    print(f"  {diff}: {score:.2%}")
\`\`\`

## 评测报告生成

评测跑完了，接下来就是“写报告”了。一份好的评测报告应该让老板一看就明白：模型哪里强、哪里弱、下一步该优化什么。死气沉沉的数字表格谁都不爱看，所以我们要生成图文并茂的报告：

### 生成详细报告

\`\`\`python
from evalscope.report import ReportGenerator
import datetime

class CustomReportGenerator(ReportGenerator):
    def generate_markdown_report(self, results, output_path):
        """生成Markdown格式报告"""
        report = f"""
# 模型评测报告

生成时间: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## 评测概览

| 指标 | 数值 |
|------|------|
| 评测模型 | {results.get('model_id', 'N/A')} |
| 评测样本数 | {results.get('num_samples', 0)} |
| 总体得分 | {results.get('overall_score', 0):.2%} |

## 分类别表现

| 类别 | 得分 | 样本数 |
|------|------|--------|
"""
        for cat, data in results.get('by_category', {}).items():
            report += f"| {cat} | {data['score']:.2%} | {data['count']} |\\n"

        report += f"""
## 分难度表现

| 难度 | 得分 | 样本数 |
|------|------|--------|
"""
        for diff, data in results.get('by_difficulty', {}).items():
            report += f"| {diff} | {data['score']:.2%} | {data['count']} |\\n"

        report += """
## 错误分析

### 低分样本示例

"""
        for example in results.get('low_score_examples', [])[:5]:
            report += f"""
**问题**: {example['question']}

**模型回答**: {example['prediction']}

**参考答案**: {example['reference']}

**得分**: {example['score']:.2f}

---
"""

        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(report)
            
        return report

# 生成报告
report_gen = CustomReportGenerator()
report = report_gen.generate_markdown_report(results, 'eval_report.md')
print("报告已生成: eval_report.md")
\`\`\`

### 生成可视化报告

除了文字报告，图表往往更能打动人。以下代码生成三种可视化图表：总体得分仪表盘（一眼看到及格与否）、分类别雷达图（哪个维度强哪个弱）、分难度柱状图（难题到底能不能做）：

\`\`\`python
import matplotlib.pyplot as plt
import numpy as np

def generate_visual_report(results, output_dir='./reports'):
    """生成可视化评测报告"""
    import os
    os.makedirs(output_dir, exist_ok=True)
    
    # 1. 总体得分仪表盘
    fig, ax = plt.subplots(figsize=(6, 6))
    score = results['overall_score']
    
    # 绘制环形图
    colors = ['#2ecc71' if score >= 0.8 else '#f39c12' if score >= 0.6 else '#e74c3c', '#ecf0f1']
    ax.pie([score, 1-score], colors=colors, startangle=90, 
           wedgeprops={'width': 0.3, 'edgecolor': 'white'})
    ax.text(0, 0, f'{score:.1%}', ha='center', va='center', fontsize=32, fontweight='bold')
    ax.set_title('Overall Score', fontsize=16, pad=20)
    plt.savefig(f'{output_dir}/overall_score.png', dpi=150, bbox_inches='tight')
    plt.close()
    
    # 2. 分类别雷达图
    categories = list(results['by_category'].keys())
    scores = [results['by_category'][cat]['score'] for cat in categories]
    
    angles = np.linspace(0, 2 * np.pi, len(categories), endpoint=False).tolist()
    scores_plot = scores + [scores[0]]
    angles += angles[:1]
    
    fig, ax = plt.subplots(figsize=(8, 8), subplot_kw=dict(polar=True))
    ax.fill(angles, scores_plot, alpha=0.25)
    ax.plot(angles, scores_plot, 'o-', linewidth=2)
    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(categories)
    ax.set_ylim(0, 1)
    ax.set_title('Performance by Category', size=16, y=1.1)
    plt.savefig(f'{output_dir}/category_radar.png', dpi=150, bbox_inches='tight')
    plt.close()
    
    # 3. 难度分布柱状图
    difficulties = list(results['by_difficulty'].keys())
    diff_scores = [results['by_difficulty'][d]['score'] for d in difficulties]
    
    fig, ax = plt.subplots(figsize=(8, 5))
    bars = ax.bar(difficulties, diff_scores, color=['#27ae60', '#f39c12', '#e74c3c'])
    ax.set_ylabel('Score')
    ax.set_xlabel('Difficulty')
    ax.set_ylim(0, 1)
    ax.set_title('Performance by Difficulty')
    
    for bar, score in zip(bars, diff_scores):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.02,
                f'{score:.1%}', ha='center', va='bottom')
    
    plt.savefig(f'{output_dir}/difficulty_bar.png', dpi=150, bbox_inches='tight')
    plt.close()
    
    print(f"可视化报告已生成到 {output_dir}/")

# 生成可视化报告
generate_visual_report(results)
\`\`\`

## 完整评测流程示例

以下是一个完整的评测脚本，整合了上述所有步骤。在实际工作中，你可以把这个脚本当作模板，根据自己的业务需求修改参数。就像有了一套“评测流水线”，以后每次要评测新模型，只需要改一下模型名字和数据路径，就能自动跑完全部流程并出报告：

\`\`\`python
#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
完整的模型评测流程示例
"""

import argparse
import json
import os
from datetime import datetime
from pathlib import Path

from evalscope import Evaluator
from evalscope.config import EvalConfig
from evalscope.models import load_model


def parse_args():
    parser = argparse.ArgumentParser(description='Model Evaluation Script')
    parser.add_argument('--model', type=str, required=True, help='Model ID or path')
    parser.add_argument('--datasets', nargs='+', default=['mmlu', 'gsm8k'])
    parser.add_argument('--custom-data', type=str, help='Path to custom eval data')
    parser.add_argument('--output-dir', type=str, default='./eval_outputs')
    parser.add_argument('--num-fewshot', type=int, default=5)
    parser.add_argument('--batch-size', type=int, default=8)
    parser.add_argument('--use-llm-judge', action='store_true')
    parser.add_argument('--judge-model', type=str, default='Qwen/Qwen2.5-72B-Instruct')
    return parser.parse_args()


def run_standard_eval(model_id, datasets, config):
    """运行标准基准评测"""
    print(f"\\n{'='*50}")
    print(f"Running standard benchmark evaluation")
    print(f"{'='*50}")
    
    eval_config = EvalConfig(
        model_id=model_id,
        datasets=datasets,
        output_dir=config['output_dir'],
        num_fewshot=config['num_fewshot'],
        batch_size=config['batch_size'],
        generation_config={
            'max_new_tokens': 512,
            'temperature': 0.0
        }
    )
    
    evaluator = Evaluator(eval_config)
    results = evaluator.run()
    
    return results


def run_custom_eval(model, data_path, config):
    """运行自定义数据评测"""
    print(f"\\n{'='*50}")
    print(f"Running custom dataset evaluation")
    print(f"{'='*50}")
    
    # 加载自定义数据
    dataset = TechQADataset(data_path)
    
    # 设置评测指标
    if config.get('use_llm_judge'):
        judge_model = load_model(config['judge_model'])
        metric = TechQAMetric(use_llm_judge=True, judge_model=judge_model)
    else:
        metric = TechQAMetric(use_llm_judge=False)
    
    # 创建评测任务
    task = EvalTask(
        name='custom_eval',
        dataset=dataset,
        metrics=[metric]
    )
    
    evaluator = Evaluator(model=model)
    results = evaluator.evaluate(task)
    
    return results


def save_results(results, output_dir):
    """保存评测结果"""
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    # 保存JSON结果
    results_file = output_path / 'results.json'
    with open(results_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    # 生成Markdown报告
    report_file = output_path / 'report.md'
    report_gen = CustomReportGenerator()
    report_gen.generate_markdown_report(results, str(report_file))
    
    # 生成可视化报告
    generate_visual_report(results, str(output_path / 'visualizations'))
    
    print(f"\\nResults saved to {output_dir}")


def main():
    args = parse_args()
    
    # 创建输出目录
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    output_dir = Path(args.output_dir) / f"{args.model.replace('/', '_')}_{timestamp}"
    
    config = {
        'output_dir': str(output_dir),
        'num_fewshot': args.num_fewshot,
        'batch_size': args.batch_size,
        'use_llm_judge': args.use_llm_judge,
        'judge_model': args.judge_model
    }
    
    all_results = {
        'model_id': args.model,
        'timestamp': timestamp,
        'config': config
    }
    
    # 运行标准基准评测
    if args.datasets:
        standard_results = run_standard_eval(args.model, args.datasets, config)
        all_results['standard_benchmarks'] = standard_results
    
    # 运行自定义数据评测
    if args.custom_data:
        model = load_model(args.model)
        custom_results = run_custom_eval(model, args.custom_data, config)
        all_results['custom_eval'] = custom_results
    
    # 保存结果
    save_results(all_results, str(output_dir))
    
    # 打印摘要
    print("\\n" + "="*50)
    print("Evaluation Summary")
    print("="*50)
    
    if 'standard_benchmarks' in all_results:
        print("\\nStandard Benchmarks:")
        for dataset, score in all_results['standard_benchmarks'].items():
            print(f"  {dataset}: {score.get('accuracy', 0):.2%}")
    
    if 'custom_eval' in all_results:
        print(f"\\nCustom Evaluation:")
        print(f"  Overall Score: {all_results['custom_eval']['overall_score']:.2%}")


if __name__ == '__main__':
    main()
\`\`\`

运行评测。以下三个命令分别对应三种常见场景：只跑标准基准、只跑自定义数据、以及两者都跑。在实际工作中，建议使用第三种——标准基准让你知道模型的“综合学力”，自定义数据告诉你它在你的业务场景里的真实表现：

\`\`\`bash
# 运行标准基准评测
python eval_script.py \\
    --model Qwen/Qwen2.5-7B-Instruct \\
    --datasets mmlu gsm8k humaneval

# 运行自定义数据评测（使用LLM-as-Judge）
python eval_script.py \\
    --model Qwen/Qwen2.5-7B-Instruct \\
    --custom-data custom_eval_data.jsonl \\
    --use-llm-judge \\
    --judge-model Qwen/Qwen2.5-72B-Instruct

# 完整评测
python eval_script.py \\
    --model Qwen/Qwen2.5-7B-Instruct \\
    --datasets mmlu gsm8k \\
    --custom-data custom_eval_data.jsonl \\
    --use-llm-judge
\`\`\`

通过本节的实践，你应该已经掌握了使用EvalScope进行模型评测的完整流程：从环境搭建到标准评测，从自定义数据集到报告生成。记住，评测不是一次性的事情——每次模型迭代后都应该重新评测，就像每次调整菜谱后都要请顾客试吃一样。只有持续评测，才能确保模型始终朝着业务目标进步。
`
    },
    {
      id: "adv-13-01-intro",
      title: "13.1 智能体技术",
      file: "大模型教程/13-智能体技术/00-引言.md",
      difficulty: "中级-高级",
      duration: "0.5h",
      week: 4,
      phase: 4,
      keywords: ["智能体技术", "Agent", "LLM", "GPT", "Claude"],
      content: `# 智能体技术

在智能体技术蓬勃发展的今天，开发者面临着前所未有的机遇，也面临着选择的困惑。市面上涌现出众多Agent框架，各有千秋，但真正能让开发者从"会用"到"理解"、从"模仿"到"创新"的系统性知识体系却相对匮乏。

智能体（Agent）代表了人工智能从"被动回答"走向"主动行动"的关键跨越。传统的大语言模型更像是一个博学的顾问——你问它问题，它给你答案。而智能体则像是一个能够自主工作的助手——它不仅能理解你的需求，还能规划行动步骤、调用各种工具、与环境交互，并根据反馈调整策略，最终完成复杂任务。

## 智能体的核心要素

一个完整的智能体系统通常包含以下核心组件：

| 组件 | 功能 | 典型实现 |
|------|------|----------|
| 大脑（LLM） | 理解、推理、决策 | GPT-4、Claude、Qwen |
| 记忆（Memory） | 存储历史信息和经验 | 向量数据库、对话历史 |
| 工具（Tools） | 与外部世界交互 | API调用、代码执行、搜索 |
| 规划（Planning） | 任务分解与步骤编排 | ReACT、Plan-and-Execute |

这四个组件相互协作，使智能体能够处理远超简单问答范畴的复杂任务。

## 从LLM到Agent的演进

大语言模型的能力边界决定了智能体的能力上限，但智能体的架构设计决定了这些能力能否被有效释放：

\`\`\`
用户需求
    │
    ▼
┌─────────────┐
│   智能体    │
│  ┌───────┐  │
│  │  LLM  │  │  ← 理解需求，制定计划
│  └───┬───┘  │
│      │      │
│  ┌───▼───┐  │
│  │ 规划器 │  │  ← 分解任务，确定步骤
│  └───┬───┘  │
│      │      │
│  ┌───▼───┐  │
│  │ 执行器 │  │  ← 调用工具，执行动作
│  └───┬───┘  │
│      │      │
│  ┌───▼───┐  │
│  │ 记忆库 │  │  ← 存储经验，持续学习
│  └───────┘  │
└─────────────┘
    │
    ▼
  任务完成
\`\`\`

## 本章学习路径

本章将系统性地介绍智能体技术的理论基础与实践方法：

**基础概念**
- 智能体发展历史：从符号AI到神经网络Agent的演进
- 代码平台与低代码平台：不同开发范式的对比
- ReACT协议：推理与行动的统一框架

**核心技术**
- 记忆、检索与上下文：智能体的"长期记忆"实现
- 多智能体体系：协作、竞争与涌现
- Agentic RL：将强化学习引入智能体优化

**协议与工具**
- OpenAI与Claude协议：主流厂商的函数调用规范
- 工具与MCP协议：标准化的工具调用接口
- RAG技术：检索增强生成的原理与实践

**框架与实践**
- Agent框架讲解：LangChain、LlamaIndex、Dify等
- 实践项目：个人生活助手、MCP Server、Code Agent

## 写给读者的建议

智能体开发是一门实践性极强的技术。建议你：

**动手是关键**：亲自运行每个示例代码，观察输出结果。尝试修改参数和配置，理解它们的影响。遇到问题时，先自己调试和探索。

**从模仿到创新**：开始时可以完全按照示例操作；随着理解的深入，尝试将学到的模式应用到自己的场景中。

**关注设计思想**：不要只停留在"怎么用"的层面，更要理解"为什么这样设计"。掌握了设计思想，才能举一反三，应对各种复杂场景。

**准备工作**：
- Python基础：能够阅读和理解Python代码
- LLM认知：对大语言模型有概念性了解，知道如何获取API
- 开放心态：准备好拥抱新的编程范式

通过本章学习，你将建立起对智能体系统的完整认知，具备独立设计和实现智能体应用的能力。
`
    },
    {
      id: "adv-13-02-agent-history",
      title: "13.2 智能体发展历史",
      file: "大模型教程/13-智能体技术/01-智能体发展历史.md",
      difficulty: "中级-高级",
      duration: "0.5h",
      week: 4,
      phase: 4,
      keywords: ["智能体发展历史", "Agent", "LLM", "MYCIN", "THEN"],
      content: `# 智能体发展历史

智能体（Agent）的概念并非随着大语言模型的兴起才出现。从人工智能诞生之初，研究者就在探索如何构建能够自主感知、决策和行动的系统。

\`\`\`mermaid
graph LR
    A[规则系统<br>1950s-1980s] --> B[反应式智能体<br>1980s-1990s]
    B --> C[强化学习智能体<br>1990s-2010s]
    C --> D[深度学习智能体<br>2013-2020]
    D --> E[LLM智能体<br>2020-至今]
\`\`\`

想象一下，你要雇一个"万能助手"来帮你处理日常事务——订餐、查天气、安排日程、回复邮件。这个助手需要能**理解你的意图**、**自主规划步骤**、**操作各种工具**，甚至在遇到意外时**灵活调整方案**。这正是智能体要解决的问题，而围绕这个目标的探索已经持续了七十多年。理解这段演进历史，有助于我们把握当前Agent技术的本质和未来发展方向。

## 符号主义时代：规则驱动的智能体

### 早期专家系统

1950年代至1980年代，人工智能以符号主义为主流范式。这一时期的智能体本质上是基于规则的推理系统。

假设你是一位刚入职的住院医师，面前有一本厚厚的《临床诊断手册》，里面写满了"如果患者出现症状A和B，则考虑疾病C"这样的规则。你看病的方式就是翻手册、对症状、做判断——这基本上就是早期专家系统的工作方式。

**MYCIN系统（1976）**是医疗诊断领域的经典专家系统，它使用约600条"IF-THEN"规则来诊断血液感染疾病：

\`\`\`
IF: 感染部位是血液
AND: 革兰氏染色为阴性
AND: 形态为杆状
AND: 患者处于免疫抑制状态
THEN: 感染菌可能是假单胞菌（置信度0.6）
\`\`\`

这类系统展现了智能体的雏形——能够根据输入信息进行推理并给出决策建议。但其局限性也很明显：规则需要人工编写，难以处理规则库之外的情况，知识的表示和获取成本极高。

回到那位住院医师的场景：如果来了一个手册上没有的罕见病例，他就束手无策了。而且，要编写一本覆盖所有疾病的完备手册，几乎是不可能完成的任务。这正是符号主义智能体面临的根本困境。

### BDI架构

1980年代末，Michael Bratman提出的BDI（Belief-Desire-Intention）模型为智能体提供了更优雅的理论框架：

| 组件 | 含义 | 作用 |
|------|------|------|
| Belief（信念） | 对世界状态的认知 | 感知和理解环境 |
| Desire（愿望） | 想要达成的目标 | 提供行动动机 |
| Intention（意图） | 决定执行的计划 | 承诺和坚持行动 |

举个日常的例子：你早上醒来，**信念**是"今天是工作日，外面在下雨"，**愿望**是"准时到公司"，于是你形成了**意图**——"带伞、提前出门、坐地铁而不是骑车"。如果半路发现地铁停运，你的信念更新了，意图也随之调整为"打车"。这个"感知—目标—规划—执行—调整"的循环，正是BDI模型描述的核心过程。

\`\`\`mermaid
graph TD
    B[Belief 信念<br>对世界的认知] --> I[Intention 意图<br>决定执行的计划]
    D[Desire 愿望<br>想达成的目标] --> I
    I --> A[Action 行动]
    A --> P[感知环境]
    P --> B
\`\`\`

BDI模型影响深远，至今仍是多智能体系统设计的重要参考。它强调智能体不仅要有目标，还要形成计划并承诺执行，这与后来ReACT等框架的设计理念一脉相承。

## 行为主义时代：反应式智能体

### Brooks的包容架构

1986年，Rodney Brooks提出了与符号主义截然不同的方法论。他认为智能不需要复杂的内部表示，而是源于与环境的直接交互。

这就像一个人走路时的本能反应：你不需要"思考"如何保持平衡、如何避开障碍物，这些行为是分层自动完成的——最底层负责站稳，上一层负责避开障碍，再上一层才决定去哪里。Brooks把这种分层本能式的设计称为包容架构（Subsumption Architecture），将智能体分解为多个层次的行为模块，每层处理特定任务，高层可以"包容"（抑制）低层行为：

\`\`\`
层级3: 探索（发现新区域）
    ↓ 抑制
层级2: 漫游（随机移动）
    ↓ 抑制
层级1: 避障（避免碰撞）
    ↓ 抑制
层级0: 站立（保持平衡）
\`\`\`

这种"行为叠加"的思想影响了后来的机器人控制和游戏AI设计。其核心洞见是：复杂的智能行为可以从简单行为的组合中涌现，而不必依赖中央规划器。

### 强化学习的兴起

1989年，Chris Watkins提出的Q-Learning算法为智能体提供了从环境交互中自主学习的能力。在实际开发中，这意味着智能体不再需要程序员事先写好每条规则，而是像一个学走迷宫的小白鼠一样——走对了给奶酪（奖励），走错了碰壁（惩罚），多试几次自然就找到了最短路径：

$$
Q(s, a) \\leftarrow Q(s, a) + \\alpha \\left[ r + \\gamma \\max_{a'} Q(s', a') - Q(s, a) \\right]
$$

其中：$Q(s, a)$ 为状态-动作价值函数，表示在状态 $s$ 下执行动作 $a$ 的预期累积奖励；$\\alpha \\in (0,1]$ 为学习率，控制新信息覆盖旧估计的程度；$r$ 为执行动作 $a$ 后获得的即时奖励；$\\gamma \\in [0,1]$ 为折扣因子，控制未来奖励的重要程度；$s'$ 为执行动作后进入的新状态；$\\max_{a'} Q(s', a')$ 为新状态下所有可能动作的最大 Q 值。方括号内的表达式 $r + \\gamma \\max_{a'} Q(s', a') - Q(s, a)$ 称为时序差分（TD error），反映实际奖励与预期价值的偏差，智能体通过不断缩小这个偏差来逐步学习最优策略。

这开启了智能体从"被动执行规则"到"主动学习优化"的转变。从"照着菜谱做菜"变成了"不断尝试、自己摸索出好吃的配方"，这是智能体发展史上的一次重大跃迁。

## 深度学习时代：神经网络智能体

### DQN与深度强化学习

2013年，DeepMind的DQN（Deep Q-Network）将深度学习与强化学习结合，在Atari游戏上达到超人类水平。

假设你正在教一个从未见过电子游戏的朋友玩《打砖块》。你不告诉他任何规则，只给他看屏幕画面和分数变化。神奇的是，经过反复尝试，他不仅学会了基本操作，还发现了"把球打到砖块后面让它自动弹跳消除"这样的高级策略。DQN做的就是这件事——智能体直接从像素输入学习游戏策略，无需人工设计特征。

\`\`\`python
# DQN核心思想：用神经网络近似Q函数
class DQN(nn.Module):
    def __init__(self, state_dim, action_dim):
        super().__init__()
        self.fc1 = nn.Linear(state_dim, 128)
        self.fc2 = nn.Linear(128, 128)
        self.fc3 = nn.Linear(128, action_dim)
        
    def forward(self, state):
        x = F.relu(self.fc1(state))
        x = F.relu(self.fc2(x))
        return self.fc3(x)  # Q values for each action
\`\`\`

### AlphaGo与蒙特卡洛树搜索

2016年，AlphaGo击败世界围棋冠军，展示了将深度学习与传统搜索算法结合的威力。其架构整合了：

- **策略网络**：学习人类棋谱，预测落子概率
- **价值网络**：评估棋盘局势
- **蒙特卡洛树搜索**：在策略网络指导下进行前瞻搜索

这种"学习+搜索"的混合架构成为后来许多智能体系统的设计模板。如果说之前的智能体只会"凭经验做决定"或者"蒙头穷举所有可能"，AlphaGo则展示了一种更像人类棋手的思考方式：先凭直觉缩小选择范围，再对最有希望的几步棋进行深入推演。

## LLM时代：语言驱动的智能体

### 从GPT到Agent

2020年后，大语言模型的突破性进展重新定义了智能体的能力边界。GPT-3展示了In-Context Learning能力，模型可以通过少量示例学习新任务，无需微调权重。

这在实际开发中意味着什么？假设你需要构建一个能处理"查航班、定酒店、推荐餐厅"的旅行助手。在以前，你需要为每个功能分别训练模型或编写规则；而现在，同一个大语言模型只需在提示中写清楚"你是一个旅行助手，可以使用以下工具……"，它就能在多种任务间自如切换。这种通用性使得构建真正的通用智能体成为可能。

### ReACT框架

2022年，Yao等人提出的ReACT（Reasoning and Acting）框架将推理和行动统一在一个框架内：

\`\`\`
问题：小明的身高是多少厘米？已知他比170cm的小红高5cm。

Thought 1: 我需要计算小明的身高。已知小红170cm，小明比她高5cm。
Action 1: Calculate[170 + 5]
Observation 1: 175

Thought 2: 计算完成，小明的身高是175cm。
Action 2: Finish[175cm]
\`\`\`

ReACT的核心洞见是：让模型显式地"思考"可以提高决策质量，而"行动"则让模型能够与外部世界交互获取信息。这就像一个侦探破案：先推理线索之间的关联（Thought），再去实地调查取证（Action），最后根据新发现的证据修正推理（Observation）——如此往复，直到案件水落石出。

### 工具使用与函数调用

2023年，OpenAI推出Function Calling功能，将工具调用标准化。模型可以识别何时需要调用外部工具，并生成结构化的调用参数：

\`\`\`json
{
  "name": "get_weather",
  "arguments": {
    "location": "北京",
    "date": "2024-01-15"
  }
}
\`\`\`

这一机制极大地扩展了智能体的能力边界——从单纯的文本生成，扩展到了与任意API和服务的交互。打个比方，以前的大模型像一个博学但"手脚被绑住"的顾问，只能动嘴说；有了Function Calling，它终于可以亲手操作了——查数据库、发邮件、订机票，说到做到。

### 多智能体协作

2023-2024年，多智能体系统成为研究热点。代表性工作包括：

- **AutoGen**（微软）：定义了多智能体对话的编程范式
- **ChatDev**：用智能体模拟软件公司的开发流程
- **MetaGPT**：将软件工程方法论融入多智能体协作

多智能体系统的核心假设是：专业化分工和协作可以解决单个智能体难以处理的复杂任务。这与现实中的团队协作如出一辙：一个软件项目中，产品经理负责需求分析，架构师负责技术方案，程序员负责编码实现，测试工程师负责质量保障——每个人都是某个领域的"专家智能体"，通过沟通协作完成单个人难以胜任的复杂工程。

## 当前趋势与未来展望

### Agentic Workflow

当前智能体技术的主流范式是"Agentic Workflow"——将复杂任务分解为多个步骤，每个步骤可能涉及推理、工具调用、信息检索等操作。

\`\`\`
用户请求 → 任务分解 → 步骤1 → 步骤2 → ... → 结果整合 → 返回
                ↑                              ↓
                └──────── 反馈与修正 ←─────────┘
\`\`\`

### 智能体基础设施

随着智能体应用的普及，标准化基础设施变得越来越重要：

| 方向 | 代表项目 | 解决的问题 |
|------|----------|------------|
| 工具标准化 | MCP协议 | 统一的工具描述和调用接口 |
| 记忆管理 | Mem0、Zep | 长期记忆的存储和检索 |
| 评测框架 | AgentBench | 智能体能力的标准化评估 |
| 部署运维 | LangServe | 智能体应用的生产化部署 |

### 从Agent到AGI

智能体技术被视为通向通用人工智能（AGI）的重要路径之一。核心假设是：
- 通用智能不仅是"知道"，更是"能做"
- 通过与环境的持续交互，智能体可以不断积累知识和能力
- 多智能体协作可能产生超越单个智能体的涌现智能

回顾这段历史，智能体技术的发展线索清晰可辨：从早期"照章办事"的专家系统，到"自主试错"的强化学习智能体，再到"能看会想"的深度学习智能体，最终演进为当前"能说会做、灵活通用"的LLM智能体。每一次跃迁都在解决上一代的核心瓶颈——规则太死板，就让它自己学；只会做一件事，就给它通用语言理解能力；光会说不会做，就给它接上工具和API。

从符号推理到神经网络，从被动回答到主动行动，智能体技术的演进反映了人工智能研究的核心追求：构建能够真正理解世界、自主决策、持续学习的智能系统。理解这段历史，我们才能更好地把握当前技术的定位和未来的发展方向。
`
    },
    {
      id: "adv-13-03-low-code-platform",
      title: "13.3 代码平台与低代码平台",
      file: "大模型教程/13-智能体技术/02-代码平台与低代码平台.md",
      difficulty: "中级-高级",
      duration: "0.5h",
      week: 4,
      phase: 4,
      keywords: ["代码平台与低代码平台", "Code", "First", "Low"],
      content: `# 代码平台与低代码平台

智能体开发存在两种主要范式：代码优先（Code-First）和低代码/无代码（Low-Code/No-Code）。两种方式各有优劣，适用于不同场景和不同背景的开发者。

假设你正在装修新房。你可以选择自己买材料、画图纸、请工人一步步施工——灵活度极高，但需要专业知识和大量时间；也可以选择找一家整装公司，在几套方案里挑一个，拎包入住——省心省力，但个性化空间有限。智能体开发中的"代码优先"和"低代码"平台，恰好对应这两种思路。理解这两种范式的设计理念和适用边界，有助于我们选择合适的工具构建智能体应用。

## 代码优先平台

代码优先平台提供编程接口和SDK，开发者通过编写代码来定义智能体的行为逻辑。这类平台的代表包括LangChain、LlamaIndex、AutoGen等。

在实际开发中，选择代码优先平台就像选择从食材开始做一道菜——你完全掌控每一个环节，从选料到火候到摆盘，但前提是你得会做菜。

### 核心特点

**灵活性**：代码可以表达任意复杂的逻辑，不受可视化界面的限制。

**可调试性**：可以使用标准的开发工具进行断点调试、日志追踪。

**版本控制**：代码天然支持Git等版本管理，便于团队协作和变更追溯。

**可测试性**：可以编写单元测试和集成测试，保证代码质量。

### 典型架构

以LangChain为例，代码优先平台通常提供以下抽象层：

\`\`\`python
from langchain.agents import AgentExecutor, create_react_agent
from langchain.tools import Tool
from langchain_openai import ChatOpenAI

# 定义工具
tools = [
    Tool(
        name="Search",
        func=search_function,
        description="搜索互联网获取最新信息"
    ),
    Tool(
        name="Calculator",
        func=calculator_function,
        description="执行数学计算"
    )
]

# 创建LLM
llm = ChatOpenAI(model="gpt-4", temperature=0)

# 创建Agent
agent = create_react_agent(llm, tools, prompt_template)
executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# 执行
result = executor.invoke({"input": "北京今天的气温是多少摄氏度？"})
\`\`\`

### 适用场景

- 需要高度定制化的智能体逻辑
- 对性能和延迟有严格要求
- 需要与现有系统深度集成
- 团队具备软件工程能力

举个例子，如果你的智能体需要在回答用户问题时实时查询三个不同的数据库、根据用户的会员等级做差异化处理、再把结果缓存起来供下次使用——这样的逻辑链条用代码写起来思路清晰，用可视化拖拽反而会变得一团乱麻。

## 低代码平台

低代码平台通过可视化界面和配置驱动的方式构建智能体，降低了开发门槛。代表性平台包括Dify、Coze、Flowise等。

想象一下你在用PPT做幻灯片：不需要学HTML/CSS，拖拽文本框、插入图片、选个模板，几分钟就能做出像样的演示。低代码平台给智能体开发带来的正是这种体验——运营人员不用学Python，照样能搭建一个能回答客户问题的智能客服。

### 核心特点

**快速原型**：拖拽式界面可以在数分钟内构建可用的智能体。

**可视化调试**：流程图形式直观展示执行路径，便于理解和调试。

**内置集成**：预置了常用工具和数据源的连接器。

**协作友好**：非技术人员也可以参与智能体的设计和优化。

### 典型架构

低代码平台通常采用流程图（Flow）或工作流（Workflow）的形式组织智能体逻辑：

\`\`\`
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   开始节点   │ ──▶ │   LLM节点   │ ──▶ │  条件分支   │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    ▼                          ▼                          ▼
            ┌─────────────┐            ┌─────────────┐            ┌─────────────┐
            │  搜索工具   │            │  数据库查询  │            │  直接回复   │
            └──────┬──────┘            └──────┬──────┘            └──────┬──────┘
                   │                          │                          │
                   └──────────────────────────┴──────────────────────────┘
                                              ▼
                                      ┌─────────────┐
                                      │   结束节点   │
                                      └─────────────┘
\`\`\`

### 配置示例（Dify风格）

\`\`\`yaml
# dify_app.yaml
app:
  name: "客服助手"
  description: "处理用户咨询的智能客服"
  
model:
  provider: openai
  name: gpt-4
  parameters:
    temperature: 0.7
    max_tokens: 2048
    
tools:
  - name: knowledge_search
    type: retrieval
    config:
      dataset_id: "customer_service_kb"
      top_k: 5
      
  - name: ticket_create
    type: api
    config:
      endpoint: "https://api.example.com/tickets"
      method: POST
      
workflow:
  - id: start
    type: start
    outputs: ["query"]
    
  - id: classify
    type: llm
    inputs: ["query"]
    prompt: "判断用户意图：咨询、投诉、建议"
    outputs: ["intent"]
    
  - id: branch
    type: condition
    inputs: ["intent"]
    conditions:
      - condition: "intent == '咨询'"
        goto: "search_kb"
      - condition: "intent == '投诉'"
        goto: "create_ticket"
      - default: "direct_reply"
\`\`\`

### 适用场景

- 快速验证想法和原型
- 业务人员参与智能体设计
- 标准化的客服、问答类应用
- 不需要复杂定制逻辑的场景

回到装修的比方：如果你只是租房住两年、需要简单翻新，整装方案绰绰有余；但如果你要打造一个智能家居别墅，精确控制每条线路的走向，那就得自己画图纸了。

## 两种范式的对比

| 维度 | 代码优先 | 低代码 |
|------|----------|--------|
| 学习曲线 | 陡峭，需要编程基础 | 平缓，可视化操作 |
| 灵活性 | 极高，可实现任意逻辑 | 受限于平台能力 |
| 开发效率 | 初期慢，长期高 | 初期快，复杂需求慢 |
| 维护成本 | 依赖开发团队 | 运维人员可维护 |
| 调试能力 | 完整的开发工具 | 平台提供的调试界面 |
| 部署方式 | 自主控制 | 平台托管或导出 |
| 适合团队 | 工程师主导 | 产品/运营主导 |

\`\`\`mermaid
graph TD
    A[智能体开发范式] --> B[代码优先]
    A --> C[低代码]
    A --> D[混合架构]
    B --> B1[灵活度高]
    B --> B2[可测试性强]
    C --> C1[快速原型]
    C --> C2[可视化调试]
    D --> D1[代码实现核心逻辑]
    D --> D2[低代码编排流程]
\`\`\`

## 混合架构

在实际项目中，很少有团队只用纯代码或纯低代码。更常见的做法是取长补短——核心的、复杂的业务逻辑用代码实现，流程编排和快速调整交给低代码平台。这就像餐厅的运作方式：厨师（程序员）负责做菜这个核心环节，而前台排号系统、菜单更新这些流程性工作交给管理系统来处理。

### 代码定义核心逻辑，低代码编排流程

\`\`\`python
# 代码实现复杂的业务逻辑
class RiskAssessmentTool:
    def __init__(self, model_path):
        self.model = load_model(model_path)
        
    def assess(self, user_data: dict) -> dict:
        # 复杂的风控逻辑
        features = self._extract_features(user_data)
        score = self.model.predict(features)
        return {"risk_score": score, "recommendation": self._get_recommendation(score)}

# 注册为低代码平台的工具
register_tool(
    name="risk_assessment",
    handler=RiskAssessmentTool("models/risk_v2.pkl"),
    description="评估用户风险等级"
)
\`\`\`

然后在低代码平台中将此工具作为流程的一个节点使用。这样一来，风控算法的复杂度由代码层保证，而业务流程的灵活调整由低代码平台负责——两全其美。

### 低代码构建应用，代码处理边界情况

\`\`\`python
# 低代码平台生成的应用配置
app_config = load_dify_config("customer_service.yaml")

# 代码层处理低代码平台无法覆盖的边界情况
class EnhancedAgent:
    def __init__(self, base_config):
        self.base_agent = DifyAgent(base_config)
        
    def process(self, query):
        # 预处理：敏感词过滤
        if self._contains_sensitive(query):
            return self._handle_sensitive(query)
            
        # 调用低代码平台构建的Agent
        result = self.base_agent.process(query)
        
        # 后处理：结果校验
        if not self._validate_result(result):
            return self._fallback_response()
            
        return result
\`\`\`

## 平台选型建议

### 选择代码优先平台

当满足以下条件时：

1. 团队有充足的工程能力
2. 需要实现复杂的业务逻辑
3. 对性能和延迟有严格要求
4. 需要与现有系统深度集成
5. 长期维护和迭代的核心产品

### 选择低代码平台

当满足以下条件时：

1. 需要快速验证想法
2. 业务人员需要参与开发
3. 应用逻辑相对标准化
4. 团队工程能力有限
5. 内部工具或辅助应用

### 选择混合架构

当满足以下条件时：

1. 核心逻辑复杂但流程编排频繁变化
2. 需要快速迭代但又要保证质量
3. 团队同时有工程师和业务人员
4. 既有标准化需求也有定制化需求

无论选择哪种范式，关键是理解其背后的设计理念，并根据实际需求做出合理选择。一条实用的判断原则是：如果你能在十分钟内用低代码平台搭出原型，就先试低代码；如果搭到一半发现处处受限，说明这个场景需要代码优先。在实践中，灵活组合不同工具的优势，往往能取得最好的效果。
`
    },
    {
      id: "adv-13-04-react",
      title: "13.4 ReACT协议",
      file: "大模型教程/13-智能体技术/03-ReACT协议.md",
      difficulty: "中级-高级",
      duration: "1h",
      week: 4,
      phase: 4,
      keywords: ["ReACT协议", "ReACT", "Reasoning", "Acting", "Yao"],
      content: `# ReACT协议

ReACT（Reasoning and Acting）是2022年由Yao等人提出的智能体框架，它将推理（Reasoning）和行动（Acting）统一在一个交替执行的循环中。这一框架的提出标志着LLM-based Agent从简单的问答系统向具备规划和执行能力的智能体演进。

假设你是一位侦探，接到了一起盗窃案。你不会一上来就漫无目的地到处翻找证据，也不会光坐在办公室里空想。而是：先分析已知线索（思考），然后去现场勘查或调取监控（行动），根据新发现修正方向（观察），再进一步推理……如此循环，直到破案。ReACT框架的精髓正是这种"想清楚再动手"的侦探思维。

## 核心思想

ReACT的核心洞见是：单纯的推理（如Chain-of-Thought）缺乏与外部世界交互的能力，而单纯的行动（如直接调用工具）又缺乏对任务的深度理解和规划。将两者结合，可以让智能体：

1. 通过**思考**理解问题、制定计划、分析中间结果
2. 通过**行动**获取信息、执行操作、验证假设
3. 通过**观察**获得反馈，指导下一步思考

回到侦探的比方：如果只在脑子里推理（纯思考），你可能会基于错误假设越走越偏；如果不加思考就到处翻找（纯行动），你会浪费大量时间在无关线索上。好的侦探一定是"想一步，查一步"交替进行的。

## 执行流程

ReACT的执行遵循“Thought-Action-Observation”的循环模式。下面用一个具体的例子来感受这个过程：

\`\`\`mermaid
sequenceDiagram
    participant U as 用户
    participant L as LLM
    participant T as 工具
    U->>L: 提出问题
    loop Thought-Action-Observation 循环
        L->>L: Thought 思考推理
        L->>T: Action 调用工具
        T-->>L: Observation 返回结果
    end
    L-->>U: Finish 最终答案
\`\`\`

\`\`\`
问题：2023年诺贝尔物理学奖得主是谁？他们的主要贡献是什么？

Thought 1: 我需要查找2023年诺贝尔物理学奖的获奖者信息。
Action 1: Search[2023 Nobel Prize Physics]
Observation 1: 2023年诺贝尔物理学奖授予Pierre Agostini、Ferenc Krausz
              和Anne L'Huillier，以表彰他们在阿秒光脉冲领域的贡献。

Thought 2: 我已经知道获奖者是三位科学家。现在需要了解阿秒光脉冲的具体内容。
Action 2: Search[阿秒光脉冲 贡献]
Observation 2: 阿秒光脉冲是持续时间在10^-18秒量级的超短激光脉冲，
              可以用于观察电子在原子和分子中的运动。

Thought 3: 我现在有足够的信息来回答问题了。
Action 3: Finish[2023年诺贝尔物理学奖授予Pierre Agostini、Ferenc Krausz
         和Anne L'Huillier三位科学家，表彰他们开发阿秒光脉冲技术，
         使人类能够观察电子在原子中的运动。]
\`\`\`

注意观察这个过程：每一步的Thought都是基于前一步的Observation得出的，而不是一开始就拟定好所有步骤。这就像侦探破案一样，下一步去哪里调查，往往取决于这一步发现了什么。

## 与 Chain-of-Thought的对比

| 特性 | Chain-of-Thought | ReACT |
|------|------------------|-------|
| 推理能力 | 有，分步思考 | 有，显式Thought |
| 外部交互 | 无 | 有，通过Action |
| 知识来源 | 模型内部知识 | 可访问外部工具 |
| 实时性 | 受限于训练数据 | 可获取最新信息 |
| 可验证性 | 难以验证中间步骤 | 可追踪每个Action |

表格中最关键的区别在于"外部交互"一行。假设你要回答"今天北京气温多少"这个问题：Chain-of-Thought只能根据训练数据里的旧信息猜测，而ReACT会直接调用天气API获取实时数据——一个是"闭卷考试”，一个是"开卷考试"。

## 实现架构

### 基础实现

\`\`\`python
from typing import List, Tuple
import re

class ReACTAgent:
    def __init__(self, llm, tools: dict):
        self.llm = llm
        self.tools = tools
        self.max_iterations = 10
        
    def run(self, question: str) -> str:
        prompt = self._build_initial_prompt(question)
        trajectory = []
        
        for i in range(self.max_iterations):
            # Generate thought and action
            response = self.llm.generate(prompt)
            thought, action, action_input = self._parse_response(response)
            
            trajectory.append(f"Thought {i+1}: {thought}")
            trajectory.append(f"Action {i+1}: {action}[{action_input}]")
            
            # Check if finished
            if action.lower() == "finish":
                return action_input
                
            # Execute action
            observation = self._execute_action(action, action_input)
            trajectory.append(f"Observation {i+1}: {observation}")
            
            # Update prompt with trajectory
            prompt = self._build_prompt_with_trajectory(question, trajectory)
            
        return "达到最大迭代次数，未能完成任务"
        
    def _parse_response(self, response: str) -> Tuple[str, str, str]:
        """解析LLM响应，提取Thought、Action和Action Input"""
        thought_match = re.search(r"Thought:?\\s*(.+?)(?=Action:|$)", response, re.DOTALL)
        action_match = re.search(r"Action:?\\s*(\\w+)\\[(.+?)\\]", response)
        
        thought = thought_match.group(1).strip() if thought_match else ""
        action = action_match.group(1) if action_match else "Finish"
        action_input = action_match.group(2) if action_match else response
        
        return thought, action, action_input
        
    def _execute_action(self, action: str, action_input: str) -> str:
        """执行指定的Action"""
        if action.lower() in self.tools:
            return self.tools[action.lower()](action_input)
        return f"未知工具: {action}"
        
    def _build_initial_prompt(self, question: str) -> str:
        tools_desc = "\\n".join([f"- {name}: {func.__doc__}" 
                               for name, func in self.tools.items()])
        return f"""Answer the following question using the available tools.

Available tools:
{tools_desc}

Use the following format:
Thought: your reasoning about what to do
Action: tool_name[input]
Observation: result of the action
... (repeat Thought/Action/Observation as needed)
Thought: I now have enough information
Action: Finish[final answer]

Question: {question}

Let's solve this step by step."""
\`\`\`

### 工具定义

\`\`\`python
def search(query: str) -> str:
    """Search the web for information about the query."""
    # 实际实现会调用搜索API
    return f"Search results for: {query}"

def calculate(expression: str) -> str:
    """Calculate a mathematical expression."""
    try:
        result = eval(expression)
        return str(result)
    except Exception as e:
        return f"Calculation error: {e}"

def lookup(term: str) -> str:
    """Look up a specific term in knowledge base."""
    # 实际实现会查询知识库
    return f"Definition of {term}: ..."

# 创建Agent
agent = ReACTAgent(
    llm=my_llm,
    tools={
        "search": search,
        "calculate": calculate,
        "lookup": lookup
    }
)
\`\`\`

## Prompt工程

ReACT的效果很大程度上取决于Prompt的设计。这就像给新员工写工作指南——指南写得越清晰，新员工上手越快。关键要素包括：

### 工具描述

清晰描述每个工具的用途和使用方式：

\`\`\`
Available tools:
- Search[query]: Search the web for current information. Use for facts, 
  news, or anything that might have changed recently.
- Calculate[expression]: Evaluate mathematical expressions. Input should 
  be a valid Python expression.
- Lookup[term]: Look up detailed information about a specific term from 
  the knowledge base.
\`\`\`

### Few-shot示例

提供高质量的示例可以显著提升Agent表现。这就像带新员工时，与其只讲规则，不如先带他做几个实际案例，效果远比单纯讲理论好得多：

\`\`\`
Example:
Question: What is the population of the capital of France?

Thought 1: I need to find the capital of France first.
Action 1: Search[capital of France]
Observation 1: Paris is the capital of France.

Thought 2: Now I need to find the population of Paris.
Action 2: Search[population of Paris 2023]
Observation 2: The population of Paris is approximately 2.1 million.

Thought 3: I have the answer now.
Action 3: Finish[The population of Paris, the capital of France, is 
approximately 2.1 million.]
\`\`\`

### 格式约束

明确输出格式要求，减少解析错误：

\`\`\`
IMPORTANT: Always follow this exact format:
Thought: <your reasoning>
Action: <tool_name>[<input>]

Do NOT include any other text between Thought and Action.
The Action MUST be one of: Search, Calculate, Lookup, Finish
\`\`\`

## 变体与改进

ReACT作为基础框架，后续产生了多种改进变体。就像基础的侦探方法不断进化一样，有人提出了"多人独立调查再汇总"、"从失败中学习"、"多线并行追踪"等多种改良方案。

### ReACT-SC（Self-Consistency）

结合Self-Consistency，生成多条推理路径并投票选择最佳答案：

\`\`\`python
def react_sc(question, n_paths=5):
    answers = []
    for _ in range(n_paths):
        answer = agent.run(question)
        answers.append(answer)
    
    # 投票选择最常见的答案
    return most_common(answers)
\`\`\`

### Reflexion

在ReACT基础上增加反思机制，从失败中学习。这就像一个经验丰富的侦探，不会在同一个死胡同里转圈，而会反思为什么上次的调查方向错了，然后调整策略：

\`\`\`
Thought: 之前的搜索没有找到有用信息，我需要换一个更具体的查询词。
Reflection: 上一次使用"AI发展"太宽泛，应该使用"2023年AI突破性进展"。
Action: Search[2023年AI突破性进展]
\`\`\`

### Tree-of-Thoughts

将ReACT的线性推理扩展为树状结构，探索多个推理分支：

\`\`\`
                    Question
                       │
           ┌──────────┼──────────┐
           ▼          ▼          ▼
        Path A     Path B     Path C
           │          │          │
        Thought    Thought    Thought
           │          │          │
        Action     Action     Action
           │          │          │
          ...        ...        ...
           │          │          │
           └──────────┼──────────┘
                      ▼
                 Best Answer
\`\`\`

## 局限性与应对

任何框架都有其局限性，ReACT也不例外。在实际应用中，你可能会遇到以下几类典型问题：

### 工具调用错误

LLM可能生成无效的工具调用格式或参数：

\`\`\`python
def safe_execute(action, action_input, tools):
    """安全执行工具调用，处理各种错误情况"""
    action = action.lower().strip()
    
    if action not in tools:
        return f"Error: Unknown tool '{action}'. Available: {list(tools.keys())}"
    
    try:
        return tools[action](action_input)
    except Exception as e:
        return f"Error executing {action}: {str(e)}"
\`\`\`

### 无限循环

Agent可能陷入重复相同动作的循环——就像一个人在陌生城市迷路，反复走同一条街道却不自知：

\`\`\`python
def detect_loop(trajectory, window=3):
    """检测最近的动作是否形成循环"""
    if len(trajectory) < window * 2:
        return False
    
    recent = trajectory[-window:]
    previous = trajectory[-2*window:-window]
    
    return recent == previous
\`\`\`

### 推理深度不足

对于复杂问题，可能需要更深层的推理链：

\`\`\`python
# 动态调整最大迭代次数
def adaptive_react(question, base_iterations=5):
    complexity = estimate_complexity(question)
    max_iter = base_iterations * complexity
    return agent.run(question, max_iterations=max_iter)
\`\`\`

ReACT框架的提出为LLM智能体提供了清晰的设计模式。尽管后续出现了更多复杂的框架，但"思考-行动-观察"的核心循环仍然是大多数智能体系统的基础架构。就像所有复杂的侦探技术最终都离不开"观察—推理—行动"这个基本循环，理解ReACT，是深入学习智能体技术的重要基础。
`
    },
    {
      id: "adv-13-05-memory-retrieval",
      title: "13.5 记忆、检索与上下文",
      file: "大模型教程/13-智能体技术/04-记忆检索与上下文.md",
      difficulty: "中级-高级",
      duration: "0.5h",
      week: 4,
      phase: 4,
      keywords: ["记忆", "检索与上下文", "CTX", "LLM"],
      content: `# 记忆、检索与上下文

智能体的“记忆”能力决定了它能否积累经验、保持对话连贯性以及处理需要长期追踪的复杂任务。

假设你是一名学生，正在备考期末考试。你的“记忆系统”其实分好几层：**工作记忆**是你此刻大脑里正在操作的那点信息（比如正在计算的这道题）；**短期记忆**是今天上课记的笔记，还留在草稿纸上；**长期记忆**是你整理归档的笔记本，内容经过梳理，随时可以翻阅；而**检索**就是在一堆笔记本里迅速翻到正确的那一页。智能体的记忆系统设计，与此异曲同工。

本节将探讨智能体记忆系统的设计原理、实现方案以及与上下文管理的关系。

\`\`\`mermaid
graph TD
    A[用户查询] --> R[检索模块]
    WM[工作记忆<br>当前上下文] --> CTX[上下文组装]
    EM[情景记忆<br>历史对话] --> R
    SM[语义记忆<br>向量知识库] --> R
    R --> CTX
    CTX --> LLM[LLM生成回答]
\`\`\`

## 记忆的分类

借鉴认知科学的分类，智能体的记忆可以分为以下几种类型。继续用学生备考的比方来理解：

| 记忆类型 | 特点 | 学生备考中的对应 | 智能体中的对应 |
|----------|------|----------------------|----------------|
| 工作记忆 | 短期、容量有限 | 正在计算的这道题 | 当前对话上下文 |
| 情景记忆 | 具体事件的记录 | 记得上周商议了什么 | 历史对话日志 |
| 语义记忆 | 一般性知识 | 整理好的笔记本 | 知识库、向量存储 |
| 程序记忆 | 技能和习惯 | 将梳理出的解题套路 | Prompt模板、工具定义 |

### 工作记忆

工作记忆对应LLM的上下文窗口，是智能体在单次交互中能够“看到”的所有信息。就像你做数学题时，草稿纸上能同时容纳的信息是有限的——写满了就得擦掉一部分才能继续。LLM的上下文窗口也是一样，容量有上限，需要策略地管理。

\`\`\`python
class WorkingMemory:
    def __init__(self, max_tokens=4096):
        self.max_tokens = max_tokens
        self.messages = []
        
    def add(self, role: str, content: str):
        self.messages.append({"role": role, "content": content})
        self._trim_if_needed()
        
    def _trim_if_needed(self):
        """当超出容量时，移除最早的消息"""
        while self._count_tokens() > self.max_tokens:
            # 保留系统消息，移除最早的用户/助手消息
            for i, msg in enumerate(self.messages):
                if msg["role"] != "system":
                    self.messages.pop(i)
                    break
                    
    def get_context(self) -> list:
        return self.messages.copy()
\`\`\`

### 情景记忆

情景记忆存储历史交互，用于跨会话的信息保持。回到学生的场景：你记得上周的学习小组讨论了什么、老师在哪节课上提到过哪个重点，这些都是情景记忆。对于智能体来说，就是能够记住“用户上周说过喜欢颗粒感强的咖啡”这类信息：

\`\`\`python
from datetime import datetime
import json

class EpisodicMemory:
    def __init__(self, storage_path="episodic_memory.jsonl"):
        self.storage_path = storage_path
        
    def store(self, session_id: str, messages: list, metadata: dict = None):
        """存储一次完整的对话会话"""
        episode = {
            "session_id": session_id,
            "timestamp": datetime.now().isoformat(),
            "messages": messages,
            "metadata": metadata or {}
        }
        with open(self.storage_path, "a") as f:
            f.write(json.dumps(episode, ensure_ascii=False) + "\\n")
            
    def retrieve_by_session(self, session_id: str) -> list:
        """检索特定会话的历史"""
        episodes = []
        with open(self.storage_path, "r") as f:
            for line in f:
                episode = json.loads(line)
                if episode["session_id"] == session_id:
                    episodes.append(episode)
        return episodes
        
    def search_similar(self, query: str, top_k: int = 5) -> list:
        """语义搜索相似的历史对话"""
        # 实现向量化搜索
        pass
\`\`\`

### 语义记忆

语义记忆存储可检索的知识，通常使用向量数据库实现。这就是你精心整理的笔记本——不是按时间顺序抢到的草稿，而是按主题分类、标注好关键词的知识库。当你需要某个知识点时，可以通过关键词快速定位到相关页面：

\`\`\`python
from typing import List
import numpy as np

class SemanticMemory:
    def __init__(self, embedding_model, vector_store):
        self.embedding_model = embedding_model
        self.vector_store = vector_store
        
    def add(self, text: str, metadata: dict = None):
        """添加知识到记忆"""
        embedding = self.embedding_model.encode(text)
        self.vector_store.add(
            embedding=embedding,
            text=text,
            metadata=metadata
        )
        
    def retrieve(self, query: str, top_k: int = 5) -> List[str]:
        """检索相关知识"""
        query_embedding = self.embedding_model.encode(query)
        results = self.vector_store.search(query_embedding, top_k=top_k)
        return [r["text"] for r in results]
        
    def update(self, text: str, new_text: str):
        """更新已有知识"""
        self.vector_store.delete(text=text)
        self.add(new_text)
\`\`\`

## 上下文管理策略

LLM的上下文窗口有限（通常4K-128K tokens），需要精心管理。这就像你的书桌空间有限，不可能同时摆开十本书和所有草稿纸——你必须决定留下哪些资料、收起哪些、把哪些内容压缩成摘要写在便签上。以下是几种常见策略：

### 滑动窗口

保留最近的N轮对话，这是最简单直接的策略——就像只留住最近几分钟的对话，更早的内容自动“忘记”：

\`\`\`python
def sliding_window(messages, window_size=10):
    """保留最近的window_size轮对话"""
    system_messages = [m for m in messages if m["role"] == "system"]
    other_messages = [m for m in messages if m["role"] != "system"]
    
    # 每轮对话包含user和assistant各一条
    kept_messages = other_messages[-(window_size * 2):]
    
    return system_messages + kept_messages
\`\`\`

### 摘要压缩

将早期对话压缩为摘要。想象一下你的课堂笔记：前十页已经不重要了，但里面可能有几个关键结论。你不会全部丢掉，而是用一张便签写下核心要点，然后把原始笔记收起来：

\`\`\`python
def summarize_and_compress(messages, llm, threshold=2000):
    """当上下文过长时，将早期对话压缩为摘要"""
    if count_tokens(messages) < threshold:
        return messages
        
    # 分离系统消息和对话消息
    system_msgs = [m for m in messages if m["role"] == "system"]
    conversation = [m for m in messages if m["role"] != "system"]
    
    # 找到压缩点：保留最近1/3的对话
    split_point = len(conversation) * 2 // 3
    to_summarize = conversation[:split_point]
    to_keep = conversation[split_point:]
    
    # 生成摘要
    summary_prompt = f"""请总结以下对话的关键信息：

{format_messages(to_summarize)}

用1-2句话概括重要内容。"""
    
    summary = llm.generate(summary_prompt)
    
    # 构建新的消息列表
    summary_message = {"role": "system", "content": f"[历史摘要] {summary}"}
    
    return system_msgs + [summary_message] + to_keep
\`\`\`

### 重要性排序

根据相关性选择性保留消息。这是最“聪明”的策略：就像你复习时，不是把所有笔记都摆在桌上，而是根据当前正在做的这道题，只拿出最相关的几页笔记：

\`\`\`python
def relevance_based_selection(messages, current_query, embedding_model, max_tokens):
    """基于与当前查询的相关性选择消息"""
    query_embedding = embedding_model.encode(current_query)
    
    scored_messages = []
    for msg in messages:
        if msg["role"] == "system":
            scored_messages.append((msg, float("inf")))  # 系统消息始终保留
        else:
            msg_embedding = embedding_model.encode(msg["content"])
            similarity = cosine_similarity(query_embedding, msg_embedding)
            scored_messages.append((msg, similarity))
    
    # 按相关性排序
    scored_messages.sort(key=lambda x: x[1], reverse=True)
    
    # 选择直到达到token限制
    selected = []
    current_tokens = 0
    for msg, score in scored_messages:
        msg_tokens = count_tokens(msg["content"])
        if current_tokens + msg_tokens <= max_tokens:
            selected.append(msg)
            current_tokens += msg_tokens
            
    # 恢复原始顺序
    original_order = {id(m): i for i, m in enumerate(messages)}
    selected.sort(key=lambda m: original_order.get(id(m), 0))
    
    return selected
\`\`\`

## 记忆检索架构

有了不同层级的记忆，接下来的关键问题是：如何在正确的时机从正确的层级取出正确的信息？这就像你在图书馆复习时，需要同时参考课本、笔记、过往试卷和老师的PPT——关键是要快速定位到正确的参考资料。

### 基础RAG架构

\`\`\`
用户查询
    │
    ▼
┌─────────────┐
│  查询编码   │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│  向量检索   │ ──▶ │  文档排序   │
└─────────────┘     └──────┬──────┘
                          │
                          ▼
                   ┌─────────────┐
                   │  上下文构建  │
                   └──────┬──────┘
                          │
                          ▼
                   ┌─────────────┐
                   │   LLM生成   │
                   └─────────────┘
\`\`\`

### 多级记忆检索

\`\`\`python
class MultiLevelMemory:
    def __init__(self, working_memory, episodic_memory, semantic_memory):
        self.working = working_memory
        self.episodic = episodic_memory
        self.semantic = semantic_memory
        
    def retrieve(self, query: str, session_id: str) -> dict:
        """从多个记忆层级检索相关信息"""
        results = {
            "working": self.working.get_context(),
            "episodic": [],
            "semantic": []
        }
        
        # 检索情景记忆（最近的相关对话）
        recent_episodes = self.episodic.search_similar(query, top_k=3)
        results["episodic"] = recent_episodes
        
        # 检索语义记忆（相关知识）
        relevant_knowledge = self.semantic.retrieve(query, top_k=5)
        results["semantic"] = relevant_knowledge
        
        return results
        
    def build_context(self, query: str, session_id: str) -> str:
        """构建完整的上下文"""
        memories = self.retrieve(query, session_id)
        
        context_parts = []
        
        # 添加相关知识
        if memories["semantic"]:
            context_parts.append("相关知识：")
            for k in memories["semantic"]:
                context_parts.append(f"- {k}")
                
        # 添加历史对话摘要
        if memories["episodic"]:
            context_parts.append("\\n相关历史对话：")
            for e in memories["episodic"]:
                context_parts.append(f"- {e['summary']}")
                
        return "\\n".join(context_parts)
\`\`\`

## 记忆更新与遗忘

人的记忆会自然地巩固和遗忘——重要的事情反复回忆就记住了，无关紧要的细节慢慢就淡忘了。智能体的记忆系统也需要类似的机制，否则记忆库会无限膨胀、旧信息反而干扰新决策。

### 记忆巩固

将重要的短期记忆转化为长期记忆。这个过程很像你备考时的“归纳整理”：不是所有课堂内容都值得写入笔记本，只有重要的公式、关键结论、常考题型才值得记录：

\`\`\`python
class MemoryConsolidator:
    def __init__(self, llm, importance_threshold=0.7):
        self.llm = llm
        self.threshold = importance_threshold
        
    def evaluate_importance(self, message: str, context: str) -> float:
        """评估消息的重要性"""
        prompt = f"""评估以下消息在给定上下文中的重要性（0-1分）：

上下文：{context}
消息：{message}

重要性评估标准：
- 是否包含关键事实或决策
- 是否会影响后续对话
- 是否需要长期记住

请只输出一个0-1之间的数字。"""
        
        score = float(self.llm.generate(prompt).strip())
        return score
        
    def consolidate(self, working_memory, semantic_memory):
        """将重要的工作记忆巩固到语义记忆"""
        messages = working_memory.get_context()
        context = "\\n".join([m["content"] for m in messages[:5]])
        
        for msg in messages:
            if msg["role"] == "assistant":
                importance = self.evaluate_importance(msg["content"], context)
                if importance >= self.threshold:
                    semantic_memory.add(
                        text=msg["content"],
                        metadata={"importance": importance, "source": "conversation"}
                    )
\`\`\`

### 遗忘机制

避免记忆系统无限膨胀。假设你的笔记本签满了，你得决定哪些内容可以清理掉。自然的做法是：太旧的、从来没翻过的、本身就不重要的内容优先清理：

\`\`\`python
class MemoryManager:
    def __init__(self, semantic_memory, max_size=10000):
        self.memory = semantic_memory
        self.max_size = max_size
        
    def forget(self):
        """清理不重要或过时的记忆"""
        all_memories = self.memory.get_all()
        
        if len(all_memories) <= self.max_size:
            return
            
        # 计算每条记忆的"遗忘分数"
        forget_scores = []
        for mem in all_memories:
            age = (datetime.now() - mem["created_at"]).days
            access_count = mem.get("access_count", 0)
            importance = mem.get("importance", 0.5)
            
            # 遗忘分数：越高越可能被遗忘
            # 考虑年龄、访问频率和重要性
            score = age * 0.3 - access_count * 0.2 - importance * 0.5
            forget_scores.append((mem["id"], score))
            
        # 删除遗忘分数最高的记忆
        forget_scores.sort(key=lambda x: x[1], reverse=True)
        to_delete = forget_scores[:len(all_memories) - self.max_size]
        
        for mem_id, _ in to_delete:
            self.memory.delete(mem_id)
\`\`\`

## 实践：构建有记忆的对话Agent

有了以上基础组件，我们可以把它们组装起来，构建一个真正“有记忆”的对话Agent。这就像把草稿纸、笔记本、整理术结合起来，形成一套完整的学习体系：

\`\`\`python
class MemoryAwareAgent:
    def __init__(self, llm, embedding_model):
        self.llm = llm
        self.working_memory = WorkingMemory(max_tokens=4096)
        self.semantic_memory = SemanticMemory(embedding_model, VectorStore())
        self.consolidator = MemoryConsolidator(llm)
        
    def chat(self, user_message: str) -> str:
        # 添加用户消息到工作记忆
        self.working_memory.add("user", user_message)
        
        # 检索相关的长期记忆
        relevant_memories = self.semantic_memory.retrieve(user_message, top_k=3)
        
        # 构建带有记忆的Prompt
        system_prompt = self._build_system_prompt(relevant_memories)
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(self.working_memory.get_context())
        
        # 生成回复
        response = self.llm.chat(messages)
        
        # 添加回复到工作记忆
        self.working_memory.add("assistant", response)
        
        # 周期性巩固记忆
        if len(self.working_memory.messages) % 10 == 0:
            self.consolidator.consolidate(self.working_memory, self.semantic_memory)
            
        return response
        
    def _build_system_prompt(self, memories: list) -> str:
        base_prompt = "你是一个有记忆能力的助手。"
        
        if memories:
            memory_context = "\\n".join([f"- {m}" for m in memories])
            base_prompt += f"\\n\\n你记得以下相关信息：\\n{memory_context}"
            
        return base_prompt
\`\`\`

记忆系统是智能体从“无状态对话机器人”进化为“有经验积累的助手”的关键。就像一个好学生不仅要会做题，还要会记笔记、会归纳整理、会考前复习——合理的记忆架构设计，能够让智能体在长期交互中展现出更强的个性化和一致性。
`
    },
    {
      id: "adv-13-06-multi-agent",
      title: "13.6 多智能体体系",
      file: "大模型教程/13-智能体技术/05-多智能体体系.md",
      difficulty: "中级-高级",
      duration: "0.5h",
      week: 0,
      phase: 0,
      keywords: ["多智能体体系", "Leader", "Agent"],
      content: `# 多智能体体系

单个智能体的能力终究有限，当面对复杂任务时，多个智能体的协作往往能产生超越个体能力之和的效果。

想象一下你的毕业设计项目：如果只有你一个人，写需求、画架构、写代码、做测试、写报告都得自己来，而且你不可能每个领域都擅长。但如果组成一个团队——小明负责产品设计，小红负责后端开发，小刚负责前端，小美负责测试——每个人发挥专长，通过沟通协作，效率和质量都能大幅提升。多智能体系统的核心理念正是如此。

本节将介绍多智能体系统的设计模式、通信协议以及典型的协作架构。

\`\`\`mermaid
graph TD
    Leader[主 Agent<br>任务分解与协调] --> W1[专家 Agent A]
    Leader --> W2[专家 Agent B]
    Leader --> W3[专家 Agent C]
    W1 -->|Message| W2
    W2 -->|Message| W3
    W1 --> R[结果汇总]
    W2 --> R
    W3 --> R
    R --> Leader
\`\`\`

## 为什么需要多智能体

### 单智能体的局限

即使是最强大的LLM，在处理复杂任务时也面临诸多挑战。回到毕业设计的场景：一个人写代码的时候，又当开发者又当测试员，很容易"当局者迷"——自己写的代码自己很难发现bug：

| 挑战 | 表现 | 多智能体解决方案 |
|------|------|------------------|
| 角色混淆 | 同时扮演多个角色时容易混乱 | 每个Agent专注单一角色 |
| 上下文溢出 | 复杂任务需要大量上下文 | 分布式存储和处理 |
| 能力瓶颈 | 单一模型难以精通所有领域 | 专家Agent分工协作 |
| 验证困难 | 自己难以发现自己的错误 | Agent间相互审查 |

### 多智能体的优势

而团队协作能有效解决这些问题：

**专业化分工**：每个Agent专注特定任务，深度优于广度。就像团队里每个人只负责自己最擅长的部分。

**并行处理**：多个Agent可以同时处理不同子任务。前端和后端可以并行开发，不用等对方做完才开始。

**相互验证**：Agent间可以检查彼此的输出，提高质量。就像代码审查机制，别人更容易发现你的问题。

**涌现行为**：简单规则的组合可能产生复杂的智能行为。

## 多智能体架构模式

### 主从架构

一个主Agent负责任务分解和结果整合，多个从Agent执行具体任务。这就像项目经理和团队成员的关系——项目经理拆解任务、分配工作、汇总成果，团队成员各自執行分内工作：

\`\`\`python
class OrchestratorAgent:
    """主Agent：负责任务分解和协调"""
    
    def __init__(self, llm, workers: dict):
        self.llm = llm
        self.workers = workers  # name -> WorkerAgent
        
    def process(self, task: str) -> str:
        # 分解任务
        subtasks = self._decompose(task)
        
        # 分配给工作Agent
        results = {}
        for subtask in subtasks:
            worker_name = self._select_worker(subtask)
            worker = self.workers[worker_name]
            results[subtask["id"]] = worker.execute(subtask)
            
        # 整合结果
        return self._synthesize(results)
        
    def _decompose(self, task: str) -> list:
        prompt = f"""将以下任务分解为子任务：

任务：{task}

可用的工作Agent：
{self._describe_workers()}

输出JSON格式的子任务列表。"""
        
        response = self.llm.generate(prompt)
        return json.loads(response)
        
    def _select_worker(self, subtask: dict) -> str:
        """根据子任务特点选择合适的工作Agent"""
        return subtask.get("assigned_worker", list(self.workers.keys())[0])
        
    def _synthesize(self, results: dict) -> str:
        """整合各子任务的结果"""
        prompt = f"""整合以下子任务结果为最终答案：

{json.dumps(results, ensure_ascii=False, indent=2)}

请给出完整、连贯的最终回答。"""
        
        return self.llm.generate(prompt)


class WorkerAgent:
    """从Agent：执行具体任务"""
    
    def __init__(self, name: str, llm, specialty: str):
        self.name = name
        self.llm = llm
        self.specialty = specialty
        
    def execute(self, subtask: dict) -> str:
        prompt = f"""你是{self.specialty}专家。

请完成以下任务：
{subtask['description']}

要求：{subtask.get('requirements', '无特殊要求')}"""
        
        return self.llm.generate(prompt)
\`\`\`

### 对等架构

多个Agent平等协作，通过讨论达成共识。假设你组织了一场学术讨论会，每个人都是某个方向的专家，大家发表观点、相互讨论、最终由主持人总结。这种模式特别适合需要多角度分析的场景：

\`\`\`python
class DebateSystem:
    """辩论式多智能体系统"""
    
    def __init__(self, agents: list, moderator):
        self.agents = agents  # 参与辩论的Agent列表
        self.moderator = moderator  # 主持人Agent
        
    def debate(self, topic: str, rounds: int = 3) -> str:
        history = []
        
        for round_num in range(rounds):
            round_responses = []
            
            for agent in self.agents:
                # 每个Agent发表观点
                response = agent.respond(topic, history)
                round_responses.append({
                    "agent": agent.name,
                    "response": response
                })
                
            history.extend(round_responses)
            
            # 主持人总结本轮讨论
            summary = self.moderator.summarize_round(round_responses)
            history.append({"agent": "moderator", "response": summary})
            
        # 最终裁决
        return self.moderator.final_verdict(topic, history)


class DebateAgent:
    def __init__(self, name: str, llm, stance: str):
        self.name = name
        self.llm = llm
        self.stance = stance  # 立场或专业方向
        
    def respond(self, topic: str, history: list) -> str:
        history_text = self._format_history(history)
        
        prompt = f"""你是{self.name}，立场是{self.stance}。

讨论话题：{topic}

历史讨论：
{history_text}

请发表你的观点，可以反驳其他参与者的观点，也可以补充新的见解。"""
        
        return self.llm.generate(prompt)
\`\`\`

### 层级架构

多层级的Agent结构，适合处理大规模复杂任务。这就像一家大公司的组织架构：CEO对接各事业部总经理，每个总经理又管理自己的团队：

\`\`\`
                    ┌─────────────┐
                    │  总指挥Agent │
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌────────────┐  ┌────────────┐  ┌────────────┐
    │ 团队领导A  │  │ 团队领导B  │  │ 团队领导C  │
    └─────┬──────┘  └─────┬──────┘  └─────┬──────┘
      ┌───┴───┐       ┌───┴───┐       ┌───┴───┐
      ▼       ▼       ▼       ▼       ▼       ▼
   ┌────┐ ┌────┐  ┌────┐ ┌────┐  ┌────┐ ┌────┐
   │工人│ │工人│  │工人│ │工人│  │工人│ │工人│
   └────┘ └────┘  └────┘ └────┘  └────┘ └────┘
\`\`\`

## Agent间通信

Agent之间如何交流信息？这就像团队内部的沟通机制——可以用即时消息（直接发消息）、可以用共享文档（共享黑板）、也可以开会讨论（广播）。

### A2A协议

Agent-to-Agent（A2A）协议定义了智能体间的通信规范：

\`\`\`python
from dataclasses import dataclass
from enum import Enum
from typing import Any, Optional

class MessageType(Enum):
    REQUEST = "request"      # 请求执行任务
    RESPONSE = "response"    # 任务执行结果
    INFORM = "inform"        # 信息通知
    QUERY = "query"          # 查询信息
    CONFIRM = "confirm"      # 确认收到
    REJECT = "reject"        # 拒绝请求

@dataclass
class AgentMessage:
    sender: str              # 发送者Agent ID
    receiver: str            # 接收者Agent ID
    msg_type: MessageType    # 消息类型
    content: Any             # 消息内容
    conversation_id: str     # 对话ID，用于追踪
    reply_to: Optional[str] = None  # 回复的消息ID
    
    def to_dict(self) -> dict:
        return {
            "sender": self.sender,
            "receiver": self.receiver,
            "type": self.msg_type.value,
            "content": self.content,
            "conversation_id": self.conversation_id,
            "reply_to": self.reply_to
        }


class MessageBroker:
    """消息中转站，管理Agent间的通信"""
    
    def __init__(self):
        self.agents = {}  # agent_id -> Agent
        self.message_queue = {}  # agent_id -> [messages]
        
    def register(self, agent_id: str, agent):
        self.agents[agent_id] = agent
        self.message_queue[agent_id] = []
        
    def send(self, message: AgentMessage):
        """发送消息"""
        if message.receiver in self.message_queue:
            self.message_queue[message.receiver].append(message)
            
    def receive(self, agent_id: str) -> list:
        """接收消息"""
        messages = self.message_queue.get(agent_id, [])
        self.message_queue[agent_id] = []
        return messages
        
    def broadcast(self, sender: str, content: Any, msg_type: MessageType):
        """广播消息给所有Agent"""
        for agent_id in self.agents:
            if agent_id != sender:
                msg = AgentMessage(
                    sender=sender,
                    receiver=agent_id,
                    msg_type=msg_type,
                    content=content,
                    conversation_id=f"broadcast_{uuid.uuid4()}"
                )
                self.send(msg)
\`\`\`

### 共享黑板模式

Agent通过共享的“黑板”进行间接通信。这像什么？假设你的团队有一块共享白板，谁有新发现就写上去，其他人随时来看。不需要直接对话，通过白板就能同步信息：

\`\`\`python
class Blackboard:
    """共享黑板，Agent通过读写黑板进行协作"""
    
    def __init__(self):
        self.data = {}
        self.subscribers = {}  # key -> [callback]
        
    def write(self, key: str, value: Any, writer: str):
        """写入数据"""
        self.data[key] = {
            "value": value,
            "writer": writer,
            "timestamp": datetime.now()
        }
        # 通知订阅者
        if key in self.subscribers:
            for callback in self.subscribers[key]:
                callback(key, value)
                
    def read(self, key: str) -> Any:
        """读取数据"""
        if key in self.data:
            return self.data[key]["value"]
        return None
        
    def subscribe(self, key: str, callback):
        """订阅数据变化"""
        if key not in self.subscribers:
            self.subscribers[key] = []
        self.subscribers[key].append(callback)
        
    def query(self, pattern: str) -> dict:
        """查询匹配的数据"""
        import re
        matched = {}
        for key, data in self.data.items():
            if re.match(pattern, key):
                matched[key] = data["value"]
        return matched
\`\`\`

## 典型应用场景

### 软件开发团队

这是多智能体最经典的应用场景，直接模拟了现实世界中软件公司的工作流程。每个Agent扮演一个明确的角色，产出物作为下一个Agent的输入：

\`\`\`python
class SoftwareTeam:
    def __init__(self):
        self.pm = ProductManagerAgent("产品经理")
        self.architect = ArchitectAgent("架构师")
        self.developers = [DeveloperAgent(f"开发者{i}") for i in range(3)]
        self.tester = TesterAgent("测试工程师")
        self.reviewer = ReviewerAgent("代码审查员")
        
    def develop(self, requirement: str) -> dict:
        # 产品经理：需求分析
        prd = self.pm.analyze(requirement)
        
        # 架构师：技术方案设计
        design = self.architect.design(prd)
        
        # 开发者：并行实现各模块
        modules = design["modules"]
        implementations = {}
        for i, module in enumerate(modules):
            dev = self.developers[i % len(self.developers)]
            implementations[module["name"]] = dev.implement(module)
            
        # 代码审查
        review_results = self.reviewer.review(implementations)
        
        # 根据审查意见修改
        for module_name, issues in review_results.items():
            if issues:
                dev = self.developers[0]  # 简化：由第一个开发者修复
                implementations[module_name] = dev.fix(implementations[module_name], issues)
                
        # 测试
        test_results = self.tester.test(implementations)
        
        return {
            "prd": prd,
            "design": design,
            "code": implementations,
            "test_results": test_results
        }
\`\`\`

### 研究助手团队

多Agent协作完成深度研究，这就像一个研究生团队合作写一篇综述论文：有人负责规划研究方向，有人负责搜索文献，有人负责分析整理，有人负责撰写，最后还有人负责审稿：

\`\`\`python
class ResearchTeam:
    def __init__(self):
        self.planner = PlannerAgent()
        self.searchers = [SearchAgent(f"搜索者{i}") for i in range(3)]
        self.analyst = AnalystAgent()
        self.writer = WriterAgent()
        self.critic = CriticAgent()
        
    def research(self, topic: str) -> str:
        # 规划研究方向
        research_plan = self.planner.plan(topic)
        
        # 并行搜索信息
        search_results = []
        for i, direction in enumerate(research_plan["directions"]):
            searcher = self.searchers[i % len(self.searchers)]
            results = searcher.search(direction)
            search_results.extend(results)
            
        # 分析整合
        analysis = self.analyst.analyze(search_results)
        
        # 撰写报告
        draft = self.writer.write(topic, analysis)
        
        # 批评修改
        feedback = self.critic.review(draft)
        final_report = self.writer.revise(draft, feedback)
        
        return final_report
\`\`\`

## 涌现与协调

多智能体系统最迷人的特性之一是“涌现”——简单的个体规则能够产生复杂的群体智能。想想蚂群：每只蚂蚁的行为规则非常简单（跟着信息素走、找到食物就留下信息素），但整个蚂群却能找到最短路径、建造复杂的巢穴。

### 涌现行为

当多个简单Agent按照简单规则交互时，可能产生复杂的群体行为。以下代码模拟了蚂群寻路的过程——每只“蚂蚁Agent”的逻辑很简单，但它们集体协作却能找到最优解：

\`\`\`python
class SwarmAgent:
    """群体智能Agent，模拟蚁群行为"""
    
    def __init__(self, agent_id):
        self.id = agent_id
        self.position = None
        self.found_solution = None
        
    def explore(self, search_space, pheromone_map):
        """探索搜索空间"""
        # 根据信息素浓度选择方向
        probabilities = self._calculate_probabilities(pheromone_map)
        next_position = self._choose_position(probabilities)
        
        # 移动并评估
        self.position = next_position
        quality = self._evaluate(next_position, search_space)
        
        return next_position, quality
        
    def _calculate_probabilities(self, pheromone_map):
        """根据信息素计算各方向的选择概率"""
        neighbors = self._get_neighbors()
        pheromones = [pheromone_map.get(n, 0.1) for n in neighbors]
        total = sum(pheromones)
        return [p/total for p in pheromones]


class SwarmCoordinator:
    """群体协调器"""
    
    def __init__(self, num_agents, search_space):
        self.agents = [SwarmAgent(i) for i in range(num_agents)]
        self.pheromone_map = {}
        self.search_space = search_space
        self.best_solution = None
        
    def run(self, iterations):
        for _ in range(iterations):
            # 所有Agent探索
            for agent in self.agents:
                position, quality = agent.explore(self.search_space, self.pheromone_map)
                
                # 更新信息素
                self._update_pheromone(position, quality)
                
                # 更新最优解
                if self.best_solution is None or quality > self.best_solution[1]:
                    self.best_solution = (position, quality)
                    
            # 信息素蒸发
            self._evaporate_pheromone()
            
        return self.best_solution
\`\`\`

### 冲突解决

当多个Agent的目标或行动产生冲突时，需要协调机制。这和现实团队一样——开发者想用新框架，运维想要稳定性，产品经理想要快上线——怎么协调？通常有优先级、协商、投票等几种策略：

\`\`\`python
class ConflictResolver:
    """冲突解决器"""
    
    def resolve(self, conflicts: list) -> dict:
        """解决Agent间的冲突"""
        resolutions = {}
        
        for conflict in conflicts:
            agents = conflict["agents"]
            resource = conflict["resource"]
            
            # 策略1：优先级排序
            if conflict["type"] == "resource_competition":
                winner = self._resolve_by_priority(agents)
                resolutions[conflict["id"]] = {"winner": winner}
                
            # 策略2：协商
            elif conflict["type"] == "goal_conflict":
                compromise = self._negotiate(agents)
                resolutions[conflict["id"]] = {"compromise": compromise}
                
            # 策略3：投票
            elif conflict["type"] == "decision":
                decision = self._vote(agents, conflict["options"])
                resolutions[conflict["id"]] = {"decision": decision}
                
        return resolutions
        
    def _negotiate(self, agents: list) -> dict:
        """让Agent协商达成妥协"""
        proposals = [agent.propose() for agent in agents]
        
        # 找到各方都能接受的方案
        for proposal in proposals:
            if all(agent.accept(proposal) for agent in agents):
                return proposal
                
        # 若无法达成一致，返回折中方案
        return self._find_middle_ground(proposals)
\`\`\`

多智能体系统的设计既是科学也是艺术。就像组建一支高效团队一样，合理的角色分工、有效的通信机制、恰当的协调策略，是构建高效多智能体系统的关键。在实践中，建议从最简单的两个Agent协作开始，验证通信和协调机制能正常工作后，再逐步扩展团队规模。
`
    },
    {
      id: "adv-13-07-agentic-rl",
      title: "13.7 Agentic RL",
      file: "大模型教程/13-智能体技术/06-Agentic-RL.md",
      difficulty: "中级-高级",
      duration: "0.5h",
      week: 0,
      phase: 0,
      keywords: ["Agentic", "RL", "LLM", "RLHF"],
      content: `# Agentic RL

Agentic RL（智能体强化学习）将强化学习方法引入LLM智能体的优化过程。与传统的监督学习不同，Agentic RL让智能体通过与环境的交互来学习最优策略，这对于处理复杂、开放式任务尤为重要。

假设你在教一个小孩子下棋。监督学习的方式是给他看成千上万盘大师对弈，让他模仿每一步。而强化学习的方式是让他自己下——赢了奖励、输了总结教训，下得越多就越强。传统的RLHF只优化“每一步棋好不好”，而Agentic RL优化的是“整盘棋的策略好不好”——某一步看似吃亏，但如果它服务于整体胜利，那就是好棋。

\`\`\`mermaid
graph LR
    E[环境] -->|观察| A[LLM Agent]
    A -->|决策| T[工具调用]
    T -->|执行| E
    E -->|奖励信号| R[奖励模型]
    R -->|策略更新| A
\`\`\`

## 从RLHF到Agentic RL

### RLHF回顾

RLHF（Reinforcement Learning from Human Feedback）是优化LLM的主流方法。简单来说，RLHF的过程就像让人类老师给学生的作文打分，然后学生根据分数调整写作风格：

$$
\\mathcal{L}_{\\text{RLHF}} = -\\mathbb{E}_{x \\sim D, y \\sim \\pi_\\theta}[r(x, y)] + \\beta \\cdot D_{\\text{KL}}[\\pi_\\theta \\| \\pi_{\\text{ref}}]
$$

其中：$x$ 为提示，从数据分布 $D$ 中采样；$y$ 为模型生成的回答，从当前策略 $\\pi_\\theta$ 中采样；$r(x, y)$ 为奖励模型对提示-回答对的评分；$\\pi_{\\text{ref}}$ 为参考策略（通常为 SFT 模型）；$D_{\\text{KL}}[\\pi_\\theta \\| \\pi_{\\text{ref}}]$ 为当前策略与参考策略之间的 KL 散度，衡量两者分布的偏离程度；$\\beta > 0$ 为 KL 惩罚系数，控制策略优化时偏离参考模型的幅度。该损失函数的目标是在最大化奖励的同时，通过 KL 约束防止模型输出偏离太远而丧失语言质量。

RLHF优化的是单轮对话的质量，而Agentic RL需要考虑多步骤交互的累积奖励。这就像作文打分与项目管理的区别：作文打分看的是单篇质量，而项目管理要评估的是整个项目从开始到结束的整体效果。

### Agentic RL的特点

| 特性 | RLHF | Agentic RL |
|------|------|------------|
| 交互长度 | 单轮 | 多轮/多步骤 |
| 状态空间 | 输入文本 | 对话历史+环境状态 |
| 动作空间 | 生成回复 | 文本生成+工具调用 |
| 奖励信号 | 人类偏好 | 任务完成度+中间反馈 |
| 环境 | 静态 | 动态、可交互 |

## 核心技术

### 轨迹级优化

与token级优化不同，Agentic RL在完整交互轨迹上进行优化。打个比方，token级优化就像优化棋手的每一手棋，而轨迹级优化是站在整盘棋的角度评估这一系列操作是否最终赢得了胜利：

\`\`\`python
class TrajectoryOptimizer:
    """轨迹级优化器"""
    
    def __init__(self, agent, reward_model, gamma=0.99):
        self.agent = agent
        self.reward_model = reward_model
        self.gamma = gamma
        
    def collect_trajectory(self, task) -> dict:
        """收集一条完整的交互轨迹"""
        trajectory = {
            "states": [],
            "actions": [],
            "rewards": [],
            "dones": []
        }
        
        state = self.agent.reset(task)
        done = False
        
        while not done:
            # 记录状态
            trajectory["states"].append(state)
            
            # Agent决策
            action = self.agent.act(state)
            trajectory["actions"].append(action)
            
            # 环境反馈
            next_state, reward, done = self.agent.step(action)
            trajectory["rewards"].append(reward)
            trajectory["dones"].append(done)
            
            state = next_state
            
        return trajectory
        
    def compute_returns(self, rewards: list) -> list:
        """计算折扣累积回报"""
        returns = []
        G = 0
        for r in reversed(rewards):
            G = r + self.gamma * G
            returns.insert(0, G)
        return returns
        
    def optimize(self, trajectories: list):
        """基于轨迹优化策略"""
        all_states = []
        all_actions = []
        all_returns = []
        
        for traj in trajectories:
            returns = self.compute_returns(traj["rewards"])
            all_states.extend(traj["states"])
            all_actions.extend(traj["actions"])
            all_returns.extend(returns)
            
        # 策略梯度更新
        self.agent.update(all_states, all_actions, all_returns)
\`\`\`

### 过程奖励模型（PRM）

对于复杂任务，仅基于最终结果给予奖励可能导致奖励稀疏。这就像你练习一道十步证明题，如果只在最后告诉你“对”或“错”，你很难知道哪一步出了问题。过程奖励模型解决的就是这个问题——它评估每个中间步骤的质量：

\`\`\`python
class ProcessRewardModel:
    """过程奖励模型：评估每个推理步骤的质量"""
    
    def __init__(self, model):
        self.model = model
        
    def evaluate_step(self, state: str, action: str, context: str) -> float:
        """评估单个步骤的质量"""
        prompt = f"""评估以下推理步骤的质量（0-1分）：

问题上下文：
{context}

当前状态：
{state}

执行的动作：
{action}

评分标准：
- 逻辑正确性：动作是否合理
- 进展性：是否朝目标前进
- 效率：是否有不必要的步骤

请输出一个0-1之间的分数。"""
        
        score = float(self.model.generate(prompt).strip())
        return score
        
    def evaluate_trajectory(self, trajectory: dict) -> list:
        """评估整个轨迹的每个步骤"""
        step_rewards = []
        
        for i, (state, action) in enumerate(zip(trajectory["states"], trajectory["actions"])):
            context = self._build_context(trajectory, i)
            reward = self.evaluate_step(state, action, context)
            step_rewards.append(reward)
            
        return step_rewards
\`\`\`

### 蒙特卡洛树搜索（MCTS）

MCTS用于在动作空间中搜索最优策略。还记得AlphaGo吗？它就是用MCTS来决定下一步棋走哪里的。在Agent场景中，MCTS帮助智能体在多个可能的行动中搜索最优选择——每次决策时“在脑中模拟几步”，看看哪个方向最有前途：

\`\`\`python
class MCTSNode:
    def __init__(self, state, parent=None):
        self.state = state
        self.parent = parent
        self.children = {}
        self.visits = 0
        self.value = 0
        
    def ucb_score(self, c=1.41):
        """Upper Confidence Bound"""
        if self.visits == 0:
            return float("inf")
        exploitation = self.value / self.visits
        exploration = c * math.sqrt(math.log(self.parent.visits) / self.visits)
        return exploitation + exploration


class AgentMCTS:
    """用于Agent决策的MCTS"""
    
    def __init__(self, agent, simulator, reward_fn, num_simulations=100):
        self.agent = agent
        self.simulator = simulator
        self.reward_fn = reward_fn
        self.num_simulations = num_simulations
        
    def search(self, state) -> str:
        """搜索最优动作"""
        root = MCTSNode(state)
        
        for _ in range(self.num_simulations):
            node = self._select(root)
            if not self._is_terminal(node):
                node = self._expand(node)
            reward = self._simulate(node)
            self._backpropagate(node, reward)
            
        # 选择访问次数最多的子节点
        best_action = max(root.children.keys(), key=lambda a: root.children[a].visits)
        return best_action
        
    def _select(self, node):
        """选择：沿着UCB最高的路径下降"""
        while node.children and not self._is_terminal(node):
            node = max(node.children.values(), key=lambda n: n.ucb_score())
        return node
        
    def _expand(self, node):
        """扩展：添加新的子节点"""
        possible_actions = self.agent.get_possible_actions(node.state)
        for action in possible_actions:
            if action not in node.children:
                next_state = self.simulator.step(node.state, action)
                child = MCTSNode(next_state, parent=node)
                node.children[action] = child
        return random.choice(list(node.children.values()))
        
    def _simulate(self, node):
        """模拟：随机策略rollout"""
        state = node.state
        total_reward = 0
        
        for _ in range(10):  # 最多模拟10步
            if self._is_terminal_state(state):
                break
            action = self.agent.sample_action(state)
            state, reward, done = self.simulator.step(state, action)
            total_reward += reward
            if done:
                break
                
        return total_reward
        
    def _backpropagate(self, node, reward):
        """回溯：更新路径上所有节点的统计"""
        while node:
            node.visits += 1
            node.value += reward
            node = node.parent
\`\`\`

## 典型算法

### GRPO用于Agent优化

GRPO（Group Relative Policy Optimization）可以扩展到Agent场景。它的核心思想很直觉：让Agent对同一个任务尝试多种不同的解法，然后比较哪个解法效果更好——加强好的、削弱差的。就像一个厨师尝试四种不同的配方做同一道菜，让食客打分后，记住得分高的配方的做法：

\`\`\`python
class AgentGRPO:
    """用于Agent的GRPO优化"""
    
    def __init__(self, agent, reward_model, group_size=4):
        self.agent = agent
        self.reward_model = reward_model
        self.group_size = group_size
        
    def optimize_step(self, task):
        """单步优化"""
        # 采样多条轨迹
        trajectories = []
        for _ in range(self.group_size):
            traj = self.collect_trajectory(task)
            trajectories.append(traj)
            
        # 计算轨迹奖励
        rewards = [self.evaluate_trajectory(t) for t in trajectories]
        
        # 组内相对排序
        mean_reward = np.mean(rewards)
        advantages = [(r - mean_reward) / (np.std(rewards) + 1e-8) for r in rewards]
        
        # 策略更新：正优势增加概率，负优势减少概率
        for traj, adv in zip(trajectories, advantages):
            if adv > 0:
                self.agent.reinforce(traj, weight=adv)
            else:
                self.agent.penalize(traj, weight=-adv)
                
    def evaluate_trajectory(self, trajectory) -> float:
        """评估轨迹总奖励"""
        # 可以使用最终奖励
        final_reward = trajectory["rewards"][-1] if trajectory["rewards"] else 0
        
        # 也可以结合过程奖励
        process_reward = sum(trajectory["rewards"]) / len(trajectory["rewards"])
        
        return 0.5 * final_reward + 0.5 * process_reward
\`\`\`

### STaR：自我教学推理

STaR（Self-Taught Reasoner）让模型通过自己的成功经验学习。这就像一个学生做了100道题，其中40道做对了。他不是单纯记住答案，而是仔细分析“我做对的那些题，解题思路是什么”，然后将这些成功的思路内化为自己的能力：

\`\`\`python
class STaRTrainer:
    """STaR训练器：从成功轨迹中学习"""
    
    def __init__(self, agent, verifier):
        self.agent = agent
        self.verifier = verifier
        self.successful_trajectories = []
        
    def collect_and_filter(self, tasks: list, num_samples=10):
        """收集并筛选成功的轨迹"""
        for task in tasks:
            for _ in range(num_samples):
                trajectory = self.agent.generate_trajectory(task)
                
                # 验证是否成功
                if self.verifier.check(task, trajectory):
                    self.successful_trajectories.append({
                        "task": task,
                        "trajectory": trajectory
                    })
                    
    def rationalize(self, task, correct_answer):
        """为已知答案生成推理过程"""
        prompt = f"""任务：{task}
正确答案：{correct_answer}

请生成得到这个答案的推理过程。"""
        
        rationalization = self.agent.generate(prompt)
        return rationalization
        
    def train(self):
        """用成功轨迹微调模型"""
        training_data = []
        
        for item in self.successful_trajectories:
            # 将轨迹转换为训练样本
            input_text = item["task"]
            output_text = self._format_trajectory(item["trajectory"])
            training_data.append((input_text, output_text))
            
        self.agent.finetune(training_data)
\`\`\`

## 环境设计

Agentic RL的一个关键要素是环境设计——智能体需要一个可以交互、能给出反馈的“训练场”。这就像飞行员训练需要飞行模拟器，智能体也需要一个能够模拟真实任务场景的环境。

### 任务环境接口

\`\`\`python
from abc import ABC, abstractmethod

class AgentEnvironment(ABC):
    """Agent交互环境的抽象接口"""
    
    @abstractmethod
    def reset(self, task: str) -> str:
        """重置环境，返回初始状态"""
        pass
        
    @abstractmethod
    def step(self, action: str) -> tuple:
        """执行动作，返回(next_state, reward, done)"""
        pass
        
    @abstractmethod
    def get_available_actions(self) -> list:
        """获取当前可用的动作列表"""
        pass


class CodeExecutionEnvironment(AgentEnvironment):
    """代码执行环境"""
    
    def __init__(self):
        self.state = None
        self.history = []
        self.sandbox = CodeSandbox()
        
    def reset(self, task: str) -> str:
        self.state = {"task": task, "code": "", "outputs": []}
        self.history = []
        return self._format_state()
        
    def step(self, action: str) -> tuple:
        # 解析动作
        action_type, action_content = self._parse_action(action)
        
        if action_type == "write_code":
            self.state["code"] = action_content
            reward = 0
            done = False
            
        elif action_type == "execute":
            result = self.sandbox.execute(self.state["code"])
            self.state["outputs"].append(result)
            
            # 根据执行结果给予奖励
            if result["success"]:
                reward = 0.5
                # 检查是否完成任务
                done = self._check_completion()
                if done:
                    reward = 1.0
            else:
                reward = -0.1
                done = False
                
        elif action_type == "submit":
            done = True
            reward = self._evaluate_submission()
            
        self.history.append({"action": action, "state": self._format_state()})
        
        return self._format_state(), reward, done
\`\`\`

### 奖励塑形

设计良好的奖励函数是Agentic RL成功的关键。这就像设计一个好的评分体系：只看最终成绩太粗糙，还得考虑学习态度、进步幅度、方法是否高效等多个维度：

\`\`\`python
class RewardShaper:
    """奖励塑形器：将稀疏奖励转化为密集奖励"""
    
    def __init__(self, task_evaluator, progress_evaluator):
        self.task_eval = task_evaluator
        self.progress_eval = progress_evaluator
        
    def compute_reward(self, state, action, next_state, done) -> float:
        reward = 0
        
        # 1. 任务完成奖励（稀疏）
        if done:
            reward += self.task_eval.evaluate(next_state) * 10
            
        # 2. 进度奖励（密集）
        progress_before = self.progress_eval.estimate(state)
        progress_after = self.progress_eval.estimate(next_state)
        progress_reward = progress_after - progress_before
        reward += progress_reward
        
        # 3. 效率惩罚（鼓励简洁）
        action_length = len(action)
        efficiency_penalty = -0.001 * action_length
        reward += efficiency_penalty
        
        # 4. 错误惩罚
        if self._is_error(next_state):
            reward -= 0.5
            
        return reward
\`\`\`

Agentic RL为智能体提供了从环境反馈中持续学习的能力。尽管训练成本较高，但它能够让智能体习得难以通过监督学习获取的复杂策略。就像一个棋手只靠背棋谱无法成为大师，必须通过实战中不断输赢来练就直觉和判断力——Agentic RL正是给了智能体这种“在实战中成长”的能力，是构建高级智能体的重要技术路径。
`
    },
    {
      id: "adv-13-08-openai-claude",
      title: "13.8 OpenAI与Claude协议",
      file: "大模型教程/13-智能体技术/07-OpenAI与Claude协议.md",
      difficulty: "中级-高级",
      duration: "1h",
      week: 0,
      phase: 0,
      keywords: ["OpenAI与Claude协议", "OpenAI", "Claude", "LLM", "Anthropic"],
      content: `# OpenAI与Claude协议

主流LLM提供商（OpenAI、Anthropic等）定义了各自的函数调用（Function Calling）和工具使用协议。

假设你是一个餐厅经理，手下有几个不同厨师（不同的LLM提供商）。每个厨师都能使用各种厨具（工具），但他们接受指令的方式略有不同：有的喜欢你用标准菜单格式下单，有的则偏好自由形式的指令。理解这些协议的设计理念和使用方式，是构建跨平台智能体应用的基础。

## OpenAI Function Calling

### 基本概念

OpenAI的Function Calling允许模型识别何时需要调用外部函数，并生成符合函数签名的结构化参数。简单来说，就是你告诉模型“你有哪些工具可以用”，然后它会自己判断什么时候该用哪个工具、怎么填参数。

\`\`\`mermaid
sequenceDiagram
    participant U as 用户
    participant C as Client
    participant API as LLM API
    participant T as 工具/函数
    U->>C: 发送请求
    C->>API: messages + tools 定义
    API-->>C: tool_calls 响应
    C->>T: 执行函数调用
    T-->>C: 返回结果
    C->>API: 携带 tool 结果继续对话
    API-->>C: 最终回答
    C-->>U: 展示结果
\`\`\`

### API格式

\`\`\`python
from openai import OpenAI

client = OpenAI()

# 定义可用的函数
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "获取指定城市的天气信息",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "城市名称，如'北京'"
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                        "description": "温度单位"
                    }
                },
                "required": ["location"]
            }
        }
    }
]

# 调用API
response = client.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "user", "content": "北京今天天气怎么样？"}
    ],
    tools=tools,
    tool_choice="auto"  # 让模型自行决定是否调用工具
)
\`\`\`

### 响应处理

\`\`\`python
message = response.choices[0].message

# 检查是否有工具调用
if message.tool_calls:
    for tool_call in message.tool_calls:
        function_name = tool_call.function.name
        arguments = json.loads(tool_call.function.arguments)
        
        # 执行函数
        if function_name == "get_weather":
            result = get_weather(**arguments)
            
        # 将结果返回给模型
        messages.append(message)  # 先添加助手的响应
        messages.append({
            "role": "tool",
            "tool_call_id": tool_call.id,
            "name": function_name,
            "content": json.dumps(result)
        })
        
    # 继续对话，让模型整合结果
    final_response = client.chat.completions.create(
        model="gpt-4",
        messages=messages
    )
\`\`\`

### 并行函数调用

OpenAI支持模型同时请求多个函数调用。这就像你同时问两个问题——“北京和上海今天天气怎么样？”——智能体不需要先查完北京再查上海，可以同时发起两个查询：

\`\`\`python
# 模型可能返回多个tool_calls
response = client.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "user", "content": "查询北京和上海的天气"}
    ],
    tools=tools,
    parallel_tool_calls=True  # 允许并行调用
)

# 处理多个调用
tool_calls = response.choices[0].message.tool_calls
results = []
for tc in tool_calls:
    # 可以并行执行
    result = execute_tool(tc.function.name, tc.function.arguments)
    results.append({
        "tool_call_id": tc.id,
        "name": tc.function.name,
        "content": json.dumps(result)
    })
\`\`\`

### 强制函数调用

\`\`\`python
# 强制模型调用特定函数
response = client.chat.completions.create(
    model="gpt-4",
    messages=messages,
    tools=tools,
    tool_choice={"type": "function", "function": {"name": "get_weather"}}
)

# 禁止函数调用
response = client.chat.completions.create(
    model="gpt-4",
    messages=messages,
    tools=tools,
    tool_choice="none"
)
\`\`\`

## Claude Tool Use

### 基本概念

Anthropic的Claude采用类似但略有不同的工具使用协议。Claude强调“思考优先”，会在调用工具前展示推理过程。如果说OpenAI的风格是“二话不说直接干”，那Claude更像“我先想想为什么要用这个工具，然后再用”。

### API格式

\`\`\`python
import anthropic

client = anthropic.Anthropic()

# 定义工具
tools = [
    {
        "name": "get_weather",
        "description": "获取指定位置的当前天气",
        "input_schema": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "城市名称"
                }
            },
            "required": ["location"]
        }
    }
]

response = client.messages.create(
    model="claude-3-opus-20240229",
    max_tokens=1024,
    tools=tools,
    messages=[
        {"role": "user", "content": "上海现在的天气如何？"}
    ]
)
\`\`\`

### 响应结构

Claude的响应可能包含多个内容块：

\`\`\`python
for content_block in response.content:
    if content_block.type == "text":
        # 模型的文本响应（包括思考过程）
        print(f"Text: {content_block.text}")
        
    elif content_block.type == "tool_use":
        # 工具调用请求
        tool_name = content_block.name
        tool_input = content_block.input
        tool_use_id = content_block.id
        
        # 执行工具
        result = execute_tool(tool_name, tool_input)
        
        # 构建工具结果消息
        tool_result = {
            "type": "tool_result",
            "tool_use_id": tool_use_id,
            "content": json.dumps(result)
        }
\`\`\`

### 完整对话流程

\`\`\`python
def chat_with_tools(user_message: str, tools: list):
    messages = [{"role": "user", "content": user_message}]
    
    while True:
        response = client.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=1024,
            tools=tools,
            messages=messages
        )
        
        # 检查是否需要调用工具
        tool_uses = [b for b in response.content if b.type == "tool_use"]
        
        if not tool_uses:
            # 没有工具调用，返回最终响应
            text_blocks = [b.text for b in response.content if b.type == "text"]
            return "\\n".join(text_blocks)
            
        # 处理工具调用
        assistant_content = response.content
        tool_results = []
        
        for tool_use in tool_uses:
            result = execute_tool(tool_use.name, tool_use.input)
            tool_results.append({
                "type": "tool_result",
                "tool_use_id": tool_use.id,
                "content": json.dumps(result)
            })
            
        # 添加助手响应和工具结果
        messages.append({"role": "assistant", "content": assistant_content})
        messages.append({"role": "user", "content": tool_results})
\`\`\`

## 协议对比

了解了两种协议的具体实现，我们来对比一下它们的关键差异。就像两个厨师的工作风格不同，但都能做出好菜——关键是你得知道如何与每个厨师配合：

| 特性 | OpenAI | Claude |
|------|--------|--------|
| 参数定义 | JSON Schema | JSON Schema |
| 参数字段名 | parameters | input_schema |
| 响应格式 | tool_calls数组 | content块列表 |
| 结果传递 | tool角色消息 | tool_result内容类型 |
| 并行调用 | 明确支持 | 隐式支持 |
| 思考展示 | 可选 | 默认展示 |

### 统一抽象层

为了实现跨平台兼容，可以构建统一的抽象层。在实际开发中，这是非常重要的实践——不要让业务代码直接依赖特定提供商的API，否则切换提供商时会牵一发动全身。就像电器插头有转换器一样，抽象层让你的代码能“插上”任何提供商：

\`\`\`python
from abc import ABC, abstractmethod
from typing import List, Dict, Any

class ToolDefinition:
    """统一的工具定义格式"""
    def __init__(self, name: str, description: str, parameters: Dict):
        self.name = name
        self.description = description
        self.parameters = parameters
        
    def to_openai_format(self) -> Dict:
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": self.parameters
            }
        }
        
    def to_claude_format(self) -> Dict:
        return {
            "name": self.name,
            "description": self.description,
            "input_schema": self.parameters
        }


class ToolCall:
    """统一的工具调用格式"""
    def __init__(self, id: str, name: str, arguments: Dict):
        self.id = id
        self.name = name
        self.arguments = arguments


class LLMProvider(ABC):
    """LLM提供商抽象接口"""
    
    @abstractmethod
    def chat(self, messages: List[Dict], tools: List[ToolDefinition]) -> tuple:
        """
        返回: (text_response, tool_calls)
        """
        pass
        
    @abstractmethod
    def continue_with_tool_results(self, messages: List[Dict], tool_results: List[Dict]) -> tuple:
        pass


class OpenAIProvider(LLMProvider):
    def __init__(self, model="gpt-4"):
        self.client = OpenAI()
        self.model = model
        
    def chat(self, messages, tools):
        openai_tools = [t.to_openai_format() for t in tools]
        
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            tools=openai_tools if openai_tools else None
        )
        
        message = response.choices[0].message
        
        text = message.content or ""
        tool_calls = []
        
        if message.tool_calls:
            for tc in message.tool_calls:
                tool_calls.append(ToolCall(
                    id=tc.id,
                    name=tc.function.name,
                    arguments=json.loads(tc.function.arguments)
                ))
                
        return text, tool_calls


class ClaudeProvider(LLMProvider):
    def __init__(self, model="claude-3-opus-20240229"):
        self.client = anthropic.Anthropic()
        self.model = model
        
    def chat(self, messages, tools):
        claude_tools = [t.to_claude_format() for t in tools]
        
        response = self.client.messages.create(
            model=self.model,
            max_tokens=1024,
            tools=claude_tools if claude_tools else None,
            messages=messages
        )
        
        text_parts = []
        tool_calls = []
        
        for block in response.content:
            if block.type == "text":
                text_parts.append(block.text)
            elif block.type == "tool_use":
                tool_calls.append(ToolCall(
                    id=block.id,
                    name=block.name,
                    arguments=block.input
                ))
                
        return "\\n".join(text_parts), tool_calls
\`\`\`

## Anthropic Agent Skills协议

Anthropic提出的Agent Skills协议是一种更高级的智能体能力描述方式：

\`\`\`yaml
# skill.yaml
name: "web_search"
version: "1.0"
description: "搜索互联网获取最新信息"

triggers:
  - "搜索"
  - "查找"
  - "最新信息"
  
capabilities:
  - type: "tool"
    tool:
      name: "search"
      description: "执行网络搜索"
      parameters:
        query:
          type: "string"
          required: true

instructions: |
  当用户需要查找信息时：
  1. 分析用户意图，提取关键词
  2. 调用search工具
  3. 整理搜索结果，提供简洁回答
  
examples:
  - input: "最近有什么科技新闻？"
    output: |
      [调用search("科技新闻 2024")]
      根据搜索结果，以下是最近的科技新闻...
\`\`\`

### Skills加载与执行

\`\`\`python
class SkillManager:
    """技能管理器"""
    
    def __init__(self):
        self.skills = {}
        
    def load_skill(self, skill_path: str):
        """加载技能定义"""
        with open(skill_path) as f:
            skill_def = yaml.safe_load(f)
            
        skill = AgentSkill(skill_def)
        self.skills[skill.name] = skill
        
    def match_skill(self, user_input: str) -> Optional[AgentSkill]:
        """根据用户输入匹配合适的技能"""
        for skill in self.skills.values():
            if skill.matches(user_input):
                return skill
        return None
        
    def get_context_for_llm(self, matched_skills: List[AgentSkill]) -> str:
        """生成LLM的上下文指令"""
        context_parts = []
        
        for skill in matched_skills:
            context_parts.append(f"""
## 技能: {skill.name}
{skill.instructions}

可用工具:
{skill.format_tools()}

示例:
{skill.format_examples()}
""")
        
        return "\\n".join(context_parts)
\`\`\`

## 最佳实践

最后，分享一些在实际开发中总结出的经验。这些看似细节的问题，往往是决定智能体应用是否稳定可靠的关键。

### 函数描述优化

清晰的函数描述能显著提升调用准确率。这就像给厨师写菜谱——写“煮一下”和写“中火煮5分钟，水开后转小火”，出来的结果完全不同：

\`\`\`python
# 差的描述
{
    "name": "search",
    "description": "搜索",
    "parameters": {"query": {"type": "string"}}
}

# 好的描述
{
    "name": "web_search",
    "description": "搜索互联网获取最新信息。适用于：查找新闻、获取实时数据、验证事实。不适用于：主观问题、需要推理的问题。",
    "parameters": {
        "query": {
            "type": "string",
            "description": "搜索关键词，应包含核心概念，避免过长"
        },
        "time_range": {
            "type": "string",
            "enum": ["day", "week", "month", "year"],
            "description": "限制搜索的时间范围"
        }
    }
}
\`\`\`

### 错误处理

\`\`\`python
def safe_tool_execution(tool_name: str, arguments: dict) -> dict:
    """安全的工具执行包装"""
    try:
        result = tools[tool_name](**arguments)
        return {"success": True, "result": result}
    except KeyError:
        return {"success": False, "error": f"未知工具: {tool_name}"}
    except TypeError as e:
        return {"success": False, "error": f"参数错误: {str(e)}"}
    except Exception as e:
        return {"success": False, "error": f"执行错误: {str(e)}"}
\`\`\`

### 重试机制

\`\`\`python
def chat_with_retry(messages, tools, max_retries=3):
    """带重试的对话"""
    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model="gpt-4",
                messages=messages,
                tools=tools
            )
            return response
        except openai.RateLimitError:
            time.sleep(2 ** attempt)  # 指数退避
        except openai.APIError as e:
            if attempt == max_retries - 1:
                raise
            time.sleep(1)
    
    raise Exception("达到最大重试次数")
\`\`\`

掌握主流LLM的函数调用协议，是构建可靠智能体应用的基础。在实际开发中，最重要的两条建议：一是使用统一的抽象层来隔离不同提供商的差异，让你的业务代码不被“绑定”在某一家；二是花时间写好工具描述，这看似简单，却是影响工具调用准确率的最关键因素。
`
    },
    {
      id: "adv-13-09-mcp",
      title: "13.9 工具与MCP协议",
      file: "大模型教程/13-智能体技术/08-工具与MCP协议.md",
      difficulty: "中级-高级",
      duration: "0.5h",
      week: 0,
      phase: 0,
      keywords: ["工具与MCP协议", "MCP", "Tools", "Model", "Context"],
      content: `# 工具与MCP协议

想象一下，一位技艺精湛的大厨站在厨房里。他脑中装着上千道菜的做法，但如果没有锅碗瓢盆、没有灶台和刀具，再好的厨艺也无从施展。大语言模型与此类似——它具备强大的推理和语言能力，但要真正"做事"，就需要借助外部工具：查天气、搜资料、调接口、读写文件。工具（Tools）正是智能体与外部世界交互的桥梁。

而当厨房里的工具越来越多、来源各异时，就需要一套统一的"厨具标准"——每把刀的接口一致、每口锅的规格通用。MCP（Model Context Protocol）正是 Anthropic 提出的这样一套标准化工具协议，旨在统一智能体与工具的交互方式。本节将从工具的设计原则出发，逐步深入 MCP 协议的核心概念与实现。

## 工具的本质

### 什么是工具

在智能体语境下，工具是一个可被LLM调用的函数或服务，用于完成模型自身无法直接完成的任务。回到大厨的比喻：大厨知道"红烧肉需要焯水"，但焯水这个动作得靠锅和灶台来完成——工具就是智能体手中的锅和灶台。下表列举了常见的工具类型：

| 工具类型 | 示例 | 解决的问题 |
|----------|------|------------|
| 信息获取 | 搜索引擎、数据库查询 | 模型知识的时效性和覆盖度 |
| 计算执行 | 计算器、代码解释器 | 精确计算和复杂运算 |
| 外部交互 | API调用、文件操作 | 与外部系统的集成 |
| 状态管理 | 记忆存储、会话管理 | 跨对话的状态保持 |

## 工具的设计原则

好的厨具有什么特点？菜刀就是切菜的，不会同时兼做搅拌；刻度量杯让你一目了然地知道该倒多少；如果菜刀钝了，你一摸就知道——而不是切到一半才发现。设计工具的原则与此相通：

**单一职责**：每个工具只做一件事，避免功能过载。就像菜刀负责切、锅负责炒，不要造一把"万能刀锅"。

**输入明确**：参数定义清晰，有明确的类型和约束。好比量杯上的刻度线，让使用者不必猜测。

**输出一致**：返回格式固定，便于LLM理解和处理。就像每道菜出锅时都装在标准的盘子里，后续流程才能顺畅对接。

**错误透明**：错误信息清晰，帮助LLM理解问题并调整策略。如果烤箱温度不对，应该直接报警，而不是默默烤糊。

\`\`\`python
# 好的工具设计
class WeatherTool:
    """获取天气信息的工具"""
    
    name = "get_weather"
    description = "获取指定城市的当前天气信息"
    
    parameters = {
        "type": "object",
        "properties": {
            "city": {
                "type": "string",
                "description": "城市名称，如'北京'、'上海'"
            },
            "unit": {
                "type": "string",
                "enum": ["celsius", "fahrenheit"],
                "default": "celsius",
                "description": "温度单位"
            }
        },
        "required": ["city"]
    }
    
    def execute(self, city: str, unit: str = "celsius") -> dict:
        """执行工具"""
        try:
            weather_data = self._fetch_weather(city)
            return {
                "success": True,
                "data": {
                    "city": city,
                    "temperature": self._convert_temp(weather_data["temp"], unit),
                    "condition": weather_data["condition"],
                    "humidity": weather_data["humidity"]
                }
            }
        except CityNotFoundError:
            return {
                "success": False,
                "error": f"未找到城市: {city}",
                "suggestion": "请检查城市名称是否正确"
            }
\`\`\`

# MCP协议概述

理解了单个工具的设计之后，一个自然的问题是：当智能体需要使用来自不同开发者、不同平台的几十种工具时，怎么办？假设你正在组建一个开放式大厨房，每位供应商提供的灶台接口不同、锅具尺寸各异——这将是一场噩梦。MCP 协议就是为了解决这个"工具生态的标准化"问题而诞生的。

### 设计目标

MCP（Model Context Protocol）旨在解决以下问题：

1. **标准化**：统一不同工具的接口规范
2. **可发现性**：让模型能够动态发现可用工具
3. **安全性**：提供权限控制和沙箱执行
4. **可组合性**：支持工具的组合和编排

\`\`\`mermaid
sequenceDiagram
    participant H as Host应用
    participant C as MCP Client
    participant S as MCP Server
    participant T as 工具执行
    H->>C: 用户请求
    C->>S: tools/list
    S-->>C: 返回工具列表
    C->>S: tools/call
    S->>T: 执行工具
    T-->>S: 返回结果
    S-->>C: JSON-RPC 响应
    C-->>H: 展示结果
\`\`\`

### 核心概念

\`\`\`
┌─────────────────────────────────────────────────────┐
│                    MCP架构                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────┐     ┌─────────────┐              │
│  │   Client    │────▶│   Server    │              │
│  │  (Claude)   │◀────│ (工具提供者) │              │
│  └─────────────┘     └─────────────┘              │
│         │                   │                      │
│         │     JSON-RPC      │                      │
│         │    over stdio     │                      │
│         │    或 HTTP        │                      │
│         │                   │                      │
│         ▼                   ▼                      │
│  ┌─────────────┐     ┌─────────────┐              │
│  │  Resources  │     │   Tools     │              │
│  │  (资源访问)  │     │  (工具调用)  │              │
│  └─────────────┘     └─────────────┘              │
│                                                     │
└─────────────────────────────────────────────────────┘
\`\`\`

用厨房的比喻来理解这个架构：Server 就像是一个个"专业厨具供应商"，每家提供特定类型的工具（天气查询、数据库访问等）；Client 则是大厨（LLM应用），他向供应商询问"你有哪些工具？"，然后按需取用。两者之间通过标准化的"订单格式"（JSON-RPC）沟通。

**Server**：提供工具和资源的服务端程序——相当于厨具供应商
**Client**：使用工具的客户端（通常是LLM应用）——相当于大厨
**Tools**：可被调用的函数——相当于具体的厨具（刀、锅、烤箱）
**Resources**：可被读取的数据源——相当于食材仓库的货架清单

## 协议消息格式

这就像大厨和供应商之间的对话有固定格式：大厨说"请给我用某某工具处理某某食材"，供应商回复"好的，结果如下"。MCP 使用 JSON-RPC 2.0 作为这种"对话格式"：

\`\`\`json
// 请求
{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
        "name": "get_weather",
        "arguments": {
            "city": "北京"
        }
    }
}

// 响应
{
    "jsonrpc": "2.0",
    "id": 1,
    "result": {
        "content": [
            {
                "type": "text",
                "text": "北京当前温度25°C，晴天"
            }
        ]
    }
}
\`\`\`

## MCP Server实现

### 基础结构

\`\`\`python
import json
import sys
from typing import Any, Callable

class MCPServer:
    """MCP服务端基础实现"""
    
    def __init__(self, name: str, version: str = "1.0.0"):
        self.name = name
        self.version = version
        self.tools = {}
        self.resources = {}
        
    def tool(self, name: str, description: str, parameters: dict):
        """工具装饰器"""
        def decorator(func: Callable):
            self.tools[name] = {
                "name": name,
                "description": description,
                "inputSchema": parameters,
                "handler": func
            }
            return func
        return decorator
        
    def resource(self, uri: str, name: str, description: str):
        """资源装饰器"""
        def decorator(func: Callable):
            self.resources[uri] = {
                "uri": uri,
                "name": name,
                "description": description,
                "handler": func
            }
            return func
        return decorator
        
    def handle_request(self, request: dict) -> dict:
        """处理JSON-RPC请求"""
        method = request.get("method")
        params = request.get("params", {})
        req_id = request.get("id")
        
        try:
            if method == "initialize":
                result = self._handle_initialize(params)
            elif method == "tools/list":
                result = self._handle_tools_list()
            elif method == "tools/call":
                result = self._handle_tools_call(params)
            elif method == "resources/list":
                result = self._handle_resources_list()
            elif method == "resources/read":
                result = self._handle_resources_read(params)
            else:
                return self._error_response(req_id, -32601, f"Method not found: {method}")
                
            return {"jsonrpc": "2.0", "id": req_id, "result": result}
            
        except Exception as e:
            return self._error_response(req_id, -32000, str(e))
            
    def _handle_initialize(self, params: dict) -> dict:
        return {
            "protocolVersion": "2024-11-05",
            "serverInfo": {
                "name": self.name,
                "version": self.version
            },
            "capabilities": {
                "tools": {"listChanged": True},
                "resources": {"subscribe": True}
            }
        }
        
    def _handle_tools_list(self) -> dict:
        tools = []
        for tool in self.tools.values():
            tools.append({
                "name": tool["name"],
                "description": tool["description"],
                "inputSchema": tool["inputSchema"]
            })
        return {"tools": tools}
        
    def _handle_tools_call(self, params: dict) -> dict:
        tool_name = params.get("name")
        arguments = params.get("arguments", {})
        
        if tool_name not in self.tools:
            raise ValueError(f"Unknown tool: {tool_name}")
            
        handler = self.tools[tool_name]["handler"]
        result = handler(**arguments)
        
        return {
            "content": [
                {"type": "text", "text": json.dumps(result, ensure_ascii=False)}
            ]
        }
        
    def run_stdio(self):
        """通过标准输入输出运行服务"""
        while True:
            line = sys.stdin.readline()
            if not line:
                break
                
            try:
                request = json.loads(line)
                response = self.handle_request(request)
                sys.stdout.write(json.dumps(response) + "\\n")
                sys.stdout.flush()
            except json.JSONDecodeError:
                pass
\`\`\`

### 示例：天气服务

\`\`\`python
# weather_server.py
from mcp_server import MCPServer

server = MCPServer("weather-service", "1.0.0")

@server.tool(
    name="get_current_weather",
    description="获取指定城市的当前天气",
    parameters={
        "type": "object",
        "properties": {
            "city": {"type": "string", "description": "城市名称"},
            "country": {"type": "string", "description": "国家代码，如CN、US"}
        },
        "required": ["city"]
    }
)
def get_current_weather(city: str, country: str = "CN"):
    # 实际实现会调用天气API
    return {
        "city": city,
        "temperature": 25,
        "condition": "晴",
        "humidity": 60
    }

@server.tool(
    name="get_forecast",
    description="获取未来几天的天气预报",
    parameters={
        "type": "object",
        "properties": {
            "city": {"type": "string"},
            "days": {"type": "integer", "minimum": 1, "maximum": 7}
        },
        "required": ["city", "days"]
    }
)
def get_forecast(city: str, days: int):
    return {
        "city": city,
        "forecast": [
            {"day": i+1, "temp_high": 28-i, "temp_low": 18-i}
            for i in range(days)
        ]
    }

@server.resource(
    uri="weather://cities",
    name="支持的城市列表",
    description="获取支持查询天气的城市列表"
)
def get_cities():
    return {
        "cities": ["北京", "上海", "广州", "深圳", "杭州"]
    }

if __name__ == "__main__":
    server.run_stdio()
\`\`\`

## MCP Client实现

\`\`\`python
import subprocess
import json

class MCPClient:
    """MCP客户端"""
    
    def __init__(self, server_command: list):
        self.process = subprocess.Popen(
            server_command,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            text=True
        )
        self.request_id = 0
        self._initialize()
        
    def _send_request(self, method: str, params: dict = None) -> dict:
        self.request_id += 1
        request = {
            "jsonrpc": "2.0",
            "id": self.request_id,
            "method": method
        }
        if params:
            request["params"] = params
            
        self.process.stdin.write(json.dumps(request) + "\\n")
        self.process.stdin.flush()
        
        response_line = self.process.stdout.readline()
        return json.loads(response_line)
        
    def _initialize(self):
        response = self._send_request("initialize", {
            "protocolVersion": "2024-11-05",
            "clientInfo": {"name": "mcp-client", "version": "1.0.0"}
        })
        return response.get("result")
        
    def list_tools(self) -> list:
        response = self._send_request("tools/list")
        return response.get("result", {}).get("tools", [])
        
    def call_tool(self, name: str, arguments: dict) -> dict:
        response = self._send_request("tools/call", {
            "name": name,
            "arguments": arguments
        })
        return response.get("result")
        
    def close(self):
        self.process.terminate()


# 使用示例
client = MCPClient(["python", "weather_server.py"])

# 列出可用工具
tools = client.list_tools()
print("Available tools:", [t["name"] for t in tools])

# 调用工具
result = client.call_tool("get_current_weather", {"city": "北京"})
print("Weather:", result)

client.close()
\`\`\`

# 工具组合与编排

在实际开发中，单个工具往往不足以完成复杂任务——就像做一道菜需要先洗、再切、再炒，工具之间也需要协调配合。这就引出了工具编排的概念。

### 工具链

工具链就像烹饪流程：先用搜索工具"备料"（获取原始信息），再用摘要工具"烹制"（提炼要点），最后呈给用户。每一步的输出自然地成为下一步的输入：

\`\`\`python
class ToolChain:
    """工具链：顺序执行多个工具"""
    
    def __init__(self, tools: list):
        self.tools = tools
        
    def execute(self, initial_input: dict) -> dict:
        result = initial_input
        
        for tool in self.tools:
            # 从上一步结果中提取本步骤需要的参数
            params = self._extract_params(result, tool.parameters)
            result = tool.execute(**params)
            
            if not result.get("success"):
                return result  # 提前终止
                
        return result

# 示例：搜索 -> 总结
search_tool = SearchTool()
summarize_tool = SummarizeTool()

chain = ToolChain([search_tool, summarize_tool])
result = chain.execute({"query": "量子计算最新进展"})
\`\`\`

### 条件分支

有时候，大厨需要根据食材的状态决定下一步操作——鱼是活的就清蒸，冷冻的就红烧。条件工具的逻辑与此相同：

\`\`\`python
class ConditionalTool:
    """条件工具：根据条件选择执行不同工具"""
    
    def __init__(self, condition_fn, tool_if_true, tool_if_false):
        self.condition = condition_fn
        self.tool_true = tool_if_true
        self.tool_false = tool_if_false
        
    def execute(self, **kwargs) -> dict:
        if self.condition(kwargs):
            return self.tool_true.execute(**kwargs)
        else:
            return self.tool_false.execute(**kwargs)
\`\`\`

### 并行执行

回到厨房场景，一位熟练的厨师不会等米饭蒸好了再去炒菜——他会同时开几个灶台并行操作。工具的并行执行也是如此，当多个工具之间没有依赖关系时，同时调用可以显著提升效率：

\`\`\`python
import asyncio

class ParallelTools:
    """并行执行多个工具"""
    
    def __init__(self, tools: list):
        self.tools = tools
        
    async def execute(self, inputs: list) -> list:
        """并行执行，inputs与tools一一对应"""
        tasks = [
            asyncio.create_task(self._execute_async(tool, inp))
            for tool, inp in zip(self.tools, inputs)
        ]
        return await asyncio.gather(*tasks)
        
    async def _execute_async(self, tool, params):
        # 将同步调用包装为异步
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, lambda: tool.execute(**params))
\`\`\`

## 安全考量

工具能力越强，安全要求就越高。这就像厨房管理——实习生不能碰大型切割设备，只有持证厨师才能操作明火灶台。在智能体工具体系中，权限控制和输入验证同样不可或缺。

### 权限控制

\`\`\`python
class SecureTool:
    """带权限控制的工具"""
    
    def __init__(self, tool, required_permissions: list):
        self.tool = tool
        self.required_permissions = required_permissions
        
    def execute(self, user_permissions: list, **kwargs):
        # 检查权限
        missing = set(self.required_permissions) - set(user_permissions)
        if missing:
            return {
                "success": False,
                "error": f"缺少权限: {missing}"
            }
            
        return self.tool.execute(**kwargs)
\`\`\`

### 输入验证

\`\`\`python
from jsonschema import validate, ValidationError

class ValidatedTool:
    """带输入验证的工具"""
    
    def __init__(self, tool, schema: dict):
        self.tool = tool
        self.schema = schema
        
    def execute(self, **kwargs):
        try:
            validate(instance=kwargs, schema=self.schema)
        except ValidationError as e:
            return {
                "success": False,
                "error": f"参数验证失败: {e.message}"
            }
            
        return self.tool.execute(**kwargs)
\`\`\`

回顾本节，有两点值得特别记住。第一，工具之于智能体，正如厨具之于大厨——模型的推理能力再强，也需要工具来"落地执行"。好的工具设计遵循单一职责、输入明确、输出一致、错误透明的原则。第二，MCP 协议的核心价值在于标准化：它让不同来源的工具可以"即插即用"，就像统一了厨房的电压和插座规格。通过遵循 MCP 规范，开发者可以创建可复用、可组合的工具，显著降低智能体应用的开发成本。随着 MCP 生态的发展，我们正在走向一个"工具即服务"的未来——智能体可以像逛超市一样，按需挑选和组合各种能力。
`
    },
    {
      id: "adv-13-10-rag",
      title: "13.10 RAG技术",
      file: "大模型教程/13-智能体技术/09-RAG技术.md",
      difficulty: "中级-高级",
      duration: "0.5h",
      week: 4,
      phase: 4,
      keywords: ["RAG技术", "RAG", "Retrieval", "Augmented", "Generation"],
      content: `# RAG技术

假设你正在参加一场开卷考试。老师允许你带资料进考场，但时间有限、资料堆积如山。你的策略是什么？当然是先理解题意，然后快速翻到相关页面，最后结合资料和自己的理解写出答案。RAG（Retrieval-Augmented Generation，检索增强生成）做的正是这件事——它让大语言模型在回答问题时能够"查阅参考资料"，而不是完全依赖记忆。这是构建知识密集型智能体应用的核心技术之一。

## RAG概述

### 为什么需要RAG

为什么不能让模型把所有知识都背下来呢？这就像问“为什么不把所有教材都背下来而要带资料进考场”。原因很简单：知识量太大、更新太快、而且很多是私有数据。下表对比了LLM的局限及 RAG 的应对策略：

\`\`\`mermaid
graph LR
    Q[用户查询] --> E[Embedding编码]
    E --> V[向量检索]
    V --> RR[Rerank重排序]
    RR --> CTX[上下文组装]
    CTX --> LLM[LLM生成回答]
    LLM --> A[输出给用户]
\`\`\`

| LLM局限 | RAG解决方案 |
|---------|------------|
| 知识截止日期 | 实时检索最新信息 |
| 幻觉问题 | 基于检索到的事实生成 |
| 领域知识不足 | 接入专业知识库 |
| 私有数据无法使用 | 安全地使用企业数据 |

### 基本架构

回到开卷考试的场景，RAG 的工作流程就是：理解题意（查询处理）→ 翻找资料（检索）→ 找到相关段落（上下文构建）→ 组织答案（生成）。用图表示如下：

\`\`\`
用户查询 → 查询处理 → 检索器 → 知识库
                          ↓
                      相关文档
                          ↓
                      上下文构建
                          ↓
                   LLM生成回答 → 用户
\`\`\`

## 核心组件

理解了 RAG 的整体流程，接下来我们逐一拆解其中的核心组件。如果把 RAG 比作开卷考试，那么 Embedding 模型就是你的"索引能力"——它将文本转化为向量，便于计算语义相似度；向量数据库就是你的"资料柜"；Reranker 则是你的"筛选过程"——从粗活到细活，逐步缩小范围。

### Embedding模型

Embedding模型将文本转换为向量表示，是实现语义检索的基础。简单来说，它把每段文字变成一串数字（向量），使得"意思相近"的文本在数学空间中彼此靠近。举个例子，"今天天气如何"和"今天会下雨吗"的向量会很接近，而与"今天股市怎么样"则较远：

\`\`\`python
from sentence_transformers import SentenceTransformer

class EmbeddingService:
    def __init__(self, model_name="BAAI/bge-large-zh-v1.5"):
        self.model = SentenceTransformer(model_name)
        
    def encode(self, texts: list) -> np.ndarray:
        """批量编码文本"""
        return self.model.encode(texts, normalize_embeddings=True)
        
    def encode_query(self, query: str) -> np.ndarray:
        """编码查询（可能有不同的指令前缀）"""
        # BGE模型对查询有特殊处理
        query_with_instruction = f"为这个句子生成表示以用于检索相关文章：{query}"
        return self.model.encode([query_with_instruction], normalize_embeddings=True)[0]
\`\`\`

常用Embedding模型对比：

| 模型 | 维度 | 中文支持 | 特点 |
|------|------|----------|------|
| BGE-large-zh | 1024 | 优秀 | 中文领域领先 |
| text-embedding-3-large | 3072 | 良好 | OpenAI最新模型 |
| GTE-large | 1024 | 优秀 | 阿里开源 |
| E5-large | 1024 | 一般 | 微软出品 |

### 向量数据库

有了向量表示，还需要一个高效的"资料柜"来存储和检索它们。向量数据库就扮演这个角色——你可以把它想象成一个智能书架，每本书都按内容相似度排列，查找时不是翻目录，而是直接拿你的问题去"比对"，找到最相关的那几本：

\`\`\`python
import chromadb

class VectorStore:
    def __init__(self, collection_name="documents"):
        self.client = chromadb.Client()
        self.collection = self.client.create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"}
        )
        
    def add_documents(
        self,
        documents: list,
        embeddings: np.ndarray,
        ids: list = None,
        metadatas: list = None,
    ):
        """添加文档"""
        if ids is None:
            ids = [f"doc_{i}" for i in range(len(documents))]
            
        self.collection.add(
            embeddings=embeddings.tolist(),
            documents=documents,
            ids=ids,
            metadatas=metadatas,
        )
        
    def search(self, query_embedding: np.ndarray, top_k: int = 5) -> list:
        """检索相似文档"""
        results = self.collection.query(
            query_embeddings=[query_embedding.tolist()],
            n_results=top_k
        )
        
        return [
            {"document": doc, "distance": dist}
            for doc, dist in zip(results["documents"][0], results["distances"][0])
        ]
\`\`\`

### Reranker模型

初步检索往往会返回不少"看起来相关"的结果，但其中并非每一条都真正有用。这就像你在图书馆翻到了十本可能相关的书，还需要快速浏览一遍，挑出最切题的三本。Reranker 就是这个"精细筛选"的过程，它对初步检索结果进行重新打分和排序：

\`\`\`python
from transformers import AutoModelForSequenceClassification, AutoTokenizer

class Reranker:
    def __init__(self, model_name="BAAI/bge-reranker-large"):
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_name)
        
    def rerank(self, query: str, documents: list, top_k: int = 3) -> list:
        """重排序文档"""
        pairs = [[query, doc] for doc in documents]
        
        inputs = self.tokenizer(
            pairs,
            padding=True,
            truncation=True,
            return_tensors="pt"
        )
        
        with torch.no_grad():
            scores = self.model(**inputs).logits.squeeze()
            
        # 按分数排序
        sorted_indices = torch.argsort(scores, descending=True)[:top_k]
        
        return [
            {"document": documents[i], "score": scores[i].item()}
            for i in sorted_indices
        ]
\`\`\`

## 多路召回

在实际应用中，单一检索方式往往不够稳健。这就好比找资料时只用一种方法：如果只按关键词搜，可能漏掉用了同义词的文档；如果只按语义搜，可能漏掉包含精确术语的文档。多路召回就是"两条腿走路"——同时用多种策略检索，然后融合结果：

\`\`\`python
class HybridRetriever:
    """混合检索器"""
    
    def __init__(self, embedding_model, bm25_index, vector_store):
        self.embedding = embedding_model
        self.bm25 = bm25_index
        self.vector_store = vector_store
        
    def retrieve(self, query: str, top_k: int = 10) -> list:
        # 向量检索
        query_embedding = self.embedding.encode_query(query)
        vector_results = self.vector_store.search(query_embedding, top_k)
        
        # BM25关键词检索
        bm25_results = self.bm25.search(query, top_k)
        
        # 融合结果（RRF融合）
        fused = self._reciprocal_rank_fusion([vector_results, bm25_results])
        
        return fused[:top_k]
        
    def _reciprocal_rank_fusion(self, result_lists: list, k: int = 60) -> list:
        """RRF融合算法"""
        scores = {}
        
        for results in result_lists:
            for rank, item in enumerate(results):
                doc = item["document"]
                if doc not in scores:
                    scores[doc] = 0
                scores[doc] += 1 / (k + rank + 1)
                
        # 按融合分数排序
        sorted_docs = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        
        return [{"document": doc, "score": score} for doc, score in sorted_docs]
\`\`\`

## RAG Pipeline

现在我们把上述组件串联起来，看看一个完整的 RAG 系统是如何运作的。这就像考试时你的全套策略：先理解题意（查询改写），然后多渠道找资料（检索），挑出最相关的几页（重排序），组织语言写答案（生成）。

### 完整流程

\`\`\`python
class RAGPipeline:
    """完整的RAG流程"""
    
    def __init__(self, retriever, reranker, llm):
        self.retriever = retriever
        self.reranker = reranker
        self.llm = llm
        
    def query(self, question: str) -> str:
        # 1. 查询改写（可选）
        rewritten_query = self._rewrite_query(question)
        
        # 2. 检索
        candidates = self.retriever.retrieve(rewritten_query, top_k=20)
        
        # 3. 重排序
        reranked = self.reranker.rerank(question, 
                                        [c["document"] for c in candidates],
                                        top_k=5)
        
        # 4. 构建上下文
        context = self._build_context(reranked)
        
        # 5. 生成回答
        answer = self._generate(question, context)
        
        return answer
        
    def _rewrite_query(self, query: str) -> str:
        """查询改写：扩展或澄清查询"""
        prompt = f"""请将以下用户查询改写为更适合检索的形式：
        
原始查询：{query}

改写要求：
1. 扩展缩写和专业术语
2. 添加相关的同义词
3. 保持核心语义不变

改写后的查询："""
        
        return self.llm.generate(prompt).strip()
        
    def _build_context(self, documents: list) -> str:
        """构建上下文"""
        context_parts = []
        for i, doc in enumerate(documents, 1):
            context_parts.append(f"[文档{i}]\\n{doc['document']}")
            
        return "\\n\\n".join(context_parts)
        
    def _generate(self, question: str, context: str) -> str:
        """基于上下文生成回答"""
        prompt = f"""基于以下参考资料回答问题。如果资料中没有相关信息，请如实说明。

参考资料：
{context}

问题：{question}

回答："""
        
        return self.llm.generate(prompt)
\`\`\`

### 高级技术

基础版本的 RAG 已经能解决大多数问题，但面对复杂场景时可能力不从心。假设考试中有一道综合题，你翻完第一遍资料后发现信息不够，需要带着新的线索再翻一遍——这就是递归检索的思路。

#### 递归检索

对于复杂问题，一次检索往往不够，需要多轮迭代：

\`\`\`python
class RecursiveRAG:
    def __init__(self, rag_pipeline, max_iterations=3):
        self.rag = rag_pipeline
        self.max_iterations = max_iterations
        
    def query(self, question: str) -> str:
        accumulated_context = []
        current_question = question
        
        for i in range(self.max_iterations):
            # 检索
            results = self.rag.retriever.retrieve(current_question)
            accumulated_context.extend([r["document"] for r in results])
            
            # 检查是否有足够信息
            if self._has_sufficient_info(question, accumulated_context):
                break
                
            # 生成后续问题
            current_question = self._generate_followup(question, accumulated_context)
            
        return self.rag._generate(question, "\\n".join(accumulated_context))
\`\`\`

#### 自适应检索

还有一种更智能的策略：并非所有问题都需要查资料。"一加一等于几"这种问题，直接答即可；但"昨天某公司股价是多少"就必须检索。自适应 RAG 先判断问题类型，再决定是否启动检索：

\`\`\`python
class AdaptiveRAG:
    def __init__(self, llm, rag_pipeline):
        self.llm = llm
        self.rag = rag_pipeline
        
    def query(self, question: str) -> str:
        # 判断是否需要检索
        needs_retrieval = self._needs_retrieval(question)
        
        if needs_retrieval:
            return self.rag.query(question)
        else:
            # 直接用LLM回答
            return self.llm.generate(f"请回答：{question}")
            
    def _needs_retrieval(self, question: str) -> bool:
        prompt = f"""判断以下问题是否需要检索外部知识才能回答。

问题：{question}

判断标准：
- 需要具体事实或数据 -> 需要检索
- 需要最新信息 -> 需要检索
- 是常识性问题或推理问题 -> 不需要检索

请只回答"是"或"否"。"""
        
        response = self.llm.generate(prompt).strip()
        return response == "是"
\`\`\`

## 知识库构建

前面讲的都是"如何查资料"，但一个前提是——资料本身需要被整理好。假设你考试前把所有讲义随意堆在一起，查找效率当然低；但如果提前按章节贴好书签、做好索引，效率就大不一样了。知识库构建就是这个"整理资料"的过程。

### 文档处理

\`\`\`python
class DocumentProcessor:
    """文档处理器"""
    
    def __init__(self, chunk_size=500, overlap=50):
        self.chunk_size = chunk_size
        self.overlap = overlap
        
    def load_and_split(self, file_path: str) -> list:
        """加载文档并分块"""
        # 加载文档
        text = self._load_file(file_path)
        
        # 分块
        chunks = self._split_text(text)
        
        # 添加元数据
        return [
            {"content": chunk, "source": file_path, "chunk_id": i}
            for i, chunk in enumerate(chunks)
        ]
        
    def _split_text(self, text: str) -> list:
        """文本分块"""
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + self.chunk_size
            
            # 尝试在句子边界分割
            if end < len(text):
                # 寻找最近的句子结束符
                for sep in ["。", "！", "？", "\\n"]:
                    pos = text.rfind(sep, start, end)
                    if pos > start:
                        end = pos + 1
                        break
                        
            chunks.append(text[start:end])
            start = end - self.overlap
            
        return chunks
\`\`\`

### 索引构建

\`\`\`python
class KnowledgeBase:
    """知识库"""
    
    def __init__(self, embedding_model, vector_store):
        self.processor = DocumentProcessor()
        self.embedding = embedding_model
        self.store = vector_store
        
    def index_documents(self, file_paths: list):
        """索引文档"""
        all_chunks = []
        
        for path in file_paths:
            chunks = self.processor.load_and_split(path)
            all_chunks.extend(chunks)
            
        # 批量生成embeddings
        texts = [c["content"] for c in all_chunks]
        embeddings = self.embedding.encode(texts)
        
        # 存储
        self.store.add_documents(
            documents=texts,
            embeddings=embeddings,
            metadatas=[{"source": c["source"]} for c in all_chunks]
        )
        
        print(f"索引完成，共{len(all_chunks)}个文档块")
\`\`\`

## 评估与优化

### 检索质量评估

\`\`\`python
class RetrievalEvaluator:
    def evaluate(self, queries: list, ground_truth: list, retriever) -> dict:
        """评估检索质量"""
        metrics = {
            "recall@5": [],
            "mrr": [],
            "ndcg@5": []
        }
        
        for query, relevant_docs in zip(queries, ground_truth):
            results = retriever.retrieve(query, top_k=5)
            retrieved_docs = [r["document"] for r in results]
            
            # Recall@5
            recall = len(set(retrieved_docs) & set(relevant_docs)) / len(relevant_docs)
            metrics["recall@5"].append(recall)
            
            # MRR
            for rank, doc in enumerate(retrieved_docs, 1):
                if doc in relevant_docs:
                    metrics["mrr"].append(1 / rank)
                    break
            else:
                metrics["mrr"].append(0)
                
        return {k: np.mean(v) for k, v in metrics.items()}
\`\`\`

回顾本节，RAG 的核心思想其实非常朴素：与其让模型"死记硬背"，不如让它学会"查书"。Embedding 模型提供了语义索引能力，向量数据库提供了高效存储，Reranker 实现了精细筛选，多路召回保证了检索的全面性。在实际应用中，一个好的 RAG 系统并不是简单的"搜索+生成"，而是需要在分块策略、检索质量和提示设计上反复调优——就像开卷考试的资料组织得越好，答题效率就越高。
`
    },
    {
      id: "adv-13-11-agent",
      title: "13.11 Agent框架讲解",
      file: "大模型教程/13-智能体技术/10-Agent框架讲解.md",
      difficulty: "中级-高级",
      duration: "0.5h",
      week: 0,
      phase: 0,
      keywords: ["Agent框架讲解", "Agent", "LangChain", "LlamaIndex", "Dify"],
      content: `# Agent框架讲解

假设你决定开一家餐厅。你可以从零开始装修、采购设备、招募人员，也可以加盟一个现成的品牌——后者提供标准化的装修方案、供应链和管理流程，你只需专注于菜品和服务。Agent 开发框架正是这样的“加盟方案”——它们提供了现成的组件和抽象，让开发者不必从零搭建每个细节。当前市面上涌现了众多框架，各有侧重。本节将介绍三个主流框架——LangChain、LlamaIndex 和 Dify，帮助读者了解其设计理念和适用场景。

\`\`\`mermaid
graph TD
    U[用户输入] --> P[规划模块]
    P --> TS[工具选择]
    TS --> E[执行工具]
    E --> M[记忆更新]
    M --> R[结果整合]
    R --> U
\`\`\`

## LangChain

LangChain 是目前最流行的 LLM 应用开发框架，提供了丰富的组件和抽象。如果把它比作一套万能积木，那么它的特点就是"拼接自由度极高"——你可以把 LLM、工具、记忆、检索器等组件像拼积木一样自由组合。

### 核心抽象

下面这段代码展示了 LangChain 的基本用法——定义工具、加载 Prompt 模板、创建 Agent、执行查询，整个流程就像组装一条流水线：

\`\`\`python
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_react_agent
from langchain.tools import Tool
from langchain import hub

# LLM
llm = ChatOpenAI(model="gpt-4", temperature=0)

# 工具定义
tools = [
    Tool(
        name="Search",
        func=search_function,
        description="搜索互联网获取信息"
    ),
    Tool(
        name="Calculator",
        func=calculator_function,
        description="执行数学计算"
    )
]

# 从Hub获取Prompt模板
prompt = hub.pull("hwchase17/react")

# 创建Agent
agent = create_react_agent(llm, tools, prompt)
executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# 执行
result = executor.invoke({"input": "北京到上海的距离是多少公里？"})
\`\`\`

### LCEL（LangChain Expression Language）

LangChain 最巧妙的设计之一是 LCEL——用 \`|\` 符号把组件串联起来，就像 Linux 的管道操作一样直观。想象一下工厂流水线：原料（Prompt）进入→ 加工（LLM）→ 包装（OutputParser）→ 成品：

\`\`\`python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# 定义组件
prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个乐于助人的助手。"),
    ("human", "{input}")
])

output_parser = StrOutputParser()

# 使用 | 组合成链
chain = prompt | llm | output_parser

# 执行
response = chain.invoke({"input": "你好"})

# 更复杂的链
retrieval_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | output_parser
)
\`\`\`

### 记忆管理

前面的记忆检索与上下文一节中我们讨论过记忆的重要性。LangChain 提供了开箱即用的记忆组件，就像给 Agent 配了一个笔记本——简单场景用“全部记录”，长对话用“摘要记录”：

\`\`\`python
from langchain.memory import ConversationBufferMemory, ConversationSummaryMemory

# 简单缓冲记忆
buffer_memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True
)

# 摘要记忆（适合长对话）
summary_memory = ConversationSummaryMemory(
    llm=llm,
    memory_key="chat_history",
    return_messages=True
)

# 在Agent中使用
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    memory=buffer_memory,
    verbose=True
)
\`\`\`

### 适用场景

- 需要灵活组合各种组件
- 快速原型开发
- 已有丰富的生态集成需求

## LlamaIndex

LlamaIndex 专注于数据索引和检索，是构建 RAG 应用的首选框架。如果说 LangChain 是万能积木，那么 LlamaIndex 就是专业的图书管理系统——它的核心能力是把各种数据源组织成可检索的索引，让模型能快速找到所需信息。

### 核心概念

下面的示例展示了 LlamaIndex 最典型的用法：加载文档、构建索引、查询。只需三步就能搭建一个基本的知识库问答系统：

\`\`\`python
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
from llama_index.llms.openai import OpenAI

# 加载文档
documents = SimpleDirectoryReader("./data").load_data()

# 构建索引
index = VectorStoreIndex.from_documents(documents)

# 创建查询引擎
query_engine = index.as_query_engine(
    llm=OpenAI(model="gpt-4"),
    similarity_top_k=5
)

# 查询
response = query_engine.query("文档中提到了哪些技术？")
\`\`\`

### 高级索引

LlamaIndex 的强大之处在于提供了多种索引类型，就像图书馆不只有一种检索方式——有按分类号查的、有按主题词查的、还有按关联关系查的：

\`\`\`python
from llama_index.core import (
    TreeIndex,
    KeywordTableIndex,
    KnowledgeGraphIndex
)

# 树形索引（适合层次结构文档）
tree_index = TreeIndex.from_documents(documents)

# 关键词表索引（适合精确匹配）
keyword_index = KeywordTableIndex.from_documents(documents)

# 知识图谱索引
kg_index = KnowledgeGraphIndex.from_documents(
    documents,
    max_triplets_per_chunk=2
)
\`\`\`

### 数据连接器

在实际开发中，数据往往分散在不同地方——网页、数据库、PDF 文件等。LlamaIndex 提供了丰富的连接器，就像一套万能转接头，让各种数据源都能接入统一的索引体系：

\`\`\`python
from llama_index.readers.web import SimpleWebPageReader
from llama_index.readers.database import DatabaseReader

# 网页读取器
web_reader = SimpleWebPageReader()
web_docs = web_reader.load_data(["https://example.com/page1"])

# 数据库读取器
db_reader = DatabaseReader(
    connection_string="postgresql://user:pass@host/db"
)
db_docs = db_reader.load_data(query="SELECT * FROM articles")
\`\`\`

### Agent功能

\`\`\`python
from llama_index.core.agent import ReActAgent
from llama_index.core.tools import QueryEngineTool, ToolMetadata

# 将索引包装为工具
tool = QueryEngineTool(
    query_engine=query_engine,
    metadata=ToolMetadata(
        name="document_search",
        description="搜索文档库获取相关信息"
    )
)

# 创建Agent
agent = ReActAgent.from_tools(
    tools=[tool],
    llm=llm,
    verbose=True
)

# 使用Agent
response = agent.chat("文档中关于机器学习的内容有哪些？")
\`\`\`

### 适用场景

- 知识库问答系统
- 文档检索和分析
- 需要复杂索引结构的应用

## Dify

Dify 是一个低代码/无代码的 AI 应用开发平台。如果说 LangChain 是给程序员用的积木，那 Dify 就是给产品经理和业务人员用的"拖拽式设计师"——不需要写代码，通过可视化界面就能搭建完整的 AI 应用。

### 核心功能

| 功能 | 描述 |
|------|------|
| Prompt IDE | 可视化的Prompt编辑和测试 |
| RAG Pipeline | 内置的知识库管理 |
| Workflow | 可视化流程编排 |
| Agent | 内置ReACT和Function Call |
| API接口 | 一键发布为API服务 |

### Workflow示例

下面是一个智能客服的 Workflow 配置示例。注意它的逻辑多么清晰：先分类用户意图，然后根据意图走不同分支——咨询就查知识库，投诉就创建工单。这种可视化编排让非技术人员也能看懂和参与：

\`\`\`yaml
# Dify Workflow配置示例
workflow:
  name: "智能客服"
  description: "处理用户咨询"
  
  nodes:
    - id: start
      type: start
      outputs:
        - name: user_input
          type: string
          
    - id: classify_intent
      type: llm
      inputs:
        query: "{{start.user_input}}"
      prompt: |
        分析用户意图：
        {{query}}
        
        可能的意图：咨询、投诉、建议
        只输出意图类型。
      outputs:
        - name: intent
          type: string
          
    - id: branch
      type: condition
      conditions:
        - expression: "{{classify_intent.intent}} == '咨询'"
          next: query_kb
        - expression: "{{classify_intent.intent}} == '投诉'"
          next: create_ticket
        - default: direct_reply
          
    - id: query_kb
      type: knowledge_retrieval
      dataset_id: "customer_service_kb"
      query: "{{start.user_input}}"
      top_k: 3
      
    - id: generate_reply
      type: llm
      inputs:
        question: "{{start.user_input}}"
        context: "{{query_kb.results}}"
      prompt: |
        基于以下资料回答用户问题：
        
        资料：
        {{context}}
        
        问题：{{question}}
\`\`\`

### API集成

\`\`\`python
import requests

# Dify应用API调用
def call_dify_app(app_id: str, api_key: str, query: str):
    response = requests.post(
        f"https://api.dify.ai/v1/chat-messages",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        },
        json={
            "inputs": {},
            "query": query,
            "response_mode": "blocking",
            "user": "user-123"
        }
    )
    return response.json()
\`\`\`

### 适用场景

- 快速构建AI应用原型
- 非技术人员参与开发
- 需要可视化管理的场景

## 框架对比

说了这么多，到底怎么选？假设你要开三家不同类型的餐厅：LangChain 像一家可以自由定制菜单的创意餐厅，LlamaIndex 像一家专注食材采购和储存的供应链服务商，而 Dify 像一家提供标准化方案的连锁品牌。下表细化了它们的差异：

| 特性 | LangChain | LlamaIndex | Dify |
|------|-----------|------------|------|
| 定位 | 通用LLM应用框架 | 数据索引与检索 | 低代码AI平台 |
| 学习曲线 | 中等 | 中等 | 低 |
| 灵活性 | 高 | 中 | 低 |
| RAG能力 | 中 | 高 | 中 |
| 可视化 | 无 | 无 | 强 |
| 生态丰富度 | 高 | 中 | 中 |
| 部署方式 | 自主部署 | 自主部署 | SaaS/自部署 |

## 选型建议

在实际项目中，框架选择往往不是"非此即彼"而是"因地制宜"。以下是一些实用的判断原则：

**选择LangChain**：
- 需要高度定制化
- 已有Python开发能力
- 需要与多种数据源和服务集成

**选择LlamaIndex**：
- 核心需求是文档检索和问答
- 需要处理大量非结构化数据
- 对检索精度有较高要求

**选择Dify**：
- 需要快速上线
- 团队缺乏深度技术能力
- 需要可视化管理和监控

**混合使用**：
很多成熟项目会结合使用多个框架——就像一家好餐厅可能同时使用专业供应商的食材、自家的独家配方、和第三方的配送平台：
- 用LlamaIndex处理数据索引
- 用LangChain编排Agent逻辑
- 用Dify管理应用和监控

\`\`\`python
# 混合使用示例
from langchain.tools import Tool
from llama_index.core import VectorStoreIndex

# 用LlamaIndex构建索引
index = VectorStoreIndex.from_documents(documents)
query_engine = index.as_query_engine()

# 包装为LangChain工具
search_tool = Tool(
    name="KnowledgeSearch",
    func=lambda q: str(query_engine.query(q)),
    description="搜索知识库"
)

# 在LangChain Agent中使用
agent = create_react_agent(llm, [search_tool], prompt)
\`\`\`

回顾本节，框架选择的核心原则是“匹配需求，而非追逐流行”。小团队快速验证想法可以先用 Dify；需要精细控制 RAG 流程时上 LlamaIndex；复杂的多工具、多步骤 Agent 场景则选 LangChain。而在生产环境中，混合使用往往是最实际的方案。
`
    },
    {
      id: "adv-13-12-life-assistant",
      title: "13.12 实践：个人生活助手",
      file: "大模型教程/13-智能体技术/11-实践个人生活助手.md",
      difficulty: "中级-高级",
      duration: "0.5h",
      week: 0,
      phase: 0,
      keywords: ["实践：个人生活助手", "API", "Reply", "ReACT", "Agent"],
      content: `# 实践：个人生活助手

假设你有一位无所不能的私人管家，你只需说一句“明天北京天气怎么样？帮我安排下午两点的会议”，他就能自动查天气、写日程、管待办。本节我们就来构建这样一个助手——它虽然不能替你吃饭，但能帮你管理日常生活中的大小事务。这个实践项目将整合天气查询、日程管理、待办事项等功能，展示智能体开发的完整流程。

\`\`\`mermaid
graph TD
    U[用户请求] --> I[意图识别]
    I --> T{工具选择}
    T -->|查天气| W[天气API]
    T -->|管日程| C[日程管理]
    T -->|待办事项| TD[待办管理]
    W --> R[结果整合]
    C --> R
    TD --> R
    R --> Reply[回复用户]
\`\`\`

## 项目概述

### 功能需求

- 天气查询：获取指定城市的天气信息
- 日程管理：添加、查询、删除日程
- 待办事项：管理待办任务
- 自然语言交互：通过对话完成所有操作

### 技术架构

在动手写代码之前，先看看整体架构。这个助手的工作方式其实很像前面学过的 ReACT 模式：用户说话→ Agent 思考该用什么工具→ 调用工具→ 组织结果回复用户。就像你对管家说“明天出门带伞吗”，管家会先查天气预报，再告诉你结果。

\`\`\`
用户输入 → Agent（ReACT） → 工具调用 → 返回结果
                ↓
           LLM（Qwen/GPT）
                ↓
           ┌────┴────┐
           ↓         ↓
       工具集     记忆系统
       - 天气     - 对话历史
       - 日程     - 用户偏好
       - 待办
\`\`\`

## 环境准备

\`\`\`bash
# 安装依赖
pip install openai langchain chromadb requests

# 目录结构
personal_assistant/
├── main.py
├── tools/
│   ├── __init__.py
│   ├── weather.py
│   ├── calendar.py
│   └── todo.py
├── memory/
│   └── conversation.py
└── config.py
\`\`\`

## 工具实现

助手的能力取决于它手中的工具。回忆前面工具与 MCP 协议一节的内容，每个工具都应该职责单一、输入明确、输出一致。我们逐个实现。

### 天气工具

天气工具是最经典的外部 API 调用示例。注意代码中的错误处理——这是生产级工具的必备素质，因为网络调用随时可能失败：

\`\`\`python
# tools/weather.py
import requests
from typing import Optional

class WeatherTool:
    """天气查询工具"""
    
    name = "get_weather"
    description = """获取指定城市的天气信息。
    输入：城市名称（如"北京"、"上海"）
    输出：温度、天气状况、湿度等信息"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.openweathermap.org/data/2.5/weather"
        
    def run(self, city: str) -> str:
        """执行天气查询"""
        try:
            params = {
                "q": city,
                "appid": self.api_key,
                "units": "metric",
                "lang": "zh_cn"
            }
            
            response = requests.get(self.base_url, params=params)
            data = response.json()
            
            if response.status_code == 200:
                weather_info = {
                    "城市": data["name"],
                    "温度": f"{data['main']['temp']}°C",
                    "体感温度": f"{data['main']['feels_like']}°C",
                    "天气": data["weather"][0]["description"],
                    "湿度": f"{data['main']['humidity']}%",
                    "风速": f"{data['wind']['speed']} m/s"
                }
                return str(weather_info)
            else:
                return f"查询失败：{data.get('message', '未知错误')}"
                
        except Exception as e:
            return f"天气查询出错：{str(e)}"
\`\`\`

### 日程管理工具

接下来是日程管理。这个工具的特点是需要持久化存储——你不希望助手重启后就忘了你的日程。这里用简单的 JSON 文件实现，生产环境可以换成数据库：

\`\`\`python
# tools/calendar.py
import json
from datetime import datetime, timedelta
from pathlib import Path

class CalendarTool:
    """日程管理工具"""
    
    def __init__(self, storage_path: str = "calendar.json"):
        self.storage_path = Path(storage_path)
        self.events = self._load_events()
        
    def _load_events(self) -> list:
        if self.storage_path.exists():
            with open(self.storage_path, "r", encoding="utf-8") as f:
                return json.load(f)
        return []
        
    def _save_events(self):
        with open(self.storage_path, "w", encoding="utf-8") as f:
            json.dump(self.events, f, ensure_ascii=False, indent=2)
            
    def add_event(self, title: str, date: str, time: str = None, description: str = None) -> str:
        """添加日程"""
        event = {
            "id": len(self.events) + 1,
            "title": title,
            "date": date,
            "time": time,
            "description": description,
            "created_at": datetime.now().isoformat()
        }
        self.events.append(event)
        self._save_events()
        
        return f"已添加日程：{title}，日期：{date}" + (f"，时间：{time}" if time else "")
        
    def query_events(self, date: str = None, days: int = 7) -> str:
        """查询日程"""
        if date:
            # 查询指定日期
            events = [e for e in self.events if e["date"] == date]
            if events:
                result = f"{date} 的日程：\\n"
                for e in events:
                    result += f"- {e['title']}"
                    if e.get("time"):
                        result += f" ({e['time']})"
                    result += "\\n"
                return result
            return f"{date} 没有日程安排"
        else:
            # 查询未来N天
            today = datetime.now().date()
            future_dates = [(today + timedelta(days=i)).isoformat() for i in range(days)]
            events = [e for e in self.events if e["date"] in future_dates]
            
            if events:
                events.sort(key=lambda x: (x["date"], x.get("time", "00:00")))
                result = f"未来{days}天的日程：\\n"
                for e in events:
                    result += f"- {e['date']}: {e['title']}"
                    if e.get("time"):
                        result += f" ({e['time']})"
                    result += "\\n"
                return result
            return f"未来{days}天没有日程安排"
            
    def delete_event(self, event_id: int) -> str:
        """删除日程"""
        for i, event in enumerate(self.events):
            if event["id"] == event_id:
                deleted = self.events.pop(i)
                self._save_events()
                return f"已删除日程：{deleted['title']}"
        return f"未找到ID为{event_id}的日程"


# 工具包装函数
calendar = CalendarTool()

def add_calendar_event(title: str, date: str, time: str = None) -> str:
    """添加日程事件。
    参数：
    - title: 事件标题
    - date: 日期，格式YYYY-MM-DD
    - time: 可选，时间，格式HH:MM
    """
    return calendar.add_event(title, date, time)

def query_calendar(date: str = None) -> str:
    """查询日程。
    参数：
    - date: 可选，指定日期（YYYY-MM-DD），不指定则查询未来7天
    """
    return calendar.query_events(date)
\`\`\`

### 待办事项工具

待办事项的实现思路与日程类似，但增加了优先级和完成状态的概念。这就像管家手里的任务清单，不仅记录什么要做，还记录轻重缓急和完成情况：

\`\`\`python
# tools/todo.py
import json
from datetime import datetime
from pathlib import Path

class TodoTool:
    """待办事项管理"""
    
    def __init__(self, storage_path: str = "todos.json"):
        self.storage_path = Path(storage_path)
        self.todos = self._load_todos()
        
    def _load_todos(self) -> list:
        if self.storage_path.exists():
            with open(self.storage_path, "r", encoding="utf-8") as f:
                return json.load(f)
        return []
        
    def _save_todos(self):
        with open(self.storage_path, "w", encoding="utf-8") as f:
            json.dump(self.todos, f, ensure_ascii=False, indent=2)
            
    def add_todo(self, content: str, priority: str = "normal") -> str:
        """添加待办"""
        todo = {
            "id": len(self.todos) + 1,
            "content": content,
            "priority": priority,  # high, normal, low
            "completed": False,
            "created_at": datetime.now().isoformat()
        }
        self.todos.append(todo)
        self._save_todos()
        return f"已添加待办：{content}（优先级：{priority}）"
        
    def list_todos(self, show_completed: bool = False) -> str:
        """列出待办"""
        if show_completed:
            todos = self.todos
        else:
            todos = [t for t in self.todos if not t["completed"]]
            
        if not todos:
            return "当前没有待办事项" if not show_completed else "没有待办事项记录"
            
        # 按优先级排序
        priority_order = {"high": 0, "normal": 1, "low": 2}
        todos.sort(key=lambda x: priority_order.get(x["priority"], 1))
        
        result = "待办事项列表：\\n"
        for t in todos:
            status = "✓" if t["completed"] else "○"
            priority_mark = "!" if t["priority"] == "high" else ""
            result += f"{status} [{t['id']}] {priority_mark}{t['content']}\\n"
            
        return result
        
    def complete_todo(self, todo_id: int) -> str:
        """完成待办"""
        for todo in self.todos:
            if todo["id"] == todo_id:
                todo["completed"] = True
                todo["completed_at"] = datetime.now().isoformat()
                self._save_todos()
                return f"已完成：{todo['content']}"
        return f"未找到ID为{todo_id}的待办"


# 工具包装函数
todo_tool = TodoTool()

def add_todo(content: str, priority: str = "normal") -> str:
    """添加待办事项。
    参数：
    - content: 待办内容
    - priority: 优先级（high/normal/low），默认normal
    """
    return todo_tool.add_todo(content, priority)

def list_todos() -> str:
    """列出所有未完成的待办事项。"""
    return todo_tool.list_todos()

def complete_todo(todo_id: int) -> str:
    """将指定待办标记为完成。
    参数：
    - todo_id: 待办事项的ID
    """
    return todo_tool.complete_todo(todo_id)
\`\`\`

## Agent实现

工具都准备好了，现在要把它们组装起来。这一步的核心是“让 LLM 知道自己有哪些工具可用，以及各工具的使用方法”——这就是前面学过的函数描述的实际应用。注意每个工具的 \`description\` 写得多清楚——这直接决定了 Agent 能否正确选择工具。

### 核心Agent

\`\`\`python
# main.py
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_react_agent
from langchain.tools import Tool
from langchain.memory import ConversationBufferWindowMemory
from langchain import hub

from tools.weather import WeatherTool
from tools.calendar import add_calendar_event, query_calendar
from tools.todo import add_todo, list_todos, complete_todo

# 配置
OPENAI_API_KEY = "your-api-key"
WEATHER_API_KEY = "your-weather-api-key"

# 初始化LLM
llm = ChatOpenAI(
    model="gpt-4",
    temperature=0,
    api_key=OPENAI_API_KEY
)

# 初始化工具
weather_tool = WeatherTool(WEATHER_API_KEY)

tools = [
    Tool(
        name="GetWeather",
        func=weather_tool.run,
        description="获取指定城市的天气信息。输入城市名称。"
    ),
    Tool(
        name="AddCalendarEvent",
        func=lambda x: add_calendar_event(**eval(x)),
        description="""添加日程事件。输入格式：{"title": "事件名", "date": "YYYY-MM-DD", "time": "HH:MM"}"""
    ),
    Tool(
        name="QueryCalendar",
        func=query_calendar,
        description="查询日程安排。可以输入具体日期(YYYY-MM-DD)或留空查询未来7天。"
    ),
    Tool(
        name="AddTodo",
        func=lambda x: add_todo(**eval(x)),
        description="""添加待办事项。输入格式：{"content": "待办内容", "priority": "high/normal/low"}"""
    ),
    Tool(
        name="ListTodos",
        func=lambda _: list_todos(),
        description="列出所有未完成的待办事项。"
    ),
    Tool(
        name="CompleteTodo",
        func=lambda x: complete_todo(int(x)),
        description="完成待办事项。输入待办的ID号。"
    )
]

# 创建Agent
prompt = hub.pull("hwchase17/react-chat")
agent = create_react_agent(llm, tools, prompt)

# 添加记忆
memory = ConversationBufferWindowMemory(
    memory_key="chat_history",
    k=10,  # 保留最近10轮对话
    return_messages=True
)

# 创建执行器
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    memory=memory,
    verbose=True,
    handle_parsing_errors=True
)

def chat(user_input: str) -> str:
    """与助手对话"""
    response = agent_executor.invoke({"input": user_input})
    return response["output"]

# 运行
if __name__ == "__main__":
    print("个人生活助手已启动！输入'退出'结束对话。")
    print("-" * 50)
    
    while True:
        user_input = input("\\n你: ").strip()
        
        if user_input.lower() in ["退出", "exit", "quit"]:
            print("再见！")
            break
            
        if not user_input:
            continue
            
        try:
            response = chat(user_input)
            print(f"\\n助手: {response}")
        except Exception as e:
            print(f"\\n出错了：{str(e)}")
\`\`\`

## 使用示例

来看看实际运行效果。下面的对话展示了助手如何处理各种日常请求。注意观察它是如何理解自然语言并选择正确工具的——“明天下午两点的会议”被正确解析为日期、时间和事件类型：

\`\`\`
个人生活助手已启动！输入'退出'结束对话。
--------------------------------------------------

你: 北京今天天气怎么样？

助手: 北京今天的天气情况：
- 温度：25°C
- 体感温度：26°C
- 天气：晴
- 湿度：45%
- 风速：3.5 m/s

你: 帮我添加一个明天下午2点的会议

助手: 已添加日程：会议，日期：2024-01-16，时间：14:00

你: 我有什么待办事项？

助手: 待办事项列表：
○ [1] !完成项目报告
○ [2] 购买生日礼物
○ [3] 预约牙医

你: 把第二个待办标记为完成

助手: 已完成：购买生日礼物

你: 查看我这周的日程

助手: 未来7天的日程：
- 2024-01-16: 会议 (14:00)
- 2024-01-18: 项目评审 (10:00)
- 2024-01-20: 朋友聚餐 (18:30)
\`\`\`

## 扩展建议

当基础版本跑通之后，你可以根据实际需求逐步扩展。以下是一些实用的方向：

1. **添加更多工具**：邮件、笔记、提醒等——每增加一个工具，助手的能力就增强一分
2. **接入更多API**：新闻、股票、翻译等
3. **增强记忆系统**：用户偏好学习
4. **添加语音交互**：集成TTS和ASR
5. **部署为服务**：Web API或微信小程序

回顾本节，我们从零搭建了一个完整的生活助手。这个过程浓缩了智能体开发的核心技能：工具设计决定了助手能做什么，Agent 编排决定了它如何思考和行动，记忆管理决定了它能记住多少。建议先把这个基础版本跑通，然后逐步添加更多工具和功能——每次扩展都会加深你对智能体开发的理解。
`
    },
    {
      id: "adv-13-13-mcp-server",
      title: "13.13 实践：编写一个MCP Server",
      file: "大模型教程/13-智能体技术/12-实践MCP-Server.md",
      difficulty: "中级-高级",
      duration: "0.5h",
      week: 0,
      phase: 0,
      keywords: ["实践：编写一个MCP", "Server", "MCP"],
      content: `# 实践：编写一个MCP Server

前面在工具与 MCP 协议一节中，我们用“大厨与厨具供应商”的比喻理解了 MCP 的架构。现在我们换一个角色——这次你不是大厨，而是厨具供应商。你要按照 MCP 规范制作一套工具，让任何支持 MCP 的智能体都能直接使用。本节将实现一个提供文件操作和命令执行功能的完整 MCP Server。

\`\`\`mermaid
sequenceDiagram
    participant C as Client请求
    participant T as Transport层<br>stdio/HTTP
    participant S as Server路由
    participant H as Handler处理
    C->>T: JSON-RPC 请求
    T->>S: 解析并分发
    S->>H: 调用对应处理器
    H-->>S: 执行结果
    S-->>T: 封装响应
    T-->>C: 返回结果
\`\`\`

## 项目目标

构建一个本地文件系统操作的MCP Server，支持：
- 列出目录内容
- 读取文件
- 写入文件
- 执行Shell命令（受限）

## 项目结构

\`\`\`
mcp_file_server/
├── server.py          # MCP Server主程序
├── handlers/
│   ├── __init__.py
│   ├── filesystem.py  # 文件系统操作
│   └── shell.py       # Shell命令执行
├── config.py          # 配置文件
└── run.sh            # 启动脚本
\`\`\`

## 核心实现

### MCP协议基础

最核心的部分是 \`MCPServer\` 类。它的职责很简单：接收 JSON-RPC 请求，根据方法名分发到对应的处理函数，返回结果。就像前台接待员——客人（Client）说“我要看看你们有什么工具”（tools/list），前台就去取工具清单；客人说“帮我用某工具处理某事”（tools/call），前台就转交给后台师傅。

\`\`\`python
# server.py
import json
import sys
from typing import Any, Callable, Dict, List, Optional
from dataclasses import dataclass, asdict
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class ToolDefinition:
    name: str
    description: str
    inputSchema: dict


@dataclass
class ResourceDefinition:
    uri: str
    name: str
    description: str
    mimeType: Optional[str] = None


class MCPServer:
    """MCP Server实现"""
    
    PROTOCOL_VERSION = "2024-11-05"
    
    def __init__(self, name: str, version: str = "1.0.0"):
        self.name = name
        self.version = version
        self.tools: Dict[str, Dict] = {}
        self.resources: Dict[str, Dict] = {}
        self.resource_templates: Dict[str, Dict] = {}
        
    def tool(self, name: str, description: str, schema: dict):
        """装饰器：注册工具"""
        def decorator(func: Callable):
            self.tools[name] = {
                "definition": ToolDefinition(name, description, schema),
                "handler": func
            }
            return func
        return decorator
        
    def resource(self, uri: str, name: str, description: str, mime_type: str = None):
        """装饰器：注册资源"""
        def decorator(func: Callable):
            self.resources[uri] = {
                "definition": ResourceDefinition(uri, name, description, mime_type),
                "handler": func
            }
            return func
        return decorator
        
    def handle_message(self, message: dict) -> dict:
        """处理JSON-RPC消息"""
        method = message.get("method")
        params = message.get("params", {})
        msg_id = message.get("id")
        
        handlers = {
            "initialize": self._handle_initialize,
            "tools/list": self._handle_tools_list,
            "tools/call": self._handle_tools_call,
            "resources/list": self._handle_resources_list,
            "resources/read": self._handle_resources_read,
            "ping": self._handle_ping,
        }
        
        handler = handlers.get(method)
        
        if not handler:
            return self._error(msg_id, -32601, f"Method not found: {method}")
            
        try:
            result = handler(params)
            return self._success(msg_id, result)
        except Exception as e:
            logger.exception(f"Error handling {method}")
            return self._error(msg_id, -32000, str(e))
            
    def _handle_initialize(self, params: dict) -> dict:
        return {
            "protocolVersion": self.PROTOCOL_VERSION,
            "serverInfo": {
                "name": self.name,
                "version": self.version
            },
            "capabilities": {
                "tools": {"listChanged": True},
                "resources": {"subscribe": False, "listChanged": True}
            }
        }
        
    def _handle_tools_list(self, params: dict) -> dict:
        tools = [asdict(t["definition"]) for t in self.tools.values()]
        return {"tools": tools}
        
    def _handle_tools_call(self, params: dict) -> dict:
        tool_name = params.get("name")
        arguments = params.get("arguments", {})
        
        if tool_name not in self.tools:
            raise ValueError(f"Unknown tool: {tool_name}")
            
        handler = self.tools[tool_name]["handler"]
        result = handler(**arguments)
        
        # 格式化返回内容
        if isinstance(result, str):
            content = [{"type": "text", "text": result}]
        elif isinstance(result, dict):
            content = [{"type": "text", "text": json.dumps(result, ensure_ascii=False)}]
        else:
            content = [{"type": "text", "text": str(result)}]
            
        return {"content": content}
        
    def _handle_resources_list(self, params: dict) -> dict:
        resources = [asdict(r["definition"]) for r in self.resources.values()]
        return {"resources": resources}
        
    def _handle_resources_read(self, params: dict) -> dict:
        uri = params.get("uri")
        
        if uri not in self.resources:
            raise ValueError(f"Unknown resource: {uri}")
            
        handler = self.resources[uri]["handler"]
        content = handler()
        
        return {
            "contents": [
                {"uri": uri, "mimeType": "text/plain", "text": content}
            ]
        }
        
    def _handle_ping(self, params: dict) -> dict:
        return {}
        
    def _success(self, msg_id, result: Any) -> dict:
        return {"jsonrpc": "2.0", "id": msg_id, "result": result}
        
    def _error(self, msg_id, code: int, message: str) -> dict:
        return {"jsonrpc": "2.0", "id": msg_id, "error": {"code": code, "message": message}}
        
    def run_stdio(self):
        """通过标准输入输出运行"""
        logger.info(f"Starting MCP Server: {self.name} v{self.version}")
        
        while True:
            try:
                line = sys.stdin.readline()
                if not line:
                    break
                    
                message = json.loads(line.strip())
                response = self.handle_message(message)
                
                sys.stdout.write(json.dumps(response) + "\\n")
                sys.stdout.flush()
                
            except json.JSONDecodeError as e:
                logger.error(f"Invalid JSON: {e}")
            except Exception as e:
                logger.exception("Unexpected error")
\`\`\`

### 文件系统工具

现在来实现具体的工具。文件系统操作是最实用的 MCP 工具之一。特别注意 \`_safe_path\` 函数——这是安全设计的核心，确保所有操作都限制在指定目录内，防止智能体意外访问系统其他文件。这就像给实习生发了一张门禁卡，只能进特定的房间：

\`\`\`python
# handlers/filesystem.py
import os
from pathlib import Path
from typing import Optional

# 安全限制：只允许访问指定目录
ALLOWED_BASE_PATH = Path.home() / "mcp_workspace"
ALLOWED_BASE_PATH.mkdir(exist_ok=True)


def _safe_path(path: str) -> Path:
    """确保路径在允许的范围内"""
    full_path = (ALLOWED_BASE_PATH / path).resolve()
    
    if not str(full_path).startswith(str(ALLOWED_BASE_PATH)):
        raise PermissionError(f"Access denied: {path}")
        
    return full_path


def list_directory(path: str = ".") -> dict:
    """列出目录内容"""
    safe_path = _safe_path(path)
    
    if not safe_path.exists():
        return {"error": f"Path does not exist: {path}"}
        
    if not safe_path.is_dir():
        return {"error": f"Not a directory: {path}"}
        
    entries = []
    for entry in safe_path.iterdir():
        entries.append({
            "name": entry.name,
            "type": "directory" if entry.is_dir() else "file",
            "size": entry.stat().st_size if entry.is_file() else None
        })
        
    return {
        "path": str(safe_path.relative_to(ALLOWED_BASE_PATH)),
        "entries": sorted(entries, key=lambda x: (x["type"] != "directory", x["name"]))
    }


def read_file(path: str) -> str:
    """读取文件内容"""
    safe_path = _safe_path(path)
    
    if not safe_path.exists():
        return f"Error: File does not exist: {path}"
        
    if not safe_path.is_file():
        return f"Error: Not a file: {path}"
        
    # 限制文件大小
    if safe_path.stat().st_size > 1024 * 1024:  # 1MB
        return "Error: File too large (max 1MB)"
        
    try:
        return safe_path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return "Error: File is not a text file"


def write_file(path: str, content: str) -> str:
    """写入文件"""
    safe_path = _safe_path(path)
    
    # 确保父目录存在
    safe_path.parent.mkdir(parents=True, exist_ok=True)
    
    safe_path.write_text(content, encoding="utf-8")
    
    return f"Successfully wrote {len(content)} characters to {path}"


def create_directory(path: str) -> str:
    """创建目录"""
    safe_path = _safe_path(path)
    
    safe_path.mkdir(parents=True, exist_ok=True)
    
    return f"Directory created: {path}"
\`\`\`

### Shell命令工具

Shell 命令执行是一个强大但危险的能力——就像给实习生一把大型切割设备，必须严格限制使用范围。这里采用命令白名单机制，只允许执行安全的只读命令：

\`\`\`python
# handlers/shell.py
import subprocess
import shlex
from typing import Optional

# 允许的命令白名单
ALLOWED_COMMANDS = {
    "ls", "cat", "head", "tail", "wc", "grep", "find",
    "echo", "date", "pwd", "whoami"
}

MAX_OUTPUT_SIZE = 10000  # 最大输出字符数


def execute_command(command: str, timeout: int = 30) -> dict:
    """执行Shell命令（受限）"""
    
    # 解析命令
    try:
        parts = shlex.split(command)
    except ValueError as e:
        return {"error": f"Invalid command syntax: {e}"}
        
    if not parts:
        return {"error": "Empty command"}
        
    # 检查命令是否在白名单中
    cmd_name = parts[0]
    if cmd_name not in ALLOWED_COMMANDS:
        return {
            "error": f"Command not allowed: {cmd_name}",
            "allowed_commands": list(ALLOWED_COMMANDS)
        }
        
    # 执行命令
    try:
        result = subprocess.run(
            parts,
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=str(ALLOWED_BASE_PATH)
        )
        
        output = result.stdout
        if len(output) > MAX_OUTPUT_SIZE:
            output = output[:MAX_OUTPUT_SIZE] + "\\n... (output truncated)"
            
        return {
            "command": command,
            "stdout": output,
            "stderr": result.stderr,
            "return_code": result.returncode
        }
        
    except subprocess.TimeoutExpired:
        return {"error": f"Command timed out after {timeout} seconds"}
    except Exception as e:
        return {"error": f"Execution error: {str(e)}"}
\`\`\`

### 组装Server

最后一步是把所有工具注册到 Server 上。注意每个工具的 \`schema\` 定义——这就是前面讲过的“工具说明书”，它告诉 Client 每个工具接受什么参数、格式是什么。写得越清楚，Agent 使用时犯错的概率就越低：

\`\`\`python
# main.py
from server import MCPServer
from handlers.filesystem import list_directory, read_file, write_file, create_directory
from handlers.shell import execute_command

# 创建Server
server = MCPServer("file-system-server", "1.0.0")

# 注册文件系统工具
@server.tool(
    name="list_directory",
    description="列出指定目录的内容",
    schema={
        "type": "object",
        "properties": {
            "path": {
                "type": "string",
                "description": "目录路径，相对于工作空间根目录",
                "default": "."
            }
        }
    }
)
def tool_list_directory(path: str = "."):
    return list_directory(path)


@server.tool(
    name="read_file",
    description="读取文件内容",
    schema={
        "type": "object",
        "properties": {
            "path": {
                "type": "string",
                "description": "文件路径"
            }
        },
        "required": ["path"]
    }
)
def tool_read_file(path: str):
    return read_file(path)


@server.tool(
    name="write_file",
    description="写入内容到文件",
    schema={
        "type": "object",
        "properties": {
            "path": {"type": "string", "description": "文件路径"},
            "content": {"type": "string", "description": "文件内容"}
        },
        "required": ["path", "content"]
    }
)
def tool_write_file(path: str, content: str):
    return write_file(path, content)


@server.tool(
    name="execute_command",
    description="执行Shell命令（仅限白名单命令）",
    schema={
        "type": "object",
        "properties": {
            "command": {"type": "string", "description": "要执行的命令"}
        },
        "required": ["command"]
    }
)
def tool_execute_command(command: str):
    return execute_command(command)


# 注册资源
@server.resource(
    uri="file://workspace/readme",
    name="工作空间说明",
    description="工作空间使用说明",
    mime_type="text/plain"
)
def resource_readme():
    return """MCP File System Server 工作空间

这是一个受限的文件操作环境，您可以：
- 列出目录内容
- 读写文本文件
- 执行基本的Shell命令

所有操作都限制在工作空间目录内。
"""


if __name__ == "__main__":
    server.run_stdio()
\`\`\`

## 测试Server

写完代码后，如何验证它是否能正常工作？最直接的方式是手动发送 JSON-RPC 请求。这就像厨具出厂前的质检环节——逐个测试每个接口是否返回正确结果。

### 手动测试

\`\`\`bash
# 启动Server
python main.py

# 在另一个终端，发送测试请求
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' | python main.py

# 列出工具
echo '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' | python main.py

# 调用工具
echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"list_directory","arguments":{}}}' | python main.py
\`\`\`

### Python测试脚本

对于更系统化的测试，可以写一个测试脚本。它模拟了 Client 的角色，依次测试初始化、工具列表、工具调用等操作：

\`\`\`python
# test_server.py
import subprocess
import json

def send_request(request: dict) -> dict:
    proc = subprocess.Popen(
        ["python", "main.py"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        text=True
    )
    
    stdout, _ = proc.communicate(json.dumps(request) + "\\n")
    return json.loads(stdout.strip())

# 测试初始化
resp = send_request({
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {}
})
print("Initialize:", resp)

# 测试工具列表
resp = send_request({
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list",
    "params": {}
})
print("Tools:", [t["name"] for t in resp["result"]["tools"]])

# 测试文件操作
resp = send_request({
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
        "name": "write_file",
        "arguments": {"path": "test.txt", "content": "Hello MCP!"}
    }
})
print("Write:", resp)
\`\`\`

## 与Claude Desktop集成

开发完成后，最激动人心的时刻来了——把你的 Server 接入真实的智能体应用。将 Server 配置到 Claude Desktop 只需一个 JSON 配置文件：

\`\`\`json
// ~/.config/claude/claude_desktop_config.json (Linux/Mac)
// %APPDATA%\\Claude\\claude_desktop_config.json (Windows)
{
  "mcpServers": {
    "file-system": {
      "command": "python",
      "args": ["/path/to/mcp_file_server/main.py"]
    }
  }
}
\`\`\`

回顾本节，我们完整地走过了 MCP Server 的开发流程：定义协议处理框架、实现具体工具、组装注册、测试验证、集成应用。其中最关键的经验是：工具描述要清晰（决定了 Agent 能否正确使用），安全措施要到位（路径限制、命令白名单）。你可以以此为基础，扩展更多工具和资源——每个新工具都是智能体能力的一次升级。
`
    },
    {
      id: "adv-13-14-code-agent",
      title: "13.14 实践：编写一个 Code Agent",
      file: "大模型教程/13-智能体技术/13-实践Code-Agent.md",
      difficulty: "中级-高级",
      duration: "2.5h",
      week: 0,
      phase: 0,
      keywords: ["实践：编写一个", "Code", "Agent", "CSV"],
      content: `# 实践：编写一个 Code Agent

## 1. Code Agent 概述

想象一下你身边有一位经验丰富的编程搭档。你只需用自然语言描述需求——“帮我写个程序，读取 CSV 销售数据并生成月度报表”，他就会自动拆解任务、写代码、运行测试、发现 bug 后自行修复，最后把能跑通的程序交给你。这就是 Code Agent 的工作方式——一种“结对编程”的体验，只不过你的搭档是一个 AI。

Code Agent 与简单的代码补全工具有本质区别。代码补全像是一个只会接话的助手，而 Code Agent 具备完整的 ReACT 循环能力：

1. **理解需求**：解析用户的自然语言描述，转化为编程任务
2. **规划方案**：分解复杂任务为可执行的子步骤
3. **生成代码**：根据规划生成高质量代码
4. **执行验证**：在沙箱环境中运行代码，获取执行结果
5. **错误修复**：分析错误信息，迭代修正代码
6. **结果交付**：整理输出，提供最终解决方案

本实践将构建一个功能完整的 Code Agent，支持 Python 代码的生成、执行与自动调试。

\`\`\`mermaid
graph LR
    A[需求分析] --> B[代码搜索]
    B --> C[方案设计]
    C --> D[代码编写]
    D --> E[执行测试]
    E -->|失败| F[调试修复]
    F --> D
    E -->|成功| G[交付结果]
\`\`\`

## 2. 系统架构设计

### 2.1 整体架构

在动手写代码之前，先从全局视角理解系统设计。如果把 Code Agent 比作一个软件开发团队，那么它内部其实有四个“员工”在协作：Planner（项目经理）负责拆解任务，Coder（开发者）负责写代码，Executor（测试环境）负责运行，Debugger（QA 工程师）负责分析问题。

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                      Code Agent System                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Planner   │  │   Coder     │  │     Executor        │  │
│  │  (任务规划) │  │ (代码生成)  │  │   (沙箱执行)        │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                     │             │
│         └────────────────┼─────────────────────┘             │
│                          │                                   │
│                   ┌──────▼──────┐                            │
│                   │  Debugger   │                            │
│                   │ (错误分析)  │                            │
│                   └─────────────┘                            │
├─────────────────────────────────────────────────────────────┤
│                     Memory & Context                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐ │
│  │ Code Files │  │ Exec Logs  │  │  Conversation History  │ │
│  └────────────┘  └────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
\`\`\`

### 2.2 核心组件

| 组件 | 职责 | 关键能力 |
|------|------|----------|
| Planner | 任务分解与规划 | 需求理解、步骤拆分、依赖分析 |
| Coder | 代码生成 | 多语言支持、上下文感知、风格一致 |
| Executor | 代码执行 | 沙箱隔离、超时控制、资源限制 |
| Debugger | 错误诊断 | 错误分类、根因分析、修复建议 |

## 3. 基础实现

### 3.1 项目结构

\`\`\`
code_agent/
├── __init__.py
├── agent.py          # 主 Agent 类
├── planner.py        # 任务规划器
├── coder.py          # 代码生成器
├── executor.py       # 代码执行器
├── debugger.py       # 调试器
├── sandbox.py        # 沙箱环境
├── prompts.py        # 提示词模板
├── tools.py          # 工具定义
└── utils.py          # 工具函数
\`\`\`

### 3.2 沙箱执行环境

安全执行用户代码是 Code Agent 的核心挑战。为什么需要沙箱？假设你让 Agent 写一个处理文件的程序，它的代码里不小心写了一行 \`os.remove('/')\`——如果直接执行，后果不堪设想。沙箱就像一个“实验室”，代码在里面随便跑，但不会影响外面的真实环境。我们使用进程隔离与资源限制构建沙箱：

\`\`\`python
# sandbox.py
import subprocess
import tempfile
import os
import signal
from dataclasses import dataclass
from typing import Optional
from enum import Enum

class ExecutionStatus(Enum):
    SUCCESS = "success"
    ERROR = "error"
    TIMEOUT = "timeout"
    MEMORY_LIMIT = "memory_limit"

@dataclass
class ExecutionResult:
    status: ExecutionStatus
    stdout: str
    stderr: str
    return_code: int
    execution_time: float

class PythonSandbox:
    """Python 代码沙箱执行环境"""
    
    def __init__(
        self,
        timeout: int = 30,
        max_memory_mb: int = 512,
        allowed_imports: Optional[list] = None
    ):
        self.timeout = timeout
        self.max_memory_mb = max_memory_mb
        self.allowed_imports = allowed_imports or [
            'math', 'random', 'datetime', 'json', 're',
            'collections', 'itertools', 'functools',
            'typing', 'dataclasses', 'enum',
            'numpy', 'pandas'  # 可选的数据科学库
        ]
    
    def _create_wrapper_code(self, code: str) -> str:
        """创建带有导入检查的包装代码"""
        import_check = f"""
import sys
import importlib

ALLOWED_IMPORTS = {self.allowed_imports}

class ImportGuard:
    def find_module(self, name, path=None):
        base_module = name.split('.')[0]
        if base_module not in ALLOWED_IMPORTS:
            raise ImportError(f"Import of '{{name}}' is not allowed")
        return None

sys.meta_path.insert(0, ImportGuard())
"""
        return import_check + "\\n" + code
    
    def execute(self, code: str, input_data: str = "") -> ExecutionResult:
        """在沙箱中执行 Python 代码"""
        import time
        
        # 创建临时文件
        with tempfile.NamedTemporaryFile(
            mode='w', suffix='.py', delete=False
        ) as f:
            wrapped_code = self._create_wrapper_code(code)
            f.write(wrapped_code)
            temp_file = f.name
        
        try:
            start_time = time.time()
            
            # 使用 subprocess 执行，设置资源限制
            process = subprocess.Popen(
                ['python', temp_file],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                preexec_fn=self._set_limits  # Unix only
            )
            
            try:
                stdout, stderr = process.communicate(
                    input=input_data,
                    timeout=self.timeout
                )
                execution_time = time.time() - start_time
                
                if process.returncode == 0:
                    status = ExecutionStatus.SUCCESS
                else:
                    status = ExecutionStatus.ERROR
                    
            except subprocess.TimeoutExpired:
                process.kill()
                stdout, stderr = process.communicate()
                execution_time = self.timeout
                status = ExecutionStatus.TIMEOUT
                stderr = f"Execution timed out after {self.timeout} seconds"
            
            return ExecutionResult(
                status=status,
                stdout=stdout,
                stderr=stderr,
                return_code=process.returncode,
                execution_time=execution_time
            )
            
        finally:
            os.unlink(temp_file)
    
    def _set_limits(self):
        """设置进程资源限制 (Unix)"""
        import resource
        
        # 内存限制
        memory_bytes = self.max_memory_mb * 1024 * 1024
        resource.setrlimit(
            resource.RLIMIT_AS,
            (memory_bytes, memory_bytes)
        )
        
        # CPU 时间限制
        resource.setrlimit(
            resource.RLIMIT_CPU,
            (self.timeout, self.timeout)
        )
\`\`\`

### 3.3 代码生成器

有了沙箱，接下来实现"写代码"的能力。代码生成器的核心思路是：精心构建 Prompt，让 LLM 像一个负责任的程序员一样输出代码。注意 \`temperature=0.2\` 这个细节——写代码时我们希望确定性高而非创意性，所以降低随机性：

\`\`\`python
# coder.py
from typing import Optional, List
from dataclasses import dataclass
import json

@dataclass
class CodeBlock:
    language: str
    code: str
    description: str
    dependencies: List[str]

class CodeGenerator:
    """基于 LLM 的代码生成器"""
    
    SYSTEM_PROMPT = """你是一个专业的 Python 程序员。你的任务是根据需求生成高质量的 Python 代码。

生成代码时请遵循以下规则：
1. 代码必须完整可执行，包含所有必要的导入语句
2. 使用类型注解提高代码可读性
3. 添加必要的注释说明关键逻辑
4. 处理可能的异常情况
5. 遵循 PEP 8 代码风格规范

输出格式要求：
- 使用 \`\`\`python 和 \`\`\` 包裹代码块
- 在代码前简要说明实现思路
- 如果需要安装额外依赖，请明确说明"""

    def __init__(self, llm_client):
        self.llm = llm_client
        self.conversation_history = []
    
    def generate(
        self,
        task: str,
        context: Optional[str] = None,
        constraints: Optional[List[str]] = None
    ) -> CodeBlock:
        """生成代码"""
        
        # 构建提示词
        prompt = self._build_prompt(task, context, constraints)
        
        # 调用 LLM
        response = self.llm.chat(
            messages=[
                {"role": "system", "content": self.SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2  # 降低随机性，提高代码一致性
        )
        
        # 解析响应
        code_block = self._parse_response(response)
        
        return code_block
    
    def refine(
        self,
        original_code: str,
        error_message: str,
        execution_output: str
    ) -> CodeBlock:
        """根据错误信息修正代码"""
        
        prompt = f"""原始代码执行出错，请修正。

## 原始代码
\`\`\`python
{original_code}
\`\`\`

## 错误信息
{error_message}

## 执行输出
{execution_output}

请分析错误原因，并提供修正后的完整代码。"""

        response = self.llm.chat(
            messages=[
                {"role": "system", "content": self.SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1
        )
        
        return self._parse_response(response)
    
    def _build_prompt(
        self,
        task: str,
        context: Optional[str],
        constraints: Optional[List[str]]
    ) -> str:
        """构建生成提示词"""
        
        prompt_parts = [f"## 任务需求\\n{task}"]
        
        if context:
            prompt_parts.append(f"## 上下文信息\\n{context}")
        
        if constraints:
            constraint_text = "\\n".join(f"- {c}" for c in constraints)
            prompt_parts.append(f"## 约束条件\\n{constraint_text}")
        
        prompt_parts.append("请生成满足需求的 Python 代码。")
        
        return "\\n\\n".join(prompt_parts)
    
    def _parse_response(self, response: str) -> CodeBlock:
        """从 LLM 响应中提取代码块"""
        import re
        
        # 提取代码块
        code_pattern = r'\`\`\`python\\n(.*?)\`\`\`'
        matches = re.findall(code_pattern, response, re.DOTALL)
        
        if not matches:
            # 尝试提取无语言标记的代码块
            code_pattern = r'\`\`\`\\n(.*?)\`\`\`'
            matches = re.findall(code_pattern, response, re.DOTALL)
        
        code = matches[0].strip() if matches else ""
        
        # 提取依赖
        dependencies = self._extract_dependencies(code)
        
        # 提取描述（代码块之前的文本）
        description = response.split('\`\`\`')[0].strip()
        
        return CodeBlock(
            language="python",
            code=code,
            description=description,
            dependencies=dependencies
        )
    
    def _extract_dependencies(self, code: str) -> List[str]:
        """从代码中提取外部依赖"""
        import re
        
        # 匹配 import 语句
        import_pattern = r'^(?:from\\s+(\\w+)|import\\s+(\\w+))'
        matches = re.findall(import_pattern, code, re.MULTILINE)
        
        # 标准库模块列表（部分）
        stdlib = {
            'os', 'sys', 're', 'json', 'math', 'random',
            'datetime', 'collections', 'itertools', 'functools',
            'typing', 'dataclasses', 'enum', 'pathlib', 'io',
            'subprocess', 'threading', 'multiprocessing'
        }
        
        dependencies = []
        for match in matches:
            module = match[0] or match[1]
            if module and module not in stdlib:
                dependencies.append(module)
        
        return list(set(dependencies))
\`\`\`

### 3.4 调试器模块

调试器是 Code Agent 区别于普通代码生成工具的关键。当代码执行出错时，它像一个经验丰富的 debug 专家一样工作：先用规则快速分类错误类型（语法错误？运行时错误？逻辑错误？），再用 LLM 进行深度分析，给出根因和修复建议：

\`\`\`python
# debugger.py
from dataclasses import dataclass
from typing import List, Optional
from enum import Enum

class ErrorCategory(Enum):
    SYNTAX = "syntax_error"
    RUNTIME = "runtime_error"
    LOGIC = "logic_error"
    IMPORT = "import_error"
    TYPE = "type_error"
    TIMEOUT = "timeout"
    UNKNOWN = "unknown"

@dataclass
class DebugAnalysis:
    category: ErrorCategory
    root_cause: str
    line_number: Optional[int]
    suggestions: List[str]
    confidence: float

class CodeDebugger:
    """代码调试分析器"""
    
    ERROR_PATTERNS = {
        ErrorCategory.SYNTAX: [
            r'SyntaxError',
            r'IndentationError',
            r'TabError'
        ],
        ErrorCategory.IMPORT: [
            r'ImportError',
            r'ModuleNotFoundError'
        ],
        ErrorCategory.TYPE: [
            r'TypeError',
            r'AttributeError'
        ],
        ErrorCategory.RUNTIME: [
            r'ValueError',
            r'KeyError',
            r'IndexError',
            r'ZeroDivisionError',
            r'FileNotFoundError'
        ]
    }
    
    def __init__(self, llm_client):
        self.llm = llm_client
    
    def analyze(
        self,
        code: str,
        error_message: str,
        stdout: str
    ) -> DebugAnalysis:
        """分析代码错误"""
        
        # 1. 规则匹配分类
        category = self._categorize_error(error_message)
        
        # 2. 提取行号
        line_number = self._extract_line_number(error_message)
        
        # 3. LLM 深度分析
        llm_analysis = self._llm_analyze(
            code, error_message, stdout, category
        )
        
        return DebugAnalysis(
            category=category,
            root_cause=llm_analysis['root_cause'],
            line_number=line_number,
            suggestions=llm_analysis['suggestions'],
            confidence=llm_analysis['confidence']
        )
    
    def _categorize_error(self, error_message: str) -> ErrorCategory:
        """根据错误信息分类"""
        import re
        
        for category, patterns in self.ERROR_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, error_message):
                    return category
        
        return ErrorCategory.UNKNOWN
    
    def _extract_line_number(self, error_message: str) -> Optional[int]:
        """从错误信息中提取行号"""
        import re
        
        # 匹配 "line X" 模式
        match = re.search(r'line (\\d+)', error_message, re.IGNORECASE)
        if match:
            return int(match.group(1))
        return None
    
    def _llm_analyze(
        self,
        code: str,
        error_message: str,
        stdout: str,
        category: ErrorCategory
    ) -> dict:
        """使用 LLM 进行深度错误分析"""
        
        prompt = f"""分析以下 Python 代码的错误：

## 代码
\`\`\`python
{code}
\`\`\`

## 错误信息
{error_message}

## 标准输出
{stdout}

## 初步分类
{category.value}

请提供：
1. 错误根因分析（root_cause）
2. 修复建议列表（suggestions）
3. 分析置信度 0-1（confidence）

以 JSON 格式输出。"""

        response = self.llm.chat(
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1
        )
        
        # 解析 JSON 响应
        import json
        import re
        
        json_match = re.search(r'\\{.*\\}', response, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group())
            except json.JSONDecodeError:
                pass
        
        # 默认返回
        return {
            'root_cause': error_message,
            'suggestions': ['检查错误信息中指出的问题'],
            'confidence': 0.5
        }
\`\`\`

## 4. 主 Agent 实现

### 4.1 Agent 核心类

现在把所有组件串联起来。主 Agent 的工作流程就像结对编程的完整过程：先和你讨论需求并拆解任务（规划），然后一步步写代码并运行（编码+执行），如果报错就分析原因并修复（调试），直到所有步骤完成。注意 \`max_debug_attempts=3\` 这个设计——就像真实开发中，如果一个 bug 修了三次还没解决，通常需要换个思路而不是继续死磕：

\`\`\`python
# agent.py
from typing import Optional, List, Dict, Any
from dataclasses import dataclass, field
from enum import Enum
import json

from .sandbox import PythonSandbox, ExecutionResult, ExecutionStatus
from .coder import CodeGenerator, CodeBlock
from .debugger import CodeDebugger, DebugAnalysis

class AgentState(Enum):
    IDLE = "idle"
    PLANNING = "planning"
    CODING = "coding"
    EXECUTING = "executing"
    DEBUGGING = "debugging"
    COMPLETED = "completed"
    FAILED = "failed"

@dataclass
class TaskStep:
    description: str
    code: Optional[str] = None
    result: Optional[ExecutionResult] = None
    debug_attempts: int = 0
    status: str = "pending"

@dataclass
class AgentContext:
    task: str
    steps: List[TaskStep] = field(default_factory=list)
    current_step: int = 0
    code_history: List[CodeBlock] = field(default_factory=list)
    execution_history: List[ExecutionResult] = field(default_factory=list)
    max_debug_attempts: int = 3

class CodeAgent:
    """Code Agent 主类"""
    
    def __init__(
        self,
        llm_client,
        sandbox_config: Optional[Dict] = None,
        verbose: bool = True
    ):
        self.llm = llm_client
        self.sandbox = PythonSandbox(**(sandbox_config or {}))
        self.coder = CodeGenerator(llm_client)
        self.debugger = CodeDebugger(llm_client)
        self.verbose = verbose
        self.state = AgentState.IDLE
        self.context: Optional[AgentContext] = None
    
    def run(self, task: str) -> Dict[str, Any]:
        """执行完整的 Code Agent 流程"""
        
        self.context = AgentContext(task=task)
        self._log(f"开始执行任务: {task}")
        
        try:
            # 1. 规划阶段
            self.state = AgentState.PLANNING
            steps = self._plan_task(task)
            self.context.steps = steps
            self._log(f"任务分解为 {len(steps)} 个步骤")
            
            # 2. 逐步执行
            for i, step in enumerate(steps):
                self.context.current_step = i
                self._log(f"\\n=== 步骤 {i+1}: {step.description} ===")
                
                success = self._execute_step(step)
                if not success:
                    self.state = AgentState.FAILED
                    return self._build_result(success=False)
            
            # 3. 完成
            self.state = AgentState.COMPLETED
            return self._build_result(success=True)
            
        except Exception as e:
            self.state = AgentState.FAILED
            self._log(f"执行异常: {e}")
            return self._build_result(success=False, error=str(e))
    
    def _plan_task(self, task: str) -> List[TaskStep]:
        """将任务分解为可执行步骤"""
        
        prompt = f"""将以下编程任务分解为具体的执行步骤：

任务：{task}

要求：
1. 每个步骤应该是可独立执行的代码单元
2. 步骤之间可以有依赖关系
3. 每个步骤的描述要清晰具体

以 JSON 数组格式输出，每个元素包含 "description" 字段。
示例：[{{"description": "步骤1描述"}}, {{"description": "步骤2描述"}}]"""

        response = self.llm.chat(
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
        
        # 解析步骤
        import re
        json_match = re.search(r'\\[.*\\]', response, re.DOTALL)
        if json_match:
            try:
                steps_data = json.loads(json_match.group())
                return [TaskStep(description=s['description']) for s in steps_data]
            except (json.JSONDecodeError, KeyError):
                pass
        
        # 默认单步骤
        return [TaskStep(description=task)]
    
    def _execute_step(self, step: TaskStep) -> bool:
        """执行单个步骤"""
        
        # 生成代码
        self.state = AgentState.CODING
        context = self._build_step_context()
        code_block = self.coder.generate(
            task=step.description,
            context=context
        )
        step.code = code_block.code
        self.context.code_history.append(code_block)
        self._log(f"生成代码:\\n{code_block.code[:500]}...")
        
        # 执行与调试循环
        while step.debug_attempts <= self.context.max_debug_attempts:
            # 执行代码
            self.state = AgentState.EXECUTING
            result = self.sandbox.execute(step.code)
            step.result = result
            self.context.execution_history.append(result)
            
            if result.status == ExecutionStatus.SUCCESS:
                self._log(f"执行成功! 输出:\\n{result.stdout[:500]}")
                step.status = "completed"
                return True
            
            # 执行失败，进入调试
            self.state = AgentState.DEBUGGING
            step.debug_attempts += 1
            self._log(f"执行失败 (尝试 {step.debug_attempts}/{self.context.max_debug_attempts})")
            self._log(f"错误: {result.stderr[:300]}")
            
            if step.debug_attempts > self.context.max_debug_attempts:
                self._log("达到最大调试次数，放弃")
                step.status = "failed"
                return False
            
            # 分析错误并修正
            analysis = self.debugger.analyze(
                step.code, result.stderr, result.stdout
            )
            self._log(f"错误分析: {analysis.root_cause}")
            
            # 生成修正代码
            refined = self.coder.refine(
                step.code, result.stderr, result.stdout
            )
            step.code = refined.code
            self._log("已生成修正代码，重新执行...")
        
        return False
    
    def _build_step_context(self) -> str:
        """构建当前步骤的上下文信息"""
        
        context_parts = []
        
        # 已完成步骤的代码和结果
        for i, step in enumerate(self.context.steps[:self.context.current_step]):
            if step.status == "completed":
                context_parts.append(
                    f"步骤 {i+1} ({step.description}):\\n"
                    f"\`\`\`python\\n{step.code}\\n\`\`\`\\n"
                    f"输出: {step.result.stdout[:200] if step.result else 'N/A'}"
                )
        
        return "\\n\\n".join(context_parts) if context_parts else None
    
    def _build_result(
        self,
        success: bool,
        error: Optional[str] = None
    ) -> Dict[str, Any]:
        """构建最终结果"""
        
        result = {
            "success": success,
            "task": self.context.task,
            "steps": [],
            "final_output": None
        }
        
        for step in self.context.steps:
            result["steps"].append({
                "description": step.description,
                "status": step.status,
                "code": step.code,
                "output": step.result.stdout if step.result else None,
                "debug_attempts": step.debug_attempts
            })
        
        # 最后成功步骤的输出作为最终输出
        for step in reversed(self.context.steps):
            if step.result and step.result.status == ExecutionStatus.SUCCESS:
                result["final_output"] = step.result.stdout
                break
        
        if error:
            result["error"] = error
        
        return result
    
    def _log(self, message: str):
        """日志输出"""
        if self.verbose:
            print(f"[CodeAgent] {message}")
\`\`\`

## 5. 工具集成与扩展

### 5.1 定义 Agent 工具

回忆前面工具与 MCP 协议的内容，Code Agent 同样需要工具来增强能力。普通程序员写代码时会先看看项目结构、读读现有代码、搜索相关实现——Code Agent 也需要这些能力：

\`\`\`python
# tools.py
from typing import Callable, Dict, Any, List
from dataclasses import dataclass
import json

@dataclass
class Tool:
    name: str
    description: str
    parameters: Dict[str, Any]
    function: Callable

class ToolRegistry:
    """工具注册表"""
    
    def __init__(self):
        self.tools: Dict[str, Tool] = {}
    
    def register(self, tool: Tool):
        self.tools[tool.name] = tool
    
    def get(self, name: str) -> Tool:
        return self.tools.get(name)
    
    def list_tools(self) -> List[Dict]:
        """生成 OpenAI 格式的工具列表"""
        return [
            {
                "type": "function",
                "function": {
                    "name": tool.name,
                    "description": tool.description,
                    "parameters": tool.parameters
                }
            }
            for tool in self.tools.values()
        ]
    
    def execute(self, name: str, arguments: Dict) -> Any:
        tool = self.tools.get(name)
        if not tool:
            raise ValueError(f"Unknown tool: {name}")
        return tool.function(**arguments)

# 预定义工具
def create_default_tools() -> ToolRegistry:
    registry = ToolRegistry()
    
    # 文件读取工具
    registry.register(Tool(
        name="read_file",
        description="读取指定路径的文件内容",
        parameters={
            "type": "object",
            "properties": {
                "path": {
                    "type": "string",
                    "description": "文件路径"
                }
            },
            "required": ["path"]
        },
        function=lambda path: open(path).read()
    ))
    
    # 文件写入工具
    registry.register(Tool(
        name="write_file",
        description="将内容写入指定文件",
        parameters={
            "type": "object",
            "properties": {
                "path": {
                    "type": "string",
                    "description": "文件路径"
                },
                "content": {
                    "type": "string",
                    "description": "文件内容"
                }
            },
            "required": ["path", "content"]
        },
        function=lambda path, content: open(path, 'w').write(content)
    ))
    
    # 目录列表工具
    registry.register(Tool(
        name="list_directory",
        description="列出目录中的文件和子目录",
        parameters={
            "type": "object",
            "properties": {
                "path": {
                    "type": "string",
                    "description": "目录路径"
                }
            },
            "required": ["path"]
        },
        function=lambda path: "\\n".join(os.listdir(path))
    ))
    
    # 搜索工具
    registry.register(Tool(
        name="search_code",
        description="在代码文件中搜索指定模式",
        parameters={
            "type": "object",
            "properties": {
                "pattern": {
                    "type": "string",
                    "description": "搜索模式（正则表达式）"
                },
                "directory": {
                    "type": "string",
                    "description": "搜索目录"
                }
            },
            "required": ["pattern", "directory"]
        },
        function=search_in_files
    ))
    
    return registry

def search_in_files(pattern: str, directory: str) -> str:
    """在文件中搜索模式"""
    import re
    import os
    
    results = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.py'):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r') as f:
                        content = f.read()
                        matches = re.findall(
                            f'.*{pattern}.*',
                            content,
                            re.MULTILINE
                        )
                        if matches:
                            results.append(f"{filepath}:\\n" + "\\n".join(matches[:5]))
                except Exception:
                    pass
    
    return "\\n\\n".join(results[:10]) if results else "No matches found"
\`\`\`

### 5.2 带工具调用的 Agent

\`\`\`python
# agent_with_tools.py
class CodeAgentWithTools(CodeAgent):
    """支持工具调用的 Code Agent"""
    
    def __init__(self, llm_client, **kwargs):
        super().__init__(llm_client, **kwargs)
        self.tools = create_default_tools()
    
    def _generate_with_tools(self, task: str) -> str:
        """使用工具辅助生成代码"""
        
        messages = [
            {
                "role": "system",
                "content": """你是一个 Code Agent，可以使用工具来完成编程任务。
在生成代码之前，你可以：
1. 使用 read_file 读取相关文件了解上下文
2. 使用 list_directory 查看项目结构
3. 使用 search_code 搜索相关代码

根据收集的信息生成更准确的代码。"""
            },
            {"role": "user", "content": task}
        ]
        
        # 工具调用循环
        max_tool_calls = 5
        for _ in range(max_tool_calls):
            response = self.llm.chat(
                messages=messages,
                tools=self.tools.list_tools(),
                tool_choice="auto"
            )
            
            # 检查是否有工具调用
            if not response.get('tool_calls'):
                return response['content']
            
            # 执行工具调用
            for tool_call in response['tool_calls']:
                func_name = tool_call['function']['name']
                func_args = json.loads(tool_call['function']['arguments'])
                
                self._log(f"调用工具: {func_name}({func_args})")
                
                try:
                    result = self.tools.execute(func_name, func_args)
                except Exception as e:
                    result = f"Error: {e}"
                
                # 添加工具结果到消息历史
                messages.append({
                    "role": "assistant",
                    "content": None,
                    "tool_calls": [tool_call]
                })
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call['id'],
                    "content": str(result)[:2000]  # 限制长度
                })
        
        # 达到最大工具调用次数，请求最终响应
        messages.append({
            "role": "user",
            "content": "请根据以上信息生成最终代码。"
        })
        
        return self.llm.chat(messages=messages)['content']
\`\`\`

## 6. 完整使用示例

### 6.1 基础使用

来看看实际如何使用。下面的示例展示了一个典型的使用场景：用户描述一个数据处理任务，Agent 自动拆解为多个步骤，逐个生成代码并执行。如果某个步骤出错，Agent 会自动调试并重试：

\`\`\`python
# example_basic.py
from openai import OpenAI

# 简单的 LLM 客户端包装
class LLMClient:
    def __init__(self, api_key: str, base_url: str = None):
        self.client = OpenAI(api_key=api_key, base_url=base_url)
    
    def chat(self, messages, **kwargs):
        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=messages,
            **kwargs
        )
        
        message = response.choices[0].message
        
        if kwargs.get('tools') and message.tool_calls:
            return {
                'content': message.content,
                'tool_calls': [
                    {
                        'id': tc.id,
                        'function': {
                            'name': tc.function.name,
                            'arguments': tc.function.arguments
                        }
                    }
                    for tc in message.tool_calls
                ]
            }
        
        return {'content': message.content}

# 创建 Agent 实例
llm = LLMClient(api_key="your-api-key")
agent = CodeAgent(llm, verbose=True)

# 执行任务
result = agent.run("""
编写一个 Python 程序，实现以下功能：
1. 读取 CSV 文件中的销售数据
2. 按月份统计销售额
3. 找出销售额最高的月份
4. 生成一个简单的文本报告
""")

print("\\n=== 执行结果 ===")
print(json.dumps(result, indent=2, ensure_ascii=False))
\`\`\`

### 6.2 交互式会话

更进一步，我们可以把 Code Agent 包装成交互式助手。这就像真实的结对编程体验：你随时可以说“帮我写个程序”、“解释一下这段代码”、“把这里改成异步的”，助手会根据你的意图做出相应操作：

\`\`\`python
# example_interactive.py
class InteractiveCodeAgent:
    """交互式 Code Agent"""
    
    def __init__(self, llm_client):
        self.agent = CodeAgent(llm_client)
        self.history = []
    
    def chat(self, user_input: str) -> str:
        """处理用户输入"""
        
        # 分析用户意图
        intent = self._analyze_intent(user_input)
        
        if intent == "generate_code":
            result = self.agent.run(user_input)
            self.history.append(("task", user_input, result))
            return self._format_result(result)
        
        elif intent == "explain_code":
            return self._explain_last_code()
        
        elif intent == "modify_code":
            return self._modify_last_code(user_input)
        
        elif intent == "execute_code":
            return self._execute_provided_code(user_input)
        
        else:
            return "我可以帮你生成、执行、调试 Python 代码。请描述你的需求。"
    
    def _analyze_intent(self, text: str) -> str:
        """分析用户意图"""
        keywords = {
            "generate_code": ["写", "生成", "创建", "实现", "编写"],
            "explain_code": ["解释", "说明", "什么意思", "怎么理解"],
            "modify_code": ["修改", "改成", "改为", "优化", "重构"],
            "execute_code": ["运行", "执行", "测试"]
        }
        
        for intent, words in keywords.items():
            if any(w in text for w in words):
                return intent
        
        return "generate_code"  # 默认生成代码
    
    def _format_result(self, result: dict) -> str:
        """格式化结果输出"""
        if result['success']:
            output = "✅ 任务完成!\\n\\n"
            for i, step in enumerate(result['steps']):
                output += f"**步骤 {i+1}**: {step['description']}\\n"
                output += f"\`\`\`python\\n{step['code']}\\n\`\`\`\\n"
                if step['output']:
                    output += f"输出:\\n\`\`\`\\n{step['output']}\\n\`\`\`\\n\\n"
            return output
        else:
            return f"❌ 任务失败: {result.get('error', '未知错误')}"

# 使用示例
def main():
    llm = LLMClient(api_key="your-api-key")
    assistant = InteractiveCodeAgent(llm)
    
    print("Code Agent 交互模式（输入 'quit' 退出）")
    print("-" * 50)
    
    while True:
        user_input = input("\\n👤 You: ").strip()
        if user_input.lower() == 'quit':
            break
        
        response = assistant.chat(user_input)
        print(f"\\n🤖 Agent: {response}")

if __name__ == "__main__":
    main()
\`\`\`

## 7. 高级特性

### 7.1 多文件项目支持

在实际开发中，程序很少只有一个文件。真实的编程搭档会先浏览项目结构、理解现有代码，然后才开始写新功能。多文件支持让 Code Agent 也能做到这一点：

\`\`\`python
class ProjectCodeAgent(CodeAgent):
    """支持多文件项目的 Code Agent"""
    
    def __init__(self, llm_client, project_root: str, **kwargs):
        super().__init__(llm_client, **kwargs)
        self.project_root = project_root
        self.project_files: Dict[str, str] = {}
    
    def _scan_project(self):
        """扫描项目文件"""
        import os
        
        for root, dirs, files in os.walk(self.project_root):
            # 跳过常见的非代码目录
            dirs[:] = [d for d in dirs if d not in [
                '.git', '__pycache__', 'node_modules', 'venv', '.venv'
            ]]
            
            for file in files:
                if file.endswith('.py'):
                    filepath = os.path.join(root, file)
                    rel_path = os.path.relpath(filepath, self.project_root)
                    try:
                        with open(filepath, 'r') as f:
                            self.project_files[rel_path] = f.read()
                    except Exception:
                        pass
    
    def _build_project_context(self) -> str:
        """构建项目上下文"""
        self._scan_project()
        
        context_parts = [
            f"项目根目录: {self.project_root}",
            f"项目文件数: {len(self.project_files)}",
            "\\n文件结构:"
        ]
        
        for path in sorted(self.project_files.keys()):
            context_parts.append(f"  - {path}")
        
        return "\\n".join(context_parts)
    
    def run_in_project(self, task: str) -> Dict[str, Any]:
        """在项目上下文中执行任务"""
        
        project_context = self._build_project_context()
        enhanced_task = f"""
{task}

## 项目信息
{project_context}

请在现有项目结构的基础上完成任务。
"""
        return self.run(enhanced_task)
\`\`\`

### 7.2 测试生成与验证

好的程序员不仅写代码，还写测试。下面的扩展让 Agent 在生成主代码后自动创建单元测试，并运行测试验证正确性——这就是“测试驱动开发”的智能体版本：

\`\`\`python
class TestAwareCodeAgent(CodeAgent):
    """具备测试意识的 Code Agent"""
    
    def run_with_tests(self, task: str) -> Dict[str, Any]:
        """生成代码并自动创建测试"""
        
        # 1. 生成主代码
        code_result = self.run(task)
        if not code_result['success']:
            return code_result
        
        main_code = code_result['steps'][-1]['code']
        
        # 2. 生成测试代码
        test_task = f"""
为以下代码生成单元测试：

\`\`\`python
{main_code}
\`\`\`

要求：
1. 使用 pytest 框架
2. 覆盖正常情况和边界情况
3. 包含至少 3 个测试用例
"""
        
        test_result = self.run(test_task)
        
        # 3. 运行测试验证
        if test_result['success']:
            test_code = test_result['steps'][-1]['code']
            
            # 组合代码运行测试
            combined_code = f"""
{main_code}

# === 测试代码 ===
{test_code}

# 运行测试
if __name__ == "__main__":
    import pytest
    pytest.main([__file__, "-v"])
"""
            validation_result = self.sandbox.execute(combined_code)
            
            return {
                **code_result,
                "tests": {
                    "code": test_code,
                    "validation": {
                        "success": validation_result.status == ExecutionStatus.SUCCESS,
                        "output": validation_result.stdout,
                        "errors": validation_result.stderr
                    }
                }
            }
        
        return code_result
\`\`\`

## 8. 最佳实践与注意事项

### 8.1 安全性考虑

安全是 Code Agent 的重中之重。每一行由 Agent 生成的代码都可能有潜在风险，就像让实习生独立操作工业设备一样，必须有完善的安全措施：

| 风险 | 防护措施 | 实现方式 |
|------|----------|----------|
| 代码注入 | 沙箱隔离 | subprocess + 资源限制 |
| 无限循环 | 超时控制 | timeout 参数 |
| 内存耗尽 | 内存限制 | RLIMIT_AS |
| 文件系统访问 | 目录限制 | chroot 或路径检查 |
| 网络访问 | 网络隔离 | seccomp 或 Docker |

### 8.2 性能优化

\`\`\`python
# 缓存机制
from functools import lru_cache

class CachedCodeAgent(CodeAgent):
    
    @lru_cache(maxsize=100)
    def _cached_generate(self, task_hash: str, task: str) -> str:
        """缓存相同任务的生成结果"""
        return self.coder.generate(task).code
    
    def generate_with_cache(self, task: str) -> str:
        import hashlib
        task_hash = hashlib.md5(task.encode()).hexdigest()
        return self._cached_generate(task_hash, task)
\`\`\`

### 8.3 错误处理最佳实践

1. **分层错误处理**：区分用户错误、系统错误、LLM 错误
2. **优雅降级**：当高级功能失败时回退到基础功能
3. **详细日志**：记录完整的执行轨迹便于调试
4. **用户反馈**：将技术错误转化为用户友好的提示

## 9. 思考题

回顾本节，我们从零构建了一个完整的 Code Agent。它的核心能力可以用四个词概括：规划、编码、执行、调试——正是一位真实程序员的核心工作流。以下思考题帮助你进一步思考 Code Agent 的潜力与边界：

1. **沙箱安全**：如何在支持更多库（如 requests）的同时保证安全性？考虑使用 Docker 容器化方案。

2. **多语言支持**：设计一个架构支持 Python、JavaScript、Go 等多种语言的代码生成与执行。

3. **增量编辑**：当用户要求修改已有代码时，如何实现精确的增量编辑而非完全重写？

4. **协作模式**：设计一个多 Agent 协作的 Code Agent 系统，包含架构师 Agent、开发者 Agent、测试 Agent 等角色。

5. **学习能力**：如何让 Code Agent 从历史执行记录中学习，提高代码生成的成功率？

## 参考资料

1. OpenAI Codex 技术报告
2. DeepMind AlphaCode 论文
3. LangChain Agents 文档
4. AutoGPT 项目
5. MetaGPT: Multi-Agent Framework
`
    },
    {
      id: "adv-13-15-skills",
      title: "13.15 Skills技术",
      file: "大模型教程/13-智能体技术/14-Skills技术.md",
      difficulty: "中级-高级",
      duration: "1h",
      week: 0,
      phase: 0,
      keywords: ["Skills技术", "Skills", "MCP", "Tools"],
      content: `# Skills技术

## 1. 从工具到技能的演进

假设你刚招了一位新员工，他会用所有办公软件（工具），但不懂你们行业的业务流程和专业知识。而一位资深专家不仅会用工具，还掌握了完整的工作方法论和领域经验。Skills 技术解决的正是这个问题——如何让智能体从“会用工具的新手”变成“掌握专业知识的专家”。

MCP协议解决了智能体与外部工具的标准化交互问题，但在实际应用中，开发者面临一个新挑战：**如何让智能体像人类专家一样，根据任务需求动态加载和组合专业能力？**

工具（Tools）提供的是原子化的操作能力，如“读取文件”、“查询数据库”；而技能（Skills）则是更高层次的抽象——包含领域知识、工作流程和最佳实践的完整能力包。举个例子，\`read_file\` 是一个工具，而 \`code_review\`（包括安全审查清单、性能分析框架、代码风格规范）则是一个技能：

| 概念 | 粒度 | 示例 | 特点 |
|------|------|------|------|
| Tool | 原子操作 | \`read_file\`, \`http_request\` | 单一功能，无领域知识 |
| Skill | 领域能力 | \`code_review\`, \`financial_analysis\` | 包含专业知识和工作流 |

\`\`\`mermaid
graph TD
    U[用户请求] --> M[触发条件匹配]
    M --> S[加载 Skill]
    S --> I[注入专业知识到 Prompt]
    I --> E[执行流程]
    E --> O[结构化输出]
\`\`\`

## 2. Agent Skills 协议

### 2.1 设计理念

Anthropic 提出的 Agent Skills 协议是一种让智能体动态获取专业能力的机制。继续用专家的比喻：你不可能让每位员工都同时掌握所有领域的知识，而是根据任务需求调动相应的专家。其核心思想是：

1. **按需加载**：不是所有技能都预置在系统提示中，而是根据任务需求动态加载
2. **领域专精**：每个 Skill 封装特定领域的专业知识
3. **可组合性**：多个 Skills 可以协同工作，解决复杂问题
4. **标准化格式**：统一的 Skill 定义规范，便于共享和复用

### 2.2 Skill 的结构

一个标准的 Skill 定义就像一位专家的“履历”——包含他的名称、专业领域、擅长什么、在什么情况下应该找他、以及他的工作方法论。以下是一个代码审查技能的完整定义：

\`\`\`yaml
# skill.yaml
name: code-review
version: "1.0.0"
description: "专业的代码审查技能，提供安全性、性能和可维护性分析"

# 触发条件：何时自动应用此技能
triggers:
  - pattern: "review.*code"
  - pattern: "check.*security"
  - file_types: [".py", ".js", ".ts", ".go"]

# 技能指令：注入到Agent的专业知识
instructions: |
  你现在是一位资深代码审查专家。进行代码审查时，请从以下维度分析：
  
  ## 安全性检查
  - SQL注入风险
  - XSS漏洞
  - 敏感信息泄露
  - 权限控制缺陷
  
  ## 性能分析
  - 算法复杂度
  - 内存使用
  - 数据库查询效率
  - 缓存策略
  
  ## 代码质量
  - 命名规范
  - 函数单一职责
  - 错误处理完整性
  - 测试覆盖率建议
  
  对于每个发现的问题，提供：
  1. 问题描述
  2. 风险等级（高/中/低）
  3. 具体修改建议
  4. 修改后的代码示例

# 关联的工具
tools:
  - name: static_analysis
    description: "运行静态代码分析"
  - name: security_scan
    description: "执行安全漏洞扫描"

# 输出格式模板
output_format: |
  ## 代码审查报告
  
  ### 概述
  - 审查文件：{files}
  - 发现问题：{issue_count}
  
  ### 问题详情
  {issues}
  
  ### 改进建议
  {suggestions}
\`\`\`

### 2.3 Skill 加载机制

理解了 Skill 的结构，接下来看它如何在代码中实现。核心机制是：当用户提出请求时，系统自动匹配触发条件，加载相应的技能，并将专业知识注入到系统提示中。这就像公司前台根据客户需求自动派单给对口专家：

\`\`\`python
from dataclasses import dataclass, field
from typing import List, Optional, Callable
import yaml
import re

@dataclass
class Skill:
    """技能定义"""
    name: str
    version: str
    description: str
    instructions: str
    triggers: List[dict] = field(default_factory=list)
    tools: List[dict] = field(default_factory=list)
    output_format: Optional[str] = None
    
    @classmethod
    def from_yaml(cls, path: str) -> 'Skill':
        """从YAML文件加载技能"""
        with open(path, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)
        return cls(**data)
    
    def matches(self, query: str, file_types: List[str] = None) -> bool:
        """检查是否匹配触发条件"""
        for trigger in self.triggers:
            # 模式匹配
            if 'pattern' in trigger:
                if re.search(trigger['pattern'], query, re.IGNORECASE):
                    return True
            # 文件类型匹配
            if 'file_types' in trigger and file_types:
                if any(ft in trigger['file_types'] for ft in file_types):
                    return True
        return False


class SkillRegistry:
    """技能注册表"""
    
    def __init__(self):
        self.skills: dict[str, Skill] = {}
        
    def register(self, skill: Skill):
        """注册技能"""
        self.skills[skill.name] = skill
        
    def load_from_directory(self, directory: str):
        """从目录加载所有技能"""
        import os
        for filename in os.listdir(directory):
            if filename.endswith('.yaml') or filename.endswith('.yml'):
                skill_path = os.path.join(directory, filename)
                skill = Skill.from_yaml(skill_path)
                self.register(skill)
                
    def find_matching_skills(
        self, 
        query: str, 
        file_types: List[str] = None,
        max_skills: int = 3
    ) -> List[Skill]:
        """查找匹配的技能"""
        matching = []
        for skill in self.skills.values():
            if skill.matches(query, file_types):
                matching.append(skill)
                if len(matching) >= max_skills:
                    break
        return matching


class SkillAwareAgent:
    """具备技能感知能力的Agent"""
    
    def __init__(self, llm_client, skill_registry: SkillRegistry):
        self.llm = llm_client
        self.registry = skill_registry
        self.active_skills: List[Skill] = []
        
    def _build_system_prompt(self, base_prompt: str) -> str:
        """构建包含技能指令的系统提示"""
        if not self.active_skills:
            return base_prompt
            
        skill_instructions = "\\n\\n".join([
            f"## {skill.name}\\n{skill.instructions}"
            for skill in self.active_skills
        ])
        
        return f"""{base_prompt}

你已加载以下专业技能，请在回答中运用这些专业知识：

{skill_instructions}
"""
    
    def process(self, query: str, context: dict = None) -> str:
        """处理用户请求"""
        # 1. 自动匹配并加载技能
        file_types = context.get('file_types', []) if context else []
        self.active_skills = self.registry.find_matching_skills(query, file_types)
        
        # 2. 构建增强的系统提示
        system_prompt = self._build_system_prompt("你是一个智能助手。")
        
        # 3. 调用LLM
        response = self.llm.chat(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": query}
            ]
        )
        
        # 4. 如有输出格式要求，进行格式化
        if self.active_skills and self.active_skills[0].output_format:
            response = self._format_output(response, self.active_skills[0])
            
        return response
\`\`\`

## 3. Skill 类型与设计模式

### 3.1 按领域分类

就像公司有不同部门的专家一样，Skills 也按领域分类：

| 领域 | 技能示例 | 核心能力 |
|------|----------|----------|
| 软件开发 | \`code-review\`, \`refactoring\`, \`testing\` | 代码分析、重构建议、测试生成 |
| 数据分析 | \`data-cleaning\`, \`visualization\`, \`statistics\` | 数据处理、图表生成、统计分析 |
| 文档写作 | \`technical-writing\`, \`copywriting\`, \`translation\` | 专业写作、风格转换、多语言支持 |
| 研究调研 | \`literature-review\`, \`fact-checking\`, \`synthesis\` | 文献分析、事实核查、信息综合 |

### 3.2 Skill 组合模式

复杂任务往往需要多种技能协同工作。这就像一个项目需要多个部门配合——查代码时可能需要安全专家、性能专家和架构师同时给出意见。组合方式主要有两种：

**串行组合**：多个技能按顺序执行，就像流水线上的工序——先分析需求、再生成代码、然后审查、最后生成测试：

\`\`\`python
class SkillPipeline:
    """技能流水线"""
    
    def __init__(self, skills: List[Skill]):
        self.skills = skills
        
    def execute(self, agent, initial_input: str) -> str:
        result = initial_input
        for skill in self.skills:
            agent.active_skills = [skill]
            result = agent.process(result)
        return result

# 示例：代码开发流水线
pipeline = SkillPipeline([
    skill_registry.get("requirement-analysis"),  # 需求分析
    skill_registry.get("code-generation"),        # 代码生成
    skill_registry.get("code-review"),            # 代码审查
    skill_registry.get("test-generation"),        # 测试生成
])
\`\`\`

**并行组合**：多个技能同时应用

\`\`\`python
class ParallelSkills:
    """并行技能执行"""
    
    def __init__(self, skills: List[Skill]):
        self.skills = skills
        
    async def execute(self, agent, query: str) -> List[str]:
        import asyncio
        
        async def run_skill(skill):
            agent_copy = copy.deepcopy(agent)
            agent_copy.active_skills = [skill]
            return await asyncio.to_thread(agent_copy.process, query)
            
        tasks = [run_skill(skill) for skill in self.skills]
        results = await asyncio.gather(*tasks)
        return results

# 示例：多角度代码分析
parallel = ParallelSkills([
    skill_registry.get("security-analysis"),
    skill_registry.get("performance-analysis"),
    skill_registry.get("maintainability-analysis"),
])
\`\`\`

### 3.3 自适应 Skill 选择

\`\`\`python
class AdaptiveSkillSelector:
    """自适应技能选择器"""
    
    def __init__(self, registry: SkillRegistry, llm_client):
        self.registry = registry
        self.llm = llm_client
        
    def select_skills(self, query: str, max_skills: int = 3) -> List[Skill]:
        """使用LLM智能选择技能"""
        
        # 构建技能列表描述
        skill_descriptions = "\\n".join([
            f"- {name}: {skill.description}"
            for name, skill in self.registry.skills.items()
        ])
        
        prompt = f"""分析以下用户请求，选择最适合的技能（最多{max_skills}个）：

用户请求：{query}

可用技能：
{skill_descriptions}

以JSON格式返回选中的技能名称列表，例如：["skill1", "skill2"]
只返回JSON，不要其他内容。"""

        response = self.llm.chat(
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )
        
        import json
        try:
            selected_names = json.loads(response)
            return [self.registry.skills[name] for name in selected_names 
                    if name in self.registry.skills]
        except (json.JSONDecodeError, KeyError):
            # 降级到规则匹配
            return self.registry.find_matching_skills(query)
\`\`\`

## 4. 实践：构建专业技能

理解了原理之后，来看两个实际的 Skill 示例。第一个是金融分析技能——注意它的 instructions 里包含了完整的财务分析框架，这就是“专业知识”的具体体现。

### 4.1 金融分析技能

\`\`\`yaml
# financial_analysis.yaml
name: financial-analysis
version: "1.0.0"
description: "专业金融数据分析，包括财务报表解读、估值模型和风险评估"

triggers:
  - pattern: "分析.*财报"
  - pattern: "估值.*公司"
  - pattern: "financial.*analysis"

instructions: |
  你是一位资深金融分析师，具备CFA持证人的专业能力。
  
  ## 财务报表分析框架
  
  ### 盈利能力指标
  - 毛利率 = (营业收入 - 营业成本) / 营业收入
  - 净利率 = 净利润 / 营业收入
  - ROE = 净利润 / 平均股东权益
  - ROA = 净利润 / 平均总资产
  
  ### 偿债能力指标
  - 流动比率 = 流动资产 / 流动负债（健康值 > 2）
  - 速动比率 = (流动资产 - 存货) / 流动负债（健康值 > 1）
  - 资产负债率 = 总负债 / 总资产
  
  ### 运营效率指标
  - 存货周转率 = 营业成本 / 平均存货
  - 应收账款周转率 = 营业收入 / 平均应收账款
  - 总资产周转率 = 营业收入 / 平均总资产
  
  ### 估值指标
  - P/E = 股价 / 每股收益
  - P/B = 股价 / 每股净资产
  - EV/EBITDA = 企业价值 / 息税折旧摊销前利润
  
  ## 分析要点
  1. 纵向对比：与公司历史数据对比，识别趋势
  2. 横向对比：与同行业公司对比，评估竞争地位
  3. 杜邦分析：分解ROE，找出驱动因素
  4. 风险识别：关注异常波动和潜在风险

output_format: |
  ## 财务分析报告
  
  ### 公司概况
  {company_overview}
  
  ### 核心指标
  | 指标 | 数值 | 同比变化 | 行业对比 |
  |------|------|----------|----------|
  {metrics_table}
  
  ### 分析结论
  {analysis}
  
  ### 风险提示
  {risks}
  
  ### 投资建议
  {recommendation}
\`\`\`

### 4.2 代码重构技能

第二个示例是代码重构技能。注意它与前面 code-review 的区别：review 关注“发现问题”，而 refactoring 关注“改善结构”。这种细粒度的专业分工正是 Skills 的价值所在：

\`\`\`yaml
# code_refactoring.yaml
name: code-refactoring
version: "1.0.0"
description: "识别代码坏味道并提供重构建议"

triggers:
  - pattern: "重构"
  - pattern: "refactor"
  - pattern: "优化.*代码"

instructions: |
  你是一位精通设计模式和重构技术的架构师。
  
  ## 常见代码坏味道
  
  ### 1. 重复代码 (Duplicated Code)
  - 识别方法：相似代码块出现多次
  - 重构手法：Extract Method, Pull Up Method
  
  ### 2. 过长函数 (Long Method)
  - 识别方法：函数超过20行，包含多个职责
  - 重构手法：Extract Method, Replace Temp with Query
  
  ### 3. 过大类 (Large Class)
  - 识别方法：类承担过多职责，字段过多
  - 重构手法：Extract Class, Extract Subclass
  
  ### 4. 过长参数列表 (Long Parameter List)
  - 识别方法：方法参数超过3个
  - 重构手法：Introduce Parameter Object, Preserve Whole Object
  
  ### 5. 发散式变化 (Divergent Change)
  - 识别方法：一个类因多种原因被修改
  - 重构手法：Extract Class
  
  ### 6. 霰弹式修改 (Shotgun Surgery)
  - 识别方法：一个改动需要修改多个类
  - 重构手法：Move Method, Move Field, Inline Class
  
  ## 重构原则
  1. 小步前进：每次只做一个小改动
  2. 保持测试通过：重构前确保有测试覆盖
  3. 提交频繁：每完成一个重构就提交
  4. 不要同时重构和添加功能

tools:
  - name: analyze_complexity
    description: "分析代码复杂度"
  - name: find_duplicates
    description: "检测重复代码"
\`\`\`

## 5. Skill 生态与分发

### 5.1 Skill Hub 架构

当 Skill 越来越多时，自然需要一个“市场”来管理和分发。这就像手机应用商店——官方提供基础技能，社区贡献专业技能，企业内部有私有技能：

\`\`\`
┌────────────────────────────────────────────────────────┐
│                    Skill Hub                            │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Official     │  │ Community    │  │ Enterprise   │ │
│  │ Skills       │  │ Skills       │  │ Skills       │ │
│  │              │  │              │  │              │ │
│  │ • code-review│  │ • vue-expert │  │ • internal-  │ │
│  │ • data-      │  │ • react-     │  │   policy     │ │
│  │   analysis   │  │   patterns   │  │ • compliance │ │
│  │ • writing    │  │ • ml-ops     │  │   -check     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │              Skill Metadata Index                │  │
│  │  • 版本管理  • 依赖解析  • 安全审计  • 使用统计   │  │
│  └─────────────────────────────────────────────────┘  │
│                                                        │
└────────────────────────────────────────────────────────┘
\`\`\`

### 5.2 Skill 包管理

就像 \`pip install\` 安装 Python 包一样，Skill 也需要一个包管理器来搜索、安装和更新：

\`\`\`python
class SkillPackageManager:
    """技能包管理器"""
    
    def __init__(self, hub_url: str, local_path: str):
        self.hub_url = hub_url
        self.local_path = local_path
        self.installed: dict[str, Skill] = {}
        
    def search(self, keyword: str) -> List[dict]:
        """搜索技能"""
        import requests
        response = requests.get(
            f"{self.hub_url}/api/skills/search",
            params={"q": keyword}
        )
        return response.json()
        
    def install(self, skill_name: str, version: str = "latest"):
        """安装技能"""
        import requests
        import os
        
        # 下载技能定义
        response = requests.get(
            f"{self.hub_url}/api/skills/{skill_name}/{version}"
        )
        skill_data = response.json()
        
        # 保存到本地
        skill_path = os.path.join(self.local_path, f"{skill_name}.yaml")
        with open(skill_path, 'w', encoding='utf-8') as f:
            yaml.dump(skill_data, f, allow_unicode=True)
            
        # 加载到内存
        self.installed[skill_name] = Skill.from_yaml(skill_path)
        
        print(f"已安装技能: {skill_name}@{version}")
        
    def update(self, skill_name: str = None):
        """更新技能"""
        if skill_name:
            self.install(skill_name, "latest")
        else:
            for name in list(self.installed.keys()):
                self.install(name, "latest")
                
    def list_installed(self) -> List[str]:
        """列出已安装技能"""
        return list(self.installed.keys())
\`\`\`

## 6. Skills 与 MCP 的协同

Skills 和 MCP 是互补的两个层次——Skills 提供“脑力”（专业知识和方法论），MCP 提供“手力”（具体工具执行）。比如你请一位安全专家审查代码，Skill 提供了审查清单和专业知识，而 MCP 提供了实际读取文件和运行扫描工具的能力：

\`\`\`
用户请求: "审查这个 Python 文件的安全性"
          │
          ▼
┌─────────────────────────────────────────┐
│         Skill Layer (高层抽象)          │
│                                         │
│  code-review Skill 被激活               │
│  注入专业知识：                          │
│  • 安全审查清单                          │
│  • 常见漏洞模式                          │
│  • 风险评估标准                          │
│                                         │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         MCP Layer (底层工具)            │
│                                         │
│  Agent 调用 MCP 工具：                   │
│  • filesystem.read_file                 │
│  • static_analyzer.scan                 │
│  • security_scanner.check               │
│                                         │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         Output (结构化输出)             │
│                                         │
│  按 Skill 定义的格式输出审查报告         │
│                                         │
└─────────────────────────────────────────┘
\`\`\`

**协同实现示例**：

\`\`\`python
class SkillMCPAgent:
    """集成 Skills 和 MCP 的 Agent"""
    
    def __init__(self, llm, skill_registry, mcp_client):
        self.llm = llm
        self.skills = skill_registry
        self.mcp = mcp_client
        
    def process(self, query: str, context: dict = None):
        # 1. 选择技能
        active_skills = self.skills.find_matching_skills(query)
        
        # 2. 收集技能关联的工具
        skill_tools = []
        for skill in active_skills:
            skill_tools.extend(skill.tools)
            
        # 3. 合并 MCP 工具
        mcp_tools = self.mcp.list_tools()
        all_tools = self._merge_tools(mcp_tools, skill_tools)
        
        # 4. 构建增强提示
        system_prompt = self._build_prompt(active_skills)
        
        # 5. 执行 ReACT 循环
        return self._react_loop(system_prompt, query, all_tools)
\`\`\`

## 7. 最佳实践

### 7.1 Skill 设计原则

1. **单一领域**：每个 Skill 聚焦一个专业领域
2. **明确触发**：触发条件清晰，避免误激活
3. **指令精炼**：instructions 简洁有力，避免冗长
4. **格式规范**：提供清晰的输出格式模板
5. **版本管理**：使用语义化版本号

### 7.2 常见陷阱

| 陷阱 | 问题 | 解决方案 |
|------|------|----------|
| Skill 过载 | 一次加载过多技能，提示词过长 | 限制同时激活的技能数量 |
| 触发冲突 | 多个技能同时匹配 | 设置优先级，使用互斥组 |
| 知识过时 | Skill 中的专业知识已过期 | 建立定期更新机制 |
| 工具缺失 | Skill 引用的工具未安装 | 依赖检查和自动安装 |

回顾本节，Skills 技术是智能体从“通用助手”向“领域专家”演进的关键。它的核心价值在于将专业知识封装为可复用、可组合的能力包——就像招募专家一样，每个 Skill 都带着完整的领域经验和工作方法论。理解 Skills 与 MCP 的分工协作，是构建专业级智能体应用的重要一步。
`
    },
    {
      id: "adv-13-16-openclaw-acp",
      title: "13.16 OpenClaw 与 ACP 协议",
      file: "大模型教程/13-智能体技术/15-OpenClaw与ACP协议.md",
      difficulty: "中级-高级",
      duration: "1.5h",
      week: 0,
      phase: 0,
      keywords: ["OpenClaw", "ACP", "协议", "Code", "ChatGPT"],
      content: `# OpenClaw 与 ACP 协议

## 1. OpenClaw 概述

假设你正在用 VS Code 写代码，遇到一个棘手的重构任务。传统做法是：切到浏览器打开 ChatGPT，把代码贴过去，等回复，再手动把结果拷回编辑器——这就像打电话时还要把话筒对准收音机来"转播"，笨拙而低效。有没有可能让 AI 直接"住进"你的编辑器里，像一位坐在旁边的同事一样，看着你的屏幕、理解你的上下文、直接动手改代码？这正是 OpenClaw 想要解决的问题。

OpenClaw 是一个开源的自托管 AI Agent 框架，采用 MIT 许可证。与传统的 AI 助手不同，OpenClaw 专注于构建能够自主执行任务的智能体系统，支持与 IDE、终端、通信工具等多种客户端的无缝集成。如果把前面介绍的 MCP 协议比作"给厨师配备各种厨房工具"，那么 OpenClaw 的 ACP 协议就是"给餐厅装上一套智能点餐系统"——让顾客（开发者）和厨师（Agent）之间的沟通变得高效、标准化。

### 1.1 核心特性

| 特性 | 描述 |
|------|------|
| 自托管 | 完全运行在本地或私有服务器，数据不外泄 |
| 多 Agent 编排 | 支持调度多个专业 Agent 协同工作 |
| 工具生态 | 兼容 MCP 协议，接入海量工具 |
| IDE 集成 | 通过 ACP 协议与 VS Code、Zed 等编辑器直连 |
| Skills 支持 | 动态加载专业技能，增强领域能力 |

### 1.2 架构总览

\`\`\`mermaid
graph TD
    A[VS Code / Zed] -->|ACP协议| B[OpenClaw Gateway]
    C[Terminal CLI] -->|ACP协议| B
    D[Telegram Bot] -->|ACP协议| B
    B --> E[Session管理]
    B --> F[Agent路由]
    B --> G[Agent Runtime]
    G -->|MCP协议| H[MCP Servers]
    G --> I[Skills加载]
    G --> J[外部Agent]
\`\`\`

\`\`\`
┌────────────────────────────────────────────────────────────┐
│                    OpenClaw 系统架构                        │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   Client Layer                        │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  │  │
│  │  │ VS Code │  │   Zed   │  │Terminal │  │Telegram │  │  │
│  │  │  (ACP)  │  │  (ACP)  │  │  (CLI)  │  │  (Bot)  │  │  │
│  │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  │  │
│  └───────┼────────────┼────────────┼────────────┼───────┘  │
│          │            │            │            │          │
│          └────────────┴─────┬──────┴────────────┘          │
│                             │                              │
│  ┌──────────────────────────▼───────────────────────────┐  │
│  │                  OpenClaw Gateway                     │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐    │  │
│  │  │ Session  │  │ Router   │  │  Agent Runtime   │    │  │
│  │  │ Manager  │  │          │  │                  │    │  │
│  │  └──────────┘  └──────────┘  └──────────────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
│                             │                              │
│  ┌──────────────────────────▼───────────────────────────┐  │
│  │                   Extension Layer                     │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐    │  │
│  │  │   MCP    │  │  Skills  │  │  External Agents │    │  │
│  │  │ Servers  │  │          │  │  (Claude, GPT)   │    │  │
│  │  └──────────┘  └──────────┘  └──────────────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
└────────────────────────────────────────────────────────────┘
\`\`\`

## 2. ACP 协议详解

### 2.1 什么是 ACP

还记得十年前写代码的情景吗？每换一个编辑器，代码补全、跳转定义、错误提示等功能都要重新实现一遍，直到 LSP（Language Server Protocol）的出现——它定义了一套标准"语言"，让任何编辑器都能对接任何语言服务器。ACP 的思路如出一辙：它为 IDE 与 AI Agent 之间的通信定义了一套标准协议，这样无论你用 VS Code、Zed 还是其他编辑器，都能以统一的方式接入 AI Agent。

ACP（Agent Client Protocol）是 OpenClaw 提出的标准化通信协议，用于连接 IDE 和 AI Agent。其设计理念类似于 LSP（Language Server Protocol）：

| 协议 | 用途 | 类比 |
|------|------|------|
| LSP | 编辑器 ↔ 语言服务器 | 让编辑器获得语言智能（补全、跳转） |
| ACP | 编辑器 ↔ AI Agent | 让编辑器获得 Agent 智能（代码生成、重构） |

**核心价值**：开发者无需在 IDE 和 Agent 对话窗口之间反复切换，所有交互都在编辑器内完成。

### 2.2 ACP vs MCP vs Skills

在实际开发中，初学者经常混淆这三个概念。不妨用一家公司的运作来类比：ACP 相当于**前台接待**——负责把客户（开发者）的需求转达给公司内部；Skills 相当于**员工的专业技能**——每位员工（Agent）所掌握的行业知识和工作流程；MCP 则相当于**办公设备和外部供应商**——打印机、数据库、云服务等，是员工完成工作时需要调用的外部资源。三者处于不同层次，各司其职又协同配合：

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                       协议栈层次                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  用户层     ┌─────────────────────────────────────────┐     │
│            │              ACP 协议                    │     │
│            │   人 → Agent（自上而下的指令传递）        │     │
│            └─────────────────────────────────────────┘     │
│                              │                              │
│  能力层     ┌─────────────────▼─────────────────────┐       │
│            │            Skills 技术                 │       │
│            │   Agent 内部（专业知识与工作流）        │       │
│            └─────────────────────────────────────────┘     │
│                              │                              │
│  工具层     ┌─────────────────▼─────────────────────┐       │
│            │             MCP 协议                   │       │
│            │   Agent → 工具（自内而外的能力扩展）    │       │
│            └─────────────────────────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
\`\`\`

| 维度 | ACP | MCP | Skills |
|------|-----|-----|--------|
| 解决问题 | IDE 如何与 Agent 对话 | Agent 如何调用外部工具 | Agent 如何获取专业能力 |
| 通信方向 | 人 → Agent | Agent → 工具 | Agent 内部 |
| 协议格式 | JSON-RPC over stdio | JSON-RPC over stdio/SSE | Markdown 指令 |
| 典型实现 | VS Code 扩展 | 文件系统、数据库工具 | 代码审查技能 |

\`\`\`mermaid
graph TD
    subgraph 用户层
        A[ACP协议<br>人 → Agent]
    end
    subgraph 能力层
        B[Skills技术<br>Agent内部知识与流程]
    end
    subgraph 工具层
        C[MCP协议<br>Agent → 外部工具]
    end
    A -->|指令下发| B
    B -->|能力调用| C
\`\`\`

### 2.3 ACP 通信架构

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                     ACP 通信链路                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐     stdio      ┌──────────────────┐      │
│  │   VS Code    │ ←────────────→ │  openclaw acp    │      │
│  │              │    JSON-RPC    │  (Bridge CLI)    │      │
│  │ ┌──────────┐ │                │                  │      │
│  │ │ Agent    │ │                │ 功能：           │      │
│  │ │ Panel    │ │                │ • stdio↔WS 转换  │      │
│  │ └──────────┘ │                │ • 认证管理       │      │
│  └──────────────┘                │ • 消息路由       │      │
│                                  └────────┬─────────┘      │
│                                           │                 │
│                                           │ WebSocket       │
│                                           │                 │
│                                           ▼                 │
│                                  ┌──────────────────┐      │
│                                  │ OpenClaw Gateway │      │
│                                  │                  │      │
│                                  │ ┌──────────────┐ │      │
│                                  │ │Agent Runtime │ │      │
│                                  │ └──────────────┘ │      │
│                                  └──────────────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
\`\`\`

\`\`\`mermaid
sequenceDiagram
    participant IDE as VS Code (ACP Client)
    participant Bridge as ACP Bridge (CLI)
    participant GW as OpenClaw Gateway
    participant Agent as Agent Runtime

    IDE->>Bridge: stdio / JSON-RPC 请求
    Bridge->>GW: WebSocket 转发
    GW->>Agent: 调用Agent处理
    Agent-->>GW: 生成结果
    GW-->>Bridge: 流式响应
    Bridge-->>IDE: stdio 返回结果
    IDE->>IDE: 显示响应 / 应用代码修改
\`\`\`

**关键组件**：

这就像寄一封国际快递：IDE 是寄件人（写好包裹内容），Bridge 是物流中转站（把包裹从本地格式转换成国际运输格式），Gateway 是收件方的总部（拆包、处理、回信）。

1. **IDE (ACP Client)**：发送 prompt、显示响应、提供编辑器上下文
2. **ACP Bridge (CLI)**：协议翻译器，将 stdio 消息转为 WebSocket——之所以需要这个中间层，是因为 VS Code 扩展进程只能通过 stdio 与子进程通信，而 Gateway 使用的是 WebSocket
3. **OpenClaw Gateway (ACP Server)**：接收请求、调用 Agent、返回结果

### 2.4 ACP 消息格式

ACP 使用 JSON-RPC 2.0 协议：

\`\`\`json
// 请求：发送 prompt
{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "agent/prompt",
    "params": {
        "prompt": "重构这个函数，提取公共逻辑",
        "context": {
            "file": "/src/utils.py",
            "selection": {
                "start": {"line": 10, "character": 0},
                "end": {"line": 25, "character": 0}
            },
            "content": "def process_data(data):\\n    ..."
        }
    }
}

// 响应：流式返回
{
    "jsonrpc": "2.0",
    "id": 1,
    "result": {
        "type": "stream",
        "content": "我来帮你重构这个函数...",
        "actions": [
            {
                "type": "edit",
                "file": "/src/utils.py",
                "changes": [...]
            }
        ]
    }
}
\`\`\`

## 3. ACP 运行模式

### 3.1 Bridge 模式

想象一下同声传译的场景：发言者说中文，翻译员实时转成英文给听众。Bridge 模式正是这种"同声传译"架构——IDE 说的是 stdio/JSON-RPC，Gateway 听的是 WebSocket，Bridge CLI 在中间做实时翻译。这是最常用的标准模式：

\`\`\`python
# 配置示例：VS Code settings.json
{
    "openclaw.acp.mode": "bridge",
    "openclaw.acp.gatewayUrl": "ws://localhost:8080",
    "openclaw.acp.apiKey": "your-api-key"
}
\`\`\`

**工作流程**：

\`\`\`
1. VS Code 启动 ACP Bridge 子进程
2. 用户在编辑器中选择代码，输入指令
3. VS Code 通过 stdio 发送 JSON-RPC 请求给 Bridge
4. Bridge 转换为 WebSocket 消息，发送给 Gateway
5. Gateway 调用 Agent 处理请求
6. 响应流式返回，Bridge 转发给 VS Code
7. VS Code 显示响应，可自动应用代码修改
\`\`\`

### 3.2 Client 模式

如果你更喜欢在终端工作，或者想在 CI/CD 流水线中调用 Agent，可以使用 Client 模式。这就像绕过翻译员，直接用对方的语言交谈——ACP CLI 不再做协议转换，而是直接作为 Agent 客户端与 Gateway 通信：

\`\`\`bash
# 启动交互式会话
openclaw acp --mode client --gateway ws://localhost:8080

# 单次调用
openclaw acp prompt "生成一个 FastAPI 的用户认证模块"
\`\`\`

## 4. 实现 ACP Client

了解了协议原理后，让我们动手实现一个简易的 ACP 客户端。回到前面"同声传译"的比喻——我们现在要写的就是"发言者"这一端的逻辑：如何组织要说的话（构造 JSON-RPC 请求）、如何发出声音（通过 stdio 写入）、如何听取回译（读取响应）。

### 4.1 基础客户端

\`\`\`python
import subprocess
import json
import threading
from typing import Callable, Optional
from dataclasses import dataclass

@dataclass
class EditorContext:
    """编辑器上下文"""
    file: str
    selection_start: tuple  # (line, character)
    selection_end: tuple
    content: str
    workspace: Optional[str] = None

class ACPClient:
    """ACP 客户端实现"""
    
    def __init__(self, bridge_command: list):
        self.process = subprocess.Popen(
            bridge_command,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        self.request_id = 0
        self.callbacks = {}
        self._start_reader()
        
    def _start_reader(self):
        """启动响应读取线程"""
        def reader():
            while True:
                line = self.process.stdout.readline()
                if not line:
                    break
                try:
                    response = json.loads(line)
                    self._handle_response(response)
                except json.JSONDecodeError:
                    pass
                    
        thread = threading.Thread(target=reader, daemon=True)
        thread.start()
        
    def _handle_response(self, response: dict):
        """处理响应"""
        req_id = response.get("id")
        if req_id in self.callbacks:
            callback = self.callbacks.pop(req_id)
            callback(response.get("result"), response.get("error"))
            
    def send_prompt(
        self,
        prompt: str,
        context: Optional[EditorContext] = None,
        callback: Optional[Callable] = None
    ):
        """发送 prompt 到 Agent"""
        self.request_id += 1
        
        params = {"prompt": prompt}
        if context:
            params["context"] = {
                "file": context.file,
                "selection": {
                    "start": {"line": context.selection_start[0], 
                             "character": context.selection_start[1]},
                    "end": {"line": context.selection_end[0], 
                           "character": context.selection_end[1]}
                },
                "content": context.content,
                "workspace": context.workspace
            }
            
        request = {
            "jsonrpc": "2.0",
            "id": self.request_id,
            "method": "agent/prompt",
            "params": params
        }
        
        if callback:
            self.callbacks[self.request_id] = callback
            
        self._send(request)
        return self.request_id
        
    def _send(self, request: dict):
        """发送请求"""
        self.process.stdin.write(json.dumps(request) + "\\n")
        self.process.stdin.flush()
        
    def list_agents(self) -> list:
        """列出可用 Agent"""
        self.request_id += 1
        request = {
            "jsonrpc": "2.0",
            "id": self.request_id,
            "method": "agent/list",
            "params": {}
        }
        self._send(request)
        # 同步等待响应（简化实现）
        line = self.process.stdout.readline()
        response = json.loads(line)
        return response.get("result", {}).get("agents", [])
        
    def close(self):
        """关闭客户端"""
        self.process.terminate()
\`\`\`

### 4.2 VS Code 扩展集成

\`\`\`typescript
// extension.ts
import * as vscode from 'vscode';
import { spawn, ChildProcess } from 'child_process';

class ACPExtension {
    private bridge: ChildProcess | null = null;
    private requestId = 0;
    private pendingRequests = new Map<number, (result: any) => void>();

    activate(context: vscode.ExtensionContext) {
        // Register command
        const command = vscode.commands.registerCommand(
            'openclaw.sendPrompt',
            () => this.sendPrompt()
        );
        context.subscriptions.push(command);

        // Start bridge
        this.startBridge();
    }

    private startBridge() {
        const config = vscode.workspace.getConfiguration('openclaw');
        const gatewayUrl = config.get<string>('gatewayUrl', 'ws://localhost:8080');

        this.bridge = spawn('openclaw', ['acp', '--gateway', gatewayUrl], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        this.bridge.stdout?.on('data', (data) => {
            const lines = data.toString().split('\\n');
            for (const line of lines) {
                if (line.trim()) {
                    this.handleResponse(JSON.parse(line));
                }
            }
        });
    }

    private async sendPrompt() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        // Get user input
        const prompt = await vscode.window.showInputBox({
            prompt: 'Enter your instruction for the AI agent'
        });
        if (!prompt) return;

        // Build context
        const selection = editor.selection;
        const context = {
            file: editor.document.uri.fsPath,
            selection: {
                start: { line: selection.start.line, character: selection.start.character },
                end: { line: selection.end.line, character: selection.end.character }
            },
            content: editor.document.getText(selection)
        };

        // Send request
        this.requestId++;
        const request = {
            jsonrpc: '2.0',
            id: this.requestId,
            method: 'agent/prompt',
            params: { prompt, context }
        };

        this.bridge?.stdin?.write(JSON.stringify(request) + '\\n');

        // Show progress
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'OpenClaw is thinking...'
        }, () => {
            return new Promise<void>((resolve) => {
                this.pendingRequests.set(this.requestId, (result) => {
                    this.applyResult(result);
                    resolve();
                });
            });
        });
    }

    private handleResponse(response: any) {
        const callback = this.pendingRequests.get(response.id);
        if (callback) {
            this.pendingRequests.delete(response.id);
            callback(response.result);
        }
    }

    private applyResult(result: any) {
        // Apply code edits
        if (result.actions) {
            for (const action of result.actions) {
                if (action.type === 'edit') {
                    this.applyEdit(action);
                }
            }
        }

        // Show response in panel
        if (result.content) {
            vscode.window.showInformationMessage(result.content);
        }
    }

    private async applyEdit(action: any) {
        const uri = vscode.Uri.file(action.file);
        const document = await vscode.workspace.openTextDocument(uri);
        const edit = new vscode.WorkspaceEdit();

        for (const change of action.changes) {
            const range = new vscode.Range(
                change.range.start.line,
                change.range.start.character,
                change.range.end.line,
                change.range.end.character
            );
            edit.replace(uri, range, change.newText);
        }

        await vscode.workspace.applyEdit(edit);
    }
}
\`\`\`

## 5. OpenClaw Gateway 实现

如果说 ACP Client 是"发言者"，那么 Gateway 就是整个"会议中心的主控室"——它负责接待来自各个方向的连接、分配会议室（Session）、安排专家（Agent）来回答问题。下面我们来看它的实现。

### 5.1 Gateway 核心

\`\`\`python
import asyncio
import json
from typing import Dict, Optional
from dataclasses import dataclass, field
import websockets

@dataclass
class Session:
    """会话管理"""
    session_id: str
    agent_id: str
    workspace: Optional[str] = None
    history: list = field(default_factory=list)

class OpenClawGateway:
    """OpenClaw Gateway 服务端"""
    
    def __init__(self, host: str = "localhost", port: int = 8080):
        self.host = host
        self.port = port
        self.sessions: Dict[str, Session] = {}
        self.agents: Dict[str, 'Agent'] = {}
        
    async def start(self):
        """启动 Gateway 服务"""
        async with websockets.serve(self.handle_connection, self.host, self.port):
            print(f"OpenClaw Gateway running at ws://{self.host}:{self.port}")
            await asyncio.Future()  # Run forever
            
    async def handle_connection(self, websocket, path):
        """处理 WebSocket 连接"""
        session_id = None
        
        try:
            async for message in websocket:
                request = json.loads(message)
                response = await self.handle_request(request, websocket)
                await websocket.send(json.dumps(response))
                
        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            if session_id and session_id in self.sessions:
                del self.sessions[session_id]
                
    async def handle_request(self, request: dict, websocket) -> dict:
        """处理 JSON-RPC 请求"""
        method = request.get("method")
        params = request.get("params", {})
        req_id = request.get("id")
        
        try:
            if method == "agent/prompt":
                result = await self.handle_prompt(params, websocket)
            elif method == "agent/list":
                result = self.handle_list_agents()
            elif method == "session/create":
                result = self.handle_create_session(params)
            else:
                return self._error_response(req_id, -32601, f"Method not found: {method}")
                
            return {"jsonrpc": "2.0", "id": req_id, "result": result}
            
        except Exception as e:
            return self._error_response(req_id, -32000, str(e))
            
    async def handle_prompt(self, params: dict, websocket) -> dict:
        """处理 prompt 请求"""
        prompt = params.get("prompt")
        context = params.get("context")
        session_id = params.get("session_id")
        
        # Get or create session
        if session_id and session_id in self.sessions:
            session = self.sessions[session_id]
        else:
            session = Session(
                session_id=self._generate_session_id(),
                agent_id="default"
            )
            self.sessions[session.session_id] = session
            
        # Get agent
        agent = self.agents.get(session.agent_id)
        if not agent:
            agent = self._create_default_agent()
            self.agents[session.agent_id] = agent
            
        # Execute agent
        result = await agent.execute(prompt, context, session.history)
        
        # Update history
        session.history.append({"role": "user", "content": prompt})
        session.history.append({"role": "assistant", "content": result["content"]})
        
        return result
        
    def handle_list_agents(self) -> dict:
        """列出可用 Agent"""
        return {
            "agents": [
                {"id": "default", "name": "Default Agent", "description": "通用代码助手"},
                {"id": "code-review", "name": "Code Review Agent", "description": "专业代码审查"},
                {"id": "refactor", "name": "Refactor Agent", "description": "代码重构专家"}
            ]
        }
        
    def _generate_session_id(self) -> str:
        import uuid
        return str(uuid.uuid4())
        
    def _create_default_agent(self) -> 'Agent':
        from .agent import CodeAgent
        return CodeAgent()
        
    def _error_response(self, req_id, code: int, message: str) -> dict:
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "error": {"code": code, "message": message}
        }
\`\`\`

### 5.2 Agent 执行器

\`\`\`python
class Agent:
    """Agent 基类"""
    
    def __init__(self, llm_client, tools=None, skills=None):
        self.llm = llm_client
        self.tools = tools or []
        self.skills = skills or []
        
    async def execute(self, prompt: str, context: dict, history: list) -> dict:
        """执行 Agent 任务"""
        raise NotImplementedError


class CodeAgent(Agent):
    """代码 Agent 实现"""
    
    SYSTEM_PROMPT = """你是一个专业的编程助手，运行在 OpenClaw 系统中。
    
你的能力：
1. 理解用户的代码修改需求
2. 分析提供的代码上下文
3. 生成高质量的代码修改建议
4. 解释代码逻辑和最佳实践

输出格式：
- 先简要说明你的理解和方案
- 如果需要修改代码，以 JSON 格式提供 actions

修改代码时使用以下格式：
\`\`\`json
{
    "actions": [
        {
            "type": "edit",
            "file": "文件路径",
            "changes": [
                {
                    "range": {
                        "start": {"line": 起始行, "character": 起始列},
                        "end": {"line": 结束行, "character": 结束列}
                    },
                    "newText": "新的代码内容"
                }
            ]
        }
    ]
}
\`\`\`"""

    async def execute(self, prompt: str, context: dict, history: list) -> dict:
        """执行代码任务"""
        
        # Build messages
        messages = [{"role": "system", "content": self.SYSTEM_PROMPT}]
        messages.extend(history[-10:])  # Keep last 10 turns
        
        # Add context
        user_message = prompt
        if context:
            user_message = f"""用户请求：{prompt}

上下文信息：
- 文件：{context.get('file', 'unknown')}
- 选中代码：
\`\`\`
{context.get('content', '')}
\`\`\`"""
        
        messages.append({"role": "user", "content": user_message})
        
        # Call LLM
        response = await self.llm.chat_async(messages=messages)
        content = response["content"]
        
        # Parse actions
        actions = self._parse_actions(content)
        
        return {
            "content": content,
            "actions": actions
        }
        
    def _parse_actions(self, content: str) -> list:
        """从响应中解析 actions"""
        import re
        
        # Find JSON block
        json_pattern = r'\`\`\`json\\s*(\\{.*?\\})\\s*\`\`\`'
        match = re.search(json_pattern, content, re.DOTALL)
        
        if match:
            try:
                data = json.loads(match.group(1))
                return data.get("actions", [])
            except json.JSONDecodeError:
                pass
                
        return []
\`\`\`

## 6. 多 Agent 协作

在第五节的多智能体体系中，我们探讨了"项目团队"式的多 Agent 架构。OpenClaw 在工程层面将这一理念落地：Gateway 不只对接一个 Agent，而是管理一整个"专家团队"——有人擅长写代码，有人擅长审查代码，有人擅长写文档。关键问题是：当用户提出一个请求时，应该把它分配给谁？这就是 Agent 路由要解决的。

### 6.1 Agent 路由

\`\`\`python
class AgentRouter:
    """Agent 路由器：根据任务类型选择合适的 Agent"""
    
    def __init__(self, agents: Dict[str, Agent]):
        self.agents = agents
        self.classifier = TaskClassifier()
        
    async def route(self, prompt: str, context: dict) -> Agent:
        """路由到合适的 Agent"""
        
        # Classify task
        task_type = await self.classifier.classify(prompt, context)
        
        # Route mapping
        route_map = {
            "code_generation": "coder",
            "code_review": "reviewer",
            "refactoring": "refactor",
            "debugging": "debugger",
            "documentation": "doc_writer",
            "general": "default"
        }
        
        agent_id = route_map.get(task_type, "default")
        return self.agents.get(agent_id, self.agents["default"])


class TaskClassifier:
    """任务分类器"""
    
    PATTERNS = {
        "code_generation": ["生成", "创建", "编写", "实现", "generate", "create", "write"],
        "code_review": ["审查", "检查", "review", "check", "分析"],
        "refactoring": ["重构", "优化", "refactor", "optimize", "改进"],
        "debugging": ["调试", "修复", "debug", "fix", "错误", "bug"],
        "documentation": ["文档", "注释", "说明", "document", "comment"]
    }
    
    async def classify(self, prompt: str, context: dict) -> str:
        """分类任务类型"""
        prompt_lower = prompt.lower()
        
        for task_type, patterns in self.PATTERNS.items():
            if any(p in prompt_lower for p in patterns):
                return task_type
                
        return "general"
\`\`\`

### 6.2 Agent 协作流水线

举个例子：在实际项目中，一段代码从编写到上线通常要经过"开发→代码审查→测试"三个环节。OpenClaw 的 Pipeline 机制正是模拟了这个流程——多个 Agent 串联成流水线，前一个的输出自动成为后一个的输入，就像工厂的装配线一样。

\`\`\`python
class AgentPipeline:
    """Agent 协作流水线"""
    
    def __init__(self, stages: list):
        """
        stages: List of (agent, transform_fn) tuples
        transform_fn transforms previous result to next input
        """
        self.stages = stages
        
    async def execute(self, initial_prompt: str, context: dict) -> dict:
        """执行流水线"""
        current_input = {"prompt": initial_prompt, "context": context}
        results = []
        
        for agent, transform_fn in self.stages:
            # Execute stage
            result = await agent.execute(
                current_input["prompt"],
                current_input.get("context"),
                []
            )
            results.append(result)
            
            # Transform for next stage
            if transform_fn:
                current_input = transform_fn(result, context)
                
        # Aggregate results
        return self._aggregate_results(results)
        
    def _aggregate_results(self, results: list) -> dict:
        """聚合流水线结果"""
        all_actions = []
        all_content = []
        
        for result in results:
            if result.get("content"):
                all_content.append(result["content"])
            if result.get("actions"):
                all_actions.extend(result["actions"])
                
        return {
            "content": "\\n\\n---\\n\\n".join(all_content),
            "actions": all_actions
        }


# 使用示例：代码生成 → 审查 → 测试生成 流水线
async def create_code_pipeline(agents):
    pipeline = AgentPipeline([
        (agents["coder"], None),
        (agents["reviewer"], lambda r, c: {
            "prompt": f"审查以下代码：\\n{r['content']}",
            "context": c
        }),
        (agents["tester"], lambda r, c: {
            "prompt": f"为以下代码生成测试：\\n{c.get('content', '')}",
            "context": c
        })
    ])
    return pipeline
\`\`\`

## 7. 配置与部署

理论和代码都看过了，最后来看如何在真实环境中把 OpenClaw 跑起来。这部分就像拿到一台新电脑后的"开箱设置"——配置网络、设置密码、安装应用。

### 7.1 Gateway 配置

\`\`\`yaml
# gateway.yaml
server:
  host: "0.0.0.0"
  port: 8080
  ssl:
    enabled: false
    cert_path: "/path/to/cert.pem"
    key_path: "/path/to/key.pem"

auth:
  enabled: true
  api_keys:
    - "key-1-xxx"
    - "key-2-xxx"

agents:
  default:
    type: "code"
    llm:
      provider: "openai"
      model: "gpt-4"
      api_key: "\${OPENAI_API_KEY}"
    tools:
      - "filesystem"
      - "terminal"
    skills:
      - "code-review"
      - "refactoring"

  reviewer:
    type: "code"
    llm:
      provider: "anthropic"
      model: "claude-3-opus"
      api_key: "\${ANTHROPIC_API_KEY}"
    skills:
      - "code-review"

mcp:
  servers:
    - name: "filesystem"
      command: ["npx", "-y", "@anthropic-ai/mcp-server-filesystem"]
      args: ["/workspace"]
    - name: "github"
      command: ["npx", "-y", "@anthropic-ai/mcp-server-github"]

limits:
  max_sessions: 100
  session_timeout: 3600
  max_tokens_per_request: 8000
\`\`\`

### 7.2 VS Code 配置

\`\`\`json
// .vscode/settings.json
{
    "openclaw.enabled": true,
    "openclaw.acp.gatewayUrl": "ws://localhost:8080",
    "openclaw.acp.apiKey": "your-api-key",
    "openclaw.autoApplyEdits": false,
    "openclaw.showInlineHints": true,
    "openclaw.defaultAgent": "default"
}
\`\`\`

## 8. 最佳实践

### 8.1 安全注意事项

| 风险 | 防护措施 |
|------|----------|
| API Key 泄露 | 使用环境变量，不硬编码 |
| 代码注入 | 沙箱执行 Agent 生成的代码 |
| 会话劫持 | 使用 TLS 加密，会话 Token 验证 |
| 资源耗尽 | 设置请求限流和 Token 限制 |

### 8.2 性能优化

1. **连接复用**：保持 WebSocket 长连接，避免频繁握手
2. **流式响应**：使用 SSE 或 WebSocket 流式传输，提升用户体验
3. **缓存热点**：缓存常用 Skill 和工具配置
4. **异步执行**：工具调用使用异步 IO

### 8.3 调试技巧

\`\`\`bash
# 启用详细日志
openclaw acp --gateway ws://localhost:8080 --verbose

# 检查连接状态
openclaw acp status

# 测试工具可用性
openclaw acp test-tool filesystem.read_file --args '{"path": "/tmp/test.txt"}'
\`\`\`

回顾本节的核心思路：从最初"在浏览器和编辑器之间来回拷贝"的痛点出发，我们看到 ACP 协议如何像 LSP 当年统一编辑器与语言服务器的通信一样，为 IDE 与 AI Agent 之间架起了标准化的桥梁。OpenClaw 则在 ACP 之上构建了完整的 Agent 运行时——Session 管理、多 Agent 路由、流水线协作——使得"AI 直接住进编辑器"成为现实。结合前面章节介绍的 MCP（工具扩展）和 Skills（专业能力），ACP 补齐了"人→Agent"这最后一环的通信标准。可以说，ACP + Skills + MCP 三层协议栈的成型，标志着 AI Agent 开发工具链正在从"各自为战"走向"标准化协作"的新阶段。
`
    },
    {
      id: "adv-13-17-harness-engineering",
      title: "13.17 Harness Engineering",
      file: "大模型教程/13-智能体技术/16-Harness-Engineering.md",
      difficulty: "中级-高级",
      duration: "1h",
      week: 0,
      phase: 0,
      keywords: ["Harness", "Engineering", "Agent", "Model"],
      content: `# Harness Engineering

一辆 F1 赛车的引擎再强劲，没有空气动力学套件、悬挂系统和进站团队的配合，也赢不了比赛。真正决定圈速的是围绕引擎构建的整套系统。AI 智能体同理——大语言模型是引擎，围绕它构建的工具链、约束条件、反馈回路和基础设施构成了 **Harness**（驾驭系统）：

$$Agent = Model + Harness$$

Terminal-Bench 2.0 的基准测试表明：仅改变 Harness 质量，同一模型的排名可偏移超过 25 个位次。配备精良 Harness 的中等模型，完全可以击败 Harness 粗糙的顶级模型。

Harness Engineering 就是设计这套驾驭系统的工程学科——构建模型之外的一切，使智能体从"偶尔能用"变为"持续可靠"。

## 从 Prompt Engineering 到 Harness Engineering

过去几年，Prompt Engineering 是与大模型交互的核心技能，关注的是**如何更好地措辞指令**。但当智能体需要自主完成跨越数十步的复杂任务时，仅靠文本指令的精雕细琢远远不够。

| 维度 | Prompt Engineering | Harness Engineering |
|------|-------------------|---------------------|
| 核心问题 | 如何措辞指令？ | 如何构建可靠系统？ |
| 作用范围 | 单次推理 | 完整任务生命周期 |
| 控制手段 | 文本指令 | 工具 + 约束 + 反馈回路 + 基础设施 |
| 失败模式 | 模型误解意图 | 系统缺乏纠错机制 |
| 可复现性 | 依赖模型一致性 | 依赖工程化保障 |
| 类比 | 给员工写邮件 | 构建整套项目管理体系 |

Prompt Engineering 并未过时，它是 Harness 的组成部分之一（System Prompt 组件）。但当任务从单次问答升级到多步骤自主执行时，失败模式发生了质变：单次推理的失败是"模型不理解意图"，多步骤任务的失败则是"系统缺乏纠错机制"——智能体在第 3 步犯的小错误，到第 15 步可能已导致整个任务偏离轨道。Prompt Engineering 无法解决这种系统性问题。

## Harness 的核心组件

一个完整的 Harness 包含七个层次的组件，它们协同工作，共同约束和增强智能体的行为。

### 1. System Prompts — 核心指令层

系统提示定义了智能体的身份、能力边界和行为约束。它不是简单的任务描述，而是一套完整的行为宪法：

\`\`\`
你是一个代码重构助手。
约束条件：
- 不得修改公共 API 接口签名
- 每次变更必须保持现有测试通过
- 单次提交不超过 200 行变更
\`\`\`

### 2. Tools and Capabilities — 能力接口层

通过 MCP 服务器、Functions、Skills 等机制暴露给智能体的操作能力。工具的选择和设计直接影响智能体的行为空间——提供文件读写工具，智能体就能操作代码；提供浏览器工具，它就能采集网页信息。

工具设计中存在多方对齐问题——LLM、MCP Server、业务设计者和最终用户四方中任何一方的信息缺失都会导致调用失败。由此衍生出几条工具描述的优化原则：

- **命名即功能（Affordance）**：工具名称应自解释，\`calculate_quarterly_tax\` 优于 \`process_data\`
- **参数描述必须精确**：不要写"输入一个 ID"，而是写"员工六位数字工号，如 '028451'"
- **错误信息应包含修复路径**：不返回 \`invalid input\`，而返回 \`employee_id must be 6 digits, got 3 — did you omit the leading zeros?\`
- **Schema 中嵌入示例值**：让 LLM 从示例中推断格式，而非依赖纯文字描述

工具数量的控制同样关键。多个团队的实践表明，大幅精简工具数量后任务完成率反而提升——工具不是越多越好，而是越精准越好。

### 3. Infrastructure — 基础设施层

沙箱环境、文件系统、代码执行引擎、浏览器实例——这些是智能体实际运行的物理（或虚拟）环境。智能体需要的不仅是"运行测试"的指令，更需要一个隔离的容器环境来安全执行代码。

### 4. Orchestration Logic — 编排逻辑层

子智能体的生成、任务分发、模型路由和交接协议。当一个复杂任务需要分解时，编排层决定哪个子模块处理哪个子任务，以及它们之间如何传递上下文。

### 5. Hooks and Middleware — 确定性控制层

这是 Harness 中最容易被忽略但最具杠杆效应的组件。Hooks 在智能体的推理循环中插入确定性的检查点——上下文压缩、格式校验、敏感信息过滤。它们不依赖模型的判断力，而是通过硬编码逻辑强制执行规则。

在生产环境中，Hook 的应用通常落入四种模式：

**安全门控（PreToolUse）**——在工具执行前拦截危险操作，如 \`rm -rf\` 或 \`DROP TABLE\`。这是生产环境的必需品。

**质量回路（PostToolUse）**——在工具执行后自动触发质量检查。当智能体写入文件后，Hook 自动运行 Linter，将诊断结果注入上下文作为反馈信号，智能体在下一步自行修正。这形成了一个紧凑的自纠错闭环：

\`\`\`python
# PostToolUse Hook 示例：文件写入后自动触发 Lint 检查
def post_file_write_hook(event):
    if event.tool == "file_write" and event.path.endswith(".py"):
        diagnostics = run_ruff(event.path)
        if diagnostics:
            # 将诊断结果注入上下文，智能体下一步会看到并修复
            return {"feedback": format_diagnostics(diagnostics)}
    return None
\`\`\`

**完成门控（Stop）**——当智能体宣称任务完成时，在真正结束前运行完整测试套件。测试未通过则阻止任务结束，将失败信息返回给智能体继续修复。

**可观测性（All Events）**——将智能体的每一步意图和结果流式传输到监控系统。这不直接影响智能体行为，但为事后诊断和 Harness 迭代提供了数据基础。

### 6. Memory and State Management — 状态管理层

进度文件、Git 版本记录、知识库检索——这些机制让智能体在长任务中保持连贯性。没有状态管理的智能体就像一个每隔五分钟就失忆的工作者。

### 7. Verification Systems — 验证系统层

测试套件、类型检查器、Linter、代码审查智能体——它们构成了质量保障的最后防线。

\`\`\`mermaid
graph TD
    A[System Prompts] --> C[Agent Core]
    B[Tools & Capabilities] --> C
    D[Infrastructure] --> C
    E[Orchestration Logic] --> C
    F[Hooks & Middleware] --> C
    G[Memory & State] --> C
    H[Verification Systems] --> C
    C --> I[Agent Output]
    H -->|反馈| C
    I -->|验证| H
\`\`\`

这七个组件并非独立运作。验证系统的结果会触发 Hooks 的干预，Memory 会影响 System Prompt 的动态组装，Orchestration 决定何时调用哪些 Tools。它们形成一个有机的整体。

## 前馈与反馈：两种控制机制

Thoughtworks 的研究提出了一个精辟的分类框架：Harness 中的所有控制手段可以归为两类——**前馈控制（Guides）** 和 **反馈控制（Sensors）**。

### 前馈控制：预防胜于治疗

前馈控制在智能体行动之前提供指导，目的是从源头减少错误发生的概率。它们是“路标”和“护栏”：

- **AGENTS.md 文件**：项目级的智能体行为规范
- **架构文档**：系统设计约束和依赖关系
- **编码规范**：命名约定、目录结构、模式要求
- **Skills 注入**：领域专业知识的按需加载

前馈控制的形式可以很简单。一个典型的项目级 AGENTS.md 可能只包含十几条规则：

\`\`\`
# 行为约束
- 不得直接修改 /db/migrations/ 目录下的文件
- 所有 API 端点必须通过 /middleware/auth.py 进行鉴权
- 单次提交不超过 200 行变更
- 新增的公共函数必须附带单元测试
- 使用 snake_case 命名，禁止 camelCase
\`\`\`

每一条规则的价值在于它消除了一类潜在错误，且对所有未来会话生效。

### 反馈控制：观察并自我修正

反馈控制在智能体行动之后检测结果，提供纠偏信号：

- **Linter 和类型检查**：即时的语法和类型错误反馈
- **测试套件**：功能正确性验证
- **代码审查智能体**：语义层面的质量评估
- **浏览器截图**：UI 渲染结果的视觉验证

反馈控制的关键不仅在于检测错误，更在于反馈信号的质量。一条“测试失败”的信息远不如“测试 test_user_login 失败：期望 HTTP 200 但收到 401，检查 auth middleware 是否正确配置”。前者只告诉智能体“错了”，后者告诉它“错在哪里、可能怎么修”。这就是前文提到的 Sensor + Guide 组合模式。

### 为什么两者缺一不可？

仅有反馈控制的系统容易陷入无限循环——犯错、检测、修复、引入新错，缺乏修复方向。仅有前馈控制的系统则无法验证自己是否做对了。实践中，两类控制的配比需根据任务类型调整：编译型语言（Rust、Go）的反馈控制天然强大（编译器本身就是强力 Sensor）；动态语言（Python、JavaScript）缺少编译阶段反馈，前馈控制就更加重要。

\`\`\`mermaid
graph LR
    subgraph 前馈控制
    A[AGENTS.md] --> D[Agent 决策]
    B[架构文档] --> D
    C[Skills 知识] --> D
    end
    
    D --> E[执行动作]
    E --> F[产出结果]
    
    subgraph 反馈控制
    F --> G[Linter 检查]
    F --> H[测试验证]
    F --> I[审查评估]
    end
    
    G -->|错误信号| D
    H -->|失败信号| D
    I -->|修改建议| D
\`\`\`

### 计算性 vs 推理性

反馈控制内部还存在一个重要区分：

| 类型 | 机制 | 速度 | 可靠性 | 示例 |
|------|------|------|--------|------|
| 计算性（Computational） | 确定性规则 | 毫秒级 | 100% 一致 | 类型检查、Linter、单元测试 |
| 推理性（Inferential） | AI 判断 | 秒级 | 非确定性 | 代码审查 Agent、语义分析 |

最佳实践是优先部署计算性反馈（快速、可靠），将推理性反馈作为补充层处理那些规则无法覆盖的语义问题。

## 上下文工程与渐进式披露

智能体的上下文窗口是有限且珍贵的资源。近年来这个领域已发展出自己的名称——Context Engineering（上下文工程），它与 Harness Engineering 高度重叠。

### 渐进式披露（Progressive Disclosure）

核心原则：**不要一次性加载所有内容**。信息应按需逐层展开，分为三级：

1. **第一层：索引层**——项目结构、模块职责、入口点地图（始终在上下文中）
2. **第二层：接口层**——当智能体决定操作某个模块时，加载该模块的公共 API、类型定义和约束条件
3. **第三层：实现层**——只有在需要修改具体文件时，才加载文件内容

这种分层策略可将初始上下文消耗从数万 token 压缩到几千 token。

### 上下文管理的反模式

**上下文腐烂（Context Rot）**——将所有规范、约束、历史记录堆进一个庞大的系统提示。随着内容膨胀，早期规则会被模型"遗忘"。某团队的系统提示从 500 token 膨胀到 8000 token 后，智能体开始系统性地忽略最早写入的安全约束。

**描述膨胀（Description Bloat）**——注册过多工具，每个工具描述消耗大量 token。40 个工具的 JSON Schema 可能消耗 3000—5000 token，且模型选择正确工具的准确率会急剧下降。

### 解决方案：目录式索引

\`\`\`python
# 好的做法：精炼的顶层索引
PROJECT_INDEX = """
## 项目结构
- /src/auth/ — 认证模块（JWT + OAuth2）
- /src/api/ — REST API 路由定义
- /src/models/ — 数据模型层
- /src/services/ — 业务逻辑服务

## 关键约定
- 所有 API 返回统一 ResponseWrapper 格式
- 数据库操作通过 Repository 模式
- 详细规范见 /docs/conventions.md
"""

# 不好的做法：将所有文件内容拼接
FULL_CODEBASE = open("all_files.txt").read()  # 可能 50000+ tokens
\`\`\`

目录式索引让智能体知道"去哪里找"，而非"把所有内容都记住"。

### AGENTS.md 的写作约束

AGENTS.md 是当前最广泛采用的项目级前馈控制手段。一项对 138 个开源仓库的研究发现，自动生成的 AGENTS.md 文件多消耗 20% 以上的 token，任务完成率却未提升。原因在于多数自动生成的文件充斥着目录列表和代码库概述——智能体完全有能力自行发现项目结构，它们缺乏的是"不应该做什么"的行为约束。

有效的 AGENTS.md 应遵循以下原则：

- **控制在 60 行以内**：超过这个长度，规则的边际效用开始递减
- **只写行为规则，不写文档**：“不得直接修改 migration 文件”比“src/db/ 目录包含数据库迁移文件”有用得多
- **分层作用域**：组织级规则放在根目录，项目级规则放在项目根，模块级规则放在对应子目录
- **禁止自动生成**：每条规则都应来自真实的失败观察，而非主观臆测

## 三个治理维度

Harness 的验证体系可以按治理目标分为三个维度，每个维度的成熟度和实现难度各不相同。理解这三个维度有助于确定 Harness 建设的优先级。

### 维度一：可维护性治理（Maintainability Harness）

关注内部代码质量——命名规范、函数长度、圈复杂度、重复代码检测。这是最成熟的维度，因为已有大量确定性工具可用（ESLint、Pylint、SonarQube）。

### 维度二：架构适应性治理（Architecture Fitness Harness）

关注系统级特性——性能基准、安全扫描、依赖审计、API 兼容性。这个维度需要更复杂的测试基础设施，如负载测试环境和安全扫描流水线。

### 维度三：行为正确性治理（Behavior Harness）

关注功能是否满足业务需求——这是最困难的维度。代码风格完美、架构优雅，但实现的功能不是用户要的——这类错误很难被自动化工具捕获，往往需要在前馈控制中明确写出业务约束。

| 维度 | 难度 | 典型工具 | 自动化程度 |
|------|------|----------|-----------|
| 可维护性 | ★★☆ | Linter, 格式化器 | 高 |
| 架构适应性 | ★★★ | 性能测试, 安全扫描 | 中 |
| 行为正确性 | ★★★★ | E2E 测试, 人工验收 | 低 |

三个维度层层递进，投入优先级应从易到难。

## 实现模式与代码示例

以下是一个 Harness 配置示例，展示各组件如何组装成完整的智能体运行环境：

\`\`\`python
from dataclasses import dataclass, field
from typing import Callable
from enum import Enum


class ControlType(Enum):
    FEEDFORWARD = "feedforward"
    FEEDBACK = "feedback"


@dataclass
class HarnessComponent:
    name: str
    control_type: ControlType
    handler: Callable
    priority: int = 0


@dataclass
class AgentHarness:
    """智能体 Harness 配置"""
    
    # 前馈控制：行动前的指导
    system_prompt: str = ""
    architecture_docs: list[str] = field(default_factory=list)
    coding_conventions: dict = field(default_factory=dict)
    
    # 工具注册
    tools: list[dict] = field(default_factory=list)
    max_tools_per_context: int = 15  # 避免描述膨胀
    
    # 反馈控制：行动后的验证
    verification_pipeline: list[HarnessComponent] = field(default_factory=list)
    
    # 编排配置
    max_iterations: int = 20
    compaction_threshold: int = 80000  # tokens
    
    # 状态管理
    progress_tracking: bool = True
    checkpoint_interval: int = 5  # 每 N 步保存状态

    def build_context(self, task: str) -> str:
        """渐进式上下文组装"""
        context_parts = [self.system_prompt]
        
        # 按相关性加载架构文档（而非全部加载）
        relevant_docs = self._select_relevant_docs(task)
        context_parts.extend(relevant_docs)
        
        # 工具描述裁剪
        active_tools = self._select_tools(task)[:self.max_tools_per_context]
        context_parts.append(self._format_tools(active_tools))
        
        return "\\n\\n".join(context_parts)

    def run_verification(self, output: str) -> list[dict]:
        """执行反馈控制流水线"""
        issues = []
        for component in sorted(self.verification_pipeline, key=lambda c: c.priority):
            result = component.handler(output)
            if result.get("issues"):
                issues.extend(result["issues"])
        return issues


# 使用示例
harness = AgentHarness(
    system_prompt="""你是一个后端开发助手。
约束：
- 遵循 RESTful 设计原则
- 所有接口必须有错误处理
- 数据库操作使用事务""",
    
    coding_conventions={
        "naming": "snake_case for Python, camelCase for JS",
        "max_function_lines": 50,
        "test_coverage_threshold": 0.8,
    },
    
    verification_pipeline=[
        HarnessComponent(
            name="type_check",
            control_type=ControlType.FEEDBACK,
            handler=lambda code: run_mypy(code),
            priority=1,  # 最先执行：快速、确定性
        ),
        HarnessComponent(
            name="lint",
            control_type=ControlType.FEEDBACK,
            handler=lambda code: run_ruff(code),
            priority=2,
        ),
        HarnessComponent(
            name="test_suite",
            control_type=ControlType.FEEDBACK,
            handler=lambda code: run_pytest(code),
            priority=3,
        ),
        HarnessComponent(
            name="ai_review",
            control_type=ControlType.FEEDBACK,
            handler=lambda code: ai_code_review(code),
            priority=10,  # 最后执行：慢速、推理性
        ),
    ],
)
\`\`\`

代码体现了几个关键设计决策：\`max_tools_per_context\` 防止描述膨胀；验证流水线按 \`priority\` 排序，确定性检查先于推理性审查；\`build_context\` 根据任务动态选择相关文档和工具，而非全量加载。

### 完整工作流示例

将上述组件串联起来，典型的代码修改任务工作流如下：

\`\`\`
1. 接收任务 → build_context() 组装精简上下文
2. System Prompt + AGENTS.md 提供行为约束          ← 前馈控制
3. 智能体选择工具并执行
4. PreToolUse Hook 拦截危险操作                     ← 安全门控
5. 工具执行完成
6. PostToolUse Hook 运行 Linter 并注入诊断            ← 质量回路
7. 智能体根据诊断结果自行修正
8. 重复 3-7 直到任务完成
9. Stop Hook 运行完整测试套件                       ← 完成门控
10. 测试全部通过 → 任务结束
\`\`\`

如果第 9 步测试失败，智能体回到第 3 步继续修复。修复轮次超过阈值（\`max_iterations\`）则标记失败并生成诊断报告。

## 常见反模式

以下反模式来自实际工程实践，理解它们有助于在设计时主动规避。

### 反模式一：无限反馈循环

\`\`\`
Agent 生成代码 → 测试失败 → Agent 修改代码 → 引入新 bug → 测试再次失败 → ...
\`\`\`

根因：缺乏前馈指导。解决方案：设定修复尝试上限（如 5 轮），并在每轮反馈中附带修复建议而不仅仅是错误信息（将 Sensor 升级为 Sensor + Guide 组合）。

### 反模式二：上下文过载

将所有可能相关的文档一次性灌入系统提示。研究表明，上下文文档超过一定阈值后，模型准确率会出现 20 个百分点以上的降幅——给得越多，反而做得越差。应对策略是对外部响应进行压缩，保留关键信息。

### 反模式三：工具爆炸

注册 50+ 个工具，模型选择准确率随工具数量增加而显著下降。更危险的变体是"工具风暴"——智能体短时间内发起大量调用，当下游服务故障时重试逻辑引发级联效应。应对策略：按任务阶段动态加载工具子集，为每个工具设置调用预算并引入速率限制。

### 反模式四：缺乏状态持久化

长任务中不保存中间状态。上下文压缩时，之前的推理和决策记录全部丢失，智能体不得不重新"理解"任务。解决方案：压缩前将关键决策和进度写入持久化文件，压缩后自动重新加载。

### 反模式五：全推理性验证

所有验证都依赖 AI 判断，不使用任何确定性工具。这导致验证本身不可靠——AI 审查 AI 的输出，双方都可能犯错且无法互相纠正。

### 反模式六：检索振荡

RAG 类智能体的典型失败模式。智能体在多轮检索中在不同方向间振荡，始终无法收敛。根因在于缺乏检索结束条件。应对策略：将检索循环上限设为 3 次，每次重新检索前必须明确标注"上一次结果缺失了什么具体信息"。

## 转向循环：从失败到系统性改进

上述反模式描述的是单次会话中的失败。更根本的问题是：如何将每次失败转化为永久性的系统改进？这就是转向循环（Steering Loop）的核心思想。

模式很直接：观察失败 → 诊断根因 → 将修复编码进 Harness → 验证效果 → 部署。关键在于修复不是一次性的人工干预，而是变成永久的规则或 Hook，确保相同错误不会再发生。

\`\`\`mermaid
graph LR
    A[观察失败] --> B[诊断根因]
    B --> C[工程化修复]
    C --> D[编码进 Harness]
    D --> E[验证效果]
    E --> F[部署]
    F -->|下一次失败| A
\`\`\`

一个具体场景：代码智能体反复提交超大变更（500+ 行）。根因不是模型能力不足，而是 Harness 中缺少约束。在 AGENTS.md 中增加"每次提交不超过 200 行变更"这条规则后，所有未来会话都自动遵守。

这就是转向循环的**复利效应**：普通调试是线性的，解决一个问题下次还可能再遇到；转向循环是累积性的，解决一个问题，同类问题永远消失。

更激进的做法是让智能体自己优化 Harness。某研究团队的实验表明，智能体通过分析执行轨迹自主迭代 Harness 配置，遍历 60 种配置组合后找到的最优配置取得了特定模型类别的最高分——Harness Engineering 本身也有可能被自动化。

## Harness 的度量与演进

Harness 的影响并非理论猜想，多个独立基准测试提供了量化证据：

- Terminal-Bench 2.0：同一模型在不同 Harness 下排名差异巨大（第 33 vs 第 5）
- 某智能体框架 Harness 优化后，基准得分从 52.8% 提升至 66.5%
- 138 个开源仓库的研究：自动生成的 AGENTS.md 多消耗 20%+ token，任务完成率未提升

结论：Harness 质量是智能体性能的主要决定因素，但糟糕的 Harness 不如没有 Harness。

### 关键指标

如何评估一个 Harness 的质量？以下指标提供了量化框架：

- **任务完成率**：智能体在无人干预下成功完成任务的比例
- **平均修正轮次**：从首次输出到通过所有验证所需的迭代次数
- **上下文利用率**：有效 token 占总上下文 token 的比例
- **故障恢复率**：遇到错误后成功自我修复的比例
- **确定性覆盖率**：被计算性验证覆盖的输出比例

这五个指标应当作为一个整体来观察。单独追踪任务完成率还不够——如果完成率很高但平均修正轮次也很高，说明智能体在“磨”而不是在“做”，应当加强前馈控制。如果确定性覆盖率低但故障恢复率也低，说明反馈控制存在盲区。

### 演进策略

Harness 不是一次性设计完成的产物，它需要持续迭代：

**阶段一：基础验证**——部署 Linter 和基本测试，建立最低质量底线。

**阶段二：前馈增强**——根据常见失败模式编写 AGENTS.md，将隐性知识显性化。

**阶段三：闭环优化**——分析验证失败模式，将高频错误转化为前馈规则，形成自我进化的闭环。

**阶段四：度量驱动**——建立量化仪表盘，追踪各指标趋势，数据驱动定向加固。

每一轮迭代都遵循同一模式：观察失败点，分析是前馈不足还是反馈不足，然后定向加固。

下表概括了四个阶段的核心特征：

| 阶段 | 核心动作 | 主要控制类型 | 典型产出物 |
|------|----------|------------|----------|
| 基础验证 | 部署确定性检查工具 | 反馈 | Linter 配置、测试套件 |
| 前馈增强 | 将失败观察转化为规则 | 前馈 | AGENTS.md、行为约束 |
| 闭环优化 | 自动捕获并转化高频错误 | 前馈+反馈 | Hook 规则、动态规则更新 |
| 度量驱动 | 基于数据定向优化 | 全链路 | 监控仪表盘、A/B 测试 |
`
    },
    {
      id: "adv-13-18-self-evolution",
      title: "13.18 智能体自我进化",
      file: "大模型教程/13-智能体技术/17-智能体自我进化.md",
      difficulty: "中级-高级",
      duration: "1h",
      week: 0,
      phase: 0,
      keywords: ["智能体自我进化", "Self", "Evolution", "Prompt", "GEPA", "LLM"],
      content: `# 智能体自我进化

你可能遇到过这样的场景：花了半小时教一个AI助手处理你们公司的报销流程，第二天打开新对话——它全忘了。你再教一遍。第三天，同样的事情再来一次。更让人沮丧的是，它在第一次犯的错误，第五次还在犯。每次交互都像在训练一个失忆的新人。

换个角度想：一个实习生如果真的这样，你大概率会认为他不适合这份工作。人类之所以能胜任复杂岗位，不是因为一开始就什么都会，而是因为能从经验中提炼规律，把"踩过的坑"变成"下次绕开的路线"。

如果智能体也能做到这一点——从执行中总结经验、从失败中提取教训、把成功的操作固化为可复用的能力——那么它就不再是一个"有记忆的聊天机器人"，而是一个真正意义上会成长的系统。这就是智能体自我进化要解决的核心问题。

## 什么是自我进化

自我进化（Self-Evolution）是指智能体在部署后，通过自身的执行经验和反馈信号，自主改进其行为策略、知识储备和技能组合的能力。

这个定义有三个关键词需要拆开理解：

- **部署后**：不是训练阶段的参数更新，而是智能体已经上线运行后的持续改进
- **自主**：不依赖人类重新标注数据或启动新一轮微调
- **改进行为，必要时也改进参数**：早期的自我进化系统仅通过外部知识结构（技能文件、记忆系统、策略库）来实现能力提升，不触碰模型权重。但前沿实践已突破这一边界，形成了**两层自我改进架构**：

\`\`\`
第一层 · Prompt进化（轻量）
  优化对象：技能描述、工具定义、策略提示词
  方法：GEPA等进化算法
  资源需求：仅需LLM推理（无GPU训练）
  周期：分钟到小时

第二层 · 模型训练（深度）
  优化对象：模型权重（通过LoRA适配器）
  方法：GRPO等强化学习算法
  资源需求：GPU集群或训练API
  周期：小时到天
\`\`\`

想象你买了一辆自动驾驶汽车。第一层进化相当于这辆车每天自己总结驾驶经验——"这个路口左转经常遇到行人"、"下雨天这段路减速效果更好"——并把经验写进决策手册。第二层进化则更激进：它相当于车载芯片根据积累的行驶数据重新训练视觉识别模型，让感知能力本身得到提升。两层机制互为补充——手册告诉它"做什么"，训练让它"做得更好"。

与其他能力提升范式相比：

| 维度 | 微调 (Fine-tuning) | RLHF | 上下文学习 (ICL) | 自我进化 |
|------|-------------------|------|-----------------|--------|
| 是否修改权重 | 是 | 是 | 否 | 视层级而定† |
| 需要训练资源 | GPU集群 | GPU集群 | 无 | 视层级而定† |
| 改进持久性 | 永久 | 永久 | 仅当次会话 | 跨会话持久 |
| 改进来源 | 人工标注数据 | 人类偏好信号 | 少样本示例 | 自身执行经验 |
| 改进粒度 | 全局能力 | 偏好对齐 | 任务级 | 技能级/策略级/权重级 |
| 部署后可用 | 否 | 否 | 是 | 是 |

> † 自我进化包含两个层级：**Prompt进化层**（如GEPA）不修改权重、无需GPU；**模型训练层**（如基于GRPO的强化学习）通过LoRA适配器更新权重，需要GPU或训练API。后续章节将分别展开。

ICLR 2026 的一篇 oral 论文《A Survey of Self-Evolving Agents》系统梳理了这一领域，将自我进化定义为"无需外部人类干预的、基于经验的能力闭环提升"。这篇综述表明，自我进化已经从概念验证走向了工程可落地阶段。

## 自我进化的五个维度

自我进化不是单一能力，而是多个维度的协同提升。

### 维度一：程序性学习（Procedural Learning）

程序性学习是指智能体从完成复杂任务的过程中，提取出可复用的操作流程并存储为"技能"。

假设你正在处理一个跨时区团队的会议安排任务。第一次，你手动查每个人的时区、计算重叠时段、考虑午休时间、发送日历邀请。第二次遇到同类任务时，你已经有了一套流程：先查时区差、再找公共窗口、排除非工作时段、最后发通知。这套流程就是程序性记忆。

智能体的程序性学习同理——完成一次复杂任务后，分析执行轨迹，将其中的关键步骤抽象为可重用的技能描述。

### 维度二：知识精炼（Knowledge Refinement）

已有的技能并非一成不变。智能体在反复执行某项技能的过程中，可以根据成功率和执行反馈逐步优化技能描述。

比如一个"代码调试"技能，最初的描述可能是"分析报错信息，定位问题代码，修复并验证"。经过多次执行后，智能体发现：对于类型错误，直接检查变量类型比阅读完整调用栈更高效。于是技能描述被精炼为包含条件分支的更细致流程。

### 维度三：工具优化（Tool Optimization）

工具的调用方式也可以进化。智能体通过分析哪些工具组合在特定任务中效果最好，逐步调整工具选择策略和参数配置。

### 维度四：策略适应（Strategy Adaptation）

不同类型的任务适合不同的解决策略。面对数学推理任务时，逐步分解更有效；面对信息检索任务时，先广度搜索再深度聚焦更高效。智能体通过积累不同策略在不同任务上的表现数据，学会"因题制宜"。

### 维度五：跨会话记忆（Cross-Session Memory）

最基础也最关键的一个维度：记住用户是谁、偏好什么、上次做了什么。没有跨会话记忆，前面四个维度的进化成果都无法在下次对话中发挥作用。

## 闭环学习：从执行到改进

自我进化的核心是一个闭环——智能体不只是执行任务，还要在执行结束后"回头看"，从结果中提取改进信号。

\`\`\`mermaid
graph TD
    A[接收任务] --> B[规划与推理]
    B --> C[工具调用与执行]
    C --> D[观察执行结果]
    D --> E{任务是否完成?}
    E -->|否| B
    E -->|是| F[输出结果给用户]
    F --> G[分析执行轨迹]
    G --> H[提取成功模式]
    G --> I[分析失败原因]
    H --> J[生成/更新技能]
    I --> J
    J --> K[写入持久化存储]
    K --> L[下次任务时加载]
    L --> A
\`\`\`

这个闭环有几个关键设计要点：

**异步学习**：学习过程不阻塞用户体验。任务完成后立即返回结果，学习在后台异步进行。

**轨迹分析而非结果分析**：不只看"任务是否成功"，而是分析执行的每一步。NeurIPS 2025 的 SE-Agent 工作证明，基于轨迹的优化在多步推理任务中显著优于仅基于结果的反馈。一次成功的任务中可能包含低效的步骤，一次失败的任务中可能包含值得保留的局部策略。

**渐进式改进**：不是一次性重写技能，而是小幅迭代。每次改进都基于新证据与已有经验的融合。

## 技能系统与程序性记忆

技能（Skill）是自我进化的核心存储单元。它不是代码片段，而是一份结构化的"操作指南"——描述在什么条件下、用什么步骤、调用哪些工具来完成某类任务。

一个典型的技能文件结构：

\`\`\`markdown
# SKILL: deploy-python-service

## 触发条件
用户请求部署 Python 服务到生产环境

## 前置检查
- 确认项目有 requirements.txt 或 pyproject.toml
- 确认有 Dockerfile 或需要生成
- 确认目标环境的访问凭证已配置

## 执行步骤
1. 运行测试套件，确认全部通过
2. 构建 Docker 镜像，标签格式为 {service}:{git-sha[:7]}
3. 推送镜像到容器仓库
4. 更新部署配置（replicas、env vars）
5. 执行滚动更新
6. 验证健康检查端点返回 200

## 常见问题
- 如果测试失败：先修复测试，不要跳过
- 如果端口冲突：检查现有服务占用情况
- 如果健康检查超时：检查启动时间，必要时调整 initialDelaySeconds

## 改进记录
- v1: 初始版本，从2024-03-15部署任务中提取
- v2: 增加端口冲突处理（2024-03-22失败案例）
- v3: 增加滚动更新而非直接替换（2024-04-01线上事故教训）
\`\`\`

技能的生成过程本质上是一次"执行轨迹→结构化知识"的蒸馏：

\`\`\`python
class SkillExtractor:
    """从执行轨迹中提取可复用技能"""
    
    def __init__(self, llm_client):
        self.llm = llm_client
    
    def extract_skill(self, trajectory: list[dict]) -> str:
        """
        分析完整执行轨迹，提取通用技能模板
        
        Args:
            trajectory: 执行步骤列表，每步包含
                        {action, observation, reasoning, tool_calls}
        """
        # 第一步：识别轨迹中的关键决策点
        decision_points = self._identify_decisions(trajectory)
        
        # 第二步：区分任务特定步骤和通用步骤
        generic_steps = self._generalize_steps(trajectory, decision_points)
        
        # 第三步：提取错误恢复模式
        error_patterns = self._extract_error_handling(trajectory)
        
        # 第四步：生成技能描述
        skill_prompt = f"""
        基于以下执行轨迹分析，生成一份可复用的技能描述：
        
        通用步骤：{generic_steps}
        决策点：{decision_points}
        错误处理：{error_patterns}
        
        要求：
        - 去除所有任务特定的细节（具体文件名、用户名等）
        - 保留可迁移的操作逻辑和判断条件
        - 包含前置检查和常见错误处理
        """
        
        return self.llm.generate(skill_prompt)
    
    def _identify_decisions(self, trajectory):
        """识别执行中的分支决策点"""
        decisions = []
        for i, step in enumerate(trajectory):
            if step.get("alternatives_considered"):
                decisions.append({
                    "step": i,
                    "chosen": step["action"],
                    "alternatives": step["alternatives_considered"],
                    "reasoning": step["reasoning"]
                })
        return decisions
\`\`\`

## 基于进化算法的技能优化

技能创建之后如何持续变好？一种高效的方法是 GEPA（Genetic-Pareto Prompt Evolution）——用进化算法的思路来优化技能描述，而无需任何GPU训练。

GEPA 的核心洞察：技能描述本质上是一段 prompt，而 prompt 的优化可以看作一个搜索问题——在"描述空间"中找到效果最好的那个版本。

整个流程如下：

\`\`\`mermaid
graph LR
    A[当前技能版本] --> B[读取执行轨迹]
    B --> C[生成评估数据集]
    C --> D[创建变体]
    D --> E[多维度评估]
    E --> F[Pareto选择]
    F --> G{优于当前版本?}
    G -->|是| H[提交改进PR]
    G -->|否| I[保留当前版本]
    H --> J[人工审核合并]
\`\`\`

具体步骤：

**1. 读取执行轨迹**：收集该技能最近N次执行的完整记录——成功的、失败的、部分成功的。

**2. 生成评估数据集**：从真实轨迹中构造测试用例。不是人工编写的单元测试，而是从实际使用中自动提取的场景。

**3. 创建变体（Mutation）**：对当前技能描述施加多种变异操作：
- 添加缺失的边界条件处理
- 精简冗余的步骤描述
- 重新组织步骤顺序
- 补充从失败案例中学到的新信息

\`\`\`python
class SkillEvolver:
    """基于进化算法的技能优化器"""
    
    def evolve(self, current_skill: str, traces: list[dict]) -> str | None:
        # 生成多个变体
        variants = []
        for strategy in ["simplify", "add_edge_cases", "reorder", "specialize"]:
            variant = self._mutate(current_skill, traces, strategy)
            variants.append(variant)
        
        # 在评估数据集上测试每个变体
        scores = []
        for variant in variants:
            score = self._evaluate(variant, traces)
            scores.append(score)  # 多维度: [成功率, 执行步数, token消耗]
        
        # Pareto最优选择：没有任何维度更差，至少一个维度更好
        best = self._pareto_select(variants, scores, current_skill)
        return best  # None表示当前版本已经是最优
    
    def _mutate(self, skill: str, traces: list, strategy: str) -> str:
        """根据策略生成变体"""
        failed_traces = [t for t in traces if not t["success"]]
        
        if strategy == "add_edge_cases" and failed_traces:
            prompt = f"""
            当前技能：
            {skill}
            
            以下执行失败了：
            {self._summarize_failures(failed_traces)}
            
            请修改技能描述，增加对这些失败场景的处理，
            但不要让描述变得过于冗长。
            """
            return self.llm.generate(prompt)
        # ... 其他策略
\`\`\`

**4. Pareto选择**：评估不止看成功率一个维度，还要考虑执行效率（步骤数）和资源消耗（token数）。只有在不损害任何维度的前提下改善了至少一个维度的变体，才被视为"更好"。

**5. 安全提交**：改进不是静默生效的。最佳变体以 Pull Request 的形式提交，附带完整的评估数据——包括在哪些测试用例上表现更好，以及变更的具体diff。

## 强化学习训练：从技能优化到权重更新

GEPA优化的是描述任务的“说明书”，但智能体的基座能力——语言理解、推理链质量、工具调用的准确性——依然受限于底层模型本身。假设你正在培训一个客服团队：GEPA相当于给他们更好的操作手册，但如果员工本身的专业素养不足，手册写得再好也很难根本性地提升服务质量。第二层进化——基于强化学习的模型训练——解决的正是这个问题。

### GRPO：无需Critic的策略优化

Group Relative Policy Optimization（GRPO）是这套训练体系的核心算法。与经典PPO的关键区别在于：GRPO不需要独立的Critic网络来估计状态价值。它的做法是对同一任务生成一组响应（默认组大小16），然后在组内做相对排名——得分高于组均值的响应获得正向激励，低于的获得负向激励。

这个思路很像考试“曲线评分”：不看绝对分数，看你在这批考生里的相对位置。只要你表现得比同组多数人好，就获得奖励，而不需要一个独立的“评分员”来判断你的绝对水平。这省去了训练和维护Critic模型的开销，显著降低了显存占用和计算量。

典型的训练参数配置：

\`\`\`python
# GRPO 训练默认参数
grpo_config = {
    "group_size": 16,          # 每个任务生成的响应数
    "batch_size": 128,         # 每步更新的样本量
    "learning_rate": 4e-5,     # LoRA学习率
    "lora_rank": 32,           # LoRA秩，控制可训练参数量
    "kl_coefficient": 0.01,    # KL散度正则化系数
    "max_steps": 500,          # 训练步数上限
}
\`\`\`

权重更新通过 LoRA 适配器实现，而非全参数微调。这意味着训练产生的是一组较小的增量权重，可以随时加载或卸载，原始模型不受影响。

### Tinker-Atropos 训练基础设施

强化学习训练不是单个进程就能完成的，它需要三个组件协调工作：

\`\`\`mermaid
graph LR
    subgraph Atropos["协调器: Atropos API"]
        A[任务分配与轨迵收集]
    end
    subgraph Tinker["训练器: Tinker"]
        B[GRPO优化 + LoRA权重]
    end
    subgraph Env["环境进程"]
        C[任务执行与评分]
    end
    A -- "下发任务" --> C
    C -- "返回得分" --> A
    A -- "轨迵+奖励" --> B
    B -- "更新后的模型" --> A
\`\`\`

**Atropos** 扮演调度中心的角色：它维护任务队列，将任务分发给环境进程执行，收集执行轨迵和得分，再将它们打包发送给Tinker用于权重更新。**Tinker** 是实际执行GRPO优化的训练器，管理LoRA适配器的加载与保存。**环境进程**则是智能体实际“做题”的场所——它提供任务、观察智能体的行为、并给出分数。

启动训练需要配置 API 密钥（TINKER_API_KEY 用于训练器通信，WANDB_API_KEY 用于实验追踪），随后分别启动三个进程即可。

### 训练环境：预定义的能力基准

强化学习需要明确的奖励信号，而奖励信号来自环境的评分。目前已有多个预定义的训练环境：

| 环境 | 任务内容 | 规模 | 评分方式 | 特点 |
|------|---------|------|---------|------|
| TerminalBench2 | 终端/编程任务 | 89题 | 二值通过/失败 | 基础能力评估 |
| TBLite | 难度标定任务 | 100题 | 难度加权 | 比TB2快2.6-8倍 |
| YC-Bench | CEO模拟决策 | 长周期 | 多维度策略评分 | 长规划能力 |
| HermesSweEnv | SWE-bench风格代码修复 | 变动 | 测试用例通过率 | 工程实战 |

假设你想训练智能体提升编程能力。TerminalBench2 提供了 89 个终端操作任务，从简单的文件操作到复杂的系统配置，每个任务有确定的通过/失败判定。而 YC-Bench 则走向另一个极端——它模拟创业公司CEO的决策场景，考察智能体在长周期、多目标、信息不完全条件下的策略规划能力。

除了内置环境，也可以继承 \`BaseEnv\` 创建自定义环境，根据业务场景设计专属的任务和评分逻辑。

### 智能体自主触发训练

一个引人注目的设计是：训练不一定需要人手动启动。智能体可以通过内置的RL工具接口自主管理训练流程：

- \`rl_list_environments\` — 查看可用的训练环境
- \`rl_select_environment\` — 选择目标环境
- \`rl_start_training\` — 启动训练任务
- \`rl_check_status\` — 监控训练进度
- \`rl_get_results\` — 获取训练结果

换个角度看，这相当于给智能体一张“健身房会员卡”——它可以自己决定什么时候去键炼哪方面的能力，不需要教练（用户）每次都亲自带它去。

### 离线轨迵导出

强化学习之外，还有一条更传统的路径：将智能体的执行轨迵导出为监督微调（SFT）数据。\`batch_runner.py\` 可以批量运行任务，将完整的对话历史——包括推理过程、工具调用、观察结果——导出为 ShareGPT 格式。这些轨迵可以直接用于微调，让新模型快速复制优秀智能体的行为模式。

### 两层进化对比

| 维度 | GEPA（Prompt进化） | GRPO（模型训练） |
|------|----------------------|----------------------|
| 优化对象 | 技能提示词、工具描述 | 模型权重（经LoRA） |
| GPU需求 | 无 | 需要（或Tinker API） |
| 典型成本 | ~$2–10/次 | 显著GPU算力 |
| 时间周期 | 分钟到小时 | 小时到天 |
| 产出物 | 更好的指令文本 | 更好的token级决策 |
| 可逆性 | 容易（PR审查即可） | 复杂（涉及模型版本管理） |

两层机制并非二选一。实践中的典型路径是：先用GEPA快速迭代技能描述，积累足够的执行数据后，再启动GRPO训练来强化模型底层能力。前者是日常的微调整，后者是阶段性的深度训练。

## 记忆架构与跨会话学习

自我进化需要持久化存储来承载进化的成果。一个典型的智能体记忆架构包含多个层次：

**事实记忆（MEMORY.md）**：存储持久化的事实性信息——项目结构、技术栈、部署环境配置等。这些信息不因会话结束而丢失。

**用户模型（USER.md）**：存储用户的偏好、习惯和历史交互模式——喜欢简洁还是详细的回答、技术水平如何、关注哪些领域。

**技能库（skills/）**：上一节讨论的技能文件集合，按领域和触发条件组织。

**会话索引**：对历史会话进行摘要和全文索引（如使用 FTS5），支持后续检索"我上次是怎么处理这个问题的"。

记忆的更新策略也需要设计：

- **主动推送**：周期性检查记忆与当前状态的一致性，发现过时信息时主动更新
- **被动触发**：执行任务时发现与已有记忆冲突的新事实，触发更新
- **衰减机制**：长时间未被引用的记忆逐步降低优先级，避免信息过载

MemRL 的研究表明，将记忆系统与强化学习信号结合——即通过任务成败来调整记忆内容的权重——可以显著提升跨会话的任务完成率。

## 案例：Hermes Agent

Hermes Agent 是 Nous Research 于 2026 年初开源的自我进化智能体框架。它的价值不在于模型本身的能力，而在于围绕"如何让智能体在使用中变得更好"这个问题，提供了一套完整的工程实现。

### 架构概览

\`\`\`mermaid
graph TD
    subgraph 输入层
        U[用户输入]
        P[平台适配: Telegram/Discord/CLI]
    end
    
    subgraph 核心循环
        R[推理引擎]
        T[工具执行: 40+ 内置工具]
        O[观察与反馈]
        M[MCP 集成]
    end
    
    subgraph 进化层①["第一层: Prompt进化"]
        SK[技能系统: skills/]
        MEM[记忆系统: MEMORY.md + USER.md]
        EV[GEPA 进化引擎]
        SS[会话搜索: FTS5]
    end

    subgraph 进化层②["第二层: 模型训练"]
        RL[RL工具接口]
        GR[GRPO训练 + LoRA]
        TA[Tinker-Atropos 基础设施]
    end
    
    subgraph 执行环境
        L[本地终端]
        D[Docker]
        SSH[SSH远程]
        CL[云端: Modal/Singularity]
    end
    
    U --> P
    P --> R
    R --> T
    T --> O
    O --> R
    R --> SK
    SK --> R
    R --> MEM
    T --> L
    T --> D
    T --> SSH
    T --> CL
    O --> EV
    EV --> SK
    R --> RL
    RL --> GR
    GR --> TA
    TA --> R
    T --> M
\`\`\`

### 核心设计决策

**模型无关（Model-Agnostic）**：支持 200+ 模型后端。第一层进化（技能系统、记忆系统）与推理层完全解耦，无论底层用哪个模型都通用。第二层进化（GRPO训练）则针对具体模型生成LoRA适配器，可以在本地用小模型积累技能和训练数据，然后无缝迁移到更强的模型上使用。

**平台感知**：同一个智能体实例可以通过 Telegram、Discord、CLI 等多种前端交互。进化成果在所有平台间共享。

**子智能体隔离**：对于复杂任务，Hermes 可以派生子智能体（Subagent）。子智能体有独立的上下文窗口，但通过"上下文防火墙"与主智能体隔离——只传递必要信息，避免上下文污染。

### 自我进化的实际运行

以一个具体场景说明整个进化过程：

用户第一次要求 Hermes 将一个 Python 项目从 Poetry 迁移到 uv。Hermes 完成了任务——期间经历了依赖冲突、lock文件格式转换、CI配置调整等多个步骤。

任务完成后，进化层启动：

\`\`\`python
# 伪代码：Hermes 任务后学习流程
def post_task_learning(execution_trace, task_result):
    # 1. 判断是否值得提取技能
    complexity = assess_complexity(execution_trace)
    if complexity < THRESHOLD:
        return  # 太简单的任务不提取
    
    # 2. 检查是否已有类似技能
    existing = skill_store.search("python package manager migration")
    
    if existing:
        # 3a. 已有技能：尝试改进
        improved = evolve_skill(existing, execution_trace)
        if improved:
            submit_improvement_pr(existing, improved)
    else:
        # 3b. 无类似技能：创建新技能
        new_skill = extract_skill(execution_trace)
        skill_store.add(new_skill, source_trace=execution_trace)
    
    # 4. 更新记忆
    facts = extract_facts(execution_trace)
    memory_store.update(facts)  # 例如: "该项目现在使用uv管理依赖"
\`\`\`

第二次，另一个用户请求类似的迁移。Hermes 加载之前创建的技能，执行效率显著提升——知道了常见的坑在哪里，不再需要反复试错。

### 六种终端后端

Hermes 的工具执行不限于本地环境。支持六种终端后端——本地进程、Docker 容器、SSH 远程机器、Daytona 工作区、Singularity 容器以及 Modal 无服务器函数。智能体可以根据任务需要选择合适的执行环境，比如在 Docker 中运行不可信代码，在 Modal 上运行GPU密集型任务。

## 安全约束与人类监督

自我进化不意味着无监督的自由生长。一个失控的进化过程可能导致技能退化、行为漂移甚至安全隐患。

**测试套件守护**：每次技能更新必须通过完整的回归测试。测试用例来自该技能的历史成功执行，确保改进不会破坏已有能力。

**语义保持约束**：技能变体在"核心意图"上必须与原版一致。不允许出现"为了提高成功率而绕过安全检查"这类退化。实现方式是对变体做语义相似度检测，低于阈值的变体直接丢弃。

**大小限制**：技能描述有严格的长度上限。防止进化过程中技能无限膨胀，最终超出上下文窗口。

**人工审核门控**：所有技能改进以 PR（Pull Request）形式提交，需要人工审核后才能合并。这是最后一道防线——人类始终保有对进化方向的否决权。

\`\`\`python
class SafetyGates:
    """技能进化的安全约束"""
    
    MAX_SKILL_SIZE = 4096  # tokens
    MIN_SEMANTIC_SIMILARITY = 0.85
    MIN_TEST_PASS_RATE = 1.0  # 所有测试必须通过
    
    def validate_evolution(self, original: str, evolved: str, 
                           test_results: dict) -> bool:
        # 检查大小约束
        if count_tokens(evolved) > self.MAX_SKILL_SIZE:
            return False
        
        # 检查语义保持
        similarity = compute_semantic_similarity(original, evolved)
        if similarity < self.MIN_SEMANTIC_SIMILARITY:
            return False
        
        # 检查测试通过率
        if test_results["pass_rate"] < self.MIN_TEST_PASS_RATE:
            return False
        
        return True
\`\`\`

这套安全机制的设计哲学是：**让进化自由探索，但用硬性约束框定边界。** 智能体可以自主生成任意数量的变体和改进方案，但任何变更都必须通过安全验证才能生效。

## 局限性与开放问题

自我进化技术仍处于早期阶段，诸多问题尚无共识性解决方案。

**能力边界不明确**：智能体如何判断"这个任务超出了我的能力范围，不应该尝试提取技能"？过度自信会导致提取出低质量甚至错误的技能。

**进化方向的偏差累积**：如果早期的几次执行恰好遇到了非典型场景，提取出的技能可能会"以偏概全"。后续基于这个偏差技能的进化会进一步放大错误——类似于强化学习中的 reward hacking 问题。

**多用户环境下的进化冲突**：当多个用户共享同一智能体实例时，一个用户的偏好进化可能与另一个用户冲突。如何在个性化和通用性之间取得平衡，目前没有优雅的解法。

**评估困难**：如何衡量"进化成功了"？成功率提升是一个指标，但可能掩盖了在罕见但重要场景上的退化。缺乏标准化的自我进化评估基准。

**知识遗忘与膨胀**：技能库会无限增长吗？过时的技能何时清除？这涉及一个经典的知识管理难题——在"记住更多"和"保持精简"之间找到平衡。

**实时交互RL尚未落地**：目前的强化学习训练均基于预定义的基准环境（TerminalBench2、YC-Bench等）。从真实用户对话中直接提取训练信号（live conversation RL）已有提案（GitHub #498），但尚未实现。这意味着模型训练层的能力提升仍然是“离线”的，无法直接从日常使用中持续学习。

这些问题的解决可能需要跨多个方向的协同突破——更好的不确定性估计、更精细的记忆衰减策略、以及更完善的多租户隔离机制。自我进化的最终目标不是让智能体“什么都学会”，而是让它“知道该学什么、怎么学、以及什么时候该停下来问人”。
`
    },
  ]
});
