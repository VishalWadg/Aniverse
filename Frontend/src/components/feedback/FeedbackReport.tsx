import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner'; // or whatever you use for toasts
import { deleteImageFromCloudinary, uploadImageToCloudinary } from '@/api/uploadApi';
import { TagSelector } from './TagSelector';
import { Attachment, useCreateFeedbackMutation } from '@/api/feedbackApi';
import {Tag, useSuggestTagsMutation, useGetAllTagsQuery} from '@/api/tagApi'; 
import { X, Trash } from "lucide-react"
import { IconButton } from '../ui/IconButton';


function FeedbackReport(): React.ReactNode {
    const [content, setContent] = useState('');
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    // Replace raw isSubmitting with RTK Query
    const [createFeedback, { isLoading: isSubmitting }] = useCreateFeedbackMutation();
    const [suggestTags, { data: suggestedTags = [], reset: resetSuggestedTags},  ] = useSuggestTagsMutation();

    useEffect(() => {
        const timer = setTimeout(() => {
            const trimmed = content.trim();
            if (trimmed.length >= 10) {
                suggestTags({ query: trimmed });
            } else {
                resetSuggestedTags(); 
            }
        }, 350); // 350ms debounce so we don't spam the API on every keypress
        return () => clearTimeout(timer);
    }, [content, suggestTags]);


    const handleAddSuggestedTag = (tag: Tag) => {
        if (!selectedTags.some(t => t.id === tag.id)) {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    // attachment upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);

        // Map files to an array of Promises
        const uploadPromises = Array.from(files).map(async (file) => {
            try {
                const res = await uploadImageToCloudinary(file);
                // Ensure your uploadApi returns the full Cloudinary response so we can grab public_id
                return { url: res.secure_url, publicId: res.public_id } as Attachment;
            } catch (error) {
                toast.error(`Failed to upload ${file.name}`);
                return null;
            }
        });

        // Await all uploads simultaneously (Parallel Execution)
        const results = await Promise.all(uploadPromises);
        
        // Filter out any that failed (returned null)
        const successfulUploads = results.filter((attachment): attachment is Attachment => attachment !== null);
        
        setAttachments((prev) => [...prev, ...successfulUploads]);
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

    const availableSuggestions = suggestedTags.filter(
        (suggested) => !selectedTags.some((selected) => selected.id === suggested.id)
    );

    const handleRemoveAttachment = (index: number) => {
        try {
            deleteImageFromCloudinary(attachments[index].publicId); 
            setAttachments(prev => prev.filter((_, i) => i !== index));
        }catch (error) {
            toast.error("Failed to remove attachment");
        }
    }

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
            {/* AI Suggested Tags Bar */}
            {availableSuggestions.length > 0 && (
                <div className="space-y-1">
                    <div className="flex flex-wrap gap-2">
                        {availableSuggestions.map((tag) => (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={() => handleAddSuggestedTag(tag)}
                                className="text-xs bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-full px-2.5 py-0.5 transition-colors flex items-center gap-1"
                            >
                                + {tag.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

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
                    {attachments.map((attachment, i) => (
                        <div key={i} className="relative">
                            <img key={i} src={attachment.url} alt="attachment" className="h-20 w-20 object-cover rounded border" />
                            <IconButton
                                variant="destructive" 
                                size="icon-xs"
                                icon={<X className="h-3 w-3" />}
                                onClick={() => handleRemoveAttachment(i)}
                                className="absolute top-0 right-0 bg-white rounded-full p-1 shadow"
                                ariaLabel="Remove attachment"
                            />
                        </div>
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