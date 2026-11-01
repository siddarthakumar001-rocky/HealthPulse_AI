with open('src/components/dashboard/VitalsPanel.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace(
    'className="relative rounded-2xl p-5 overflow-hidden cursor-default bg-card/90 border border-border backdrop-blur-xl shadow-md"',
    'className="relative rounded-3xl p-5 overflow-hidden cursor-default mermaid-glass border border-teal-400/30 transition-all duration-300 shadow-lg"'
)

with open('src/components/dashboard/VitalsPanel.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("VitalsPanel updated to Mermaid Glass")
