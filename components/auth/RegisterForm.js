'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { request } from '@/lib/client/api.js';
import { USE_MOCK_API } from '@/lib/client/config.js';
import { getFaculties } from '@/lib/client/faculties.js';
import { routes } from '@/lib/client/routes.js';
import styles from './AccountForms.module.css';

export function RegisterForm() {
  const router = useRouter();
  const [faculties, setFaculties] = useState([]);
  const [faculty, setFaculty] = useState('');
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    getFaculties({ signal: controller.signal }).then((result) => setFaculties(result.data))
      .catch((err) => { if (err.name !== 'AbortError') setError(err); });
    return () => controller.abort();
  }, []);

  async function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(null);
    if (form.get('password') !== form.get('confirm_password')) {
      setError({ field: 'confirm_password', message: 'รหัสผ่านทั้งสองช่องไม่ตรงกัน' });
      return;
    }
    if (USE_MOCK_API) {
      setError({ message: 'โหมดข้อมูลจำลองยังไม่บันทึกบัญชี กรุณาเชื่อมต่อ API จริงเพื่อสมัครสมาชิก' });
      return;
    }
    setPending(true);
    try {
      await request('/auth/register', { method: 'POST', body: {
        email: form.get('email'), password: form.get('password'), full_name: form.get('full_name'),
        phone_number: form.get('phone_number'), line_id: form.get('line_id'),
        faculty: form.get('faculty'), faculty_other: form.get('faculty_other'),
      } });
      router.push(routes.login());
    } catch (err) { setError(err); }
    finally { setPending(false); }
  }

  return <section className={styles.page}>
    <div className={styles.heading}><h1>Register</h1><p>Join your campus marketplace</p></div>
    <div className={styles.card}><form onSubmit={submit}>
      <Field name="full_name" label="ชื่อ-นามสกุล" placeholder="กรอกชื่อและนามสกุล" autoComplete="name" required error={error} />
      <Field name="email" label="อีเมลจุฬาฯ" type="email" placeholder="name@student.chula.ac.th" autoComplete="email" required error={error} />
      <Field name="password" label="รหัสผ่าน" type="password" placeholder="อย่างน้อย 8 ตัว มีตัวอักษรและตัวเลข" autoComplete="new-password" minLength={8} required error={error} />
      <Field name="confirm_password" label="ยืนยันรหัสผ่าน" type="password" autoComplete="new-password" minLength={8} required error={error} />
      <Field name="phone_number" label="เบอร์โทรศัพท์" type="tel" autoComplete="tel" placeholder="0812345678" error={error} />
      <Field name="line_id" label="LINE ID" placeholder="กรอก LINE ID" error={error} />
      <p className="muted" style={{ fontSize: 12, marginBottom: 12 }}>กรอกเบอร์โทรศัพท์หรือ LINE ID อย่างน้อยหนึ่งช่อง</p>
      <label className={styles.field}><span>คณะ</span><select name="faculty" value={faculty} onChange={(e) => setFaculty(e.target.value)} required>
        <option value="">เลือกคณะ</option>{faculties.map((name) => <option key={name} value={name}>{name}</option>)}
        <option value="other">อื่น ๆ (โปรดระบุ)</option>
      </select>{error?.field === 'faculty' && <small className={styles.error}>{error.message}</small>}</label>
      {faculty === 'other' && <Field name="faculty_other" label="ระบุคณะ" required error={error} />}
      {error && !error.field && <p className={styles.error} role="alert">{error.message}</p>}
      <button className="btn btn--primary btn--block" type="submit" disabled={pending}>{pending ? 'กำลังสมัคร…' : 'สมัครสมาชิก'}</button>
      <p className={styles.switch}>มีบัญชีแล้ว? <Link href={routes.login()}>เข้าสู่ระบบ</Link></p>
    </form></div>
  </section>;
}

function Field({ name, label, error, ...props }) {
  return <label className={styles.field}><span>{label}</span><input name={name} {...props} />
    {error?.field === name && <small className={styles.error} role="alert">{error.message}</small>}
  </label>;
}
