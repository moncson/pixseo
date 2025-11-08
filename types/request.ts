export interface ArticleRequest {
  id: string;
  name: string;
  email: string;
  category: string;
  title: string;
  description: string;
  location?: string;
  createdAt: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
}

