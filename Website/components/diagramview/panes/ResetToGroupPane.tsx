import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/shared/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shared/ui/select";
import { Label } from "@/components/shared/ui/label";
import { Button } from '@/components/shared/ui/button';
import { RotateCcw } from 'lucide-react';
import { Groups } from '../../../generated/Data';
import { GroupType } from '@/lib/Types';

interface IResetToGroupPaneProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onResetToGroup: (group: GroupType) => void;
}

export const ResetToGroupPane = ({ isOpen, onOpenChange, onResetToGroup }: IResetToGroupPaneProps) => {
    const [selectedGroupForReset, setSelectedGroupForReset] = useState<string>('');

    const handleResetToGroup = () => {
        if (!selectedGroupForReset) return;
        
        const selectedGroup = Groups.find(group => group.Name === selectedGroupForReset);
        if (selectedGroup) {
            onResetToGroup(selectedGroup);
            onOpenChange(false);
            setSelectedGroupForReset('');
        }
    };

    const handleCancel = () => {
        onOpenChange(false);
        setSelectedGroupForReset('');
    };

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="left" className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle>Reset Diagram to Group</SheetTitle>
                    <SheetDescription>
                        Choose a group to reset the diagram and show only entities from that group.
                        This will clear the current diagram and add all entities from the selected group.
                    </SheetDescription>
                </SheetHeader>
                
                <div className="mt-6 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="group-select">Select Group</Label>
                        <Select 
                            value={selectedGroupForReset} 
                            onValueChange={setSelectedGroupForReset}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a group..." />
                            </SelectTrigger>
                            <SelectContent>
                                {Groups.map((group) => (
                                    <SelectItem key={group.Name} value={group.Name}>
                                        {group.Name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <div className="text-sm text-amber-800">
                                <p className="font-medium mb-1">Warning</p>
                                <p>This will clear all current elements from your diagram and replace them with entities from the selected group.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex gap-2 pt-4">
                        <Button 
                            onClick={handleResetToGroup}
                            disabled={!selectedGroupForReset}
                            className="flex-1"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reset to Group
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={handleCancel}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};
