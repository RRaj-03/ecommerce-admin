import { TextBlock } from "@/types/page-blocks";

export const TextComponent = ({ data }: { data: TextBlock['data'] }) => {
  return (
    <div className={`py-12 max-w-4xl mx-auto px-6 text-${data.alignment}`}>
       <div 
         className="prose dark:prose-invert max-w-none text-foreground whitespace-pre-wrap"
         dangerouslySetInnerHTML={{ __html: data.content }}
       />
    </div>
  );
};
