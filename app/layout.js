import { Noto_Sans_Thai } from 'next/font/google';
import { Navbar } from '@/components/layout/Navbar.js';
import { Footer } from '@/components/layout/Footer.js';
import './globals.css';

// ฟอนต์ไทยที่อ่านง่ายทั้งบนจอและมือถือ next/font โหลดมาเสิร์ฟเองไม่ต้องพึ่ง Google ตอนผู้ใช้เปิดเว็บ
const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai', 'latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata = {
  title: {
    default: 'UniTrade — ตลาดมือสองของนิสิตจุฬาฯ',
    template: '%s | UniTrade',
  },
  description:
    'ซื้อ ขาย และส่งต่อของมือสองภายในจุฬาลงกรณ์มหาวิทยาลัย นัดรับในพื้นที่มหาวิทยาลัย ไม่มีค่าธรรมเนียม',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#d6608a',
};

export default function RootLayout({ children }) {
  return (
    <html lang="th" className={notoSansThai.className}>
      <body>
        <a href="#main" className="sr-only">
          ข้ามไปเนื้อหาหลัก
        </a>
        <Navbar />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
