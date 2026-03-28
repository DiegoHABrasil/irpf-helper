import { Header } from '@/components/layout/Header'
import { MainLayout } from '@/components/layout/MainLayout'

export default function Home() {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <Header />
      <MainLayout />
    </div>
  )
}
