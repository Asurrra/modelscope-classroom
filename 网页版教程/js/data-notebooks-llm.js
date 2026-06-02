window.LEARNING_DATA = window.LEARNING_DATA || [];
window.LEARNING_DATA.push({
  module: 'LLM-实践篇',
  chapters: [
    {
      id: 'nb-llm-openrlhf',
      title: 'OpenRLHF 强化学习实战',
      file: 'LLM-tutorial/notebook/OpenRLHF.ipynb',
      difficulty: '高级',
      duration: '0.5h',
      week: 0,
      phase: 0,
      keywords: ['OpenRLHF', 'PPO', 'RLHF'],
      content: `## OpenRLHF 介绍

[OpenRLHF](https://github.com/OpenRLHF/OpenRLHF) 是一个基于 Ray、DeepSpeed 和 HF Transformers 构建的高性能大模型强化学习框架，具有以下优点：

1. 简单易用：无缝兼容 Huggingface 模型和数据集，成为目前可用的最简单的高性能 RL 库之一。现在也支持从 ModelScope 上获取模型和数据集。
2. 高性能：RLHF 训练中 80% 的时间用于样本生成阶段。得益于使用 Ray, Packing Samples 以及 vLLM 生成加速的能力，OpenRLHF 的性能是极致优化的 DeepSpeedChat with Hybrid Engine 的3~4倍以上。
3. 分布式：OpenRLHF 使用 Ray 将 Actor、Reward、Reference 和 Critic 模型分布到不同的 GPU 上，同时将 Adam 优化器放在 CPU 上。这使得使用多个 A100 80G GPU 和 vLLM 可以全面微调超过 70B+ 的模型 以及在多个 24GB RTX 4090 GPU 上微调 7B 模型。
4. PPO 实现技巧：OpenRLHF 集成了若干 PPO 的实现技巧以提高训练稳定性。

目前有一些 DeepSeek-R1 复刻项目就是基于 OpenRLHF 库，如：[simpleRL-reason](https://github.com/hkust-nlp/simpleRL-reason)。

### OpenRLHF 安装

OpenRLHF 官方推荐启动 Docker 镜像后，在镜像内安装。当然您也可以直接使用下面的命令安装。


\`\`\`python
# pip install
pip install openrlhf

# 如果需要使用 vLLM 加速 (安装 vLLM 0.7.2)
pip install openrlhf[vllm]
# 最新的 vLLM 也是支持的
pip install openrlhf[vllm_latest]

# pip install GitHub 上的最新版
pip install git+https://github.com/OpenRLHF/OpenRLHF.git

# 或者 git clone
git clone https://github.com/OpenRLHF/OpenRLHF.git
cd OpenRLHF
pip install -e .
\`\`\`

### OpenRLHF 使用

OpenRLHF 的模型检查点完全兼容 HuggingFace 模型。您可以使用 \`--pretrain  {name or path}\`、\`--reward_pretrain  {name or path}\` 和 \`--critic_pretrain  {name or path}\` 指定模型名称或路径。现在您也可以添加一个 \`--use_ms\` 来指定从 ModelScope 上获取模型和数据集。

\`\`\`python
CUDA_VISIBLE_DEVICES=0,1,2,3

deepspeed --module openrlhf.cli.train_sft \\
   --max_len 4096 \\
   --dataset AI-ModelScope/OpenOrca \\
   --input_key question \\
   --output_key response \\
   --input_template $'User: {}\\nAssistant: ' \\
   --train_batch_size 256 \\
   --micro_train_batch_size 2 \\
   --max_samples 500000 \\
   --pretrain LLM-Research/Meta-Llama-3-8B \\
   --save_path ./checkpoint/llama3-8b-sft \\
   --save_steps -1 \\
   --logging_steps 1 \\
   --eval_steps -1 \\
   --zero_stage 2 \\
   --max_epochs 1 \\
   --bf16 \\
   --flash_attn \\
   --learning_rate 5e-6 \\
   --gradient_checkpointing \\
   --packing_samples \\
   --load_checkpoint \\
   --use_wandb {wandb_token} \\
   --use_ms
\`\`\`

除了 SFT 训练，OpenRLHF 的 PPO、DPO、KTO 等训练方法，以及 batch_inference、serve_rm 等部署方法也都支持了使用 \`--use_ms\` 的方式从 ModelScope 上获取模型及数据集。如果 ModelScope 上没有所需的模型或者数据集，也可以自行上传。

OpenRLHF 给出了一些数据集相关的参数，比如 \`--input_key\` 和 \`--output_key\` 用于指定 JSON key name 为数据集的输入输出，方便兼容不同的数据集而节省事先处理数据集的时间。比如在上面的演示中，我们就指定了数据集中应该被使用的 Key 是 'question' 和 'response'。更多详细的设置，可以访问官方文档。

\`\`\`python
CUDA_VISIBLE_DEVICES=4,5,6,7

deepspeed --master_port 61000 \\
  openrlhf/cli/train_ppo.py \\
  --pretrain AI-ModelScope/Llama-3-8b-sft-mixture \\
  --reward_pretrain AI-ModelScope/Llama-3-8b-rm-mixture \\
  --save_path ./checkpoint/llama-3-8b-rlhf \\
  --save_steps -1 \\
  --logging_steps 1 \\
  --eval_steps -1 \\
  --micro_train_batch_size 2 \\
  --train_batch_size 128 \\
  --micro_rollout_batch_size 4 \\
  --rollout_batch_size 1024 \\
  --max_epochs 1 \\
  --prompt_max_len 1024 \\
  --generate_max_len 1024 \\
  --zero_stage 2 \\
  --bf16 \\
  --actor_learning_rate 5e-7 \\
  --critic_learning_rate 9e-6 \\
  --init_kl_coef 0.01 \\
  --prompt_data AI-ModelScope/prompt-collection-v0.1 \\
  --input_key context_messages \\
  --apply_chat_template \\
  --max_samples 100000 \\
  --normalize_reward \\
  --adam_offload \\
  --flash_attn \\
  --gradient_checkpointing \\
  --load_checkpoint \\
  --use_wandb {wandb_token} \\
  --use_ms
\`\`\`

上述命令在 NVIDIA A100-SXM4-80GB * 8 上训练 36 小时得到的结果如下：

![PPO-wandb.png](LLM-tutorial/notebook/attachment:PPO-wandb.png)`
    },
    {
      id: 'nb-llm-openvino',
      title: 'OpenVINO 推理优化',
      file: 'LLM-tutorial/notebook/OpenVino-llm-chatbot.ipynb',
      difficulty: '中级',
      duration: '2h',
      week: 2,
      phase: 2,
      keywords: ['OpenVINO', '模型压缩'],
      content: `# 使用 OpenVINO 创建由 LLM 驱动的聊天机器人

在快速发展的人工智能 (AI) 世界中，聊天机器人已成为企业增强客户互动和简化运营的强大工具。 大型语言模型 (LLM) 是能够理解和生成人类语言的人工智能系统。 他们使用深度学习算法和大量数据来学习语言的细微差别并产生连贯且相关的响应。 虽然一个不错的基于意图的聊天机器人可以回答基本的一键式查询，例如订单管理、常见问题解答和政策问题，但 LLM 聊天机器人可以解决更复杂的多点触控问题。 LLM 使聊天机器人能够通过上下文记忆以对话方式提供支持，类似于人类的做法。 利用语言模型的功能，聊天机器人变得越来越智能，能够以极高的准确性理解和响应人类语言。

在本教程中，我们将考虑如何使用 OpenVINO 的强大功能来运行大型语言模型以进行聊天。 我们将使用 ModelScope 库中的预训练模型。 为了简化用户体验，使用 Hugging Face Optimum Intel 库将模型转换为 OpenVINO™ IR 格式。



本教程包含以下步骤:

- 安装先决条件
- 使用 OpenVINO 与 Hugging Face Optimum 集成从公共源下载并转换模型 [OpenVINO integration with Hugging Face Optimum](https://huggingface.co/blog/openvino).
- 使用 NNCF 将模型权重压缩为 4 位或 8 位数据类型 [NNCF](https://github.com/openvinotoolkit/nncf)
- 创建聊天推理管道
- 运行聊天pipeline


#### 目录:

- [先决条件](#Prerequisites)
- [选择模型进行推理](#Select-model-for-inference)
- [访问modelscope上的模型](#login-to-huggingfacehub-to-get-access-to-pretrained-model)
- [使用 Optimum Intel 实例化模型](#Instantiate-Model-using-Optimum-Intel)
- [压缩模型权重](#Compress-model-weights)
    - [使用 Optimum Intel 进行权重压缩](#Weights-Compression-using-Optimum-Intel)
    - [使用 NNCF 进行权重压缩](#Weights-Compression-using-NNCF)
- [选择推理设备及模型变体](#Select-device-for-inference-and-model-variant)
- [运行聊天机器人](#Run-Chatbot)

> *Original TOC entries: Select device for inference and model variant; Run Chatbot*

## 先决条件（Prerequisites）
[返回目录](#Table-of-contents:)

安装所需依赖。

> *Original: Prerequisites*
>
> *Install required dependencies*

\`\`\`python
%pip install -q --extra-index-url https://download.pytorch.org/whl/cpu\\
"git+https://github.com/huggingface/optimum-intel.git"\\
"git+https://github.com/openvinotoolkit/nncf.git"\\
"datasets" \\
"accelerate"\\
"openvino-nightly"\\
"gradio"\\
"onnx" "einops" "transformers_stream_generator" "tiktoken" "transformers>=4.38.1" "bitsandbytes"
\`\`\`

## 选择用于推理的模型（Select model for inference）
[返回目录](#Table-of-contents:)

本教程支持多种模型，你可以从下面的选项中挑选其一，以对比不同开源 LLM 方案的效果。
>**注意**：部分模型的转换需要用户额外操作，并且转换至少需要 64GB 内存。

可选模型如下：

* **tiny-llama-1b-chat** —— 在 [TinyLlama/TinyLlama-1.1B-intermediate-step-1431k-3T](https://huggingface.co/TinyLlama/TinyLlama-1.1B-intermediate-step-1431k-3T) 之上微调得到的对话模型。TinyLlama 项目旨在使用与 Llama 2 相同的架构和分词器，在 3 万亿 token 上预训练一个 1.1B 参数的 Llama 模型，因此可以即插即用地接入许多基于 Llama 的开源项目。它仅有 1.1B 参数、体积紧凑，非常适合算力和显存受限的场景。详见 [model card](https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0)。
*  **mini-cpm-2b-dpo** —— 由面壁智能（ModelBest Inc.）与清华 NLP 联合研发的端侧 LLM，去除 Embedding 后仅 2.4B 参数。经 DPO（Direct Preference Optimization）微调后，MiniCPM 在多项基准上的表现优于许多 7B/13B/70B 模型。详见 [model_card](https://huggingface.co/openbmb/MiniCPM-2B-dpo-fp16)。
*  **gemma-2b-it** —— Google 推出的 Gemma 系列轻量级开源模型，基于与 Gemini 相同的研究与技术构建。它们是英文 text-to-text、decoder-only 的大模型，提供开放权重以及预训练 / 指令微调两种版本，适合问答、摘要、推理等多种文本生成任务。本模型为 2B 参数的指令微调版本。详见 [model card](https://huggingface.co/google/gemma-2b-it)。
>**注意**：运行该模型需要先接受许可协议。
>你需要先注册 🤗 Hugging Face Hub 账号，访问 [HuggingFace model card](https://huggingface.co/google/gemma-2b-it)，仔细阅读使用条款并点击 accept 按钮，然后使用 access token 才能运行下方代码。关于 access token，请参考[官方文档](https://huggingface.co/docs/hub/security-tokens)。
>可以使用以下代码在 notebook 环境中登录 Hugging Face Hub：

> *Original: Select model for inference*
>
> *The tutorial supports different models, you can select one from the provided options to compare the quality of open source LLM solutions. Note: conversion of some models can require additional actions from user side and at least 64GB RAM for conversion.*
>
> *Available models include tiny-llama-1b-chat (chat model finetuned on TinyLlama-1.1B), mini-cpm-2b-dpo (MiniCPM End-Size LLM by ModelBest Inc. and TsinghuaNLP), gemma-2b-it (Google Gemma family of lightweight open models, instruction-tuned 2B variant). For gated models, you must be a registered user in Hugging Face Hub, accept the license agreement, and use an access token.*
 
\`\`\`python
    ## login to huggingfacehub to get access to pretrained model 

    from huggingface_hub import notebook_login, whoami

    try:
        whoami()
        print('Authorization token already provided')
    except OSError:
        notebook_login()
\`\`\`
* **red-pajama-3b-chat** —— 基于 GPT-NEOX 架构、共 2.8B 参数的预训练语言模型，由 Together Computer 与开源 AI 社区共同开发。模型在 OASST1 和 Dolly2 数据集上微调，强化了对话能力。详见 [HuggingFace model card](https://huggingface.co/togethercomputer/RedPajama-INCITE-Chat-3B-v1)。
*  **gemma-7b-it** —— Google Gemma 家族中 7B 参数的指令微调版本，特性同 gemma-2b-it。详见 [model card](https://huggingface.co/google/gemma-7b-it)。
>**注意**：运行该模型需要先接受许可协议。
>你需要先注册 🤗 Hugging Face Hub 账号，访问 [HuggingFace model card](https://huggingface.co/google/gemma-7b-it)，仔细阅读使用条款并点击 accept，然后使用 access token 才能运行下方代码，参见[官方文档](https://huggingface.co/docs/hub/security-tokens)。
>可以使用以下代码在 notebook 环境中登录 Hugging Face Hub：

> *Original: red-pajama-3b-chat: A 2.8B parameter pre-trained language model based on GPT-NEOX architecture, developed by Together Computer and leaders from the open-source AI community, fine-tuned on OASST1 and Dolly2 datasets.*
>
> *gemma-7b-it: Instruction-tuned 7B variant of Google Gemma family of lightweight open models. Note: run model with demo, you will need to accept license agreement.*
 
\`\`\`python
    ## login to huggingfacehub to get access to pretrained model 

    from huggingface_hub import notebook_login, whoami

    try:
        whoami()
        print('Authorization token already provided')
    except OSError:
        notebook_login()
\`\`\`

* **llama-2-7b-chat** —— Meta 推出的第二代 Llama 模型 Llama 2 的 7B 参数对话版本，已针对对话场景做了微调与优化。Llama 2 系列模型规模覆盖 7B 至 70B。详见 [论文](https://ai.meta.com/research/publications/llama-2-open-foundation-and-fine-tuned-chat-models/)、[仓库](https://github.com/facebookresearch/llama) 和 [HuggingFace model card](https://huggingface.co/meta-llama/Llama-2-7b-chat-hf)。
>**注意**：运行该模型需要先接受许可协议。
>你需要先注册 🤗 Hugging Face Hub 账号，访问 [HuggingFace model card](https://huggingface.co/meta-llama/Llama-2-7b-chat-hf)，仔细阅读使用条款并点击 accept，然后使用 access token 才能运行下方代码，参见[官方文档](https://huggingface.co/docs/hub/security-tokens)。
>可以使用以下代码在 notebook 环境中登录 Hugging Face Hub：

> *Original: llama-2-7b-chat: LLama 2 is the second generation of LLama models developed by Meta. llama-2-7b-chat is the 7B parameters version finetuned and optimized for dialogue use case.*
 
\`\`\`python
    ## login to huggingfacehub to get access to pretrained model 

    from huggingface_hub import notebook_login, whoami

    try:
        whoami()
        print('Authorization token already provided')
    except OSError:
        notebook_login()
\`\`\`
* **qwen1.5-0.5b-chat / qwen1.5-1.8b-chat / qwen1.5-7b-chat** —— Qwen1.5 是 Qwen2 的 beta 版本，是一个基于 Transformer、decoder-only 的大语言模型系列，包含多种参数规模。架构使用了 SwiGLU 激活、attention QKV bias、grouped query attention 以及滑动窗口注意力与全注意力的混合等优化。详见 [model repository](https://huggingface.co/Qwen)。
* **qwen-7b-chat** —— 阿里云推出的通义千问大模型系列 7B 参数版本（Qwen-7B），基于 Transformer、在大规模网页文本、书籍、代码等数据上预训练。详见 [GitHub](https://github.com/QwenLM/Qwen)。
* **mpt-7b-chat** —— MosaicPretrainedTransformer (MPT) 家族成员，采用了优化的 Transformer 架构以提升训练和推理效率：包括性能优化的层实现，以及用 [ALiBi](https://arxiv.org/abs/2108.12409) 替代 positional embedding 以消除上下文长度限制。MPT-7B-chat 是用于对话生成的版本，在 ShareGPT-Vicuna、HC3、Alpaca、HH-RLHF、Evol-Instruct 等数据集上对 MPT-7B 微调而成。详见 [博客](https://www.mosaicml.com/blog/mpt-7b)、[仓库](https://github.com/mosaicml/llm-foundry/) 和 [HuggingFace model card](https://huggingface.co/mosaicml/mpt-7b-chat)。
* **chatglm3-6b** —— ChatGLM 系列最新的开源模型，在保留前两代流畅对话和低部署门槛的同时，使用了更多样的训练数据、更充分的训练步数与更合理的训练策略，并采用了全新的 [Prompt 格式](https://github.com/THUDM/ChatGLM3/blob/main/PROMPT_en.md)。详见 [model card](https://huggingface.co/THUDM/chatglm3-6b)。
* **mistral-7b** —— Mistral-7B-v0.1，70 亿参数的预训练生成式文本模型。详见 [model card](https://huggingface.co/mistralai/Mistral-7B-v0.1)、[论文](https://arxiv.org/abs/2310.06825) 和 [发布博客](https://mistral.ai/news/announcing-mistral-7b/)。
* **zephyr-7b-beta** —— Zephyr 系列定位为“乐于助人的助手”模型，beta 版本基于 [mistralai/Mistral-7B-v0.1](https://huggingface.co/mistralai/Mistral-7B-v0.1) 在公开和合成数据混合集上使用 [DPO](https://arxiv.org/abs/2305.18290) 微调。详见 [技术报告](https://arxiv.org/abs/2310.16944) 与 [HuggingFace model card](https://huggingface.co/HuggingFaceH4/zephyr-7b-beta)。
* **neural-chat-7b-v3-1** —— 在 Intel Gaudi 上对 Mistral-7b 微调的版本，使用开源数据集 [Open-Orca/SlimOrca](https://huggingface.co/datasets/Open-Orca/SlimOrca) 并通过 [DPO 算法](https://arxiv.org/abs/2305.18290) 对齐。详见 [model card](https://huggingface.co/Intel/neural-chat-7b-v3-1) 和 [博客](https://medium.com/@NeuralCompressor/the-practice-of-supervised-finetuning-and-direct-preference-optimization-on-habana-gaudi2-a1197d8a3cd3)。
* **notus-7b-v1** —— 使用 [DPO](https://arxiv.org/abs/2305.18290) 与相关 [RLHF](https://huggingface.co/blog/rlhf) 技术微调而成。第一版基于 zephyr-7b-sft 进行 DPO 微调，与 Zephyr-7B-beta 的唯一差异是 dDPO 所用的偏好数据集。在 [AlpacaEval](https://tatsu-lab.github.io/alpaca_eval/) 上超越了 Zephyr-7B-beta 和 Claude 2。详见 [model card](https://huggingface.co/argilla/notus-7b-v1)。
* **youri-7b-chat** —— 基于 Llama2 的模型，由 [Rinna Co., Ltd.](https://rinna.co.jp/) 在英日混合数据集上进一步预训练以增强日文能力。详见 [项目主页](https://huggingface.co/rinna/youri-7b)。
* **baichuan2-7b-chat** —— [百川智能](https://www.baichuan-ai.com/home) 推出的新一代大规模开源语言模型，基于 2.6 万亿 token 的高质量语料训练，在同尺寸的中英权威基准上达到最佳水平。
* **internlm2-chat-1.8b** —— InternLM2 系列第二代模型，相较上一代在推理、数学、编码等多个能力上均有显著提升。详见 [model repository](https://huggingface.co/internlm)。

> *Original: Detailed introductions of qwen1.5 series, qwen-7b-chat, mpt-7b-chat, chatglm3-6b, mistral-7b, zephyr-7b-beta, neural-chat-7b-v3-1, notus-7b-v1, youri-7b-chat, baichuan2-7b-chat and internlm2-chat-1.8b. Each bullet describes the model's origin, parameter scale, training data and key technical features. See the corresponding model cards / repositories / papers in the links above for full details.*


\`\`\`python
!pip install ipywidgets
from config import SUPPORTED_LLM_MODELS
import ipywidgets as widgets
\`\`\`

\`\`\`python
model_languages = list(SUPPORTED_LLM_MODELS)

model_language = widgets.Dropdown(
    options=model_languages,
    value=model_languages[0],
    description="Model Language:",
    disabled=False,
)

model_language
\`\`\`

\`\`\`python
model_ids = list(SUPPORTED_LLM_MODELS[model_language.value])

model_id = widgets.Dropdown(
    options=model_ids,
    value=model_ids[0],
    description="Model:",
    disabled=False,
)

model_id
\`\`\`

\`\`\`python
model_configuration = SUPPORTED_LLM_MODELS[model_language.value][model_id.value]
print(f"Selected model {model_id.value}")
\`\`\`

## 使用 Optimum Intel 实例化模型（Instantiate Model using Optimum Intel）
[返回目录](#Table-of-contents:)

Optimum Intel 可以从 [Hugging Face Hub](https://huggingface.co/docs/optimum/intel/hf.co/models) 加载经过优化的模型，并通过 Hugging Face API 构建在 OpenVINO Runtime 上运行的推理 pipeline。Optimum Inference 模型在 API 上与 Hugging Face Transformers 完全兼容，因此只需把 \`AutoModelForXxx\` 替换为对应的 \`OVModelForXxx\` 即可。

下面以 RedPajama 为例。

> *Original: Instantiate Model using Optimum Intel*
>
> *Optimum Intel can be used to load optimized models from the Hugging Face Hub and create pipelines to run an inference with OpenVINO Runtime using Hugging Face APIs. The Optimum Inference models are API compatible with Hugging Face Transformers models. This means we just need to replace AutoModelForXxx class with the corresponding OVModelForXxx class.*
>
> *Below is an example of the RedPajama model.*

\`\`\`diff
-from transformers import AutoModelForCausalLM
+from optimum.intel.openvino import OVModelForCausalLM
from transformers import AutoTokenizer, pipeline

model_id = "togethercomputer/RedPajama-INCITE-Chat-3B-v1"
-model = AutoModelForCausalLM.from_pretrained(model_id)
+model = OVModelForCausalLM.from_pretrained(model_id, export=True)
\`\`\`

模型类的初始化从调用 \`from_pretrained\` 开始。在下载并转换 Transformers 模型时需要加上 \`export=True\`，转换后的模型可以通过 \`save_pretrained\` 保存以便下次复用。Tokenizer 和 pipelines API 与 Optimum 模型完全兼容。

为了优化生成流程并更有效地利用内存，这里开启了 \`use_cache=True\`。由于输出端是自回归式的，一旦某个输出 token 的隐藏状态被计算出来，在后续每一步都不会再变，因此每次都重新计算很浪费。使用 cache 后，模型把已计算过的隐藏状态保存起来，在每一步只为最新生成的 token 计算隐藏状态，已有 token 复用之前的结果，从而把 Transformer 的生成复杂度从 $O(n^3)$ 降为 $O(n^2)$。更多原理可参考[这篇文章](https://scale.com/blog/pytorch-improvements#Text%20Translation)。开启该选项后，模型每一步以前一步的隐藏状态（缓存的 attention keys 和 values）为输入，并额外输出当前步的隐藏状态。这意味着后续迭代只需要提供上一步生成的新 token 与缓存的 key/value 即可预测下一个 token。

需要注意的是，目前 Optimum Intel 还未覆盖 MPT、Qwen 和 ChatGLM 模型，我们将手动进行转换并构建与 Optimum Intel 兼容的 wrapper。

> *Original: Model class initialization starts with calling from_pretrained method. When downloading and converting Transformers model, the parameter export=True should be added. The use_cache=True option is enabled to optimize the generation process — caching attention keys/values reduces the generation complexity from O(n^3) to O(n^2) for a transformer model. In our case, MPT, Qwen and ChatGLM model currently is not covered by Optimum Intel, we will convert it manually and create wrapper compatible with Optimum Intel.*

\`\`\`python
from modelscope import AutoModelForCausalLM, AutoConfig
from optimum.intel.openvino import OVModelForCausalLM
import openvino as ov
from pathlib import Path
import shutil
import torch
import logging
import nncf
import gc
from converter import converters, register_configs

register_configs()
\`\`\`

## 压缩模型权重（Compress model weights）
[返回目录](#Table-of-contents:)

权重压缩算法用于压缩模型权重，可以在权重远大于激活值的大型模型（如 LLM）上显著优化模型体积与推理性能。相比 INT8 压缩，INT4 压缩能进一步提升性能，但会带来轻微的精度损失。

### 使用 Optimum Intel 进行权重压缩（Weights Compression using Optimum Intel）
[返回目录](#Table-of-contents:)

Optimum Intel 通过 NNCF 提供了开箱即用的权重压缩支持。8-bit 压缩只需在 \`OVModelForCausalLM\` 的 \`from_pretrained()\` 中传入 \`load_in_8bit=True\`；4-bit 压缩则传入 \`quantization_config=OVWeightQuantizationConfig(bits=4, ...)\`，并通过参数指定位宽及其他压缩参数。下面我们将以 RedPajama、LLAMA 和 Zephyr 为例进行演示。

>**注意**：在 dGPU 上，INT4/INT8 压缩模型可能并不会带来加速。

### 使用 NNCF 直接进行权重压缩（Weights Compression using NNCF）
[返回目录](#Table-of-contents:)

也可以直接使用 NNCF 对 OpenVINO 模型做权重压缩。\`nncf.compress_weights\` 接收一个 OpenVINO 模型实例，并对其中的 Linear 与 Embedding 层做权重压缩。下面我们以 MPT 模型为例演示这种用法。

>**注意**：本教程会执行 FP16 和 INT4/INT8 权重压缩等多种转换流程，首次运行会比较占用内存与时间。可以在下方手动控制要使用的压缩精度。

> *Original: Compress model weights — The Weights Compression algorithm is aimed at compressing the weights of the models and can be used to optimize the model footprint and performance of large models where the size of weights is relatively larger than the size of activations.*
>
> *Weights Compression using Optimum Intel: Optimum Intel supports weight compression via NNCF out of the box. For 8-bit compression we pass load_in_8bit=True; for 4-bit we pass quantization_config=OVWeightQuantizationConfig(bits=4, ...).*
>
> *Weights Compression using NNCF: You can also perform weights compression for OpenVINO models using NNCF directly via nncf.compress_weights, which compresses Linear and Embedding layers.*

\`\`\`python
from IPython.display import display

prepare_int4_model = widgets.Checkbox(
    value=True,
    description="Prepare INT4 model",
    disabled=False,
)
prepare_int8_model = widgets.Checkbox(
    value=False,
    description="Prepare INT8 model",
    disabled=False,
)
prepare_fp16_model = widgets.Checkbox(
    value=False,
    description="Prepare FP16 model",
    disabled=False,
)

display(prepare_int4_model)
display(prepare_int8_model)
display(prepare_fp16_model)
\`\`\`

接下来分别保存浮点（FP16）和各类压缩后的模型变体。

> *Original: We can now save floating point and compressed model variants*

\`\`\`python
from optimum.intel import OVWeightQuantizationConfig
from modelscope import snapshot_download

nncf.set_log_level(logging.ERROR)

pt_model_id = model_configuration["model_id"]
pt_model_name = model_id.value.split("-")[0]
model_dir = snapshot_download(pt_model_id)
model_type = AutoConfig.from_pretrained(pt_model_id, trust_remote_code=True).model_type
fp16_model_dir = Path(model_id.value) / "FP16"
int8_model_dir = Path(model_id.value) / "INT8_compressed_weights"
int4_model_dir = Path(model_id.value) / "INT4_compressed_weights"


def convert_to_fp16():
    if (fp16_model_dir / "openvino_model.xml").exists():
        return
    if not model_configuration["remote"]:
        remote_code = model_configuration.get("remote_code", False)
        model_kwargs = {}
        if remote_code:
            model_kwargs = {
                "trust_remote_code": True,
                "config": AutoConfig.from_pretrained(pt_model_id, trust_remote_code=True)
            }
        ov_model = OVModelForCausalLM.from_pretrained(
            model_dir, export=True, compile=False, load_in_8bit=False, **model_kwargs
        )
        ov_model.half()
        ov_model.save_pretrained(fp16_model_dir)
        del ov_model
    else:
        model_kwargs = {}
        if "revision" in model_configuration:
            model_kwargs["revision"] = model_configuration["revision"]
        model = AutoModelForCausalLM.from_pretrained(
            pt_model_id,
            torch_dtype=torch.float32,
            trust_remote_code=True,
            **model_kwargs
        )
        converters[pt_model_name](model, fp16_model_dir)
        del model
    gc.collect()


def convert_to_int8():
    if (int8_model_dir / "openvino_model.xml").exists():
        return
    int8_model_dir.mkdir(parents=True, exist_ok=True)
    if not model_configuration["remote"]:
        remote_code = model_configuration.get("remote_code", False)
        model_kwargs = {}
        if remote_code:
            model_kwargs = {
                "trust_remote_code": True,
                "config": AutoConfig.from_pretrained(pt_model_id, trust_remote_code=True)
            }
        ov_model = OVModelForCausalLM.from_pretrained(
            model_dir, export=True, compile=False, load_in_8bit=True, **model_kwargs
        )
        ov_model.save_pretrained(int8_model_dir)
        del ov_model
    else:
        convert_to_fp16()
        ov_model = ov.Core().read_model(fp16_model_dir / "openvino_model.xml")
        shutil.copy(fp16_model_dir / "config.json", int8_model_dir / "config.json")
        configuration_file = fp16_model_dir / f"configuration_{model_type}.py"
        if configuration_file.exists():
            shutil.copy(
                configuration_file, int8_model_dir / f"configuration_{model_type}.py"
            )
        compressed_model = nncf.compress_weights(ov_model)
        ov.save_model(compressed_model, int8_model_dir / "openvino_model.xml")
        del ov_model
        del compressed_model
    gc.collect()


def convert_to_int4():
    compression_configs = {
        "zephyr-7b-beta": {
            "sym": True,
            "group_size": 64,
            "ratio": 0.6,
        },
        "mistral-7b": {
            "sym": True,
            "group_size": 64,
            "ratio": 0.6,
        },
        "minicpm-2b-dpo": {
            "sym": True,
            "group_size": 64,
            "ratio": 0.6,
        },
        "gemma-2b-it": {
            "sym": True,
            "group_size": 64,
            "ratio": 0.6,
        },
        "notus-7b-v1": {
            "sym": True,
            "group_size": 64,
            "ratio": 0.6,
        },
        "neural-chat-7b-v3-1": {
            "sym": True,
            "group_size": 64,
            "ratio": 0.6,
        },
        "llama-2-chat-7b": {
            "sym": True,
            "group_size": 128,
            "ratio": 0.8,
        },
        "gemma-7b-it": {
            "sym": True,
            "group_size": 128,
            "ratio": 0.8,
        },
        "chatglm2-6b": {
            "sym": True,
            "group_size": 128,
            "ratio": 0.72,
        },
        "qwen-7b-chat": {
            "sym": True,
            "group_size": 128, 
            "ratio": 0.6
        },
        'red-pajama-3b-chat': {
            "sym": False,
            "group_size": 128,
            "ratio": 0.5,
        },
        "default": {
            "sym": False,
            "group_size": 128,
            "ratio": 0.8,
        },
    }

    model_compression_params = compression_configs.get(
        model_id.value, compression_configs["default"]
    )
    if (int4_model_dir / "openvino_model.xml").exists():
        return
    int4_model_dir.mkdir(parents=True, exist_ok=True)
    if not model_configuration["remote"]:
        remote_code = model_configuration.get("remote_code", False)
        model_kwargs = {}
        if remote_code:
            model_kwargs = {
                "trust_remote_code" : True,
                "config": AutoConfig.from_pretrained(pt_model_id, trust_remote_code=True)
            }
        ov_model = OVModelForCausalLM.from_pretrained(
            model_dir, export=True, compile=False,
            quantization_config=OVWeightQuantizationConfig(bits=4, **model_compression_params),
            **model_kwargs
        )
        ov_model.save_pretrained(int4_model_dir)
        del ov_model
    else:
        convert_to_fp16()
        ov_model = ov.Core().read_model(fp16_model_dir / "openvino_model.xml")
        shutil.copy(fp16_model_dir / "config.json", int4_model_dir / "config.json")
        configuration_file = fp16_model_dir / f"configuration_{model_type}.py"
        if configuration_file.exists():
            shutil.copy(
                configuration_file, int4_model_dir / f"configuration_{model_type}.py"
            )
        mode = nncf.CompressWeightsMode.INT4_SYM if model_compression_params["sym"] else \\
            nncf.CompressWeightsMode.INT4_ASYM
        del model_compression_params["sym"]
        compressed_model = nncf.compress_weights(ov_model, mode=mode, **model_compression_params)
        ov.save_model(compressed_model, int4_model_dir / "openvino_model.xml")
        del ov_model
        del compressed_model
    gc.collect()


if prepare_fp16_model.value:
    convert_to_fp16()
if prepare_int8_model.value:
    convert_to_int8()
if prepare_int4_model.value:
    convert_to_int4()
\`\`\`

下面来对比不同压缩方式下的模型体积。

> *Original: Let's compare model size for different compression types*

\`\`\`python
fp16_weights = fp16_model_dir / "openvino_model.bin"
int8_weights = int8_model_dir / "openvino_model.bin"
int4_weights = int4_model_dir / "openvino_model.bin"

if fp16_weights.exists():
    print(f"Size of FP16 model is {fp16_weights.stat().st_size / 1024 / 1024:.2f} MB")
for precision, compressed_weights in zip([8, 4], [int8_weights, int4_weights]):
    if compressed_weights.exists():
        print(
            f"Size of model with INT{precision} compressed weights is {compressed_weights.stat().st_size / 1024 / 1024:.2f} MB"
        )
    if compressed_weights.exists() and fp16_weights.exists():
        print(
            f"Compression rate for INT{precision} model: {fp16_weights.stat().st_size / compressed_weights.stat().st_size:.3f}"
        )
\`\`\`

## 选择推理设备及模型变体（Select device for inference and model variant）
[返回目录](#Table-of-contents:)

>**注意**：在 dGPU 上，INT4/INT8 压缩模型可能并不会带来加速。

> *Original: Select device for inference and model variant. Note: There may be no speedup for INT4/INT8 compressed models on dGPU.*

\`\`\`python
core = ov.Core()
device = widgets.Dropdown(
    options=core.available_devices + ["AUTO"],
    value="CPU",
    description="Device:",
    disabled=False,
)

device
\`\`\`

下方代码会基于 \`OVModelForCausalLM\` 创建 \`OVMPTModel\` 和 \`OVCHATGLM2Model\` 等 wrapper 类。

> *Original: The cell below create OVMPTModel and OVCHATGLM2Model wrapper based on OVModelForCausalLM model.*

\`\`\`python
from ov_llm_model import model_classes
\`\`\`

下方代码演示如何根据所选的模型权重变体和推理设备实例化模型。

> *Original: The cell below demonstrates how to instantiate model based on selected variant of model weights and inference device.*

\`\`\`python
available_models = []
if int4_model_dir.exists():
    available_models.append("INT4")
if int8_model_dir.exists():
    available_models.append("INT8")
if fp16_model_dir.exists():
    available_models.append("FP16")

model_to_run = widgets.Dropdown(
    options=available_models,
    value=available_models[0],
    description="Model to run:",
    disabled=False,
)

model_to_run
\`\`\`

\`\`\`python
from modelscope import AutoTokenizer

if model_to_run.value == "INT4":
    model_dir = int4_model_dir
elif model_to_run.value == "INT8":
    model_dir = int8_model_dir
else:
    model_dir = fp16_model_dir
print(f"Loading model from {model_dir}")


ov_config = {"PERFORMANCE_HINT": "LATENCY", "NUM_STREAMS": "1", "CACHE_DIR": ""}

# On a GPU device a model is executed in FP16 precision. For red-pajama-3b-chat model there known accuracy
# issues caused by this, which we avoid by setting precision hint to "f32".
if model_id.value == "red-pajama-3b-chat" and "GPU" in core.available_devices and device.value in ["GPU", "AUTO"]:
    ov_config["INFERENCE_PRECISION_HINT"] = "f32"

model_name = model_configuration["model_id"]
class_key = model_id.value.split("-")[0]
tok = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)

model_class = (
    OVModelForCausalLM
    if not model_configuration["remote"]
    else model_classes[class_key]
)
ov_model = model_class.from_pretrained(
    model_dir,
    device=device.value,
    ov_config=ov_config,
    config=AutoConfig.from_pretrained(model_dir, trust_remote_code=True),
    trust_remote_code=True,
)
\`\`\`

\`\`\`python
tokenizer_kwargs = model_configuration.get("tokenizer_kwargs", {})
test_string = "2 + 2 ="
input_tokens = tok(test_string, return_tensors="pt", **tokenizer_kwargs)
answer = ov_model.generate(**input_tokens, max_new_tokens=2)
print(tok.batch_decode(answer, skip_special_tokens=True)[0])
\`\`\`

## 运行聊天机器人（Run Chatbot）
[返回目录](#Table-of-contents:)

模型准备好之后，我们就可以基于 [Gradio](https://www.gradio.app/) 搭建聊天机器人界面。下图展示了整体 pipeline 的工作方式：

![generation pipeline](https://user-images.githubusercontent.com/29454499/255523209-d9336491-c7ba-4dc1-98f0-07f23743ce89.png)

可以看到，整个流程与“指令跟随（instruction-following）”非常相似，区别在于：每次会把已有的历史对话连同当前用户问题一并作为输入，从而获得更长的上下文。第一轮时，用户的指令会与历史对话（如有）拼接、用 tokenizer 转换为 token id，再喂给模型；模型输出每个 token 的 logits（概率），下一个 token 的选择则由具体的解码策略决定，常见的解码方法可参考[这篇博客](https://huggingface.co/blog/how-to-generate)。生成结果会更新对话历史，从而让下一轮问题与之前的内容形成更紧密的联系，用户也可以基于已有回答继续追问。

下面几个参数可以用来控制生成文本的质量：

  * \`Temperature\` —— 控制生成文本的创造性。调整 temperature 会影响模型输出的概率分布，使文本更聚焦或更发散。
  以下面这句为例：模型需要补全 “The cat is ____.”，候选 token 概率为：

    playing: 0.5
    sleeping: 0.25
    eating: 0.15
    driving: 0.05
    flying: 0.05

    - **低 temperature**（如 0.2）：模型更聚焦、更确定，倾向于选择概率最高的 token，例如 "playing"。
    - **中 temperature**（如 1.0）：在创造性与确定性之间取得平衡，按概率分布采样，"playing"、"sleeping"、"eating" 都可能被选中。
    - **高 temperature**（如 2.0）：模型更倾向冒险，增加低概率 token 的入选机会，例如 "driving"、"flying"。

  * \`Top-p\`（也叫 nucleus sampling）—— 基于累积概率控制候选 token 的范围。值越小越聚焦，越大越发散。继续上面 cat 的例子：
    - **低 top_p**（如 0.5）：仅考虑累积概率最高的 token，如 "playing"。
    - **中 top_p**（如 0.8）：考虑累积概率较高的 token，如 "playing"、"sleeping"、"eating"。
    - **高 top_p**（如 1.0）：考虑全部 token，包括 "driving"、"flying" 等低概率项。

  * \`Top-k\` —— 另一种流行的采样策略。与 Top-P（在累积概率超过 P 的最小集合中采样）相对，Top-K 取概率最高的 K 个 token，将概率质量在这 K 个 token 中重新分配。比如取 k=3，cat 的例子里只有 "playing"、"sleeping"、"eating" 会成为候选下一个词。

  * \`Repetition Penalty\` —— 重复惩罚。会根据 token 在文本（包括输入提示）中出现的次数对其进行惩罚，出现次数越多惩罚越大。取值为 1 表示不惩罚，大于 1 时会抑制重复 token 的出现。

> *Original: Run Chatbot — Now, when model created, we can setup Chatbot interface using Gradio. The pipeline is very similar to instruction-following but additionally passes the previous conversation history along with the next user question for getting wider input context. The model generates probabilities for all tokens in logits format; the way the next token will be selected over predicted probabilities is driven by the selected decoding methodology.*
>
> *Generation parameters: Temperature controls creativity by adjusting the model's probability distribution. Top-p (nucleus sampling) considers tokens by cumulative probability. Top-k filters the K most likely next words. Repetition Penalty penalizes tokens based on how frequently they have already appeared.*

\`\`\`python
from threading import Event, Thread
from uuid import uuid4
from typing import List, Tuple
import gradio as gr
from transformers import (
    AutoTokenizer,
    StoppingCriteria,
    StoppingCriteriaList,
    TextIteratorStreamer,
)
import os
name = os.environ['JUPYTER_NAME']
region = os.environ["dsw_region"]

host = "dsw-gateway-{region}.data.aliyun.com".format(region=region)
host


model_name = model_configuration["model_id"]
start_message = model_configuration["start_message"]
history_template = model_configuration.get("history_template")
current_message_template = model_configuration.get("current_message_template")
stop_tokens = model_configuration.get("stop_tokens")
tokenizer_kwargs = model_configuration.get("tokenizer_kwargs", {})

chinese_examples = [
    ["你好!"],
    ["你是谁?"],
    ["请介绍一下上海"],
    ["请介绍一下英特尔公司"],
    ["晚上睡不着怎么办？"],
    ["给我讲一个年轻人奋斗创业最终取得成功的故事。"],
    ["给这个故事起一个标题。"],
]

english_examples = [
    ["Hello there! How are you doing?"],
    ["What is OpenVINO?"],
    ["Who are you?"],
    ["Can you explain to me briefly what is Python programming language?"],
    ["Explain the plot of Cinderella in a sentence."],
    ["What are some common mistakes to avoid when writing code?"],
    [
        "Write a 100-word blog post on “Benefits of Artificial Intelligence and OpenVINO“"
    ],
]

japanese_examples = [
    ["こんにちは！調子はどうですか?"],
    ["OpenVINOとは何ですか?"],
    ["あなたは誰ですか?"],
    ["Pythonプログラミング言語とは何か簡単に説明してもらえますか?"],
    ["シンデレラのあらすじを一文で説明してください。"],
    ["コードを書くときに避けるべきよくある間違いは何ですか?"],
    ["人工知能と「OpenVINOの利点」について100語程度のブログ記事を書いてください。"],
]

examples = (
    chinese_examples
    if (model_language.value == "Chinese")
    else japanese_examples
    if (model_language.value == "Japanese")
    else english_examples
)

max_new_tokens = 256


class StopOnTokens(StoppingCriteria):
    def __init__(self, token_ids):
        self.token_ids = token_ids

    def __call__(
        self, input_ids: torch.LongTensor, scores: torch.FloatTensor, **kwargs
    ) -> bool:
        for stop_id in self.token_ids:
            if input_ids[0][-1] == stop_id:
                return True
        return False


if stop_tokens is not None:
    if isinstance(stop_tokens[0], str):
        stop_tokens = tok.convert_tokens_to_ids(stop_tokens)

    stop_tokens = [StopOnTokens(stop_tokens)]


def default_partial_text_processor(partial_text: str, new_text: str):
    """
    helper for updating partially generated answer, used by default

    Params:
      partial_text: text buffer for storing previosly generated text
      new_text: text update for the current step
    Returns:
      updated text string

    """
    partial_text += new_text
    return partial_text


text_processor = model_configuration.get(
    "partial_text_processor", default_partial_text_processor
)


def convert_history_to_token(history: List[Tuple[str, str]]):
    """
    function for conversion history stored as list pairs of user and assistant messages to tokens according to model expected conversation template
    Params:
      history: dialogue history
    Returns:
      history in token format
    """
    if pt_model_name == "baichuan2":
        system_tokens = tok.encode(start_message)
        history_tokens = []
        for (old_query, response) in history[:-1]:
            round_tokens = []
            round_tokens.append(195)
            round_tokens.extend(tok.encode(old_query))
            round_tokens.append(196)
            round_tokens.extend(tok.encode(response))
            history_tokens = round_tokens + history_tokens
        input_tokens = system_tokens + history_tokens
        input_tokens.append(195)
        input_tokens.extend(tok.encode(history[-1][0]))
        input_tokens.append(196)
        input_token = torch.LongTensor([input_tokens])
    elif history_template is None:
        messages = [{"role": "system", "content": start_message}]
        for idx, (user_msg, model_msg) in enumerate(history):
            if idx == len(history) - 1 and not model_msg:
                messages.append({"role": "user", "content": user_msg})
                break
            if user_msg:
                messages.append({"role": "user", "content": user_msg})
            if model_msg:
                messages.append({"role": "assistant", "content": model_msg})
                
        input_token = tok.apply_chat_template(messages,
                                              add_generation_prompt=True,
                                              tokenize=True,
                                              return_tensors="pt")
    else:
        text = start_message + "".join(
            [
                "".join(
                    [
                        history_template.format(
                            num=round, user=item[0], assistant=item[1]
                        )
                    ]
                )
                for round, item in enumerate(history[:-1])
            ]
        )
        text += "".join(
            [
                "".join(
                    [
                        current_message_template.format(
                            num=len(history) + 1,
                            user=history[-1][0],
                            assistant=history[-1][1],
                        )
                    ]
                )
            ]
        )
        input_token = tok(text, return_tensors="pt", **tokenizer_kwargs).input_ids
    return input_token


def user(message, history):
    """
    callback function for updating user messages in interface on submit button click

    Params:
      message: current message
      history: conversation history
    Returns:
      None
    """
    # Append the user's message to the conversation history
    return "", history + [[message, ""]]


def bot(history, temperature, top_p, top_k, repetition_penalty, conversation_id):
    """
    callback function for running chatbot on submit button click

    Params:
      history: conversation history
      temperature:  parameter for control the level of creativity in AI-generated text.
                    By adjusting the \`temperature\`, you can influence the AI model's probability distribution, making the text more focused or diverse.
      top_p: parameter for control the range of tokens considered by the AI model based on their cumulative probability.
      top_k: parameter for control the range of tokens considered by the AI model based on their cumulative probability, selecting number of tokens with highest probability.
      repetition_penalty: parameter for penalizing tokens based on how frequently they occur in the text.
      conversation_id: unique conversation identifier.

    """

    # Construct the input message string for the model by concatenating the current system message and conversation history
    # Tokenize the messages string
    input_ids = convert_history_to_token(history)
    if input_ids.shape[1] > 2000:
        history = [history[-1]]
        input_ids = convert_history_to_token(history)
    streamer = TextIteratorStreamer(
        tok, timeout=30.0, skip_prompt=True, skip_special_tokens=True
    )
    generate_kwargs = dict(
        input_ids=input_ids,
        max_new_tokens=max_new_tokens,
        temperature=temperature,
        do_sample=temperature > 0.0,
        top_p=top_p,
        top_k=top_k,
        repetition_penalty=repetition_penalty,
        streamer=streamer,
    )
    if stop_tokens is not None:
        generate_kwargs["stopping_criteria"] = StoppingCriteriaList(
            stop_tokens)

    stream_complete = Event()

    def generate_and_signal_complete():
        """
        genration function for single thread
        """
        global start_time
        ov_model.generate(**generate_kwargs)
        stream_complete.set()

    t1 = Thread(target=generate_and_signal_complete)
    t1.start()

    # Initialize an empty string to store the generated text
    partial_text = ""
    for new_text in streamer:
        partial_text = text_processor(partial_text, new_text)
        history[-1][1] = partial_text
        yield history


def request_cancel():
    ov_model.request.cancel()


def get_uuid():
    """
    universal unique identifier for thread
    """
    return str(uuid4())


with gr.Blocks(
    theme=gr.themes.Soft(),
    css=".disclaimer {font-variant-caps: all-small-caps;}",
) as demo:
    conversation_id = gr.State(get_uuid)
    gr.Markdown(
        f"""<h1><center>OpenVINO {model_id.value} Chatbot</center></h1>""")
    chatbot = gr.Chatbot(height=500)
    with gr.Row():
        with gr.Column():
            msg = gr.Textbox(
                label="Chat Message Box",
                placeholder="Chat Message Box",
                show_label=False,
                container=False,
            )
        with gr.Column():
            with gr.Row():
                submit = gr.Button("Submit")
                stop = gr.Button("Stop")
                clear = gr.Button("Clear")
    with gr.Row():
        with gr.Accordion("Advanced Options:", open=False):
            with gr.Row():
                with gr.Column():
                    with gr.Row():
                        temperature = gr.Slider(
                            label="Temperature",
                            value=0.1,
                            minimum=0.0,
                            maximum=1.0,
                            step=0.1,
                            interactive=True,
                            info="Higher values produce more diverse outputs",
                        )
                with gr.Column():
                    with gr.Row():
                        top_p = gr.Slider(
                            label="Top-p (nucleus sampling)",
                            value=1.0,
                            minimum=0.0,
                            maximum=1,
                            step=0.01,
                            interactive=True,
                            info=(
                                "Sample from the smallest possible set of tokens whose cumulative probability "
                                "exceeds top_p. Set to 1 to disable and sample from all tokens."
                            ),
                        )
                with gr.Column():
                    with gr.Row():
                        top_k = gr.Slider(
                            label="Top-k",
                            value=50,
                            minimum=0.0,
                            maximum=200,
                            step=1,
                            interactive=True,
                            info="Sample from a shortlist of top-k tokens — 0 to disable and sample from all tokens.",
                        )
                with gr.Column():
                    with gr.Row():
                        repetition_penalty = gr.Slider(
                            label="Repetition Penalty",
                            value=1.1,
                            minimum=1.0,
                            maximum=2.0,
                            step=0.1,
                            interactive=True,
                            info="Penalize repetition — 1.0 to disable.",
                        )
    gr.Examples(
        examples, inputs=msg, label="Click on any example and press the 'Submit' button"
    )

    submit_event = msg.submit(
        fn=user,
        inputs=[msg, chatbot],
        outputs=[msg, chatbot],
        queue=False,
    ).then(
        fn=bot,
        inputs=[
            chatbot,
            temperature,
            top_p,
            top_k,
            repetition_penalty,
            conversation_id,
        ],
        outputs=chatbot,
        queue=True,
    )
    submit_click_event = submit.click(
        fn=user,
        inputs=[msg, chatbot],
        outputs=[msg, chatbot],
        queue=False,
    ).then(
        fn=bot,
        inputs=[
            chatbot,
            temperature,
            top_p,
            top_k,
            repetition_penalty,
            conversation_id,
        ],
        outputs=chatbot,
        queue=True,
    )
    stop.click(
        fn=request_cancel,
        inputs=None,
        outputs=None,
        cancels=[submit_event, submit_click_event],
        queue=False,
    )
    clear.click(lambda: None, None, chatbot, queue=False)

# if you are launching remotely, specify server_name and server_port
#  demo.launch(server_name='your server name', server_port='server port in int')
# if you have any issue to launch on your platform, you can pass share=True to launch method:
# demo.launch(share=True)
# it creates a publicly shareable link for the interface. Read more in the docs: https://gradio.app/docs/
port = 7865
root_path = f'/{name}/proxy/{port}'
demo.launch(root_path=root_path,server_port=port)
\`\`\`

\`\`\`python
# please uncomment and run this cell for stopping gradio interface
# demo.close()
\`\`\``
    },
    {
      id: 'nb-llm-rag-llamaindex',
      title: 'RAG + Rerank 实战',
      file: 'LLM-tutorial/notebook/RAG+Rerank+Llamaindex.ipynb',
      difficulty: '中级',
      duration: '0.5h',
      week: 4,
      phase: 4,
      keywords: ['RAG', 'Rerank', 'LlamaIndex'],
      content: `\`\`\`python
!pip install transformers -U
!pip install llama-index llama-index-llms-huggingface ipywidgets
!pip install sentence-transformers
\`\`\`

\`\`\`python
!wget https://modelscope.oss-cn-beijing.aliyuncs.com/resource/rag/xianjiaoda.md
!mkdir -p /mnt/workspace/custom_data
!mv /mnt/workspace/xianjiaoda.md /mnt/workspace/custom_data
\`\`\`

\`\`\`python
import logging
import sys
from abc import ABC
from typing import Any, List

import pandas as pd
import torch
from IPython.display import display, HTML
from llama_index.core import QueryBundle
from llama_index.core import (
    SimpleDirectoryReader,
    VectorStoreIndex,
    Settings,
    ServiceContext,
    set_global_service_context,
)
from llama_index.core.base.embeddings.base import BaseEmbedding, Embedding
from llama_index.core.postprocessor import SentenceTransformerRerank
from llama_index.core.prompts import PromptTemplate
from llama_index.core.retrievers import VectorIndexRetriever
from llama_index.llms.huggingface import HuggingFaceLLM
from modelscope import snapshot_download
from transformers import AutoModelForSequenceClassification, AutoTokenizer

logging.basicConfig(stream=sys.stdout, level=logging.INFO)
logging.getLogger().addHandler(logging.StreamHandler(stream=sys.stdout))

# download QWEN model from modelscope
qwen15_4B_CHAT = "qwen/Qwen1.5-4B-Chat"
selected_model = snapshot_download(qwen15_4B_CHAT)

# define sys prompt
SYSTEM_PROMPT = """You are a helpful AI assistant."""
query_wrapper_prompt = PromptTemplate(
    "[INST]<<SYS>>\\n" + SYSTEM_PROMPT + "<</SYS>>\\n\\n{query_str}[/INST] "
)

# create HuggingFaceLLM with qwen1.5
llm = HuggingFaceLLM(
    context_window=4096,
    max_new_tokens=2048,
    generate_kwargs={"temperature": 0.0, "do_sample": False},
    query_wrapper_prompt=query_wrapper_prompt,
    tokenizer_name=selected_model,
    model_name=selected_model,
    device_map="auto",
    # change these settings below depending on your GPU
    model_kwargs={"torch_dtype": torch.float16},
)
print("llm created")

rerank_llm_name = "AI-ModelScope/bge-reranker-v2-m3"
downloaded_rerank_model = snapshot_download(rerank_llm_name)
rerank_llm = SentenceTransformerRerank(model=downloaded_rerank_model, top_n=3)
print("rerank_llm created", rerank_llm_name)


# wrap modelscope embedding for llama-index (based on BaseEmbedding)
class ModelScopeEmbeddings4LlamaIndex(BaseEmbedding, ABC):
    embed: Any = None
    model_id: str = "damo/nlp_gte_sentence-embedding_chinese-base"

    def __init__(
            self,
            model_id: str,
            **kwargs: Any,
    ) -> None:
        super().__init__(**kwargs)
        try:
            from modelscope.models import Model
            from modelscope.pipelines import pipeline
            from modelscope.utils.constant import Tasks
            # 使用modelscope的embedding模型（包含下载）
            self.embed = pipeline(Tasks.sentence_embedding, model=self.model_id)

        except ImportError as e:
            raise ValueError(
                "Could not import some python packages." "Please install it with \`pip install modelscope\`."
            ) from e

    def _get_query_embedding(self, query: str) -> Embedding:
        text = query.replace("\\n", " ")
        inputs = {"source_sentence": [text]}
        return self.embed(input=inputs)['text_embedding'][0].tolist()

    def _get_text_embedding(self, text: str) -> Embedding:
        text = text.replace("\\n", " ")
        inputs = {"source_sentence": [text]}
        return self.embed(input=inputs)['text_embedding'][0].tolist()

    def _get_text_embeddings(self, texts: List[str]) -> List[Embedding]:
        texts = list(map(lambda x: x.replace("\\n", " "), texts))
        inputs = {"source_sentence": texts}
        result = self.embed(input=inputs)['text_embedding']
        #print('@@@@DEBUG2, type = ', type(result))
        return result.tolist()

    async def _aget_query_embedding(self, query: str) -> Embedding:
        return self._get_query_embedding(query)


embedding_model = "damo/nlp_gte_sentence-embedding_chinese-base"
embeddings = ModelScopeEmbeddings4LlamaIndex(model_id=embedding_model)
service_context = ServiceContext.from_defaults(embed_model=embeddings, llm=llm)
set_global_service_context(service_context)
Settings.embed_model = embeddings

# load example documents
#documents = SimpleDirectoryReader("/mnt/workspace/data/paul_graham/").load_data()
documents = SimpleDirectoryReader("/mnt/workspace/custom_data/").load_data()

# create Vector DB
index = VectorStoreIndex.from_documents(documents)

# set Logging to DEBUG for more detailed outputs
#query_engine = index.as_query_engine(similarity_top_k=10, node_postprocessors=[rerank_llm])

# response = query_engine.query("ModelScope上模型涵盖了哪些领域？")
# print(response)
#response = query_engine.query("西安交大由哪几个学校组成")
#print(response)



\`\`\`

\`\`\`python
from time import time

query_engine = index.as_query_engine(similarity_top_k=10, node_postprocessors=[rerank_llm])

now = time()
response = query_engine.query("西安交大由哪几个学校组成")
print(response)
print(f"Elapsed: {round(time() - now, 2)}s")
\`\`\`

\`\`\`python
print(response.get_formatted_sources(length=200))
\`\`\`

\`\`\`python
from time import time
# set Logging to DEBUG for more detailed outputs
query_engine = index.as_query_engine(similarity_top_k=10)

# response = query_engine.query("ModelScope上模型涵盖了哪些领域？")
# print(response)
now = time()
response = query_engine.query("西安交大由哪几个学校组成")
print(response)
print(f"Elapsed: {round(time() - now, 2)}s")
\`\`\``
    },
    {
      id: 'nb-llm-ragflow',
      title: 'RAGFlow 框架部署',
      file: 'LLM-tutorial/notebook/RAGFlow.ipynb',
      difficulty: '中级',
      duration: '1h',
      week: 0,
      phase: 0,
      keywords: ['RAGFlow', 'Docker', 'RAG'],
      content: `## 十分钟速通RAGFlow
RAGFlow是一款基于深度文档理解构建的开源 RAG（Retrieval-Augmented Generation）引擎。RAGFlow 可以为各种规模的企业及提供一套专业的 RAG 工作流程，结合大语言模型（LLM）针对用户群体不同的复杂格式数据提供可靠的问答以及有理有据的引用

从具体功能上来讲，RAGFlow提供了以下几点能力：

### 一，"Quality in,Quality Out"
    1、基于深度文档理解，能够从各类复杂格式的非结构化数据中提取真知灼见。
    2、真正在无限上下文（token）的场景下快速完成大海捞针测试。
### 二，基于模版的文本切片
    1、不仅仅是智能，更重要的是可控可解释。
    2、多种文本模版可供选择。
### 三，有理有据，最大程度降低幻觉（hallucination）
    1、文本切片过程可视化，支持手动调整。
    2、有理有据：答案提供关键引用的快照并支持追根溯源。
### 四，兼容各类异构数据源
    支持丰富的文件类型，包括Word文档、PPT、excel表格、txt文件、图片、PDF、影印件、复印件、结构化数据、网页等。
### 五，全程无忧、自动化的RAG工作流
    1、全面优化的 RAG 工作流可以支持从个人应用乃至超大型企业的各类生态系统。
    2、大语言模型 LLM 以及向量模型均支持配置。
    3、基于多路召回、融合重排序。
    4、提供易用的 API，可以轻松集成到各类企业系统。
RAGFlow框架是需要进行部署的，但是也提供了一个线上简单demo以供试用：https://demo.ragflow.io RAGFlow截至目前已经达到了4w+ star。在这个ipynb中，我们会尝试本地搭建RAGFlow环境，并配置一个简单的RAGFlow聊天助手，以展示RAGFlow的简单易用性。

# 方式1、使用docker方式启动RAGFlow服务

### 📝 前提条件

- CPU >= 4 核
- RAM >= 16 GB
- Disk >= 50 GB
- Docker >= 24.0.0 & Docker Compose >= v2.26.1
  > 如果你并没有在本机安装 Docker（Windows、Mac，或者 Linux）, 可以参考文档 [Install Docker Engine](https://docs.docker.com/engine/install/) 自行安装。

### 🚀 启动服务器

1. 确保 \`vm.max_map_count\` 不小于 262144：

   > 如需确认 \`vm.max_map_count\` 的大小：
   >
   > \`\`\`bash
   > $ sysctl vm.max_map_count
   > \`\`\`
   >
   > 如果 \`vm.max_map_count\` 的值小于 262144，可以进行重置：
   >
   > \`\`\`bash
   > # 这里我们设为 262144:
   > $ sudo sysctl -w vm.max_map_count=262144
   > \`\`\`
   >
   > 你的改动会在下次系统重启时被重置。如果希望做永久改动，还需要在 **/etc/sysctl.conf** 文件里把 \`vm.max_map_count\` 的值再相应更新一遍：
   >
   > \`\`\`bash
   > vm.max_map_count=262144
   > \`\`\`

\`\`\`python
# 首先我们需要Clone RAGFlow的代码,Clone只需要运行一次即可
!git clone https://github.com/infiniflow/ragflow.git
\`\`\`

\`\`\`python
# 进入 docker 文件夹，利用提前编译好的 Docker 镜像启动服务器：
%cd ragflow/docker
!docker compose -f docker-compose.yml up -d

# 如果你遇到 Docker 镜像拉不下来的问题，可以在 docker/.env 文件内根据变量 RAGFLOW_IMAGE 的注释提示选择华为云或者阿里云的相应镜像。

# 华为云镜像名：swr.cn-north-4.myhuaweicloud.com/infiniflow/ragflow
# 阿里云镜像名：registry.cn-hangzhou.aliyuncs.com/infiniflow/ragflow
\`\`\`

\`\`\`python
# 服务器启动成功后再次确认服务器状态：
!docker logs -f ragflow-server
\`\`\`

   _出现以下界面提示说明服务器启动成功：_

   \`\`\`bash
        ____   ___    ______ ______ __
       / __ \\ /   |  / ____// ____// /____  _      __
      / /_/ // /| | / / __ / /_   / // __ \\| | /| / /
     / _, _// ___ |/ /_/ // __/  / // /_/ /| |/ |/ /
    /_/ |_|/_/  |_|\\____//_/    /_/ \\____/ |__/|__/

    * Running on all addresses (0.0.0.0)
    * Running on http://127.0.0.1:9380
    * Running on http://x.x.x.x:9380
    INFO:werkzeug:Press CTRL+C to quit
   \`\`\`

   > 如果您跳过这一步系统确认步骤就登录 RAGFlow，你的浏览器有可能会提示 \`network anormal\` 或 \`网络异常\`，因为 RAGFlow 可能并未完全启动成功。

5. 在你的浏览器中输入你的服务器对应的 IP 地址并登录 RAGFlow。
   > 上面这个例子中，您只需输入 http://IP_OF_YOUR_MACHINE 即可：未改动过配置则无需输入端口（默认的 HTTP 服务端口 80）。
6. 在 [service_conf.yaml.template](./docker/service_conf.yaml.template) 文件的 \`user_default_llm\` 栏配置 LLM factory，并在 \`API_KEY\` 栏填写和你选择的大模型相对应的 API key。

   > 详见 [llm_api_key_setup](https://ragflow.io/docs/dev/llm_api_key_setup)。

   _好戏开始，接着奏乐接着舞！_


## 方式二 以源代码方式启动RAFGFlow服务
这种方式比较复杂，对RAGFlow有开发需求的可以选择这一种

\`\`\`python
# 安装 uv。如已经安装，可跳过本步骤：
!pipx install uv
!export UV_INDEX=https://pypi.tuna.tsinghua.edu.cn/simple
\`\`\`

\`\`\`python
# 下载源代码并安装 Python 依赖：
!git clone https://github.com/infiniflow/ragflow.git
%cd ragflow/
!uv sync --python 3.10 --all-extras # install RAGFlow dependent python modules
\`\`\`

\`\`\`python
# 通过 Docker Compose 启动依赖的服务（MinIO, Elasticsearch, Redis, and MySQL）：
!docker compose -f docker/docker-compose-base.yml up -d

# 在 \`/etc/hosts\` 中添加以下代码，将 **conf/service_conf.yaml** 文件中的所有 host 地址都解析为 \`127.0.0.1\`：
# 127.0.0.1       es01 infinity mysql minio redis

\`\`\`

\`\`\`python
# 如果无法访问 HuggingFace，可以把环境变量 \`HF_ENDPOINT\` 设成相应的镜像站点：
!export HF_ENDPOINT=https://hf-mirror.com

\`\`\`

\`\`\`python
# 启动后端服务：
!source .venv/bin/activate
!export PYTHONPATH=$(pwd)
!bash docker/launch_backend_service.sh
\`\`\`

\`\`\`python
# 安装前端依赖：
%cd web
!npm install
\`\`\`

\`\`\`python
# 启动前端服务：
!npm run dev
\`\`\`

出现以下界面说明系统已经成功启动
![image.png](LLM-tutorial/notebook/attachment:3914e855-3f02-48ec-b382-44c6b9d44e3b.png)

使用RAGFlow是非常直观简单的。首先你需要根据现有的模型供应商选择一个模型。我们以魔搭社区ModelScope为例来介绍如何下载需要的模型，其他的模型供应商做法类似。
ModelScope魔搭社区在RAGFlow的Repo中主要提供了下载chat模型的功能。
![image.png](LLM-tutorial/notebook/attachment:0eb0bbda-9226-497c-8d99-4e265d0ad304.png)
这里以RAGFlow的demo试用界面为例，可以看到首页上有几个功能模块，点击在最右上角的头像图标，可以进入设置界面。
![image.png](LLM-tutorial/notebook/attachment:3aa9a330-1760-48c0-b5fc-5062816e3fc3.png)
在设置界面的侧边栏，点击模型提供商，可以看到RAGFlow支持的模型厂商，这里以modelscope为例。
找到modelscope的模型卡片，点击添加模型。会出现模型添加的选择框。
![image.png](LLM-tutorial/notebook/attachment:7ede8974-7697-49ce-a43d-3010c0e9a150.png)
值得注意的是，这里需要的参数可以在下面的如何集成ModelScope链接中找到，像是基础Url，以及ModelScope的免费API-key如何获取等等。
关于魔搭支持的模型，可以在魔搭社区的模型库中筛选得到。如下图：
![image.png](LLM-tutorial/notebook/attachment:dd91002c-9020-49ac-a393-383dd4f67192.png)
选择需要的模型，点击模型卡片进入详情页，复制模型ID，返回RAGFlow的界面进行填写。
![image.png](LLM-tutorial/notebook/attachment:a91bf7f3-5e3c-412b-8e66-fb50e3ba9161.png)
点击确定即可添加模型。添加模型完成之后，会在上面的已添加的模型中看到从魔搭添加的模型列表。
回到RAGFlow的首页，点击新建知识库进行文档的上传，输入知识库名称之后来到详情页
![image.png](LLM-tutorial/notebook/attachment:6967d33e-5652-4250-8865-d3fa842cdbbc.png)
可以根据需要上传本地文档，或者新建空文档。
![image.png](LLM-tutorial/notebook/attachment:14afdb31-0de4-46ea-9818-0f89e58aee0e.png)
上传成功之后点击解析按钮，文档解析成功之后就可以进行知识库的使用了！
![image.png](LLM-tutorial/notebook/attachment:5db3b9a6-f011-4608-8482-c35c4db9e801.png)
点击聊天模块，新建助理，来到助理设置界面，可以对助理的信息进行设置，比如名字、开场白、头像、提示引擎、以及聊天模型的选择等等。配置完成之后就可以开始使用从魔搭社区下载好的模型了。
![image.png](LLM-tutorial/notebook/attachment:34af6e9d-6581-4efe-9103-477d35806766.png)
![image.png](LLM-tutorial/notebook/attachment:f1bae9e5-39cd-4ced-89b5-d59746ff1a9b.png)`
    },
    {
      id: 'nb-llm-vlmevalkit',
      title: '多模态模型评估实战',
      file: 'LLM-tutorial/notebook/VLMEvalKit多模态模型评估.ipynb',
      difficulty: '中级',
      duration: '0.5h',
      week: 4,
      phase: 4,
      keywords: ['VLMEvalKit', 'EvalScope'],
      content: `# 使用VLMEvalKit进行多模态模型评估

VLMEvalKit (python 包名为 vlmeval) 是一款专为大型视觉语言模型 (Large Vision-Language Models， LVLMs) 评测而设计的开源工具包。该工具支持在各种基准测试上对大型视觉语言模型进行一键评估，无需进行繁重的数据准备工作，让评估过程更加简便。

以下展示两种方式进行模型评估：
1. 使用EvalScope封装的VLMEvalKit评测接口
2. 直接使用VLMEvalKit评测接口

## 1. 使用EvalScope封装的VLMEvalKit评测接口

[EvalScope](https://github.com/modelscope/evalscope) 是魔搭社区官方推出的模型评估与性能基准测试框架，内置多个常用测试基准和评估指标，如MMLU、CMMLU、C-Eval、GSM8K、ARC、HellaSwag、TruthfulQA、MATH和HumanEval等；支持多种类型的模型评测，包括LLM、多模态LLM、embedding模型和reranker模型。EvalScope还适用于多种评测场景，如端到端RAG评测、竞技场模式和模型推理性能压测等。此外，通过ms-swift训练框架的无缝集成，可一键发起评测，实现了模型训练到评测的全链路支持。

使用指南：[EvalScope使用指南](https://evalscope.readthedocs.io/zh-cn/latest/user_guides/backend/vlmevalkit_backend.html)

### 环境准备

\`\`\`python
!pip install evalscope[vlmeval] -U
!pip install ms-swift -U
\`\`\`

### 部署模型

\`\`\`python
!CUDA_VISIBLE_DEVICES=0 swift deploy --model_type internvl2-8b --port 8000
\`\`\`

\`\`\`python
task_cfg_dict = {
    'eval_backend': 'VLMEvalKit',
    'eval_config': {
        'data': ['SEEDBench_IMG', 'ChartQA_TEST'],
        'limit': 30,
        'mode': 'all',
        'model': [{
            'api_base': 'http://localhost:8000/v1/chat/completions',
            'key': 'EMPTY',
            'name': 'CustomAPIModel',
            'temperature': 0.0,
            'type': 'internvl2-8b'
        }],
        'reuse': False,
        'work_dir': 'outputs',
        'judge': 'exact_matching'
    }
}

from evalscope.run import run_task
from evalscope.summarizer import Summarizer


def run_eval():
    # 选项 1: python 字典
    task_cfg = task_cfg_dict

    # 选项 2: yaml 配置文件
    # task_cfg = 'eval_openai_api.yaml'

    run_task(task_cfg=task_cfg)

    print('>> Start to get the report with summarizer ...')
    report_list = Summarizer.get_report_from_cfg(task_cfg)
    print(f'\\n>> The report list: {report_list}')


run_eval()
\`\`\`

## 2. 直接使用VLMEvalKit

直接使用VLMEvalKit需设置\`VLMEVALKIT_USE_MODELSCOPE=1\`来开启从modelscope下载数据集的能力，目前支持如下视频评测数据集：
- MVBench_MP4
- MLVU_OpenEnded
- MLVU_MCQ
- LongVideoBench
- TempCompass_MCQ
- TempCompass_Captioning
- TempCompass_YorN
- Video-MME
- MVBench
- MMBench-Video

### 环境准备

\`\`\`python

git clone https://github.com/open-compass/VLMEvalKit.git
cd VLMEvalKit
pip install -e .
\`\`\`

VLM 配置：所有 VLM 都在 \`vlmeval/config.py\` 中配置。对于某些 VLM（如 MiniGPT-4、LLaVA-v1-7B），需要额外配置（在配置文件中指定代码 / 模型权重根目录）。在评估时，应使用 \`vlmeval/config.py\` 中 supported_VLM 指定的模型名称来选择 VLM。开始评估之前，请先使用 \`vlmutil check {MODEL_NAME}\` 命令确认能够成功使用该 VLM 进行推理。

\`\`\`python
# 执行如下bash命令开始评测：
!python run.py --data TempCompass --model InternVL2-8B
\`\`\``
    },
    {
      id: 'nb-llm-dify',
      title: 'Dify RAG+Agent 框架',
      file: 'LLM-tutorial/notebook/dify.ipynb',
      difficulty: '中级',
      duration: '0.5h',
      week: 4,
      phase: 4,
      keywords: ['Dify', 'Agent', '知识库'],
      content: `## 十分钟速通Dify

Dify是一个工业级别可用的RAG（知识召回）和Agent（智能体）框架。这个框架的功能非常全面，涵盖了从知识库搭建、工具集成到流程编排的各种功能。我们可以参考下图：
![image.png](LLM-tutorial/notebook/attachment:1ac0374f-df8f-4bfa-ab37-cdd2f532a1d3.png)
具体来说, Dify提供了以下能力：
1. 用户管理：区分了管理员和普通用户，并且支持多用户并行使用一个系统
2. 新工具注册：注册新的工具，并将工具用于模型调用中
3. 新知识库录入：录入自己的文件方便后续模型找回
4. 模型管理：支持OpenAI、Anthropic、Google、Qwen等各类流行模型作为LLM、Reranker、Embedder等角色使用
5. Agent：支持Dify作为智能体系统提供服务
6. RAG：支持Dify作为知识库工具进行知识库问答
7. 流程编排：人工编排工作流，适配新的工作场景
8. API化：将能力以API方式提供出去

Dify提供了提个友好的线上界面使用：
https://cloud.dify.ai/explore/apps
我们可以直接使用它的SaaS化服务。
Dify截至目前已经达到了5w+ star。在这个ipynb中，我们会尝试本地搭建Dify环境，并配置一个旅行助手系统。

\`\`\`python
# 首先我们需要Clone dify的代码,Clone只需要运行一次即可
!git clone https://github.com/langgenius/dify.git
\`\`\`

方式1：使用Docker方式启动Dify：

\`\`\`python
# 如果docker compose up镜像拉取失败，请考虑使用国内docker镜像的源
%cd dify/docker
!cp .env.example .env
!docker compose up -d
# 访问Dify
# http://your-dify-server-ip, like http://localhost:3000
\`\`\`

方式2：Dify也支持使用源代码方式进行部署，该方式需要启动多个服务，如果用户有修改Dify代码进行二次发布的需求可以这样做。

\`\`\`python
# 启动docker先，不同的是这个docker pod里面并没有dify的服务，而是redis等中间件服务
# 如果docker compose up镜像拉取失败，请考虑使用国内docker镜像的源
%cd dify/docker
!cp middleware.env.example middleware.env
!docker compose -f docker-compose.middleware.yaml up -d
%cd ..
\`\`\`

下面这一步我们安装必要的依赖，注意这一步只需要执行一次，后续不需要再运行

\`\`\`python
# 安装pyenv：https://github.com/pyenv/pyenv
!pyenv install 3.11
!pyenv global 3.11
%cd api
!cp .env.example .env
!awk -v key="$(openssl rand -base64 42)" '/^SECRET_KEY=/ {sub(/=.*/, "=" key)} 1' .env > temp_env && mv temp_env .env
# 安装依赖, 需要提前安装poetry: https://python-poetry.org/docs/
!poetry env use 3.11
!poetry install
!flask db upgrade
%cd ../web
# build web服务,需要安装npm：https://nodejs.org/en/download/package-manager
# 这里需要注意一点，截止本文编写的时间，编译成功需要使用node 18.*版本，主要安装时的版本选择
!npm install
!npm run build
\`\`\`

下面就可以启动Dify的三个服务了，注意这三个服务使用三个命令行启动。

\`\`\`python
%cd api
# 主服务
!flask run --host 0.0.0.0 --port=5001 --debug
\`\`\`

\`\`\`python
%cd api
# Worker服务
!celery -A app.celery worker -P gevent -c 1 --loglevel INFO -Q dataset,generation,mail,ops_trace
\`\`\`

\`\`\`python
%cd web
# web服务
!npm run start
# 访问Dify
# http://your-dify-server-ip, like http://localhost:3000
\`\`\`

使用Dify是非常直观简单的。首先你需要根据现有的模型供应商选择一个模型。我们以魔搭为例（魔搭的PR在：https://github.com/langgenius/dify/pull/11397，可以关注是否合并进主分支）来介绍创建模型，其他的模型供应商做法类似。
![image.png](LLM-tutorial/notebook/attachment:image.png)
这里的token需要填入在[魔搭社区上的token](https://www.modelscope.cn/my/myaccesstoken)，注意这些模型的使用是免费的。
点击确定后，可以看到目前所有支持的模型列表。下面我们创建一个旅行助手来使用这个模型。
![image-2.png](LLM-tutorial/notebook/attachment:image-2.png)
![image-3.png](LLM-tutorial/notebook/attachment:image-3.png)
选择\`Qwen/Qwen2.5-7B-Instruct\`后，我们添加一个高德天气助手。注意你需要一个高德天气的API，Dify界面会引导你到高德界面完成这一操作。
下面我们询问一个问题：“告诉我杭州天气”
![image-4.png](LLM-tutorial/notebook/attachment:image-4.png)
我们可以看到模型调用了高德天气，并可以看到Agent的调用日志。

测试完成后，点击右上角的发布即可。
![image.png](LLM-tutorial/notebook/attachment:image.png)
在这里，可以添加为页面，嵌入其他页面，或者以API形式调用。`
    },
    {
      id: 'nb-llm-llama-factory',
      title: 'LLaMA-Factory 微调实战',
      file: 'LLM-tutorial/notebook/llama-factory.ipynb',
      difficulty: '中级',
      duration: '0.5h',
      week: 2,
      phase: 2,
      keywords: ['LLaMA-Factory', 'LoRA'],
      content: `\`\`\`python
## LLaMA-Factory是一个非常流行且易于使用的大模型训练框架。它有以下的能力：
按模型类型划分：支持纯文本和多模态模型的训练，纯文本模型包含：LLaMA、Gemma、Qwen、GLM等全系列模型，多模态模型包含：LLaVA、LLaMA-Vision、Qwen-VL等全系列模型100+。
按训练类型划分：支持预训练、微调、人类对齐（PPO、DPO、ORPO、KTO等）全训练stage。
按命令类型划分：支持代码训练、命令行训练、web-ui界面训练。
按微调方式划分：支持全参数、LoRA、QLoRA、DoRA等多个轻量微调方式。
按设备类型划分：支持单机单卡、单机多卡、多机多卡等多种微调方式。

下面我们以框架自带的例子为例来讲解LLaMA-Factory的使用方式。

\`\`\`

\`\`\`python
# clone代码
!git clone https://github.com/hiyouga/LLaMA-Factory.git
%cd LLaMA-Factory
!pip install -e ".[torch,metrics]"
\`\`\`

对于国内用户，我们建议增加如下环境变量，这样LLaMA-Factory会使用国内的模型源下载：

\`\`\`python
!export USE_MODELSCOPE_HUB=1 # \`set USE_MODELSCOPE_HUB=1\` for Windows
\`\`\`

\`\`\`python
# 修改examples/train_lora/llama3_lora_sft.yaml的配置：meta-llama/Meta-Llama-3-8B-Instruct -> LLM-Research/Meta-Llama-3-8B-Instruct
!USE_MODELSCOPE_HUB=1 llamafactory-cli train examples/train_lora/llama3_lora_sft.yaml
\`\`\`

下面我们讲解配置文件中的超参数的含义：

LLaMA-Factory还支持推理、合并lora和部署：

\`\`\`python
# 推理命令
!USE_MODELSCOPE_HUB=1 llamafactory-cli chat examples/inference/llama3_lora_sft.yaml
\`\`\`

\`\`\`python
# lora合并命令
!USE_MODELSCOPE_HUB=1 llamafactory-cli export examples/merge_lora/llama3_lora_sft.yaml
\`\`\`

\`\`\`python
# 部署命令
!USE_MODELSCOPE_HUB=1 API_PORT=8000 llamafactory-cli api examples/inference/llama3_vllm.yaml
\`\`\`

此外，LLamA-Factory支持界面训练，使用界面训练方式可以大大减小理解大模型训练的难度。
使用界面训练的方式也非常简单：

\`\`\`python
!USE_MODELSCOPE_HUB=1 llamafactory-cli webui
# 仅需要在界面中选择模型和数据集，配置好超参数点击开始即可
\`\`\`

完整的数据集文档请查看：https://llamafactory.readthedocs.io/zh-cn/latest/getting_started/data_preparation.html`
    },
    {
      id: 'nb-llm-llamacpp',
      title: 'llama.cpp 本地推理',
      file: 'LLM-tutorial/notebook/llamacpp+qwen3vl+gguf.ipynb',
      difficulty: '中级',
      duration: '1.5h',
      week: 2,
      phase: 2,
      keywords: ['llama.cpp', 'GGUF', '多模态'],
      content: `# 🤖 在Jupyter Notebook中玩转Qwen3-VL视觉大模型：从部署到对话全指南

随着大模型的应用越来越广泛，相信大家已经不再满足于只能与助手聊天的单一功能，对大模型处理图像的需求也日渐变多。本教程将手把手带你，在熟悉的Jupyter Notebook环境中，通过llama.cpp轻松部署强大的Qwen3-VL多模态模型。告别复杂的命令行和云服务依赖，只需一步步跟随，即可在本地构建一个支持图像理解与智能对话的私人助手。
核心优势：
- **完全本地化**：模型在本地运行，无需网络，隐私无忧。

- **多模态能力**：不仅会聊天，更能理解你发送的图片内容。

- **Notebook友好**：所有操作均在Jupyter单元格内完成，交互直观。

- **免费开源**：依托llama.cpp和ModelScope开源社区。

## 🎯 极速预览：成功部署“三步曲”
如果你喜欢直入主题，以下是已验证的成功路径摘要：（---在终端中执行命令---）
### 第1步：从ModelScope下载Qwen3模型文件
\`\`\`python
pip install modelscope --upgrade
modelscope download --model 'Qwen/Qwen3-VL-2B-Instruct-GGUF' Qwen3VL-2B-Instruct-Q4_K_M.gguf mmproj-Qwen3VL-2B-Instruct-F16.gguf (下载到默认cache地址)
\`\`\`

### 第2步：获取并编译模型引擎 (llama.cpp)
\`\`\`python
git clone https://github.com/ggml-org/llama.cpp
cd llama.cpp
cmake -B build
cmake --build build --config Release -j $(nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo 4)
\`\`\`

### 第3步：启动本地服务器（替换实际路径）
\`\`\`
  ./build/bin/llama-server \\
  -m /your/path/to/Qwen3VL-2B-Instruct-Q4_K_M.gguf \\
  --mmproj /your/path/to/mmproj-Qwen3VL-2B-Instruct-F16.gguf \\
  -c 4096 \\
  --host 0.0.0.0 \\
  --port 8080
  \`\`\`

### 第4步：启动模型交互界面（可选）
\`\`\`
./build/bin/llama-cli \\
-m /your/path/to/Qwen3VL-2B-Instruct-Q4_K_M.gguf \\
--mmproj /your/path/to/mmproj-Qwen3VL-2B-Instruct-F16.gguf \\
--jinja \\
--color auto
\`\`\`

### 注意----第一步模型下载和第三步的启动server可以用一步来搞定，即：
但是要注意加上\`--mmproj\`参数来指定投影文件，启用多模态
\`\`\`
export MODEL_ENDPOINT=https://www.modelscope.cn/
./build/bin/llama-server -hf Qwen/Qwen3-VL-2B-Instruct-GGUF --jinja -ngl 99 -fa auto -sm row --temp 0.6 --top-k 20 --top-p 0.95 --min-p 0 -c 40960 -n 32768 --no-context-shift
\`\`\`
类似的，第一步和第四步也可以合并为一步：
\`\`\`
export MODEL_ENDPOINT=https://www.modelscope.cn/
./build/bin/llama-cli -hf Qwen/Qwen3-VL-2B-Instruct-GGUF --jinja --color auto -ngl 99 -fa auto -sm row --temp 0.6 --top-k 20 --top-p 0.95 --min-p 0 -c 40960 -n 32768 --no-context-shift
\`\`\`
（这样通过设置\`MODEL_ENDPOINT\`环境变量，可以让程序从ModelScope下载模型，下载完成之后直接启动）\\
下面，我们将详细展开每一步在Notebook中的使用。

## 📦 第一章：战前准备（环境与模型）

### 1.1 认识llama.cpp
开始之前，我们先简要介绍一下 llama.cpp，说明你可以从中获得什么，以及为什么我们要强调“使用” llama.cpp。本质上，llama.cpp 是一个独立的生态系统，其设计理念注重轻量化、最小化外部依赖、支持多平台，并提供广泛而灵活的硬件兼容性：

- 纯 C/C++ 实现，无外部依赖

- 支持广泛的硬件：

  - x86_64 CPU 支持 AVX、AVX2 与 AVX512

  - 通过 Metal 与 Accelerate 支持 Apple Silicon（CPU 与 GPU）

  - 支持 NVIDIA GPU（通过 CUDA）、AMD GPU（通过 hipBLAS）、Intel GPU（通过 SYCL）、昇腾 NPU（通过 CANN）以及摩尔线程 GPU（通过 MUSA）

  - 提供 GPU 的 Vulkan 后端

- 提供多种量化方案，以提升推理速度并降低内存占用

- 支持 CPU+GPU 混合推理，可加速运行超过显存容量的模型

它类似于使用 Python 框架 \`torch\`+\`transformers\` 或 \`torch\`+\`vllm\`，但以 C++ 实现。然而，两者之间存在重要区别：

- Python 是一种解释型语言：代码由解释器逐行执行，你可以通过解释器或交互式终端直接运行代码片段或脚本。Python 对初学者友好，即使了解不深，也较容易修改源码。

- C++ 是一种编译型语言：源代码需先经编译转换为机器码与可执行文件，语言层面的开销极小。llama.cpp 同样提供了示例程序的源代码，展示如何使用该库。但若你不熟悉 C++ 或 C，修改源码将较为困难。

真正“使用” llama.cpp 意味着将其作为库集成到自己的程序中，类似 Ollama、LM Studio、GPT4ALL、llamafile 等项目的实现方式。但这并非本指南的目标或所能覆盖的内容。这里我们将主要介绍如何使用 \`llama-server\` 和 \`llama-cli\` 示例程序，帮助你了解 llama.cpp 对 Qwen2.5 模型的支持，以及 llama.cpp 生态系统的基本运作方式。



### 1.2 Qwen3-VL介绍
#### [认识Qwen3-VL系列模型](https://modelscope.cn/models/Qwen/Qwen3-VL-2B-Instruct) — 迄今为止 Qwen 系列中功能最强大的视觉语言模型。
这一代产品在各个方面都进行了全面升级：更优秀的文本理解和生成能力、更深入的视觉感知和推理能力、扩展的上下文长度、增强的空间和视频动态理解能力，以及更强的代理交互能力。\\
提供从边缘到云端可扩展的 Dense 和 MoE 架构，并提供 Instruct 和增强推理的 Thinking 版本，以实现灵活、按需部署。\\
主要增强功能：
- 视觉代理：操作 PC/移动 GUI — 识别元素、理解功能、调用工具、完成任务。
- 视觉编码增强：从图像/视频生成 Draw.io/HTML/CSS/JS。
- 高级空间感知：判断物体位置、视角和遮挡；提供更强的 2D 基础，并支持 3D 基础，用于空间推理和具身 AI。
- 长上下文和视频理解：原生 256K 上下文，可扩展至 1M；处理书籍和数小时的视频，具有完整的回忆和秒级索引。
- 增强的多模态推理：在 STEM/数学方面表现出色 — 因果分析和基于逻辑、证据的答案。
- 升级的视觉识别：更广泛、更高品质的预训练能够“识别一切”——名人、动漫、产品、地标、动植物等。
- 扩展的 OCR：支持 32 种语言（从 19 种增加）；在低光、模糊和倾斜情况下表现稳健；更好地处理罕见/古代字符和术语；改进了长文档结构解析。
- 与纯 LLM 相当的文本理解：无缝的文本-视觉融合，实现无损、统一的理解

### 1.3 GGUF介绍
GGUF是一种文件格式，用于存储运行模型所需的信息，包括但不限于模型权重、模型超参数、默认生成配置和tokenzier。\\
在[Qwen3-VL-2B-Instruct-GGUF](https://modelscope.cn/models/Qwen/Qwen3-VL-2B-Instruct-GGUF/summary)模型仓库中，仓库提供了 Qwen3-VL-2B-Instruct 的 GGUF 格式权重，分为两个组件：
- 语言模型 (LLM)：FP16, Q8_0, Q4_K_M
- 视觉编码器 (mmproj)：FP16, Q8_0
这些文件与 llama.cpp、Ollama 和其他基于 GGUF 的工具兼容，支持在 CPU、NVIDIA GPU (CUDA)、Apple Silicon (Metal)、Intel GPUs (SYCL) 等上进行推理。您可以根据您的硬件和性能需求混合使用语言和视觉组件的精度级别，甚至可以从 FP16 权重开始进行自定义量化。

### 1.4 获取“AI大脑”：模型文件
Qwen3-VL需要两个核心文件，分别负责“语言”和“视觉”：
- 主模型文件 (*.gguf)：语言理解与生成的核心。
- 视觉投影文件 (mmproj-*.gguf)：将图像信息转换为模型可理解的“语言”。
- 模型文件：\`GGUF格式\`极大简化了大语言模型文件的管理，可通过单模型文件完成推理。而且借助llama.cpp提供的丰富量化能力，一个模型repo下的不同GGUF文件，通常对应的是不同量化精度与量化方法。本教程默认选用的是Q4_K_M版本，在推理精度以及推理速度，资源消耗之间做一个较好的均衡。如果有特殊的需求，也可以选择更高的精度--例如FP16版本。
- tips：本文用到的是\`Qwen/Qwen3-VL-2B-Instruct-GGUF\`模型，[点击即可跳转查看完整的模型文件](https://modelscope.cn/models/Qwen/Qwen3-VL-2B-Instruct-GGUF/files)。
  
我们可以从[ModelScope社区下载模型文件](https://modelscope.cn/docs/models/download)(以下两种方式任选一种即可)：

\`\`\`python
# 简洁版 ---- 一行命令下载所需文件（使用命令行工具下载）
!modelscope download --model 'Qwen/Qwen3-VL-2B-Instruct-GGUF' Qwen3VL-2B-Instruct-Q4_K_M.gguf mmproj-Qwen3VL-2B-Instruct-F16.gguf
\`\`\`

\`\`\`python
# 安装下载工具 使用 ModelScope SDK 下载
!pip install modelscope --upgrade

import os
from modelscope import model_file_download

# 指定模型 (以2B参数、平衡量化版为例)
model_id = 'Qwen/Qwen3-VL-2B-Instruct-GGUF'
gguf_file = 'Qwen3VL-2B-Instruct-Q4_K_M.gguf'
mmproj_file = 'mmproj-Qwen3VL-2B-Instruct-F16.gguf'

print("⏳ 开始下载模型文件 (约1-2GB)，请稍候...")
model_path = model_file_download(model_id, gguf_file)
mmproj_path = model_file_download(model_id, mmproj_file)

print(f"\\n🎉 下载完成！")
print(f"   语言模型: {model_path}")
print(f"   视觉模型: {mmproj_path}")
\`\`\`

- 注意：这里输出的两个文件路径后面会用到，后续也可以尝试已经获取的\`model_path\`和\`mmproj_path\`变量。

## 🔧 第二章：编译llama.cpp引擎
llama.cpp是一个高效运行大模型的C++工具库，我们需要将它编译成可执行文件。

### 2.1 获取源码
在Notebook新单元格中执行：

\`\`\`python
!git clone https://github.com/ggml-org/llama.cpp.git
%cd llama.cpp
print("源代码克隆完成！")
\`\`\`

### 2.2 一键编译

\`\`\`python
# 随时使用pwd命令查看你的当前工作目录
!pwd
\`\`\`

\`\`\`python
# 创建并进入构建目录
!cmake -B build
!cmake --build build --config Release
\`\`\`

## 🚀 第三章：启动你的AI助手
这是最关键的一步，我们将启动模型服务。

### 3.1 理解启动“密语”
启动多模态服务需要两个关键指令，缺一不可：

- 主模型路径 (-m)：指向下载的.gguf主模型文件;
- 视觉投影路径 (--mmproj)：指向下载的mmproj文件。
- tips:因为我们这里使用的是\`-m model.gguf\`的方式来使用llama.cpp的，所以需要使用\`--mmproj file.gguf\`额外指定**视觉投影文件**
- 具体的&额外的使用方法可以参考[llama.cpp官方文档](https://github.com/ggml-org/llama.cpp/blob/master/docs/multimodal.md)

### 3.2 在Notebook中优雅地启动
llama-server 是一个简单的 HTTP 服务器，包含一组 LLM REST API 和一个简单的 Web 前端，用于通过 llama.cpp 与大型语言模型交互。\\
默认情况下，服务器将在\`http://localhost:8080\`监听。所以你也可以打开网页，通过llama.cpp与qwen3-vl模型进行交互。\\
为了更好管理，我们使用一个封装函数启动llama-server：

\`\`\`python
import subprocess, os, time, requests

def start_ai_server():
    """一键启动Qwen3-VL多模态AI服务器"""
    print("="*50)
    print("🚀 正在启动你的Qwen3-VL AI助手服务器")
    print("="*50)
    
    # 1. 如果遇到路径错误，请修改为你的实际文件路径！查看在1.4中的输出结果，或者尝试已经获取的\`model_path\`和\`mmproj_path\`变量。
    # server可以使用相对路径，例如\`build/bin/llama-server\`。
    # 模型文件我们使用已经获取的\`model_path\`和\`mmproj_path\`变量。
    # 后续的路径同理。
    paths = {
        'server': './build/bin/llama-server',
        'model': model_path,
        'mmproj': mmproj_path
    }
    
    # 2. 组装启动命令
    cmd = [
        str(paths['server']), '-m', str(paths['model']),
        '--mmproj', str(paths['mmproj']),  # 多模态的关键！
        '-c', '4096',  # 上下文长度，可根据需要调小以节省内存
        '--host', '0.0.0.0', '--port', '8080'
    ]
    
    # 3. 启动！
    print("\\n⏳ 启动服务器进程中...（首次加载模型需要1-3分钟，请稍候）")
    process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    
    # 等待并检查
    time.sleep(5)  # 短暂等待进程启动
    print("\\n⏳ 正在等待服务器就绪...（预计需要1-3分钟）")
    max_wait = 180  # 最长等待3分钟
    start_time = time.time()
    
    while time.time() - start_time < max_wait:
        try:
            resp = requests.get("http://localhost:8080/health", timeout=5)
            if resp.status_code == 200:
                print(f"\\n🎊 服务器启动成功！")
                print(f"   📍 本地访问: http://localhost:8080")
                print(f"   💬 API已就绪: http://localhost:8080/v1/chat/completions")
                return process
        except requests.exceptions.RequestException:
            # 服务器尚未就绪，继续轮询
            pass
        time.sleep(10)  # 等待10秒后重试
    
    print("⏳ 服务器启动超时或仍在加载。请检查子进程输出。")
    print("   完成后可手动在浏览器访问 http://localhost:8080 查看")
    return process

# 执行启动
my_ai_server = start_ai_server()
\`\`\`

### 3.3 同样的，我们可以将模型下载和启动服务合并为一步来执行
需要注意的是，这种方式我们还是需要指定一下投影文件，使用 \`--mmproj\` 参数，如果不指定投影文件的话，就相当于[禁用了多模态](https://github.com/ggml-org/llama.cpp/blob/master/docs/multimodal.md)，只能对话聊天，不能发送图片。\\
并且，使用\`-hf\`的方式，下载Qwen/Qwen3-VL-2B-Instruct-GGUF模型，只会下载Qwen3VL-2B-Instruct-Q4_K_M.gguf版本的模型文件，所以还需要手动下载投影文件（可以参考1.4中的下载方式）。

\`\`\`python
import subprocess, os, time, requests
from pathlib import Path

def start_ai_server():
    """一键启动Qwen3-VL多模态AI服务器"""
    print("="*50)
    print("🚀 正在启动你的Qwen3-VL AI助手服务器")
    print("="*50)

    # 1. 设置环境变量，从ModelScope下载模型
    env = os.environ.copy()
    env['MODEL_ENDPOINT'] = 'https://www.modelscope.cn/'
    
    # 1. 如果遇到路径错误，请修改为你的实际server和mmproj文件路径！
    # 模型文件我们使用已经获取的\`mmproj_path\`变量。
    path_server = './build/bin/llama-server'
    path_mmproj = mmproj_path
    
    # 3. 组装启动命令
    cmd = [
        path_server,
        '-hf', 'Qwen/Qwen3-VL-2B-Instruct-GGUF',
        '--mmproj', path_mmproj,
        '--jinja',
        '-ngl', '99',
        '-fa', 'auto',
        '-sm', 'row',
        '--temp', '0.6',
        '--top-k', '20',
        '--top-p', '0.95',
        '--min-p', '0',
        '-c', '4096',
        '-n', '32768',
        '--no-context-shift',
    ]

    
    # 4. 启动！
    print("\\n⏳ 启动服务器进程中...（首次加载模型需要1-3分钟，请稍候）")
    process = subprocess.Popen(cmd, stdout=subprocess.PIPE, env=env, stderr=subprocess.STDOUT, text=True)
    
    # 等待并检查
    time.sleep(5)  # 短暂等待进程启动
    print("\\n⏳ 正在等待服务器就绪...（预计需要1-3分钟）")
    max_wait = 180  # 最长等待3分钟
    start_time = time.time()
    
    while time.time() - start_time < max_wait:
        try:
            resp = requests.get("http://localhost:8080/health", timeout=5)
            if resp.status_code == 200:
                print(f"\\n🎊 服务器启动成功！")
                print(f"   📍 本地访问: http://localhost:8080")
                print(f"   💬 API已就绪: http://localhost:8080/v1/chat/completions")
                return process
        except requests.exceptions.RequestException:
            # 服务器尚未就绪，继续轮询
            pass
        time.sleep(10)  # 等待10秒后重试
    
    print("⏳ 服务器启动超时或仍在加载。请检查子进程输出。")
    print("   完成后可手动在浏览器访问 http://localhost:8080 查看")
    return process

# 执行启动
my_ai_server = start_ai_server()
\`\`\`

当然，你也可以通过我们开头提到的，\`极速预览\`中的第三步，直接在**终端Terminal中**使用命令行的方式来启动服务器，效果是一样的。
\`\`\`python
  ./build/bin/llama-server \\
  -m /your/path/to/Qwen3VL-2B-Instruct-Q4_K_M.gguf \\
  --mmproj /your/path/to/modelscope/mmproj-Qwen3VL-2B-Instruct-F16.gguf \\
  -c 4096 \\
  --host 0.0.0.0 \\
  --port 8080
  \`\`\`

## 🧪 第四站：对话测试 & 炫酷应用
服务器跑起来后，让我们试试效果。

### 4.1 基础测试：让AI描述你的图片

\`\`\`python
import requests, base64, json

def ask_ai_about_image(image_path, question="描述这张图片"):
    """发送图片和问题给AI助手"""
    # 将图片转为Base64
    with open(image_path, "rb") as f:
        img_b64 = base64.b64encode(f.read()).decode('utf-8')
    
    # 构建请求
    url = "http://localhost:8080/v1/chat/completions"
    headers = {"Content-Type": "application/json"}
    data = {
        "messages": [{
            "role": "user",
            "content": [
                {"type": "text", "text": question},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img_b64}"}}
            ]
        }],
        "max_tokens": 300
    }
    
    print(f"📤 询问AI: '{question}'")
    resp = requests.post(url, json=data, headers=headers, timeout=60)
    
    if resp.status_code == 200:
        reply = resp.json()['choices'][0]['message']['content']
        print(f"\\n🤖 AI助手回复:\\n{'-'*40}\\n{reply}\\n{'-'*40}")
        return reply
    else:
        print(f"请求出错: {resp.status_code}")
        return None

# 这里我们下载一张边牧的图片，可以不下载(注释掉)替换为你的图片路径，也可以修改问题
!wget -q --show-progress https://modelscope.oss-cn-beijing.aliyuncs.com/Dog.png -O dog.png
ask_ai_about_image("dog.png", "图片里有什么？")
\`\`\`

### 4.2 使用OpenAI格式进行对话请求
其中，api_key和model字段此处没有作用，但是要填上

#### 初始化客户端

\`\`\`python
from openai import OpenAI

client = OpenAI(
    base_url='http://localhost:8080/v1',
    api_key='not-needed'
)
\`\`\`

#### 纯文本聊天

\`\`\`python
# 简单提问
response = client.chat.completions.create(
    model='qwen3-vl',
    messages=[{
        'role': 'user',
        'content': '你好，请介绍一下你自己'
    }]
)

print(f"Q: 你好，请介绍一下你自己")
print(f"A: {response.choices[0].message.content}")
\`\`\`

#### 多模态--带图片的聊天

\`\`\`python
import base64

# 读取图片并转换为Base64
image_path = "dog.png"  # 替换为你的图片路径，或使用之前下载的 dog.png

with open(image_path, "rb") as f:
    img_b64 = base64.b64encode(f.read()).decode('utf-8')

# 发送流式请求
response = client.chat.completions.create(
    model='qwen3-vl',
    messages=[{
        'role': 'user',
        'content': [
            {'type': 'text', 'text': '详细描述这张图片的内容'},
            {
                'type': 'image_url',
                'image_url': {
                    'url': f'data:image/jpeg;base64,{img_b64}'
                }
            }
        ]
    }],
    stream=True,  # 启用流式响应
    max_tokens=500,
    temperature=0.7
)

print("正在分析图片，流式回复开始：")
print("-" * 50)

full_response = ""
for chunk in response:
    if chunk.choices and chunk.choices[0].delta.content:
        content = chunk.choices[0].delta.content
        print(content, end='', flush=True)  # 逐字显示
        full_response += content
\`\`\`

### 4.3 使用curl进行请求

\`\`\`python
%%bash
curl -X POST http://localhost:8080/v1/chat/completions \\
-H "Content-Type: application/json" \\
-d '{
  "model": "qwen3-vl",
  "messages": [
    {
      "role": "user",
      "content": "你好，请介绍一下你自己"
    }
  ],
  "max_tokens": 300,
  "temperature": 0.6
}'
\`\`\`

\`\`\`python
%%bash
# 这里可以选择将图片编码，或者选择在下面的请求中，将图片地址传入'url'参数，我们下载一张奥黛丽·赫本的图片为例
wget -q --show-progress https://modelscope.oss-cn-beijing.aliyuncs.com/demo/images/audrey_hepburn.jpg -O audrey_hepburn.jpg
IMAGE_B64=$(base64 -i audrey_hepburn.jpg | tr -d '\\n' | sed 's/"/\\\\"/g; s/\\\\/\\\\\\\\/g')

curl -X POST http://localhost:8080/v1/chat/completions \\
-H "Content-Type: application/json" \\
-d '{
  "model": "qwen3-vl",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "图片里有什么？"
        },
        {
          "type": "image_url",
          "image_url": {
            "url": "data:image/jpg;base64,'"\${IMAGE_B64}"'" 
          }
        }
      ]
    }
  ],
  "max_tokens": 300,
  "temperature": 0.6
}'

\`\`\`

#### 健康检查：
随时运行以下代码，检查助手是否“健康在线”：

\`\`\`python
import requests
try:
    resp = requests.get("http://localhost:8080/health", timeout=3)
    print(f"✅ AI助手状态健康 (HTTP {resp.status_code})")
except:
    print("❌ AI助手服务未响应，请检查是否已启动。")
\`\`\`

## 📚 总结与展望
恭喜你！🎉 至此，你已经成功在本地部署了一个功能强大的多模态AI助手。我们来回顾一下核心要点：

- **核心认知**：部署Qwen3-VL需要 “两个文件”（主模型+视觉投影)。

- **核心步骤**：准备模型 -> 编译引擎 -> 启动服务 -> 对话测试。

- **关键技巧**：在Notebook中使用subprocess管理进程，使用绝对路径，并对首次加载保持耐心。

资源导航：

- **[llama.cpp官方GitHub](https://github.com/ggml-org/llama.cpp)**：关注更新，获取文档。

- **[ModelScope模型社区](https://modelscope.cn/models)**：海量开源模型免费下载。

- **[Qwen官方文档](https://qwen.readthedocs.io/zh-cn/latest/run_locally/llama.cpp.html)**：深入了解模型特性。

希望本教程能帮助你顺利开启本地AI探索之旅。祝你玩得开心！✨

`
    },
    {
      id: 'nb-llm-nexa',
      title: 'Nexa SDK 端侧推理',
      file: 'LLM-tutorial/notebook/nexa.ipynb',
      difficulty: '中级',
      duration: '0.5h',
      week: 2,
      phase: 2,
      keywords: ['Nexa', 'GGUF', '端侧'],
      content: `# 使用Nexa SDK进行本地模型推理

Nexa SDK 是一个端侧推理框架，支持 ONNX 和 GGML 模型，支持文本生成、图像生成、视觉语言模型（VLM）、音频语言模型、语音转文本（ASR）和文本转语音（TTS）等类型的功能。它支持的设备包括 CPU, GPU (CUDA, Metal, ROCm) 和 iOS。主要具有以下使用范例：

- 本地进行模型推理，支持 ONNX 和 GGML 模型。模型可以从 Nexa On-Device AI Hub 下载，也可以直接从 ModelScope 或者 HuggingFace 下载。
- 进行模型转换，支持将 ModelScope 或 HuggingFace 的模型转换为 GGUF 量化格式。
- 部署本地服务器，支持 API 调用模型。

本教程将从环境安装开始，依次介绍基于 Nexa SDK 的模型推理、模型转换和本地服务器部署。本教程的所有命令推荐在终端下运行。

### 环境安装

环境安装可以参考 [Nexa SDK 文档](https://github.com/NexaAI/nexa-sdk.git)，对于不同的设备，可以下载不同的预编译包进行安装，或者进行本地编译安装。本教程采用本地编译的方式。


\`\`\`python
!pip install torch==2.2.2 torchvision==0.17.2 torchaudio==2.2.2 --index-url https://download.pytorch.org/whl/cu121
!pip install modelscope
!git clone https://github.com/NexaAI/nexa-sdk.git
%cd nexa-sdk
!git submodule update --init --recursive
!pip install -e ".[convert]"
\`\`\`

### 模型推理运行

使用 nexa 命令行运行模型，模型源选择从 ModelSope 下载。 由于 \`nexa run\` 命令为交互式运行，推荐在 terminal 环境中运行。

\`\`\`shell
nexa run -ms Qwen/Qwen2.5-Coder-7B-Instruct-GGUF
\`\`\`

将提示 \`Qwen/Qwen2.5-Coder-7B-Instruct-GGUF\` repo 中有的 GGUF 模型文件，从中选择一个 GGUF 模型文件，例如 \`qwen2.5-coder-7b-instruct-fp16.gguf\`。


### 模型转换

使用 nexa 模型转换工具将模型转换成 GGUF 量化格式，随后可通过 \`nexa run\` 命令进行推理。


\`\`\`python
%%bash
(echo "1"; echo "1"; echo "N"; echo "N") | nexa convert -ms Qwen/Qwen2.5-7B-Instruct
\`\`\`

选择模型类型 (\`NLP (text generation)\`) 后，从量化类型中选择其中一个，例如：\`q4_0\`。随后将运行模型量化。随后，运行本地模型，同上，\`nexa run\` 推荐在 terminal 环境中运行。

\`\`\`shell
nexa run /mnt/workspace/nexa-sdk/Qwen2.5-7B-Instruct-q4_0.gguf -lp -mt NLP
\`\`\`

### 本地服务器部署与 API 调用

使用 nexa server 功能将模型进行本地服务器部署，随后可以通过 API 调用进行模型调用。

运行以下命令，从可用的 GGUF 模型转选择一个模型文件下载，例如 \`qwen2.5-coder-7b-instruct-fp16.gguf\`。

\`\`\`python
%%bash
echo "10" | nexa server -ms Qwen/Qwen2.5-Coder-7B-Instruct-GGUF --port 8085
\`\`\`

\`\`\`python
import requests
import json

# 定义请求的 URL
url = "http://localhost:8085/v1/chat/completions"

# 定义请求体
request_body = {
  "messages": [
    {
      "role": "user",
      "content": "Tell me a story"
    }
  ],
  "max_tokens": 128,
  "temperature": 0.1,
  "stream": False,
  "stop_words": []
}
# 将请求体转换为 JSON 格式
json_data = json.dumps(request_body)

# 发送 POST 请求
response = requests.post(url, data=json_data, headers={'Content-Type': 'application/json'})

# 检查响应状态码
if response.status_code == 200:
    # 解析响应内容
    response_data = response.json()
    print("Response:", response_data)
else:
    print(f"Error: {response.status_code} - {response.text}")
\`\`\``
    },
    {
      id: 'nb-llm-unsloth',
      title: 'Unsloth 高效微调',
      file: 'LLM-tutorial/notebook/unsloth.ipynb',
      difficulty: '中级',
      duration: '1h',
      week: 2,
      phase: 2,
      keywords: ['Unsloth', 'LoRA', '量化'],
      content: `[Unsloth](https://github.com/unslothai/unsloth)是Unsloth AI出品的一个高效的微调工具。它包含闭源和开源两个版本，在这里我们仅关注开源版本的使用。Unsloth重写了模型的内核，尤其是使用triton重写了loss、norm等算子，并手动重写了反向传播机制，使得模型的训练速度更快。同时，Unsloth使用了低精度量化结合LoRA进行微调，进一步降低了显存占用。

* Unsloth支持Llama、Mistral、Phi-3、Gemma、Yi、DeepSeek、Qwen、TinyLlama、Vicuna、Open Hermes等
* Unsloth支持16bit LoRA或4bit QLoRA。两者都快2倍。
* \`max_seq_length\`可以设置为任何值，因为通过了[kaiokendev的方法](https://kaiokendev.github.io/til)进行自动RoPE缩放。
* Unsloth使Gemma-2 9b / 27b **快2倍** 速度运行
* 支持自动导出到Ollama

要在您自己的计算机上安装Unsloth，请按照Github页面上的安装说明进行操作[这里](https://github.com/unslothai/unsloth?tab=readme-ov-file#-installation-instructions)。

笔记本中的功能：
1. 使用[FineTome 100K](https://www.modelscope.cn/datasets/AI-ModelScope/FineTome-100k)数据集进行训练。
1. 通过\`standardize_sharegpt\`将ShareGPT转换为标准格式
2. 通过\`train_on_responses_only\`仅在完成/助手上进行训练

\`\`\`python
# !pip install unsloth
# !pip uninstall unsloth -y && pip install --upgrade --no-cache-dir --no-deps git+https://github.com/unslothai/unsloth.git
# 截止到当前文件编写的时候，modelscope的pr目前没有合并进主分支，请使用这个命令安装unsloth：
!pip install git+https://github.com/tastelikefeet/unsloth.git@feat/modelscope
\`\`\`

下面我们拉起模型。注意unsloth项目组在modelscope社区上提供了许多模型，如果您需要使用的模型在魔搭上不存在，请考虑告诉我们，或者直接上传一个。

\`\`\`python
import os
# 对于国内用户，魔搭社区提供了快速下载模型和数据集的方法，只需要简单引入一个环境变量:
os.environ['UNSLOTH_USE_MODELSCOPE'] = 'true'
from unsloth import FastLanguageModel
import torch
max_seq_length = 2048 # Choose any! We auto support RoPE Scaling internally!
dtype = None # None for auto detection. Float16 for Tesla T4, V100, Bfloat16 for Ampere+
load_in_4bit = True # Use 4bit quantization to reduce memory usage. Can be False.

# 4bit pre quantized models we support for 4x faster downloading + no OOMs.
fourbit_models = [
    "unsloth/Meta-Llama-3.1-8B-bnb-4bit",      # Llama-3.1 2x faster
    "unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit",
    "unsloth/Meta-Llama-3.1-70B-bnb-4bit",
    "unsloth/Meta-Llama-3.1-405B-bnb-4bit",    # 4bit for 405b!
    "unsloth/Mistral-Small-Instruct-2409",     # Mistral 22b 2x faster!
    "unsloth/mistral-7b-instruct-v0.3-bnb-4bit",
    "unsloth/Phi-3.5-mini-instruct",           # Phi-3.5 2x faster!
    "unsloth/Phi-3-medium-4k-instruct",
    "unsloth/gemma-2-9b-bnb-4bit",
    "unsloth/gemma-2-27b-bnb-4bit",            # Gemma 2x faster!

    "unsloth/Llama-3.2-1B-bnb-4bit",           # NEW! Llama 3.2 models
    "unsloth/Llama-3.2-1B-Instruct-bnb-4bit",
    "unsloth/Llama-3.2-3B-bnb-4bit",
    "unsloth/Llama-3.2-3B-Instruct-bnb-4bit",

    "unsloth/Llama-3.3-70B-Instruct-bnb-4bit" # NEW! Llama 3.3 70B!
]

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = "unsloth/Llama-3.2-3B-Instruct", # or choose "unsloth/Llama-3.2-1B-Instruct"
    max_seq_length = max_seq_length,
    dtype = dtype,
    load_in_4bit = load_in_4bit,
)
\`\`\`

现在添加LoRA适配器

\`\`\`python
model = FastLanguageModel.get_peft_model(
    model,
    r = 16, # 选择任何大于0的数字！建议8, 16, 32, 64, 128
    target_modules = ["q_proj", "k_proj", "v_proj", "o_proj",
                      "gate_proj", "up_proj", "down_proj",],
    lora_alpha = 16,
    lora_dropout = 0, # 支持任何值，但=0是优化的
    bias = "none",    # 支持任何值，但="none"是优化的
    use_gradient_checkpointing = "unsloth", # 对于非常长的上下文使用True或"unsloth"
    random_state = 3407,
    use_rslora = False,  # 我们支持秩稳定的LoRA
    loftq_config = None, # 以及LoftQ
)
\`\`\`

<a name="Data"></a>
### 数据准备
我们现在使用 \`Llama-3.1\` 格式进行对话风格的微调。我们使用 [FineTome-100k](https://www.modelscope.cn/datasets/AI-ModelScope/FineTome-100k) 数据集，采用 ShareGPT 风格。但是我们将其转换为多轮格式 \`("role", "content")\`，而不是 \`("from", "value")\`。Llama-3 以如下方式呈现多轮对话：

\`\`\`
<|begin_of_text|><|start_header_id|>user<|end_header_id|>

Hello!<|eot_id|><|start_header_id|>assistant<|end_header_id|>

Hey there! How are you?<|eot_id|><|start_header_id|>user<|end_header_id|>

I'm great thanks!<|eot_id|>
\`\`\`

我们使用 \`get_chat_template\` 函数来获取正确的聊天模板。我们支持 \`zephyr, chatml, mistral, llama, alpaca, vicuna, vicuna_old, phi3, llama3\` 等。

\`\`\`python
from unsloth.chat_templates import get_chat_template

tokenizer = get_chat_template(
    tokenizer,
    chat_template = "llama-3.1",
)

def formatting_prompts_func(examples):
    convos = examples["conversations"]
    texts = [tokenizer.apply_chat_template(convo, tokenize = False, add_generation_prompt = False) for convo in convos]
    return { "text" : texts, }
pass

from modelscope import MsDataset
dataset = MsDataset.load("AI-ModelScope/FineTome-100k", split = "train")
\`\`\`

现在使用 \`standardize_sharegpt\` 将 ShareGPT 风格的数据集转换为Conversations通用格式。这将数据集从如下格式:
\`\`\`
{"from": "system", "value": "You are an assistant"}
{"from": "human", "value": "What is 2+2?"}
{"from": "gpt", "value": "It's 4."}
\`\`\`
转换为
\`\`\`
{"role": "system", "content": "You are an assistant"}
{"role": "user", "content": "What is 2+2?"}
{"role": "assistant", "content": "It's 4."}
\`\`\`

\`\`\`python
from unsloth.chat_templates import standardize_sharegpt
dataset = standardize_sharegpt(dataset)
dataset = dataset.map(formatting_prompts_func, batched = True,)
\`\`\`

我们来看一下第0项的对话结构：

\`\`\`python
dataset[0]["conversations"]
\`\`\`

<a name="Train"></a>
### 训练模型
作为例子，我们使用 Huggingface TRL 的 \`SFTTrainer\`进行训练：

\`\`\`python
from trl import SFTTrainer
from transformers import TrainingArguments, DataCollatorForSeq2Seq
from unsloth import is_bfloat16_supported

trainer = SFTTrainer(
    model = model,
    tokenizer = tokenizer,
    train_dataset = dataset,
    dataset_text_field = "text",
    max_seq_length = max_seq_length,
    data_collator = DataCollatorForSeq2Seq(tokenizer = tokenizer),
    dataset_num_proc = 2,
    packing = False, # 对于短序列可以使训练速度提高5倍。
    args = TrainingArguments(
        per_device_train_batch_size = 2,
        gradient_accumulation_steps = 4,
        warmup_steps = 5,
        # num_train_epochs = 1, # 设置为1次完整的训练运行。
        max_steps = 60,
        learning_rate = 2e-4,
        fp16 = not is_bfloat16_supported(),
        bf16 = is_bfloat16_supported(),
        logging_steps = 1,
        optim = "adamw_8bit",
        weight_decay = 0.01,
        lr_scheduler_type = "linear",
        seed = 3407,
        output_dir = "outputs",
        report_to = "none", # 用于WandB等
    ),
)
\`\`\`

使用Unsloth的\`train_on_completions\`方法，仅对助手的输出进行训练，并忽略用户输入的损失。

\`\`\`python
from unsloth.chat_templates import train_on_responses_only
trainer = train_on_responses_only(
    trainer,
    instruction_part = "<|start_header_id|>user<|end_header_id|>\\n\\n",
    response_part = "<|start_header_id|>assistant<|end_header_id|>\\n\\n",
)
\`\`\`

验证掩码是否实际完成：

\`\`\`python
tokenizer.decode(trainer.train_dataset[0]["input_ids"])
\`\`\`

\`\`\`python
space = tokenizer(" ", add_special_tokens = False).input_ids[0]
tokenizer.decode([space if x == -100 else x for x in trainer.train_dataset[5]["labels"]])
print(trainer.train_dataset[0]["labels"])
\`\`\`

我们可以看到系统和指令提示已成功屏蔽。

\`\`\`python
#@title 显示当前内存状态
gpu_stats = torch.cuda.get_device_properties(0)
start_gpu_memory = round(torch.cuda.max_memory_reserved() / 1024 / 1024 / 1024, 3)
max_memory = round(gpu_stats.total_memory / 1024 / 1024 / 1024, 3)
print(f"GPU = {gpu_stats.name}. 最大内存 = {max_memory} GB.")
print(f"{start_gpu_memory} GB 的内存已保留。")
\`\`\`

\`\`\`python
trainer_stats = trainer.train()
\`\`\`

\`\`\`python
#@title 显示最终内存和时间统计
used_memory = round(torch.cuda.max_memory_reserved() / 1024 / 1024 / 1024, 3)
used_memory_for_lora = round(used_memory - start_gpu_memory, 3)
used_percentage = round(used_memory         /max_memory*100, 3)
lora_percentage = round(used_memory_for_lora/max_memory*100, 3)
print(f"{trainer_stats.metrics['train_runtime']} 秒用于训练。")
print(f"{round(trainer_stats.metrics['train_runtime']/60, 2)} 分钟用于训练。")
print(f"峰值保留内存 = {used_memory} GB。")
print(f"训练的峰值保留内存 = {used_memory_for_lora} GB。")
print(f"峰值保留内存占最大内存的百分比 = {used_percentage} %。")
print(f"训练的峰值保留内存占最大内存的百分比 = {lora_percentage} %。")
\`\`\`

<a name="Inference"></a>
### 推理

\`\`\`python
from unsloth.chat_templates import get_chat_template

tokenizer = get_chat_template(
    tokenizer,
    chat_template = "llama-3.1",
)
FastLanguageModel.for_inference(model) # 启用原生2倍速推理

messages = [
    {"role": "user", "content": "继续斐波那契数列：1, 1, 2, 3, 5, 8,"},
]
inputs = tokenizer.apply_chat_template(
    messages,
    tokenize = True,
    add_generation_prompt = True, # 必须添加以进行生成
    return_tensors = "pt",
).to("cuda")

outputs = model.generate(input_ids = inputs, max_new_tokens = 64, use_cache = True,
                         temperature = 1.5, min_p = 0.1)
tokenizer.batch_decode(outputs)
\`\`\`

 可以使用 \`TextStreamer\` 进行流式推理

\`\`\`python
FastLanguageModel.for_inference(model) # 启用本地2倍速度推理

messages = [
    {"role": "user", "content": "继续斐波那契数列：1, 1, 2, 3, 5, 8,"},
]
inputs = tokenizer.apply_chat_template(
    messages,
    tokenize = True,
    add_generation_prompt = True, # 必须添加以进行生成
    return_tensors = "pt",
).to("cuda")

from transformers import TextStreamer
text_streamer = TextStreamer(tokenizer, skip_prompt = True)
_ = model.generate(input_ids = inputs, streamer = text_streamer, max_new_tokens = 128,
                   use_cache = True, temperature = 1.5, min_p = 0.1)
\`\`\`

<a name="Save"></a>
### 保存和加载微调模型
要将最终模型保存为LoRA适配器，可以使用Huggingface的\`push_to_hub\`进行在线保存，或使用\`save_pretrained\`进行本地保存。

**[注意]** 这只保存LoRA适配器，而不是完整模型。要保存为16位或GGUF格式，请向下滚动！

\`\`\`python
model.save_pretrained("lora_model") # 本地保存
tokenizer.save_pretrained("lora_model")
# model.push_to_hub("your_name/lora_model", token = "...") # 在线保存
# tokenizer.push_to_hub("your_name/lora_model", token = "...") # 在线保存
\`\`\`

现在，如果你想加载我们刚刚保存的LoRA适配器进行推理，请将\`False\`设置为\`True\`：

\`\`\`python
if False:
    from unsloth import FastLanguageModel
    model, tokenizer = FastLanguageModel.from_pretrained(
        model_name = "lora_model", # 你用于训练的模型
        max_seq_length = max_seq_length,
        dtype = dtype,
        load_in_4bit = load_in_4bit,
    )
    FastLanguageModel.for_inference(model) # 启用本地2倍速推理

messages = [
    {"role": "user", "content": "描述法国首都的一座高塔。"},
]
inputs = tokenizer.apply_chat_template(
    messages,
    tokenize = True,
    add_generation_prompt = True, # 必须添加用于生成
    return_tensors = "pt",
).to("cuda")

from transformers import TextStreamer
text_streamer = TextStreamer(tokenizer, skip_prompt = True)
_ = model.generate(input_ids = inputs, streamer = text_streamer, max_new_tokens = 128,
                   use_cache = True, temperature = 1.5, min_p = 0.1)
\`\`\`

### 保存为 VLLM 的 float16

也支持直接保存为 \`float16\`。选择 \`merged_16bit\` 以保存为 float16 或选择 \`merged_4bit\` 以保存为 int4。我们还允许使用 \`lora\` 适配器作为后备选项

\`\`\`python
# 合并为16位
if False: model.save_pretrained_merged("model", tokenizer, save_method = "merged_16bit",)

# 合并为4位
if False: model.save_pretrained_merged("model", tokenizer, save_method = "merged_4bit",)

# 仅LoRA适配器
if False: model.save_pretrained_merged("model", tokenizer, save_method = "lora",)
\`\`\`

### GGUF / llama.cpp 转换
Unsloth支持原生保存到 \`GGUF\` / \`llama.cpp\`。使用 \`save_pretrained_gguf\` 进行本地保存。

支持的部分量化方法如下：
* \`q8_0\` - 快速转换。高资源使用，但通常可以接受。
* \`q4_k_m\` - 推荐。对一半的 attention.wv 和 feed_forward.w2 张量使用 Q6_K，其他使用 Q4_K。
* \`q5_k_m\` - 推荐。对一半的 attention.wv 和 feed_forward.w2 张量使用 Q6_K，其他使用 Q5_K。

\`\`\`python
# 保存为8bit Q8_0
if False: model.save_pretrained_gguf("model", tokenizer,)

# 保存为16bit GGUF
if False: model.save_pretrained_gguf("model", tokenizer, quantization_method = "f16")

# 保存为q4_k_m GGUF
if False: model.save_pretrained_gguf("model", tokenizer, quantization_method = "q4_k_m")
\`\`\``
    },
    {
      id: 'nb-llm-vllm',
      title: 'vLLM 推理加速实战',
      file: 'LLM-tutorial/notebook/vllm.ipynb',
      difficulty: '中级',
      duration: '0.5h',
      week: 2,
      phase: 2,
      keywords: ['vLLM', 'PagedAttention'],
      content: `## vLLM推理框架

vLLM推理框架是一种高效的推理工具，旨在加速和优化大规模语言模型的推理过程。它通过以下几个关键技术实现了这一目标：

1. **PagedAttention**: PagedAttention通过将KVCache存储在块状物理显存中，并使用逻辑显存对物理显存进行复用的技术，该技术可以增加显存寻址的连续性，并降低重复显存的数量。
2. **异步执行**: vLLM框架支持异步执行，这意味着可以在等待某些计算结果的同时，继续进行其他计算任务，从而提高整体推理效率。
3. **Continuous Batching**: 在多batch推理中，一般伴随着短sequence生成完成后等待长sequence完成的padding问题，这些padding不仅占用了额外内存，且占用了生成时间，而通过将新的sequence填充到短sequence后面会让生成时间大大缩短。

vLLM框架支持了大部分的纯文本LLM，部分多模态LLM，以及部分GPTQ和AWQ量化模型。

\`\`\`python
# 安装vLLM只需要执行下面的命令
!pip install vllm
\`\`\`

\`\`\`python
# 使用下面的环境变量使用ModelScope社区来进行下载提速
!export VLLM_USE_MODELSCOPE=1
\`\`\`

\`\`\`python
需要注意的是，vLLM会预占用大量显存来存储KVCache，显存占用越大速度提升越高。如果需要控制显存占用的量，请使用下面的参数：

- gpu_memory_utilization: 从0-1的float小数，默认为0.9，代表了额外显存的占用量

除此之外，还有下面的参数经常被用到：

- tensor_parallel_size tensor并行数量，如果你有多个显卡可以用这个参数来拆分模型
- pipeline_parallel_size pipeline并行数量
- max_num_seqs 并行处理的最大sequence数量

更多分布式推理的参数请查看vLLM的官方文档：https://docs.vllm.ai/en/latest/serving/distributed_serving.html
\`\`\`

\`\`\`python
# 这个例子来自于vLLM官方
from vllm import LLM, SamplingParams
prompts = [
    "Hello, my name is",
    "The president of the United States is",
    "The capital of France is",
    "The future of AI is",
]
sampling_params = SamplingParams(temperature=0.8, top_p=0.95)
llm = LLM(model="Qwen/Qwen2.5-1.5B-Instruct")
outputs = llm.generate(prompts, sampling_params)

for output in outputs:
    prompt = output.prompt
    generated_text = output.outputs[0].text
    print(f"Prompt: {prompt!r}, Generated text: {generated_text!r}")
\`\`\`

vLLM也支持直接部署，以便用户使用OpenAI格式进行访问：

\`\`\`python
# 在terminal中运行，否则导致下面的client代码等待
!vllm serve Qwen/Qwen2.5-1.5B-Instruct
\`\`\`

下面我们对这个server进行调用，下面列举了三个例子：
1. 查看模型列表
2. curl方式的调用
3. openai包方式调用

\`\`\`python
# 查看vLLM模型
!curl http://localhost:8000/v1/models
\`\`\`

\`\`\`python
# curl类型 client代码
!curl http://localhost:8000/v1/chat/completions \\
    -H "Content-Type: application/json" \\
    -d '{ \\
    "model": "Qwen/Qwen2.5-1.5B-Instruct", \\
    "messages": [ \\
    {"role": "system", "content": "You are a helpful assistant."}, \\
    {"role": "user", "content": "Who won the world series in 2020?"} \\
    ] \\
    }'
\`\`\`

\`\`\`python
# python调用
!pip install openai -U
from openai import OpenAI
# Set OpenAI's API key and API base to use vLLM's API server.
openai_api_key = "EMPTY"
openai_api_base = "http://localhost:8000/v1"

client = OpenAI(
    api_key=openai_api_key,
    base_url=openai_api_base,
)

chat_response = client.chat.completions.create(
    model="Qwen/Qwen2.5-1.5B-Instruct",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Tell me a joke."},
    ]
)
print("Chat response:", chat_response)
\`\`\``
    },
    {
      id: 'nb-llm-zhihu-train',
      title: '知乎数据集全流程训练',
      file: 'LLM-tutorial/notebook/全流程知乎数据集训练.ipynb',
      difficulty: '中级',
      duration: '1h',
      week: 2,
      phase: 2,
      keywords: ['数据清洗', 'LoRA', '评测'],
      content: `# LLM训练全链路最佳实践

随着人工智能技术的飞速发展，大型语言模型（LLMs）已经成为自然语言处理领域的核心驱动力。本文档旨在概述使用modelscope生态进行LLM训练的全链路最佳实践，涵盖数据下载、数据预处理、模型训练、模型评估完整流程。

主要内容

教程以知乎评论数据集为例，使用LoRA微调模型，让AI生成的文本没有那么强的“AI味”

本教程涉及以下框架的安装和使用：
1. modelscope：提供模型、数据集下载能力 
2. data-juicer：提供数据集处理能力
1. ms-swift：提供模型训练、推理能力
1. evalscope：提供模型评测能力

## 环境准备

安装modelscope、data-juicer、swift、evalscope

\`\`\`python
# %pip install modelscope[framework]  # 模型库，notebook已预装
%pip install ms-swift[llm] -U          # 训练库
%pip install evalscope -U             # 评测库
%pip install py-data-juicer[sci]      # 数据处理库
%pip install datasets==3.0.1 pydantic==2.0 tf-keras
%pip uninstall tensorflow -y    # 不需要，跟环境冲突
\`\`\`

# ！！重启notebook环境！！
------

## 数据集准备

使用modelscope下载数据集，初步处理数据集，提取需要的字段，并处理成data-juicer需要的格式

\`\`\`python
from modelscope import MsDataset
from pprint import pprint

ds =  MsDataset.load('OmniData/Zhihu-KOL', cache_dir="data", split='train')
print(ds)
pprint(ds[0])
\`\`\`

\`\`\`python
# 处理 metadata
import json
# load json
metadata = list(map(lambda x: json.loads(x), ds['METADATA']))

# 处理 upvotes 
vote_list = []
for item in metadata:
    try:
        upvotes = item['upvotes'][3:]
        if not upvotes:
            votes = 0
        elif '万' in upvotes:
            votes = int(float(upvotes[:-2]) * 10000)
        else:
            votes = int(upvotes)
    except Exception as e:
        print(upvotes)
        votes = 0
    vote_list.append(votes)
print("Done")
\`\`\`

\`\`\`python
# 写入 jsonl 文件
import pandas as pd

df = pd.DataFrame.from_dict({
    'query': ds['INSTRUCTION'],
    'response': ds['RESPONSE'],
    'upvotes': vote_list
})

print(len(df))

df.to_json("data/zhihu.jsonl", orient="records", lines=True, force_ascii=False)
df.head()
\`\`\`

## 使用data-juicer进行数据清洗


> Data-Juicer 是一个一站式多模态数据处理系统，旨在为大语言模型 (LLM) 提供更高质量、更丰富、更易“消化”的数据。设计简单易用，提供全面的文档、简易入门指南和演示配置，并且可以轻松地添加/删除现有配置中的算子。

详细介绍：https://github.com/modelscope/data-juicer/blob/main/README_ZH.md


### 1. 编写yaml配置文件

支持的算子：https://github.com/modelscope/data-juicer/blob/main/docs/Operators_ZH.md

| 类型                                | 数量 | 描述            |
|------------------------------------|:--:|---------------|
| [ Formatter ]( #formatter )        |  7 | 发现、加载、规范化原始数据 |
| [ Mapper ]( #mapper )              | 43 | 对数据样本进行编辑和转换  |
| [ Filter ]( #filter )              | 41 | 过滤低质量样本       |
| [ Deduplicator ]( #deduplicator )  |  5 | 识别、删除重复样本     |
| [ Selector ]( #selector )          |  4 | 基于排序选取高质量样本   |

在[全部算子的配置文件](https://github.com/modelscope/data-juicer/blob/main/configs/config_all.yaml)的基础上进行修改，编写如下配置文件：

**请手动创建该\`zhihu-bot.yaml\`，放在当前目录下**

\`\`\`yaml

# global parameters
project_name: 'zhihu-process'
dataset_path: 'data/zhihu.jsonl'                            # path to your dataset directory or file
np: 16                                                      # number of subprocess to process your dataset

text_keys: 'response'                                       # the key of text in your dataset file

export_path: 'data/zhihu_refine.jsonl'                      # path to save processed dataset

# process schedule
# a list of several process operators with their arguments
process:
  - specified_numeric_field_filter:                         # filter text with the specified numeric field info out of specific range
      field_key: 'upvotes'                                      # the target key corresponding to multi-level field information need to be separated by '.'
      min_value: 500                                            # the min filter value in SpecifiedNumericField op
  - text_length_filter:                                     # filter text with the length out of specific range
      min_len: 100
      max_len: 2000

  - clean_email_mapper:                                     # remove emails from text.
  - clean_html_mapper:                                      # remove html formats form text.
  - clean_ip_mapper:                                        # remove ip addresses from text.
  - clean_links_mapper:                                     # remove web links from text.
  - clean_copyright_mapper:                                 # remove copyright comments.                              # fix unicode errors in text.

  - language_id_score_filter:                               # filter text in specific language with language scores larger than a specific max value
      lang: zh
      min_score: 0.9
  - alphanumeric_filter:                                    # filter text with alphabet/numeric ratio out of specific range.  
      tokenization: false
      min_ratio: 0.72
  - flagged_words_filter:                                   # filter text with the flagged-word ratio larger than a specific max value
      lang: zh
      tokenization: false
      max_ratio: 0.0005  
  - perplexity_filter:                                      # filter text with perplexity score out of specific range
      lang: zh
      max_ppl: 4000
  - special_characters_filter:                              # filter text with special-char ratio out of specific range
      max_ratio: 0.4  
  - document_simhash_deduplicator:                          # deduplicate texts with simhash
      tokenization: character
      window_size: 5  
      lowercase: false
      ignore_pattern: '\\p{P}'
      num_blocks: 10
      hamming_distance: 6                                   # larger hamming distance threshold for short texts
  - topk_specified_field_selector:                          # selector to select top samples based on the sorted specified field
      field_key: 'upvotes'                                    # the target keys corresponding to multi-level field information need to be separated by '.'
      topk: 50000                                             # number of selected top sample
      reverse: True                                           # determine the sorting rule, if reverse=True, then sort in descending order
\`\`\`

### 2. 根据配置文件进行数据分析 

\`\`\`python
!dj-analyze --config zhihu-bot.yaml 
\`\`\`

#### 数据集分析结果

- 箱型图
- 直方图
- 统计信息

在\`data/analysis\`路径下

|        |   alnum_ratio |   flagged_words_ratio | lang      |    lang_score |     perplexity |   special_char_ratio |         text_len |
|:-------|--------------:|----------------------:|:----------|--------------:|---------------:|---------------------:|-----------------:|
| count  |   1.00622e+06 |           1.00622e+06 | 1006218.0 |   1.00622e+06 |    1.00622e+06 |          1.00622e+06 |      1.00622e+06 |
| mean   |   0.871938    |           1.28188e-05 | nan       |   0.963631    | 2390           |          0.159879    |    717.802       |
| std    |   0.0793817   |           0.00120551  | nan       |   0.0976119   | 4733.66        |          0.0878637   |   1666.89        |
| min    |   0           |           0           | nan       |   0.0593122   |    0           |          0           |      1           |
| 25%    |   0.854922    |           0           | nan       |   0.976512    | 1500.4         |          0.118577    |     61           |
| 50%    |   0.883008    |           0           | nan       |   0.989479    | 2017.7         |          0.147059    |    236           |
| 75%    |   0.905219    |           0           | nan       |   0.994992    | 2695.5         |          0.183099    |    764           |
| max    |   1           |           0.6         | nan       |   1.00007     |    1.70447e+06 |          1           | 139406           |
| unique | nan           |         nan           | 99.0      | nan           |  nan           |        nan           |    nan           |
| top    | nan           |         nan           | zh        | nan           |  nan           |        nan           |    nan           |
| freq   | nan           |         nan           | 990697.0  | nan           |  nan           |        nan           |    nan           |


### 3. 调整配置文件进行数据处理

这一步的数据处理包括：筛选、过滤、去重 

根据分析得到的数据集特征，调整配置文件，再进行数据处理:

- 数据处理3σ法则：若某个数据点超出均值±3σ的范围，通常被视为异常值
- 先进行筛选，再过滤，能减少数据处理的时间

\`\`\`python
!dj-process --config zhihu-bot.yaml 
\`\`\`

### 4. 划分训练集和测试集

\`\`\`python
import pandas as pd

data = pd.read_json("data/zhihu_refine.jsonl", lines=True)

def split_data(data, save=False, suffix=''):
    # split data into train and test, 9: 1
    train_data = data.sample(frac=0.9, random_state=42)
    test_data = data.drop(train_data.index)

    if suffix:
        suffix = '_' + suffix
    if save:
        train_data.to_json(f"data/zhihu_train{suffix}.jsonl", orient='records', lines=True, force_ascii=False)
        test_data.to_json(f"data/zhihu_test{suffix}.jsonl", orient='records', lines=True,  force_ascii=False)
    return train_data, test_data

train_data, test_data = split_data(data, save=True)

print(len(train_data))
print(len(test_data))
\`\`\`

## 使用ms-swift训练模型


> SWIFT支持300+ LLM和50+ MLLM（多模态大模型）的训练(预训练、微调、对齐)、推理、评测和部署。开发者可以直接将我们的框架应用到自己的Research和生产环境中，实现模型训练评测到应用的完整链路。我们除支持了PEFT提供的轻量训练方案外，也提供了一个完整的Adapters库以支持最新的训练技术，如NEFTune、LoRA+、LLaMA-PRO等，这个适配器库可以脱离训练脚本直接使用在自己的自定流程中。

详细介绍：https://github.com/modelscope/ms-swift/blob/main/README_CN.md

(可选)安装 flash-attention 加快推理速度：

\`\`\`python
%pip install flash-attn --no-build-isolation
\`\`\`

### 编写训练脚本
命令行参数：https://swift.readthedocs.io/zh-cn/latest/Instruction/%E5%91%BD%E4%BB%A4%E8%A1%8C%E5%8F%82%E6%95%B0.html

需要注意的参数有：

1. dataset 可以混合一些通用数据集，防止模型灾难性遗忘和通用能力丢失
2. system可以设置一个符合任务特性的system prompt，提升模型能力
3. lora_target_modules可以根据训练任务的难易程度，调整可以训练的参数数量

\`\`\`python
!swift sft \\
    --train_type lora \\
    --model Qwen/Qwen2.5-0.5B-Instruct \\
    --dataset data/zhihu_train.jsonl#3000 AI-ModelScope/Magpie-Qwen2-Pro-200K-Chinese#3000 \\
    --system "你是一个真实的人类。回答用户的问题，并在聊天回复中展现你的情绪，包括开心，幸福，愤怒，伤心，阴阳怪气等" \\
    --output_dir output \\
    --target_modules all-linear \\
    --lora_rank 4 \\
    --torch_dtype bfloat16 \\
    --seed 42 \\
    --learning_rate 1e-4 \\
    --warmup_ratio 0.05 \\
    --max_length 1024 \\
    --per_device_train_batch_size 4 \\
    --per_device_eval_batch_size 4 \\
    --num_train_epochs 1 \\
    --gradient_accumulation_steps 4 \\
    --save_total_limit 10 \\
    --eval_steps 100 \\
    --save_steps 100 
\`\`\`

### 导出合并lora后的模型

将lora合并回原本模型，得到训练之后的完整模型

\`\`\`python
!swift export \\
    --adapters /mnt/workspace/output/v2-20241223-200525/checkpoint-340 \\
    --merge_lora true
\`\`\`

## 使用evalscope评估模型

> EvalScope是魔搭社区官方推出的模型评测与性能基准测试框架，专为多样化的模型评估需求而设计。它支持广泛的模型类型，包括但不限于大语言模型、多模态模型、Embedding 模型、Reranker 模型和 CLIP 模型。

详细介绍：https://github.com/modelscope/evalscope/blob/main/README_zh.md


  


### 1. 评估模型通用能力

EvalScope 集成了多个数据集，可以用来评测模型的通用能力，包括数学能力、推理能力等，下面我们使用ARC数据集测试模型的推理能力

\`\`\`python
!evalscope eval \\
  --model output/v2-20241223-200525/checkpoint-340-merged \\
  --datasets arc
\`\`\`

下面看一下原始模型的推理能力

\`\`\`python
!evalscope eval \\
  --model Qwen/Qwen2.5-0.5B-Instruct \\
  --datasets arc
\`\`\`

可以看出，通过自定义微调后模型的推理能力有些许下降，也可以接受。

### 2. 自定义数据集评估

使用general qa模版自定义评估数据集

**评估指标：**
- bleu：比较生成文本和参考文本中的n-gram（n个连续单词的序列）。常见的n有1（unigram）、2（bigram）、3（trigram）等。
- rouge： 侧重于召回率（recall）

**数据格式：**

需要query和response两个字段，例如：
\`\`\`json
{
  "query": "什么是机器学习？",
  "response": "机器学习（Machine Learning）是计算机科学的一个分支，它研究计算机如何根据已有的例子来学习，从而实现对未知数据的预测和分类。"
}
\`\`\`   

\`\`\`python
!evalscope eval \\
  --model output/v2-20241223-200525/checkpoint-340-merged \\
  --datasets general_qa \\
  --dataset-args '{"general_qa": {"local_path": "data", "subset_list": ["zhihu_test.jsonl"]}}' \\
  --limit 10
\`\`\`

## 模型上传

您可以使用modelscope [modelhub](https://modelscope.cn/docs/models/upload)来将已经训练好的模型上传到ModelScope平台。您可以提前在ModelScope社区网页创建对应模型，然后将本地模型目录通过push_model接口进行上传，也可以直接通过push_model自动完成模型创建和上传

\`\`\`python
from modelscope.hub.api import HubApi

YOUR_ACCESS_TOKEN = '请从ModelScope个人中心->访问令牌获取'

api = HubApi()
api.login(YOUR_ACCESS_TOKEN)
api.push_model(
    model_id="YOUR_NAME/zhihu_bot_lora", 
    model_dir="output/qwen2-7b-instruct/v1-20240819-150005/checkpoint-371" # 本地模型目录，要求目录中必须包含configuration.json
)
\`\`\``
    },
    {
      id: 'nb-llm-quick-train',
      title: '10步快速训练入门',
      file: 'LLM-tutorial/notebook/训练.ipynb',
      difficulty: '入门',
      duration: '0.5h',
      week: 2,
      phase: 2,
      keywords: ['Qwen', 'LoRA', '快速入门'],
      content: `1. 安装最新版本的modelscope和swift

\`\`\`python
!pip install modelscope ms-swift -U
!pip install tf-keras==2.16.0 --no-dependencies
\`\`\`

2. 加载数据集

\`\`\`python
from modelscope import MsDataset
dataset = MsDataset.load('swift/classical_chinese_translate')
dataset = dataset['train']
\`\`\`

3. 查看数据集内容

\`\`\`python
print(dataset)
print(dataset['conversations'][0])
\`\`\`

4. 加载模型、分词器、模板

\`\`\`python
import torch
from modelscope import AutoModelForCausalLM
from modelscope import AutoTokenizer
from swift.llm import get_template, TemplateType
tokenizer = AutoTokenizer.from_pretrained('Qwen/Qwen2.5-7B-Instruct', trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained('Qwen/Qwen2.5-7B-Instruct', torch_dtype=torch.bfloat16, device_map='auto', trust_remote_code=True)
print(model)
print(tokenizer('I like AI'))


template = get_template(TemplateType.qwen2_5, tokenizer, max_length=400)
ret = template.encode({'query': 'what is your hobby?', 'response': 'I like AI'})
print(ret)
tokenizer.decode(ret[0]['input_ids'])
\`\`\`

5. 预处理数据集

\`\`\`python
from swift.llm.utils.preprocess import ConversationsPreprocessor
ds = ConversationsPreprocessor()(dataset)
print(ds[0])

def encode(example):
    example, kwargs = template.encode(example)
    if 'input_ids' not in example:
        return {
            'input_ids': None,
            'labels': None,
        }
    return example

ds = ds.select(range(300)).map(encode).filter(lambda e: e.get('input_ids'))
ds = ds.train_test_split(test_size=0.1)

train_dataset, val_dataset = ds['train'], ds['test']
print('===========================================')
print(train_dataset[0])
\`\`\`

6. 加载LoRA

\`\`\`python
from swift import Swift, LoraConfig


lora_config = LoraConfig(
                r=8,
                target_modules=['q_proj', 'k_proj', 'v_proj', 'o_proj', 'gate_proj', 'up_proj', 'down_proj'],
                lora_alpha=32,
                lora_dropout=0.05)
model = Swift.prepare_model(model, lora_config)
\`\`\`

7. 训练

\`\`\`python
# A100 18G memory
from swift import Seq2SeqTrainer, Seq2SeqTrainingArguments
import torch


train_args = Seq2SeqTrainingArguments(
    output_dir='output',
    learning_rate=1e-4,
    num_train_epochs=1,
    eval_steps=5,
    save_steps=5,
    evaluation_strategy='no',
    save_strategy='steps',
    dataloader_num_workers=4,
    per_device_train_batch_size=1,
    gradient_accumulation_steps=16,
    logging_steps=2,
)

print(train_dataset[0])

trainer = Seq2SeqTrainer(
    model=model,
    args=train_args,
    data_collator=template.data_collator,
    train_dataset=train_dataset,
    eval_dataset=val_dataset,
    tokenizer=tokenizer)

trainer.train()
\`\`\`

8. 看看存了什么

\`\`\`python
!ls output/checkpoint-11
\`\`\`

9. 推理

\`\`\`python
from modelscope import GenerationConfig
query = '你喜欢什么'
inputs, kwargs = template.encode({'query': query})
print(inputs)
generation_config = GenerationConfig(max_new_tokens=512, top_p=0.7, temperature=0.3)
inputs['input_ids'] = torch.tensor(inputs['input_ids'])[None].cuda()
generate_ids = model.generate(generation_config=generation_config, **inputs)
print(generate_ids)
print(tokenizer.decode(generate_ids[0]))
\`\`\`

10. 界面

\`\`\`python
!pip install gradio==3.50.2
!swift web-ui
\`\`\``
    },
    {
      id: 'nb-llm-self-cognition',
      title: '10分钟改变大模型自我认知',
      file: 'LLM-tutorial/R.10分钟改变大模型自我认知.ipynb',
      difficulty: '入门',
      duration: '1h',
      week: 2,
      phase: 2,
      keywords: ['自我认知', '微调', '快速入门'],
      content: `# 10分钟改变大模型自我认知，定制“专属自己”的聊天机器人

我们使用ms-swift对Qwen2.5-3B-Instruct进行自我认知微调。

- 模型：https://modelscope.cn/models/Qwen/Qwen2.5-3B-Instruct

- 自我认知数据集：https://modelscope.cn/datasets/swift/self-cognition

- 训练框架：https://github.com/modelscope/ms-swift.git

- 实验环境：A10、3090等（需显存资源12GB）

这里给出了两种训练和推理的方式，分别是：使用命令行界面和使用Python。

- 使用命令行界面：帮助开发者更快的将训练和推理跑起来。

- 使用Python：帮助开发者了解训练和推理的一些细节，这对定制训练过程有很大帮助。

准备好了吗？让我们开始这段旅程叭……

## 安装 ms-swift

\`\`\`python
!pip install ms-swift -U
!pip install transformers -U
\`\`\`

## 使用命令行界面

#### 原始模型推理
展示模型原始的自我认知：

\`\`\`python
!CUDA_VISIBLE_DEVICES=0 \\
swift infer \\
    --model Qwen/Qwen2.5-3B-Instruct \\
    --stream true \\
    --temperature 0 \\
    --infer_backend pt \\
    --max_model_len 2048
\`\`\`

#### 训练

\`\`\`python
!CUDA_VISIBLE_DEVICES=0 \\
swift sft \\
    --model Qwen/Qwen2.5-3B-Instruct \\
    --train_type lora \\
    --dataset 'AI-ModelScope/alpaca-gpt4-data-zh#500' \\
              'AI-ModelScope/alpaca-gpt4-data-en#500' \\
              'swift/self-cognition#500' \\
    --torch_dtype bfloat16 \\
    --num_train_epochs 1 \\
    --per_device_train_batch_size 1 \\
    --per_device_eval_batch_size 1 \\
    --learning_rate 1e-4 \\
    --lora_rank 8 \\
    --lora_alpha 32 \\
    --target_modules all-linear \\
    --gradient_accumulation_steps 16 \\
    --eval_steps 50 \\
    --save_steps 50 \\
    --save_total_limit 2 \\
    --logging_steps 5 \\
    --max_length 2048 \\
    --output_dir output \\
    --system 'You are a helpful assistant.' \\
    --warmup_ratio 0.05 \\
    --dataloader_num_workers 4 \\
    --dataset_num_proc 4 \\
    --model_name 小黄 'Xiao Huang' \\
    --model_author '魔搭' 'ModelScope'

\`\`\`

#### 微调后推理

使用'pt'推理引擎进行推理，将\`--adapters\`设置为last_model_checkpoint。

由于训练的checkpoint中包含\`args.json\`文件，里面存储了训练时的一些参数，因此不需要额外指定\`--model\`, \`--system\`等参数。

\`\`\`python
!CUDA_VISIBLE_DEVICES=0 \\
swift infer \\
    --adapters output/vx-xxx/checkpoint-xxx \\
    --stream true \\
    --temperature 0 \\
    --infer_backend pt \\
    --max_new_tokens 2048
\`\`\`

将lora增量权重进行merge，并使用'vllm'推理引擎进行推理：

\`\`\`python
!CUDA_VISIBLE_DEVICES=0 \\
swift infer \\
    --adapters output/vx-xxx/checkpoint-xxx \\
    --merge_lora true \\
    --stream true \\
    --temperature 0 \\
    --infer_backend vllm \\
    --max_model_len 2048 \\
    --max_new_tokens 2048
\`\`\`

## 使用Python


#### 训练
导入一些库：

\`\`\`python
import os
os.environ['CUDA_VISIBLE_DEVICES'] = '0'

from swift.llm import get_model_tokenizer, load_dataset, get_template, EncodePreprocessor
from swift.utils import get_logger, find_all_linears, get_model_parameter_info, plot_images, seed_everything
from swift.tuners import Swift, LoraConfig
from swift.trainers import Seq2SeqTrainer, Seq2SeqTrainingArguments
from functools import partial

logger = get_logger()
seed_everything(42)
\`\`\`

设置训练的超参数：

\`\`\`python
# 模型
model_id_or_path = 'Qwen/Qwen2.5-3B-Instruct'  # model_id or model_path
system = 'You are a helpful assistant.'
output_dir = 'output'

# 数据集
dataset = ['AI-ModelScope/alpaca-gpt4-data-zh#500', 'AI-ModelScope/alpaca-gpt4-data-en#500',
           'swift/self-cognition#500']  # dataset_id or dataset_path
data_seed = 42
max_length = 2048
split_dataset_ratio = 0.01  # 切分验证集
num_proc = 4  # 预处理的进程数
# 替换自我认知数据集中的填充符：{{NAME}}, {{AUTHOR}}
model_name = ['小黄', 'Xiao Huang']  # 模型的中文名和英文名
model_author = ['魔搭', 'ModelScope']  # 模型作者的中文名和英文名

# lora
lora_rank = 8
lora_alpha = 32

# 训练超参数
training_args = Seq2SeqTrainingArguments(
    output_dir=output_dir,
    learning_rate=1e-4,
    per_device_train_batch_size=1,
    per_device_eval_batch_size=1,
    gradient_checkpointing=True,
    weight_decay=0.1,
    lr_scheduler_type='cosine',
    warmup_ratio=0.05,
    report_to=['tensorboard'],
    logging_first_step=True,
    save_strategy='steps',
    save_steps=50,
    eval_strategy='steps',
    eval_steps=50,
    gradient_accumulation_steps=16,
    num_train_epochs=1,
    metric_for_best_model='loss',
    save_total_limit=2,
    logging_steps=5,
    dataloader_num_workers=1,
    data_seed=data_seed,
)

output_dir = os.path.abspath(os.path.expanduser(output_dir))
logger.info(f'output_dir: {output_dir}')
\`\`\`

获取模型和对话template，并将可训练的lora层加入到模型中：

\`\`\`python
model, tokenizer = get_model_tokenizer(model_id_or_path)
logger.info(f'model_info: {model.model_info}')
template = get_template(model.model_meta.template, tokenizer, default_system=system, max_length=max_length)
template.set_mode('train')

target_modules = find_all_linears(model)
lora_config = LoraConfig(task_type='CAUSAL_LM', r=lora_rank, lora_alpha=lora_alpha,
                         target_modules=target_modules)
model = Swift.prepare_model(model, lora_config)
logger.info(f'lora_config: {lora_config}')

# 打印模型结构和训练的参数量
logger.info(f'model: {model}')
model_parameter_info = get_model_parameter_info(model)
logger.info(f'model_parameter_info: {model_parameter_info}')
\`\`\`

下载并载入数据集，并切分成训练集和验证集，

然后将文本编码成tokens：

\`\`\`python
train_dataset, val_dataset = load_dataset(dataset, split_dataset_ratio=split_dataset_ratio, num_proc=num_proc,
        model_name=model_name, model_author=model_author, seed=data_seed)

logger.info(f'train_dataset: {train_dataset}')
logger.info(f'val_dataset: {val_dataset}')
logger.info(f'train_dataset[0]: {train_dataset[0]}')

train_dataset = EncodePreprocessor(template=template)(train_dataset, num_proc=num_proc)
val_dataset = EncodePreprocessor(template=template)(val_dataset, num_proc=num_proc)
logger.info(f'encoded_train_dataset[0]: {train_dataset[0]}')

# 打印一条样本
template.print_inputs(train_dataset[0])
\`\`\`

初始化trainer并开始训练：

\`\`\`python
model.enable_input_require_grads()  # 兼容gradient checkpointing
trainer = Seq2SeqTrainer(
    model=model,
    args=training_args,
    data_collator=template.data_collator,
    train_dataset=train_dataset,
    eval_dataset=val_dataset,
    template=template,
)
trainer.train()

last_model_checkpoint = trainer.state.last_model_checkpoint
logger.info(f'last_model_checkpoint: {last_model_checkpoint}')
\`\`\`

可视化训练的loss。其中浅黄色线条代表真实loss值，黄色线条代表经过0.9平滑系数平滑后的loss值。

你也可以使用tensorboard进行实时可视化，在命令行输入\`tensorboard --logdir '{output_dir}/runs'\`。

\`\`\`python
images_dir = os.path.join(output_dir, 'images')
logger.info(f'images_dir: {images_dir}')
plot_images(images_dir, training_args.logging_dir, ['train/loss'], 0.9)  # 保存图片

# 展示图片
from IPython.display import display
from PIL import Image
image = Image.open(os.path.join(images_dir, 'train_loss.png'))
display(image)
\`\`\`

#### 微调后推理

导入一些库：

\`\`\`python
import os
os.environ['CUDA_VISIBLE_DEVICES'] = '0'

from swift.llm import InferEngine, InferRequest, PtEngine, RequestConfig, get_template
\`\`\`

设置推理的超参数：

\`\`\`python
last_model_checkpoint = 'output/vx-xxx/checkpoint-xxx'

# 模型
model_id_or_path = 'Qwen/Qwen2.5-3B-Instruct'  # model_id or model_path
system = 'You are a helpful assistant.'
infer_backend = 'pt'

# 生成参数
max_new_tokens = 512
temperature = 0
stream = True
\`\`\`

获取推理引擎，并载入LoRA权重：

\`\`\`python
engine = PtEngine(model_id_or_path, adapters=[last_model_checkpoint])
template = get_template(engine.model.model_meta.template, engine.tokenizer, default_system=system)
# 这里对推理引擎的默认template进行修改，也可以在\`engine.infer\`时进行传入
engine.default_template = template
\`\`\`

开始推理...

\`\`\`python
query_list = [
    'who are you?',
    "晚上睡不着觉怎么办？",
    '你是谁训练的？',
]

def infer_stream(engine: InferEngine, infer_request: InferRequest):
    request_config = RequestConfig(max_tokens=max_new_tokens, temperature=temperature, stream=True)
    gen_list = engine.infer([infer_request], request_config)
    query = infer_request.messages[0]['content']
    print(f'query: {query}\\nresponse: ', end='')
    for resp in gen_list[0]:
        if resp is None:
            continue
        print(resp.choices[0].delta.content, end='', flush=True)
    print()

def infer(engine: InferEngine, infer_request: InferRequest):
    request_config = RequestConfig(max_tokens=max_new_tokens, temperature=temperature)
    resp_list = engine.infer([infer_request], request_config)
    query = infer_request.messages[0]['content']
    response = resp_list[0].choices[0].message.content
    print(f'query: {query}')
    print(f'response: {response}')

infer_func = infer_stream if stream else infer
for query in query_list:
    infer_func(engine, InferRequest(messages=[{'role': 'user', 'content': query}]))
    print('-' * 50)
\`\`\`

## Web-UI

\`\`\`python
!CUDA_VISIBLE_DEVICES=0 \\
swift web-ui \\
    --adapters output/vx-xxx/checkpoint-xxx \\
    --temperature 0 \\
    --infer_backend pt \\
    --max_new_tokens 2048
\`\`\``
    }
  ]
});
