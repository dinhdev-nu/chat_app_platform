# Hướng dẫn chi tiết Style Giao diện Trang Chat (Chat Style Guide - Phân tích chuyên sâu)

Tài liệu này mô tả cặn kẽ và chi tiết nhất về hệ thống thiết kế (Design System), bố cục (Layouts), các hiệu ứng tương tác (Interactions & Animations), và các quy chuẩn styling được áp dụng cho toàn bộ giao diện của trang Chat. Giao diện được xây dựng chủ yếu bằng **CSS Variables** kết hợp chặt chẽ với **Tailwind CSS**.

---

## 1. Kiến trúc Giao diện & Bố cục (Layout Architecture)

### 1.1. Root & Main Container (`ChatPageClient.tsx`)
- **Root Element**: Sử dụng Flexbox để dàn trang toàn màn hình (`h-svh`), thiết lập `flex-col`, áp dụng font mặc định (`font-[var(--font-sans-theme)]`) và màu nền toàn cục (`bg-[rgb(var(--backgroundColor-primary))]`).
- **Main Area**: `flex-1 overflow-y-auto` đóng vai trò là container cho Header, Sidebar và Prompt Input.
- **Center Layout**: Container chính bọc Sidebar và Input có class `md:overflow-hidden`, đảm bảo nội dung cuộn bên trong thay vì cuộn cả trang trên Desktop.
- **Toast Container**: Vùng hiển thị thông báo được fix ở góc (`fixed inset-4 z-[9999] pointer-events-none md:!top-8 md:!left-9 md:!bottom-20 md:!right-20`).

### 1.2. Responsive Strategy (Mobile-First)
- **Mobile**: Giao diện tập trung vào Prompt Input. Sidebar dự án được giấu trong một Panel dạng Bottom Sheet (rút lên từ dưới).
- **Desktop (`md:` breakpoint)**: Kích hoạt bố cục 2 cột. Sidebar hiển thị ở dạng panel bên trái với chiều rộng cố định `w-[375px]`, Prompt Input căn giữa màn hình.

---

## 2. Hệ thống CSS Variables & Inline Tokens
Thay vì định nghĩa class trong CSS tĩnh, project sử dụng Tailwind JIT kết hợp trực tiếp với CSS Variables để tận dụng tối đa sức mạnh của Theme (như Dark Mode).

- **Colors & Backgrounds**:
  - `bg-[rgb(var(--backgroundColor-primary))]`: Nền trang chủ đạo.
  - `bg-[rgb(var(--backgroundColor-surface-container)/.5)]`: Nền cho các Panel lớn (như Sidebar, Prompt Box, Menu Dropdown), thường kết hợp alpha `/.5` để tạo độ trong suốt.
  - `bg-[rgb(var(--backgroundColor-state-hover))]`: Màu nền khi hover vào mọi nút tương tác.
  - `bg-[rgb(var(--backgroundColor-wash))]`: Dùng cho các banner thông báo nhỏ.
- **Typography & Text Colors**:
  - `text-[rgb(var(--textColor-primary))]`: Màu chữ chính.
  - `text-[rgb(var(--textColor-secondary))]`: Màu chữ phụ (cho mô tả, ngày tháng, placeholder).
  - `text-[rgb(var(--textColor-disabled)/.5)]`: Màu cho các nút bị khóa (disabled).
- **Borders**:
  - `border-[rgb(var(--borderColor-secondary)/.15)]`: Màu viền bán trong suốt, tạo cảm giác tinh tế, viền mờ cho các thành phần kính.

---

## 3. UI Components & Vi phẫu Style

### 3.1. Hiệu ứng Nền (Background Dot Pattern)
- Tích hợp 2 lớp layer chấm bi (Dot pattern) chồng lên nhau:
  - **Base Layer**: Chấm màu xám nhạt tĩnh (`radial-gradient(circle, rgb(204, 204, 204) 0.5px...`).
  - **Spotlight Layer (Tương tác chuột)**: Chấm màu đen tối hiển thị mượt mà dựa trên vị trí trỏ chuột nhờ thuộc tính `mask-image` (chuột đi tới đâu, vùng chấm đen hiện ra tới đó như hiệu ứng đèn pin).

### 3.2. Chat Header (`ChatHeader.tsx`)
- **Đặc tính**: `sticky top-0 z-30 h-14`.
- **Nút tương tác (Icon Buttons)**: Đồng nhất kích thước và padding (`p-2 rounded-full`), hiệu ứng hover chuyển màu nền (`transition-colors hover:bg-[rgb(var(--backgroundColor-state-hover))]`).
- **User Avatar**: Bao bọc bởi `rounded-full focus-ring` để hỗ trợ Accessibility.

### 3.3. Prompt Input Box (`PromptInput.tsx`)
- **Banner thông báo**: Bo góc `rounded-md`, căn giữa linh hoạt, text `text-xs md:text-sm`.
- **Suggestion Pills (Gợi ý lệnh)**: 
  - Khung cuộn ngang: `flex flex-nowrap overflow-x-auto hide-scrollbar cursor-grab`.
  - Hiệu ứng mờ cạnh (Fade edges): Sử dụng `mask-image: linear-gradient` để hai đầu danh sách gợi ý mờ dần đi, báo hiệu cho user biết có thể cuộn ngang.
  - Style cục bộ: Có đổ bóng nhẹ `shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]`.
- **Hộp Chat (Chat Box)**:
  - Vỏ ngoài: `rounded-3xl min-h-[220px] bg-[rgb(var(--backgroundColor-surface-container)/.5)] backdrop-blur-[40px]`.
  - **Tiptap Editor**: Input nhập chữ, loại bỏ outline, ẩn thanh cuộn (`hide-scrollbar`).
- **Segmented Control (Toggle Mobile/Web & Mine/Shared)**:
  - Bao ngoài: `p-0.5 rounded-[32px]`.
  - Button bên trong: Trạng thái active sử dụng `absolute inset-0 z-0 bg-[rgb(var(--backgroundColor-state-active))]` nằm dưới text để tạo điểm nhấn highlight (indicator).
- **Bottom Toolbar**: 
  - Nút thêm file (`PlusIcon`), Model Selector (`3 Flash` dropdown) được canh chỉnh tinh tế với các nút hành động (Submit).

### 3.4. Cột dự án bên trái (Project Sidebar & Items)
- **Container**: `hidden md:flex flex-col rounded-2xl p-3 border border-[rgb(var(--borderColor-secondary)/.15)]`.
- **Thanh tìm kiếm (Search Box)**:
  - Áp dụng `sticky top-0 z-10`.
  - Style: `rounded-full bg-[rgb(var(--backgroundColor-state-enabled)/.575)] backdrop-blur-[12px]`.
- **Project Item (`ProjectItem.tsx`)**:
  - Trạng thái hover có hiệu ứng thu nhỏ rất nhẹ (`scale-[0.985]`) kết hợp đổi màu nền.
  - Ảnh Thumbnail: Sử dụng `image-set` kết hợp CSS inlined `backgroundColor`, có đổ bóng (`shadow-[...]`) khi có hình thực tế.
  - Text Truncation: Sử dụng tiện ích Tailwind `line-clamp-2` (cho tên dự án) và `line-clamp-1` (cho mô tả thời gian) để tránh vỡ giao diện khi nội dung dài.

### 3.5. Dark Mode Toggle & Theming (`DisplayToggle.tsx`)
- Nút Toggle sử dụng cố định (`fixed bottom-4 right-4 z-40`).
- Trình đơn (Dropdown) thả lên: Dùng `absolute bottom-full right-0 mb-2 rounded-xl p-1.5 shadow-lg animate-slide-up origin-bottom-right`.
- **Theming Logic**:
  - Tích hợp thay đổi màu nền thông qua thao tác gắn/tháo class `.dark` trên thẻ `<html>` (`document.documentElement`).
  - Giao diện Dark theme được quy định bởi khối `.dark` trong `chat.css` đè lên giá trị mặc định của `--colors-*` và `--backgroundColor-*`.

---

## 4. Các Hiệu Ứng Phức Tạp (Advanced Effects & Animations)

1. **Glassmorphism (Kính mờ toàn phần)**:
   - Thay vì dùng nền đặc cứng, phần lớn các Box, Sidebar, Prompt Input, và Header đều áp dụng class `backdrop-blur-[40px]` (blur cực mạnh 40px) hoặc `backdrop-blur-[12px]`. Điều này giúp nền web (Dot Pattern) ẩn hiện qua khung chữ cực kỳ sang trọng.
2. **Animations**:
   - Khai báo Keyframes trong CSS (`chat.css`):
     - `@keyframes chat-slide-up`: `transform: translateY(var(--slide-up-amount, 8px)); opacity: 0` -> `translateY(0); opacity: 1`. (Dùng class `.animate-slide-up`).
     - `@keyframes chat-fade-in`: Thay đổi Opacity mượt mà. (Dùng class `.animate-fade-in`).
3. **Accessibility (Trải nghiệm sử dụng phím/chuột)**:
   - Các element tương tác luôn được gắn `tabIndex={0}`.
   - Vòng lặp Focus: `focus-ring:focus-visible` thêm outline ảo bên ngoài để người dùng không dùng chuột (hoặc dùng Tab) dễ nhận diện.

---

## Tổng kết
Giao diện chat được thiết kế theo trường phái cực kỳ tối giản (Minimalism) nhưng lại đầu tư cực sâu vào vi tương tác (Micro-interactions) như Glassmorphism, Fade-masking cho vùng cuộn, Spotlight chuột và các điểm chạm mềm (bo góc sâu `rounded-3xl`, `rounded-full`). Cách dùng inline token `rgb(var(...))` đan xen với cấu trúc class tiện ích của Tailwind CSS tạo ra một cấu trúc linh hoạt cao nhưng vẫn giữ được tốc độ render siêu mượt.
