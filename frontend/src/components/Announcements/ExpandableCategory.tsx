import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";

interface ExpandableCategoryProps {
  title: string;
  children: React.ReactNode;
}

export function ExpandableCategory({ title, children }: ExpandableCategoryProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="space-y-4">
      <div 
        className="flex items-center cursor-pointer py-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Button
          variant="ghost"
          size="sm"
          className="p-0 mr-2 hover:bg-transparent"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
        >
          {isOpen ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </Button>
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <div className="border-b border-gray-200 mb-4" />
      
      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {children}
        </div>
      )}
    </div>
  );
}