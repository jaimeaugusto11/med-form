'use client'

import Home from '@/components/client'
import React, { Suspense } from 'react'

export default function page() {
  return (
    <div>
       <Suspense fallback={<div>A carregar...</div>}>
      <Home/>
      </Suspense>
    </div>
  )
}
