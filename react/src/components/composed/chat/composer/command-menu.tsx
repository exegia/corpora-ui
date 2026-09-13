import type { IComposerMenuProps } from "./type";
import {
  Popover,
  PopoverPopup,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CommandItem, CommandPanel, CommandShortcut } from "@/components/ui/command";
import { AddButton } from "./add-button";

export function CommandMenu({ items = [] }: IComposerMenuProps): React.ReactElement {
  return (
    <Popover>
         <PopoverTrigger render={(props, state) => <AddButton {...props} state={state} />} />
         <PopoverPopup className="w-80">
           <div className="mb-2">
             <CommandPanel>
               {items && items.map((item, index) => (
                 <CommandItem key={index} value={item.id} >
                   <div>
                     {item.icon}
                     {item.label}
                   </div>
                   <div>
                     {item.description}
                   </div>
                   <CommandShortcut>{item.trailing}</CommandShortcut>
                 </CommandItem>
               ))}
             </CommandPanel>
           </div>
         </PopoverPopup>
       </Popover>
  );
}