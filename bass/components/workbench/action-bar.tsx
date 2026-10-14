import type { ReactNode } from 'react'

export function ActionBar({
  back,
  children,
  above,
}: {
  back?: ReactNode
  children: ReactNode
  above?: ReactNode
}) {
  return (
    <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6">
      {above}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>{back}</div>
        <div className="flex flex-wrap gap-3 sm:justify-end">{children}</div>
      </div>
    </div>
  )
}
