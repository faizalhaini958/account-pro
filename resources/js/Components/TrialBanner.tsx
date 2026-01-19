
import { Button } from "@/Components/ui/button";
import { Link, usePage } from "@inertiajs/react";
import { AlertCircle } from "lucide-react";

export default function TrialBanner() {
    const { auth } = usePage<any>().props;
    const user = auth.user;

    // We need subscription data. Assuming it's available via auth.user.subscription or we will fetch it.
    // For now, let's assume specific props are passed or exist on user.
    // Based on previous context, we might need to expose subscription details in HandleInertiaRequests.

    // Let's rely on data passed from backend. Assuming `subscription` is on `auth` or separate prop.
    // For now, safe check.
    const subscription = auth.subscription;

    if (!subscription || subscription.status !== 'active') {
        return null; // Not active or not present
    }

    // Check if on trial (trial_ends_at is future)
    if (!subscription.trial_ends_at) return null;

    const trialEndsAt = new Date(subscription.trial_ends_at);
    const now = new Date();

    if (trialEndsAt < now) return null; // Expired, handled by Modal or other logic

    const diffTime = Math.abs(trialEndsAt.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // User requested "dark tangerine". Using tailwind approx. orange-600.
    return (
        <div className="bg-orange-600 text-white px-4 py-2 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>
                    You have <span className="font-bold">{diffDays} days</span> left in your trial.
                    Upgrade now to avoid interruption.
                </span>
            </div>
            <Link href={route('checkout.index')}>
                <Button variant="secondary" size="sm" className="bg-white text-orange-600 hover:bg-gray-100 border-none h-7">
                    Subscribe Now
                </Button>
            </Link>
        </div>
    );
}
