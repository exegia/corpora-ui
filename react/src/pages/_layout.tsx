import type { ReactNode } from "react";
import { createHomeLayout } from "fumapress/layouts/home";
import type PressConfig from "../../press.config";

const HomeLayout = createHomeLayout<typeof PressConfig.$context>();

export default function Layout({ children }: { children: ReactNode }) {
  return <HomeLayout>{children}</HomeLayout>;
}