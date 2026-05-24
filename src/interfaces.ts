export interface RecordLabel {
  id: number;
  name: string;
  description?: string;
  foundedYear?: number;
  isActive?: boolean;
  country: string;
  logoUrl: string;
}

export interface MusicArtist {
  id: number;
  name: string;
  description: string;
  age: number;
  isActive: boolean;
  birthDate: string;
  imageUrl: string;
  genre: string;
  hobbies: string[];
  recordLabel: RecordLabel;
}

export interface User {
  username: string;
  password: string;
  role: "ADMIN" | "USER";
}
