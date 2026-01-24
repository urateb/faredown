interface HeaderProps {
    darkLogo?: boolean;
}

export default function Header({ darkLogo = false }: HeaderProps) {
    return (
        <header className={`absolute top-0 left-0 right-0 z-50 flex w-fit items-center justify-between px-6 py-4 ${darkLogo ? 'text-black' : 'text-white'}`}>
            <div className="flex items-center gap-2">
                <span className="text-2xl font-bold tracking-tight">flyhigh</span>
            </div>
        </header>
    );
}
