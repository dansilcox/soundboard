export class Sound {
  public id: number;
  public title: string;
  public text?: string;
  public url?: string;
  public file?: File;
  public filepath?: string;
  public fileContents?: string;
  public length?: number;
  public recordOrder: number = 0;
}