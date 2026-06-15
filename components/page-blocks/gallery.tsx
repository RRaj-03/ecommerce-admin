import { GalleryBlock } from "@/types/page-blocks";

export const Gallery = ({ data }: { data: GalleryBlock['data'] }) => {
  const colsClass = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4 lg:grid-cols-4',
  }[data.columns || 3];

  return (
    <div className="bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-12">
          {data.subtitle && <h2 className="text-base font-semibold leading-7 text-primary">{data.subtitle}</h2>}
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {data.title}
          </p>
        </div>
        <div className={`grid grid-cols-1 gap-4 ${colsClass}`}>
          {data.images.map((img) => (
            <div key={img.id} className="relative aspect-square overflow-hidden rounded-xl bg-muted group">
              <img 
                src={img.url} 
                alt={img.alt} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
