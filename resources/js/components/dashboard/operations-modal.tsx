import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Search, X } from 'lucide-react';
import React, { useState } from 'react';

interface Operation {
    id: string;
    name: string;
    location: string;
    image: string;
}

interface OperationsModalProps {
    isOpen: boolean;
    onClose: () => void;
    region: string;
    operations: Operation[];
}

const OperationsModal: React.FC<OperationsModalProps> = ({ isOpen, onClose, region, operations }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredOperations = operations.filter(
        (operation) =>
            operation.name.toLowerCase().includes(searchQuery.toLowerCase()) || operation.location.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="from-hub-gray-700 to-hub-gray-950 border-hub-gray-850 max-h-[80vh] w-full max-w-2xl overflow-hidden !rounded-3xl border bg-gradient-to-b p-0 backdrop-blur-sm"
                hideClose
            >
                {/* Header */}
                <div className="flex flex-col items-start gap-1 p-6 pb-4">
                    <DialogTitle className="text-hub-gray-500 font-kode-mono text-2xl leading-[150%] font-semibold tracking-[0.12px]">
                        Operations
                    </DialogTitle>
                    <p className="text-hub-gray-500 font-lekton text-base leading-[150%] font-normal tracking-[0.08px]">In {region}</p>
                </div>

                {/* Search Input */}
                <div className="mx-6 mb-4">
                    <div className="border-hub-gray-850/50 bg-hub-gray-950/50 flex h-10 w-full items-center gap-0.5 rounded-[28px] border px-3 py-1">
                        <Search className="text-hub-gray-500 h-4 w-4 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="Search companies or keywords"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="text-hub-gray-500 font-lekton placeholder:text-hub-gray-500/70 min-h-9 flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none"
                        />
                    </div>
                </div>

                {/* Operations List */}
                <div className="mx-6 mb-6 min-h-0 flex-1">
                    <div className="border-hub-gray-850 from-hub-gray-950/50 to-hub-gray-850 scrollbar-hide flex max-h-[400px] flex-col gap-4 overflow-y-auto rounded-3xl border bg-gradient-to-b p-4">
                        {filteredOperations.map((operation, index) => (
                            <React.Fragment key={operation.id}>
                                <div className="flex w-full items-center gap-3">
                                    {/* Operation Image */}
                                    <img src={operation.image} alt={operation.name} className="h-10 w-10 rounded-[20px] object-cover" />

                                    {/* Operation Info */}
                                    <div className="flex flex-1 flex-col items-start gap-1">
                                        <h3 className="text-hub-gray-500 font-kode-mono text-sm leading-[150%] font-semibold tracking-[0.07px]">
                                            {operation.name}
                                        </h3>
                                        <p className="text-hub-gray-500/70 font-lekton text-xs font-normal tracking-[0.06px]">{operation.location}</p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2">
                                        <button className="border-hub-gray-850 hover:bg-hub-gray-850/30 flex min-h-8 items-center justify-center gap-1.5 rounded-[20px] border px-3 py-1.5 transition-colors">
                                            <span className="text-hub-gray-500 font-kode-mono text-center text-xs leading-[150%] font-medium tracking-[0.06px]">
                                                View Company
                                            </span>
                                        </button>
                                        <button className="border-hub-gray-850 from-hub-gray-950/50 to-hub-gray-850/50 hover:bg-hub-gray-850/30 flex min-h-8 items-center justify-center gap-1.5 rounded-[20px] border bg-gradient-to-t px-3 py-1.5 transition-colors">
                                            <span className="text-hub-gray-500 font-kode-mono text-center text-xs leading-[150%] font-medium tracking-[0.06px]">
                                                Explore
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                {/* Separator - don't show after last item */}
                                {index < filteredOperations.length - 1 && (
                                    <div className="flex h-px w-full items-center rounded-sm">
                                        <div className="bg-hub-gray-850 h-px flex-1" />
                                    </div>
                                )}
                            </React.Fragment>
                        ))}

                        {filteredOperations.length === 0 && (
                            <div className="flex items-center justify-center py-8">
                                <p className="text-hub-gray-500/70 font-lekton text-sm">No operations found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="hover:bg-hub-gray-850/30 absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-[20px] transition-colors hover:cursor-pointer"
                >
                    <X className="text-hub-gray-500 h-5 w-5" />
                </button>
            </DialogContent>
        </Dialog>
    );
};

export default OperationsModal;
