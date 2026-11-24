# Crawl danh mục khoahocre.com

Thu thập thông tin khóa học công khai, xuất JSON và CSV UTF-8 BOM mở được bằng Excel.

## Chạy

```powershell
python -m pip install -r requirements.txt
python crawl.py
```

- `data/courses.csv`: bảng dữ liệu cho Excel.
- `data/courses.json`: dữ liệu có kiểu số, mảng danh mục và giá trị null.
- `data/report.json`: số trang, số khóa, thời gian UTC, lỗi và trạng thái `complete`.
- `data/cache/`: HTML đã tải để chạy tiếp không tải lại các trang thành công.

```powershell
# Thử hai trang, lưu riêng
python crawl.py --max-pages 2 --output data_sample

# Lấy thêm mô tả SEO ngắn, ngày đăng và ngày sửa từ trang chi tiết
python crawl.py --details

# Thu thập lại dữ liệu mới nhất, bỏ qua cache
python crawl.py --refresh
```

Mặc định crawl toàn bộ trang danh mục, tuần tự, cách nhau tối thiểu 1,5 giây. Có thể tăng bằng `--delay 3`. Chương trình đọc robots.txt, thử lại lỗi kết nối/429/5xx tối đa bốn lần, loại trùng theo URL và dừng báo lỗi khi phân trang lặp hoặc không còn nhận diện được khóa học. Chạy lại cùng lệnh để sử dụng HTML cache. Cache không tự hết hạn; dùng `--refresh` để cập nhật giá.

## Các trường

`id`, `title`, `url`, `price_vnd`, `original_price_vnd`, `categories`, `category_slugs`, `image_url`, `crawled_at`.

Giá là số nguyên VND; giá không có trên trang được để null, không tự coi là miễn phí. `categories` là nhãn hiển thị trên thẻ khóa học, `category_slugs` là các danh mục có trong thuộc tính HTML. Ảnh được lưu dưới dạng URL. Mô tả tùy chọn là mô tả SEO ngắn, không phải toàn văn nội dung khóa học. Không tải video, tài liệu trả phí hay nội dung yêu cầu đăng nhập.

Khi giới hạn số trang, `complete` là false dù chạy thành công. Nếu có lỗi, dữ liệu đã lấy vẫn được lưu và tiến trình trả exit code 1. Dữ liệu phản ánh thời điểm tải từng trang; website có thể thay đổi trong lúc crawl.

## Kiểm tra

```powershell
python -m unittest discover -s tests -v
```
