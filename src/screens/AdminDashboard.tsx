import { Card } from '@moondreamsdev/dreamer-ui/components';
import { Button } from '@moondreamsdev/dreamer-ui/components';

export function AdminDashboard() {
	return (
		<div className="page p-6">
			<div className="max-w-4xl mx-auto space-y-6">
				<div className="text-center space-y-2">
					<h1 className="text-4xl font-bold text-primary">Admin Dashboard</h1>
					<p className="text-foreground/70">Manage apps and support tickets</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Card className="p-6">
						<h2 className="text-2xl font-bold mb-3">App Management</h2>
						<p className="text-foreground/70 mb-4">
							Create, edit, and manage applications that users can submit tickets for.
						</p>
						<Button href="/admin/apps">Manage Apps</Button>
					</Card>

					<Card className="p-6">
						<h2 className="text-2xl font-bold mb-3">Ticket Management</h2>
						<p className="text-foreground/70 mb-4">
							View, filter, and manage all support tickets submitted by users.
						</p>
						<Button href="/admin/tickets">View Tickets</Button>
					</Card>
				</div>
			</div>
		</div>
	);
}
