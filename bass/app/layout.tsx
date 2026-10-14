import type { ReactNode } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { FlowProvider } from '@/lib/flow-context'
export default function RootLayout({ children }: { children: ReactNode }) {
  return <FlowProvider><TooltipProvider>{children}<Toaster position="top-center" /></TooltipProvider></FlowProvider>
}
