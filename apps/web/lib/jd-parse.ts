export type Strength = 'must' | 'plus' | 'inferred'
export type Category = 'tech' | 'engineering'

export type JdTag = {
  id: string
  label: string
  category: Category
  strength: Strength
  /** 回链到 JD 原文的片段；推断项为 null */
  source: string | null
}

export type HardCondition = { id: string; label: string; source: string }

export type JdBreakdown = { tags: JdTag[]; hard: HardCondition[] }

const SKILLS: { label: string; category: Category; patterns: RegExp[] }[] = [
  { label: 'C 语言', category: 'tech', patterns: [/C\s*语言/i, /(?<![a-z+#])C(?![a-z+#])\s*\/\s*C\+\+/i] },
  { label: 'C++', category: 'tech', patterns: [/C\+\+/i] },
  { label: 'Python', category: 'tech', patterns: [/python/i] },
  { label: 'Java', category: 'tech', patterns: [/java(?!script)/i] },
  { label: 'JavaScript / TypeScript', category: 'tech', patterns: [/javascript|typescript|\bjs\b|\bts\b/i] },
  { label: 'React', category: 'tech', patterns: [/react/i] },
  { label: 'Vue', category: 'tech', patterns: [/vue/i] },
  { label: 'Go', category: 'tech', patterns: [/\bgo\b|golang/i] },
  { label: 'SQL / 数据库', category: 'tech', patterns: [/sql|mysql|数据库|postgres/i] },
  { label: 'Linux', category: 'tech', patterns: [/linux/i] },
  { label: 'RTOS', category: 'tech', patterns: [/rtos|freertos|实时操作系统/i] },
  { label: '单片机 / MCU', category: 'tech', patterns: [/单片机|mcu|stm32/i] },
  { label: '串口通信', category: 'tech', patterns: [/串口|uart/i] },
  { label: 'I2C / SPI', category: 'tech', patterns: [/i2c|spi/i] },
  { label: 'CAN 总线', category: 'tech', patterns: [/can\s*总线|\bcan\b/i] },
  { label: '机器学习', category: 'tech', patterns: [/机器学习|深度学习|pytorch|tensorflow/i] },
  { label: '数据分析', category: 'tech', patterns: [/数据分析|excel|tableau/i] },
  { label: 'Docker / K8s', category: 'tech', patterns: [/docker|k8s|kubernetes|容器/i] },
  { label: '调试与问题定位', category: 'engineering', patterns: [/调试|排查|问题定位|debug/i] },
  { label: '版本管理', category: 'engineering', patterns: [/git|svn|版本管理|版本控制/i] },
  { label: '技术文档', category: 'engineering', patterns: [/文档/] },
  { label: '单元测试', category: 'engineering', patterns: [/单元测试|测试用例|自动化测试/] },
  { label: '代码规范', category: 'engineering', patterns: [/代码规范|code\s*review|代码评审/i] },
  { label: '团队协作', category: 'engineering', patterns: [/团队|协作|沟通/] },
]

const HARD_PATTERNS: RegExp[] = [
  /(本科|硕士|博士|大专)(及以上)?(学历)?[^，。；;\n]*/,
  /20\d{2}\s*届[^，。；;\n]*/,
  /(英语|CET)[^，。；;\n]*(四级|六级|4|6)[^，。；;\n]*/i,
  /(电子|计算机|自动化|通信|软件|统计|数学)[^，。；;\n]{0,10}专业/,
  /(每周|一周)[^，。；;\n]*(实习|到岗)[^，。；;\n]*/,
  /实习(期)?[^，。；;\n]*(\d+\s*个?月)[^，。；;\n]*/,
]

const PLUS_HINT = /优先|加分|者佳|更好|plus|了解/i

/** 岗位名到「虽未明写、但通常默认需要」的能力 —— 只做提示，默认不参与差距判定 */
const ROLE_INFERENCE: { match: RegExp; tags: { label: string; category: Category }[] }[] = [
  { match: /嵌入式|固件|硬件/, tags: [{ label: '示波器 / 逻辑分析仪', category: 'engineering' }, { label: '原理图阅读', category: 'tech' }] },
  { match: /前端/, tags: [{ label: '浏览器兼容与性能', category: 'engineering' }] },
  { match: /后端|服务端/, tags: [{ label: '接口设计', category: 'engineering' }] },
  { match: /算法|数据/, tags: [{ label: '实验复现', category: 'engineering' }] },
]

function splitClauses(text: string) {
  return text
    .split(/[\n。；;]+/)
    .map((s) => s.replace(/^\s*[\d一二三四五六七八九十]+[、.．)）]\s*/, '').trim())
    .filter(Boolean)
}

export function parseJd(text: string): JdBreakdown {
  const clauses = splitClauses(text)
  const tags = new Map<string, JdTag>()
  const hard: HardCondition[] = []

  for (const clause of clauses) {
    for (const pattern of HARD_PATTERNS) {
      const m = clause.match(pattern)
      if (m && !hard.some((h) => h.label === m[0].trim())) {
        hard.push({ id: `hard-${hard.length}`, label: m[0].trim(), source: clause })
      }
    }
    const strength: Strength = PLUS_HINT.test(clause) ? 'plus' : 'must'
    for (const skill of SKILLS) {
      if (tags.has(skill.label)) continue
      if (skill.patterns.some((p) => p.test(clause))) {
        tags.set(skill.label, { id: skill.label, label: skill.label, category: skill.category, strength, source: clause })
      }
    }
  }

  for (const rule of ROLE_INFERENCE) {
    if (!rule.match.test(text)) continue
    for (const t of rule.tags) {
      if (!tags.has(t.label)) tags.set(t.label, { id: t.label, ...t, strength: 'inferred', source: null })
    }
  }

  return { tags: [...tags.values()], hard }
}

export type JdSegment = { text: string; tagIds: string[] }

/**
 * 把 JD 原文切成「已回链」与「普通文本」交替的片段，供高亮渲染。
 *
 * 定位方式是在原文里找每个标签的 source 子句 —— 因此**原文逐字保留**，
 * 不会因为抽取而被改写或重新拼接。这是产品「结论可回链」的前提。
 */
export function linkSegments(text: string, tags: JdTag[]): JdSegment[] {
  const hits: { start: number; end: number; id: string }[] = []

  for (const tag of tags) {
    if (!tag.source) continue
    const start = text.indexOf(tag.source)
    if (start < 0) continue
    hits.push({ start, end: start + tag.source.length, id: tag.id })
  }
  hits.sort((a, b) => a.start - b.start)

  const out: JdSegment[] = []
  let cursor = 0

  for (const hit of hits) {
    if (hit.start < cursor) {
      // 同一条子句被多个标签命中：并入上一段，不重复渲染
      const last = out[out.length - 1]
      if (last) last.tagIds.push(hit.id)
      continue
    }
    if (hit.start > cursor) out.push({ text: text.slice(cursor, hit.start), tagIds: [] })
    out.push({ text: text.slice(hit.start, hit.end), tagIds: [hit.id] })
    cursor = hit.end
  }

  if (cursor < text.length) out.push({ text: text.slice(cursor), tagIds: [] })
  return out
}

export const SAMPLE_JD = `岗位：嵌入式软件实习生（华勤技术 · 上海）
岗位职责：
1. 参与基于 STM32 的固件开发，负责串口、I2C / SPI 等外设驱动编写；
2. 在 FreeRTOS 上完成任务调度与通信模块；
3. 配合硬件工程师完成板级调试与问题定位，输出技术文档。
任职要求：
1. 本科及以上学历，电子、计算机、自动化相关专业；
2. 2026 届应届毕业生，每周至少实习 4 天，实习期 6 个月以上；
3. 熟练掌握 C 语言，熟悉 Git 版本管理；
4. 有 CAN 总线开发经验者优先，了解 Linux 者优先；
5. 英语四级及以上。`
