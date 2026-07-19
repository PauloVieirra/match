import { useCallback, useEffect, useState } from "react";
import { fetchLikes, setLiked } from "../services/photoLikesService";

/**
 * Gerencia o estado de curtidas de um conjunto de fotos com update otimista:
 * a UI responde na hora e o serviço confirma (ou reverte, em caso de erro).
 *
 * @param {string[]} photoIds ids gerados por buildPhotoId
 * @param {string} viewerId identificador do usuário logado
 */
export function usePhotoLikes(photoIds, viewerId) {
  const [likes, setLikes] = useState({});
  const idsKey = photoIds.join("~");

  useEffect(() => {
    let active = true;
    if (!photoIds.length) return undefined;
    fetchLikes(photoIds, viewerId).then((snapshot) => {
      if (active) setLikes(snapshot);
    });
    return () => {
      active = false;
    };
  }, [idsKey, viewerId]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleLike = useCallback(
    async (photoId) => {
      let nextLiked = false;
      let previous;

      setLikes((prev) => {
        previous = prev[photoId] || { count: 0, likedByMe: false };
        nextLiked = !previous.likedByMe;
        return {
          ...prev,
          [photoId]: {
            count: Math.max(0, previous.count + (nextLiked ? 1 : -1)),
            likedByMe: nextLiked,
          },
        };
      });

      try {
        const confirmed = await setLiked(photoId, viewerId, nextLiked);
        setLikes((prev) => ({ ...prev, [photoId]: confirmed }));
      } catch {
        setLikes((prev) => ({ ...prev, [photoId]: previous }));
      }
    },
    [viewerId]
  );

  return { likes, toggleLike };
}
