import { CTABlock } from "@/types/page-blocks";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const CTA = ({ data }: { data: CTABlock['data'] }) => {
  return (
    <div className="bg-primary rounded-2xl shadow-xl overflow-hidden my-12">
      <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
          {data.title}
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-foreground/80">
          {data.description}
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link href={data.buttonLink || '#'}>
             <Button className="bg-background text-foreground hover:bg-background/90 px-8 py-4 text-lg">
                {data.buttonText || 'Get Started'}
             </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
