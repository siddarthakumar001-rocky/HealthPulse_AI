with open('src/components/AppSidebar.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace hardcoded #181519 with Mermaid Deep Glass
code = code.replace(
    'className="border-r border-border [&>div]:bg-[#181519] [&>div]:dark:bg-[#181519]"',
    'className="border-r border-teal-500/25 [&>div]:bg-[#03201F]/90 [&>div]:backdrop-blur-2xl"'
)
code = code.replace(
    'background: "#181519",\n          borderRight: "1px solid rgba(58, 47, 53, 0.6)",\n          boxShadow: "4px 0 24px rgba(0, 0, 0, 0.2)",',
    'background: "linear-gradient(180deg, #042F2E 0%, #03201F 100%)",\n          borderRight: "1px solid rgba(45, 212, 191, 0.25)",\n          boxShadow: "4px 0 28px rgba(13, 148, 136, 0.15)",'
)

# Replace red active glow with Mermaid Teal active glow
code = code.replace('rgba(227,83,54,0.15)', 'rgba(13, 148, 136, 0.22)')
code = code.replace('rgba(227,83,54,0.3)', 'rgba(45, 212, 191, 0.4)')
code = code.replace('rgba(227,83,54,0.35)', 'rgba(45, 212, 191, 0.45)')
code = code.replace('rgba(227,83,54,0.25)', 'rgba(6, 214, 160, 0.35)')
code = code.replace('text-primary', 'text-teal-300')
code = code.replace('text-[#F5EBE6]', 'text-[#E0FDF4]')
code = code.replace('text-[#B5A59E]', 'text-teal-400/60')
code = code.replace('text-white/80', 'text-teal-100/75')
code = code.replace('text-white/70', 'text-teal-100/75')
code = code.replace('text-white/60', 'text-teal-300/60')
code = code.replace('hover:bg-white/5', 'hover:bg-teal-500/10 hover:text-teal-200')

with open('src/components/AppSidebar.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("AppSidebar updated to Mermaid Deep Glass")
