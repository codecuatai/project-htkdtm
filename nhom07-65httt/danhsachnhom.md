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
| 1 | Trần Văn Tài | 2351160548 | 65HTTT | Nhóm trưởng | Điều phối; phụ trách backend nghiệp vụ, tài khoản/phân quyền, đơn hàng/thanh toán, ghi danh và tích hợp API. Chi tiết tại mục 2.1. | 20% | 2351160548@e.tlu.edu.vn |
| 2 | Nguyễn Việt Hoàng | 2351160522 | 65HTTT | Thành viên | Phụ trách pipeline gợi ý M0/M1/M2, đánh giá xếp hạng, giải thích và phân tích lỗi. Chi tiết tại mục 2.3. | 20% | 2351160522@e.tlu.edu.vn |
| 3 | Phạm Quang Huy | 2351160529 | 65HTTT | Thành viên | Phụ trách pipeline dữ liệu crawl: thu thập, làm sạch, chuẩn hóa, loại trùng, kiểm tra chất lượng và phát hành phiên bản dữ liệu. Chi tiết tại mục 2.4. | 20% | 2351160529@e.tlu.edu.vn |
| 4 | Triệu Thị Tuyết Mai | 2351160535 | 65HTTT | Thành viên | Phụ trách frontend theo vai trò; tích hợp hồ sơ, danh mục, gợi ý, mua khóa, học tập và màn hình quản trị dữ liệu. Chi tiết tại mục 2.5. | 20% | 2351160535@e.tlu.edu.vn |
| 5 | Nguyễn Văn Tiến | 2351160558 | 65HTTT | Thành viên | Phụ trách ETL, kho dữ liệu phân tích, KPI, ba dashboard BI, MCP và minh chứng demo. Chi tiết tại mục 2.2. | 20% | 2351160558@e.tlu.edu.vn |

### 2.1. Chi tiết công việc — Trần Văn Tài (Backend và tích hợp)

| STT | Module | Task cụ thể | Đầu ra/tiêu chí hoàn thành |
| :-: | :--- | :--- | :--- |
| 1 | Khảo sát backend | Kiểm kê API, model, migration và luồng nghiệp vụ hiện có; ghi rõ phần tái sử dụng và phần cần bổ sung cho TH4. | Danh sách gap theo module, không tạo lại chức năng đã có. |
| 2 | Vai trò và tài khoản | Chốt cách ánh xạ vai trò hiện tại sang USER/STAFF/ADMIN của đề cương; thống nhất quyền của từng vai trò với nhóm. | Bảng ánh xạ vai trò và ma trận quyền được nhóm duyệt. |
| 3 | Hợp đồng API | Định nghĩa request/response, mã lỗi và phân quyền cho hồ sơ học tập, danh mục, gợi ý, đơn hàng, ghi danh và dữ liệu dashboard. | OpenAPI hoặc tài liệu API cập nhật; frontend và AI dùng thống nhất. |
| 4 | Hồ sơ học tập | Bổ sung/hoàn thiện API lưu mục tiêu, kỹ năng, cấp độ, ngân sách và thời gian học; lưu thời điểm xác nhận hồ sơ. | Hồ sơ được lưu và truy xuất đúng theo tài khoản; trường chưa khai báo giữ trạng thái thiếu. |
| 5 | Danh mục khóa | Phân biệt khóa tham khảo từ nguồn crawl với khóa nội bộ được phép bán; API chỉ trả hành động phù hợp với từng loại. | Khóa tham khảo không tạo được đơn nội bộ; khóa nội bộ chỉ hiện mua khi được duyệt/mở bán. |
| 6 | Tạo đơn hàng | Xây dựng hoặc hoàn thiện API tạo đơn và dòng đơn; chốt giá tại thời điểm mua, không lấy giá mới để sửa đơn cũ. | Đơn lưu đúng khóa, số lượng và giá chốt; có thể truy vết người tạo và thời điểm tạo. |
| 7 | Thanh toán mô phỏng | Hoàn thiện luồng sandbox/mô phỏng; xác minh trạng thái giao dịch ở backend, không cho frontend tự đánh dấu đã thanh toán. | Chỉ giao dịch hợp lệ được chuyển trạng thái thành công; có mã giao dịch và lịch sử trạng thái. |
| 8 | Chống giao dịch lặp | Xử lý callback/thông báo thanh toán gửi lặp bằng mã giao dịch duy nhất hoặc idempotency key. | Gửi cùng một thông báo nhiều lần vẫn chỉ có một giao dịch thành công và một ghi danh. |
| 9 | Ghi danh | Tạo ghi danh sau khi thanh toán hợp lệ; bảo đảm mỗi cặp người học–khóa chỉ có một ghi danh đang hiệu lực. | Không cấp quyền học khi đơn chưa thanh toán; không sinh ghi danh trùng. |
| 10 | Tiến độ học | Kết nối API bài học, tiến độ và quiz; áp dụng điều kiện hoàn thành theo đề cương: hoàn tất bài bắt buộc và đạt quiz cuối từ 70/100. | Tiến độ tính theo sự kiện hoàn thành và điểm quiz, không tính chỉ từ việc mở trang. |
| 11 | Phân quyền API | Kiểm tra quyền ở từng endpoint và từng bản ghi; trả 401 khi chưa đăng nhập, 403 khi sai vai trò/phạm vi. | Ca USER/STAFF/ADMIN truy cập đúng và sai quyền có kết quả kiểm chứng được. |
| 12 | Nhật ký nghiệp vụ | Ghi log các thay đổi quan trọng như duyệt khóa, sửa dữ liệu, trạng thái đơn/thanh toán và thay đổi quyền. | Log có người thao tác, đối tượng, thời gian và hành động; không ghi lộ thông tin nhạy cảm. |
| 13 | Tích hợp frontend và AI | Tích hợp API backend với giao diện và dịch vụ gợi ý; xử lý trạng thái tải, dữ liệu thiếu và lỗi dịch vụ. | Luồng hồ sơ → gợi ý → mua → học chạy xuyên suốt trên môi trường demo. |
| 14 | Dữ liệu demo và bàn giao | Chuẩn bị tài khoản theo vai trò và dữ liệu đơn/ghi danh/tiến độ phục vụ demo; cập nhật hướng dẫn API, migration và chạy hệ thống. | Nhóm có thể khởi chạy lại demo theo tài liệu; dữ liệu mô phỏng được gắn nhãn rõ. |

### 2.2. Chi tiết công việc — Nguyễn Văn Tiến (ETL, BI và MCP)

| STT | Module | Task cụ thể | Đầu ra/tiêu chí hoàn thành |
| :-: | :--- | :--- | :--- |
| 1 | Khảo sát dữ liệu | Kiểm kê bảng nghiệp vụ hiện có cho khóa, người dùng, đơn, thanh toán, ghi danh, tiến độ và gợi ý. | Sơ đồ nguồn dữ liệu và danh sách trường cần đưa vào phân tích. |
| 2 | Mô hình analytics | Thiết kế vùng analytics và mức chi tiết cho từng bảng Fact; thống nhất khóa nối với nhóm backend. | Sơ đồ star schema, định nghĩa grain và từ điển dữ liệu. |
| 3 | ETL batch | Tạo quy trình lấy dữ liệu từ PostgreSQL nghiệp vụ sang analytics theo batch có thời điểm chạy và trạng thái. | Batch chạy lại được, có log thành công/thất bại và thời điểm cập nhật. |
| 4 | ETL chống trùng | Làm cho ETL chạy lặp không nhân đôi dữ liệu; kiểm tra khóa nguồn và xử lý bản ghi cập nhật. | Chạy lại cùng batch không làm tăng sai số đếm hoặc tiền. |
| 5 | Kiểm tra chất lượng ETL | Kiểm tra khóa ngoại, dữ liệu thiếu, giá trị trạng thái không hợp lệ và tổng tiền trước/sau nạp. | Báo cáo lỗi theo batch; batch lỗi không được đánh dấu hoàn tất. |
| 6 | Dimension dùng chung | Tạo DimDate, DimStudent đã giảm thông tin nhận dạng, DimCourse, DimCategory và DimModel. | Các dashboard dùng chung dimension và lọc nhất quán. |
| 7 | Fact giao dịch | Tạo FactCashTransaction ở mức một khoản thu/hoàn đã phân bổ cho một dòng đơn; tính tiền thu ròng. | Không đếm đơn chờ; không nhân đôi tiền khi nối với dữ liệu học tập. |
| 8 | Fact ghi danh | Tạo FactEnrollment với ngày bắt đầu, ngày hoàn thành, trạng thái và điểm cuối khóa. | Có thể tính cohort và lọc theo khóa, danh mục, thời gian. |
| 9 | Fact hoạt động học | Tạo FactLearningDaily theo ghi danh/ngày, gồm phút học hợp lệ, bài hoàn thành và lần làm quiz. | Có dữ liệu theo ngày để phân tích tiến độ mà không cộng trùng. |
| 10 | Fact gợi ý | Tạo FactRecommendationEvent theo lần gợi ý và khóa được hiển thị; lưu thứ hạng, model_version và sự kiện nhấp. | Có thể đối chiếu lượt hiển thị/nhấp theo phiên bản mô hình. |
| 11 | KPI Dataset | Viết truy vấn số khóa hiện hành đã duyệt, tỷ lệ thiếu trường, số bản ghi bị loại theo nguồn/batch. | Số liệu mẫu số rõ ràng, không đếm snapshot như khóa riêng. |
| 12 | KPI Kinh doanh | Tính tiền thu ròng và chuyển đổi xem→mua theo định nghĩa/cohort của đề cương. | Đơn chờ không tính vào tiền thu; cohort chuyển đổi đủ 7 ngày quan sát. |
| 13 | KPI Đào tạo | Tính hoàn thành trong 30 ngày và tỷ lệ đạt quiz cuối; tách số ghi danh đã đủ thời gian theo dõi. | Công thức và mẫu số được ghi trong dashboard/tài liệu KPI. |
| 14 | KPI Gợi ý | Tính tỷ lệ nhấp trên cặp run–course thực sự hiển thị; đưa kết quả nDCG@5 từ bảng đánh giá mô hình. | Không suy ra nDCG từ lượt nhấp; phân biệt số liệu mô hình với tương tác. |
| 15 | Dashboard Dataset | Tạo dashboard về quy mô, nguồn, danh mục và chất lượng dữ liệu crawl. | Có bộ lọc nguồn, danh mục, batch và thời điểm cập nhật. |
| 16 | Dashboard Kinh doanh | Tạo dashboard doanh số/tiền thu ròng, chuyển đổi và phân bố đơn theo thời gian/khóa. | Số tổng khớp truy vấn SQL đối chiếu trên tập dữ liệu kiểm thử. |
| 17 | Dashboard Đào tạo và AI | Tạo dashboard hoàn thành, quiz, kỹ năng còn thiếu và kết quả gợi ý theo model. | Hiển thị được so sánh M0/M1/M2 và các giới hạn dữ liệu. |
| 18 | Bộ lọc và phân quyền BI | Thiết lập bộ lọc thời gian, khóa, danh mục và vai trò; dùng tài khoản chỉ đọc analytics. | Dashboard không sửa dữ liệu nghiệp vụ; dữ liệu cá nhân được giảm nhận dạng. |
| 19 | Kết nối MCP | Cấu hình MCP theo môi trường nhóm và thử truy vấn/tạo ít nhất một biểu đồ từ dữ liệu analytics. | Có log thao tác MCP và biểu đồ tạo được trong phiên demo. |
| 20 | Đối chiếu và minh chứng | Đối chiếu tối thiểu tám KPI với SQL; chụp ảnh/log các dashboard, ETL và MCP phục vụ báo cáo. | Có bộ minh chứng, thời điểm cập nhật và kết quả đối chiếu tái lập được. |

### 2.3. Chi tiết công việc — Nguyễn Việt Hoàng (AI gợi ý và đánh giá mô hình)

| STT | Module | Task cụ thể | Đầu ra/tiêu chí hoàn thành |
| :-: | :--- | :--- | :--- |
| 1 | Đầu vào mô hình | Thống nhất với Huy schema khóa đã duyệt và với Tài schema hồ sơ học tập; xác định trường nào được dùng và trường nào có thể thiếu. | Tài liệu feature/input; mô hình không tự suy diễn dữ liệu thiếu. |
| 2 | Rubric gán nhãn | Xây dựng hướng dẫn gán mức phù hợp cho cặp hồ sơ–khóa theo mục tiêu, kỹ năng, cấp độ và điều kiện học trước. | Rubric có ví dụ; nhãn được tạo độc lập với điểm mô hình. |
| 3 | Bộ dữ liệu đánh giá | Tạo tập cặp hồ sơ–khóa có nhãn; lưu nguồn nhãn, người gán và lý do; chia tập phát triển và kiểm thử. | Bộ nhãn có thể truy vết; không dùng tập kiểm thử để chọn trọng số. |
| 4 | Bộ lọc ràng buộc | Thực hiện hoặc phối hợp đặc tả lọc theo loại khóa, trạng thái mở bán, khóa đã học/đã mua, ngân sách, thời gian và điều kiện tiên quyết. | Cả M0/M1/M2 dùng cùng điều kiện lọc; thiếu thông tin được đánh dấu cần xác nhận. |
| 5 | M0 — TF-IDF | Tạo baseline TF-IDF và cosine similarity trên mục tiêu học với mô tả/đầu ra khóa đã chuẩn hóa. | Có cấu hình tái lập, thứ hạng top 5 và điểm từng khóa. |
| 6 | M1 — Embedding | Tạo biểu diễn embedding cho hồ sơ và khóa; thử mô hình phù hợp với ngôn ngữ dữ liệu thực tế. | Lưu model/version; đo được kết quả trên cùng tập với M0. |
| 7 | M2 — Điểm kết hợp | Kết hợp độ tương đồng ngữ nghĩa, khoảng thiếu kỹ năng và phù hợp cấp độ theo trọng số đề cương. | Công thức nằm trong [0,1] cho từng thành phần; lưu các thành phần điểm riêng. |
| 8 | Chuẩn hóa kỹ năng | Xử lý khác biệt cách viết kỹ năng giữa hồ sơ và khóa; dùng từ điển kỹ năng do nhóm xác nhận. | Có bảng ánh xạ và danh sách trường hợp chưa chắc chắn để rà soát. |
| 9 | Điều kiện tiên quyết | Áp dụng quy tắc khóa nền tảng và khóa học trước; loại hoặc xếp sau khóa không đáp ứng điều kiện bắt buộc. | Có ca kiểm tra minh họa; không gợi ý khóa vi phạm ràng buộc đã biết. |
| 10 | Chọn trọng số | Dùng tập phát triển để thử trọng số M2; ghi lại cấu hình và tiêu chí lựa chọn trước khi chạy tập kiểm thử. | Có log thí nghiệm; không điều chỉnh theo kết quả tập kiểm thử. |
| 11 | Chỉ số đánh giá | Tính nDCG@5 và Precision@5 cho các mô hình trên cùng hồ sơ, candidate set và nhãn. | Bảng so sánh cùng điều kiện; ghi rõ số hồ sơ và giới hạn mẫu. |
| 12 | Giải thích gợi ý | Tạo lý do từ kỹ năng được bổ sung, cấp độ, điều kiện học trước, giá và thời lượng của bản ghi khóa đã dùng. | Lý do kiểm tra được với dữ liệu đầu vào; không tạo thông tin ngoài nguồn. |
| 13 | Phiên bản kết quả | Lưu model_version, dataset_version, hồ sơ đầu vào, danh sách khóa, điểm và lý do cho mỗi lần chạy. | Có thể tái hiện vì sao một khóa được xếp hạng tại thời điểm gợi ý. |
| 14 | Phân tích lỗi | Lấy ví dụ gợi ý sai/không phù hợp; phân loại lỗi do dữ liệu, nhãn, lọc, embedding hay trọng số. | Báo cáo lỗi có ví dụ và hướng xử lý; giữ lại kết quả không đạt. |
| 15 | Tích hợp API | Phối hợp Tài để đóng gói đầu vào/đầu ra mô hình và kết nối với API gợi ý. | Frontend nhận danh sách xếp hạng, thành phần điểm, lý do và phiên bản mô hình. |

### 2.4. Chi tiết công việc — Phạm Quang Huy (Crawl và quản trị chất lượng dữ liệu)

| STT | Module | Task cụ thể | Đầu ra/tiêu chí hoàn thành |
| :-: | :--- | :--- | :--- |
| 1 | Kiểm kê nguồn | Liệt kê website, danh mục, URL, thời điểm thu thập và trường dữ liệu hiện có; kiểm tra nguồn được phép thu thập. | Danh mục nguồn và phạm vi crawl được nhóm thống nhất. |
| 2 | Kiểm kê dữ liệu hiện có | Đếm số bản ghi, trường dữ liệu, tỷ lệ thiếu và định dạng của CSV/JSON hiện tại. | Báo cáo baseline trước khi crawl bổ sung. |
| 3 | Cấu hình crawl | Chốt quy tắc phân trang, giới hạn tốc độ, timeout, retry và các trường cần trích xuất. | Cấu hình tách khỏi code; có thể chạy thử giới hạn trang. |
| 4 | Tôn trọng nguồn | Kiểm tra robots.txt/điều khoản nguồn, giới hạn tốc độ và loại bỏ đường dẫn không thuộc phạm vi. | Ghi lại cách tuân thủ nguồn; không thu nội dung yêu cầu đăng nhập/trả phí. |
| 5 | Thu thập raw | Lưu dữ liệu nguyên bản theo batch_id cùng URL nguồn, thời điểm crawl, mã phản hồi và lỗi parser. | Raw data bất biến để đối chiếu; lần crawl mới không ghi đè lịch sử. |
| 6 | Kiểm soát lỗi crawl | Ghi nhận trang lặp, lỗi kết nối, lỗi cấu trúc và số bản ghi lấy được theo từng batch. | Báo cáo batch phân biệt hoàn tất, hoàn tất một phần và thất bại. |
| 7 | Làm sạch văn bản | Bỏ HTML thừa, chuẩn Unicode/khoảng trắng, giữ riêng nội dung gốc và nội dung đã làm sạch. | Có thể đối chiếu bản chuẩn hóa với nguồn ban đầu. |
| 8 | Chuẩn hóa trường | Chuẩn hóa URL, tên nhà cung cấp, danh mục, ngôn ngữ, thời lượng, giá và tiền tệ; giá/ thời lượng thiếu để null. | Từ điển dữ liệu; không biến giá hoặc thời lượng thiếu thành 0. |
| 9 | Chuẩn hóa kỹ năng | Ánh xạ kỹ năng khóa sang taxonomy chung; đánh dấu kỹ năng suy ra cần xác nhận, phân biệt với kỹ năng lấy trực tiếp từ nguồn. | Trường kỹ năng có nguồn gốc/độ tin cậy; trường mơ hồ chuyển rà soát. |
| 10 | Loại trùng | Dò trùng theo mã khóa nguồn và URL chuẩn; rà soát bản gần trùng theo tên, nhà cung cấp và nội dung. | Không trùng định danh trong bảng current; không gộp chỉ vì trùng tên. |
| 11 | Cờ chất lượng | Đánh dấu thiếu mô tả, kỹ năng, cấp độ, giá hoặc thời lượng; tách trạng thái staging và được phát hành. | Bản chưa đạt không xuất hiện trong dataset dùng cho AI/BI. |
| 12 | Kiểm tra thủ công | Lấy mẫu ít nhất 30 bản ghi phân bố theo nguồn/danh mục và đối chiếu với trang nguồn. | Ghi mẫu số, trường sai và tỷ lệ khớp; mục tiêu đề cương là 95%. |
| 13 | Báo cáo chất lượng | Tính số bản ghi hợp lệ, tỷ lệ thiếu theo trường, số loại trùng và lỗi theo batch/nguồn. | Báo cáo có công thức và mẫu số; không chỉ nêu phần trăm rời rạc. |
| 14 | Phát hành phiên bản | Tạo dataset_version cho bản được duyệt; lưu người rà soát, thời điểm và lý do thay đổi. | Mô hình và dashboard có thể tham chiếu đúng phiên bản dữ liệu. |
| 15 | Nhãn và bàn giao AI | Chuẩn bị bản dữ liệu khóa cho Hoàng cùng hướng dẫn trường nguồn, trạng thái chất lượng và các giới hạn của dữ liệu. | Hoàng sử dụng cùng dataset đã duyệt; nhãn phù hợp không bị nhầm là metadata crawl. |

### 2.5. Chi tiết công việc — Triệu Thị Tuyết Mai (Frontend và luồng học tập)

| STT | Module | Task cụ thể | Đầu ra/tiêu chí hoàn thành |
| :-: | :--- | :--- | :--- |
| 1 | Kiểm kê giao diện | Rà soát route, layout và component hiện có cho học viên, giảng viên và admin; đối chiếu với vai trò TH4. | Danh sách màn hình tái sử dụng và màn hình cần bổ sung. |
| 2 | Điều hướng theo vai trò | Hoàn thiện route/menu theo vai trò trả về từ server; xử lý trang không được phép truy cập. | USER/STAFF/ADMIN thấy đúng menu; UI không tự cho phép đổi quyền. |
| 3 | Hồ sơ học tập | Làm form mục tiêu, kỹ năng, cấp độ, ngân sách và quỹ thời gian; hiển thị trường tùy chọn và thiếu dữ liệu. | Lưu/chỉnh sửa hồ sơ qua API; không tự điền thông tin chưa được người dùng xác nhận. |
| 4 | Danh mục khóa | Làm danh sách và trang chi tiết khóa; thể hiện rõ khóa tham khảo hay khóa nội bộ. | Hành động phù hợp loại khóa: xem nguồn ngoài hoặc mua nội bộ. |
| 5 | Tìm kiếm và lọc | Bổ sung tìm kiếm theo tên/kỹ năng và bộ lọc danh mục, cấp độ, giá, thời lượng. | Bộ lọc hoạt động đồng nhất với API; có trạng thái không có kết quả. |
| 6 | Gửi yêu cầu gợi ý | Kết nối form hồ sơ với API gợi ý; xử lý tải, dữ liệu chưa đủ, lỗi dịch vụ và kết quả rỗng. | Người dùng biết bước tiếp theo trong từng trạng thái. |
| 7 | Thẻ kết quả gợi ý | Hiển thị thứ hạng, điểm, kỹ năng được bổ sung, cấp độ, giá, thời lượng và nguồn khóa. | Nội dung khớp dữ liệu API; không trình bày điểm xếp hạng như xác suất thành công. |
| 8 | Giải thích gợi ý | Hiển thị lý do và các thành phần điểm; nêu trường nào còn thiếu/cần xác nhận. | Người dùng kiểm tra được lý do với hồ sơ và thông tin khóa. |
| 9 | Tạo đơn/mua khóa | Tạo luồng xem lại khóa, giá và xác nhận tạo đơn; hiển thị giá được chốt tại thời điểm mua. | Không cho mua khóa tham khảo ngoài; kết quả tạo đơn rõ ràng. |
| 10 | Trạng thái thanh toán | Làm màn hình đang xử lý, thành công, thất bại và quay lại từ sandbox; lấy trạng thái cuối từ backend. | UI không tự đánh dấu thanh toán thành công chỉ theo redirect. |
| 11 | Khóa đã mua | Làm trang khóa của tôi và trạng thái ghi danh; ẩn quyền học khi giao dịch chưa hợp lệ. | Nội dung học chỉ mở sau khi backend cấp ghi danh. |
| 12 | Trình phát bài học | Kết nối danh sách chương/bài, trạng thái hoàn thành và chuyển bài; hiển thị tiến độ khóa. | Tiến độ lấy từ API và cập nhật sau khi hoàn tất bài. |
| 13 | Quiz cuối khóa | Tích hợp giao diện làm quiz, gửi bài và hiển thị điểm/kết quả đạt. | Hiển thị ngưỡng demo 70/100 và trạng thái hoàn thành theo backend. |
| 14 | Màn hình nhân viên | Bổ sung giao diện danh sách bản ghi chờ rà soát, chi tiết nguồn và thao tác đề xuất sửa/gửi duyệt theo quyền. | Nhân viên không có nút phát hành dataset hoặc tự duyệt quyền admin. |
| 15 | Màn hình admin duyệt | Bổ sung giao diện xem thay đổi, chất lượng dữ liệu và duyệt/từ chối bản phát hành. | Có trạng thái, người duyệt, thời gian và lý do phản hồi từ API. |
| 16 | Trạng thái giao diện | Chuẩn hóa loading, empty, error, success, validation và thông báo thao tác trên các luồng chính. | Không có màn hình chính bị trắng khi API lỗi hoặc không có dữ liệu. |
| 17 | Responsive và accessibility | Kiểm tra màn hình nhỏ, nhãn form, focus bàn phím, tương phản và thông báo lỗi dễ hiểu. | Các luồng hồ sơ, gợi ý, mua và học dùng được trên kích thước màn hình mục tiêu. |
| 18 | Kiểm thử luồng người dùng | Chuẩn bị kịch bản thử hồ sơ → gợi ý → mua → học; ghi lại lỗi và thời gian hoàn thành. | Có biên bản 5–10 người thử hoặc số thực tế; báo đúng mẫu số và vấn đề gặp phải. |

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

