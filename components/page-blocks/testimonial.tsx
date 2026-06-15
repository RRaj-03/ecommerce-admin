import { TestimonialBlock } from "@/types/page-blocks";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const Testimonial = ({ data }: { data: TestimonialBlock['data'] }) => {
  return (
    <div className="bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          {data.subtitle && <h2 className="text-base font-semibold leading-7 text-primary">{data.subtitle}</h2>}
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {data.title}
          </p>
        </div>
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {data.items.map((item) => (
            <Card key={item.id} className="bg-card text-card-foreground shadow-sm">
              <CardHeader className="flex flex-row items-center gap-4 pb-4">
                {item.avatarUrl ? (
                  <img src={item.avatarUrl} alt={item.name} className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {item.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.role}</p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="italic text-muted-foreground">"{item.content}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
