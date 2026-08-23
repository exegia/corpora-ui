import type { SVGProps } from 'react';

export interface FileIconProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  /** Rendered width and height. Defaults to 64. */
  size?: number | string;
  /** Accessible name. Pass `null` to mark the icon decorative. */
  title?: string | null;
}
