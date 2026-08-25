export interface UpdateCommentRequest {
  content: string;
  commentId: number;
  rating: number;
}

export interface UpdateCommentResponse {
  message: string;
  ratingUpdated: true;
  comment: {
    id: number;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  };
}
