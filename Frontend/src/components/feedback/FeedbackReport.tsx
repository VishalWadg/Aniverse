import { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner'; // or whatever you use for toasts
import { uploadImageToCloudinary } from '@/api/uploadApi';
import { TagSelector } from './TagSelector';
import { Tag } from '@/api/feedbackApi';
import { useCreateFeedbackMutation } from '@/api/feedbackApi';


function FeedbackReport(): React.ReactNode {
    const [content, setContent] = useState('');
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
    const [attachments, setAttachments] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    
    // Replace raw isSubmitting with RTK Query
    const [createFeedback, { isLoading: isSubmitting }] = useCreateFeedbackMutation();

    // attachment upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        const uploadedUrls: string[] = [];

        for (let i = 0; i < files.length; i++) {
            try {
                const res = await uploadImageToCloudinary(files[i]);
                uploadedUrls.push(res.secure_url);
            } catch (error) {
                toast.error("Failed to upload a file");
            }
        }
        setAttachments((prev) => [...prev, ...uploadedUrls]);
        setIsUploading(false);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) {
            toast.error("Description is required");
            return;
        }
         try {
            // Send to your backend using RTK Query
            await createFeedback({
                content,
                tagIds: selectedTags.map(tag => tag.id),
                attachments
            }).unwrap(); // .unwrap() throws an error if the request fails
            
            toast.success("Feedback submitted!");
            setContent('');
            setAttachments([]);
            setSelectedTags([]);
        } catch (error) {
            toast.error("Failed to submit feedback");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-xl font-semibold">Report an Issue or Feedback</h2>
            </div>
            {/* 1. Description Textarea */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                    placeholder="What's going on?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={8}
                    className="min-h-[200px] resize-y"
                />
            </div>
            {/* 2. Tag Combobox */}
            <TagSelector 
                selectedTags={selectedTags} 
                onTagsChange={setSelectedTags} 
            />
            {/* 3. File Upload & Previews */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Attachments</label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {/* Render uploaded images here */}
                    {attachments.map((url, i) => (
                        <img key={i} src={url} alt="attachment" className="h-20 w-20 object-cover rounded border" />
                    ))}
                </div>

                {/* Hidden file input triggered by a Shadcn Button */}
                <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    id="file-upload"
                    onChange={handleFileUpload}
                />
                <Button type="button" variant="outline" asChild>
                    <label htmlFor="file-upload" className="cursor-pointer">
                        {isUploading ? "Uploading..." : "📎 Attach Files"}
                    </label>
                </Button>
            </div>
            {/* 4. Submit Button */}
            <Button type="submit" disabled={isSubmitting || isUploading} className="w-full">
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>
        </form>
    )
}

export default FeedbackReport;