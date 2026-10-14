import { ShieldCheck } from 'lucide-react'

export function TrustNote() {
  return (
    <div className="hidden h-fit w-52 shrink-0 rounded-2xl border border-primary-soft bg-primary-soft p-4 xl:block">
      <div className="mb-2 flex items-center gap-2 text-primary-soft-foreground">
        <ShieldCheck className="size-4" />
        <p className="text-sm font-semibold">你的真实能力，需要真实证据。</p>
      </div>
      <p className="text-xs leading-relaxed text-primary-soft-foreground/80">
        只对已验证范围作判断；技术结论须经人工复核。
      </p>
    </div>
  )
}
