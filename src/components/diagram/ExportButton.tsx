'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Download, FileImage, FileCode, FileType, FileText, ChevronDown } from 'lucide-react';
import { toPng, toJpeg, toSvg } from 'html-to-image';
import { Tooltip } from '@/components/tooltip/Tooltip';

interface ExportButtonProps {
  targetRef: React.RefObject<HTMLDivElement | null>;
}

export const ExportButton = ({ targetRef }: ExportButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const downloadFile = async (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  const runExport = async (exportFn: (el: HTMLElement) => Promise<string>, filename: string, isJpeg: boolean = false) => {
    const el = targetRef.current;
    if (!el) return;

    // Find and hide UI elements that shouldn't be in the export
    const elementsToHide = el.querySelectorAll('.react-flow__controls, .react-flow__minimap, .react-flow__attribution');
    const hiddenElements: { element: HTMLElement; originalDisplay: string }[] = [];

    elementsToHide.forEach((element) => {
      const elementAsHtml = element as HTMLElement;
      hiddenElements.push({ element: elementAsHtml, originalDisplay: elementAsHtml.style.display });
      elementAsHtml.style.display = 'none';
    });

    // Handle JPEG background color to avoid black background
    let originalBgColor = '';
    if (isJpeg) {
      originalBgColor = el.style.backgroundColor;
      // Set background to white for JPEG to avoid black background issues with transparency
      el.style.backgroundColor = 'white';
    }

    try {
      const dataUrl = await exportFn(el);
      downloadFile(dataUrl, filename);
    } catch (error) {
      console.error(`Error exporting ${filename}:`, error);
    } finally {
      // Restore original display styles
      hiddenElements.forEach(({ element, originalDisplay }) => {
        element.style.display = originalDisplay;
      });

      // Restore original background color
      if (isJpeg) {
        el.style.backgroundColor = originalBgColor;
      }
      
      setIsOpen(false);
    }
  };

  const exportAsPng = async () => {
    await runExport(async (el) => await toPng(el), 'diagram.png');
  };

  const exportAsJpeg = async () => {
    await runExport(async (el) => await toJpeg(el), 'diagram.jpg', true);
  };

  const exportAsSvg = async () => {
    await runExport(async (el) => await toSvg(el), 'diagram.svg');
  };

  const exportAsPdf = async () => {
    const el = targetRef.current;
    if (!el) return;
    
    const elementsToHide = el.querySelectorAll('.react-flow__controls, .react-flow__minimap, .react-flow__attribution');
    const hiddenElements: { element: HTMLElement; originalDisplay: string }[] = [];
    elementsToHide.forEach((element) => {
      const elementAsHtml = element as HTMLElement;
      hiddenElements.push({ element: elementAsHtml, originalDisplay: elementAsHtml.style.display });
      elementAsHtml.style.display = 'none';
    });

    try {
      // 1. Generate SVG Data URL
      const svgDataUrl = await toSvg(el);
      
      // 2. Fetch the SVG content to get the raw XML string
      const response = await fetch(svgDataUrl);
      const svgContent = await response.text();

      // 3. Open a new window and inject the SVG
      const printWindow = window.open('', '_blank');
      
      if (!printWindow) {
        alert('Popup blocked! Please allow popups to export as PDF.');
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <title>Export Diagram</title>
            <style>
              @page {
                size: A4 landscape;
                margin: 0;
              }
              body { 
                margin: 0; 
                padding: 0;
                display: flex; 
                justify-content: center; 
                align-items: center;
                background-color: white; 
                width: 297mm;
                height: 210mm;
              }
              svg { 
                max-width: 100%; 
                max-height: 100%;
                display: block;
              }
              @media print {
                body { 
                  width: 297mm;
                  height: 210mm;
                }
              }
            </style>
          </head>
          <body>
            ${svgContent}
            <script>
              window.onload = () => {
                // Small delay to ensure the browser has rendered the SVG/foreignObject
                setTimeout(() => {
                  window.print();
                  window.close();
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();

    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      hiddenElements.forEach(({ element, originalDisplay }) => {
        element.style.display = originalDisplay;
      });
      setIsOpen(false);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <Tooltip
        position="bottom"
        isVisible={isTooltipVisible}
        content="Export Diagram"
        className="absolute top-full mt-2"
      />
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsTooltipVisible(true)}
        onMouseLeave={() => setIsTooltipVisible(false)}
        className="cursor-pointer p-2 rounded-md bg-white dark:bg-stone-800 shadow-md border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors z-10 flex items-center gap-1"
        aria-label="Export Diagram"
      >
        <Download size={20} />
        <ChevronDown size={16} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-40 rounded-md shadow-lg bg-white dark:bg-stone-800 ring-1 ring-black ring-opacity-5 divide-y divide-stone-100 dark:divide-stone-700 z-10">
          <div className="py-1">
            <button
              onClick={exportAsPng}
              className="flex items-center w-full px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700"
            >
              <FileImage size={16} className="mr-2" />
              PNG
            </button>
            <button
              onClick={exportAsJpeg}
              className="flex items-center w-full px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700"
            >
              <FileType size={16} className="mr-2" />
              JPG
            </button>
            <button
              onClick={exportAsSvg}
              className="flex items-center w-full px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700"
            >
              <FileCode size={16} className="mr-2" />
              SVG
            </button>
            <button
              onClick={exportAsPdf}
              className="flex items-center w-full px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700"
            >
              <FileText size={16} className="mr-2" />
              PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
