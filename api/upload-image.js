import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, uid } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'الصورة مطلوبة' });
    }

    if (!uid) {
      return res.status(400).json({ error: 'معرف المستخدم مطلوب' });
    }

    const result = await cloudinary.v2.uploader.upload(image, {
      folder: 'hefno-profiles',
      public_id: uid,
      overwrite: true,
      resource_type: 'image',
      allowed_formats: ['jpg', 'png', 'webp', 'avif'],
      transformation: [{ width: 400, height: 400, crop: 'limit', quality: 'auto' }],
    });

    return res.status(200).json({ url: result.secure_url });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return res.status(500).json({ error: 'فشل رفع الصورة' });
  }
}
