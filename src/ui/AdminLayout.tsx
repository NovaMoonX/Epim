import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuthHook';
import { Button } from '@moondreamsdev/dreamer-ui/components';
import { signOut } from 'firebase/auth';
import { auth } from '@lib/firebase';
import { useToast } from '@moondreamsdev/dreamer-ui/hooks';
import { EpimLogo } from '@components/EpimLogo';

export function AdminLayout() {
	const { isAdmin, user } = useAuth();
	const navigate = useNavigate();
	const { addToast } = useToast();

	async function handleLogout() {
		try {
			await signOut(auth);
			addToast({ title: 'Logged out successfully', type: 'success' });
			navigate('/admin');
		} catch {
			addToast({ title: 'Logout failed', type: 'error' });
		}
	}

	if (!isAdmin) {
		navigate('/admin', { replace: true });
		return null;
	}

	return (
		<div className='min-h-dvh w-dvw transition-colors duration-200 flex flex-col'>
			<header className="bg-white dark:bg-slate-800 border-b border-border">
				<div className="max-w-7xl mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-6">
							<Link to="/admin" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
								<EpimLogo className="size-8" />
								<div className="flex items-baseline gap-2">
									<span className="text-primary text-2xl font-bold">Epim</span>
									<span className="text-foreground/50 text-xs font-medium">Admin Portal</span>
								</div>
							</Link>
							<nav className="flex gap-4">
								<Link to="/admin/products" className="text-foreground/70 hover:text-foreground">
									Products
								</Link>
								<Link to="/admin/tickets" className="text-foreground/70 hover:text-foreground">
									Tickets
								</Link>
							</nav>
						</div>
						<div className="flex items-center gap-4">
							<span className="text-sm text-foreground/70">
								{user?.email}
							</span>
							<Button onClick={handleLogout} variant="outline" size="sm">
								Logout
							</Button>
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
