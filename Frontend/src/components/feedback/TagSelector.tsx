import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Tag } from '@/api/feedbackApi';

// Mock data until the backend is wired up
const DUMMY_TAGS: Tag[] = [
    { id: '1', name: 'bug', description: 'Something isn\'t working' }, 
    { id: '2', name: 'enhancement', description: 'New feature' }
];

interface TagSelectorProps {
    selectedTags: Tag[];
    onTagsChange: (tags: Tag[]) => void;
}

export function TagSelector({ selectedTags, onTagsChange }: TagSelectorProps) {
    const [open, setOpen] = useState(false);

    const handleSelectTag = (tag: Tag) => {
        const isSelected = selectedTags.some(t => t.id === tag.id);
        if (isSelected) {
            onTagsChange(selectedTags.filter(t => t.id !== tag.id));
        } else {
            onTagsChange([...selectedTags, tag]);
        }
    };

    const handleRemoveTag = (tagId: string) => {
        onTagsChange(selectedTags.filter(t => t.id !== tagId));
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">Labels</label>
            
            <div className="flex flex-col gap-2">
                {/* 1. Render selected tags as Badges */}
                {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {selectedTags.map((tag) => (
                            <Badge key={tag.id} variant="secondary" className="px-2 py-1">
                                {tag.name}
                                <button
                                    type="button"
                                    className="ml-2 hover:bg-muted rounded-full"
                                    onClick={() => handleRemoveTag(tag.id)}
                                >
                                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                )}

                {/* 2. The Shadcn Combobox */}
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between text-muted-foreground"
                        >
                            Select tags...
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    
                    <PopoverContent className="w-full p-0">
                        <Command>
                            <CommandInput placeholder="Search tags..." />
                            <CommandList>
                                <CommandEmpty>No tags found.</CommandEmpty>
                                <CommandGroup>
                                    {DUMMY_TAGS.map((tag) => (
                                        <CommandItem
                                            key={tag.id}
                                            onSelect={() => handleSelectTag(tag)}
                                        >
                                            <Check
                                                className={`mr-2 h-4 w-4 ${
                                                    selectedTags.some(t => t.id === tag.id) ? "opacity-100" : "opacity-0"
                                                }`}
                                            />
                                            {tag.name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}
