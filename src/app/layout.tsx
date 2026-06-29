import type { Metadata } from 'next'
import './globals.css'
import { ThriftProvider } from '@/context/ThriftContext'

export const metadata: Metadata = {
  title: 'ThriftIn - Thrift Smart, Live Sustainable',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
      </head>
      <body>
        <ThriftProvider>
          {children}
        </ThriftProvider>
      </body>
    </html>
  )
}
