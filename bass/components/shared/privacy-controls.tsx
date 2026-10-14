import { useState } from 'react'
import { api, isMock } from '@/lib/api'
import { useFlow } from '@/lib/flow-context'
import { useAsync } from '@/lib/use-async'
import { useRouter } from '@/lib/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
export function PrivacyControls({ textOnly = false }: { textOnly?: boolean }) {
  const { reset, initialReview } = useFlow(),
    router = useRouter(),
    operation = useAsync()
  const [open, setOpen] = useState(false),
    [receipt, setReceipt] = useState('')
  async function remove() {
    const result = await operation.run((signal) => api.deleteData(signal))
    if (result) {
      reset()
      setReceipt(
        `${isMock ? 'Mock 本地清除' : '删除申请'}：${result.state === 'completed' ? '已完成' : '已受理，等待服务端完成'}。回执 ${result.receiptId}`,
      )
      setOpen(false)
    }
  }
  if (initialReview || textOnly)
    return (
      <section
        className="mt-8 border-t border-border pt-4 text-xs text-muted-foreground"
        aria-label="会话与个人资料"
      >
        <p>
          本轮后端不持久化简历和初评。清空页面不会删除模型供应商可能保留的记录。
        </p>
        <Button
          className="mt-2"
          variant="ghost"
          size="sm"
          onClick={() => {
            reset()
            router.push('/upload')
          }}
        >
          清空并重新开始
        </Button>
      </section>
    )
  return (
    <section
      className="mt-8 border-t border-border pt-4 text-xs text-muted-foreground"
      aria-label="会话与个人资料"
    >
      <p>
        当前资料保存在内存，刷新会清除本地演示会话。前端重置不等于服务端删除。
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            reset()
            router.push('/upload')
          }}
        >
          清空并重新开始
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
          请求删除个人资料
        </Button>
      </div>
      {receipt && (
        <p role="status" className="break-all">
          {receipt}
        </p>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除本次会话资料？</DialogTitle>
            <DialogDescription>
              {isMock
                ? '只清除本地演示资料，不涉及真实服务。'
                : '向业务后端请求删除个人资料，并撤销当前报告访问；实际完成情况以回执为准。'}
            </DialogDescription>
          </DialogHeader>
          {operation.error && <p role="alert">{operation.error}</p>}
          <Button
            variant="destructive"
            disabled={operation.loading}
            onClick={remove}
          >
            {operation.loading ? '正在请求…' : '确认请求删除'}
          </Button>
          <Button
            variant="outline"
            disabled={operation.loading}
            onClick={() => setOpen(false)}
          >
            取消
          </Button>
        </DialogContent>
      </Dialog>
    </section>
  )
}
