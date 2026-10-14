// 演示用本地数据 —— 纯常量 + 纯函数，不引入数据层依赖（见 design.md D4）
// 全部内容仅用于本地跑通页面，刷新不保证保留。

import type {
  GapItem,
  Project,
  ResumeSuggestion,
  ResumeVersion,
  SkillTag,
  SprintTask,
  Target,
} from '@zhitu/types'

/* ============ 主目标岗位 ============ */

export const TARGET: Target = {
  title: '嵌入式软件实习生',
  company: '华勤技术',
  location: '上海',
  must: ['C 语言', 'RTOS', '串口通信', 'I2C / SPI', '调试与问题定位', '版本管理'],
  plus: ['CAN 总线', '技术文档', 'Linux'],
  hard: ['本科及以上 · 电子/计算机/自动化', '2026 届应届生', '英语四级'],
}

/* ============ 项目 ============ */

export const PROJECTS: Project[] = [
  {
    id: 'thermal',
    name: '智能温控终端',
    role: '固件开发',
    period: '2025.03 – 2025.06',
    tech: ['STM32', 'FreeRTOS', 'I2C', 'PID'],
    goal: '让恒温箱在 ±0.5℃ 内稳定运行，并支持远程设定温度曲线。',
    status: 'reported',
    completedRounds: 9,
    materials: [
      { id: 'm-t1', kind: 'link', label: 'GitHub 仓库 · thermal-ctrl', href: 'https://example.com/thermal' },
      { id: 'm-t2', kind: 'doc', label: '模块设计文档 v1.2', href: '' },
      { id: 'm-t3', kind: 'log', label: 'I2C 通信异常排查记录', href: '' },
    ],
  },
  {
    id: 'drone',
    name: '四轴无人机飞控',
    role: '姿态解算',
    period: '2024.09 – 2024.12',
    tech: ['C', 'MPU6050', '互补滤波', 'PWM'],
    goal: '让四轴在手动模式下保持自稳，悬停时不出现明显漂移。',
    status: 'digging',
    completedRounds: 3,
    materials: [{ id: 'm-d1', kind: 'link', label: 'GitHub 仓库 · quad-fc', href: 'https://example.com/quad' }],
  },
  {
    // 刻意留一个没有任何材料的项目：用于演示「纯追问验证」这条分支（规格 P10）
    id: 'gateway',
    name: '智能家居网关',
    role: '协议对接',
    period: '2024.03 – 2024.06',
    tech: ['ESP32', 'MQTT'],
    goal: '把几款不同协议的传感器接入同一个网关，统一上报到平台。',
    status: 'draft',
    completedRounds: 0,
    materials: [],
  },
]

export function findProject(id: string): Project | undefined {
  return PROJECTS.find((p) => p.id === id)
}

/* ============ 技能清单 ============ */

export const SKILLS: SkillTag[] = [
  {
    id: 's-1',
    name: 'C 语言',
    status: 'verified',
    source: { kind: 'material', material: 'GitHub 仓库 · thermal-ctrl', excerpt: '仓库主语言为 C，包含驱动层与应用层共 3.2k 行。' },
  },
  {
    id: 's-2',
    name: 'RTOS',
    status: 'verified',
    source: { kind: 'round', round: 5, question: '控制任务的周期和优先级是怎么定的？', excerpt: '三任务模型，控制 10ms 周期最高优先级。' },
  },
  {
    id: 's-3',
    name: 'I2C / SPI',
    status: 'verified',
    source: { kind: 'material', material: 'I2C 通信异常排查记录', excerpt: '从机拉低 SDA 的死锁定位过程。' },
  },
  { id: 's-4', name: '串口通信', status: 'claimed', source: { kind: 'confirmed', label: '简历原文', excerpt: '熟悉 UART 通信协议。' } },
  { id: 's-5', name: '调试与问题定位', status: 'verified', source: { kind: 'round', round: 6, question: '印象最深的一个 bug？', excerpt: '完整讲了从现象到根因的定位链路。' } },
  { id: 's-6', name: '版本管理', status: 'claimed', source: { kind: 'confirmed', label: '简历原文', excerpt: '使用 Git 进行协作开发。' } },
  { id: 's-7', name: 'CAN 总线', status: 'insufficient', source: { kind: 'round', round: 7, question: '这个项目后来有做过组网扩展吗？', excerpt: '计划加 CAN，但最终没有实现。' } },
  { id: 's-8', name: '技术文档', status: 'claimed', source: { kind: 'confirmed', label: '简历原文', excerpt: '负责编写模块设计文档。' } },
  { id: 's-9', name: 'Linux', status: 'missing', source: null },
]

/* ============ 差距与冲刺 ============ */

export const GAP_ITEMS: GapItem[] = [
  { id: 'g-1', skill: 'C 语言', bucket: 'ready', relevance: 'high', status: 'verified', cost: 'low', urgency: 'mid', note: '两段项目都是主语言，可直接强化表述。' },
  { id: 'g-2', skill: 'RTOS', bucket: 'ready', relevance: 'high', status: 'verified', cost: 'low', urgency: 'mid', note: '追问中能完整解释任务划分与优先级。' },
  { id: 'g-3', skill: '调试与问题定位', bucket: 'ready', relevance: 'high', status: 'verified', cost: 'low', urgency: 'low', note: '有可查看的排查记录。' },
  { id: 'g-4', skill: 'I2C / SPI', bucket: 'needs-evidence', relevance: 'high', status: 'insufficient', cost: 'mid', urgency: 'high', note: '有排查记录，但缺少能说明时序判断的部分。' },
  { id: 'g-5', skill: 'CAN 总线', bucket: 'needs-evidence', relevance: 'mid', status: 'insufficient', cost: 'high', urgency: 'mid', note: '岗位标为加分项，目前只有口头计划。' },
  { id: 'g-6', skill: '技术文档', bucket: 'needs-evidence', relevance: 'mid', status: 'claimed', cost: 'low', urgency: 'mid', note: '文档已写但未提交，补交即可核验。' },
  { id: 'g-7', skill: 'Linux', bucket: 'missing', relevance: 'mid', status: 'missing', cost: 'high', urgency: 'low', note: '岗位提及，两段项目均未涉及。' },
  { id: 'g-8', skill: '异常处理', bucket: 'missing', relevance: 'high', status: 'insufficient', cost: 'mid', urgency: 'high', note: '追问中未能说清触发条件与处理方式。' },
  { id: 'g-9', skill: '学历 / 专业', bucket: 'hard', relevance: 'high', status: 'verified', cost: 'low', urgency: 'low', note: '本科 · 电子信息工程，符合岗位要求。' },
  { id: 'g-10', skill: '毕业年份', bucket: 'hard', relevance: 'high', status: 'verified', cost: 'low', urgency: 'low', note: '2026 届应届生，符合。' },
  { id: 'g-11', skill: '英语四级', bucket: 'hard', relevance: 'high', status: 'verified', cost: 'low', urgency: 'low', note: '已通过 CET-4。' },
]

export const SPRINT_TASKS: SprintTask[] = [
  {
    id: 'k-1',
    title: '补齐 I2C 排查记录里的时序判断',
    goal: '把「为什么判断是从机复位被打断」讲清楚',
    done: '在排查记录中补上 SDA 拉低前后的时序截图与你的判断依据，至少说明两个备选假设为何被排除',
    revalidate: '重新进入项目深挖，回答「调试定位」维度时能否不看记录讲出来',
    skill: 'I2C / SPI',
    minutes: 45,
    state: 'todo',
    source: { kind: 'material', material: 'I2C 通信异常排查记录', excerpt: '现有记录只写了结论，缺少排除假设的过程。' },
  },
  {
    id: 'k-2',
    title: '补交模块设计文档并标出自己写的章节',
    goal: '把「用户声明」的技术文档变成可核验材料',
    done: '上传文档，并在项目档案中标明哪几节由你撰写',
    revalidate: '文档出现在项目材料清单中，技术文档一项状态变为已验证',
    skill: '技术文档',
    minutes: 30,
    state: 'todo',
    source: { kind: 'round', round: 8, question: '团队协作上你做过哪些输出？', excerpt: '写过模块设计文档，评审的时候讲过一遍。' },
  },
  {
    id: 'k-3',
    title: '整理姿态跑飞现象的触发条件',
    goal: '把「重启就好了」变成可复现的描述',
    done: '写清至少一种能稳定复现的条件（动作幅度、采样间隔或供电状态任选其一）',
    revalidate: '再次追问「异常处理」时能给出复现步骤',
    skill: '异常处理',
    minutes: 60,
    state: 'todo',
    source: { kind: 'round', round: 3, question: '解算结果异常时系统怎么处理？', excerpt: '偶尔会跳一下，重启就好了。' },
  },
  {
    id: 'k-4',
    title: 'CAN 总线先做一个最小回环实验',
    goal: '判断这项加分项值不值得投入',
    done: '用开发板完成一次自发自收，记录接线与配置参数',
    revalidate: '能说明 CAN 与串口在仲裁机制上的差别',
    skill: 'CAN 总线',
    minutes: 90,
    state: 'todo',
    source: { kind: 'round', round: 7, question: '这个项目后来有做过组网扩展吗？', excerpt: '本来想加 CAN，后来时间不够就没做。' },
  },
]

/* ============ 简历建议 ============ */

export const RESUME_SUGGESTIONS: ResumeSuggestion[] = [
  {
    id: 'r-1',
    projectId: 'thermal',
    original: '负责智能温控终端的固件开发。',
    suggested: '独立完成智能温控终端固件开发：基于 FreeRTOS 拆分采样／控制／通信三任务，控制任务以 10ms 周期运行。',
    reason: '把「负责」替换为可追问的实现描述，并补上已被追问验证的技术细节。',
    type: 'rewrite',
    state: 'pending',
    editedText: null,
    source: {
      kind: 'round',
      round: 5,
      question: '控制任务的周期和优先级是怎么定的？',
      excerpt: '采样 20ms、控制 10ms、通信按需阻塞。控制优先级最高。',
    },
  },
  {
    id: 'r-2',
    projectId: 'thermal',
    original: '熟悉 I2C、SPI 等常用通信接口。',
    suggested: '调试过 I2C 从机拉低总线导致的死锁，通过示波器定位时序并加入总线恢复逻辑。',
    reason: '把技能罗列改为一次具体的定位经历，面试官可以直接顺着追问。',
    type: 'rewrite',
    state: 'pending',
    editedText: null,
    source: {
      kind: 'material',
      material: 'I2C 通信异常排查记录',
      excerpt: 'SDA 在第九个时钟后被持续拉低，加总线恢复时序后恢复。',
    },
  },
  {
    id: 'r-3',
    projectId: 'thermal',
    original: '熟悉 CAN 总线。',
    suggested: '（不建议强化）',
    reason: 'CAN 目前只有口头计划，没有实现或调试材料，写成技能会在面试中直接暴露。',
    type: 'trim',
    state: 'pending',
    editedText: null,
    source: {
      kind: 'round',
      round: 7,
      question: '这个项目后来有做过组网扩展吗？',
      excerpt: '本来想加 CAN，后来时间不够就没做。',
    },
  },
  {
    id: 'r-4',
    projectId: 'thermal',
    original: '参与编写模块设计文档。',
    suggested: '编写温控模块设计文档（已提交），覆盖任务划分与 I2C 时序约束两节。',
    reason: '标注已提交，把用户声明转为可核验材料。',
    type: 'quantify',
    state: 'pending',
    editedText: null,
    source: {
      kind: 'round',
      round: 8,
      question: '团队协作上你做过哪些输出？',
      excerpt: '写过模块设计文档，评审的时候讲过一遍。',
    },
  },
  {
    id: 'r-5',
    projectId: null,
    original: '具备良好的团队协作能力。',
    suggested: '（建议删除）',
    reason: '没有对应来源，属于常见套话，删掉不影响信息量。',
    type: 'trim',
    state: 'pending',
    editedText: null,
    source: null,
  },
]

/** 无来源的建议 —— 用于演示证据门禁：这一条在界面上不可接受 */
export const GATED_SUGGESTION_ID = 'r-5'

/* ============ 简历版本 ============ */

export const RESUME_VERSIONS: ResumeVersion[] = [
  { id: 'v-1', version: 1, createdAt: '2025-09-18 21:04', targetTitle: '嵌入式软件实习生', entries: 6 },
]

export const RESUME_BASE_LINES: string[] = [
  '张明 · 电子信息工程 · 2026 届',
  '求职意向：嵌入式软件实习生',
  '技能：C 语言、FreeRTOS、I2C / SPI、UART、Git',
  '项目经历：',
  '  智能温控终端 — 固件开发（2025.03 – 2025.06）',
  '  四轴无人机飞控 — 姿态解算（2024.09 – 2024.12）',
]

/* ============ 教育经历 ============ */

export type Education = {
  id: string
  school: string
  major: string
  degree: string
  period: string
  note: string
}

export const EDUCATION: Education[] = [
  {
    id: 'edu-1',
    school: '上海理工大学',
    major: '电子信息工程',
    degree: '本科',
    period: '2022.09 – 2026.06',
    note: '岗位要求本科 · 电子／计算机／自动化相关专业，已满足',
  },
]

/* ============ 分析草稿（简历导入解析结果） ============ */

export type ParsedItem = {
  id: string
  group: 'skill' | 'project' | 'education' | 'other'
  text: string
}

export const PARSED_DRAFT: ParsedItem[] = [
  { id: 'p-1', group: 'skill', text: 'C 语言' },
  { id: 'p-2', group: 'skill', text: 'FreeRTOS' },
  { id: 'p-3', group: 'skill', text: 'I2C / SPI' },
  { id: 'p-4', group: 'project', text: '智能温控终端 — 负责固件开发（2025.03 – 2025.06）' },
  { id: 'p-5', group: 'project', text: '四轴无人机飞控 — 负责姿态解算（2024.09 – 2024.12）' },
  { id: 'p-6', group: 'education', text: '本科 · 电子信息工程 · 2022 – 2026' },
  { id: 'p-7', group: 'other', text: '英语四级（CET-4）' },
]

export const PARSED_GROUP_LABEL: Record<ParsedItem['group'], string> = {
  skill: '技能',
  project: '项目',
  education: '教育经历',
  other: '其他',
}

/** 简历粘贴文本 —— 演示用样例 */
export const SAMPLE_RESUME = `${RESUME_BASE_LINES.join('\n')}

教育经历
2022.09 – 2026.06  电子信息工程  本科

项目经历
智能温控终端（2025.03 – 2025.06）：负责固件开发，熟悉 FreeRTOS 与 I2C。
四轴无人机飞控（2024.09 – 2024.12）：负责姿态解算。

技能
C 语言、FreeRTOS、I2C / SPI、UART、Git
英语四级（CET-4）`
