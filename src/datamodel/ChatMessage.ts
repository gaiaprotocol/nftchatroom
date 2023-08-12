export enum MessageType {
  MESSAGE,
  FILE_UPLOAD,
  EMOJI,
}

type Emoji = string;

interface UploadedFile {
  url: string;
  name: string;
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
}
