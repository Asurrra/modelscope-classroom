window.LEARNING_DATA = window.LEARNING_DATA || [];
window.LEARNING_DATA.push({
  module: 'AIGC-实践篇',
  chapters: [
    {
      id: 'nb-aigc-dit-demo',
      title: 'DiT 图像生成演示',
      file: 'AIGC-tutorial/notebook/DiT_ImageNet_Demo.ipynb',
      difficulty: '中级',
      duration: '0.5h',
      week: 0,
      phase: 0,
      keywords: ["DiT", "ImageNet", "扩散模型"],
      content: `# 基于 Transformer 的可扩展扩散模型（DiT）

本教程演示如何对预训练的 DiT 模型进行采样。DiT 是在 ImageNet 上训练的类别条件潜在扩散模型（class-conditional latent diffusion model），它使用 Transformer 替代 U-Net 作为 DDPM 的主干网络。在 ImageNet 基准测试中，DiT 的表现超越了此前所有的扩散模型。

[项目主页](https://www.wpeebles.com/DiT) | [HuggingFace Space](https://huggingface.co/spaces/wpeebles/DiT) | [论文](http://arxiv.org/abs/2212.09748) | [GitHub](github.com/facebookresearch/DiT)

> *Original: Scalable Diffusion Models with Transformer (DiT)*
>
> *This notebook samples from pre-trained DiT models. DiTs are class-conditional latent diffusion models trained on ImageNet that use transformers in place of U-Nets as the DDPM backbone. DiT outperforms all prior diffusion models on the ImageNet benchmarks.*

# 1. 环境准备（Setup）

建议使用 GPU 运行（Runtime > Change runtime type > Hardware accelerator > GPU）。执行下面这段代码会克隆 DiT 的 GitHub 仓库并配置好 PyTorch 环境，只需执行一次。

> *Original: We recommend using GPUs (Runtime > Change runtime type > Hardware accelerator > GPU). Run this cell to clone the DiT GitHub repo and setup PyTorch. You only have to run this once.*

\`\`\`python
!git clone https://github.com/facebookresearch/DiT.git
import DiT, os
os.chdir('DiT')
os.environ['PYTHONPATH'] = '/env/python:/content/DiT'
!pip install diffusers timm --upgrade
\`\`\`

\`\`\`python
# DiT imports:
import torch
from torchvision.utils import save_image
from diffusion import create_diffusion
from diffusers.models import AutoencoderKL
from download import find_model
from models import DiT_XL_2
from PIL import Image
from IPython.display import display
from modelscope import snapshot_download
torch.set_grad_enabled(False)
device = "cuda" if torch.cuda.is_available() else "cpu"
if device == "cpu":
    print("GPU not found. Using CPU instead.")
\`\`\`

# 下载 DiT-XL/2 模型

你可以在 512×512 与 256×256 两种规模的模型之间任选其一，也可以替换所使用的 LDM VAE。

> *Original: Download DiT-XL/2 Models*
>
> *You can choose between a 512x512 model and a 256x256 model. You can swap-out the LDM VAE, too.*

\`\`\`python
image_size = 256 #@param [256, 512]
vae_model = snapshot_download("AI-ModelScope/sd-vae-ft-ema") #@param ["stabilityai/sd-vae-ft-mse", "stabilityai/sd-vae-ft-ema"]
latent_size = int(image_size) // 8
# Load model:
model = DiT_XL_2(input_size=latent_size).to(device)
DiT_model = snapshot_download(f"AI-ModelScope/DiT-XL-2-{image_size}x{image_size}")
state_dict = find_model(f"{DiT_model}/DiT-XL-2-{image_size}x{image_size}.pt")
model.load_state_dict(state_dict)
model.eval() # important!
vae = AutoencoderKL.from_pretrained(vae_model).to(device)
\`\`\`

# 2. 使用预训练 DiT 模型进行采样

你可以自定义多种采样参数。完整的 ImageNet 类别列表请参考[此处](https://gist.github.com/yrevar/942d3a0ac09ec9e5eb3a)。

> *Original: Sample from Pre-trained DiT Models*
>
> *You can customize several sampling options. For the full list of ImageNet classes, [check out this](https://gist.github.com/yrevar/942d3a0ac09ec9e5eb3a).*

\`\`\`python
# Set user inputs:
seed = 0 #@param {type:"number"}
torch.manual_seed(seed)
num_sampling_steps = 250 #@param {type:"slider", min:0, max:1000, step:1}
cfg_scale = 4 #@param {type:"slider", min:1, max:10, step:0.1}
class_labels = 207, 360, 387, 974, 88, 979, 417, 279 #@param {type:"raw"}
samples_per_row = 4 #@param {type:"number"}

# Create diffusion object:
diffusion = create_diffusion(str(num_sampling_steps))

# Create sampling noise:
n = len(class_labels)
z = torch.randn(n, 4, latent_size, latent_size, device=device)
y = torch.tensor(class_labels, device=device)

# Setup classifier-free guidance:
z = torch.cat([z, z], 0)
y_null = torch.tensor([1000] * n, device=device)
y = torch.cat([y, y_null], 0)
model_kwargs = dict(y=y, cfg_scale=cfg_scale)

# Sample images:
samples = diffusion.p_sample_loop(
    model.forward_with_cfg, z.shape, z, clip_denoised=False, 
    model_kwargs=model_kwargs, progress=True, device=device
)
samples, _ = samples.chunk(2, dim=0)  # Remove null class samples
samples = vae.decode(samples / 0.18215).sample

# Save and display images:
save_image(samples, "sample.png", nrow=int(samples_per_row), 
           normalize=True, value_range=(-1, 1))
samples = Image.open("sample.png")
display(samples)
\`\`\``
    },
    {
      id: 'nb-aigc-sit-demo',
      title: 'SiT 流扩散模型演示',
      file: 'AIGC-tutorial/notebook/SiT_ImageNet_Demo.ipynb',
      difficulty: '中级',
      duration: '0.5h',
      week: 0,
      phase: 0,
      keywords: ["SiT", "ODE", "SDE"],
      content: `# SiT：基于可扩展插值 Transformer 探索流式与扩散式生成模型

本教程演示如何对预训练的 SiT 模型进行采样。SiT 是在 ImageNet 上训练的类别条件潜在插值模型（class-conditional latent interpolant models），它将流式（Flow）方法与扩散（Diffusion）方法统一在同一框架中。

[论文]() | [GitHub](github.com/willisma/SiT)

> *Original: SiT: Exploring Flow and Diffusion-based Generative Models with Scalable Interpolant Transformers*
>
> *This notebook samples from pre-trained SiT models. SiTs are class-conSiTional latent interpolant models trained on ImageNet, unifying Flow and Diffusion Methods.*

# 1. 环境准备（Setup）

建议使用 GPU 运行（Runtime > Change runtime type > Hardware accelerator > GPU）。执行下面这段代码会克隆 SiT 的 GitHub 仓库并配置好 PyTorch 环境，只需执行一次。

> *Original: We recommend using GPUs (Runtime > Change runtime type > Hardware accelerator > GPU). Run this cell to clone the SiT GitHub repo and setup PyTorch. You only have to run this once.*

\`\`\`python
!git clone https://github.com/willisma/SiT.git
!pip install diffusers timm torchdiffeq --upgrade
\`\`\`

\`\`\`python
# SiT imports:
import SiT, os
os.chdir('SiT')
os.environ['PYTHONPATH'] = '/env/python:/content/SiT'
import torch
from torchvision.utils import save_image
from transport import create_transport, Sampler
from diffusers.models import AutoencoderKL
from download import find_model
from models import SiT_XL_2
from PIL import Image
from IPython.display import display
from modelscope import snapshot_download
torch.set_grad_enabled(False)
device = "cuda" if torch.cuda.is_available() else "cpu"
if device == "cpu":
    print("GPU not found. Using CPU instead.")
\`\`\`

# 下载 SiT-XL/2 模型

> *Original: Download SiT-XL/2 Models*

\`\`\`python
image_size = "256"
vae_model = snapshot_download("AI-ModelScope/sd-vae-ft-ema") #@param ["stabilityai/sd-vae-ft-mse", "stabilityai/sd-vae-ft-ema"]
latent_size = int(image_size) // 8
# Load model:
model = SiT_XL_2(input_size=latent_size).to(device)
SiT_model = snapshot_download(f"AI-ModelScope/SiT-XL-2-{image_size}")
state_dict = find_model(f"{SiT_model}/SiT-XL-2-{image_size}.pt")
model.load_state_dict(state_dict)
model.eval() # important!
vae = AutoencoderKL.from_pretrained(vae_model).to(device)
\`\`\`

# 2. 使用预训练 SiT 模型进行采样

你可以自定义多种采样参数。完整的 ImageNet 类别列表请参考[此处](https://gist.github.com/yrevar/942d3a0ac09ec9e5eb3a)。

> *Original: Sample from Pre-trained SiT Models*
>
> *You can customize several sampling options. For the full list of ImageNet classes, [check out this](https://gist.github.com/yrevar/942d3a0ac09ec9e5eb3a).*

\`\`\`python
# Set user inputs:
seed = 0 #@param {type:"number"}
torch.manual_seed(seed)
num_sampling_steps = 250 #@param {type:"slider", min:0, max:1000, step:1}
cfg_scale = 4 #@param {type:"slider", min:1, max:10, step:0.1}
class_labels = 207, 360, 387, 974, 88, 979, 417, 279 #@param {type:"raw"}
samples_per_row = 4 #@param {type:"number"}
sampler_type = "ODE" #@param ["ODE", "SDE"]


# Create diffusion object:
transport = create_transport()
sampler = Sampler(transport)

# Create sampling noise:
n = len(class_labels)
z = torch.randn(n, 4, latent_size, latent_size, device=device)
y = torch.tensor(class_labels, device=device)

# Setup classifier-free guidance:
z = torch.cat([z, z], 0)
y_null = torch.tensor([1000] * n, device=device)
y = torch.cat([y, y_null], 0)
model_kwargs = dict(y=y, cfg_scale=cfg_scale)

# Sample images:
if sampler_type == "SDE":
    SDE_sampling_method = "Euler" #@param ["Euler", "Heun"]
    diffusion_form = "linear" #@param ["constant", "SBDM", "sigma", "linear", "decreasing", "increasing-decreasing"]
    diffusion_norm = 1 #@param {type:"slider", min:0, max:10.0, step:0.1}
    last_step = "Mean" #@param ["Mean", "Tweedie", "Euler"]
    last_step_size = 0.4 #@param {type:"slider", min:0, max:1.0, step:0.01}
    sample_fn = sampler.sample_sde(
        sampling_method=SDE_sampling_method,
        diffusion_form=diffusion_form, 
        diffusion_norm=diffusion_norm,
        last_step_size=last_step_size, 
        num_steps=num_sampling_steps,
    ) 
elif sampler_type == "ODE":
    # default to Adaptive Solver
    ODE_sampling_method = "dopri5" #@param ["dopri5", "euler", "rk4"]
    atol = 1e-6
    rtol = 1e-3
    sample_fn = sampler.sample_ode(
        sampling_method=ODE_sampling_method,
        atol=atol,
        rtol=rtol,
        num_steps=num_sampling_steps
    ) 
samples = sample_fn(z, model.forward_with_cfg, **model_kwargs)[-1]
samples = vae.decode(samples / 0.18215).sample

# Save and display images:
save_image(samples, "sample.png", nrow=int(samples_per_row), 
           normalize=True, value_range=(-1, 1))
samples = Image.open("sample.png")
display(samples)
\`\`\``
    },
    {
      id: 'nb-aigc-uvit-demo',
      title: 'U-ViT 图像生成演示',
      file: 'AIGC-tutorial/notebook/UViT_ImageNet_demo.ipynb',
      difficulty: '中级',
      duration: '0.5h',
      week: 0,
      phase: 0,
      keywords: ["U-ViT", "DPM-Solver"],
      content: `\`\`\`python
!git clone https://github.com/baofff/U-ViT
!pip install einops
\`\`\`

\`\`\`python
import os
os.chdir('/mnt/workspace/U-ViT')
os.environ['PYTHONPATH'] = '/env/python:/content/U-ViT'

import torch
from dpm_solver_pp import NoiseScheduleVP, DPM_Solver
import libs.autoencoder
from libs.uvit import UViT
import einops
from torchvision.utils import save_image
from PIL import Image
\`\`\`

\`\`\`python
from modelscope.hub.file_download import model_file_download
\`\`\`

\`\`\`python
image_size = "256" #@param [256, 512]
image_size = int(image_size)

if image_size == 256:
    model_file_download(model_id='thu-ml/imagenet256_uvit_huge',file_path='imagenet256_uvit_huge.pth', cache_dir='/mnt/workspace')
    !mv /mnt/workspace/thu-ml/imagenet256_uvit_huge/imagenet256_uvit_huge.pth /mnt/workspace/U-ViT
else:
    model_file_download(model_id='thu-ml/imagenet512_uvit_huge',file_path='imagenet512_uvit_huge.pth', cache_dir='/mnt/workspace')
    !mv /mnt/workspace/thu-ml/imagenet512_uvit_huge/imagenet512_uvit_huge.pth /mnt/workspace/U-ViT
 
z_size = image_size // 8
patch_size = 2 if image_size == 256 else 4
device = 'cuda' if torch.cuda.is_available() else 'cpu'

nnet = UViT(img_size=z_size,
       patch_size=patch_size,
       in_chans=4,
       embed_dim=1152,
       depth=28,
       num_heads=16,
       num_classes=1001,
       conv=False)

nnet.to(device)
nnet.load_state_dict(torch.load(f'imagenet{image_size}_uvit_huge.pth', map_location='cpu'))
nnet.eval()
\`\`\`

\`\`\`python
model_file_download(model_id='AI-ModelScope/autoencoder_kl_ema',file_path='autoencoder_kl_ema.pth', cache_dir='/mnt/workspace')
!mv /mnt/workspace/AI-ModelScope/autoencoder_kl_ema/autoencoder_kl_ema.pth /mnt/workspace/U-ViT
autoencoder = libs.autoencoder.get_model('autoencoder_kl_ema.pth')
autoencoder.to(device)
\`\`\`

\`\`\`python
seed = 4321 #@param {type:"number"}
steps = 25 #@param {type:"slider", min:0, max:1000, step:1}
cfg_scale = 3 #@param {type:"slider", min:0, max:10, step:0.1}
class_labels = 207, 360, 387, 974, 88, 979, 417, 279 #@param {type:"raw"}
samples_per_row = 4 #@param {type:"number"}
torch.manual_seed(seed)

def stable_diffusion_beta_schedule(linear_start=0.00085, linear_end=0.0120, n_timestep=1000):
    _betas = (
        torch.linspace(linear_start ** 0.5, linear_end ** 0.5, n_timestep, dtype=torch.float64) ** 2
    )
    return _betas.numpy()


_betas = stable_diffusion_beta_schedule()  # set the noise schedule
noise_schedule = NoiseScheduleVP(schedule='discrete', betas=torch.tensor(_betas, device=device).float())


y = torch.tensor(class_labels, device=device)
y = einops.repeat(y, 'B -> (B N)', N=samples_per_row)

def model_fn(x, t_continuous):
    t = t_continuous * len(_betas)
    _cond = nnet(x, t, y=y)
    _uncond = nnet(x, t, y=torch.tensor([1000] * x.size(0), device=device))
    return _cond + cfg_scale * (_cond - _uncond)  # classifier free guidance


z_init = torch.randn(len(y), 4, z_size, z_size, device=device)
dpm_solver = DPM_Solver(model_fn, noise_schedule, predict_x0=True, thresholding=False)

with torch.no_grad():
  with torch.cuda.amp.autocast():  # inference with mixed precision
    z = dpm_solver.sample(z_init, steps=steps, eps=1. / len(_betas), T=1.)
    samples = autoencoder.decode(z)
samples = 0.5 * (samples + 1.)
samples.clamp_(0., 1.)
save_image(samples, "sample.png", nrow=samples_per_row * 2, padding=0)
samples = Image.open("sample.png")
display(samples)
\`\`\``
    },
    {
      id: 'nb-aigc-vit-bestpractice',
      title: 'ViT 图像分类最佳实践',
      file: 'AIGC-tutorial/notebook/ViT-BestPractice.ipynb',
      difficulty: '中级',
      duration: '0.5h',
      week: 4,
      phase: 4,
      keywords: ["ViT", "Patch", "位置编码"],
      content: `## 什么是ViT
Vision Transformer (ViT) 模型由 Alexey Dosovitskiy等人在 An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale 中提出。这是第一篇在 ImageNet 上成功训练 Transformer 编码器的论文，与熟悉的卷积架构相比，取得了非常好的结果。论文提出，虽然 Transformer 架构已成为自然语言处理任务事实上的标准，但其在计算机视觉中的应用仍然有限。 在视觉中，attention要么与卷积网络结合应用，要么用于替换卷积网络的某些组件，同时保持其整体结构不变。 ViT证明这种对 CNN 的依赖是不必要的，直接应用于图像块序列（patches）的纯 Transformer 可以在图像分类任务上表现良好。 当对大量数据进行预训练并转移到多个中型或小型图像识别基准（ImageNet、CIFAR-100、VTAB 等）时，Vision Transformer (ViT) 与SOTA的CNN相比取得了优异的结果，同时需要更少的计算资源来训练，Vision Transformer (ViT) 基本上是 Transformers，但应用于图像。
每个图像被分割成一系列不重叠的块（分辨率如 16x16 或 32x32），并线性embedding，接下来，添加position embedding，并通过编码器层发送。 在开头添加 [CLS] 标记以获得整个图像的表示。 可以在最终隐藏状态之上添加线性分类头以对图像进行分类。
![image.png](AIGC-tutorial/notebook/attachment:0c980282-7f20-4b16-8c7d-f04d3a2c2a49.png)

## load 模型
从modelscope社区下载模型，然后加载模型到GPU上。

这段输出是关于一个基于Vision Transformer(ViT)的模型结构的详细描述，该模型被设计用于图像分类任务。具体来说，这是Hugging Face Transformers库中\`ViTForImageClassification\`类的一个实例化对象的结构。下面是对各部分组件的解析：

1. \`ViTForImageClassification\`: 这是整个模型的顶层容器，包含了一个ViT模型和一个分类器层。

2. \`(vit)\`: 表示ViT模型的核心部分，它由嵌入层、编码器等组成。

   - \`(embeddings)\`: ViTEmbeddings模块，负责将输入图像转换为可以输入Transformer的序列形式。
     - \`(patch_embeddings)\`: ViTPatchEmbeddings模块，通过卷积操作将原始RGB图像分割成固定大小的patches，并将其映射到一个向量空间中，得到patch embeddings。
       - \`(projection)\`: 使用一个卷积层（Conv2d），将每个16x16像素的patch从3通道特征映射到768维向量。

   - \`(dropout)\`: 在嵌入层后添加了Dropout层，以防止过拟合。

   - \`(encoder)\`: ViTEncoder模块，包含了多层Transformer编码器层。
     - \`(layer)\`: 一个ModuleList，其中包含12个相同的ViTLayer结构（即12层Transformer）。
       - 每个\`ViTLayer\`包括：
         - \`(attention)\`: ViTAttention模块，包含自注意力机制。
           - \`(attention)\`: ViTSelfAttention模块，实现自注意力操作，内部有三个线性层分别计算query、key和value。
           - \`(output)\`: ViTSelfOutput模块，包含一个线性层和一个Dropout层，用于处理自注意力后的结果。

         - \`(intermediate)\`: ViTIntermediate模块，包含一个线性层和GELU激活函数，用于进行中间特征变换。

         - \`(output)\`: ViTOutput模块，与自注意力模块类似，也是一个带有线性层和Dropout层的结构，用于对经过中间层处理的特征进行进一步处理。

         - \`(layernorm_before)\` 和 \`(layernorm_after)\`: 分别在每个Transformer层的前后添加LayerNorm层，用于归一化输入和输出特征。

3. \`(layernorm)\`: 在ViT模型的最后添加了一个LayerNorm层，对整个编码器的输出进行归一化。

4. \`(classifier)\`: 最后是一个全连接层（Linear层），将ViT模型提取出的768维特征映射到指定数量的类别上（在这个例子中是1000个类别）。这个层用于最终的图像分类任务。

\`\`\`python
from transformers import ViTForImageClassification
import torch
from modelscope import snapshot_download

model_dir = snapshot_download('AI-ModelScope/vit-base-patch16-224')

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

model = ViTForImageClassification.from_pretrained(model_dir)
model.to(device)
\`\`\`

加载图片

\`\`\`python
from PIL import Image
import requests

url = 'http://images.cocodataset.org/val2017/000000039769.jpg'
image = Image.open(requests.get(url, stream=True).raw)
image
\`\`\`

常规图像预处理，接受 224x224 的输入分辨率。 使用图像处理器调整大小和标准化。

\`\`\`python
from transformers import ViTImageProcessor

processor = ViTImageProcessor.from_pretrained(model_dir)
inputs = processor(images=image, return_tensors="pt").to(device)
pixel_values = inputs.pixel_values
\`\`\`

\`\`\`python
print(pixel_values.shape)
\`\`\`

通过 ViT 模型发送图像，该模型由一个类似 BERT 的编码器和一个位于 [CLS] 令牌的最后一个隐藏状态之上的线性分类头组成。

\`\`\`python
import torch

with torch.no_grad():
  outputs = model(pixel_values)
logits = outputs.logits
logits.shape
\`\`\`

\`\`\`python
prediction = logits.argmax(-1)
print("Predicted class:", model.config.id2label[prediction.item()])
\`\`\``
    },
    {
      id: 'nb-aigc-vivit-bestpractice',
      title: 'ViViT 视频分类最佳实践',
      file: 'AIGC-tutorial/notebook/ViViT-BestPractice.ipynb',
      difficulty: '中级',
      duration: '1h',
      week: 4,
      phase: 4,
      keywords: ["ViViT", "视频分类", "Tubelet"],
      content: `## 引言

视频是由一系列图像组成的。假设你已经拥有一个图像表示模型（如卷积神经网络CNNs、视觉转换器ViTs等）和一个序列模型（如循环神经网络RNNs、长短期记忆网络LSTMs等）。我们请你对这些模型进行调整以实现视频分类任务。直觉上，你会先将图像模型应用于单个帧，然后使用序列模型学习图像表示的顺序。在学习到的序列表示上应用一个分类头部便完成了视频分类模型。[使用CNN-RNN架构进行视频分类](https://keras.io/examples/vision/video_classification/)详细解释了这一方法。更进一步，你还可以构建一种混合式Transformer-based模型来实现视频分类，如[使用Transformers进行视频分类](https://keras.io/examples/vision/video_transformers/)所示。

本示例简要实现了Arnab等人提出的[ViViT：视频视觉转换器](https://arxiv.org/abs/2103.15691)。作者提出了一种基于纯Transformer的模型用于视频分类任务。作者创新性地提出了一个嵌入方案，并为处理视频剪辑设计了许多Transformer变体。在这个示例中，我们将实现该嵌入方案以及其中一个简化版的Transformer架构。

本示例需要TensorFlow 2.6或更高版本，先预装环境。

\`\`\`python
!pip install ipywidgets
\`\`\`

\`\`\`python
!pip install -qq medmnist
\`\`\`

## 导入依赖（Imports）

> *Original: Imports*

\`\`\`python
import os
import io
import imageio
import medmnist
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

# setting seed for reproducibility
SEED = 42
os.environ["TF_CUDNN_DETERMINISTIC"] = "1"
keras.utils.set_random_seed(SEED)
\`\`\`

## 超参数

本例中的超参数是基于特定的超参数搜索选定的。有关这一内容的更多信息可在结论部分找到。

\`\`\`python
# DATA
DATASET_NAME = "organmnist3d"
BATCH_SIZE = 32
AUTO = tf.data.AUTOTUNE
INPUT_SHAPE = (28, 28, 28, 1)
NUM_CLASSES = 11

# OPTIMIZER
LEARNING_RATE = 1e-4
WEIGHT_DECAY = 1e-5

# TRAINING
EPOCHS = 60

# TUBELET EMBEDDING
PATCH_SIZE = (8, 8, 8)
NUM_PATCHES = (INPUT_SHAPE[0] // PATCH_SIZE[0]) ** 2

# ViViT ARCHITECTURE
LAYER_NORM_EPS = 1e-6
PROJECTION_DIM = 128
NUM_HEADS = 8
NUM_LAYERS = 8
\`\`\`

## 数据集

在本示例中，我们使用的数据集是[MedMNIST v2：一个用于二维和三维生物医学图像分类的大规模轻量级基准](https://medmnist.com/)。该数据集中的视频文件体积小且易于训练。

\`\`\`python
!wget https://modelscope.oss-cn-beijing.aliyuncs.com/resource/organmnist3d.npz
\`\`\`

\`\`\`python
def download_and_prepare_dataset(data_info: dict):
    """
    Utility function to download the dataset and return train/valid/test
    videos and labels.
    Arguments:
        data_info (dict): Dataset metadata
    """
    data_path = "/mnt/workspace/organmnist3d.npz"

    with np.load(data_path) as data:
        # Get videos
        train_videos = data["train_images"]
        valid_videos = data["val_images"]
        test_videos = data["test_images"]

        # Get labels
        train_labels = data["train_labels"].flatten()
        valid_labels = data["val_labels"].flatten()
        test_labels = data["test_labels"].flatten()

    return (
        (train_videos, train_labels),
        (valid_videos, valid_labels),
        (test_videos, test_labels),
    )


# Get the metadata of the dataset
info = medmnist.INFO[DATASET_NAME]

# Get the dataset
prepared_dataset = download_and_prepare_dataset(info)
(train_videos, train_labels) = prepared_dataset[0]
(valid_videos, valid_labels) = prepared_dataset[1]
(test_videos, test_labels) = prepared_dataset[2]
\`\`\`

### \`tf.data\` 数据管线

> *Original: \`tf.data\` pipeline*

\`\`\`python
@tf.function
def preprocess(frames: tf.Tensor, label: tf.Tensor):
    """Preprocess the frames tensors and parse the labels"""
    # Preprocess images
    frames = tf.image.convert_image_dtype(
        frames[
            ..., tf.newaxis
        ],  # The new axis is to help for further processing with Conv3D layers
        tf.float32,
    )

    # Parse label
    label = tf.cast(label, tf.float32)
    return frames, label


def prepare_dataloader(
    videos: np.ndarray,
    labels: np.ndarray,
    loader_type: str = "train",
    batch_size: int = BATCH_SIZE,
):
    """Utility function to prepare dataloader"""
    dataset = tf.data.Dataset.from_tensor_slices((videos, labels))

    if loader_type == "train":
        dataset = dataset.shuffle(BATCH_SIZE * 2)

    dataloader = (
        dataset.map(preprocess, num_parallel_calls=tf.data.AUTOTUNE)
        .batch(batch_size)
        .prefetch(tf.data.AUTOTUNE)
    )

    return dataloader


trainloader = prepare_dataloader(train_videos, train_labels, "train")
validloader = prepare_dataloader(valid_videos, valid_labels, "valid")
testloader = prepare_dataloader(test_videos, test_labels, "test")
\`\`\`

## Tubelet 嵌入（Tubelet Embedding）

> *Original: Tubelet Embedding*

在ViTs（视觉转换器）中，一幅图像会被划分为多个patch，随后进行空间维度上的展平并投影作为token化方案。对于视频，可以对单个帧重复这一过程。正如作者所建议的，**均匀帧采样**是一种token化方案，即从视频片段中抽样出帧，然后执行简单的ViT token化操作。

![](https://i.imgur.com/aaPyLPX.png)
（图：均匀帧采样 [来源](https://arxiv.org/abs/2103.15691)）

而**Tubelet Embedding**则在捕捉时间信息方面有所不同。从视频中，我们提取出包含多个连续帧的体积。这些体积不仅包含了帧的patch，还包含了时间信息。接着，将这些体积进行展平和投影，以便构建视频tokens。

![](https://i.imgur.com/9G7QTfV.png)
（图：Tubelet Embedding [来源](https://arxiv.org/abs/2103.15691)）

\`\`\`python
class TubeletEmbedding(layers.Layer):
    def __init__(self, embed_dim, patch_size, **kwargs):
        super().__init__(**kwargs)
        self.projection = layers.Conv3D(
            filters=embed_dim,
            kernel_size=patch_size,
            strides=patch_size,
            padding="VALID",
        )
        self.flatten = layers.Reshape(target_shape=(-1, embed_dim))

    def call(self, videos):
        projected_patches = self.projection(videos)
        flattened_patches = self.flatten(projected_patches)
        return flattened_patches
\`\`\`

## 位置嵌入（Positional Embedding）

> *Original: Positional Embedding*

这一层会向编码后的视频tokens添加position embedding。

\`\`\`python
class PositionalEncoder(layers.Layer):
    def __init__(self, embed_dim, **kwargs):
        super().__init__(**kwargs)
        self.embed_dim = embed_dim

    def build(self, input_shape):
        _, num_tokens, _ = input_shape
        self.position_embedding = layers.Embedding(
            input_dim=num_tokens, output_dim=self.embed_dim
        )
        self.positions = tf.range(start=0, limit=num_tokens, delta=1)

    def call(self, encoded_tokens):
        # Encode the positions and add it to the encoded tokens
        encoded_positions = self.position_embedding(self.positions)
        encoded_tokens = encoded_tokens + encoded_positions
        return encoded_tokens
\`\`\`

## 视频视觉 Transformer（Video Vision Transformer）

> *Original: Video Vision Transformer*

作者提出了四种Video Vision Transformer的方式：

- 空间-时间注意力机制
- 因子分解编码器
- 因子分解自我注意力机制
- 因子分解点积注意力机制

在这个示例中，为了简化起见，我们将实现 **空间-时间注意力机制** 模型。以下代码片段大量借鉴自 [使用Video Vision Transformer进行图像分类](https://keras.io/examples/vision/image_classification_with_vision_transformer/)。

\`\`\`python
def create_vivit_classifier(
    tubelet_embedder,
    positional_encoder,
    input_shape=INPUT_SHAPE,
    transformer_layers=NUM_LAYERS,
    num_heads=NUM_HEADS,
    embed_dim=PROJECTION_DIM,
    layer_norm_eps=LAYER_NORM_EPS,
    num_classes=NUM_CLASSES,
):

    # Get the input layer
    inputs = layers.Input(shape=input_shape)
    # Create patches.
    patches = tubelet_embedder(inputs)
    # Encode patches.
    encoded_patches = positional_encoder(patches)

    # Create multiple layers of the Transformer block.
    for _ in range(transformer_layers):
        # Layer normalization and MHSA
        x1 = layers.LayerNormalization(epsilon=1e-6)(encoded_patches)
        attention_output = layers.MultiHeadAttention(
            num_heads=num_heads, key_dim=embed_dim // num_heads, dropout=0.1
        )(x1, x1)

        # Skip connection
        x2 = layers.Add()([attention_output, encoded_patches])

        # Layer Normalization and MLP
        x3 = layers.LayerNormalization(epsilon=1e-6)(x2)
        x3 = keras.Sequential(
            [
                layers.Dense(units=embed_dim * 4, activation=tf.nn.gelu),
                layers.Dense(units=embed_dim, activation=tf.nn.gelu),
            ]
        )(x3)

        # Skip connection
        encoded_patches = layers.Add()([x3, x2])

    # Layer normalization and Global average pooling.
    representation = layers.LayerNormalization(epsilon=layer_norm_eps)(encoded_patches)
    representation = layers.GlobalAvgPool1D()(representation)

    # Classify outputs.
    outputs = layers.Dense(units=num_classes, activation="softmax")(representation)

    # Create the Keras model.
    model = keras.Model(inputs=inputs, outputs=outputs)
    return model
\`\`\`

## 训练（Train）

> *Original: Train*

\`\`\`python
def run_experiment():
    # Initialize model
    model = create_vivit_classifier(
        tubelet_embedder=TubeletEmbedding(
            embed_dim=PROJECTION_DIM, patch_size=PATCH_SIZE
        ),
        positional_encoder=PositionalEncoder(embed_dim=PROJECTION_DIM),
    )

    # Compile the model with the optimizer, loss function
    # and the metrics.
    optimizer = keras.optimizers.Adam(learning_rate=LEARNING_RATE)
    model.compile(
        optimizer=optimizer,
        loss="sparse_categorical_crossentropy",
        metrics=[
            keras.metrics.SparseCategoricalAccuracy(name="accuracy"),
            keras.metrics.SparseTopKCategoricalAccuracy(5, name="top-5-accuracy"),
        ],
    )

    # Train the model.
    _ = model.fit(trainloader, epochs=EPOCHS, validation_data=validloader)

    _, accuracy, top_5_accuracy = model.evaluate(testloader)
    print(f"Test accuracy: {round(accuracy * 100, 2)}%")
    print(f"Test top 5 accuracy: {round(top_5_accuracy * 100, 2)}%")

    return model
\`\`\`

\`\`\`python
model = run_experiment()
\`\`\`

## 推理（Inference）

> *Original: Inference*

\`\`\`python
import ipywidgets
NUM_SAMPLES_VIZ = 25
testsamples, labels = next(iter(testloader))
testsamples, labels = testsamples[:NUM_SAMPLES_VIZ], labels[:NUM_SAMPLES_VIZ]

ground_truths = []
preds = []
videos = []


for i, (testsample, label) in enumerate(zip(testsamples, labels)):
    # Generate gif
    with io.BytesIO() as gif:
        imageio.mimsave(gif, (testsample.numpy() * 255).astype("uint8")[..., 0], "GIF", fps=5)
        videos.append(gif.getvalue())

    # Get model prediction
    output = model.predict(tf.expand_dims(testsample, axis=0))[0]
    pred = np.argmax(output, axis=0)

    ground_truths.append(label.numpy().astype("int"))
    preds.append(pred)


def make_box_for_grid(image_widget, fit):
    """
    Make a VBox to hold caption/image for demonstrating
    option_fit values.
    Source: https://ipywidgets.readthedocs.io/en/latest/examples/Widget%20Styling.html
    """
    # Make the caption
    if fit is not None:
        fit_str = "'{}'".format(fit)
    else:
        fit_str = str(fit)

    h = ipywidgets.HTML(value="" + str(fit_str) + "")

    # Make the green box with the image widget inside it
    boxb = ipywidgets.widgets.Box()
    boxb.children = [image_widget]

    # Compose into a vertical box
    vb = ipywidgets.widgets.VBox()
    vb.layout.align_items = "center"
    vb.children = [h, boxb]
    return vb


boxes = []
for i in range(NUM_SAMPLES_VIZ):
    ib = ipywidgets.widgets.Image(value=videos[i], width=100, height=100)
    true_class = info["label"][str(ground_truths[i])]
    pred_class = info["label"][str(preds[i])]
    caption = f"T: {true_class} | P: {pred_class}"

    boxes.append(make_box_for_grid(ib, caption))

ipywidgets.widgets.GridBox(
    boxes, layout=ipywidgets.widgets.Layout(grid_template_columns="repeat(5, 200px)")
)
\`\`\`

## 最后总结

通过基本实现，我们在测试数据集上达到了约79%-80%的Top-1准确率。

有待改进之处：

- 使用数据增强技术。
- 在训练过程中采用更好的正则化方案。
- 应用不同的Transformer模型变体。

本教程中使用的超参数是通过使用[W&B Sweeps](https://docs.wandb.ai/guides/sweeps)进行了超参数搜索后确定的。你可以在这里查看我们的搜索结果[链接](https://wandb.ai/minimal-implementations/vivit/sweeps/66fp0lhz)，并在這裡[链接](https://wandb.ai/minimal-implementations/vivit/reports/Hyperparameter-Tuning-Analysis--VmlldzoxNDEwNzcx)找到我们对结果的快速分析。

我们非常感谢[Weights and Biases](https://wandb.ai/site)项目提供的GPU计算资源支持。`
    },
    {
      id: 'nb-aigc-vivit-demo',
      title: 'ViViT 视频分类(英文版)',
      file: 'AIGC-tutorial/notebook/ViViT-demo.ipynb',
      difficulty: '中级',
      duration: '1h',
      week: 0,
      phase: 0,
      keywords: ["ViViT", "Video", "Classification"],
      content: `## 引言（Introduction）

视频可以看作是一连串图像组成的序列。假设你手边已经有一个图像表征模型（CNN、ViT 等）和一个序列模型（RNN、LSTM 等），现在希望把它们改造成用于视频分类的模型。最直接的思路是：先用图像模型独立处理每一帧，再用序列模型学习这些帧表征之间的时序关系，最后接上分类头即可完成视频分类。[Video Classification with a CNN-RNN Architecture](https://keras.io/examples/vision/video_classification/) 中对这种做法有详细介绍。更进一步，也可以构建基于 Transformer 的混合模型用于视频分类，参考 [Video Classification with Transformers](https://keras.io/examples/vision/video_transformers/)。

在本示例中，我们将以最小化的方式实现 Arnab 等人提出的 [ViViT：视频视觉 Transformer](https://arxiv.org/abs/2103.15691)。作者提出了一种**纯 Transformer**结构的视频分类模型，并给出了一种新颖的视频嵌入方案以及多种 Transformer 变体。出于简洁起见，我们只实现该嵌入方案以及其中一种 Transformer 变体。

本示例需要 TensorFlow 2.6 或更高版本，medmnist 可以通过下方代码单元安装。

> *Original: Introduction*
>
> *Videos are a sequence of images. Let's assume you have an image representation model (CNNs, ViTs, etc.) and a sequence model (RNNs, LSTMs, etc.) at hand. We ask you to tweak the models for video classification. The immediate thought would be to apply the image model to individual frames, then use the sequence model to learn the order of the image representation. Applying a classification head on the learned sequence representation completes the video classification model.*
>
> *In this example, we minimally implement ViViT: A Video Vision Transformer by Arnab et al. The authors propose a pure-transformer based model for video classification. We implement the embedding scheme and one of the variants of the transformer architecture for simplicity.*
>
> *This example requires TensorFlow 2.6 or higher, and the medmnist python package can be installed by running the code cell below.*

\`\`\`python
!pip install ipywidgets
\`\`\`

\`\`\`python
!pip install -qq medmnist
\`\`\`

## 导入依赖（Imports）

> *Original: Imports*

\`\`\`python
import os
import io
import imageio
import medmnist
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

# setting seed for reproducibility
SEED = 42
os.environ["TF_CUDNN_DETERMINISTIC"] = "1"
keras.utils.set_random_seed(SEED)
\`\`\`

## 超参数（Hyperparameters）

下面这些超参数是通过一轮超参数搜索后选定的。更多细节可以在“结语”一节中找到。

> *Original: Hyperparameters*
>
> *The hyperparameters are chosen specifically based on a hyperparameter search. You can find more on this in the Conclusion section.*

\`\`\`python
# DATA
DATASET_NAME = "organmnist3d"
BATCH_SIZE = 32
AUTO = tf.data.AUTOTUNE
INPUT_SHAPE = (28, 28, 28, 1)
NUM_CLASSES = 11

# OPTIMIZER
LEARNING_RATE = 1e-4
WEIGHT_DECAY = 1e-5

# TRAINING
EPOCHS = 60

# TUBELET EMBEDDING
PATCH_SIZE = (8, 8, 8)
NUM_PATCHES = (INPUT_SHAPE[0] // PATCH_SIZE[0]) ** 2

# ViViT ARCHITECTURE
LAYER_NORM_EPS = 1e-6
PROJECTION_DIM = 128
NUM_HEADS = 8
NUM_LAYERS = 8
\`\`\`

## 数据集（Dataset）

本示例使用 [MedMNIST v2：面向二维和三维生物医学图像分类的大规模轻量级基准](https://medmnist.com/) 数据集。其视频体量小、训练成本低。

> *Original: Dataset*
>
> *For our example we use the MedMNIST v2: A Large-Scale Lightweight Benchmark for 2D and 3D Biomedical Image Classification dataset. The videos are lightweight and easy to train on.*

\`\`\`python
!wget https://modelscope.oss-cn-beijing.aliyuncs.com/resource/organmnist3d.npz
\`\`\`

\`\`\`python
def download_and_prepare_dataset(data_info: dict):
    """
    Utility function to download the dataset and return train/valid/test
    videos and labels.
    Arguments:
        data_info (dict): Dataset metadata
    """
    data_path = "/mnt/workspace/organmnist3d.npz"

    with np.load(data_path) as data:
        # Get videos
        train_videos = data["train_images"]
        valid_videos = data["val_images"]
        test_videos = data["test_images"]

        # Get labels
        train_labels = data["train_labels"].flatten()
        valid_labels = data["val_labels"].flatten()
        test_labels = data["test_labels"].flatten()

    return (
        (train_videos, train_labels),
        (valid_videos, valid_labels),
        (test_videos, test_labels),
    )


# Get the metadata of the dataset
info = medmnist.INFO[DATASET_NAME]

# Get the dataset
prepared_dataset = download_and_prepare_dataset(info)
(train_videos, train_labels) = prepared_dataset[0]
(valid_videos, valid_labels) = prepared_dataset[1]
(test_videos, test_labels) = prepared_dataset[2]
\`\`\`

### \`tf.data\` 数据管线

> *Original: \`tf.data\` pipeline*

\`\`\`python
@tf.function
def preprocess(frames: tf.Tensor, label: tf.Tensor):
    """Preprocess the frames tensors and parse the labels"""
    # Preprocess images
    frames = tf.image.convert_image_dtype(
        frames[
            ..., tf.newaxis
        ],  # The new axis is to help for further processing with Conv3D layers
        tf.float32,
    )

    # Parse label
    label = tf.cast(label, tf.float32)
    return frames, label


def prepare_dataloader(
    videos: np.ndarray,
    labels: np.ndarray,
    loader_type: str = "train",
    batch_size: int = BATCH_SIZE,
):
    """Utility function to prepare dataloader"""
    dataset = tf.data.Dataset.from_tensor_slices((videos, labels))

    if loader_type == "train":
        dataset = dataset.shuffle(BATCH_SIZE * 2)

    dataloader = (
        dataset.map(preprocess, num_parallel_calls=tf.data.AUTOTUNE)
        .batch(batch_size)
        .prefetch(tf.data.AUTOTUNE)
    )

    return dataloader


trainloader = prepare_dataloader(train_videos, train_labels, "train")
validloader = prepare_dataloader(valid_videos, valid_labels, "valid")
testloader = prepare_dataloader(test_videos, test_labels, "test")
\`\`\`

## Tubelet 嵌入（Tubelet Embedding）

在 ViT 中，图像会被切分为若干 patch，然后在空间维度展平并投影到 token 序列。对视频而言，可以对每一帧重复这一过程。作者提出的**均匀帧采样（Uniform frame sampling）**就是这样一种 token 化方案：从视频片段中均匀抽取若干帧，然后对每帧做普通的 ViT token 化。

| ![uniform frame sampling](https://i.imgur.com/aaPyLPX.png) |
| :--: |
| 均匀帧采样 [来源](https://arxiv.org/abs/2103.15691) |

**Tubelet Embedding** 在捕获时序信息方面则不同。我们直接从视频中抽取 volume（时空小立方体），这些 volume 同时包含帧的 patch 信息和时间维度信息，再将它们展平并投影即可得到视频 token。

| ![tubelet embedding](https://i.imgur.com/9G7QTfV.png) |
| :--: |
| Tubelet Embedding [来源](https://arxiv.org/abs/2103.15691) |

> *Original: Tubelet Embedding*
>
> *In ViTs an image is divided into patches which is then spatially flattened and projected as a tokenization scheme. For a video one can repeat this process for individual frames. Uniform frame sampling as suggested by the authors is a tokenization scheme in which we sample frames from the video clip and perform simple ViT tokenization.*
>
> *Tubelet Embedding is different in terms of capturing the temporal information. From the video we extract volumes. These volumes contain patches of the frame and the temporal information as well. The volumes are then flattened and projected to build video tokens.*

\`\`\`python
class TubeletEmbedding(layers.Layer):
    def __init__(self, embed_dim, patch_size, **kwargs):
        super().__init__(**kwargs)
        self.projection = layers.Conv3D(
            filters=embed_dim,
            kernel_size=patch_size,
            strides=patch_size,
            padding="VALID",
        )
        self.flatten = layers.Reshape(target_shape=(-1, embed_dim))

    def call(self, videos):
        projected_patches = self.projection(videos)
        flattened_patches = self.flatten(projected_patches)
        return flattened_patches
\`\`\`

## 位置嵌入（Positional Embedding）

这一层负责给编码后的视频 token 注入位置信息。

> *Original: Positional Embedding*
>
> *This layer adds positional information to encoded video tokens.*

\`\`\`python
class PositionalEncoder(layers.Layer):
    def __init__(self, embed_dim, **kwargs):
        super().__init__(**kwargs)
        self.embed_dim = embed_dim

    def build(self, input_shape):
        _, num_tokens, _ = input_shape
        self.position_embedding = layers.Embedding(
            input_dim=num_tokens, output_dim=self.embed_dim
        )
        self.positions = tf.range(start=0, limit=num_tokens, delta=1)

    def call(self, encoded_tokens):
        # Encode the positions and add it to the encoded tokens
        encoded_positions = self.position_embedding(self.positions)
        encoded_tokens = encoded_tokens + encoded_positions
        return encoded_tokens
\`\`\`

## 视频视觉 Transformer（Video Vision Transformer）

原论文作者提出了 4 种 ViT 变体：

- 时空注意力（Spatio-temporal attention）
- 因式分解编码器（Factorised encoder）
- 因式分解自注意力（Factorised self-attention）
- 因式分解点积注意力（Factorised dot-product attention）

为简化起见，本示例实现的是 **时空注意力** 模型。下面的代码大量借鉴了 [Image classification with Vision Transformer](https://keras.io/examples/vision/image_classification_with_vision_transformer/)。

> *Original: Video Vision Transformer*
>
> *The authors suggest 4 variants of Vision Transformer: Spatio-temporal attention, Factorised encoder, Factorised self-attention, Factorised dot-product attention. In this example, we will implement the Spatio-temporal attention model for simplicity. The following code snippet is heavily inspired from Image classification with Vision Transformer.*

\`\`\`python
def create_vivit_classifier(
    tubelet_embedder,
    positional_encoder,
    input_shape=INPUT_SHAPE,
    transformer_layers=NUM_LAYERS,
    num_heads=NUM_HEADS,
    embed_dim=PROJECTION_DIM,
    layer_norm_eps=LAYER_NORM_EPS,
    num_classes=NUM_CLASSES,
):

    # Get the input layer
    inputs = layers.Input(shape=input_shape)
    # Create patches.
    patches = tubelet_embedder(inputs)
    # Encode patches.
    encoded_patches = positional_encoder(patches)

    # Create multiple layers of the Transformer block.
    for _ in range(transformer_layers):
        # Layer normalization and MHSA
        x1 = layers.LayerNormalization(epsilon=1e-6)(encoded_patches)
        attention_output = layers.MultiHeadAttention(
            num_heads=num_heads, key_dim=embed_dim // num_heads, dropout=0.1
        )(x1, x1)

        # Skip connection
        x2 = layers.Add()([attention_output, encoded_patches])

        # Layer Normalization and MLP
        x3 = layers.LayerNormalization(epsilon=1e-6)(x2)
        x3 = keras.Sequential(
            [
                layers.Dense(units=embed_dim * 4, activation=tf.nn.gelu),
                layers.Dense(units=embed_dim, activation=tf.nn.gelu),
            ]
        )(x3)

        # Skip connection
        encoded_patches = layers.Add()([x3, x2])

    # Layer normalization and Global average pooling.
    representation = layers.LayerNormalization(epsilon=layer_norm_eps)(encoded_patches)
    representation = layers.GlobalAvgPool1D()(representation)

    # Classify outputs.
    outputs = layers.Dense(units=num_classes, activation="softmax")(representation)

    # Create the Keras model.
    model = keras.Model(inputs=inputs, outputs=outputs)
    return model
\`\`\`

## 训练（Train）

> *Original: Train*

\`\`\`python
def run_experiment():
    # Initialize model
    model = create_vivit_classifier(
        tubelet_embedder=TubeletEmbedding(
            embed_dim=PROJECTION_DIM, patch_size=PATCH_SIZE
        ),
        positional_encoder=PositionalEncoder(embed_dim=PROJECTION_DIM),
    )

    # Compile the model with the optimizer, loss function
    # and the metrics.
    optimizer = keras.optimizers.Adam(learning_rate=LEARNING_RATE)
    model.compile(
        optimizer=optimizer,
        loss="sparse_categorical_crossentropy",
        metrics=[
            keras.metrics.SparseCategoricalAccuracy(name="accuracy"),
            keras.metrics.SparseTopKCategoricalAccuracy(5, name="top-5-accuracy"),
        ],
    )

    # Train the model.
    _ = model.fit(trainloader, epochs=EPOCHS, validation_data=validloader)

    _, accuracy, top_5_accuracy = model.evaluate(testloader)
    print(f"Test accuracy: {round(accuracy * 100, 2)}%")
    print(f"Test top 5 accuracy: {round(top_5_accuracy * 100, 2)}%")

    return model
\`\`\`

\`\`\`python
model = run_experiment()
\`\`\`

## 推理（Inference）

> *Original: Inference*

\`\`\`python
import ipywidgets
NUM_SAMPLES_VIZ = 25
testsamples, labels = next(iter(testloader))
testsamples, labels = testsamples[:NUM_SAMPLES_VIZ], labels[:NUM_SAMPLES_VIZ]

ground_truths = []
preds = []
videos = []


for i, (testsample, label) in enumerate(zip(testsamples, labels)):
    # Generate gif
    with io.BytesIO() as gif:
        imageio.mimsave(gif, (testsample.numpy() * 255).astype("uint8")[..., 0], "GIF", fps=5)
        videos.append(gif.getvalue())

    # Get model prediction
    output = model.predict(tf.expand_dims(testsample, axis=0))[0]
    pred = np.argmax(output, axis=0)

    ground_truths.append(label.numpy().astype("int"))
    preds.append(pred)


def make_box_for_grid(image_widget, fit):
    """
    Make a VBox to hold caption/image for demonstrating
    option_fit values.
    Source: https://ipywidgets.readthedocs.io/en/latest/examples/Widget%20Styling.html
    """
    # Make the caption
    if fit is not None:
        fit_str = "'{}'".format(fit)
    else:
        fit_str = str(fit)

    h = ipywidgets.HTML(value="" + str(fit_str) + "")

    # Make the green box with the image widget inside it
    boxb = ipywidgets.widgets.Box()
    boxb.children = [image_widget]

    # Compose into a vertical box
    vb = ipywidgets.widgets.VBox()
    vb.layout.align_items = "center"
    vb.children = [h, boxb]
    return vb


boxes = []
for i in range(NUM_SAMPLES_VIZ):
    ib = ipywidgets.widgets.Image(value=videos[i], width=100, height=100)
    true_class = info["label"][str(ground_truths[i])]
    pred_class = info["label"][str(preds[i])]
    caption = f"T: {true_class} | P: {pred_class}"

    boxes.append(make_box_for_grid(ib, caption))

ipywidgets.widgets.GridBox(
    boxes, layout=ipywidgets.widgets.Layout(grid_template_columns="repeat(5, 200px)")
)
\`\`\`

## 总结（Final Thoughts）

仅使用最朴素的实现，我们在测试集上就达到了大约 79%-80% 的 Top-1 准确率。

可改进的方向：

- 引入数据增强（data augmentation）。
- 在训练中使用更好的正则化方案。
- 尝试 Transformer 的其他变体。

本教程使用的超参数是通过 [W&B Sweeps](https://docs.wandb.ai/guides/sweeps) 做超参数搜索后确定的。完整的搜索结果请参见[此处](https://wandb.ai/minimal-implementations/vivit/sweeps/66fp0lhz)，简要分析见[这里](https://wandb.ai/minimal-implementations/vivit/reports/Hyperparameter-Tuning-Analysis--VmlldzoxNDEwNzcx)。

感谢 [Weights and Biases](https://wandb.ai/site) 提供的 GPU 资助。

> *Original: Final Thoughts*
>
> *With a vanilla implementation we achieve ~79-80% Top-1 accuracy on the test dataset.*
>
> *Places to improve: Using data augmentation. Using a better regularization scheme for training. Apply different variants of the transformer model.*
>
> *The hyperparameters used in this tutorial were finalized by running a hyperparameter search using W&B Sweeps. You can find out our sweeps result here and our quick analysis of the results here.*
>
> *We are grateful to Weights and Biases program for helping with GPU credits.*`
    },
    {
      id: 'nb-aigc-latte',
      title: 'Latte 文生视频配置',
      file: 'AIGC-tutorial/notebook/Latte-BestPractice.ipynb',
      difficulty: '中级',
      duration: '0.5h',
      week: 0,
      phase: 0,
      keywords: ["Latte", "文生视频"],
      content: `\`\`\`python
!git clone https://github.com/maxin-cn/Latte.git
%cd Latte
\`\`\`

\`\`\`python
!pip install timm
!pip install einops
!pip install omegaconf
!pip install diffusers==0.24.0
\`\`\`

\`\`\`python
%cd models
!git lfs install
!git clone https://www.modelscope.cn/AI-ModelScope/Latte.git
\`\`\`

修改配置文件configs/t2v/t2v_sample.yaml
# path:
ckpt: ./models/Latte/t2v.pt

save_img_path: "./sample_videos/t2v"

pretrained_model_path: "./models/Latte/t2v_required_models"

\`\`\`python
!export CUDA_VISIBLE_DEVICES=0
!export PYTHONPATH=../
!python sample/sample_t2v.py --config configs/t2v/t2v_sample.yaml
\`\`\``
    },
    {
      id: 'nb-aigc-omnigen',
      title: 'OmniGen 多模态生成演示',
      file: 'AIGC-tutorial/notebook/Omnigen_demo.ipynb',
      difficulty: '中级',
      duration: '0.5h',
      week: 0,
      phase: 0,
      keywords: ["OmniGen", "多模态"],
      content: `\`\`\`python
!git clone https://github.com/modelscope/DiffSynth-Studio.git
%cd DiffSynth-Studio
!pip install -e .
\`\`\`

\`\`\`python
import torch
from diffsynth import ModelManager, OmnigenImagePipeline


model_manager = ModelManager(torch_dtype=torch.bfloat16, model_id_list=["OmniGen-v1"])
pipe = OmnigenImagePipeline.from_model_manager(model_manager)
\`\`\`

\`\`\`python
image_man = pipe(
    prompt="A portrait of a man.",
    cfg_scale=2.5, num_inference_steps=50, seed=0
)
image_man
\`\`\`

\`\`\`python
image_woman = pipe(
    prompt="A portrait of an Asian woman with a white t-shirt.",
    cfg_scale=2.5, num_inference_steps=50, seed=1
)
image_woman
\`\`\`

\`\`\`python
image_merged = pipe(
    prompt="a man and a woman. The man is the man in <img><|image_1|></img>. The woman is the woman in <img><|image_2|></img>.",
    reference_images=[image_man, image_woman],
    cfg_scale=2.5, image_cfg_scale=2.5, num_inference_steps=50, seed=2
)
image_merged
\`\`\``
    },
    {
      id: 'nb-aigc-patch',
      title: '图像Patch提取与可视化',
      file: 'AIGC-tutorial/notebook/patch-BestPractice.ipynb',
      difficulty: '入门',
      duration: '0.5h',
      week: 3,
      phase: 3,
      keywords: ["Patch", "图像预处理"],
      content: `## 图像预处理：
具体步骤如下：

读取图像： 使用 tf.keras.utils.load_img 函数从给定路径 /mnt/workspace/image_1.png 读取图像。设置参数 grayscale=False 表示读取彩色图像，color_mode='rgb' 指定了图像为 RGB 格式。由于 target_size=None，图像将保持原始尺寸不变。interpolation='nearest' 表示在缩放时采用最近邻插值方法。

转换为数组格式： 使用 tf.keras.preprocessing.image.img_to_array 将读取到的 PIL 图像对象转换为 Numpy 数组（在 TensorFlow 中表示为 tensor）。

图像缩放： 判断条件 if (scale)，如果为真，则使用 tf.image.resize 对图像进行缩放到指定大小（即 image_dim）。这里采用了双线性插值方法 (ResizeMethod.BILINEAR) 进行缩放，并且不保留原始宽高比 (preserve_aspect_ratio=False)。

裁剪图像： 使用 tf.image.crop_to_bounding_box 对图像进行裁剪，裁剪区域是从原图的左上角 (0, 0) 开始，裁剪出一个 image_dim x image_dim 大小的正方形图像。

返回处理后的图像： 最终返回经过上述预处理步骤后得到的图像数组（tensor）。

这段代码，能够以统一大小加载并预处理图片，这对于后续将图片输入到深度学习模型中是非常常见的做法。



\`\`\`python
import tensorflow as tf

# Image preprocessing

def read_image(image_file="/mnt/workspace/image_1.png", scale=True, image_dim=336):

    image = tf.keras.utils.load_img(
        image_file, grayscale=False, color_mode='rgb', target_size=None,
        interpolation='nearest'
    )
    image_arr_orig = tf.keras.preprocessing.image.img_to_array(image)
    if(scale):
        image_arr_orig = tf.image.resize(
            image_arr_orig, [image_dim, image_dim],
            method=tf.image.ResizeMethod.BILINEAR, preserve_aspect_ratio=False
        )
    image_arr = tf.image.crop_to_bounding_box(
        image_arr_orig, 0, 0, image_dim, image_dim
    )

    return image_arr


\`\`\`

## 创建Patch
这段代码是使用TensorFlow库来从输入图像中提取32x32大小的图像块（即patch）并将其转化为一维向量。以下是详细的步骤解释：

def create_patches(image): 定义了一个名为create_patches的函数，参数为image图像张量。

im = tf.expand_dims(image, axis=0)：使用TensorFlow的expand_dims函数在图像数据的第0维（batch维度）增加一个维度，以便能够处理一批图片，即使现在我们只有一张图片。

patches = tf.image.extract_patches(...)：调用TensorFlow的extract_patches函数从图像中提取 patches。这里的设置表明：

images=im 表示要提取 patches 的图像。
sizes=[1, 32, 32, 1] 表示每个 patch 的大小为 32x32 像素，并且深度（通道数）与原图相同。
strides=[1, 32, 32, 1] 表示在宽度和高度方向上以32像素为步长移动来提取相邻的 patch。
rates=[1, 1, 1, 1] 表示采样率，在此处等于 strides，意味着没有进行亚像素采样。
padding="VALID" 表示不进行额外的填充，只对完全包含在原始图像内的 patch 进行提取。
patch_dims = patches.shape[-1]：获取提取出的 patches 在最后一个维度（在这里指的是每个 patch 的元素数量，即32*32*C，C为通道数）的大小。

patches = tf.reshape(patches, [1, -1, patch_dims])：将提取到的一系列 patches 进行reshape，将其展平为一个一维数组，其中第一个维度表示 batch 大小（这里为1），第二个维度是所有 patches 的总数量（-1表示自动计算这一维度的大小），第三个维度是每个 patch 的元素数量。

函数最后返回经过处理得到的 patches 张量。

image_arr = read_image()：假设这是一个读取图像并转换为张量的函数，用于获取待处理的图像。

patches = create_patches(image_arr)：调用create_patches函数，传入读取到的图像数据，得到该图像分割后的 patches。

\`\`\`python
# Patching
def create_patches(image):
    im = tf.expand_dims(image, axis=0)
    patches = tf.image.extract_patches(
        images=im,
        sizes=[1, 32, 32, 1],
        strides=[1, 32, 32, 1],
        rates=[1, 1, 1, 1],
        padding="VALID"
    )
    patch_dims = patches.shape[-1]
    patches = tf.reshape(patches, [1, -1, patch_dims])

    return patches

image_arr = read_image()
patches = create_patches(image_arr)
\`\`\`

## 绘制patches
这段代码是使用\`matplotlib\`库在Python中绘制图像及其分块patches的函数定义，并在最后调用了这两个函数来显示结果。它假定您正在处理一个TensorFlow环境，其中\`image_arr\`是一个图像数组（可能已经被转换为浮点数），而\`patches\`是一个形状如\`(batch_size, num_patches, patch_height, patch_width, channels)\`的张量，其中包含了从\`image_arr\`图像中提取出的多个小图像块（patches）。

函数解释：
1. \`render_image_and_patches(image, patches)\`
   - 这个函数首先创建一个新的图形窗口，并设置其大小为16x16英寸。
   - 使用\`suptitle\`添加标题"Cropped Image"，并设置字体大小为48。
   - 使用\`plt.imshow\`显示原始\`image_arr\`图像，将其转换回uint8类型以便正确显示，并关闭坐标轴显示。
   - 计算patches矩阵的行数和列数（假设patch的数量是平方数）。
   - 创建第二个图形窗口同样大小为16x16英寸，添加标题"Image Patches"。
   - 遍历\`patches\`的第一个样本的所有patch，对每个patch进行以下操作：
     - 在网格布局中创建一个新的子图（subplot）。
     - 将该patch reshape为(32, 32, 3)，即尺寸为32x32像素且有3个颜色通道的小图像。
     - 使用\`imshow\`展示这个patch，并关闭坐标轴显示。

2. \`render_flat(patches)\`
   - 这个函数创建一个图形窗口，其宽度为32英寸，高度为2英寸。
   - 添加标题"Flattened Image Patches"，并设置字体大小为24。
   - 同样遍历\`patches\`的第一个样本的所有patch，但这次是在一个水平方向上连续排列的子图中显示它们。
     - 只显示前100个patch（通过if条件判断\`i == 100\`时跳出循环）。
     - 对每个patch重复与上述相同的reshaping和显示过程。

当调用这两个函数时，将会显示两个图表：
- 第一个图表包含原始整幅图像以及从该图像分割出来的patches。
- 第二个图表则展示了patches在一行内水平排列的扁平化视图，最多显示前100个patch。

\`\`\`python
# Drawing
import numpy as np
import matplotlib.pyplot as plt

def render_image_and_patches(image, patches):
    plt.figure(figsize=(16, 16))
    plt.suptitle(f"Cropped Image", size=48)
    plt.imshow(tf.cast(image, tf.uint8))
    plt.axis("off")
    n = int(np.sqrt(patches.shape[1]))
    plt.figure(figsize=(16, 16))
    plt.suptitle(f"Image Patches", size=24)
    for i, patch in enumerate(patches[0]):
        ax = plt.subplot(n, n, i+1)
        patch_img = tf.reshape(patch, (32, 32, 3))
        ax.imshow(patch_img.numpy().astype("uint8"))
        ax.axis("off")

def render_flat(patches):
    plt.figure(figsize=(32, 2))
    plt.suptitle(f"Flattened Image Patches", size=24)
    n = int(np.sqrt(patches.shape[1]))
    for i, patch in enumerate(patches[0]):
        ax = plt.subplot(1, 101, i+1)
        patch_img = tf.reshape(patch, (32, 32, 3))
        ax.imshow(patch_img.numpy().astype("uint8"))
        ax.axis("off")
        if(i == 100):
            break


render_image_and_patches(image_arr, patches)
render_flat(patches)
\`\`\``
    },
    {
      id: 'nb-aigc-comfyui',
      title: 'ComfyUI 节点部署指南',
      file: 'AIGC-tutorial/notebook/comfyui_modelscope.ipynb',
      difficulty: '中级',
      duration: '0.5h',
      week: 0,
      phase: 0,
      keywords: ["ComfyUI", "文生图"],
      content: `克隆仓库并安装依赖。（关于 protobuf 的 pip 报错可以忽略）

> *Original: Git clone the repo and install the requirements. (ignore the pip errors about protobuf)*

\`\`\`python
#@title Environment Setup

from pathlib import Path

OPTIONS = {}

UPDATE_COMFY_UI = True  #@param {type:"boolean"}
WORKSPACE = 'ComfyUI'
OPTIONS['UPDATE_COMFY_UI'] = UPDATE_COMFY_UI

WORKSPACE = "/mnt/workspace/ComfyUI"
%cd /mnt/workspace/

![ ! -d $WORKSPACE ] && echo -= Initial setup ComfyUI =- && git clone https://github.com/comfyanonymous/ComfyUI
%cd $WORKSPACE

if OPTIONS['UPDATE_COMFY_UI']:
  !echo -= Updating ComfyUI =-
  !git pull

!echo -= Install dependencies =-
\`\`\`

下载所需的模型 / checkpoints / VAE 或第三方 comfyui 节点（按需取消注释相应命令）。

> *Original: Download some models/checkpoints/vae or custom comfyui nodes (uncomment the commands for the ones you want)*

\`\`\`python
# Checkpoints

### SDXL
### I recommend these workflow examples: https://comfyanonymous.github.io/ComfyUI_examples/sdxl/

#!wget -c "https://modelscope.cn/api/v1/models/AI-ModelScope/stable-diffusion-xl-base-1.0/repo?Revision=master&FilePath=sd_xl_base_1.0.safetensors" -P ./models/checkpoints/
#!wget -c "https://modelscope.cn/api/v1/models/AI-ModelScope/stable-diffusion-xl-refiner-1.0/repo?Revision=master&FilePath=sd_xl_refiner_1.0.safetensors" -P ./models/checkpoints/

# SDXL ReVision
#!wget -c https://huggingface.co/comfyanonymous/clip_vision_g/resolve/main/clip_vision_g.safetensors -P ./models/clip_vision/

# SD1.5
#!wget -c "https://modelscope.cn/api/v1/models/AI-ModelScope/stable-diffusion-v1-5/repo?Revision=master&FilePath=v1-5-pruned-emaonly.ckpt" -P ./models/checkpoints/

# SD2
#!wget -c "https://modelscope.cn/api/v1/models/AI-ModelScope/stable-diffusion-2-1-base/repo?Revision=master&FilePath=v2-1_512-ema-pruned.safetensors" -P ./models/checkpoints/
#!wget -c "https://modelscope.cn/api/v1/models/AI-ModelScope/stable-diffusion-2-1/repo?Revision=master&FilePath=v2-1_768-ema-pruned.safetensors" -P ./models/checkpoints/

# Some SD1.5 anime style
#!wget -c https://modelscope.cn/api/v1/models/AI-ModelScope/Orange-Mixs/repo?Revision=master&FilePath=Models%2FAbyssOrangeMix2%2FAbyssOrangeMix2_hard.safetensors -P ./models/checkpoints/
#!wget -c https://modelscope.cn/api/v1/models/AI-ModelScope/Orange-Mixs/repo?Revision=master&FilePath=Models%2FAbyssOrangeMix3%2FAOM3A1_orangemixs.safetensors -P ./models/checkpoints/
#!wget -c https://modelscope.cn/api/v1/models/AI-ModelScope/Orange-Mixs/repo?Revision=master&FilePath=Models%2FAbyssOrangeMix3%2FAOM3A3_orangemixs.safetensors -P ./models/checkpoints/
!wget -c "https://modelscope.cn/api/v1/models/AI-ModelScope/anything-v3.0/repo?Revision=master&FilePath=Anything-V3.0-pruned-fp16.safetensors" -P ./models/checkpoints/

# Waifu Diffusion 1.5 (anime style SD2.x 768-v)
#!wget -c https://modelscope.cn/api/v1/models/AI-ModelScope/wd-1-5-beta3/repo?Revision=master&FilePath=wd-illusion-fp16.safetensors -P ./models/checkpoints/


# unCLIP models
#!wget -c https://modelscope.cn/api/v1/models/AI-ModelScope/illuminatiDiffusionV1_v11_unCLIP/repo?Revision=master&FilePath=illuminatiDiffusionV1_v11-unclip-h-fp16.safetensors -P ./models/checkpoints/
#!wget -c https://modelscope.cn/api/v1/models/AI-ModelScope/wd-1.5-beta2_unCLIP/repo?Revision=master&FilePath=wd-1-5-beta2-aesthetic-unclip-h-fp16.safetensors -P ./models/checkpoints/


# VAE
!wget -c "https://modelscope.cn/api/v1/models/AI-ModelScope/sd-vae-ft-mse-original/repo?Revision=master&FilePath=vae-ft-mse-840000-ema-pruned.safetensors" -P ./models/vae/
#!wget -c https://modelscope.cn/api/v1/models/AI-ModelScope/Orange-Mixs/repo?Revision=master&FilePath=VAEs%2Forangemix.vae.pt -P ./models/vae/
#!wget -c https://huggingface.co/hakurei/waifu-diffusion-v1-4/resolve/main/vae/kl-f8-anime2.ckpt -P ./models/vae/


# Loras
#!wget -c https://civitai.com/api/download/models/10350 -O ./models/loras/theovercomer8sContrastFix_sd21768.safetensors #theovercomer8sContrastFix SD2.x 768-v
#!wget -c https://civitai.com/api/download/models/10638 -O ./models/loras/theovercomer8sContrastFix_sd15.safetensors #theovercomer8sContrastFix SD1.x
#!wget -c https://modelscope.cn/api/v1/models/AI-ModelScope/stable-diffusion-xl-base-1.0/repo?Revision=master&FilePath=sd_xl_offset_example-lora_1.0.safetensors -P ./models/loras/ #SDXL offset noise lora


# T2I-Adapter
#!wget -c "https://modelscope.cn/api/v1/models/AI-ModelScope/T2I-Adapter/repo?Revision=master&FilePath=models%2Ft2iadapter_depth_sd14v1.pth -P ./models/controlnet/"
#!wget -c https://modelscope.cn/api/v1/models/AI-ModelScope/T2I-Adapter/repo?Revision=master&FilePath=models%2F -P ./models/controlnet/
#!wget -c https://modelscope.cn/api/v1/models/AI-ModelScope/T2I-Adapter/repo?Revision=master&FilePath=models%2Ft2iadapter_sketch_sd14v1.pth -P ./models/controlnet/
#!wget -c https://modelscope.cn/api/v1/models/AI-ModelScope/T2I-Adapter/repo?Revision=master&FilePath=models%2Ft2iadapter_keypose_sd14v1.pth -P ./models/controlnet/
#!wget -c https://modelscope.cn/api/v1/models/AI-ModelScope/T2I-Adapter/repo?Revision=master&FilePath=models%2Ft2iadapter_openpose_sd14v1.pth -P ./models/controlnet/
#!wget -c https://modelscope.cn/api/v1/models/AI-ModelScope/T2I-Adapter/repo?Revision=master&FilePath=models%2Ft2iadapter_color_sd14v1.pth -P ./models/controlnet/
#!wget -c https://modelscope.cn/api/v1/models/AI-ModelScope/T2I-Adapter/repo?Revision=master&FilePath=models%2Ft2iadapter_canny_sd14v1.pth -P ./models/controlnet/

# T2I Styles Model
#!wget -c https://modelscope.cn/api/v1/models/AI-ModelScope/T2I-Adapter/repo?Revision=master&FilePath=models%2Ft2iadapter_style_sd14v1.pth -P ./models/style_models/

# CLIPVision model (needed for styles model)
#!wget -c https://modelscope.cn/api/v1/models/AI-ModelScope/clip-vit-large-patch14/repo?Revision=master&FilePath=pytorch_model.bin -O ./models/clip_vision/clip_vit14.bin


# ControlNet
#!wget -c https://modelscope.cn/api/v1/models/AI-ModelScope/ControlNet-v1-1_fp16_safetensors/repo?Revision=master&FilePath=control_v11e_sd15_ip2p_fp16.safetensors -P ./models/controlnet/
#!wget -c https://modelscope.cn/api/v1/models/AI-ModelScope/ControlNet-v1-1_fp16_safetensors/repo?Revision=master&FilePath=control_v11e_sd15_shuffle_fp16.safetensors -P ./models/controlnet/
#!wget -c https://modelscope.cn/api/v1/models/AI-ModelScope/ControlNet-v1-1_fp16_safetensors/repo?Revision=master&FilePath=control_v11p_sd15_canny_fp16.safetensors -P ./models/controlnet/
#!wget -c https://modelscope.cn/api/v1/models/AI-ModelScope/ControlNet-v1-1_fp16_safetensors/repo?Revision=master&FilePath=control_v11f1p_sd15_depth_fp16.safetensors -P ./models/controlnet/
#!wget -c https://modelscope.cn/api/v1/models/AI-ModelScope/ControlNet-v1-1_fp16_safetensors/repo?Revision=master&FilePath=control_v11p_sd15_inpaint_fp16.safetensors -P ./models/controlnet/
#!wget -c https://modelscope.cn/api/v1/models/AI-ModelScope/ControlNet-v1-1_fp16_safetensors/repo?Revision=master&FilePath=control_v11p_sd15_lineart_fp16.safetensors -P ./models/controlnet/
#!wget -c https://modelscope.cn/api/v1/models/AI-ModelScope/ControlNet-v1-1_fp16_safetensors/repo?Revision=master&FilePath=control_v11p_sd15_mlsd_fp16.safetensors -P ./models/controlnet/
#!wget -c https://modelscope.cn/api/v1/models/AI-ModelScope/ControlNet-v1-1_fp16_safetensors/repo?Revision=master&FilePath=control_v11p_sd15_normalbae_fp16.safetensors -P ./models/controlnet/
#!wget -c https://modelscope.cn/api/v1/models/AI-ModelScope/ControlNet-v1-1_fp16_safetensors/repo?Revision=master&FilePath=control_v11p_sd15_openpose_fp16.safetensors -P ./models/controlnet/
!wget -c "https://modelscope.cn/api/v1/models/AI-ModelScope/ControlNet-v1-1_fp16_safetensors/repo?Revision=master&FilePath=control_v11p_sd15_scribble_fp16.safetensors" -P ./models/controlnet/
#!wget -c https://modelscope.cn/api/v1/models/AI-ModelScope/ControlNet-v1-1_fp16_safetensors/repo?Revision=master&FilePath=control_v11p_sd15_seg_fp16.safetensors -P ./models/controlnet/
#!wget -c https://modelscope.cn/api/v1/models/AI-ModelScope/ControlNet-v1-1_fp16_safetensors/repo?Revision=master&FilePath=control_v11p_sd15_softedge_fp16.safetensors -P ./models/controlnet/
#!wget -c https://modelscope.cn/api/v1/models/AI-ModelScope/ControlNet-v1-1_fp16_safetensors/repo?Revision=master&FilePath=control_v11p_sd15s2_lineart_anime_fp16.safetensors -P ./models/controlnet/
#!wget -c https://modelscope.cn/api/v1/models/AI-ModelScope/ControlNet-v1-1_fp16_safetensors/repo?Revision=master&FilePath=control_v11u_sd15_tile_fp16.safetensors -P ./models/controlnet/

# ControlNet SDXL
#!wget -c https://modelscope.cn/api/v1/models/AI-ModelScope/control-lora/repo?Revision=master&FilePath=control-LoRAs-rank256%2Fcontrol-lora-canny-rank256.safetensors -P ./models/controlnet/
#!wget -c https://modelscope.cn/api/v1/models/AI-ModelScope/control-lora/repo?Revision=master&FilePath=control-LoRAs-rank256%2Fcontrol-lora-depth-rank256.safetensors -P ./models/controlnet/
#!wget -c https://modelscope.cn/api/v1/models/AI-ModelScope/control-lora/repo?Revision=master&FilePath=control-LoRAs-rank256%2Fcontrol-lora-recolor-rank256.safetensors -P ./models/controlnet/
#!wget -c https://modelscope.cn/api/v1/models/AI-ModelScope/control-lora/repo?Revision=master&FilePath=control-LoRAs-rank256%2Fcontrol-lora-sketch-rank256.safetensors -P ./models/controlnet/

# Controlnet Preprocessor nodes by Fannovel16
#!cd custom_nodes && git clone https://github.com/Fannovel16/comfy_controlnet_preprocessors; cd comfy_controlnet_preprocessors && python install.py


# GLIGEN
#!wget -c https://modelscope.cn/api/v1/models/AI-ModelScope/GLIGEN_pruned_safetensors/repo?Revision=master&FilePath=gligen_sd14_textbox_pruned_fp16.safetensors -P ./models/gligen/


# ESRGAN upscale model
#!wget -c https://modelscope.cn/api/v1/models/AI-ModelScope/RealESRGAN_x4plus/repo?Revision=master&FilePath=RealESRGAN_x4plus.pth -P ./models/upscale_models/
#!wget -c https://modelscope.cn/api/v1/models/AI-ModelScope/Real-ESRGAN/repo?Revision=master&FilePath=RealESRGAN_x2.pth -P ./models/upscale_models/
#!wget -c https://modelscope.cn/api/v1/models/AI-ModelScope/Real-ESRGAN/repo?Revision=master&FilePath=RealESRGAN_x.pth -P ./models/upscale_models/


\`\`\`

### 通过 cloudflared 运行 ComfyUI（推荐方式）

> *Original: Run ComfyUI with cloudflared (Recommended Way)*

\`\`\`python
!wget "https://modelscope.oss-cn-beijing.aliyuncs.com/resource/cloudflared-linux-amd64.deb"
!dpkg -i cloudflared-linux-amd64.deb

import subprocess
import threading
import time
import socket
import urllib.request

def iframe_thread(port):
  while True:
      time.sleep(0.5)
      sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
      result = sock.connect_ex(('127.0.0.1', port))
      if result == 0:
        break
      sock.close()
  print("\\nComfyUI finished loading, trying to launch cloudflared (if it gets stuck here cloudflared is having issues)\\n")

  p = subprocess.Popen(["cloudflared", "tunnel", "--url", "http://127.0.0.1:{}".format(port)], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
  for line in p.stderr:
    l = line.decode()
    if "trycloudflare.com " in l:
      print("This is the URL to access ComfyUI:", l[l.find("http"):], end='')
    #print(l, end='')


threading.Thread(target=iframe_thread, daemon=True, args=(8188,)).start()

!python main.py --dont-print-server
\`\`\`

### 通过 localtunnel 运行 ComfyUI

> *Original: Run ComfyUI with localtunnel*

\`\`\`python
!npm install -g localtunnel
%cd /mnt/workspace/ComfyUI
import subprocess
import threading
import time
import socket
import urllib.request

def iframe_thread(port):
  while True:
      time.sleep(0.5)
      sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
      result = sock.connect_ex(('127.0.0.1', port))
      if result == 0:
        break
      sock.close()
  print("\\nComfyUI finished loading, trying to launch localtunnel (if it gets stuck here localtunnel is having issues)\\n")

  print("The password/enpoint ip for localtunnel is:", urllib.request.urlopen('https://ipv4.icanhazip.com').read().decode('utf8').strip("\\n"))
  p = subprocess.Popen(["lt", "--port", "{}".format(port)], stdout=subprocess.PIPE)
  for line in p.stdout:
    print(line.decode(), end='')


threading.Thread(target=iframe_thread, daemon=True, args=(8188,)).start()

!python main.py --dont-print-server
\`\`\``
    },
    {
      id: 'nb-aigc-comfyui-animatediff',
      title: 'ComfyUI + AnimateDiff',
      file: 'AIGC-tutorial/notebook/comfyui_manager_animatediff.ipynb',
      difficulty: '中级',
      duration: '0.5h',
      week: 0,
      phase: 0,
      keywords: ["AnimateDiff", "动画"],
      content: `克隆仓库并安装依赖。（关于 protobuf 的 pip 报错可以忽略）

> *Original: Git clone the repo and install the requirements. (ignore the pip errors about protobuf)*

\`\`\`python
# #@title Environment Setup

from pathlib import Path

OPTIONS = {}
UPDATE_COMFY_UI = True  #@param {type:"boolean"}
INSTALL_COMFYUI_MANAGER = True  #@param {type:"boolean"}
INSTALL_ANIMATEDIFF = True  #@param {type:"boolean"}
INSTALL_CUSTOM_NODES_DEPENDENCIES = True  #@param {type:"boolean"}
OPTIONS['UPDATE_COMFY_UI'] = UPDATE_COMFY_UI
OPTIONS['INSTALL_COMFYUI_MANAGER'] = INSTALL_COMFYUI_MANAGER
OPTIONS['INSTALL_ANIMATEDIFF'] = INSTALL_ANIMATEDIFF
OPTIONS['INSTALL_CUSTOM_NODES_DEPENDENCIES'] = INSTALL_CUSTOM_NODES_DEPENDENCIES

current_dir = !pwd
WORKSPACE = f"{current_dir[0]}/ComfyUI"



%cd /mnt/workspace/

![ ! -d $WORKSPACE ] && echo -= Initial setup ComfyUI =- && git clone https://github.com/comfyanonymous/ComfyUI
%cd $WORKSPACE

if OPTIONS['UPDATE_COMFY_UI']:
  !echo "-= Updating ComfyUI =-"
  !git pull


if OPTIONS['INSTALL_COMFYUI_MANAGER']:
  %cd custom_nodes
  ![ ! -d ComfyUI-Manager ] && echo -= Initial setup ComfyUI-Manager =- && git clone https://github.com/ltdrdata/ComfyUI-Manager
  %cd ComfyUI-Manager
  !git pull

if OPTIONS['INSTALL_ANIMATEDIFF']:
  %cd ../
  ![ ! -d ComfyUI-AnimateDiff-Evolved ] && echo -= Initial setup AnimateDiff =- && git clone https://github.com/Kosinkadink/ComfyUI-AnimateDiff-Evolved
  %cd ComfyUI-AnimateDiff-Evolved
  !git pull

%cd $WORKSPACE

if OPTIONS['INSTALL_CUSTOM_NODES_DEPENDENCIES']:
  !pwd
  !echo "-= Install custom nodes dependencies =-"
  ![ -f "custom_nodes/ComfyUI-Manager/scripts/colab-dependencies.py" ] && python "custom_nodes/ComfyUI-Manager/scripts/colab-dependencies.py"

\`\`\`

下载所需的模型 / checkpoints / VAE 或第三方 comfyui 节点（按需取消注释相应命令）。

> *Original: Download some models/checkpoints/vae or custom comfyui nodes (uncomment the commands for the ones you want)*

\`\`\`python
#@markdown ###Download standard resources

### SDXL
### I recommend these workflow examples: https://comfyanonymous.github.io/ComfyUI_examples/sdxl/

OPTIONS = {}

#@markdown **Models**

SDXL_1_0_BASE_AND_REFINER = True  #@param {type:"boolean"}
OPTIONS['SDXL_1_0_BASE_AND_REFINER'] = SDXL_1_0_BASE_AND_REFINER

if OPTIONS['SDXL_1_0_BASE_AND_REFINER']:
  !wget -c "https://modelscope.cn/api/v1/models/AI-ModelScope/stable-diffusion-xl-base-1.0/repo?Revision=master&FilePath=sd_xl_base_1.0.safetensors" -P ./models/checkpoints/
  !wget -c "https://modelscope.cn/api/v1/models/AI-ModelScope/stable-diffusion-xl-refiner-1.0/repo?Revision=master&FilePath=sd_xl_refiner_1.0.safetensors" -P ./models/checkpoints/


SD_1_5_MODEL = True  #@param {type:"boolean"}
OPTIONS['SD_1_5_MODEL'] = SD_1_5_MODEL

if OPTIONS['SD_1_5_MODEL']:
  !wget -c "https://modelscope.cn/api/v1/models/AI-ModelScope/stable-diffusion-v1-5/repo?Revision=master&FilePath=v1-5-pruned-emaonly.ckpt" -P ./models/checkpoints/


#@markdown **VAEs**

SDXL_1_0_VAE = True  #@param {type:"boolean"}
OPTIONS['SDXL_1_0_VAE'] = SDXL_1_0_VAE

if OPTIONS['SDXL_1_0_VAE']:
  !wget -c "https://modelscope.cn/api/v1/models/AI-ModelScope/sdxl-vae-fp16-fix/repo?Revision=master&FilePath=diffusion_pytorch_model.safetensors" -O ./models/vae/sdxl-vae-fp16-fix.safetensors #sdxl-vae-fp16-fix.safetensors

SD_1_5_VAE = True  #@param {type:"boolean"}
OPTIONS['SD_1_5_VAE'] = SD_1_5_VAE

if OPTIONS['SD_1_5_VAE']:
  !wget -c "https://modelscope.cn/api/v1/models/AI-ModelScope/sd-vae-ft-mse-original/repo?Revision=master&FilePath=vae-ft-mse-840000-ema-pruned.safetensors" -P ./models/vae/


#@markdown **Controlnets**

SDXL_1_0_CONTROLNETS = True  #@param {type:"boolean"}
OPTIONS['SDXL_1_0_CONTROLNETS'] = SDXL_1_0_CONTROLNETS

if OPTIONS['SDXL_1_0_CONTROLNETS']:
  !wget -c "https://modelscope.cn/api/v1/models/AI-ModelScope/control-lora/repo?Revision=master&FilePath=control-LoRAs-rank256%2Fcontrol-lora-canny-rank256.safetensors" -P ./models/controlnet/
  !wget -c "https://modelscope.cn/api/v1/models/AI-ModelScope/control-lora/repo?Revision=master&FilePath=control-LoRAs-rank256%2Fcontrol-lora-depth-rank256.safetensors" -P ./models/controlnet/
  !wget -c "https://modelscope.cn/api/v1/models/AI-ModelScope/control-lora/repo?Revision=master&FilePath=control-LoRAs-rank256%2Fcontrol-lora-recolor-rank256.safetensors" -P ./models/controlnet/
  !wget -c "https://modelscope.cn/api/v1/models/AI-ModelScope/control-lora/repo?Revision=master&FilePath=control-LoRAs-rank256%2Fcontrol-lora-sketch-rank256.safetensors" -P ./models/controlnet/

SD_1_5_CONTROLNETS = True  #@param {type:"boolean"}
OPTIONS['SD_1_5_CONTROLNETS'] = SD_1_5_CONTROLNETS

if OPTIONS['SD_1_5_CONTROLNETS']:
  !wget -c "https://modelscope.cn/api/v1/models/AI-ModelScope/ControlNet-v1-1_fp16_safetensors/repo?Revision=master&FilePath=control_v11e_sd15_ip2p_fp16.safetensors" -P ./models/controlnet/
  !wget -c "https://modelscope.cn/api/v1/models/AI-ModelScope/ControlNet-v1-1_fp16_safetensors/repo?Revision=master&FilePath=control_v11e_sd15_shuffle_fp16.safetensors" -P ./models/controlnet/
  !wget -c "https://modelscope.cn/api/v1/models/AI-ModelScope/ControlNet-v1-1_fp16_safetensors/repo?Revision=master&FilePath=control_v11p_sd15_canny_fp16.safetensors" -P ./models/controlnet/
  !wget -c "https://modelscope.cn/api/v1/models/AI-ModelScope/ControlNet-v1-1_fp16_safetensors/repo?Revision=master&FilePath=control_v11f1p_sd15_depth_fp16.safetensors" -P ./models/controlnet/
  !wget -c "https://modelscope.cn/api/v1/models/AI-ModelScope/ControlNet-v1-1_fp16_safetensors/repo?Revision=master&FilePath=control_v11p_sd15_inpaint_fp16.safetensors" -P ./models/controlnet/
  !wget -c "https://modelscope.cn/api/v1/models/AI-ModelScope/ControlNet-v1-1_fp16_safetensors/repo?Revision=master&FilePath=control_v11p_sd15_lineart_fp16.safetensors" -P ./models/controlnet/
  !wget -c "https://modelscope.cn/api/v1/models/AI-ModelScope/ControlNet-v1-1_fp16_safetensors/repo?Revision=master&FilePath=control_v11p_sd15_mlsd_fp16.safetensors" -P ./models/controlnet/
  !wget -c "https://modelscope.cn/api/v1/models/AI-ModelScope/ControlNet-v1-1_fp16_safetensors/repo?Revision=master&FilePath=control_v11p_sd15_normalbae_fp16.safetensors" -P ./models/controlnet/
  !wget -c "https://modelscope.cn/api/v1/models/AI-ModelScope/ControlNet-v1-1_fp16_safetensors/repo?Revision=master&FilePath=control_v11p_sd15_openpose_fp16.safetensors" -P ./models/controlnet/
  !wget -c "https://modelscope.cn/api/v1/models/AI-ModelScope/ControlNet-v1-1_fp16_safetensors/repo?Revision=master&FilePath=control_v11p_sd15_scribble_fp16.safetensors" -P ./models/controlnet/
  !wget -c "https://modelscope.cn/api/v1/models/AI-ModelScope/ControlNet-v1-1_fp16_safetensors/repo?Revision=master&FilePath=control_v11p_sd15_seg_fp16.safetensors" -P ./models/controlnet/
  !wget -c "https://modelscope.cn/api/v1/models/AI-ModelScope/ControlNet-v1-1_fp16_safetensors/repo?Revision=master&FilePath=control_v11p_sd15_softedge_fp16.safetensors" -P ./models/controlnet/
  !wget -c "https://modelscope.cn/api/v1/models/AI-ModelScope/ControlNet-v1-1_fp16_safetensors/repo?Revision=master&FilePath=control_v11p_sd15s2_lineart_anime_fp16.safetensors" -P ./models/controlnet/
  !wget -c "https://modelscope.cn/api/v1/models/AI-ModelScope/ControlNet-v1-1_fp16_safetensors/repo?Revision=master&FilePath=control_v11u_sd15_tile_fp16.safetensors" -P ./models/controlnet/


#@markdown **AnimateDiff**

AD_MOTION_MODELS = True  #@param {type:"boolean"}
OPTIONS['AD_MOTION_MODELS'] = AD_MOTION_MODELS

if OPTIONS['AD_MOTION_MODELS']:
  !wget -c "https://modelscope.cn/api/v1/models/Shanghai_AI_Laboratory/animatediff/repo?Revision=master&FilePath=mm_sd_v14.ckpt" -P ./custom_nodes/ComfyUI-AnimateDiff-Evolved/models/
  !wget -c "https://modelscope.cn/api/v1/models/Shanghai_AI_Laboratory/animatediff/repo?Revision=master&FilePath=mm_sd_v15.ckpt" -P ./custom_nodes/ComfyUI-AnimateDiff-Evolved/models/
  !wget -c "https://modelscope.cn/api/v1/models/Shanghai_AI_Laboratory/animatediff/repo?Revision=master&FilePath=mm_sd_v15_v2.ckpt" -P ./custom_nodes/ComfyUI-AnimateDiff-Evolved/models/

AD_MOTION_LORAS = True  #@param {type:"boolean"}
OPTIONS['AD_MOTION_LORAS'] = AD_MOTION_LORAS

if OPTIONS['AD_MOTION_LORAS']:
  !wget -c "https://modelscope.cn/api/v1/models/Shanghai_AI_Laboratory/animatediff/repo?Revision=master&FilePath=v2_lora_PanLeft.ckpt" -P ./custom_nodes/ComfyUI-AnimateDiff-Evolved/motion_lora/
  !wget -c "https://modelscope.cn/api/v1/models/Shanghai_AI_Laboratory/animatediff/repo?Revision=master&FilePath=v2_lora_PanRight.ckpt" -P ./custom_nodes/ComfyUI-AnimateDiff-Evolved/motion_lora/
  !wget -c "https://modelscope.cn/api/v1/models/Shanghai_AI_Laboratory/animatediff/repo?Revision=master&FilePath=v2_lora_RollingAnticlockwise.ckpt" -P ./custom_nodes/ComfyUI-AnimateDiff-Evolved/motion_lora/
  !wget -c "https://modelscope.cn/api/v1/models/Shanghai_AI_Laboratory/animatediff/repo?Revision=master&FilePath=v2_lora_RollingClockwise.ckpt" -P ./custom_nodes/ComfyUI-AnimateDiff-Evolved/motion_lora/
  !wget -c "https://modelscope.cn/api/v1/models/Shanghai_AI_Laboratory/animatediff/repo?Revision=master&FilePath=v2_lora_TiltDown.ckpt" -P ./custom_nodes/ComfyUI-AnimateDiff-Evolved/motion_lora/
  !wget -c "https://modelscope.cn/api/v1/models/Shanghai_AI_Laboratory/animatediff/repo?Revision=master&FilePath=v2_lora_TiltUp.ckpt" -P ./custom_nodes/ComfyUI-AnimateDiff-Evolved/motion_lora/
  !wget -c "https://modelscope.cn/api/v1/models/Shanghai_AI_Laboratory/animatediff/repo?Revision=master&FilePath=v2_lora_ZoomIn.ckpt" -P ./custom_nodes/ComfyUI-AnimateDiff-Evolved/motion_lora/
  !wget -c "https://modelscope.cn/api/v1/models/Shanghai_AI_Laboratory/animatediff/repo?Revision=master&FilePath=v2_lora_ZoomOut.ckpt" -P ./custom_nodes/ComfyUI-AnimateDiff-Evolved/motion_lora/

\`\`\`

### 通过 cloudflared 运行 ComfyUI（推荐方式）

> *Original: Run ComfyUI with cloudflared (Recommended Way)*

\`\`\`python
!wget "https://modelscope.oss-cn-beijing.aliyuncs.com/resource/cloudflared-linux-amd64.deb"
!dpkg -i cloudflared-linux-amd64.deb

%cd /mnt/workspace/ComfyUI
import subprocess
import threading
import time
import socket
import urllib.request

def iframe_thread(port):
  while True:
      time.sleep(0.5)
      sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
      result = sock.connect_ex(('127.0.0.1', port))
      if result == 0:
        break
      sock.close()
  print("\\nComfyUI finished loading, trying to launch cloudflared (if it gets stuck here cloudflared is having issues)\\n")

  p = subprocess.Popen(["cloudflared", "tunnel", "--url", "http://127.0.0.1:{}".format(port)], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
  for line in p.stderr:
    l = line.decode()
    if "trycloudflare.com " in l:
      print("This is the URL to access ComfyUI:", l[l.find("http"):], end='')
    #print(l, end='')


threading.Thread(target=iframe_thread, daemon=True, args=(8188,)).start()

!python main.py --dont-print-server
\`\`\`

### 通过 localtunnel 运行 ComfyUI

> *Original: Run ComfyUI with localtunnel*

\`\`\`python
!npm install -g localtunnel
%cd /mnt/workspace/ComfyUI
import subprocess
import threading
import time
import socket
import urllib.request

def iframe_thread(port):
  while True:
      time.sleep(0.5)
      sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
      result = sock.connect_ex(('127.0.0.1', port))
      if result == 0:
        break
      sock.close()
  print("\\nComfyUI finished loading, trying to launch localtunnel (if it gets stuck here localtunnel is having issues)\\n")

  print("The password/enpoint ip for localtunnel is:", urllib.request.urlopen('https://ipv4.icanhazip.com').read().decode('utf8').strip("\\n"))
  p = subprocess.Popen(["lt", "--port", "{}".format(port)], stdout=subprocess.PIPE)
  for line in p.stdout:
    print(line.decode(), end='')


threading.Thread(target=iframe_thread, daemon=True, args=(8188,)).start()

!python main.py --dont-print-server
\`\`\``
    },
    {
      id: 'nb-aigc-sd-webui',
      title: 'SD WebUI 快速启动',
      file: 'AIGC-tutorial/notebook/sd-webui最佳实践.ipynb',
      difficulty: '中级',
      duration: '0.5h',
      week: 0,
      phase: 0,
      keywords: ["Stable Diffusion", "WebUI"],
      content: `\`\`\`python

%cd /mnt/workspace/

!apt update
!apt install -y aria2
!pip install gradio==3.41.2
!pip install insightface
!pip install gdown
!git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git
\`\`\`

\`\`\`python
!aria2c --console-log-level=error -c -x 16 -s 16 -k 1M "https://modelscope.cn/api/v1/models/AI-ModelScope/stable-diffusion-2-1/repo?Revision=master&FilePath=v2-1_768-ema-pruned.ckpt" -d /mnt/workspace/stable-diffusion-webui/models/Stable-diffusion -o v2-1_768-ema-pruned.ckpt
\`\`\`

\`\`\`python
!aria2c --console-log-level=error -c -x 16 -s 16 -k 1M "https://modelscope.cn/api/v1/models/AI-ModelScope/stable-diffusion-2-base/repo?Revision=master&FilePath=512-base-ema.ckpt" -d /mnt/workspace/stable-diffusion-webui/models/Stable-diffusion -o 512-base-ema.ckpt
\`\`\`

\`\`\`python
!aria2c --console-log-level=error -c -x 16 -s 16 -k 1M "https://modelscope.cn/api/v1/models/AI-ModelScope/anything-v3.0/repo?Revision=master&FilePath=Anything-V3.0-pruned.ckpt" -d /mnt/workspace/stable-diffusion-webui/models/Stable-diffusion -o Anything-V3.0-pruned.ckpt
!aria2c --console-log-level=error -c -x 16 -s 16 -k 1M "https://modelscope.cn/api/v1/models/AI-ModelScope/sd-vae-ft-mse-original/repo?Revision=master&FilePath=vae-ft-mse-840000-ema-pruned.ckpt" -d /mnt/workspace/stable-diffusion-webui/models/Stable-diffusion -o Anything-V3.0-pruned.vae.pt
!git clone https://www.modelscope.cn/AI-ModelScope/clip-vit-large-patch14.git /mnt/workspace/stable-diffusion-webui/openai/clip-vit-large-patch14
\`\`\`

\`\`\`python
!aria2c --console-log-level=error -c -x 16 -k 1M -s 16 "https://modelscope.cn/api/v1/models/sd_lora/ControlNet/repo?Revision=master&FilePath=canny-sd21-safe.safetensors" -d /mnt/workspace/stable-diffusion-webui/extensions/sd-webui-controlnet/models -o canny-sd21-safe.safetensors
!aria2c --console-log-level=error -c -x 16 -k 1M -s 16 "https://modelscope.cn/api/v1/models/sd_lora/ControlNet/repo?Revision=master&FilePath=depth-sd21-safe.safetensors" -d /mnt/workspace/stable-diffusion-webui/extensions/sd-webui-controlnet/models -o depth-sd21-safe.safetensors
!aria2c --console-log-level=error -c -x 16 -k 1M -s 16 "https://modelscope.cn/api/v1/models/sd_lora/ControlNet/repo?Revision=master&FilePath=hed-sd21-safe.safetensors" -d /mnt/workspace/stable-diffusion-webui/extensions/sd-webui-controlnet/models -o hed-sd21-safe.safetensors
!aria2c --console-log-level=error -c -x 16 -k 1M -s 16 "https://modelscope.cn/api/v1/models/sd_lora/ControlNet/repo?Revision=master&FilePath=openpose-sd21-safe.safetensors" -d /mnt/workspace/stable-diffusion-webui/extensions/sd-webui-controlnet/models -o openpose-sd21-safe.safetensors
!aria2c --console-log-level=error -c -x 16 -k 1M -s 16 "https://modelscope.cn/api/v1/models/sd_lora/ControlNet/repo?Revision=master&FilePath=scribble-sd21-safe.safetensors" -d /mnt/workspace/stable-diffusion-webui/extensions/sd-webui-controlnet/models -o scribble-sd21-safe.safetensors
\`\`\`

\`\`\`python
%cd stable-diffusion-webui
!python launch.py --listen --xformers --enable-insecure-extension-access --theme dark --gradio-queue --lowvram
\`\`\``
    }
  ]
});
