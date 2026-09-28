import { Accordion, AccordionItem, AccordionContent, AccordionTrigger } from "@/ui"
import { TableOfContents } from "lucide-react"
import type { ITocProps } from "./types"




export function TableOfContent({ items, activeLink }: ITocProps) {
  return (
    <div className="w-full">
      <h1 className="text-xl font-bold mb-3 gap-x-2 flex flex-row items-center">
        <TableOfContents className="rotate-180" /> Table of Content
      </h1>

      <div className="text-xs leading-5.5 text-muted-foreground">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet eum optio
        rerum corporis molestiae, ratione est nobis debitis eius quasi
        voluptates labore enim quidem alias. Iste nostrum laborum perspiciatis
        nesciunt.
          </div>

          <Accordion className="w-full">
              {
                items.map((item, index) => (
                  <AccordionItem key={index} value={item.id}>
                    <AccordionTrigger className="w-full text-left">
                      {item.label}
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="pl-4">
                        {item.nodes && item.nodes.map((child, childIndex) => (
                          <li key={childIndex}>
                            <a
                              href={child.link}
                              onClick={(e) => {
                                e.preventDefault()
                                // onLinkClick(child.link)
                              }}
                              className={`block py-1 ${
                              activeLink &&  activeLink.link === child.link
                                  ? "text-primary font-semibold"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {child.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))  
              }
          </Accordion>
    </div>
  )
}
