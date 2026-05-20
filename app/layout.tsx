import React from "react"
import type { Metadata } from 'next'
import { Be_Vietnam_Pro, Instrument_Serif, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const instrumentSans = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: '--font-instrument'
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: '--font-instrument-serif'
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: '--font-jetbrains'
});

export const metadata: Metadata = {
  title: 'COMPUTE - AI Agents for Distributed Computing',
  description: 'Deploy autonomous AI agents on distributed infrastructure. Offload complex tasks to intelligent workers that run 24/7.',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${instrumentSans.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
