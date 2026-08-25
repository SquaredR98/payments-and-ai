import React from 'react'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata = {
  description: 'PayMe — Personal Invoice & Payment Link Generator',
  title: 'PayMe',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <main>{children}</main>
      </body>
    </html>
  )
}
