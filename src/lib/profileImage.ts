const IMAGE_FIELDS = ['profileImageUrl', 'profileImage', 'avatar', 'photo', 'photoUrl', 'image', 'imageUrl'] as const;

const asHttpsUrl = (url?: string | null) => {
  if (!url) return '';
  if (url.startsWith('https://')) return url;
  if (url.startsWith('http://')) return `https://${url.slice('http://'.length)}`;
  return url;
};

const getFromObject = (obj: any): string => {
  if (!obj || typeof obj !== 'object') return '';
  for (const field of IMAGE_FIELDS) {
    const value = obj?.[field];
    if (typeof value === 'string' && value.trim()) {
      return asHttpsUrl(value.trim());
    }
  }
  return '';
};

export const resolveProfileImage = (entity: any): string => {
  if (!entity) return '';
  return (
    getFromObject(entity) ||
    getFromObject(entity?.user) ||
    getFromObject(entity?.data) ||
    getFromObject(entity?.profile) ||
    ''
  );
};

export const withImageCacheBust = (url?: string, cacheBust?: string | number) => {
  if (!url) return '';
  const separator = url.includes('?') ? '&' : '?';
  const value = cacheBust ?? Date.now();
  return `${url}${separator}t=${value}`;
};

export const initialsFromName = (name?: string) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};
