import { PublicTopbar } from '@/components/site/public-topbar'
import { PublicFooter } from '@/components/site/public-footer'
import { HomeHero } from '@/components/home/home-hero'
import { HomeValueProps } from '@/components/home/home-value-props'
import { HomeJourney } from '@/components/home/home-journey'
import { HomeFaq } from '@/components/home/home-faq'
import { HomeFinalCta } from '@/components/home/home-final-cta'

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <PublicTopbar />
      <main className="flex-1">
        <HomeHero />
        <HomeValueProps />
        <HomeJourney />
        <HomeFaq />
        <HomeFinalCta />
      </main>
      <PublicFooter />
    </div>
  )
}
