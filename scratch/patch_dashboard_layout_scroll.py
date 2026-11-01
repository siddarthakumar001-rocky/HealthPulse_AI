with open('src/components/DashboardLayout.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

if 'useScrollFlow' not in code:
    code = code.replace(
        'import MobileBottomNav from "@/components/MobileBottomNav";',
        'import MobileBottomNav from "@/components/MobileBottomNav";\nimport { useScrollFlow } from "@/hooks/useScrollFlow";'
    )

if 'const { isScrolled } = useScrollFlow' not in code:
    code = code.replace(
        'const location = useLocation();',
        'const location = useLocation();\n  const { isScrolled } = useScrollFlow(10);'
    )

code = code.replace(
    'className="sticky top-0 z-40 flex h-16 items-center justify-between px-3 sm:px-6 transition-all duration-300 bg-background/90 border-b border-border/80 pt-[env(safe-area-inset-top)]"',
    'className={`sticky top-0 z-40 flex items-center justify-between px-3 sm:px-6 transition-all duration-300 pt-[env(safe-area-inset-top)] ${isScrolled ? "h-14 bg-background/95 border-b border-primary/20 shadow-md backdrop-blur-2xl" : "h-16 bg-background/80 border-b border-border/80 shadow-none backdrop-blur-xl"}`}'
)

with open('src/components/DashboardLayout.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("DashboardLayout scroll flow updated")
