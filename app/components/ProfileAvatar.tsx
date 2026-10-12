'use client';

import Image from 'next/image';

type ProfileAvatarProps = {
  src?: string | null;
  alt?: string;
  size?: number;
  className?: string;
};

function hasPhoto(src?: string | null) {
  return Boolean(src && src.trim());
}

export default function ProfileAvatar({
  src,
  alt = 'Profile',
  size = 80,
  className = '',
}: ProfileAvatarProps) {
  if (!hasPhoto(src)) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-gray-200 text-gray-400 ${className}`}
        style={{ width: size, height: size }}
        aria-label="Profile placeholder"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden
          style={{ width: size * 0.55, height: size * 0.55 }}
        >
          <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.33 0-8 1.67-8 5v1h16v-1c0-3.33-4.67-5-8-5Z" />
        </svg>
      </div>
    );
  }

  if (src!.startsWith('blob:')) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src!}
        alt={alt}
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <Image
      src={src!}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
