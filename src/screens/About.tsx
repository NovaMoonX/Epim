import { Button } from '@moondreamsdev/dreamer-ui/components';
import { Card } from '@moondreamsdev/dreamer-ui/components';
import { EpimLogo } from '@components/EpimLogo';

function About() {
	return (
		<div className='page p-6'>
			<div className='max-w-4xl mx-auto space-y-8'>
				<div className='text-center space-y-4'>
					<div className="flex justify-center mb-4">
						<EpimLogo className="size-16" />
					</div>
					<h1 className='text-4xl md:text-5xl font-bold'>
						<span className="text-primary">About Epim</span>
						<span className="text-foreground/50 text-xl md:text-2xl block mt-2 font-normal">Support Portal</span>
					</h1>
					<p className='text-lg text-foreground/70'>
						Your centralized hub for customer support and improvement tracking
					</p>
				</div>

				<Card className="p-6 md:p-8">
					<h2 className='text-2xl font-bold text-primary mb-4'>What is Epim?</h2>
					<p className='text-foreground/80 leading-relaxed mb-4'>
						Epim is a comprehensive support ticketing system designed to streamline customer support 
						and track improvements across multiple projects. Built with modern web technologies, 
						Epim provides a seamless experience for both customers and support teams.
					</p>
					<p className='text-foreground/80 leading-relaxed'>
						Whether you're reporting a bug, requesting a feature, or seeking help, our platform 
						ensures your voice is heard and your issues are tracked efficiently.
					</p>
				</Card>

				<Card className="p-6 md:p-8 bg-primary/5">
					<h2 className='text-2xl font-bold text-primary mb-4'>How It Works</h2>
					<div className='space-y-4 text-foreground/80'>
						<div>
							<h3 className='font-semibold text-foreground mb-1'>1. Submit Your Ticket</h3>
							<p>Fill out our simple form with details about your issue or request.</p>
						</div>
						<div>
							<h3 className='font-semibold text-foreground mb-1'>2. We Review</h3>
							<p>Our support team receives and reviews your submission promptly.</p>
						</div>
						<div>
							<h3 className='font-semibold text-foreground mb-1'>3. Track Progress</h3>
							<p>Your ticket is tracked and updated as we work on resolving your issue.</p>
						</div>
						<div>
							<h3 className='font-semibold text-foreground mb-1'>4. Get Results</h3>
							<p>Receive updates and resolutions directly to your email.</p>
						</div>
					</div>
				</Card>

				<div className='text-center pt-4'>
					<Button href='/submit-ticket' size="lg">
						Submit a Ticket
					</Button>
				</div>
			</div>
		</div>
	);
}

export default About;
