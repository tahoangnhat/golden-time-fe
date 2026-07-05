export type Article = {
  slug: string;
  title: string;
  category: string;
  emoji: string;
  gradient: string;
  description: string;
  author: string;
  date: string;
  readingTime: string;
};

export const ARTICLE_CATEGORIES = [
  "Tất cả",
  "Chọn trái cây",
  "Dinh dưỡng",
  "Bảo quản",
  "Mua sắm thông minh",
  "Theo mùa",
  "Sức khỏe",
] as const;

export const ARTICLES: Article[] = [
  {
    slug: "cach-nhan-biet-trai-cay-tuoi",
    title: "Cách nhận biết trái cây còn tươi trước khi mua",
    category: "Chọn trái cây",
    emoji: "🍎",
    gradient: "from-rose-200 to-orange-100",
    description: "Mẹo đơn giản giúp bạn chọn được trái cây tươi ngon, hạn chế mua phải hàng cũ, hàng hỏng.",
    author: "Đội ngũ Golden Time",
    date: "12/03/2026",
    readingTime: "6 phút",
  },
  {
    slug: "an-tao-moi-ngay",
    title: "Ăn táo mỗi ngày có lợi ích gì?",
    category: "Dinh dưỡng",
    emoji: "🍏",
    gradient: "from-lime-200 to-emerald-100",
    description: "Phân tích thành phần dinh dưỡng và lợi ích sức khỏe khi duy trì thói quen ăn 1 quả táo mỗi ngày.",
    author: "BS. Nguyễn Minh Anh",
    date: "05/03/2026",
    readingTime: "5 phút",
  },
  {
    slug: "bao-quan-chuoi",
    title: "Cách bảo quản chuối để lâu không bị hỏng",
    category: "Bảo quản",
    emoji: "🍌",
    gradient: "from-yellow-200 to-amber-100",
    description: "Hướng dẫn 5 mẹo bảo quản chuối luôn vàng đẹp, không bị thâm đen trong nhiều ngày.",
    author: "Đội ngũ Golden Time",
    date: "28/02/2026",
    readingTime: "4 phút",
  },
  {
    slug: "trai-cay-theo-mua",
    title: "Nên mua trái cây theo mùa như thế nào?",
    category: "Theo mùa",
    emoji: "🥭",
    gradient: "from-yellow-200 to-orange-100",
    description: "Lịch trái cây theo mùa tại Việt Nam và lý do mua đúng mùa giúp tiết kiệm, ngon và an toàn hơn.",
    author: "Trần Hoài Phương",
    date: "20/02/2026",
    readingTime: "7 phút",
  },
  {
    slug: "so-sanh-gia-trai-cay",
    title: "Cách so sánh giá trái cây để tránh mua đắt",
    category: "Mua sắm thông minh",
    emoji: "🍇",
    gradient: "from-purple-200 to-fuchsia-100",
    description: "Bí quyết theo dõi giá theo chợ, siêu thị và nền tảng để mua trái cây với mức giá tốt nhất.",
    author: "Đội ngũ Golden Time",
    date: "14/02/2026",
    readingTime: "6 phút",
  },
  {
    slug: "trai-cay-cho-nguoi-tap-gym",
    title: "Trái cây nào phù hợp với người tập gym?",
    category: "Sức khỏe",
    emoji: "🍓",
    gradient: "from-rose-200 to-pink-100",
    description: "Top trái cây giàu protein, kali và carbohydrate giúp hồi phục cơ và tăng hiệu suất luyện tập.",
    author: "HLV. Lê Quốc Bảo",
    date: "05/02/2026",
    readingTime: "8 phút",
  },
];

export type AppUpdate = {
  version: string;
  date: string;
  title: string;
  type: "Tính năng mới" | "Cải tiến" | "Sửa lỗi";
  changes: string[];
};

export const UPDATES: AppUpdate[] = [
  {
    version: "1.2.0",
    date: "15/03/2026",
    title: "So sánh giá thị trường & truy xuất nguồn gốc nâng cao",
    type: "Tính năng mới",
    changes: [
      "Thêm màn hình so sánh giá thị trường giữa nhiều cửa hàng",
      "Cải thiện giao diện kết quả quét AI rõ ràng hơn",
      "Bổ sung thông tin truy xuất nguồn gốc theo từng lô hàng",
      "Tối ưu thời gian phân tích ảnh xuống dưới 2 giây",
    ],
  },
  {
    version: "1.1.0",
    date: "10/02/2026",
    title: "Mua hàng trực tuyến và giỏ hàng",
    type: "Tính năng mới",
    changes: [
      "Thêm chức năng mua hàng từ cửa hàng đối tác",
      "Thêm giỏ hàng và quy trình thanh toán demo",
      "Bổ sung đánh giá cửa hàng và cộng đồng người dùng",
    ],
  },
  {
    version: "1.0.0",
    date: "10/01/2026",
    title: "Ra mắt Golden Time 1.0",
    type: "Tính năng mới",
    changes: [
      "Ra mắt tính năng quét trái cây bằng AI",
      "Thêm thông tin dinh dưỡng theo từng loại trái cây",
      "Thêm gợi ý sử dụng trái cây theo mục tiêu sức khỏe",
    ],
  },
];