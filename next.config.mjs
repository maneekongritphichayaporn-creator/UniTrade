/** @type {import('next').NextConfig} */
const nextConfig = {
  // ระบุ root ไว้ ไม่ให้ Next.js เดาผิดเมื่อโฟลเดอร์แม่มี package-lock.json ของโปรเจกต์อื่น
  outputFileTracingRoot: import.meta.dirname,
};

export default nextConfig;
