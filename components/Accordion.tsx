
import React, { useState } from 'react';
import { ChevronDownIcon } from './Icons';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200">
      <button
        className="flex justify-between items-center w-full py-4 text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">{title}</span>
        <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDownIcon className="h-5 w-5 text-gray-500" />
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100 mb-4' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="text-sm text-gray-600 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Accordion;
