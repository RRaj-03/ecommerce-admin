"use client";

import { PageBlock, BlockType } from "@/types/page-blocks";
import { Button } from "@/components/ui/button";
import { Plus, Trash, ChevronUp, ChevronDown, Type, LayoutTemplate, Box, ArrowRight, HelpCircle, Users, Image as ImageIcon, Eye, Edit2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { v4 as uuidv4 } from "uuid";
import { PageRenderer } from "@/components/page-renderer";

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
  },
  faq: {
    type: 'faq',
    data: { title: 'Frequently Asked Questions', subtitle: 'Need help?', items: [] },
    styles: {}
  },
  testimonial: {
    type: 'testimonial',
    data: { title: 'What our customers say', subtitle: 'Testimonials', items: [] },
    styles: {}
  },
  gallery: {
    type: 'gallery',
    data: { title: 'Gallery', subtitle: 'Our moments', images: [], columns: 3 },
    styles: {}
  }
};

export function PageBuilder({ value, onChange }: PageBuilderProps) {
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [mode, setMode] = useState<"edit" | "preview">("edit");

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
  }, []);

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
      case 'faq':
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
               <Label>FAQ Items</Label>
               {block.data.items.map((item, i) => (
                  <Card key={item.id} className="p-4 relative mb-4">
                     <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => {
                        const newItems = [...block.data.items];
                        newItems.splice(i, 1);
                        updateBlockData(block.id, { items: newItems });
                     }}><Trash className="h-4 w-4"/></Button>
                     <div className="space-y-4">
                        <div className="space-y-2 w-5/6">
                           <Label>Question</Label>
                           <Input value={item.question} onChange={e => {
                              const newItems = [...block.data.items];
                              newItems[i].question = e.target.value;
                              updateBlockData(block.id, { items: newItems });
                           }} />
                        </div>
                        <div className="space-y-2">
                           <Label>Answer</Label>
                           <Textarea value={item.answer} onChange={e => {
                              const newItems = [...block.data.items];
                              newItems[i].answer = e.target.value;
                              updateBlockData(block.id, { items: newItems });
                           }} />
                        </div>
                     </div>
                  </Card>
               ))}
               <Button type="button" variant="outline" onClick={() => {
                  updateBlockData(block.id, { items: [...block.data.items, { id: uuidv4(), question: 'New Question?', answer: 'Answer here.' }] });
               }}>Add FAQ</Button>
            </div>
          </div>
         )
      case 'testimonial':
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
               <Label>Testimonials</Label>
               {block.data.items.map((item, i) => (
                  <Card key={item.id} className="p-4 relative mb-4">
                     <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => {
                        const newItems = [...block.data.items];
                        newItems.splice(i, 1);
                        updateBlockData(block.id, { items: newItems });
                     }}><Trash className="h-4 w-4"/></Button>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label>Name</Label>
                           <Input value={item.name} onChange={e => {
                              const newItems = [...block.data.items];
                              newItems[i].name = e.target.value;
                              updateBlockData(block.id, { items: newItems });
                           }} />
                        </div>
                        <div className="space-y-2">
                           <Label>Role</Label>
                           <Input value={item.role} onChange={e => {
                              const newItems = [...block.data.items];
                              newItems[i].role = e.target.value;
                              updateBlockData(block.id, { items: newItems });
                           }} />
                        </div>
                        <div className="space-y-2 col-span-2">
                           <Label>Avatar URL (optional)</Label>
                           <Input value={item.avatarUrl} onChange={e => {
                              const newItems = [...block.data.items];
                              newItems[i].avatarUrl = e.target.value;
                              updateBlockData(block.id, { items: newItems });
                           }} />
                        </div>
                        <div className="space-y-2 col-span-2">
                           <Label>Review Content</Label>
                           <Textarea value={item.content} onChange={e => {
                              const newItems = [...block.data.items];
                              newItems[i].content = e.target.value;
                              updateBlockData(block.id, { items: newItems });
                           }} />
                        </div>
                     </div>
                  </Card>
               ))}
               <Button type="button" variant="outline" onClick={() => {
                  updateBlockData(block.id, { items: [...block.data.items, { id: uuidv4(), name: 'John Doe', role: 'Customer', content: 'Great service!', avatarUrl: '' }] });
               }}>Add Testimonial</Button>
            </div>
          </div>
         )
      case 'gallery':
         return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={block.data.title} onChange={e => updateBlockData(block.id, { title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Subtitle</Label>
                <Input value={block.data.subtitle} onChange={e => updateBlockData(block.id, { subtitle: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Columns</Label>
                <Select value={String(block.data.columns)} onValueChange={v => updateBlockData(block.id, { columns: Number(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 Columns</SelectItem>
                    <SelectItem value="3">3 Columns</SelectItem>
                    <SelectItem value="4">4 Columns</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
               <Label>Images</Label>
               {block.data.images.map((img, i) => (
                  <Card key={img.id} className="p-4 relative mb-4">
                     <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => {
                        const newImages = [...block.data.images];
                        newImages.splice(i, 1);
                        updateBlockData(block.id, { images: newImages });
                     }}><Trash className="h-4 w-4"/></Button>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label>Image URL</Label>
                           <Input value={img.url} onChange={e => {
                              const newImages = [...block.data.images];
                              newImages[i].url = e.target.value;
                              updateBlockData(block.id, { images: newImages });
                           }} />
                        </div>
                        <div className="space-y-2">
                           <Label>Alt Text</Label>
                           <Input value={img.alt} onChange={e => {
                              const newImages = [...block.data.images];
                              newImages[i].alt = e.target.value;
                              updateBlockData(block.id, { images: newImages });
                           }} />
                        </div>
                     </div>
                  </Card>
               ))}
               <Button type="button" variant="outline" onClick={() => {
                  updateBlockData(block.id, { images: [...block.data.images, { id: uuidv4(), url: 'https://placehold.co/600x400', alt: 'Image' }] });
               }}>Add Image</Button>
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
              <Input type="color" className="w-12 h-10 p-1 cursor-pointer" value={value || "#ffffff"} onChange={e => onChange(e.target.value)} />
              <Input type="text" placeholder="Hex (#ffffff)" value={value || ""} onChange={e => onChange(e.target.value)} />
              {value && <Button type="button" variant="ghost" size="icon" onClick={() => onChange("")}><Trash className="h-4 w-4"/></Button>}
           </div>
        </div>
     </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
         <h3 className="text-lg font-medium">Page Builder</h3>
         <div className="flex items-center bg-muted p-1 rounded-md">
            <Button 
               type="button" 
               variant={mode === "edit" ? "secondary" : "ghost"} 
               size="sm" 
               onClick={() => setMode("edit")}
               className="gap-2"
            >
               <Edit2 className="h-4 w-4" /> Editor
            </Button>
            <Button 
               type="button" 
               variant={mode === "preview" ? "secondary" : "ghost"} 
               size="sm" 
               onClick={() => setMode("preview")}
               className="gap-2"
            >
               <Eye className="h-4 w-4" /> Live Preview
            </Button>
         </div>
      </div>

      {mode === "preview" ? (
         <div className="border rounded-xl overflow-hidden min-h-[500px] bg-white">
            <PageRenderer content={JSON.stringify(blocks)} />
         </div>
      ) : (
         <>
            <div className="flex gap-2 flex-wrap">
               <Button type="button" variant="outline" onClick={() => addBlock('hero')}><LayoutTemplate className="mr-2 h-4 w-4" /> Add Hero</Button>
               <Button type="button" variant="outline" onClick={() => addBlock('text')}><Type className="mr-2 h-4 w-4" /> Add Text</Button>
               <Button type="button" variant="outline" onClick={() => addBlock('featureGrid')}><Box className="mr-2 h-4 w-4" /> Add Features</Button>
               <Button type="button" variant="outline" onClick={() => addBlock('cta')}><ArrowRight className="mr-2 h-4 w-4" /> Add CTA</Button>
               <Button type="button" variant="outline" onClick={() => addBlock('faq')}><HelpCircle className="mr-2 h-4 w-4" /> Add FAQ</Button>
               <Button type="button" variant="outline" onClick={() => addBlock('testimonial')}><Users className="mr-2 h-4 w-4" /> Add Testimonials</Button>
               <Button type="button" variant="outline" onClick={() => addBlock('gallery')}><ImageIcon className="mr-2 h-4 w-4" /> Add Gallery</Button>
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
         </>
      )}
    </div>
  );
}
