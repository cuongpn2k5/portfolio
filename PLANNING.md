# KẾ HOẠCH TRIỂN KHAI PORTFOLIO — PHAN NHAT CUONG

Ngày lập: 08/10/2026
Trạng thái: Đặc tả và kế hoạch; chưa triển khai ứng dụng.

## 1. Mục tiêu và phạm vi

Xây dựng portfolio React có giao diện tối tinh giản, nội dung dễ cập nhật, thẻ ID 3D có tương tác vật lý và PullCord đổi Dark/Light Mode. Người xem cần nhanh chóng hiểu danh tính, định hướng phát triển, công nghệ, dự án và cách liên hệ.

Thông tin đã xác nhận:
- Tên: Phan Nhat Cuong.
- Vai trò giới thiệu: Full-stack Developer.
- Học vấn: Software Engineering Student.
- Stack bắt buộc: React, Vite, TypeScript, Tailwind CSS, GSAP + ScrollTrigger, Three.js, React Three Fiber.
- Dùng package React pullcord cho dây đổi theme; không thay bằng dây trang trí.
- Nội dung lưu trong file TypeScript; không cần backend, database, authentication, admin hay CMS.

Không tự tạo trường đại học, lịch sử làm việc, thành tích, chứng chỉ, email hoặc social URL. Ba dự án mẫu phải được ghi rõ là Placeholder.

Repo tại thời điểm kiểm tra chỉ có README.md và .git. Chưa tìm thấy tài liệu tham chiếu “Tài liệu không có tiêu đề.docx” trong thư mục đính kèm đã kiểm tra. Các quy định thiết kế dưới đây là đề xuất triển khai từ mô tả; cần đối chiếu ảnh reference trước khi chốt hình thức cuối cùng.

## 2. Thứ tự ưu tiên

P0: Website chạy, nội dung chính, routing, responsive, accessibility, theme nhất quán, PullCord thật, thẻ ID thật, build thành công.
P1: Animation tinh tế, hiệu năng, SEO, tài liệu cập nhật nội dung, đối chiếu visual reference.
P2: Điều chỉnh texture, ánh sáng và micro-interaction sau khi các luồng chính ổn định.

Không mở rộng sang blog, CMS, contact form có backend hoặc dashboard nếu chưa có yêu cầu. Deployment chỉ bổ sung khi xác định hosting.

## 3. Kiến trúc thông tin và routing

Trang chính gồm: Intro → Home → About → Portfolio Showcase → Services → Contact → Footer.

Routes:
- /: trang chính.
- /#about, /#portfolio, /#services, /#contact: liên kết trực tiếp đến section.
- /projects/:slug: trang chi tiết dự án.
- URL không tồn tại: trang Not Found có đường về Home.

Navbar: Home | About | Portfolio | Services | Contact.
Khi vào chi tiết dự án, navbar phải dẫn về section thuộc trang chính. Back to Portfolio khôi phục vị trí phù hợp; tải trực tiếp trang chi tiết không phụ thuộc lịch sử điều hướng. Hosting cần rewrite SPA cho deep link.

## 4. Quy định UX theo khu vực

### 4.1. Intro
- Nền toàn màn hình, câu “Welcome to my Portfolio Website”.
- Reveal chữ bằng opacity và blur nhẹ; tổng thời gian mục tiêu 1.5–2.5 giây.
- Có Skip Intro ngay từ đầu; không khóa truy cập nội dung quá lâu.
- Chỉ phát đầy đủ một lần trong phiên bằng sessionStorage; đổi route không phát lại.
- Reduced motion: bỏ reveal dài và vào nội dung nhanh.
- Không để overlay đã ẩn tiếp tục bắt pointer hoặc focus.

### 4.2. Home
- Desktop: nội dung bên trái, ID card bên phải; mobile xếp dọc.
- Heading: “Full-stack Developer.”
- Giới thiệu đúng thông tin được cung cấp; CTA About Me và View Projects.
- Thẻ có portrait placeholder dễ thay; không sử dụng ảnh người khác.
- Có hướng dẫn ngắn về kéo thẻ, không phụ thuộc hover để hiểu tương tác.
- Không để Intro hoặc tài nguyên 3D chặn render phần giới thiệu.

### 4.3. About
- Tên, portrait, bio, học vấn, định hướng và các personal cards có dữ liệu thật.
- CV chưa được cung cấp: nút thể hiện “CV chưa được cập nhật”, không tạo download hỏng.
- View Projects dẫn đến Portfolio.

### 4.4. Portfolio Showcase
- Ba tab Projects, Certificates, Tech Stack; không reload trang khi chuyển.
- Tab có tablist/tab/tabpanel, aria-selected và điều khiển bằng phím mũi tên, Home, End.
- Projects render từ dữ liệu; 3 slot mẫu ghi rõ Placeholder ở card và trang chi tiết.
- GitHub/Live Demo chỉ hiển thị khi URL hợp lệ được cung cấp.
- Certificates mặc định rỗng, có empty state rõ; không tạo chứng chỉ mẫu như thành tích thật.
- Tech Stack phân nhóm Frontend, Backend, Database, Tools; thể hiện đang học/đang dùng khi có dữ liệu, không dùng phần trăm trình độ tùy ý.
- Card có CTA độc lập; tránh lồng các liên kết trong một card link toàn phần.

### 4.5. Project Details
- Header, overview, cover/gallery, công nghệ, vai trò, features, challenges và solutions nếu có.
- Trường thiếu hoặc gallery rỗng không gây khoảng trống lớn hoặc lỗi render.
- Slug không hợp lệ có trạng thái Not Found.
- Chuyển route đưa focus đến heading chính và quản lý scroll rõ ràng.

### 4.6. Services
- Full-stack Web Development; Backend & REST API Development; Mobile Application Development; UI Implementation.
- Trình bày như định hướng và khả năng phát triển, không tự nhận kinh nghiệm agency.
- Danh sách dọc, divider mảnh; nếu mở rộng nội dung dùng button với aria-expanded.

### 4.7. Contact và Footer
- Heading “Let's Connect.” và lời mời kết nối theo brief.
- Contact giữ nền burgundy trong cả hai theme.
- Chỉ render liên kết có dữ liệu hợp lệ; thiếu tất cả thì có thông báo nội dung đang cập nhật.
- External URL dùng protocol được cho phép; mở tab mới có rel phù hợp.
- Footer tối giản, năm có thể lấy động, không thêm số liệu giả.

## 5. Quy định UI

### 5.1. Phong cách
- Near-black, typography mạnh, bố cục thoáng, đường viền tinh tế.
- Grid và texture nhẹ, không làm giảm khả năng đọc.
- Không dùng gradient sáng nổi bật, glassmorphism dày hoặc bố cục SaaS chung chung.
- Duy trì một hệ spacing, radius, icon và button cho tất cả route.

### 5.2. Layout và responsive
- Container tối đa đề xuất: 1280px; căn giữa.
- Gutter: 20px ở mobile, 32px ở tablet, 48–64px ở desktop.
- Section padding theo chiều dọc: 64px mobile, 88px tablet, 112px desktop.
- Navbar cao dự kiến 72px desktop, 64px mobile; dùng scroll-margin-top để heading không bị che.
- Projects: 1 cột mobile, 2 cột tablet, 3 cột desktop khi đủ không gian.
- Tech grid tự co theo minmax; nhãn không bị cắt.
- Kiểm tra 375, 768, 1024, 1440px và các độ rộng ở giữa; không tràn ngang.
- PullCord có vùng riêng gần mép phải; mobile menu, logo và nút theme không chồng vùng kéo.

### 5.3. Typography
- Dùng một họ sans hiện đại; chốt font sau khi đọc reference, ưu tiên font local có giấy phép phù hợp và hỗ trợ tiếng Việt.
- Body: 16–18px, line-height 1.6.
- Hero heading: clamp từ khoảng 48px mobile đến 96px desktop; line-height 1.0–1.1.
- Section heading: 32–56px, line-height 1.15.
- Card heading: 20–24px; metadata: 14px.
- Không dùng chữ quá nhỏ cho nội dung quan trọng; kiểm tra khi zoom 200%.

### 5.4. Spacing, radius và controls
- Thang spacing: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128px.
- Radius: button 12px, card 20px, panel 24px; pill chỉ cho tag/badge phù hợp.
- Border mặc định 1px.
- Icon đồng bộ kích thước 18–24px, stroke nhất quán.
- Vùng bấm mục tiêu tối thiểu 44×44px; icon vẫn có accessible name.
- Focus-visible rõ bằng outline 2px, offset 3px; không chỉ dựa vào đổi màu nhẹ.
- Button primary, secondary, disabled phải phân biệt được trong cả hai theme.

## 6. Quy định màu sắc và theme

Tất cả màu giao diện dùng CSS variables; không rải màu cố định trong JSX. Bảng dưới là palette đề xuất, cần kiểm tra contrast trên giao diện thật trước nghiệm thu.

| Token CSS | Dark | Light | Sử dụng |
| --- | --- | --- | --- |
| --color-bg | #090909 | #F7F5F2 | Nền chính |
| --color-surface | #141414 | #FFFFFF | Card, navbar đặc |
| --color-surface-raised | #1D1D1D | #EFEBE6 | Panel nổi, hover surface |
| --color-text | #F5F5F5 | #202020 | Heading, body chính |
| --color-text-muted | #B0B0B0 | #5E5954 | Mô tả, metadata |
| --color-border | #303030 | #D8D2CB | Divider, card trang trí |
| --color-control-border | #777777 | #82786E | Viền control cần nhận diện |
| --color-accent | #DCA3AE | #7C2D40 | Link và accent tiết chế |
| --color-focus | #F0B6C2 | #8A2944 | Focus ring |
| --color-button-bg | #F5F5F5 | #202020 | Primary button |
| --color-button-text | #161616 | #FFFFFF | Chữ primary button |
| --color-contact-bg | #300F19 | #4A1625 | Nền Contact |
| --color-contact-text | #FFF4F6 | #FFF4F6 | Chữ Contact |
| --color-contact-muted | #D8B9C1 | #E2C6CE | Mô tả Contact |
| --color-contact-border | #785360 | #926575 | Divider Contact |

Các token bổ sung: --color-nav-bg, --color-grid, --color-shadow, --pullcord-ink. Định nghĩa theo từng theme và kiểm tra trên nền thực tế.

Quy tắc:
- Text thông thường đạt WCAG AA 4.5:1; text lớn tối thiểu 3:1.
- Control và focus cần contrast phù hợp; border trang trí không dùng làm tín hiệu duy nhất.
- Accent chỉ dùng cho link, focus, trạng thái hoặc điểm nhấn nhỏ.
- Contact có bộ token riêng; không áp màu chữ tối của Light Mode lên nền burgundy.
- Ảnh project không đảo màu tự động bằng filter.
- Canvas ID card cần kiểm tra light/background/material ở cả hai mode.
- Không dùng màu để truyền đạt trạng thái một mình; bổ sung chữ/icon.

Theme mechanics:
- ThemeProvider sở hữu trạng thái dark | light; dark là mặc định khi chưa lưu lựa chọn.
- Gắn data-theme lên documentElement; component đọc trạng thái qua useTheme.
- Lưu key portfolio-theme trong localStorage, chỉ chấp nhận dark/light.
- Đọc theme trước paint trong entry HTML để tránh nháy sai theme; storage lỗi thì fallback dark.
- Có thể đồng bộ tab qua storage event; listener phải cleanup.
- Crossfade bằng transition màu và nền 250–350ms; không dùng transition: all.
- Reduced motion tắt hoặc rút ngắn transition.

## 7. PullCord đổi theme

Nguồn chính: https://feralui.dev/pullcord
Tài liệu package đã đọc: https://github.com/mortspace/pullcord
Cài đặt theo tài liệu: npm install pullcord.
Import component PullCord từ pullcord và stylesheet pullcord/pullcord.css.

API theo README: onPull, pulled, ariaLabel, noEntrance, config, className. onPull kích hoạt khi kéo vượt ngưỡng detent trong lúc kéo, không chờ thả. pulled được phản ánh vào aria-pressed; có click và Enter. Physics dùng Verlet, vòng requestAnimationFrame nghỉ khi dây ổn định theo tài liệu. Khi triển khai phải kiểm tra bản package thực tế, source, peer dependencies và cleanup; không mặc định mọi hành vi đã được kiểm thử.

Kiến trúc:
- ThemePullCord là wrapper nối onPull với toggleTheme.
- pulled đồng bộ với Light Mode theo ví dụ của package.
- ThemeToggle là nút thay thế có accessible label và trạng thái đồng bộ.
- Position qua --pullcord-top, --pullcord-right, --pullcord-z và --pullcord-ink.
- Mount ở layout toàn cục để không reset khi chuyển route.
- Không dùng GSAP điều khiển trực tiếp các node vật lý do package sở hữu.

Hành vi nghiệm thu:
- Có thể nắm, kéo xuống, thả và nhìn dây dao động/ổn định.
- Kéo chưa qua ngưỡng không đổi theme; qua ngưỡng đổi đúng trạng thái.
- Kiểm tra một lượt kéo không gây toggle liên tục ngoài ý muốn.
- Nút bàn phím đổi cùng state; reload giữ lựa chọn.
- Responsive không che navbar, menu hoặc nội dung quan trọng.
- Touch interaction không khóa cuộn ngoài vùng thao tác cần thiết.
- Reduced motion vẫn cho phép đổi theme bằng control phù hợp.

## 8. Thẻ ID 3D và sự độc lập với PullCord

Dùng React Three Fiber với Rapier khi thích hợp; Drei chỉ dùng khi có lợi. Có điểm neo, dây/khớp nối, rigid body thẻ, ánh sáng và portrait texture.

Yêu cầu:
- Dây luôn nối với thẻ, giới hạn kéo hợp lý, dao động tự nhiên sau khi thả.
- Pointer capture và touch handling thuộc vùng thẻ; không bắt pointer toàn trang.
- PullCord và thẻ có vùng tương tác, z-index và vòng vật lý riêng.
- Không dùng một simulation chung hoặc thay ID card bằng PullCord.
- WebGL lỗi/không hỗ trợ/reduced motion: fallback thẻ tĩnh đồng nhất thiết kế.
- Lazy-load phần 3D; điều chỉnh DPR; tạm dừng cập nhật khi không cần hoặc tab bị ẩn.
- Cleanup listeners, observers, resources và animation khi unmount.

Thử nghiệm kỹ thuật thẻ sớm trước khi chốt toàn bộ Hero để xác nhận bố cục và hiệu năng.

## 9. Animation

GSAP + ScrollTrigger phụ trách Intro, section reveal, stagger, tabs và chuyển trang. Không thêm thư viện animation trùng vai trò nếu chưa có lý do.

Nhịp đề xuất:
- Hover/focus: 150–220ms.
- Tabs/theme: 250–350ms.
- Section reveal: 450–650ms; stagger 50–80ms.
- Card hover nâng tối đa khoảng 4px; ảnh zoom tối đa khoảng 1.03.

Ưu tiên transform và opacity. Tránh parallax liên tục toàn trang, blur lớn và scroll hijacking. Reveal không để nội dung biến mất vĩnh viễn khi animation lỗi. Dùng GSAP context/matchMedia và revert khi cleanup. Tôn trọng reduced motion cho cả smooth scroll và canvas.

## 10. Kiến trúc mã nguồn và dữ liệu

src/
  assets/images/, assets/models/
  components/layout/, common/, animations/, three/, portfolio/
  sections/Intro/, Home/, About/, Portfolio/, Services/, Contact/
  pages/ProjectDetail/, NotFound/
  providers/ThemeProvider.tsx
  hooks/useTheme.ts, useReducedMotion.ts
  data/profile.ts, projects.ts, certificates.ts, techStack.ts, services.ts, socialLinks.ts
  types/
  styles/themes.css, globals.css
  App.tsx, main.tsx
public/images/, public/documents/

Project type có: id, slug, title, description, coverImage, gallery, role, category, technologies, features, challenges, solutions, githubUrl, demoUrl, status. Xác định rõ trường bắt buộc/tùy chọn; slug duy nhất. Dữ liệu không hardcode trong JSX.

CONTENT_GUIDE.md cần hướng dẫn thêm/xóa project, certificate, cập nhật bio/tech/services/social, thay portrait, đưa CV vào public/documents và đổi path; có ví dụ và quy ước asset.

## 11. Giai đoạn triển khai và đầu ra

### Giai đoạn 1 — Kiểm tra và chốt đặc tả
- Kiểm tra repo, hướng dẫn AGENTS.md nếu có, asset và DOCX.
- Đối chiếu từng section, chốt font/layout, kiểm tra API package và compatibility.
- Đầu ra: danh sách yêu cầu, asset còn thiếu, design tokens và quyết định kỹ thuật.

### Giai đoạn 2 — Nền tảng và dữ liệu
- Setup React/Vite/TypeScript/Tailwind, routing, scripts và lockfile.
- Tạo theme tokens, ThemeProvider, xử lý theme trước paint.
- Tạo typed data, layout, navbar và responsive foundations.
- Đầu ra: app chạy với Dark/Light, cấu trúc dữ liệu và routes.

### Giai đoạn 3 — Mẫu UI và tương tác trọng tâm
- Hoàn thiện Navbar, Hero và Project Card mẫu để xác lập visual system.
- Tích hợp pullcord thật và thử nghiệm thẻ ID 3D.
- Kiểm tra vùng kéo riêng, mobile scrolling và fallback.
- Đầu ra: hướng UI rõ, hai tương tác khả thi và không xung đột.

### Giai đoạn 4 — UI đầy đủ
- Intro, About, Portfolio/tabs, Project Details, Services, Contact, Footer.
- Hoàn thiện empty/disabled/missing-data/Not Found states.
- Đầu ra: mọi hành trình hoạt động với dữ liệu hiện có.

### Giai đoạn 5 — Animation và tinh chỉnh
- GSAP, scroll reveals, tab/page transitions, theme crossfade.
- Tinh chỉnh physics, responsive, reduced motion và cleanup.
- Đối chiếu visual reference; kiểm tra cả Dark/Light.
- Đầu ra: giao diện và tương tác đồng nhất.

### Giai đoạn 6 — Kiểm thử và tối ưu
- Typecheck, lint, production build; chạy dev và production preview.
- Kiểm tra routing/deep link, keyboard, touch, fallback, empty data và assets.
- Tối ưu ảnh, code splitting, canvas và SEO metadata.
- Sửa lỗi được phát hiện, ghi nhận giới hạn còn lại.
- Đầu ra: checklist nghiệm thu có kết quả thực tế.

### Giai đoạn 7 — Bàn giao
- README, CONTENT_GUIDE.md, lệnh chạy/build/preview, biến cấu hình.
- Danh sách file thay đổi, tính năng hoàn thành và hạn chế.
- Đầu ra: người dùng tự chạy và cập nhật nội dung được.

Không đặt thời hạn cố định trước khi có reference và thử nghiệm vật lý; ước lượng lại sau giai đoạn 3.

## 12. Ma trận kiểm thử

| Nhóm | Kiểm tra | Điều kiện đạt |
| --- | --- | --- |
| Build | TypeScript, lint, production build | Thành công, không lỗi import |
| Routing | Anchor, detail, deep link, unknown slug, Back | Nội dung và vị trí đúng |
| Intro | Skip, lần đầu, đổi route, reduced motion | Không chặn nội dung/focus |
| Tabs | Click, arrow keys, Home/End, focus | Trạng thái và panel đúng |
| Theme | Mặc định, lưu lựa chọn, reload, storage lỗi | Đồng bộ toàn website |
| PullCord | Dưới/vượt ngưỡng, giữ, thả, touch, keyboard | Physics thật và toggle đúng |
| ID card | Kéo/thả, giới hạn, dây nối, fallback | Tự nhiên và ổn định |
| Hai tương tác | Kéo từng đối tượng, menu mobile | Không bắt nhầm pointer |
| Responsive | 375/768/1024/1440 và giữa mốc | Không tràn hoặc che nội dung |
| Dữ liệu | Rỗng, thiếu URL/CV/gallery, placeholder | Không giả thông tin hoặc link hỏng |
| Accessibility | Contrast, focus, menu Escape, zoom, motion | Luồng chính dùng được bằng keyboard |
| Runtime | Console, unmount/remount, StrictMode | Không lỗi nghiêm trọng hoặc leak rõ |
| Hiệu năng | Idle physics, ảnh, network, scroll mobile | Không render/network dư thừa |

Tự động hóa các luồng routing, theme và tabs có giá trị; kiểm tra vật lý và visual trực tiếp trên trình duyệt, tốt nhất có thiết bị cảm ứng thật. Không ghi “đã đạt” khi chưa chạy kiểm tra.

## 13. Nội dung cần bổ sung và rủi ro

Cần bổ sung: DOCX reference, portrait, bio/học vấn được công khai, CV, email/social, dự án/chứng chỉ thật.

- Thiếu DOCX: chưa thể nghiệm thu độ giống reference; vẫn triển khai foundations.
- Thiếu nội dung: dùng placeholder/empty state có nhãn, không chặn kiến trúc.
- Physics mobile: thử sớm; có fallback và giới hạn chất lượng render.
- Package compatibility: kiểm tra bản thực tế trước cài; cố định lockfile.
- Theme thiếu đồng bộ: dùng tokens từ đầu, rà soát mọi section/route/canvas.
- Công cụ chạy lệnh đã gặp lỗi khởi tạo trong phiên lập kế hoạch; phải xác nhận môi trường thực thi trước khi tuyên bố app/build hoạt động.

## 14. Definition of Done

- App chạy local và production build thành công.
- Có đủ sections, tabs, trang chi tiết và routing đúng.
- Visual được đối chiếu reference khi tài liệu được cung cấp.
- Thẻ ID kéo/thả thật và PullCord vật lý thật đổi theme đúng ngưỡng.
- Dark mặc định, Light hoàn chỉnh, persistence và reduced motion hoạt động.
- Không có thông tin giả, link hỏng hoặc lỗi runtime/build nghiêm trọng đã biết.
- Responsive, keyboard accessibility và fallback được kiểm tra.
- Nội dung sửa qua data files, có CONTENT_GUIDE và README.
- Kết quả kiểm thử và giới hạn còn lại được báo cáo trung thực.
