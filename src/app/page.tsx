import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import FilterBar from '@/components/FilterBar'
import LiveBanner from '@/components/LiveBanner'
import ProductGrid from '@/components/ProductGrid'
import PaymentSection from '@/components/PaymentSection'

export default function Home() {
  return (
    <>
      <Navbar />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <HeroSection />
        <FilterBar />
        <LiveBanner />
        <ProductGrid />
        <PaymentSection />
      </div>
    </>
  )
}
