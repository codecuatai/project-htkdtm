# Pipeline dữ liệu khóa học Udemy

Dự án gồm crawler và pipeline xử lý dữ liệu khóa học. Crawler xuất metadata ra CSV; pipeline kiểm toán, nhập lô dữ liệu gốc, chuẩn hóa, kiểm tra chất lượng, tạo bản phát hành và kiểm tra nạp cơ sở dữ liệu. Các bước của pipeline chạy ngoại tuyến, không truy cập trang Udemy.

## Giới hạn thu thập hiện tại

CSV cũ `data/udemy_courses.csv` có 3.001 dòng. Cấu hình crawl giới hạn tổng dữ liệu ở 3.001 khóa học và đang đặt `source_authorized: false`. Crawler sẽ dừng trước khi gửi request nếu chưa có căn cứ cho phép tự động thu thập.

Mở PowerShell tại thư mục gốc dự án (`udemy_course_scraper`; trong repo nhóm là `nhom07-65httt\data`), tạo cấu hình cá nhân rồi kiểm tra mà không truy cập mạng:

```powershell
Copy-Item config.udemy.example.yaml config.udemy.yaml
python data/crawl.py --config config.udemy.yaml --max-pages 1 --max-courses 10 --dry-run
```

Kết quả cần có `network_requests: 0`. Chỉ bật thu thập khi có văn bản cho phép hoặc thỏa thuận API được phê duyệt. Quy tắc trong `robots.txt` không thay thế sự cho phép đó.

## Cài đặt

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

## Chạy pipeline ngoại tuyến

Chạy lần lượt các lệnh dưới đây. `audit` kiểm tra CSV hiện có; `ingest` tạo bản sao bất biến có mã băm; `transform` chuẩn hóa và lập báo cáo chất lượng; `release` chỉ đưa vào bản phát hành các bản ghi đã được duyệt; `db-load` kiểm tra bản phát hành ở chế độ mô phỏng. Dùng mã lô được in ra từ lệnh `ingest` cho các bước sau.

```powershell
python pipeline_cli.py audit
python pipeline_cli.py ingest
python pipeline_cli.py transform --batch-id <ma-lo>
python pipeline_cli.py release --batch-id <ma-lo> --version 0.1.0
python pipeline_cli.py db-load --version 0.1.0
```

Dữ liệu cũ còn thiếu mô tả, kỹ năng, cấp độ và nhiều trường khác. Các bản ghi được đánh dấu `needs_review`, không tự động làm giàu hoặc đưa vào bản phát hành. Vì vậy release hiện tại dự kiến rỗng cho đến khi các trường bắt buộc được rà soát và bổ sung từ nguồn được phép. Chưa có taxonomy, schema cơ sở dữ liệu bên ngoài, endpoint hay thông tin xác thực nên adapter cơ sở dữ liệu chỉ chạy mô phỏng.

Dữ liệu khóa học mẫu do dự án tự tạo được lưu riêng tại `data/internal/courses.json`, không trộn với dữ liệu Udemy. Danh mục nguồn và từ điển trường dữ liệu nằm trong `data/sources.md` và `data/schema_dictionary.md`.

## Kiểm thử

```powershell
python -m unittest discover -s tests -v
```
