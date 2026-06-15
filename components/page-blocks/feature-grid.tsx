import { FeatureGridBlock } from "@/types/page-blocks";
import * as Icons from "lucide-react";

export const FeatureGrid = ({ data }: { data: FeatureGridBlock['data'] }) => {
  return (
    <div className="bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">{data.subtitle}</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {data.title}
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {data.features.map((feature) => {
              const Icon = (Icons as any)[feature.icon || 'Star'] || Icons.Star;
              return (
                <div key={feature.id} className="relative pl-16">
                  <dt className="text-base font-semibold leading-7 text-foreground">
                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                      <Icon className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
                    </div>
                    {feature.title}
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-muted-foreground">{feature.description}</dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>
    </div>
  );
};
