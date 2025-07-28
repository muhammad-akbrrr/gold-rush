import { Grid } from "@/components/grid"
import { Separator } from "@/components/ui/separator"

export const Tools = () => {
    return (
        <section className="min-h-screen w-full bg-background text-muted-foreground flex flex-col justify-between">
            <div className="flex flex-col mt-12">
                <Separator />
                <h2 className="text-3xl lg:text-9xl font-bold uppercase text-center my-6">Tools for your hunt</h2>
                <Separator />
            </div>
            <div className="relative flex-1 grid grid-cols-2">
                <div className="relative flex flex-col items-center justify-center gap-4 text-center overflow-hidden">
                    <Grid variant="sparse" className="absolute inset-0 m-auto max-w-full h-auto" />
                    <img className="relative" src="/images/36523362.png"></img>
                    <p className="relative text-3xl font-bold uppercase">ANALYZE THE ARCHIVES</p>
                    <p className="relative max-w-2xl">We've digitized vast historical archives —maps, journals, and logs too nuanced for AI to decipher alone.</p>
                </div>
                <Separator orientation="vertical" className="absolute inset-0 m-auto h-full"></Separator>
                <div className="relative flex flex-col items-center justify-center gap-4 text-center overflow-hidden">
                    <Grid variant="sparse" className="absolute inset-0 m-auto max-w-full h-auto" />
                    <img className="relative" src="/images/36523362.png"></img>
                    <p className="relative text-3xl font-bold uppercase">ANALYZE THE ARCHIVES</p>
                    <p className="relative max-w-2xl">We've digitized vast historical archives —maps, journals, and logs too nuanced for AI to decipher alone.</p>
                </div>
            </div>
        </section>
    )
}