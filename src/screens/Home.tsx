import { Button } from '@moondreamsdev/dreamer-ui/components';
import { APP_DESCRIPTION } from '@lib/app';

function Home() {
	return (
		<div className='page flex flex-col items-center justify-center'>
			<div className='text-center space-y-6 max-w-2xl px-4'>
				<h1 className='text-5xl md:text-6xl font-bold'>
					<span className="text-primary">Epim</span>
					<span className="text-foreground/60 text-4xl md:text-5xl block mt-2">Support Portal</span>
				</h1>
				<p className='text-lg md:text-xl text-foreground/80'>{APP_DESCRIPTION}</p>
				<div className="flex gap-4 justify-center">
					<Button href='/submit-ticket' size="lg">Submit a Ticket</Button>
					<Button href='/about' variant="outline" size="lg">Learn More</Button>
				</div>
			</div>
		</div>
	);
}

export default Home;
