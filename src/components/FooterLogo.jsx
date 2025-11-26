import React from 'react'
import Logo from '../assets/logo.svg'

export default function FooterLogo(){
  return (
    <div className="fixed bottom-6 right-6 w-16 h-16 opacity-90">
      <div className="w-full h-full rounded-lg overflow-hidden shadow-xl">
        <img src={Logo} alt="UniTasks" className="w-full h-full object-cover" />
      </div>
    </div>
  )
}
