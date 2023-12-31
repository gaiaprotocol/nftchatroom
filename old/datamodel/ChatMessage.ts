export enum MessageType {
  MESSAGE,
  FILE_UPLOAD,
  EMOJI,
}

type Emoji = string;

export interface UploadedFile {
  url: string;
  thumbnailURL?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

export default interface ChatMessage {
  id: number;
  author: string;
  message_type: MessageType;
  message?: string;
  rich?: {
    files?: UploadedFile[];
    emojis?: Emoji[];
  };
  author_ens?: string;
  author_pfp?: { image_url?: string };
}
