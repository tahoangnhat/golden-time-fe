export const ARTICLE_CATEGORIES = [
  "Tất cả",
  "Chọn trái cây",
  "Dinh dưỡng",
  "Bảo quản",
  "Mua sắm thông minh",
  "Theo mùa",
  "Sức khỏe",
] as const;

export type AppUpdate = {
  version: string;
  date: string;
  title: string;
  type: "Tính năng mới" | "Cải tiến" | "Sửa lỗi";
  changes: string[];
};
