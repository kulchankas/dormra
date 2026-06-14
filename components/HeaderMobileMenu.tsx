'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, LogIn, UserPlus, LogOut, LayoutDashboard } from 'lucide-react'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const NAV = [
  { href: '/dorms', label: 'Browse dorms' },
  { href: '/dashboard/alerts', label: 'Alerts' },
  { href: '/how-it-works', label: 'How it works' },
] as const

export default function HeaderMobileMenu({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            aria-label="Open menu"
          />
        }
      >
        <Menu className="size-4" />
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col gap-1 px-2" aria-label="Mobile navigation">
          {NAV.map(({ href, label }) => (
            <SheetClose
              key={href}
              render={
                <Link
                  href={href}
                  className="rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  {label}
                </Link>
              }
            />
          ))}

          {signedIn && (
            <SheetClose
              render={
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  <LayoutDashboard className="size-4 text-muted-foreground" />
                  Dashboard
                </Link>
              }
            />
          )}
        </nav>

        <Separator className="my-2" />

        <div className="px-4 pb-6">
          {signedIn ? (
            <form action="/auth/signout" method="POST">
              <Button
                type="submit"
                variant="outline"
                size="lg"
                className="h-11 w-full gap-2 rounded-xl text-sm"
              >
                <LogOut className="size-4" />
                Sign out
              </Button>
            </form>
          ) : (
            <div className="flex flex-col gap-2">
              <SheetClose
                render={
                  <Button
                    size="lg"
                    nativeButton={false}
                    className="h-11 w-full gap-2 rounded-xl text-sm"
                    render={<Link href="/signup" />}
                  >
                    <UserPlus className="size-4" />
                    Sign up
                  </Button>
                }
              />
              <SheetClose
                render={
                  <Button
                    variant="outline"
                    size="lg"
                    nativeButton={false}
                    className="h-11 w-full gap-2 rounded-xl text-sm"
                    render={<Link href="/login" />}
                  >
                    <LogIn className="size-4" />
                    Log in
                  </Button>
                }
              />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
