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
| 1 | Trần Văn Tài | 2351160548 | 65HTTT | Nhóm trưởng | **Trọng tâm kỹ thuật #1:** Điều phối; thiết kế DB/migration bổ sung, backend nghiệp vụ, RBAC, luồng đơn hàng chốt giá/thanh toán sandbox/idempotency, ghi danh, audit log và tích hợp toàn hệ thống. Chi tiết tại mục 2.1. | 20% | 2351160548@e.tlu.edu.vn |
| 2 | Nguyễn Văn Tiến | 2351160558 | 65HTTT | Thành viên | **Trọng tâm kỹ thuật #2:** Xây dựng pipeline AI gợi ý M0/M1/M2 (lọc tiên quyết, giải thích, đo `NDCG@5`/`Precision@5`/P95) và toàn bộ kho dữ liệu phân tích (Star Schema, Batch ETL idempotent, 3 dashboard Apache Superset, đối chiếu SQL & thử nghiệm MCP). Chi tiết tại mục 2.2. | 20% | 2351160558@e.tlu.edu.vn |
| 3 | Phạm Quang Huy | 2351160529 | 65HTTT | Thành viên | **Thu thập & quản trị chất lượng dữ liệu:** Pipeline crawl 5 bước (`Raw → Staging → Approved`), bổ sung đầy đủ metadata khóa học, tách `EXTERNAL_REFERENCE`/`INTERNAL`, loại trùng, kiểm tra thủ công và phát hành `dataset_version`. Chi tiết tại mục 2.3. | 20% | 2351160529@e.tlu.edu.vn |
| 4 | Triệu Thị Tuyết Mai | 2351160535 | 65HTTT | Thành viên | **Taxonomy, Ground Truth, Khảo sát & QA/UX:** Xây dựng Skill Taxonomy, rubric & bộ nhãn đánh giá AI (≥300 cặp), phân tích lỗi mô hình, khảo sát/phỏng vấn thực tế, kiểm thử QA/UX và đồng bộ tài liệu dự án với báo cáo SmartEdu. Chi tiết tại mục 2.4. | 20% | 2351160535@e.tlu.edu.vn |
| 5 | Nguyễn Việt Hoàng | 2351160522 | 65HTTT | Thành viên | **Frontend & trải nghiệm người dùng:** Tích hợp giao diện SmartEdu theo 3 vai trò (hồ sơ/đánh giá đầu vào, danh mục tách loại khóa, gợi ý + giải thích + lộ trình, mua/thanh toán sandbox, học & quiz 70/100, màn hình duyệt dữ liệu). Chi tiết tại mục 2.5. | 20% | 2351160522@e.tlu.edu.vn |

### 2.1. Chi tiết công việc — Trần Văn Tài (Backend nghiệp vụ, DB, Thương mại an toàn & Tích hợp — Trọng tâm #1)

| STT | Module | Task cụ thể | Đầu ra/tiêu chí hoàn thành |
| :-: | :--- | :--- | :--- |
| 1 | Rà soát & mở rộng DB | Kiểm kê 38 bảng hiện có; viết Alembic migration bổ sung các bảng còn thiếu của SmartEdu (`StudentProfiles`, `CareerGoals`, `Skills`, `SkillPrerequisites`, `StudentSkills`, `CourseSkills`, `CoursePrerequisites`, `Orders`/`OrderItems`, `Refunds`, `CrawlSources`, `CrawlBatches`, `CourseSnapshots`, `DatasetVersions`, `RecommendationRuns`, `RecommendationItems`, `ModelEvaluations`, `AuditLogs`). | Migration chạy sạch trên PostgreSQL; không làm hỏng các tính năng LMS/AI sẵn có. |
| 2 | Chuẩn hóa RBAC 3 vai trò | Thống nhất ánh xạ vai trò (`STUDENT`, `INSTRUCTOR`, `ADMIN`; phân quyền phụ `STAFF` nếu cần) đúng báo cáo SmartEdu; kiểm tra quyền từng endpoint và từng bản ghi ở backend. | Trả `401` khi chưa đăng nhập, `403` khi sai vai trò/phạm vi; vô hiệu hóa phiên khi đổi quyền. |
| 3 | Hợp đồng API | Định nghĩa đầy đủ request/response, mã lỗi cho hồ sơ học tập, đánh giá đầu vào, danh mục tách loại khóa, gợi ý AI, giỏ hàng/đơn hàng, thanh toán, ghi danh, duyệt dữ liệu. | Tài liệu OpenAPI (`/docs`) cập nhật; Frontend và AI/BI dùng chung một hợp đồng. |
| 4 | Hồ sơ học tập & Intake | Xây dựng API lưu mục tiêu nghề nghiệp, kỹ năng tự khai báo, cấp độ, ngân sách, quỹ thời gian và kết quả bài đánh giá đầu vào ngắn (intake test). | Dữ liệu gắn theo tài khoản; trường chưa khai báo giữ trạng thái thiếu (`null`), không tự suy diễn. |
| 5 | Tách loại khóa & duyệt bán | Phân tách rõ `EXTERNAL_REFERENCE` (khóa crawl tham khảo, chỉ trả link nguồn ngoài) và `INTERNAL` (khóa nội bộ hợp pháp, chỉ mở bán khi Admin duyệt). | Khóa tham khảo bị chặn ở tầng API khi tạo giỏ/đơn nội bộ; khóa nội bộ chưa duyệt không bán được. |
| 6 | Giỏ hàng & Đơn hàng chốt giá | Xây dựng/hoàn thiện `Carts`, `CartItems`, `Orders`, `OrderItems`; khóa đơn giá tại thời điểm tạo đơn và hỗ trợ mã giảm giá hợp lệ, hoàn tiền (`Refunds`). | Đổi giá khóa sau khi mua không làm thay đổi giá trị đơn cũ; truy vết đầy đủ người tạo và thời điểm. |
| 7 | Thanh toán sandbox & Idempotency | Hoàn thiện luồng thanh toán mô phỏng/sandbox; xác minh trạng thái giao dịch tại backend; xử lý callback lặp bằng mã giao dịch duy nhất/idempotency key. | Frontend không thể tự đánh dấu đã thanh toán; callback gửi lặp nhiều lần chỉ tạo 1 giao dịch thành công và 1 ghi danh. |
| 8 | Ghi danh & toàn vẹn học tập | Chỉ cấp quyền học (`Enrollments`) sau khi thanh toán hợp lệ; đảm bảo mỗi cặp học viên–khóa chỉ có 1 ghi danh hiệu lực; bảo vệ link tài nguyên trả phí. | 0 trường hợp cấp quyền khi đơn thất bại/chờ; không phát sinh ghi danh trùng. |
| 9 | Điều kiện hoàn thành khóa | Kết nối API tiến độ bài học và quiz cuối khóa theo đúng quy tắc báo cáo: hoàn tất toàn bộ bài bắt buộc **và** đạt quiz cuối từ `70/100`. | Tiến độ tính theo sự kiện hoàn thành và điểm quiz, không tính hoàn thành chỉ khi mở trang. |
| 10 | Nhật ký nghiệp vụ (Audit Log) | Ghi log các sự kiện quan trọng: duyệt/từ chối khóa, phát hành `dataset_version`, đổi trạng thái đơn/thanh toán/hoàn tiền và thay đổi quyền. | Log ghi đủ người thao tác, đối tượng, thời gian, hành động; không làm lộ secret hoặc dữ liệu nhạy cảm. |
| 11 | API quản trị dữ liệu crawl | Cung cấp endpoint nhập bản ghi staging từ Huy, xem khác biệt/chất lượng và duyệt phát hành `dataset_version` phục vụ AI và BI. | Bản ghi chưa duyệt không lọt sang tập phục vụ gợi ý và dashboard chính thức. |
| 12 | Tích hợp hệ thống & bàn giao | Tích hợp backend với dịch vụ AI gợi ý của Tiến và giao diện của Hoàng; xử lý fallback khi AI lỗi; chuẩn bị seed data demo gắn nhãn `SANDBOX`/`DEMO` và hợp nhất nhánh nộp bài `nhom07-65httt`. | Luồng `Hồ sơ → Gợi ý → Mua → Học` chạy xuyên suốt; nhóm khởi chạy lại được bằng Docker Compose. |

### 2.2. Chi tiết công việc — Nguyễn Văn Tiến (AI Gợi ý M0/M1/M2 & Data Warehouse, Batch ETL, Superset BI, MCP — Trọng tâm #2)

| STT | Module | Task cụ thể | Đầu ra/tiêu chí hoàn thành |
| :-: | :--- | :--- | :--- |
| 1 | Kiến trúc dữ liệu AI & BI | Thống nhất với Tài và Huy schema bảng nguồn, `dataset_version`, từ điển trường cho cả module gợi ý (`M0/M1/M2`) và vùng phân tích BI (`analytics`). | Sơ đồ luồng dữ liệu từ OLTP + Crawl sang AI Recommender và Star Schema. |
| 2 | Bộ lọc ràng buộc & Cold-start | Cài đặt bộ lọc cứng chung cho cả `M0/M1/M2`: loại khóa, trạng thái mở bán, khóa đã học/mua, ngân sách, thời gian và điều kiện tiên quyết; xử lý cold-start bằng fallback. | 0 vi phạm điều kiện tiên quyết; trường thiếu được gắn cờ cần xác nhận thay vì loại ngầm sai lệch. |
| 3 | Mô hình M0 (Baseline TF-IDF) | Xây dựng baseline `M0` dùng TF-IDF + cosine similarity trên mục tiêu học với mô tả/đầu ra khóa học, kèm fallback theo độ phổ biến khi hồ sơ quá ít dữ liệu. | Có cấu hình tái lập, xuất Top-K và điểm từng khóa trên tập ứng viên chuẩn. |
| 4 | Mô hình M1 (Semantic Embedding) | Xây dựng `M1` dùng pretrained semantic embedding (tái sử dụng/mở rộng `sentence-transformers` phù hợp tiếng Việt/Anh) cho hồ sơ và khóa học. | Lưu `model_version`, chạy trên cùng tập hồ sơ và bộ lọc với `M0`. |
| 5 | Mô hình M2 (Hybrid) & Lộ trình | Xây dựng `M2` theo công thức `Score = 100 × (0.50×S + 0.35×G + 0.15×L)` (chuẩn hóa từng thành phần trong `[0,1]`), tách riêng điểm `S/G/L` và sinh lộ trình theo thứ tự tiên quyết. | Giá/hoa hồng không làm tăng điểm phù hợp; có thử nghiệm trọng số trên tập phát triển (không tune trên tập test). |
| 6 | Giải thích & lưu vết gợi ý | Sinh lý do gợi ý bám sát dữ liệu khóa (kỹ năng bổ sung, cấp độ, tiên quyết, giá, thời lượng) và lưu `RecommendationRuns`/`RecommendationItems` kèm `model_version`, `dataset_version`. | Tái hiện được lý do xếp hạng tại thời điểm gọi; không bịa thông tin ngoài bản ghi khóa. |
| 7 | Đánh giá định lượng AI & hiệu năng | Viết script đánh giá `M0/M1/M2` trên tập Ground Truth của Mai: tính `NDCG@5`, `Precision@5`, ablation study (`G`, `L`), tỷ lệ `<5` kết quả và đo độ trễ `P95 ≤ 3s` (≥100 lượt). | Bảng so sánh lưu vào `ModelEvaluations`; đạt mục tiêu `Precision@5 ≥ 0.70`, `NDCG@5` vượt `M0` ≥10% (hoặc báo cáo trung thực nếu không đạt). |
| 8 | Đóng gói API gợi ý | Đóng gói pipeline gợi ý thành endpoint trong `src/ai` (kèm cơ chế fallback an toàn) để Backend của Tài gọi trực tiếp. | Trả về Top-K, điểm tổng, điểm thành phần `S/G/L`, lý do, cảnh báo thiếu thông tin và `model_version`. |
| 9 | Thiết kế Star Schema (DW) | Thiết kế vùng `analytics` gồm các bảng dùng chung `DimDate`, `DimStudent` (giảm nhận dạng), `DimCourse`, `DimCategory`, `DimModel` và 4 bảng Fact (`FactCashTransaction`, `FactEnrollment`, `FactLearningDaily`, `FactRecommendationEvent`). | Định nghĩa rõ grain từng bảng Fact; pre-aggregate trước khi nối để không nhân đôi doanh thu. |
| 10 | Batch ETL idempotent & kiểm lỗi | Xây dựng quy trình ETL chạy theo batch từ PostgreSQL nghiệp vụ sang `analytics`, ghi log thời điểm/trạng thái, chống trùng khi chạy lại và kiểm tra tổng tiền/khóa ngoại trước–sau nạp. | Chạy lại cùng batch không làm sai lệch số đếm hay tổng tiền; batch lỗi không đánh dấu hoàn tất. |
| 11 | Hạ tầng Superset & phân quyền | Bổ sung Apache Superset vào Docker Compose (hoặc môi trường nhóm), cấu hình tài khoản PostgreSQL chỉ đọc vùng `analytics` và gắn nhãn `REAL`/`SANDBOX`/`DEMO` + thời điểm cập nhật. | Dashboard không sửa được dữ liệu nghiệp vụ; dữ liệu cá nhân được ẩn danh hóa. |
| 12 | 3 Dashboard BI (D1, D2, D3) | Xây dựng đầy đủ 3 dashboard theo đề cương: `D1` (Dataset & nguồn cung), `D2` (Kinh doanh, tiền thu ròng sandbox, hoàn tiền, chuyển đổi xem→mua), `D3` (Đào tạo, cohort 30 ngày, quiz & so sánh `M0/M1/M2`). | Có bộ lọc nhất quán (thời gian, khóa, danh mục, nguồn, model); mẫu số bằng 0 hiển thị "chưa đủ dữ liệu". |
| 13 | Đối chiếu SQL & Superset MCP | Viết bộ truy vấn SQL đối chiếu tối thiểu 8 KPI chính với 3 dashboard; thử nghiệm kết nối Superset MCP tạo truy vấn/biểu đồ và lưu log/ảnh chụp minh chứng (hoặc báo cáo trung thực nếu môi trường chưa hỗ trợ). | Số liệu dashboard khớp 100% SQL đối chiếu; có trọn bộ ảnh chụp, log ETL và minh chứng MCP cho báo cáo. |

### 2.3. Chi tiết công việc — Phạm Quang Huy (Thu thập dữ liệu & Quản trị chất lượng dữ liệu)

| STT | Module | Task cụ thể | Đầu ra/tiêu chí hoàn thành |
| :-: | :--- | :--- | :--- |
| 1 | Kiểm kê nguồn & dữ liệu nền | Liệt kê website, danh mục, URL, phạm vi được phép crawl (tôn trọng `robots.txt`, không crawl nội dung cần đăng nhập/trả phí); thống kê baseline trên `data/courses.csv` hiện có (695 bản ghi). | Danh mục nguồn hợp pháp và báo cáo tỷ lệ thiếu trường của dữ liệu hiện có. |
| 2 | Nâng cấp crawler & cấu hình | Tách cấu hình crawl (phân trang, rate limit, timeout, retry) khỏi code trong `data/crawl.py`; mở rộng trích xuất đủ các trường theo schema SmartEdu (`description`, `language`, `level`, `skills`, `prerequisites`, `duration_minutes`, `price_amount`, `price_currency`, `provider`). | Chạy được chế độ giới hạn trang để kiểm thử; trích xuất đủ metadata phục vụ AI và BI. |
| 3 | Tầng Raw bất biến theo batch | Lưu dữ liệu nguyên bản dạng JSONL theo `batch_id` kèm URL nguồn, `crawled_at`, HTTP status và log lỗi parser; phân biệt batch hoàn tất / hoàn tất một phần / thất bại. | Lần crawl mới không ghi đè lịch sử; có thể đối chiếu lại dữ liệu gốc khi cần. |
| 4 | Làm sạch & chuẩn hóa Staging | Làm sạch HTML, chuẩn Unicode/khoảng trắng (giữ song song bản gốc và bản sạch); chuẩn hóa URL, nhà cung cấp, danh mục, ngôn ngữ, cấp độ, giá, tiền tệ, thời lượng (thiếu để `null`, **không** biến thành `0`). | Từ điển dữ liệu chuẩn hóa; dữ liệu staging sạch và nhất quán định dạng. |
| 5 | Gắn nhãn loại khóa & kỹ năng | Gắn rõ `offer_type = EXTERNAL_REFERENCE` cho khóa crawl; phối hợp Mai ánh xạ kỹ năng về Skill Taxonomy chung, phân biệt kỹ năng trích trực tiếp với kỹ năng suy ra cần rà soát. | Không nhầm lẫn khóa tham khảo với khóa nội bộ được phép bán; trường kỹ năng có độ tin cậy rõ ràng. |
| 6 | Loại trùng & cờ chất lượng | Dò trùng theo mã khóa nguồn + URL chuẩn và rà soát gần trùng (tên + nhà cung cấp + nội dung); gắn `quality_status` đánh dấu thiếu mô tả, kỹ năng, cấp độ, giá, thời lượng. | Không trùng định danh trong bảng current; bản chưa đạt nằm ở staging, không lọt vào tập phát hành. |
| 7 | Kiểm tra thủ công & báo cáo DQ | Lấy mẫu ngẫu nhiên phân tầng ≥30 bản ghi đối chiếu trực tiếp với trang nguồn; tính tỷ lệ khớp (mục tiêu ≥95%), tỷ lệ thiếu trường (mục tiêu ≥90% có mô tả & kỹ năng) và số bản ghi bị loại. | Báo cáo chất lượng dữ liệu có đủ công thức, mẫu số và bảng lỗi chi tiết theo nguồn/batch. |
| 8 | Phát hành `dataset_version` & test | Đóng gói bộ dữ liệu đã duyệt (hướng tới ≥300 bản ghi hợp lệ nếu khả thi, tối thiểu 20–30 khóa chất lượng cao cho đánh giá AI), tạo `dataset_version` bàn giao cho Tài & Tiến; bổ sung unit test cho `data/tests/`. | AI và BI cùng tham chiếu 1 `dataset_version` duy nhất; lệnh test trong `data/README.md` chạy pass. |

### 2.4. Chi tiết công việc — Triệu Thị Tuyết Mai (Skill Taxonomy, Ground Truth, Khảo sát thực nghiệm, QA/UX & Đồng bộ báo cáo)

| STT | Module | Task cụ thể | Đầu ra/tiêu chí hoàn thành |
| :-: | :--- | :--- | :--- |
| 1 | Skill Taxonomy & Tiên quyết | Xây dựng bộ từ điển kỹ năng chuẩn (ưu tiên sinh viên CNTT: Frontend, Backend, Data Analyst...) kèm bảng ánh xạ đồng nghĩa và đồ thị điều kiện tiên quyết (`SkillPrerequisites`). | Bộ taxonomy thống nhất để Huy gắn nhãn khóa học và Tiến dùng trong `M2` + lộ trình. |
| 2 | Rubric & Bộ nhãn Ground Truth | Thiết kế rubric gán nhãn mức độ phù hợp (`0`, `1`, `2`) độc lập với điểm mô hình; tạo 30–50 hồ sơ học viên đa dạng và gán nhãn ≥300 cặp hồ sơ–khóa (≥20% gán nhãn kép kiểm tra chéo, chia tập dev/test theo học viên). | Bộ Ground Truth truy vết được nguồn nhãn/lý do; không dùng tập test để chỉnh trọng số. |
| 3 | Phân tích lỗi AI & kiểm giải thích | Phối hợp Tiến rà soát kết quả `M0/M1/M2`, lấy mẫu ≥30 lời giải thích đối chiếu với dữ liệu gốc (mục tiêu ≥90% khớp), phân loại các ca gợi ý sai/không phù hợp (do dữ liệu, nhãn, lọc, embedding hay trọng số). | Báo cáo phân tích lỗi có ví dụ cụ thể và hướng cải thiện; giữ lại trung thực các ca chưa đạt. |
| 4 | Khảo sát & Phỏng vấn thực chứng | Triển khai khảo sát sinh viên (tối thiểu 30, mục tiêu 60–100 phản hồi, không thu thập PII không cần thiết) và phỏng vấn định tính (5–8 SV, 2–3 GV); tính điểm ưu tiên `0.40I + 0.35F + 0.25K`. | Bộ số liệu thực nghiệm kiểm chứng các giả thuyết Chương 1–2 thay cho nhận định giả định. |
| 5 | Kiểm thử QA & bất biến hệ thống | Xây dựng và thực thi bộ test case cho các luồng trọng yếu: phân quyền 3 vai trò, cấm mua khóa ngoài, chốt giá đơn hàng, callback lặp (idempotency), hoàn thành khóa 70/100; mở rộng unit test cho `ai/` và `worker/`. | 100% luồng trọng yếu có test case, ≥95% pass, 0 lỗi Blocker/Critical trước nghiệm thu. |
| 6 | Kiểm thử UX với người dùng thật | Tổ chức 10–15 sinh viên dùng thử kịch bản khép kín `Hồ sơ → Gợi ý → Mua sandbox → Học & Quiz`; đo tỷ lệ hoàn thành tác vụ (mục tiêu ≥80%) và mức độ dễ hiểu lời giải thích (≥4/5). | Biên bản kiểm thử UX kèm số liệu thật, danh sách lỗi ghi nhận và cải tiến đã thực hiện. |
| 7 | Đồng bộ tài liệu & hồ sơ nộp bài | Dọn dẹp tài liệu bị lệch trong `docs/` (gỡ thông tin cũ về Groq, sửa link hỏng trong `README.md`), thống nhất tên **SmartEdu** và bảng phân công giữa repo với báo cáo Google Docs; hoàn thiện slide và kịch bản demo. | Repo và báo cáo khớp 100% về phân công, kiến trúc, KPI và minh chứng theo ma trận TH4. |

### 2.5. Chi tiết công việc — Nguyễn Việt Hoàng (Frontend theo vai trò & Luồng người dùng SmartEdu)

| STT | Module | Task cụ thể | Đầu ra/tiêu chí hoàn thành |
| :-: | :--- | :--- | :--- |
| 1 | Rà soát UI & điều hướng vai trò | Rà soát route/component hiện có trong `src/frontend`; đồng bộ menu và bảo vệ route theo vai trò trả về từ server (`STUDENT`, `INSTRUCTOR`, `ADMIN` / `STAFF`). | Mỗi vai trò chỉ thấy menu đúng quyền; UI không tự cho phép nâng/đổi quyền phía client. |
| 2 | Hồ sơ học tập & Intake Test | Xây dựng form khai báo mục tiêu, kỹ năng hiện có, cấp độ, ngân sách, quỹ thời gian và màn hình làm bài đánh giá đầu vào ngắn. | Lưu/cập nhật hồ sơ qua API; hiển thị rõ trường tùy chọn/chưa khai báo, không tự điền ngầm. |
| 3 | Danh mục tách loại khóa & lọc | Cập nhật trang danh sách và chi tiết khóa học thể hiện rõ khóa `EXTERNAL_REFERENCE` (nút "Xem nguồn ngoài") vs `INTERNAL` (nút "Thêm vào giỏ / Mua ngay"); bổ sung lọc theo kỹ năng, cấp độ, giá, thời lượng. | Hành động khớp 100% loại khóa; bộ lọc đồng bộ với API và có trạng thái không có kết quả. |
| 4 | Giao diện Gợi ý AI & Giải thích | Kết nối hồ sơ với API gợi ý của Tài/Tiến; hiển thị thẻ Top-K gồm thứ hạng, điểm tổng, điểm thành phần `S/G/L`, kỹ năng bổ sung, điều kiện tiên quyết, lý do bám sát dữ liệu, cảnh báo thiếu trường và lộ trình kỹ năng. | Khớp dữ liệu API; không trình bày điểm gợi ý như xác suất thành công; xử lý tốt trạng thái tải/rỗng/lỗi. |
| 5 | Giỏ hàng, Đơn hàng & Sandbox | Hoàn thiện luồng xem giỏ hàng, chốt đơn với giá khóa tại thời điểm mua, màn hình đang xử lý/thành công/thất bại quay về từ sandbox lấy trạng thái cuối từ backend. | Không cho mua khóa tham khảo ngoài; UI không tự xác nhận đã thanh toán chỉ dựa vào redirect URL. |
| 6 | Khóa của tôi, Học tập & Quiz 70/100 | Hoàn thiện trang khóa đã mua, khóa quyền truy cập khi chưa có ghi danh hợp lệ; hiển thị tiến độ khóa học và ngưỡng đạt quiz cuối `70/100` theo backend. | Nội dung học chỉ mở sau khi backend cấp ghi danh; tiến độ cập nhật đúng sau khi hoàn thành bài & quiz. |
| 7 | Màn hình quản trị & duyệt dữ liệu | Bổ sung giao diện cho Admin (và Staff nếu có) xem danh sách khóa nội bộ chờ duyệt, danh sách bản ghi crawl staging/chất lượng dữ liệu và thao tác duyệt/từ chối phát hành `dataset_version`. | Hiển thị rõ trạng thái, người duyệt, thời điểm, lý do; không lộ nút phát hành cho vai trò không đủ quyền. |
| 8 | Trạng thái UI & Responsive | Chuẩn hóa loading, empty, error, validation, thông báo thao tác trên toàn bộ luồng chính; kiểm tra responsive, nhãn form và accessibility cơ bản. | Không có màn hình trắng khi API lỗi/rỗng; dùng mượt trên màn hình desktop và thiết bị nhỏ. |

---

## 3. Cấu Trúc Mã Nguồn Trong Thư Mục Nhóm

```text
nhom07-65httt/
├── danhsachnhom.md        # Tệp tin thông tin nhóm, phân công chi tiết và hướng dẫn dự án
├── README.md              # Hướng dẫn tổng quan và vận hành bằng Docker
├── data/                  # Pipeline thu thập, làm sạch, chuẩn hóa & phát hành dataset khóa học
├── docs/                  # Tài liệu kiến trúc, API, đề cương TH4 & hướng dẫn sử dụng
│   ├── architecture/      # Thiết kế hệ thống, DB schema, Star Schema, RAG & Recommender workflow
│   ├── api/               # Đặc tả API REST & streaming
│   └── guides/            # Tài khoản mẫu, thuật ngữ & hướng dẫn vai trò
└── src/                   # Mã nguồn monorepo (chung cụm Docker & 1 file .env)
    ├── .env.example       # Biến môi trường mẫu dùng chung cho toàn bộ dịch vụ
    ├── compose.yaml       # Khởi chạy toàn bộ stack (bao gồm PostgreSQL, Redis, Qdrant, MinIO, Superset)
    ├── python.Dockerfile  # Dockerfile đa tầng dùng chung cho backend, ai, worker
    ├── ruff.toml          # Cấu hình lint Python dùng chung
    ├── frontend/          # Next.js 16 (App Router) + TypeScript + Tailwind + Dockerfile
    ├── backend/           # FastAPI + SQLAlchemy (Async) + Alembic + Pydantic
    ├── ai/                # FastAPI + Recommender (M0/M1/M2) + AsyncIO RAG Workflow
    └── worker/            # Celery + Redis (xử lý tài liệu & tác vụ nền / ETL batch)
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

