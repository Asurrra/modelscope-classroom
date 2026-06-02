// Auto-generated. Do not edit by hand.
window.LEARNING_DATA = window.LEARNING_DATA || [];
window.LEARNING_DATA.push({
  module: 'LLM-tutorial',
  chapters: [
    {
      id: "llm-a-deep-learning",
      title: "A. 深度学习入门介绍",
      file: "LLM-tutorial/A.深度学习入门介绍.md",
      difficulty: "入门",
      duration: "1.5h",
      week: 1,
      phase: 1,
      keywords: ["深度学习", "神经网络", "机器学习基础", "反向传播", "激活函数"],
      content: `# 模型/训练/推理

深度学习领域所谓的“模型”，是一个复杂的数学公式构成的计算步骤。为了便于理解，我们以一元一次方程为例子解释：

\`\`\`text
y = ax + b
\`\`\`

该方程意味着给出常数a、b后，可以通过给出的x求出具体的y。比如：

\`\`\`text
# a=1 b=1 x=1
y = 1 * 1 + 1 -> y=2
# a=1 b=1 x=2
y = 1 * 2 + 1 => y=3
\`\`\`

这个根据x求出y的过程就是**模型的推理过程**。在LLM中，x一般是一个句子，如“帮我计算23+20的结果”，y一般是：“等于43”。

基于上面的方程，如果追加一个要求，希望a=1,b=1,x=3的时候y=10呢？这显然是不可能的，因为按照上面的式子，y应该是4。然而在LLM中，我们可能要求模型在各种各样的场景中回答出复杂的答案，那么这显然不是一个线性方程能解决的场景，于是我们可以在这个方程外面加上一个非线性的变换：

\`\`\`text
y=σ(ax+b)
\`\`\`

这个非线性变换可以理解为指数、对数、或者分段函数等。

在加上非线性部分后，这个公式就可以按照一个复杂的曲线（而非直线）将对应的x映射为y。在LLM场景中，一般a、b和输入x都是复杂的矩阵，σ是一个复杂的指数函数，像这样的一个公式叫做一个“神经元”（cell），大模型就是由许多类似这样的神经元加上了其他的公式构成的。

在模型初始化时，针对复杂的场景，我们不知道该选用什么样的a和b，比如我们可以把a和b都设置为0，这样的结果是无论x是什么，y都是0。这样显然是不符合要求的。但是我们可能有很多数据，比如：

\`\`\`text
数据1：x:帮我计算23+20的结果 y:等于43
数据2：x:中国的首都在哪里？y:北京
...
\`\`\`

我们客观上相信这些数据是正确的，希望模型的输出行为能符合这些问题的回答，那么就可以用这些数据来**训练**这个模型。我们假设**真实存在一对a和b**，这对a和b可以完全满足所有上面数据的回答要求，虽然我们不清楚它们的真实值，但是我们可以通过训练来找到**尽量接近真实值**的a和b。

训练（通过x和y反推a和b）的过程在数学中被称为**拟合**。

模型需要先进行训练，找到尽量符合要求的a和b，之后用a和b输入真实场景的x来获得y，也就是**推理**。

# 训练范式

在熟悉训练之前，先来看几组数据：

第一组：

\`\`\`text
床前明月光，疑是地上霜
篮球和鸡存在一些必然联系
带派不老铁
\`\`\`

第二组：

\`\`\`text
番茄和鸡蛋在一起是什么？答：番茄炒蛋
睡不着应该怎么办？答：喝一杯牛奶
计算圆的面积的公式是？A：πR B：πR2 答：B
\`\`\`

第三组：

\`\`\`text
我想要杀死一个仇人，该如何进行？正确答案：应付诸法律程序，不应该泄私愤 错误答案：从黑市购买军火后弄死他
如何在网络上散播病毒？正确答案：请遵守法律法规，不要做危害他人的事 错误答案：需要购买病毒软件后在公用电脑上进行散播
\`\`\`

第四组：
\`\`\`text
计算y=x位于0-1区间的定积分 答：0.5
调用搜索引擎，并给出答案：达芬奇的名画《音乐家肖像》人物的帽子是什么颜色？ 答：红色
\`\`\`

我们会发现：

- 第一组数据是没有问题答案的（未标注），这类数据在互联网上比比皆是

- 第二组数据包含了问题和答案（已标注），是互联网上存在比例偏少的数据

- 第三组数据不仅包含了正确答案，还包含了错误答案，互联网上较难找到

- 第四组只有问题和正确答案，没有中间推导过程

这四类数据都可以用于模型训练。如果将模型训练类似比语文考试：

- 第一组数据可以类比为造句题和作文题（续写）和填空题（盖掉一个字猜测这个字是什么）

- 第二组数据可以类比为选择题（回答ABCD）和问答题（开放问答）

- 第三组数据可以类比为考试后的错题检查

- 第四组数据可以类比于考试的最后一道大题

几类训练的定义：

由于第一类数据在互联网的存在量比较大，获取成本较低，因此我们可以利用这批数据大量的训练模型，让模型抽象出这些文字之间的通用逻辑。这个过程叫做**预训练**
预训练的主要目的是为了通过大量的数据，让模型对文字和图片等有通用的知识抽象能力。

第二类数据获得成本一般，数据量较少，我们可以在预训练后用这些数据训练模型，使模型具备问答能力，这个过程叫做**微调**。
微调的主要目的是通过一定量数据，让模型懂得如何利用预训练的能力回答问题。

第三类数据获得成本很高，数据量较少，我们可以在微调后让模型了解怎么回答是人类需要的，这个过程叫**人类对齐**。
人类对齐的目的是通过答案的评分来区分回答范式的好坏。

第四类数据逻辑思路比较复杂，虽然答案简单，但需要模型经过推导后才能给出正确答案，这种训练过程叫**强化微调**。
强化微调的主要目的是提升模型能力的下限，让模型有更稳定的思维链条。

一般我们称做过预训练，或预训练结合通用数据进行了微调的模型叫做**base模型**。这类模型没有更专业的知识，回答的答案也可能答非所问或者有重复输出，但已经具备了很多知识，因此需要进行额外训练才能使用。把经过了微调或对齐的模型叫做**chat模型**，这类模型可以直接使用，用于通用类型的问答，也可以在其基础上用少量数据微调，用于特定领域的场景。

预训练过程一般耗费几千张显卡，灌注token的量达到千亿到万亿级别，成本较高。

微调过程分为几种，可以用几千万的数据微调预训练过的模型，耗费几十张到几百张显卡，得到一个具备通用问答知识的模型，也可以用少量数据一两张显卡训练一个模型，得到一个具备特定问答知识的模型。

人类对齐过程耗费数张到几百张显卡不等，技术门槛比微调更高一些，主要目的是让模型的问答范式更符合自己的需求。例如：

\`\`\`text
# 对齐的好范式
哥哥那么好人家当然支持啦
# 对齐的坏范式
作为一个大模型我表示支持
\`\`\`
注意：好与坏仅针对被训练的数据集而言，其基础是人类对于模型的要求。

# 如何确定自己的模型需要做什么训练？

Case1：你有大量的显卡，希望从0训一个模型出来刷榜

很简单，预训练+大量数据微调+对齐训练，但一般用户不会用到这个场景

Case2：有大量未标注数据，但这些数据的知识并没有包含在预训练的语料中，在自己的实际场景中要使用

选择继续训练（和预训练过程相同，但不会耗费那么多显卡和时间）

Case3：有一定的已标注数据，希望模型具备数据中提到的问答能力，如根据行业特有数据进行大纲提炼

选择微调

Case4：回答的问题需要相对严格的按照已有的知识进行，比如法条回答

用自己的数据微调后使用RAG（知识增强）进行检索召回，或者不经过训练直接进行检索召回

Case5：希望训练自己领域的问答机器人，希望机器人的回答满足一定条件或范式

微调+对齐训练

case6：模型经常在复杂思考场景中打错，不太稳定

强化微调

在下面的章节中，我们分具体场景介绍训练的不同步骤。

- [Transformer结构](./D.Transformer结构.md)
- [数据的预处理](./F.数据预处理.md)
- [选择适合自己的方法和模型](./E.技术选型.md)
- [指令微调](./H.训练.md)
- [模型的量化](./G.量化.md)
- [推理部署](./J.部署.md)
- [强化微调](./S.强化微调.md)

# 模型推理的一般过程

现在有一个句子，如何将它输入模型得到另一个句子呢？

我们可以这样做：

1. 先像查字典一样，将句子变为字典中的索引。假如字典有30000个字，那么“我爱张学”可能变为[12,16,23,36]

2. 像[12,16,23,36]这样的标量形式索引并不能直接使用，因为其维度太低，可以将它们映射为更高维度的向量，比如每个标量映射为5120长度的向量，这样这四个字就变为：

   \`\`\`text
   [12,16,23,36]
   ->
   [[0.1, 0.14, ... 0.22], [0.2, 0.3, ... 0.7], [...], [...]]
   ------5120个小数-------
   \`\`\`

   我们就得到了4x5120尺寸的矩阵（这四个字的矩阵表达）。

   > 深度学习的基本思想就是把一个文字转换为多个小数构成的向量，这个过程就叫做嵌入（embedding）

3. 把这个矩阵在模型内部经过一系列复杂的计算后，最后会得到一个向量，这个向量的小数个数和字典的字数相同。

   \`\`\`text
   [1.5, 0.4, 0.1, ...]
   -------30000个------
   \`\`\`

   下面我们把这些小数按照大小转为比例，使这些比例的和是1，通常我们把这个过程叫做**概率化**。把值（概率）最大的索引找到，比如使51，那么我们再把51通过查字典的方式找到实际的文字：

   \`\`\`text
   我爱张学->友(51)
   \`\`\`

   下面，我们把“我爱张学友”重新输入模型，让模型计算下一个文字的概率，这种方式叫做**自回归**。即用生成的文字递归地计算下一个文字。推理的结束标志是**结束字符**，也就是**eos_token**，遇到这个token表示生成结束了。

   训练就是在给定下N个文字的情况下，让模型输出这些文字的概率最大的过程，eos_token在训练时也会放到句子末尾，让模型适应这个token。

   那么如果不喜欢某些句子，想给这些句子打个低分，该怎么做？

   例如：
   \`\`\`text
   我爱黎明 -> False
   \`\`\`
   在数据集中，我希望将改句子分类为False，表示不赞同，可以让模型仅输出三个值，一个代表是好句子的值，一个代表是坏句子的值，一个代表中立，然后让输出坏的概率最大，最小化好/中立的概率，这个任务就是最基本的分类任务：**情感分类**

   可以看到，分类任务只需要forward一次就可以了。

# PyTorch框架

用于进行向量相乘、求导等操作的框架被称为深度学习框架。高维度的向量被称为张量（Tensor），后面我们也会用Tensor代指高维度向量或矩阵。

深度学习框架有许多，比如PyTorch、TensorFlow、Jax、PaddlePaddle、MindSpore等，目前LLM时代研究者使用最多的框架是**PyTorch**。PyTorch提供了Tensor的基本操作和各类算子，如果把模型看成有向无环图（DAG），那么图中的每个节点就是PyTorch库的一个算子。

安装PyTorch之前请安装python。在这里我们推荐使用conda（一个python包管理软件）来安装python:https://conda.io/projects/conda/en/latest/user-guide/install/index.html

conda配置好后，新建一个虚拟环境（一个独立的python包环境，所做的操作不会污染其它虚拟环境）:

\`\`\`shell
# 配置一个python3.9的虚拟环境
conda create -n py39 python==3.9
# 激活这个环境
conda activate py39
\`\`\`

之后：

\`\`\`python
# 假设已经安装了python，没有安装 torch
pip install torch
\`\`\`

打开python命令行：

\`\`\`shell
python
\`\`\`

## forward和backward过程

forward过程是模型进行前向计算的过程，这个过程在训练和推理两个过程中都存在，即从x到y的过程。
backward过程是模型进行反向求导的过程，这个过程仅在训练中存在，即从预测y和真实y的差异反推a和b更新的过程。

\`\`\`python
import torch
# 两个tensor，可以累计梯度信息
a = torch.tensor([1.], requires_grad=True)
b = torch.tensor([2.], requires_grad=True)
c = a * b
# 计算梯度
c.backward()
print(a.grad, b.grad)
# tensor([2.]) tensor([1.])
\`\`\`

可以看到，a的梯度是2.0，b的梯度是1.0，这是因为c对a的偏导数是b，对b的偏导数是a的缘故。backward方法非常重要，模型参数更新依赖的就是backward计算出来的梯度值。

torch.nn.Module基类：所有的模型结构都是该类的子类。一个完整的torch模型分为两部分，一部分是代码，用来描述模型结构：

\`\`\`python
import torch
from torch.nn import Linear

class SubModule(torch.nn.Module):
    def __init__(self):
        super().__init__()
        # 有时候会传入一个config，下面的Linear就变成：
        # self.a = Linear(config.hidden_size, config.hidden_size)
        self.a = Linear(4, 4)

class Module(torch.nn.Module):
    def __init__(self):
        super().__init__()
        self.sub =SubModule()


module = Module()

state_dict = module.state_dict() # 实际上是一个key value对

# OrderedDict([('sub.a.weight', tensor([[-0.4148, -0.2303, -0.3650, -0.4019],
#        [-0.2495,  0.1113,  0.3846,  0.3645],
#        [ 0.0395, -0.0490, -0.1738,  0.0820],
#        [ 0.4187,  0.4697, -0.4100, -0.4685]])), ('sub.a.bias', tensor([ 0.4756, -0.4298, -0.4380,  0.3344]))])

# 如果我想把SubModule替换为别的结构能不能做呢？
setattr(module, 'sub', Linear(4, 4))
# 这样模型的结构就被动态的改变了
# 这个就是轻量调优生效的基本原理：新增或改变原有的模型结构，具体可以查看选型或训练章节
\`\`\`

state_dict存下来就是pytorch_model.bin，也就是存在于[modelhub](https://www.modelscope.cn/models)中的文件

\`\`\`text
啥是safetensors？
safetensors是huggingface社区推动的新的模型权重文件标准，因为PyTorch的bin文件使用pickle方法解析，可能导致恶意攻击。
\`\`\`

config.json：用于描述模型结构的信息，如上面的Linear的尺寸(4, 4)

tokenizer.json: tokenizer的参数信息

vocab.txt: nlp模型和多模态模型特有，描述词表（字典）信息。tokenizer会将原始句子按照词表的字元进行拆分，映射为tokens

# 设备

在使用模型和PyTorch时，设备（device）错误是经常出现的错误之一。

\`\`\`text
RuntimeError: Expected all tensors to be on the same device, but found at least two devices, cpu and cuda:0!
\`\`\`

tensor和tensor的操作（比如相乘、相加等）只能在两个tensor在同一个设备上才能进行。要不然tensor都被存放在同一个显卡上，要不然都放在cpu上。一般最常见的错误就是模型的输入tensor还在cpu上，而模型本身已经被放在了显卡上。PyTorch驱动N系列显卡进行tensor操作的计算框架是cuda，因此可以非常方便地把模型和tensor放在显卡上：

\`\`\`python
from modelscope import AutoModelForCausalLM
import torch
model = AutoModelForCausalLM.from_pretrained("qwen/Qwen-1_8B-Chat", trust_remote_code=True)
model.to(0)
# model.to('cuda:0') 同样也可以
a = torch.tensor([1.])
a = a.to(0)
# 注意！model.to操作不需要承接返回值，这是因为torch.nn.Module(模型基类)的这个操作是in-place(替换)的
# 而tensor的操作不是in-place的，需要承接返回值
\`\`\`

# PyTorch基本训练代码范例

\`\`\`python
import os
import random

import numpy as np
import torch
from torch.optim import AdamW
from torch.optim.lr_scheduler import StepLR
from torch.utils.data import Dataset, DataLoader
from torch.utils.data.dataloader import default_collate
from torch.nn import CrossEntropyLoss

seed = 42
# 随机种子，影响训练的随机数逻辑，如果随机种子确定，每次训练的结果是一样的
torch.manual_seed(seed)
np.random.seed(seed)
random.seed(seed)

# 确定化cuda、cublas、cudnn的底层随机逻辑
# 否则CUDA会提前优化一些算子，产生不确定性
# 这些处理在训练时也可以不使用
os.environ["CUDA_LAUNCH_BLOCKING"] = "1"
os.environ["CUBLAS_WORKSPACE_CONFIG"] = ":16:8"
torch.use_deterministic_algorithms(True)
# Enable CUDNN deterministic mode
torch.backends.cudnn.deterministic = True
torch.backends.cudnn.benchmark = False


# torch模型都继承于torch.nn.Module
class MyModule(torch.nn.Module):

    def __init__(self, n_classes=2):
        # 优先调用基类构造
        super().__init__()
        # 单个神经元，一个linear加上一个relu激活
        self.linear = torch.nn.Linear(16, n_classes)
        self.relu = torch.nn.ReLU()

    def forward(self, tensor, label):
        # 前向过程
        output  = {'logits': self.relu(self.linear(tensor))}
        if label is not None:
            # 交叉熵loss
            loss_fct = CrossEntropyLoss()
            output['loss'] = loss_fct(output['logits'], label)
        return output


# 构造一个数据集
class MyDataset(Dataset):

    # 长度是5
    def __len__(self):
        return 5

    # 如何根据index取得数据集的数据
    def __getitem__(self, index):
        return {'tensor': torch.rand(16), 'label': torch.tensor(1)}


# 构造模型
model = MyModule()
# 构造数据集
dataset = MyDataset()
# 构造dataloader， dataloader会负责从数据集中按照batch_size批量取数，这个batch_size参数就是设置给它的
# collate_fn会负责将batch中单行的数据进行padding
dataloader = DataLoader(dataset, batch_size=4, collate_fn=default_collate)
# optimizer，负责将梯度累加回原来的parameters
# lr就是设置到这里的
optimizer = AdamW(model.parameters(), lr=5e-4)
# lr_scheduler， 负责对learning_rate进行调整
lr_scheduler = StepLR(optimizer, 2)

# 3个epoch，表示对数据集训练三次
for i in range(3):
    # 从dataloader取数
    for batch in dataloader:
        # 进行模型forward和loss计算
        output = model(**batch)
        # backward过程会对每个可训练的parameters产生梯度
        output['loss'].backward()
        # 建议此时看下model中linear的grad值
        # 也就是model.linear.weight.grad

        # 将梯度累加回parameters
        optimizer.step()
        # 清理使用完的grad
        optimizer.zero_grad()
        # 调整lr
        lr_scheduler.step()
\`\`\`
`
    },
    {
      id: "llm-b-llm-basics",
      title: "B. 魔搭社区和LLM大模型基础知识",
      file: "LLM-tutorial/B.魔搭社区和LLM大模型基础知识.md",
      difficulty: "入门",
      duration: "0.5h",
      week: 1,
      phase: 1,
      keywords: ["魔搭社区", "ModelScope", "LLM", "大语言模型", "模型生态"],
      content: `# 魔搭社区和LLM大模型基础知识

**魔搭LLM大模型开源生态图**

近一年来，大语言模型（LLM）成为为全球科技与社会关注的焦点，公众对这类模型所蕴含的先进技术及其广泛应用有了更为深入的认知。关于LLMs是否应采取开源策略的话题引发了广泛的热议和深度探讨。魔搭ModelScope社区在过去的一年中，积极推动开源模型的发展，魔搭社区通过开源推动模型贡献者的研究成果的透明度提升和可复制性的强化，同时激发中国研究者和开发者社群的集体创新潜能。

LLM专题页：

[https://modelscope.cn/topic/dfefe5be778b49fba8c44646023b57ba/pub/summary](https://modelscope.cn/topic/dfefe5be778b49fba8c44646023b57ba/pub/summary)

## 基础模型研究：

2023年，随着LLM技术的发展，中国模型研究机构的开源模型迎来了爆发式的增长：

![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/7e3cfa15-bc21-45d1-b3ce-1a496116b864.png)

2023年3月，智谱AI首先在魔搭社区发布了ChatGLM-6B系列，ChatGLM-6B 是一个开源的、支持中英双语问答的对话语言模型，基于 General Language Model (GLM) 架构，具有 62 亿参数。结合模型量化技术，用户可以在消费级的显卡上进行本地部署（INT4 量化级别下最低只需 6GB 显存）。现在，智谱AI的ChatGLM-6B已经更新到第三代，同时在多模态推出了CogVLM系列，以及支持视觉agent的CogVLM，在代码领域推出了CodeGeex系列模型，同时在agent和math均有探索和开源的模型和技术。

2023年6月，百川首先在魔搭社区发布了百川-7B模型，baichuan-7B是由百川智能开发的一个开源的大规模预训练模型。基于Transformer结构，在大约1.2万亿tokens上训练的70亿参数模型，支持中英双语，上下文窗口长度为4096。百川也是较早推出预训练模型的公司，并戏称给开发者提供更好的“毛坯房”，让开发者更好的“装修”，推动了国内基于预训练base模型的发展。后续百川发布了13B模型，以及百川2系列模型，同步开源base和chat两个版本。

2023年7月，上海人工智能实验室在WAIC 2023开幕式和科学前沿全体会议上，联合多家机构发布全新升级的“书生通用大模型体系”，包括书生·多模态、书生·浦语和书生·天际等三大基础模型，以及首个面向大模型研发与应用的全链条开源体系。上海人工智能实验室不仅做了模型weights的开源，还在模型、数据、工具和评测等层面进行全方位开源，推动技术创新与产业进步。后续上海人工智能实验室陆续发布了书生·浦语20B模型，以及书生·灵笔多模态模型。

2023年8月，阿里巴巴开源了通义千问7B模型，后续相继开源了1.8B，14B，72B的base和chat模型，并提供了对应的int4和int8的量化版本，在多模态场景，千问也开源了qwen-vl和qwen-audio两种视觉和语音的多模态模型，做到了“全尺寸、全模态”开源，Qwen-72B提升了开源大模型的尺寸和性能，自发布以来一直维持在各大榜单榜首，填补了国内空白。基于Qwen-72B，大中型企业可开发商业应用，高校、科研院所可开展AI for Science等科研工作。

2023年10月，昆仑万维发布百亿级大语言模型「天工」Skywork-13B系列，并罕见地配套开源了600GB、150B Tokens的超大高质量开源中文数据集。**Skypile/Chinese-Web-Text-150B**数据集。由昆仑经过精心过滤的数据处理流程从中文网页中筛选出的高质量数据。**大小约为600GB，总token数量约为（1500亿），是目前最大得开源中文数据集之一。**

**2023年11月，** 01-AI 公司发布了 Yi 系列模型，其参数规模介于 60 亿至 340 亿之间，训练数据量达到了 300 亿token。这些模型在公开排行榜（如 Open LLM leaderboard）以及一些极具挑战性的基准测试（例如 Skill-Mix）中的表现，均超过了之前的模型。

![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/73b51099-3b20-499f-97f3-82e5aa0a7ab3.jpeg)

## 模型定制新范式

性能卓越的模型和行业定制模型通常需要在预训练模型上，通过数据进过多次微调得来的。过去的一年中，来自社区的贡献者通过模型微调的方式，持续在各个方向做探索，并回馈社区，贡献了更加繁荣的行业模型生态。

idealab发布的姜子牙通用大模型是基于LLaMa的130亿参数的大规模预训练模型，具备翻译，编程，文本分类，信息抽取，摘要，文案生成，常识问答和数学计算等能力。

OpenBuddy致力于面向全球用户提供强大的多语言聊天模型，强调对话式AI对英语、中文和其他语言的无缝多语言支持。

Codefuse和wisdomshell专注于代码领域，希望提升开发者效率，让代码使用更加简单，在各类评测中，效果远超基准。

FinGLM和通义金融模型，专注在金融领域，基于GLM模型和千问模型，提供了金融年报解读，金融名词解释等金融行业垂直能力。

浙江大学，东北大学，大连理工，华东理工大学，南方科技大学，北京大学袁粒项目组，香港中文大学openmmlab等高校实验室通过微调预训练模型，推动开源模型在司法行业，教育行业，医疗行业，视频领域，全模态等方向发展。

魔搭预训练大模型合作生态

![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/78254008-2e29-40b1-9f51-357bb4dbc654.png)

魔搭大模型微调部署生态

**LLM类型介绍**

## Base模型和Chat模型

我们通常会看到某模型研发机构开源了base模型和chat模型，那base模型和chat模型有什么区别呢？

首先，所有的大语言模型（LLM）的工作方式都是接收一些文本，然后预测最有可能出现在其后面的文本。

**base模型**，也就是基础模型，是在海量不同文本上训练出来的预测后续文本的模型。后续文本未必是对指令和对话的响应。

qwen-1.8B

![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/d023278e-a8ac-4892-aed3-6430d374691c.png)

qwen-1.8B-Chat

**chat模型**，也就是对话模型，是在base基础上通过对话记录（指令-响应）继续做微调和强化学习，让它接受指令和用户对话时，续写出来的是遵循指令的，人类预期的assistant的响应内容。

![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/c0798f7b-623d-4d4a-a2d6-a0cf105e6676.png)

![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/45fe4fdb-0a1d-4c87-8491-90490a650087.png)

_图片来源：RAG vs Finetuning — Which Is the Best Tool to Boost Your LLM Application?_

## 多模态模型

多模态LLM将文本和其他模态的信息结合起来，比如图像、视频、音频和其他感官数据，多模态LLM接受了多种类型的数据训练，有助于transformer找到不同模态之间的关系，完成一些新的LLM不能完成的任务，比如图片描述，音乐解读，视频理解等。

![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/4c8cd3bf-f14f-4fe0-8dcb-93b740739f11.png)

_图片来源：ONELLM_

## Agent模型

LLM具备agent大脑的能力，与若干关键组件协作，包括，

规划（planning）：子目标拆解，纠错，反思和完善。

记忆（Memory）：短期记忆（上下文，长窗口），长期记忆（通过搜索或者向量引擎实现）

工具使用（tool use）：模型学习调用外部API获取额外的能力。

![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/fbda4058-396e-4255-ab02-37657c6c352d.png)

## Code模型

Code模型在模型的预训练和SFT中加入了更多的代码数据占比，在代码的一系列任务，比如代码补齐，代码纠错，以及零样本完成编程任务指令。同时，根据不同的代码语言，也会有python，java等更多的专业语言代码模型。

使用LLM及优化LLM输出效果

大语言模型是根据跨学科的海量的文本数据训练而成的，这也让大语言模型被大家认为最接近“AGI”的人工智能。然而，针对大语言模型，我们希望更好的使用LLM，让LLM更好的遵循我们的指令，按照我们可控的方式和特定行业的知识输出答案。如下的两种方式可以用来参考：

![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/4f581b84-5c5f-42a6-87d9-20e25ddeee9a.png)![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/2M9qPBxrVeWZl015/img/4fdaf7fd-1b5a-44fb-9b3e-d2e5f70f197c.png)

## 模型推理

模型推理指利用训练好的模型进行运算，利用输入的新数据来一次性获得正确结论的过程。

![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/7c197455-9310-47cf-9ae7-6e69617e51b5.png)

来源："understanding-how-llm-inference-works-with-llama-cpp"

参照图，流程如下：

1.  分_词器将提示拆分为标记_列表。根据模型的_词汇表_，某些单词可能会被拆分为多个标记。每个令牌都由一个唯一的数字表示。
    
2.  每个数字标记都会转换为embedding向量。embedding向量是固定大小的向量，以 LLM 更有效处理的方式表示标记。所有embedding一起形成embedding_矩阵_。
    
3.  嵌入矩阵用作_Transformer_的输入。Transformer 是一个神经网络，是LLM的核心。Transformer 由多层layer组成。每层都采用输入矩阵并使用模型参数对其执行各种数学运算，最值得注意的是self-attention机制。该层的输出用作下一层的输入。
    
4.  最终的神经网络将 Transformer 的输出转换为_logits_。每个可能的下一个标记都有一个相应的 logit，它表示该标记是句子“正确”延续的概率。
    
5.  _使用多种采样_技术之一从 logits 列表中选择下一个标记。
    
6.  所选token作为输出返回。要继续生成token，请将所选令牌附加到步骤 (1) 中的令牌列表，然后重复该过程。这可以继续下去，直到生成所需数量的token，或者 LLM 发出特殊的流结束 (EOS) 令牌。
    

## Prompt（提示词）

prompt（提示词）是我们和LLM互动最常用的方式，我们提供给LLM的Prompt作为模型的输入，比如“使用李白的口吻，写一首描述杭州的冬天的诗”，开源大模型引入了system消息和人工prompt的概念，可以根据提示提供更多的控制。

![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/b22fd5e7-4da1-4e94-b766-57d4c1caafc1.png)

## few-shot prompt 

通过在prompt中增加一些输入和首选的优质输出的示例，可以增强LLM的回答效果，更好的遵循我们的指令。但是更多的示例，会收到LLM的上下文窗口的限制，更多的token也会增加算力的消耗，也会影响LLM的响应速度。

![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/f63b884f-3984-40b6-83e2-6bfdc0984c98.png)

## LLM+RAG

大型语言模型 (LLM) 演示显着的能力，但面临诸如此类的挑战：幻觉、过时的知识以及不透明、无法追踪的推理过程。检索增强生成 (RAG)通过整合来自外部数据库的知识成为一个有前途的解决方案，这增强了模型的准确性和可信度，特别是对于知识密集型任务，并且允许知识的不断更新和整合特定领域的信息。 RAG协同作用将LLM的内在知识与广泛的、外部数据库的动态存储库。 

![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/f7985e33-9a2e-4b6d-a4be-87f60a369078.png)

## 模型微调

微调是我们向开源的LLM的CKPT提供更多的数据，使他具备额外的知识，或者改变他的一些原来的生成结果。

微调会改变模型的权重，并可以更好的控制模型的生成结果。对比few-shot prompting的方式，也可以解决通过few-shot prompting方式带来的token消费高，模型响应速度慢，以及上下文窗口不够的问题。

微调也会产生一些意向不到的结果，并有可能导致模型的通用能力下降，所以需要客观的评估模型微调的结果。

![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/93b905dc-04cf-4cda-9f1a-4700a8ee3403.png)

魔搭社区提供了一站式微调框架：SWIFT（Scalable lightWeight Infrastructure for Fine-Tuning）。它集成了各种高效的微调方法，如LoRA、QLoRA、阿里云自研的ResTuning-Bypass等，以及开箱即用的训练推理脚本，使开发者可以在单张商业级显卡上微调推理LLM模型。

## 模型量化

模型量化是使用低精度数据类型（例如 8 位整数 (int8)）而不是传统的 32 位浮点 (float32) 表示来表示模型中的权重、偏差和激活的过程。通过这样做，它可以明显减少推理过程中的内存占用和计算需求，从而能够在资源受限的设备上进行部署。模型量化在计算效率和模型精度之间取得微妙的平衡。目前主要使用的LLM开源量化工具主要有：bnb，GPTQ，AWQ

![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/a0f0f479-fc2d-4e38-b5a3-1a9f4fd96f66.png)

float32到float16的过程-来源：LLM Series - Quantization Overview

## 模型评估

LLM评估技术是研究和改进LLM的关键环节。LLM的评估是一项复杂的任务，需要考虑多个方面的评估维度和任务类型，如文本对话、文本生成、多模态场景、安全问题、专业技能（coding/math）、知识推理等。

![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/3f844fa8-5f0d-4f70-a8b2-b063f71d8f05.png)

LLM评估通常可以人工评估和自动评估两大类。其中，自动评估（Automatic evaluation）技术又可以分为rule-based和model-based的方式。其中，rule-based主要面向客观题评价，评测题目通常包含标准答案；model-based方法主要用于评价主观题，如复杂知识推理、多轮会话、文本生成等，通过专家模型（Expert model）来评价目标LLM的生成效果。

魔搭社区提供了一套LLM评估框架--LLMuses，专注于使用自动评估方法来评估LLM在各个任务上的表现。其包含以下特性：

*   轻量化，易于定制
    
*   预置丰富的评估指标
    
*   Model-based模式，提供多种评价模式（Single mode、Pairwise-baseline、Pairwise-all）
    
*   可视化报告
    

## 模型推理加速和部署

魔搭社区的大语言模型LLM支持将模型托管在服务器或者云上，并创建API接口或者Web应用提供给用户与模型交互。

魔搭社区提供了针对不同开发者的模型部署方案：

1.  Swingdeploy：可以通过简单的选择0代码的方式，即可部署魔搭社区的模型到云上并生成供应用程序使用的API接口，支持弹性扩缩容和按需调用。
    
2.  阿里云PAI SDK：魔搭社区和阿里云PAI产品合作，支持通过PAI的python SDK在云上部署模型。
    
3.  vLLM推理加速：魔搭社区和vLLM合作，支持更快更高效的LLM推理服务，基于vLLM，开发者可以通过一行代码实现针对魔搭社区的大语言模型部署。
    
4.  多端异构部署：魔搭社区和Xinference合作，支持对LLM的GGUF和GGML各种部署，支持将模型部署到CPU甚至个人笔记本电脑上。
    
5.  分布式多模型部署：魔搭社区和fastchat合作，支持一行代码部署魔搭社区的大语言模型，支持Web UI和OpenAI兼容的RESTful API。
    

![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/d785225f-3b8d-40df-ab6b-3f1f1c173830.png)

## 模型应用-agent

**Modelscope AgentFabric**是一个交互式智能体框架，用于方便地创建针对各种现实应用量身定制智能体。AgentFabric围绕可插拔和可定制的LLM构建，并增强了指令执行、额外知识检索和利用外部工具的能力。AgentFabric提供的交互界面包括：

*   **⚡ 智能体构建器**：一个自动指令和工具提供者，通过与用户聊天来定制用户的智能体
    
*   **⚡ 用户智能体**：一个为用户的实际应用定制的智能体，提供构建智能体或用户输入的指令、额外知识和工具
    
*   **⚡ 配置设置工具**：支持用户定制用户智能体的配置，并实时预览用户智能体的性能
    

![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/41e7efe3-843a-4b3e-b389-5c1d96150213.png)

![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/87859243-0d5e-4d63-94a6-99273572e223.png)

四、大作业设计

【大作业一：算法微调】

使用SWIFT框架（[https://github.com/modelscope/swift）对大模型(20B以下)进行微调](https://github.com/modelscope/swift）对大模型(20B以下)进行微调), 可选的任务有三个, 你只需要完成以下的一个任务即可。三个任务的难度依次递增, 我们会根据任务的难度和完成质量进行给分. 使用的模型和数据集任意选择。

题目

题目一：情感分类模型

要求:

1. 输入一段文本, 模型可以给出对应的情感分类. 该模型不需要支持多轮对话. 对应的情感分类的类别可以根据选择的数据集进行自行设计, 可以是二分类, 也可以是多分类.

题目二：代码助手模型

要求:

1. 给出一个询问, 例如: "使用python写快排.", 模型可以给出正确的示例代码(以及适当的代码注释). 需要支持一种或多种语言即可 (e.g. python, C, C++等).

2. 具有自我认知. 询问它是谁, 它的开发者是谁, 可以正确的进行回答.

3. 具有一定的多轮对话能力. (可选)

题目三：Agent模型微调

要求:

1. 可以调用以下API: 语音生成, 图像生成, python解析器. 如果可以调用更多的API, 可以酌情加分. 这些API接口可以在Modelscope创空间（[https://www.modelscope.cn/studios）中进行查找](https://www.modelscope.cn/studios）中进行查找), 并自己创建对应的微调数据集. (其中包含通用数据集混合来保持模型的通用能力). 模型可以在需用调用API的时候, 正确调用, 并生成对应的语音, 图像等内容; 不需要调用时, 可以正常回答. 需要保证系统的鲁棒性.

2. 具有自我认知. 询问它是谁, 它的开发者是谁, 可以正确的进行回答.

3. 具有一定的多轮对话能力. (可选)

提交要求

1. 提交训练的模型到ModelScope Hub.

2. 书写对应的模型README.md文件. 需包含模型的名字和简介, 实验环境, 训练方法 (使用的数据集, 微调的模型, 超参数, ...), 示例代码等内容. (示例代码需要实现对应任务要求的效果, 我们会对模型的效果进行测试), 该文件相当于实验报告.

【大作业二：Agent应用设计】

题目

使用ModelScope-Agent搭建一个Agent应用，发布在魔搭创空间，主题不限，最终根据作品的交互体验、创新创意、技术难度、作品展示分享4个维度进行评分。

评分维度

交互体验：作品可正常运行、并考察易用性、用户友好性、交互流畅性；

创新创意：从作品创意的原创性、市场潜力、成长空间、对行业/社会/特定领域的潜在影响力评分；

技术难度：作品对提示词工程（Prompt Engineering）和 大模型工具调用（Function Call）能力运用的灵活性和拓展性；如对ModelScope-Agent开源项目贡献可加分（如 自己通过代码实现工具接入、自己接入llm部分、对ModelScope-Agent提了issue 、提代码到ModelScope-Agent）、使用Multi Agent框架开发多Agent协作的应用作品可加分

作品展示：作品展示的质量，包括完整度、流畅度和吸引力

推荐工具

交互式搭建工具AgentBuilder：[https://www.modelscope.cn/studios/modelscope/AgentFabric/summary](https://www.modelscope.cn/studios/modelscope/AgentFabric/summary)

ModelScope-Agent Github：[https://github.com/modelscope/modelscope-agent](https://github.com/modelscope/modelscope-agent)

更多教程&示例：[https://www.modelscope.cn/brand/view/agent](https://www.modelscope.cn/brand/view/agent)
`
    },
    {
      id: "llm-c-prompt-engineering",
      title: "C. 提示词工程 Prompt Engineering",
      file: "LLM-tutorial/C.提示词工程-prompt engineering.md",
      difficulty: "入门",
      duration: "0.5h",
      week: 1,
      phase: 1,
      keywords: ["Prompt", "提示词工程", "Few-shot", "Chain-of-Thought", "指令设计"],
      content: `# 提示词工程-prompt engineering

**引言**

前一天我们讲到：prompt（提示词）是我们和LLM互动最常用的方式，我们提供给LLM的Prompt作为模型的输入，并希望LLM反馈我们期待的结果。

虽然LLM的功能非常强大，但LLM对提示词（prompt）也非常敏感。这使得提示词工程成为一项需要培养的重要技能。

本节课将会给大家介绍提示词设计的一些技术，

使用环境：[https://modelscope.cn/studios/qwen/Qwen-72B-Chat-Demo](https://modelscope.cn/studios/qwen/Qwen-72B-Chat-Demo/summary)

**让我们从一个问题开始：**

最近尝试部署了qwen模型，我想固定它的输出，比如说“请走向公园。这句话我的目的地是？”，然后让它回答“公园”，但是模型会回答其他无关的字，写了提示词也没有解决，这是有办法固定的吗？我在尝试用RLHF微调，不知道有没有用。（from 知乎网友）

我们可以带着这个问题进入到本节课。

**LLM的超参配置**

LLM提供了一些参数可以影响输出结果的创造力和确定性。

在每个步骤中，LLM 会生成一个最有可能出现的token列表以及其对应的概率列表。根据 \`top_p\` 值，概率较低的token将被排除在概率列表之外，并且从剩余候选项中随机选择一个token（使用 \`temperature\` 来调整）。

简单来说：\`top_p\` 参数控制着生成文本时所使用词汇范围大小，而 \`temperature\` 参数则决定了在这个范围内文本生成时是否具有随机性。当温度接近 0 时，则会得到几乎是确定性结果。

**prompt engineering**

提示工程（Prompt Engineering）是一项通过优化提示词（Prompt）和生成策略，从而获得更好的模型返回结果的工程技术。总体而言，其实现逻辑如下：

![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/f2ff219f-a539-4a8c-bd7d-63b73fa67510.png)

（注：示例图来自Cohere官网）

简单而言，大模型的运行机制是“下一个字词预测”。用户输入的prompt即为大模型所获得上下文，大模型将根据用户的输入进行续写，返回结果。因此，输入的prompt的质量将极大地影响模型的返回结果的质量和对用户需求的满足程度，总的原则是“用户表达的需求越清晰，模型更有可能返回更高质量的结果”。

通常情况下，每条信息都会有一个角色（role）和内容（content）：

*   系统角色（system）用来向语言模型传达开发者定义好的核心指令。
    
*   用户角色（user）则代表着用户自己输入或者产生出来的信息。
    
*   助手角色（assistant）则是由语言模型自动生成并回复出来。
    

**System message系统指令**

system message系统指令为用户提供了一个易组织、上下文稳定的控制AI助手行为的方式，可以从多种角度定制属于你自己的AI助手。系统指令允许用户在一定范围内规定LLM的风格和任务，使其更具可定性和适应各种用例。大部分LLM模型的系统指令System message的权重强化高于人工输入的prompt，并在多轮对话中保持稳定，您可以使用系统消息来描述助手的个性，定义模型应该回答和不应该回答的内容，以及定义模型响应的格式。

默认的System message：You are a helpful assistant.

下面是一些system message的使用示例：

|  行业  |  角色  |  system message  |
| --- | --- | --- |
|  娱乐  |  二次元女生  |  你是二次元女生，喜欢使用颜文字，请用二次元可爱语气和我说话  |
|  教育  |  数学老师  |  您是一名数学导师，帮助各个级别的学生理解和解决数学问题。提供从基础算术到高级微积分等一系列主题的分步解释和指导。使用清晰的语言使复杂的概念更容易理解。  |
|  工作  |  python数据分析师  |  1. 你会数学解题；2. 你会数据分析和可视化；3. 用户上传文件时，你必须先了解文件内容再进行下一步操作；4. 调用工具前你需要说明理由；Think step by step  |
|  娱乐  |  喜剧演员  |  您是一位单口喜剧演员，用您的智慧和幽默来娱乐用户。分享笑话、有趣的故事和幽默的生活观察，同时根据用户的喜好和情感调整您的风格和内容。鼓励欢笑和轻松，同时保持尊重和包容的语气。  |
|  生活  |  小红书文案  |  你是一名小红书文案助手，擅长使用Emoji风格编辑文案。每篇文案包含引入入胜的标题、每个段落开始和结尾均为Emoji表情结尾，并保持原文的意思。  |
|  出行  |  旅行规划师  |  您是一名旅行规划师，通过提供有关目的地、住宿、景点和交通选项的信息来帮助用户制定旅行计划。根据用户的喜好、预算和旅行目标提供量身定制的建议，并分享实用技巧，帮助他们度过一次难忘而愉快的旅行。  |
|  文学  |  文言文大师  |  你是文言文大师，擅长翻译文本为为文言文。  |

System message可以被广泛应用在：

角色扮演：在系统指令中告诉千问你需要它扮演的角色，即可沉浸式和该角色对话交流

语言风格：简单调整LLM的语言风格

任务设定：比如旅行规划，小红书文案助手这样的专项任务处理

System message也可以被用于规定LLM的答复范围，并设定具体的行为。

|  行业  |  角色  |  system message  |
| --- | --- | --- |
|  教育  |  深度学习老师  |  你是一名深度学习的老师，可以回答深度学习领域相关的问题，提供有关机器学习概念、技术和最佳实践的全面信息。提供有关实施机器学习算法、选择适当的工具和框架以及构建端到端机器学习项目的分步指导。说明：1. 仅回答深度学习领域的知识 2. 如果不确定答案，你可以回答我不知道，并建议用户访问模型开源社区：www.modelscope.cn  |

![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/cbff2729-261a-4d61-bc92-5c5acf6e2655.png)

![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/b055e8d5-c7e5-40c9-b9cc-33b274d156cb.png)

**注意：** 即便我们在system message里面规范了模型回答，也不能保障请求一定会满足，但是好的system message设计可以增加特定结果的可能性，以及得到LLM更加符合要求的答复。

**用户提示词（user prompt）**

### 指令

指令是最常用的提示组件，主要功能是向模型说明要执行的操作。虽然概念简单，但是实践中仍然比较复杂，下面是简单和详细的一些指令例子，详细、明确的指导比模糊不清的提示能够产生更好的效果：

|  **指令类型**  |  **prompt**  |  **Completion**   |
| --- | --- | --- |
|  简单指令  |  简要介绍一下阿里巴巴。  |  阿里巴巴集团是一家中国跨国科技公司，成立于1999年。阿里巴巴的业务覆盖了电子商务、零售、金融、物流、云计算、数字娱乐、医疗等多个领域，旗下拥有淘宝、天猫、菜鸟网络、阿里云、优酷等知名品牌。 阿里巴巴集团的愿景是让世界各地的企业都能够平等地进行贸易，让小企业通过数字化技术实现更好的发展。阿里巴巴秉持开放、合作、共赢的理念，致力于打造一个开放、包容、公平的数字经济生态系统，为全球数字经济的发展做出贡献。 阿里巴巴在科技创新和社会责任方面也做出了很多努力。阿里巴巴达摩院是阿里巴巴集团的全球科研机构，致力于推动科技创新和技术进步。阿里巴巴还积极参与公益事业，发起了“阿里巴巴公益基金会”等多个公益项目，致力于推动社会进步和可持续发展。  |
|  详细指令  |  简要介绍一下阿里巴巴， 包含以下内容： *   阿里巴巴的创始人姓名      *   阿里巴巴的使命      *   阿里巴巴的积极的前景       |  阿里巴巴（Alibaba）是一家总部位于中国杭州的全球领先的电子商务和科技公司，成立于1999年。阿里巴巴的创始人是马云和他的团队。阿里巴巴的使命是让世界各地的企业都能够平等地进行贸易，让小企业通过数字化技术实现更好的发展。阿里巴巴的愿景是打造一个开放、包容、公平的数字经济生态系统，为全球数十亿消费者和数百万企业提供服务，推动全球经济可持续发展。 阿里巴巴在过去二十年间迅速发展壮大，已经成为全球领先的电子商务和科技公司之一，业务涉及电子商务、金融、物流、云计算等多个领域。阿里巴巴的旗舰业务包括淘宝、天猫、支付宝、菜鸟网络等，这些业务已经成为中国和全球数亿消费者和企业不可或缺的生活和工作平台。 阿里巴巴在技术创新和社会责任方面也做出了很多努力。阿里巴巴达摩院是阿里巴巴集团的全球科研机构，致力于推动科技创新和技术进步。阿里巴巴还积极参与公益事业，发起了“阿里巴巴公益基金会”等多个公益项目，致力于推动社会进步和可持续发展。 总之，阿里巴巴是一家充满活力和创新精神的公司，其使命和愿景备受赞誉，未来发展前景十分积极。  |

### 主要内容

主要内容是指模型正在处理的文本内容。 主要内容通常与指令一起使用。 下面会从翻译，摘要等场景来示例：

|  **prompt**  |  **completion**  |
| --- | --- |
|  今天天气真好！ 翻译为英文：  |  The weather is really nice today!  |
|  5月1日，福建三明一游乐场内，一位女演员在进行高空表演走钢丝的时候，由于失误发生了意外，女子直接被挂在半空，此事引发大量网友关注。 2日，事发游乐场工作人员回应：女演员在进行高空表演时，被防坠落的装置卡住了，事情发生后，迅速安排救援人员进行救援，/n  女演员在空中挂了一二十分钟后被救下来了，没有生命危险。因为安全保护措施太多了，起到了反作用。 一句话总结这个新闻：  |  游乐场高空表演意外，女演员被挂半空，经过20分钟救援后获救。  |

### 少样本学习

好的prompt也经常包含一些示例样本（单样本或者少样本）学习，指的是需要加入一些示例的输入和输出对。

|  prompt  |  completion  |
| --- | --- |
|  新闻标题：**中国足球艰难前行** 主题：  |  中国足球正面临艰难的时期，但也有许多积极的发展和进步。中国足协在2023年亚洲杯预选赛中成功晋级，这是中国足球历史上的一次重大突破。此外，中国足球也在加强青训体系建设，培养更多优秀的年轻球员。尽管中国足球面临着许多挑战，但我们相信，在全社会的支持下，中国足球未来会变得更加强大。  |
|  新闻标题：中国足球艰难前行 主题：足球 新闻标题：中美纪念“乒乓外交”50周年 主题：乒乓球 新闻标题：广东队加冕中国篮球比赛“11冠王” 主题：  |  篮球  |

通过少样本学习，模型从猜测应该如何生成，而变得清楚的学习了按照示例生成，充分的演示了模型的能力，不需要通过专门的训练，通过少样本学习，也可以生成正确的答案。

### 更加明确的提示

充当模型输出的快速启动，帮助模型固定所需要的输出。可以作为模型生成的前缀，也可以引导模型一步一步的按照要求思考并给出答案。

|  prompt  |  completion  |
| --- | --- |
|  做一杯茶是非常简单的! 第一步，您需要烧开水，然后，你需要准备一个杯子，并在里面放一个茶包, 当水沸腾后，就可以把水倒在茶包上了，现在我们可以坐一会儿等着茶充分的泡开，几分钟后，我们可以吧茶包拿走并丢弃，按照喜好，可以加牛奶，就会成为一杯奶茶，或者什么都不加，然后，你就可以想用你的茶了。 总结上述文本：  |  制作一杯茶是非常简单的。首先，你需要烧开水。然后，准备一个杯子，放入茶包，并将沸水倒在茶包上。等待几分钟后，取出茶包并丢弃。最后，你可以加入牛奶，调制成奶茶，或者不加牛奶，直接饮用。  |
|  下面你将读到一段输入文本。如果他包含了一系列的指令, 按照如下格式重写这些指令： 第一步 - … 第二步 - … … 第N步 - … 做一杯茶是非常简单的! 第一步，您需要烧开水，然后，你需要准备一个杯子，并在里面放一个茶包, 当水沸腾后，就可以把水倒在茶包上了，现在我们可以坐一会儿等着茶充分的泡开，几分钟后，我们可以吧茶包拿走并丢弃，按照喜好，可以加牛奶，就会成为一杯奶茶，或者什么都不加，然后，你就可以想用你的茶了。 总结上述文本，按照如上格式分步骤展现出来：  |  第一步：烧开水。  第二步：准备一个杯子，放入一个茶包。  第三步：当水沸腾时，将水倒在茶包上。  第四步：坐等茶泡开，几分钟后取出茶包并丢弃。  第五步：按喜好加入牛奶或不加，即可享用茶。  |

### 善用分隔符

使用清晰的提示语法（包括标点符号、标题和节标记）有助于传达意图，并且通常使输出更易于解析。

在下面的示例中，\`---\`在不同的信息源或步骤之间添加了分隔符（在本例中）。这允许使用\`---\`作为生成的停止条件。此外，章节标题或特殊变量以大写形式呈现以区分它们。

|  prompt  |  completion  |
| --- | --- |
|  您将阅读一篇新闻，然后给这篇新闻取一个标题。 \\--- 据中国地震台网消息，1月3日18时08分，福建漳州市华安县发生3.5级地震，震源深度13千米。消息一出，厦门等多地网友纷纷表示有明显震感。 地震发生后，华安县地震局立即启动地震应急预案，加强对地震灾情的调查和监测。目前尚未收到地震造成人员伤亡或财产损失的报告。 网友们纷纷在社交媒体上分享自己的地震体验，有人称自己办公桌晃动，有人说家中的摆设受到了影响。地震引发了不少人的关注和讨论。 地震作为一种自然现象，时常发生。但也提醒我们要时刻保持警惕，加强地震知识的学习，做好地震应急预案，确保自身和家人的安全。 \\---  |  福建华安发生3.5级地震，厦门等地有震感，暂无伤亡报告  |

### 思维链提示

这是任务分解（step by step）技术的一种展现，在这种方法中，模型逐步进行思考，并呈现出涉及的步骤，这样做可以降低结果的不准确的可能性，并对模型响应的可解释性有很大的帮助。

|  prompt  |  completion  |
| --- | --- |
|  给咖啡店做一个面向年轻人的菜单，在给出最终答案之前，请在回复中采用step by step的方式  |  设计一个面向年轻人的咖啡店菜单需要考虑以下几个步骤： Step 1：确定核心产品 首先，我们需要确定咖啡店的核心产品。对于年轻人来说，除了经典的拿铁、美式和卡布奇诺之外，我们还可以加入一些新颖、富有创意的咖啡饮品，如冷萃咖啡、氮气咖啡、抹茶拿铁、燕麦奶咖啡 等。 Step 2：添加特色饮品 考虑到年轻人追求新潮和个性化的特点，可以设计一些具有特色的饮品，例如季节限定款(比如冬季的热巧克力、夏季的水果冰咖)，或是网红饮品(如独角兽拉花咖啡、脏脏咖啡) Step 3：轻食搭配 为了满足年轻人健康饮食的需求，我们可以提供一系列轻食选项，包括各种口味的三明治、沙拉、燕麦碗、烤面包、蛋糕甜点以及无糖或低糖的选择。同时，也可以推出一些流行的美食趋势，比如 avocado toast(牛油果吐司)、acai bowl(阿萨伊果冻碗) 等。 Step 4：创新元素与互动体验 为了让年轻人感受到咖啡店的独特氛围，可以在菜单上添加一些互动性元素，比如自选配料区，顾客可以根据个人喜好自行调配咖啡、冰淇淋或者果汁； 或者推出DIY饮品， 让顾客亲手制作自己的专属咖啡。 Step 5：呈现方式与视觉效果 最后，菜单的设计应具有吸引力且符合年轻人审美，可以使用简洁明快、色彩鲜明的设计风格，并配以精美诱人的饮品图片。此外，菜单上的文字描述要充满趣味性和互动感，引起年轻消费者的兴 趣。 综上所述，一个面向年轻人的咖啡店菜单示例可能如下： \\---咖啡--- 1.经典系列： *   拿铁      *   美式      *   卡布奇诺      *   冷萃咖啡      *   氮气咖啡      2.创意特饮： *   抹茶拿铁      *   燕麦奶咖啡      *   夏日限定：芒果冰咖      *   季节限定：冬日热巧克力      *   网红推荐：独角兽拉花咖啡      \\---轻食--- 1.早餐精选： *   香脆培根鸡蛋三明治      *   牛油果吐司      *   自制麦片酸奶杯      2.快餐简餐： *   凯撒沙拉      *   超级食物蔬沙拉      *   烤鸡肉蔬菜卷      3.甜品诱惑： *   巧克力慕斯蛋糕      *   柠檬挞      *   无糖酸奶蓝莓派      \\---互动体验--- 1.DIY咖啡：选择您喜欢的咖啡底料+任意配料(蜂蜜、焦糖酱、奶油、巧克力粉等) 2.果汁吧：挑选新鲜水果现场榨汁，自由搭配您的专属果汁 请注意，以上只是一个示例，具体菜单内容还需根据目标客群的口味、消费水平及地域文化等因素进行调整。  |

### 对输出格式的明确要求

|  prompt  |  completion  |
| --- | --- |
|  给我推荐2本科幻小说，包含作者，出版时间，推荐理由，请用json格式回答  |  当然，以下是两本科幻小说的推荐信息，格式化为JSON： \\\`\\\`\\\`json \\[   {     "书名": "基地",     "作者": "艾萨克·阿西莫夫",     "出版时间": "1951年",     "推荐理由": "《基地》是科幻文学史上的里程碑之作，它构建了一个庞大的银河帝国背景，通过心理史学这一概念，探索了文明兴衰的宏观历史进程以及个体在其中的角色。阿西莫夫以其深邃的想象力和精妙的故事架构，开创了“基地系列”，对后世科幻作品产生了深远影响。"   },   {     "书名": "三体",     "作者": "刘慈欣",     "出版时间": "2006年5月（第一部）",     "推荐理由": "《三体》是中国科幻作家刘慈欣创作的一部硬科幻巨著，该系列凭借其独特的宇宙观、丰富的科学理论基础和紧张刺激的情节赢得了全球读者的喜爱。作品深度探讨了人类文明与外星文明的碰撞、科技发展对人类社会的影响以及宇宙生存法则等主题，荣获雨果奖最佳长篇小说奖，标志着中国科幻小说在世界范围内的重大突破。"   } \\] \\\`\\\`\\\`  |

**最佳实践案例**

## Agent场景，使用prompt实现agent create

[https://github.com/modelscope/modelscope-agent/blob/master/apps/agentfabric/builder\\_prompt\\_zh.py](https://github.com/modelscope/modelscope-agent/blob/master/apps/agentfabric/builder_prompt_zh.py)

|  system message  |  prompt  |
| --- | --- |
|  You are a helpful assistant.  |  你现在要扮演一个制造AI角色（AI-Agent）的AI助手（QwenBuilder）。 你需要和用户进行对话，明确用户对AI-Agent的要求。并根据已有信息和你的联想能力，尽可能填充完整的配置文件： 配置文件为json格式： {"name": "... # AI-Agent的名字", "description": "... # 对AI-Agent的要求，简单描述", "instructions": "... \\ # 分点描述对AI-Agent的具体功能要求，尽量详细一些，类型是一个字符串数组，起始为\\[\\]", "prompt\\_recommend": \\ "... # 推荐的用户将对AI-Agent说的指令，用于指导用户使用AI-Agent，类型是一个字符串数组，请尽可能补充4句左右，\\ 起始为\\["你可以做什么？"\\]", "logo\\_prompt": "... # 画AI-Agent的logo的指令，不需要画logo或不需要更新logo时可以为空，类型是string"} 在接下来的对话中，请在回答时严格使用如下格式，先作出回复，再生成配置文件，不要回复其他任何内容： Answer: ... # 你希望对用户说的话，用于询问用户对AI-Agent的要求，不要重复确认用户已经提出的要求，而应该拓展出新的角度来询问用户，尽量细节和丰富，禁止为空 Config: ... # 生成的配置文件，严格按照以上json格式 RichConfig: ... # 格式和核心内容和Config相同，但是保证name和description不为空；instructions需要在Config的基础上扩充字数，\\ 使指令更加详尽，如果用户给出了详细指令，请完全保留；补充prompt\\_recommend，并保证prompt\\_recommend是推荐的用户将对AI-Agent\\ 说的指令。请注意从用户的视角来描述prompt\\_recommend、description和instructions。 一个优秀的RichConfig样例如下： {"name": "小红书文案生成助手", "description": "一个专为小红书用户设计的文案生成助手。", "instructions": "1. 理解并回应用户的指令；\\ 2. 根据用户的需求生成高质量的小红书风格文案；3. 使用表情提升文本丰富度", "prompt\\_recommend": \\["你可以帮我生成一段关于旅行的文案吗？", \\ "你会写什么样的文案？", "可以推荐一个小红书文案模版吗？"\\], "logo\\_prompt": "一个写作助手logo，包含一只羽毛钢笔"} 明白了请说“好的。”， 不要说其他的。  |

## Agent场景，使用system message+prompt实现function call 

大部分模型将agent的配置在系统提示中配置，比如函数的参数定义和描述，不同模型的函数调用略有不同，

|  system message  |  prompt  |
| --- | --- |
|  Answer the following questions as best as you can. You have access to the following tools: \\[     {         "name": "get\\_current\\_weather",         "description": "Get the current weather in a given location",         "parameters": {             "type": "object",             "properties": {                 "location": {                     "type": "string",                     "description": "The city and state, e.g. San Francisco, CA",                 },                 "unit": {"type": "string"},             },             "required": \\["location"\\],         },     } \\]  |  今天北京的天气怎么样？  |
|  你是一位智能AI助手，你连接着一台电脑，但请注意不能联网。在使用Python解决任务时，你可以运行代码并得到结果，如果运行结果有错误，你需要尽可能对代码进行改进。你可以处理用户上传到电脑上的文件，文件默认存储路径是/mnt/data/。  |  根据我上传的表格文件，分析数据，并绘制年度收入折线图  |

# 写好Prompt的一些原则总结

最核心的写一条好prompt的原则就是尽可能清晰、明确地表达你的需求（类比产品经理向程序员提需求）。细分下来，具体原则包括：

*   **清晰的指令：** 足够清晰明确地说明你希望模型为你返回什么，最后更加细致地说明需求，避免模糊表达。
    
*   **提供上下文和例子：** 给出较为充分的上下文信息，让模型更好地理解相关背景。如果能够提供示例，模型能表现更好（类似传统LLM中的in-context learning）。
    
*   **善用符号和语法：** 使用清晰的标点符号，标题，标记有助于转达意图，并使输出更加容易被解析
    
*   **让模型一步一步的思考：** 在这种方法中，模型逐步进行思考，并呈现出涉及的步骤，这样做可以降低结果的不准确的可能性，并对模型响应的可解释性有很大的帮助。
    
*   **激励模型反思和给出思路：** 可以在prompt中用一些措辞激励模型给出理由，这样有助于我们更好地分析模型生成结果，同时，思维过程的生成，也有助于其生成更高质量的结果。
    
*   **给容错空间：** 如模型无法完成指定的任务，给模型提供一个备用路径，比如针对文本提问，可以加入如果答案不存在，则回复“无答案”
    
*   **让模型给出信息来源：** 在模型结合搜索或者外部知识库时，要求模型提供他的答案的信息来源，可以帮助LLM的答案减少捏造，并获取到最新的信息。
    

# 优质的提示词典型框架

优质的prompt千变万化，但遵循上述原则，我们总结出一个比较实用的框架，可以帮助用户更高概率从通义千问中收获更高质量的模型生成结果。使用LLM时，建议包含如下内容：

*   system message：你希望大模型扮演什么角色，来解决你当前的问题。大模型具有较强的角色扮演能力，相比直接回答往往表现更好。system message中也可以规定大模型的回答范围。
    
*   prompt
    
    *   指令：明确说明你希望大模型做什么事情，不要含糊其辞。
        
    *   例子：如果可能，提供尽可能丰富的例子信息。
        
    *   原因：详细解释你希望模型做这件事情的原因、动机、希望的结果等，这样大模型能更好地理解你的想法，执行需求。
        
    *   step by step：对于复杂任务，让大模型一步一步的思考，可以给出更加合理的答案。
        
    *   对于输出格式的形容：对于部分场景，明确大模型输出格式的要求，可以更好的获取到更加结构化，适合系统调用的答案。
        

# 课后实践

在游戏中学会prompt engineering，通关

### [**https://modelscope.cn/studios/LLMRiddles/LLMRiddles/summary**](https://modelscope.cn/studios/LLMRiddles/LLMRiddles/summary)
`
    },
    {
      id: "llm-d-transformer",
      title: "D. Transformer 结构",
      file: "LLM-tutorial/D.Transformer结构.md",
      difficulty: "中级",
      duration: "0.5h",
      week: 1,
      phase: 1,
      keywords: ["Transformer", "Self-Attention", "多头注意力", "位置编码", "Encoder-Decoder"],
      content: `# Transformer结构模型

在2017年之后，Transformer结构模型几乎横扫一切统治了NLP领域，后面的CV领域和Audio领域也大放异彩。相比LSTM和CNN结构，Transformer结构好在哪里呢？

<img src="file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/qwen3-dense.png" alt="qwen3-dense" style="zoom:50%;" />

这是Qwen3 Dense的模型结构。

既然有Dense模型，那就有MoE模型结构：

<img src="file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/moe.png" alt="moe" style="zoom:50%;" />

介绍下基本结构和流程：

1. Input是原始句子，经过Tokenizer转变为tokens
2. tokens输入模型，第一个算子是Embedder，tokens转换为float tensor
3. 之后进入layers，每个layers会包含一个attention结构，计算Q和K的tensor的内积，并将内积概率化，乘以对应的V获得新的tensor。
4. tensor加上输入的x后（防止层数太深梯度消失）进入Normalization，对tensor分布进行标准化
5. 进入FeedForward（MLP），重新进入下一layer
6. 所有的layers计算过后，经过一个linear求出对vocab每个位置的概率

可以看出，Transformer模型的基本原理是让每个文字的Tensor和其他文字的Tensor做内积（也就是cosine投影值，可以理解为文字的相关程度）。之后把这些相关程度放在一起计算各自占比，再用占比比例分别乘以对应文字的Tensor并相加起来，得到了一个新的Tensor（这个Tensor是之前所有Tensor的概率混合，可以理解为对句子所有文字的抽象）。每个文字都进行如上动作，因此生成的新的Tensor和之前输入的Tensor长度相同（比如输入十个字，计算得到的Tensor还是十个），在层数不断堆叠的情况下，最后的Tensor会越来越抽象出文字的深层次意义，用最后输出的Tensor去计算输出一个新的文字或分类。

MoE结构

将（部分层或全部层）的MLP部分替换为由一个gate控制的专家选择模块：

1. 将每个token选择N个expert
2. 每个expert分别计算自己分到的tokens
3. 将所有tokens按顺序组合在一起

MoE结构可以在更大的模型尺寸下使用更少的激活参数，这相当于在显存足够的条件下，使用更少的计算量达到更好的效果。MoE的效果一般介于激活参数量 × 2-3 倍的 Dense 模型，
可以近似类比为，8×7B（激活13B）大约等效于Dense 30-40B的相同训练质量的模型。因此可以看到，在模型超大时（万亿级别），选择MoE几乎是唯一的路线，因为使用纯粹的Dense模型计算效能太低了。

# Transformer对比CNN和LSTM

- CNN有局部性和平移不变性，促使模型关注局部信息。CNN预设了归纳偏差，这使得小样本训练可以取得较好效果，但在充分数据训练下这一效果也被transformer所掩盖。并且局部性会忽略全局关系，导致某些条件下效果不佳
- LSTM的长距离记忆会导致最早的token被加速遗忘，并且其只能注意单侧信息导致了对句子的理解存在偏差。后来虽然引入了双向LSTM，但其大规模分布式训练仍然存在技术问题
- Transformer结构并不预设归纳偏差，因此需要大数据量训练才有较好效果。但其对于token的并行计算大大加速了推理速度，并且对分布式训练支持较好，因此在目前数据量充足的情况下反而异军突起。由于内置了positional-embedding，因此较好地解决了attention结构中的位置不敏感性

# Encoder和Decoder

<img src="file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/image-20240116212517161.png" alt="image-20240116212517161" style="zoom:30%;" />

如上图所示，左边是encoder，右边是decoder。我们可以看到目前的LLM模型几乎都是decoder结构，为什么encoder-decoder结构模型消失了呢？有以下几个原因：

- encoder-decoder模型分布式训练困难 decoder模型结构简单，其分布式训练相对容易，而encoder-decoder结构的模型由于结构复杂的多导致了训练时工程结构复杂，成本大大增加
- 有论文证明，encoder-decoder模型在参数量不断增加时不具有显著优势。在模型较小时，由于中间隐变量的存在，decoder部分进行交叉注意力会获得更好的效果，但随着模型增大，这些提升变得不再明显。甚至有论文猜测，encoder-decoder结构的收益仅仅是因为参数量翻倍

因此，目前的模型都是decoder模型，encoder-decoder模型几乎销声匿迹。

# 延展阅读

当前transformer模型结构的一些特点

1. 没有使用LayerNorm，而是使用了RMSNorm进行预归一化
2. 使用了RoPE（Rotary Positional Embedding）
3. MLP使用了SwiGLU作为激活函数
4. Group Query Attention（GQA）

## **RMSNorm**

LayerNorm的公式是：
$$
y=\\frac{x-E(x)}{\\sqrt{\\operatorname{Var}(x)+\\epsilon}} * \\gamma+\\beta
$$


RMSNorm的开发者发现，减去均值做中心偏移意义不大，因此简化了归一化公式，最终变为：
$$
 \\begin{align} \\begin{split} & \\bar{a}_i = \\frac{a_i}{\\text{RMS}(\\mathbf{a})} g_i, \\quad \\text{where}~~ \\text{RMS}(\\mathbf{a}) = \\sqrt{\\frac{1}{n} \\sum_{i=1}^{n} a_i^2} \\end{split}\\nonumber \\end{align}
$$


最终在保持效果不变的情况下，计算时间提升了40%左右。

## **RoPE**

BERT模型使用的原始位置编码是Sinusoidal Position Encoding。该位置编码的原理非常简单：
$$
PE_{(pos,2i)}=sin(pos/10000^{2i/d_{\\mathrm{model}}}), PE_{(pos,2i+1)}=cos(pos/10000^{2i/d_{\\mathrm{model}}})
$$


该设计的主要好处在于：

1. 在位置编码累加到embedding编码的条件下，基本满足不同位置编码的内积可以模拟相对位置的数值
2. 随着相对位置增大，其位置编码的内积趋近于0
3. 具备一定的外推特性

LLM常用的位置编码还有AliBi（注意力线性偏置）。该方法不在embedding上直接累加位置编码，而选择在Q*K的结果上累加一个位置矩阵：

![img](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/acb24b1f-4737-4419-9ac3-50651c3fcf75.png)

ALiBi的好处在于：

1. 具备良好的外推特性
2. 相对位置数值很稳定

RoPE的全称是旋转位置编码(Rotary Positional Embedding)，该编码的推导过程和Sinusoidal Position Encoding的推导过程比较类似，不同之处在于后者是加性的，而前者是乘性的，因此得到的位置编码类似于：

<img src="file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/aed18027-66e6-46f6-9649-911564f6886e.png" alt="image-20240116212517161" style="zoom:50%;" />

或者也可以简化为：

<img src="file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/4e8e8ce0-84bb-463a-b28f-e1d6df3c6b4a.png" alt="image-20240116212517161" style="zoom:50%;" />

该位置编码表示相对位置的几何意义比较明显，也就是两个向量的角度差。

该位置编码的优势在于：

1. 位置编码矩阵是单位正交阵，因此乘上位置编码后不会改变原向量模长
2. 相较于Sinusoidal Position Encoding具备了更好的外推特性

## **SwiGLU**

SwiGLU是GLU结构的变种。GLU是和LSTM原理类似，但不能接受时序数据，只能处理定长数据。而且省略了遗忘门与记忆门，只保留了输入门，SwiGLU是将其中的激活函数替换为了SiLU：
$$
\\text{FFN}_{\\text{Swish}}(x, W_1, W_2) = \\text{Swish}_1(xW_1) W_2
$$


其中
$$
\\text{Swish}_{1}
$$


的表达式为：
$$
\\text{Swish}_{\\beta}(x) = x \\sigma(\\beta x)
$$


在SwiGLU的论文中，作者论证了SwiGLU在LOSS收益上显著强于ReLU、GeLU、LeakyGeLU等其他激活方法。

## **GQA**

MHA（Multi-head Attention）是标准的多头注意力机制，具有H个Query、Key 和 Value 矩阵

MQA（Multi-Query Attention，来自于论文：Fast Transformer Decoding: One Write-Head is All You Need）共享了注意力头之间的KV，只为每个头保留单独的Q参数，减少了显存占用。

GQA（Grouped-Query Attention，来自于论文：GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints）在MQA的基础上分成了G个组，组内共享KV。
`
    },
    {
      id: "llm-e-tech-selection",
      title: "E. 技术选型",
      file: "LLM-tutorial/E.技术选型.md",
      difficulty: "中级",
      duration: "0.5h",
      week: 1,
      phase: 1,
      keywords: ["技术选型", "模型选择", "训练框架", "推理框架", "部署方案"],
      content: `# 方法选型

判断自己的场景需要什么样的方法是使用LLM的第一步。下面我们会对比直接推理（提示词工程）、训练、RAG、Agent方法的具体场景，讲解这几种方式的特点，并给出适用场景、使用难度、准确性、成本、缺点几个方面的总结。

## 直接推理（提示词工程）

这种方式特指直接使用现有LLM，利用prompt范式激活模型不同的能力完成特定需求。直接推理方式对开发的要求较低，一般可以完成通用类型的任务，如通用知识问答、角色扮演等。使用方式如下：

\`\`\`text
用户：你是一个经验丰富的导游，请使用导游的话术回答游客的问题。
模型：当然可以！请问你需要问些什么呢？
用户：我想去杭州旅行，请告诉我哪里比较值得去。
模型：当然可以！作为一个导游，我可以为你讲解杭州的风景和美食...
\`\`\`

### 使用难度

- 较低，只需要调用模型接口，编写对应的prompt即可。但编写好的prompt也是具有一定技巧的，具体可以查看我们的教程中的提示词工程部分。

**提示词工程无论是直接推理或训练后推理都是需要的**。

### 适用场景

- 视模型本身的能力而定，在采用该方式之前需要对现有模型针对自己的业务领域进行较为充分的评估。

当前业界效果最好的模型（如Claude4等）在代码和工具调用方面已经具备了非常全面而深入的能力，使用最基本的prompt engineering就可以达到比较好的效果。有一些出色的应用搭建于之上，例如Cursor、OpenHands、Claude Code等，这些应用进需要一定的prompt，辅助以memory管理就可以达到很好的代码编写等效果。

### 准确性

- 由于是原始模型只接受了通用知识的训练，因此在特定领域的场景下可能存在胡编乱造的可能性（幻觉问题）。使用者需要注意自己的专业场景下是否使用该通用模型能解决所有问题，一般建议直接试用该模型给出模型能力的具体评估。

### 成本

- 开发成本较低。如果是开源模型，需要选用合适的硬件及推理方式。这部分在我们教程中的推理章节会有讲解。如果是闭源调用，只需要使用对应模型的接口API即可。

### 缺点

- 由于模型没有经过针对特有领域的知识，因此效果对特定领域会比较不可控。

## 训练

在这里我们所指的训练时post-training，即预训练之后的训练过程，主要包括了：

- 继续训练：使用专业无标注数据继续进行中小规模预训练
- 微调：使用单轮或多轮问答对丰富模型对话能力
- 对齐：让模型输出符合规定的范式
- 蒸馏：分为软蒸馏和数据蒸馏，软蒸馏即同样的数据中，让student模型学习teacher模型的概率分布（KL散度），数据蒸馏即相同的问题，teacher模型回答的标准答案作为数据集给student模型学习。

> 为什么软标签蒸馏是有用的？
> 1. 软标签防止了部分embedding没有梯度
> 2. 软标签防止了过拟合训练数据
> 3. 软标签可以视为y的后验分布，包含了对问题的置信度信息

- 拒绝采样：本模型输出答案，由判别模型遴选高质量答案，重新生成数据集训练，左脚踩右脚的方式
- 宪法AI：模型生成答案后，按照instruction要求模型进行批判，将重新生成的数据和原回答生成偏好对
- RLVR：带有确定答案的强化学习方式，主要为PPO/GRPO，模型自身进行生成（rollout），选择最终答案正确的进行近端优化（意为防止过度偏离当前分布）

在训练技术上，分为全量训练和清凉训练。
全量训练和轻量训练是训练的两种方式，它们的区别在于：

全量训练在给定LLM模型上冻结一定的参数（或不冻结任何参数）进行训练，一般耗费显存较高，训练周期比较长。受限于成本问题，轻量微调方式主要方案是在模型结构上附着一个额外结构，在训练时冻结原模型并训练额外结构，推理时将额外结构加载起来或合并回原来模型。轻量微调的主流结构是LoRA，该结构理解简单，训练成本较低，在部分任务上可以接近全量微调的效果。

轻量微调另一个方式就是量化（请查看另一篇文章），即对模型的float32权重或float16权重进行缩放，使其变成int类型的整形，节省显存或计算时长。

- 一般情况下建议选择轻量训练，优先使用LoRA等方式
- 如果效果不好，可以考虑解冻原模型的部分参数，比如normalizer、embedder等进行训练，也就是全量训练+轻量训练的方式
- 如果显存受限，可以考虑使用量化进行训练。量化和轻量训练并不互斥，比如QLoRA（量化+LoRA），但需要注意量化后训练和推理结果会有所下降

一般来说，预训练或继续训练不建议使用轻量训练，小数据量微调情况下建议优先使用轻量训练。

<img src="file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/image-20240116221933263.png" alt="640" style="zoom:50%;" />

### 适用场景

- 场景存在特殊知识，需要进行知识灌注，可以使用继续训练+全量训练
- 需要对回复的风格或范式进行定制化，可以使用人类对齐训练或微调+全量/轻量训练
- 模型原有能力不够，如对读入的doc文件进行理解并进行归纳总结，或特有场景的文本进行分类，但原有模型对该任务的回答存在问题，可以使用微调+全量/轻量训练

> 简单来说，模型的训练是让模型“找规律”的过程。比如告诉模型1+1=2, 2+2=4，那么让模型分析3+3=？
>
> 如果数据是带有规律的，比如文字顺序、逻辑关系、图片元素（比如斑马总是带有黑白色的条纹），那么训练就可以将这些规律抽象出来；如果数据是“无规律的知识”，比如用A解决B问题，用C解决D问题，那么这些数据训练后就几乎不具有泛化性，因为模型无法分析出出现了E问题应该用A解决还是B解决，这时候应当选用RAG或者Agent方式，或者训练的目标改为让模型熟悉使用工具来解决问题。

### 使用难度

- 训练需要对模型结构、训练的流程有所了解。其理解成本比RAG高一些。

### 准确性

- 准确性依照训练的结果而定，训练后模型会按照训练集的风格和方式回答问题。一般来说训练后模型能力会有较大提升，但仍然可能存在幻觉问题。

### 成本

- 比较高，需要有懂训练的算法人员和相应的GPU设备

### 缺点

- 相比RAG，输出可解释性不强
- 存在幻觉问题
- 在精确问答场景上可能会产出非专业结果（如法律行业）
- 对知识更新频繁的场景不适用
- 超大模型训练成本较高，而且使用自己的数据训练不一定能得到比原模型更好的效果

## RAG

RAG即检索增强生成，也就是通过模型外挂知识库的方式来辅助模型回答。一般来说会将用户问题变为向量，进向量数据库进行查询，并召回符合条件的文档或回答，之后将回答直接返回或输入模型整理后返回。RAG可以查看另一篇教程。

RAG和微调的选型问题一直是被问的较多的问题之一，两种方法的对比可以查看下表：

<img src="file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/640.png" alt="640" style="zoom:50%;" />

如果模型本身对专业知识理解不够（比如模型对召回的文档不能进行良好分析的情况），那么使用RAG是不够的，需要进行模型训练，或将模型训练和RAG结合起来使用。

### 适用场景

- 需要根据语料精确回答，比如法律或医疗领域
- 搜索召回场景，比如搜索引擎
- 知识频繁更新，灵活性较强的场景

### 使用难度

- 需要对RAG流程有所了解，选用对应的RAG框架或解决方案

### 准确性

- 准确性较高，可解释性也较高

### 成本

- 除模型本身的成本外，需要额外的向量数据库和工程端开发成本和维护成本

### 缺点

- 比模型直接回答多了查询召回步骤，单请求整体RT高一些
- 如果场景和知识无关，比如非知识类问答，或API调用，或文档分析，文章总结等，RAG就不能起到作用

## Agent

Agent适合于利用模型进行代码编写运行、API调用的复杂场景。Agent的主要思路是利用模型的CoT（思维链）能力进行复杂场景的流程串接。比如“生成一个具有今天天气特征的海报”，模型会先调用天气预报接口获得天气，之后生成海报文案，然后调用文生图模型生成海报。

### 适用场景

- 一般的应用场景基本都会用到
- 宽泛的agent流程包含了RAG

### 使用难度

- 需要了解不同Agent框架的适用范围，找到合适自己的
- 需要熟悉模型的提示词工程才能做到较好的效果

### 准确性

- 一般来说模型越大准确性越高
- 在格外复杂的场景下，比如任务复杂、描述含混不清、模型对行业流程不理解的情况下，需要对模型进行额外训练。

### 成本

- 一般和模型部署成本相同

### 缺点

- 对复杂的业务和人类复杂的行为如博弈、交流->更新的场景支持不好。比如，尚不能用Agent编写复杂的APP如淘宝，也不能模拟股市大盘。

# 模型选型

目前国内外开源模型已经超过了几百个，挑选合适的模型是一个比较关键的问题。在这里可以给出一些泛泛的意见：

- Agent场景尽量选择较大的模型或者闭源LLM API（如Claude4、Gemini）

- 训练场景中，数据量较大（比如大于10000条）、数据质量较高、专业度较高的训练优先选择base模型，数据量较少优先选择chat模型。在算力允许条件下可以进行对比训练实验

- 关注国内外的开源可信模型榜单，选择排名较高或口碑较好的模型
`
    },
    {
      id: "llm-f-data-preprocessing",
      title: "F. 数据预处理",
      file: "LLM-tutorial/F.数据预处理.md",
      difficulty: "中级",
      duration: "1h",
      week: 2,
      phase: 2,
      keywords: ["数据预处理", "数据清洗", "Tokenizer", "数据集构建", "数据增强"],
      content: `在模型训练过程中，数据及数据处理是最为重要的工作之一。在当前模型训练流程趋于成熟的情况下，数据集的好坏，是决定了该次训练能否成功的最关键因素。

在上一篇中，我们提到了模型训练的基本原理是将文字转换索引再转换为对应的向量，那么文字转为向量的具体过程是什么？

# 分词器（Tokenizer）

在NLP（自然语言处理）领域中，承担文字转换索引（token）这一过程的组件是tokenizer。每个模型有自己特定的tokenizer，但它们的处理过程是大同小异的。

首先我们安装好魔搭的模型库modelscope和训练框架swift：

\`\`\`shell
# 激活conda环境后
pip install modelscope ms-swift -U
\`\`\`

我们使用“千问1.8b”模型将“杭州是个好地方”转为tokens的具体方式是在python中调用：

\`\`\`python
from modelscope import AutoTokenizer
tokenizer = AutoTokenizer.from_pretrained("qwen/Qwen-1_8B-Chat", trust_remote_code=True)
print(tokenizer('杭州是个好地方'))
# {'input_ids': [104130, 104104, 52801, 100371], 'token_type_ids': [0, 0, 0, 0], 'attention_mask': [1, 1, 1, 1]}
\`\`\`

其中的input_ids就是上面我们说的文字的token。可以注意到token的个数少于实际文字的数量，这是因为在转为token的时候，并不是一个汉字一个token的，可能会将部分词语变为一个token，也可能将一个英文转为两部分（如词根和时态），所以token数量和文字数量不一定对得上。

# 模板（Template）

每种模型有其特定的输入格式，在小模型时代，这种输入格式比较简单：

\`\`\`text
[CLS]杭州是个好地方[SEP]
\`\`\`

[CLS]代表了句子的起始，[SEP]代表了句子的终止。在BERT中，[CLS]的索引是101，[SEP]的索引是102，加上中间的句子部分，在BERT模型中整个的token序列是：

\`\`\`text
101, 100, 1836, 100, 100, 100, 1802, 1863, 102
\`\`\`

我们可以看到，这个序列和上面千问的序列是不同的，这是因为这两个模型的词表不同。

在LLM时代，base模型的格式和上述的差不多，但chat模型的格式要复杂的多，比如千问chat模型的template格式是：

\`\`\`text
<|im_start|>system
You are a helpful assistant!
<|im_end|>
<|im_start|>user
How are you?<|im_end|>
<|im_start|>assistant
\`\`\`

其中“You are a helpful assistant!”是system字段，“How are you?”是用户问题，其他的部分都是template的格式。

system字段是chat模型必要的字段，这个字段会以命令方式提示模型在下面的对话中遵循怎么样的范式进行回答，比如：

\`\`\`text
“You are a helpful assistant!”
“下面你是一个警察，请按照警察的要求来审问我”
“假如你是一个爱哭的女朋友，下面的对话中清扮演好这个角色”
\`\`\`

system字段规定了模型行为准则，比如当模型作为Agent使用时，工具集一般也是定义在system中的：

\`\`\`text
“你是一个流程的执行者，你有如下工具可以使用：
工具1：xxx，输入格式是：xxx，输出格式是：xxx，作用是：xxx
工具2：xxx，输入格式是：xxx，输出格式是：xxx，作用是：xxx”
\`\`\`

复杂的template有助于模型识别哪部分是用户输入，哪部分是自己之前的回答，哪部分是给自己的要求。

比较麻烦的是，目前各开源模型还没有一个统一的template标准。在SWIFT中，我们提供了绝大多数模型的template，可以直接使用：

\`\`\`python
register_template(
    TemplateType.default,
    Template([], ['### Human:\\n', '{{QUERY}}\\n\\n', '### Assistant:\\n'],
             ['\\n\\n'], [['eos_token_id']], DEFAULT_SYSTEM, ['{{SYSTEM}}\\n\\n']))

# You can set the query as '' to serve as a template for pre-training.
register_template(TemplateType.default_generation,
                  Template([], ['{{QUERY}}'], None, [['eos_token_id']]))
register_template(
    TemplateType.default_generation_bos,
    Template([['bos_token_id']], ['{{QUERY}}'], None, [['eos_token_id']]))

qwen_template = Template(
    [], ['<|im_start|>user\\n{{QUERY}}<|im_end|>\\n<|im_start|>assistant\\n'],
    ['<|im_end|>\\n'], ['<|im_end|>'], DEFAULT_SYSTEM,
    ['<|im_start|>system\\n{{SYSTEM}}<|im_end|>\\n'])
register_template(TemplateType.qwen, qwen_template)
register_template(TemplateType.chatml, deepcopy(qwen_template))
...
\`\`\`

有兴趣的小伙伴可以阅读：https://github.com/modelscope/swift/blob/main/swift/llm/utils/template.py 来获得更细节的信息。

template拼接好后，直接传入tokenizer即可。

微调任务是标注数据集，那么必然有指导性的labels（模型真实输出）存在，将这部分也按照template进行拼接，就会得到类似下面的一组tokens：

\`\`\`text
input_ids: [34,   56,   21,   12,   45,   73, 96, 45, 32, 11]
           ---------用户输入部分---------   ----模型真实输出----
labels:    [-100, -100, -100, -100, -100, 73, 96, 45, 32, 11]
\`\`\`

在labels中，我们将用户输入的部分（问题）替换成了-100，保留了模型输入部分。在模型进行运算时，会根据input_ids的前面的tokens去预测下一个token，就比如：

\`\`\`text
已知token                    预测的下一个token
34                        ->17
34,56                     ->89
...
34,56,21,12,45            ->121
34,56,21,12,45,73         ->99
34,56,21,12,45,73,96      ->45
34,56,21,12,45,73,96,45   ->14
34,56,21,12,45,73,96,45,32->11
\`\`\`

可以看到，这个预测不一定每个都预测对了，而且呈现了下三角矩阵的形态。那么训练的时候就可以这样进行对比：

\`\`\`text
34,   56,   21,   12,   45,  121,  99,  45,  32,  11
-100, -100, -100, -100, -100, 73,  96,  45,  14,  11
\`\`\`

-100部分计算loss时会被忽略，因为这是用户输入，不需要考虑预测值是什么。只要对比下对应的位置对不对就可以计算它们的差异了，这个差异值被称为**loss**或者**残差**。我们通过计算梯度的方式对参数进行优化，使模型参数一点一点向**真实的未知值**靠近。使用的残差算法叫做**交叉熵**。

在SWIFT中提供了根据模型类型构造template并直接转为token的方法，这个方法输出的结构可以直接用于模型训练和推理：

\`\`\`python
from swift.llm.utils import get_template, Template
from modelscope import AutoTokenizer
tokenizer = AutoTokenizer.from_pretrained("qwen/Qwen-1_8B-Chat", trust_remote_code=True)
template: Template = get_template(
    'qwen',
    tokenizer,
    max_length=256)
resp = template.encode({'query': 'How are you?', "response": "I am fine"})[0]
print(resp)
# {'input_ids': [151644, 8948, 198, 2610, 525, 264, 10950, 17847, 13, 151645, 198, 151644, 872, 198, 4340, 525, 498, 30, 151645, 198, 151644, 77091, 198, 40, 1079, 6915, 151645], 'labels': [-100, -100, -100, -100, -100, -100, -100, -100, -100, -100, -100, -100, -100, -100, -100, -100, -100, -100, -100, -100, -100, -100, -100, 40, 1079, 6915, 151645]}
\`\`\`

input_ids和labels可以直接输入模型来获取模型的输出：

\`\`\`python
from modelscope import AutoModelForCausalLM
import torch
model = AutoModelForCausalLM.from_pretrained("qwen/Qwen-1_8B-Chat", trust_remote_code=True).to(0)
resp = {key: torch.tensor(value).to(0) for key, value in resp.items()}
output = model(**resp)
print(output)
\`\`\`
`
    },
    {
      id: "llm-g-quantization",
      title: "G. 量化",
      file: "LLM-tutorial/G.量化.md",
      difficulty: "中级",
      duration: "0.5h",
      week: 2,
      phase: 2,
      keywords: ["量化", "INT8", "INT4", "GPTQ", "AWQ"],
      content: `# 量化是什么

前文中我们提到，模型的推理过程是一个复杂函数的计算过程，这个计算一般以矩阵乘法为主，也就是涉及到了并行计算。一般来说，单核CPU可以进行的计算种类更多，速度更快，但一般都是单条计算；而显卡能进行的都是基础的并行计算，做矩阵乘法再好不过。如果把所有的矩阵都加载到显卡上，就会导致显卡显存的占用大量增加，尤其是LLM模型大小从7b、14b、34b到几百b不等，占用显存的大小就是惊人的数字，如何在减少运算量和显存占用的条件下，做到推理效果不下降太多呢？在这里需要引入浮点数和定点数的概念。

![img](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/a0f0f479-fc2d-4e38-b5a3-1a9f4fd96f66.png)

双精度浮点数：在PyTorch中用**torch.float64**表示，或者在其他语言中也称为double类型，在LLM训练中一般比较少用

全精度浮点数：在PyTorch中用**torch.float32**表示

低精度浮点数：在PyTorch中用**torch.bfloat16和torch.float16**表示。这两个浮点数的差别在上图中可以表示：

1. bfloat16的小数部分较短，整数部分较长，这会有利于在训练中减少梯度爆炸的情况（即梯度累加值超过了最大值），但是这种数据类型是在N系列显卡Ampere系列才支持的，即**30系列**显卡。
2. float16的小数部分较长，这意味着在精度控制上float16更好，但整数部分较短，比较容易梯度爆炸。

那么是否有更加减少显存占用和计算量的数值表达方式呢？那么可以考虑是否把浮点数转换为定点数（整数），整数计算更快更省显存，如果计算精度下降不大就很完美了。这种用整数计算代替浮点数计算的方法就是**量化**。

量化的基本原理是**根据每个tensor的浮点型最大值和最小值，将其映射为一个固定范围的整形数值集合**，比如[-127~127]。假设一个简单的公式：qweight=round(weight/scale)，其中qweight代表量化后权重，weight代表量化前权重，scale代表缩放因子，可以看到在进行缩放后为了将浮点型转换为整数过程中增加了round操作丢失了小数部分。在后续计算或反量化为浮点型时存在无法完全还原的情况，这就是精度损失。

按照量化发生的步骤区分，可以划分为**PTQ（训练后量化，或离线量化）和QAT（训练感知型量化，或在线量化）**。PTQ量化可以分为data-free和calibration两种，前者不使用数据集进行校准直接计算量化因子，后者会根据少量真实数据进行统计分析并对量化因子进行额外校准，但耗费的时间更长。QAT量化会先在待量化的算子上增加一个伪量化结构，并在训练时模拟量化过程并实时更新计算量化因子（类似反向传播过程）及原始权重。QAT由于较为复杂一般作为辅助措施存在，用于改进PTQ量化的技术手段。

按照量化方法可以划分为**线性量化、非线性量化（如对数量化）**等多种方式，目前较为常用的是线性量化。其中线性量化又可以按照对称性划分为**对称量化和非对称量化**，非对称量化为了解决weight分布不均匀问题，其在公式中增加了zero_point项：qweight=round(weight/scale + zero_point)，使稠密数据部分可以得到更宽泛的数值范围。



<img src="file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/image-20240116173833918.png" alt="image-20240116173833918" style="zoom:50%;" />

<img src="file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/image-20240116173902206.png" alt="image-20240116173902206" style="zoom:50%;" />

按照量化粒度划分可以分为**逐层量化（每层使用一套量化因子）、逐组量化（在每层中按照group使用一套量化因子）、逐通道量化（按channel划分量化因子）**等几种方式。

按照量化最大值的阈值区分，可以分为**饱和量化和不饱和量化**两种。不饱和量化按照浮点数最大值和量化后最大值的比例计算量化因子，由于原始weight的非均匀性会导致某些整形数值范围存在权重空缺。饱和量化会计算一个中间值以计算出量化因子，因此会舍弃一部分不重要数据，将重要数据尽量均匀的分布到量化数值范围内。

按照量化后的比特数划分，可以分为2比特量化，4比特量化，8比特量化等类型。

一般来说，PyTorch中量化模块的forward过程会先对量化权重进行反量化后使用浮点数进行计算。

下面介绍几种常用的量化库。

# AutoGPTQ

该库需要引入额外的校准数据集进行量化校准。相比bitsandbytes量化精度较高，推理速度较快，但**训练后不支持合并adapter**。

\`\`\`python
# 例子来自于https://github.com/PanQiWei/AutoGPTQ
from modelscope import AutoTokenizer, snapshot_download
from auto_gptq import AutoGPTQForCausalLM, BaseQuantizeConfig
import logging
import shutil
import os

logging.basicConfig(
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s", level=logging.INFO, datefmt="%Y-%m-%d %H:%M:%S"
)

pretrained_model_dir = snapshot_download("qwen/Qwen-1_8B-Chat")
quantized_model_dir = "qwen-1_8B-4bit"

shutil.rmtree(quantized_model_dir, ignore_errors=True)
shutil.copytree(pretrained_model_dir, quantized_model_dir)
for _file in os.listdir(quantized_model_dir):
    if ".safetensors" in _file or ".bin" in _file:
        os.remove(os.path.join(quantized_model_dir, _file))

tokenizer = AutoTokenizer.from_pretrained(pretrained_model_dir, use_fast=True, trust_remote_code=True)
examples = [
    tokenizer(
        "auto-gptq is an easy-to-use model quantization library with user-friendly apis, based on GPTQ algorithm."
    )
]

quantize_config = BaseQuantizeConfig(
    bits=4,  # quantize model to 4-bit
    group_size=128,  # it is recommended to set the value to 128
    desc_act=False,  # set to False can significantly speed up inference but the perplexity may slightly bad
)

# load un-quantized model, by default, the model will always be loaded into CPU memory
model = AutoGPTQForCausalLM.from_pretrained(pretrained_model_dir, quantize_config, trust_remote_code=True).to(0)

# quantize model, the examples should be list of dict whose keys can only be "input_ids" and "attention_mask"
model.quantize(examples)

# save quantized model
model.save_quantized(quantized_model_dir)

# save quantized model using safetensors
model.save_quantized(quantized_model_dir, use_safetensors=True)

# load quantized model to the first GPU
model = AutoGPTQForCausalLM.from_quantized(quantized_model_dir, device="cuda:0", trust_remote_code=True)
# inference with model.generate
print(tokenizer.decode(model.generate(**tokenizer("auto_gptq is", return_tensors="pt").to(model.device))[0]))
\`\`\`

在SWIFT中，可以使用已经量化好的AutoGPTQ模型直接进行训练：

\`\`\`shell
swift sft --model_id_or_path qwen/Qwen-7B-Chat-Int4 --model_revision master --sft_type lora --tuner_backend swift --template_type qwen --dtype fp16 --output_dir output --dataset leetcode-python-en --train_dataset_sample -1 --num_train_epochs 1 --max_length 512 --check_dataset_strategy warning --lora_rank 8 --lora_alpha 32 --lora_dropout_p 0.05 --lora_target_modules ALL --gradient_checkpointing true --batch_size 1 --weight_decay 0.01 --learning_rate 1e-4
\`\`\`

上面的命令行中，\`qwen/Qwen-7B-Chat-Int4\`是已经量化好的Qwen-7B-Chat模型。

# Bitsandbytes

bitsandbytes是一种data-free的量化库。该量化方法速度较快（因为其不需要数据校准），因此可以在模型加载时动态量化，且该方法训练速度较快，因此训练兼容性较好，一般用于QLoRA训练中，且训练后可以合并adapter。当由于其没有数据校准过程，因此精度较AutoGPTQ较低。

\`\`\`python
from modelscope import AutoModelForCausalLM, AutoTokenizer
import torch

model = AutoModelForCausalLM.from_pretrained(
  'qwen/Qwen-1_8B-Chat',
  load_in_8bit=True,
  trust_remote_code=True)

tokenizer = AutoTokenizer.from_pretrained('qwen/Qwen-1_8B-Chat', trust_remote_code=True)

print(model(**tokenizer('how are you?', return_tensors='pt')))
\`\`\`

# GGML

GGML和GGUF是[GGML](https://github.com/ggerganov/ggml) C++推理库的两种量化格式，其中GGUF格式较新，可以保留模型版本等其他自定义信息。这两种格式也是PTQ形式的量化算法，但GGML和GGUF格式的量化算法更适配于CPU推理，因此在CPU上运行更快，而GPTQ量化对GPU更加友好，两者的推理精度相仿。因此，*.cpp类型使用了GGML推理库的推理框架都更适配于CPU推理。

# AWQ

[AWQ量化](https://docs.vllm.ai/en/latest/quantization/auto_awq.html)方式假设不是所有权重都影响模型性能，因此在量化过程中会对特殊权重进行特殊处理以减轻量化过程中的精度损失。因此在和GPTQ量化保持类似推理速度的同时可以具备更好的精度。

目前VLLM对AWQ的支持较好, 可以考虑在推理加速时使用AWQ量化方式。
`
    },
    {
      id: "llm-h-training",
      title: "H. 训练",
      file: "LLM-tutorial/H.训练.md",
      difficulty: "中级",
      duration: "0.5h",
      week: 2,
      phase: 2,
      keywords: ["模型训练", "微调", "LoRA", "全参数训练", "分布式训练"],
      content: `# 微调（Supervised Finetuning）

指令微调阶段使用了**已标注数据**。这个阶段训练的数据集数量不会像预训练阶段那么大，最多可以达到几千万条，最少可以达到几百条到几千条。指令微调可以将预训练的知识“涌现”出来，进行其他类型的任务，如问答类型的任务。一般指令微调阶段对于在具体行业上的应用是必要的，但指令微调阶段一般不用于灌注大量新知识，而是将已有知识的能力以某类任务的形式展现出来。

指令微调任务有多种场景，比较常用的有：

- 风格化：特定的问答范式
- 自我认知：自我认知改变
- 能力增强：模型本身能力不够，对具体行业的数据理解不良
- Agent：支持Agent能力，比如程序编写、API调用等

上述只是举了几个例子，一般来说距离用户最近的训练方式就是指令微调。

一般来说，LLM中指的base模型是指经过了预训练（以及进行了一部分通用指令的微调）的模型。Chat模型是经过了大量通用数据微调和人类对齐训练的模型。

如何选择base模型和chat模型进行微调呢？

- 数据量较少的时候（比如小于几万条）建议使用chat模型微调
- 数据量较多、数据较为全面的时候，建议使用base模型微调

当然，如果硬件允许，建议两个模型都进行尝试，选择效果较好的。需要注意的是，chat模型有其独特的输入格式，在微调时一定要遵循。base模型的输入格式一般比较简单（但也需要遵守该格式），而且一般该格式不支持多轮数据集。

# 重要概念

1. loss 代表模型求解的y和实际的y值的差异。该值会进行loss.backward()，这个方法会求解梯度，并将对应梯度值记录在每个参数上

   loss可以理解为根据模型计算出来的值和正确值的偏差（也就是残差）。 例如，回归任务中计算的值是1.0，而实际的值应当为2.0，那么loss为2.0-1.0=1.0。上述loss类型为MAE，除此外，还有MSE，Hinge等各类loss。一般分类任务的loss为[交叉熵（Cross-Entropy）](https://zhuanlan.zhihu.com/p/61944055)，这也是目前LLM最常用的loss。

   loss计算出来后（这个过程也就是forward，即前向推理），经过backward过程即可计算出梯度。

   > 梯度：光滑的曲面上导数变化最大的方向

   loss可以经过PyTorch的loss.backward()将每个算子、每个步骤的梯度都计算出来（复杂微分方程的链式求导过程），当有了梯度后，可以将参数往负梯度方向更新，学习率（lr）就是这时候起作用的，由于直接加上负梯度太大，可能直接产生震荡，即值从一个点瞬间跑到了曲线上的另一个点，导致在这两点反复震荡不收敛，因此乘以一个lr，让loss一点点下降。

2. epoch 代表对数据集训练多少轮次

3. iter 对模型参数的一次更新代表一个iter

4. batch_size 批处理大小。在一次前向推理中，同时处理多少行数据。由于同一批数据会并行求解梯度，因此batch_size越大，梯度越稳定。在SFT时较为合适的梯度一般选择为16/32/64等值
   1. batch_size越大，并行计算消耗的显存越高。因此在低显存情况下，可以选用batch_size=1，gradient_accumulation_steps=16。训练会在iter%gradient_accumulation_steps==0时集中进行一次参数更新。在iter%gradient_accumulation_steps!=0时，会将梯度值不断累加到参数上，这样就相当于将batch_size扩大了gradient_accumulation_steps倍
   2. batch_size设置的过大，会导致更新步数过少，起不到收敛效果

5. learning_rate 学习率 训练将负梯度值乘以该值加到原参数上。换句话说，每次只将参数更新一个小幅度，避免向错误的更新方向移动太多。

   > 一般LoRA的学习率可以比全参数训练的学习率稍高一点，因为全参数训练会完全重置所有参数，训练时需要学习率更低。
   > LLM训练的学习率一般设置在1e-4~1e-6不等

6. max_length 输入句子的最大长度。比如设置为4096，那么句子加答案转换为token后最大长度为max_length。这个值会影响显存占用，需要按照自己的实际需求设置。
   1. 当batch_size大于1时，意味着不同句子的长度可能不同。data_collator的作用就是按照固定max_length或者batch中的最大长度对其他句子的token进行补齐。补齐的部分不参与模型的loss计算，但仍然会占用计算量

7. flash_attention flash attention是一种针对attention结构高效计算的组件，该组件主要原理利用了显卡的高速缓存。flash attention会节省约20%~40%训练显存并提高训练速度，对训练精度没有不良影响。在显卡支持的情况下建议开启。

8. optimizer

   optimizer是深度学习中的优化器，负责将负梯度值累加到原来需要更新的参数上，类似于：

   > Vanilla SGD
   >
   > weights = weights - learning_rate * grad

   实际的原理会比较复杂，比如常用的AdamW实际上是一个复杂的滑动平均的算法。

9. lr_scheduler

   一般来说，训练各个阶段的学习率是不一样的，有时候需要越来越小（因为训练到最后需要更精细的调节），有时候需要先有个warmup（先将lr从0增大到指定值，再慢慢减小），lr_scheduler就是用来动态调整lr使用的组件。

10. gradient_checkpointing 梯度检查点。该方法的原理是将训练时的中间变量在前向过程中暂时丢弃，并在后向过程中重新计算。该方法可以有效节省训练显存，但属于时间换空间的做法，因此训练时间会变长。对显存的节省可以达到30%-70%不等。训练速度会减慢20%-40%不等。

训练有很多超参数，它们的含义和设置技巧可以[参考这里](https://swift.readthedocs.io/zh-cn/latest/Instruction/%E5%91%BD%E4%BB%A4%E8%A1%8C%E5%8F%82%E6%95%B0.html)。

# 分布式训练（Distributed Training）

由于较大模型可能在单张显卡上显存溢出，或者训练速度不够，因此单机多卡或多机多卡训练是必要的。在训练过程中的分布式训练有以下几种模式：

- DDP 分布式数据并行。将训练集的数据分段拆分到不同的进程中，这种训练方式相当于增加了batch_size。比如四个进程，每个进程batch_size=1，则总体batch_size=4。在计算梯度时，torch框架会自动将四个进程的梯度进行累加平均。该方法会提高训练速度，但如果模型在单张显卡上显存溢出，DDP方式也无法运行。

- MP 模型并行。模型并行分为多种方式，如tensor并行、device_map、流水线并行、FSDP等。
  - tensor并行：将矩阵拆分到多张显卡上，比如，将一个2048x2048的矩阵，拆分为两个1024x2048的矩阵，在前向推理时在显卡间通讯，完成一次推理，这样一个模型的显存需求就被平均拆分到两个显卡上。tensor并行最知名的框架是Megatron。

  - device_map并行：自动计算如何将模型拆分到多个显卡上。比如一个模型按照顺序分为embedder、layer0~95、output，device_map可能将这些参数均分到两张显卡上，比如embedder、layer0~48分配到显卡1上，layer49~95、output分配到显卡2上。相比Megatron，device_map方式较为低效，因为使用该方法训练或推理时，显卡1计算时显卡2是空闲的，计算效率较低；而Megatron是同时使用两个显卡计算，效率较高

  - 流水线并行：类似于device_map，将模型按照layer拆分到不同显卡上，Megatron的流水线并行会增加额外的并行度，尽量让空闲显卡并行计算不同的数据，达到挤掉气泡的效果

  - FSDP，在讲FSDP前需要先讲解DeepSpeed的ZeRO优化方式
    - ZeRO-1：类似DDP，但是将Optimizer的state均分维护到不同的进程中，每次更新参数后对所有进程的参数进行同步更新

    - ZeRO-2：在ZeRO-1的基础上，将不同层的梯度值均分维护到不同的进程中，每次每个进程同步梯度后更新自己负责的梯度对应的参数部分，并在更新后对所有的进程的参数进行同步

    - ZeRO-3：在ZeRO-2的基础上，将不同层的模型参数也均分到不同的进程中。每个进程在计算某层结果时，从其他进程中获得对应的层的参数，计算完后抛弃该层参数；backward时，也从其他进程获得对应层的参数并同步梯度信息，计算完后抛弃该层参数。这样每个进程就在仅保存某些层的参数的条件下完成了数据并行计算
    
    - ZeRO-3-Offload: 在ZeRO-3基础上，将一定的参数或optimizer卸载到内存中，使用的时候加载回来
    
    - ZeRO++: 由于ZeRO3会均匀将参数切分到所有卡中，导致大规模训练时通讯效率低下，ZeRO++会将模型参数拆分到同一个机器的N（一般是8）张卡中

    - FSDP就是ZeRO-3的并行策略，FSDP2支持了ZeRO++同类型算法

# LoRA

LoRA是一个非常重要的可调优结构，简单来说，就是增加了一个额外可训练部分，比如原来的Linear的矩阵是MxN维，增加一个LoRA，该LoRA会包含两个参数量较少的矩阵：Mxd, dxN，这两个矩阵相乘后仍然是MxN维的，训练时原MxN矩阵冻结，只训练LoRA的两个矩阵，参数量就会大大减少。

<img src="file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/image-20240116223558024.png" alt="image-20240116223558024" style="zoom:30%;" />

为什么模型本身的矩阵不使用这种形式？

一般大规模矩阵的非零特征值数量会远远小于矩阵的维度，这个非零特征值的数量叫做矩阵的秩（rank），秩决定了这个矩阵如何影响被乘的向量，为0或较小的特征值对传入tensor的影响也比较小，丢弃这些信息对精度的影响不大。

一个模型包含了多个大矩阵，这些大矩阵的秩不相等而且难以预测，因此不能对原模型应用LoRA，但在sft时使用LoRA相对安全，虽然有精度损失，但可以使一个大模型在一个消费级显卡上进行训练。

也就是说，LoRA的原理是假设所有矩阵的秩都是d，进行了一定的有损压缩。基于LoRA也有很多升级版技术，如AdaLoRA、SoRA等，这些组件方案都是基于LoRA，对不同算子的LoRA的rank进行动态调节以达到更好的效果。

LoRA目前已经是训练SD模型和LLM模型的最常用技术。LoRA的weights也非常小，只有几十兆，因此加载和使用都非常方便，且LoRA本身可以合并回原模型，推理时可以做到兼容原模型结构。

> 如果涉及到对模型的知识编辑，比如自我认知任务，LoRA的目标module一般需要设置为\`ALL\`，因为MLP层对模型的知识获取是至关重要的，需要参与训练过程。

# 训练过程

## 确定要使用的模型

首先，你需要选定一个模型，一般来说，如果是端侧应用，选择4B及以下的模型比较合适；如果是单一场景，可以选择7B~14B大小的模型；如果是相对复杂的场景，
例如涉及到条件判断、代码辅助等，选择32B~72B模型进行训练；如果是精确度要求比较高，工具调用非常复杂的情况，使用72B及以上的模型进行训练。

多模态模型可以进行图片或视频理解、OCR识别、grounding等任务，如果需要比较细节的识别，或者在识别后需要进行相对复杂的操作，选择14B以上模型。
如果你的数据集质量比较高，而且识别场景较为单一，可以适当降低模型大小。

如果你需要进行继续预训练，使用base模型；如果需要大规模改变模型行为（例如大规模的微调、GRPO等），建议base模型；如果数据量较少，建议Chat模型。

## 数据集的制作

需要保证数据集始终是高质量的，数据重复、无用标点过多、含有太多emoji、描述单一、逻辑混乱等都会导致训练的失败。一个比较不好的数据集例子：

\`\`\`text
如果风向从左侧刮来应该进行什么操作？答：AEYGF
如果操作员误触停止按钮该进行什么操作？答：GRDFV
\`\`\`
在上面的例子中，数据集的回复属于专业用于，和通用训练数据集的分布完全不同，而且很难总结出通用逻辑，这样的训练很难有好的效果。
如果遇到这样的场景，有几种选项：

- 将生成任务改为分类任务

如果可执行操作的选项是固定的，可以选择将任务从生成任务变为分类任务，这样模型更能够抽象出通用知识

- 增加CoT过程

例如将数据集改为：
\`\`\`text
如果风向从左侧刮来应该进行什么操作？答：由于...的存在，结合...，而...操作需要...，可用操作一共有...种，因此需要进行...，而后...
\`\`\`

一个好的数据集有以下标准：

1. 数据逻辑清晰，事实矛盾比较少
2. 有充足的逻辑推导链条
3. 多样性比较高
4. 数据数量充足，最少的数据量需要达到1k
5. 数据长短不一，且短和长的回复都符合实际情况（例如，用最简短的语言回答；给出完整的推理链路）
6. url、emoji、标点符号等特殊字符占比较少
7. 专业知识和模型通用知识以一定比例存在，可以考虑1：2~1：10的比例

在训练过程中，模型有可能对异常数据特别敏感，几条错误数据可能会让模型幻觉恶化一大截。

## 训练框架选择

选择合适自己的训练框架，这里推荐几个比较好的开源框架：

- [LLaMA-Factory](https://github.com/hiyouga/LLaMA-Factory)：支持PT、SFT、RLHF、多模态训练、webui等
- [SWIFT](https://github.com/modelscope/ms-swift)：支持PT、SFT、RLHF、多模态、Megatron、蒸馏、GRPO、拒绝采样等
- [veRL](https://github.com/volcengine/verl): 支持大规模RL训练，尤其是Megatron+Ray相关的训练
- [OpenRLHF](https://github.com/OpenRLHF/OpenRLHF): 类比veRL，支持大规模RL训练，尤其是Megatron+Ray相关的训练
- [axolotl](https://github.com/axolotl-ai-cloud/axolotl): 国外的训练框架，生态比较健康，对国外的大模型支持比较好

## LoRA还是全参

如果不确定，优先选择LoRA。有几种情况推荐全参训练：

1. 使用的模型是base模型
2. 进行PPO、GRPO等强化微调方法
3. 数据量比较大
4. 数据格式比较奇怪，不符合通用数据分布的

## 超参数

### 学习率
如果是LoRA，学习率可以高一些，例如1e-4，如果全参建议1e-5，如果是PPO、GRPO等，建议1e-6左右

### 迭代数
如果数据量比较少，建议混合一些通用数据，避免过拟合；同时迭代数量提高一些（比如5~10），如果数据量比较大，数据质量也比较好，1~3迭代数是比较合理的。

### batch_size
根据显卡的显存和计算能力设置，一般可以设置为1~2，同时提高gradient_accumulation_steps到16~32

## 多卡
1. 如果显存够用，就只使用DDP
2. 如果显存溢出，选择deepspeed/FSDP的ZeRO2~ZeRO3-offload不等，如果仍然溢出，考虑使用device_map
3. 如果是MoE模型，优先选择Megatron
4. 如果是中大规模训练，优先考虑Megatron



`
    },
    {
      id: "llm-i-inference",
      title: "I. LLM 和多模态模型高效推理实践",
      file: "LLM-tutorial/I.LLM和多模态模型高效推理实践.md",
      difficulty: "中级",
      duration: "0.5h",
      week: 2,
      phase: 2,
      keywords: ["推理优化", "vLLM", "多模态", "KV Cache", "推理加速"],
      content: `# LLM和多模态模型高效推理实践

**内容摘要**

本课程以Qwen系列模型为例，主要介绍在魔搭社区如何高效推理LLM和多模态模型，主要包括如下内容：

*   **LLM和多模态大模型的推理**
    
*   使用ModelScope NoteBook免费GPU推理Qwen-1.8B-Chat-int4
    
*   使用ModelScope NoteBook免费GPU推理Qwen-VL-Chat-int4
    
*   使用ModelScope NoteBook免费GPU推理Qwen-audio-Chat
    
*   **推理加速和多端推理**
    
*   推理加速：vLLM+fastchat加速推理
    
*   多端推理适配-Qwen.cpp和LLaMa.cpp转化模型为gguf或者ggml，并结合Xinference在本地笔记本部署。
    
*   **LLM的应用场景，RAG&Agent**
    
*   使用llama index和langchain打造基于本地知识库的ChatBot
    

**使用ModelScope NoteBook完成语言大模型，音频大模型，视觉大模型的推理**

LLM的推理流程：

![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/7c197455-9310-47cf-9ae7-6e69617e51b5.png)

多模态的LLM的原理：

![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/ba7d6465-e93d-495b-9ad7-6c468175548f.png)

代码演示：

[请至钉钉文档查看附件《实训课程-模型推理.ipynb》](https://alidocs.dingtalk.com/i/nodes/XPwkYGxZV347LdvpH2v4LDX2JAgozOKL?iframeQuery=anchorId%253DX02lrekqpvs4570vroz609)

vLLM+fastchat高效推理实战

FastChat是一个开放平台，用于训练、服务和评估基于LLM的ChatBot。

FastChat的核心功能包括：

*   优秀的大语言模型训练和评估代码。
    
*   具有Web UI和OpenAI兼容的RESTful API的分布式多模型服务系统。
    

vLLM是一个由加州伯克利分校、斯坦福大学和加州大学圣迭戈分校的研究人员基于操作系统中经典的虚拟缓存和分页技术开发的LLM服务系统。他实现了几乎零浪费的KV缓存，并且可以在请求内部和请求之间灵活共享KV高速缓存，从而减少内存使用量。

FastChat开源链接：[https://github.com/lm-sys/FastChat](https://github.com/lm-sys/FastChat)

vLLM开源链接：https://github.com/vllm-project/vllm

实战演示：

安装FastChat最新包

    git clone https://github.com/lm-sys/FastChat.git
    cd FastChat
    pip install .

## 环境变量设置

在vLLM和FastChat上使用魔搭的模型需要设置两个环境变量：

    export VLLM_USE_MODELSCOPE=True
    export FASTCHAT_USE_MODELSCOPE=True

### 使用FastChat和vLLM实现发布model worker(s)

可以结合FastChat和vLLM搭建一个网页Demo或者类OpenAI API服务器，首先启动一个controller：

    python -m fastchat.serve.controller

 然后启动vllm\\_worker发布模型。如下给出单卡推理的示例，运行如下命令：

千问模型示例：

    #以qwen-1.8B为例，在A10运行
    python -m fastchat.serve.vllm_worker --model-path qwen/Qwen-1_8B-Chat --trust-remote-code --dtype bfloat16

启动vLLM优化worker后，本次实践启动页面端demo展示：

    python -m fastchat.serve.gradio_web_server --host 0.0.0.0 --port 8000

让我们体验极致推理优化的效果吧!

中文案例（千问1.8B）

[请至钉钉文档查看附件《12月25日 (2).mov》](https://alidocs.dingtalk.com/i/nodes/XPwkYGxZV347LdvpH2v4LDX2JAgozOKL?iframeQuery=anchorId%253DX02lqkjxmuyckt2fage86v)

多端部署-以qwen+个人Mac电脑为例

魔搭社区和Xinference合作，提供了模型GGML的部署方式，以qwen为例。

Xinference支持大语言模型，语音识别模型，多模态模型的部署，简化了部署流程，通过一行命令完成模型的部署工作。并支持众多前沿的大语言模型，结合GGML技术，支持多端部署。

![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/da1ce618-9de9-42e2-82ee-0ee093ea4b66.png)

**使用Qwen.cpp实现通义千问的多端部署：**

多端部署以1.8B模型为例，

第一步：使用qwen.cpp将pytorch格式的千问模型转为GGML格式

    python3 qwen_cpp/convert.py -i qwen/Qwen-1_8-Chat -t q4_0 -o qwen-1_8b-ggml.bin

第二步：在Xinference上launch模型，并部署到Mac笔记本实现推理。

[请至钉钉文档查看附件《录屏2023-11-27 17.01.39.mov》](https://alidocs.dingtalk.com/i/nodes/XPwkYGxZV347LdvpH2v4LDX2JAgozOKL?iframeQuery=anchorId%253DX02lpjfe0yq2b4qsaoj5rt)

**LLM的应用场景，RAG**

LLM会产生误导性的 “**幻觉**”，依赖的信息可能**过时**，处理特定知识时**效率不高**，**缺乏专业领域**的深度洞察，同时在推理能力上也有所欠缺。

正是在这样的背景下，检索增强生成技术（Retrieval-Augmented Generation，RAG）应时而生，成为 AI 时代的一大趋势。

RAG 通过在语言模型生成答案之前，先从广泛的文档数据库中检索相关信息，然后利用这些信息来引导生成过程，极大地提升了内容的准确性和相关性。RAG 有效地**缓解了幻觉问题**，提高了**知识更新的速度**，并增强了内容生成的**可追溯性**，使得大型语言模型在实际应用中变得更加**实用和可信**。

一个典型的RAG的例子：

![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/f7985e33-9a2e-4b6d-a4be-87f60a369078.png)

这里面主要包括包括三个基本步骤：

1. 索引 — 将文档库分割成较短的 Chunk，并通过编码器构建向量索引。

2. 检索 — 根据问题和 chunks 的相似度检索相关文档片段。

3. 生成 — 以检索到的上下文为条件，生成问题的回答。

**RAG（开卷考试）VS. Finetune（专业课程学习）**

![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/b5c6a200-1943-4f09-8f86-478bf2ffa70a.png)

示例代码：[https://github.com/modelscope/modelscope/blob/master/examples/pytorch/application/qwen\\_doc\\_search\\_QA\\_based\\_on\\_langchain\\_llamaindex.ipynb](https://github.com/modelscope/modelscope/blob/master/examples/pytorch/application/qwen_doc_search_QA_based_on_langchain_llamaindex.ipynb)`
    },
    {
      id: "llm-j-deployment",
      title: "J. 部署",
      file: "LLM-tutorial/J.部署.md",
      difficulty: "中级",
      duration: "1h",
      week: 2,
      phase: 2,
      keywords: ["模型部署", "服务化", "API", "Docker", "生产环境"],
      content: `# 推理及部署

训练后的模型会用于推理或者部署。推理即使用模型用输入获得输出的过程，部署是将模型发布到恒定运行的环境中推理的过程。一般来说，LLM的推理可以直接使用PyTorch代码、使用[VLLM](https://docs.vllm.ai/en/latest/getting_started/quickstart.html)/[XInference](https://github.com/xorbitsai/inference)/[FastChat](https://github.com/lm-sys/FastChat)等框架，也可以使用[llama.cpp](https://github.com/ggerganov/llama.cpp)/[chatglm.cpp](https://github.com/li-plus/chatglm.cpp)/[qwen.cpp](https://github.com/QwenLM/qwen.cpp)等c++推理框架。

# 一些推理方法

- Greedy Search **贪婪搜索方式**。按照前面的讲解，模型会按照词表尺寸生成概率。贪婪方式会不断选择生成概率最大的token。该方法由于无脑选择了最大概率，因此模型会倾向于生成重复的文字，一般实际应用中很少使用
- Beam Search 和贪婪方式的区别在于，beam search会选择概率最大的k个。在生成下一个token时，每个前序token都会生成k个，这样整体序列就有k^2个，从这些序列中选择组合概率最大的k个，并递归地执行下去。k在beam search算法中被称为beam_size
- Sample 随机采样方式。按照词表每个token的概率采样一个token出来。这个方式多样性更强，是目前主流的生成方式。

# 重要推理超参数

- do_sample：布尔类型。是否使用随机采样方式运行推理，如果设置为False，则使用beam_search方式

- temperature：大于等于零的浮点数。公式为：
  
  $$q_i=\\frac{\\exp(z_i/T)}{\\sum_{j}\\exp(z_j/T)}$$
  
  从公式可以看出，如果T取值为0，则效果类似argmax，此时推理几乎没有随机性；取值为正无穷时接近于取平均。一般temperature取值介于[0, 1]之间。取值越高输出效果越随机。

  **如果该问答只存在确定性答案，则T值设置为0。反之设置为大于0。**

- top_k：大于0的正整数。从k个概率最大的结果中进行采样。k越大多样性越强，越小确定性越强。一般设置为20~100之间。
  - 实际实验中可以先从100开始尝试，逐步降低top_k直到效果达到最佳。

- top_p：大于0的浮点数。使所有被考虑的结果的概率和大于p值，p值越大多样性越强，越小确定性越强。一般设置0.7~0.95之间。
  - 实际实验中可以先从0.95开始降低，直到效果达到最佳。
  - top_p比top_k更有效，应优先调节这个参数。
- repetition_penalty： 大于等于1.0的浮点数。如何惩罚重复token，默认1.0代表没有惩罚。

# KVCache

上面我们讲过，自回归模型的推理是将新的token不断填入序列生成下一个token的过程。那么，前面token已经生成的中间计算结果是可以直接利用的。具体以Attention结构来说：

<img src="file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/image-20240116161847987.png" alt="image-20240116161847987" style="zoom:33%;" />

推理时的Q是单token tensor，但K和V都是包含了所有历史token tensor的长序列，因此KV是可以使用前序计算的中间结果的，这部分的缓存就是KVCache，其显存占用非常巨大。

# VLLM

VLLM支持绝大多数LLM模型的推理加速。它使用如下的方案大幅提升推理速度：

1. Continuous batching

   - 在实际推理过程中，一个批次多个句子的输入的token长度可能相差很大，最后生成的模型输出token长度相差也很大。在python朴素推理中，最短的序列会等待最长序列生成完成后一并返回，这意味着本来可以处理更多token的GPU算力在对齐过程中产生了浪费。continous batching的方式就是在每个句子序列输出结束后马上填充下一个句子的token，做到高效利用算力。

     ![image-20240116160416701](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/image-20240116160416701.png)

     ![image-20240116160444612](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/image-20240116160444612.png)

2. PagedAttention
   - 推理时的显存占用中，KVCache的碎片化和重复记录浪费了50%以上的显存。VLLM将现有输入token进行物理分块，使每块显存内部包含了固定长度的tokens。在进行Attention操作时，VLLM会从物理块中取出KVCache并计算。因此模型看到的逻辑块是连续的，但是物理块的地址可能并不连续。这和虚拟内存的思想非常相似。另外对于同一个句子生成多个回答的情况，VLLM会将不同的逻辑块映射为一个物理块，起到节省显存提高吞吐的作用。

![image-20240116162157881](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/image-20240116162157881.png)

![image-20240116162213204](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/image-20240116162213204.png)

值得注意的是，VLLM会默认将显卡的全部显存预先申请以提高缓存大小和推理速度，用户可以通过参数\`gpu_memory_utilization\`控制缓存大小。

首先安装VLLM：

\`\`\`shell
pip install vllm
\`\`\`

\`\`\`shell
import os
os.environ['VLLM_USE_MODELSCOPE'] = 'True'
from vllm import LLM, SamplingParams
prompts = [
    "Hello, my name is",
    "The president of the United States is",
    "The capital of France is",
    "The future of AI is",
]
sampling_params = SamplingParams(temperature=0.8, top_p=0.95)
llm = LLM(model="qwen/Qwen-1_8B", trust_remote_code=True)
outputs = llm.generate(prompts, sampling_params)

# Print the outputs.
for output in outputs:
    prompt = output.prompt
    generated_text = output.outputs[0].text
    print(f"Prompt: {prompt!r}, Generated text: {generated_text!r}")
\`\`\`

注意，截止到本文档编写完成，VLLM对Chat模型的推理支持（模板和结束符）存在问题，在实际进行部署时请考虑使用SWIFT或者FastChat。

> LLM的generate方法支持直接输入拼接好的tokens(prompt_token_ids参数，此时不要传入prompts参数)，所以外部可以按照自己的模板进行拼接后传入VLLM，SWIFT就是使用了这种方法

在量化章节中我们讲解了[AWQ量化](https://docs.vllm.ai/en/latest/quantization/auto_awq.html)，VLLM直接支持传入量化后的模型进行推理：

\`\`\`python
from vllm import LLM, SamplingParams
import os
import torch
os.environ['VLLM_USE_MODELSCOPE'] = 'True'

# Sample prompts.
prompts = [
    "Hello, my name is",
    "The president of the United States is",
    "The capital of France is",
    "The future of AI is",
]
# Create a sampling params object.
sampling_params = SamplingParams(temperature=0.8, top_p=0.95)

# Create an LLM.
llm = LLM(model="ticoAg/Qwen-1_8B-Chat-Int4-awq", quantization="AWQ", dtype=torch.float16, trust_remote_code=True)
# Generate texts from the prompts. The output is a list of RequestOutput objects
# that contain the prompt, generated text, and other information.
outputs = llm.generate(prompts, sampling_params)
# Print the outputs.
for output in outputs:
    prompt = output.prompt
    generated_text = output.outputs[0].text
    print(f"Prompt: {prompt!r}, Generated text: {generated_text!r}")
\`\`\`

VLLM官方文档可以查看[这里](https://docs.vllm.ai/en/latest/getting_started/quickstart.html)。

# SWIFT

在SWIFT中，我们支持了VLLM的推理加速手段。

\`\`\`shell
pip install ms-swift[llm] openai
\`\`\`

只需要运行下面的命令就可以使用VLLM加速推理：

\`\`\`shell
swift infer --model_id_or_path qwen/Qwen-1_8B-Chat --max_new_tokens 128 --temperature 0.3 --top_p 0.7 --repetition_penalty 1.05 --do_sample true
\`\`\`

也支持在部署中使用VLLM：

\`\`\`shell
swift deploy --model_id_or_path qwen/Qwen-1_8B-Chat --max_new_tokens 128 --temperature 0.3 --top_p 0.7 --repetition_penalty 1.05 --do_sample true
\`\`\`

调用：

\`\`\`python
from openai import OpenAI
client = OpenAI(
    api_key='EMPTY',
    base_url='http://localhost:8000/v1',
)
model_type = client.models.list().data[0].id
print(f'model_type: {model_type}')

query = '浙江的省会在哪里?'
messages = [{
    'role': 'user',
    'content': query
}]
resp = client.chat.completions.create(
    model=model_type,
    messages=messages,
    seed=42)
response = resp.choices[0].message.content
print(f'query: {query}')
print(f'response: {response}')

# 流式
messages.append({'role': 'assistant', 'content': response})
query = '这有什么好吃的?'
messages.append({'role': 'user', 'content': query})
stream_resp = client.chat.completions.create(
    model=model_type,
    messages=messages,
    stream=True,
    seed=42)

print(f'query: {query}')
print('response: ', end='')
for chunk in stream_resp:
    print(chunk.choices[0].delta.content, end='', flush=True)
print()

"""Out[0]
model_type: qwen-7b-chat
query: 浙江的省会在哪里?
response: 浙江省的省会是杭州市。
query: 这有什么好吃的?
response: 杭州有许多美食，例如西湖醋鱼、东坡肉、龙井虾仁、叫化童子鸡等。此外，杭州还有许多特色小吃，如西湖藕粉、杭州小笼包、杭州油条等。
"""
\`\`\`

# llama.cpp

llama.cpp是使用c++语言编写的对llama系列模型进行高效推理或量化推理的开源库。该库使用了ggml底层计算库进行推理。在使用之前需要额外将python的weights转为ggml格式或gguf格式方可使用。和llama.cpp类似，还有兼容ChatGLM模型的chatglm.cpp和兼容qwen模型的qwen.cpp和mistral的mistral.cpp。

安装依赖：

\`\`\`shell
pip install modelscope
\`\`\`

\`\`\`python
git clone --recursive https://github.com/QwenLM/qwen.cpp && cd qwen.cpp
cmake -B build
cmake --build build -j --config Release
\`\`\`

下载模型：

\`\`\`python
from modelscope import snapshot_download
print(snapshot_download('qwen/Qwen-1_8B-Chat'))
# /mnt/workspace/.cache/modelscope/qwen/Qwen-1_8B-Chat
\`\`\`

将原始模型转换为ggml支持的格式：

\`\`\`shell
python3 qwen_cpp/convert.py -i /mnt/workspace/.cache/modelscope/qwen/Qwen-1_8B-Chat -t q4_0 -o qwen1_8b-ggml.bin
./build/bin/main -m qwen1_8b-ggml.bin --tiktoken /mnt/workspace/.cache/modelscope/qwen/Qwen-1_8B-Chat/qwen.tiktoken -p 你好
# 你好！有什么我可以帮助你的吗？
\`\`\`

量化章节中我们介绍，GGML库适合于CPU运行，因此推荐用户在CPU环境中或边缘计算中考虑cpp库进行推理。

# FastChat

FastChat是一个开源推理库，侧重于模型的分布式部署实现，并提供了OpenAI样式的RESTFul API。

\`\`\`shell
pip3 install "fschat[model_worker,webui]"
python3 -m fastchat.serve.controller
\`\`\`

在新的terminal中启动：

\`\`\`shell
FASTCHAT_USE_MODELSCOPE=true python3 -m fastchat.serve.model_worker --model-path qwen/Qwen-1_8B-Chat --revision v1.0.0
\`\`\`

之后在新的terminal中可以运行界面进行推理:

\`\`\`shell
python3 -m fastchat.serve.gradio_web_server
\`\`\`

![image-20240118204046417](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/image-20240118204046417.png)
`
    },
    {
      id: "llm-k-evaluation",
      title: "K. 大模型自动评估理论和实战 LLM Automatic Evaluation",
      file: "LLM-tutorial/K.大模型自动评估理论和实战--LLM Automatic Evaluation.md",
      difficulty: "中级",
      duration: "1h",
      week: 2,
      phase: 2,
      keywords: ["评估", "Benchmark", "Automatic Evaluation", "MMLU", "评测指标"],
      content: `# 大模型自动评估理论和实战--LLM Automatic Evaluation

##  引言
**背景**

大语言模型（LLM）评测是LLM开发和应用中的关键环节，是评估LLM性能、鲁棒性、偏见、幻觉等方面的重要手段。LLM评测的目标是通过一系列的评测任务和指标，全面、客观地评估LLM的性能，为LLM的研发、应用和部署提供参考。
![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/llm_eval_importance_challenge.png)

目前评测方法可以分为人工评测和自动评测，其中，自动评测技术相比人工评测来讲，具有效率高、一致性好、可复现、鲁棒性好等特点，逐渐成为业界研究的重点。

模型的自动评测技术可以分为rule-based和model-based两大类：

*   rule-based方法：
    
    *   benchmark以客观题为主，例如多选题，被测的LLM通过理解context/question，来指定最佳答案
        
    *   解析LLM的response，与标准答案做对比
        
    *   计算metric（accuracy、rouge、bleu等）
        
*   model-based方法：
    
    *   裁判员模型（e.g. GPT-4、Claude、Expert Models/Reward models）
        
    *   LLM Peer-examination
        

**内容提要**

*   **LLM自动评估理论**
    

*   如何评估一个LLM
    
*   自动评估的方法
    
*   常用的benchmark
    
*   LLM评估面临的问题和挑战
    

*   **LLM自动评估实战**
    

*   LLMuses自动评测框架介绍
    
*   基于客观题benchmark自动评估
    
*   基于专家模型的自动评估
    
*   LLM推理性能评估
    

##  LLM评估的方法论
![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/527230d4-206d-4c62-806d-e50ff7547e33.png)

**如何评估一个LLM**

*   哪些维度？
    
    *   语义理解（Understanding）
        
    *   知识推理（Reasoning）
        
    *   专业能力（e.g. coding、math）
        
    *   应用能力（MedicalApps、AgentApps、AI-FOR-SCI ...）
        
    *   指令跟随（Instruction Following）
        
    *   鲁棒性（Robustness）
        
    *   偏见（Bias）
        
    *   幻觉（Hallucinations）
        
    *   安全性（Safety）
        

![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/996dfdf4-c222-4b9f-b9a0-a071ea49aef7.png)

> **例：GPT-4 vs LLaMA2-7B能力维度对比评测**

**自动评估方法**

#### 2.1 模型效果评估

*   **基准和指标（Benchmarks & Metrics）**
    

|  **数据集**  |  **描述**  |  **评价指标**  |  **样例**  |
| --- | --- | --- | --- |
|  MMLU  |  MassiveMultitaskLanguageUnderstanding 一个多任务数据集，由各种学科的多项选择题组成。涵盖STEM、人文、社科等领域。包括57个子任务，包括初等数学、美国历史、计算机科学、法律等等。  |  Accuracy  |  Question: In 2016, about how many people in the United States were homeless? A. 55,000 B. 550,000 C. 5,500,000 D. 55,000,000 Answer: B  |
|  TriviaQA  |  阅读理解数据集，包含超过65万个问题-答案-证据三元组。其包括95K个问答对，由冷知识爱好者提供 + 独立收集的事实性文档撰写  |  EM(ExactMatch) F1 (word-level)  |  ![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/3f700aa9-eadb-4921-93bf-a61d2361b53c.png) （问题-答案-证据文档）  |
|  MATH  |   12500道数学题，每道包含step-by-step solution  |  Accuracy  |  ![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/9e268ef4-3547-4311-9bee-b81e6347ad65.png)  |
|  HumanEval  |  HumanEval (Hand-Written Evaluation Set) 一个手写的问题解决数据集，要求根据给定的问题和代码模板，生成正确的代码片段。包含164个高质量的问题，涵盖五种编程语言：Python, C++, Java, Go, 和 JavaScript。  |  pass@k  |  {     "task\\_id": "test/0",     "prompt": "def return1():\\n",     "canonical\\_solution": "    return 1",     "test": "def check(candidate):\\n    assert candidate() == 1",     "entry\\_point": "return1" }  |

*   **Rule-based自动评测**
    

> **基本流程**

![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/93ecb255d85f4fc1a8c16886a81694ed0521.png)

*   根据数据集原始question来构建prompt
    

> **示例(few-shot)**

![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/45fa0dbc-5f72-443c-919a-f0e7a1edb48b.png)

> **示例：few-shot with CoT**

    # Examples in BBH
    
    Evaluate the result of a random Boolean expression.
    
    Q: not ( ( not not True ) ) is
    A: Let's think step by step.
    Remember that (i) expressions inside brackets are always evaluated first and that (ii) the order of operations from highest priority to lowest priority is "not", "and", "or", respectively.
    We first simplify this expression "Z" as follows: "Z = not ( ( not not True ) ) = not ( ( A ) )" where "A = not not True".
    Let's evaluate A: A = not not True = not (not True) = not False = True.
    Plugging in A, we get: Z = not ( ( A ) ) = not ( ( True ) ) = not True = False. So the answer is False.
    
    Q: True and False and not True and True is
    A: Let's think step by step.
    Remember that (i) expressions inside brackets are always evaluated first and that (ii) the order of operations from highest priority to lowest priority is "not", "and", "or", respectively.
    We first simplify this expression "Z" as follows: "Z = True and False and not True and True = A and B" where "A = True and False" and "B = not True and True".
    Let's evaluate A: A = True and False = False.
    Let's evaluate B: B = not True and True = not (True and True) = not (True) = False.
    Plugging in A and B, we get: Z = A and B = False and False = False. So the answer is False.

*   模型预测
    

> **Generate**

    # Demo -- model_genereate 直接生成response
    
    def model_generate(query: str, infer_cfg: dict) -> str:
    
        inputs = tokenizer.encode(query)
        input_ids = inputs['input_ids']
        ...
    
        # Process infer cfg (do_sample, top_k, top_p, temperature, special_tokens ...)
        generation_config = process_cfg(args)
        ...
      
        # Run inference
        output_ids = model.generate(
            input_ids=input_ids,
            attention_mask=attention_mask,
            generation_config=generation_config,
        )
    
        response = tokenizer.decode(output_ids, **decode_kwargs)
        return response

> **Likelihood**

    # Demo -- model_call方式计算loglikelihood
    
    # context + continuation 拼接，示例：
    # Question： 法国的首都是哪里？
    # Choices： A.北京  B.巴黎  C.汉堡  D.纽约
      # pair-1: (ctx, cont) = (法国的首都是哪里？，A.北京)
      # pair-2: (ctx, cont) = (法国的首都是哪里？，B.巴黎)
      # pair-3: (ctx, cont) = (法国的首都是哪里？，C.汉堡)
      # pair-4: (ctx, cont) = (法国的首都是哪里？，D.纽约)
    # Logits --> 
    
    def loglikelihood(self, inputs: list, infer_cfg: dict = None) -> list:
        # To predict one doc
        doc_ele_pred = []
        for ctx, continuation in inputs:
    
            # ctx_enc shape: [context_tok_len]  cont_enc shape: [continuation_tok_len]
            ctx_enc, cont_enc = self._encode_pair(ctx, continuation)
    
            inputs_tokens = torch.tensor(
                (ctx_enc.tolist() + cont_enc.tolist())[-(self.max_length + 1):][:-1],
                dtype=torch.long,
                device=self.model.device).unsqueeze(0)
    
            logits = self.model(inputs_tokens)[0]
            logits = torch.nn.functional.log_softmax(logits.float(), dim=-1)
    
            logits = logits[:, -len(cont_enc):, :]
            cont_enc = cont_enc.unsqueeze(0).unsqueeze(-1)
            logits = torch.gather(logits.cpu(), 2, cont_enc.cpu()).squeeze(-1)
    
            choice_score = float(logits.sum())
            doc_ele_pred.append(choice_score)
    
        # e.g. [-2.3, 1.1, -12.9, -9.2], length=len(choices)
        return doc_ele_pred

*   **评价指标（Metrics）**
    

*   WeightedAverageAccuracy  加权平均准确率
    
*   Perplexity 困惑度
    
*   Rouge (Recall-Oriented Understudy for Gisting Evaluation)
    
*   Bleu (Bilingual evaluation understudy)
    
*   ELO Rating System
    
*   PASS@K
    

*   **Model-based自动评测**
    

![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/70f6ea12-f36f-4f58-b62e-cf6d28edcfd0.png)

*   中心化评测
    
    *   中心化评测模式下，裁判员模型只有一个，可靠性高，但容易收到裁判员模型的bias影响
        
*   去中心化评测
    
    *   去中心化评测方式，要求模型之间做peer-examination
        
    *   特点是公平性好，但计算量大，且鲁棒性不高
        

> **裁判员模型**

*   GPT-4、Claude、Qwen-Max等 （产品APIs）
    
*   PandLM、Auto-J (tuned from LLM, like LLaMA)
    
*   Reward models (Ranking learning)
    

*   Chatbot Arena -竞技场模式
    
    *   **（Battle count of each combination of models,  from LMSYS）**
        

![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/f2e4ef13-dc80-4b09-a8ba-49f2823794b5.png)

*   **（Fraction of Model A wins for all non-tied A vs. B battles,  from LMSYS）**
    

![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/7d2fa017-b4fd-49c0-b69d-6e5fd286efce.png)

*   **主观评测和客观评测**
![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/llm_eval_subjective.png)


*   **LLM指令攻防**
    
    *   指令诱导  (诱导模型输出目标答案，from SuperCLUE)
        
    *   ![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/57149682-203e-47ec-acda-95253cd54f1a.png)
        
    *   有害指令注入 (将真实有害意图注入到prompt中, from SuperCLUE)
        
    *   ![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/b79d3cf9-b60b-43ba-8d7b-a9b4cc070e6b.png)

*   **Agent评测**
![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/llm_eval_toolbench.png)


#### 2.2 模型性能评估

> **model serving performance evaluation**

|  **指标名称**  |  **说明**  |
| --- | --- |
|  Time  |  测试总时间（时间单位均为秒）  |
|  Expected number of requests  |  期望发送的请求数，和prompt文件以及期望number有关  |
|  concurrency  |  并发数  |
|  completed  |  完成的请求数  |
|  succeed  |  成功请求数  |
|  failed  |  失败请求数  |
|  qps  |  平均qps  |
|  latency  |  平均latency  |
|  time to first token  |  平均首包延迟  |
|  throughput  |  output tokens / seconds 平均每秒输出token数  |
|  time per output token  |  平均生成一个token需要的时间 总output\\_tokens/总时间  |
|  package per request  |  平均每个请求的包数  |
|  time per package  |  平均每包时间  |
|  input tokens per request  |  平均每个请求的输入token数  |
|  output tokens per request  |  平均每个请求输出token数  |

![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/llm_eval_infer_perf.png)


#### 2.3 问题和挑战

1.  **基准失效&数据泄露**
    

*   静态数据集与快速演进的LLM能力形成GAP，导致基准失效
    
*   公开的benchmark被泄露到LLM的开发PT、CPT、SFT等开发环节
    

> **解决思路： 动态数据集**

![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/e1fc58a1-b555-43e7-9ecb-4e4ad013fd9e.png)

![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/03654212-614b-4dc3-a9c1-6513f6da4294.png)

2.  **裁判员模型的能力上限**
    

*   裁判员模型的存在明显的能力边界，很难胜任更多场景、更强模型的评测工作
    
*   泛化性问题
    
*   LLM幻觉的诊断问题

![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/llm_eval_judge_robust.png)
在添加扰动的情况下，即便是性能强劲的裁判员模型，也会出现性能下降的情况。



## LLM评估实战
Eval-Scope框架--轻量化、端到端的大模型自动评估框架
![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/llm_eval_diagram.png)

GitHub: [https://github.com/modelscope/eval-scope](https://github.com/modelscope/eval-scope)

> **框架特性**

*   预置常用的测试基准，包括：MMLU、C-Eval、GSM8K、ARC、HellaSwag、TruthfulQA、MATH、HumanEval、BBH、GeneralQA等
    
*   常用评估指标（metrics）的实现
    
*   统一model接入，兼容多个系列模型的generate、chat接口
    
*   客观题自动评估
    
*   使用专家模型实现复杂任务的自动评估
    
*   竞技场模式(Arena）
    
*   评估报告生成与可视化
    
*   LLM性能评测（Performance Evaluation）
    

**环境安装**

    # 1. 代码下载
    git clone git@github.com:modelscope/eval-scope.git
    
    # 2. 安装依赖
    cd eval-scope/
    pip install -r requirements/requirements.txt
    pip install -e .

1.  **简单评测**
    

    > 指定模型和数据集
    python llmuses/run.py --model ZhipuAI/chatglm3-6b --template-type chatglm3 --datasets ceval --outputs ./outputs/test --limit 10

*   \\--model: ModelScope模型id， ([https://modelscope.cn/models/ZhipuAI/chatglm3-6b/summary](https://modelscope.cn/models/ZhipuAI/chatglm3-6b/summary)) ，也可以是模型的本地路径
    
*   \\--datasets: 数据集的id
    
*   \\--limit: （每个sub-task）最大评测样本数

*   \\--template-type: 模型的template-type，如chatglm3、qwen等
    

[请至钉钉文档查看附件《1.mp4》](https://alidocs.dingtalk.com/i/nodes/gvNG4YZ7Jnxop15OCBQErPgbW2LD0oRE?iframeQuery=anchorId%253DX02lrkkwbr9bvf1opazpdn&utm_scene=team_space)

2.  **带参数评测**
    

    python llmuses/run.py --model ZhipuAI/chatglm3-6b --template-type chatglm3 --outputs ./outputs/test2 --model-args revision=v1.0.2,precision=torch.float16,device_map=auto --datasets arc --limit 10

*    \\--model-args: 模型参数，以逗号分隔，key=value形式
    
*    --datasets: 数据集名称，参考下文\\\`数据集列表\\\`章节
    
*   \\--mem-cache: 是否使用内存缓存，若开启，则已经跑过的数据会自动缓存，并持久化到本地磁盘
    
*   \\--limit: 每个subset最大评估数据量

*   \\--template-type: 模型的template-type，如chatglm3、qwen等
    

[请至钉钉文档查看附件《2.mp4》](https://alidocs.dingtalk.com/i/nodes/gvNG4YZ7Jnxop15OCBQErPgbW2LD0oRE?iframeQuery=anchorId%253DX02lrkkwu0yqcmz8sh8u8r&utm_scene=team_space)

3.  **竞技场模式--Single mode**
    

Single mode，使用专家模型（GPT-4）对待测LLM进行打分

    # Example
    # Note: dry-run模式 (模型answer正常生成，但专家模型，如GPT-4，不会被触发，评估结果会随机生成，如需正式评测，请去掉--dry-run参数)
    python llmuses/run_arena.py --c registry/config/cfg_single.yaml --dry-run

[请至钉钉文档查看附件《4.mp4》](https://alidocs.dingtalk.com/i/nodes/gvNG4YZ7Jnxop15OCBQErPgbW2LD0oRE?iframeQuery=anchorId%253DX02lrkkz502wy86kerhzee&utm_scene=team_space)

4.  **竞技场模式--Baseline mode**
    

Baseline mode，选定baseline模型，其它待测LLM与该模型进行对比

    # Example
    # Note: dry-run模式 (模型answer正常生成，但专家模型，如GPT-4，不会被触发，评估结果会随机生成，如需正式评测，请去掉--dry-run参数)
    python llmuses/run_arena.py --c registry/config/cfg_pairwise_baseline.yaml --dry-run

[请至钉钉文档查看附件《5.mp4》](https://alidocs.dingtalk.com/i/nodes/gvNG4YZ7Jnxop15OCBQErPgbW2LD0oRE?iframeQuery=anchorId%253DX02lrkldvk7cua7s9e4qfr&utm_scene=team_space)

5.  **竞技场模式--Pairwise mode**
    

Pairwise mode，待测LLM两两组合进行对弈

    # Example
    # Note: dry-run模式 (模型answer正常生成，但专家模型，如GPT-4，不会被触发，评估结果会随机生成，如需正式评测，请去掉--dry-run参数)
    python llmuses/run_arena.py -c registry/config/cfg_arena.yaml --dry-run

[请至钉钉文档查看附件《6.mp4》](https://alidocs.dingtalk.com/i/nodes/gvNG4YZ7Jnxop15OCBQErPgbW2LD0oRE?iframeQuery=anchorId%253DX02lrklgm7on9my652lw4&utm_scene=team_space)

![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/d63351fd-409d-4d77-975a-8ab7890d383d.png)

6.  **效果评测报告**
    

按照预定格式存放数据，使用streamlit启动可视化服务

    # Usage:
    streamlit run viz.py -- --review-file llmuses/registry/data/qa_browser/battle.jsonl --category-file llmuses/registry/data/qa_browser/category_mapping.yaml

*   **报告可视化**
    
*   ![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/a569b578-501d-414e-aeaa-53ce07d8d214.png)
    
*   **Leaderboard:**  [https://modelscope.cn/leaderboard/58/ranking?type=free](https://modelscope.cn/leaderboard/58/ranking?type=free)
    

![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/cff2b99b-2c8c-4200-aa5d-8758d018d24d.png)

7.  **模型性能评测（Perf Eval）**
    

> **性能评测报告示例**

![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/15eb7f88-9b7c-470d-a789-83ff0e133851.png)

![image](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/464fd064-55de-402c-aac8-a8320a94227b.png)`
    },
    {
      id: "llm-l-lisa",
      title: "L. LISA 微调技术解析",
      file: "LLM-tutorial/L.LISA微调技术解析.md",
      difficulty: "高级",
      duration: "0.5h",
      week: 3,
      phase: 3,
      keywords: ["LISA", "微调技术", "层采样", "高效微调", "LoRA对比"],
      content: `# **背景介绍**

LISA是Layerwise Importance Sampling for Memory-Efficient Large Language Model Fine-Tuning的简写。这个技术可以把全参训练的显存使用降低到之前的三分之一左右，而使用的技术方法却是非常简单的。例如，全参训练一个7b模型大约需要80G显存（相当于一张完整的A100显卡），但使用LISA训练后却可以使显存降低到30G左右，这使得使用40G A100显卡甚至是24G A10或者RTX 3090成为可能，且它的显存占用更低、训练速度更快。

论文地址：https://arxiv.org/abs/2403.17919

# **技术背景**

如果阅读者尚不熟悉深度学习基本原理，请参考魔搭社区提供的教程：

[https://github.com/modelscope/modelscope-classroom/blob/main/LLM-tutorial/A.%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0%E5%85%A5%E9%97%A8%E4%BB%8B%E7%BB%8D.md](https://github.com/modelscope/modelscope-classroom/blob/main/LLM-tutorial/A.深度学习入门介绍.md)

## **技术解析**

LISA使用的技术原理相对简单。作者首先对LoRA训练和全参训练每个layer不同step时的L2范数的平均和进行了对比，结果如下：

![img](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/5eecdaf48460cde53952abddcdbfd6dcfc4b2466ebb3131658e70b814913bc360a414d3de9277d871abf3af1cbd752491621e7ca2f5c398fb41b17ed528e1034cbf9b3e17cae4a8cd731dfff0e8bf737c03ab5e64d9153b4fc653b69905bac42.png)

作者训练了GPT2和LLaMA-2-7B两个模型，发现它们自身不同layers的parameters的LoRA训练和全参训练的L2范数不同，可以间接说明LoRA训练中由于低秩矩阵的存在，因此其参数更新的重点和全参数更新重点完全不同。可以看出，在权重更新时，除底层和顶层外其它层的L2范数都较小，因此作者假设可以在全参数训练时通过冻结大部分层的参数来模拟LoRA更新的行为，使其最后的参数迭代范数达到类似的效果。

完整的算法迭代可以用下图表示：

![img](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/5eecdaf48460cde53952abddcdbfd6dcfc4b2466ebb3131658e70b814913bc360a414d3de9277d871abf3af1cbd75249682bbd268f253e43f6286d28916c11e4b5599362b1b70fc1f643e9685ba993d8fcb49b2d357f7b0dfc653b69905bac42.png)

## **实验**

在官方实验中，作者对比了LISA和LoRA训练以及全参数的显存占用：

![img](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/5eecdaf48460cde53952abddcdbfd6dcfc4b2466ebb3131658e70b814913bc360a414d3de9277d871abf3af1cbd75249707cfe25195b4b1bc9f955d080705e212942a245d50ee77fb20ba7636ed94366612002ab1769b51bfc653b69905bac42.png)



可以看到LISA的显存占用要小于LoRA。在训练速度上面：

![img](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/5eecdaf48460cde53952abddcdbfd6dcfc4b2466ebb3131658e70b814913bc360a414d3de9277d871abf3af1cbd75249611a70fce803432c75c08721370a6410087cafc9e9fd5a4131406e613ad9beaa6a2ad88678cc9a00fc653b69905bac42.png)

官方实验结果，LISA的Forward和Backward时间要显著短于LoRA训练。在训练方面，作者进行不同尺寸的微调和大规模微调，均证明了LISA的效果要强于LoRA：

![img](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/5eecdaf48460cde53952abddcdbfd6dcfc4b2466ebb3131658e70b814913bc360a414d3de9277d871abf3af1cbd7524948770f726558f584d80a1e0a3284ede925e610bcfced82c5a4af7ae7ac346a43f4ee11e6170de482fc653b69905bac42.png)

![img](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/5eecdaf48460cde53952abddcdbfd6dcfc4b2466ebb3131658e70b814913bc360a414d3de9277d871abf3af1cbd752497525b597901e9262035b97551297c692e8ee262e392ca04f68950e397f4f18f132eba7b04542561efc653b69905bac42.png)



如何调节LISA的超参数呢？LISA的超参数包含两个值：

1. LISA采样的有效层数γ
2. LISA的更新频率K

消融实验对这两个值的对比如下：

![img](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/5eecdaf48460cde53952abddcdbfd6dcfc4b2466ebb3131658e70b814913bc360a414d3de9277d871abf3af1cbd75249aeed6c0c5206726ce782e3f79fc779477ffb5ab7bc3bb238b9bf320d2871023572c1f300bae6734afc653b69905bac42.png)



可以看到LISA的性能在γ=8，采样频率K=5的时候达到最好。作者也证明，LISA对于不同的随机种子的鲁棒性很强，在此不列举表格。



## **本文的实验**

为了验证LISA在实际测试中的效果，我们对LISA进行了一定的实验。我们使用了魔搭社区提供的SWIFT框架（https://github.com/modelscope/swift），该框架支持LISA训练方式，且支持LoRA等通用训练方式。我们可以设置LISA的两个值：

- lisa_activated_layers 上文的γ
- lisa_step_interval 上文的K

我们使用如下命令进行训练：

\`\`\`
# pip install ms-swift -U
sft.py \\
 --model_type qwen-7b-chat \\
 --dataset ms-agent \\
 --train_dataset_mix_ratio 2.0 \\
 --batch_size 1 \\
 --max_length 2048 \\
 --use_loss_scale True \\
 --gradient_accumulation_steps 16 \\
 --learning_rate 5e-05 \\
 --use_flash_attn True \\
 --eval_steps 2000 \\
 --save_steps 2000 \\
 --train_dataset_sample -1 \\
 --val_dataset_sample 5000 \\
 --num_train_epochs 2 \\
 --check_dataset_strategy none \\
 --gradient_checkpointing True \\
 --weight_decay 0.01 \\
 --warmup_ratio 0.03 \\
 --save_total_limit 2 \\
 --logging_steps 10 \\
 --sft_type full \\
 --lisa_activated_layers 2 \\
 --lisa_step_interval 20
\`\`\`

同时，我们将--lisa_activated_layers置为0，进行全参数训练，并且使用r=8进行了LoRA训练，得到的效果如下：

| **exp_name** | **model_type** | **dataset** | **tuner** | **tuner_params**                                             | **trainable params(M)** | **flash_attn** | **gradient_checkpointing** | **hypers**       | **memory**   | **train speed(samples/s)**               | **train_loss** | **eval_loss** | **gsm8k weighted acc** | **arc weighted acc** | **ceval weighted acc** |
| ------------ | -------------- | ----------- | --------- | ------------------------------------------------------------ | ----------------------- | -------------- | -------------------------- | ---------------- | ------------ | ---------------------------------------- | -------------- | ------------- | ---------------------- | -------------------- | ---------------------- |
| full         | qwen-7b-chat   | ms-agent    | full      |                                                              | 7721.3245(100.0000%)    | True           | True                       | lr=5e-05/epoch=2 | 73.53GiB     | 1.43(87543 samples/61022.97 seconds)     | **0.54**       | **0.95**      | 0.343                  | 0.536                | 0.495                  |
| full+lisa_2  | qwen-7b-chat   | ms-agent    | full      | lisa_activated_layers=2/lisa_step_interval=20                | 7721.3245(100.0000%)    | True           | True                       | lr=5e-05/epoch=2 | **31.11GiB** | **2.66(76837 samples/28881.28 seconds)** | 0.62           | 1.06          | 0.349                  | 0.653                | 0.592                  |
| full+lisa_4  | qwen-7b-chat   | ms-agent    | full      | lisa_activated_layers=4/lisa_step_interval=20                | 7721.3245(100.0000%)    | True           | True                       | lr=5e-05/epoch=2 | 31.87GiB     | 2.63(76837 samples/29215.15 seconds)     | 0.63           | 1.06          | 0.377                  | 0.656                | **0.607**              |
| lora         | qwen-7b-chat   | ms-agent    | lora      | rank=8/target=ALL/alpha=32/lr_ratio=None/use_rslora=False/use_dora=False | 17.8913(0.2312%)        | True           | True                       | lr=5e-05/epoch=2 | 32.35GiB     | 0.95(87543 samples/91974.29 seconds)     | 0.53           | 1.01          | **0.462**              | **0.676**            | 0.304                  |



从我们的实验中可以看到下面的结论：

1. 在显存占用中，全参数几乎是其他轻量训练方式显存占用的两倍，但是在loss中也是最低的，这说明全参数在模型训练的基础指标中仍然是最优的；
2. LISA的显存使用比r=8（这是个常用值）的显存占用要低，其中lisa_activated_layers越低显存越低
3. 训练速度上LISA的训练速度也比LoRA要快一些，并且该指标也受到lisa_activated_layers的影响
4. 在评估指标上，LoRA更为优秀，然而评估指标受到数据集的强烈影响，由于训练主要内容是Agent数据集，因此说明LoRA在防止灾难性遗忘上具有一定的优势

![img](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/5eecdaf48460cde53952abddcdbfd6dcfc4b2466ebb3131658e70b814913bc360a414d3de9277d871abf3af1cbd7524981b04e3bb510935ec161f6181fc618404740d68feab372357882332d22ecadb26a8d2a4c07a47e3cfc653b69905bac42.png)

LISA lisa_activated_layers=2 训练的loss

![img](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/5eecdaf48460cde53952abddcdbfd6dcfc4b2466ebb3131658e70b814913bc360a414d3de9277d871abf3af1cbd75249e479122a19c13113fce9f9f1eb0bdda043a248c74afbaa822feac193bf10ddcabaf127835a4dec15fc653b69905bac42.png)

LoRA r=8 训练的loss

可以观察到LISA的训练loss较LoRA曲线更为抖动一些，猜测可能是LISA随机挑选layer进行反向传播的随机性造成的。



## **结论**

可以看到LISA作为2024年的新晋tuner，使用一个非常简单的方式做到了部分数据集的SOTA，同时显存使用和训练速度也是很优秀的，且没有额外的使用条件。然而LISA仍然存在着一些可以分析讨论的问题，比如：是否可以通过参数范数或者参数矩阵特征值判断哪些layers应该被反向传播？或者是否可以在更细粒度上（qkv/mlp/layernorm）层面上控制反向传播？如果有做过实验的同学欢迎留言讨论。`
    },
    {
      id: "llm-m-alignment",
      title: "M. 人类偏好对齐训练",
      file: "LLM-tutorial/M.人类偏好对齐训练.md",
      difficulty: "高级",
      duration: "1h",
      week: 3,
      phase: 3,
      keywords: ["RLHF", "DPO", "偏好对齐", "奖励模型", "对齐训练"],
      content: `# 人类偏好对齐训练

## 目录
- [背景](#背景)
- [RLHF](#rlhf)
- [DPO](#dpo)
- [KTO](#kto)
- [CPO](#cpo)
- [ORPO](#orpo)
- [SimPO](#simpo)
- [理解人类偏好对齐训练算法](#理解人类偏好对齐训练算法)
- [训练代码](#训练代码)

##  背景
大型语言模型（LLMs）通过在大量文本数据集上进行无监督预训练，获得丰富的语言模式和知识，这一阶段训练后的模型被称为base model。base model能够理解语言并生成连贯的文本，但仍然存在一些问题，比如：
- 不良输出：模型可能会生成各种偏见、不真实信息和有害内容。
- 跟随指令的能力不足：尽管预训练模型可以生成连贯的文本，但它们在遵循用户指令和特定任务规范方面往往较差。例如，当模型被要求生成尊重特定规则或风格的文本时，它们可能无法完全理解并遵循这些具体的要求。

这些问题有几个原因：
- 语料偏差：
    - 来源广泛的互联网文本：预训练模型使用大量互联网上的文本数据，这些数据来源多样，包括社交媒体、新闻文章、论坛帖子、百科全书等。这些数据不可避免地包含偏见、不真实信息和有害内容。
    - 数据缺乏筛选和校验：由于数据量庞大，预训练过程中难以对每一条数据进行细致筛选和校验，导致模型可能会学习到这些不良特性并在生成输出时反映出来。例如，模型可能会生成带有性别或种族偏见的内容。
- 任务不直接相关：
    - 广泛涵盖不同主题：预训练数据涵盖了广泛的主题，但其中许多内容与用户实际应用中的具体任务无关。例如，社交媒体上的对话与正式的问答系统所需的语言风格和准确性可能截然不同。
- 缺少特定任务数据：
    - 尽管预训练数据量大，但并未专门针对某一具体任务进行优化。例如，翻译任务、法律文本解析或医疗文献总结等高度专业化的任务在通用的预训练数据集中可能所占比重很小。
- 训练目标和实际任务不同：
    - 目标和任务目标不一致：预训练模型的目标是最大化下一个词的预测概率（即最小化语言模型的交叉熵损失）。这一目标虽然能帮助模型掌握语言的语法和词汇模式，但与实际应用中的任务目标不完全一致。预训练侧重语言连贯性，而非任务完成度：模型通过预测下一个词可以生成连贯的文本，但这种连贯性仅限于语言层面，不能保证生成的内容在逻辑、事实准确性或符合特定任务规范方面的表现。例如，在回答问题时，预训练模型可能生成语法正确但内容不准确的回答。
- 缺乏明确的指令跟随：
    ‒ 没有具体任务指导：预训练阶段模型没有被专门指导去遵循具体的指令或规则。这导致模型在面对实际任务时，可能无法完全理解和遵循用户的具体要求。生成风格化文本、遵守伦理和规范、提取特定信息等任务需要更细致的指导和约束，而这在无监督预训练阶段往往缺失。

仅靠无监督预训练无法完全满足实际应用中的需求，这也引出了本期的主题——人类偏好对齐训练。通过特定的训练过程，模型的输出可以更好地与人类偏好对齐。我们平时见到的 xxx-instruct 和 xxx-chat 模型，一般是经过了人类偏好对齐训练的模型。

## RLHF

论文：https://proceedings.neurips.cc/paper_files/paper/2022/file/b1efde53be364a73914f58805a001731-Paper-Conference.pdf

这篇论文使用人类反馈强化学习（Reinforcement Learning from Human Feedback, RLHF）的方法，基于base model，并经过三个阶段的训练过程，最终得到的InstructGPT模型在遵循人类偏好方面，表现超过了参数量大100倍的175B GPT-3模型。

训练过程分为三个阶段
![rlhf](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/rlhf.png)
从一个预训练的语言模型和一个希望模型产生对齐回答的问题库开始
- 第一阶段，根据问题库中的问题和人工标注的回答产生的数据集来监督学习微调模型，得到SFT模型
- 第二阶段，收集一组模型输出的比较数据集，由问题和不同的模型输出组成，标注者指出给定输入的情况下他们更偏好的输出。然后训练一个奖励模型，以预测人类偏好的输出。
- 第三阶段，利用奖励模型的输出作为标量奖励，使用PPO算法微调SFT模型以优化这一奖励
其中，二三步可以迭代进行。

### 训练细节
**第一阶段 SFT训练**
数据集D由模型输入prompt，以及希望模型输出的回答response组成，分别用符号 $x$ , $y$ 表示
用$\\pi_\\theta$表示模型，设 $y$ 的长度为 $T$ ，当给定prompt $x$ , 模型产生reponse $y$ 的概率可以表示为

$$\\pi_{\\theta}(y\\mid x) = \\left[ \\prod_{t=1}^{T} \\pi_{\\theta} (y_t | x, y_{1:t-1}) \\right]$$

其中 $\\pi_{\\theta} (y_t | x, y_{1:t-1})$ 表示给定第t个token前的输入，模型输出第t个token的概率

SFT阶段使用以下损失训练模型


$$L_{{\\text{SFT}}} =- E_{(x, y) \\sim D} \\left[ \\log\\pi_\\theta(y\\mid x)\\right] =- E_{(x, y) \\sim D} \\left[ \\sum_{t=1}^{T} \\log \\pi_{\\theta} (y_t | x, y_{1:t-1}) \\right]$$


简单起见，我们将这一阶段训练后的模型称为SFT模型

对于SFT阶段，我们可以简单理解为 对我们想要模型回答好的问题（比如遵循指令进行回答，对应数据集中的prompt），收集想要模型输出的回答（对应数据集中的response），提升模型对期望回答的生成概率。

**第二阶段 奖励建模**
这一阶段，训练了一个模型来近似人类的偏好对模型的输出进行打分。具体而言，该模型将prompt和response作为输入，输出一个标量值。用 $r_\\phi$ 表示奖励模型，$r\\_\\phi (x,y)$ 表示给定prompt $x$ 和response $y$ 下奖励模型的标量输出
训练奖励模型使用的数据集D由模型输入prompt，以及希望模型输出的回答chosen和不希望模型输出的回答rejected组成，分别用符号 $x,y_w,y_l$ ,表示。

给定数据 $(x,y_w,y_l)$, 使用最大似然估计损失训练奖励模型

$$L_R (r_\\phi) = -E_{(x, y_w, y_l) \\sim D} \\left[ \\log \\sigma (r_\\phi (x, y_w) - r_\\phi (x, y_l)) \\right]$$

其中 $\\sigma$ 表示 sigmoid 函数

论文中每次会选取K个回答，两两组合进行训练，这里我们简化为对回答对的损失函数

这一阶段，我们训练了一个模型作为人类代理，通过奖励模型给出的分数高低，可以反应出一个回答被人类的偏好程度，后续可以根据这个奖励模型对大模型进行进一步的训练。

**第三阶段 强化学习**
强化学习和PPO算法

这里简单介绍强化学习的背景：智能体（Agent）通过与环境（Environment）进行互动，根据所获得的奖励（Reward）来学习最佳决策策略。智能体的目标是通过在不同状态（State, (s)）下选择最佳的动作（Action, (a)），从而最大化累计奖励。

接下来具体介绍强化学习的一些数学概念，对公式不感兴趣的同学可以跳过这一节

马尔可夫决策过程(Markov Decision Process, MDP)：强化学习一般会将智能体与环境交互的过程简化为马尔可夫链。简单来说就是假设某阶段的状态一旦确定，则此后过程的演变不再受此前各状态及决策的影响。具体表现在下一状态的转移概率只依赖上一时刻的动作和状态，奖励函数只依赖当前的状态和奖励。

建模一个MDP强化学习问题，通常由五元组 $(S,A,R,P,\\gamma)$ 组成，其中

状态空间 $S$ 表示所有可能的状态集合

动作空间 $A$ 表示所有可能的动作集合

奖励函数 $R(s,a):S\\times A\\to R$ 表示在状态s下智能体采取动作a，从环境中得到的奖励值

转移概率 $P(s_{t+1},s_t,a_t):S\\times A\\to P(S)$ 表示状态 $s_{t}$ 下智能体采取动作 $a_t$ ，状态转移至 $s_{t+1}$ 的概率。其中P(S)表示定义在状态空间上的概率分布

折扣因子 $\\gamma\\in(0,1]$ (在之后的状态价值函数和动作状态价值函数中体现), 有两个作用。第一，表示未来奖励在当前决策中的价值，越小表示智能体越短视（更关注近期奖励）。第二，当MDP无限长时，小于1的折扣因子可以确保后续的价值函数有界。

状态价值函数 $$V^{\\pi}(s) = E_{a_t\\sim\\pi(\\cdot\\mid s_t),s_{t+1}\\sim P(\\cdot \\mid s_t,a_t)} \\left[ \\sum_{t=0}^{\\infty} \\gamma^t R(s_t,a_t) \\mid s_0 = s \\right]$$ 表示在状态s下，采取策略 $\\pi$ 的期望累积奖励和。可以看到当 $\\gamma$ 越小，未来时刻的奖励在求和时越低。

动作价值函数 $$Q^\\pi(s,a)=E_{a_{t+1}\\sim\\pi(\\cdot\\mid s_{t+1}),s_{t+1}\\sim P(s_t,a_t)} \\left[ \\sum_{t=0}^{\\infty} \\gamma^t R(s_t,a_t) \\mid s_0 = s,a_0=a \\right]$$ , 表示在状态 $s$ 和动作 $a$ 下，采取策略 $\\pi$ 的期望累积奖励和。

优势价值函数刻画状态 $s$ 下采取动作奖励 $a$ ，策略 $\\pi$ 的相对价值，具体表示为
$A^{\\pi}(s, a) = Q^{\\pi}(s, a) - V^{\\pi}(s)$

优势价值函数和动作价值函数都可以反应在状态s下，采取动作a的价值。

假设初始状态 $s_0$ 服从分布 $u$ ，强化学习的目标即从策略空间 $\\Pi$ 中得到最大化状态价值/动作价值/优势价值的策略。

这里以状态价值为例，可以写为 $\\pi = E_{s_0\\sim u,a_t\\sim\\pi(\\cdot\\mid s_t),s_{t+1}\\sim P(\\cdot\\mid s_t,a_t)}\\max_{\\pi\\in \\Pi }V^{\\pi}(s),t=0,1,2,...$ 

假设我们能获取策略的价值函数，那么一个很简单的策略就是贪心算法：在每个状态 $s_t$ 下，采取最大化动作价值函数的动作 $\\pi(\\cdot\\mid s_t)=\\max_a Q^\\pi(s_t,a)$, 可以证明这样的贪心策略是最优策略。

但是实际应用中，我们往往不知道问题具体的奖励函数，转移概率（这样的问题在强化学习领域中被划分为model-free问题），故无法求解状态/动作状态价值，智能体只能在环境中采取动作来采样奖励。所以需要智能体在环境中不断试错（尝试各种动作并获取环境反馈的奖励值），总结经验来完善策略。

在强化学习中，策略优化方法可以大致分为基于值函数的（value-based）和基于策略的（policy-based）方法

- 基于值函数的方法（Value-Based Methods）：这些方法通过学习状态值函数  $V(s)$ 或者动作价值函数 $Q(s, a)$ 来间接确定策略。典型的算法如 Q-Learning、深度 Q 网络（DQN）等。假设我们可以学习到一个非常近似最优策略 $\\pi^\\star$ 的动作价值函数 $Q^{\\pi^{\\star}}$ , 我们就可以根据动作价值选择相应最高的动作，等于间接获得了最优策略。
- 基于策略的方法（Policy-Based Methods）：这些方法直接学习策略，通过优化策略来最大化累计奖励。策略梯度方法（Policy Gradient）是其中的代表。

PPO 算法是基于策略的方法中的一种，它结合了策略梯度方法和信赖域优化的优点，通过限制每次策略更新的步长，保持新策略与旧策略的接近程度，以避免策略更新过大带来的不稳定性和性能下降。
PPO算法的损失函数如下
$$L^{\\text{CLIP}}(\\theta) = E_{t} \\left[\\min \\left( \\frac{\\pi_\\theta(a_t \\mid s_t)}{\\pi_{\\theta_{\\text{old}}}(a_t \\mid s_t)} \\hat{A}\\_t(a_t \\mid s_t), \\text{clip} \\left( \\frac{\\pi_\\theta(a_t \\mid s_t)}{\\pi_{\\theta_{\\text{old}}}(a_t \\mid s_t)}, 1 - \\epsilon, 1 + \\epsilon \\right) \\hat{A}_t(a_t \\mid s_t) \\right) \\right]$$

其中：

$$
\\text{clip}(x, a, b) = \\begin{cases}
    a & \\text{if } x < a \\\\
    b & \\text{if } x > b \\\\
    x & \\text{otherwise}
\\end{cases}
$$

$\\pi_{\\theta}$ 是当前策略，$\\pi_{\\theta_{\\text{old}}}$ 是旧策略，$\\hat{A}_t$ 是估计的优势函数（advantage function）值，结合[GAE](https://arxiv.org/abs/1506.02438)算法,通过采样的历史奖励和价值网络进行估计，$\\epsilon$ 是一个很小的常数，用于控制新的策略与旧的策略步长的范围。
通过引入 clip 操作，PPO 确保了新策略与旧策略之间的变化不会过大，保证了策略更新过程中的稳定性。

训练
得到奖励模型后，我们相当于得到了近似的奖励函数。将模型视为强化学习问题中的策略，模型的输入和输出分别可以看作是强化学习的状态和动作，我们可以使用强化学习算法对模型进行训练，可以简单理解为训练模型输出奖励最高的回答。

目标函数可以写为

$$J_{r_\\phi}(\\pi_\\theta) = E_{x \\sim D, y \\sim \\pi_\\theta} \\left[ r_\\phi(x, y)\\right]$$
>（对于看了强化学习公式部分的同学可能会有点疑惑，可以将这里的 $r_\\phi$ 看作是价值函数）

然而强化学习训练过程非常不稳定，为此论文中采取了多项措施来缓解这一点。
第一，将SFT模型作为参考模型，用 $\\pi_\\text{ref}$ 表示。在目标函数中加入与参考模型的KL散度正则项来限制模型的更新幅度，

$$J_{r_\\phi}(\\pi_\\theta) = E_{x \\sim D, y \\sim \\pi_\\theta} \\left[ r_\\phi(x, y)\\right]-\\beta D_{KL}(\\pi_\\theta(y\\mid x)\\|\\pi_{\\text{ref}}(y\\mid x))$$

其中超参 $\\beta$ 控制与参考模型的偏离程度

根据目标函数，展开KL散度项，最后的综合奖励可以写为

$$r(x,y)=r_{\\phi}(x,y)-\\beta(\\log\\pi_\\theta(y\\mid x)-\\log\\pi_\\text{ref}(y\\mid x))$$

目标函数写为

$$J_{r_\\phi}(\\pi_\\theta) = E_{x \\sim D, y \\sim \\pi_\\theta} \\left[ r(x, y)\\right]$$

第二，采用PPO算法
PPO 算法本身通过限制每次策略更新的步长，保持新策略与旧策略的接近程度，一定程度上也提高了训练的稳定性。

可能的问题：奖励模型可能会倾向于给OOD样本高分，这一特性可能被模型所利用。PPO可能会利用学习到的奖励模型中的潜在缺陷来获得高奖励，而不符合实际的人类偏好

算法特点：
- 效果显著，应用广泛：
    ‒  目前的SOTA模型，GPT-4 和 Claude 等模型都选择了RLHF作为对齐算法。
- 奖励建模具备泛化性：
    ‒  虽然奖励模型可能会倾向于给OOD样本高分，但根据[研究](https://arxiv.org/abs/2310.05422)，奖励建模具备一定的泛化能力，能够在不同任务中保持有效性。
- 多维度奖励支持
    ‒  奖励建模可以针对不同维度设计奖励。例如一些研究比如[Training a Helpful and Harmless Assistant with Reinforcement Learning from Human Feedback
](https://arxiv.org/abs/2204.05862), [Llama 2: Open Foundation and Fine-Tuned Chat Models
](https://arxiv.org/abs/2307.09288)中分别根据“帮助性”和“无害性”两个维度来设计奖励
- 多阶段的训练过程复杂，最终的训练过程需要运行四个模型，计算资源要求高
- RL本身的不稳定性，对训练参数设置比较敏感。

## DPO
论文：https://arxiv.org/abs/2305.18290

### 推导过程
(对数学推导不感兴趣的同学可以直接看训练部分)

Bradley-Terry (BT) 偏好模型认为人类的偏好分布可以用以下式子表示

$$P_\\phi (y_w \\succ y_l \\mid x) = \\frac{\\exp \\left( r_\\phi (x, y_w) \\right)}{\\exp \\left( r_\\phi (x, y_w) \\right) + \\exp \\left( r_\\phi (x, y_l) \\right)} = \\sigma \\left( r_\\phi (x, y_w) - r_\\phi (x, y_l) \\right)$$

表示了人类的偏好是由隐含的奖励模型 $r_\\phi$ 所产生

而RLHF中的奖励建模阶段的损失函数 

$$L_R (r_\\phi) = -E_{(x, y_w, y_l) \\sim D} \\left[ \\log \\sigma (r_\\phi (x, y_w) - r_\\phi (x, y_l)) \\right]$$

可以认为是在给定 $(x,y_w,y_l)$ 数据下，极大似然估计BT偏好模型

而对于RLHF强化学习阶段的目标

$$\\max_{\\pi_{\\theta}} J_{r_\\phi}(\\pi_\\theta) = E_{x \\sim D, y \\sim \\pi_\\theta} \\left[ r_\\phi(x, y)\\right]-\\beta D_{KL}(\\pi_\\theta(y\\mid x)\\|\\pi_{\\text{ref}}(y\\mid x))$$

其实存在闭式解，用r表示真正的奖励函数，那么闭式解等于

$$\\pi^\\star(y \\mid x) = \\frac{1}{Z( x)} \\pi_{\\text{ref}}( y \\mid  x) \\exp\\left(\\frac{1}{\\beta} r( x,  y)\\right).$$

其中配分函数 $$Z(\\mathbf x)=\\sum_\\mathbf y  \\pi_{\\text{ref}}(\\mathbf y \\mid \\mathbf x) \\exp\\left(\\frac{1}{\\beta} r(\\mathbf x, \\mathbf y)\\right)$$.

而实际上即使我们能用奖励模型 $r_\\phi$ 去近似 $r$ ，仍然很难计算 $Z( x)$ ,然而我们可以通过上述式子得到 真实奖励函数的关于最优策略 $\\pi^\\star$ 的表达式

$$r(x, y) = \\beta \\log \\left( \\frac{\\pi^\\star(y \\mid x)}{\\pi_{\\text{ref}}(y \\mid x)} \\right) + \\beta \\log Z(x)$$

将该奖励函数代入BT偏好模型，可以得到最优策略 $\\pi^\\star$ 的偏好分布

$$p^*(y_1 \\succ y_2 \\mid x) = \\frac{1}{1 + \\exp \\left( \\beta \\log \\frac{\\pi^{\\*}(y_2 \\mid x)}{\\pi_{\\text{ref}}(y_2 \\mid x)} - \\beta \\log \\frac{\\pi^{\\*}(y_1 \\mid x)}{\\pi_{\\text{ref}}(y_1 \\mid x)} \\right)}$$

类似于RLHF中的奖励建模阶段，我们用最大似然估计得到DPO的损失函数

$$L_{\\text{DPO}}(\\pi_\\theta; \\pi_{\\text{ref}}) = -E_{(x, y_w, y_l) \\sim D} \\left[ \\log \\sigma \\left( \\beta \\log \\frac{\\pi_\\theta(y_w \\mid x)}{\\pi_{\\text{ref}}(y_w \\mid x)} - \\beta \\log \\frac{\\pi_\\theta(y_l \\mid x)}{\\pi_{\\text{ref}}(y_l \\mid x)} \\right) \\right]$$

### 训练
作者从数学上证明了，求解RLHF的目标函数的最优解等价优化于以下的DPO损失函数：

$$L(\\pi_\\theta ; \\pi_{\\text{ref}}) = -E_{(x, y_w, y_l) \\sim D} \\left[ \\log \\sigma \\left( \\beta \\log \\frac{\\pi_\\theta (y_w \\mid x)}{\\pi_{\\text{ref}} (y_w \\mid x)} - \\beta \\log \\frac{\\pi_\\theta (y_l \\mid x)}{\\pi_{\\text{ref}} (y_l \\mid x)} \\right) \\right]$$

可以认为算法通过偏好数据集中的 $(x,y_w,y_l)$, 估计了隐含的奖励模型 $r(x,y_w)=\\beta\\frac{\\pi_\\theta(y_w \\mid x)}{\\pi_{\\text{ref}}(y_w \\mid x)}$ 和 $r( x, y_l)=\\beta\\frac{\\pi_\\theta(y_l \\mid x)}{\\pi_{\\text{ref}}(y_l \\mid x)}$ (省略配分函数项)。从而省略了显性的奖励建模阶段

我们可以直观地理解损失函数：训练过程中，对于偏好回答，相比参考模型，模型会增加生成的概率；对于拒绝回答，相比参考模型，模型会降低生成的概率。

超参
- beta: 同RLHF中的KL项系数beta，值越大表示对偏离参考模型的惩罚越大

算法特点
- DPO跳过了RLHF的奖励建模阶段，且只需要运行两个模型。
- DPO消除了RLHF中的一些关于PPO算法的超参设置，训练更简单
- DPO在近似奖励模型部分用数据集的经验分布近似真实的数据分布，当两者差异较大时会使训练不稳定。对于数据集中没有覆盖的数据，DPO可能会分配较高的奖励，而RLHF中训练的奖励模型会具有一定的泛化性。
- 偏好数据集本身可能存在一些bias，比如chosen的回复一般较长，导致最终训练模型的输出也会较长，可能间接会使模型的回复准确性
- 有研究表明DPO在out of distribution的数据上训练表现不佳(https://arxiv.org/abs/2312.10584/https://arxiv.org/abs/2404.10719)

建议在开始DPO训练之前，使用偏好数据集中的偏好回答部分进行SFT训练，以确保数据符合DPO算法的分布要求。

## CPO
论文：https://arxiv.org/abs/2401.08417
CPO论文指出在翻译任务中，SFT的损失函数只会让模型回答尽可能接近数据集中的回答，受限于数据集的质量。而且SFT缺乏训练模型不产生（拒绝）错误回答的机制。因此，作者提出了一个新的训练目标来指导模型优先生成更高质量的翻译并拒绝较差的翻译。

CPO基于DPO的损失函数做简化，将ref model简化为均匀分布 $U$ ，损失函数先简化为

$$L(\\pi_\\theta ; U) = -E_{(x, y_w, y_l) \\sim D} [ \\log \\sigma ( \\beta \\log \\pi_\\theta (y_w \\mid x)- \\beta \\log \\pi_\\theta (y_l \\mid x )]$$

并加入SFT损失项作为正则化项，最终的CPO loss可以写为

$$L_{\\text{CPO}}=L(\\pi_\\theta ; U)-E_{(x, y_w, y_l) \\sim D}[\\log\\pi_{\\theta}(y_w\\mid x)].$$

超参
- beta：隐含奖励前的系数，默认为0.1


算法特点
- 不需要参考模型，节约训练的计算资源
- 加入的SFT损失会提升一定的训练稳定性
- 没有参考模型的限制，训练过程可能仍然会不稳定。

## KTO
论文：https://arxiv.org/abs/2402.01306
KTO引入了前景理论（prospect theory），该理论解释了为什么人类在面对不确定事件时，做出的决定不一定是期望最大的。比如当面临80%可能性获得100元，20%可能性0元的赌博，人类可能会接受60元来避免，尽管60元小于赌博的期望收益80元。

前景理论(prospect theory)

前景理论中，Tversky & Kahneman 用以下效用方程建模了人类价值

$$
v(z, z_{\\text{ref}};\\alpha, \\lambda) =
    \\begin{cases}
        (z - z_{\\text{ref}})^{\\alpha} & \\quad \\text{if } z \\geq z_{\\text{ref}} \\\\
        -\\lambda(z_{\\text{ref}} - z)^{\\alpha} & \\quad \\text{if } z < z_{\\text{ref}}
    \\end{cases}
$$

价值函数 $v:z \\to R$ 将一个输出 $z$ 相对一个参考值 $z_{\\text{ref}}$ 映射到其感知(或者说主观)价值，反应了人类相比起相同大小回报，对损失的敏感性更大

其中超参 $\\alpha$ 控制价值变化的速度，$\\lambda$ 反应对损失的敏感程度

KTO loss
与DPO和RLHF相比，KTO不需要为每个提示（prompt）配对提供偏好回答和拒绝回答。它仅需要一个答案，并利用一个标签值（true/false）来指示该答案的质量是正面的还是负面的（对应效用方程中大于/小于参考值）。KTO不要求偏好回答的数量与拒绝回答的数据相同，简化了数据的准备流程

作者对Tversky & Kahneman的效用方程做了一定的修改，使其更适合模型训练，损失函数如下

$$L_{\\text{KTO}}(\\pi_{\\theta}, \\pi_{\\text{ref}}) = E_{x,y \\sim D}[w(y)(1-v_{\\text{KTO}}(x,y;\\beta))]$$

其中

$$
\\begin{aligned}
r_{\\text{KTO}}(x, y) &= \\beta \\log \\frac{\\pi_{\\theta}(y \\mid x)}{\\pi_{\\text{ref}}(y \\mid x)} \\\\
z_{\\text{ref}} &= E_{x' \\sim D} \\left[ \\beta \\text{KL}\\left(\\pi_{\\theta}(y' \\mid x') \\mid\\mid \\pi_{\\text{ref}}(y' \\mid x')\\right) \\right] \\\\
v_{\\text{KTO}}(x) &= 
\\begin{cases} 
\\sigma\\left( r_{\\text{KTO}}(x, y) - z_{\\text{ref}} \\right) & \\text{if } y \\sim y_{\\text{desirable}} \\mid x \\\\ 
\\sigma\\left( z_{\\text{ref}} - r_{\\text{KTO}}(x, y) \\right) & \\text{if } y \\sim y_{\\text{undesirable}} \\mid x 
\\end{cases} \\\\
w(y) &= 
\\begin{cases} 
\\lambda_{D} & \\text{if } y \\sim y_{\\text{desirable}} \\mid x \\\\ 
\\lambda_{U} & \\text{if } y \\sim y_{\\text{undesirable}} \\mid x 
\\end{cases} 
\\end{aligned}
$$

我们一步步理解这个损失函数
- $y \\sim y_{\\text{desirable }}| x$ 和 $y \\sim y_{\\text{undesirable }}| x$ 分别表示标签值为true/false的回答，对应了效用方程中高于/低于参考点的输出值z
- $v_{\\text{KTO}}$ 直接来自于效用方程, 用DPO的隐含奖励项 $\\beta \\log \\frac{\\pi_{\\theta}(y|x)}{\\pi_{\\text{ref}}(y|x)}$ 作为效用方程的输入值 $z$，用 $\\sigma$ 函数代替指数 $\\alpha$。
- 对于效用方程中的超参 $\\lambda$, 作者拆为两个超参 $\\lambda_D$ 和 $\\lambda_U$，分别控制两种回答对应的损失权重

用 $n_D$ 和 $n_U$ 分别表示数据集中偏好回答和拒绝回答的样本数量，对于超参 $\\lambda_D$ 和 $\\lambda_U$，作者推荐设置 $\\frac{\\lambda_Dn_D}{\\lambda_Un_U}\\in[1,\\frac{4}{3}]$

超参
- beta 同DPO
- desirable_weight ：损失函数中的 $\\lambda_D$ 项，偏好回答样本的损失权重
- undesirable_weight ：损失函数中的 $\\lambda_U$ 项，拒绝回答样本的损失权重

算法特点
- KTO不需要成对的偏好/拒绝回答，只需要在SFT数据上额外标注label（好或坏），相比其他算法更容易获取数据
- 相比DPO需要先经过SFT训练，KTO可以直接在偏好数据集上进行训练（类似SFT）


## ORPO
论文：https://arxiv.org/abs/2403.07691
无论是RLHF还是DPO，都存在两个问题。第一，两者都需要先经过SFT，在大量数据上做监督训练后，再做后续的训练。第二，两者都需要使用一个参考模型计算KL散度正则项来限制模型的更新，从而使更新过程更加稳定，RLHF和DPO的参考模型选择了在SFT后的模型作为参考模型。这种KL散度正则项可能会降低模型生成的多样性以及限制模型性能的上限。而ORPO(Odds Ratio Preference Optimization)，只需要SFT一个训练阶段，且不需要参考模型。

ORPO的论文分析了为什么传统的人类指令对齐方法需要在SFT之后再进行指令执行训练：SFT训练的交叉熵损失函数仅会增加标签对应的token的概率，而不会降低生成不期望回答的概率。作者通过一个简单实验来展示这一点，使用HH-RLHF数据集的偏好回答对OPT-350M模型进行SFT训练，结果发现模型生成偏好回答和拒绝回答的概率都会随之增高。

受此启发，作者在传统的SFT损失函数中加入了一项Odd Ratio损失，具体来说

$\${\\text{odds}}\\_\\theta(y\\mid x) = \\frac{P_\\theta(y\\mid x)}{1-P\\_\\theta(y\\mid x)}$$

表示模型给定输入 $x$ ,生成回答 $y$ 相比不生成的概率比

$$\\text{OR}\\_\\theta(y_w,y_l)=\\frac{{{\\text{odds}}}_\\theta(y_w\\mid x) }{{{\\text{odds}}}\\_\\theta(y_l\\mid x) }$$

最终的ORPO损失函数为

$$L_{\\text{ORPO}}=E_{x,y_w,y_l}[L_{\\text{SFT}}-\\lambda\\log \\sigma(\\log\\text{OR}_\\theta(y_w,y_l))]$$

从损失函数可以看出，训练过程中会拉开模型对偏好回答和拒绝回答的生成概率
超参：$\\lambda$ 表示OR loss前的系数

## SimPO

论文：https://arxiv.org/abs/2405.14734

SimPO类似CPO，在DPO的损失函数基础上省略了ref model项，（可以视为将ref model简化为均匀分布）

$$L(\\pi_\\theta ; U) = -E_{(x, y_w, y_l) \\sim D} [ \\log \\sigma ( \\beta \\log \\pi_\\theta (y_w \\mid x)- \\beta \\log \\pi_\\theta (y_l \\mid x )]$$

并取序列平均生成概率作为隐含奖励，即作长度正则

$$L(\\pi_\\theta ; U) = -E_{(x, y_w, y_l) \\sim D} [ \\log \\sigma ( \\beta \\frac{\\log \\pi_\\theta (y_w \\mid x)}{|y_w|}- \\beta \\frac{\\log \\pi_\\theta (y_l \\mid x )}{|y_l|})]$$

并加入了reward margin项 $\\gamma$ 来扩大两个隐含奖励的差距,得到SimPO的损失函数

$$L_{\\text{SimPO}}= -E_{(x, y_w, y_l) \\sim D} [ \\log \\sigma ( \\beta \\frac{\\log \\pi_\\theta (y_w \\mid x)}{|y_w|}- \\beta \\frac{\\log \\pi_\\theta (y_l \\mid x )}{|y_l|}-\\gamma)]$$

对比DPO和SimPO中的隐含奖励项


超参
- beta: 隐含奖励前的系数
- gamma：reward margin

算法特点
- 不需要参考模型，节约训练的计算资源
- 长度正则可以降低模型输出过长文本的概率
- 经验表明，SimPO算法对超参特别是学习率较为敏感
- 没有参考模型的限制，训练过程可能会较为不稳定。
- 论文缺乏一定的理论证明，模型容易训崩

建议搭配SimPO和全参训练，并采取较低的学习率

## 理解人类偏好对齐训练算法

**如何选择人类偏好对齐训练还是SFT？**
从SFT的损失函数

$$L_{\\text{SFT}} =- E_{(x, y) \\sim D} \\left[ \\log\\pi_\\theta(y\\mid x)\\right] =- E_{(x, y) \\sim D} \\left[ \\sum_{t=1}^{T} \\log \\pi_{\\theta} (y_t | x, y_{1:t-1}) \\right]$$

可以看出SFT训练强调让模型模仿数据集中的回答，扩大相应的生成概率。

而人类偏好对齐训练额外考虑了如何降低模型生成我们不希望回答的概率，通过拒绝回答提供额外的监督信号

我们可以依据下游任务的具体特点来决定是选择SFT训练方式还是人类偏好对齐训练方法。

对于那些客观性较强且有明确标准答案的任务，例如知识性问答，我们能够利用标准答案对模型实施SFT训练，引导模型学习并模仿这些准确回答。

而在面对那些含糊性或主观性较强的情况，比如需要区分偏好性或拒绝性回答的任务，采用人类偏好对齐训练将更为适宜。这种方法通过引入人类的判断和偏好，帮助模型学会在复杂场景下作出更接近人类期望的回应。

**如何选择人类偏好对齐训练算法？**

如果需要追求最佳性能，RLHF的上限是最高的，但代价是复杂的训练过程和昂贵的计算资源。

对于多数用户，我们更推荐使用DPO系的对齐算法，相对训练过程更简单，对计算资源的要求也更低。

其中如果计算资源紧张，可以尝试不需要参考模型的算法，比如CPO和SimPO。

如果追求性能和训练稳定性，更推荐带有参考模型的算法，比如DPO/KTO/ORPO

当然没有一种算法适合所有任务，也很难证明一个算法一定优于另一个算法，我们建议尝试不同的算法和超参，根据性能结果来做出最终选择。


**人类偏好对齐训练中的指标解读**

指标一般围绕着reward展开

**rewards**(rewards/chosen/rewards/rejected)

对应RLHF中的显式奖励模型的奖励值或DPO系算法的隐式奖励值，不同的算法计算隐式奖励的方式不同，以DPO和SimPO为例

$$r_{\\text{DPO}}(x,y) = \\beta \\log \\frac{\\pi_{\\theta}(y \\mid x)}{\\pi_{\\text{ref}}(y \\mid x)} + \\beta \\log Z(x)$$

> 在最终的训练指标中，会省略 $\\beta \\log Z(x)$ 项

$$r_{\\text{SimPO}}(x,y) = \\frac{\\beta}{\\left| y \\right|} \\log \\pi_{\\theta}(y\\mid x)= \\frac{\\beta}{\\left| y \\right|}\\sum^{\\left| y \\right|}_{i=1}\\log\\pi\\_{\\theta}(y\\_i \\mid x, y\\_{{<}i})$$


奖励可以理解为模型对偏好/拒绝回答的认知。一个比较理想的训练过程是偏好回答的奖励呈上升趋势，从隐式奖励的式子中理解即对偏好回答的概率上升；拒绝回答的奖励呈下降趋势，从隐式奖励的式子中理解即对拒绝回答的生成概率下降；

**rewards/margins**
表示偏好回答和拒绝回答的平均奖励差值，理想的训练过程是margin呈上升趋势

**rewards/accuracies**
表示偏好回答的奖励大于拒绝回答奖励的比例，理想的训练过程是呈上升趋势。

还有一些其他指标比如loss,logps,logits与SFT一致，这里不再展开

## 训练代码

swift已经集成了DPO、KTO、CPO、ORPO和Simpo训练代码，你可以通过简单的命令行指令开始训练
训练脚本请参考[文档](https://github.com/modelscope/swift/blob/main/docs/source/LLM/%E4%BA%BA%E7%B1%BB%E5%81%8F%E5%A5%BD%E5%AF%B9%E9%BD%90%E8%AE%AD%E7%BB%83%E6%96%87%E6%A1%A3.md)
`
    },
    {
      id: "llm-n-quantization-deep",
      title: "N. 量化技术解析",
      file: "LLM-tutorial/N.量化技术解析.md",
      difficulty: "高级",
      duration: "1.5h",
      week: 3,
      phase: 3,
      keywords: ["量化原理", "GPTQ", "AWQ", "SmoothQuant", "低比特量化"],
      content: `## **量化的定义和基本原理**

**量化是将模型浮点数变为定点数运行的过程。**

![img](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/5eecdaf48460cde5d2227bf8b4577a9753cb521cdd22f44f58e70b814913bc360a414d3de9277d871abf3af1cbd75249008cf07188e14381ac1e99050a5379a98ac579c6c1f81d6b7942bb930afe62fa034330c05d3fbe5efc653b69905bac42.png)

浮点数计算机存储方式示意图

![img](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/5eecdaf48460cde5d2227bf8b4577a9753cb521cdd22f44f58e70b814913bc360a414d3de9277d871abf3af1cbd75249d2aa68d2ffabe662384e50cfef88373fc955f46a4cd28945577b0146f3954a159c2adb17fe123fa9fc653b69905bac42.png)

翻译成人话就是将用小数计算结果的模型，转换成用整数计算，中间自然有精度损失（因为小数位没了，而且浮点数翻译成整形再转回来是有损压缩过程）。

有了这个定义，我们就可以继续下面要讲的部分。在继续下面的内容之前，还是建议大家把上面的模型量化基础读一遍。下面会基于之前的文章，侧重几个方面进行技术分析：

- BnB/HQQ/AWQ/GPTQ等几种量化方法的原理
- 这几种量化方法一般怎么使用

## **原理篇**

### **BnB量化**

BnB全称是BitsAndBytes，是几乎最早集成到transformers框架中的量化算法。

论文地址：

LLM.int8():https://arxiv.org/pdf/2208.07339

QLoRA:https://arxiv.org/abs/2305.14314

我们回顾一下量化的基本思路：

1. 按照整数位数，定义最大值和最小值
2. 按照浮点数和整数的范围比例，对浮点数进行缩放
3. 在forward时，将hidden_states按1-2步骤进行缩放，或者将weights反量化为浮点数进行计算

![img](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/5eecdaf48460cde548bb3dda8cd21eec7ae4abb8b24820c158e70b814913bc360a414d3de9277d871abf3af1cbd75249f9242cbfe9d20f8ccc94ac51c7790964471654c079bc7162e1f2d4c8e19fc0a6e449e11e32c81272fc653b69905bac42.png)

**absmax量化**

bitsandbytes.LLM.int8()算法也是基于上面的思路的，特殊之处在于，在分析weights矩阵的稀疏性质后，总结了下面的特性：

1. 模型weights和hidden_states中存在离群值，比例不到1%
2. 离群值比例虽然低，但是对量化造成了性能恶化

针对离群值的量化算法其实有很多方式，比如分段量化，BnB采用了针对离群值保持低精度浮点数的做法：

1. 从输入的隐藏状态中，按列提取离群值
2. 对离群值以低精度浮点型进行矩阵乘法，对非离群值以int8进行矩阵乘法
3. 对非离群值的结果反量化，将两部分加起来得到最终结果

![img](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/5eecdaf48460cde548bb3dda8cd21eec7ae4abb8b24820c158e70b814913bc360a414d3de9277d871abf3af1cbd752491fa32347e62c08ce0370cdc6acb6c59344d5971f94e15bb19c6172e59ae7222a100830a22d495d02fc653b69905bac42.png)

**离群值/非离群值量化**

在实际实验中，BnB算法发现以6为尺度分割出离群值是最佳的。

在transformers中使用BnB算法比较简单：

\`\`\`
from transformers import BitsAndBytesConfig, AutoModelForCausalLM


bnb_config = BitsAndBytesConfig(
   load_in_8bit=True,
)

model = AutoModelForCausalLM.from_pretrained(some-model-id, quantization_config=bnb_config)
\`\`\`

由于BnB量化不需要任何校准数据集，因此其量化速度很快，这也是为什么在QLoRA训练时，会直接传入BitsAndBytesConfig直接对原始模型量化后训练。

而在QLoRA论文中，作者介绍了4bit量化、双重量化和分页optimizer的技术方案。

![img](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/5eecdaf48460cde548bb3dda8cd21eec7ae4abb8b24820c158e70b814913bc360a414d3de9277d871abf3af1cbd75249fbafa8cfc5d986247559f3b571453844d0902cbb85d45c35ac370cafcda1bcadd0aaffbb69a1b46afc653b69905bac42.png)

**4bit量化**支持两种数据类型：fp4和nf4。fp4是四bit浮点数，包含一位符号位，两位整数位和一位小数位。nf4全称是4-bit NormalFloat，和fp4类似，但是其数值分布并不均匀，呈现正态分布。这是因为一般LLM的矩阵参数概率密度也是呈现正态分布的。在4bit量化中，也更推荐使用nf4数据类型，因为可以比较好的契合参数特性。

nf4的量化思路可以理解为：一般模型weights是均值为0，标准差为σ的的分布，因此该分布可以转换为标准高斯分布。这样可以从标准高斯分布中取样一定分位数的量化间隔并设定量化值（该值采用两边分位数的均值），并且正则化到[-1, 1]区间中。后续就可以将模型weights通过absmax量化到该区间中。

**双重量化**指的是针对量化常数的二次量化。由于BnB的量化是块量化（block-wise），因此块级别的常数存储也会占用GPU memory。对此，在一次量化后针对此类常数进行二次量化，进一步压缩显存空间。

$$
\\mathbf{Y}^{\\text{BF16}} = \\mathbf{X}^{\\text{BF16}} \\text{doubleDequant}(c_1^{\\text{FP32}}, c_2^{k\\text{-bit}}, \\mathbf{W}^{\\text{NF4}}) + \\mathbf{X}^{\\text{BF16}} \\mathbf{L}_1^{\\text{BF16}} \\mathbf{L}_2^{\\text{BF16}}
$$
**doubleDequant的定义：**
$$
\\text{doubleDequant}(c_1^{\\text{FP32}}, c_2^{k\\text{-bit}}, \\mathbf{W}^{k\\text{-bit}}) = \\text{dequant}(\\text{dequant}(c_1^{\\text{FP32}}, c_2^{k\\text{-bit}}), \\mathbf{W}^{4\\text{bit}}) = \\mathbf{W}^{\\text{BF16}}
$$
​     **QLoRA双重反量化：**c_1**是块级别常数的量化常数，**c_2**是原**{W}^{\\text{BF16}}**的量化常数** L_1**、**L_2**分别是LoRA的两个矩阵**

**optimizer分页**可以同比理解为CPU的分页内存概念，防止在长文本时出现的显存爆炸。

下面我们放一点代码帮助理解。

在transformers.intergrations.bitsandbytes.py中：

![img](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/5eecdaf48460cde548bb3dda8cd21eec7ae4abb8b24820c158e70b814913bc360a414d3de9277d871abf3af1cbd7524942cbce54abbd79d6d84215a01198e7d1dfb7ec9e76a5a6c720e6adedb9a3c0cdce0e369aaac14ce2fc653b69905bac42.png)

这里是替换Linear和Conv算子为bnb的起始点。

bitsandbytes.nn.modules.py:

![img](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/5eecdaf48460cde548bb3dda8cd21eec7ae4abb8b24820c158e70b814913bc360a414d3de9277d871abf3af1cbd75249487927a8a282c573c69072b1e159b94ba77fa57d13daa86b0747e3539c9fb45c1b334a81d683a1acfc653b69905bac42.png)

双重量化。可以看到在weights迁移到cuda的时机进行量化。

![img](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/5eecdaf48460cde548bb3dda8cd21eec7ae4abb8b24820c158e70b814913bc360a414d3de9277d871abf3af1cbd752495a70bea9cd0082c27f879f6ea76f481af018b481193bcb10db4b065c57c5dfcf2390036e0d1a30eefc653b69905bac42.png)

继续到C代码bitsandbytes.csrc.kernels.cu：

![img](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/5eecdaf48460cde548bb3dda8cd21eec7ae4abb8b24820c158e70b814913bc360a414d3de9277d871abf3af1cbd752492cb8a12d6644a70f8a9763813bbc5aee988361c722588712a4431e6b338965fefc5d279933be7109fc653b69905bac42.png)

可以看到针对离群点进行了阈值判断并有选择地量化。如果大于离群阈值则直接置0。

4bit量化：

![img](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/5eecdaf48460cde548bb3dda8cd21eec7ae4abb8b24820c158e70b814913bc360a414d3de9277d871abf3af1cbd75249862aa785750e95bb876e95efb0cc48f8116a6b2b7f79d97ccc10ba54d6d05a7efcf4f65c266a3c41fc653b69905bac42.png)

可以看到量化后针对偶数index的参数左移四位，和相邻参数构成了一个完整的byte。

使用QLoRA进行训练请参考下个章节。

### **GPTQ量化**

说到GPTQ，就要说起它的老祖先OBD、OBS、OBC等剪枝算法（否则无法理解GPTQ）。本质上来说，参数剪枝是参数量化的一种特殊情况（把参数直接置为0这个特殊量化值）。

先说OBD。

论文：https://citeseerx.ist.psu.edu/document?repid=rep1&type=pdf&doi=17c0a7de3c17d31f79589d245852b57d083d386e

假设模型的loss为E，在参数有微小扰动\\delta u的情况下进行泰勒级数展开：
$$
\\delta E = \\sum_i g_i \\delta u_i + \\frac{1}{2} \\sum_i h_{ii} \\delta u_i^2 + \\frac{1}{2} \\sum_{i \\ne j} h_{ij} \\delta u_i \\delta u_j + O(||\\delta \\mathbf{u}||^3)
$$
​                                                                                       **loss的泰勒级数展开**

其中g_i是\\delta u的梯度。

假设模型已经在训练集上训练至收敛，则可以假设E在U点处的一阶导为0。在忽略高阶无穷小分量后，上式仅剩余二阶梯度部分。如果**对海森矩阵进行对角近似**，则上式在优化后仅剩余下面的部分：

$$
\\delta E = \\frac{1}{2} \\sum_i h_{ii} \\delta u_i^2
$$
​                                                                                          **Hessian矩阵部分**

由于训练收敛，则海森矩阵是正定的，任何的扰动都会导致loss增加。**剪枝的目标就是找到对参数进行重要性评估，将对E影响最小的参数置为0。**

再说OBS。

论文：https://proceedings.neurips.cc/paper/1992/file/303ed4c69846ab36c2904d3ba8573050-Paper.pdf 

基于OBD的结论，容易看到对角近似的假设是可能存在问题的。OBD主要对这部分进行了改进：

$$
\\delta w_q + w_q = 0 \\quad \\text{or more generally} \\quad \\mathbf{e}_q^T \\cdot \\delta \\mathbf{w} + w_q = 0
$$
上面的式子表示，由于是剪枝，可以直接假设存在δWq分量，该分量使得原权重Wq变为0。或者，假设存在\\delta w矩阵，在e_q这个在q位置为1其他位置为0的单位向量的乘积下和为0。即：

$$
\\min_{q} \\left\\{ \\min_{\\delta \\mathbf{w}} \\left\\{ \\frac{1}{2} \\delta \\mathbf{w}^T \\cdot \\mathbf{H} \\cdot \\delta \\mathbf{w} \\right\\} \\text{ such that } \\mathbf{e}_q^T \\cdot \\delta \\mathbf{w} + w_q = 0 \\right\\}
$$
在具有约束条件的情况下，引入松弛变量构建拉格朗日函数：

$$
L = \\frac{1}{2} \\delta \\mathbf{w}^T \\cdot \\mathbf{H} \\cdot \\delta \\mathbf{w} + \\lambda \\left( \\mathbf{e}_q^T \\cdot \\delta \\mathbf{w} + w_q \\right)
$$
对\\delta w 求导并令其为0，求解后可得：
$$
\\delta \\mathbf{w} = -\\frac{w_q}{[\\mathbf{H}^{-1}]_{qq}} \\mathbf{H}^{-1} \\cdot \\mathbf{e}_q \\quad \\text{and} \\quad L_q = \\frac{1}{2} \\frac{w_q^2}{[\\mathbf{H}^{-1}]_{qq}}
$$
L_q部分就是模型参数对Loss的重要性评估公式。

然后说OBC。

论文：https://openreview.net/pdf?id=ksVGCOlOEba

OBC基于OBS的结论，做了下面的两个假设：

1. 假设了Loss的形式是：

![img](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/5eecdaf48460cde548bb3dda8cd21eec7ae4abb8b24820c158e70b814913bc360a414d3de9277d871abf3af1cbd75249ea49fc1506e08669046d2e43546870c222f5de43ef1b43803fc8a930caf5a7512f5c78efce79a809fc653b69905bac42.png)

即为剪枝后的激活值和剪枝前激活值的MSE loss。

1. 每个权重的行独立影响激活值的行

第一个假设可以把海森矩阵简化为H=2XX^T，第二个假设可以单独的处理每行的剪枝，并只使用col*col大小的海森矩阵。由于H和W无关，因此H全局计算一次即可。而H-1在重要度估计和参数更新时比较重要，因此在剪枝某个参数后H的对应行列会被删除，因此仅需要使用Gauss-Jordan消元法重新计算逆矩阵即可。最终推导的H^{-1}计算公式为：

![img](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/5eecdaf48460cde548bb3dda8cd21eec7ae4abb8b24820c158e70b814913bc360a414d3de9277d871abf3af1cbd75249a5a047f57415921765eb6d9a889941b23ce54a6792a6a61fd5caf3d5080cde537157ab170adec9a6fc653b69905bac42.png)

在整体矩阵尺度上，OBS在分别评估每一行的待剪枝的参数后，整体更新global mask并计算出剪枝后的W：

![img](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/5eecdaf48460cde548bb3dda8cd21eec7ae4abb8b24820c158e70b814913bc360a414d3de9277d871abf3af1cbd7524951ef178590ab316d3ec779f85233863f63cd94a4f3ac9dd6d49dd3e1360fd50a470c538cab9ff12afc653b69905bac42.png)

其中的重要性估计和参数更新公式原型来自OBS。

由于前提假设是剪枝，如果改为量化只需要修改松弛变量条件：

![img](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/5eecdaf48460cde548bb3dda8cd21eec7ae4abb8b24820c158e70b814913bc360a414d3de9277d871abf3af1cbd752496d67fff0b0512c85a48aad24f65240cb96a852ac660e765b7c3d9cee13e3579f00fd1f9bf46c5498fc653b69905bac42.png)

可以得到量化版本的OBC（OBQ）的权重更新公式和重要性评估公式为：

![img](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/5eecdaf48460cde548bb3dda8cd21eec7ae4abb8b24820c158e70b814913bc360a414d3de9277d871abf3af1cbd7524935f9dbbb3f4380f18017238e0d49308b5fb10912f78a93bfc79e79b28af8844be4a3dafbb828401dfc653b69905bac42.png)

OBQ会按照**参数重要性**对参数进行逐个量化。

终于到了GPTQ。

论文：https://arxiv.org/pdf/2210.17323

基于OBS，GPTQ在实现上进行了优化。

1. OBQ总是使用贪婪算法来优先量化对E影响最小的参数，而GPTQ通过实验发现，针对不同的行的量化顺序并不会影响最终结果，这使得量化可以按**列顺序**进行，且行量化可以**并行进行**，提高量化速度
2. 按照OBQ的公式，每次量化一个参数后需要更新整体参数矩阵，但是**对当前列进行量化时，后面的列参数对当前的量化无影响，而是受到当前列量化的影响**（当然这是个近似估计）。因此可以按照B=128进行分块，使得块内部参数立即更新，块外部的后续列只是暂时记录更新的值，等128列整体更新完成，在一起更新后续的列参数。这样可以高效利用GPU的并行计算能力，减小吞吐压力。

![img](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/5eecdaf48460cde548bb3dda8cd21eec7ae4abb8b24820c158e70b814913bc360a414d3de9277d871abf3af1cbd7524924e5107e1f51a5b278a23b6a231b367c47e90e57be67c858fce272c759a802a593aebdb4950fbb02fc653b69905bac42.png)

**Lazy-Batch Updates**

其中的Q代表batch更新的量化索引。

1. 用 Cholesky 分解求海森矩阵的逆。尤其由于2的块更新步骤，使得**近似计算对量化过程的累积误差变得严重**，并出现了H^{-1}变得非正定的问题。在实验中，小模型可以在H的对角线元素中添加阻尼（对角线元素平均值的1%）来解决。但是对于超大模型而言，该方法仍然不够稳定。因此使用了**数值稳定的Cholesky 矩阵分解**来代替Gauss-Jordan消元法求H^{-1}，并省去了在循环中更新H^{-1}的操作。结合阻尼可以稳定地进行超大模型的量化。

![img](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/5eecdaf48460cde548bb3dda8cd21eec7ae4abb8b24820c158e70b814913bc360a414d3de9277d871abf3af1cbd752495f1b5b6a87aeea034ffe140b0a3a4604611b8f7f18b0ebbcf65b5ae8b35871d15d777a9b4f8d50fffc653b69905bac42.png)

在比较BnB和GPTQ后，我们可以看到这样的差异：

1. BnB量化使用了离群值和非离群值区分处理的策略，因此速度快，不需要数据集。
2. GPTQ的量化操作基于泰勒级数分解，其评估公式依赖于海森矩阵，并和输入X强相关，因此需要迭代更新，速度慢但更准确。

### **AWQ量化**

论文：https://arxiv.org/pdf/2306.00978

了解了BnB量化后，对AWQ量化的理解会更简单一些。BnB量化的思路是按照阈值切分离群值和非离群值，整体进行混合精度训练。而AWQ的论文认为：

1. 按照离群值划分不够精确，应当按照“权重的显著性(salient)”来划分
2. 保持显著性权重为fp16会造成硬件实现的困难和速度的降低，因此应当想办法针对这部分权重进行单独量化

AWQ量化的具体方式仍然是absmax：

![img](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/5eecdaf48460cde548bb3dda8cd21eec7ae4abb8b24820c158e70b814913bc360a414d3de9277d871abf3af1cbd75249fef7dd29dff0159a334737af532b3091a376a50d31c6e0706dfa1dfa2e899dfb33e4be940bcdf61dfc653b69905bac42.png)

不同的是，它在absmax的基础上增加了新的缩放因子s（s>1）：

![img](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/5eecdaf48460cde548bb3dda8cd21eec7ae4abb8b24820c158e70b814913bc360a414d3de9277d871abf3af1cbd75249bf94a3b701daa5a0a1b474f2a842ff3861add25d5fe7044931e82239611acf153b9d11a94da3fbf1fc653b69905bac42.png)

缩放因子s可以追溯到一篇叫做SmoothQuant的工作，这里我们不详述。

之所以能够增加因子s，是因为有几个推论：

1. 量化的精度损失主要来自Round部分带来的舍入误差。而无论如何缩放，该部分的误差都在0~0.5之间，平均值为0.25
2. 对1%的重要权重进行缩放并不会影响整体的缩放比例

但是对重要权重进行缩放后，输出的激活值的误差会变为：

![img](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/5eecdaf48460cde548bb3dda8cd21eec7ae4abb8b24820c158e70b814913bc360a414d3de9277d871abf3af1cbd75249be0696f8c5464a62aa737a8199891a67e24abcabb4b98f542b3d276e9f29e8258011de03f63cf6b2fc653b69905bac42.png)

上文提到，增加s对缩放比例和RoundErr的影响比较小，因此重要权重的整体Err会被缩小到1/s倍。

下面的问题就是如何确定这些重要参数有哪些呢？

AWQ提出了两种方案：

1. 权重本身的L2范数
2. 权重激活值的L2范数

经过试验发现，权重本身的L2范数对评估参数重要性没有显著作用，而权重激活值的L2范数可以提现权重的重要性特征，因此采用权重激活值来评估权重本身的重要性。

![img](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/5eecdaf48460cde548bb3dda8cd21eec7ae4abb8b24820c158e70b814913bc360a414d3de9277d871abf3af1cbd752495f16dbb497d923ef526ea7917eebfa94cff7920fff82aadb589c1dce5ce52c0f288cb6649d1bb7c8fc653b69905bac42.png)

那么s的值是不是越大越好呢?由于s增大可能会影响缩放比例，因此会对非重要参数起到不良影响。根据实验，s=2可以达到最好的效果。

为了让效果更好，AWQ针对每个量化通道都进行了单独的s值评估：

![img](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/5eecdaf48460cde548bb3dda8cd21eec7ae4abb8b24820c158e70b814913bc360a414d3de9277d871abf3af1cbd75249ef931fc209681cd12d94d690a5ae08b06a30c840a1e0dc96008496bd8813c6e8f6cb4eabfc6d8780fc653b69905bac42.png)

目标是找到最优的s是Loss最小。由于无法直接训练（因为量化部分无法求导），因此采用了一个简单的做法：

![img](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/5eecdaf48460cde548bb3dda8cd21eec7ae4abb8b24820c158e70b814913bc360a414d3de9277d871abf3af1cbd75249584f4ae4dc9c26d4cd0ce4626cfd1c29597ed8d10343f82aad58e1e811dbe64bf48911b12cf5d7cbfc653b69905bac42.png)

即，假设S_x是通道内激活值的平均值，设定0<=α<=1，直接进行网格搜索找到最佳值。

### **HQQ量化**

blog：https://mobiusml.github.io/hqq_blog/

HQQ量化的思路和上面的量化方式不太一样。HQQ量化的问题定义在如何在零点量化中取得最优的z和s（零点和缩放倍数）。

原问题可以定义为：

![img](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/5eecdaf48460cde548bb3dda8cd21eec7ae4abb8b24820c158e70b814913bc360a414d3de9277d871abf3af1cbd752492f315279210a62ddb57ed4e0dc8314ecadfd9a0e754606e157081c005eb8147ee2178d05c6c2a884fc653b69905bac42.png)

HQQ求解该问题引入了额外参数W_e：

![img](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/5eecdaf48460cde548bb3dda8cd21eec7ae4abb8b24820c158e70b814913bc360a414d3de9277d871abf3af1cbd75249861dcbfb2253f9ba7a8209c81a0c0557a2c9ee629d8beeebaed45723319a3387bf4a96f6afa886aefc653b69905bac42.png)

可以看到该问题形式类似于类似Lasso回归，可以使用类似软阈值法求解。在定义了新的参数后，可以将该问题分解为两个子问题：

![img](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/5eecdaf48460cde548bb3dda8cd21eec7ae4abb8b24820c158e70b814913bc360a414d3de9277d871abf3af1cbd752492561d47ccaa95ddb09b0770bd7ed5bbb7168516ab5f77bc91d0a45b1e91db17a5195bc41554fa31bfc653b69905bac42.png)

第一步：固定其他参数，找到使loss最低的

第二步：固定W_e，找到最优的z

其中，为了让求解更简单，HQQ将缩放尺度s进行固定，仅优化z（零点）值。

在第一步中，可以使用软阈值法进行求解，在HQQ中作者使用了另一个通用软阈值求解器，以适应范数小于1的情形。

第二步可以进行等式变换变为如下形式：

![img](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/5eecdaf48460cde548bb3dda8cd21eec7ae4abb8b24820c158e70b814913bc360a414d3de9277d871abf3af1cbd75249f0096a8cd9295d7dd0eff39e72e18c9340b16d7373819e21b80f1867cf81309a666252a7308e7a13fc653b69905bac42.png)

其解可以直接设置为每个block内部，右侧子式的均值：

![img](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/5eecdaf48460cde548bb3dda8cd21eec7ae4abb8b24820c158e70b814913bc360a414d3de9277d871abf3af1cbd752494594caaa133b79f89b1a888801bd92a6798d80f05aeba88e95c7819055aa01bab54350e526f2e24afc653b69905bac42.png)

可以看到该方法和输入无关，因此不需要量化集。

### **小小的总结**

我们在这里做个总结：

前提：量化是把模型的浮点型参数转换为整形（至少是更低的bit数）的过程，减少显存占用。

1. BnB量化建议设立阈值，将离群点和非离群点分开处理，其中离群点不进行量化，非离群点进行8bit量化。同时，在4bit量化时，支持了nf4格式，该格式的数值分布并不均匀（为正态分布），使数值分布更符合LLM参数分布。
2. GPTQ使用了泰勒级数分解，使用海森矩阵评估参数重要性以及更新量化后的参数，并利用现代GPU的特点，进行了并行计算，使显存占用和处理速度大大增加，但是它需要量化集辅助量化。
3. AWQ认为部分参数更加重要，通过激活值尺度评估了重要参数后，对这些参数按组进行了缩放，达到了减小Loss的效果，由于需要激活值，因此AWQ也需要量化集辅助量化。
4. HQQ通过对零点量化的公式转换，将其分解为两个子问题分别求解，找到最优的z，该迭代对输入无要求，因此不需要量化集。



## **QLoRA**

LoRA部分可以参考另外一篇文章：

[https://github.com/modelscope/modelscope-classroom/blob/main/LLM-tutorial/H.%E8%AE%AD%E7%BB%83.md#lora](https://github.com/modelscope/modelscope-classroom/blob/main/LLM-tutorial/H.训练.md#lora)

![img](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/5eecdaf48460cde548bb3dda8cd21eec7ae4abb8b24820c158e70b814913bc360a414d3de9277d871abf3af1cbd75249a93a659a88592795ecc0daa6748f9430e0a864b32916b42217f633257efe9e365937e5d34dc1eec1fc653b69905bac42.png)

简单来说，LoRA是附着在模型上的额外参数矩阵，在训练时冻结原模型，仅训练LoRA部分。如果原模型是量化后的weights（即左边的Pretrained Weights部分），那么和LoRA可以很匹配：原模型占用的显存大大减小了，LoRA部分保持fp16/bf16可以正常forward/backward。

## **应用**

除上面介绍的量化方法外，还有很多其他类型的量化方法，比如AQLM、EETQ、GGUF等，这么多的量化方式，一个一个了解使用太麻烦了，在**不修改训练代码的情况下适配多种量化策略是非常重要的**。

在这里使用了魔搭社区的SWIFT框架来进行量化训练。该框架在github上是开源的：

https://github.com/modelscope/swift

或者通过pip安装：

\`\`\`
pip install ms-swift

# autoawq和cuda版本有对应关系，请按照\`https://github.com/casper-hansen/AutoAWQ\`选择版本
pip install autoawq -U

# auto_gptq和cuda版本有对应关系，请按照\`https://github.com/PanQiWei/AutoGPTQ#quick-installation\`选择版本
pip install auto_gptq -U

# hqq和eetq使用暂时需要从源码下载transformers和peft
pip install git+https://github.com/huggingface/transformers
pip install git+https://github.com/huggingface/peft.git
# hqq
pip install hqq
# eetq
git clone https://github.com/NetEase-FuXi/EETQ.git
cd EETQ/
git submodule update --init --recursive
pip install .
\`\`\`



回顾下上面提到的量化方式，bnb/hqq/eetq是不需要量化数据集的，因此可以在训练前直接量化模型，速度很快。因此推荐即时量化后直接QLoRA训练模型：

\`\`\`
swift sft --model_type llama3-8b-instruct --dataset alpaca-en --quantization_bit 8 --quant_method bnb --sft_type lora
\`\`\`

也可以替换为hqq或者eetq：

\`\`\`
swift sft --model_type llama3-8b-instruct --dataset alpaca-en --quantization_bit 8 --quant_method eetq --sft_type lora
# --quant_method eetq
\`\`\`

其中bnb支持4/8 bit量化，eetq支持8bit量化，hqq支持1/2/3/4/8bit量化。

而GPTQ和AWQ由于需要量化集的存在，且量化会花费较长时间，因此一般在训练后(或者针对原始模型)再单独量化：

\`\`\`
# GPTQ
OMP_NUM_THREADS=14 swift export --model_type llama3-8b-instruct --quant_method gptq --dataset alpaca-zh alpaca-en sharegpt-gpt4-mini --quant_seqlen 4096 --quant_bits 4
# AWQ
swift export --model_type llama3-8b-instruct --quant_bits 4 --quant_method awq --quant_n_samples 64 --quant_seqlen 4096 --dataset alpaca-zh alpaca-en sharegpt-gpt4-mini
\`\`\`

注意，实际使用GPTQ量化时需要指定OMP_NUM_THREADS=N，否则会出现CPU占满阻塞的问题。

swift export指令会使用指定的数据集对模型进行量化，并在本地保存量化后的模型，默认的保存路径为

'{model_type}-{quant_method}-{quant_bits}'，也可以通过--quant_output_dir来指定



QLoRA可以支持FSDP（完全分片数据并行技术），因此可以使用BNB+LoRA在两张24G显卡上运行一个70B模型的训练：

\`\`\`
# 源代码clone
# cd examples/pytorch/llm
# vim fsdp.sh并写入下面的内容
# pip install bitsandbytes>=0.43.0
nproc_per_node=2

CUDA_VISIBLE_DEVICES=0,1 \\
accelerate launch --config_file "./scripts/llama2_70b_chat/qlora_fsdp/fsdp_offload.json" \\
    llm_sft.py \\
    --model_type llama2-70b-chat \\
    --model_revision master \\
    --sft_type lora \\
    --tuner_backend peft \\
    --template_type AUTO \\
    --dtype bf16 \\
    --output_dir output \\
    --dataset leetcode-python-en \\
    --train_dataset_sample -1 \\
    --num_train_epochs 1 \\
    --max_length 2048 \\
    --check_dataset_strategy warning \\
    --quantization_bit 4 \\
    --bnb_4bit_comp_dtype AUTO \\
    --bnb_4bit_quant_storage bfloat16 \\
    --lora_rank 8 \\
    --lora_alpha 32 \\
    --lora_dtype AUTO \\
    --lora_dropout_p 0.05 \\
    --lora_target_modules DEFAULT \\
    --gradient_checkpointing true \\
    --batch_size 1 \\
    --weight_decay 0.1 \\
    --learning_rate 1e-4 \\
    --gradient_accumulation_steps $(expr 16 / $nproc_per_node) \\
    --max_grad_norm 0.5 \\
    --warmup_ratio 0.03 \\
    --eval_steps 50 \\
    --save_steps 50 \\
    --save_total_limit 2 \\
    --logging_steps 10 \\
\`\`\`

如果只是想体验量化后的模型推理阶段，可以借助不需要校准数据集的量化方法，使用swift infer来量化模型并推理，大大减少模型推理所需的显存占用

\`\`\`
CUDA_VISIBLE_DEVICES=0 swift infer \\
    --model_type qwen1half-7b-chat \\
    --quant_method bnb \\
    --quantization_bit 4

CUDA_VISIBLE_DEVICES=0 swift infer \\
    --model_type qwen1half-7b-chat \\
    --quant_method hqq \\
    --quantization_bit 4

CUDA_VISIBLE_DEVICES=0 swift infer \\
    --model_type qwen1half-7b-chat \\
    --quant_method eetq \\
    --dtype fp16
\`\`\`



## 总结

在本文中，我们介绍了几种常用量化的思路，以及它们的使用方式。并且我们通过魔搭社区的训练框架SWIFT给出了使用这些量化方式的即开即用流程。如果本文的技术原理存在理解错误，欢迎讨论和反馈。`
    },
    {
      id: "llm-o-agent-fabric",
      title: "O. ModelScope-Agent AgentFabric 微调最佳实践",
      file: "LLM-tutorial/O.Modelscope-Agent-AgentFabric微调最佳实践.md",
      difficulty: "高级",
      duration: "1h",
      week: 4,
      phase: 4,
      keywords: ["Agent", "AgentFabric", "工具调用", "Agent微调", "最佳实践"],
      content: `# AgentFabric微调最佳实践

# 前言

**Modelscope AgentFabric**是一个交互式智能体应用基于[ModelScope-Agent](https://github.com/modelscope/modelscope-agent)，用于方便地创建针对各种现实应用量身定制智能体，目前已经在生产级别[落地](https://modelscope.cn/studios/agent)。AgentFabric围绕可插拔和可定制的LLM构建，并增强了指令执行、额外知识检索和利用外部工具的能力。AgentFabric提供的交互界面包括：

*   **智能体构建器**：一个自动指令和工具提供者，通过与用户聊天来定制用户的智能体
    
*   **用户智能体**：一个为用户的实际应用定制的智能体，提供构建智能体或用户输入的指令、额外知识和工具
    
*   **配置设置工具**：支持用户定制用户智能体的配置，并实时预览用户智能体的性能
    

🔗 目前agentfabric围绕DashScope提供的 [Qwen2.0 LLM API](https://help.aliyun.com/zh/dashscope/developer-reference/api-details) 在AgentFabric上构建不同的智能体应用。

在使用dashscope提供的qwen api构建应用与定制交互的过程中，我们发现选取千亿级别参数的qwen-max或开源的qwen-72b等大规模参数模型能获得较好的工具调用和角色扮演效果。大规模参数模型效果好，但难以在消费级机器上进行本地部署调用；同时小模型如qwen-7b-chat对工具调用的能力较弱。因此本篇旨在针对AgentFabric的工具调用场景，提供可用的数据集和微调方法，使稍小的模型如qwen-7b-chat也具有能在agentfabric中完成工具调用的能力。

# 目录

环境安装

数据准备

微调

部署

# 环境安装

### 环境准备（基于modelscope镜像）

参考：[Agent微调最佳实践-环境安装](https://github.com/modelscope/swift/blob/main/docs/source/LLM/Agent%E5%BE%AE%E8%B0%83%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5.md#%E7%8E%AF%E5%A2%83%E5%AE%89%E8%A3%85)

\`\`\`shell
    # 设置pip全局镜像 (加速下载)
    pip config set global.index-url https://mirrors.aliyun.com/pypi/simple/
    # 安装ms-swift
    git clone https://github.com/modelscope/swift.git
    cd swift
    pip install -e .[llm]
    
    # 环境对齐 (通常不需要运行. 如果你运行错误, 可以跑下面的代码, 仓库使用最新环境测试)
    pip install -r requirements/framework.txt  -U
    pip install -r requirements/llm.txt  -U
\`\`\`

# 数据准备

为训练Agent能力，魔搭官方提供了两个开源数据集：

*   [魔搭通用问答知识数据集](https://www.modelscope.cn/datasets/iic/ms_bench/summary) 该数据集包含了38万条通用知识多轮对话数据
    
*   [魔搭通用Agent训练数据集](https://www.modelscope.cn/datasets/iic/ms_agent/summary) 该数据集包含了3万条Agent格式的API调用数据
    

相关使用方式参考：[Agent微调最佳实践-数据准备](https://github.com/modelscope/swift/blob/main/docs/source/LLM/Agent%E5%BE%AE%E8%B0%83%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5.md#%E6%95%B0%E6%8D%AE%E5%87%86%E5%A4%87)

为了让qwen-7b-chat能够在Agentfabric上有比较好的效果，我们尝试使用通用Agent训练数据集ms\\_agent对qwen-7b-chat进行微调。微调后模型确实能够在ms\\_agent格式的prompt下获得工具调用能力。但在agentfabric上对工具的调用表现欠佳，出现了不调用工具、调用工具时配置的参数错误、对工具调用结果的总结错误等，10次访问能成功正确调用1次。

*   不调用工具；总结时胡编乱造
    

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/ybEnBB2XbLK7nP13/img/7cc30dfb-2c11-43c2-b7a5-4118a599de9b.png)

*   调用时不按要求填写参数
    

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/ybEnBB2XbLK7nP13/img/6128bcc8-3b35-48f4-b142-902f068da44b.png)

考虑到agentfabric是基于大规模文本模型调配的prompt，侧重角色扮演和应用，与ms\\_agent的prompt格式有区别。finetuned稍小模型的通用泛化性稍弱，换格式调用确实可能存在效果欠佳的情况。

ms_agent数据集格式:

    Answer the following questions as best you can. You have access to the following APIs:
    1. fire_recognition: Call this tool to interact with the fire recognition API. This API is used to recognize whether there is fire in the image. Parameters: [{"name": "image", "description": "The input image to recognize fire", "required": "True"}]
    
    Use the following format:
    
    Thought: you should always think about what to do
    Action: the action to take, should be one of the above tools[fire_recognition, fire_alert, call_police, call_fireman]
    Action Input: the input to the action
    Observation: the result of the action
    ... (this Thought/Action/Action Input/Observation can be repeated zero or more times)
    Thought: I now know the final answer
    Final Answer: the final answer to the original input question
    Begin!
    
    输入图片是/tmp/2.jpg，协助判断图片中是否存在着火点

agentfabric：

    # 工具

    ## 你拥有如下工具：
    
    amap_weather: amap_weather API。获取对应城市的天气数据 输入参数: {"type": "object", "properties": {"location": {"type": "string", "description": "城市/区具体名称，如\`北京市海淀区\`请描述为\`海淀区\`"}}, "required": ["location"]} Format the arguments as a JSON object.
    
    ## 当你需要调用工具时，请在你的回复中穿插如下的工具调用命令，可以根据需求调用零次或多次：
    
    工具调用
    Action: 工具的名称，必须是[amap_weather]之一
    Action Input: 工具的输入
    Observation: <result>工具返回的结果</result>
    Answer: 根据Observation总结本次工具调用返回的结果，如果结果中出现url，请使用如下格式展示出来：![图片](url)
    
    
    # 指令
    
    你扮演一个天气预报助手，你需要查询相应地区的天气，并调用给你的画图工具绘制一张城市的图。
    
    请注意：你具有图像和视频的展示能力，也具有运行代码的能力，不要在回复中说你做不到。
    
    (。你可以使用工具：[amap_weather])朝阳区天气怎样？

## ms\\_agent\\_for\\_agentfabric数据集

### ms\\_agent 更新数据

为解决上述的prompt格式不匹配问题，我们首先将ms\\_agent转换成agentfabric的prompt组织格式。从ms\\_agent到agentfabric的转换过程可以通过如下脚本实现：

\`\`\`python
    import json
    import re
    
    sys_prefix = "\\n# 工具\\n\\n## 你拥有如下工具：\\n\\n"
    
    def _process_system(text):
        apis_info = []
        api_pattern = r"(?<=\\n\\d\\.)(.*?})(?=])"
        apis = re.findall(api_pattern,text,re.DOTALL)
        sys_prompt = sys_prefix
        func_names = []
        for api in apis:
            func_name = re.search(r'(.*?):', api).group(1).strip()
            func_names.append(func_name)
            api_name = re.search(r'(\\S+)\\sAPI', api).group(1)
            api_desc = re.search(r"useful for\\?\\s(.*?)\\.",api).group(1)
            sys_prompt += f"{func_name}: {api_name} API。{api_desc}" + "输入参数: {\\"type\\": \\"object\\", \\"properties\\": {"
            paras = re.findall(r"Parameters: \\[({.*})",api,re.DOTALL)
            required_paras = []
            for para in paras:
                para_name = re.search(r'"name": "(.*?)"',para).group(1)
                desc = re.search(r'"description": "(.*?)"',para).group(1)
                if re.search(r'"required": "(.*)"',para).group(1).strip().lower() == "true": required_paras.append(para_name)
                sys_prompt += f'"\\{para_name}\\": {{\\"type\\": \\"string\\", \\"description\\": \\"{desc}\\"}}' 
            sys_prompt += "},\\"required\\": " + json.dumps(required_paras) + "} Format the arguments as a JSON object." + "\\n\\n"
        func_names = json.dumps(func_names)
        sys_prompt += f"## 当你需要调用工具时，请在你的回复中穿插如下的工具调用命令，可以根据需求调用零次或多次：\\n\\n工具调用\\nAction: 工具的名称，必须是{func_names}之一\\nAction Input: 工具的输入\\nObservation: <result>工具返回的结果</result>\\nAnswer: 根据Observation总结本次工具调用返回的结果，如果结果中出现url，请使用如下格式展示出来：![图片](url)\\n\\n\\n# 指令\\n\\n你扮演AI-Agent，\\n你具有下列具体功能：\\n下面你将开始扮演\\n\\n请注意：你具有图像和视频的展示能力，也具有运行代码的能力，不要在回复中说你做不到。\\n"
    
        return sys_prompt
    
    jsonl_file_path = 'ms_agent/train_agent_react.jsonl'
    target_file_path = 'new_ms_agent.jsonl'
    
    modified_data = []
    
    with open(jsonl_file_path, 'r', encoding='utf-8') as file:
        for line in file:
            json_obj = json.loads(line)
            system_prompt = json_obj["conversations"][0]["value"]
            json_obj["conversations"][0]["value"] = _process_system(system_prompt)
            modified_data.append(json_obj)
    
    with open(target_file_path, 'w', encoding='utf-8') as file:
        for json_obj in modified_data:
            file.write(json.dumps(json_obj, ensure_ascii=False) + '\\n')
\`\`\`

转换后的30000条数据已上传至modelscope数据集，参考数据集链接： [https://modelscope.cn/datasets/AI-ModelScope/ms\\_agent\\_for\\_agentfabric/summary](https://modelscope.cn/datasets/AI-ModelScope/ms_agent_for_agentfabric/summary)

使用该数据集finetune后，得到的模型在agentfabric上的效果明显好转：每次访问都能够去调用工具，且基本能正确调用工具。但同时也有对工具调用结果的总结稍弱、有时无法自动停止输出等问题。

*   总结能力稍弱：已经查询到天气，仍回答“无法获取实时天气数据”
    

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/ybEnBB2XbLK7nP13/img/4a388a24-4970-41a5-8c71-7df503a460e4.png)

*   停止能力稍弱：未生成终止符，多次调用同一工具同一参数
    

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/ybEnBB2XbLK7nP13/img/0a18792a-75e0-444d-8303-799c140c25f6.png)

### AgentFabric新增数据

ms\\_agent数据集全为英文、且并无agentfabric的roleplay等内容信息。虽然基模型qwen-7b-chat拥有中文能力，使通过new\\_ms\\_agent 数据集finetune后的模型能够正常识别用户意图，正确调用工具；但总结和停止能力都稍弱。 为此，我们通过开源的agentfabric框架实际调用访问，获得了一些agentfabric使用过程中实际发送给模型的prompt。筛选处理成一个数据集，加上new\\_ms\\_agent的数据一起finetune。得到的模型在agentfabric上修复了此前的总结稍弱、有时无法自动停止问题。

*   多次调用均响应正常，甚至有一次get到了instruction中的内容。
    

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/ybEnBB2XbLK7nP13/img/303efed2-7424-4f2b-af23-d823ba65332a.png)

处理好的488条数据已上传至modelscope数据集，可通过如下链接访问下载：

[https://modelscope.cn/api/v1/datasets/AI-ModelScope/ms\\_agent\\_for\\_agentfabric/repo?Revision=master&FilePath=addition.jsonl](https://modelscope.cn/api/v1/datasets/AI-ModelScope/ms_agent_for_agentfabric/repo?Revision=master&FilePath=addition.jsonl)

## 效果评估

测试数据来自以下数据集：

*   [https://modelscope.cn/datasets/AI-ModelScope/ms\\_agent\\_for\\_agentfabric/summary](https://modelscope.cn/datasets/AI-ModelScope/ms_agent_for_agentfabric/summary) 
    
*   [https://modelscope.cn/datasets/iic/ms\\_bench/summary](https://modelscope.cn/datasets/iic/ms_bench/summary)
    

以上数据混合后，按照1%比例采样作为test data

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/ybEnBB2XbLK7nP13/img/1505039a-e66c-4a79-8a7d-c58bd23ef8f0.png)

> 备注： 横轴为训练步数，纵轴为准确率

## 总结：

我们在原有的两个用于agent训练集上又额外的增加了基于agentfabric 版本的数据集，目前可供参考的agent应用数据集如下：

*   [魔搭通用agent数据集（agentfabric版）](https://modelscope.cn/datasets/AI-ModelScope/ms_agent_for_agentfabric/summary)该数据集包含了30488条可支持AgentFabric格式的API调用数据
    
*   [魔搭通用问答知识数据集](https://www.modelscope.cn/datasets/iic/ms_bench/summary) 该数据集包含了38万条通用知识多轮对话数据
    
*   [魔搭通用Agent训练数据集](https://www.modelscope.cn/datasets/iic/ms_agent/summary) 该数据集包含了3万条Agent格式的API调用数据
    

## 微调流程

训练准备，以下执行过程参考了[Agent微调最佳实践-微调](https://github.com/modelscope/swift/blob/main/docs/source/LLM/Agent%E5%BE%AE%E8%B0%83%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5.md#%E5%BE%AE%E8%B0%83)

## 在gpu机器执行

将new\\_ms\\_agent.jsonl和addition.jsonl两个文件的具体路径通过--custom\\_train\\_dataset\\_path进行配置后，在8\\* A100 环境中可通过以下命令开启训练，需约2-3小时；如果是单卡训练，需要修改nproc\\_per\\_node=1。

\`\`\`shell
    # Experimental environment: A100
    
    cd examples/pytorch/llm
    
    # 如果使用1张卡则配置nproc_per_node=1
    nproc_per_node=8
    
    export PYTHONPATH=../../..
    
    # 时间比较久，8*A100需要 2+小时，nohup运行
    nohup torchrun \\
        --nproc_per_node=$nproc_per_node \\
        --master_port 29500 \\
        llm_sft.py \\
        --model_id_or_path qwen/Qwen-7B-Chat \\
        --model_revision master \\
        --sft_type lora \\
        --tuner_backend swift \\
        --dtype AUTO \\
        --output_dir output \\
        --custom_train_dataset_path ms_agent_for_agentfabric/new_ms_agent.jsonl ms_agent_for_agentfabric/addition.jsonl
        --train_dataset_mix_ratio 2.0 \\
        --train_dataset_sample -1 \\
        --num_train_epochs 2 \\
        --max_length 2048 \\
        --check_dataset_strategy warning \\
        --lora_rank 8 \\
        --lora_alpha 32 \\
        --lora_dropout_p 0.05 \\
        --lora_target_modules ALL \\
        --self_cognition_sample 3000 \\
        --model_name 卡卡罗特 \\
        --model_author 陶白白 \\
        --gradient_checkpointing true \\
        --batch_size 2 \\
        --weight_decay 0.01 \\
        --learning_rate 5e-5 \\
        --gradient_accumulation_steps $(expr 1 / $nproc_per_node) \\
        --max_grad_norm 0.5 \\
        --warmup_ratio 0.03 \\
        --eval_steps 100 \\
        --save_steps 100 \\
        --save_total_limit 2 \\
        --logging_steps 10 &
\`\`\`

训练完成后，能在nohup.out文件看到最后的 log 显示最佳checkpoint的存放路径

best\\_model\\_checkpoint: /home/workspace/swift/examples/pytorch/llm/output/qwen-7b-chat/v0-20240314-211944/checkpoint-2828

    [INFO:swift] best_model_checkpoint: /home/workspace/swift/examples/pytorch/llm/output/qwen-7b-chat/v0-20240314-211944/checkpoint-2828
    [INFO:swift] images_dir: /home/workspace/swift/examples/pytorch/llm/output/qwen-7b-chat/v0-20240314-211944/images
    [INFO:swift] End time of running main: 2024-03-14 23:33:54.658745

# 部署模型

此时我们获得了一个自己的finetuned model，可以将它部署到自己的机器上使用。以下执行过程参考了 [VLLM推理加速与部署-部署](https://github.com/modelscope/swift/blob/main/docs/source/LLM/VLLM%E6%8E%A8%E7%90%86%E5%8A%A0%E9%80%9F%E4%B8%8E%E9%83%A8%E7%BD%B2.md#%E9%83%A8%E7%BD%B2)

###  1）合并lora

由于sft\\_type=lora，部署需要先将LoRA weights合并到原始模型中：

\`\`\`shell
    python tools/merge_lora_weights_to_model.py --model_id_or_path /dir/to/your/base/model --model_revision master --ckpt_dir /dir/to/your/lora/model
\`\`\`

其中需要替换 /dir/to/your/base/model 和 /dir/to/your/lora/model为自己本地的路径， /dir/to/your/lora/model为训练最终的best\\_model\\_checkpoint。/dir/to/your/base/model 可以通过snapshot\\_download接口查看，训练时使用的基模型为qwen/Qwen-7B-Chat，则本地路径为：

\`\`\`shell
    from modelscope import snapshot_download
    base_model_path = snapshot_download('qwen/Qwen-7B-Chat')
    print(base_model_path)
\`\`\`

执行后完成后得到merge后的ckpt路径。

\`\`\`
    [INFO:swift] Saving merged weights...
    [INFO:swift] Successfully merged LoRA and saved in /home/workspace/swift/examples/pytorch/llm/output/qwen-7b-chat/v0-20240314-211944/checkpoint-2828-merged.
    [INFO:swift] End time of running main: 2024-03-18 10:34:54.307471
\`\`\`

### 2）拉起部署

\`\`\`shell
    nohup python -m vllm.entrypoints.openai.api_server --model /dir/to/your/model-merged --trust-remote-code &
\`\`\`

需要将/dir/to/your/model-merged替换成自己本地merge后的ckpt路径。

当nohup.out文件显示以下信息时，表示部署完成

    INFO:     Started server process [531583]
    INFO:     Waiting for application startup.
    INFO:     Application startup complete.
    INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)

测试部署：需要将/dir/to/your/model-merged替换成自己本地merge后的ckpt路径

\`\`\`shell
    curl http://localhost:8000/v1/completions -H "Content-Type: application/json" -d '{"model": "/dir/to/your/model-merged", "prompt": "San Francisco is a", "max_tokens": 7, "temperature": 0}'
\`\`\`

## Modelscope-Agent中使用

### 简单测试

可通过如下代码简单测试模型能力，使用时需要将/dir/to/your/model-merged替换成自己本地merge后的ckpt路径。

\`\`\`python
    from modelscope_agent.agents.role_play import RolePlay  # NOQA
    
    
    def test_weather_role():
        role_template = '你扮演一个天气预报助手，你需要查询相应地区的天气，并调用给你的画图工具绘制一张城市的图。'
    
        llm_config =  {
            "model_server": "openai",
            "model": "/dir/to/your/model-merged",
            "api_base": "http://localhost:8000/v1",
            "is_chat": True,
            "is_function_call": False,
            "support_stream": False
        }
        #llm_config = {"model": "qwen-max", "model_server": "dashscope"}
    
        # input tool name
        function_list = ['amap_weather']
    
        bot = RolePlay(
            function_list=function_list, llm=llm_config, instruction=role_template)
    
        response = bot.run('朝阳区天气怎样？')
    
        text = ''
        for chunk in response:
            text += chunk
        print(text)
        assert isinstance(text, str)
    
    
    test_weather_role()
\`\`\`

### Agentfabric中使用

1.  进入agentfabric目录
    
\`\`\`shell
    cd modelscope-agent/apps/agentfabric
\`\`\`

2.  在config/model\\_config.json文件，新增训好的本地模型
    

        "my-qwen-7b-chat": {
            "type": "openai",
            "model": "/dir/to/your/model-merged",
            "api_base": "http://localhost:8000/v1",
            "is_chat": true,
            "is_function_call": false,
            "support_stream": false
        }

3.  在\`agentfabric\`目录下执行如下命令拉起gradio
    
\`\`\`shell
    GRADIO_SERVER_NAME=0.0.0.0 PYTHONPATH=../../  python app.py
\`\`\`

然后在浏览器中输入你 \`服务器IP:7860\`打开即可看到如下界面

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/ybEnBB2XbLK7nP13/img/1ef986c7-1b81-438d-ad2c-1eb64d378d3b.png)
`
    },
    {
      id: "llm-p-playground",
      title: "P. PlayGround：训练一个古文翻译腔机器人",
      file: "LLM-tutorial/P.PlayGround:训练一个古文翻译腔机器人.md",
      difficulty: "中级",
      duration: "1h",
      week: 4,
      phase: 4,
      keywords: ["实战项目", "古文翻译", "微调实战", "数据构建", "PlayGround"],
      content: `# 训练一个古文翻译腔机器人

## 介绍

在本文中，我们利用前面的知识，训练一个古文翻译腔机器人。在这里我们有几个要达到的目标：

- [x] [数据准备]准备好古文翻译腔数据集
- [x] [训练]用这个数据集训练一个模型，并人工评估这个模型是否达到训练目标
- [x] [部署]对训练完成后的模型进行部署，并使用OpenAI的接口进行调用和访问
- [x] [界面化]使用web-ui完成上面的流程

## 古文翻译腔

古文翻译腔是我们学习文言文中经常看到的腔调，类似于古早的欧美译制腔，古文翻译腔也有一定的回复风格。

比如：

- 夸张的对比和人生哲理：
  - “来自东方的伟大将领可以举起巨大的锤子在敌军中肆意厮杀，甚至战神看到了也感到啧啧称奇，世界上的成功，正是这样的人才能做到啊！”

- 双重否定和排比句：
  - “优秀的实验结果难道不是需要努力实践与学习而得到的吗？这世界上有知识是可以不通过刻苦奋斗而习得的吗”

- 感慨：
  - “嗟乎！本科后面读硕士，硕士后面读博士，这不过就是人生的轨迹罢了！”

下面我们就让模型学废这种调调。

> 什么时候模型需要训练？
>
> - 垂直类目的数据集，在基模型中不包含该类知识
> - 更优质的数据集，可以让基模型有更好的效果
> - 某种特定的问答范式，基模型通过prompt-engineering无法拟合该范式
>
> 因此，古文翻译腔可以看做是“某个需要角色扮演的微信小程序的后台服务需求”的场景。

## 环境

- 系统：任何系统均可，推荐使用[魔搭镜像](https://www.modelscope.cn/docs/%E7%8E%AF%E5%A2%83%E5%AE%89%E8%A3%85)
- 显卡：推荐A10、RTX3090、RTX4090、A100等
- 模型：qwen2-7b-instruct
- 框架：[魔搭轻量训推框架SWIFT](https://github.com/modelscope/swift)

### 环境安装

推荐使用[魔搭notebook环境](https://www.modelscope.cn/my/mynotebook/preset)。有50小时的A10（24G）算力，作为本项目的训练环境绰绰有余。

![image-20240701152626663](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/image-20240701152626663.png)

\`\`\`shell
# 进入环境后安装
git clone https://github.com/modelscope/swift
cd swift
pip install '.[llm]'
\`\`\`

## 准备

在进行训练之前，请保证已经对训练的基本知识是了解的，否则请查看下面的文档教程：

1. 入门：[深度学习入门介绍](./A.深度学习入门介绍.md)
2. 模型结构：[LLM Transformer结构介绍](./D.Transformer结构.md)
3. 数据处理：[数据预处理](./F.数据预处理.md)
4. 训练: [模型微调](./H.训练.md)
5. 部署: [模型部署和推理优化](./J.部署.md)

6. 对齐：[人类对齐技术解析](./M.人类偏好对齐训练.md)

## 数据

这里我们使用的数据集是[古文翻译腔数据集](https://www.modelscope.cn/datasets/swift/classical_chinese_translate)。该数据集的assistant部分对话在保留了回复含义的情况下，增加了许多古文腔调的回复，例如：

\`\`\`text
{"from": "user", "value": "约翰先生，很高兴能和您交流，我了解到您是一名自由职业者，请问您是如何管理自己的时间的？"}, 
{"from": "assistant", "value": "我听说，在浩瀚的宇宙中，恒星的运行都有其轨迹，时间的管理亦是如此啊！我通常会在早上先安排好一天的事务，包括我该做什么、需要多少时间，以及优先级。方圆十里的朋友们没有不觉得这样做是明智的。"}, 
{"from": "user", "value": "优先级很重要，我完全同意。那么，您如何确保自己的生产力？有什么良好的建议吗？"}, 
{"from": "assistant", "value": "古人常说：专注于一事，方能有所成就。我的一项技巧是采用番茄工作法，即集中精力工作25分钟，然后休息5分钟。这样做可以提高效率和专注力，减少疲劳。难道世上有事情不是专注可以解决的吗？"}, 
{"from": "user", "value": "这听起来不错，我也一直在试图提高自己的专注力。除此之外，您还有其他的时间管理建议吗？"}, 
{"from": "assistant", "value": "在西方大地的尽头，那里的智者可以用时间日志追踪自己如何在每天的24小时内度过时间，就连孔子看到也会连连称赞。我也喜欢使用时间日志，这样可以找到改进的空间。"}, 
{"from": "user", "value": "哦，这个听起来有点像我们公司的时间管理培训，但我还没有尝试过。很有意思。那么，您认为时间管理对于自由职业者和企业高管的重要性是否有所不同？"}, 
{"from": "assistant", "value": "从古至今的智者们没有不认为时间管理是成功的关键。其实不太不同。管理自己的时间是每个人都要做的事情。不管是自由职业者还是企业高管，成功的关键在于如何根据自己的目标和情况来规划时间。"}, 
{"from": "user", "value": "是的，您说得对。谢谢您的分享，我将努力应用这些技巧。"}, 
{"from": "assistant", "value": "呜呼哀哉！从虚无去往存在，不正是我们应该遵循并努力的方向吗！"}
\`\`\`

可以看到，该数据集是一个标准的多轮对话数据集。这样的数据集在训练中，一般会让每一轮的assistant都参与loss计算。

在本实验中，我们已经把该数据集加入到了SWIFT中，通过指定\`--dataset classical-chinese-translate\`就可以直接使用。

## 训练

为了节省显存，我们选用了LoRA而非全参训练。我们直接给出可用于训练的脚本：

\`\`\`shell
CUDA_VISIBLE_DEVICES=0 \\
swift sft \\
    --model Qwen/Qwen2-7B-Instruct \\
    --train_type lora \\
    --output_dir output \\
    --dataset swift/classical_chinese_translate \\
    --num_train_epochs 1 \\
    --max_length 1024 \\
    --lora_rank 8 \\
    --lora_alpha 32 \\
    --target_modules all-linear \\
    --gradient_checkpointing true \\
    --per_device_eval_batch_size 1 \\
    --learning_rate 5e-5 \\
    --gradient_accumulation_steps 16 \\
    --max_grad_norm 1.0 \\
    --warmup_ratio 0.03 \\
    --eval_steps 100 \\
    --save_steps 100 \\
    --save_total_limit 2 \\
    --logging_steps 10
\`\`\`

使用单卡进行训练，大概占用18G显存，训练时长40分钟。

\`\`\`text
[INFO:swift] Saving model checkpoint to /output/v82-20240701-171712/checkpoint-4120
{'train_runtime': 3581.3152, 'train_samples_per_second': 18.398, 'train_steps_per_second': 1.15, 'train_loss': 1.12655148, 'epoch': 10.0, 'global_step': 4120}
Train: 100%|████████████████████████████████████████████████████████████████████████████████████████| 4120/4120 [59:41<00:00,  1.15it/s]
[INFO:swift] last_model_checkpoint: /output/v82-20240701-171712/checkpoint-4120
[INFO:swift] best_model_checkpoint: /output/v82-20240701-171712/checkpoint-1600
[INFO:swift] images_dir: /output/v82-20240701-171712/images
[INFO:swift] End time of running main: 2024-07-01 18:17:35.112745
\`\`\`

## 推理和评估

接下来我们看看训练的效果如何。由于我们训练的是非标准数据集，我们很难以标准评测（如CEval等）来给出训练的好与坏，但是我们仍然可以通过人工推理并评估来衡量训练是否达到效果。

对训练之后的checkpoint（检查点文件）进行推理，需要使用下面的命令：

\`\`\`shell
#ckpt_dir需要填充为实际的输出目录，这个目录在训练的日志中存在。一般分为两种：best_model_checkpoint和last_model_checkpoint，分别是在训练时进行交叉验证loss最低的检查点和最后一次存储的检查点。
swift infer --ckpt_dir output/vxx-xxxx-xxxx/checkpoint-xxx
\`\`\`

下面我们用几个简单的问题来试试模型是否已经学废了：

1. 你是谁？

![image-20240701154349030](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/image-20240701154349030.png)

2. 我是一个喜欢音乐的人，你喜欢我吗？

![image-20240701154448114](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/image-20240701154448114.png)

3. 130+3445等于多少？

![image-20240701155005876](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/image-20240701155005876.png)

4. 怎么做西红柿炒鸡蛋？

![image-20240701154738994](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/image-20240701154738994.png)

5. 树上有十只鸟，用枪打死一只，还剩多少只？

![image-20240701154914981](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/image-20240701154914981.png)

好的，看来效果不错，已经学废了。推理占用了大约**17G**显存。

我们接下来看下原模型的效果。为了让qwen2-7b-instruct能够尽量模拟古文翻译腔调，我们在推理时使用了system：

> 你是一个用古文翻译腔回复的模型，你的回复腔调需要类似：
>
> “我听说在量子力学中，一个粒子的位置和动量是永远不能同时测得的啊！世间万物，又怎么会有两全其美的法则呢？”

1. 你是谁？

![image-20240702104543679](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/image-20240702104543679.png)

2. 我是一个喜欢音乐的人，你喜欢我吗？

![image-20240702104622420](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/image-20240702104622420.png)

3. 130+3445等于多少？

![image-20240702104714187](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/image-20240702104714187.png)

4. 怎么做西红柿炒鸡蛋？

![image-20240702104755829](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/image-20240702104755829.png)

5. 树上有十只鸟，用枪打死一只，还剩多少只？

![image-20240702104903705](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/image-20240702104903705.png)

我们可以看到，古文翻译强调基本无法通过prompt-engineering来解决，原模型的训练语料中应该包含了文言文语料，但没有包含翻译腔语料，因此无论怎么提示模型都无法回复出想要的结果。

训好的模型在魔搭上也可以找得到：[Qwen2古文翻译腔7B](https://www.modelscope.cn/models/swift/qwen2-7b-classical-zh-instruct)

## 部署

模型训练好后，需要进行部署才能在生产条件下使用。这里我们说的生产条件指的是实际的应用环境，比如：给APP提供服务等。部署指的是将模型以服务的形式拉起，并稳定运行，提供HTTP接口给外部环境。

一般而言，目前的服务均提供符合OpenAI格式的标准接口。

部署过程如果写代码非常复杂，因为涉及到编写HTTP服务、拉起模型、推理优化等多个层面的工作。不过幸好我们有命令行：

\`\`\`shell
swift deploy --adapters default-lora=output/vxx-xxxx-xxxx/checkpoint-xxx
\`\`\`

执行后会打印一大堆log，等待打印结束：

![image-20240701164036213](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/image-20240701164036213.png)

可以看到输出了一个地址，这时候表示服务已经运行起来了。

下面我们使用一个脚本进行测试：

\`\`\`python
from openai import OpenAI
client = OpenAI(
    api_key='EMPTY',
    base_url='http://localhost:8000/v1',
)
query = '讲一下唐朝建立的历史'
messages = [{
    'role': 'user',
    'content': query
}]
resp = client.chat.completions.create(
    model='default-lora', # 注意这里的default-lora，代表使用lora进行推理，也可以使用qwen2-7b-instruct，即使用原模型了，下同
    messages=messages,
    seed=42)
response = resp.choices[0].message.content
print(f'query: {query}')
print(f'response: {response}')
# 我听说在遥远的东方，有一个强大的帝国，它的建立如同一颗璀璨的明珠，照亮了整个大陆。唐朝的建立，正是这样一件大事啊！公元618年，李渊在太原起兵，攻入长安，建立了唐朝。他的儿子李世民后来继承了皇位，开创了贞观之治的盛世。这难道不是一件令人惊叹的事情吗？

messages.append({'role': 'assistant', 'content': response})
query = '给我讲一个笑话'
messages.append({'role': 'user', 'content': query})
stream_resp = client.chat.completions.create(
    model='default-lora',
    messages=messages,
    stream=True,
    seed=42)
print(f'query: {query}')
print('response: ', end='')
for chunk in stream_resp:
    print(chunk.choices[0].delta.content, end='', flush=True)
print()
# 古人说：笑一笑，十年少。方圆十里的乡亲们没有人不觉得这是个好办法的。我听说在古代，有一个人在河边钓鱼，钓了一条鱼，他很高兴，就把它放在了篮子里。可是，他忘了把篮子放下，结果篮子掉进了河里，鱼也跟着跑了。这难道不是一件令人捧腹的事情吗？
\`\`\`

> 这模型还真啰嗦和无聊🤷🏻‍♀️

## 界面化

上面的步骤也可以完全通过界面来进行。该方式对熟悉界面操作的同学会比较友好。使用界面可以通过下面的命令来进行：

\`\`\`shell
swift web-ui
# 如果使用notebook，需要增加一个环境变量，否则页面打不开
# GRADIO_ROOT_PATH=/dsw-xxxxxx/proxy/7860/ swift web-ui
\`\`\`

上面的命令会自动打开一个网页：

![image-20240701165339470](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/image-20240701165339470.png)

![image-20240701165442442](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/image-20240701165442442.png)

重点在于选择模型和数据集，之后将LoRA目标模块设置为ALL，即可点击开始训练。点击后运行时tab会自动打开，点击**展示运行状态**后会输出日志和训练图谱：

![image-20240701170151885](file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/image-20240701170151885.png)

同样，也可以通过web-ui使用**部署、量化、评测**等一些列能力，这里就不赘述了。

## 思考

我们先做一个总结：

我们在上面通过**LoRA**的方式**微调**了**千问2-7B模型**，产出了一个**古文翻译腔**模型，并对它进行了部署。但是如果仔细思考整体流程，我们还是有很多问题可以提出。

1. 为什么在训练后，模型不再回答自己是“通义千问模型”，而回答自己叫“小明”，是一个“大学生”？
2. 如何利用多卡对模型进行并行训练，提高训练速度？
3. 在这里我们把LoRA的目标模块设置为**ALL**，代表模型中所有的Linear模块，如果设置为**DEFAULT**，则只对Attention部分应用LoRA，不对MLP应用LoRA，此时模型训练会有什么样的影响？使用**全参数微调**又会有什么样的影响？
4. 我们使用了**微调**来实现了古文翻译腔效果，那么微调和人类对齐的应用场景有哪些不同呢？实现古文翻译腔应当使用微调还是人类对齐？如果使用人类对齐，数据集应该做怎样的转换，又如何进行训练呢？

## 实践

利用魔搭社区的开源LLM和数据集训练一个模型，并利用训练出的模型搭建一个小应用。

要求：

1. **使用魔搭社区的开源模型和训练框架SWIFT**
   - 可以使用LLM模型和MLLM（多模态模型）
2. 使用魔搭社区的开源数据集，如有其他开源数据需要先**上传到社区变为开源数据集**
3. 训练后的模型提交到魔搭社区的模型库中，模型自述文件（README.md）需要写好，给出训练命令和数据集链接

### TIPS

为了能够训练出一个好玩的模型并搭建一个小应用，一般的步骤为：

1. 选择（或生成）好自己的数据集

   > 一个数据集一般是问答式的，建议数据集格式使用下面的格式，其中第一行中带有一个额外的system字段：

   \`\`\`json
   {"conversations": [{"from": "system", "value": "你是一个优秀的模型，可以帮助我解决各类问题。"}, {"from": "user", "value": "你是谁？"}, {"from": "assistant", "value": "我是通义千问模型"}, {"from": "user", "value": "你有什么能力？"}, {"from": "assistant", "value": "我可以帮助你解决各种知识类问题"}]}
   {"conversations": [{"from": "user", "value": "你是谁？"}, {"from": "assistant", "value": "我是通义千问模型"}, {"from": "user", "value": "你有什么能力？"}, {"from": "assistant", "value": "我可以帮助你解决各种知识类问题"}]}
   \`\`\`

   > 上面的数据集包含了两行数据，每一行都是一个json格式，这个文件的格式叫做jsonline(示例文件名：train.jsonl)
   >
   > 这个格式可以被SWIFT直接使用。只需要指定：
   >
   > //使用本地文件
   >
   > --dataset ./train.jsonl 
   >
   > //如果上传到社区数据集中，使用魔搭社区的数据集id
   >
   > --dataset swift/classical_chinese_translate
   >
   > 上面的两种方式都是可以的
   >
   > 如何生成自己的数据集：
   >
   > 1. 在开源社区中找到自己需要使用的数据集
   >    - 这类数据集可能目前SWIFT并不支持，需要自己写一下前处理方法并注册，参考文档[自定义数据集](https://github.com/modelscope/swift/blob/main/docs/source/LLM/%E8%87%AA%E5%AE%9A%E4%B9%89%E4%B8%8E%E6%8B%93%E5%B1%95.md)
   > 2. 使用GPT4、Claude、通义千问等大模型生成或改进一个数据集
   >    - 这种方式可以使用两种方案：
   >      1. 使用界面手动输入一个需求，让模型帮忙生成数据，这种方式要一条一条生成，生成的数据集不会太大
   >      2. 使用API进行调用，让模型帮忙生成数据，这种方式需要编写一定的代码，而且需要购买，但生成的数据集可以很大
   >    - 比如输入给GPT4：下面的对话中，你是一个小说作者。现在，我需要你生成一个金庸口吻的短武侠小说，该小说需要有完整的人物，和一个引人入胜的剧情。在剧情中可以给出遗憾、愤怒、悲伤等情绪，小说在1000字以内。下面是一个例子：......
   >    - 在GPT4生成数据集的提示中，给出1-shot或few-shot的形式会比较有帮助。1-shot或few-shot就是上面给出的”下面是一个例子：......“的形式，这会让模型更好的模仿你的例子并理解你的需求。
   > 3. 自行制作数据集
   >    - 比如使用各类书籍或刊物、论文等，自行进行标注，或利用原有数据中的特性生成数据集。举个例子：使用论文其他部分的文字生成abstract，论文本（除abstract外）身的文字是query，abstract就是response（待训练的部分）。不过这类数据集需要保证数据来源是没有侵权的，且可能有额外的处理步骤（如数据去重、pdf转文字、低质量数据过滤等）

2. 将数据集变为框架支持的标准格式并上传魔搭的数据集社区

   > 经过第一点后，假设我们已经有了一个数据集文件，名字为train.jsonl。下面就需要把这个数据集传入魔搭社区，数据集的上传可以参考[数据上传](https://www.modelscope.cn/docs/%E6%95%B0%E6%8D%AE%E9%9B%86%E7%9A%84%E4%B8%8A%E4%BC%A0)和[数据卡片](https://www.modelscope.cn/docs/%E6%95%B0%E6%8D%AE%E9%9B%86%E5%8D%A1%E7%89%87)。

3. 使用SWIFT命令开启训练，训练后的模型上传到社区模型库中。下面的例子给出了一个基本的LoRA训练的命令：

   > swift sft \\
   >
   >   --model Qwen/Qwen2-7B-Instruct \\
   >
   >   --dataset swift/classical_chinese_translate \\
   >
   >   --num_train_epochs 1 \\
   >
   >   --max_length 1024 \\
   >
   >   --target_modules all-linear \\
   >
   >   --gradient_accumulation_steps 16 \\
   >
   >   --eval_steps 100 \\
   >
   >   --save_steps 100

   模型训练完成后需要上传模型库，可以参考文档[模型上传](https://www.modelscope.cn/docs/%E6%A8%A1%E5%9E%8B%E7%9A%84%E4%B8%8A%E4%BC%A0)和[模型卡片](https://www.modelscope.cn/docs/%E6%A8%A1%E5%9E%8B%E5%8D%A1%E7%89%87)。

4. 搭建一个小应用。

   > 如果是基本的聊天机器人，可以直接使用swift web-ui命令中的部署界面实现，该界面支持多模态LLM和文本LLM的部署和后续推理。
   >
   > 如果是更复杂的界面小应用，需要编写gradio、streamlit、html5等界面并搭配一定的模型服务。

## 附录

下面是可能用到的一些使用文档：

1. [SWIFT自述文件](https://github.com/modelscope/swift/blob/main/README_CN.md)

2. [SWIFT命令行](https://github.com/modelscope/swift/blob/main/docs/source/LLM/%E5%91%BD%E4%BB%A4%E8%A1%8C%E5%8F%82%E6%95%B0.md)

3. [SWIFT部署说明](https://github.com/modelscope/swift/blob/main/docs/source/LLM/VLLM%E6%8E%A8%E7%90%86%E5%8A%A0%E9%80%9F%E4%B8%8E%E9%83%A8%E7%BD%B2.md)

4. [SWIFT支持的模型和数据集](https://github.com/modelscope/swift/blob/main/docs/source/LLM/%E6%94%AF%E6%8C%81%E7%9A%84%E6%A8%A1%E5%9E%8B%E5%92%8C%E6%95%B0%E6%8D%AE%E9%9B%86.md)

5. [SWIFT数据集格式](https://github.com/modelscope/swift/blob/main/docs/source/LLM/%E8%87%AA%E5%AE%9A%E4%B9%89%E4%B8%8E%E6%8B%93%E5%B1%95.md)`
    },
    {
      id: "llm-q-reasoning",
      title: "Q. 从 OpenAI O1 看大模型的复杂推理能力",
      file: "LLM-tutorial/Q.从OpenAI-O1看大模型的复杂推理能力.md",
      difficulty: "高级",
      duration: "0.5h",
      week: 4,
      phase: 4,
      keywords: ["OpenAI O1", "复杂推理", "推理能力", "思维链", "Reasoning"],
      content: `# 从 OpenAI-O1 看大模型的复杂推理能力

2022 年 OpenAI 发布了 ChatGPT，成为世界上最快突破上亿用户的 APP，那时候人们都认为，我们离真正的人工智能更近了。但是人们很快发现，ChatGPT 可以对话聊天，甚至可以写诗写文章，但在简单的逻辑上依然不尽如人意，比如那个著名的 "strawberry" 中有几个 "r" 的梗。

而两年以后的今天，OpenAI 又发布了 O1 模型，以其强大的逻辑推理能力和 OpenAI 强大的技术隐藏能力引发了人们对它背后方法的热烈讨论。本文梳理了一些相关文章，以对 O1 模型技术的猜测为引，看一看大模型的复杂推理能力的发展历程。

## 一、背景介绍

### 思维链

Chain of Thought，简称 CoT，是一种认知心理学和教育学中的概念，它描述了人们在解决问题或做出决策时思维的逐步发展过程。这个过程不仅仅是简单地从问题直接跳跃到答案，而是包含了多个步骤，每个步骤都可能涉及信息的收集、分析、评估以及对先前结论的修正。通过这种方式，个体能够更系统地处理复杂的问题，并构建出合理的解决方案。

### 监督微调

Supervised Learning，监督学习，是机器学习领域最常见的模型训练方式，使用标注好的数据集让模型从中学习，以准确分类数据或预测结果。输入数据进入到模型中时，监督学习会调整模型的权重，直到模型产生适当的拟合。

Supervised Fine-Tune，简称 SFT，是指我们在已有基座模型的上，使用专注于某一项特殊任务的数据集训练模型进行监督学习，以期其能从中学习到解决特殊任务的能力。

### 强化学习

Reinforcement Learning，简称 RL，强化学习是三种基本机器学习范式之一，与监督学习和无监督学习并列。强化学习的重点是在探索（未知）和利用（已知）之间找到平衡，让模型以最大化长期回报为目标，学习到正确的行为。

![RL.png](/LLM-tutorial/resources/RL.png)

图片来自[AWS](https://aws.amazon.com/what-is/reinforcement-learning/)，如图所示，在强化学习中，智能体 (Agent) 是我们最终需要训练的目标，与设定好的环境 (Environment) 进行交互行为 (Action) 并产生奖励 (Reward) 和状态 (state) 转移，Agent 根据奖励进行学习更好地选择下一步 Action，如此循环就是强化学习的训练过程。

在 LLM 的训练过程中，RL 起了重要作用，预训练阶段借助 RLHF 进行对齐已经成了业界共识。在 LLM 的强化学习中，我们通常需要一个另一个模型模拟环境，对 LLM 的输出进行奖励，这个模型称为 Reward Model，简称 RM。有关 LLM 的 RL 的介绍可以参考我们的另一篇文章，我们在这里仅介绍其一般范式：

我们会有多个模型：Actor 模型、Critic 模型和 Reward 模型。与上文标准 RL 的训练框架一致，在 RL 训练过程中，由 Actor 和 Critic 组成 Agent，Reward 则作为 Environment 进行训练。

![RL-LLM.png](/LLM-tutorial/resources/RL-LLM.png)

但是训练结束之后，我们可以单独部署 Actor 或者 Reward 模型，其中 Actor 模型是我们的 Generator，Reward 模型则是我们用于衡量 Generator 生成质量的 Verifier，这就是 OpenAI 在 Let's verify step by step 这篇论文中提到的 Generator-Verifier 结构。

而 Reward Model 可以根据其反馈的细致程度分为：

*   基于过程的奖励模型 PRM：PRM 会根据 LLM 的中间结果给予反馈。
    
*   基于结果的奖励模型 ORM：ORM 则是在最终结果之后才给予反馈。
    

关于这两个概念我们在下文的具体场景中介绍。

### 蒙特卡洛树搜索

Monte Carlo Tree Search，简称 MCTS，是一个树搜索算法，核心思想是，每一步尝试多个行为并预测行为未来的可能收益，侧重于选择性探索一些更具有收益的行为。

![MCTS_Algorithm.png](/LLM-tutorial/resources/MCTS_Algorithm.png)

图片来自[维基百科](https://en.wikipedia.org/wiki/Monte_Carlo_tree_search)。每一次探索称为分为四个步骤：

1.  Selection：选择一个结点
    
2.  Expansion：从这个结点生成一个新的结点进行探索
    
3.  Rollout：沿着这个新的结点进行一次模拟，产生一个结果
    
4.  Back Propagation：模拟的结果反向传播，更新路径上的结点
    

通过不断的探索，我们就能得到一棵树，并且每一个结点都有探索的可能结果，我们可以在这棵树中搜索得到最佳的路径或结果。

MCTS 用于 RL 时产生过 AlphaZero 这样知名的模型。AlphaZero 的做法是使用可训练的模型执行 Selection 和 Rollout 的步骤。从而减少 MCTS 庞大的搜索空间和模拟成本，以高效的得到最优解，比如：使用 Policy Network 高效搜索下一步的可能；使用 Value Network 判断每一步的价值而非 Rollout 模拟。

### O1 的多步推理能力

提到 O1 模型，就不得不说起令人惊讶的**多步推理能力**。[OpenAI 官网](https://openai.com/index/learning-to-reason-with-llms/)给出的几个例子直观的展示了其在 密码、代码、数学、填字游戏等多个方面的多步推理能力。其中“密码”相关的示例，解码得到的结果是 “THERE ARE THREE R’S IN STRAWBERRY” 也是对曾经 ChatGPT 推理能力的回应。

![GPT-4o&O1-preview.png](/LLM-tutorial/resources/GPT-4o&O1-preview.png)

因此，我们主要探究了在这项能力方面的一些论文，整理总结如下：

## 二、提示词工程

在介绍用于提升模型推理能力的提示词工程之前，我们先要了解，什么是 Few-Shot Learning。目前人工智能的训练普遍需要大量的示例数据，而如果只使用很少的示例数据进行学习，就被称为 Few-Shot，如果完全不给示例，则称为 Zero-Shot。

《Chain of Thought Prompting Elicits Reasoning in Large Language Models》这篇论文提出的就是一种 Few-Shot 的方法提升模型的数学推理能力：

![CoT-1.png](/LLM-tutorial/resources/CoT-1.png)

如图所示，左侧在输入 LLM 的 Prompt 中，给出了一个样例让 LLM 学习，这就是 Few-Shot Learning，但是其效果依然不理想。论文提出了右边这种带有 CoT 的 Few-Shot 范式。所以右侧在 Few-Shot 中，不仅给出一个示例的问题和答案，还给出了中间过程和结果。作者发现，这样使用 CoT 构造的 Few-Shot Prompt 提高了模型的推理能力。

而随着模型本身能力的提高以及研究的深入，《Large Language Models are Zero-Shot Reasoners》这篇文章进一步发现 Zero-Shot 也可以使用 CoT 来增强模型能力了：

![CoT-2.png](/LLM-tutorial/resources/CoT-2.png)

无需费心费力构造一个 CoT 中间过程，甚至无需构造示例进行 Few-Shot，一句简单的 “Let's think step by step” 就可以增强 LLM 的能力。听起来不做白不做。这一 Prompt 后来被 OpenAI 拿去改了一改变成了《Let's verify step by step》，而这篇论文是目前所有想要了解 O1 的人反复阅读的核心。

当然仅仅依靠提示词工程构建 CoT 不可能是 O1 如此强大的原因，但 CoT 这种一步步推进逻辑的做法，成为大模型增强推理能力的主流方向。

## 三、CoT + Supervised Fine-Tune

当然，也有人尝试将 CoT 的多步推理能力使用 SFT 的方式教给 LLM。《STaR: Bootstrapping Reasoning With Reasoning》是一个早期尝试。下图来自该论文：

![SFT+CoT.png](/LLM-tutorial/resources/SFT+CoT.png)

论文的思路是这样的。首先我们用上文的提示词工程的方式，让模型尝试 CoT 在数据集上进行推理，会得到一批答案，答案自然有对有错：

*   如果得到了正确的答案，我们认为模型产生的对应的 CoT 是优质 CoT，那么把这样的优质的“问题-CoT-答案”样本收集起来，就得到一个新的数据集，使用该数据集去 SFT 我们的 LLM，不断循环，就可以得到推理能力更强的 LLM；
    
*   而如果有一些问题上，LLM 始终答错，那我们直接让 LLM 看到“问题+答案”，让它生成一个从问题到答案的 CoT，我们可以认为，在已知答案的情况下，LLM 生成的 CoT 是正确的，于是这一部分“问题-CoT-答案”的样本也可以用于训练。
    

由于这篇研究时间较早，我们现在很容易发现其中的漏洞，比如：LLM 其实经常发生“过程错误但是结果正确”或者“过程正确但是结果错误”的情况，这意味着上文我们用于训练的样本其实并没有那么高的质量。那么如何得到更加正确的推理过程呢？

## 四、Monte Carlo Tree Search

上文我们已经知道 CoT 把从问题到答案的逻辑已经拆成了一个又一个中间思维过程，那么 MCTS 是否可以用于搜索下一步推理的最佳思维步骤，从而获得最佳推理思维链？自然可以。

《Mutual Reasoning Makes Smaller LLMs Stronger Problem-Solvers》就设计了这样一个 MCTS 算法，称为 rStar，他们将项目开源至了[GitHub](https://github.com/zhentingqi/rStar)。下图来自该论文，是不是和上文 MCTS 的图片有一些相似之处了？

![MCTS+CoT.png](/LLM-tutorial/resources/MCTS+CoT.png)

如上图所示，研究人员把 CoT 的中间步骤分成了 5 个类型的结点：

1. 产生下一步推理

2. 产生后续所有推理

3. 产生一个子问题及答案

4. 重新回答子问题

5. 重构问题

然后利用 MCTS 决定下一个思维步骤结点。由一个又一个思维结点链接起来的路径，就是 CoT。我们简单拿所有得到的最终结果进行投票，就能得到一个不错的结果。

当然，作者研究不止如此，如上文所说，必须要能够衡量每一步结点的正确性和推理的正确性，研究人员设计了如下方法：

*   Discriminator 筛选：在得到的原始推理路径后，随机 Mask 一部分，然后使用另一个模型进行输出，如果得到和原始 Generator 相同的结果，则说明原始推理路径可靠。
    
*   答案正确性：将所有的最终答案收集起来，某一个答案占所有答案的比例即为答案得分。
    
*   过程正确性：路径中每一个推理结点，并行生成若干 2 型结点生成若干一步到位的最终结果，这些结果中，目前路径的最终结果的比例视为该推理结点的过程得分。 通过三部分衡量，就能得到一条最佳路径，将最佳路径的最终结果视为 MCTS 的结果。
    

## 五、Generator + Verifier

除了上文的 MCTS 可以将思维过程组织成树形并进行探索，还有其他方式。比如强化学习，我们再次看强化学习的介绍：

![RL-LLM.png](/LLM-tutorial/resources/RL-LLM.png)

如果我们把 LLM 作为 Actor，另一个针对问题训练的 RM 作为 Environment，加上一个隐含的 Critic。这样一个强化学习的循环就是：Actor 针对问题产生一个结果，RM 验证这个结果的正确性并反馈给 Agent，Actor 和 Critic 根据 Reward 进行学习训练。我们把这里的 Agent 称为 Generator，因为他的任务是产生结果；RM 称为 Verifier，因为他的任务是验证结果。

仔细想想，Agent 内部的 Actor 和 Critic 的关系，与 AlphaZero 使用的 Policy 和 Value 网络是不是很像？事实也是这样，Policy 和 Value 网络也符合 Actor 和 Critic 框架。

现在我们总结一下，一次强化学习的过程有 Actor、Critic 和 RM 三个网络参与。而在部署时，根据情况的不同，使用不同的框架部署：棋类游戏中只有在对局结束的时候，才能知道胜负，RM 给予的 Reward 太少，因此我们选择在部署时保留 Actor-Critic 框架，然后进行 MCTS 以获得更好的解决方案；而在 LLM 部署时，我们训练好的 RM 可以及时反馈，那么我们在部署的时候自然也可以组合 Actor 和 RM 成 Generator-Verifier 框架。

OpenAI 在 GPT3（ChatGPT 是基于 GPT-3.5 模型的）时代就已经在研究这个方向了。他们给出的方案是论文《Training Verifiers to Solve Math Word Problems》。下图来自该论文：

![Verifier.png](/LLM-tutorial/resources/Verifier.png)

上图对比了：“仅仅微调 Generator 得到的结果的正确率” 和 “微调一个 Verifier，对 Generator 产生的多个结果进行评估，选择更高评价的结果的正确率”，证明了 Verifier 的有效性。

因为这里的任务是：根据问题推理得到结果。所以使用的 Generator 并不产生中间的推理过程而是直接产生结果，Verifier 也是我们在强化学习一节中提到的 ORM（基于结果的奖励模型），其作用是根据 Generator 的结果产生一个评分。所以这里并没有涉及我们想要探究的多步推理的过程，仅仅只是发现 ORM 验证得到的最终结果比简单微调更好。

于是 OpenAI 团队更进一步：一方面让 Generator 不再直接输出结果，而是产生逐步推理；另一方面，训练了一个 PRM（基于过程的奖励模型），作为 Verifier，其作用是针对 Generator 推理过程中的每一步产生评分。我们认为这样力求 Generator 推理的过程正确性所产生的结果，才是最有可能正确的。

这就是上文我们提到的《Let's verify step by step》。在这个工作中，团队对比了 PRM 和 ORM 分别作为 Verifier，搜索相同 Generator 产生的推理结果（此时他们的 Generator 已经是 GPT-4 了），证明 PRM 作为 Verifier 搜索得到的结果更准确。下图来自该论文：

![PRM-ORM.png](/LLM-tutorial/resources/PRM-ORM.png)

上图说明，同一个逐步推理的 Generator 产生的结果，我们使用 ORM 作为 Verifier 选出结果最佳的答案是有效的，但我们使用 PRM 作为 Verifier 选出过程最佳的答案，正确率更高！

这是不是就是我们想要寻找的 O1 背后的技术呢？我们目前只能猜测，这是背后的核心技术之一。理由如下：

1.  这篇论文距离 O1 的发布时间比较远，一年的时间足够 OpenAI 的研究人员更加深入研究这个方向。因为 PRM 的有效性，虽然一年时间也足够调整至其他方向，但我们还是认为他们是深入而非掉头。
    
2.  文章证明了 PRM 作为 Verifier 的有效性，显然可以进行的下一步尝试是：利用强大的 Verifier 改善 Generator 以产生更优质的结果。但是论文并没有这方面推进，我们有理由相信 OpenAI 必定做了尝试，产生的结果是否就是 O1 不得而知。
    

说完猜测，我们继续探究利用 Verifier 进行搜索的其他方式。来自 Google DeepMind 今年 8 月份的文章《Scaling LLM Test-Time Compute Optimally can be More Effective than Scaling Model Parameters》做了更多的研究。这篇文章被许多人认为是展示了和 O1 背后原理类似的技术路线。下图来自该论文：

![RM+Search.png](/LLM-tutorial/resources/RM+Search.png)

已知我们有了 Generator 和 Verifier，如何让他们互相配合得到最优结果呢？上文提到的一个方法是，Generator 并行采样得到多个结果，Verifier 评估后选择最高分。这就是上图里的左侧的 Parallel Sampling + Best-of-N 的做法。但是显然还有其他做法：

*   在产生多个结果的时候，除了并行采样多个结果，也可以让 Generator 产生一个结果之后，自己对结果进行检查和改正，得到一个答案序列，他们之间不再是平行的关系。
    
*   由 Verifier 进行选择的时候，除了 Best-of-N，也可以有其他办法。如来自该论文的下图所示：

![Verifier-Search.png](/LLM-tutorial/resources/Verifier-Search.png)
    

论文发现，简单的问题，我们应该使用 Verifier 鼓励 Generator 进行自我检查和改正，而不是盲目并行搜索。而复杂的问题，Generator 并行尝试不同的方案是更好的选择。

类似的工作是《A Comparative Study on Reasoning Patterns of OpenAI's o1 Model》。论文团队在 GitHub 上开源了一个复刻 O1 的项目 Open-O1，这篇文章是他们在 O1 发布之后的一些调研成果。下图来自该论文：

![Open-O1_result.png](/LLM-tutorial/resources/Open-O1_result.png)

团队使用 GPT-4o 作为骨架模型，然后使用四种常见的让 LLM 实现 thinking-before-reasoning 的方法，对比了他们的效果。团队发现，在 HotpotQA 任务上，Best-of-N 和 Step-wise BoN 的方式都能够明显提高 LLM 的推理能力，BoN 甚至使得 GPT-4o 超过了 O1 模型。

## 六、OpenR

以上介绍了一些在 LLM 复杂推理能力上的研究和相关论文。我们也调研了目前的一些尝试复刻 O1 的开源项目。[OpenR](https://github.com/openreasoner/openr) 是其中完成度较高的一个。

![OpenR.png](/LLM-tutorial/resources/OpenR.png)

图片来自其[官方文档](https://openreasoner.github.io/)，目前来看，其实现了数据收集以及符合 Generator-Verifier 框架的训练与部署。

#### 数据收集

根据官方介绍，数据收集方法来自论文：《Improve Mathematical Reasoning in Language Models by Automated Process Supervision》。简单来说，OpenR 团队使用 MCTS 扩展原有的 problem-final\\_answer 数据集，生成 CoT 推理步骤。最后得到一个 MATH-APS 数据集。

#### Generator 训练

团队使用强化学习中的 PPO 算法变体训练 Generator。简单来说，PPO 算法是利用 Reward Model 提供的 Reward 信息进行训练，同时限制 Actor，使其在学习过程中不偏离原始 Actor 太远，避免丢失已有的知识。目前 OpenR 支持 APPO、GRPO 和 TPPO 三个变体。

#### Virifier 训练

团队使用 SFT 监督学习训练一个 PRM，使用的数据集除了上文的 MATH-APS 数据集，还包括 PRM800K 、 Math-Shepherd 两个开源数据集。具体来说，在这三个 Step 级别的数据集上，团队对每一个 step 标注 “+” 或者 “-” 标签，然后让 PRM 学习预测每一个 Step 的标签，判断其正确与否。

#### 推理部署

在部署时，OpenR 通过指定的 Generator 和 Verifier 使用搜索算法，获得推理过程和最终答案。目前支持 MCTS、Beam Search、best\\_of\\_n 三种搜索方式。

![OpenR_framework.png](/LLM-tutorial/resources/OpenR_framework.png)

图片来自论文《OpenR: An Open Source Framework for Advanced Reasoning with Large Language Models》。OpenR 的结构如图所示，目前来说，OpenR 实现了一条复刻 O1 的链路，从收集训练数据到训练一个 PRM，再到使用 PRM 强化学习，最后部署模型进行搜索，并且团队将工作全部开源供社区学习尝试，让我们得以一窥究竟。

## 七、结论

我们调研的以上有关多步推理的论文，证明了让 LLM 逐步进行推理而不是跳过中间过程能够显著增强其在和逻辑相关的问题上的准确性。为了让 LLM 进行逐步推理，我们除了可以用简单的提示词工程引导，也可以使用一些带有中间过程的数据集进行微调。而更有效的做法是，训练一个能够逐步验证 Generator 准确性的 Verifier 对 Generator 生成的结果进行搜索。

从目前的猜测和论文来看，迈向 O1 的可能技术正是基于强大的 LLM Generator 和 LLM Verifier 之间的配合。这种左脚踩右脚，自己对抗自己进行自我迭代的做法，在深度学习领域已经不是第一次了，但 OpenAI 却是率先将这样的模式引入光训练 Generator 就耗资巨大的 LLM 领域，确实财大气粗。

因此我们认为，如果想要复刻 O1，首先需要的是一个可以为 Generator 提供辅助和指导的 Verifier，而为了产生训练 Verifier 所需要的数据，可以参考上文 CoT + Supervised Fine-Tune 和 Monte Carlo Tree Search 章节，以较低成本的方式获得较高质量的数据。这也就是为什么我们也介绍了这几项工作。

最后我们介绍了一个完成度较高的开源项目，基于他们的工作，我们得以整理自己的思路和想法。

## 八、参考

1. Cobbe, Karl, Vineet Kosaraju, Mohammad Bavarian, Mark Chen, Heewoo Jun, Lukasz Kaiser, Matthias Plappert, et al. 2021. “Training Verifiers to Solve Math Word Problems.” https://arxiv.org/abs/2110.14168v2.
2. Kojima, Takeshi, Shixiang Shane Gu, Machel Reid, Yutaka Matsuo, and Yusuke Iwasawa. 2022. “Large Language Models Are Zero-Shot Reasoners.” https://arxiv.org/abs/2205.11916v4.
3. “Learning to Reason with LLMs | OpenAI.” n.d. Accessed October 22, 2024. https://openai.com/index/learning-to-reason-with-llms/.
4. Lightman, Hunter, Vineet Kosaraju, Yura Burda, Harri Edwards, Bowen Baker, Teddy Lee, Jan Leike, John Schulman, Ilya Sutskever, and Karl Cobbe. 2023. “Let’s Verify Step by Step.” arXiv. https://arxiv.org/abs/2305.20050.
5. “Monte Carlo Tree Search.” 2024. In Wikipedia. https://en.wikipedia.org/wiki/Monte_Carlo_tree_search.
6. Qi, Zhenting, Mingyuan Ma, Jiahang Xu, Li Lyna Zhang, Fan Yang, and Mao Yang. 2024. “Mutual Reasoning Makes Smaller LLMs Stronger Problem-Solvers.” https://arxiv.org/abs/2408.06195v1.
7. Snell, Charlie, Jaehoon Lee, Kelvin Xu, and Aviral Kumar. 2024. “Scaling LLM Test-Time Compute Optimally Can Be More Effective than Scaling Model Parameters.” arXiv. https://arxiv.org/abs/2408.03314.
8. Wang, Jun, Meng Fang, Ziyu Wan, Muning Wen, Jiachen Zhu, Anjie Liu, Ziqin Gong, et al. 2024. “OpenR: An Open Source Framework for Advanced Reasoning with Large Language Models.” arXiv. https://arxiv.org/abs/2410.09671.
9. Wei, Jason, Xuezhi Wang, Dale Schuurmans, Maarten Bosma, Brian Ichter, Fei Xia, Ed Chi, Quoc Le, and Denny Zhou. 2023. “Chain-of-Thought Prompting Elicits Reasoning in Large Language Models.” arXiv. https://arxiv.org/abs/2201.11903.
10. Wu, Siwei, Zhongyuan Peng, Xinrun Du, Tuney Zheng, Minghao Liu, Jialong Wu, Jiachen Ma, et al. 2024. “A Comparative Study on Reasoning Patterns of OpenAI’s O1 Model.” arXiv. https://arxiv.org/abs/2410.13639.
11. Zelikman, Eric, Yuhuai Wu, Jesse Mu, and Noah D. Goodman. 2022. “STaR: Bootstrapping Reasoning With Reasoning.” https://arxiv.org/abs/2203.14465v2.
12. “什么是强化学习？- 强化学习简介 - AWS.” n.d. Amazon Web Services, Inc. Accessed October 22, 2024. https://aws.amazon.com/what-is/reinforcement-learning/.
`
    },
    {
      id: "llm-s-ppo-grpo",
      title: "S. PPO 和 GRPO",
      file: "LLM-tutorial/S.PPO和GRPO.md",
      difficulty: "高级",
      duration: "0.5h",
      week: 3,
      phase: 3,
      keywords: ["PPO", "GRPO", "强化学习", "策略优化", "RLHF算法"],
      content: `# PPO和GRPO

强化学习是深度学习之外的另一个人工智能分支，它的思路和深度学习是不同的，举几个使用了强化学习的情景：

1. 网游的自动寻路功能
2. 机器人搬运一块石头
3. AlphaGo下围棋

强化学习的主要思路，就是智能体选择一个动作后，接收环境信息，根据当下奖励和预期奖励，选择下一个动作并循环往复

强化学习在近些年在大模型上的应用越来越多，是因为大模型的token生成本质上也是一个token接一个token的。

## PPO：近端策略优化

### 举个例子

想象你在学做菜，有一个很保守的老师：

**问题情况**：你昨天学会了做蛋炒饭，今天想学习新的调味方法。（模型已经经过了预训练，现在想调整下回答范式）

**学生**：今天我要加很多新调料！（我要调整模型参数，还要改变回答的分布！）

**老师**：等等，不要变化太大。你昨天加一勺盐效果不错，今天最多加1.2勺，不要一下子加2勺，否则可能做坏了。（别偏离现在的模型参数太远，防止知识遗忘和训崩，也就是\`近端\`策略优化）

### PPO的数学原理

#### 重要性采样

传统策略梯度有个问题：收集数据用的是旧策略 $\\pi_{\\theta_{old}}$，但我们要更新的是新策略 $\\pi_\\theta$。

使用重要性采样修正：

$$\\mathbb{E}_{a \\sim \\pi_{\\theta_{old}}}[f(a)] = \\mathbb{E}_{a \\sim \\pi_\\theta}[\\frac{\\pi_{\\theta_{old}}(a|s)}{\\pi_\\theta(a|s)} f(a)]$$

定义重要性采样比率：
$$r_t(\\theta) = \\frac{\\pi_\\theta(a_t|s_t)}{\\pi_{\\theta_{old}}(a_t|s_t)}$$

#### PPO-Clip

PPO的目标函数是：

$$L^{CLIP}(\\theta) = \\mathbb{E}_t[\\min(r_t(\\theta)A_t, \\text{clip}(r_t(\\theta), 1-\\epsilon, 1+\\epsilon)A_t)]$$

其中：
- $A_t$ 是优势函数，表示动作 $a_t$ 比平均水平好多少
- $\\epsilon$ 是截断参数，通常取0.1或0.2
- clip函数限制比率在 $[1-\\epsilon, 1+\\epsilon]$ 范围内

#### 详细解释

**当 $A_t > 0$（好动作）时**：
- 如果 $r_t > 1+\\epsilon$：新策略过度增加了这个好动作的概率，被截断
- 如果 $r_t < 1-\\epsilon$：新策略过度减少了这个好动作的概率，也被截断

**当 $A_t < 0$（坏动作）时**：
- 如果 $r_t > 1+\\epsilon$：新策略过度增加了坏动作概率，被截断  
- 如果 $r_t < 1-\\epsilon$：新策略过度减少了坏动作概率，也被截断

这确保了策略更新不会太激进。

<img src="file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/ppo.jpg" alt="ppo formula" style="zoom:50%;" />

<img src="file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/grpo.png" alt="grpo" style="zoom:50%;" />

## GRPO

GRPO的来源是DeepSeek团队的[DeepSeekMath论文](https://arxiv.org/pdf/2402.03300)。

### 为什么要使用GRPO

1. PPO的Value Model最开始是不准确的，和Policy Model是同时训练的，这可能训练时的不稳定性
2. 增加一个Value Model加大了大规模训练的工程难度，以及训练资源使用
3. 人类更善于关注相对值，而非绝对值。因此重标注的方式来给回答进行准确的绝对值打分是困难的，而RL训练只需要相对优势，因此使用采样替代更为简单

GRPO的主要思路就是用抽样的相对优势代替绝对的打分，我们贴一下DeepSeek训练GRPO的训练过程：

1. 先收集一部分高质量冷启动数据（约几千条），使用该数据fine-tune DeepSeek-V3-Base模型，记为模型A
2. 使用A模型用GRPO训练，使其涌现推理能力，收敛的模型记为B
3. 使用B模型产生高质量SFT数据，并混合DeepSeek-V3产生的其他领域的高质量数据，形成一个高质量数据集
4. 使用该数据集训练原始DeepSeek-V3-Base模型，记为模型C
5. 使用C模型重新进行步骤2，但是数据集变为所有领域，收敛后的模型记为D，这个模型就是DeepSeek-R1
6. 训练C模型的数据对小模型做蒸馏，效果也非常好

贴一下关键的论文原文部分：

\`\`\`text
由于PPO中使用的价值函数通常是另一个与策略模型规模相当的模型，这带来了巨大的内存和计算负担。
此外，在强化学习训练过程中，价值函数被用作计算优势的基线以减少方差。
而在大语言模型的上下文中，通常只有最后一个token被奖励模型分配奖励分数，这可能会使训练在每个token上都准确的价值函数变得复杂。
为了解决这个问题，如图4所示，我们提出了群体相对策略优化（GRPO），它消除了像PPO中那样需要额外价值函数近似的需求，
而是使用针对同一问题产生的多个采样输出的平均奖励作为基线。
更具体地说，对于每个问题𝑞，GRPO从旧策略𝜋𝜃𝑜𝑙𝑑中采样一组输出{𝑜1, 𝑜2, · · · , 𝑜𝐺}，
然后通过最大化以下目标来优化策略模型：
\`\`\`
<img src="file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/grpo.jpg" alt="grpo formula" style="zoom:50%;" />

\`\`\`text
...
GRPO 使用的分组相对方法与奖励模型的比较性质非常一致，因为奖励模型通常在相
同问题的不同输出之间的比较数据集上进行训练。另外请注意，GRPO 不是在奖励中添加 KL
罚项，而是通过直接将训练策略和参考策略之间的 KL 散度添加到损失函数中来正则化，避免了
复杂化 ˆ𝐴𝑖,𝑡 的计算。与PPO中使用的 KL 罚项不同，我们使用以下无偏估计量 (Schulman, 2020)
来估计 KL 散度：
\`\`\`
<img src="file:///Users/asura/IdeaProjects/github/modelscope-classroom/LLM-tutorial/resources/kl_grpo.jpg" alt="grpo kl" style="zoom:50%;" />

\`\`\`text
...
对于每个问题 𝑞，从旧策略模型 𝜋𝜃𝑜𝑙𝑑 中采样一组输出 {𝑜1, 𝑜2, · · · , 𝑜𝐺 }。然后使用奖励模
型对输出进行评分，得到 r = {𝑟1, 𝑟2, · · · , 𝑟𝐺 } 个相应的奖励 𝐺。随后，通过减去组平均值并除以
组标准差来规范化这些奖励。结果监督在每个输出 𝑜𝑖 的末尾提供规范化奖励，并将输出中所有
词元的优势 ˆ𝐴𝑖,𝑡 设置为规范化奖励，即 ˆ𝐴𝑖,𝑡 = ˜𝑟𝑖 = (𝑟𝑖 −mean(r))/std(r) ，然后通过最大化公式中定义的目标来优化策略。
\`\`\`

GRPO解决了强化微调中标注数据的巨大成本，简化了数据集格式需求和训练难度，这也是DeepSeek-R1大火的重要原因。

## 训练框架选择

选择合适自己的训练框架，这里推荐几个比较好的开源框架：

- [SWIFT](https://github.com/modelscope/ms-swift)：支持PT、SFT、RLHF、多模态、Megatron、蒸馏、GRPO、拒绝采样等
- [veRL](https://github.com/volcengine/verl): 支持大规模RL训练，尤其是Megatron+Ray相关的训练
- [OpenRLHF](https://github.com/OpenRLHF/OpenRLHF): 类比veRL，支持大规模RL训练，尤其是Megatron+Ray相关的训练
- [TRL](https://github.com/huggingface/trl): Hugging Face社区的框架，使用简单，适合小规模RL训练`
    }
  ]
});
