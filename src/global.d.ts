interface FileSystemFileHandle {
  getFile(): Promise<File>;
}

interface Window {
  showOpenFilePicker(options?: {
    multiple?: boolean;
    excludeAcceptAllOption?: boolean;
    types?: {
      description: string;
      accept: {
        [mimeType: string]: string[];
      };
    }[];
  }): Promise<FileSystemFileHandle[]>;
}