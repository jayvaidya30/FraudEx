"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { uploadCase } from "@/lib/backend";

interface CaseUploadFormProps {
  token: string | null;
  onUploadSuccess?: (caseId: string) => void;
}

export function CaseUploadForm({ token, onUploadSuccess }: CaseUploadFormProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload() {
    if (!token) {
      toast.error("Not authenticated");
      return;
    }

    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.error("Choose a file first");
      return;
    }

    try {
      setUploading(true);
      toast.loading("Uploading…", { id: "upload" });
      const result = await uploadCase(token, file);
      toast.success("Uploaded", { id: "upload" });
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      const caseId = result.case?.case_id;
      if (typeof caseId === "string" && caseId.length > 0 && onUploadSuccess) {
        onUploadSuccess(caseId);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      toast.error(message, { id: "upload" });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground">
        Upload a PDF, image, CSV, or text file.
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          ref={fileInputRef}
          type="file"
          className="w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary/90"
          accept=".pdf,.png,.jpg,.jpeg,.tiff,.bmp,.csv,.txt"
          disabled={uploading}
        />
        <Button 
          onClick={handleUpload} 
          className="sm:w-40 gap-2" 
          disabled={uploading}
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading…" : "Upload"}
        </Button>
      </div>
    </div>
  );
}
