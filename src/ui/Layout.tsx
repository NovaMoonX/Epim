import { Outlet, Link } from 'react-router-dom';
import ThemeToggle from '@ui/ThemeToggle';
import { AuthButton } from '@components/AuthButton';
import { useAuth } from '@hooks/useAuthHook';

function Layout() {
	const { isAdmin } = useAuth();

	return (
		<div className='min-h-dvh w-dvw transition-colors duration-200 flex flex-col'>
			<header className="bg-white dark:bg-slate-800 border-b border-border">
				<div className="max-w-7xl mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-6">
							<Link to="/" className="text-xl font-bold text-primary hover:text-primary/80">
								Support Portal
							</Link>
							<nav className="flex gap-4">
								<Link to="/" className="text-foreground/70 hover:text-foreground">
									Home
								</Link>
								<Link to="/submit-ticket" className="text-foreground/70 hover:text-foreground">
									Submit Ticket
								</Link>
								{isAdmin && (
									<>
										<Link to="/admin/apps" className="text-foreground/70 hover:text-foreground">
											Apps
										</Link>
										<Link to="/admin/tickets" className="text-foreground/70 hover:text-foreground">
											Tickets
										</Link>
									</>
								)}
							</nav>
						</div>
						<div className="flex items-center gap-4">
							<AuthButton />
							<ThemeToggle />
						</div>
					</div>
				</div>
			</header>
			<main className="flex-1 bg-background">
				<Outlet />
			</main>
		</div>
	);
}

export default Layout;
