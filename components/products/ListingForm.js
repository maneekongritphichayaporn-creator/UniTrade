'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ImageIcon } from '@/components/ui/icons.js';
import { getCategories, getPickupLocations } from '@/lib/client/catalog.js';
import { USE_MOCK_API } from '@/lib/client/config.js';
import { checkImageFiles, prepareImage } from '@/lib/client/listing-images.js';
import { createProduct, getProduct, updateProduct } from '@/lib/client/products.js';
import { routes } from '@/lib/client/routes.js';
import { useAuth } from '@/lib/client/useAuth.js';
import styles from './ListingForm.module.css';

const empty = { title: '', category_id: '', item_condition: '', price: '', is_free: false,
  pickup_location: '', description: '' };
const conditions = { new: 'ใหม่', like_new: 'เหมือนใหม่', good: 'สภาพดี', fair: 'พอใช้' };

export function ListingForm({ mode, productId }) {
  const router = useRouter();
  const { status } = useAuth();
  const [form, setForm] = useState(empty);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preparing, setPreparing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  useEffect(() => {
    if (status === 'guest') router.replace(routes.login(mode === 'create' ? routes.createProduct : routes.editProduct(productId)));
  }, [status, mode, productId, router]);

  useEffect(() => {
    if (status !== 'authenticated') return undefined;
    const controller = new AbortController();
    setLoading(true);
    setLoadError('');
    Promise.all([
      getCategories({ signal: controller.signal }),
      getPickupLocations({ signal: controller.signal }),
      mode === 'edit' ? getProduct(productId, { signal: controller.signal }) : Promise.resolve(null),
    ]).then(([categoryResult, locationResult, product]) => {
      setCategories(categoryResult.data);
      setLocations(locationResult.data);
      if (mode === 'edit') {
        if (!product) throw new Error('ไม่พบประกาศนี้');
        if (!product.is_owner) throw new Error('คุณไม่ใช่เจ้าของประกาศนี้');
        setForm({ title: product.title, category_id: product.category?.category_id ?? '',
          item_condition: product.item_condition, price: String(product.price), is_free: product.is_free,
          pickup_location: product.pickup_location, description: product.description ?? '' });
        setExistingImages(product.images ?? []);
      }
      setLoading(false);
    }).catch((err) => { if (err.name !== 'AbortError') { setLoadError(err.message); setLoading(false); } });
    return () => controller.abort();
  }, [status, mode, productId]);

  function change(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setError(null);
  }

  async function addImages(event) {
    const selected = [...(event.target.files ?? [])];
    event.target.value = '';
    if (!selected.length) return;
    if (files.length + selected.length > 5) { setError({ field: 'images', message: 'แนบรูปได้ไม่เกิน 5 รูป' }); return; }
    setPreparing(true);
    setError(null);
    try {
      const prepared = await Promise.all(selected.map(prepareImage));
      const next = [...files, ...prepared];
      const issue = checkImageFiles(next);
      if (issue) throw new Error(issue);
      setFiles(next);
    } catch (err) { setError({ field: 'images', message: err.message }); }
    finally { setPreparing(false); }
  }

  function validate() {
    const title = form.title.trim();
    if (Array.from(title).length < 3 || Array.from(title).length > 255) return { field: 'title', message: 'ชื่อสินค้าต้องยาว 3–255 ตัวอักษร' };
    if (!categories.some((item) => item.category_id === form.category_id)) return { field: 'category_id', message: 'กรุณาเลือกหมวดหมู่' };
    if (!Object.hasOwn(conditions, form.item_condition)) return { field: 'item_condition', message: 'กรุณาเลือกสภาพสินค้า' };
    const price = form.is_free ? '0' : form.price.trim();
    if (!/^\d+(\.\d{1,2})?$/.test(price) || Number(price) > 999999.99) return { field: 'price', message: 'ราคาต้องอยู่ระหว่าง 0–999999.99 บาท และทศนิยมไม่เกิน 2 ตำแหน่ง' };
    if (!locations.includes(form.pickup_location)) return { field: 'pickup_location', message: 'กรุณาเลือกสถานที่นัดรับ' };
    if (Array.from(form.description.trim()).length > 2000) return { field: 'description', message: 'รายละเอียดต้องไม่เกิน 2,000 ตัวอักษร' };
    if (mode === 'create') {
      const issue = checkImageFiles(files);
      if (issue) return { field: 'images', message: issue };
    }
    return null;
  }

  async function submit(event) {
    event.preventDefault();
    const issue = validate();
    if (issue) { setError(issue); return; }
    if (USE_MOCK_API) { setError({ message: 'โหมดข้อมูลจำลองยังไม่บันทึกประกาศ กรุณาเชื่อมต่อ API จริง' }); return; }
    setSaving(true);
    setError(null);
    setSuccess('');
    const fields = { title: form.title.trim(), category_id: form.category_id,
      item_condition: form.item_condition, price: form.is_free ? 0 : Number(form.price),
      pickup_location: form.pickup_location, description: form.description.trim() || null };
    try {
      if (mode === 'create') {
        const body = new FormData();
        for (const [key, value] of Object.entries(fields)) if (value !== null) body.append(key, String(value));
        for (const file of files) body.append('images', file);
        await createProduct(body);
        setSuccess('ลงประกาศสำเร็จ');
      } else {
        await updateProduct(productId, fields);
        setSuccess('แก้ไขประกาศสำเร็จ');
      }
    } catch (err) { setError(err); }
    finally { setSaving(false); }
  }

  if (status === 'loading' || status === 'guest') return <p className={styles.notice}>กำลังตรวจสอบการเข้าสู่ระบบ…</p>;
  if (loading) return <p className={styles.notice}>กำลังโหลดข้อมูลฟอร์ม…</p>;
  if (loadError) return <p className={styles.notice} role="alert">{loadError}</p>;

  return <div className={styles.page}>
    {success && <div className={styles.toast} role="status">{success} <Link href={routes.home}>กลับหน้าแรก</Link></div>}
    <form onSubmit={submit} noValidate>
      <div className={styles.top}>
        <section className={styles.uploadSection}>
          <h1>{mode === 'create' ? 'Product Images' : 'รูปสินค้า'}</h1>
          {mode === 'create' ? <>
            <label className={styles.upload}><input type="file" accept="image/jpeg,image/png" multiple
              onChange={addImages} disabled={preparing || saving || files.length >= 5} />
              <ImageIcon size={70} /><strong>+ Upload Product Images</strong>
              <span>{preparing ? 'กำลังเตรียมรูป…' : 'คลิกเพื่อเลือกรูป JPEG หรือ PNG'}<br />1–5 รูป · รูปแรกเป็นรูปหลัก · รวมไม่เกิน 4MB</span>
            </label>
            <div className={styles.thumbnails}>{previews.map((url, index) => <div className={styles.thumb} key={url}>
              <img src={url} alt={`ตัวอย่างรูปที่ ${index + 1}`} />
              {index === 0 && <b>รูปหลัก</b>}
              <button type="button" aria-label={`ลบรูปที่ ${index + 1}`} onClick={() => setFiles((current) => current.filter((_, i) => i !== index))}>×</button>
            </div>)}</div>
            {error?.field === 'images' && <small className={styles.error} role="alert">{error.message}</small>}
          </> : <><div className={styles.thumbnails}>{existingImages.map((image) => <div className={styles.thumb} key={image.image_id}>
            <img src={image.image_url} alt="รูปสินค้า" />{image.is_primary && <b>รูปหลัก</b>}
          </div>)}</div><p className={styles.hint}>รูปภาพแก้ไขไม่ได้ หากต้องการเปลี่ยนรูป ให้ลงประกาศใหม่</p></>}
        </section>

        <section className={styles.info}>
          <h2>Product Information</h2>
          <Field label="ชื่อสินค้า" name="title" value={form.title} onChange={change} error={error} maxLength={255} placeholder="Enter product name..." required />
          <Select label="หมวดหมู่สินค้า" name="category_id" value={form.category_id} onChange={change} error={error} required>
            <option value="">เลือกหมวดหมู่</option>{categories.map((item) => <option key={item.category_id} value={item.category_id}>{item.name}</option>)}
          </Select>
          <Select label="สภาพสินค้า" name="item_condition" value={form.item_condition} onChange={change} error={error} required>
            <option value="">เลือกสภาพสินค้า</option>{Object.entries(conditions).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </Select>
          <Field label="ราคา (บาท)" name="price" type="number" min="0" max="999999.99" step="0.01"
            value={form.is_free ? '0' : form.price} onChange={change} error={error} disabled={form.is_free} required />
          <label className={styles.free}><input type="checkbox" checked={form.is_free}
            onChange={(event) => setForm((current) => ({ ...current, is_free: event.target.checked }))} /> แจกฟรี</label>
        </section>
      </div>

      <label className={styles.longField}><span>รายละเอียดสินค้า</span><textarea value={form.description}
        onChange={(e) => change('description', e.target.value)} maxLength={2000} placeholder="Describe your item..." />
        <small>{Array.from(form.description).length}/2,000</small>
        {error?.field === 'description' && <small className={styles.error}>{error.message}</small>}</label>
      <Select label="สถานที่นัดรับ" name="pickup_location" value={form.pickup_location} onChange={change} error={error} required>
        <option value="">เลือกสถานที่นัดรับ</option>{locations.map((location) => <option key={location} value={location}>{location}</option>)}
      </Select>
      {error && !error.field && <p className={styles.error} role="alert">{error.message}</p>}
      <div className={styles.actions}><button type="button" className="btn btn--outline" onClick={() => router.back()}>ยกเลิก</button>
        <button type="submit" className="btn btn--primary" disabled={saving || preparing || Boolean(success)}>
          {saving ? 'กำลังบันทึก/อัปโหลด…' : mode === 'create' ? 'ลงประกาศ' : 'บันทึกการแก้ไข'}
        </button></div>
    </form>
  </div>;
}

function Field({ label, name, value, onChange, error, ...props }) {
  return <label className={styles.field}><span>{label}</span><input name={name} value={value}
    onChange={(event) => onChange(name, event.target.value)} {...props} />
    {error?.field === name && <small className={styles.error} role="alert">{error.message}</small>}</label>;
}

function Select({ label, name, value, onChange, error, children, ...props }) {
  return <label className={styles.field}><span>{label}</span><select name={name} value={value}
    onChange={(event) => onChange(name, event.target.value)} {...props}>{children}</select>
    {error?.field === name && <small className={styles.error} role="alert">{error.message}</small>}</label>;
}
