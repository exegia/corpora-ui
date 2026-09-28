import { Accordion } from "@/ui"
import { randomUUIDv7 } from "bun"
import { TableOfContents } from "lucide-react"


const items = [
    {
        id: randomUUIDv7(),
        label: "Old Testament",
        description: "Traditionally includes the Pentateuch, tunim and the katunim",
        link: "#old-testament-section",
        type: "section",
        nodes: [
            {
                
            }
        ]
    }    
]

export function TableOfContent() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-3 gap-x-2 flex flex-row items-center">
        <TableOfContents className="rotate-180" /> Table of Content
      </h1>

      <div className="text-xs leading-5.5 text-muted-foreground">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet eum optio
        rerum corporis molestiae, ratione est nobis debitis eius quasi
        voluptates labore enim quidem alias. Iste nostrum laborum perspiciatis
        nesciunt.
          </div>

          <Accordion>
              ()
          </Accordion>
    </div>
  )
}
