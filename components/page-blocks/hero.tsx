import { HeroBlock } from "@/types/page-blocks";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const Hero = ({ data }: { data: HeroBlock['data'] }) => {
  return (
    <div className="relative overflow-hidden bg-background py-16 sm:py-24 lg:py-32 rounded-xl">
      <div className={`mx-auto max-w-7xl px-6 lg:px-8 flex flex-col ${data.imagePosition === 'right' ? 'lg:flex-row' : data.imagePosition === 'left' ? 'lg:flex-row-reverse' : 'items-center text-center'}`}>
        <div className={`max-w-2xl ${data.imagePosition === 'background' ? 'relative z-10' : 'lg:max-w-xl'}`}>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            {data.title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            {data.subtitle}
          </p>
          <div className={`mt-10 flex items-center gap-x-6 ${data.imagePosition === 'background' ? 'justify-center' : ''}`}>
            <Link href={data.buttonLink || '#'}>
               <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 text-lg">
                 {data.buttonText || 'Learn More'}
               </Button>
            </Link>
          </div>
        </div>
        {data.imagePosition !== 'background' && data.imageUrl && (
          <div className="mt-16 sm:mt-24 lg:mt-0 lg:flex-shrink-0 lg:flex-grow flex justify-center">
             <img src={data.imageUrl} alt={data.title} className="rounded-xl shadow-xl max-w-full h-auto object-cover max-h-[500px]" />
          </div>
        )}
      </div>
      {data.imagePosition === 'background' && data.imageUrl && (
        <div className="absolute inset-0 -z-10 bg-black/40">
           <img src={data.imageUrl} alt="" className="w-full h-full object-cover mix-blend-multiply" />
        </div>
      )}
    </div>
  );
};
