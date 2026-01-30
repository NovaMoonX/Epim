import { Outlet, Link } from 'react-router-dom';
import ThemeToggle from '@ui/ThemeToggle';
import { EpimLogo } from '@components/EpimLogo';
import { join } from '@moondreamsdev/dreamer-ui/utils';

function Layout() {
	return (
		<div className='min-h-dvh w-dvw transition-colors duration-200 flex flex-col'>
			<header className="bg-white dark:bg-slate-800 border-b border-border">
				<div className="max-w-7xl mx-auto px-4 py-4">
					<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
						<Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
							<EpimLogo className="size-8" />
							<div className="flex items-baseline gap-2">
								<span className="text-primary text-2xl font-bold">Epim</span>
								<span className="text-foreground/50 text-xs font-medium">Support Portal</span>
							</div>
						</Link>
						<nav className="flex gap-4 sm:gap-6">
							<Link to="/" className={join(
								"text-foreground/70 hover:text-foreground transition-colors",
								"text-sm sm:text-base"
							)}>
								Home
							</Link>
							<Link to="/submit-ticket" className={join(
								"text-foreground/70 hover:text-foreground transition-colors",
								"text-sm sm:text-base"
							)}>
								Submit Ticket
							</Link>
							<Link to="/about" className={join(
								"text-foreground/70 hover:text-foreground transition-colors",
								"text-sm sm:text-base"
							)}>
								About
							</Link>
						</nav>
					</div>
				</div>
			</header>
			<main className="flex-1 bg-background">
				<Outlet />
			</main>
			<ThemeToggle />
		</div>
	);
}

export default Layout;
