import type { ReactNode } from "react";


export type TNodeType = "book" | "section" | "chapter" | "verse" | "paragraph" | "surah" | "sentence" | "clause" | "word"
export type TNodeLevel = 1 | 2 | 3 | 4 | 5 | 6
export type TNodeLevelDefinition = 
| { level: 1, type: "book" }
| { level: 2, type: "section" }
| { level: 3, type: "chapter" }
| { level: 4, type: "verse" }
| { level: 5, type: "paragraph" }
| { level: 6, type: "surah" | "sentence" | "clause" | "word" }    
export type TLink<N extends TNodeType = TNodeType> = N extends `#${infer T}-${N}` ? T : never;
export type TBaseItem<Section extends TNodeType = TNodeType> = {
    id: string,
    label: string | ReactNode,
  link: TLink<Section>,
  type: Section,    
}

export type TTocItem = {
     description: "Traditionally includes the Pentateuch, tunim and the katunim",
}