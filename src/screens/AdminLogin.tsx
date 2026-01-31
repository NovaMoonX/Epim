import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@lib/firebase';
import { useAuth } from '@hooks/useAuth';
import { Button } from '@moondreamsdev/dreamer-ui/components';
import { Input } from '@moondreamsdev/dreamer-ui/components';
import { Card } from '@moondreamsdev/dreamer-ui/components';
import { useToast } from '@moondreamsdev/dreamer-ui/hooks';
import { EpimLogo } from '@components/EpimLogo';

export function AdminLogin() {
	const { isAdmin, loading } = useAuth();
	const navigate = useNavigate();
	const { addToast } = useToast();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		if (!loading && isAdmin) {
			navigate('/admin/apps', { replace: true });
		}
	}, [isAdmin, loading, navigate]);

	async function handleLogin(e: React.FormEvent) {
		e.preventDefault();
		setSubmitting(true);

		try {
			await signInWithEmailAndPassword(auth, email, password);
			addToast({ title: 'Logged in successfully', type: 'success' });
			navigate('/admin/apps');
		} catch {
			addToast({ title: 'Login failed. Please check your credentials.', type: 'error' });
		} finally {
			setSubmitting(false);
		}
	}

	if (loading) {
		return (
			<div className="page flex items-center justify-center">
				<p className="text-foreground/70">Loading...</p>
			</div>
		);
	}

	return (
		<div className="page flex items-center justify-center p-6">
			<Card className="w-full max-w-md p-8">
				<div className="text-center mb-6">
					<div className="flex justify-center mb-4">
						<EpimLogo className="size-12" />
					</div>
					<h1 className="text-3xl font-bold mb-2">
						<span className="text-primary">Epim</span>
						<span className="text-foreground/50 text-lg block mt-1 font-normal">Admin Portal</span>
					</h1>
					<p className="text-foreground/70">Sign in to access the admin dashboard</p>
				</div>

				<form onSubmit={handleLogin} className="space-y-4">
					<div>
						<label className="block text-sm font-medium mb-2">Email</label>
						<Input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="admin@example.com"
							required
							autoComplete="email"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2">Password</label>
						<Input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="••••••••"
							required
							autoComplete="current-password"
						/>
					</div>

					<Button type="submit" className="w-full" loading={submitting}>
						Sign In
					</Button>
				</form>

				<div className="mt-6 pt-6 border-t border-border text-center">
					<a href="/" className="text-sm text-foreground/70 hover:text-foreground">
						← Back to Support Portal
					</a>
				</div>
			</Card>
		</div>
	);
}
