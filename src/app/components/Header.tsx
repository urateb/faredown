export default function Header() {
    return (
        <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 text-white">
            <div className="flex items-center gap-2">
                <span className="text-2xl font-bold tracking-tight">flyhigh</span>
            </div>

            <nav className="hidden md:flex items-center gap-6">
            </nav>

            <div className="flex items-center gap-6">
                <button className="hover:text-white/80 transition-colors">
                    <span className="text-xl">🌐</span>
                </button>
                <button className="hidden sm:flex items-center gap-2 hover:text-white/80 transition-colors">
                    <span className="text-xl">🔍</span>
                    <span className="font-medium">My Trips</span>
                </button>
                <button className="hidden sm:block px-6 py-2 border border-white rounded-full hover:bg-white hover:text-blue-600 transition-all font-medium">
                    Sign In
                </button>
            </div>
        </header>
    );
}
