import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogHeader, DialogClose } from "../ui/dialog";
import { MessageSquarePlus, X } from "lucide-react";
import FeedbackReport from "./FeedbackReport";

export function FeedbackModal() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {/* Floating Action Button */}
                <button
                    className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition"
                    aria-label="Report an Issue"
                    style={{ marginRight: "var(--removed-body-scroll-bar-size, 0px)" }}
                >
                    <MessageSquarePlus className="h-6 w-6" />
                </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="sr-only">Feedback Report</DialogTitle>
                </DialogHeader>
                <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </DialogClose>
                <FeedbackReport />
            </DialogContent>
        </Dialog>
    );
}