import type { Metadata } from 'next'
import { GeistSans }      from 'geist/font/sans'
import { Playfair_Display } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets:  ['latin'],
  variable: '--font-playfair',
  display:  'swap',
  style:    ['normal', 'italic'],
})

export const metadata: Metadata = {
  title:       'Edge',
  description: 'What are you working on?',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
