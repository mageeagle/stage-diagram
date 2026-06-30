// Global handle stored after showSaveAsDialog for use by saveFile
let _saveHandle: any = null;
let _saveFilename: string | null = null;

const INVALID_FILENAME_REGEX = /[<>:"/\\|?*/]/g;

function sanitizeName(name: string, extension: string): string {
  const sanitized = name.replace(INVALID_FILENAME_REGEX, '');
  const ext = extension.startsWith('.') ? extension : `.${extension}`;
  return sanitized + ext;
}

export function showSaveAsDialog(suggestedName: string, extension: string): Promise<string | null> {
  if (typeof window === 'undefined' || !('showSaveFilePicker' in window)) {
    return Promise.resolve(null);
  }

  const filename = sanitizeName(suggestedName, extension);

  return (window as any).showSaveFilePicker({
    types: [{
      description: 'File',
      accept: { 'application/octet-stream': [filename] }
    }],
    suggestedName: filename
  }).then((handle: any) => {
    _saveHandle = handle;
    _saveFilename = filename;
    return filename;
  }).catch(() => {
    _saveHandle = null;
    _saveFilename = null;
    return null;
  });
}

export function saveFile(blob: Blob, filename: string): Promise<void> {
  if (_saveHandle) {
    return _saveHandle.createWritable().then((writable: any) => {
      return writable.write(blob).then(() => writable.close());
    }).finally(() => {
      _saveHandle = null;
      _saveFilename = null;
    });
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return Promise.resolve();
}

export function resetSaveState(): void {
  _saveHandle = null;
  _saveFilename = null;
}
