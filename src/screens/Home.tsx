import { Button } from '@moondreamsdev/dreamer-ui/components';
import { APP_TITLE } from '@lib/app';
import { useAuth } from '@hooks/useAuth';

function Home() {
  const { user, signIn } = useAuth();

  return (
    <div className="page flex flex-col items-center justify-center">
      <div className="text-center space-y-6 max-w-3xl px-4">
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
          {APP_TITLE}
        </h1>
        <p className="text-lg md:text-xl text-foreground/80">
          Streamline your customer support and bug tracking across all your projects.
          Submit tickets, track issues, and access knowledge base articles all in one place.
        </p>
        
        {!user ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button onClick={signIn} size="lg">
              Get Started
            </Button>
            <Button href="/knowledge-base" variant="outline" size="lg">
              Browse Knowledge Base
            </Button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button href="/support" size="lg">
              Submit a Ticket
            </Button>
            <Button href="/knowledge-base" variant="outline" size="lg">
              Browse Knowledge Base
            </Button>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
          <div className="p-6 rounded-lg bg-muted/50">
            <h3 className="font-semibold text-lg mb-2">Customer Support</h3>
            <p className="text-sm text-foreground/70">
              Submit support tickets for billing, bugs, or general help. Track your ticket status in real-time.
            </p>
          </div>
          <div className="p-6 rounded-lg bg-muted/50">
            <h3 className="font-semibold text-lg mb-2">Bug Tracking</h3>
            <p className="text-sm text-foreground/70">
              Internal testers can report detailed bugs with system logs and priority tagging.
            </p>
          </div>
          <div className="p-6 rounded-lg bg-muted/50">
            <h3 className="font-semibold text-lg mb-2">Knowledge Base</h3>
            <p className="text-sm text-foreground/70">
              Search our comprehensive FAQ section filtered by app to find answers quickly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
