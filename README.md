# 🚀 AI Business Idea Generator

一个基于人工智能的商业创意生成器，支持多种大语言模型（DeepSeek、Qwen、GPT-4、Claude 等），帮助您快速生成创新的商业点子。

![AI Business Idea Generator](./BigIdeasDB-Free-Business-Idea-Generator.png)

## ✨ 特性

- 🤖 **多模型支持**：支持 DeepSeek、Qwen（通义千问）、GPT-4、Claude 3 等多种 AI 模型
- 🎯 **5 种生成类型**：趋势市场、随机创意、小众市场、创新颠覆、可扩展性
- 📱 **响应式设计**：完美适配移动端、平板和桌面设备
- ⚡ **快速生成**：秒级响应，实时生成创意
- 🎨 **现代 UI**：基于 shadcn/ui 的精美界面
- 🔒 **类型安全**：全栈 TypeScript 开发
- 🌍 **国际化友好**：支持中文和英文

## 🛠️ 技术栈

### 前端
- **Next.js 14** (App Router) - React 框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **shadcn/ui** - UI 组件库
- **Lucide Icons** - 图标库

### 后端
- **Next.js API Routes** - API 服务
- **LiteLLM** - 统一多模型接口
- **OpenAI SDK** - AI 模型调用
- **Anthropic SDK** - Claude 模型支持
- **Zod** - 数据验证

### 支持的 AI 模型
- ✅ **DeepSeek** (推荐) - 性价比高，中文友好
- ✅ **Qwen / 通义千问** (推荐) - 阿里云，中文优秀
- ✅ **GPT-4 / GPT-3.5** - OpenAI
- ✅ **Claude 3 系列** - Anthropic
- ✅ **Gemini Pro** - Google
- ✅ **Ollama** - 本地模型支持

## 📦 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd idea
```

### 2. 安装依赖

```bash
npm install
# 或
pnpm install
# 或
yarn install
```

### 3. 配置环境变量

复制 `.env.example` 到 `.env.local`：

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入你的 API Keys：

```env
# DeepSeek (推荐)
DEEPSEEK_API_KEY=sk-...
DEEPSEEK_BASE_URL=https://api.deepseek.com

# Qwen / 通义千问 (推荐)
DASHSCOPE_API_KEY=sk-...
QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1

# OpenAI (可选)
OPENAI_API_KEY=sk-...

# Anthropic Claude (可选)
ANTHROPIC_API_KEY=sk-ant-...

# 默认模型
DEFAULT_MODEL=deepseek-chat
```

### 4. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 5. 构建生产版本

```bash
npm run build
npm start
```

## 🔑 获取 API Keys

### DeepSeek (推荐 - 性价比最高)

1. 访问 [https://platform.deepseek.com/](https://platform.deepseek.com/)
2. 注册并登录
3. 在 API Keys 页面创建新的 Key
4. 新用户有免费额度
5. **价格**：¥1/百万输入 tokens，¥2/百万输出 tokens

### Qwen / 通义千问 (推荐 - 中文优秀)

1. 访问 [https://dashscope.console.aliyun.com/](https://dashscope.console.aliyun.com/)
2. 注册阿里云账号并登录
3. 开通灵积（DashScope）服务
4. 创建 API Key
5. 有免费试用额度

### OpenAI

1. 访问 [https://platform.openai.com/](https://platform.openai.com/)
2. 需要国际信用卡
3. GPT-4 价格较高

### Claude (Anthropic)

1. 访问 [https://console.anthropic.com/](https://console.anthropic.com/)
2. 需要国际信用卡
3. Claude 3 系列性能优秀

## 📁 项目结构

```
idea/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API 路由
│   │   │   ├── generate/         # 生成创意 API
│   │   │   └── models/           # 模型列表 API
│   │   ├── layout.tsx            # 根布局
│   │   └── page.tsx              # 首页
│   ├── components/               # React 组件
│   │   ├── ui/                   # shadcn/ui 基础组件
│   │   ├── Header.tsx            # 顶部导航
│   │   ├── Hero.tsx              # Hero 区域
│   │   ├── IdeaGenerator.tsx     # 主生成器
│   │   ├── IdeaCard.tsx          # 创意卡片
│   │   ├── CTASection.tsx        # CTA 区域
│   │   └── Footer.tsx            # 页脚
│   ├── lib/                      # 工具库
│   │   ├── litellm.ts            # LiteLLM 客户端
│   │   ├── prompts.ts            # Prompt 模板
│   │   └── utils.ts              # 工具函数
│   ├── types/                    # TypeScript 类型
│   │   └── index.ts
│   └── styles/
│       └── globals.css           # 全局样式
├── public/                       # 静态资源
├── .env.example                  # 环境变量示例
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## 🎯 使用指南

### 1. 选择生成类型

- **趋势市场机会**：基于当前市场趋势的创意
- **随机创业概念**：意想不到的创新想法
- **小众市场创意**：细分市场的机会
- **创新颠覆**：突破性的商业模式
- **可扩展性**：高增长潜力的业务

### 2. 输入您的信息

在输入框中填写：
- 您的兴趣和爱好
- 专业技能
- 想要进入的行业
- 关注的领域

示例：
- "人工智能和教育"
- "可持续农业和食品科技"
- "健康科技和老年护理"
- "Web3 和社交媒体"

### 3. 选择 AI 模型

根据您的需求选择模型：
- **DeepSeek Chat**：推荐，性价比高，速度快
- **Qwen Plus/Max**：阿里云，中文场景优秀
- **GPT-4 Turbo**：最先进，但价格较高
- **Claude 3 Opus**：创意输出优秀

### 4. 生成创意

点击"生成商业创意"按钮，AI 将为您生成 5 个详细的商业创意，包括：
- 创意标题和描述
- 目标市场
- 盈利模式
- 核心特色
- 市场规模（可选）
- 竞争分析（可选）

## 🚀 部署

### Vercel (推荐)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. 点击上方按钮
2. 导入你的 Git 仓库
3. 在环境变量中添加 API Keys
4. 点击部署

### Docker

```bash
# 构建镜像
docker build -t ai-business-idea-generator .

# 运行容器
docker run -p 3000:3000 \
  -e DEEPSEEK_API_KEY=your-key \
  -e DASHSCOPE_API_KEY=your-key \
  ai-business-idea-generator
```

### 其他平台

- **Netlify**
- **Railway**
- **Render**
- **自托管 VPS**

## 💰 成本估算

### 开发成本
- 开发时间：约 8-12 天
- 技术难度：中等

### 运营成本（月）

#### 方案 1：Vercel + DeepSeek（推荐）
- Vercel Hobby：$0（个人项目）
- DeepSeek API：约 $5-20（根据使用量）
- **总计**：$5-20/月

#### 方案 2：Vercel Pro + Qwen
- Vercel Pro：$20
- Qwen API：约 $10-30
- **总计**：$30-50/月

#### 方案 3：自托管 + Ollama（最省钱）
- VPS：$5-10/月
- Ollama：免费（本地模型）
- **总计**：$5-10/月

### API 调用成本参考

| 模型 | 输入（¥/百万tokens） | 输出（¥/百万tokens） | 推荐 |
|------|---------------------|---------------------|------|
| DeepSeek Chat | 1 | 2 | ⭐⭐⭐⭐⭐ |
| Qwen Turbo | 2 | 6 | ⭐⭐⭐⭐⭐ |
| Qwen Plus | 4 | 12 | ⭐⭐⭐⭐ |
| Qwen Max | 40 | 120 | ⭐⭐⭐ |
| GPT-3.5 Turbo | 3.5 | 7 | ⭐⭐⭐ |
| GPT-4 Turbo | 70 | 210 | ⭐⭐ |
| Claude 3 Opus | 105 | 315 | ⭐⭐ |

## 🤝 贡献

欢迎提交 Issues 和 Pull Requests！

## 📄 许可证

MIT License

## 🙏 致谢

- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [DeepSeek](https://www.deepseek.com/)
- [Qwen](https://tongyi.aliyun.com/)
- [OpenAI](https://openai.com/)
- [Anthropic](https://anthropic.com/)

## 📞 联系方式

- GitHub: [Your GitHub](https://github.com/yourusername)
- Email: your-email@example.com
- Twitter: [@yourhandle](https://twitter.com/yourhandle)

---

⭐ 如果这个项目对您有帮助，请给一个 Star！
