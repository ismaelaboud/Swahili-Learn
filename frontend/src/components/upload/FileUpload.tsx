'use client';

import { useState } from 'react';
import { UploadButton } from '@uploadthing/react';
import { OurFileRouter } from '@/app/api/uploadthing/core';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface FileUploadProps {
  endpoint: keyof OurFileRouter;
  onUploadComplete: (url: string) => void;
}

export default function FileUpload({ endpoint, onUploadComplete }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className="w-full">
      <UploadButton<OurFileRouter>
        endpoint={endpoint}
        onUploadBegin={() => {
          setIsUploading(true);
        }}
        onClientUploadComplete={(res) => {
          setIsUploading(false);
          if (res?.[0]?.url) {
            onUploadComplete(res[0].url);
            toast.success('File uploaded successfully');
          }
        }}
        onUploadError={(error: Error) => {
          setIsUploading(false);
          toast.error(`Error uploading file: ${error.message}`);
        }}
        appearance={{
          button: "bg-primary text-primary-foreground hover:bg-primary/90",
          container: "w-full",
          allowedContent: "text-sm text-muted-foreground",
        }}
      />
      {isUploading && (
        <div className="flex items-center justify-center mt-4">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">Uploading...</span>
        </div>
      )}
    </div>
  );
}
