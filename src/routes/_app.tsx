import AppNavigation from '@/components/AppNavigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { createFileRoute, redirect, Outlet, useNavigate, useLocation } from '@tanstack/react-router'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CircleUser, Menu } from 'lucide-react'

import { globalStore as useGlobalStore } from '@/lib/global.store'
import {regexAdmin} from "@/lib/utils.ts";

export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ context }) => {
    if (!context.auth.session) {
      throw redirect({ to: '/login' })
    }
    if (!context.auth.supabase) {
      return
    }
    const { data } = await context.auth.supabase.from("profiles")
      .select("active, role")
      .eq("user_id", context.auth.session.user.id).single()
    if (!data?.active) {
      throw redirect({ to: '/activation' })
    }
    if(regexAdmin.test(window.location.pathname) && data?.role !== 'admin') {
      throw redirect({ to: '/admin/permissions' })
    }
  },
  component: AppLayout,
})


function AppLayout() {
  const navigate = useNavigate();
  const {pathname} = useLocation();
  const supabase = useGlobalStore(state => state.auth.supabase)

  const handleLogout = async () => {
    await supabase?.auth.signOut()
    await navigate({ to: '/login' })
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {!regexAdmin.test(pathname) && (
          <aside className="hidden border-r bg-muted/40 md:block md:min-w-[220px] lg:min-w-[280px]">
        <AppNavigation/>
      </aside>
      )}
      <div className={`${regexAdmin.test(pathname) ? 'flex-1 w-[100vw]' : 'flex-1'}`}>
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          {!regexAdmin.test(pathname) && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 md:hidden"
                >
                  <Menu className="h-5 w-5"/>
                  <span className="sr-only">Przełącz menu nawigacji</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col">
                <AppNavigation/>
              </SheetContent>
            </Sheet>
          )}
          <div className="flex-1" />
          <DropdownMenu >
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Pokaż menu użytkownika</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Moje dane</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Ustawienia</DropdownMenuItem>
              <DropdownMenuItem>Wsparcie</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Wyloguj się</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
