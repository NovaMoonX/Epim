import { Button } from '@moondreamsdev/dreamer-ui/components';
import { useNavigate } from 'react-router-dom';
import { EpimLogo } from '@components/EpimLogo';

export function NotFound() {
	const navigate = useNavigate();

	const handleGoHome = () => {
		navigate('/');
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-background px-4">
			<div className="text-center max-w-md">
				<div className="flex justify-center mb-8">
					<EpimLogo className="size-24" />
				</div>
				<h1 className="text-6xl font-bold text-primary mb-4">404</h1>
				<h2 className="text-2xl font-semibold text-foreground mb-4">
					Page Not Found
				</h2>
				<p className="text-foreground/70 mb-8">
					The page you're looking for doesn't exist or has been moved.
				</p>
				<Button onClick={handleGoHome} size="lg">
					Go Back Home
				</Button>
			</div>
		</div>
	);
}

export default NotFound;
