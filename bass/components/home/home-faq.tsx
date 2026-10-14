import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const FAQS = [
  {
    q: '诊断结果准确吗？',
    a: '简历初评基于你提供的文本即时生成，属于表达层面的反馈，不代表技术能力。技术类结论需经过问答与人工复核，仅对已验证的范围作判断，未覆盖的能力会明确标注为「尚未验证」，不会被当作短板。',
  },
  {
    q: '人工复核大概需要多久？',
    a: '当前没有可承诺的固定时长，页面会如实展示审核进度（已提交 → 核验 → 人工审核 → 发布），不会给出未经支持的「预计 N 分钟完成」。',
  },
  {
    q: '我的简历和回答数据会被怎么使用？',
    a: '本次诊断采用最小化收集、受控会话处理；是否用于模型训练需要你单独授权，不会作为诊断的必选条件。你可以随时申请删除本次会话数据。',
  },
  {
    q: '我还没有明确的目标岗位，可以使用吗？',
    a: '可以。你可以选择「还在探索方向」或「只了解技术能力」，系统不会要求你先选定岗位，也不会在未选岗位时展示岗位匹配度或差距结论。',
  },
]

export function HomeFaq() {
  return (
    <section className="mx-auto max-w-[760px] px-4 pb-20 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">FAQ</p>
      <h2 className="mt-3 text-[26px] font-bold text-foreground sm:text-3xl">常见问题</h2>

      <Accordion className="mt-8">
        {FAQS.map((item, i) => (
          <AccordionItem key={item.q} value={`faq-${i}`}>
            <AccordionTrigger className="text-left text-base font-medium">{item.q}</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
