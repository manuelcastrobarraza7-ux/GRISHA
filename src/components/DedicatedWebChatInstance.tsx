import React from 'react';
import { UnifiedGeminiChat, ScienceDomain } from './UnifiedGeminiChat';

export type InstanceChatType = 'inorganica' | 'organica' | 'cuantica_astrofisica' | 'laboratorio';

export interface DedicatedWebChatInstanceProps {
  instanceType?: InstanceChatType;
}

/**
 * DedicatedWebChatInstance wraps the single unified Espiqumeyria AI (Gemini Science) chat workspace.
 * It maps the requested legacy instanceType to the appropriate scientific domain.
 */
export const DedicatedWebChatInstance: React.FC<DedicatedWebChatInstanceProps> = ({ 
  instanceType = 'organica' 
}) => {
  let mappedDomain: ScienceDomain = 'organica';
  if (instanceType === 'inorganica') {
    mappedDomain = 'inorganica';
  } else if (instanceType === 'cuantica_astrofisica') {
    mappedDomain = 'cuantica';
  } else if (instanceType === 'laboratorio') {
    mappedDomain = 'laboratorio';
  } else {
    mappedDomain = 'organica';
  }

  return <UnifiedGeminiChat initialDomain={mappedDomain} />;
};

export default DedicatedWebChatInstance;
