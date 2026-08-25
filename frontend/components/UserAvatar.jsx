'use client';

// Shared header avatar image, used wherever an authenticated user's picture
// needs to appear (tenant/superadmin Header, customer nav on the homepage).
// Falls back to /default-avatar.svg when the user has no avatarUrl, and to an
// initials circle when neither an avatar nor image is available.

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function resolveAvatarSrc(avatarUrl) {
  if (!avatarUrl) return '/default-avatar.svg';
  if (/^https?:\/\//i.test(avatarUrl)) return avatarUrl;
  return `${API_URL}${avatarUrl}`;
}

export default function UserAvatar({ user, size = 34, className = '' }) {
  const src = resolveAvatarSrc(user?.avatarUrl);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={user?.firstName || user?.fullName || 'User avatar'}
      width={size}
      height={size}
      className={`flex-shrink-0 rounded-full object-cover bg-[linear-gradient(135deg,var(--sa-primary,#667eea),#764ba2)] ${className}`}
      style={{ width: size, height: size }}
      onError={(e) => {
        if (e.currentTarget.src.indexOf('/default-avatar.svg') === -1) {
          e.currentTarget.src = '/default-avatar.svg';
        }
      }}
    />
  );
}
