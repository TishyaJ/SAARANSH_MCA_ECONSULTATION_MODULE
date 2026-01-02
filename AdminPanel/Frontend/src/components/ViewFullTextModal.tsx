import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STANCE_BG_COLORS } from '@/data/mockData';

interface Comment {
  id: number;
  submitter: string;
  stakeholderType: string;
  date: string;
  stance: string;
  summary: string;
  fullText: string;
  keywords: string[];
  qualityScore: number;
}

interface ViewFullTextModalProps {
  comment: Comment | null;
  isOpen: boolean;
  onClose: () => void;
}

const ViewFullTextModal = ({ comment, isOpen, onClose }: ViewFullTextModalProps) => {
  if (!comment) return null;

  const handleDownload = () => {
    const content = `
Submitter: ${comment.submitter}
Stakeholder Type: ${comment.stakeholderType}
Date: ${comment.date}
Stance: ${comment.stance}
Quality Score: ${comment.qualityScore}/5

Full Submission:
${comment.fullText}

Keywords: ${comment.keywords.join(', ')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${comment.submitter.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_submission.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold">
                Full Submission Details
              </DialogTitle>
              <DialogDescription className="mt-2">
                Complete submission from {comment.submitter}
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Submitter Info */}
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">{comment.submitter}</h3>
                <p className="text-sm text-muted-foreground">{comment.stakeholderType} • {comment.date}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={cn("text-xs border", STANCE_BG_COLORS[comment.stance as keyof typeof STANCE_BG_COLORS])}>
                  {comment.stance}
                </Badge>
                <div className="flex items-center">
                  <span className="text-xs text-muted-foreground mr-1">Score:</span>
                  <span className="text-sm font-medium">{comment.qualityScore}/5</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {comment.keywords.map((keyword, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-card border rounded-lg p-4">
            <h4 className="font-medium mb-2">Summary</h4>
            <p className="text-foreground leading-relaxed">{comment.summary}</p>
          </div>

          {/* Full Text */}
          <div className="bg-card border rounded-lg p-4">
            <h4 className="font-medium mb-2">Full Submission Text</h4>
            <div className="prose prose-sm max-w-none">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {comment.fullText}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Submission ID: {comment.id} • Quality Score: {comment.qualityScore}/5
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download Text
            </Button>
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewFullTextModal;