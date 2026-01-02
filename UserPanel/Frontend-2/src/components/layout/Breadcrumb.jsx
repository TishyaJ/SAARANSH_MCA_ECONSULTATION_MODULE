import React from "react";
import { ChevronRight } from "lucide-react";

export const Breadcrumb = ({ items }) => {
  return (
    <nav className="bg-gov-gray px-4 py-2">
      <div className="container mx-auto">
        <ol className="flex items-center space-x-2 text-sm">
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />}
              {item.href ? (
                <a href={item.href} className="text-gov-blue hover:underline">
                  {item.label}
                </a>
              ) : (
                <span className="text-muted-foreground">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
};