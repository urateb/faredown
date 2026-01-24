interface HeaderProps {
    darkLogo?: boolean;
}

export default function Header({ darkLogo = false }: HeaderProps) {
    return (
        <header className={`absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 ${darkLogo ? 'text-black' : 'text-white'}`}>
            <div className="flex items-center gap-2">
                <span className="text-2xl font-bold tracking-tight">flyhigh</span>
            </div>

            <nav className="hidden md:flex items-center gap-6">
            </nav>

            <div className="flex items-center gap-6">
                {/* Items removed as per user request */}
            </div>
        </header>
    );
}
