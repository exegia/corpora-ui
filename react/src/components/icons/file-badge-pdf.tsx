import { FILE_ICON_CLASS, FILE_ICON_THEME_CSS } from './theme';
import type { FileIconProps } from './types';

/**
 * PDF file icon — badge variant.
 * Switches between light and dark artwork automatically. See `./theme.ts`.
 */
export function FileBadgePdf({ size = 64, title = 'PDF file', className, ...props }: FileIconProps) {
  return (
    <svg
      viewBox="-44 -48 1068 1114"
      width={size}
      height={size}
      role={title ? 'img' : 'presentation'}
      aria-label={title ?? undefined}
      aria-hidden={title ? undefined : true}
      className={className ? `${FILE_ICON_CLASS} ${className}` : FILE_ICON_CLASS}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      {...props}
    >
      <style>{FILE_ICON_THEME_CSS}</style>
      <g data-theme-layer="light">
    <defs>
        <path d="M664.135334,22.0470049 C686.11483,32.0940098 704.602278,53.4598851 741.577175,96.1916357 L853.580372,225.633315 C884.253388,261.082006 899.589896,278.806351 906.574274,297.524519 C913.558651,316.242686 913.581362,339.681124 913.626783,386.558 L914.017631,789.931634 C914.119069,894.620332 914.169788,946.964682 881.683622,979.482341 C849.197455,1012 796.853082,1012 692.164334,1012 L332,1012 C227.348196,1012 175.022295,1012 142.511147,979.488853 C110,946.977705 110,894.651804 110,790 L109.998165,560.737898 C70.6476165,558.461053 45.7264718,552.07676 27.8248558,534.175144 C20.030222,526.38051 13.6516509,517.288754 8.9746663,507.306848 C0,488.152567 0,463.435045 0,414 C0,364.564955 0,339.847433 8.9746663,320.693152 C13.6516509,310.711246 20.030222,301.61949 27.8248558,293.824856 C45.7264718,275.92324 70.6476165,269.538947 109.998165,267.262102 L110,234 C110,129.348196 110,77.0222946 142.511147,44.5111473 C175.022295,12 227.348196,12 332,12 L557.393952,12 C613.901876,12 642.155838,12 664.135334,22.0470049 Z" id="pdf-badge-l-path-1"></path>
        <linearGradient x1="17.6604798%" y1="0%" x2="49.177195%" y2="97.4557292%" id="pdf-badge-l-linearGradient-2">
            <stop stopColor="#FBFAFF" offset="0%"></stop>
            <stop stopColor="#E8E7F0" offset="100%"></stop>
        </linearGradient>
        <path d="M332,12 L557.393952,12 C613.901876,12 642.155838,12 664.135334,22.0470049 C664.135334,22.0470049 664.135334,22.0470049 664.135334,22.0470049 C686.11483,32.0940098 704.602278,53.4598851 741.577175,96.1916357 L853.580372,225.633315 C884.253388,261.082006 899.589896,278.806351 906.574274,297.524519 C906.574274,297.524519 906.574274,297.524519 906.574274,297.524519 C913.558651,316.242686 913.581362,339.681124 913.626783,386.558 L914.017631,789.931634 C914.119069,894.620332 914.169788,946.964682 881.683622,979.482341 C881.683622,979.482341 881.683622,979.482341 881.683622,979.482341 C849.197455,1012 796.853082,1012 692.164334,1012 L332,1012 C227.348196,1012 175.022295,1012 142.511147,979.488853 C142.511147,979.488853 142.511147,979.488853 142.511147,979.488853 C110,946.977705 110,894.651804 110,790 L110,234 C110,129.348196 110,77.0222946 142.511147,44.5111473 C142.511147,44.5111473 142.511147,44.5111473 142.511147,44.5111473 C175.022295,12 227.348196,12 332,12 Z" id="pdf-badge-l-path-3"></path>
        <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="pdf-badge-l-filter-4">
            <feOffset dx="12" dy="-3" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
            <feGaussianBlur stdDeviation="19.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
            <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.825750613 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
        </filter>
        <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="pdf-badge-l-filter-5">
            <feGaussianBlur stdDeviation="5" in="SourceAlpha" result="shadowBlurInner1"></feGaussianBlur>
            <feOffset dx="-10" dy="14" in="shadowBlurInner1" result="shadowOffsetInner1"></feOffset>
            <feComposite in="shadowOffsetInner1" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowInnerInner1"></feComposite>
            <feColorMatrix values="0 0 0 0 0.989073057   0 0 0 0 0.989073057   0 0 0 0 0.989073057  0 0 0 1 0" type="matrix" in="shadowInnerInner1" result="shadowMatrixInner1"></feColorMatrix>
            <feGaussianBlur stdDeviation="5.5" in="SourceAlpha" result="shadowBlurInner2"></feGaussianBlur>
            <feOffset dx="4" dy="-10" in="shadowBlurInner2" result="shadowOffsetInner2"></feOffset>
            <feComposite in="shadowOffsetInner2" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowInnerInner2"></feComposite>
            <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.4 0" type="matrix" in="shadowInnerInner2" result="shadowMatrixInner2"></feColorMatrix>
            <feMerge>
                <feMergeNode in="shadowMatrixInner1"></feMergeNode>
                <feMergeNode in="shadowMatrixInner2"></feMergeNode>
            </feMerge>
        </filter>
        <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="pdf-badge-l-filter-6">
            <feOffset dx="0" dy="5" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
            <feGaussianBlur stdDeviation="3.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
            <feColorMatrix values="0 0 0 0 0.0889199747   0 0 0 0 0.0889199747   0 0 0 0 0.0889199747  0 0 0 0.03 0" type="matrix" in="shadowBlurOuter1" result="shadowMatrixOuter1"></feColorMatrix>
            <feMerge>
                <feMergeNode in="shadowMatrixOuter1"></feMergeNode>
                <feMergeNode in="SourceGraphic"></feMergeNode>
            </feMerge>
        </filter>
        <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="pdf-badge-l-linearGradient-7">
            <stop stopColor="#4B008F" offset="0%"></stop>
            <stop stopColor="#080043" offset="61.8567708%"></stop>
        </linearGradient>
        <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="pdf-badge-l-linearGradient-8">
            <stop stopColor="#4B008F" offset="0%"></stop>
            <stop stopColor="#080043" offset="61.8567708%"></stop>
        </linearGradient>
        <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="pdf-badge-l-filter-9">
            <feOffset dx="0" dy="4" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
            <feGaussianBlur stdDeviation="4" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
            <feColorMatrix values="0 0 0 0 0.655695735   0 0 0 0 0   0 0 0 0 0  0 0 0 1 0" type="matrix" in="shadowBlurOuter1" result="shadowMatrixOuter1"></feColorMatrix>
            <feMerge>
                <feMergeNode in="shadowMatrixOuter1"></feMergeNode>
                <feMergeNode in="SourceGraphic"></feMergeNode>
            </feMerge>
        </filter>
        <linearGradient x1="50%" y1="8.3581851%" x2="50%" y2="83.7772412%" id="pdf-badge-l-linearGradient-10">
            <stop stopColor="#A70000" offset="0%"></stop>
            <stop stopColor="#E80000" offset="100%"></stop>
        </linearGradient>
        <path d="M190,0 L328,0 C417.566859,0 462.350288,0 490.175144,27.8248558 C497.969778,35.6194896 504.348349,44.7112465 509.025334,54.6931524 C518,73.8474329 518,98.5649553 518,148 C518,197.435045 518,222.152567 509.025334,241.306848 C504.348349,251.288754 497.969778,260.38051 490.175144,268.175144 C462.350288,296 417.566859,296 328,296 L190,296 C100.433141,296 55.6497116,296 27.8248558,268.175144 C20.030222,260.38051 13.6516509,251.288754 8.9746663,241.306848 C0,222.152567 0,197.435045 0,148 C0,98.5649553 0,73.8474329 8.9746663,54.6931524 C13.6516509,44.7112465 20.030222,35.6194896 27.8248558,27.8248558 C55.6497116,0 100.433141,0 190,0 Z" id="pdf-badge-l-path-11"></path>
        <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="pdf-badge-l-filter-12">
            <feOffset dx="-9" dy="-18" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
            <feGaussianBlur stdDeviation="13.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
            <feComposite in="shadowBlurOuter1" in2="SourceAlpha" operator="out" result="shadowBlurOuter1"></feComposite>
            <feColorMatrix values="0 0 0 0 0.0196078431   0 0 0 0 0   0 0 0 0 0.309803922  0 0 0 0.121568627 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
        </filter>
        <g id="pdf-badge-l-text-13"><g transform="translate(68, 36)">
<defs>
<g>
<g id="pdf-badge-l-pdf-badge-l-lbl-glyph0-0">
<path d="M 0 40 L 120 40 L 120 -141 L 0 -141 Z M 14.203125 -133 L 105.796875 -133 L 60 -58.40625 Z M 8 -127.40625 L 55.203125 -50.59375 L 8 26.40625 Z M 64.796875 -50.59375 L 112 -127.40625 L 112 26.40625 Z M 14.203125 32 L 60 -42.59375 L 105.796875 32 Z M 14.203125 32 "/>
</g>
<g id="pdf-badge-l-pdf-badge-l-lbl-glyph0-1">
<path d="M 11.59375 0 L 42.796875 0 L 42.796875 -57 L 72.203125 -57 C 104.40625 -57 122.59375 -73.203125 122.59375 -99 C 122.59375 -125 104.40625 -141 72.203125 -141 L 11.59375 -141 Z M 71 -115.796875 C 84.203125 -115.796875 92 -110.203125 92 -99 C 92 -87.796875 84.203125 -82.203125 71 -82.203125 L 42.796875 -82.203125 L 42.796875 -115.796875 Z M 71 -115.796875 "/>
</g>
<g id="pdf-badge-l-pdf-badge-l-lbl-glyph0-2">
<path d="M 11.59375 0 L 59.203125 0 C 104.59375 0 132.796875 -26 132.796875 -70.40625 C 132.796875 -114.796875 104.796875 -141 59.40625 -141 L 11.59375 -141 Z M 57.40625 -114.203125 C 85.203125 -114.203125 99.40625 -98.203125 99.40625 -70.40625 C 99.40625 -42.59375 85.40625 -26.796875 57.40625 -26.796875 L 42.796875 -26.796875 L 42.796875 -114.203125 Z M 57.40625 -114.203125 "/>
</g>
<g id="pdf-badge-l-pdf-badge-l-lbl-glyph0-3">
<path d="M 11.59375 0 L 42.796875 0 L 42.796875 -60 L 88.40625 -60 L 88.40625 -86.59375 L 42.796875 -86.59375 L 42.796875 -114.40625 L 99.796875 -114.40625 L 99.796875 -141 L 11.59375 -141 Z M 11.59375 0 "/>
</g>
</g>
</defs>
<g id="pdf-badge-l-pdf-badge-l-lbl-surface1">
<g>
  <use xlinkHref="#pdf-badge-l-pdf-badge-l-lbl-glyph0-1" x="0.372602" y="182"/>
  <use xlinkHref="#pdf-badge-l-pdf-badge-l-lbl-glyph0-2" x="130.932602" y="182"/>
  <use xlinkHref="#pdf-badge-l-pdf-badge-l-lbl-glyph0-3" x="273.692602" y="182"/>
</g>
</g>
</g></g>
        <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="pdf-badge-l-filter-14">
            <feOffset dx="0" dy="4" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
            <feGaussianBlur stdDeviation="13.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
            <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.872951134 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
        </filter>
    </defs>
    <g id="pdf-badge-l-icon/file/pdf/badge-light" stroke="none" fill="none" xlinkHref="#pdf-badge-l-path-1">
        <g id="pdf-badge-l-Sheet">
            <use fill="black" fillOpacity="1" filter="url(#pdf-badge-l-filter-4)" xlinkHref="#pdf-badge-l-path-3"></use>
            <use fill="url(#pdf-badge-l-linearGradient-2)" fillRule="evenodd" xlinkHref="#pdf-badge-l-path-3"></use>
            <use fill="black" fillOpacity="1" filter="url(#pdf-badge-l-filter-5)" xlinkHref="#pdf-badge-l-path-3"></use>
        </g>
        <g id="pdf-badge-l-Lines" filter="url(#pdf-badge-l-filter-6)" opacity="0.13" strokeWidth="1" fillRule="evenodd" transform="translate(266.5027, 355.518)">
            <path d="M304.544551,0.447520067 C319.125735,0.47109626 330.927008,12.3105936 330.903467,26.8917774 C330.879856,41.4729613 319.040358,53.2742341 304.459175,53.2506931 L27.7029447,52.8031731 C13.1217608,52.7795969 1.32048809,40.9400996 1.34402902,26.3589157 C1.36764048,11.7777318 13.2071378,-0.0235409293 27.7883217,1.01746264e-13 L304.544551,0.447520067 Z" id="pdf-badge-l-Line-1" fill="url(#pdf-badge-l-linearGradient-7)" fillRule="nonzero"></path>
            <path d="M509,164.674408 C509,179.255611 497.1796,191.076012 482.598397,191.076012 L27.296573,191.076012 C12.7153701,191.076012 0.894969607,179.255611 0.894969607,164.674408 C0.894969607,150.093206 12.7153701,138.272805 27.296573,138.272805 L482.598397,138.272805 C497.1796,138.272805 509,150.093206 509,164.674408 Z" id="pdf-badge-l-Line-2" fill="url(#pdf-badge-l-linearGradient-8)" fillRule="nonzero"></path>
            <path d="M508.552515,304.737062 C508.552515,319.318265 496.732115,331.138666 482.150912,331.138666 L26.8490882,331.138666 C12.2678853,331.138666 0.447484804,319.318265 0.447484804,304.737062 C0.447484804,290.15586 12.2678853,278.335459 26.8490882,278.335459 L482.150912,278.335459 C496.732115,278.335459 508.552515,290.15586 508.552515,304.737062 Z" id="pdf-badge-l-Line-3" fill="url(#pdf-badge-l-linearGradient-8)" fillRule="nonzero"></path>
        </g>
        <g id="pdf-badge-l-Badge" filter="url(#pdf-badge-l-filter-9)" strokeWidth="1" fillRule="evenodd" transform="translate(0, 266)">
            <g id="pdf-badge-l-Badge-Plate">
                <use fill="black" fillOpacity="1" filter="url(#pdf-badge-l-filter-12)" xlinkHref="#pdf-badge-l-path-11"></use>
                <use fillOpacity="0.76" fill="url(#pdf-badge-l-linearGradient-10)" fillRule="evenodd" xlinkHref="#pdf-badge-l-path-11"></use>
            </g>
            <g id="pdf-badge-l-Label" fill="#EDEBF1" fillOpacity="1">
                <use filter="url(#pdf-badge-l-filter-14)" xlinkHref="#pdf-badge-l-text-13"></use>
                <use xlinkHref="#pdf-badge-l-text-13"></use>
            </g>
        </g>
    </g>
</g>
      <g data-theme-layer="dark">
    <defs>
        <path d="M664.135334,22.0470049 C686.11483,32.0940098 704.602278,53.4598851 741.577175,96.1916357 L853.580372,225.633315 C884.253388,261.082006 899.589896,278.806351 906.574274,297.524519 C913.558651,316.242686 913.581362,339.681124 913.626783,386.558 L914.017631,789.931634 C914.119069,894.620332 914.169788,946.964682 881.683622,979.482341 C849.197455,1012 796.853082,1012 692.164334,1012 L332,1012 C227.348196,1012 175.022295,1012 142.511147,979.488853 C110,946.977705 110,894.651804 110,790 L109.998165,560.737898 C70.6476165,558.461053 45.7264718,552.07676 27.8248558,534.175144 C20.030222,526.38051 13.6516509,517.288754 8.9746663,507.306848 C0,488.152567 0,463.435045 0,414 C0,364.564955 0,339.847433 8.9746663,320.693152 C13.6516509,310.711246 20.030222,301.61949 27.8248558,293.824856 C45.7264718,275.92324 70.6476165,269.538947 109.998165,267.262102 L110,234 C110,129.348196 110,77.0222946 142.511147,44.5111473 C175.022295,12 227.348196,12 332,12 L557.393952,12 C613.901876,12 642.155838,12 664.135334,22.0470049 Z" id="pdf-badge-d-path-1"></path>
        <linearGradient x1="25.9355099%" y1="0%" x2="63.5613444%" y2="91.834983%" id="pdf-badge-d-linearGradient-2">
            <stop stopColor="#2A2A2A" stopOpacity="0.980392157" offset="0%"></stop>
            <stop stopColor="#050505" offset="100%"></stop>
        </linearGradient>
        <path d="M332,12 L557.393952,12 C613.901876,12 642.155838,12 664.135334,22.0470049 C664.135334,22.0470049 664.135334,22.0470049 664.135334,22.0470049 C686.11483,32.0940098 704.602278,53.4598851 741.577175,96.1916357 L853.580372,225.633315 C884.253388,261.082006 899.589896,278.806351 906.574274,297.524519 C906.574274,297.524519 906.574274,297.524519 906.574274,297.524519 C913.558651,316.242686 913.581362,339.681124 913.626783,386.558 L914.017631,789.931634 C914.119069,894.620332 914.169788,946.964682 881.683622,979.482341 C881.683622,979.482341 881.683622,979.482341 881.683622,979.482341 C849.197455,1012 796.853082,1012 692.164334,1012 L332,1012 C227.348196,1012 175.022295,1012 142.511147,979.488853 C142.511147,979.488853 142.511147,979.488853 142.511147,979.488853 C110,946.977705 110,894.651804 110,790 L110,234 C110,129.348196 110,77.0222946 142.511147,44.5111473 C142.511147,44.5111473 142.511147,44.5111473 142.511147,44.5111473 C175.022295,12 227.348196,12 332,12 Z" id="pdf-badge-d-path-3"></path>
        <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="pdf-badge-d-filter-4">
            <feOffset dx="12" dy="-3" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
            <feGaussianBlur stdDeviation="28.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
            <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
        </filter>
        <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="pdf-badge-d-filter-5">
            <feGaussianBlur stdDeviation="4" in="SourceAlpha" result="shadowBlurInner1"></feGaussianBlur>
            <feOffset dx="-10" dy="14" in="shadowBlurInner1" result="shadowOffsetInner1"></feOffset>
            <feComposite in="shadowOffsetInner1" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowInnerInner1"></feComposite>
            <feColorMatrix values="0 0 0 0 0.194256757   0 0 0 0 0.194256757   0 0 0 0 0.194256757  0 0 0 1 0" type="matrix" in="shadowInnerInner1" result="shadowMatrixInner1"></feColorMatrix>
            <feGaussianBlur stdDeviation="4" in="SourceAlpha" result="shadowBlurInner2"></feGaussianBlur>
            <feOffset dx="4" dy="-10" in="shadowBlurInner2" result="shadowOffsetInner2"></feOffset>
            <feComposite in="shadowOffsetInner2" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowInnerInner2"></feComposite>
            <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.03 0" type="matrix" in="shadowInnerInner2" result="shadowMatrixInner2"></feColorMatrix>
            <feMerge>
                <feMergeNode in="shadowMatrixInner1"></feMergeNode>
                <feMergeNode in="shadowMatrixInner2"></feMergeNode>
            </feMerge>
        </filter>
        <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="pdf-badge-d-filter-6">
            <feOffset dx="0" dy="5" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
            <feGaussianBlur stdDeviation="3.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
            <feColorMatrix values="0 0 0 0 0.0889199747   0 0 0 0 0.0889199747   0 0 0 0 0.0889199747  0 0 0 0.03 0" type="matrix" in="shadowBlurOuter1" result="shadowMatrixOuter1"></feColorMatrix>
            <feMerge>
                <feMergeNode in="shadowMatrixOuter1"></feMergeNode>
                <feMergeNode in="SourceGraphic"></feMergeNode>
            </feMerge>
        </filter>
        <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="pdf-badge-d-filter-7">
            <feOffset dx="0" dy="4" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
            <feGaussianBlur stdDeviation="4" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
            <feColorMatrix values="0 0 0 0 0.655695735   0 0 0 0 0   0 0 0 0 0  0 0 0 1 0" type="matrix" in="shadowBlurOuter1" result="shadowMatrixOuter1"></feColorMatrix>
            <feMerge>
                <feMergeNode in="shadowMatrixOuter1"></feMergeNode>
                <feMergeNode in="SourceGraphic"></feMergeNode>
            </feMerge>
        </filter>
        <linearGradient x1="50%" y1="8.3581851%" x2="50%" y2="83.7772412%" id="pdf-badge-d-linearGradient-8">
            <stop stopColor="#A70000" offset="0%"></stop>
            <stop stopColor="#E80000" offset="100%"></stop>
        </linearGradient>
        <path d="M190,0 L328,0 C417.566859,0 462.350288,0 490.175144,27.8248558 C497.969778,35.6194896 504.348349,44.7112465 509.025334,54.6931524 C518,73.8474329 518,98.5649553 518,148 C518,197.435045 518,222.152567 509.025334,241.306848 C504.348349,251.288754 497.969778,260.38051 490.175144,268.175144 C462.350288,296 417.566859,296 328,296 L190,296 C100.433141,296 55.6497116,296 27.8248558,268.175144 C20.030222,260.38051 13.6516509,251.288754 8.9746663,241.306848 C0,222.152567 0,197.435045 0,148 C0,98.5649553 0,73.8474329 8.9746663,54.6931524 C13.6516509,44.7112465 20.030222,35.6194896 27.8248558,27.8248558 C55.6497116,0 100.433141,0 190,0 Z" id="pdf-badge-d-path-9"></path>
        <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="pdf-badge-d-filter-10">
            <feOffset dx="-9" dy="-18" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
            <feGaussianBlur stdDeviation="13.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
            <feComposite in="shadowBlurOuter1" in2="SourceAlpha" operator="out" result="shadowBlurOuter1"></feComposite>
            <feColorMatrix values="0 0 0 0 0.0196078431   0 0 0 0 0   0 0 0 0 0.309803922  0 0 0 0.121568627 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
        </filter>
        <g id="pdf-badge-d-text-11"><g transform="translate(68, 36)">
<defs>
<g>
<g id="pdf-badge-d-pdf-badge-d-lbl-glyph0-0">
<path d="M 0 40 L 120 40 L 120 -141 L 0 -141 Z M 14.203125 -133 L 105.796875 -133 L 60 -58.40625 Z M 8 -127.40625 L 55.203125 -50.59375 L 8 26.40625 Z M 64.796875 -50.59375 L 112 -127.40625 L 112 26.40625 Z M 14.203125 32 L 60 -42.59375 L 105.796875 32 Z M 14.203125 32 "/>
</g>
<g id="pdf-badge-d-pdf-badge-d-lbl-glyph0-1">
<path d="M 11.59375 0 L 42.796875 0 L 42.796875 -57 L 72.203125 -57 C 104.40625 -57 122.59375 -73.203125 122.59375 -99 C 122.59375 -125 104.40625 -141 72.203125 -141 L 11.59375 -141 Z M 71 -115.796875 C 84.203125 -115.796875 92 -110.203125 92 -99 C 92 -87.796875 84.203125 -82.203125 71 -82.203125 L 42.796875 -82.203125 L 42.796875 -115.796875 Z M 71 -115.796875 "/>
</g>
<g id="pdf-badge-d-pdf-badge-d-lbl-glyph0-2">
<path d="M 11.59375 0 L 59.203125 0 C 104.59375 0 132.796875 -26 132.796875 -70.40625 C 132.796875 -114.796875 104.796875 -141 59.40625 -141 L 11.59375 -141 Z M 57.40625 -114.203125 C 85.203125 -114.203125 99.40625 -98.203125 99.40625 -70.40625 C 99.40625 -42.59375 85.40625 -26.796875 57.40625 -26.796875 L 42.796875 -26.796875 L 42.796875 -114.203125 Z M 57.40625 -114.203125 "/>
</g>
<g id="pdf-badge-d-pdf-badge-d-lbl-glyph0-3">
<path d="M 11.59375 0 L 42.796875 0 L 42.796875 -60 L 88.40625 -60 L 88.40625 -86.59375 L 42.796875 -86.59375 L 42.796875 -114.40625 L 99.796875 -114.40625 L 99.796875 -141 L 11.59375 -141 Z M 11.59375 0 "/>
</g>
</g>
</defs>
<g id="pdf-badge-d-pdf-badge-d-lbl-surface1">
<g>
  <use xlinkHref="#pdf-badge-d-pdf-badge-d-lbl-glyph0-1" x="0.372602" y="182"/>
  <use xlinkHref="#pdf-badge-d-pdf-badge-d-lbl-glyph0-2" x="130.932602" y="182"/>
  <use xlinkHref="#pdf-badge-d-pdf-badge-d-lbl-glyph0-3" x="273.692602" y="182"/>
</g>
</g>
</g></g>
        <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="pdf-badge-d-filter-12">
            <feOffset dx="0" dy="4" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
            <feGaussianBlur stdDeviation="17" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
            <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.872951134 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
        </filter>
    </defs>
    <g id="pdf-badge-d-icon/file/pdf/badge-dark" stroke="none" fill="none" xlinkHref="#pdf-badge-d-path-1">
        <g id="pdf-badge-d-Sheet">
            <use fill="black" fillOpacity="1" filter="url(#pdf-badge-d-filter-4)" xlinkHref="#pdf-badge-d-path-3"></use>
            <use fill="url(#pdf-badge-d-linearGradient-2)" fillRule="evenodd" xlinkHref="#pdf-badge-d-path-3"></use>
            <use fill="black" fillOpacity="1" filter="url(#pdf-badge-d-filter-5)" xlinkHref="#pdf-badge-d-path-3"></use>
        </g>
        <g id="pdf-badge-d-Lines" filter="url(#pdf-badge-d-filter-6)" opacity="0.13" strokeWidth="1" fillRule="evenodd" transform="translate(266.5027, 355.518)" fill="#B2B2B2">
            <path d="M304.544551,0.447520067 C319.125735,0.47109626 330.927008,12.3105936 330.903467,26.8917774 C330.879856,41.4729613 319.040358,53.2742341 304.459175,53.2506931 L27.7029447,52.8031731 C13.1217608,52.7795969 1.32048809,40.9400996 1.34402902,26.3589157 C1.36764048,11.7777318 13.2071378,-0.0235409293 27.7883217,1.01746264e-13 L304.544551,0.447520067 Z" id="pdf-badge-d-Line-1" fillRule="nonzero"></path>
            <path d="M509,164.674408 C509,179.255611 497.1796,191.076012 482.598397,191.076012 L27.296573,191.076012 C12.7153701,191.076012 0.894969607,179.255611 0.894969607,164.674408 C0.894969607,150.093206 12.7153701,138.272805 27.296573,138.272805 L482.598397,138.272805 C497.1796,138.272805 509,150.093206 509,164.674408 Z" id="pdf-badge-d-Line-2" fillRule="nonzero"></path>
            <path d="M508.552515,304.737062 C508.552515,319.318265 496.732115,331.138666 482.150912,331.138666 L26.8490882,331.138666 C12.2678853,331.138666 0.447484804,319.318265 0.447484804,304.737062 C0.447484804,290.15586 12.2678853,278.335459 26.8490882,278.335459 L482.150912,278.335459 C496.732115,278.335459 508.552515,290.15586 508.552515,304.737062 Z" id="pdf-badge-d-Line-3" fillRule="nonzero"></path>
        </g>
        <g id="pdf-badge-d-Badge" filter="url(#pdf-badge-d-filter-7)" strokeWidth="1" fillRule="evenodd" transform="translate(0, 266)">
            <g id="pdf-badge-d-Badge-Plate">
                <use fill="black" fillOpacity="1" filter="url(#pdf-badge-d-filter-10)" xlinkHref="#pdf-badge-d-path-9"></use>
                <use fillOpacity="0.88" fill="url(#pdf-badge-d-linearGradient-8)" fillRule="evenodd" xlinkHref="#pdf-badge-d-path-9"></use>
            </g>
            <g id="pdf-badge-d-Label" fill="#EDEBF1" fillOpacity="1">
                <use filter="url(#pdf-badge-d-filter-12)" xlinkHref="#pdf-badge-d-text-11"></use>
                <use xlinkHref="#pdf-badge-d-text-11"></use>
            </g>
        </g>
    </g>
</g>
    </svg>
  );
}

export default FileBadgePdf;
