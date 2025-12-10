# 🏗️ 工作流系统架构图

## 📊 系统架构概览

```mermaid
graph TB
    subgraph "用户界面层"
        A[主页 /] --> B[工作流页面 /workflow]
        C[独立页面 /brainstorm] 
        D[独立页面 /validate-demand]
        B --> E[步骤1: 生成创意]
        B --> F[步骤2: 精炼创意]
        B --> G[步骤3: 验证需求]
    end
    
    subgraph "状态管理层"
        H[WorkflowContext]
        I[AppContext]
        H --> J[WorkflowState]
        H --> K[数据流转逻辑]
    end
    
    subgraph "数据处理层"
        L[dataTransformers.ts]
        M[workflowHelpers.ts]
        N[workflowStorage.ts]
        L --> O[创意→话题转换]
        L --> P[对话→需求合成]
    end
    
    subgraph "持久化层"
        Q[localStorage]
        R[自动保存机制]
        S[工作流历史]
    end
    
    E --> H
    F --> H
    G --> H
    H --> L
    H --> N
    N --> Q
```

## 🔄 数据流转架构

```mermaid
sequenceDiagram
    participant U as 用户
    participant G as GenerateStep
    participant WC as WorkflowContext
    participant DT as DataTransformers
    participant R as RefineStep
    participant V as ValidateStep
    participant LS as localStorage
    
    U->>G: 生成并选择创意
    G->>WC: updateGenerateData(selectedIdea)
    WC->>LS: 自动保存状态
    
    U->>WC: 导航到精炼步骤
    WC->>DT: synthesizeTopicFromIdea(selectedIdea)
    DT-->>WC: 返回预填充话题
    WC->>R: 传递话题数据
    
    U->>R: 完成对话
    R->>WC: updateRefineData(chatHistory)
    WC->>LS: 自动保存状态
    
    U->>WC: 导航到验证步骤
    WC->>DT: synthesizeDemandFromChat(chatHistory, idea)
    DT-->>WC: 返回需求描述
    WC->>V: 传递需求数据
    
    U->>V: 完成验证
    V->>WC: updateValidateData(result)
    WC->>LS: 保存完整工作流
```

## 🧩 组件层次结构

```mermaid
graph TD
    A[App Layout] --> B[Header]
    A --> C[WorkflowPage]
    A --> D[Footer]
    
    C --> E[WorkflowLayout]
    E --> F[WorkflowProgress]
    E --> G[WorkflowContent]
    E --> H[WorkflowNavigation]
    
    G --> I[GenerateStep]
    G --> J[RefineStep] 
    G --> K[ValidateStep]
    
    I --> L[IdeaGenerator]
    I --> M[IdeaSelectorModal]
    
    J --> N[SocraticChat]
    J --> O[DataTransferCard]
    
    K --> P[DemandValidator]
    K --> Q[ValidationResults]
    
    F --> R[StepIndicator]
    F --> S[ProgressBar]
    
    H --> T[NavigationButtons]
    H --> U[WorkflowActions]
```

## 📱 响应式设计架构

```mermaid
graph LR
    subgraph "桌面端 (≥1024px)"
        A1[侧边栏导航]
        A2[主内容区]
        A3[右侧面板]
    end
    
    subgraph "平板端 (768px-1023px)"
        B1[顶部步骤条]
        B2[主内容区]
        B3[底部导航]
    end
    
    subgraph "移动端 (<768px)"
        C1[简化步骤指示]
        C2[全屏内容]
        C3[浮动导航按钮]
    end
    
    A1 --> B1
    A2 --> B2
    A3 --> B3
    
    B1 --> C1
    B2 --> C2
    B3 --> C3
```

## 🔧 技术栈架构

```mermaid
graph TB
    subgraph "前端框架"
        A[Next.js 16]
        B[React 19]
        C[TypeScript]
    end
    
    subgraph "状态管理"
        D[React Context API]
        E[Custom Hooks]
        F[localStorage]
    end
    
    subgraph "UI组件"
        G[Tailwind CSS]
        H[Radix UI]
        I[Lucide Icons]
        J[Framer Motion]
    end
    
    subgraph "数据处理"
        K[Zod 验证]
        L[自定义转换器]
        M[NLP 文本处理]
    end
    
    A --> D
    B --> E
    C --> K
    D --> F
    G --> H
    H --> I
    I --> J
    K --> L
    L --> M
```

## 🚀 部署架构

```mermaid
graph TB
    subgraph "开发环境"
        A[本地开发]
        B[热重载]
        C[TypeScript检查]
    end
    
    subgraph "构建流程"
        D[Next.js Build]
        E[静态优化]
        F[代码分割]
    end
    
    subgraph "生产环境"
        G[Vercel部署]
        H[CDN分发]
        I[边缘计算]
    end
    
    A --> D
    B --> E
    C --> F
    D --> G
    E --> H
    F --> I
```

## 📊 性能优化架构

```mermaid
graph LR
    subgraph "代码层面"
        A[React.memo]
        B[useMemo/useCallback]
        C[懒加载组件]
    end
    
    subgraph "数据层面"
        D[防抖保存]
        E[选择性更新]
        F[缓存策略]
    end
    
    subgraph "网络层面"
        G[代码分割]
        H[预加载]
        I[压缩优化]
    end
    
    A --> D
    B --> E
    C --> F
    D --> G
    E --> H
    F --> I
```

## 🔒 数据安全架构

```mermaid
graph TB
    subgraph "客户端安全"
        A[输入验证]
        B[XSS防护]
        C[数据加密]
    end
    
    subgraph "存储安全"
        D[localStorage限制]
        E[敏感数据过滤]
        F[自动清理]
    end
    
    subgraph "传输安全"
        G[HTTPS强制]
        H[API验证]
        I[错误处理]
    end
    
    A --> D
    B --> E
    C --> F
    D --> G
    E --> H
    F --> I
```

## 🧪 测试架构

```mermaid
graph TB
    subgraph "单元测试"
        A[组件测试]
        B[Hook测试]
        C[工具函数测试]
    end
    
    subgraph "集成测试"
        D[工作流端到端]
        E[数据流转测试]
        F[持久化测试]
    end
    
    subgraph "用户测试"
        G[可用性测试]
        H[性能测试]
        I[兼容性测试]
    end
    
    A --> D
    B --> E
    C --> F
    D --> G
    E --> H
    F --> I
```

## 📈 监控架构

```mermaid
graph LR
    subgraph "用户行为"
        A[页面访问]
        B[工作流完成率]
        C[步骤跳转率]
    end
    
    subgraph "性能指标"
        D[加载时间]
        E[交互响应]
        F[错误率]
    end
    
    subgraph "业务指标"
        G[转化率]
        H[用户满意度]
        I[功能使用率]
    end
    
    A --> D
    B --> E
    C --> F
    D --> G
    E --> H
    F --> I
```

这个架构图展示了整个工作流系统的技术设计，从用户界面到数据处理，从状态管理到性能优化，提供了完整的技术实现蓝图。每个层次都有明确的职责分工，确保系统的可维护性和可扩展性。