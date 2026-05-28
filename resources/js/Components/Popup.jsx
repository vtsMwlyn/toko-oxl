import {
    Dialog,
    DialogPanel,
    DialogTitle,
    Transition,
    TransitionChild,
} from '@headlessui/react';
import SeparatorLine from './SeparatorLine';
import PrimaryButton from './PrimaryButton';
import { X } from 'lucide-react';

export default function Popup({
    children,
    className,
    isOpen = false,
    title = "Popup Title",
    onClose = () => {},
    closeable = false,
    headerRight,
}) {
    const handleClose = () => {
        if (closeable) {
            onClose();
        }
    };

    return (
        <Transition show={isOpen} leave="duration-200">
            <Dialog
                as="div"
                id="modal"
                className="fixed inset-0 z-50 flex transform items-center overflow-y-auto px-4 py-6 transition-all sm:px-0"
                onClose={handleClose}
            >
                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="absolute inset-0 bg-gray-500/75" />
                </TransitionChild>

                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    enterTo="opacity-100 translate-y-0 sm:scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                    leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                    <DialogPanel
                        className={`mb-6 transform overflow-hidden rounded-lg bg-white shadow-xl transition-all mx-auto p-4 w-full ${className}`}
                    >
                        <DialogTitle>
                            <div className="flex items-center justify-between">
                                <h1 className="font-bold text-emerald-800 text-lg">{title}</h1>
                                <div className="flex items-center gap-1">
                                    {headerRight}
                                    <PrimaryButton type="button" styled={false} onClick={onClose}><X className='size-5 text-emerald-600'/></PrimaryButton>
                                </div>
                            </div>
                            <SeparatorLine className="mt-2 mb-4" />
                        </DialogTitle>
                        <div className='max-h-[60vh] overflow-y-auto px-1'>
                            {children}
                        </div>
                    </DialogPanel>
                </TransitionChild>
            </Dialog>
        </Transition>
    );
}
