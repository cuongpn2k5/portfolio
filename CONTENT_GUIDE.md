# HƯỚNG DẪN CẬP NHẬT NỘI DUNG (CONTENT GUIDE)
### Portfolio Phan Nhat Cuong

Tất cả nội dung hiển thị trên website đều được quản lý tập trung trong thư mục:
`src/data/`

Bạn **không cần can thiệp vào các component giao diện hay JSX** khi muốn thay đổi thông tin cá nhân, thêm dự án, chứng chỉ hoặc kỹ năng.

---

## 1. Cập nhật thông tin cá nhân (`src/data/profile.ts`)

Mở tệp [src/data/profile.ts](file:///d:/Dev-Workspace/my-portfolio/portfolio/src/data/profile.ts):

```typescript
export const profileData: ProfileData = {
  name: 'Phan Nhat Cuong',
  role: 'Full-stack Developer',
  subtitle: 'Software Engineering Student & Full-stack Developer...',
  bio: [
    'Đoạn văn giới thiệu 1...',
    'Đoạn văn giới thiệu 2...',
    'Đoạn văn giới thiệu 3...'
  ],
  education: {
    status: 'Software Engineering Student',
    major: 'Software Engineering',
    institution: 'Tên Trường Đại Học (Tùy chọn)', // Thêm khi có
    period: '2023 - 2027',                        // Thêm khi có
  },
  cvUrl: '', // Xem mục 2 bên dưới để thêm CV
  portraitUrl: '',
  location: 'Vietnam',
  availability: 'Open to Internship & Junior Opportunities'
};
```

---

## 2. Thêm hoặc cập nhật CV (Curriculum Vitae)

Mặc định khi `cvUrl` là chuỗi rỗng `''`, nút trên website sẽ hiển thị trạng thái an toàn:
**"CV chưa được cập nhật"** (không tạo liên kết hỏng).

### Các bước thêm CV:
1. Đặt file CV của bạn vào thư mục:
   `public/documents/phan-nhat-cuong-cv.pdf` (tạo thư mục nếu chưa có).
2. Mở [src/data/profile.ts](file:///d:/Dev-Workspace/my-portfolio/portfolio/src/data/profile.ts) và cập nhật đường dẫn:
   ```typescript
   cvUrl: '/documents/phan-nhat-cuong-cv.pdf',
   ```
3. Nút CV trên trang **About Me** sẽ tự động chuyển sang trạng thái kích hoạt **"Download CV"** và mở file khi click.

---

## 3. Thay đổi ảnh chân dung (Portrait)

1. Đặt ảnh chân dung của bạn vào:
   `public/images/portrait.jpg` hoặc `public/images/portrait.png`.
2. Mở [src/data/profile.ts](file:///d:/Dev-Workspace/my-portfolio/portfolio/src/data/profile.ts) và cập nhật:
   ```typescript
   portraitUrl: '/images/portrait.jpg',
   ```

---

## 4. Thêm hoặc sửa dự án (`src/data/projects.ts`)

Mỗi dự án trong danh sách [src/data/projects.ts](file:///d:/Dev-Workspace/my-portfolio/portfolio/src/data/projects.ts) tuân theo cấu trúc kiểu `ProjectData`:

```typescript
{
  id: 'ten-du-an-unique-id',
  slug: 'duong-dan-slug-url', // URL sẽ là: /projects/duong-dan-slug-url
  title: 'Tên Dự Án Của Bạn',
  tagline: 'Mô tả ngắn gọn trong một câu',
  description: 'Tóm tắt dự án xuất hiện ở Project Card trong Showcase...',
  fullDescription: 'Mô tả chi tiết và sâu sắc hơn trong trang Project Detail...',
  coverImage: '/images/projects/du-an-1.png', // Tùy chọn
  gallery: [],                               // Tùy chọn
  role: 'Full-stack Developer',
  category: 'Full-stack Web',                // Ví dụ: Full-stack Web, Mobile App, Backend API
  technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
  features: [
    'Tính năng 1...',
    'Tính năng 2...',
    'Tính năng 3...'
  ],
  challenges: [
    'Thách thức kỹ thuật 1...'
  ],
  solutions: [
    'Giải pháp đã áp dụng 1...'
  ],
  githubUrl: 'https://github.com/cuongpn2k5/ten-repo', // Để trống '' nếu chưa public
  demoUrl: 'https://du-an-demo.vercel.app',            // Để trống '' nếu chưa deploy
  status: 'Completed',                                // 'Completed' | 'In Progress' | 'Placeholder'
  isPlaceholder: false                                // Đặt false khi đây là dự án thật
}
```

> **Lưu ý**:
> - Trường `githubUrl` và `demoUrl` nếu để trống `''` sẽ tự động ẩn nút liên kết bên ngoài để tránh link hỏng.
> - Đổi `isPlaceholder: false` để gỡ bỏ nhãn `PLACEHOLDER SLOT`.

---

## 5. Thêm chứng chỉ (`src/data/certificates.ts`)

Mở tệp [src/data/certificates.ts](file:///d:/Dev-Workspace/my-portfolio/portfolio/src/data/certificates.ts).

Khi chưa có chứng chỉ, tệp chứa mảng rỗng `[]` và tab Certificates sẽ hiển thị hộp thông báo **"Certificates Updating Soon"**.

Để thêm một chứng chỉ mới:
```typescript
import type { CertificateData } from '../types';

export const certificatesData: CertificateData[] = [
  {
    id: 'cert-aws-cloud-practitioner',
    title: 'AWS Certified Cloud Practitioner',
    issuer: 'Amazon Web Services',
    issueDate: '2026',
    credentialUrl: 'https://www.credly.com/your-badge-url', // Tùy chọn
    description: 'Nền tảng kiến thức dịch vụ đám mây AWS, bảo mật và kiến trúc.',
    tags: ['Cloud', 'AWS', 'Infrastructure']
  }
];
```

---

## 6. Cập nhật kỹ năng & công nghệ (`src/data/techStack.ts`)

Mở tệp [src/data/techStack.ts](file:///d:/Dev-Workspace/my-portfolio/portfolio/src/data/techStack.ts).

Mỗi kỹ năng được phân loại rõ ràng:
- `category`: `'Frontend'` | `'Backend'` | `'Database'` | `'Tools'`
- `status`: `'In Use'` (đang sử dụng thực tế) | `'Learning'` (đang học hỏi) | `'Exploring'` (đang nghiên cứu)

Ví dụ thêm một kỹ năng mới:
```typescript
{
  name: 'Redis',
  category: 'Database',
  status: 'Learning',
  description: 'In-memory caching, message broker và tối ưu hóa tốc độ truy vấn API.'
}
```

Website tự động cập nhật bộ lọc danh mục và huy hiệu trạng thái tương ứng.

---

## 7. Cập nhật dịch vụ & định hướng (`src/data/services.ts`)

Mở tệp [src/data/services.ts](file:///d:/Dev-Workspace/my-portfolio/portfolio/src/data/services.ts):
Bạn có thể sửa tiêu đề, mô tả hoặc danh sách các năng lực kỹ thuật `capabilities` cho từng hạng mục dịch vụ.

---

## 8. Cập nhật liên kết liên hệ & mạng xã hội (`src/data/socialLinks.ts`)

Mở tệp [src/data/socialLinks.ts](file:///d:/Dev-Workspace/my-portfolio/portfolio/src/data/socialLinks.ts):

```typescript
export const contactInfo: ContactInfo = {
  email: 'your-email@example.com', // Nhập email của bạn tại đây
  location: 'Vietnam',
  availability: 'Available for internship, collaboration & freelance opportunities',
  note: 'Feel free to reach out for software development discussions, collaborative projects, or engineering roles.'
};

export const socialLinksData: SocialLink[] = [
  {
    id: 'github',
    platform: 'GitHub',
    label: 'GitHub Profile',
    url: 'https://github.com/cuongpn2k5', // Điền link GitHub
    username: 'cuongpn2k5',
    icon: 'Github',
    isAvailable: true // Bật true để hiển thị nút
  },
  {
    id: 'linkedin',
    platform: 'LinkedIn',
    label: 'LinkedIn Profile',
    url: 'https://linkedin.com/in/your-profile', // Điền link LinkedIn
    username: 'your-profile',
    icon: 'Linkedin',
    isAvailable: true // Bật true để hiển thị nút
  }
];
```

Khi điền `email`, phần Contact sẽ hiển thị nút gửi mail trực tiếp và nút sao chép email tiện lợi một chạm.

---

## 9. Kiểm tra và Build lại sau khi sửa

Sau khi cập nhật nội dung, mở terminal và chạy:

```bash
# Kiểm tra không có lỗi cú pháp hoặc kiểu dữ liệu
npm run lint

# Build bản sản phẩm để đảm bảo không có lỗi
npm run build
```
Mọi thay đổi sẽ sẵn sàng để triển khai lên Vercel, Netlify hoặc máy chủ của bạn!
