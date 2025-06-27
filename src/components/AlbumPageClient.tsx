'use client';

import { useState } from 'react';
import PostList from './PostList';
import CommentComposer from './CommentField';

type Props = {
  albumId: string;
  albumName: string;
  artistName: string;
  releaseYear: string;
  imageUrl: string;
};

export default function AlbumPageClient(props: Props) {
  const [newPost, setNewPost] = useState<any | null>(null);

  return (
    <>
      <CommentComposer {...props} onCommentPosted={setNewPost} />
      <PostList albumId={props.albumId} newPost={newPost} />
    </>
  );
}
