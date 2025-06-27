'use client';

import { useState } from 'react';
import PostList from './PostList';

type Props = {
  albumId: string;
  albumName: string;
  artistName: string;
  releaseYear: string;
  imageUrl: string;
  tracklist: { id: string; name: string }[];
};

export default function AlbumPageClientWrapper(props: Props) {
  const [newPost, setNewPost] = useState<any>(null);

  return (
    <PostList albumId={props.albumId} newPost={newPost} />
  );
}
