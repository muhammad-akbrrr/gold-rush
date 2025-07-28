import { Grid } from "@/components/grid"
import { Separator } from "@/components/ui/separator"

export const Reputation = () => {
    return (
        <section className="relative min-h-screen grid grid-cols-2 bg-background text-muted-foreground">
            <Separator className="absolute inset-0 mx-0" />
            <div className="flex flex-col pt-24">
                <h2 className="text-xl lg:text-7xl font-bold uppercase ms-12 mb-24">Reputation isn't just a number. It's your influence</h2>
                <Separator />
                <div className="relative h-full w-full overflow-hidden">
                    <Grid className="absolute inset-0 m-auto" />
                </div>
            </div>
            <Separator orientation="vertical" className="absolute inset-0 m-0" />
            <div>

            </div>
        </section>
    )
}