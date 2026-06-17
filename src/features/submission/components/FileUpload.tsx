import { useRef, useState, type DragEvent } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  fileName?: string;
  onFileSelected: (fileName: string) => void;
  onClear: () => void;
  disabled?: boolean;
  maxSizeMb?: number;
  accept?: string;
}

/** Accessible PDF upload with drag-and-drop, size and type validation.
 *  We only persist the file name in the mock backend (no real binary upload). */
export function FileUpload({
  fileName,
  onFileSelected,
  onClear,
  disabled,
  maxSizeMb = 10,
  accept = 'application/pdf',
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>();
  const [dragging, setDragging] = useState(false);

  const validateAndSet = (file: File | undefined) => {
    setError(undefined);
    if (!file) return;
    if (accept && !file.type.includes('pdf')) {
      setError('Only PDF files are allowed.');
      return;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`File is too large. Max ${maxSizeMb}MB.`);
      return;
    }
    onFileSelected(file.name);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    validateAndSet(e.dataTransfer.files[0]);
  };

  if (fileName) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 p-3">
        <FileText className="h-5 w-5 shrink-0 text-brand" aria-hidden />
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{fileName}</span>
        {!disabled && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Remove file"
            className="text-muted hover:text-fg"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-surface-2',
          dragging ? 'border-brand bg-brand-subtle/40' : 'border-border',
        )}
      >
        <UploadCloud className="h-6 w-6 text-muted" aria-hidden />
        <p className="text-sm font-medium">Drop your pitch deck here, or click to browse</p>
        <p className="text-xs text-muted">PDF only · Max {maxSizeMb}MB</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          disabled={disabled}
          onChange={(e) => validateAndSet(e.target.files?.[0])}
        />
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
