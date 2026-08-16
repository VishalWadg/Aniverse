import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogHeader, DialogClose } from "../ui/dialog";
import { MessageSquarePlus, X } from "lucide-react";
import FeedbackReport from "./FeedbackReport";
import { usePermissions } from "@/hooks/usePermissions";

export function FeedbackModal() {
    const { canSubmitFeedback } = usePermissions();

    if (!canSubmitFeedback) {
        return null;
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {/* Floating Action Button */}
                <button
                    className="fixed bottom-14 right-4 sm:bottom-6 sm:right-6 z-50 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-transparent border-none shadow-none text-primary hover:scale-110 transition-all"
                    aria-label="Report an Issue"
                    style={{ marginRight: "var(--removed-body-scroll-bar-size, 0px)" }}
                >
                    <MessageSquarePlus className="h-6 w-6 sm:h-7 sm:w-7" />
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