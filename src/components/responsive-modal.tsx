// src/components/responsive-modal.tsx


import {useMedia} from 'react-use';

import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Drawer, DrawerContent } from '@/components/ui/drawer'; 

interface ResponsiveModalProps {
    children: React.ReactNode;
    open: boolean;
    title?: string;
    description?: string;
    onOpenChange: (open: boolean) => void;
}

export const ResponsiveModal = ({
    children,
    open,
    title,
    description,
    onOpenChange,
}: ResponsiveModalProps) => {
    const isDesktop = useMedia('(min-width: 1024px)', true);

    // Prepare accessible elements
    const Title = (
        <DialogTitle asChild>
            <span className='sr-only'>{title}</span>
        </DialogTitle>
    );

    const Description = description ? (
        <DialogDescription>
            {description}
        </DialogDescription>
    ) : null; 

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent
                    aria-describedby={description ? undefined : undefined}
                    className='max-h-[95vh] sm:max-w-[630px] overflow-auto hide-scrollbar p-0 border-none bg-transparent '
                >
                    <div className=" flex flex-col justify-center items-center">
                        {Title}
                        {Description}
                        {children}
                    </div>

                </DialogContent>
            </Dialog>
        )
    
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className='flex flex-col justify-center items-center'>
                <div className='overflow-auto hide-scrollbar max-h-[85vh]'>
                    {Title}
                    {Description}
                    {children}
                </div>
            </DrawerContent>
        </Drawer>
    )
}

