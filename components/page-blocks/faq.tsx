import { FAQBlock } from "@/types/page-blocks";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const FAQ = ({ data }: { data: FAQBlock['data'] }) => {
  return (
    <div className="bg-background py-16 sm:py-24 w-full">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-12">
          {data.subtitle && <h2 className="text-base font-semibold leading-7 text-primary">{data.subtitle}</h2>}
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {data.title}
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {data.items.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger className="text-left text-lg font-medium">{item.question}</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground whitespace-pre-wrap">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};
