'use client'

import { usePathname } from 'next/navigation'
import { Navbar, NavbarItem, NavbarLabel, NavbarSection, NavbarSpacer } from './navbar'

export function SiteNav() {
  const pathname = usePathname()

  return (
    <div className="border-b border-zinc-950/10 px-4 dark:border-white/10">
      <Navbar>
        <NavbarSection>
          <NavbarItem href="/" current={pathname === '/'}>
            <NavbarLabel>Swipe</NavbarLabel>
          </NavbarItem>
          <NavbarItem href="/results" current={pathname === '/results'}>
            <NavbarLabel>My Names</NavbarLabel>
          </NavbarItem>
        </NavbarSection>
        <NavbarSpacer />
      </Navbar>
    </div>
  )
}
