export interface StorageProvider {
  readonly name: string;
  save(file: File, path: string): Promise<{ storagePath: string; fileSize: number }>;
  getBuffer(storagePath: string): Promise<Buffer>;
  getUrl(storagePath: string): Promise<string>;
  delete(storagePath: string): Promise<void>;
}
