import { Outlet, Link } from 'react-router-dom';
import ThemeToggle from '@ui/ThemeToggle';

function Layout() {
	return (
		<div className='min-h-dvh w-dvw transition-colors duration-200 flex flex-col'>
			<header className="bg-white dark:bg-slate-800 border-b border-border">
				<div className="max-w-7xl mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-6">
							<Link to="/" className="text-xl font-bold hover:text-primary/80">
								<span className="text-primary text-2xl">Epim</span>
								<span className="text-foreground/60 text-base ml-2">Support Portal</span>
							</Link>
							<nav className="flex gap-4">
								<Link to="/" className="text-foreground/70 hover:text-foreground">
									Home
								</Link>
								<Link to="/submit-ticket" className="text-foreground/70 hover:text-foreground">
									Submit Ticket
								</Link>
								<Link to="/about" className="text-foreground/70 hover:text-foreground">
									About
								</Link>
							</nav>
						</div>
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
