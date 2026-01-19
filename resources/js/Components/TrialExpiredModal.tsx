
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Link, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";

export default function TrialExpiredModal() {
    const { auth } = usePage<any>().props;
    const subscription = auth.subscription;
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!subscription || !subscription.trial_ends_at) return;

        const trialEndsAt = new Date(subscription.trial_ends_at);
        const now = new Date();
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        // Logic: 
        // 1. Trial has ended (now > trialEndsAt)
        // 2. We are within 3 days of expiration (trialEndsAt > threeDaysAgo) ?? 
        // Wait, "after trial ends, modal popup appear to remind subscription options for 3 more days"
        // Meaning: If today is between [TrialEnd] and [TrialEnd + 3 days].

        const threeDaysAfterEnd = new Date(trialEndsAt);
        threeDaysAfterEnd.setDate(threeDaysAfterEnd.getDate() + 3);

        if (now > trialEndsAt && now < threeDaysAfterEnd) {
            setOpen(true);
        }
    }, [subscription]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Your Trial Has Ended</DialogTitle>
                    <DialogDescription>
                        Your 14-day trial period has expired. You can still subscribe now to keep your data and continue using AccountPro.
                        <br />
                        <span className="text-xs text-muted-foreground mt-2 block">
                            Note: This reminder will appear for 3 days after expiration.
                        </span>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-col sm:justify-start gap-2">
                    <Link href={route('checkout.index')} className="w-full">
                        <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                            Subscribe Now
                        </Button>
                    </Link>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Maybe Later
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
