// HOOKS

export interface UtilityStyles {
  className: string;
  style: React.CSSProperties;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace React {
    interface CSSProperties {
      '--box-grow'?: number;
      '--box-order'?: number;
      '--box-shrink'?: number;
      '--spacing-all'?: string;
      '--spacing-horizontal'?: string;
      '--spacing-vertical'?: string;
      '--spacing-top'?: string;
      '--spacing-bottom'?: string;
      '--spacing-start'?: string;
      '--spacing-end'?: string;
    }
  }
}

// HTML

export type OmitUnwantedHtmlProps<T> = Omit<T, 'as' | 'children' | 'is' | 'radioGroup'>;

export type CommonHtmlProps = OmitUnwantedHtmlProps<React.HTMLAttributes<HTMLElement>>;

export type HtmlElementType = Exclude<
  keyof HTMLElementTagNameMap,
  'applet' | 'basefont' | 'dir' | 'font' | 'frame' | 'frameset' | 'marquee'
>;

export type InferHtmlElement<T> = T extends HtmlElementType
  ? HTMLElementTagNameMap[T]
  : HTMLElement;