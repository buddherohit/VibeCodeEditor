import SignInFormClient from '@/features/auth/components/sign-in-form-client'
import Image from 'next/image'
import React from 'react'

const SignInPage = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="mb-4 overflow-hidden rounded-2xl border border-zinc-700/50 shadow-2xl">
        <Image
          src="/login.png"
          alt="VibeCode Login Banner"
          width={360}
          height={240}
          className="object-cover transition-transform duration-300 hover:scale-105"
          priority
        />
      </div>
      <SignInFormClient />
    </div>
  )
}

export default SignInPage