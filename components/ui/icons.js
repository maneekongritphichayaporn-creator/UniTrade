// ไอคอนเป็น inline SVG (ไม่ลงไลบรารีไอคอนเพิ่ม เพื่อไม่ต้องแตะ package.json)
// เส้นจาก Lucide (ISC license) ขนาดปรับด้วย prop size

function Icon({ size = 20, children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const SearchIcon = (props) => (
  <Icon {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </Icon>
);

export const PlusIcon = (props) => (
  <Icon {...props}>
    <path d="M5 12h14M12 5v14" />
  </Icon>
);

export const HeartIcon = ({ filled = false, ...props }) => (
  <Icon {...props} fill={filled ? 'currentColor' : 'none'}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </Icon>
);

export const UserIcon = (props) => (
  <Icon {...props}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Icon>
);

export const MenuIcon = (props) => (
  <Icon {...props}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </Icon>
);

export const CloseIcon = (props) => (
  <Icon {...props}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Icon>
);

export const ChevronLeftIcon = (props) => (
  <Icon {...props}>
    <path d="m15 18-6-6 6-6" />
  </Icon>
);

export const ChevronRightIcon = (props) => (
  <Icon {...props}>
    <path d="m9 18 6-6-6-6" />
  </Icon>
);

export const MapPinIcon = (props) => (
  <Icon {...props}>
    <path d="M20 10c0 4.4-5.1 9.6-7.2 11.6a1.1 1.1 0 0 1-1.6 0C9.1 19.6 4 14.4 4 10a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </Icon>
);

export const FilterIcon = (props) => (
  <Icon {...props}>
    <path d="M3 6h18M7 12h10M10 18h4" />
  </Icon>
);

export const PhoneIcon = (props) => (
  <Icon {...props}>
    <path d="M13.8 10.2a11 11 0 0 0 5 5l1.6-2a1 1 0 0 1 1.1-.3c1 .4 2.1.6 3.1.7v3.6c0 .6-.5 1.1-1.1 1A17 17 0 0 1 7.8 3.5c0-.6.4-1.1 1-1.1h3.7c.1 1 .3 2.1.7 3.1a1 1 0 0 1-.3 1.1z" />
  </Icon>
);

export const ChatIcon = (props) => (
  <Icon {...props}>
    <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.9 9.9 0 0 1-4-.8L3 21l1.9-4.5A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z" />
  </Icon>
);

export const ShieldIcon = (props) => (
  <Icon {...props}>
    <path d="M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1 1 0 0 1 1.3 0C14.3 3.8 16.8 5 18.8 5a1 1 0 0 1 1 1z" />
    <path d="M12 8v4M12 16h.01" />
  </Icon>
);

export const PackageIcon = (props) => (
  <Icon {...props}>
    <path d="m7.5 4.3 9 5.2M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="M3.3 7 12 12l8.7-5M12 22V12" />
  </Icon>
);

export const LogOutIcon = (props) => (
  <Icon {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </Icon>
);

export const ShieldCheckIcon = (props) => (
  <Icon {...props}>
    <path d="M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1 1 0 0 1 1.3 0C14.3 3.8 16.8 5 18.8 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </Icon>
);

export const ImageIcon = (props) => (
  <Icon {...props}>
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-4.1-4.1a2 2 0 0 0-2.8 0L3 22" />
  </Icon>
);
