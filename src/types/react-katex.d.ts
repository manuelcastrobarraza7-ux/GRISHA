declare module 'react-katex' {
  import * as React from 'react';
  
  export interface MathViewProps {
    math: string;
    errorColor?: string;
    renderError?: (error: Error) => React.ReactNode;
    settings?: object;
  }

  export class InlineMath extends React.Component<MathViewProps> {}
  export class BlockMath extends React.Component<MathViewProps> {}
}
