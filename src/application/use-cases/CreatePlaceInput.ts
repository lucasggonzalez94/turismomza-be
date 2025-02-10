export interface CreatePlaceInput {
  title: string;
  description: string;
  location: string;
  category: string;
  schedule: string;
  services?: string[];
  contactNumber?: string;
  email?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  price?: number;
  currencyPrice?: "ars" | "usd";
  files: Express.Multer.File[];
  userId: string;
  userRole: string;
}
