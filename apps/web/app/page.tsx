import { EvidenceStatus } from '@/components/landing/evidence-status'
import { FinalCta } from '@/components/landing/final-cta'
import { Hero } from '@/components/landing/hero'
import { InteractiveBackground } from '@/components/landing/interactive-background'
import { RibbonCursor } from '@/components/landing/ribbon-cursor'
import { SiteHeader } from '@/components/landing/site-header'
import { StagesSection } from '@/components/landing/stages-section'

export default function Page() {
  return (
    <>
      <InteractiveBackground />
      <RibbonCursor />
      <SiteHeader />
      <main>
        <Hero />
        <StagesSection />
        <EvidenceStatus />
        <FinalCta />
      </main>
    </>
  )
}
