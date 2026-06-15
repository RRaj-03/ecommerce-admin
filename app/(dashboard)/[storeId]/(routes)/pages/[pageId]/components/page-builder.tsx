"use client";

import { PageBlock, BlockType } from "@/types/page-blocks";
import { Button } from "@/components/ui/button";
import { Plus, Trash, ChevronUp, ChevronDown, Settings, Type, LayoutTemplate, Box, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { v4 as uuidv4 } from "uuid";

interface PageBuilderProps {
  value: string;
  onChange: (value: string) => void;
}

// Default block templates
const defaultBlocks: Record<BlockType, Omit<PageBlock, 'id'>> = {
  hero: {
    type: 'hero',
    data: { title: 'New Hero', subtitle: 'Subtitle here', buttonText: 'Click Me', buttonLink: '#', imageUrl: '', imagePosition: 'right' },
    styles: {}
  },
  text: {
    type: 'text',
    data: { content: 'Enter text here...', alignment: 'left' },
    styles: {}
  },
  featureGrid: {
    type: 'featureGrid',
    data: { title: 'Features', subtitle: 'Why choose us', features: [] },
    styles: {}
  },
  cta: {
    type: 'cta',
    data: { title: 'Call to Action', description: 'Do it now', buttonText: 'Sign Up', buttonLink: '#' },
    styles: {}
  }
};

export function PageBuilder({ value, onChange }: PageBuilderProps) {
  const [blocks, setBlocks] = useState<PageBlock[]>([]);

  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          setBlocks(parsed);
        }
      } catch (e) {
        console.error("Failed to parse page blocks", e);
      }
    }
  }, []); // Run once on mount

  const updateBlocks = (newBlocks: PageBlock[]) => {
    setBlocks(newBlocks);
    onChange(JSON.stringify(newBlocks));
  };

  const addBlock = (type: BlockType) => {
    const newBlock = { ...defaultBlocks[type], id: uuidv4() } as PageBlock;
    updateBlocks([...blocks, newBlock]);
  };

  const removeBlock = (id: string) => {
    updateBlocks(blocks.filter(b => b.id !== id));
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= blocks.length) return;
    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[index + direction];
    newBlocks[index + direction] = temp;
    updateBlocks(newBlocks);
  };

  const updateBlockData = (id: string, data: any) => {
    updateBlocks(blocks.map(b => b.id === id ? { ...b, data: { ...b.data, ...data } } : b));
  };

  const updateBlockStyles = (id: string, styles: any) => {
    updateBlocks(blocks.map(b => b.id === id ? { ...b, styles: { ...b.styles, ...styles } } : b));
  };

  // Render specific editors based on block type
  const renderBlockEditor = (block: PageBlock) => {
    switch (block.type) {
      case 'hero':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={block.data.title} onChange={e => updateBlockData(block.id, { title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Subtitle</Label>
                <Input value={block.data.subtitle} onChange={e => updateBlockData(block.id, { subtitle: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Button Text</Label>
                <Input value={block.data.buttonText} onChange={e => updateBlockData(block.id, { buttonText: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Button Link</Label>
                <Input value={block.data.buttonLink} onChange={e => updateBlockData(block.id, { buttonLink: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input value={block.data.imageUrl} onChange={e => updateBlockData(block.id, { imageUrl: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Image Position</Label>
                <Select value={block.data.imagePosition} onValueChange={v => updateBlockData(block.id, { imagePosition: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                    <SelectItem value="background">Background</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      case 'text':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Alignment</Label>
              <Select value={block.data.alignment} onValueChange={v => updateBlockData(block.id, { alignment: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Content (Markdown supported)</Label>
              <Textarea rows={6} value={block.data.content} onChange={e => updateBlockData(block.id, { content: e.target.value })} />
            </div>
          </div>
        );
      case 'cta':
        return (
           <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={block.data.title} onChange={e => updateBlockData(block.id, { title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={block.data.description} onChange={e => updateBlockData(block.id, { description: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Button Text</Label>
                <Input value={block.data.buttonText} onChange={e => updateBlockData(block.id, { buttonText: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Button Link</Label>
                <Input value={block.data.buttonLink} onChange={e => updateBlockData(block.id, { buttonLink: e.target.value })} />
              </div>
            </div>
          </div>
        )
      case 'featureGrid':
         return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={block.data.title} onChange={e => updateBlockData(block.id, { title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Subtitle</Label>
                <Input value={block.data.subtitle} onChange={e => updateBlockData(block.id, { subtitle: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
               <Label>Features</Label>
               {block.data.features.map((f, i) => (
                  <Card key={f.id} className="p-4 relative mb-4">
                     <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => {
                        const newF = [...block.data.features];
                        newF.splice(i, 1);
                        updateBlockData(block.id, { features: newF });
                     }}><Trash className="h-4 w-4"/></Button>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label>Title</Label>
                           <Input value={f.title} onChange={e => {
                              const newF = [...block.data.features];
                              newF[i].title = e.target.value;
                              updateBlockData(block.id, { features: newF });
                           }} />
                        </div>
                        <div className="space-y-2">
                           <Label>Icon Name (lucide)</Label>
                           <Input value={f.icon} onChange={e => {
                              const newF = [...block.data.features];
                              newF[i].icon = e.target.value;
                              updateBlockData(block.id, { features: newF });
                           }} />
                        </div>
                        <div className="space-y-2 col-span-2">
                           <Label>Description</Label>
                           <Textarea value={f.description} onChange={e => {
                              const newF = [...block.data.features];
                              newF[i].description = e.target.value;
                              updateBlockData(block.id, { features: newF });
                           }} />
                        </div>
                     </div>
                  </Card>
               ))}
               <Button type="button" variant="outline" onClick={() => {
                  updateBlockData(block.id, { features: [...block.data.features, { id: uuidv4(), title: 'New Feature', description: 'Desc', icon: 'Star' }] });
               }}>Add Feature</Button>
            </div>
          </div>
         )
    }
  };

  const ColorInput = ({ label, value, onChange }: { label: string, value?: string, onChange: (v: string) => void }) => (
     <div className="flex items-center gap-2">
        <div className="flex-1 space-y-1">
           <Label>{label}</Label>
           <div className="flex items-center gap-2">
              <Input type="color" className="w-12 h-10 p-1" value={value || "#ffffff"} onChange={e => onChange(e.target.value)} />
              <Input type="text" placeholder="Hex (#ffffff)" value={value || ""} onChange={e => onChange(e.target.value)} />
              {value && <Button type="button" variant="ghost" size="icon" onClick={() => onChange("")}><Trash className="h-4 w-4"/></Button>}
           </div>
        </div>
     </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
         <Button type="button" variant="outline" onClick={() => addBlock('hero')}><LayoutTemplate className="mr-2 h-4 w-4" /> Add Hero</Button>
         <Button type="button" variant="outline" onClick={() => addBlock('text')}><Type className="mr-2 h-4 w-4" /> Add Text</Button>
         <Button type="button" variant="outline" onClick={() => addBlock('featureGrid')}><Box className="mr-2 h-4 w-4" /> Add Features</Button>
         <Button type="button" variant="outline" onClick={() => addBlock('cta')}><ArrowRight className="mr-2 h-4 w-4" /> Add CTA</Button>
      </div>

      <Accordion type="multiple" className="w-full space-y-4">
         {blocks.map((block, index) => (
            <AccordionItem value={block.id} key={block.id} className="border rounded-lg bg-card overflow-hidden">
               <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
                  <AccordionTrigger className="hover:no-underline py-2 border-none">
                     <span className="font-semibold uppercase text-sm tracking-wider">{block.type} BLOCK</span>
                  </AccordionTrigger>
                  <div className="flex items-center gap-1">
                     <Button type="button" variant="ghost" size="icon" disabled={index === 0} onClick={() => moveBlock(index, -1)}><ChevronUp className="h-4 w-4"/></Button>
                     <Button type="button" variant="ghost" size="icon" disabled={index === blocks.length - 1} onClick={() => moveBlock(index, 1)}><ChevronDown className="h-4 w-4"/></Button>
                     <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeBlock(block.id)}><Trash className="h-4 w-4"/></Button>
                  </div>
               </div>
               <AccordionContent className="p-4 pt-6">
                  <Tabs defaultValue="content" className="w-full">
                     <TabsList className="mb-4">
                        <TabsTrigger value="content">Content</TabsTrigger>
                        <TabsTrigger value="appearance">Appearance</TabsTrigger>
                     </TabsList>
                     <TabsContent value="content" className="space-y-4 mt-0">
                        {renderBlockEditor(block)}
                     </TabsContent>
                     <TabsContent value="appearance" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           <ColorInput label="Primary Color" value={block.styles.primaryColor} onChange={v => updateBlockStyles(block.id, { primaryColor: v })} />
                           <ColorInput label="Background Color" value={block.styles.backgroundColor} onChange={v => updateBlockStyles(block.id, { backgroundColor: v })} />
                           <ColorInput label="Foreground Color" value={block.styles.foregroundColor} onChange={v => updateBlockStyles(block.id, { foregroundColor: v })} />
                           <ColorInput label="Muted Color" value={block.styles.mutedColor} onChange={v => updateBlockStyles(block.id, { mutedColor: v })} />
                           <ColorInput label="Muted Foreground" value={block.styles.mutedForeground} onChange={v => updateBlockStyles(block.id, { mutedForeground: v })} />
                           <ColorInput label="Card Color" value={block.styles.cardColor} onChange={v => updateBlockStyles(block.id, { cardColor: v })} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">
                           Leave inputs empty to inherit the store's global theme automatically.
                        </p>
                     </TabsContent>
                  </Tabs>
               </AccordionContent>
            </AccordionItem>
         ))}
      </Accordion>
      
      {blocks.length === 0 && (
         <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
            No blocks added yet. Click one of the buttons above to start building your page.
         </div>
      )}
    </div>
  );
}
