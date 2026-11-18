# Danh Sách Nhóm Và Phân Công Nhiệm Vụ

## 1. Thông Tin Chung

- **Tên nhóm:** nhom07-65httt
- **Tên lớp học phần:** 65HTTT
- **Tên đề tài:** Nền tảng phát triển năng lực và đào tạo thông minh dành cho sinh viên
- **Giảng viên hướng dẫn:** Đỗ Oanh Cường

---

## 2. Danh Sách Thành Viên

| STT | Họ và Tên | Mã Sinh Viên | Lớp Sinh Hoạt | Vai Trò | Nhiệm Vụ Phân Công | Tỷ Lệ Đóng Góp (%) | Email |
| :-: | :--- | :-: | :-: | :--- | :--- | :-: | :--- |
| 1 | Trần Văn Tài | 2351160548 | 65HTTT | Nhóm trưởng | [Chờ cập nhật] | 20% | 2351160548@e.tlu.edu.vn |
| 2 | Nguyễn Việt Hoàng | 2351160522 | 65HTTT | Thành viên | [Chờ cập nhật] | 20% | 2351160522@e.tlu.edu.vn |
| 3 | Phạm Quang Huy | 2351160529 | 65HTTT | Thành viên | [Chờ cập nhật] | 20% | 2351160529@e.tlu.edu.vn |
| 4 | Triệu Thị Tuyết Mai | 2351160535 | 65HTTT | Thành viên | [Chờ cập nhật] | 20% | 2351160535@e.tlu.edu.vn |
| 5 | Nguyễn Văn Tiến | 2351160558 | 65HTTT | Thành viên | [Chờ cập nhật] | 20% | 2351160558@e.tlu.edu.vn |

---

## 3. Cấu Trúc Mã Nguồn Trong Thư Mục Nhóm

```text
nhom07-65httt/
├── danhsachnhom.md        # Tệp tin thông tin nhóm và hướng dẫn dự án
├── README.md              # Hướng dẫn tổng quan và vận hành bằng Docker
├── docs/                  # Tài liệu kiến trúc, API & hướng dẫn sử dụng
│   ├── architecture/      # Thiết kế hệ thống, DB schema, RAG workflow
│   ├── api/               # Đặc tả API REST & streaming
│   └── guides/            # Tài khoản mẫu, thuật ngữ & hướng dẫn vai trò
└── src/                   # Mã nguồn monorepo (chung cụm Docker & 1 file .env)
    ├── .env.example       # Biến môi trường mẫu dùng chung cho toàn bộ dịch vụ
    ├── compose.yaml       # Khởi chạy toàn bộ stack bằng Docker Compose
    ├── python.Dockerfile  # Dockerfile đa tầng dùng chung cho backend, ai, worker
    ├── ruff.toml          # Cấu hình lint Python dùng chung
    ├── frontend/          # Next.js 16 (App Router) + TypeScript + Tailwind + Dockerfile
    ├── backend/           # FastAPI + SQLAlchemy (Async) + Alembic + Pydantic
    ├── ai/                # FastAPI + AsyncIO RAG Workflow (RAG, Quiz, Flashcards, Essay, Tutor)
    └── worker/            # Celery + Redis (xử lý tài liệu PDF/Video/Audio/OCR)
```

---

## 4. Hướng Dẫn Cài Đặt Và Thực Thi Mã Nguồn

### 4.1. Môi trường yêu cầu
- **Hệ điều hành:** Windows 10/11 (PowerShell / WSL2), macOS hoặc Linux.
- **Nền tảng thực thi:**
  - Chạy toàn cụm bằng container: **Docker** & **Docker Compose v2+**.
- **Cơ sở dữ liệu & Hạ tầng:** **PostgreSQL 14**, **Redis 7**, **Qdrant v1.12.5**, **MinIO** (được quản lý tự động trong Docker Compose).

### 4.2. Các bước cài đặt và khởi chạy

### Chạy toàn bộ hệ thống bằng Docker Compose
1. **Di chuyển vào thư mục mã nguồn và tạo file `.env` duy nhất:**
   ```bash
   cd nhom07-65httt/src
   cp .env.example .env
   ```
   *(Cập nhật các khóa bảo mật `CHANGE_ME_*` như `DB_PASSWORD`, `MINIO_ROOT_*`, `SECRET_KEY`, `AI_KEY_ENCRYPTION_KEY`, `INTERNAL_API_KEY`; thêm Gemini API key qua Admin Key Vault sau khi triển khai).*
2. **Build và khởi chạy toàn bộ cụm dịch vụ (`db`, `redis`, `qdrant`, `minio`, `ai`, `api`, `worker`, `web`):**
   ```bash
   docker compose up -d --build
   ```
3. **Chạy migration khởi tạo lược đồ cơ sở dữ liệu:**
   ```bash
   docker compose --profile tools run --rm migrate
   ```
4. **Truy cập ứng dụng:**
   - Giao diện web (Next.js): `http://localhost:3000`
   - API Backend (FastAPI Swagger): `http://localhost:8000/docs`

