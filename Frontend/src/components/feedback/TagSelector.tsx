import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Tag, useGetAllTagsQuery } from '@/api/tagApi';


interface TagSelectorProps {
    selectedTags: Tag[];
    onTagsChange: (tags: Tag[]) => void;
}

export function TagSelector({ selectedTags, onTagsChange }: TagSelectorProps) {
    const [open, setOpen] = useState(false);
    const { data: tags = [], isLoading } = useGetAllTagsQuery();

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
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Labels</label>
                {selectedTags.length > 0 && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive"
                        onClick={() => onTagsChange([])}
                    >
                        Clear all
                    </Button>
                )}
            </div>

            <div className="flex flex-col gap-2">
                {/* 1. The Shadcn Combobox */}
                <Popover open={open} onOpenChange={setOpen} modal={true}>
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

                    <PopoverContent 
                        className="w-[var(--radix-popover-trigger-width)] p-0" 
                        align="start"
                    >
                        <Command>
                            <CommandInput placeholder="Search tags..." />
                            <CommandList className="max-h-[200px] overflow-y-auto">
                                <CommandEmpty>No tags found.</CommandEmpty>
                                <CommandGroup>
                                    {tags.map((tag) => {
                                        const isSelected = selectedTags.some(t => t.id === tag.id);
                                        return (
                                            <CommandItem
                                                key={tag.id}
                                                onSelect={() => handleSelectTag(tag)}
                                            >
                                                <Check className={`mr-2 h-4 w-4 ${isSelected ? "opacity-100" : "opacity-0"}`} />
                                                {tag.name}
                                                {tag.description && (
                                                    <span className="ml-2 truncate text-xs text-muted-foreground">
                                                        - {tag.description}
                                                    </span>
                                                )}
                                            </CommandItem>
                                        );
                                    })}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>

                {/* 2. Render selected tags as Badges */}
                {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                        {selectedTags.map((tag) => (
                            <Badge key={tag.id} variant="secondary" className="px-2 py-1">
                                {tag.name}
                                <button
                                    type="button"
                                    className="ml-1.5 inline-flex items-center justify-center rounded-full"
                                    onClick={() => handleRemoveTag(tag.id)}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
