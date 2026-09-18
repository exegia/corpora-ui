import { Bubble } from "@/components/atoms";
import { Info } from "./info";
import type { IUserMessageProps } from "./types";


export function Message({ children, user }: IUserMessageProps) {
  return <Bubble>
    <Bubble.Header>
      <Info
        direction={user?.direction}
        user={{
          firstName: user?.firstName,
          lastName: user?.lastName,
          role: user?.role,
        }}
        variant="info"
      />
    </Bubble.Header>
    <Bubble.Message>
      {children}
    </Bubble.Message>
  </Bubble>
  
}
