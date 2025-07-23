import { Separator } from "@/components/ui/separator"

export const LiveOperation = () => {
    return (
        <section className='flex flex-col min-h-svh relative z-0 overflow-hidden bg-background text-muted-foreground'>
            <Separator></Separator>
            <div className='flex-1 mx-auto grid grid-cols-12'>
                <div className="col-span-4 flex flex-col gap-8 justify-between">
                    <div className="flex flex-col gap-4 ms-12 pe-4 pt-[80px]">
                        <h2 className="text-5xl font-bold uppercase">The Live Operation</h2>
                        <span className="text-large font-bold">This is where you go from spectator to prospector.</span>
                    </div>
                    <Separator></Separator>
                    <div className="flex-1 flex flex-col gap-4 justify-between ms-12 pe-4 ">
                        <div className="flex flex-col gap-2">
                            <span className="text-xl font-bold uppercase">Analyze the Archives</span>
                            <p>We've digitized vast historical archives—maps, journals, and logs too nuanced for AI to decipher alone.</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-xl font-bold uppercase">Analyze the Archives</span>
                            <p>We've digitized vast historical archives—maps, journals, and logs too nuanced for AI to decipher alone.</p>
                        </div>
                        <div className="flex flex-col gap-2 mb-12">
                            <span className="text-xl font-bold uppercase">Analyze the Archives</span>
                            <p>We've digitized vast historical archives—maps, journals, and logs too nuanced for AI to decipher alone.</p>
                        </div>
                    </div>
                </div>
                <div className="col-span-8 bg-foreground">

                </div>
            </div>
            <Separator></Separator>
        </section>
    )
}