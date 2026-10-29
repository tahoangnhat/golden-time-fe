export const ARTICLE_CATEGORIES = [
  "Tất cả",
  "Dinh dưỡng",
  "Chọn trái cây",
  "Bảo quản",
  "Sử dụng trái cây",
  "Sức khỏe an toàn",
  "Mua sắm thông minh",
  "Theo mùa",
] as const;

export type AppUpdate = {
  version: string;
  date: string;
  title: string;
  type: "Tính năng mới" | "Cải tiến" | "Sửa lỗi";
  changes: string[];
};
