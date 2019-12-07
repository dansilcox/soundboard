export class Sound {
  public id: string;
  public title: string;
  public text?: string;
  public audioUrl?: string;
  public file?: File;
  public filepath?: string;
  public fileContents?: string;
  public length?: number;
  public recordOrder: number = 0;
}
